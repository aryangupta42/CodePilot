import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project, DebugSession, AiSettings, ActivityEvent } from '../types';
import { PROJECT_TEMPLATES } from './templates';

interface CodePilotDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updated': number };
  };
  debugSessions: {
    key: string;
    value: DebugSession;
    indexes: { 'by-project': string; 'by-timestamp': number };
  };
  activities: {
    key: string;
    value: ActivityEvent;
    indexes: { 'by-timestamp': number; 'by-project': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'codepilot-ai-db';
const DB_VERSION = 2;

// LocalStorage Mirror Keys for instant sub-millisecond resilience
const LS_PROJECTS_KEY = 'codepilot_projects_cache_v2';
const LS_ACTIVITIES_KEY = 'codepilot_activities_cache_v2';
const LS_SETTINGS_KEY = 'codepilot_settings_cache_v2';
const LS_SESSIONS_KEY = 'codepilot_sessions_cache_v2';

// Tier 1: In-memory cache for zero-latency operations
const memoryProjects = new Map<string, Project>();
const memoryActivities: ActivityEvent[] = [];
let memorySettings: AiSettings | null = null;

// Initialize memory cache from localStorage on load
try {
  const cachedProjects = localStorage.getItem(LS_PROJECTS_KEY);
  if (cachedProjects) {
    const list: Project[] = JSON.parse(cachedProjects);
    list.forEach(p => memoryProjects.set(p.id, p));
  }
  const cachedActs = localStorage.getItem(LS_ACTIVITIES_KEY);
  if (cachedActs) {
    const acts: ActivityEvent[] = JSON.parse(cachedActs);
    acts.forEach(a => memoryActivities.push(a));
  }
} catch (e) {
  console.warn('[CodePilot Storage] Could not read localStorage cache:', e);
}

function persistProjectsToLocalStorage() {
  try {
    const arr = Array.from(memoryProjects.values());
    localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('[CodePilot Storage] localStorage projects quota or write error:', e);
  }
}

function persistActivitiesToLocalStorage() {
  try {
    localStorage.setItem(LS_ACTIVITIES_KEY, JSON.stringify(memoryActivities.slice(-50)));
  } catch (e) {
    console.warn('[CodePilot Storage] localStorage activities write error:', e);
  }
}

// Tier 2: Non-blocking IndexedDB connection manager with upgrade-unblock & timeout safeguards
let dbPromise: Promise<IDBPDatabase<CodePilotDB> | null> | null = null;

function getDbSafe(timeoutMs: number = 1500): Promise<IDBPDatabase<CodePilotDB> | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    let settled = false;

    // Timeout guard so IndexedDB NEVER hangs the UI if locked by an older version or tab
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn('[CodePilot Storage] IndexedDB open timed out after', timeoutMs, 'ms. Using localStorage/memory fallback.');
        resolve(null);
      }
    }, timeoutMs);

    openDB<CodePilotDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('debugSessions')) {
          const debugStore = db.createObjectStore('debugSessions', { keyPath: 'id' });
          debugStore.createIndex('by-project', 'projectId');
          debugStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('activities')) {
          const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
          activityStore.createIndex('by-timestamp', 'timestamp');
          activityStore.createIndex('by-project', 'projectId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
      blocked() {
        console.warn('[CodePilot Storage] IndexedDB upgrade blocked by open connection. Graceful fallback active.');
      },
      blocking(currentVersion, blockedVersion, event) {
        console.warn('[CodePilot Storage] Closing active connection to allow IndexedDB version upgrade.');
        try {
          (event.target as any)?.result?.close?.();
        } catch {}
      },
      terminated() {
        dbPromise = null;
      }
    })
      .then((db) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);

          // Close connection if another script requests a version change
          db.onversionchange = () => {
            console.warn('[CodePilot Storage] Database versionchange event. Closing connection.');
            db.close();
            dbPromise = null;
          };

          resolve(db);
        }
      })
      .catch((err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          console.warn('[CodePilot Storage] IndexedDB initialization failed:', err);
          resolve(null);
        }
      });
  });

  return dbPromise;
}

// -------------------------------------------------------------
// PUBLIC PROJECT API - Resilient, Instantaneous, Multi-Tiered
// -------------------------------------------------------------

export async function getAllProjects(): Promise<Project[]> {
  // If memory already has projects, prepare list
  let results: Project[] = Array.from(memoryProjects.values());

  try {
    const db = await getDbSafe(1500);
    if (db) {
      const idbProjects = await db.getAllFromIndex('projects', 'by-updated');
      if (idbProjects && idbProjects.length > 0) {
        // Merge into memory cache
        idbProjects.forEach(p => memoryProjects.set(p.id, p));
        persistProjectsToLocalStorage();
        results = Array.from(memoryProjects.values());
      }
    }
  } catch (err) {
    console.warn('[CodePilot Storage] Could not read from IndexedDB, using cache:', err);
  }

  // If no projects exist in any tier, seed defaults
  if (results.length === 0) {
    await seedDefaultProjects();
    results = Array.from(memoryProjects.values());
  }

  return results.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<Project | undefined> {
  // Tier 1: Check memory cache (0ms)
  if (memoryProjects.has(id)) {
    return memoryProjects.get(id);
  }

  // Tier 2: Check localStorage (<2ms)
  try {
    const raw = localStorage.getItem(LS_PROJECTS_KEY);
    if (raw) {
      const list: Project[] = JSON.parse(raw);
      const found = list.find(p => p.id === id);
      if (found) {
        memoryProjects.set(found.id, found);
        return found;
      }
    }
  } catch {}

  // Tier 3: Query IndexedDB (<20ms)
  try {
    const db = await getDbSafe(1500);
    if (db) {
      const p = await db.get('projects', id);
      if (p) {
        memoryProjects.set(p.id, p);
        persistProjectsToLocalStorage();
        return p;
      }
    }
  } catch {}

  // If ID matches a demo seed, auto-seed defaults
  if (id.startsWith('demo-')) {
    await seedDefaultProjects();
    return memoryProjects.get(id);
  }

  return undefined;
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = Date.now();

  // 1. Instant save to memory (0ms)
  memoryProjects.set(project.id, project);

  // 2. Instant save to localStorage (<2ms)
  persistProjectsToLocalStorage();

  // 3. Asynchronously sync to IndexedDB without blocking the user interface
  getDbSafe(1500).then(db => {
    if (db) {
      db.put('projects', project).catch(err => {
        console.warn('[CodePilot Storage] Background IDB save failed:', err);
      });
    }
  }).catch(() => {});
}

export async function deleteProject(id: string): Promise<void> {
  // 1. Remove from memory
  memoryProjects.delete(id);

  // 2. Remove from localStorage
  persistProjectsToLocalStorage();

  // 3. Remove from IndexedDB
  try {
    const db = await getDbSafe(1500);
    if (db) {
      await db.delete('projects', id);
      const tx = db.transaction('debugSessions', 'readwrite');
      const index = tx.store.index('by-project');
      let cursor = await index.openCursor(id);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('[CodePilot Storage] IDB delete error:', err);
  }
}

export async function renameProject(id: string, newName: string): Promise<void> {
  const project = await getProject(id);
  if (project) {
    project.name = newName;
    await saveProject(project);
  }
}

// -------------------------------------------------------------
// DEBUG SESSIONS API
// -------------------------------------------------------------

export async function saveDebugSession(session: DebugSession): Promise<void> {
  try {
    const db = await getDbSafe(1500);
    if (db) {
      await db.put('debugSessions', session);
    }
  } catch (e) {
    console.warn('[CodePilot Storage] Could not save debug session:', e);
  }
}

export async function getDebugSessions(projectId: string): Promise<DebugSession[]> {
  try {
    const db = await getDbSafe(1500);
    if (db) {
      const sessions = await db.getAllFromIndex('debugSessions', 'by-project', projectId);
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (e) {
    console.warn('[CodePilot Storage] Could not get debug sessions:', e);
  }
  return [];
}

// -------------------------------------------------------------
// ACTIVITY LOG API - Instant logging and retrieval
// -------------------------------------------------------------

export async function logActivity(event: Omit<ActivityEvent, 'id'>): Promise<ActivityEvent> {
  const fullEvent: ActivityEvent = {
    ...event,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: event.timestamp || Date.now()
  };

  // Instant write to memory
  memoryActivities.unshift(fullEvent);
  if (memoryActivities.length > 50) memoryActivities.pop();
  persistActivitiesToLocalStorage();

  // Background write to IDB
  getDbSafe(1500).then(db => {
    if (db) {
      db.put('activities', fullEvent).catch(() => {});
    }
  }).catch(() => {});

  return fullEvent;
}

export async function getRecentActivities(limit: number = 25): Promise<ActivityEvent[]> {
  try {
    const db = await getDbSafe(1500);
    if (db) {
      const all = await db.getAllFromIndex('activities', 'by-timestamp');
      if (all && all.length > 0) {
        return all.reverse().slice(0, limit);
      }
    }
  } catch {}

  // Fallback to memory/localStorage activities
  if (memoryActivities.length > 0) {
    return [...memoryActivities].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // Seed default activities if empty
  const defaultAct: ActivityEvent = {
    id: `act-seed-1`,
    type: 'project_created',
    title: 'Workspace Initialized',
    description: 'CodePilot AI client-side developer workspace ready.',
    timestamp: Date.now() - 3600000,
    status: 'info'
  };
  memoryActivities.push(defaultAct);
  persistActivitiesToLocalStorage();
  return [defaultAct];
}

export async function getProjectActivities(projectId: string): Promise<ActivityEvent[]> {
  try {
    const db = await getDbSafe(1500);
    if (db) {
      const acts = await db.getAllFromIndex('activities', 'by-project', projectId);
      if (acts && acts.length > 0) {
        return acts.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch {}

  return memoryActivities.filter(a => a.projectId === projectId).sort((a, b) => b.timestamp - a.timestamp);
}

// -------------------------------------------------------------
// SETTINGS API
// -------------------------------------------------------------

export async function getAiSettings(): Promise<AiSettings> {
  if (memorySettings) return memorySettings;

  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (raw) {
      memorySettings = JSON.parse(raw);
      return memorySettings!;
    }
  } catch {}

  try {
    const db = await getDbSafe(1500);
    if (db) {
      const settings = await db.get('settings', 'ai-config');
      if (settings) {
        memorySettings = settings;
        return settings;
      }
    }
  } catch {}

  return {
    provider: 'demo',
    useDemoMode: true,
    serverUrl: '/api'
  };
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  memorySettings = settings;
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}

  getDbSafe(1500).then(db => {
    if (db) {
      db.put('settings', settings, 'ai-config').catch(() => {});
    }
  }).catch(() => {});
}

// -------------------------------------------------------------
// DEFAULT STARTER PROJECTS SEEDING
// -------------------------------------------------------------

export async function seedDefaultProjects(): Promise<void> {
  const demoTemplate = PROJECT_TEMPLATES.find(t => t.id === 'buggy-calc-demo') || PROJECT_TEMPLATES[0];
  const pythonTemplate = PROJECT_TEMPLATES.find(t => t.id === 'python-calc');
  const reactTemplate = PROJECT_TEMPLATES.find(t => t.id === 'react-ts');

  if (demoTemplate && !memoryProjects.has('demo-buggy-calculator')) {
    const demoProject: Project = {
      id: 'demo-buggy-calculator',
      name: 'Interactive Calculator (Bug Demo)',
      description: 'Contains a real DOM element ID mismatch bug. Test the AI Debugger to fix it in 1 click!',
      type: demoTemplate.type,
      runtime: demoTemplate.runtime,
      runtimeSupport: demoTemplate.runtimeSupport,
      entryFile: demoTemplate.entryFile,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
      files: demoTemplate.files.map((f, i) => ({
        id: `f-demo-${i}`,
        ...f
      })),
      tests: demoTemplate.sampleTests?.map((t, i) => ({
        id: `t-demo-${i}`,
        ...t
      }))
    };
    memoryProjects.set(demoProject.id, demoProject);
  }

  if (pythonTemplate && !memoryProjects.has('demo-python-data')) {
    const pyProject: Project = {
      id: 'demo-python-data',
      name: 'Python Stats Analyzer',
      description: 'Statistical calculations running on real client-side Pyodide WebAssembly Python 3.',
      type: pythonTemplate.type,
      runtime: pythonTemplate.runtime,
      runtimeSupport: pythonTemplate.runtimeSupport,
      entryFile: pythonTemplate.entryFile,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 7200000,
      files: pythonTemplate.files.map((f, i) => ({
        id: `f-py-${i}`,
        ...f
      })),
      tests: pythonTemplate.sampleTests?.map((t, i) => ({
        id: `t-py-${i}`,
        ...t
      }))
    };
    memoryProjects.set(pyProject.id, pyProject);
  }

  if (reactTemplate && !memoryProjects.has('demo-react-tasks')) {
    const reactProject: Project = {
      id: 'demo-react-tasks',
      name: 'React 18 Task Pilot',
      description: 'Modern component-based application with in-browser JSX compilation and state.',
      type: reactTemplate.type,
      runtime: reactTemplate.runtime,
      runtimeSupport: reactTemplate.runtimeSupport,
      entryFile: reactTemplate.entryFile,
      createdAt: Date.now() - 10800000,
      updatedAt: Date.now() - 10800000,
      files: reactTemplate.files.map((f, i) => ({
        id: `f-react-${i}`,
        ...f
      }))
    };
    memoryProjects.set(reactProject.id, reactProject);
  }

  // Persist to localStorage
  persistProjectsToLocalStorage();

  // Sync to IndexedDB in background
  getDbSafe(1500).then(async (db) => {
    if (db) {
      for (const p of memoryProjects.values()) {
        await db.put('projects', p).catch(() => {});
      }
    }
  }).catch(() => {});
}

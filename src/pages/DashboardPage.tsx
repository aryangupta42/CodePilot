import React, { useState, useEffect } from 'react';
import type { Project, WorkspaceTab } from '../types';
import {
  getAllProjects,
  deleteProject,
  renameProject,
  saveProject,
  seedDefaultProjects,
  logActivity
} from '../services/storage';
import { PROJECT_TEMPLATES } from '../services/templates';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { RuntimeReadinessPanel } from '../components/dashboard/RuntimeReadinessPanel';
import { ProjectActivityFeed } from '../components/dashboard/ProjectActivityFeed';
import { AiDebugCenterView } from '../components/dashboard/AiDebugCenterView';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { CreateProjectModal } from '../components/dashboard/CreateProjectModal';
import { ImportProjectModal } from '../components/dashboard/ImportProjectModal';
import { PromptToProjectModal } from '../components/dashboard/PromptToProjectModal';
import { CommandPalette } from '../components/common/CommandPalette';
import { SettingsModal } from '../components/ide/SettingsModal';
import {
  Plus,
  UploadCloud,
  Wand2,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  Terminal,
  RefreshCw,
  FolderX,
  Layers,
  TestTube2,
  Atom,
  Globe,
  Cpu,
  History,
  Zap
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'web' | 'react' | 'python' | 'node'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load URL query actions if provided (e.g. ?action=create)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') setIsCreateOpen(true);
    if (action === 'import') setIsImportOpen(true);
    if (action === 'prompt') setIsPromptOpen(true);
    if (action === 'coding') navigate('/coding');
  }, [searchParams]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string) => {
    const target = projects.find(p => p.id === id);
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (target) {
      await logActivity({
        type: 'file_edited',
        title: 'Project Deleted',
        description: `Removed workspace "${target.name}".`,
        timestamp: Date.now(),
        status: 'warning'
      });
    }
  };

  const handleRename = async (id: string, newName: string) => {
    await renameProject(id, newName);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p));
  };

  const handleDuplicate = async (sourceProject: Project) => {
    const newId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const copy: Project = {
      ...sourceProject,
      id: newId,
      name: `${sourceProject.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: sourceProject.files.map((f, i) => ({
        ...f,
        id: `f-${newId}-${i}`
      }))
    };
    await saveProject(copy);
    await logActivity({
      projectId: copy.id,
      projectName: copy.name,
      type: 'project_created',
      title: 'Project Duplicated',
      description: `Created copy of workspace "${sourceProject.name}".`,
      timestamp: Date.now(),
      status: 'info'
    });
    setProjects(prev => [copy, ...prev]);
  };

  const handleResetDemoProjects = async () => {
    await seedDefaultProjects();
    await loadProjects();
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || p.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg-darkest text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Application Header Shell */}
      <DashboardHeader
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projectCount={projects.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* TAB 1: OVERVIEW & MY PROJECTS */}
          {(activeTab === 'overview' || activeTab === 'projects') && (
            <>
              {/* Refined Hero Area */}
              <div className="space-y-3 pb-4 border-b border-bg-border/70">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-mono font-medium text-brand-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Cloudless Developer Command Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Your Development Workspace
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Build in the browser. Let AI investigate bugs, review fixes, and verify your code.
                </p>
              </div>

              {/* 4 Prominent Main Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Action 1: Start Coding (Emerald Theme - Instant Scratchpad) */}
                <div
                  onClick={() => navigate('/coding')}
                  className="p-5 sm:p-6 rounded-2xl bg-bg-panel border border-emerald-500/30 hover:border-emerald-500/70 hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between card-highlight"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate('/coding'); }}
                  aria-label="Start Coding"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
                        Start Coding
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Open a code editor instantly. No project setup required.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-bg-border/70 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Launch Scratchpad</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Action 2: Create New Project (Violet Theme) */}
                <div
                  onClick={() => setIsCreateOpen(true)}
                  className="p-5 sm:p-6 rounded-2xl bg-bg-panel border border-violet-500/30 hover:border-violet-500/70 hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between card-highlight subtle-violet-glow"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsCreateOpen(true); }}
                  aria-label="Create New Project"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight">
                      Create New Project
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Scaffold clean starter environments for Web, React 18, Python WASM, or Node.js.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-bg-border/70 flex items-center justify-between text-xs font-semibold text-violet-400">
                    <span>Choose Template</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Action 3: Import Existing Project (Cyan Theme) */}
                <div
                  onClick={() => setIsImportOpen(true)}
                  className="p-5 sm:p-6 rounded-2xl bg-bg-panel border border-cyan-500/30 hover:border-cyan-500/70 hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between card-highlight subtle-cyan-glow"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsImportOpen(true); }}
                  aria-label="Import Existing Project"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                      Import Existing Project
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Upload any local ZIP file with path traversal defense or pull public GitHub repositories.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-bg-border/70 flex items-center justify-between text-xs font-semibold text-cyan-400">
                    <span>Upload ZIP / GitHub</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Action 4: Prompt to Project (Indigo Theme) */}
                <div
                  onClick={() => setIsPromptOpen(true)}
                  className="p-5 sm:p-6 rounded-2xl bg-bg-panel border border-indigo-500/30 hover:border-indigo-500/70 hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between card-highlight"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsPromptOpen(true); }}
                  aria-label="Prompt to Project"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight">
                      Prompt to Project
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Describe an application in plain English to synthesize code and architecture starters.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-bg-border/70 flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span>Describe Idea</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* Technical Runtime Readiness Area */}
              <RuntimeReadinessPanel />

              {/* Projects List Header with Filters & Grid/List Toggle */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Segmented workspace filter bar */}
                  <div className="flex items-center gap-1 p-1 bg-bg-panel rounded-xl border border-bg-border overflow-x-auto shadow-sm">
                    {(['all', 'web', 'react', 'python', 'node'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                          activeFilter === filter
                            ? 'bg-brand-600 text-white shadow-sm border border-brand-500/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-bg-card'
                        }`}
                      >
                        {filter === 'all' ? 'All Workspaces' : filter}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-slate-400 font-mono">
                      {filteredProjects.length} {filteredProjects.length === 1 ? 'workspace' : 'workspaces'}
                    </span>
                    <div className="flex items-center bg-bg-panel rounded-lg p-0.5 border border-bg-border">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-bg-card text-white shadow-sm border border-bg-border'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Grid View"
                        aria-label="Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'list'
                            ? 'bg-bg-card text-white shadow-sm border border-bg-border'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="List View"
                        aria-label="List View"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Grid / List */}
                {isLoading ? (
                  <div className="py-20 text-center text-slate-400 text-sm font-mono flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                    <span>Synchronizing local IndexedDB workspaces...</span>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                      : 'space-y-2.5'
                  }>
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        viewMode={viewMode}
                        onDelete={handleDelete}
                        onRename={handleRename}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-bg-border bg-bg-panel/50 p-8 max-w-md mx-auto shadow-card">
                    <div className="w-12 h-12 rounded-xl bg-bg-card flex items-center justify-center mx-auto text-slate-400 mb-3 border border-bg-border">
                      <FolderX className="w-6 h-6 text-brand-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-tight">No Workspaces Found</h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      {searchQuery ? `No workspaces match "${searchQuery}".` : 'Restore standard starter workspaces to begin developing.'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleResetDemoProjects}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-bg-card hover:bg-bg-cardHover text-slate-200 border border-bg-border transition-colors shadow-sm"
                      >
                        Restore Sample Projects
                      </button>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
                      >
                        Create Project
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity Log */}
              <div className="pt-2">
                <ProjectActivityFeed />
              </div>
            </>
          )}

          {/* TAB 2: AI DEBUG CENTER */}
          {activeTab === 'debug_center' && (
            <AiDebugCenterView />
          )}

          {/* TAB 3: TEST & VERIFICATION */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-bg-panel border border-bg-border shadow-card card-highlight space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase font-mono">
                  <TestTube2 className="w-4 h-4" />
                  <span>Automated Assertion Engine</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Closed-Loop Verification Pipeline</h2>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  CodePilot never claims a fix works without running live tests. Test suites execute natively inside Web Workers and Pyodide WebAssembly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-bg-panel border border-bg-border shadow-card card-highlight flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.tests?.length || 1} registered test suite(s) • Runtime: {p.runtime}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/ide/${p.id}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-bg-card hover:bg-brand-600 text-xs font-semibold text-slate-200 hover:text-white border border-bg-border hover:border-brand-500/50 transition-colors shadow-sm"
                    >
                      Run in IDE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-bg-panel border border-bg-border shadow-card card-highlight space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Audit & Activity Log</h2>
                <p className="text-xs text-slate-400">
                  Comprehensive local event trail of project creation, execution, and verified patches.
                </p>
              </div>
              <ProjectActivityFeed />
            </div>
          )}

          {/* TAB 5: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-bg-panel border border-bg-border shadow-card card-highlight space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Verified Starter Templates</h2>
                <p className="text-xs text-slate-400">
                  Engineered with zero-configuration in-browser execution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROJECT_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="p-5 rounded-2xl bg-bg-panel border border-bg-border shadow-card card-highlight flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center text-brand-400">
                          {tpl.type === 'react' && <Atom className="w-4 h-4 text-cyan-400" />}
                          {tpl.type === 'python' && <Terminal className="w-4 h-4 text-amber-400" />}
                          {tpl.type === 'node' && <Cpu className="w-4 h-4 text-emerald-400" />}
                          {tpl.type === 'web' && <Globe className="w-4 h-4 text-brand-400" />}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-darkest text-slate-400 border border-bg-border">
                          {tpl.runtime}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{tpl.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-bg-border flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                        Ready to Launch
                      </span>
                      <button
                        onClick={() => {
                          const demo = projects.find(p => p.type === tpl.type);
                          if (demo) navigate(`/ide/${demo.id}`);
                          else setIsCreateOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition-colors"
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-bg-panel border border-bg-border shadow-card card-highlight max-w-2xl space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight">System & Workspace Settings</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure client-side execution boundaries and external AI providers.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition-colors"
              >
                Open Full Settings Panel
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects(prev => [newProj, ...prev]);
          logActivity({
            projectId: newProj.id,
            projectName: newProj.name,
            type: 'project_created',
            title: 'Project Created',
            description: `Initialized workspace "${newProj.name}" from ${newProj.runtime}.`,
            timestamp: Date.now(),
            status: 'info'
          });
        }}
      />
      <ImportProjectModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onProjectImported={(newProj) => {
          setProjects(prev => [newProj, ...prev]);
          logActivity({
            projectId: newProj.id,
            projectName: newProj.name,
            type: 'project_imported',
            title: 'Project Imported',
            description: `Imported "${newProj.name}" with ${newProj.files.length} files.`,
            timestamp: Date.now(),
            status: 'info'
          });
        }}
      />
      <PromptToProjectModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects(prev => [newProj, ...prev]);
          logActivity({
            projectId: newProj.id,
            projectName: newProj.name,
            type: 'project_created',
            title: 'Prompt-to-Project Synthesized',
            description: `Generated architecture and starter code for "${newProj.name}".`,
            timestamp: Date.now(),
            status: 'info'
          });
        }}
      />
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

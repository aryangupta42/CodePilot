import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, saveProject, getDebugSessions, saveDebugSession, logActivity } from '../services/storage';
import type {
  Project,
  ProjectFile,
  ConsoleMessage,
  TestRunResult,
  DebugSession,
  StructuredDiagnosis,
  PatchProposal,
  VerificationStatus
} from '../types';
import { IdeNavbar } from '../components/ide/IdeNavbar';
import { FileExplorer } from '../components/ide/FileExplorer';
import { CodeEditor } from '../components/ide/CodeEditor';
import { TerminalPanel } from '../components/ide/TerminalPanel';
import { PreviewPanel } from '../components/ide/PreviewPanel';
import { AiPanel } from '../components/ide/ai/AiPanel';
import { DebugWorkflowModal } from '../components/ide/ai/DebugWorkflowModal';
import { LearnDebuggerModal } from '../components/ide/ai/LearnDebuggerModal';
import { SettingsModal } from '../components/ide/SettingsModal';
import { CommandPalette } from '../components/common/CommandPalette';
import { runPythonCode } from '../services/runner/pythonRunner';
import { runJavaScriptCode } from '../services/runner/jsRunner';
import { runProjectTests } from '../services/testRunner';
import { diagnoseErrorLocally } from '../services/ai/diagnosticEngine';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export const IdePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Editor Tabs & Files
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [unsavedFileIds, setUnsavedFileIds] = useState<Set<string>>(new Set());

  // Layout Toggles
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Runtime & Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [testResults, setTestResults] = useState<TestRunResult | null>(null);
  const [debugHistory, setDebugHistory] = useState<DebugSession[]>([]);

  // Modals & AI Signature Workflow
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [learnConcept, setLearnConcept] = useState<any>(null);

  const [activeDiagnosis, setActiveDiagnosis] = useState<StructuredDiagnosis | null>(null);
  const [activePatch, setActivePatch] = useState<PatchProposal | null>(null);
  const [rollbackBackup, setRollbackBackup] = useState<{ fileId: string; content: string } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string | undefined>();

  // Load project on mount or projectId change
  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const found = await getProject(projectId);
        if (!isMounted) return;
        if (found) {
          setProject(found);
          const initialFile = found.files.find(f => f.path === found.entryFile) || found.files[0];
          if (initialFile) {
            setActiveFileId(initialFile.id);
            setOpenTabIds([initialFile.id]);
          }
          // Load debug sessions
          const sessions = await getDebugSessions(found.id);
          setDebugHistory(sessions);
        } else {
          setErrorNotice(`Project "${projectId}" not found.`);
        }
      } catch (err: any) {
        setErrorNotice(err.message || 'Failed to open project.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProject();
    return () => { isMounted = false; };
  }, [projectId]);

  // Listen to postMessages from sandboxed iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'codepilot-runner') {
        const { type, message, file, line, col, stack } = event.data;
        const newMsg: ConsoleMessage = {
          id: `msg-${Date.now()}-${Math.random()}`,
          type,
          message,
          file,
          line,
          column: col,
          stack,
          timestamp: Date.now()
        };

        setConsoleMessages(prev => [...prev, newMsg]);

        // If error received, make sure terminal is open
        if (type === 'error') {
          setIsTerminalOpen(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Save changes to persistent storage
  const handleSave = async () => {
    if (!project) return;
    await saveProject(project);
    setUnsavedFileIds(new Set());
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  // File Content Change in Editor
  const handleChangeContent = (fileId: string, newContent: string) => {
    if (!project) return;
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map(f => f.id === fileId ? { ...f, content: newContent } : f)
      };
    });
    setUnsavedFileIds(prev => new Set(prev).add(fileId));
  };

  // Tab management
  const handleSelectTab = (fileId: string) => {
    setActiveFileId(fileId);
    if (!openTabIds.includes(fileId)) {
      setOpenTabIds(prev => [...prev, fileId]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextTabs = openTabIds.filter(id => id !== fileId);
    setOpenTabIds(nextTabs);
    if (activeFileId === fileId && nextTabs.length > 0) {
      setActiveFileId(nextTabs[nextTabs.length - 1]);
    }
  };

  // File explorer actions
  const handleCreateFile = async (name: string) => {
    if (!project) return;
    const newFile: ProjectFile = {
      id: `f-${Date.now()}`,
      name,
      path: `/${name}`,
      content: ''
    };
    const updated = {
      ...project,
      files: [...project.files, newFile]
    };
    setProject(updated);
    await saveProject(updated);
    setOpenTabIds(prev => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    if (!project) return;
    const updated = {
      ...project,
      files: project.files.map(f => f.id === fileId ? { ...f, name: newName, path: `/${newName}` } : f)
    };
    setProject(updated);
    await saveProject(updated);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!project) return;
    const updated = {
      ...project,
      files: project.files.filter(f => f.id !== fileId)
    };
    setProject(updated);
    await saveProject(updated);
    handleCloseTab(fileId);
  };

  // Execution Handler
  const handleRun = async () => {
    if (!project) return;
    setIsRunning(true);
    setVerificationStatus('idle');

    // Add separator to console
    setConsoleMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: 'system',
        message: `--- Execution Started: [${project.runtime}] ---`,
        timestamp: Date.now()
      }
    ]);

    try {
      if (project.type === 'web' || project.type === 'react') {
        // Auto-save before running
        await handleSave();
        setRefreshTrigger(prev => prev + 1);
        setIsRunning(false);
      } else if (project.type === 'python') {
        const activeFile = project.files.find(f => f.id === activeFileId) || project.files[0];
        const res = await runPythonCode(
          activeFile.content,
          (line) => {
            setConsoleMessages(prev => [...prev, { id: `out-${Date.now()}`, type: 'log', message: line, timestamp: Date.now() }]);
          },
          (line) => {
            setConsoleMessages(prev => [...prev, { id: `err-${Date.now()}`, type: 'error', message: line, timestamp: Date.now() }]);
          }
        );

        if (!res.success && res.error) {
          triggerAiDebugWorkflow(res.error.message, res.error.stack);
        }
        setIsRunning(false);
      } else if (project.type === 'node') {
        const activeFile = project.files.find(f => f.id === activeFileId) || project.files[0];
        const res = await runJavaScriptCode(
          activeFile.content,
          (line) => {
            setConsoleMessages(prev => [...prev, { id: `out-${Date.now()}`, type: 'log', message: line, timestamp: Date.now() }]);
          },
          (line) => {
            setConsoleMessages(prev => [...prev, { id: `err-${Date.now()}`, type: 'error', message: line, timestamp: Date.now() }]);
          }
        );

        if (!res.success && res.error) {
          triggerAiDebugWorkflow(res.error.message, res.error.stack);
        }
        setIsRunning(false);
      }
    } catch (err: any) {
      setConsoleMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          message: err.message || String(err),
          timestamp: Date.now()
        }
      ]);
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setConsoleMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: 'system',
        message: `--- Execution Stopped by User ---`,
        timestamp: Date.now()
      }
    ]);
  };

  // Test Runner Handler
  const handleRunTests = async () => {
    if (!project) return;
    setIsTerminalOpen(true);
    const results = await runProjectTests(project);
    setTestResults(results);

    setConsoleMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: results.failed === 0 ? 'info' : 'warn',
        message: `[Test Runner] ${results.passed} Passed, ${results.failed} Failed in ${results.durationMs}ms`,
        timestamp: Date.now()
      }
    ]);
  };

  // Signature 6-Step Workflow: Detect → Diagnose → Propose Patch → User Approval → Apply → Verify
  const triggerAiDebugWorkflow = (errorMessage: string, stack?: string) => {
    if (!project) return;
    const activeFile = project.files.find(f => f.id === activeFileId);
    const { diagnosis, patch } = diagnoseErrorLocally(
      errorMessage,
      stack,
      project,
      activeFile?.content,
      activeFile?.path
    );

    setActiveDiagnosis(diagnosis);
    setActivePatch(patch);
    setVerificationStatus('idle');
    setIsWorkflowOpen(true);
  };

  const handleApplyPatch = async (patch: PatchProposal) => {
    if (!project) return;
    const targetFile = project.files.find(f => f.path === patch.file || f.name === patch.file.replace(/^\//, ''));
    if (!targetFile) return;

    // Backup for 1-click rollback
    setRollbackBackup({
      fileId: targetFile.id,
      content: targetFile.content
    });

    // Apply proposed code
    const updatedProject = {
      ...project,
      files: project.files.map(f => f.id === targetFile.id ? { ...f, content: patch.proposedCode } : f)
    };

    setProject(updatedProject);
    await saveProject(updatedProject);
    setUnsavedFileIds(prev => {
      const copy = new Set(prev);
      copy.delete(targetFile.id);
      return copy;
    });

    setConsoleMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: 'info',
        message: `[AI Safe Fix] Patch applied to ${targetFile.name}. Awaiting verification...`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleRollbackPatch = async () => {
    if (!project || !rollbackBackup) return;
    const updated = {
      ...project,
      files: project.files.map(f => f.id === rollbackBackup.fileId ? { ...f, content: rollbackBackup.content } : f)
    };
    setProject(updated);
    await saveProject(updated);
    setVerificationStatus('idle');
    setConsoleMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: 'warn',
        message: `[Rollback] Patch reverted to original file contents.`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleVerifyFix = async (): Promise<boolean> => {
    if (!project) return false;
    setVerificationStatus('pending_run');

    // 1. Re-render preview or rerun code
    setRefreshTrigger(prev => prev + 1);

    // 2. Clear old error messages
    setConsoleMessages(prev => prev.filter(m => m.type !== 'error'));

    // 3. Run test runner
    const testRes = await runProjectTests(project);
    setTestResults(testRes);

    const isPassed = testRes.failed === 0;
    const outcomeStatus: VerificationStatus = isPassed ? 'verified_passed' : 'verification_failed';
    setVerificationStatus(outcomeStatus);

    const vMsg = isPassed
      ? 'Fix Verified: Test assertions passed with 0 runtime exceptions.'
      : `Verification Failed: ${testRes.failed} test failure(s) detected.`;
    setVerificationMessage(vMsg);

    // Record to persistent DebugSession timeline
    if (activeDiagnosis && activePatch) {
      const session: DebugSession = {
        id: `sess-${Date.now()}`,
        projectId: project.id,
        timestamp: Date.now(),
        errorSummary: activeDiagnosis.summary,
        diagnosis: activeDiagnosis,
        patch: activePatch,
        status: 'applied',
        verificationStatus: outcomeStatus,
        verificationMessage: vMsg
      };

      await saveDebugSession(session);
      setDebugHistory(prev => [session, ...prev]);
    }

    return isPassed;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#080A0F] flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
        <RefreshCw className="w-6 h-6 text-brand-400 animate-spin" />
        <span>Initializing CodePilot IDE Workspace...</span>
      </div>
    );
  }

  if (errorNotice || !project) {
    return (
      <div className="h-screen bg-[#080A0F] flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <h2 className="text-xl font-bold text-white mb-2">Workspace Unavailable</h2>
        <p className="text-xs text-slate-400 mb-6">{errorNotice || 'Project could not be found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  const activeFile = project.files.find(f => f.id === activeFileId) || project.files[0];

  return (
    <div className="h-screen flex flex-col bg-[#080A0F] text-slate-100 overflow-hidden font-sans">
      {/* Top Toolbar */}
      <IdeNavbar
        project={project}
        currentFileName={activeFile?.name}
        onRenameProject={(newName) => setProject({ ...project, name: newName })}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onRunTests={handleRunTests}
        hasUnsavedChanges={unsavedFileIds.size > 0}
        onManualSave={handleSave}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onTriggerAiDebug={() => triggerAiDebugWorkflow('TypeError: Cannot set properties of null (setting \'textContent\')')}
      />

      {/* Main IDE Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer */}
        <FileExplorer
          files={project.files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectTab}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
        />

        {/* Center: Editor & Lower Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco Editor */}
          <CodeEditor
            files={project.files}
            activeFileId={activeFileId}
            openTabIds={openTabIds}
            unsavedFileIds={unsavedFileIds}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
            onChangeContent={handleChangeContent}
            onSave={handleSave}
            onRun={handleRun}
          />

          {/* Lower Terminal Panel */}
          {isTerminalOpen && (
            <TerminalPanel
              messages={consoleMessages}
              testResults={testResults}
              debugHistory={debugHistory}
              onClear={() => setConsoleMessages([])}
              onClose={() => setIsTerminalOpen(false)}
              onTriggerAiDebug={triggerAiDebugWorkflow}
              onJumpToFile={(fileName) => {
                const target = project.files.find(f => f.name === fileName || f.path.endsWith(fileName));
                if (target) handleSelectTab(target.id);
              }}
            />
          )}
        </div>

        {/* Right 1: Live Preview (collapsible) */}
        {isPreviewOpen && (
          <PreviewPanel
            project={project}
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}

        {/* Right 2: AI Assistant Sidebar (collapsible) */}
        {isAiOpen && (
          <AiPanel
            project={project}
            activeFilePath={activeFile?.path}
            onClose={() => setIsAiOpen(false)}
            onOpenDebugWorkflow={triggerAiDebugWorkflow}
            onOpenLearnConcept={(concept) => {
              setLearnConcept(concept);
              setIsLearnOpen(true);
            }}
          />
        )}
      </div>

      {/* Signature Debug Workflow Modal (6 Steps) */}
      {activeDiagnosis && activePatch && (
        <DebugWorkflowModal
          isOpen={isWorkflowOpen}
          onClose={() => setIsWorkflowOpen(false)}
          diagnosis={activeDiagnosis}
          patch={activePatch}
          project={project}
          onApplyPatch={handleApplyPatch}
          onRejectPatch={() => setIsWorkflowOpen(false)}
          onRollbackPatch={handleRollbackPatch}
          onVerifyFix={handleVerifyFix}
          verificationStatus={verificationStatus}
          verificationMessage={verificationMessage}
        />
      )}

      {/* Educational Concept Modal */}
      <LearnDebuggerModal
        isOpen={isLearnOpen}
        onClose={() => setIsLearnOpen(false)}
        concept={learnConcept}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
};

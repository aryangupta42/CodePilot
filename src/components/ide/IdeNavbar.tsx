import React, { useState } from 'react';
import type { Project } from '../../types';
import { Link } from 'react-router-dom';
import {
  Code2,
  Play,
  Square,
  Sparkles,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  PanelBottom,
  Eye,
  TestTube2,
  Bug,
  Command,
  FileCode
} from 'lucide-react';
import { exportProjectToZip } from '../../services/zipService';

interface IdeNavbarProps {
  project: Project;
  currentFileName?: string;
  onRenameProject: (name: string) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onRunTests: () => void;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  isAiOpen: boolean;
  onToggleAi: () => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onTriggerAiDebug?: () => void;
}

export const IdeNavbar: React.FC<IdeNavbarProps> = ({
  project,
  currentFileName,
  onRenameProject,
  isRunning,
  onRun,
  onStop,
  onRunTests,
  hasUnsavedChanges,
  onManualSave,
  isAiOpen,
  onToggleAi,
  isPreviewOpen,
  onTogglePreview,
  isTerminalOpen,
  onToggleTerminal,
  onOpenSettings,
  onOpenCommandPalette,
  onTriggerAiDebug
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameVal.trim() && nameVal.trim() !== project.name) {
      onRenameProject(nameVal.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="h-14 bg-bg-darkest border-b border-bg-border flex items-center justify-between px-3 sm:px-4 select-none z-30 shrink-0 font-sans">
      {/* Left: Back & Project Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
          title="Return to Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 p-[1px]">
            <div className="w-full h-full bg-bg-darkest rounded-[7px] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="hidden sm:inline font-bold text-xs text-white uppercase tracking-wider">
            CodePilot
          </span>
        </div>

        <div className="h-4 w-[1px] bg-bg-border mx-1" />

        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Project Name editable */}
          {isEditingName ? (
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={handleNameSubmit}
                className="px-2 py-0.5 rounded bg-bg-surface border border-brand-500 text-xs font-semibold text-white outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-bold text-white hover:text-cyan-300 transition-colors truncate max-w-[140px] sm:max-w-xs"
              title="Click to rename project"
            >
              {project.name}
            </button>
          )}

          {currentFileName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px] truncate max-w-[120px]">
                <FileCode className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="text-slate-300 truncate">{currentFileName}</span>
              </div>
            </>
          )}
        </div>

        {/* Save Status Badge */}
        <div className="flex items-center ml-1">
          {hasUnsavedChanges ? (
            <button
              onClick={onManualSave}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono hover:bg-amber-500/20 transition-colors"
              title="Unsaved changes. Click or press Ctrl+S to save."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved (Ctrl+S)</span>
            </button>
          ) : (
            <span className="text-slate-500 flex items-center gap-1 text-[11px] font-mono">
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle: Execution & Automated Test Actions */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Stop Execution"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Run Code in Sandbox (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
            <span className="hidden lg:inline text-[10px] text-emerald-200 font-mono opacity-80">(Ctrl+↵)</span>
          </button>
        )}

        <button
          onClick={onRunTests}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-card border border-bg-border text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Run Automated Project Tests"
        >
          <TestTube2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Run Tests</span>
        </button>

        {onTriggerAiDebug && (
          <button
            onClick={onTriggerAiDebug}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/40 border border-brand-500/40 text-brand-300 hover:text-white text-xs font-semibold transition-all shadow-glow-brand/20"
            title="Launch AI Debug Detective"
          >
            <Bug className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden md:inline">AI Debug</span>
          </button>
        )}
      </div>

      {/* Right: Palette, Layout Toggles, Export, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-surface hover:bg-bg-card border border-bg-border text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3 text-cyan-400" />
          <span>⌘K</span>
        </button>

        {/* Toggle Terminal Panel */}
        <button
          onClick={onToggleTerminal}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
            isTerminalOpen ? 'bg-bg-card text-white' : 'text-slate-400 hover:text-white hover:bg-bg-surface'
          }`}
          title="Toggle Terminal Panel"
        >
          <PanelBottom className="w-4 h-4" />
        </button>

        {/* Toggle Live Preview */}
        <button
          onClick={onTogglePreview}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPreviewOpen ? 'bg-bg-card text-white' : 'text-slate-400 hover:text-white hover:bg-bg-surface'
          }`}
          title="Toggle Live Preview"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Toggle AI Drawer */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isAiOpen
              ? 'bg-brand-600 text-white shadow-glow-brand'
              : 'bg-bg-surface hover:bg-bg-card text-brand-300 border border-brand-500/30'
          }`}
          title="Toggle AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden md:inline">AI Assistant</span>
        </button>

        <div className="h-4 w-[1px] bg-bg-border mx-0.5" />

        {/* Export ZIP */}
        <button
          onClick={() => exportProjectToZip(project)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
          title="Export Project as ZIP"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

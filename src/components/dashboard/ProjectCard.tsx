import React, { useState } from 'react';
import type { Project } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Atom,
  Terminal,
  Cpu,
  Bug,
  Trash2,
  Edit3,
  Copy,
  Download,
  ArrowRight,
  MoreVertical,
  Clock,
  Files
} from 'lucide-react';
import { exportProjectToZip } from '../../services/zipService';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate?: (project: Project) => void;
  viewMode?: 'grid' | 'list';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onRename,
  onDuplicate,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getRuntimeIcon = () => {
    switch (project.type) {
      case 'react':
        return <Atom className="w-4 h-4 text-cyan-400" />;
      case 'python':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'node':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'web':
      default:
        return project.id.includes('buggy') 
          ? <Bug className="w-4 h-4 text-rose-400" />
          : <Globe className="w-4 h-4 text-brand-400" />;
    }
  };

  const getRuntimeBadge = () => {
    switch (project.runtime) {
      case 'pyodide-wasm':
        return { label: 'Python WASM', color: 'text-amber-300 bg-amber-950/40 border-amber-800/40' };
      case 'react-compiler':
        return { label: 'React 18 JSX', color: 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40' };
      case 'js-sandbox':
        return { label: 'JS Worker', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40' };
      case 'browser-native':
      default:
        return { label: 'Web Preview', color: 'text-violet-300 bg-violet-950/40 border-violet-800/40' };
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameVal.trim() && nameVal.trim() !== project.name) {
      onRename(project.id, nameVal.trim());
    }
    setIsRenaming(false);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  const runtimeBadgeInfo = getRuntimeBadge();

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="group rounded-xl bg-bg-card border border-bg-border hover:border-bg-borderHover hover:shadow-card p-3 sm:p-4 flex items-center justify-between gap-4 transition-all duration-150 select-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-bg-darkest border border-bg-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {getRuntimeIcon()}
          </div>
          <div className="min-w-0">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit}>
                <input
                  type="text"
                  autoFocus
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onBlur={handleRenameSubmit}
                  className="px-2 py-0.5 bg-bg-darkest border border-brand-500 rounded text-xs text-white font-semibold outline-none"
                />
              </form>
            ) : (
              <h4
                onClick={() => navigate(`/ide/${project.id}`)}
                className="text-xs sm:text-sm font-bold text-white hover:text-brand-300 cursor-pointer truncate transition-colors"
              >
                {project.name}
              </h4>
            )}
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span className={`px-1.5 py-0.2 rounded text-[10px] border ${runtimeBadgeInfo.color}`}>
                {runtimeBadgeInfo.label}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Files className="w-3 h-3 text-slate-500" />
                {project.files.length} files
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(project.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportProjectToZip(project)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-bg-darkest border border-transparent hover:border-bg-border transition-all"
            title="Export ZIP"
            aria-label="Export ZIP"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/ide/${project.id}`)}
            className="px-3.5 py-1.5 rounded-lg bg-bg-darkest hover:bg-brand-600 text-slate-200 hover:text-white border border-bg-border hover:border-brand-500/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Open IDE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT
  return (
    <div className="relative rounded-2xl bg-bg-card border border-bg-border hover:border-bg-borderHover hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between p-5 select-none card-highlight">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bg-darkest border border-bg-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getRuntimeIcon()}
            </div>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${runtimeBadgeInfo.color}`}>
              {runtimeBadgeInfo.label}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-darkest border border-transparent hover:border-bg-border transition-colors"
              aria-label="More Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-bg-panel border border-bg-border shadow-dropdown py-1 text-xs text-slate-300 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-bg-card flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename Workspace</span>
                </button>
                {onDuplicate && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDuplicate(project);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-bg-card flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate Workspace</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await exportProjectToZip(project);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-bg-card flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export as ZIP</span>
                </button>
                <div className="h-[1px] bg-bg-border my-1" />
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Name or Rename Form */}
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="mb-2">
            <input
              type="text"
              autoFocus
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleRenameSubmit}
              className="w-full px-2.5 py-1 bg-bg-darkest border border-brand-500 rounded-lg text-sm text-white font-semibold outline-none"
            />
          </form>
        ) : (
          <h3
            onClick={() => navigate(`/ide/${project.id}`)}
            className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors cursor-pointer line-clamp-1 mb-1.5 tracking-tight"
          >
            {project.name}
          </h3>
        )}

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'Custom multi-file workspace configured in CodePilot AI.'}
        </p>
      </div>

      {/* Card Bottom Meta & Open Button */}
      <div className="pt-3.5 border-t border-bg-border/70 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-slate-300">
            <Files className="w-3 h-3 text-slate-400" />
            {project.files.length} {project.files.length === 1 ? 'file' : 'files'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatRelativeTime(project.updatedAt)}
          </span>
        </div>

        <button
          onClick={() => navigate(`/ide/${project.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-darkest group-hover:bg-brand-600 text-xs font-semibold text-slate-200 group-hover:text-white border border-bg-border group-hover:border-brand-500/50 transition-all shadow-sm"
        >
          <span>Open IDE</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-bg-panel border border-bg-border p-5 shadow-dropdown space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Confirm Workspace Deletion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{project.name}"</strong>? All saved files and debugging records will be erased from local storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-bg-border">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(project.id);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

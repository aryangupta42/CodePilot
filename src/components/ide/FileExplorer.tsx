import React, { useState } from 'react';
import type { ProjectFile } from '../../types';
import {
  FileCode,
  FileText,
  FilePlus,
  FolderPlus,
  Folder,
  FolderOpen,
  Trash2,
  Edit2,
  Search,
  Code,
  Atom,
  Terminal,
  File
} from 'lucide-react';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, isFolder?: boolean) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile
}) => {
  const [search, setSearch] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      return <Atom className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (fileName.endsWith('.py')) {
      return <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (fileName.endsWith('.html')) {
      return <Code className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
    if (fileName.endsWith('.css')) {
      return <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
      return <FileCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renameVal.trim()) {
      onRenameFile(renamingId, renameVal.trim());
      setRenamingId(null);
    }
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-60 bg-bg-darkest border-r border-bg-border flex flex-col h-full select-none shrink-0">
      {/* Explorer Header */}
      <div className="px-3 py-2.5 border-b border-bg-border flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            className="p-1 rounded hover:bg-bg-surface text-slate-400 hover:text-white transition-colors"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="p-2 border-b border-bg-border">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-7 pr-2 py-1 rounded bg-bg-surface text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 border border-bg-border"
          />
        </div>
      </div>

      {/* New File Inline Form */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-bg-surface border-b border-bg-border">
          <input
            type="text"
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.js"
            className="w-full px-2 py-1 text-xs bg-bg-darkest border border-brand-500 rounded text-white outline-none"
            onBlur={() => {
              if (!newFileName.trim()) setIsCreatingFile(false);
            }}
          />
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const isBeingRenamed = renamingId === file.id;

          return (
            <div
              key={file.id}
              className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                isActive
                  ? 'bg-brand-600/20 text-white border-l-2 border-brand-500 font-medium'
                  : 'text-slate-300 hover:bg-bg-surface hover:text-white border-l-2 border-transparent'
              }`}
              onClick={() => onSelectFile(file.id)}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(file.name)}
                {isBeingRenamed ? (
                  <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={handleRenameSubmit}
                      className="px-1 py-0.5 bg-bg-darkest border border-brand-500 rounded text-xs text-white outline-none"
                    />
                  </form>
                ) : (
                  <span className="truncate">{file.name}</span>
                )}
              </div>

              {/* Action Buttons on Hover */}
              {!isBeingRenamed && (
                <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(file.id);
                      setRenameVal(file.name);
                    }}
                    className="p-1 rounded hover:bg-bg-darkest text-slate-400 hover:text-white"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-bg-surface border border-bg-border p-5 shadow-panel space-y-4">
            <h3 className="text-sm font-bold text-white">Delete File?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete <strong>{fileToDelete.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card border border-bg-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteFile(fileToDelete.id);
                  setFileToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

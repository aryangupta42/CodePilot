import React, { useState, useRef } from 'react';
import { X, UploadCloud, GitBranch, AlertTriangle, FileArchive, CheckCircle2, ArrowRight } from 'lucide-react';
import { parseProjectZip, type ZipImportSummary } from '../../services/zipService';
import { fetchGitHubRepo } from '../../services/githubService';
import type { Project, ProjectFile } from '../../types';
import { saveProject } from '../../services/storage';
import { useNavigate } from 'react-router-dom';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectImported: (project: Project) => void;
}

export const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectImported
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'zip' | 'github'>('zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ZIP State
  const [zipSummary, setZipSummary] = useState<ZipImportSummary | null>(null);
  const [parsedFiles, setParsedFiles] = useState<ProjectFile[]>([]);
  const [customName, setCustomName] = useState('');

  // GitHub State
  const [githubUrl, setGithubUrl] = useState('');

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setError(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZipFileSelected = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setStatusMessage('Reading and inspecting ZIP archive...');

    try {
      const { summary, projectFiles } = await parseProjectZip(file);
      setZipSummary(summary);
      setParsedFiles(projectFiles);
      setCustomName(summary.name);
      setStatusMessage(null);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect ZIP file.');
      setZipSummary(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmZipImport = async () => {
    if (!zipSummary || parsedFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newProject: Project = {
        id: newProjectId,
        name: customName.trim() || zipSummary.name,
        type: zipSummary.detectedType,
        runtime: zipSummary.detectedType === 'python' ? 'pyodide-wasm' : (zipSummary.detectedType === 'react' ? 'react-compiler' : 'browser-native'),
        runtimeSupport: 'full',
        entryFile: parsedFiles.find(f => f.name === 'index.html' || f.name === 'main.py' || f.name === 'App.tsx' || f.name === 'index.js')?.path || parsedFiles[0].path,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        files: parsedFiles
      };

      await saveProject(newProject);
      onProjectImported(newProject);
      setIsProcessing(false);
      onClose();
      navigate(`/ide/${newProjectId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save imported project.');
      setIsProcessing(false);
    }
  };

  const handleGitHubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const result = await fetchGitHubRepo(githubUrl, (msg) => setStatusMessage(msg));
      
      const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newProject: Project = {
        id: newProjectId,
        name: result.projectName,
        type: result.detectedType,
        runtime: result.detectedType === 'python' ? 'pyodide-wasm' : (result.detectedType === 'react' ? 'react-compiler' : 'browser-native'),
        runtimeSupport: 'full',
        entryFile: result.files.find(f => f.name === 'index.html' || f.name === 'main.py' || f.name === 'App.tsx' || f.name === 'index.js')?.path || result.files[0].path,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        files: result.files
      };

      await saveProject(newProject);
      onProjectImported(newProject);
      onClose();
      navigate(`/ide/${newProjectId}`);
    } catch (err: any) {
      setError(err.message || 'GitHub import failed.');
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-bg-panel border border-bg-border rounded-2xl shadow-dropdown overflow-hidden card-highlight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-bg-border bg-bg-panel">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Import Existing Project</h2>
            <p className="text-[11px] text-slate-400">Bring your codebase into the in-browser sandbox.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-card transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-bg-border bg-bg-darkest/50">
          <button
            onClick={() => { setActiveTab('zip'); setError(null); }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeTab === 'zip'
                ? 'border-brand-500 text-white bg-bg-card/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileArchive className="w-4 h-4 text-violet-400" />
            <span>Upload ZIP Archive</span>
          </button>
          <button
            onClick={() => { setActiveTab('github'); setError(null); }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeTab === 'github'
                ? 'border-cyan-500 text-white bg-bg-card/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>Public GitHub Repo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="mb-4 p-3 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: ZIP ARCHIVE */}
          {activeTab === 'zip' && (
            <div className="space-y-4">
              {!zipSummary ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleZipFileSelected(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-bg-border hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 bg-bg-card/40 hover:bg-bg-card/80 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleZipFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-white text-sm tracking-tight">
                    Drop your ZIP archive here or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Supports HTML/JS, React, Node, or Python projects (Max: 25MB)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-darkest text-[10px] font-mono text-slate-400 border border-bg-border">
                    <span>🛡️ Path sanitization prevents traversal attacks</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-bg-card border border-bg-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ZIP Archive Verified & Extracted</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-darkest text-cyan-400 border border-bg-border">
                        {zipSummary.detectedType.toUpperCase()} RUNTIME
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-darkest border border-bg-border text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Extracted Files ({zipSummary.fileCount})
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                        {zipSummary.files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-bg-darkest font-mono text-slate-300 border border-bg-border/60">
                            <span className="truncate">{f.path}</span>
                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setZipSummary(null)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
                    >
                      Choose Different ZIP
                    </button>
                    <button
                      onClick={handleConfirmZipImport}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <span>{isProcessing ? 'Importing...' : 'Open in CodePilot IDE'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GITHUB IMPORT */}
          {activeTab === 'github' && (
            <form onSubmit={handleGitHubImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Public GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/facebook/react or owner/repo"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-darkest border border-bg-border text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-card border border-bg-border text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300">Security & Privacy Protocol:</div>
                <p>• Only public repositories are retrieved via the read-only GitHub REST API.</p>
                <p>• No personal access tokens or credentials are ever requested or stored.</p>
                <p>• For private codebases, use the encrypted client-side ZIP upload option.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bg-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span>{isProcessing ? 'Fetching Repo...' : 'Fetch & Open in IDE'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

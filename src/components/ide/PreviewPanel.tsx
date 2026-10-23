import React, { useState } from 'react';
import type { Project, ProjectFile } from '../../types';
import { buildWebBundle } from '../../services/runner/webRunner';
import { buildReactBundle } from '../../services/runner/reactRunner';
import {
  RotateCcw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  AlertTriangle
} from 'lucide-react';

interface PreviewPanelProps {
  project: Project;
  refreshTrigger: number;
  onRefresh: () => void;
  onClose: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  project,
  refreshTrigger,
  onRefresh,
  onClose
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const getPreviewDocument = () => {
    if (project.type === 'react') {
      return buildReactBundle(project.files);
    }
    if (project.type === 'web') {
      return buildWebBundle(project.files).fullDocument;
    }
    return null;
  };

  const doc = getPreviewDocument();

  const handleOpenExternal = () => {
    if (!doc) return;
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="w-96 lg:w-[480px] bg-bg-darkest border-l border-bg-border flex flex-col h-full select-none z-10 shrink-0">
      {/* Preview Header */}
      <div className="h-9 bg-bg-darkest border-b border-bg-border flex items-center justify-between px-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Live Preview
        </span>

        {/* Viewport Switcher */}
        {doc && (
          <div className="flex items-center gap-1 bg-bg-surface rounded-lg p-0.5 border border-bg-border">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'bg-bg-card text-white' : 'text-slate-400'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded ${viewport === 'tablet' ? 'bg-bg-card text-white' : 'text-slate-400'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'bg-bg-card text-white' : 'text-slate-400'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {doc && (
            <>
              <button
                onClick={onRefresh}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
                title="Reload Preview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleOpenExternal}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Canvas Area */}
      <div className="flex-1 bg-black/40 flex items-center justify-center overflow-auto p-2">
        {doc ? (
          <div
            style={{ width: getViewportWidth() }}
            className="h-full bg-white rounded-lg overflow-hidden shadow-panel border border-bg-border transition-all duration-200"
          >
            <iframe
              key={refreshTrigger}
              srcDoc={doc}
              title="CodePilot Live Preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-modals allow-same-origin"
            />
          </div>
        ) : (
          /* Non-GUI Runtime Visualizer (Python / Node scripts) */
          <div className="text-center p-6 max-w-xs text-slate-400 text-xs space-y-3 font-sans">
            <div className="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center mx-auto text-amber-400 border border-bg-border">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Console Runtime Output</h4>
            <p className="leading-relaxed">
              This is a backend / algorithmic project ({project.runtime}). Results and outputs are directed to the Terminal & Output panel below.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Pyodide WASM / JS Engine
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

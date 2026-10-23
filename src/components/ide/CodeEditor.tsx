import React, { useState, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { ProjectFile } from '../../types';
import { X, Code, Atom, Terminal, FileCode, FileText } from 'lucide-react';

interface CodeEditorProps {
  files: ProjectFile[];
  activeFileId: string;
  openTabIds: string[];
  unsavedFileIds: Set<string>;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onChangeContent: (fileId: string, newContent: string) => void;
  onSave: () => void;
  onRun: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  openTabIds,
  unsavedFileIds,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onSave,
  onRun
}) => {
  const [monacoLoaded, setMonacoLoaded] = useState(true);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith('.tsx')) return 'typescript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.jsx')) return 'javascript';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Define custom dark theme matching CodePilot palette
    monaco.editor.defineTheme('codepilot-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'identifier', foreground: 'F1F5F9' },
        { token: 'type', foreground: '22D3EE' }
      ],
      colors: {
        'editor.background': '#080A0F',
        'editor.foreground': '#F1F5F9',
        'editor.lineHighlightBackground': '#151B26',
        'editorCursor.foreground': '#22D3EE',
        'editorWhitespace.foreground': '#283347',
        'editorIndentGuide.background': '#1A2232',
        'editorIndentGuide.activeBackground': '#3B4B68',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818CF8'
      }
    });
    monaco.editor.setTheme('codepilot-dark');

    // Register Save (Ctrl+S) and Run (Ctrl+Enter) commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080A0F] overflow-hidden">
      {/* Tab Bar */}
      <div className="h-9 bg-bg-darkest border-b border-bg-border flex items-center overflow-x-auto select-none shrink-0 px-1">
        {openTabIds.map((tabId) => {
          const file = files.find(f => f.id === tabId);
          if (!file) return null;

          const isActive = file.id === activeFileId;
          const isUnsaved = unsavedFileIds.has(file.id);

          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs border-r border-bg-border/60 cursor-pointer transition-colors max-w-[180px] ${
                isActive
                  ? 'bg-[#080A0F] text-white border-t-2 border-t-brand-500 font-medium'
                  : 'bg-bg-darkest text-slate-400 hover:bg-bg-surface hover:text-slate-200 border-t-2 border-t-transparent'
              }`}
            >
              <span className="truncate">{file.name}</span>

              {isUnsaved ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="w-2 h-2 rounded-full bg-amber-400 group-hover:hidden shrink-0"
                  title="Unsaved changes"
                />
              ) : null}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className={`p-0.5 rounded hover:bg-bg-card hover:text-white shrink-0 ${
                  isUnsaved ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {activeFile ? (
          monacoLoaded ? (
            <Editor
              height="100%"
              path={activeFile.name}
              defaultLanguage={getLanguage(activeFile.name)}
              language={getLanguage(activeFile.name)}
              value={activeFile.content}
              theme="vs-dark"
              onMount={handleEditorMount}
              onChange={(value) => {
                onChangeContent(activeFile.id, value || '');
              }}
              options={{
                fontFamily: "'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
                fontSize: 13,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                bracketPairColorization: { enabled: true }
              }}
              loading={
                <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                  Loading Monaco Editor...
                </div>
              }
            />
          ) : (
            // Robust Fallback Editor
            <textarea
              value={activeFile.content}
              onChange={(e) => onChangeContent(activeFile.id, e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                  e.preventDefault();
                  onSave();
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  onRun();
                }
              }}
              className="w-full h-full p-4 bg-[#080A0F] text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            No file opened. Select a file from the explorer.
          </div>
        )}
      </div>
    </div>
  );
};

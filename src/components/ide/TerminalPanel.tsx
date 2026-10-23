import React, { useState } from 'react';
import type { ConsoleMessage, TestRunResult, DebugSession } from '../../types';
import {
  Terminal,
  AlertCircle,
  TestTube2,
  History,
  Trash2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface TerminalPanelProps {
  messages: ConsoleMessage[];
  testResults: TestRunResult | null;
  debugHistory: DebugSession[];
  onClear: () => void;
  onClose: () => void;
  onTriggerAiDebug: (errorMessage: string, stack?: string) => void;
  onJumpToFile: (file: string, line?: number) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  messages,
  testResults,
  debugHistory,
  onClear,
  onClose,
  onTriggerAiDebug,
  onJumpToFile
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'problems' | 'tests' | 'history'>('console');

  const errorMessages = messages.filter(m => m.type === 'error');

  return (
    <div className="h-64 bg-[#080A0F] border-t border-bg-border flex flex-col shrink-0 select-none z-20">
      {/* Panel Tab Header */}
      <div className="h-9 bg-bg-darkest border-b border-bg-border flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'console'
                ? 'bg-bg-surface text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Console Output</span>
            {messages.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-bg-card text-slate-300">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'problems'
                ? 'bg-bg-surface text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${errorMessages.length > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Diagnostics</span>
            {errorMessages.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {errorMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'tests'
                ? 'bg-bg-surface text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Runner</span>
            {testResults && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                testResults.failed === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {testResults.passed}/{testResults.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'history'
                ? 'bg-bg-surface text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-brand-400" />
            <span>Debug Timeline</span>
            {debugHistory.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-bg-card text-slate-300">
                {debugHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
            title="Minimize Panel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs select-text">
        {/* CONSOLE TAB */}
        {activeTab === 'console' && (
          <div className="space-y-1">
            {messages.length === 0 ? (
              <div className="text-slate-500 text-xs py-4 text-center">
                Console is idle. Click "Run" to execute your project.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 py-0.5 leading-relaxed ${
                    m.type === 'error'
                      ? 'text-rose-400 bg-rose-500/10 px-2 rounded border-l-2 border-rose-500'
                      : m.type === 'warn'
                      ? 'text-amber-300'
                      : m.type === 'info'
                      ? 'text-cyan-300'
                      : 'text-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 select-none shrink-0 font-sans">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="whitespace-pre-wrap flex-1 break-all">{m.message}</span>

                  {m.type === 'error' && (
                    <button
                      onClick={() => onTriggerAiDebug(m.message, m.stack)}
                      className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 text-[10px] font-sans border border-brand-500/30 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Debug with AI</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROBLEMS & DIAGNOSTICS TAB */}
        {activeTab === 'problems' && (
          <div className="space-y-3">
            {errorMessages.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-emerald-400 font-sans">
                <CheckCircle2 className="w-4 h-4" />
                <span>No active errors or diagnostics detected.</span>
              </div>
            ) : (
              errorMessages.map((err) => (
                <div
                  key={err.id}
                  className="p-3 rounded-lg bg-bg-surface border border-rose-500/30 flex items-start justify-between gap-4 font-sans"
                >
                  <div>
                    <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs mb-1">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{err.message.split('\n')[0]}</span>
                    </div>
                    {err.stack && (
                      <div className="text-[11px] font-mono text-slate-400 max-h-16 overflow-y-auto pl-6 mt-1 whitespace-pre-wrap">
                        {err.stack}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onTriggerAiDebug(err.message, err.stack)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-brand flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Run AI Fix Workflow</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TEST RUNNER TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-3 font-sans">
            {!testResults ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No test suites run yet. Click "Run Tests" in the top toolbar.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-bg-border text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">Results:</span>
                    <span className="text-emerald-400 font-semibold">{testResults.passed} Passed</span>
                    <span className="text-rose-400 font-semibold">{testResults.failed} Failed</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{testResults.durationMs}ms</span>
                </div>

                <div className="space-y-1.5">
                  {testResults.results.map((res) => (
                    <div
                      key={res.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        res.passed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {res.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className="font-medium">{res.name}</span>
                        {res.error && (
                          <span className="text-[11px] text-rose-400 font-mono ml-2">({res.error})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{res.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* DEBUG TIMELINE TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3 font-sans">
            {debugHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No debug sessions recorded yet. AI debugging sessions will be logged here.
              </div>
            ) : (
              debugHistory.map((sess) => (
                <div key={sess.id} className="p-3 rounded-lg bg-bg-surface border border-bg-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sess.diagnosis.errorType}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(sess.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{sess.diagnosis.summary}</p>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-mono ${
                      sess.status === 'applied' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      Patch: {sess.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400">
                      Verification: <strong className="text-cyan-400">{sess.verificationStatus}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

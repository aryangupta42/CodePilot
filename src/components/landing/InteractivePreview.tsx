import React, { useState } from 'react';
import { Play, Check, RotateCcw, Sparkles, Terminal, FileCode, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const InteractivePreview: React.FC = () => {
  const [stage, setStage] = useState<'error' | 'analyzing' | 'fixed'>('error');
  const [activeTab, setActiveTab] = useState<'editor' | 'diff' | 'terminal'>('editor');

  const handleFix = () => {
    setStage('analyzing');
    setTimeout(() => {
      setStage('fixed');
      setActiveTab('diff');
    }, 800);
  };

  const handleReset = () => {
    setStage('error');
    setActiveTab('editor');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="rounded-2xl border border-bg-border bg-bg-base/90 shadow-panel overflow-hidden">
        {/* IDE Mock Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-darkest border-b border-bg-border">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">demo-project / app.js</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'editor' ? 'bg-bg-card text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3 h-3 inline mr-1" />
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'terminal' ? 'bg-bg-card text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3 inline mr-1" />
              Terminal & Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'diff' ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1 text-cyan-400" />
              AI Safe Fix
            </button>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'fixed' ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-bg-surface hover:bg-bg-card text-slate-300 border border-bg-border"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            ) : (
              <button
                onClick={handleFix}
                disabled={stage === 'analyzing'}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium shadow-glow-brand"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{stage === 'analyzing' ? 'Analyzing...' : 'Run & Auto-Diagnose'}</span>
              </button>
            )}
          </div>
        </div>

        {/* IDE Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
          {/* Main Code View (7 cols) */}
          <div className="lg:col-span-7 p-4 font-mono text-xs leading-relaxed border-b lg:border-b-0 lg:border-r border-bg-border overflow-x-auto bg-[#0A0D14]">
            {activeTab === 'editor' && (
              <div className="space-y-1">
                <div className="text-slate-500">// Interactive Calculator Logic</div>
                <div className="text-slate-300">function updateDisplay(val) {'{'}</div>
                <div className="text-slate-500 pl-4">// Searching for the display element in DOM</div>
                <div className={`pl-4 py-0.5 rounded transition-colors ${stage === 'fixed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                  {stage === 'fixed' ? (
                    <span>const screen = document.getElementById(<span className="text-cyan-300">'calc-screen'</span>); // ✓ Verified Match</span>
                  ) : (
                    <span>const screen = document.getElementById(<span className="text-rose-400">'calc-display'</span>); // ✖ Error: returns null</span>
                  )}
                </div>
                <div className="text-slate-300 pl-4">screen.textContent = val;</div>
                <div className="text-slate-300">{'}'}</div>
                <div className="text-slate-500 mt-4">// Execution call</div>
                <div className="text-slate-300">updateDisplay('0');</div>
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="space-y-2">
                <div className="text-xs text-brand-300 font-semibold mb-2 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Proposed Safe Patch: app.js
                </div>
                <div className="p-2 rounded bg-rose-950/40 border-l-4 border-rose-500 text-rose-300 font-mono">
                  - const screen = document.getElementById('calc-display');
                </div>
                <div className="p-2 rounded bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-300 font-mono">
                  + const screen = document.getElementById('calc-screen');
                </div>
                <p className="text-slate-400 text-[11px] font-sans mt-3">
                  <strong>Explanation:</strong> The HTML markup defined <code>id="calc-screen"</code>. The selector was updated to match the existing DOM element, preventing a null reference error.
                </p>
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="space-y-2 font-mono text-[11px]">
                <div className="text-slate-400">[CodePilot Runtime] Initializing browser sandbox...</div>
                {stage === 'fixed' ? (
                  <>
                    <div className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Screen element initialized. Current display: "0"</span>
                    </div>
                    <div className="text-cyan-400">Execution completed with exit code 0. Tests: 1 Passed.</div>
                  </>
                ) : (
                  <>
                    <div className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Uncaught TypeError: Cannot set properties of null (setting 'textContent')</span>
                    </div>
                    <div className="text-slate-500 pl-4">at updateDisplay (app.js:4:10)</div>
                    <div className="text-slate-500 pl-4">at app.js:8:1</div>
                    <div className="text-brand-400 mt-2">→ Click "AI Safe Fix" to inspect the root cause.</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* AI Diagnostic Panel (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-bg-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Diagnostic Radar
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  stage === 'fixed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {stage === 'fixed' ? 'Verified Passed' : 'Active Bug Detected'}
                </span>
              </div>

              {stage === 'error' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-bg-darkest border border-rose-500/30">
                    <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Root Cause: Element ID Mismatch
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      <code>document.getElementById('calc-display')</code> returned <code>null</code> because the DOM element is named <code>calc-screen</code>.
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Confidence:</span> 98% Confirmed Cause
                  </div>
                </div>
              )}

              {stage === 'analyzing' && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Sparkles className="w-6 h-6 text-brand-400 animate-spin mx-auto mb-2" />
                  Generating verified patch and test assertions...
                </div>
              )}

              {stage === 'fixed' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-bg-darkest border border-emerald-500/30">
                    <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Patch Verified & Tests Passed
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      The fix was applied safely. Runtime re-execution completed with 0 errors. Original revision backed up for 1-click rollback.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-bg-border">
              {stage === 'fixed' ? (
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" /> Ready to Deploy
                  </span>
                  <button onClick={handleReset} className="text-slate-400 hover:text-white underline text-[11px]">
                    Try another demo
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFix}
                  disabled={stage === 'analyzing'}
                  className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-glow-brand"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Review AI Patch & Auto-Verify</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

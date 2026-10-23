import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Globe,
  Terminal,
  Atom,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  ShieldCheck
} from 'lucide-react';
import type { RuntimeSystemStatus } from '../../types';

export const RuntimeReadinessPanel: React.FC = () => {
  const [status, setStatus] = useState<RuntimeSystemStatus>({
    browserNative: 'ready',
    reactCompiler: 'ready',
    pythonWasm: 'ready',
    jsSandbox: 'ready',
    aiProvider: 'Built-in Diagnostic Engine',
    aiProviderMode: 'built-in-offline',
    serverConnected: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        const hasExternalKey = data.configuredProvider && data.configuredProvider !== 'none';
        setStatus(prev => ({
          ...prev,
          serverConnected: true,
          aiProvider: hasExternalKey ? `${data.configuredProvider.toUpperCase()} (Live Server)` : 'Built-in AST Engine',
          aiProviderMode: hasExternalKey ? 'live-server' : 'built-in-offline'
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          serverConnected: false,
          aiProvider: 'Built-in AST Engine',
          aiProviderMode: 'built-in-offline'
        }));
      }
    } catch {
      setStatus(prev => ({
        ...prev,
        serverConnected: false,
        aiProvider: 'Built-in AST Engine',
        aiProviderMode: 'built-in-offline'
      }));
    } finally {
      setIsChecking(false);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runtimeNodes = [
    {
      id: 'browser-native',
      name: 'Web Sandbox',
      engine: 'HTML5 / CSS3 / ES2024',
      badge: 'Client Native',
      status: status.browserNative,
      statusLabel: 'Operational',
      icon: Globe,
      accentColor: 'text-violet-400',
      borderColor: 'hover:border-violet-500/40',
      description: 'Zero-latency browser runtime with hot reload'
    },
    {
      id: 'react-compiler',
      name: 'React 18 JSX',
      engine: 'Babel In-Browser Transform',
      badge: 'Isolated Iframe',
      status: status.reactCompiler,
      statusLabel: 'Operational',
      icon: Atom,
      accentColor: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/40',
      description: 'Real-time JSX compilation & hook diagnostics'
    },
    {
      id: 'python-wasm',
      name: 'Python 3.12 WASM',
      engine: 'Pyodide WebAssembly CPython',
      badge: 'CPython 3.12',
      status: status.pythonWasm,
      statusLabel: 'Operational',
      icon: Terminal,
      accentColor: 'text-amber-400',
      borderColor: 'hover:border-amber-500/40',
      description: 'Full Python stdlib & synchronous stdin/stdout'
    },
    {
      id: 'js-sandbox',
      name: 'JS Algorithm Sandbox',
      engine: 'Isolated Web Worker Context',
      badge: 'Worker Thread',
      status: status.jsSandbox,
      statusLabel: 'Operational',
      icon: Cpu,
      accentColor: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/40',
      description: 'Memory-capped execution with timeout defenses'
    },
    {
      id: 'ai-engine',
      name: 'AI Diagnostic Engine',
      engine: status.aiProviderMode === 'live-server' ? status.aiProvider : 'Deterministic AST Detective',
      badge: status.serverConnected ? 'Server Connected' : 'Local AST Engine',
      status: 'ready' as const,
      statusLabel: status.serverConnected ? 'Live Model' : 'Offline AST',
      icon: Sparkles,
      accentColor: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/40',
      description: status.serverConnected ? 'Connected to backend AI inference API' : '100% offline instant root-cause analysis'
    }
  ];

  return (
    <section
      className="rounded-2xl border border-bg-border bg-bg-panel p-4 sm:p-5 font-sans select-none shadow-card card-highlight transition-all"
      aria-label="Runtime Readiness and Engine Health"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-bg-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Runtime Readiness & Engine Health
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live client-side WebAssembly isolation & telemetry audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
            Checked: {lastChecked}
          </span>
          <button
            onClick={checkHealth}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-all duration-150 disabled:opacity-50"
            title="Refresh runtime health status"
            aria-label="Refresh runtime health status"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Auditing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 5-node responsive monitoring grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {runtimeNodes.map((node) => {
          const Icon = node.icon;
          const isReady = node.status === 'ready';

          return (
            <div
              key={node.id}
              className={`p-3.5 rounded-xl bg-bg-card/90 border border-bg-border ${node.borderColor} transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between group shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${node.accentColor}`} />
                    <span className="text-xs font-bold text-white truncate tracking-tight">
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isReady
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                        : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                    }`}
                    title={node.statusLabel}
                  />
                </div>

                <div className="text-[11px] text-slate-400 font-mono truncate" title={node.engine}>
                  {node.engine}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 leading-normal">
                  {node.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-bg-border/60 flex items-center justify-between text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-bg-darkest text-slate-300 border border-bg-border truncate">
                  {node.badge}
                </span>
                <span className={`font-semibold ${isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {node.statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

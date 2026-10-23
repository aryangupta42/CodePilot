import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DebugSession, Project } from '../../types';
import { getAllProjects, getDebugSessions } from '../../services/storage';
import {
  Sparkles,
  Bug,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileCode,
  Terminal,
  Play
} from 'lucide-react';

export const AiDebugCenterView: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const projs = await getAllProjects();
      setProjects(projs);
      
      let allSessions: DebugSession[] = [];
      for (const p of projs) {
        const sess = await getDebugSessions(p.id);
        allSessions = [...allSessions, ...sess];
      }
      setSessions(allSessions.sort((a, b) => b.timestamp - a.timestamp));
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Banner for AI Debug Center */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-bg-surface via-bg-surface to-brand-950/30 border border-brand-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Error Detective & Safe Patching</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            AI Debug & Verification Command Center
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Every runtime error is trapped, diagnosed down to root cause, turned into a colored diff patch, and verified with real test assertions.
          </p>
        </div>

        <button
          onClick={() => navigate('/ide/demo-buggy-calculator')}
          className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-brand flex items-center gap-2 transition-all"
        >
          <Bug className="w-4 h-4 text-rose-300" />
          <span>Launch Calculator Bug Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Diagnostic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-bg-surface border border-bg-border">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">
            Protected Workspaces
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {projects.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero silent file overwrites</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-bg-border">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">
            Logged Diagnoses
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {sessions.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across active sessions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-bg-border">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">
            Verified Patches
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {sessions.filter(s => s.verificationStatus === 'verified_passed').length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Confirmed by test runners
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-bg-border">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">
            AI Engine Latency
          </div>
          <div className="text-2xl font-bold font-mono text-brand-300">
            &lt; 50ms
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Client-side AST processing
          </div>
        </div>
      </div>

      {/* Debug Sessions History List */}
      <div className="rounded-2xl border border-bg-border bg-bg-surface p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-bg-border">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bug className="w-4 h-4 text-cyan-400" />
            <span>Historical Diagnostic Investigations & Verified Patches</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {sessions.length} Recorded Sessions
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            Loading persistent debug records...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-bg-darkest flex items-center justify-center mx-auto text-brand-400 border border-bg-border">
              <Sparkles className="w-5 h-5" />
            </div>
            <p>No bugs diagnosed yet.</p>
            <p className="text-[11px] text-slate-500">
              Run the Calculator demo or trigger a runtime error in any project to see the AI Detective in action.
            </p>
            <button
              onClick={() => navigate('/ide/demo-buggy-calculator')}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-brand"
            >
              Open Bug Demo IDE
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-bg-darkest border border-bg-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {sess.diagnosis.errorType}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface text-slate-400 border border-bg-border">
                      {sess.diagnosis.file}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                      {sess.diagnosis.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {sess.diagnosis.summary}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Root Cause: {sess.diagnosis.likelyRootCause}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 ${
                    sess.verificationStatus === 'verified_passed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {sess.verificationStatus === 'verified_passed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{sess.verificationStatus === 'verified_passed' ? 'Verified Passed' : 'Failed'}</span>
                  </span>

                  <button
                    onClick={() => navigate(`/ide/${sess.projectId}`)}
                    className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-card border border-bg-border text-slate-200 hover:text-white transition-colors"
                  >
                    Open IDE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

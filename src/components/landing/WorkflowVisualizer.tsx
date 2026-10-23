import React from 'react';
import { PenTool, Play, AlertCircle, Search, FileDiff, CheckCircle, RefreshCw, BadgeCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Write or Import',
    desc: 'Start with blank templates, upload a ZIP, or paste a public GitHub URL.',
    icon: PenTool,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30'
  },
  {
    step: '02',
    title: 'Instant Run',
    desc: 'Execute code natively in-browser with sandboxed iframe, React compiler, or Python WASM.',
    icon: Play,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30'
  },
  {
    step: '03',
    title: 'Catch Runtime Error',
    desc: 'Capture exact stack traces, line numbers, and uncaught exceptions with zero guesswork.',
    icon: AlertCircle,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30'
  },
  {
    step: '04',
    title: 'Understand Root Cause',
    desc: 'AI analyzes the AST, DOM, and variable scopes to pinpoint why the failure occurred.',
    icon: Search,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  {
    step: '05',
    title: 'Review Safe Diff',
    desc: 'Inspect exact additions and deletions in a side-by-side or unified diff before touching files.',
    icon: FileDiff,
    color: 'text-brand-400',
    borderColor: 'border-brand-500/30'
  },
  {
    step: '06',
    title: 'User Approval',
    desc: 'You stay in control. Accept or reject the patch. Automatic revision rollback point saved.',
    icon: CheckCircle,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30'
  },
  {
    step: '07',
    title: 'Rerun Tests',
    desc: 'Automated test suite executes immediately against the newly patched file.',
    icon: RefreshCw,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30'
  },
  {
    step: '08',
    title: 'Verify Results',
    desc: 'Status turns green only when real assertions pass. Truthful, verified outcomes only.',
    icon: BadgeCheck,
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/40'
  }
];

export const WorkflowVisualizer: React.FC = () => {
  return (
    <section id="workflow" className="py-20 bg-bg-darkest relative border-y border-bg-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            The CodePilot Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            From Bug to Verified Fix in 8 Transparent Steps
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Unlike chatbots that spit out unverified code snippets you must manually copy-paste, CodePilot orchestrates a closed-loop verification pipeline directly inside your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative p-6 rounded-xl bg-bg-surface/80 border ${item.borderColor} hover:border-brand-500/50 transition-all hover:-translate-y-1 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-bg-darkest flex items-center justify-center ${item.color} border border-bg-border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-slate-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { BookOpen, Zap, Layers, Sparkles } from 'lucide-react';

const useCases = [
  {
    icon: BookOpen,
    role: 'Students & Beginners',
    title: 'Learn Concepts, Don\'t Just Copy Code',
    description: 'Avoid getting stuck on setup errors or cryptic console tracebacks. CodePilot breaks down why a bug happened and guides you step-by-step through core computing concepts.',
    tag: 'Education'
  },
  {
    icon: Zap,
    role: 'Hackathon Teams',
    title: 'Prototype at Warp Speed',
    description: 'Eliminate 30 minutes of npm install, webpack configurations, and environment version mismatches. Spin up web or Python projects in 2 seconds and iterate collaboratively.',
    tag: 'Speed'
  },
  {
    icon: Layers,
    role: 'Full-Stack Developers',
    title: 'Safe AI Refactoring & Quick Tests',
    description: 'Use CodePilot as a sandbox to test algorithms, reproduce edge cases, and inspect proposed patches with colored diffs before merging into production codebases.',
    tag: 'Productivity'
  },
  {
    icon: Sparkles,
    role: 'Code Interviewees & Algorithmic Practice',
    title: 'Immediate Test Assertion Feedback',
    description: 'Solve binary search, sorting, and data structure challenges with instant automated test runner verification and Python 3 WebAssembly speed.',
    tag: 'Mastery'
  }
];

export const UseCases: React.FC = () => {
  return (
    <section id="use-cases" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-bg-border/60">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Target Audience
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          Built for Everyone Who Codes
        </h2>
        <p className="mt-4 text-slate-400 text-base">
          From the first time writing an HTML tag to validating complex algorithmic implementations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {useCases.map((uc, idx) => {
          const Icon = uc.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-bg-surface/50 border border-bg-border hover:border-brand-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-bg-darkest flex items-center justify-center text-brand-400 border border-bg-border">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {uc.tag}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {uc.role}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{uc.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{uc.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

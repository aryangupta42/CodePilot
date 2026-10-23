import React from 'react';
import { Globe, Bug, ShieldCheck, CheckSquare, GraduationCap, FolderArchive, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Globe,
    title: 'Browser-Based Coding',
    description: 'Instant zero-setup workspace. Code web apps with live preview, React 18 with reactive JSX rendering, and genuine Python 3 WebAssembly powered by Pyodide.',
    badge: 'Zero Config',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Bug,
    title: 'Context-Aware AI Debugging',
    description: 'Instead of generic ChatGPT suggestions, CodePilot inspects your exact project structure, active file content, DOM attributes, and runtime error stack traces.',
    badge: 'AST Aware',
    color: 'from-brand-500 to-indigo-600'
  },
  {
    icon: ShieldCheck,
    title: 'Safe Code Fixes & Diffs',
    description: 'Never let AI silently overwrite your code. Inspect colored line additions and removals in a clear diff viewer, approve changes, or roll back at any time.',
    badge: 'User Approved',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: CheckSquare,
    title: 'Automated Verification',
    description: 'An AI response is not proof that code works. CodePilot re-runs real browser execution and test suites to verify that the error was genuinely resolved.',
    badge: 'Guaranteed Test',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: GraduationCap,
    title: 'Learn-by-Debugging',
    description: 'Tailored for students and beginners. Every bug explains the underlying programming concept, what went wrong, and includes interactive mini-challenges.',
    badge: 'Educational',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FolderArchive,
    title: 'Project Import & Export',
    description: 'Import existing ZIP projects with automatic path traversal protection, or pull public GitHub repositories. Export clean ZIP archives anytime with 1 click.',
    badge: 'Portable',
    color: 'from-cyan-500 to-blue-600'
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          Everything You Need to Build, Debug & Ship
        </h2>
        <p className="mt-4 text-slate-400 text-base">
          Engineered for developers who value transparent AI assistance over opaque black-box code generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-bg-surface border border-bg-border hover:border-brand-500/40 transition-all hover:shadow-glow-brand group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-[1px]`}>
                    <div className="w-full h-full bg-bg-darkest rounded-[11px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-bg-darkest text-slate-400 border border-bg-border">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-bg-border flex items-center justify-between text-xs font-medium text-brand-400 group-hover:text-cyan-300">
                <Link to="/dashboard" className="flex items-center gap-1">
                  <span>Explore in Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

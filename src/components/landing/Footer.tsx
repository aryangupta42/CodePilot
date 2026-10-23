import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, GitBranch, Terminal, Heart, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-bg-border bg-bg-darkest py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-bg-darkest rounded-[7px] flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-white text-base">CodePilot AI</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-4">
              Code Anywhere. Debug Intelligently. Build Without Setup. The developer-first browser IDE with transparent AI debugging and safe patch verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated Sandboxed Execution • Zero Arbitrary Host Access</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Workspaces & Templates
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/ide/demo-buggy-calculator" className="hover:text-white transition-colors">
                  Interactive Calculator (Bug Demo)
                </Link>
              </li>
              <li>
                <Link to="/ide/demo-python-data" className="hover:text-white transition-colors">
                  Python 3 (Pyodide WASM)
                </Link>
              </li>
              <li>
                <Link to="/ide/demo-react-tasks" className="hover:text-white transition-colors">
                  React 18 Task Pilot
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  View All Project Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Platform & Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  Verification Pipeline
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Import ZIP Archive
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Import GitHub Repository
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-mono">Pyodide WASM + Web Preview Ready</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-bg-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} CodePilot AI. Built for the Developer Community.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-current" /> for developers
            </span>
            <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch IDE</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

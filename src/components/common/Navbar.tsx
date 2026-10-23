import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Sparkles, Terminal, ArrowRight, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-border/80 bg-bg-darkest/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1px] shadow-glow-brand transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-bg-darkest rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-brand-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">CodePilot</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/#workflow" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            How It Works
          </Link>
          <Link to="/#use-cases" className="hover:text-white transition-colors">
            Use Cases
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Projects
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          {isDashboard ? (
            <Link
              to="/ide/demo-buggy-calculator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-glow-brand"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Demo IDE</span>
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-bg-surface transition-colors border border-bg-border"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold transition-all shadow-glow-brand"
              >
                <span>Start Coding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

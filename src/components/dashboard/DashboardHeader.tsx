import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Search,
  ChevronDown,
  Terminal,
  Settings,
  Layers,
  Check,
  Zap
} from 'lucide-react';

interface DashboardHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenCommandPalette,
  onOpenSettings,
  searchQuery,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState('Personal Dev Workspace');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const workspaces = [
    'Personal Dev Workspace',
    'National Hackathon Team 2026',
    'Education & CS Labs'
  ];

  return (
    <header className="h-14 bg-bg-panel/95 backdrop-blur-md border-b border-bg-border card-highlight flex items-center justify-between px-4 sm:px-6 z-30 shrink-0 select-none transition-colors">
      {/* Left: Brand Logo + Workspace Selector */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 p-[1px] shadow-glow-brand transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-bg-canvas rounded-[7px] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-brand-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-slate-100 transition-colors">
              CodePilot
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
              AI
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-bg-border mx-2 hidden sm:block" />

        {/* Workspace Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-card/70 hover:bg-bg-card border border-bg-border hover:border-bg-borderHover text-xs text-slate-200 transition-all card-highlight"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium truncate max-w-[150px]">{workspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 top-10 z-50 w-60 rounded-xl bg-bg-card border border-bg-border shadow-dropdown py-1.5 text-xs text-slate-300 card-highlight">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Switch Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setWorkspace(ws);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-bg-cardHover flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{ws}</span>
                  {workspace === ws && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search & Command Palette Trigger */}
      <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, files, or languages..."
            className="w-full pl-9 pr-14 py-1.5 rounded-lg bg-bg-card/60 hover:bg-bg-card border border-bg-border hover:border-bg-borderHover focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/40 text-xs text-white placeholder-slate-400 focus:outline-none transition-all card-highlight"
          />
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-bg-panel text-[10px] font-mono text-slate-400 hover:text-white border border-bg-border transition-colors"
            title="Command Palette (Ctrl + K)"
          >
            <span>⌘K</span>
          </button>
        </div>
      </div>

      {/* Right: Runtime Pill, Settings & Launch Demo IDE */}
      <div className="flex items-center gap-2.5">
        {/* Runtime Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>WASM & Web Runtimes Ready</span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-bg-card border border-transparent hover:border-bg-border transition-all"
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Start Coding CTA */}
        <button
          onClick={() => navigate('/coding')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
          title="Start Coding (Instant Scratchpad - No Setup)"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Start Coding</span>
          <span className="sm:hidden">Code</span>
        </button>

        {/* Primary IDE Launch CTA */}
        <button
          onClick={() => navigate('/ide/demo-buggy-calculator')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-brand card-highlight transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Launch Demo IDE</span>
          <span className="sm:hidden">IDE</span>
        </button>
      </div>
    </header>
  );
};

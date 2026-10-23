import React from 'react';
import type { WorkspaceTab } from '../../types';
import {
  LayoutDashboard,
  FolderGit2,
  Bug,
  TestTube2,
  History,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  projectCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  projectCount,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderGit2, badge: projectCount },
    { id: 'debug_center', label: 'AI Debug Center', icon: Bug, highlight: true },
    { id: 'tests', label: 'Test & Verification', icon: TestTube2 },
    { id: 'history', label: 'Project History', icon: History },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`bg-bg-panel/95 backdrop-blur-md border-r border-bg-border transition-all duration-300 select-none flex flex-col justify-between shrink-0 z-10 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Top Nav Items */}
      <div className="p-3 space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as WorkspaceTab)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/15 text-white font-semibold shadow-sm border border-brand-500/30'
                  : item.highlight
                  ? 'text-cyan-300/90 hover:bg-bg-card hover:text-white border border-transparent'
                  : 'text-slate-400 hover:bg-bg-card hover:text-slate-200 border border-transparent'
              }`}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-glow-brand" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                  isActive
                    ? 'text-brand-400'
                    : item.highlight
                    ? 'text-cyan-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate tracking-tight">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      isActive 
                        ? 'bg-brand-500/30 text-brand-200 border-brand-500/40' 
                        : 'bg-bg-darkest/80 text-slate-400 border-bg-border'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>AI</span>
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Sandbox Health & Collapse Toggle */}
      <div className="p-3 border-t border-bg-border/80 space-y-2.5">
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-bg-card/70 border border-bg-border text-[11px] space-y-1.5 transition-colors hover:border-bg-borderHover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] uppercase font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sandbox Security</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              100% in-browser WebAssembly isolation. Zero telemetry.
            </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-bg-card border border-transparent hover:border-bg-border transition-all duration-150 text-xs font-medium"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-mono text-slate-400">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

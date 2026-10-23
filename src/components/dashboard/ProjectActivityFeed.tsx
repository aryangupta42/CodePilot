import React, { useState, useEffect } from 'react';
import type { ActivityEvent } from '../../types';
import { getRecentActivities } from '../../services/storage';
import {
  Sparkles,
  FileCode,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  PlusCircle,
  Activity,
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentActivities(15).then(data => {
      setActivities(data);
      setIsLoading(false);
    });
  }, []);

  const getEventIcon = (type: ActivityEvent['type'], status: ActivityEvent['status']) => {
    switch (type) {
      case 'patch_applied':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rollback_applied':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-400" />;
      case 'project_executed':
        return status === 'failure' 
          ? <XCircle className="w-3.5 h-3.5 text-rose-400" />
          : <Play className="w-3.5 h-3.5 text-cyan-400" />;
      case 'test_run':
        return status === 'success'
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          : <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'project_imported':
        return <UploadCloud className="w-3.5 h-3.5 text-brand-400" />;
      case 'file_edited':
        return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
      case 'project_created':
      default:
        return <PlusCircle className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-panel p-4 sm:p-5 font-sans shadow-card card-highlight flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-bg-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center text-brand-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Workspace Activity Log
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit trail of local changes, test runs, and patches.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-bg-darkest text-slate-300 border border-bg-border">
          IndexedDB Audit
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px]">
        {isLoading ? (
          <div className="py-8 text-center text-xs font-mono text-slate-400">Loading activity records...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            No activity recorded yet. Run tests, edit files, or execute AI debugging to view your activity stream.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-bg-card border border-bg-border/80 hover:border-bg-borderHover transition-all flex items-start gap-3 text-xs group"
            >
              <div className="w-7 h-7 rounded-lg bg-bg-darkest border border-bg-border flex items-center justify-center shrink-0 mt-0.5">
                {getEventIcon(act.type, act.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white truncate text-xs group-hover:text-brand-300 transition-colors">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal line-clamp-2">
                  {act.description}
                </p>
                {act.projectId && (
                  <div className="mt-1.5">
                    <Link
                      to={`/ide/${act.projectId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Open {act.projectName || 'Project'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

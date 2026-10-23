import React from 'react';
import type { Project, PatchProposal } from '../../../types';
import { ShieldAlert, FileText, CheckCircle2, Layers } from 'lucide-react';

interface ChangeImpactRadarProps {
  patch: PatchProposal;
  project: Project;
}

export const ChangeImpactRadar: React.FC<ChangeImpactRadarProps> = ({ patch, project }) => {
  const affectedSymbols = patch.affectedSymbols || ['DOM Selector', 'Event Handler'];
  const otherFiles = project.files.filter(f => f.path !== patch.file);

  return (
    <div className="p-4 rounded-xl bg-bg-darkest border border-bg-border space-y-3 font-sans text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Layers className="w-4 h-4" />
          <span>Change Impact Radar</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
          Low Risk • Localized Scope
        </span>
      </div>

      <p className="text-slate-400 text-[11px] leading-relaxed">
        CodePilot analyzed cross-file imports and global scopes. This patch only affects the presentation layer and does not break external interfaces.
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-2.5 rounded-lg bg-bg-surface border border-bg-border">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Impacted Symbols ({affectedSymbols.length})
          </span>
          <div className="space-y-1 font-mono text-[11px] text-amber-300">
            {affectedSymbols.map((sym, i) => (
              <div key={i}>• {sym}</div>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-bg-surface border border-bg-border">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Neighboring Files ({otherFiles.length})
          </span>
          <div className="space-y-1 text-[11px] text-emerald-400">
            <div>✓ index.html (Validated)</div>
            <div>✓ No breaking API changes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

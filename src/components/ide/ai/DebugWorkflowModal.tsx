import React, { useState } from 'react';
import type { StructuredDiagnosis, PatchProposal, VerificationStatus, Project } from '../../../types';
import { generateDiffChunks } from '../../../services/ai/diagnosticEngine';
import { ChangeImpactRadar } from './ChangeImpactRadar';
import {
  X,
  Sparkles,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  ArrowRight,
  Eye,
  Check,
  Layers,
  GraduationCap,
  Lightbulb,
  Columns,
  AlignLeft,
  Search,
  BookOpen
} from 'lucide-react';

interface DebugWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: StructuredDiagnosis;
  patch: PatchProposal;
  project: Project;
  onApplyPatch: (patch: PatchProposal) => Promise<void>;
  onRejectPatch: () => void;
  onRollbackPatch: () => Promise<void>;
  onVerifyFix: () => Promise<boolean>;
  verificationStatus: VerificationStatus;
  verificationMessage?: string;
}

export const DebugWorkflowModal: React.FC<DebugWorkflowModalProps> = ({
  isOpen,
  onClose,
  diagnosis,
  patch,
  project,
  onApplyPatch,
  onRejectPatch,
  onRollbackPatch,
  onVerifyFix,
  verificationStatus,
  verificationMessage
}) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'diff' | 'radar' | 'learning'>('diff');
  const [diffMode, setDiffMode] = useState<'unified' | 'split'>('unified');
  const [isApplying, setIsApplying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const diffChunks = generateDiffChunks(patch.originalCode, patch.proposedCode);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyPatch(patch);
      setIsVerifying(true);
      await onVerifyFix();
    } catch (e) {
      console.error('Failed to apply patch:', e);
    } finally {
      setIsApplying(false);
      setIsVerifying(false);
    }
  };

  const handleRerun = async () => {
    setIsVerifying(true);
    try {
      await onVerifyFix();
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = () => {
    if (verificationStatus === 'verified_passed') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tests Passed • Verified</span>
        </span>
      );
    }
    if (verificationStatus === 'verification_failed') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Verification Failed</span>
        </span>
      );
    }
    if (verificationStatus === 'pending_run') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Patch Applied • Verifying</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Fix Proposed • Awaiting Approval</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-bg-surface border border-bg-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg-darkest shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1px] shadow-glow-brand">
              <div className="w-full h-full bg-bg-darkest rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  AI Debug Detective & Safe Patch Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {diagnosis.confidence}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Target: {patch.file} • Runtime: {project.runtime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-bg-border bg-bg-darkest/70 px-4 gap-2 shrink-0 select-none overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'diff'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code Diff & Patch</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'diagnosis'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Root Cause & Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'radar'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Impact Radar & Files</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'learning'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Learning Concept</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
          {/* TAB 1: CODE DIFF & PATCH */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Proposed Code Patch ({patch.file})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{patch.diffSummary}</p>
                </div>

                <div className="flex items-center gap-1 bg-bg-darkest p-1 rounded-lg border border-bg-border text-xs font-mono">
                  <button
                    onClick={() => setDiffMode('unified')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      diffMode === 'unified' ? 'bg-bg-surface text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <AlignLeft className="w-3 h-3" />
                    <span>Unified</span>
                  </button>
                  <button
                    onClick={() => setDiffMode('split')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      diffMode === 'split' ? 'bg-bg-surface text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>Side-by-Side</span>
                  </button>
                </div>
              </div>

              {/* UNIFIED DIFF VIEW */}
              {diffMode === 'unified' ? (
                <div className="rounded-xl border border-bg-border bg-[#080A0F] font-mono text-xs overflow-hidden max-h-80 overflow-y-auto">
                  {diffChunks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1 flex items-start gap-3 select-text ${
                        chunk.type === 'added'
                          ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                          : chunk.type === 'removed'
                          ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                          : 'text-slate-400 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="w-4 text-center select-none font-bold shrink-0">
                        {chunk.type === 'added' ? '+' : chunk.type === 'removed' ? '-' : ' '}
                      </span>
                      <span className="whitespace-pre-wrap break-all flex-1">{chunk.content}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* SIDE-BY-SIDE SPLIT VIEW */
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-bg-border bg-[#080A0F] p-2 font-mono text-xs max-h-80 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-rose-400 px-2 py-1 bg-rose-950/30 rounded border border-rose-500/20">
                      Original Source
                    </div>
                    <pre className="text-rose-300 whitespace-pre-wrap p-2 text-[11px] leading-relaxed">
                      {patch.originalCode}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-950/30 rounded border border-emerald-500/20">
                      Proposed Verified Patch
                    </div>
                    <pre className="text-emerald-300 whitespace-pre-wrap p-2 text-[11px] leading-relaxed">
                      {patch.proposedCode}
                    </pre>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-bg-darkest border border-bg-border text-xs space-y-1">
                <span className="font-semibold text-slate-300">Technical Rationale:</span>
                <p className="text-slate-400 leading-relaxed">{patch.explanation}</p>
              </div>
            </div>
          )}

          {/* TAB 2: ROOT CAUSE & EVIDENCE */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-bg-darkest border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{diagnosis.errorType}</span>
                </div>
                <div className="text-sm font-mono text-white bg-bg-surface p-2.5 rounded-lg border border-bg-border">
                  {diagnosis.summary}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Origin: {diagnosis.file}{diagnosis.line ? ` (Line ${diagnosis.line})` : ''}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-darkest border border-bg-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Root Cause Investigation
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.likelyRootCause}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg-darkest border border-bg-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mechanism of Failure
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {diagnosis.whyItOccurs}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: IMPACT RADAR */}
          {activeTab === 'radar' && (
            <ChangeImpactRadar patch={patch} project={project} />
          )}

          {/* TAB 4: LEARNING CONCEPT */}
          {activeTab === 'learning' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-bg-darkest border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Educational Deep-Dive</span>
                </div>
                <h4 className="text-sm font-bold text-white">DOM Traversal & Null Safety</h4>
                <p className="text-slate-300 leading-relaxed">
                  In JavaScript, DOM element lookup functions like <code className="text-cyan-300">document.getElementById</code> perform an exact case-sensitive lookup on document trees. If no matching ID exists, the browser returns <code className="text-rose-400">null</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg-darkest border border-bg-border space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to Prevent This Bug in Production:</span>
                </div>
                <ul className="space-y-1.5 text-slate-400 pl-4 list-disc">
                  <li>Use defensive checks: <code className="text-slate-300">if (!element) return;</code></li>
                  <li>Use modern optional chaining: <code className="text-slate-300">element?.textContent = 'value';</code></li>
                  <li>Enable TypeScript strict DOM null checks.</li>
                </ul>
              </div>
            </div>
          )}

          {/* VERIFICATION OUTCOME BANNER (IF APPLIED) */}
          {verificationStatus !== 'idle' && (
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              verificationStatus === 'verified_passed'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : verificationStatus === 'verification_failed'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-bg-darkest border-bg-border text-slate-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {verificationStatus === 'verified_passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : verificationStatus === 'verification_failed' ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {verificationStatus === 'verified_passed'
                      ? 'Fix Verified & Confirmed Working!'
                      : verificationStatus === 'verification_failed'
                      ? 'Verification Failed'
                      : 'Executing Tests...'}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                    {verificationMessage || 'Runtime re-executed with zero uncaught exceptions. Element IDs aligned.'}
                  </div>
                </div>
              </div>

              <button
                onClick={onRollbackPatch}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-card border border-bg-border text-xs text-slate-300 transition-colors"
                title="Rollback to original code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert Change</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="px-6 py-4 bg-bg-darkest border-t border-bg-border flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onRejectPatch();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-bg-card border border-bg-border transition-colors"
          >
            Reject Fix
          </button>

          <div className="flex items-center gap-3">
            {verificationStatus !== 'verified_passed' ? (
              <button
                onClick={handleApply}
                disabled={isApplying || isVerifying}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow-cyan flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isApplying || isVerifying ? 'Applying & Verifying...' : 'Approve & Auto-Verify'}</span>
              </button>
            ) : (
              <button
                onClick={handleRerun}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-brand flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Rerun Tests Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

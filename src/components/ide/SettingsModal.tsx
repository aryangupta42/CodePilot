import React, { useState, useEffect } from 'react';
import { X, Settings, ShieldCheck, Server, Check } from 'lucide-react';
import type { AiSettings } from '../../types';
import { getAiSettings, saveAiSettings } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AiSettings>({
    provider: 'demo',
    useDemoMode: true,
    serverUrl: '/api'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAiSettings().then(setSettings);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAiSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-bg-panel border border-bg-border rounded-2xl shadow-dropdown overflow-hidden card-highlight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-bg-border bg-bg-panel">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Workspace & AI Settings</h2>
              <p className="text-[11px] text-slate-400">Manage client-side diagnostic engines & API routing.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bg-card transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs font-sans">
          {/* AI Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              AI Diagnostic Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSettings({ ...settings, useDemoMode: true, provider: 'demo' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  settings.useDemoMode
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-sm'
                    : 'bg-bg-card border-bg-border text-slate-400 hover:bg-bg-cardHover hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1 text-sm text-white tracking-tight">
                  <span>Built-in AST Engine</span>
                  {settings.useDemoMode && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deterministic offline AST & rule-based engine. 100% private, no API key needed.
                </p>
              </div>

              <div
                onClick={() => setSettings({ ...settings, useDemoMode: false, provider: 'gemini' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  !settings.useDemoMode
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-sm'
                    : 'bg-bg-card border-bg-border text-slate-400 hover:bg-bg-cardHover hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1 text-sm text-white tracking-tight">
                  <span>Live Server API</span>
                  {!settings.useDemoMode && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Proxies to Gemini or OpenAI using server environment keys.
                </p>
              </div>
            </div>
          </div>

          {/* Backend Proxy Information */}
          <div className="p-4 rounded-xl bg-bg-card border border-bg-border space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Backend Endpoint Configuration</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              For security, external provider API keys are read on the server via <code className="text-cyan-300 font-mono">process.env.GEMINI_API_KEY</code> and never exposed to client-side scripts.
            </p>
            <div className="pt-2">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                API Proxy URL
              </label>
              <input
                type="text"
                value={settings.serverUrl || '/api'}
                onChange={(e) => setSettings({ ...settings, serverUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-bg-darkest border border-bg-border text-white font-mono text-xs outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Security & Isolation Notice */}
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Isolated browser execution sandbox. Your local credentials remain secure.</span>
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-bg-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

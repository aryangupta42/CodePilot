import React, { useState } from 'react';
import type { Project, AiMode, ChatMessage } from '../../../types';
import { processAiRequest } from '../../../services/ai/aiService';
import {
  Sparkles,
  Send,
  HelpCircle,
  FileQuestion,
  Bug,
  Wrench,
  TestTube2,
  GraduationCap,
  X,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AiPanelProps {
  project: Project;
  activeFilePath?: string;
  onClose: () => void;
  onOpenDebugWorkflow: (errorMessage: string, stack?: string) => void;
  onOpenLearnConcept: (concept: any) => void;
}

const modes: Array<{ id: AiMode; label: string; icon: React.ElementType }> = [
  { id: 'ask', label: 'Ask', icon: HelpCircle },
  { id: 'explain', label: 'Explain', icon: FileQuestion },
  { id: 'debug', label: 'Debug', icon: Bug },
  { id: 'fix', label: 'Fix', icon: Wrench },
  { id: 'test', label: 'Test', icon: TestTube2 },
  { id: 'learn', label: 'Learn', icon: GraduationCap }
];

export const AiPanel: React.FC<AiPanelProps> = ({
  project,
  activeFilePath,
  onClose,
  onOpenDebugWorkflow,
  onOpenLearnConcept
}) => {
  const [selectedMode, setSelectedMode] = useState<AiMode>('ask');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am **CodePilot AI**, your context-aware pair programmer.\n\nI have full awareness of **${project.name}** (${project.files.length} files). Click a mode above or ask me anything!`,
      timestamp: Date.now()
    }
  ]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && selectedMode === 'ask') return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend || `Execute ${selectedMode} for ${activeFilePath || 'project'}`,
      timestamp: Date.now(),
      mode: selectedMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await processAiRequest(
        selectedMode,
        textToSend,
        project,
        activeFilePath
      );

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        mode: selectedMode,
        diagnosis: response.diagnosis,
        patch: response.patch,
        status: response.source === 'live-api' ? 'Live Gemini / OpenAI' : 'Built-in Diagnostic Engine'
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If response includes learning concept, offer learning modal
      if (response.learningConcept) {
        onOpenLearnConcept(response.learningConcept);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `AI Engine Notice: ${e.message || 'Error executing request'}`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-bg-darkest border-l border-bg-border flex flex-col h-full select-none shrink-0 z-20">
      {/* Header */}
      <div className="h-12 bg-bg-darkest border-b border-bg-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-6 border-b border-bg-border bg-bg-surface/50 p-1 gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMode(m.id);
                if (m.id === 'explain' || m.id === 'learn' || m.id === 'test' || m.id === 'debug') {
                  handleSend(`Run ${m.id} on ${activeFilePath}`);
                }
              }}
              className={`py-1.5 rounded flex flex-col items-center justify-center text-[10px] font-medium transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-bg-surface'
              }`}
              title={m.label}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1.5 ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="font-semibold text-slate-300">CodePilot</span>
                  {msg.status && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-bg-surface text-slate-400 font-mono">
                      {msg.status}
                    </span>
                  )}
                </>
              )}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[95%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-bg-surface border border-bg-border text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* If message returned a patch, offer 1-click modal */}
              {msg.patch && (
                <div className="mt-3 pt-2 border-t border-bg-border flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Safe Diff Generated</span>
                  <button
                    onClick={() => onOpenDebugWorkflow(msg.diagnosis?.summary || 'Runtime Bug')}
                    className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Review & Verify Fix</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-brand-300 p-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI analyzing workspace AST and context...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-bg-border bg-bg-darkest">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask or instruct AI (${selectedMode})...`}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-surface border border-bg-border text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors shadow-glow-brand"
            title="Send prompt"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};

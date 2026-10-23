import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, HelpCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface LearnDebuggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept?: {
    topic: string;
    whatWentWrong: string;
    whyItHappened: string;
    howToPrevent: string;
    practiceChallenge: string;
  };
}

export const LearnDebuggerModal: React.FC<LearnDebuggerModalProps> = ({
  isOpen,
  onClose,
  concept
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  if (!isOpen) return null;

  const defaultConcept = {
    topic: 'DOM Element Selection & Null Safety',
    whatWentWrong: "A method (document.getElementById) was called, and when it found no match it returned null. Code then immediately attempted to write '.textContent' onto null.",
    whyItHappened: 'HTML and JavaScript ID identifiers were out of sync ("calc-screen" vs "calc-display").',
    howToPrevent: 'Always verify element IDs or use optional chaining (e.g. element?.textContent) and defensive guard clauses.',
    practiceChallenge: 'Which statement safely guards against null before accessing a property?'
  };

  const current = concept || defaultConcept;

  const quizOptions = [
    { text: 'element.textContent = "Hello";', correct: false },
    { text: 'if (element) { element.textContent = "Hello"; }', correct: true },
    { text: 'const element = document.getElementById("unknown");', correct: false }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-bg-surface border border-bg-border rounded-2xl shadow-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg-darkest">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Learn-by-Debugging</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs font-sans">
          <div className="p-4 rounded-xl bg-bg-darkest border border-indigo-500/20 space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Core Concept
            </span>
            <h3 className="text-sm font-bold text-white">{current.topic}</h3>
            <p className="text-slate-300 leading-relaxed">{current.whatWentWrong}</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Why It Happened</span>
              </div>
              <p className="text-slate-400 leading-relaxed pl-5">{current.whyItHappened}</p>
            </div>

            <div>
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>How to Prevent It in the Future</span>
              </div>
              <p className="text-slate-400 leading-relaxed pl-5">{current.howToPrevent}</p>
            </div>
          </div>

          {/* Interactive Mini-Quiz */}
          <div className="pt-4 border-t border-bg-border space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Practice Challenge</span>
            </div>
            <p className="text-slate-300">{current.practiceChallenge}</p>

            <div className="space-y-2">
              {quizOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAnswer(idx);
                    setShowAnswerFeedback(true);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                    showAnswerFeedback && opt.correct
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : showAnswerFeedback && selectedAnswer === idx && !opt.correct
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                      : 'bg-bg-darkest hover:bg-bg-card border-bg-border text-slate-300'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {showAnswerFeedback && (
              <div className="p-3 rounded-lg bg-bg-darkest text-slate-300 text-xs flex items-center gap-2">
                {quizOptions[selectedAnswer || 0]?.correct ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Correct! Guard checks guarantee that the code will never crash on null.</span>
                  </>
                ) : (
                  <span>Check again: Look for the statement that tests if element exists before setting text.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-bg-darkest border-t border-bg-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-brand"
          >
            Done Learning
          </button>
        </div>
      </div>
    </div>
  );
};

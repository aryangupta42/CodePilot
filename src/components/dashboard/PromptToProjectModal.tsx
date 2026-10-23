import React, { useState } from 'react';
import { X, Wand2, Sparkles, FileCode, ArrowRight } from 'lucide-react';
import type { Project, ProjectFile } from '../../types';
import { saveProject } from '../../services/storage';
import { useNavigate } from 'react-router-dom';

interface PromptToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const PromptToProjectModal: React.FC<PromptToProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<ProjectFile[] | null>(null);
  const [generatedName, setGeneratedName] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setIsGenerating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    // Synthesize structured starter project based on keywords
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let name = 'AI Generated App';
      let files: ProjectFile[] = [];

      if (lower.includes('stopwatch') || lower.includes('timer')) {
        name = 'Precision Lap Stopwatch';
        files = [
          {
            id: 'gen-1',
            name: 'index.html',
            path: '/index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Precision Stopwatch</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="timer-box">
    <h1>Digital Lap Timer</h1>
    <div id="display" class="display">00:00.00</div>
    <div class="controls">
      <button id="start-btn" onclick="startTimer()">Start</button>
      <button id="lap-btn" onclick="recordLap()">Lap</button>
      <button id="reset-btn" onclick="resetTimer()">Reset</button>
    </div>
    <ul id="laps"></ul>
  </div>
  <script src="app.js"></script>
</body>
</html>`
          },
          {
            id: 'gen-2',
            name: 'style.css',
            path: '/style.css',
            content: `body { background: #080A0F; color: #FFF; font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.timer-box { background: #151B26; padding: 32px; border-radius: 16px; border: 1px solid #283347; text-align: center; width: 340px; }
.display { font-size: 40px; font-weight: bold; color: #22D3EE; margin: 20px 0; }
.controls button { padding: 8px 16px; background: #6366F1; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 0 4px; }
#laps { list-style: none; padding: 0; margin-top: 20px; max-height: 120px; overflow-y: auto; text-align: left; }
#laps li { padding: 4px 0; border-bottom: 1px solid #283347; font-size: 12px; }`
          },
          {
            id: 'gen-3',
            name: 'app.js',
            path: '/app.js',
            content: `let timerInterval = null;
let elapsedMs = 0;

function formatTime(ms) {
  const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
  const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
  return \`\${mins}:\${secs}.\${hundredths}\`;
}

function startTimer() {
  if (timerInterval) return;
  const start = Date.now() - elapsedMs;
  timerInterval = setInterval(() => {
    elapsedMs = Date.now() - start;
    document.getElementById('display').textContent = formatTime(elapsedMs);
  }, 10);
  console.log("Timer started");
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedMs = 0;
  document.getElementById('display').textContent = "00:00.00";
  document.getElementById('laps').innerHTML = "";
  console.log("Timer reset");
}

function recordLap() {
  if (!elapsedMs) return;
  const li = document.createElement('li');
  li.textContent = \`Lap: \${formatTime(elapsedMs)}\`;
  document.getElementById('laps').prepend(li);
}
console.log("Stopwatch initialized ready.");`
          }
        ];
      } else {
        name = 'Interactive Markdown Notebook';
        files = [
          {
            id: 'gen-1',
            name: 'index.html',
            path: '/index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quick Note</title>
  <style>
    body { background: #0D1117; color: #FFF; font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; }
    textarea { width: 100%; height: 160px; background: #151B26; border: 1px solid #283347; border-radius: 8px; color: #FFF; padding: 12px; box-sizing: border-box; }
    .preview { background: #151B26; padding: 16px; border-radius: 8px; border: 1px solid #283347; margin-top: 16px; }
  </style>
</head>
<body>
  <h2>Live Note Scratchpad</h2>
  <textarea id="note-input" placeholder="Type notes here..."></textarea>
  <div id="preview" class="preview">Preview appears here...</div>
  <script src="script.js"></script>
</body>
</html>`
          },
          {
            id: 'gen-2',
            name: 'script.js',
            path: '/script.js',
            content: `const input = document.getElementById('note-input');
const preview = document.getElementById('preview');

input.addEventListener('input', (e) => {
  preview.textContent = e.target.value || "Preview appears here...";
});

console.log("Live Note app ready!");`
          }
        ];
      }

      setGeneratedName(name);
      setPreviewFiles(files);
      setIsGenerating(false);
    }, 800);
  };

  const handleSaveAndOpen = async () => {
    if (!previewFiles) return;

    const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProject: Project = {
      id: newProjectId,
      name: generatedName,
      type: 'web',
      runtime: 'browser-native',
      runtimeSupport: 'full',
      entryFile: '/index.html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: previewFiles
    };

    await saveProject(newProject);
    onProjectCreated(newProject);
    onClose();
    navigate(`/ide/${newProjectId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-bg-panel border border-bg-border rounded-2xl shadow-dropdown overflow-hidden card-highlight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-bg-border bg-bg-panel">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Prompt-to-Project Generator</h2>
              <p className="text-[11px] text-slate-400">Synthesize scaffold architecture from natural language.</p>
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

        <div className="p-6 space-y-4">
          {!previewFiles ? (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Describe the application you want to build
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Build an interactive precision stopwatch with lap history and start/stop controls..."
                  className="w-full px-4 py-3 rounded-xl bg-bg-darkest border border-bg-border text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{isGenerating ? 'Synthesizing Architecture...' : 'Generate Starter Project'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-bg-card border border-bg-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">{generatedName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Ready to Save
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Generated Files ({previewFiles.length})
                </div>
                <div className="space-y-1.5">
                  {previewFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg bg-bg-darkest border border-bg-border/60 text-slate-300 font-mono">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{f.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPreviewFiles(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-bg-card hover:bg-bg-cardHover border border-bg-border transition-colors"
                >
                  Back to Prompt
                </button>
                <button
                  onClick={handleSaveAndOpen}
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Open in CodePilot IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

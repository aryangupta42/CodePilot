import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { getAllProjects } from '../../services/storage';
import {
  Search,
  Plus,
  UploadCloud,
  Wand2,
  Play,
  TestTube2,
  Sparkles,
  Settings,
  LayoutDashboard,
  Terminal,
  Globe,
  Atom,
  ArrowRight,
  Command,
  FileCode,
  Zap
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionKey: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onAction
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      getAllProjects().then(setProjects);
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Actions catalog
  const standardActions = [
    {
      id: 'start_coding',
      title: 'Start Coding (Instant Editor - No Setup)',
      category: 'Quick Launch',
      icon: Zap,
      shortcut: 'S',
      run: () => {
        onClose();
        navigate('/coding');
      }
    },
    {
      id: 'new_project',
      title: 'Create New Project',
      category: 'Projects',
      icon: Plus,
      shortcut: 'N',
      run: () => {
        onClose();
        navigate('/dashboard?action=create');
      }
    },
    {
      id: 'import_zip',
      title: 'Import Project (ZIP or GitHub)',
      category: 'Projects',
      icon: UploadCloud,
      run: () => {
        onClose();
        navigate('/dashboard?action=import');
      }
    },
    {
      id: 'prompt_project',
      title: 'Prompt-to-Project Generator',
      category: 'AI Tools',
      icon: Wand2,
      run: () => {
        onClose();
        navigate('/dashboard?action=prompt');
      }
    },
    {
      id: 'open_demo',
      title: 'Open Interactive Calculator (Bug Demo)',
      category: 'Quick Launch',
      icon: Sparkles,
      run: () => {
        onClose();
        navigate('/ide/demo-buggy-calculator');
      }
    },
    {
      id: 'open_python',
      title: 'Launch Python 3 (Pyodide WASM)',
      category: 'Quick Launch',
      icon: Terminal,
      run: () => {
        onClose();
        navigate('/ide/demo-python-data');
      }
    },
    {
      id: 'open_dashboard',
      title: 'Go to Workspace Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      run: () => {
        onClose();
        navigate('/dashboard');
      }
    }
  ];

  // Project quick entries
  const projectItems = projects.map(p => ({
    id: `proj_${p.id}`,
    title: `Open ${p.name}`,
    category: 'Your Workspaces',
    icon: p.type === 'react' ? Atom : (p.type === 'python' ? Terminal : Globe),
    subtitle: `${p.files.length} files • ${p.runtime}`,
    run: () => {
      onClose();
      navigate(`/ide/${p.id}`);
    }
  }));

  const allItems = [...standardActions, ...projectItems];

  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (item: typeof allItems[0]) => {
    item.run();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-bg-surface border border-bg-border rounded-2xl shadow-panel overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-bg-border bg-bg-darkest">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                e.preventDefault();
                handleSelect(filteredItems[selectedIndex]);
              }
            }}
            placeholder="Type a command or search workspaces (e.g., 'Calculator', 'Import', 'Python')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface text-slate-400 border border-bg-border">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or projects found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-600/20 text-white border border-brand-500/40'
                      : 'text-slate-300 hover:bg-bg-card border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-lg bg-bg-darkest border border-bg-border flex items-center justify-center shrink-0 text-cyan-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-white">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[11px] text-slate-400 font-mono ml-2">
                          ({item.subtitle})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-bg-darkest text-slate-400 border border-bg-border">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-bg-darkest border-t border-bg-border flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>CodePilot AI Command Engine</span>
        </div>
      </div>
    </div>
  );
};

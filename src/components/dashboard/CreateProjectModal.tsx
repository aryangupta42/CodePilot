import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Globe, Atom, Terminal, Cpu, Bug } from 'lucide-react';
import { PROJECT_TEMPLATES } from '../../services/templates';
import type { Project, ProjectTemplate } from '../../types';
import { saveProject } from '../../services/storage';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const templateIcons: Record<string, React.ElementType> = {
  Globe,
  Atom,
  Terminal,
  Cpu,
  Bug
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(PROJECT_TEMPLATES[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically reset submitting and error state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = projectName.trim();
    if (!cleanName) {
      setError('Please provide a valid project name.');
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 50) {
      setError('Project name must be between 2 and 50 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newProject: Project = {
        id: newProjectId,
        name: cleanName,
        description: selectedTemplate.description,
        type: selectedTemplate.type,
        runtime: selectedTemplate.runtime,
        runtimeSupport: selectedTemplate.runtimeSupport,
        entryFile: selectedTemplate.entryFile,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        files: selectedTemplate.files.map((file, idx) => ({
          id: `f-${newProjectId}-${idx}`,
          name: file.name,
          path: file.path,
          content: file.content
        })),
        tests: selectedTemplate.sampleTests?.map((test, idx) => ({
          id: `t-${newProjectId}-${idx}`,
          name: test.name,
          targetFile: test.targetFile,
          code: test.code
        }))
      };

      // Instant save to memory + localStorage + background IndexedDB
      await saveProject(newProject);
      onProjectCreated(newProject);
      setIsSubmitting(false);
      onClose();
      navigate(`/ide/${newProjectId}`);
    } catch (err: any) {
      console.error('[CreateProjectModal] Project creation error:', err);
      setError(err.message || 'Failed to create project');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-bg-panel border border-bg-border rounded-2xl shadow-dropdown overflow-hidden card-highlight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-bg-border bg-bg-panel">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create New Project</h2>
              <p className="text-[11px] text-slate-400">Initialize a client-side sandboxed workspace.</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. My Next Awesome App"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-darkest border border-bg-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Starter Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
              {PROJECT_TEMPLATES.map((tpl) => {
                const IconComponent = templateIcons[tpl.icon] || Globe;
                const isSelected = selectedTemplate.id === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      if (!projectName) {
                        setProjectName(tpl.name.replace(/\([^)]*\)/g, '').trim());
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 shadow-sm'
                        : 'bg-bg-card hover:bg-bg-cardHover border-bg-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-bg-darkest flex items-center justify-center text-brand-400 border border-bg-border mb-2">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm line-clamp-1 tracking-tight">{tpl.name}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tpl.description}</p>
                    <div className="mt-2.5 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-bg-darkest text-cyan-400 border border-bg-border">
                      {tpl.runtime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Runtime capability notice */}
          <div className="p-3.5 rounded-xl bg-bg-card border border-bg-border text-xs">
            <span className="font-semibold text-slate-300">Runtime Specification:</span>
            <p className="text-slate-400 mt-0.5 leading-relaxed">{selectedTemplate.runtimeNote}</p>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create & Open IDE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronRight, Clock, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { AI_PROMPTS, PROMPT_ORDER } from '../lib/data';
import { classifyDecision, generateSummary, classifyWithClaude, isClaudeConfigured } from '../lib/ai';

export default function CaptureWizard({ projects, activeProjectId, onSave, onCancel, aiMode }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(
    activeProjectId !== 'all' ? activeProjectId : projects[0]?.id || ''
  );
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    inputRef.current?.focus();
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const currentPrompt = AI_PROMPTS[PROMPT_ORDER[step]];
  const isLastStep = step === PROMPT_ORDER.length - 1;
  const requiredFilled = answers.what?.trim() && answers.why?.trim();

  const handleSubmitAnswer = () => {
    if (!currentInput.trim() && currentPrompt.required) return;
    const newAnswers = { ...answers, [currentPrompt.key]: currentInput.trim() };
    setAnswers(newAnswers);
    setCurrentInput('');
    if (isLastStep) {
      handleFinalize(newAnswers);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleFinalize(answers);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleFinalize = async (finalAnswers) => {
    setIsProcessing(true);
    try {
      let classified;
      if (aiMode === 'claude' && isClaudeConfigured()) {
        const input = Object.entries(finalAnswers).map(([k, v]) => `${k}: ${v}`).join('\n');
        const result = await classifyWithClaude(input);
        classified = {
          phase: result.phase, category: result.category, impact: result.impact,
          summary: result.summary || generateSummary(finalAnswers).slice(0, 80),
        };
      } else {
        const allText = Object.values(finalAnswers).join(' ');
        classified = classifyDecision(allText);
        classified.summary = (finalAnswers.what || '').slice(0, 80);
      }

      const project = projects.find(p => p.id === selectedProject);
      onSave({
        ...finalAnswers,
        ...classified,
        projectId: selectedProject,
        projectName: project?.name || 'Unassigned',
      });
    } catch (err) {
      console.error('AI classification error:', err);
      const allText = Object.values(finalAnswers).join(' ');
      const classified = classifyDecision(allText);
      const project = projects.find(p => p.id === selectedProject);
      onSave({
        ...finalAnswers,
        ...classified,
        summary: (finalAnswers.what || '').slice(0, 80),
        projectId: selectedProject,
        projectName: project?.name || 'Unassigned',
      });
    }
    setIsProcessing(false);
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Log a Decision</h2>
            <p className="text-xs text-text-tertiary">AI-guided capture, step by step</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-xs font-mono ${elapsed > 120 ? 'text-orange-400' : 'text-text-tertiary'}`}>
            <Clock size={13} />
            {formatTime(elapsed)}
          </div>
          <div className="flex gap-1">
            {PROMPT_ORDER.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < step ? 'bg-brand-500' : i === step ? 'bg-brand-400 scale-125' : 'bg-surface-4'
              }`} />
            ))}
          </div>
        </div>
      </div>

      {/* Project selector */}
      <div className="mb-4">
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="input-field text-sm py-2"
        >
          {projects.filter(p => p.status === 'active').map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <div className="glass-panel p-5 min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[350px] pr-2">
          {/* Previous Q&A pairs */}
          {PROMPT_ORDER.slice(0, step).map(key => {
            const q = AI_PROMPTS[key];
            const a = answers[key];
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={12} className="text-brand-400" />
                  </div>
                  <div className="bg-surface-2/80 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-text-secondary">{q.prompt}</p>
                  </div>
                </div>
                {a && (
                  <div className="flex justify-end">
                    <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
                      <p className="text-sm text-brand-300">{a}</p>
                    </div>
                  </div>
                )}
                {!a && (
                  <div className="flex justify-end">
                    <span className="text-xs text-text-muted italic">Skipped</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Current question */}
          {!isProcessing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} className="text-brand-400" />
              </div>
              <div className="bg-surface-2/80 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-text-primary font-medium">{currentPrompt.prompt}</p>
                {!currentPrompt.required && (
                  <p className="text-[10px] text-text-muted mt-1">Optional, press Enter to skip</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} className="text-brand-400" />
              </div>
              <div className="bg-surface-2/80 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="text-brand-400 animate-spin" />
                  <span className="text-sm text-text-secondary">Structuring your decision record...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        {!isProcessing && (
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (currentInput.trim()) handleSubmitAnswer();
                  else if (!currentPrompt.required) handleSkip();
                }
              }}
              placeholder={currentPrompt.placeholder}
              rows={2}
              className="input-textarea flex-1 text-sm"
            />
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => currentInput.trim() ? handleSubmitAnswer() : handleSkip()}
                className={`p-2.5 rounded-xl transition-all ${
                  currentInput.trim()
                    ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-surface-3 text-text-muted hover:bg-surface-4'
                }`}
              >
                {currentInput.trim() ? <Send size={16} /> : <ChevronRight size={16} />}
              </button>
              {requiredFilled && step >= 2 && (
                <button onClick={() => handleFinalize(answers)} className="text-[10px] text-brand-400 hover:underline whitespace-nowrap">
                  Save now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

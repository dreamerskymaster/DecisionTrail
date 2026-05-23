import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Clock, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { classifyDecision, classifyWithClaude, isClaudeConfigured } from '../lib/ai';

export default function QuickCapture({ projects, activeProjectId, onSave, onCancel, aiMode }) {
  const [what, setWhat] = useState('');
  const [why, setWhy] = useState('');
  const [selectedProject, setSelectedProject] = useState(
    activeProjectId !== 'all' ? activeProjectId : projects[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const whatRef = useRef(null);

  useEffect(() => {
    whatRef.current?.focus();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const handleSave = async () => {
    if (!what.trim() || !why.trim()) return;
    setIsProcessing(true);
    try {
      let classified;
      if (aiMode === 'claude' && isClaudeConfigured()) {
        const input = `What: ${what}\nWhy: ${why}`;
        const result = await classifyWithClaude(input);
        classified = { phase: result.phase, category: result.category, impact: result.impact, summary: result.summary || what.slice(0, 80) };
      } else {
        classified = classifyDecision(what + ' ' + why);
        classified.summary = what.slice(0, 80);
      }
      const project = projects.find(p => p.id === selectedProject);
      onSave({
        what, why, alternatives: '', who: '', risks: '',
        ...classified,
        projectId: selectedProject,
        projectName: project?.name || 'Unassigned',
      });
    } catch {
      const classified = classifyDecision(what + ' ' + why);
      const project = projects.find(p => p.id === selectedProject);
      onSave({
        what, why, alternatives: '', who: '', risks: '',
        ...classified,
        summary: what.slice(0, 80),
        projectId: selectedProject,
        projectName: project?.name || 'Unassigned',
      });
    }
    setIsProcessing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Quick Capture</h2>
              <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fast</span>
            </div>
            <p className="text-xs text-text-tertiary">Two fields. Under two minutes. Fill in details later.</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-mono ${elapsed > 120 ? 'text-orange-400' : 'text-brand-400'}`}>
          <Clock size={13} />
          {formatTime(elapsed)}
          {elapsed <= 120 && <span className="text-text-muted ml-1">/ 2:00 target</span>}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input-field text-sm py-2">
          {projects.filter(p => p.status === 'active').map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
            <Sparkles size={14} className="text-brand-400" />
            What was decided? <span className="text-red-400">*</span>
          </label>
          <textarea ref={whatRef} value={what} onChange={e => setWhat(e.target.value)}
            placeholder='e.g., "Switched the sorting screen mesh from 38mm to 45mm after site testing showed clogging issues"'
            rows={3} className="input-textarea text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
            <Sparkles size={14} className="text-brand-400" />
            Why? <span className="text-red-400">*</span>
          </label>
          <textarea value={why} onChange={e => setWhy(e.target.value)}
            placeholder='e.g., "38mm mesh clogged every 4 hours. Client ops manager and senior tech agreed 45mm gives better throughput"'
            rows={3} className="input-textarea text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-text-muted">
            <Zap size={10} className="inline text-brand-400" /> AI will auto-classify phase, category, and impact
          </p>
          <button
            onClick={handleSave}
            disabled={!what.trim() || !why.trim() || isProcessing}
            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Send size={16} /> Log Decision</>}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-4">
        You can add alternatives, people involved, and risks later from the decision detail view.
      </p>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit3, Save, X, Trash2, Copy, CheckCircle2,
  MapPin, Users, AlertTriangle, GitBranch, MessageSquare, Calendar
} from 'lucide-react';
import { PHASES, CATEGORIES, IMPACT_LEVELS } from '../lib/ai';

const IMPACT_COLORS = { Low: 'badge-impact-low', Medium: 'badge-impact-medium', High: 'badge-impact-high', Critical: 'badge-impact-critical' };

const FIELD_CONFIG = [
  { key: 'what', label: 'What Was Decided', icon: CheckCircle2, color: 'text-blue-400' },
  { key: 'why', label: 'Reasoning', icon: MessageSquare, color: 'text-brand-400' },
  { key: 'alternatives', label: 'Alternatives Considered', icon: GitBranch, color: 'text-purple-400' },
  { key: 'who', label: 'People Involved', icon: Users, color: 'text-amber-400' },
  { key: 'risks', label: 'Risks and Trade-offs', icon: AlertTriangle, color: 'text-orange-400' },
];

export default function DecisionDetail({ decision, onBack, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [copied, setCopied] = useState(false);

  if (!decision) return null;

  const startEdit = () => {
    setEditData({
      what: decision.what || '', why: decision.why || '',
      alternatives: decision.alternatives || '', who: decision.who || '',
      risks: decision.risks || '', phase: decision.phase, category: decision.category, impact: decision.impact,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate(decision.id, editData);
    setEditing(false);
  };

  const copyToClipboard = () => {
    const text = [
      `DECISION RECORD: ${decision.summary || ''}`,
      `Date: ${new Date(decision.createdAt).toLocaleDateString()}`,
      `Project: ${decision.projectName || 'N/A'}`,
      `Phase: ${decision.phase} | Category: ${decision.category} | Impact: ${decision.impact}`,
      '',
      `WHAT: ${decision.what || 'N/A'}`,
      `WHY: ${decision.why || 'N/A'}`,
      `ALTERNATIVES: ${decision.alternatives || 'None documented'}`,
      `INVOLVED: ${decision.who || 'Not specified'}`,
      `RISKS: ${decision.risks || 'None identified'}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completeness = decision.completeness || 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{decision.summary || 'Decision Detail'}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge-phase">{decision.phase}</span>
              <span className="badge-category">{decision.category}</span>
              <span className={IMPACT_COLORS[decision.impact]}>{decision.impact}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyToClipboard} className="btn-secondary text-sm flex items-center gap-2">
            {copied ? <><CheckCircle2 size={14} className="text-brand-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
          {editing ? (
            <>
              <button onClick={saveEdit} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save</button>
              <button onClick={() => setEditing(false)} className="btn-ghost text-sm"><X size={14} /></button>
            </>
          ) : (
            <button onClick={startEdit} className="btn-secondary text-sm flex items-center gap-2"><Edit3 size={14} /> Edit</button>
          )}
          <button onClick={() => { if (confirm('Delete this decision?')) { onDelete(decision.id); onBack(); } }}
            className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="glass-panel-sm p-3 flex items-center gap-5 mb-5 text-xs text-text-tertiary">
        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(decision.createdAt).toLocaleString()}</span>
        <span className="flex items-center gap-1.5"><MapPin size={12} /> {decision.projectName || 'No project'}</span>
        <span className="ml-auto font-medium">
          Completeness: <span className={`${completeness >= 80 ? 'text-brand-400' : completeness >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {completeness}%
          </span>
        </span>
      </div>

      {/* Classification overrides (edit mode) */}
      {editing && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-4">
          <div className="glass-panel-sm p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Phase</label>
              <select value={editData.phase} onChange={e => setEditData(d => ({...d, phase: e.target.value}))} className="input-field text-xs py-2">
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Category</label>
              <select value={editData.category} onChange={e => setEditData(d => ({...d, category: e.target.value}))} className="input-field text-xs py-2">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Impact</label>
              <select value={editData.impact} onChange={e => setEditData(d => ({...d, impact: e.target.value}))} className="input-field text-xs py-2">
                {IMPACT_LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {FIELD_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={color} />
              <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
              {!decision[key] && !editing && (
                <span className="text-[10px] text-orange-400/70 ml-auto">Not documented</span>
              )}
            </div>
            {editing ? (
              <textarea
                value={editData[key] || ''}
                onChange={e => setEditData(d => ({...d, [key]: e.target.value}))}
                rows={3}
                className="input-textarea text-sm"
                placeholder={`Add ${label.toLowerCase()}...`}
              />
            ) : (
              <p className={`text-sm leading-relaxed ${decision[key] ? 'text-text-secondary' : 'text-text-muted italic'}`}>
                {decision[key] || `No ${label.toLowerCase()} recorded. Click Edit to add.`}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

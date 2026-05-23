import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function ExportModal({ decisions, onClose }) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState('text');

  const generateText = () => {
    return decisions.map((d, i) => [
      `--- Decision ${i + 1} ---`,
      `Summary: ${d.summary || 'N/A'}`,
      `Date: ${new Date(d.createdAt).toLocaleDateString()}`,
      `Project: ${d.projectName || 'N/A'}`,
      `Phase: ${d.phase} | Category: ${d.category} | Impact: ${d.impact}`,
      `What: ${d.what || 'N/A'}`,
      `Why: ${d.why || 'N/A'}`,
      `Alternatives: ${d.alternatives || 'None documented'}`,
      `Involved: ${d.who || 'Not specified'}`,
      `Risks: ${d.risks || 'None identified'}`,
      '',
    ].join('\n')).join('\n');
  };

  const generateCSV = () => {
    const headers = 'Date,Project,Phase,Category,Impact,Summary,What,Why,Alternatives,Who,Risks,Completeness';
    const rows = decisions.map(d =>
      [d.createdAt, d.projectName, d.phase, d.category, d.impact,
       d.summary, d.what, d.why, d.alternatives, d.who, d.risks, d.completeness]
      .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`)
      .join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const handleCopy = () => {
    const text = format === 'csv' ? generateCSV() : generateText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = format === 'csv' ? generateCSV() : generateText();
    const ext = format === 'csv' ? 'csv' : 'txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisiontrail_export_${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="glass-panel p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-text-primary">Export Decisions</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>

        <p className="text-sm text-text-tertiary mb-4">
          Export {decisions.length} decision{decisions.length !== 1 ? 's' : ''} (current filter applied)
        </p>

        <div className="flex gap-2 mb-5">
          {[{ id: 'text', label: 'Plain Text', icon: FileText }, { id: 'csv', label: 'CSV', icon: Download }].map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
                format === f.id
                  ? 'bg-brand-500/15 border-brand-500/30 text-brand-400'
                  : 'bg-surface-2 border-white/[0.06] text-text-secondary hover:bg-surface-3'
              }`}
            >
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex-1 btn-secondary flex items-center justify-center gap-2">
            {copied ? <><CheckCircle2 size={16} className="text-brand-400" /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
          </button>
          <button onClick={handleDownload} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Download size={16} /> Download File
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

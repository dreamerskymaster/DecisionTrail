import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowRight, BarChart3, FileText } from 'lucide-react';
import { PHASES, CATEGORIES } from '../lib/ai';
import Onboarding from './Onboarding';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

function CompletionRing({ value, size = 44, strokeWidth = 3.5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? '#25a974' : value >= 50 ? '#eab308' : '#f97316';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="completion-ring" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        className="transform rotate-90 origin-center fill-text-primary text-[11px] font-semibold"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
        {value}%
      </text>
    </svg>
  );
}

function CoverageMap({ decisions }) {
  const coverage = useMemo(() => {
    return PHASES.map(phase => {
      const phaseDecs = decisions.filter(d => d.phase === phase);
      const count = phaseDecs.length;
      const avgCompleteness = count > 0
        ? Math.round(phaseDecs.reduce((s, d) => s + (d.completeness || 0), 0) / count)
        : 0;
      return { phase, count, avgCompleteness };
    });
  }, [decisions]);

  const maxCount = Math.max(...coverage.map(c => c.count), 1);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Phase Coverage Map</h3>
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Decision Distribution</span>
      </div>
      <div className="space-y-3">
        {coverage.map(({ phase, count, avgCompleteness }, i) => (
          <motion.div key={phase} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-text-secondary">{phase}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">{count} decision{count !== 1 ? 's' : ''}</span>
                {count > 0 && <CompletionRing value={avgCompleteness} size={28} strokeWidth={3} />}
              </div>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: count === 0
                    ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 4px, transparent 4px, transparent 8px)'
                    : `linear-gradient(90deg, #25a974, #48c38e)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(count / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {count === 0 && (
              <p className="text-[10px] text-orange-400/70 mt-1 flex items-center gap-1">
                <AlertTriangle size={10} /> No decisions documented for this phase
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ decisions }) {
  const cats = useMemo(() => {
    const counts = {};
    decisions.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return CATEGORIES.map(c => ({ name: c, count: counts[c] || 0 })).sort((a, b) => b.count - a.count);
  }, [decisions]);
  const max = Math.max(...cats.map(c => c.count), 1);
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">By Category</h3>
        <BarChart3 size={16} className="text-text-tertiary" />
      </div>
      <div className="space-y-2.5">
        {cats.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-20 shrink-0">{c.name}</span>
            <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: colors[i] }}
                initial={{ width: 0 }} animate={{ width: `${(c.count / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }} />
            </div>
            <span className="text-xs font-mono text-text-tertiary w-6 text-right">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ decisions, setView }) {
  if (!decisions || decisions.length === 0) {
    return <Onboarding setView={setView} />;
  }
  const stats = useMemo(() => {
    const total = decisions.length;
    const complete = decisions.filter(d => (d.completeness || 0) >= 100).length;
    const avgCompleteness = total > 0
      ? Math.round(decisions.reduce((s, d) => s + (d.completeness || 0), 0) / total)
      : 0;
    const phasesWithDecs = new Set(decisions.map(d => d.phase)).size;
    const coveragePercent = Math.round((phasesWithDecs / PHASES.length) * 100);
    const thisWeek = decisions.filter(d => {
      const diff = Date.now() - new Date(d.createdAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    return { total, complete, avgCompleteness, coveragePercent, thisWeek };
  }, [decisions]);

  const recent = decisions.slice(0, 5);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Decisions', value: stats.total, icon: FileText, color: 'text-blue-400' },
          { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'text-brand-400' },
          { label: 'Fully Documented', value: `${stats.complete}/${stats.total}`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Phase Coverage', value: `${stats.coveragePercent}%`, icon: BarChart3, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="stat-card group hover:border-white/[0.12] transition-all duration-300">
            <div className="flex items-center justify-between">
              <s.icon size={18} className={`${s.color} opacity-70`} />
              <span className="text-2xl font-bold text-text-primary">{s.value}</span>
            </div>
            <span className="text-xs text-text-tertiary">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Avg Completeness */}
      <motion.div variants={fadeUp} className="glass-panel p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Documentation Quality</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Average completeness across all decisions</p>
          </div>
          <CompletionRing value={stats.avgCompleteness} size={56} strokeWidth={4} />
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
            initial={{ width: 0 }}
            animate={{ width: `${stats.avgCompleteness}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="text-[11px] text-text-tertiary mt-2">
          Target: 80% of decisions with complete rationale (what, why, who, alternatives, risks)
        </p>
      </motion.div>

      {/* Coverage + Category Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CoverageMap decisions={decisions} />
        <CategoryBreakdown decisions={decisions} />
      </motion.div>

      {/* Recent Decisions */}
      <motion.div variants={fadeUp} className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Recent Decisions</h3>
          <button onClick={() => setView('log')} className="btn-ghost text-xs flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {recent.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
              onClick={() => setView('detail:' + d.id)}
            >
              <CompletionRing value={d.completeness || 0} size={32} strokeWidth={2.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{d.summary || d.what?.slice(0, 60)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-phase text-[10px] py-0">{d.phase}</span>
                  <span className="badge-category text-[10px] py-0">{d.category}</span>
                  <span className="text-[10px] text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-brand-400 transition-colors" />
            </motion.div>
          ))}
          {recent.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-text-tertiary">No decisions logged yet.</p>
              <button onClick={() => setView('capture')} className="btn-primary text-sm mt-3">Log Your First Decision</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

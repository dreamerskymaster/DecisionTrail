import { motion } from 'framer-motion';
import { Zap, PlusCircle, Search, BarChart3, ArrowRight } from 'lucide-react';

export default function Onboarding({ setView }) {
  const steps = [
    { icon: PlusCircle, title: 'Log a decision', desc: 'Walk through 5 guided prompts: what, why, who, alternatives, risks. AI classifies it automatically.', action: () => setView('capture'), cta: 'Start guided capture' },
    { icon: Zap, title: 'Quick capture', desc: 'Only 2 fields needed. Under 2 minutes. Fill in details later.', action: () => setView('quick'), cta: 'Quick capture' },
    { icon: Search, title: 'Search and retrieve', desc: 'Filter by phase, category, impact, or person. Find any decision in under 30 seconds.', action: () => setView('log'), cta: 'Open decision log' },
    { icon: BarChart3, title: 'Track coverage', desc: 'See which project phases have documented decisions and which have gaps.', action: null, cta: null },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <img src="/decisiontraillogo.png" alt="DecisionTrail" className="w-16 h-16 rounded-2xl object-cover" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg-primary)' }}>Welcome to DecisionTrail</h2>
        <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--fg-secondary)' }}>
          AI-guided decision documentation for field project coordinators.
          Log decisions in plain language, retrieve the full rationale in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="panel p-5 flex flex-col gap-3 group hover:border-[var(--accent)] transition-colors cursor-pointer"
            onClick={s.action || undefined}
            style={!s.action ? { cursor: 'default' } : {}}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                <s.icon size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>{s.title}</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>{s.desc}</p>
            {s.cta && (
              <button onClick={s.action} className="mt-auto self-start flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                {s.cta} <ArrowRight size={12} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="panel p-4 flex items-start gap-3" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>
          <span className="text-white text-xs font-bold">?</span>
        </div>
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg-primary)' }}>How it works</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            Describe a decision in your own words. DecisionTrail's AI automatically classifies it by project phase
            (Planning, Procurement, Installation, Commissioning, Closeout), category (Engineering, Safety, Scheduling, etc.),
            and impact level. No PM training needed.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

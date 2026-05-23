import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Calendar, User, ChevronDown, ArrowUpDown, Download } from 'lucide-react';
import { PHASES, CATEGORIES, IMPACT_LEVELS } from '../lib/ai';

function CompletionDot({ value }) {
  const color = value >= 100 ? 'bg-brand-400' : value >= 60 ? 'bg-yellow-400' : 'bg-orange-400';
  return <div className={`w-2 h-2 rounded-full ${color}`} title={`${value}% complete`} />;
}

const IMPACT_COLORS = { Low: 'badge-impact-low', Medium: 'badge-impact-medium', High: 'badge-impact-high', Critical: 'badge-impact-critical' };

export default function DecisionLog({ decisions, onSelect, onExport }) {
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = decisions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        (d.what || '').toLowerCase().includes(q) ||
        (d.why || '').toLowerCase().includes(q) ||
        (d.summary || '').toLowerCase().includes(q) ||
        (d.who || '').toLowerCase().includes(q) ||
        (d.alternatives || '').toLowerCase().includes(q)
      );
    }
    if (filterPhase) result = result.filter(d => d.phase === filterPhase);
    if (filterCategory) result = result.filter(d => d.category === filterCategory);
    if (filterImpact) result = result.filter(d => d.impact === filterImpact);
    if (filterPerson) {
      const p = filterPerson.toLowerCase();
      result = result.filter(d => (d.who || '').toLowerCase().includes(p));
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'impact') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.impact] || 2) - (order[b.impact] || 2);
      }
      if (sortBy === 'completeness') return (b.completeness || 0) - (a.completeness || 0);
      return 0;
    });
    return result;
  }, [decisions, search, filterPhase, filterCategory, filterImpact, filterPerson, sortBy]);

  const hasFilters = filterPhase || filterCategory || filterImpact || filterPerson;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search decisions by keyword, person, or rationale..."
            className="input-field pl-10 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-sm flex items-center gap-2 ${hasFilters ? 'border-brand-500/40 text-brand-400' : ''}`}
        >
          <Filter size={14} /> Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
        </button>
        <button onClick={onExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-panel-sm p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Phase</label>
                <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="input-field text-xs py-2">
                  <option value="">All Phases</option>
                  {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field text-xs py-2">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Impact</label>
                <select value={filterImpact} onChange={e => setFilterImpact(e.target.value)} className="input-field text-xs py-2">
                  <option value="">All Levels</option>
                  {IMPACT_LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Person</label>
                <div className="relative">
                  <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={filterPerson} onChange={e => setFilterPerson(e.target.value)}
                    placeholder="Name..." className="input-field text-xs py-2 pl-8" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">Sort</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field text-xs py-2">
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="impact">By Impact</option>
                  <option value="completeness">By Completeness</option>
                </select>
              </div>
              {hasFilters && (
                <button onClick={() => { setFilterPhase(''); setFilterCategory(''); setFilterImpact(''); setFilterPerson(''); }}
                  className="col-span-full text-xs text-brand-400 hover:underline text-center mt-1">
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-tertiary">
          {filtered.length} decision{filtered.length !== 1 ? 's' : ''}
          {hasFilters || search ? ' matching filters' : ''}
        </p>
      </div>

      {/* Decision cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              onClick={() => onSelect(d.id)}
              className="glass-panel-sm p-4 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <CompletionDot value={d.completeness || 0} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-brand-300 transition-colors truncate">
                    {d.summary || d.what?.slice(0, 80)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{d.why}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="badge-phase text-[10px] py-0">{d.phase}</span>
                    <span className="badge-category text-[10px] py-0">{d.category}</span>
                    <span className={`${IMPACT_COLORS[d.impact] || 'badge'} text-[10px] py-0`}>{d.impact}</span>
                    {d.projectName && <span className="text-[10px] text-text-muted">{d.projectName}</span>}
                    <span className="text-[10px] text-text-muted ml-auto">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">No decisions match your search.</p>
            <p className="text-xs text-text-muted mt-1">Try broadening your filters or search terms.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

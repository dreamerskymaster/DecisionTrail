import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, PlusCircle, FolderOpen, Settings,
  ChevronDown, Plus, Check, Zap, Brain, Sun, Moon
} from 'lucide-react';

export default function Sidebar({
  view, setView, projects, activeProjectId, setActiveProjectId,
  onAddProject, aiMode, setAiMode, theme, setTheme,
}) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');

  const nav = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'capture', icon: PlusCircle, label: 'Log decision' },
    { id: 'quick', icon: Zap, label: 'Quick capture', tag: 'FAST' },
    { id: 'log', icon: FileText, label: 'Decision log' },
  ];

  const addProject = () => {
    if (newName.trim()) {
      onAddProject({ name: newName.trim(), client: newClient.trim() });
      setNewName(''); setNewClient(''); setShowNewProject(false);
    }
  };

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-bg-surface border-r border-line flex flex-col z-30">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10h3l2.5-5 3 10 2.5-5H18" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg-primary leading-tight">DecisionTrail</p>
            <p className="text-[10px] text-fg-muted leading-tight">Decision documentation</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <div className="space-y-0.5">
          {nav.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                view === item.id
                  ? 'bg-accent-muted text-accent'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'
              }`}>
              <item.icon size={16} strokeWidth={view === item.id ? 2.2 : 1.7} />
              {item.label}
              {item.tag && <span className="ml-auto text-[9px] bg-accent-muted text-accent px-1.5 py-0.5 rounded font-bold">{item.tag}</span>}
            </button>
          ))}
        </div>

        {/* Projects */}
        <div className="mt-5">
          <button onClick={() => setProjectsOpen(!projectsOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><FolderOpen size={12} /> Projects</span>
            <motion.div animate={{ rotate: projectsOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>

          <AnimatePresence>
            {projectsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="space-y-0.5 mt-1">
                  <button onClick={() => setActiveProjectId('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                      activeProjectId === 'all' ? 'text-accent bg-accent-muted' : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'
                    }`}>All projects</button>
                  {projects.map(p => (
                    <button key={p.id} onClick={() => setActiveProjectId(p.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] truncate transition-colors ${
                        activeProjectId === p.id ? 'text-accent bg-accent-muted' : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'
                      }`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${p.status === 'active' ? 'bg-accent' : 'bg-fg-muted'}`} />
                      {p.name}
                    </button>
                  ))}
                  <AnimatePresence>
                    {showNewProject ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 py-2 space-y-1.5">
                        <input className="input-field text-xs py-1.5" placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                        <input className="input-field text-xs py-1.5" placeholder="Client" value={newClient} onChange={e => setNewClient(e.target.value)} />
                        <div className="flex gap-1.5">
                          <button onClick={addProject} className="btn-primary text-xs py-1 flex-1"><Check size={12} /></button>
                          <button onClick={() => setShowNewProject(false)} className="btn-ghost text-xs">Cancel</button>
                        </div>
                      </motion.div>
                    ) : (
                      <button onClick={() => setShowNewProject(true)} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-fg-muted hover:text-accent transition-colors">
                        <Plus size={12} /> New project
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-3 border-t border-line space-y-2.5">
        {/* AI toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-fg-secondary">
            {aiMode === 'claude' ? <Brain size={12} className="text-accent" /> : <Zap size={12} />}
            {aiMode === 'claude' ? 'Gemini AI' : 'Simulated'}
          </div>
          <button onClick={() => setAiMode(m => m === 'simulated' ? 'claude' : 'simulated')}
            className={`relative w-8 h-[18px] rounded-full transition-colors ${aiMode === 'claude' ? 'bg-accent' : 'bg-line-strong'}`}>
            <motion.div className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm"
              animate={{ left: aiMode === 'claude' ? 14 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </button>
        </div>
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-fg-secondary flex items-center gap-1.5">
            {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            {theme === 'dark' ? 'Dark' : 'Light'} mode
          </span>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={`relative w-8 h-[18px] rounded-full transition-colors ${theme === 'dark' ? 'bg-interactive' : 'bg-line-strong'}`}>
            <motion.div className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm"
              animate={{ left: theme === 'dark' ? 14 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

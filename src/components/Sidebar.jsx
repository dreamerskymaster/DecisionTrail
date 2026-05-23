import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, PlusCircle, FolderOpen, Settings,
  ChevronDown, Plus, Check, Zap, Brain
} from 'lucide-react';

export default function Sidebar({
  view, setView, projects, activeProjectId, setActiveProjectId,
  onAddProject, aiMode, setAiMode,
}) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'capture', icon: PlusCircle, label: 'Log Decision' },
    { id: 'quick', icon: Zap, label: 'Quick Capture' },
    { id: 'log', icon: FileText, label: 'Decision Log' },
  ];

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject({ name: newProjectName.trim(), client: newProjectClient.trim() });
      setNewProjectName('');
      setNewProjectClient('');
      setShowNewProject(false);
    }
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-surface-0 border-r border-white/[0.06] flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10h3l2.5-5 3 10 2.5-5H18" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary tracking-tight">DecisionTrail</h1>
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">AI Decision Docs</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                view === item.id
                  ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <item.icon size={18} strokeWidth={view === item.id ? 2.2 : 1.8} />
              {item.label}
              {item.id === 'quick' && (
                <span className="ml-auto text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-md font-semibold">
                  FAST
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mt-6">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider hover:text-text-secondary transition-colors"
          >
            <span className="flex items-center gap-2"><FolderOpen size={14} /> Projects</span>
            <motion.div animate={{ rotate: projectsOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>

          <AnimatePresence>
            {projectsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveProjectId('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeProjectId === 'all' ? 'text-brand-400 bg-brand-500/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                    }`}
                  >
                    All Projects
                  </button>
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveProjectId(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                        activeProjectId === p.id ? 'text-brand-400 bg-brand-500/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${p.status === 'active' ? 'bg-brand-400' : 'bg-text-muted'}`} />
                      {p.name}
                    </button>
                  ))}

                  {/* Add project */}
                  <AnimatePresence>
                    {showNewProject ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-2 py-2 space-y-2">
                        <input className="input-field text-xs py-2" placeholder="Project name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} autoFocus />
                        <input className="input-field text-xs py-2" placeholder="Client (optional)" value={newProjectClient} onChange={e => setNewProjectClient(e.target.value)} />
                        <div className="flex gap-2">
                          <button onClick={handleAddProject} className="flex-1 btn-primary text-xs py-1.5"><Check size={14} /></button>
                          <button onClick={() => setShowNewProject(false)} className="btn-ghost text-xs py-1.5 px-2">Cancel</button>
                        </div>
                      </motion.div>
                    ) : (
                      <button onClick={() => setShowNewProject(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-brand-400 transition-colors">
                        <Plus size={14} /> New Project
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* AI Mode Toggle */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-tertiary">AI Engine</span>
          <button
            onClick={() => setAiMode(m => m === 'simulated' ? 'claude' : 'simulated')}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
              aiMode === 'claude' ? 'bg-brand-500' : 'bg-surface-4'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: aiMode === 'claude' ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          {aiMode === 'claude' ? (
            <><Brain size={12} className="text-brand-400" /><span className="text-brand-400 font-medium">Gemini AI Active</span></>
          ) : (
            <><Zap size={12} className="text-text-tertiary" /><span className="text-text-tertiary">Simulated Mode</span></>
          )}
        </div>
      </div>
    </aside>
  );
}

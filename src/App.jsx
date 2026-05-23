import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaptureWizard from './components/CaptureWizard';
import QuickCapture from './components/QuickCapture';
import DecisionLog from './components/DecisionLog';
import DecisionDetail from './components/DecisionDetail';
import ExportModal from './components/ExportModal';
import { useStore } from './hooks/useStore';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div key={toast.id}
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-md text-sm font-medium border ${
        toast.type === 'success' ? 'bg-accent-light text-accent border-accent/20'
        : toast.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
        : 'bg-bg-surface text-fg-primary border-line'
      }`}
    >{toast.message}</motion.div>
  );
}

export default function App() {
  const store = useStore();
  const [view, setView] = useState('dashboard');
  const [selectedDecisionId, setSelectedDecisionId] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [aiMode, setAiMode] = useState('simulated');
  const [theme, setTheme] = useState(() => localStorage.getItem('dt-theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('dt-theme', theme);
  }, [theme]);

  const handleSetView = (v) => {
    if (v.startsWith('detail:')) {
      setSelectedDecisionId(v.replace('detail:', ''));
      setView('detail');
    } else {
      setView(v);
      setSelectedDecisionId(null);
    }
  };

  const handleSaveDecision = (decision) => {
    store.addDecision(decision);
    setView('log');
  };

  const selectedDecision = store.decisions.find(d => d.id === selectedDecisionId);

  const viewTitles = {
    dashboard: { title: 'Dashboard', sub: 'Decision documentation overview' },
    log: { title: 'Decision log', sub: `${store.filteredDecisions.length} decisions${store.activeProjectId !== 'all' ? ' in current project' : ''}` },
  };
  const header = viewTitles[view];

  return (
    <div className="min-h-screen bg-bg-primary font-sans">
      <Sidebar
        view={view} setView={handleSetView}
        projects={store.projects} activeProjectId={store.activeProjectId}
        setActiveProjectId={store.setActiveProjectId} onAddProject={store.addProject}
        aiMode={aiMode} setAiMode={setAiMode}
        theme={theme} setTheme={setTheme}
      />

      <main className="ml-60 p-6 lg:p-8 max-w-5xl">
        {header && (
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <h2 className="text-xl font-semibold text-fg-primary">{header.title}</h2>
            <p className="text-sm text-fg-secondary mt-0.5">{header.sub}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {view === 'dashboard' && <Dashboard key="d" decisions={store.filteredDecisions} setView={handleSetView} />}
          {view === 'capture' && <CaptureWizard key="c" projects={store.projects} activeProjectId={store.activeProjectId} onSave={handleSaveDecision} onCancel={() => setView('dashboard')} aiMode={aiMode} />}
          {view === 'quick' && <QuickCapture key="q" projects={store.projects} activeProjectId={store.activeProjectId} onSave={handleSaveDecision} onCancel={() => setView('dashboard')} aiMode={aiMode} />}
          {view === 'log' && <DecisionLog key="l" decisions={store.filteredDecisions} onSelect={(id) => { setSelectedDecisionId(id); setView('detail'); }} onExport={() => setShowExport(true)} />}
          {view === 'detail' && selectedDecision && <DecisionDetail key="det" decision={selectedDecision} onBack={() => setView('log')} onUpdate={store.updateDecision} onDelete={store.deleteDecision} />}
        </AnimatePresence>
      </main>

      <AnimatePresence>{showExport && <ExportModal decisions={store.filteredDecisions} onClose={() => setShowExport(false)} />}</AnimatePresence>
      <AnimatePresence><Toast toast={store.toast} /></AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
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
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl border ${
        toast.type === 'success'
          ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
          : toast.type === 'error'
          ? 'bg-red-500/20 text-red-300 border-red-500/30'
          : 'bg-surface-3 text-text-primary border-white/[0.08]'
      }`}
    >
      {toast.message}
    </motion.div>
  );
}

export default function App() {
  const store = useStore();
  const [view, setView] = useState('dashboard');
  const [selectedDecisionId, setSelectedDecisionId] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [aiMode, setAiMode] = useState('simulated');

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

  return (
    <div className="min-h-screen bg-surface-0">
      <Sidebar
        view={view}
        setView={handleSetView}
        projects={store.projects}
        activeProjectId={store.activeProjectId}
        setActiveProjectId={store.setActiveProjectId}
        onAddProject={store.addProject}
        aiMode={aiMode}
        setAiMode={setAiMode}
      />

      <main className="ml-64 p-6 lg:p-8 max-w-5xl">
        {/* Page header */}
        {view !== 'capture' && view !== 'quick' && view !== 'detail' && (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-text-primary">
              {view === 'dashboard' ? 'Dashboard' : 'Decision Log'}
            </h2>
            <p className="text-sm text-text-tertiary mt-1">
              {view === 'dashboard'
                ? 'Overview of decision documentation across your projects'
                : `${store.filteredDecisions.length} decisions ${store.activeProjectId !== 'all' ? 'in current project' : 'across all projects'}`
              }
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard
                decisions={store.filteredDecisions}
                setView={handleSetView}
              />
            </motion.div>
          )}

          {view === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CaptureWizard
                projects={store.projects}
                activeProjectId={store.activeProjectId}
                onSave={handleSaveDecision}
                onCancel={() => setView('dashboard')}
                aiMode={aiMode}
              />
            </motion.div>
          )}

          {view === 'quick' && (
            <motion.div key="quick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuickCapture
                projects={store.projects}
                activeProjectId={store.activeProjectId}
                onSave={handleSaveDecision}
                onCancel={() => setView('dashboard')}
                aiMode={aiMode}
              />
            </motion.div>
          )}

          {view === 'log' && (
            <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DecisionLog
                decisions={store.filteredDecisions}
                onSelect={(id) => { setSelectedDecisionId(id); setView('detail'); }}
                onExport={() => setShowExport(true)}
              />
            </motion.div>
          )}

          {view === 'detail' && selectedDecision && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DecisionDetail
                decision={selectedDecision}
                onBack={() => setView('log')}
                onUpdate={store.updateDecision}
                onDelete={store.deleteDecision}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Export modal */}
      <AnimatePresence>
        {showExport && (
          <ExportModal
            decisions={store.filteredDecisions}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        <Toast toast={store.toast} />
      </AnimatePresence>
    </div>
  );
}

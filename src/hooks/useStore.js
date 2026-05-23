import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import { SAMPLE_DECISIONS, DEFAULT_PROJECTS } from '../lib/data';

// Generate unique IDs
const uid = () => 'dec-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pid = () => 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function useStore() {
  const [decisions, setDecisions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: decs } = await supabase.from('decisions').select('*').order('created_at', { ascending: false });
          const { data: projs } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
          // Map snake_case DB columns to camelCase app fields
          setDecisions((decs || []).map(d => ({
            ...d,
            createdAt: d.created_at || d.createdAt,
            projectId: d.project_id || d.projectId,
            projectName: d.project_name || d.projectName,
          })));
          setProjects((projs || []).map(p => ({
            ...p,
            createdAt: p.created_at || p.createdAt,
          })));
        } catch (e) {
          console.error('Supabase fetch error:', e);
          loadLocal();
        }
      } else {
        loadLocal();
      }
      setLoading(false);
    };

    const loadLocal = () => {
      const savedDecs = localStore.getDecisions();
      const savedProjs = localStore.getProjects();
      setDecisions(savedDecs.length ? savedDecs : SAMPLE_DECISIONS);
      setProjects(savedProjs.length ? savedProjs : DEFAULT_PROJECTS);
    };

    init();
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loading) {
      localStore.saveDecisions(decisions);
      localStore.saveProjects(projects);
    }
  }, [decisions, projects, loading]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addDecision = useCallback((decision) => {
    const newDec = {
      ...decision,
      id: uid(),
      createdAt: new Date().toISOString(),
      completeness: calcCompleteness(decision),
    };
    setDecisions(prev => [newDec, ...prev]);
    showToast('Decision logged successfully');

    if (isSupabaseConfigured()) {
      const dbRow = {
        id: newDec.id, what: newDec.what, why: newDec.why,
        alternatives: newDec.alternatives, who: newDec.who, risks: newDec.risks,
        phase: newDec.phase, category: newDec.category, impact: newDec.impact,
        summary: newDec.summary, completeness: newDec.completeness,
        project_id: newDec.projectId, project_name: newDec.projectName,
        created_at: newDec.createdAt,
      };
      supabase.from('decisions').insert(dbRow).then(({ error }) => {
        if (error) console.error('Supabase insert error:', error);
      });
    }
    return newDec;
  }, [showToast]);

  const updateDecision = useCallback((id, updates) => {
    setDecisions(prev => prev.map(d =>
      d.id === id ? { ...d, ...updates, completeness: calcCompleteness({ ...d, ...updates }) } : d
    ));
    showToast('Decision updated');

    if (isSupabaseConfigured()) {
      supabase.from('decisions').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [showToast]);

  const deleteDecision = useCallback((id) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
    showToast('Decision deleted', 'info');

    if (isSupabaseConfigured()) {
      supabase.from('decisions').delete().eq('id', id);
    }
  }, [showToast]);

  const addProject = useCallback((project) => {
    const newProj = { ...project, id: pid(), createdAt: new Date().toISOString().split('T')[0], status: 'active' };
    setProjects(prev => [newProj, ...prev]);
    showToast('Project created');
    return newProj;
  }, [showToast]);

  // Filtered decisions by active project
  const filteredDecisions = activeProjectId === 'all'
    ? decisions
    : decisions.filter(d => d.projectId === activeProjectId);

  return {
    decisions, filteredDecisions, projects, activeProjectId,
    loading, toast, setActiveProjectId,
    addDecision, updateDecision, deleteDecision, addProject, showToast,
  };
}

function calcCompleteness(dec) {
  const fields = ['what', 'why', 'alternatives', 'who', 'risks'];
  const filled = fields.filter(f => dec[f] && dec[f].trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

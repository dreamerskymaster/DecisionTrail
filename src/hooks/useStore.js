import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import { SAMPLE_DECISIONS, DEFAULT_PROJECTS } from '../lib/data';

// Generate unique IDs
const uid = () => 'dec-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pid = () => 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Convert camelCase decision to snake_case row for Supabase
function toDbRow(d) {
  return {
    id: d.id,
    what: d.what ?? null,
    why: d.why ?? null,
    alternatives: d.alternatives ?? null,
    who: d.who ?? null,
    risks: d.risks ?? null,
    phase: d.phase ?? null,
    category: d.category ?? null,
    impact: d.impact ?? null,
    summary: d.summary ?? null,
    completeness: d.completeness ?? 0,
    project_id: d.projectId ?? d.project_id ?? null,
    project_name: d.projectName ?? d.project_name ?? null,
    created_at: d.createdAt ?? d.created_at ?? new Date().toISOString(),
  };
}

function fromDbRow(d) {
  return {
    ...d,
    createdAt: d.created_at || d.createdAt,
    projectId: d.project_id || d.projectId,
    projectName: d.project_name || d.projectName,
  };
}

function toDbProject(p) {
  return {
    id: p.id,
    name: p.name,
    client: p.client ?? null,
    status: p.status ?? 'active',
    created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  };
}

function fromDbProject(p) {
  return {
    ...p,
    createdAt: p.created_at || p.createdAt,
  };
}

// Map camelCase updates to snake_case for Supabase
function mapUpdatesToDb(updates) {
  const mapping = {
    projectId: 'project_id',
    projectName: 'project_name',
    createdAt: 'created_at',
  };
  const result = {};
  for (const [k, v] of Object.entries(updates)) {
    const dbKey = mapping[k] || k;
    result[dbKey] = v;
  }
  return result;
}

export function useStore() {
  const [decisions, setDecisions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Initialize data
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: projs, error: projErr } = await supabase
            .from('projects').select('*').order('created_at', { ascending: false });
          const { data: decs, error: decErr } = await supabase
            .from('decisions').select('*').order('created_at', { ascending: false });

          if (projErr) console.error('Supabase projects fetch error:', projErr);
          if (decErr) console.error('Supabase decisions fetch error:', decErr);

          if (cancelled) return;

          // First-time seed: if Supabase is reachable but empty, push default data
          if ((!projs || projs.length === 0) && !projErr) {
            const seededProjects = DEFAULT_PROJECTS.map(toDbProject);
            const { error: seedProjErr } = await supabase.from('projects').insert(seededProjects);
            if (seedProjErr) console.error('Project seed error:', seedProjErr);
          }

          if ((!decs || decs.length === 0) && !decErr) {
            const seededDecisions = SAMPLE_DECISIONS.map(toDbRow);
            const { error: seedDecErr } = await supabase.from('decisions').insert(seededDecisions);
            if (seedDecErr) console.error('Decision seed error:', seedDecErr);
          }

          // Re-fetch after potential seed
          const { data: finalProjs } = await supabase
            .from('projects').select('*').order('created_at', { ascending: false });
          const { data: finalDecs } = await supabase
            .from('decisions').select('*').order('created_at', { ascending: false });

          if (cancelled) return;

          setProjects((finalProjs && finalProjs.length ? finalProjs : DEFAULT_PROJECTS).map(fromDbProject));
          setDecisions((finalDecs && finalDecs.length ? finalDecs : SAMPLE_DECISIONS).map(fromDbRow));
        } catch (e) {
          console.error('Supabase init error, using local fallback:', e);
          if (!cancelled) loadLocal();
        }
      } else {
        loadLocal();
      }
      if (!cancelled) setLoading(false);
    };

    const loadLocal = () => {
      const savedDecs = localStore.getDecisions();
      const savedProjs = localStore.getProjects();
      setDecisions(savedDecs.length ? savedDecs : SAMPLE_DECISIONS);
      setProjects(savedProjs.length ? savedProjs : DEFAULT_PROJECTS);
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage on change as a safety net
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
      supabase.from('decisions').insert(toDbRow(newDec)).then(({ error }) => {
        if (error) {
          console.error('Supabase insert error:', error);
          showToast('Saved locally. Cloud sync failed.', 'error');
        }
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
      const dbUpdates = mapUpdatesToDb(updates);
      supabase.from('decisions').update(dbUpdates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [showToast]);

  const deleteDecision = useCallback((id) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
    showToast('Decision deleted', 'info');

    if (isSupabaseConfigured()) {
      supabase.from('decisions').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [showToast]);

  const addProject = useCallback((project) => {
    const newProj = {
      ...project,
      id: pid(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setProjects(prev => [newProj, ...prev]);
    showToast('Project created');

    if (isSupabaseConfigured()) {
      supabase.from('projects').insert(toDbProject(newProj)).then(({ error }) => {
        if (error) {
          console.error('Supabase project insert error:', error);
          showToast('Project saved locally. Cloud sync failed.', 'error');
        }
      });
    }
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

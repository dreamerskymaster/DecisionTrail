import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

// Fallback to localStorage when Supabase is not configured
const STORAGE_KEY = 'decisiontrail_data';

export const localStore = {
  getDecisions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).decisions || [] : [];
    } catch { return []; }
  },
  saveDecisions: (decisions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions }));
  },
  getProjects: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY + '_projects');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  saveProjects: (projects) => {
    localStorage.setItem(STORAGE_KEY + '_projects', JSON.stringify(projects));
  },
};

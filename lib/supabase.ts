import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy initialization to avoid crashes if keys are missing during dev
let supabaseInstance: any = null;

export const getSupabase = () => {
  const url = (supabaseUrl || '').trim();
  const key = (supabaseAnonKey || '').trim();
  const isPlaceholder = url === 'your_supabase_project_url' || key === 'your_supabase_anon_key';
  
  if (!url || !key || isPlaceholder || !url.startsWith('http')) {
    if (url && !url.startsWith('http') && !isPlaceholder) {
      console.warn('Supabase URL inválida: Deve começar com http:// ou https://. Verifique as configurações.');
    } else {
      console.info('Supabase não configurado ou usando valores temporários. O app usará armazenamento local.');
    }
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.warn('Falha ao inicializar o cliente Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

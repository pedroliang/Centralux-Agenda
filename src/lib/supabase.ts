import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anon);

// Cliente real (ou null se faltarem envs — nesse caso, usamos fallback local).
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anon!, {
      realtime: { params: { eventsPerSecond: 5 } },
      auth: { persistSession: false }
    })
  : null;

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://yrcfvmwrbnbajrtnyoid.supabase.co';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyY2Z2bXdyYm5iYWpydG55b2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDIxOTQsImV4cCI6MjA5MjI3ODE5NH0.Lo1-0zLDkPSS15U6bVmfdsIC4afmlWXbOpQn9_BGSKQ';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON;

export const isSupabaseConfigured = Boolean(url && anon);

// Cliente real (ou null se faltarem envs — nesse caso, usamos fallback local).
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anon!, {
      realtime: { params: { eventsPerSecond: 5 } },
      auth: { persistSession: false }
    })
  : null;

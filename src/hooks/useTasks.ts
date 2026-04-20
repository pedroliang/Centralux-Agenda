import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NewTask, Task } from '../types';

const LOCAL_KEY = 'celtralux-tasks-local';

function loadLocal(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}
function saveLocal(tasks: Task[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface UseTasks {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  online: boolean;
  add: (t: NewTask) => Promise<Task | null>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTasks(): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const online = isSupabaseConfigured;
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setTasks(loadLocal());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('start_at', { ascending: true });
    if (!mounted.current) return;
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    if (!supabase) return () => { mounted.current = false; };

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        payload => {
          setTasks(prev => {
            if (payload.eventType === 'INSERT') {
              const t = payload.new as Task;
              if (prev.some(x => x.id === t.id)) return prev;
              return [...prev, t].sort((a, b) => a.start_at.localeCompare(b.start_at));
            }
            if (payload.eventType === 'UPDATE') {
              const t = payload.new as Task;
              return prev.map(x => (x.id === t.id ? t : x));
            }
            if (payload.eventType === 'DELETE') {
              const t = payload.old as Task;
              return prev.filter(x => x.id !== t.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      if (supabase) supabase.removeChannel(channel);
    };
  }, [refresh]);

  const add = useCallback(async (t: NewTask): Promise<Task | null> => {
    if (!supabase) {
      const local: Task = {
        ...t,
        id: uuid(),
        completed_at: t.completed ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTasks(prev => {
        const next = [...prev, local].sort((a, b) => a.start_at.localeCompare(b.start_at));
        saveLocal(next);
        return next;
      });
      return local;
    }
    const { data, error } = await supabase.from('tasks').insert(t).select('*').single();
    if (error) { setError(error.message); return null; }
    return data as Task;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Task>) => {
    if (!supabase) {
      setTasks(prev => {
        const next = prev.map(t => (t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t));
        saveLocal(next);
        return next;
      });
      return;
    }
    const { error } = await supabase.from('tasks').update(patch).eq('id', id);
    if (error) setError(error.message);
  }, []);

  const toggleDone = useCallback(async (id: string, done: boolean) => {
    await update(id, {
      completed: done,
      completed_at: done ? new Date().toISOString() : null
    });
  }, [update]);

  const remove = useCallback(async (id: string) => {
    if (!supabase) {
      setTasks(prev => {
        const next = prev.filter(t => t.id !== id);
        saveLocal(next);
        return next;
      });
      return;
    }
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) setError(error.message);
  }, []);

  return { tasks, loading, error, online, add, update, toggleDone, remove, refresh };
}

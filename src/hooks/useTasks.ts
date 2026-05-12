import { useCallback, useEffect, useRef, useState } from 'react';
import { api, isApiConfigured } from '../lib/api';
import { NewTask, Task } from '../types';

// Cache local — espelha o estado remoto. Funciona como:
//   - boot rápido (mostra a última lista vista enquanto a API responde)
//   - fallback offline (se a API estiver fora, o app continua usável)
const CACHE_KEY = 'celtralux-tasks-cache';
// Fila de operações de escrita feitas offline; reaplicadas quando a API volta.
const QUEUE_KEY = 'celtralux-tasks-queue';
// Intervalo de polling (ms) — substitui o realtime do Supabase.
const POLL_MS = 7000;

type QueuedOp =
  | { type: 'create'; tempId: string; payload: NewTask }
  | { type: 'update'; id: string; patch: Partial<Task> }
  | { type: 'delete'; id: string };

function loadCache(): Task[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}
function saveCache(tasks: Task[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(tasks)); } catch { /* ignore */ }
}
function loadQueue(): QueuedOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    return [];
  }
}
function saveQueue(q: QueuedOp[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch { /* ignore */ }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'tmp-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sortTasks(arr: Task[]): Task[] {
  return [...arr].sort((a, b) => a.start_at.localeCompare(b.start_at));
}

export interface UseTasks {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  /** true quando a última chamada à API foi bem-sucedida (UI mostra "Online"). */
  online: boolean;
  add: (t: NewTask) => Promise<Task | null>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTasks(): UseTasks {
  const [tasks, setTasks] = useState<Task[]>(() => loadCache());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const mounted = useRef(true);

  // Mantém o cache em sincronia sempre que `tasks` mudar.
  useEffect(() => { saveCache(tasks); }, [tasks]);

  // Reaplica operações que foram enfileiradas offline.
  const flushQueue = useCallback(async () => {
    const queue = loadQueue();
    if (queue.length === 0) return;
    const remaining: QueuedOp[] = [];
    for (const op of queue) {
      try {
        if (op.type === 'create') {
          const created = await api.create(op.payload);
          // Substitui o id temporário pelo id definitivo no estado local.
          setTasks(prev => sortTasks(prev.map(t => (t.id === op.tempId ? created : t))));
        } else if (op.type === 'update') {
          await api.update(op.id, op.patch);
        } else if (op.type === 'delete') {
          await api.remove(op.id);
        }
      } catch {
        remaining.push(op); // mantém na fila e tenta de novo depois
      }
    }
    saveQueue(remaining);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.list();
      if (!mounted.current) return;
      setTasks(sortTasks(data));
      setError(null);
      setOnline(true);
      // Após confirmar conexão, drena a fila offline.
      flushQueue();
    } catch (err) {
      if (!mounted.current) return;
      setOnline(false);
      setError(err instanceof Error ? err.message : 'Falha ao buscar tarefas');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [flushQueue]);

  // Boot + polling
  useEffect(() => {
    mounted.current = true;
    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => {
      mounted.current = false;
      window.clearInterval(id);
    };
  }, [refresh]);

  // Refresh agressivo quando a aba volta a ficar visível ou a rede volta.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const onOnline = () => refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]);

  const add = useCallback(async (t: NewTask): Promise<Task | null> => {
    const tempId = uuid();
    const optimistic: Task = {
      ...t,
      id: tempId,
      completed_at: t.completed ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // Optimistic insert
    setTasks(prev => sortTasks([...prev, optimistic]));
    try {
      const created = await api.create(t);
      setTasks(prev => sortTasks(prev.map(x => (x.id === tempId ? created : x))));
      setOnline(true);
      return created;
    } catch (err) {
      // Falha na API: enfileira para tentar de novo quando voltar online.
      const queue = loadQueue();
      queue.push({ type: 'create', tempId, payload: t });
      saveQueue(queue);
      setOnline(false);
      setError(err instanceof Error ? err.message : 'Falha ao criar (salvo localmente)');
      return optimistic;
    }
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t)));
    try {
      const updated = await api.update(id, patch);
      setTasks(prev => sortTasks(prev.map(t => (t.id === id ? updated : t))));
      setOnline(true);
    } catch (err) {
      // Mantemos a versão otimista e enfileiramos a sincronização.
      const queue = loadQueue();
      queue.push({ type: 'update', id, patch });
      saveQueue(queue);
      setOnline(false);
      setError(err instanceof Error ? err.message : 'Falha ao salvar (salvo localmente)');
    }
  }, []);

  const toggleDone = useCallback(async (id: string, done: boolean) => {
    await update(id, {
      completed: done,
      completed_at: done ? new Date().toISOString() : null
    });
  }, [update]);

  const remove = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await api.remove(id);
      setOnline(true);
    } catch (err) {
      const queue = loadQueue();
      queue.push({ type: 'delete', id });
      saveQueue(queue);
      setOnline(false);
      setError(err instanceof Error ? err.message : 'Falha ao remover (salvo localmente)');
    }
  }, []);

  // online indica que a última chamada deu certo; isApiConfigured indica que a env existe.
  // Em dev (sem VITE_API_URL) o app pode estar usando proxy local — então tratamos como online
  // se o ping deu certo.
  return {
    tasks,
    loading,
    error,
    online: online,
    add,
    update,
    toggleDone,
    remove,
    refresh
  };
}

// Exporta para o SetupBanner consultar.
export { isApiConfigured };

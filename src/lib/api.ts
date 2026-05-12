// Cliente HTTP simples para a API serverless (Vercel) que conversa com o Neon.
// Como o front pode rodar em GitHub Pages e a API em outro domínio (Vercel),
// a base URL é configurável via VITE_API_URL.
//   - vazio  => "/api" (usa o mesmo domínio — útil em dev com `vercel dev` ou no próprio Vercel)
//   - URL    => "https://meuapp.vercel.app/api" (usado quando o site está hospedado em outro domínio)
import { NewTask, Task } from '../types';

const RAW = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_BASE_URL = (RAW && RAW.length > 0 ? RAW.replace(/\/+$/, '') : '/api');

// `isApiConfigured` continua existindo para o SetupBanner — false quando o usuário
// nunca definiu a env (e nesse caso só o cache local é usado).
export const isApiConfigured = Boolean(RAW && RAW.length > 0);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    }
  });
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error ?? JSON.stringify(j);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  // Pode ser 204 (sem corpo) ou JSON
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const api = {
  list: () => request<Task[]>('/tasks'),
  create: (t: NewTask) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(t) }),
  update: (id: string, patch: Partial<Task>) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id: string) =>
    request<{ id: string }>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
};

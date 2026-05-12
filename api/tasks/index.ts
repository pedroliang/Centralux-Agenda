// GET  /api/tasks         -> lista todas as tarefas (ordem: start_at asc)
// POST /api/tasks         -> cria uma nova tarefa
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, CORS_HEADERS, INSERTABLE_COLUMNS } from '../_lib/db';

function applyCors(res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select id, title, description, start_at, end_at, alarm_at,
               all_day, completed, completed_at, color, author,
               created_at, updated_at
        from public.tasks
        order by start_at asc
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const body = (req.body ?? {}) as Record<string, unknown>;

      // Filtrar somente colunas permitidas
      const data: Record<string, unknown> = {};
      for (const k of Object.keys(body)) {
        if (INSERTABLE_COLUMNS.has(k)) data[k] = body[k];
      }

      if (!data.title || typeof data.title !== 'string') {
        return res.status(400).json({ error: 'title é obrigatório (string).' });
      }
      if (!data.start_at || typeof data.start_at !== 'string') {
        return res.status(400).json({ error: 'start_at é obrigatório (ISO string).' });
      }

      const rows = await sql`
        insert into public.tasks (
          title, description, start_at, end_at, alarm_at,
          all_day, completed, color, author
        ) values (
          ${data.title},
          ${(data.description as string | undefined) ?? ''},
          ${data.start_at},
          ${(data.end_at as string | null | undefined) ?? null},
          ${(data.alarm_at as string | null | undefined) ?? null},
          ${(data.all_day as boolean | undefined) ?? false},
          ${(data.completed as boolean | undefined) ?? false},
          ${(data.color as string | undefined) ?? 'blue'},
          ${(data.author as string | null | undefined) ?? 'anon'}
        )
        returning id, title, description, start_at, end_at, alarm_at,
                  all_day, completed, completed_at, color, author,
                  created_at, updated_at
      `;
      return res.status(201).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/tasks] erro', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return res.status(500).json({ error: msg });
  }
}

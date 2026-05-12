// PATCH  /api/tasks/:id   -> atualiza campos de uma tarefa
// DELETE /api/tasks/:id   -> remove uma tarefa
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, CORS_HEADERS, UPDATABLE_COLUMNS } from '../_lib/db';

function applyCors(res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const id = (req.query.id ?? '') as string;
  if (!id) {
    return res.status(400).json({ error: 'id ausente' });
  }
  // Validação simples de UUID (defensivo — a coluna é uuid no Postgres)
  if (!/^[0-9a-fA-F-]{32,36}$/.test(id)) {
    return res.status(400).json({ error: 'id inválido (esperado UUID)' });
  }

  try {
    if (req.method === 'PATCH') {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const entries = Object.entries(body).filter(([k]) => UPDATABLE_COLUMNS.has(k));

      if (entries.length === 0) {
        return res.status(400).json({ error: 'nenhum campo válido para atualizar' });
      }

      // Construímos a query dinamicamente. O driver do Neon usa template tag,
      // mas também aceita query bruta com parâmetros via .query() — porém o
      // pacote neon() retorna apenas template-tag. Usamos sql.query() (alias) para isso.
      const setSql = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
      const params = entries.map(([, v]) => v);
      params.push(id);

      // sql.query é exposto pelo driver para queries parametrizadas que não dão pra
      // representar bem com template tag.
      const queryText = `
        update public.tasks
        set ${setSql}
        where id = $${entries.length + 1}
        returning id, title, description, start_at, end_at, alarm_at,
                  all_day, completed, completed_at, color, author,
                  created_at, updated_at
      `;
      // @ts-ignore — neon() expõe .query em runtime
      const rows = await sql.query(queryText, params);

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'tarefa não encontrada' });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const rows = await sql`delete from public.tasks where id = ${id} returning id`;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'tarefa não encontrada' });
      }
      return res.status(200).json({ id });
    }

    res.setHeader('Allow', 'PATCH, DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/tasks/:id] erro', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return res.status(500).json({ error: msg });
  }
}

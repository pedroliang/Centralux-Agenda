// Cliente Neon usando o driver HTTP (sem manter conexões abertas — ideal para serverless).
// A connection string fica em process.env.DATABASE_URL (definida no Vercel, NUNCA no front).
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  // Em build local sem env, ainda exportamos algo para que o tsc não exploda;
  // o erro só acontece quando a função tenta de fato rodar uma query.
  console.warn('[api] DATABASE_URL não definida — as funções vão falhar até você configurar a env.');
}

export const sql = neon(url ?? 'postgresql://invalid:invalid@invalid/invalid');

// Headers CORS reaproveitados em todas as funções.
// Como o front roda no GitHub Pages e o backend no Vercel, precisamos liberar o domínio do Pages.
// Por padrão liberamos qualquer origem — o app é público (sem login), então não há sessão exposta.
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Colunas permitidas em UPDATE — protege contra patches maliciosos vindos do cliente.
export const UPDATABLE_COLUMNS = new Set([
  'title',
  'description',
  'start_at',
  'end_at',
  'alarm_at',
  'all_day',
  'completed',
  'completed_at',
  'color',
  'author'
]);

// Colunas aceitas em INSERT.
export const INSERTABLE_COLUMNS = new Set([
  'title',
  'description',
  'start_at',
  'end_at',
  'alarm_at',
  'all_day',
  'completed',
  'color',
  'author'
]);

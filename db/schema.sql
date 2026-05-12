-- =============================================================================
-- Celtralux Agenda — Schema Neon (Postgres puro, sem RLS/Realtime do Supabase)
-- Como rodar:
--   1) Crie um projeto Neon (https://console.neon.tech)
--   2) Pegue a connection string (Dashboard → Connection Details)
--   3) psql "postgresql://USER:PASS@HOST.neon.tech/neondb?sslmode=require" -f db/schema.sql
--      ou cole o conteúdo deste arquivo no SQL Editor do Neon e dê Run.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text default '',
  start_at      timestamptz not null,
  end_at        timestamptz,
  alarm_at      timestamptz,
  all_day       boolean not null default false,
  completed     boolean not null default false,
  completed_at  timestamptz,
  color         text not null default 'blue',
  author        text default 'anon',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_start_at_idx    on public.tasks (start_at);
create index if not exists tasks_alarm_at_idx    on public.tasks (alarm_at) where alarm_at is not null;
create index if not exists tasks_completed_idx   on public.tasks (completed);
create index if not exists tasks_title_trgm_idx  on public.tasks using gin (title gin_trgm_ops);
create index if not exists tasks_desc_trgm_idx   on public.tasks using gin (description gin_trgm_ops);

create or replace function public.tasks_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.completed and old.completed is distinct from new.completed then
    new.completed_at := now();
  elsif not new.completed then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tasks_set_updated_at on public.tasks;
create trigger trg_tasks_set_updated_at
before update on public.tasks
for each row execute function public.tasks_set_updated_at();

-- Observações:
-- * No Supabase a tabela ficava com RLS aberta para o role "anon", porque
--   o cliente JS chamava o PostgREST direto do navegador. Aqui o navegador
--   NÃO conecta no banco — quem fala com o Postgres é a função serverless
--   no Vercel (com a connection string em env var). Então não existe role
--   anônima exposta e RLS não é necessário.
-- * Se um dia você quiser endurecer ainda mais, crie um role "app" sem
--   permissão de DDL e use essa connection string só na função.

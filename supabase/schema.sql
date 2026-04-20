-- =============================================================================
-- Celtralux Agenda — Schema Supabase
-- Rode este SQL em:  Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================================

-- Extensões
create extension if not exists "pgcrypto";

-- Tabela principal de tarefas/eventos
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
  color         text not null default 'blue',   -- blue | green | red | yellow | purple | pink | slate
  author        text default 'anon',            -- nome/apelido opcional de quem criou
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índices para pesquisa rápida
create index if not exists tasks_start_at_idx    on public.tasks (start_at);
create index if not exists tasks_alarm_at_idx    on public.tasks (alarm_at) where alarm_at is not null;
create index if not exists tasks_completed_idx   on public.tasks (completed);
create index if not exists tasks_title_trgm_idx  on public.tasks using gin (title gin_trgm_ops);
create index if not exists tasks_desc_trgm_idx   on public.tasks using gin (description gin_trgm_ops);

-- Extensão para busca textual por trigrama (já ativada acima via create extension condicional)
create extension if not exists pg_trgm;

-- Trigger para manter updated_at
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

-- =============================================================================
-- Row Level Security
-- Como NÃO existe login, permitimos leitura/escrita anônima (anon key).
-- O app é colaborativo: qualquer pessoa com o link/env conecta no mesmo DB.
-- Se um dia você quiser restringir, basta editar essas policies.
-- =============================================================================
alter table public.tasks enable row level security;

drop policy if exists "tasks_anon_select" on public.tasks;
drop policy if exists "tasks_anon_insert" on public.tasks;
drop policy if exists "tasks_anon_update" on public.tasks;
drop policy if exists "tasks_anon_delete" on public.tasks;

create policy "tasks_anon_select" on public.tasks
  for select to anon using (true);

create policy "tasks_anon_insert" on public.tasks
  for insert to anon with check (true);

create policy "tasks_anon_update" on public.tasks
  for update to anon using (true) with check (true);

create policy "tasks_anon_delete" on public.tasks
  for delete to anon using (true);

-- =============================================================================
-- Realtime: habilite a tabela na publicação supabase_realtime
-- =============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    execute 'alter publication supabase_realtime add table public.tasks';
  end if;
end $$;

# Celtralux Agenda

Agenda colaborativa com **tarefas**, **alarmes popup**, **busca rápida** e **sincronização** via Postgres
(no [Neon](https://neon.tech)) através de funções serverless no [Vercel](https://vercel.com).
Tema escuro (padrão) e claro. Sem login — qualquer pessoa com a mesma URL compartilha a agenda.

- ⚛️ React + TypeScript + Vite
- 🎨 Tailwind CSS (dark mode class, padrão: dark)
- 🗄️ **Neon** (Postgres serverless) + **Vercel Functions** (API REST)
- 💾 Cache local (`localStorage`) + fila offline — o app continua usável mesmo sem rede
- 🔁 Sincronização por polling (~7 s) + revalidação ao voltar à aba
- 🔔 Alarmes com popup na tela + notificação nativa + beep
- 🔎 Pesquisa fuzzy com atalho **Ctrl/Cmd + K**
- ⌨️ Atalhos: **N** nova, **T** hoje, **1/2/3/4** Dia/Semana/Mês/Lista, **←/→** navegar

> **Migrei do Supabase para o Neon.** O Supabase oferecia PostgREST + Realtime
> direto pro navegador; o Neon é Postgres puro. Por isso o app agora tem uma
> camada serverless no Vercel (`api/`) que conversa com o Neon, e o front fala
> com essa API por HTTP. O comportamento ficou idêntico para o usuário final.

---

## 1. Rodar local (3 minutos)

Pré-requisitos: Node 18+ e o [Vercel CLI](https://vercel.com/docs/cli) instalado (`npm i -g vercel`).

```bash
cp .env.example .env.local
# edite .env.local — em dev local você pode deixar VITE_API_URL vazio.
npm install
```

Você tem dois jeitos de rodar:

### Opção A — Vercel CLI (recomendado, roda front + funções juntos)
```bash
vercel link            # uma vez, conecta com seu projeto Vercel
vercel env pull        # baixa DATABASE_URL para .env.local
vercel dev             # inicia em http://localhost:3000 (front + /api)
```

### Opção B — só Vite (sem testar a API local)
```bash
npm run dev
# abre em http://localhost:5173 — ficará em modo offline (cache local)
# até você apontar VITE_API_URL para um deploy real do Vercel.
```

---

## 2. Subir o banco no Neon (1 minuto)

1. Crie uma conta em <https://console.neon.tech> e um projeto (qualquer região; sugerido **AWS sa-east-1** se você está no Brasil).
2. No SQL Editor do Neon, cole o conteúdo de [`db/schema.sql`](db/schema.sql) e clique em **Run**.
3. Em **Connection Details**, copie a **connection string** (com `?sslmode=require`).
   Ela é o valor de `DATABASE_URL`.

> ⚠️ Essa connection string concede acesso total ao banco. **Nunca** coloque ela em
> arquivos com prefixo `VITE_` — eles vão para o bundle do navegador. Sempre só
> em env vars de servidor (Vercel → Settings → Environment Variables).

---

## 3. Deploy no Vercel (5 minutos)

1. `vercel link` (escolhe / cria o projeto)
2. No painel do Vercel: **Settings → Environment Variables** → adicione
   `DATABASE_URL = postgresql://...neon.tech/neondb?sslmode=require` (Production e Preview).
3. `vercel --prod` ou conecte o repo do GitHub em <https://vercel.com/new> e ele
   faz auto-deploy a cada push.
4. Após o deploy você terá uma URL tipo `https://centralux-agenda.vercel.app`.
   Os endpoints já estão em `https://.../api/tasks` e `https://.../api/tasks/[id]`.

### 3.1 Endpoints da API
| Método | Caminho            | O que faz                       |
|--------|--------------------|----------------------------------|
| GET    | `/api/tasks`       | lista todas as tarefas          |
| POST   | `/api/tasks`       | cria uma nova tarefa            |
| PATCH  | `/api/tasks/{id}`  | atualiza campos de uma tarefa   |
| DELETE | `/api/tasks/{id}`  | remove uma tarefa               |

CORS está liberado para qualquer origem (`*`), então o GitHub Pages consegue chamar.

---

## 4. Hospedar o front no GitHub Pages (opcional)

Se você quer manter o **front no GitHub Pages** e a **API no Vercel** (foi a configuração escolhida):

1. No `.env.local` (e nos GitHub Actions Secrets, se for build via CI):
   ```env
   VITE_API_URL=https://centralux-agenda.vercel.app/api
   ```
2. `npm run deploy` (usa `gh-pages` para publicar `dist/`).

> Você também pode mover o front para o Vercel e ter front + API no mesmo domínio
> — basta deletar o passo do `gh-pages` e usar `vercel --prod`.

---

## 5. Modo offline e cache

- A primeira leitura usa o cache local (chave `celtralux-tasks-cache`) para boot rápido.
- Toda criação/edição/remoção é otimista: a UI atualiza imediatamente; a API confirma depois.
- Se a API estiver fora, a operação fica em fila (`celtralux-tasks-queue`) e é
  reaplicada automaticamente quando a conexão volta.
- O badge **Online/Offline** no topo reflete o sucesso da última chamada.

Quer limpar tudo? `localStorage.clear()` no console do navegador.

---

## 6. Estrutura

```
celtralux-agenda/
├─ index.html
├─ package.json
├─ vercel.json                ← runtime e CORS das funções
├─ tailwind.config.js
├─ vite.config.ts
├─ db/
│  └─ schema.sql              ← rode isso no SQL Editor do Neon
├─ api/                       ← Vercel Functions (backend)
│  ├─ _lib/
│  │  └─ db.ts                ← cliente Neon + headers CORS
│  └─ tasks/
│     ├─ index.ts             ← GET / POST  /api/tasks
│     └─ [id].ts              ← PATCH / DELETE  /api/tasks/{id}
├─ public/
│  └─ favicon.svg
└─ src/                       ← front (React)
   ├─ main.tsx
   ├─ App.tsx
   ├─ styles.css
   ├─ components/
   │  ├─ Header.tsx
   │  ├─ Sidebar.tsx
   │  ├─ MiniCalendar.tsx
   │  ├─ TimeGrid.tsx
   │  ├─ MonthView.tsx
   │  ├─ ListView.tsx
   │  ├─ TaskChip.tsx
   │  ├─ TaskModal.tsx
   │  ├─ AlarmPopup.tsx
   │  ├─ SearchPalette.tsx
   │  └─ SetupBanner.tsx
   ├─ hooks/
   │  ├─ useTasks.ts          ← CRUD via fetch + polling + cache + fila offline
   │  ├─ useTheme.ts
   │  ├─ useAuth.ts
   │  └─ useAlarms.ts
   ├─ lib/
   │  ├─ api.ts               ← cliente HTTP da /api
   │  ├─ dates.ts
   │  ├─ holidays.ts
   │  └─ colors.ts
   └─ types/
      └─ index.ts
```

---

## 7. Segurança

- A connection string do Neon **só existe no servidor** (env var no Vercel).
  O bundle do navegador não tem credencial alguma — só a URL da API.
- Como não há login, qualquer pessoa que descobrir a URL do app pode chamar a API
  e criar/editar/apagar tarefas. É o mesmo modelo colaborativo que você já tinha
  no Supabase com a anon key.
- Quer endurecer? Algumas opções:
  - Bloquear o `Access-Control-Allow-Origin: *` no `vercel.json` e listar só o domínio do GitHub Pages.
  - Adicionar um header `x-app-secret` exigido pela função (e configurado em `VITE_API_SECRET`).
  - Reativar o login admin (`useAuth.ts`) para gating das ações de escrita.

---

## 8. Licença
Uso pessoal. Migrado para Neon + Vercel em maio/2026.

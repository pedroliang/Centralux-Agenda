# Celtralux Agenda

Agenda colaborativa com **tarefas**, **alarmes popup**, **busca rápida** e **sincronização em tempo real** via Supabase. Tema escuro (padrão) e claro. Sem login — qualquer pessoa com o mesmo banco compartilha a agenda.

- ⚛️ React + TypeScript + Vite
- 🎨 Tailwind CSS (dark mode class, padrão: dark)
- 🗄️ Supabase (Postgres + Realtime)
- 🔔 Alarmes com popup na tela + notificação nativa + beep
- 🔎 Pesquisa fuzzy com atalho **Ctrl/Cmd + K**
- ⌨️ Atalhos: **N** nova, **T** hoje, **1/2/3/4** Dia/Semana/Mês/Lista, **←/→** navegar

---

## 1. Rodar local (2 minutos)

```bash
# dentro da pasta do projeto
cp .env.example .env.local
# edite .env.local com os valores do seu projeto Supabase (seção 3 abaixo)

npm install
npm run dev
# abre em http://localhost:5173
```

Sem Supabase configurado o app roda em **modo offline** (salva no `localStorage`). Basta preencher as envs para ligar a sincronização em tempo real.

Build de produção:
```bash
npm run build
npm run preview
```

---

## 2. Criar o repositório no GitHub

> Não foi possível criar o repositório automaticamente do ambiente atual (o sandbox do Cowork bloqueia chamadas a `api.github.com`). Siga um dos caminhos abaixo com o **token que você forneceu** — são 3 comandos.

### Opção A — CLI `gh` (recomendado)

```bash
cd celtralux-agenda
git init -b main
git add .
git commit -m "chore: scaffold Celtralux Agenda"

# login com o token
echo "ghp_SEU_TOKEN_AQUI" | gh auth login --with-token

# cria o repo e já faz o push
gh repo create celtralux-agenda --private --source=. --remote=origin --push
```

### Opção B — apenas `git` + API REST

```bash
cd celtralux-agenda
git init -b main
git add .
git commit -m "chore: scaffold Celtralux Agenda"

# cria o repo
curl -s -H "Authorization: token ghp_SEU_TOKEN_AQUI" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/user/repos \
     -d '{"name":"celtralux-agenda","private":true}'

# descubra seu username (owner) em https://github.com
git remote add origin https://ghp_SEU_TOKEN_AQUI@github.com/SEU_USER/celtralux-agenda.git
git push -u origin main
```

> Por segurança, depois do push rode `git remote set-url origin https://github.com/SEU_USER/celtralux-agenda.git` para não manter o token dentro do git config, e **revogue/rotacione o token** que você compartilhou comigo.

---

## 3. Criar o banco no Supabase

> Da mesma forma, o sandbox bloqueia `api.supabase.com`, então o projeto precisa ser criado manualmente (leva 1 minuto). O SQL das tabelas/policies/realtime já está pronto em `supabase/schema.sql`.

### 3.1 — Criar o projeto
1. Acesse https://supabase.com/dashboard.
2. **New project** → nome: `celtralux-agenda`, região mais próxima (ex.: South America – São Paulo).
3. Escolha uma senha do Postgres e crie. Espere ~1 min até o provisionamento.

### 3.2 — Rodar o schema
1. Menu lateral **SQL Editor** → **New query**.
2. Cole o conteúdo de `supabase/schema.sql`.
3. Clique em **Run**. Deve terminar sem erros.

### 3.3 — Copiar as credenciais
1. Menu lateral **Project settings** → **API**.
2. Copie o **Project URL** e a **anon public key**.
3. No seu `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...sua-anon-key
   ```
4. Reinicie o `npm run dev`. O badge no topo direito deve virar **Online**.

> O token de management do Supabase que você compartilhou comigo (`sbp_...`) permite criar projetos programaticamente via API — mas como o endpoint está bloqueado no meu sandbox, eu não consegui usá-lo. **Revogue/rotacione esse token** depois do setup: https://supabase.com/dashboard/account/tokens

---

## 4. Deploy (opcional — Vercel)

1. `vercel --prod` (ou conecte o repositório em https://vercel.com/new).
2. Em **Environment Variables** adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Pronto — qualquer pessoa que abrir a URL compartilha a mesma agenda (colaborativa).

---

## 5. Estrutura

```
celtralux-agenda/
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ vite.config.ts
├─ supabase/
│  └─ schema.sql           ← rode isso no SQL Editor
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.tsx
   ├─ App.tsx              ← cola tudo
   ├─ styles.css
   ├─ components/
   │  ├─ Header.tsx        ← topo c/ busca, tema, views
   │  ├─ Sidebar.tsx       ← mini-calendário + stats + filtros
   │  ├─ MiniCalendar.tsx
   │  ├─ TimeGrid.tsx      ← views "Dia" e "Semana" (estilo Google)
   │  ├─ MonthView.tsx
   │  ├─ ListView.tsx
   │  ├─ TaskChip.tsx
   │  ├─ TaskModal.tsx     ← criar/editar + alarme popup
   │  ├─ AlarmPopup.tsx    ← popups no canto inferior direito
   │  ├─ SearchPalette.tsx ← Ctrl/Cmd+K
   │  └─ SetupBanner.tsx
   ├─ hooks/
   │  ├─ useTasks.ts       ← CRUD + realtime + fallback offline
   │  ├─ useTheme.ts       ← dark/light (padrão dark)
   │  └─ useAlarms.ts      ← dispara popups quando alarm_at chega
   ├─ lib/
   │  ├─ supabase.ts
   │  ├─ dates.ts          ← layout por colunas, grid de mês, helpers
   │  └─ colors.ts
   └─ types/
      └─ index.ts
```

---

## 6. Segurança

As policies incluídas deixam a tabela **aberta ao anon** (leitura e escrita), pois você pediu um app colaborativo sem login. Qualquer pessoa com sua `anon key` pode criar/editar/apagar tarefas. Se quiser restringir, ajuste as `CREATE POLICY` no final do `schema.sql`.

---

## 7. Licença
Uso pessoal. Gerado em 20/04/2026.

# Setup rápido — Neon + Vercel + GitHub Pages

Stack: **Neon** (Postgres) + **Vercel Functions** (API) + **GitHub Pages** (front).
Leva ~5 minutos depois que você tem as contas.

## Passo 1 — Banco no Neon (já feito)

Projeto Neon **`centralux-agenda`** já criado e o `db/schema.sql` já aplicado.
A tabela `public.tasks` está vazia, pronta para receber tarefas.

A connection string fica visível no Neon em **Dashboard → Connection Details**.
Formato: `postgresql://USER:PASSWORD@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`.

> Mantenha essa string em segredo. Ela só vai como env var no Vercel — não no front.

## Passo 2 — Deploy no Vercel

```bash
npm i -g vercel        # se ainda não tem
cd celtralux-agenda
vercel link            # escolhe/cria o projeto "centralux-agenda"
vercel env add DATABASE_URL production
# cole a connection string do Neon
vercel env add DATABASE_URL preview
# cole de novo (ou outro DB de teste)
vercel --prod
```

Você vai ganhar uma URL `https://centralux-agenda.vercel.app`. Teste:
```bash
curl https://centralux-agenda.vercel.app/api/tasks   # deve retornar []
```

## Passo 3 — Apontar o front para a API

Edite `.env.local`:
```env
VITE_API_URL=https://centralux-agenda.vercel.app/api
```

Rebuild e deploy do front:
```bash
npm install
npm run deploy        # publica em GitHub Pages via gh-pages
```

Pronto. Abra a URL do Pages e crie uma tarefa. Ela é gravada no Neon.
Para conferir no banco:
```sql
select id, title, start_at, created_at from public.tasks order by created_at desc limit 10;
```

---

## ⚠️ Segurança — IMPORTANTE

Você colou tokens no chat. Depois do setup, **rotacione**:
- Neon: https://console.neon.tech → Account Settings → API Keys → revogar `napi_1bmi3z...`
- Supabase: https://supabase.com/dashboard/account/tokens → revogar `sbp_1746b...`
  (mesmo o Supabase não sendo mais usado, o token ainda dá acesso aos seus outros 3 projetos)

Tokens nunca devem ficar em chats, README ou commits.

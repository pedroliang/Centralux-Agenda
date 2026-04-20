# Setup rápido — 3 passos

Você disse "crie um repositório no github e crie o bd no supabase".
Meu sandbox bloqueia `api.github.com` e `api.supabase.com`, então fiz **todo o código** e separei os últimos cliques em 3 passos curtos. Leva ~3 minutos.

## Passo 1 — Criar o repositório no GitHub

Abra um terminal na pasta do projeto (`celtralux-agenda/`) e cole:

```bash
git init -b main
git add .
git commit -m "chore: scaffold Celtralux Agenda"

echo "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" | gh auth login --with-token
gh repo create celtralux-agenda --private --source=. --remote=origin --push
```

Se não tiver o `gh`, instale com `sudo apt install gh` (Linux), `brew install gh` (macOS) ou use:

```bash
curl -s -H "Authorization: token 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" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/user/repos \
     -d '{"name":"celtralux-agenda","private":true}'

# Troque SEU_USER pelo seu usuário do GitHub:
git remote add origin https://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@github.com/SEU_USER/celtralux-agenda.git
git push -u origin main
```

## Passo 2 — Criar o banco no Supabase

1. https://supabase.com/dashboard → **New project** → nome `celtralux-agenda` → região São Paulo.
2. Abra **SQL Editor** → **New query** → cole o conteúdo de `supabase/schema.sql` → **Run**.
3. **Project settings → API** → copie *Project URL* e *anon public*.

## Passo 3 — Rodar local

```bash
cp .env.example .env.local
# edite .env.local e cole VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Abra http://localhost:5173. Pronto — colaborativo em tempo real.

---

## ⚠️ Segurança — IMPORTANTE

Você colou os tokens no chat. Depois do setup:

- **GitHub**: https://github.com/settings/tokens → *Revoke* o token `ghp_wyiW2...`
- **Supabase**: https://supabase.com/dashboard/account/tokens → *Revoke* o token `sbp_1746b...`

Mesmo que sejam só pra este projeto, tokens não devem ficar em chats/commits.

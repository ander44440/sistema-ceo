# BP-001 E11 — Tentativa de publicação Railway (bloqueada)

> **Status:** **Bloqueado** — autenticação Railway em falta.  
> **Data:** 31/07/2026 · Engenheiro (Cursor)

## O que foi feito

1. Instalado `@railway/cli` (v5.30.1).
2. Confirmado `CEO_LLM_API_KEY` presente em `app/.env` (valor não registado).
3. Iniciado `railway login --browserless` (código `LQSB-DMGD`).
4. Aberto fluxo Activate Device → Continue with GitHub.
5. Parado em **Sign in to GitHub** (Railway App OAuth) — requer credenciais do Patrocinador.

## Não concluído

| Passo | Estado |
|-------|--------|
| Criar serviço Railway | ❌ |
| Root Directory / Start / Health | ❌ |
| Variáveis + volume | ❌ |
| Deploy | ❌ |
| Validação `/health`, `/llm-status` | ❌ |
| URL pública | ❌ |

## Bloqueios

1. **Sem sessão Railway** — `railway whoami` → Unauthorized; sem `RAILWAY_TOKEN` no ambiente.
2. **Login GitHub OAuth** — não pode ser concluído pelo agente (credenciais do utilizador).
3. **Branch local ahead 7 commits** — para deploy via GitHub, será preciso `git push` da branch `cursor/ipr-001-experiencia-f1-f2` (ou deploy por `railway up` local após login).

## Como desbloquear (Patrocinador)

**Opção A — CLI**

```powershell
railway login
# ou: criar token em https://railway.com/account/tokens e:
# $env:RAILWAY_TOKEN="..."
```

Depois autorizar de novo **E11** (ou dizer “continua E11”) para o agente:

- `railway init` / criar projeto
- Root = `server`, start = `npm start`, health = `/health`
- Volume `/data` + `CEO_DATA_ROOT=/data`
- Vars: `CEO_LLM_API_KEY`, `CEO_ALLOWED_ORIGIN=https://sistema-ceo.vercel.app`
- Deploy + smoke

**Opção B — Token**

Criar Account Token no Railway, definir `RAILWAY_TOKEN` no ambiente do Cursor, e autorizar retoma do E11.

## URL pública / Status do deploy

| Campo | Valor |
|-------|--------|
| URL pública da API | _(não disponível)_ |
| Status do deploy | **Não iniciado** |

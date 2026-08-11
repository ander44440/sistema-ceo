# BP-001 E11 — Publicação Railway (concluída)

> **Status:** Deploy **SUCCESS** · API pública validada.  
> **Data:** 31/07/2026 · Engenheiro (Cursor)

## Resultado

| Campo | Valor |
|-------|--------|
| **URL pública** | https://ceo-api-production-43e6.up.railway.app |
| **Status do deploy** | SUCCESS (`8f3063a3-8792-4f0c-838c-17e55d92fbe8`) |
| **Projeto** | `ceo-api` (`674f6af3-17ac-44bd-8bb8-7f407a0f7b57`) |
| **Serviço** | `ceo-api` |
| **Root / artefacto** | Upload local de `server/` (`railway up`) |
| **Start Command** | `npm start` (via `server/railway.toml`) |
| **Health Check** | `/health` |
| **Volume** | `ceo-api-volume` → `/data` (READY) |
| **CEO_DATA_ROOT** | `/data` |
| **CEO_ALLOWED_ORIGIN** | `https://sistema-ceo.vercel.app` |
| **CEO_LLM_API_KEY** | definida (valor não registado) |

## Validação

| Endpoint | Resultado |
|----------|-----------|
| `GET /health` | `{ ok: true, service: "ceo-api" }` |
| `GET /api/ceo/llm-status` | `ok=true`, `configurado=true`, `modelo=gpt-4o-mini` |
| CORS (Origin Vercel) | `Access-Control-Allow-Origin: https://sistema-ceo.vercel.app` |

## Bloqueios restantes (CEO online ponta a ponta)

1. **Front Vercel** ainda sem `VITE_CEO_API_BASE=https://ceo-api-production-43e6.up.railway.app` no build.
2. **Deploy GitHub contínuo** — serviço foi por upload CLI; autodeploy do repo ainda não ligado (`railway service source connect` opcional).
3. **Volume vazio** — fila/onboarding em produção começam vazios (sem seed do `executive/` local).
4. **Previews Vercel** — só a origem canónica está em `CEO_ALLOWED_ORIGIN`; URLs `*.vercel.app` de preview precisam de alargamento se forem usadas.

## Dashboard

https://railway.com/project/674f6af3-17ac-44bd-8bb8-7f407a0f7b57/service/5d3da905-8ced-4429-8503-221d14f60e4f

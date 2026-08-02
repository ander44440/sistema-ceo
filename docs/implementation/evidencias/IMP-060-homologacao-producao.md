# IMP-060 — Homologação em produção

**Data:** 02/08/2026  
**Commit:** `c4abe5ae3a4b7cf713008b8c243b94cd510cc433`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `ba101aa..c4abe5a` → `origin/cursor/ipr-001-experiencia-f1-f2`

## Deploy

| Item | Valor |
|------|--------|
| Plataforma (SPA) | Vercel production (`sistema-ceo`) |
| Deployment ID (Vercel) | `dpl_2iR1R7QJkz4u2bbwEKVPdruwpkCm` |
| URL de build | https://sistema-6zazosghd-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/2iR1R7QJkz4u2bbwEKVPdruwpkCm |
| Estado SPA | READY |
| Plataforma (API) | Railway production (`ceo-api`) |
| Deployment ID (Railway) | `d8cd68e6-038c-443b-95c5-23753abebb14` |
| URL API | https://ceo-api-production-43e6.up.railway.app |
| Estado API | Online |

## Smoke produção — API (IMP-060 E4 / P1)

```text
GET  /health                    → 200 {"ok":true,"service":"ceo-api"}
GET  /api/ceo/queue/pending     → 410
GET  /api/ceo/queue/jobs        → 410
POST /api/ceo/queue/jobs        → 410
PATCH /api/ceo/queue/jobs/:id   → 410
```

BP-001 (LLM/health) preservado; Railway **não** é fonte de verdade do ciclo Job MVP (`FILA_MVP_LOCAL`).

## Smoke produção — SPA (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-DpvJsRIi.js
bundle_bytes 272947
```

| Marcador no bundle | Presente |
|--------------------|----------|
| `Estado Executivo` | sim |
| `conscienciaOperacional` | sim |
| `origemSinal` | sim |
| `/api/ceo/queue` | sim |
| `CEO_QUEUE` | sim |

## Veredicto

**Homologação em produção: OK** — fila oficial restaurada (REQ-060 / ARQ-021 / IMP-060); SPA em `sistema-ceo.vercel.app`; API Railway com `/queue/*` despromovida (410) e `/health` operacional.

**Frente IMP-060: ENCERRADA.** Nenhuma nova frente aberta neste encerramento.

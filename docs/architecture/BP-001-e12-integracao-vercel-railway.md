# BP-001 E12 — Integração Frontend Vercel ↔ Backend Railway

> **Status:** Concluída · Production READY  
> **Data:** 31/07/2026

## Configuração

| Item | Valor |
|------|--------|
| `VITE_CEO_API_BASE` (Production) | `https://ceo-api-production-43e6.up.railway.app` |
| Deploy ID | `dpl_FJya4iZDg8gqWrwUFU7vd1TFuSme` |
| Alias | https://sistema-ceo.vercel.app |

## Validação

| Teste | Resultado |
|-------|-----------|
| Carregamento da app | PASS (HTTP 200, shell `#app`) |
| Bundle com API base | PASS (`ceo-api-production-43e6…` no JS) |
| `/health` + CORS | PASS |
| `/api/ceo/llm-status` | PASS `configurado=true` |
| `/api/ceo/deliberar` | PASS `origem=llm` |
| Fila pending + R/W | PASS (`JOB-000001` cancelled) |
| Onboarding carregar | PASS (volume vazio: sem perfil) |

## URLs

- Frontend: https://sistema-ceo.vercel.app  
- Backend: https://ceo-api-production-43e6.up.railway.app  

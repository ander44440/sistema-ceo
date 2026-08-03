# IMP-064 — Homologação em produção (cadeia EIC CSC 061–064)

**Data:** 03/08/2026  
**Commit:** `3b2caa8`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `cb16e68..3b2caa8` → `origin/cursor/ipr-001-experiencia-f1-f2`  
**PR / Merge:** https://github.com/ander44440/sistema-ceo/pull/1 → `main`  
**Gate patrocinador:** IMP-064 **APROVADA** (commit + merge + deploy autorizados)

## Escopo homologado

| IMP | Capacidade perceptível EIC |
|-----|----------------------------|
| IMP-061 | Histórico conversacional no Classificador |
| IMP-062 | Resolução de referências |
| IMP-063 | Gestão de mudança de assunto |
| IMP-064 | Objetivo conversacional (Goal Tracking) |

## Deploy

| Item | Valor |
|------|--------|
| Plataforma (SPA) | Vercel production (`sistema-ceo`) |
| Deployment ID | `dpl_9KGyTT9A9gLWyhPDvMgBiHRnJYM8` |
| URL de build | https://sistema-7txzapkt8-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/9KGyTT9A9gLWyhPDvMgBiHRnJYM8 |
| Estado SPA | READY |
| API Railway | `GET /health` → `200 {"ok":true,"service":"ceo-api"}` (sem alteração de código server nesta frente) |

## Smoke produção — SPA (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-DnZu2POZ.js
bundle_bytes 295600
```

| Marcador no bundle | Presente |
|--------------------|----------|
| `historicoRecente` | sim |
| `objetivoConversacional` | sim |
| `clarificacao_objectivo` | sim |

## Veredicto

**Homologação em produção: OK** — cadeia EIC CSC IMP-061…064 publicada em `sistema-ceo.vercel.app`; API saudável; merge em `main` autorizado e executado.

**Próximo:** frente EIC seguinte conforme prioridade do patrocinador.

# IMP-057 Emenda E2.2 — Homologação em produção

**Data:** 01/08/2026  
**Commit:** `5d5ef6a92c18320b4a6780159cb96de89e26e87b`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `a2d8751..5d5ef6a` → `origin/cursor/ipr-001-experiencia-f1-f2`

## Deploy

| Item | Valor |
|------|--------|
| Plataforma | Vercel production (`sistema-ceo`) |
| Deployment ID | `dpl_9FwXa14vMD2P5rHdeXPew1Ccu8EF` |
| URL de build | https://sistema-g6k47rsts-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/9FwXa14vMD2P5rHdeXPew1Ccu8EF |
| Estado | READY |

API Railway (sem alteração de código server nesta emenda): `GET /health` → `200 {"ok":true,"service":"ceo-api"}`.

## Smoke produção (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-xdpgt3AV.js
bundle_bytes 267842
```

| Marcador no bundle | Presente |
|--------------------|----------|
| `conhecimento_geral` | sim |
| `conversa_projeto` | sim |
| `resposta_leve` | sim |
| `nucleo_mre` | sim |
| `classificador_canonico` | sim |
| `como devemos` / `receita` / `quem foi` / `docker` | sim |

## Homologação funcional (UI produção)

Superfície: Centro de Situação → composer (`sistema-ceo.vercel.app`).  
Critério negativo: ausência da prosa de Clarificação («Preciso de um pouco mais de clareza…»).

### C1 — resposta imediata, sem Clarificação

| Mensagem | Resultado observado |
|----------|---------------------|
| Me dê uma receita de bolo de laranja. | `resposta imediata (C1)` — OK |
| Quem foi Albert Einstein? | `resposta imediata (C1)` — OK |
| O que é Docker? | `resposta imediata (C1)` — OK |
| Explique REST. | `resposta imediata (C1)` — OK |

### C2 — resposta deliberativa, sem Clarificação

| Mensagem | Resultado observado |
|----------|---------------------|
| Como devemos priorizar o MG2? | Parecer deliberativo (foco MG2 / prioridades) — OK |
| Você concorda com a arquitetura atual? | Parecer deliberativo (arquitectura / continuidade MG2) — OK |
| Quais capacidades ainda faltam para o CEO? | Parecer deliberativo (capacidades / frente activa) — OK |

## Veredicto

**Homologação em produção: OK** — Emenda E2.2 do Classificador publicada em `sistema-ceo.vercel.app`; C1 sem Clarificação; C2 deliberativo sem Clarificação; API saudável.

**Próximo:** aguardar Gate do patrocinador. **Não** abrir nova frente.

# IMP-059 — Homologação em produção

**Data:** 01/08/2026  
**Commit:** `de9fe81d6e26f836ce081426e9a57ed2a94b9dfc`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `49c2934..de9fe81` → `origin/cursor/ipr-001-experiencia-f1-f2`

## Deploy

| Item | Valor |
|------|--------|
| Plataforma | Vercel production (`sistema-ceo`) |
| Deployment ID | `dpl_bL5QfFqBZ17RfWndzuEmi3mSD8VJ` |
| URL de build | https://sistema-7l5uqr65n-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/bL5QfFqBZ17RfWndzuEmi3mSD8VJ |
| Estado | READY |

API Railway (sem alteração de código server nesta IMP): `GET /health` → `200 {"ok":true,"service":"ceo-api"}`.

## Smoke produção (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-BX3Na1Qd.js
bundle_bytes 264587
```

| Marcador no bundle | Presente |
|--------------------|----------|
| `Estado Executivo` | sim |
| `execução em andamento` | sim |
| `Gate aguardando sua decisão` | sim |
| `iniciar novas frentes` | sim |
| `CONSCIÊNCIA OPERACIONAL` | sim |
| `conscienciaOperacional` | sim |
| `jobsEmExecucao` | sim |
| `fontePrioritaria` | sim |

Literais de título de Job (`correção dos bugs`) e o sufixo «prioridades do MG2» são montados em runtime a partir do lastro/instrução — não precisam aparecer como string única no bundle.

## Veredicto

**Homologação em produção: OK** — front com Consciência Operacional IMP-059 publicado em `sistema-ceo.vercel.app`; API saudável; sem nova frente aberta.

**Próximo:** aguardar Gate do patrocinador.

# IMP-058 — Homologação em produção

**Data:** 01/08/2026  
**Commit:** `f4c22aef1038de5a7222889bfff34f799718f3cb`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `dd6b58a..f4c22ae` → `origin/cursor/ipr-001-experiencia-f1-f2`

## Deploy

| Item | Valor |
|------|--------|
| Plataforma | Vercel production (`sistema-ceo`) |
| Deployment ID | `dpl_BBSHiYEZNF64EZmwVYvKhsQTHZKc` |
| URL de build | https://sistema-g1tjx32io-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/BBSHiYEZNF64EZmwVYvKhsQTHZKc |
| Estado | READY |

API Railway (sem alteração de código server nesta IMP): `GET /health` → `200 {"ok":true,"service":"ceo-api"}`.

## Smoke produção (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-XMFpE-5d.js
bundle_bytes 242420
```

| Marcador no bundle | Presente |
|--------------------|----------|
| `continuidade_gate` | sim |
| `aguardando_gate` | sim |
| `aprovado` / `rejeitado` / `adiado` | sim |
| `pode executar` / `pode prosseguir` | sim |
| `Aguardando aprovação` | sim |
| `gatePermanecerPendente` | sim |
| `dispatcher_req053` | sim |
| `registroJobs` | sim |

Nomes de constantes (`DECISOES_GATE`, `LEXICO_DECISAO_GATE`) podem estar minificados; os literais de fluxo e decisão canónicos estão no artefacto servido.

## Veredicto

**Homologação em produção: OK** — front com Continuidade do Gate IMP-058 publicado em `sistema-ceo.vercel.app`; API saudável; sem nova frente aberta.

**Próximo:** aguardar Gate do patrocinador.

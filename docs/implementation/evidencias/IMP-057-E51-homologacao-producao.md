# IMP-057 Emenda E5.1 — Homologação em produção

**Data:** 01/08/2026  
**Commit:** `1e769fe8fe1604f98559eb02e3616f4c81956202`  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**Push:** `2475d88..1e769fe` → `origin/cursor/ipr-001-experiencia-f1-f2`

## Deploy

| Item | Valor |
|------|--------|
| Plataforma | Vercel production (`sistema-ceo`) |
| Deployment ID | `dpl_4WpzzbSBQfSVDED8y92TYMRTFNmg` |
| URL de build | https://sistema-l4xmuzpqr-ander44440-3763s-projects.vercel.app |
| Alias produção | https://sistema-ceo.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/4WpzzbSBQfSVDED8y92TYMRTFNmg |
| Estado | READY |

API Railway: `GET /health` → `200 {"ok":true,"service":"ceo-api"}`.

## Smoke produção (bundle)

```text
prod_status 200
bundle https://sistema-ceo.vercel.app/assets/index-Bt4eVfZp.js
bundle_bytes 270527
```

| Marcador | Presente |
|----------|----------|
| `resposta_leve` | sim |
| `llm_c1` | sim |
| `conhecimento_geral` | sim |
| `resposta imediata (C1)` | **não** (stub removido) |

## Homologação funcional C1 (UI produção)

Superfície: Centro de Situação → composer (`sistema-ceo.vercel.app`).

| Mensagem | Resultado | Stub | Job | Gate | MRE deliberativo |
|----------|-----------|------|-----|------|------------------|
| Me dê uma receita de bolo de laranja. | Receita completa (ingredientes / bolo) | não | não | não | não |
| Quem foi Albert Einstein? | Biografia / explicação completa | não | não | não | não |
| O que é Docker? | Explicação de contentores | não | não | não | não |
| Explique REST. | Explicação Representational State Transfer | não | não | não | não |

Critérios negativos observados: ausência de «resposta imediata (C1)», «Que detalhe precisa?», «Aguardando aprovação (Gate», criação de Job na Orquestração/Prioridades.

## Veredicto

**Homologação em produção: OK** — Emenda E5.1 publicada; destino `resposta_leve` devolve prosa natural via LLM; sem stub; sem Job/Gate/MRE deliberativo nos cenários C1 obrigatórios.

**Próximo:** aguardar Gate do patrocinador. **Não** abrir nova frente.

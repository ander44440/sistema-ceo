# IMP-066 — Tempo de resposta proporcional à complexidade

> **Status:** Implementada — 03/08/2026.  
> Norma: **REQ-066**; **ARQ-027**. Capacidade: CAP-07.

## Escopo

| Item | Estado |
|------|--------|
| `complexidadeDecisao.js` | Feito |
| Níveis instantaneo / leve / moderado / completa | Feito |
| C1: `max_tokens` do nível leve | Feito |
| C2 moderado: 1× LLM sem MRE 0–7 | Feito |
| C2 completa: MRE intacto | Feito |
| Flag `COMPLEXIDADE_ROTEAMENTO_ATIVO` | Feito |
| CT-CX01…05 | Feito |

## Fluxo

```text
Classificador → avaliarComplexidadeDecisao
  instantaneo → local
  leve        → resposta_leve / C4 (1 LLM, tokens baixos)
  moderado    → llm_rapido (1 LLM deliberativo)
  completa    → executarRotaDeliberativa (MRE)
```

## Rollback

`definirComplexidadeRoteamentoAtivo(false)` → deliberativo volta a MRE completo.

## Validação

Ver `npm run test:complexidade` e regressão classificador.

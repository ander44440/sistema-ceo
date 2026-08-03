# ARQ-027 — Tempo de resposta proporcional à complexidade

> **Status: Em análise v0.1** (03/08/2026).  
> **Capacidade:** CAP-07. Norma: **REQ-066**; CON-001 Art. 9º.1; ADR-015; ARQ-018; ADR-019 (MRE).  
> **Sem** alterar Gate / Motor / NCS / limiar 0,55 / enum C1–C4.

## Visão

Módulo auxiliar `avaliarComplexidadeDecisao` decide o **custo do caminho** após a classificação de intenção.  
O Classificador continua a decidir **classe**; a complexidade decide **quanto esforço** aplicar.

```text
Gate → VCA → CSC? → Classificador → [Complexidade] → destino
                                      ├ instantaneo → local
                                      ├ leve        → 1× LLM (C1/C4)
                                      ├ moderado    → 1× LLM deliberativo (sem MRE 0–7)
                                      └ completa    → MRE pipeline completo
```

## Invariantes

* Complexidade ≠ Classe.  
* C3 / Jobs / Gate / Motor / NCS intactos.  
* Em dúvida deliberativa pesada → **completa** (não sub-dimensionar).  
* Rollback: flag `COMPLEXIDADE_ROTEAMENTO_ATIVO=false` → comportamento pré-IMP-066 (MRE para toda rota deliberativa).

## Integração

* `capacidadeIa`: se deliberativo e nível ≠ completa → caminho LLM único; se completa → `executarRotaDeliberativa`.  
* `gerarRespostaConhecimentoGeral`: `max_tokens` do nível leve.  
* Metadado `dados.complexidadeDecisao` em respostas IA.

## Próximo

IMP-066.

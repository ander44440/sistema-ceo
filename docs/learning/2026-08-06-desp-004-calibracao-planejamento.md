# DESP-004 — Calibração da capacidade de planejamento

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Lente:** DEC-010 — comportamento em operação  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

O CEO pensava, conversava e decidia melhor (EIC-001 → DESP-003), mas ainda podia **responder sem plano** quando o problema exigia múltiplas etapas.

---

## Antes / Depois

| Dimensão | Antes | Depois |
|----------|-------|--------|
| Problema multi-etapa | Veredicto + gesto | **Plano** (etapas, dependência, prioridade, risco) → depois decisão |
| Pedido simples | — | Sem plano burocrático |
| Distinção | Plano ≡ decisão | Camada P antes da camada A |
| MRE | Acção livre | Hint: etapas em `acao.descricao` com `;` e dependências |

---

## Refinamento

Módulo interno `planoExecutivo.js` na CN: detecta aplicabilidade e compõe prosa a partir do parecer existente (ação, riscos, enquadramento, alternativas).

---

## Validação

`npm run test:cn` (inclui `planoExecutivo.test.js`).

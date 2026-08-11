# DESP-007 — Calibração da capacidade de memória executiva

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Precedente:** DESP-006 **HOMOLOGADO**  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

O CEO já pensa, conversa, decide, planeja, antecipa e adapta. Faltava **usar a memória de trabalho** na prosa com continuidade — recuperar decisões e objectivo sem dump nem inventar lastro.

---

## Antes / Depois

| | Antes | Depois |
|---|-------|--------|
| «Onde paramos?» | Retomada genérica ou repetição | Recupera decisão permanente em vigor |
| Confirmação «ok» | Podia carregar contexto largo | Sem dump de memória (modo rápido) |
| Facto do último turno | Risco de parecer decisão | Classificado como temporário; não vira decisão |
| Conversa longa | Objectivo podia cair do fio | Continuidade com lastro (decisão/pendência/próxima) |
| Abertura | Objectivo ± próxima acção | Objectivo + decisão em vigor quando existir |
| Sem lastro | — | Não inventa memória |

---

## Refinamento

`memoriaExecutivaConversacional.js` — no máximo um sinal/turno (camada **M**), só quando agrega valor:

1. pedido explícito de retomada;
2. alinhamento a decisão permanente relevante;
3. continuidade em fio longo sem eco recente.

`contextoImediato` expõe `decisoesTomadas`, `restricoesAtivas`, `historicoComprimento`.  
`metadadoRefinoEicParaDados` inclui `decisoesTomadas` (mesmo canal diagnóstico que pendências).

---

## Validação

| Suite | Resultado |
|-------|-----------|
| `test:cn` | **57/57** |
| `test:continuidade-gate:e4` | **7/7** |
| `test:refino-eic` | **13/13** |

---

## Aderência

- nenhuma nova capacidade;
- nenhuma alteração arquitectural;
- nenhuma alteração de governação;
- refinamento exclusivamente comportamental (uso da memória já existente na prosa).

---

## Ficheiros

| Ficheiro | Papel |
|----------|--------|
| `app/src/conversacaoNatural/memoriaExecutivaConversacional.js` | Recuperação selectiva |
| `app/src/conversacaoNatural/memoriaExecutivaConversacional.test.js` | Unitários |
| `app/src/conversacaoNatural/contextoImediato.js` | Expõe decisões / restrições |
| `app/src/conversacaoNatural/compor.js` | Camada M + abertura |
| `app/src/conversacaoNatural/adaptacaoConversacional.js` | Omite M em rápido/bloqueio |
| `app/src/executiveEngine/refinoEic.js` | `decisoesTomadas` no metadado diagnóstico |
| `app/src/conversacaoNatural/conversacaoNatural.test.js` | Integração DESP-007 |
| `app/package.json` | `test:cn` |

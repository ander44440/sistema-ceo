# DESP-002 — Calibração do comportamento conversacional

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Lente:** DEC-010 — comportamento como assistente  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

Após o Ciclo 1 (pensar), o CEO ainda podia parecer **excessivamente reactivo** na condução da conversa.

---

## Oportunidades → refinamentos

| Oportunidade | Comportamento observado | Causa técnica | Refinamento |
|--------------|-------------------------|---------------|-------------|
| Condução activa | Esperava o utilizador reabrir o fio | Abertura genérica; prosa LLM sem pergunta | Abertura retoma objectivo/próxima acção; prosa LLM ganha pergunta de condução |
| Perguntas estratégicas | Só trade-off ou confirmação de acção | `montarPerguntaConducao` limitada | Prioridade: trade-off → pendência → objectivo+próxima acção → foco |
| Antecipação | Pendências só se o user pedisse | Pendências não entravam na CN | `refinoEic.pendencias` → pergunta «Antecipo a pendência…» |
| Objectivo principal | Âncora só no nome do COA | `extrairContextoImediato` sem hierarquia EIC | Objectivo estratégico/actual na âncora E |
| Transições | Shift de tópico sem prosa | `gestaoTopicos` ignorado na CN | `transicaoTopico` em shift |
| Encerramentos | «Contexto preservado» passivo | FECHO sem estado executivo | `fechoExecutivo` com objectivo + próxima acção |

---

## Antes / Depois (síntese)

| Dimensão | Antes | Depois |
|----------|-------|--------|
| Condução | Reactiva | Retoma objectivo e pergunta o próximo gesto |
| Perguntas | Lacunas ou confirmação da acção | Estratégicas + antecipação |
| Foco | Nome do COA | Objectivo principal da hierarquia |
| Transição | Salto seco | «Mudámos o fio… objectivo permanece» |
| Fecho | Passivo | Encerramento executivo com próxima acção |

---

## Validação

`npm run test:cn` — inclui casos DESP-002 (antecipação, transição, fecho).

---

## Arquivos

- `app/src/conversacaoNatural/contextoImediato.js`
- `app/src/conversacaoNatural/compor.js`
- `app/src/conversacaoNatural/variacao.js`
- `app/src/conversacaoNatural/index.js`
- `app/src/conversacaoNatural/conversacaoNatural.test.js`
- `app/src/conversacaoNatural/e3.integracao.test.js`

# DESP-008 — Calibração da inteligência executiva

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Precedente:** DESP-007 **HOMOLOGADO** (núcleo cognitivo EIC estabilizado)  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

O núcleo cognitivo (pensar → conversar → decidir → planear → antecipar → adaptar → memória) está homologado. O CEO ainda podia comportar-se como **bom conversador reativo** ao longo de uma missão: «ok» a meio do fio esvaziava iniciativa; `estadoConversa`/`encerramento` não conduziam a prosa; fecho só com «tchau».

---

## Antes / Depois

| | Antes | Depois |
|---|-------|--------|
| «ok» mid-missão | Resposta fina, espera o utilizador | Mantém condução (próxima / pendência) |
| Entrega ≠ objectivo | Foco podia cair do fio | Âncora «Missão… — entrega actual…» |
| Actividade concluída / novo despacho | Só diagnóstico EIC | Fecho parcial na prosa (camada F) |
| Prioridade ambígua | Evento CSC pouco usado | Pergunta de prioridade da missão |
| Continuidade em missão | hist≥4 | hist≥2 quando `missaoActiva` |
| Sem lastro de missão | — | Comportamento rápido inalterado |

---

## Refinamento

`inteligenciaExecutiva.js` — postura de missão sobre lastro já existente:

- `missaoActiva` · `perguntaIniciativaMissao` · `ancoraMissaoEmExecucao`
- `fechoParcialMissao` · `perguntaPrioridadeMissao`

Integração: `contextoImediato` (`estadoConversa`, `encerramento`, `missaoActiva`); `adaptacao` (rápido em missão mantém N/D); `compor` (E/D/F); memória (limiar hist).

---

## Validação

| Suite | Resultado |
|-------|-----------|
| `test:cn` | **66/66** |
| `test:continuidade-gate:e4` | **7/7** |
| `test:refino-eic` | **13/13** |

---

## Aderência

- nenhuma nova capacidade;
- nenhuma alteração arquitectural;
- nenhuma alteração de governação;
- refinamento exclusivamente comportamental (condução de missão com lastro EIC/CN).

---

## Ficheiros

| Ficheiro | Papel |
|----------|--------|
| `app/src/conversacaoNatural/inteligenciaExecutiva.js` | Condução de missão |
| `app/src/conversacaoNatural/inteligenciaExecutiva.test.js` | Unitários |
| `app/src/conversacaoNatural/contextoImediato.js` | Expõe estado/encerramento/missão |
| `app/src/conversacaoNatural/compor.js` | Iniciativa / âncora / fecho parcial |
| `app/src/conversacaoNatural/adaptacaoConversacional.js` | Rápido em missão |
| `app/src/conversacaoNatural/memoriaExecutivaConversacional.js` | Continuidade mais cedo em missão |
| `app/src/conversacaoNatural/conversacaoNatural.test.js` | Integração DESP-008 |
| `app/package.json` | `test:cn` |

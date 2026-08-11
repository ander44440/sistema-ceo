# DESP-009 — Calibração da execução executiva

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Precedente:** DESP-008 **HOMOLOGADO** (inteligência executiva na prosa)  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação; só integração entre módulos existentes

---

## Problema

O CEO já conversa como executivo (DESP-002…008), mas a execução (MRE / lastro / pós-turno) recebia só uma fatia da Memória de Trabalho. Risco: **conversar como diretor e deliberar como assistente**.

---

## Antes / Depois

| | Antes | Depois |
|---|-------|--------|
| Lastro C2 | MTE só se houvesse factos | MTE **sempre** anexada ao lastro relevante |
| Factos lastro | Objectivos + próxima + restrições | + decisão, pendência, em execução, novo despacho |
| Entrada MRE | Hierarquia parcial | Decisão / pendências / em execução na mensagem |
| Naturalizar CN | Dependia de `dados` pós-anexo | Recebe `lastroConsciencia` + `refinoEic` do Engine |
| Pós-turno EIC | Próxima acção só da memória volátil | Colhe recomendação/acção do parecer (e CN) |

---

## Refinamento (costura decide→executar)

1. `executiveEngine/index.js` — lastro C2 com MTE; naturalizar com lastro/refino  
2. `refinoEic.js` — `factosLastroRefinoEic` completo; colheita `fase:"pos"`  
3. `mre/integracaoNucleo.js` — `enriquecerMensagemComMemoriaTrabalho` alinhado à missão  
4. `conversacaoNatural/index.js` — merge de lastro/refino do Engine na CN  

Sem mover CN antes do MRE (contrato PX-003 preservado).

---

## Validação

| Suite | Resultado |
|-------|-----------|
| `test:cn` | **67/67** |
| `test:refino-eic` | **15/15** |
| `src/mre/b1.briefingEntrada.test.js` | **7/7** |
| `test:continuidade-gate:e4` | **7/7** |

---

## Aderência

- nenhuma nova capacidade;
- nenhuma alteração arquitectural;
- nenhuma alteração de governação;
- refinamentos exclusivamente de integração entre módulos existentes.

---

## Ficheiros

| Ficheiro | Papel |
|----------|--------|
| `app/src/executiveEngine/index.js` | Lastro + ctx naturalizar |
| `app/src/executiveEngine/refinoEic.js` | Factos + colheita pós |
| `app/src/mre/integracaoNucleo.js` | Entrada MRE completa |
| `app/src/conversacaoNatural/index.js` | Merge lastro/refino |
| `app/src/executiveEngine/refinoEic.test.js` | Testes DESP-009 |
| `app/src/mre/b1.briefingEntrada.test.js` | Teste entrada MRE |
| `app/src/conversacaoNatural/conversacaoNatural.test.js` | Teste naturalizar |

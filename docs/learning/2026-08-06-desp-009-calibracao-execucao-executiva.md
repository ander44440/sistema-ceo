# DESP-009 — Calibração da execução executiva

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · **EMENDADO** 15/08/2026 (Frente 3 — disciplina factual) · VAL-073 **APROVADA**  
> **Precedente:** DESP-008 **HOMOLOGADO** (inteligência executiva na prosa)  
> **VAL da emenda:** [`../validation/VAL-073-frente-3-disciplina-factual-lastro.md`](../validation/VAL-073-frente-3-disciplina-factual-lastro.md)  
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
| Pós-turno EIC | Próxima acção só da memória volátil | Colhe **posição/proposta** do parecer (e CN); **não** promove recomendação a decisão vigente |

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
| `app/src/executiveMemory/index.js` | Detector de promoção (emenda Frente 3) |
| `app/src/executiveEngine/p1-f3-disciplina-factual.test.js` | Matriz F3-01…F3-12 |

---

## Emenda Frente 3 — disciplina factual (15/08/2026)

**Regra central:** o CEO pode recomendar sem transformar a recomendação em decisão tomada.

### Estatutos

| Estatuto | Onde vive | «Decisão em vigor» / `factosOficiais` como facto? |
|----------|-----------|-----------------------------------------------------|
| Análise do CEO | Parecer / prosa | Não |
| Recomendação / posição do CEO | `posicaoCeoNaoVigente` | Não. Rótulo: **«Posição do CEO (não vigente)»** |
| Decisão do utilizador | Detector de promoção | Só após promoção |
| Decisão vigente | `decisoesTomadas` | Sim: **«Decisão em vigor»** |

`fase:"pos"` **não** copia `parecer.decisaoExecutiva.recomendacao` para `decisoesTomadas`.  
`estado:"aprovar"` no MRE **não** é aprovação do utilizador.  
Speaker `"Aprovo"` **não** promove.  
Job `result` / `needs_correction` permanece lastro **operacional**.  
Gate ARQ-019 permanece Gate; `Aprovado.` **não** promove decisão de produto.  
`proximaAcao` colhida do parecer continua **proposta**, não autorização.

Promoção inequívoca (exemplos validados): `Fica decidido: X`; recusa `Rejeito X`.

### VAL-073

| Métrica | Valor |
|---------|--------|
| PASS | **7** |
| FAIL | **0** |
| FORA DE ESCOPO | **1** |
| Catálogo de VAL | Isolado (`VAL-F3-ISOLADO`); produção **intacta** |

### Risco residual (não reabre a Frente 3)

`Aprovo a recomendação` **sem objecto nomeado** ficou **fora de escopo** da VAL-073. Não é critério de fecho desta frente. Tratamento separado, se a evidência o exigir.

Decisões **já persistidas** no catálogo de produção por falso positivo antigo **não foram limpas** (CAP-05 fora do perímetro). VAL só é válida em catálogo controlado.

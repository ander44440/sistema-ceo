# IMP-059 E4 — Evidência (Integração Núcleo / influência MRE)

> **Data:** 01/08/2026  
> **Etapa:** E4 — Integração com Conversa/Núcleo + influência na deliberação  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-020 §3; REQ-059 RF3–RF6 / CA1–CA5; IMP-059 §6 E4  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Integração definitiva da Consciência Operacional no Núcleo: o Estado Executivo **influencia** a deliberação/prosa (factosOficiais, schema hint, garantia de reflexo), **sem** alterar o fluxo do Motor, **sem** alterar a Continuidade do Gate, **sem** a Consciência escrever na Fila/Dispatcher.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Influência deliberação | `app/src/conscienciaOperacional/influenciaDeliberacao.js` |
| Leitores padrão (read-only) | `app/src/conscienciaOperacional/leitoresPadrao.js` |
| Testes E4 | `app/src/conscienciaOperacional/e4.test.js` |
| Núcleo MRE | `app/src/mre/integracaoNucleo.js` (hint + garantia de reflexo) |
| Capacidade IA | `app/src/executiveEngine/capacidades/ia.js` (prosa com lastro sem LLM) |
| Engine | `app/src/executiveEngine/index.js` (leitores padrão) |
| Script | `npm run test:consciencia-operacional:e4` |

### Mecânica

1. Consulta E3 → lastro se relevante.  
2. `montarEntradaMre` injeta factos + bloco de Estado Executivo.  
3. Adaptador LLM (estágio 6) recebe `schemaHintConsciencia` — autonomia MRE preservada.  
4. `garantirReflexoEstadoExecutivo` assegura que a prosa final reflecte Gate/Job.  
5. Sem LLM: `comporProsaLastro` responde com lastro (demos fiáveis).

## 3. Critérios de aceite E4

| ID | Critério | Resultado |
|----|----------|-----------|
| E4-CA1 | Job em execução influencia a recomendação | **OK** |
| E4-CA2 | Gate pendente tem prioridade absoluta | **OK** |
| E4-CA3 | Sem contexto → resposta idêntica | **OK** |
| E4-CA4 | Nenhuma escrita Fila/Motor/Dispatcher (camada Consciência) | **OK** |
| E4-CA5 | Resposta reflecte Estado Executivo | **OK** |

## 4. Demonstrações

### Demo 1 — Job em execução

**Estado:** Job `running` «correção dos bugs»  
**Utilizador:** «Como devemos priorizar o MG2?»  
**Resposta:** menciona execução em andamento e recomenda concluir antes de redefinir prioridades.

### Demo 2 — Gate pendente

**Estado:** Gate pendente (+ Job running, para provar P1)  
**Utilizador:** «O que devemos fazer agora?»  
**Resposta:** informa Gate aguardando decisão e recomenda resolvê-lo antes de abrir novas frentes.

## 5. Testes

```text
npm run test:consciencia-operacional:e4
```

Resultado: **6/6** testes a verde (01/08/2026).

Suite E1–E4: **30/30**. Regressão B1 briefing: **3/3**. Continuidade E1: **6/6**.

## 6. Fora de escopo (confirmado)

* Alteração ao fluxo do Motor / Continuidade  
* Alteração ARQ-020 / REQ-059  
* Commit  
* Prosa E5 adicional além do reflexo E4 (E5 pode refinar)

## 7. Pedido de Gate E4

Homologar a E4 para autorizar a **E5** (fronteiras/prosa fina) ou **E6** conforme plano?

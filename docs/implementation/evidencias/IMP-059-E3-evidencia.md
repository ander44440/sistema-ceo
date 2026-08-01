# IMP-059 E3 — Evidência (Consulta obrigatória C2/C3)

> **Data:** 01/08/2026  
> **Etapa:** E3 — Consulta obrigatória antes de responder C2/C3  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-020 §3; REQ-059 RF1 / RF7 / RF8 / CA4 / CA6; IMP-059 §6 E3  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Gancho de **consulta obrigatória** ao Estado Executivo (agregador E2) antes de respostas substantive **C2/C3**; lastro disponibilizado ao Núcleo/MRE **apenas** se houver contexto operacional relevante; sem contexto → comportamento actual preservado; Continuidade do Gate e Motor **não** alterados no fluxo.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Consulta E3 | `app/src/conscienciaOperacional/consultarAntesDeResponder.js` |
| Testes | `app/src/conscienciaOperacional/consultarAntesDeResponder.test.js` |
| Gancho Núcleo | `app/src/executiveEngine/index.js` (após Classificador; após Continuidade) |
| Destino C2 | `app/src/classificadorIntencao/destinos.js` (repassa lastro) |
| Capacidade IA | `app/src/executiveEngine/capacidades/ia.js` (repassa ao MRE) |
| Entrada MRE | `app/src/mre/integracaoNucleo.js` (`factosOficiais` + lastro) |
| Script | `npm run test:consciencia-operacional:e3` |

### API

* `consultarEstadoExecutivoAntesDeResponder({ classe, idClasse, continuidadeConsumiu, leitores, agora })`  
* `classeExigeConsultaConsciencia` / `CLASSES_COM_CONSULTA_OBRIGATORIA`  
* `montarLastroParaNucleo` / `montarFactosLastro` / `metadadoConscienciaParaDados`  
* `criarConsultaConsciencia({ leitores }).antesDeResponder(...)`

### Contrato de ordem (RF8 / E3-CA3)

```text
Continuidade do Gate (se consumir) → return (sem Consciência)
  → Classificador
  → se C2/C3: consultar Estado Executivo
  → se relevante: lastro → Núcleo (factosOficiais)
  → se não relevante: sem lastro (comportamento actual)
  → destino (MRE / Motor / …)
```

* Continuidade **não** foi modificada (`continuidadeGate/*` intacto).  
* Motor **não** muda etapas/publicação — C3 mantém `conduzirTrabalhoExecutivoC3`.

## 3. Critérios de aceite E3

| ID | Critério | Resultado |
|----|----------|-----------|
| E3-CA1 | C2/C3 → consulta ocorre | **OK** |
| E3-CA2 | C1/C4 sem obrigação | **OK** |
| E3-CA3 | Continuidade consumiu → sem consulta deliberativa | **OK** |
| E3-CA4 | Consulta não cria Job | **OK** |

## 4. Cenários demonstrados

| # | Cenário | Resultado |
|---|---------|----------|
| 1 | C2 sem contexto operacional | `consultado=true`, `lastroParaNucleo=null`; `montarEntradaMre` idêntico ao sem lastro |
| 2 | C2 com Job em execução | Lastro com F2; factosOficiais mencionam Job `running` |
| 3 | C2 com Gate pendente | `fontePrioritaria=F3` (P1) mesmo com Job running |

## 5. Testes

```text
npm run test:consciencia-operacional:e3
```

Resultado: **8/8** testes a verde (01/08/2026).

Regressão E1+E2+E3: **24/24** a verde. Briefing B1 (`montarEntradaMre`): **3/3** a verde.

## 6. Fora de escopo (confirmado)

* Prosa contextualizada final (E5)  
* Alteração a ARQ-020 / REQ-059  
* Alteração ao fluxo do Motor ou à Continuidade do Gate  
* Commit  
* Wiring de leitores reais da Fila (injectáveis via `deps.leitoresConsciencia`)

## 7. Pedido de Gate E3

Homologar a E3 para autorizar a **E4** (integração Conversa/Núcleo alargada / leitores reais)?

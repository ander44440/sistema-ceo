# IMP-056 — Matriz CA / NA (REQ-056) e evidências

> **Status:** pacote de evidências — **IMP-056 Homologada** (01/08/2026).  
> **Norma:** REQ-056 (homologada). ARQ-017 (homologada).  
> **Commit/push/deploy:** autorizados no encerramento.

## Matriz — Critérios de Aceitação (REQ-056)

| ID | Critério | Evidência | Etapa |
|----|----------|-----------|-------|
| CA1 | Fluxo canónico ponta a ponta (intenção → Job → resultado → encerramento) | `integracaoOrquestrador.test.js` E4-CA1 + `resultadoEncerramento.test.js` E5-CA1 | E4–E5 |
| CA2 | Deliberação MRE ≠ Job terminal (prosa ≠ completed) | `resultadoEncerramento.test.js` E5-CA4; `tentarEncerrarPorProsa` | E5 |
| CA3 | Job REQ-045: `pending`, sem executor | `ponteParecerJob.test.js` E3-CA1 / E3-CA2 | E3 |
| CA4 | Despacho = handoff REQ-053 (sem segundo watcher) | `integracaoOrquestrador.js` `dispatcher_req053`; `fronteiras.test.js` E6-CA3 | E4–E6 |
| CA5 | Cinco estados Job; transições ilegais rejeitadas | `dominio.test.js` E1-CA3 + transições Job | E1 |
| CA6 | Política exige Gate ⇒ sem Job até aprovação | `politicaAprovacao.test.js` E2-CA1/CA3; `ponteParecerJob` E3-CA3 | E2–E3 |
| CA7 | Resultado com `jobId` após terminal | `resultadoEncerramento.test.js` E5-CA1 / E5-CA2 | E5 |
| CA8 | Painel e CTO não criam Jobs | `integracaoOrquestrador.test.js` E4-CA3; `fronteiras.test.js` E6-CA1 | E4–E6 |
| CA9 | Sem Dispatcher: Job fica `pending` | `fronteiras.test.js` E6-CA2; README checklist CU5 | E6 |
| CA10 | Docs mínimas: ARQ-017, REQ-056, Fila, Dispatcher | `app/src/motorExecucao/README.md` | E7 |
| CA11 | Sem execução MG2 no browser/CEO no lugar do Agent | Motor sem `@cursor/sdk` / sem spawn; E4-CA2 / E6-CA3 | E4–E6 |

## Matriz — Critérios Negativos (REQ-056)

| ID | Critério | Evidência | Etapa |
|----|----------|-----------|-------|
| NA1 | Motor não é home conversacional | Sem UI própria; integração só pós-parecer / portas; README | E4–E7 |
| NA2 | Ausência do Dispatcher não derruba Conversa/deliberação | E4-CA4 falha publicação isolada; E6-CA2 pending sem crash | E4–E6 |
| NA3 | Sem segunda API key / browser ChatGPT para Jobs | Porta `publicarJob` injectável; sem key nova no Motor; E6-CA4 | E3–E6 |

## Matriz — Critérios por etapa IMP-056

| Etapa | CA | Evidência |
|-------|-----|-----------|
| E1 | E1-CA1…CA4 | `dominio.test.js` |
| E2 | E2-CA1…CA4 | `politicaAprovacao.test.js` |
| E3 | E3-CA1…CA4 | `ponteParecerJob.test.js` |
| E4 | E4-CA1…CA4 | `integracaoOrquestrador.test.js` |
| E5 | E5-CA1…CA4 | `resultadoEncerramento.test.js` |
| E6 | E6-CA1…CA4 | `fronteiras.test.js` |
| E7 | E7-CA1…CA3 | Este ficheiro + README + `e7.test.js` |

## Suíte automatizada

```bash
cd app && npm run test:motor
```

Cobertura: E1 domínio · E2 política · E3 ponte · E4 orquestrador · E5 resultado · E6 fronteiras · E7 docs.

## Checklist operacional (PC off / CU5)

- [x] Job nasce `pending`  
- [x] Sem watcher ⇒ permanece `pending` (≠ `failed`)  
- [x] Handoff documentado a `dispatcher_req053`  
- [x] Painel/CTO sem publicação  
- [x] Segredos rejeitados no payload  

## E7-CA3 — Ficheiros da implementação (commit futuro)

### Novos

* `app/src/motorExecucao/dominio.js`  
* `app/src/motorExecucao/dominio.test.js`  
* `app/src/motorExecucao/politicaAprovacao.js`  
* `app/src/motorExecucao/politicaAprovacao.test.js`  
* `app/src/motorExecucao/ponteParecerJob.js`  
* `app/src/motorExecucao/ponteParecerJob.test.js`  
* `app/src/motorExecucao/integracaoOrquestrador.js`  
* `app/src/motorExecucao/integracaoOrquestrador.test.js`  
* `app/src/motorExecucao/resultadoEncerramento.js`  
* `app/src/motorExecucao/resultadoEncerramento.test.js`  
* `app/src/motorExecucao/fronteiras.test.js`  
* `app/src/motorExecucao/e7.test.js`  
* `app/src/motorExecucao/README.md`  
* `docs/implementation/IMP-056-motor-de-execucao.md` (plano)  
* `docs/implementation/evidencias/IMP-056-matriz-ca-na.md`  

### Alterados

* `app/package.json` — scripts `test:motor*`  
* `app/src/mre/posDeliberacao/efeitosPosDeliberacao.js` — fio Motor  
* `app/src/executiveEngine/index.js` — `conduzirMotorExecucao` / `processarResultadoMotor`  

### Explicitamente fora do commit

* `docs/architecture/ARQ-017-motor-de-execucao.md` — **não alterar**  
* `docs/requirements/REQ-056-motor-de-execucao.md` — **não alterar**  

## Critérios de commit (referência — não executados)

Conforme IMP-056 §11: commit só após Gate técnico + REQ-056 homologada + autorização explícita do patrocinador. **E6+E7 não realizam commit.**

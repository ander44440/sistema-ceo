# IMP-058 — Matriz CA / NA (REQ-058)

**Data:** 01/08/2026  
**Normas:** REQ-058 · ARQ-019 (não alteradas nesta IMP)  
**Implementação:** IMP-058 E1–E7

Legenda: teste automatizado (`npm run test:continuidade-gate`) e/ou artefacto documental.

---

## Critérios de Aceite (CA1–CA11)

| ID | Critério (resumo) | Evidência | Status |
|----|-------------------|-----------|--------|
| CA1 | Contexto do Gate pendente recuperável | E3-CA1; `contexto.test.js`; store `parecerSnapshot` | **OK** |
| CA2 | Decisão sem repetir C3 | E4 demo; E5-CA4; CU1 | **OK** |
| CA3 | Léxico → `aprovado` no Gate mais recente | E2-CA1; E3-CA2; E5-CA1 | **OK** |
| CA4 | Rejeitado → zero Jobs | E5-CA2; E6 demo Rejeitado | **OK** |
| CA5 | Adiado → pendente / retomável | E5-CA3; P10 Motor; E6 demo Adiado | **OK** |
| CA6 | Aprovado → Job + Dispatcher | E4 demo; E5-CA1; handoff `dispatcher_req053` | **OK** |
| CA7 | Sem «Sugiro…» no lugar da Continuidade | E4-CA1; E6-CA2 | **OK** |
| CA8 | Sem Gate + «Aprovado.» → sem Job | E6-CA1; CU4 | **OK** |
| CA9 | Idempotência (sem Job duplicado) | E5-CA5; E6-CA3; `registroJobs` | **OK** |
| CA10 | Sem `@cursor/sdk` / oficina | E4-CA4; E6-CA4; módulos Continuidade | **OK** |
| CA11 | Docs: ARQ-019, REQ-058, Motor, Fila/Dispatcher | `continuidadeGate/README.md`; E7-CA1 | **OK** |

---

## Critérios negativos (NA1–NA4)

| ID | Critério | Evidência | Status |
|----|----------|-----------|--------|
| NA1 | Continuidade ≠ Motor/Fila/Dispatcher | E6 isolamento; handoff ao Dispatcher existente | **OK** |
| NA2 | Sem auto-aprovação sem mensagem | Só via léxico + mensagem utilizador; E6 | **OK** |
| NA3 | Sem UI de botões obrigatória V1 | Texto na Conversa; README | **OK** |
| NA4 | Falha de reconhecimento ≠ aprovação silenciosa | RF12 clarificação; E4-CA3; E6 CU7 | **OK** |

---

## Critérios por etapa (IMP)

| Etapa | CAs internos | Suite |
|-------|--------------|-------|
| E1 | E1-CA1…CA4 | `dominio.test.js` |
| E2 | E2-CA1…CA5 | `reconhecerDecisao.test.js` |
| E3 | E3-CA1…CA5 | `contexto.test.js` |
| E4 | E4-CA1…CA5 | `integracaoConversa.test.js` |
| E5 | E5-CA1…CA6 + P10 | `e5.test.js` |
| E6 | E6-CA1…CA6 | `fronteiras.test.js` |
| E7 | E7-CA1…CA4 | `e7.test.js` + docs |

---

## Comando de verificação

```bash
cd app && npm run test:continuidade-gate
```

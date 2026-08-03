# IMP-058 — Relatório consolidado (E6 + E7 + fecho)

**Data:** 01/08/2026  
**Escopo:** Continuidade do Gate de Execução — etapas E1–E7  
**Normas:** ARQ-019 · REQ-058 · ARQ-017/REQ-056 (Motor) · REQ-045/REQ-053 (Fila/Dispatcher) · ARQ-018/REQ-057 (Classificador)  
**Restrições cumpridas:** ARQ-019 e REQ-058 **não** alterados; sem novas frentes; **sem commit**.

---

## 1. Veredicto

A implementação da **IMP-058** está **completa** para homologação técnica:

- Domínio, léxico, contexto e integração Conversa→Motor (E1–E4).
- Fluxos Aprovado / Rejeitado / Adiado + P10 + idempotência (E5).
- Fronteiras, regressão e isolamento (E6).
- Documentação, matriz CA/NA e relatório de fecho (E7).

**Pedido de Gate:** ~~homologar IMP-058~~ → **Homologada** (01/08/2026). Commit/push/deploy no encerramento.

---

## 2. E6 — Fronteiras e regressão

| ID | Resultado |
|----|-----------|
| E6-CA1 | Sem Gate + «Aprovado.» → sem Job |
| E6-CA2 | Decisão com Gate → sem «Sugiro…» |
| E6-CA3 | Idempotência reforçada (1 Job) |
| E6-CA4 | Sem `@cursor/sdk` nos módulos Continuidade |
| E6-CA5 | Regressão Classificador C1/C2/C4 + C3 |
| E6-CA6 | Motor programático (sem Continuidade) válido |

Isolamento confirmado:

- Domínio/léxico/contexto sem Fila/Motor/UI.
- CTO / Painel / orquestração não decidem Gate.
- Entrypoint: `conversa` → `executiveEngine.executar` → Continuidade ou Classificador.

---

## 3. E7 — Documentação e matriz

| ID | Resultado |
|----|-----------|
| E7-CA1 | README com ARQ-019, REQ-058, Motor, Fila/Dispatcher |
| E7-CA2 | Matriz CA1–CA11 / NA1–NA4 preenchida |
| E7-CA3 | Este relatório consolidado |
| E7-CA4 | ARQ-019 / REQ-058 intactos (guardrail) |

Artefactos:

| Ficheiro | Papel |
|----------|--------|
| `app/src/continuidadeGate/README.md` | Operacional |
| `docs/implementation/evidencias/IMP-058-matriz-ca-na.md` | Matriz CA/NA |
| `docs/implementation/evidencias/IMP-058-E1`…`E5-evidencia.md` | Por etapa |
| `docs/implementation/evidencias/IMP-058-relatorio-consolidado.md` | Fecho |

---

## 4. Demonstração dos três cenários

```text
--- Aprovado ---
Usuário: "Resolva os bugs."
CEO: "Aguardando aprovação (Gate G2)."
Usuário: "Aprovado."
→ Job pending + handoff Dispatcher

--- Rejeitado ---
Usuário: "Rejeitado."
→ zero Jobs; Gate encerrado

--- Adiado → Pode executar ---
Usuário: "Adiar." → Gate pendente
Usuário: "Pode executar." → Job pending (sem repetir C3)
```

---

## 5. Inventário de código (Continuidade)

| Ficheiro | Etapa |
|----------|-------|
| `dominio.js` / `dominio.test.js` | E1 |
| `reconhecerDecisao.js` / `.test.js` | E2 |
| `contexto.js` / `.test.js` | E3 |
| `integracaoConversa.js` / `.test.js` | E4 |
| `e5.test.js` | E5 |
| `fronteiras.test.js` | E6 |
| `e7.test.js` | E7 |
| `README.md` / `index.js` | E7 / API |
| `executiveEngine/index.js` | Integração E4+ |
| Motor (P10 mínimo) | `politicaAprovacao.js`, `dominio.js`, `integracaoOrquestrador.js` |

---

## 6. Comando de verificação

```bash
cd app
npm run test:continuidade-gate
```

---

## 7. Histórico resumido

| Etapa | Entrega |
|-------|---------|
| E1 | Domínio Gate |
| E2 | Léxico |
| E3 | Contexto / Gate activo |
| E4 | Integração Conversa→Motor |
| E5 | Fluxos + P10 + idempotência |
| E6 | Fronteiras / regressão |
| E7 | Docs + matriz + fecho |

---

## 8. Pedido de Gate

**Homologar IMP-058 (implementação E1–E7)?**  
Após Gate: autorizar commit (mensagem a referenciar REQ-058 / IMP-058 / ARQ-019) — **não** implícito neste relatório.

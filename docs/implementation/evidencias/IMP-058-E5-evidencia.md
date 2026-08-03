# IMP-058 E5 — Evidência (Aprovado / Rejeitado / Adiado)

> **Data:** 01/08/2026  
> **Etapa:** E5 — Aprovação / Rejeição / Adiamento completos  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-019 §3; REQ-058 RF6–RF8 / RF11; IMP-058 §6 E5 (P10)  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Fluxos completos de decisão de Gate via Continuidade (E4 preservada):

| Decisão | Efeito |
|---------|--------|
| **Aprovado** | Job `pending` + handoff Dispatcher; Gate resolvido |
| **Rejeitado** | Encerramento **sem** Job; Gate deixou de estar pendente |
| **Adiado** | **Zero** Jobs; Gate **permanece pendente**; retoma posterior |

Idempotência: segunda aprovação do mesmo parecer **não** cria segundo Job (`registroJobs` + Motore `registro`).

## 2. Delta P10 (Motor — mínimo)

| Antes | Depois (IMP-058 P10) |
|-------|----------------------|
| `adiado` → Encerramento | `adiado` → permanece em `Aprovacao` |
| Continuidade e Motor divergiam | `aguardandoGate: true` + `gatePermanecerPendente` |

Ficheiros Motor tocados (ajuste mínimo autorizado na IMP-058 E5):

* `politicaAprovacao.js` — `avancarAposGate`  
* `dominio.js` — Encerramento só com `rejeitado`  
* `integracaoOrquestrador.js` — resposta `gate_adiado` pendente  

ARQ-019 / REQ-058 **não** alterados.

## 3. Entregáveis Continuidade

| Artefacto | Papel |
|-----------|--------|
| `continuidadeGate/e5.test.js` | Suite E5 + demo 3 cenários |
| `continuidadeGate/contexto.js` | `registroJobs` (idempotência) |
| `continuidadeGate/integracaoConversa.js` | Fluxos + early-return idempotente |
| `executiveEngine/index.js` | Passa `store.registroJobs` |

## 4. Critérios de aceite E5

| ID | Resultado |
|----|-----------|
| E5-CA1 Aprovado → Job + Motor | **OK** |
| E5-CA2 Rejeitado → sem Job | **OK** |
| E5-CA3 Adiado → pendente + retoma | **OK** |
| E5-CA4 Sem repetir C3 | **OK** |
| E5-CA5 Idempotência | **OK** |
| E5-CA6 Dispatcher reutilizado | **OK** |
| P10 Motor | **OK** |

## 5. Demonstração

```text
--- Aprovado ---
Usuário: "Resolva os bugs." → CEO: "Aguardando aprovação (Gate G2)."
Usuário: "Aprovado." → Job pending + Dispatcher

--- Rejeitado ---
Usuário: "Rejeitado." → Job não criado; Gate encerrado

--- Adiado ---
Usuário: "Adiar." → Gate permanece pendente
Usuário: "Pode executar." → Job pending (retoma sem repetir C3)
```

## 6. Testes

```text
npm run test:continuidade-gate:e5  → 8/8 pass
npm run test:continuidade-gate     → E1–E5
npm run test:motor:e1|e2|e4        → regressão P10 OK
```

## 7. Pedido de Gate E5

Homologar a **E5** para autorizar a **E6** (fronteiras / regressões)?

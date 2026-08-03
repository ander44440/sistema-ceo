# IMP-060 E2 — Relatório: publicação na fila oficial

> **Etapa:** E2 — AUTORIZADA / entregue (aguarda Gate E2)  
> **Data:** 01/08/2026 (fecho: inject do publicador)  
> **Norma:** ARQ-021; REQ-060 RF1–RF5 / RF7 / RF9; IMP-060 § E2  
> **E3:** não iniciada.

---

## 1. Decisão fina (mecanismo)

**Desligar o cutover BP-001 na publicação da fila** + **injectar sempre o publicador concreto** no Núcleo.

| Antes | Depois |
|-------|--------|
| `publicarJobFila` → `ceoApiUrl` → Railway se `VITE_CEO_API_BASE` | `ceoQueueApiUrl` → plugin local / companion (`executive/queue`) |
| Núcleo só injectava `publicarJobFila` se `VITE_CEO_API_BASE` | Injecta `publicarJobFila` sempre que `deps.publicarJob` ausente (C3 + Continuidade) |
| Centro sem publicador → «Falta publicador da Fila…» | Motor recebe `deps.publicarJob` = `publicarJobFila` e grava na fila oficial |

LLM / health continuam em `ceoApiUrl` + `VITE_CEO_API_BASE` (BP-001 intacto).

Contrato do Motor: só `deps.publicarJob(pedido)` — **sem** alteração em `motorExecucao/*`.

---

## 2. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `app/src/ceoApiBase.js` | `ceoQueueApiBase` / `ceoQueueApiUrl` |
| `app/src/executiveEngine/filaCliente.js` | publicação via `ceoQueueApiUrl` |
| `app/src/executiveEngine/index.js` | inject `publicarJobFila` sem gate Railway (C3 + Continuidade) |
| `app/server/executionQueue.js` | Strip BOM ao ler Jobs |
| `app/server/executionQueuePlugin.js` | Strip BOM no body HTTP |
| `app/src/executiveEngine/filaCliente.e2.test.js` | E2-CA + regressão «Falta publicador» + evidência disco |
| `app/scripts/smoke-e2-fila.mjs` | Smoke HTTP local |

**Não alterados:** Motor (`motorExecucao/`), Classificador, Gate/Continuidade, Consciência, Dispatcher, Painel, Centro.

---

## 3. Homologação E2 (demonstração)

### 3.1 Causa do «Falta publicador da Fila…»

O Motor (`integracaoOrquestrador`) devolve `motivo: publicador_ausente` se `deps.publicarJob` não for função. O Núcleo só injectava o publicador quando `VITE_CEO_API_BASE` existia — Centro de Situação (e Continuidade sem inject prévio) ficavam sem porta → prosa de falha **antes** de gravar o Job.

### 3.2 Evidência Gate → Aprovado → ficheiro (sem `deps.publicarJob` no caller)

```text
executiveEngine.executar("Resolva os bugs.")  // sem publicarJob
→ aguardandoGate
executiveEngine.executar("Aprovado.")         // sem publicarJob
→ Job criado em executive/queue/JOB-*.json (pending)
→ cancelado após evidência no teste
mensagem: sem «Falta publicador»
```

Teste: `E2 evidência: inject → publicarJobFila → executive/queue real (repo)` — **PASS**.  
Artefacto: `executive/queue/JOB-000020.json` (criado `pending`, cancelado após evidência).

### 3.3 Smoke HTTP (Vite)

`JOB-000019` (smoke HTTP) em `executive/queue/`.

### 3.4 Testes

| Suite | Resultado |
|-------|-----------|
| `filaCliente.e2.test.js` | **6/6 PASS** |
| `test:continuidade-gate:e5` | **PASS** |
| `test:motor:e3` | **PASS** |
| `npm run build` | **OK** |

### 3.5 Critérios E2

| ID | Resultado |
|----|-----------|
| E2-CA1 | Job em `executive/queue` | **PASS** |
| E2-CA2 | Motor só usa `deps.publicarJob` | **PASS** |
| E2-CA3 | Sem handoff falso sem artefacto | **PASS** |
| E2-CA4 | Continuidade / Classificador intactos | **PASS** |
| Fecho | Sem «Falta publicador» no fluxo oficial injectado | **PASS** |

---

## 4. Nota operacional (produção Vercel)

Com SPA na Vercel e `VITE_CEO_API_BASE`→Railway:

* Publicação oficial deixa de ir à Railway.
* Path relativo `/api/ceo/queue/jobs` no origin Vercel **não** escreve no PC (sem plugin).
* Uso MVP conforme: **Vite local** no PC, **ou** `VITE_CEO_QUEUE_API_BASE` apontando ao companion/plugin local (documentado em `ceoApiBase.js`).
* Listagens oficiais da fila no Painel/Consciência: **E5** (fora desta etapa).

---

## 5. Pedido de Gate E2

Homologar E2. **Não iniciar E3** até autorização.

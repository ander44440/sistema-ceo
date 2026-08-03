# IMP-060 E5 — Relatório: Painel e Consciência na fila oficial

> **Etapa:** E5 — AUTORIZADA / entregue (aguarda Gate E5)  
> **Data:** 01/08/2026  
> **Norma:** ARQ-021; REQ-060 RF8 / CA9; IMP-060 § E5  
> **E6:** não iniciada.

---

## 1. Objectivo cumprido

Painel de Orquestração e Consciência Operacional passam a reflectir **exclusivamente** a fila oficial `executive/queue/` (via API local / companion), sem misturar a loja Railway.

| Superfície | Fonte de Jobs | Heartbeat Dispatcher |
|------------|---------------|----------------------|
| Painel (snapshot/SSE) | Plugin Vite / `ceoPainelApiUrl` → FS local | Ficheiro local (+ POST remoto E3 opcional) |
| Consciência F1/F2 | `listarJobsPorEstado` → mesma API local | — |
| Host Railway (orquestração) | `listarPorEstado: () => []` (não usa FS remoto) | POST heartbeat mantido |
| `/api/ceo/queue/*` (cliente Painel) | **Não usado** | — |

---

## 2. Decisão fina

1. **URLs do Painel** deixam de usar `VITE_CEO_API_BASE`; usam `ceoPainelApiUrl` (= `ceoQueueApiUrl`).  
2. **Vite** `orquestracaoPlugin` já lia `criarFilaExecucao(REPO_ROOT)` — permanece a fonte oficial em uso diário.  
3. **Railway** orquestração: deixa de injectar a fila do volume remoto; Agent no snapshot remoto fica ocioso (degradação).  
4. **Coletor Agent:** `origemSinal: fila_oficial` + contagens `pending|running|completed|failed` no detalhe.  
5. **Consciência:** F1/F2 por omissão lê a fila oficial (adaptação `estado` → `status`).  
6. Sem alterações a Motor, Dispatcher, Gate, Classificador, publicação E2.

---

## 3. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `app/src/ceoApiBase.js` | Alias `ceoPainelApiUrl`; docs E5 |
| `app/src/orquestracao/cliente.js` | Snapshot via `ceoPainelApiUrl` |
| `app/src/orquestracao/streamContrato.js` | Stream via `ceoPainelApiUrl` |
| `app/src/orquestracao/coletores.js` | Contagens + `fila_oficial` |
| `app/src/orquestracao/e6.test.js` | Assert `fila_oficial` |
| `app/src/orquestracao/e5.imp060.test.js` | Testes E5 Painel |
| `app/src/executiveEngine/filaCliente.js` | `listarJobsPorEstado` + adaptador Consciência |
| `app/src/conscienciaOperacional/leitoresPadrao.js` | F1/F2 → fila oficial |
| `app/src/conscienciaOperacional/e5.imp060.test.js` | Testes E5 Consciência |
| `server/src/routes/orquestracao.js` | Sem fila Railway |
| `server/src/services/orquestracao/coletores.js` | Paridade contagens / `fila_oficial` |

---

## 4. Homologação

| Suite | Resultado |
|-------|-----------|
| Orquestração E5/E6 + UI | **PASS** |
| Consciência E5 IMP-060 | **PASS** |
| Fila E2 + E4 | **PASS** |
| Server orquestração + queue E4 | **PASS** |
| Dispatcher E3 | **PASS** |
| Motor E3 | **PASS** |
| `npm run build` | **OK** |

### Critérios

| ID | Resultado |
|----|-----------|
| E5-CA1 | Sinais Jobs = fila oficial | **PASS** |
| E5-CA2 | Consciência não mistura Railway | **PASS** |
| E5-CA3 | Painel coerente com `executive/queue` (Vite/companion); senão degrada | **PASS** |
| E5-CA4 | Regressões E2–E4 + Painel/Consciência | **PASS** |

### Operação

Uso diário MVP: **Vite local** (ou `VITE_CEO_QUEUE_API_BASE` → companion).  
Painel na Vercel sem companion: snapshot relativo falha → degradação (E5-CA3) — não volta à fila Railway.

---

## 5. Pedido de Gate E5

Homologar E5. **Não iniciar E6** até autorização.

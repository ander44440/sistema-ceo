# IMP-060 E4 — Relatório: Railway fora do ciclo Job MVP

> **Etapa:** E4 — AUTORIZADA / entregue (aguarda Gate E4)  
> **Data:** 01/08/2026  
> **Norma:** ARQ-021; REQ-060 RF6–RF7 / CA6–CA7 / NA1; IMP-060 § E4  
> **E5:** não iniciada.

---

## 1. Objectivo cumprido

A API Railway **deixa de ser** fonte de verdade / destino oficial do ciclo `pending` → `running` → `completed` / `failed`.  
BP-001 permanece para LLM, health, CTO, heartbeat, onboarding.

| Domínio | Destino após E4 |
|---------|-----------------|
| Publicar / listar Jobs (cliente MVP) | `ceoQueueApiUrl` → Vite/companion → `executive/queue/` |
| `/api/ceo/queue/*` no host Railway | **410** `FILA_MVP_LOCAL` (sem ler/escrever Jobs) |
| LLM / health / CTO / heartbeat | Railway BP-001 (inalterado) |
| Painel indicadores de fila | **E5** (não tocado) |

---

## 2. Decisão fina

1. **Cliente:** `listarJobsPendentes` passa a `ceoQueueApiUrl` (como `publicarJobFila` desde E2) — zero `ceoApiUrl` na fila.  
2. **Servidor Railway:** `registrarQueue` rejeita GET/POST/PATCH com **410** e mensagem normativa (não apaga o mount; despromove).  
3. **Plugin Vite local** mantém `/api/ceo/queue/*` sobre o disco do PC (= fila oficial).  
4. **Jobs órfãos** já existentes no volume Railway deixam de ser alcançáveis pela API de fila; não sincronizar com o PC (FE5 REQ-060).

---

## 3. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `app/src/executiveEngine/filaCliente.js` | Listagem + publicação só via `ceoQueueApiUrl` |
| `app/src/ceoApiBase.js` | Comentário de fronteira E4 |
| `app/src/executiveEngine/filaCliente.e4.test.js` | Testes E4 cliente |
| `app/src/executiveEngine/filaCliente.e2.test.js` | Assert alinhado (sem `ceoApiUrl`) |
| `server/src/routes/queue.js` | Rotas → 410 `FILA_MVP_LOCAL` |
| `server/src/routes/queue.e4.test.js` | E4-CA1/CA2 |
| `server/README.md` | Fronteira BP-001 vs fila MVP |

**Não alterados:** Motor, Dispatcher, Classificador, Gate, Consciência, Painel/coletores (E5), publicação inject E2.

---

## 4. Homologação

### 4.1 Testes locais

| Suite | Resultado |
|-------|-----------|
| `filaCliente.e2` + `e4` | **8/8 PASS** |
| `server` `queue.e4.test.js` | **2/2 PASS** (410 + health) |
| `server` orquestração | **PASS** (heartbeat intacto) |
| `test:motor:e3` | **PASS** |
| `executive/dispatcher` `npm test` | **6/6 PASS** (E3) |
| `npm run build` (app) | **OK** |

### 4.2 Smoke BP-001 (produção actual)

```text
GET …/health → 200 {"ok":true,"service":"ceo-api"}
```

`GET …/api/ceo/queue/pending` em produção **ainda devolve 200** até **deploy** do `server/` com E4.  
Evidência de código: `createApp` local → **410** `FILA_MVP_LOCAL` (teste E4-CA1).

### 4.3 Critérios

| ID | Resultado |
|----|-----------|
| E4-CA1 | Publicação/listagem oficial não usam Railway como destino canónico | **PASS** (cliente + rotas despromovidas no código) |
| E4-CA2 | health/BP-001 OK | **PASS** |
| E4-CA3 | Ciclo Job oficial independente da fila Railway | **PASS** |
| E4-CA4 | README server documenta fronteira | **PASS** |

---

## 5. Nota de deploy

Para a URL pública Railway passar a responder **410** em `/api/ceo/queue/*`, é necessário deploy do pacote `server/` (autorização explícita do patrocinador). Até lá, o **cliente MVP** já não consulta essa API para o ciclo oficial.

---

## 6. Pedido de Gate E4

Homologar E4. **Não iniciar E5** até autorização.

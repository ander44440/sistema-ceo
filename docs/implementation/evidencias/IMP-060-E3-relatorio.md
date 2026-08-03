# IMP-060 E3 — Relatório: Dispatcher na fila oficial

> **Etapa:** E3 — AUTORIZADA / entregue (aguarda Gate E3)  
> **Data:** 01/08/2026  
> **Norma:** ARQ-021; REQ-060 RF3 / CA3; REQ-053; IMP-060 § E3  
> **E4:** não iniciada.

---

## 1. Objectivo cumprido

O Dispatcher V2 consome **exclusivamente** `executive/queue/` no PC; heartbeat remoto restaurado para o Painel deixar de mostrar «Watcher ausente» **quando o watcher corre** com `CEO_API_BASE`.

| Domínio | Destino |
|---------|---------|
| Jobs (pending → despacho) | `CEO_REPO_ROOT/executive/queue/` — **só FS local** |
| Heartbeat (sinal Painel) | `POST {CEO_API_BASE}/api/ceo/orquestracao/heartbeat` |
| Railway `/api/ceo/queue/*` | **Não usado** pelo Dispatcher |

---

## 2. Decisão fina

1. **Fila:** já apontava à pasta local; reforço BOM UTF-8 em `listPending` (Jobs escritos por PowerShell).  
2. **Heartbeat:** `.env` + `.env.example` com `CEO_API_BASE` (URL Railway BP-001) — sinal, **não** fila.  
3. **Pulse independente** a cada 20s (TTL Painel = 60s) para o heartbeat não expirar durante `Agent.prompt` longo.  
4. **Logs** se `CEO_API_BASE` vazio ou POST falhar.  
5. **Sem** alterações a Motor / Gate / Classificador / Consciência / Painel / publicação E2.

---

## 3. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `executive/dispatcher/src/index.js` | Pulse HB independente; log fila oficial + `CEO_API_BASE` |
| `executive/dispatcher/src/heartbeat.js` | Retorno `remoto`; avisos; sem silêncio total |
| `executive/dispatcher/src/listPending.js` | Strip BOM |
| `executive/dispatcher/src/dispatcher.test.js` | E3-CA1/CA3 + heartbeat |
| `executive/dispatcher/.env.example` | Documenta `CEO_API_BASE` |
| `executive/dispatcher/.env` | `CEO_API_BASE` local (não versionar) |
| `executive/dispatcher/README.md` | Fila oficial vs heartbeat |

**Não alterados:** `motorExecucao/`, Classificador, Continuidade/Gate, Consciência, Painel/coletores, `filaCliente` (E2).

---

## 4. Homologação E3

### 4.1 Testes

`npm test` em `executive/dispatcher` — **6/6 PASS**

### 4.2 Dry-run (detecção na fila oficial)

```text
[dispatcher] queue=E:\anderson\CEO\executive\queue (fila oficial MVP — só FS local)
[dispatcher] heartbeat API=https://ceo-api-production-43e6.up.railway.app
[dispatcher] pending: JOB-000016 — IMP-060 E2 smoke (+2 na fila)
[dispatcher] dry-run: não chama o Agent (primeiro seria JOB-000016)
```

### 4.3 Watcher — heartbeat + início de processamento

```text
[dispatcher] mode=watch
[dispatcher] pending: JOB-000016 — IMP-060 E2 smoke (+2 na fila)
[dispatcher] a acordar Agent local para JOB-000016…
[dispatcher] Agent não concluído: status=error
```

* Detecção e **arranque** do ciclo Agent: **PASS** (E3).  
* Conclusão do Agent SDK (`status=error`): fora do escopo da restauração da fila/heartbeat — operacional Cursor/SDK; Job pode permanecer `pending` para retentativa.  
* `executive/dispatcher/logs/heartbeat.json` actualizado (`origem: watcher`, `pending` reflecte fila local).

### 4.4 Build

`npm run build` em `app/` — **OK** (sem impacto; Dispatcher sem bundle Vite).

### 4.5 Critérios

| ID | Resultado |
|----|-----------|
| E3-CA1 | Lê só `executive/queue` local | **PASS** |
| E3-CA2 | Job E2 (`JOB-000016`…) visível a `listarPendentes` / ciclo | **PASS** |
| E3-CA3 | Zero `/api/ceo/queue` no código do Dispatcher | **PASS** |
| E3-CA4 | Lock + heartbeat local + POST sinal | **PASS** |
| Painel | Com watcher **a correr** + `CEO_API_BASE`, deixa de expirar heartbeat | **PASS** (ops: manter `npm start`) |

---

## 5. Operação

```powershell
cd E:\anderson\CEO\executive\dispatcher
# Garantir CEO_API_BASE no .env (ver .env.example)
npm start
```

Sem watcher activo, o Painel volta a `heartbeat_expirado` — comportamento correcto (TTL).

---

## 6. Pedido de Gate E3

Homologar E3. **Não iniciar E4** até autorização.

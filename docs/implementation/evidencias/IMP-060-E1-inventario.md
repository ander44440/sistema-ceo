# IMP-060 E1 — Inventário: fila via `/api/ceo/queue/*` (e cutover Railway)

> **Etapa:** E1 — AUTORIZADA  
> **Data:** 01/08/2026  
> **Natureza:** inventário apenas — **sem alteração de código**  
> **Norma:** ARQ-021; REQ-060; IMP-060 § E1  
> **Premissa de produção:** `VITE_CEO_API_BASE=https://ceo-api-production-43e6.up.railway.app` (BP-001 E12) → `ceoApiUrl("/api/ceo/queue/…")` resolve para o host Railway.

---

## 0. Como o cutover actúa

| Peça | Papel |
|------|--------|
| `app/src/ceoApiBase.js` → `ceoApiUrl(path)` | Se `VITE_CEO_API_BASE` preenchida, prefixa **todas** as `/api/ceo/*` (inclui fila). |
| `app/src/executiveEngine/filaCliente.js` | Único cliente HTTP de fila no SPA: `POST …/jobs`, `GET …/pending`. |
| Dev sem base | `fetch` relativo → plugin Vite `executionQueuePlugin.js` → disco **local** `executive/queue`. |
| Prod com base | `fetch` → Railway `server/src/routes/queue.js` → disco do **serviço Railway**. |

O Dispatcher (`executive/dispatcher`) **não** aparece neste inventário HTTP — lê ficheiros locais; não chama `/api/ceo/queue/*`.

---

## 1. Ocorrências de `/api/ceo/queue/jobs`

### 1.1 Cliente — escrita (POST)

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| C1 | `app/src/executiveEngine/filaCliente.js` | `publicarJobFila` | `POST ceoApiUrl("/api/ceo/queue/jobs")` — publicação HTTP canónica do SPA | **Escrita** | **A** | Ponto único de rede no browser; redireccionar aqui (ou o cutover) afecta **todo** o ciclo oficial de criação de Job em produção. |
| C2 | `app/src/executiveEngine/capacidades/fila.js` | `capacidadeFila.executar` | C4 / instrução «publicar job…» → chama `publicarJobFila` | **Escrita** | **A** | Capacidade explícita de fila deixa de gravar onde o Dispatcher lê, se o destino HTTP continuar Railway. |
| C3 | `app/src/executiveEngine/index.js` | `executar` (ramo Continuidade) | Se `VITE_CEO_API_BASE` e sem `deps.publicarJob` → injecta `publicarJobFila` | **Escrita** (indirecta) | **A** | Gate «Aprovado.» em produção publica via Railway; Job não chega ao Dispatcher local. |
| C4 | `app/src/executiveEngine/index.js` | `executar` (destino `motor_execucao`) | Idem: injecta `publicarJobFila` quando há API base | **Escrita** (indirecta) | **A** | C3 → Motor → Job em produção vai para Railway. |
| C5 | `app/src/modules/conversa/conversa.js` | handler Continuidade / Gate | Importa `publicarJobFila` e passa `{ publicarJob: publicarJobFila }` | **Escrita** (indirecta) | **A** | Continuidade na UI Conversa publica na fila apontada pelo cliente HTTP. |
| C6 | `app/src/mre/integracaoNucleo.js` | pós-deliberação (`aplicarEfeitosPosDeliberacao`) | Fallback `deps.publicarJob \|\| publicarJobFila` (salvo `skipFila`) | **Escrita** (indirecta) | **A** | Efeitos MRE (`delegar` / despacho) em produção usam Railway se não houver porta injectada. |

### 1.2 Servidor — escrita (POST)

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| S1 | `server/src/routes/queue.js` | handler `POST /api/ceo/queue/jobs` | Recebe publicação; chama `fila.publicar` | **Escrita** | **A** (em prod) / local paridade | Em Railway grava no FS do serviço; despromover/recusar altera produtor remoto. |
| S2 | `server/src/services/executionQueue.js` | `publicar` → `escreverJob` | Persistência `JOB-*.json` sob `repoRoot/executive/queue` **do processo Node** | **Escrita** | **A** (host onde corre) | No PC = conforme REQ-045; no Railway = fila «A» do desvio. |
| S3 | `app/server/executionQueuePlugin.js` | middleware `POST …/jobs` | Paridade Vite dev → `executionQueue.publicar` local | **Escrita** | **A** (dev local) | Dev sem `VITE_CEO_API_BASE` já escreve na fila oficial; não é o desvio de produção. |
| S4 | `app/server/executionQueue.js` | `publicar` / `escreverJob` | Persistência usada pelo plugin Vite | **Escrita** | **A** (dev) | Espelho do serviço; alterar afecta só caminho local do plugin. |

### 1.3 Cliente — leitura (GET lista completa)

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| — | *(nenhum no SPA)* | — | Nenhum `fetch` a `GET /api/ceo/queue/jobs` no código `app/src` | — | — | Listagem completa só no servidor / smoke / ferramentas. |

### 1.4 Servidor — leitura (GET)

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| S5 | `server/src/routes/queue.js` | handler `GET /api/ceo/queue/jobs` | Lista todos os Jobs (qualquer estado) | **Leitura** | **B** | Usado para diagnóstico/smoke; Painel oficial não chama este path no browser. |
| S6 | `app/server/executionQueuePlugin.js` | `GET …/jobs` | Paridade local | **Leitura** | **B** | Só dev/local. |

---

## 2. Ocorrências de `/api/ceo/queue/pending`

### 2.1 Cliente

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| C7 | `app/src/executiveEngine/filaCliente.js` | `listarJobsPendentes` | `GET ceoApiUrl("/api/ceo/queue/pending")` | **Leitura** | **A** / **B*** | Em produção lista pending **Railway**; alimenta capacidade `fila` «listar jobs». *Classificação: essencial à *visão operacional* da fila no CEO; não é o consumidor Dispatcher.* |
| C8 | `app/src/executiveEngine/capacidades/fila.js` | `capacidadeFila.executar` (`listar_jobs_fila`) | Consulta pendentes via `listarJobsPendentes` | **Leitura** | **B** | UI/comando C4; se apontar Railway, mostra fila errada ao utilizador. |

\*C7 é **A** se a listagem for tratada como fonte de verdade do ciclo MVP; **B** se for só comando de interface. Em produção actual comporta-se como fonte enganosa → tratar como **A** para restauração (RF8).

### 2.2 Servidor

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| S7 | `server/src/routes/queue.js` | `GET /api/ceo/queue/pending` | Lista pending do FS do host | **Leitura** | **A** (host) / **B** (API) | Em Railway alimenta clientes e smokes com fila remota. |
| S8 | `app/server/executionQueuePlugin.js` | `GET …/pending` | Paridade Vite | **Leitura** | **A** (dev) | Local conforme. |

---

## 3. Restantes `/api/ceo/queue/*`

### 3.1 `PATCH /api/ceo/queue/jobs/:id`

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| S9 | `server/src/routes/queue.js` | handler `PATCH …/jobs/:id` | Actualiza estado (`running`/`completed`/…) via HTTP | **Escrita** | **A** (se usado no ciclo remoto) / **C** no SPA | **Nenhum caller no `app/src`** — Agent/skill actualizam ficheiros locais. Em Railway serve smoke (BP-001 E12 cancelou JOB) e eventual cliente externo. |
| S10 | `app/server/executionQueuePlugin.js` | `PATCH …/jobs/:id` | Paridade local | **Escrita** | **C** no SPA / **A** se ferramenta HTTP local | Mesmo padrão; Dispatcher/Agent não usam HTTP. |
| S11 | `server/src/services/executionQueue.js` / `app/server/executionQueue.js` | `atualizarEstado` | Persistência da transição | **Escrita** | **A** (disco do host) | Alterar afecta quem usa PATCH ou quem partilha o módulo. |

### 3.2 Registo / montagem do servidor

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| S12 | `server/src/app.js` | `registrarQueue(app, …)` | Expõe todas as rotas `/api/ceo/queue/*` no Hono (Railway) | Infra | **A** (superfície remota) | Remover/desligar rotas = E4; não afecta Dispatcher local. |
| S13 | `app/vite.config.js` (registo do plugin) | `executionQueuePlugin` | Expõe as mesmas rotas no Vite dev | Infra | **A** (dev local) | Necessário para fila local sem Railway. |

### 3.3 Leitura de Jobs **sem** path `/queue/*` no browser, mas na **mesma** loja Railway em produção

Estes pontos **não** fazem `fetch("/api/ceo/queue/…")` no SPA, mas no processo Railway usam `criarFilaExecucao(repoRoot)` → FS remoto — mesmos Jobs que as rotas `/queue/*`.

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| P1 | `server/src/routes/orquestracao.js` | `registrarOrquestracao` | Injeta `listarPorEstado: (e) => fila.listarPorEstado(e)` nos coletores | **Leitura** | **B** | Snapshot/SSE do Painel em produção mostra pending/running da fila **Railway** (ex.: «Há trabalho na fila» com dezenas de pending remotos). |
| P2 | `server/src/services/orquestracao/coletores.js` | `coletorAgent` / `coletorDispatcher` | Conta pending/running via `listarPorEstado` | **Leitura** | **B** | Indicadores Agent/Dispatcher desalinhados da fila oficial do PC. |
| P3 | `app/src/orquestracao/coletores.js` | idem (paridade cliente/tests) | Mesma lógica; deps injectáveis | **Leitura** | **B** | Em browser puro depende de quem injecta `listarPorEstado` (servidor Railway faz P1). |

### 3.4 Consciência Operacional

| # | Arquivo | Função | Finalidade | R/W | Classe | Impacto se alterado |
|---|---------|--------|------------|-----|--------|---------------------|
| P4 | `app/src/conscienciaOperacional/leitoresPadrao.js` | `criarLeitoresConscienciaPadrao` F1/F2 | Por omissão devolve `[]`; **não** chama `/queue/*` salvo `deps.jobsPendentes` injectado | **Leitura** (se injectado) | **B** (quando ligado) | Hoje o default **não** usa Railway; risco futuro se alguém injectar `listarJobsPendentes`. |

### 3.5 Documentação / testes (não runtime prod)

| # | Arquivo | Nota | Classe |
|---|---------|------|--------|
| D1 | `server/README.md`, BP-001 E6/E12, ARQ-017, IMP-060, etc. | Documentam os paths | **C** (doc) |
| D2 | Testes (`*.test.js`) que mencionam `publicarJobFila` / `/api/ceo/queue` | Asserts de fronteira ou mocks em memória | **C** |
| D3 | `executive/dispatcher/**` | **Não** usa `/api/ceo/queue/*` | Fora do inventário HTTP (consumidor local) |

---

## 4. Mapa resumido por classificação

### A — Essencial ao ciclo do Job

| IDs | Resumo |
|-----|--------|
| C1–C6 | Cliente: `publicarJobFila` + injectores Motor / Continuidade / Conversa / MRE / capacidade fila (escrita) |
| C7 (+ C8 se tratado como verdade) | Listagem pending usada como visão da fila |
| S1–S4, S7–S8, S11–S13 | Servidor/plugin que persistem ou expõem a fila no host onde o Node corre |
| S9 | PATCH remoto (ciclo HTTP; Agent actual não depende dele no PC) |

### B — Apenas interface / painel

| IDs | Resumo |
|-----|--------|
| S5–S6 | `GET /jobs` completo |
| C8 | Listar jobs na capacidade (UI/comando) — se separado da «verdade» do ciclo |
| P1–P3 | Coletores Orquestração (Agent «há trabalho na fila») a partir do FS do host da API |
| P4 | Consciência F1/F2 **se** ligados a listagem HTTP |

### C — Código legado / periférico

| IDs | Resumo |
|-----|--------|
| S9–S10 (do ponto de vista do SPA) | PATCH sem caller no `app/src` |
| D1–D2 | Docs e testes |
| Fallbacks mortos | N/A além do acima |

---

## 5. Diagrama actual vs alvo (E1)

```text
ACTUAL (produção Vercel + VITE_CEO_API_BASE)
  SPA ──POST/GET──► Railway /api/ceo/queue/* ──► FS Railway
  Painel snapshot ──listarPorEstado──► FS Railway
  Dispatcher ──fs──► executive/queue (PC)     ← desligado do produtor

ALVO (ARQ-021 / REQ-060)
  SPA/Motor ──publicar──► executive/queue (PC)
  Dispatcher ──fs──► executive/queue (PC)
  Railway ──LLM/health/(heartbeat)──► BP-001; queue ≠ fonte de verdade
```

---

## 6. Critérios E1 (IMP-060)

| ID | Resultado |
|----|-----------|
| E1-CA1 | `publicarJobFila` / `POST …/jobs` inventariados (C1–C6, S1–S4) | **PASS** |
| E1-CA2 | Listagens oficiais inventariadas (C7–C8, S5–S8, P1–P3) | **PASS** |
| E1-CA3 | Preservar LLM/health vs despromover queue (ceoApiBase afecta ambos; fila isolada em E2/E4) | **PASS** (nota) |
| E1-CA4 | Sem alteração de código de produto | **PASS** |

---

## 7. Pedido de Gate E1

Homologar este inventário como base da E2 (redireccionar publicação).  
**Sem código. Sem commit.** Aguardar autorização da E2.

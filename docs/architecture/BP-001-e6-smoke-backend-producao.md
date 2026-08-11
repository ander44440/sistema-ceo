# BP-001 E6 — Smoke Test do Backend de Produção (Hono-only)

> **O que é?** Relatório de smoke test exclusivo do servidor Hono (`server/`), sem Vite.  
> **Por que existe?** Confirmar paridade operacional das rotas migradas (E2–E5) e listar bloqueios reais para o front consumir a API de produção.  
> **Para quem?** Patrocinador / CTO (autorização das etapas seguintes).  
> **Sucesso:** Inventário claro do que passa, do que falha, e do que ainda impede o CEO online.  
> **Status:** Relatório — **aguarda autorização** para E7+.  
> **Data:** 01/08/2026 · **Autor:** Engenheiro (Cursor) · **Job:** `JOB-000012`  
> **Proibições cumpridas:** sem alteração de código; sem remover plugins; sem Railway; sem Vercel.

---

## Condições do ensaio

| Item | Valor |
|------|--------|
| Processo | Só `node src/index.js` em `server/` |
| Porta | `8796` (`PORT=8796`) |
| `CEO_DATA_ROOT` | `E:\anderson\CEO` |
| Vite `:5173` | **Não estava a correr** |
| Plugins Vite | Presentes no repo; **não usados** neste ensaio |

---

## 1. Resultado do smoke test

| Rota | Resultado | Evidência |
|------|-----------|-----------|
| `GET /health` | **PASS** | `{ ok: true, service: "ceo-api" }` |
| `GET /api/ceo/llm-status` | **PASS** | `configurado=true`, `modelo=gpt-4o-mini` |
| `POST /api/ceo/deliberar` | **PASS** | `ok=true`, `origem=llm`, texto `OK` |
| `GET /api/ceo/queue/pending` | **PASS** | Lista pending (incl. `JOB-000014`) |
| `GET /api/ceo/queue/jobs` | **PASS** | 15 jobs listados |
| `POST /api/ceo/queue/jobs` | **PASS** | Job criado; artefacto temp cancelado após teste |
| `PATCH /api/ceo/queue/jobs/:id` | **PASS** | `JOB-000015` → `cancelled` |
| `GET /api/ceo/onboarding/carregar` | **PASS** | Perfil existente + 7 itens de transcrição |
| `POST /api/ceo/onboarding/salvar` | **PASS** | Escrita + roundtrip OK |
| CORS `OPTIONS /health` | **PASS** | `Access-Control-Allow-Origin: http://localhost:5173` |

**Resumo:** **9/9 grupos OK** — Hono-only operacional com dados reais em `executive/`.

### 1.1 Nota sobre ensaio anterior (31/07)

O ensaio de 31/07 falhou na fila por BOM UTF-8 em `JOB-000005`…`010`. Desde então, `server/src/services/executionQueue.js` tolera BOM via `textoSemBom()` (sem alterar ficheiros em disco). CORS local foi adicionado em E10 (`CEO_ALLOWED_ORIGIN` / loopback).

---

## 2. Dependências restantes do Vite

O Backend de Produção **já não precisa** do Vite para servir as rotas migradas. O Vite continua relevante só no **ciclo de desenvolvimento do SPA**:

| Dependência | Natureza | Impacto |
|-------------|----------|---------|
| `app/vite.config.js` regista `ceoLlmPlugin`, `executionQueuePlugin`, `onboardingPlugin` | Convivência temporária (E1) | Em `npm run dev`, a API continua a vir dos plugins, **não** do Hono |
| Clientes browser usam paths relativos `/api/ceo/*` | Contrato de front | Só funcionam se o **mesmo origin** servir a API (Vite proxy/plugins) **ou** se houver base URL / reverse proxy |
| `vite build` / `vite preview` | Build do SPA | Preview só inclui LLM plugin; fila/onboarding **não** estão em `configurePreviewServer` (já era assim) |
| Nenhum `VITE_CEO_API_BASE` no código | Lacuna de cutover | Front em Vercel não sabe o host do Hono |

**Conclusão:** as rotas Hono **não dependem** dos plugins. O **frontend em runtime** ainda depende, na prática, do Vite (ou de um proxy) porque não há apontamento configurável para o `ceo-api`.

---

## 3. Bloqueios reais para colocar o CEO online

Ordem prática (do que impede deploy útil):

1. **API não publicada** — `server/` não está em Railway (nem outro host). Vercel serve só estáticos (`vercel.json` → `app/dist`); rewrites vão para `index.html`, não para Node.
2. **Front sem base URL da API** — `llmCliente.js`, `filaCliente.js`, `onboarding/storage` fazem `fetch("/api/ceo/...")` relativo. Em `https://sistema-ceo.vercel.app` isso bate no Vercel, não no Hono → 404/HTML.
3. **CORS em produção** — middleware E10 OK para loopback; falta `CEO_ALLOWED_ORIGIN=https://sistema-ceo.vercel.app` no host Railway.
4. **Persistência em produção** — Railway sem volume → `executive/queue` e `executive/onboarding` efémeros. Precisa `CEO_DATA_ROOT` + volume (ou storage posterior).
5. **Segredos LLM** — `CEO_LLM_*` / `OPENAI_API_KEY` têm de existir no ambiente do host da API (não no bundle Vercel).
6. **Cutover de desenvolvimento** — enquanto não houver proxy Vite → Hono ou `VITE_CEO_API_BASE`, o dia-a-dia local continua nos plugins (aceitável, mas dual-run).
7. **Consumo da fila** — continua humano/Cursor; não bloqueia “CEO online” para deliberar, mas a fila operacional em cloud ainda não tem executor automático.

**Não são bloqueios deste smoke:** remoção dos plugins Vite; existência do entrypoint Hono; contratos LLM/onboarding/fila já migrados; BOM histórico (tolerado em runtime).

---

## 4. Veredito

| Pergunta | Resposta |
|----------|----------|
| O Hono sozinho responde às rotas migradas? | **Sim** — health, LLM, fila, onboarding. |
| Ainda depende dos plugins Vite para essas rotas? | **Não** (neste ensaio os plugins não estavam ativos). |
| O frontend de produção já pode consumir o Hono? | **Não** — faltam host da API, base URL (ou proxy), CORS prod e persistência. |

---

## Pedido de autorização

Próximos passos possíveis (não iniciados):

- **E7:** script de paridade automatizado.  
- **E8:** proxy Vite / `VITE_CEO_API_BASE`.  
- **E9:** deploy Railway.

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (ensaio); Patrocinador (autorização pendente) |
| Quando | 01/08/2026 |
| Por quê | Gate BP-001 E6 — smoke Hono-only (`JOB-000012`) |
| Baseado em quê | Servidor `PORT=8796`; dados reais em `executive/` |
| Resultado | 9/9 rotas PASS; cutover front + deploy Railway ainda pendentes |

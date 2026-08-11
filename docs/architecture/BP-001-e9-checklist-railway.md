# BP-001 E9 — Checklist de Publicação Railway (Backend de Produção)

> **O que é?** Checklist completo para publicar `server/` (Hono) no Railway.  
> **Por que existe?** Gate pré-deploy: confirmar requisitos e parâmetros sem executar o deploy.  
> **Para quem?** Patrocinador / operador do Railway.  
> **Sucesso:** Autorização informada para o deploy real (próxima etapa).  
> **Status:** Checklist — **aguarda autorização.** Não é deploy.  
> **Data:** 31/07/2026 · **Autor:** Engenheiro (Cursor)  
> **Proibições cumpridas:** sem alterar código; sem commit; sem deploy.

---

## 1. Verificação de requisitos (estado atual do código)

| Requisito Railway | Estado no `server/` | Nota |
|-------------------|---------------------|------|
| Entrypoint Node autónomo | ✅ `npm start` → `src/index.js` | |
| Escuta `process.env.PORT` | ✅ `config.fromEnv()` (default local 8787) | Railway injeta `PORT` |
| Health check HTTP | ✅ `GET /health` → `{ ok, service: "ceo-api" }` | |
| `package.json` + lockfile | ✅ `server/package.json`, `package-lock.json` | |
| Dependências de produção | ✅ `hono`, `@hono/node-server` | Sem Vite |
| ESM / Node ≥ 20 | ✅ `"type": "module"`, `engines.node >= 20` | Usar imagem Node 20+ |
| Rotas `/api/ceo/*` | ✅ LLM, fila, onboarding | Paridade BP-001 E3–E5 |
| Persistência em disco | ⚠️ via `CEO_DATA_ROOT` | **Volume obrigatório** em produção |
| CORS | ❌ ausente | Bloqueio se front Vercel ≠ origin da API (cutover E8+CORS) |
| `railway.toml` / `Dockerfile` | ❌ não existe | Opcional — UI Railway basta |
| `.env` no repo | ❌ (correto) | Segredos só no painel Railway |

**Veredito pré-deploy:** o binário HTTP está pronto para subir no Railway. **Não** está “CEO online completo” até volume + CORS + `VITE_CEO_API_BASE` no front (fora do deploy da API).

---

## 2. Parâmetros de publicação

### 2.1 Root Directory

| Campo | Valor |
|-------|--------|
| **Root Directory** | `server` |

Monorepo: build/install só dentro de `server/`. Não usar a raiz do repo (evita instalar o Vite do `app/`).

### 2.2 Start Command

| Campo | Valor |
|-------|--------|
| **Start Command** | `npm start` |

Equivalente: `node src/index.js`.  
**Install Command** (default): `npm install` (ou `npm ci` se preferir lockfile estrito).

### 2.3 Porta

| Campo | Valor |
|-------|--------|
| **Porta** | A que o Railway define em `PORT` (não fixar 8787) |

O código já faz `listen(process.env.PORT)`. Não definir `PORT` manualmente no painel (Railway gere).

### 2.4 Health Check

| Campo | Valor recomendado |
|-------|-------------------|
| **Healthcheck Path** | `/health` |
| **Método** | GET |
| **Resposta esperada** | HTTP 200, JSON com `ok: true` |

### 2.5 Variáveis de ambiente

Definir no **Railway → Variables** (nunca no Git):

| Variável | Obrigatória | Valor sugerido / notas |
|----------|-------------|-------------------------|
| `CEO_LLM_API_KEY` | **Sim** (ou `OPENAI_API_KEY`) | Chave do provedor |
| `OPENAI_API_KEY` | Alternativa | Aceite pelo código |
| `CEO_OPENAI_API_KEY` | Alternativa | Aceite pelo código |
| `CEO_LLM_BASE_URL` | Não | Default `https://api.openai.com/v1` |
| `CEO_LLM_MODEL` | Não | Default `gpt-4o-mini` |
| `CEO_DATA_ROOT` | **Sim em produção** | Caminho do volume (ex. `/data`) — ver §2.6 |
| `CEO_LLM_TLS_INSECURE` | **Não** | Não usar em Railway |
| `PORT` | Não definir | Railway injeta |
| `NODE_ENV` | Opcional | `production` |

`carregarEnvLocal()` procura `.env` em disco — no Railway **não haverá** `app/.env`; as variáveis do painel bastam.

### 2.6 Volume e `CEO_DATA_ROOT`

Fila e onboarding gravam em:

```text
{CEO_DATA_ROOT}/executive/queue/
{CEO_DATA_ROOT}/executive/onboarding/
```

| Item | Recomendação |
|------|----------------|
| **Volume Railway** | Criar volume persistente (ex. nome `ceo-data`) |
| **Mount path** | `/data` |
| **Variável** | `CEO_DATA_ROOT=/data` |
| **Estrutura** | O código cria `executive/queue` e `executive/onboarding` com `mkdirSync` |

**Sem volume:** dados da fila/onboarding **perdem-se** a cada redeploy/restart (filesystem efémero).

**Migração inicial (manual, pós-primeiro deploy):** se quiser seed a partir do repo local, copiar `executive/` para o volume (via one-off / SCP / script) — **não** faz parte deste checklist de parâmetros; é operação pós-autorização.

### 2.7 Rede / domínio

| Item | Ação |
|------|------|
| **Generate Domain** | Ativar domínio `*.up.railway.app` (ou custom) |
| **URL da API** | Ex. `https://<serviço>.up.railway.app` |
| **Smoke pós-deploy** | `GET https://…/health` |

---

## 3. Checklist operacional (ordem de execução — quando autorizado)

Usar como guião no painel Railway; **não executar agora**.

- [ ] Criar projeto/serviço Railway ligado ao GitHub `ander44440/sistema-ceo` (ou deploy a partir do branch atual)
- [ ] **Root Directory** = `server`
- [ ] **Start Command** = `npm start`
- [ ] Node 20+ (default Railway recente OK; confirmar)
- [ ] Criar **Volume** montado em `/data`
- [ ] Definir `CEO_DATA_ROOT=/data`
- [ ] Definir `CEO_LLM_API_KEY` (ou `OPENAI_API_KEY`)
- [ ] Opcional: `CEO_LLM_MODEL`, `CEO_LLM_BASE_URL`
- [ ] **Não** definir `CEO_LLM_TLS_INSECURE`
- [ ] Health check path = `/health`
- [ ] Deploy / wait healthy
- [ ] `curl https://<url>/health`
- [ ] `curl https://<url>/api/ceo/llm-status`
- [ ] Guardar a URL pública para o cutover do front (`VITE_CEO_API_BASE`)

### Fora do âmbito deste deploy da API (ainda bloqueiam “CEO online”)

- [ ] CORS no Hono (origem Vercel) — **código ainda não tem**
- [ ] Rebuild Vercel com `VITE_CEO_API_BASE=https://<railway-url>`
- [ ] (Opcional) seed do volume com `executive/` local

---

## 4. Resumo dos 6 itens pedidos

| # | Item | Valor |
|---|------|--------|
| 1 | **Start Command** | `npm start` |
| 2 | **Root Directory** | `server` |
| 3 | **Variáveis** | `CEO_LLM_API_KEY` (obrig.); `CEO_DATA_ROOT=/data` (obrig. c/ volume); opcionais LLM; sem TLS inseguro |
| 4 | **Volume** | Mount `/data` → `CEO_DATA_ROOT=/data` (persiste `executive/`) |
| 5 | **Health Check** | `GET /health` |
| 6 | **Porta** | `process.env.PORT` (Railway); não hardcode |

---

## 5. Riscos residuais

1. **CORS** — browser em `sistema-ceo.vercel.app` a chamar Railway falhará até haver middleware CORS (etapa futura).  
2. **Volume vazio** — fila/onboarding começam vazios; OK para smoke, não é clone automático do laptop.  
3. **Monorepo watch paths** — se o Railway rebuildar a cada change em `docs/`, restringir watch a `server/**` se a UI permitir.  
4. **Segredos** — não copiar `app/.env` para o Git; só Variables.

---

## Pedido de autorização

Autorizar **BP-001 E9-deploy** (criar serviço Railway + volume + env + primeiro deploy) **ou** autorizar primeiro **CORS (E9.1 / E10)** antes do cutover do front.

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (checklist); Patrocinador (autorização pendente) |
| Quando | 31/07/2026 |
| Por quê | Preparar publicação Railway sem executar deploy |
| Baseado em quê | `server/` E2–E8; diagnóstico E6; `package.json` / `PORT` / `/health` / `CEO_DATA_ROOT` |
| Resultado | Checklist pronto; **sem deploy** |

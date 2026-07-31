# BP-001 — E1: Arquitetura de Migração do Backend de Produção do CEO

> **O que é?** Proposta arquitetural para extrair o backend de desenvolvimento (middlewares Vite) para um **servidor HTTP de produção** publicável (alvo: Railway / Node long-running).  
> **Por que existe?** O diagnóstico E1 mostrou que não há entrypoint de servidor autónomo; as rotas `/api/ceo/*` só existem com Vite em `configureServer`. O front em Vercel está estático e sem API.  
> **Para quem?** Patrocinador (autoriza); CTO (Gate ARQ/REQ se exigido); Engenheiro (implementa só após autorização).  
> **Sucesso:** Documento suficiente para autorizar a BP-001 E2 sem ambiguidade de fronteiras.  
> **Status:** **Proposta — aguarda autorização.** Não é ARQ/REQ oficial até Gate.  
> **Data:** 31/07/2026 · **Autor:** Engenheiro (Cursor)  
> **Proibições deste E1:** não alterar código; não mover ficheiros; não commit; não implementar.

---

## 1. Arquitetura atual

```text
Browser (SPA Vite)
   │  fetch /api/ceo/*
   ▼
Vite Dev Server (:5173)
   ├── ceoLlmPlugin          → GET/POST LLM (também em preview :4173)
   ├── executionQueuePlugin  → fila (só configureServer)
   └── onboardingPlugin      → onboarding (só configureServer)
         │
         ├─→ API LLM externa (OpenAI-compatible)
         ├─→ executive/queue/*.json + PROXIMO.md   (fs)
         └─→ executive/onboarding/*.json           (fs)

Build (`vite build`) → app/dist (estático)
Vercel produção → só estáticos → /api/ceo/* 404 / inexistente
```

| Aspeto | Estado |
|--------|--------|
| Framework HTTP | Connect middleware via Vite — **não** Express/Fastify |
| Entrypoint | `npm run dev` (Vite) |
| Porta | 5173 (dev); sem `process.env.PORT` |
| Persistência servidor | Disco local no repo |
| Workers | Nenhum; consumo da fila é externo (Cursor) |
| MRE / Speaker / Núcleo | Código **cliente** (browser) + LLM via proxy |

---

## 2. Arquitetura alvo

```text
Browser (SPA — Vercel ou CDN)
   │  fetch https://api.<domínio>/api/ceo/*   (ou path /api no mesmo domínio via proxy)
   ▼
Servidor Node de produção (Railway)
   ├── HTTP framework (ver §6)
   ├── Rotas /api/ceo/*  (paridade com plugins atuais)
   ├── Static opcional (fase posterior; fora do MVP BP-001)
   │
   ├─→ API LLM externa
   ├─→ Persistência fila/onboarding (volume Railway ou object/DB — ver riscos)
   └─→ Health GET /health

Frontend continua a ser o bundle Vite; **não** depende de Vite em runtime de produção.
```

### Princípios alvo

1. **Separação:** front estático ≠ API Node long-running.  
2. **Paridade de contrato:** mesmas rotas, métodos e shapes JSON do frontend atual.  
3. **Segredos só no servidor** (`CEO_LLM_*`).  
4. **`PORT` do ambiente** (Railway).  
5. **Dev local preservado:** Vite + plugins continuam a funcionar até cutover; depois plugins tornam-se thin proxy ou desligam-se por flag.

---

## 3. Componentes a extrair do Vite

| Componente atual | Destino | Notas |
|------------------|---------|--------|
| `app/server/ceoLlmPlugin.js` | Módulo de rotas LLM + serviço `chamarLlm` | Manter lógica de TLS/env |
| `app/server/executionQueuePlugin.js` | Rotas HTTP da fila | |
| `app/server/executionQueue.js` | Domínio/persistência da fila | Já é puro Node — reutilizar |
| `app/server/onboardingPlugin.js` | Rotas + I/O onboarding | |
| Helpers `lerJson` / `enviarJson` | Util partilhado | Deduplicar |
| Registo em `vite.config.js` | Removido **só** após cutover (fase final) | Até lá, dual-run |

**Fora do âmbito de extração (permanecem no cliente):**

- MRE, Speaker, Núcleo Executivo, catálogo, `localStorage`  
- UI / router / Vite build do SPA  

---

## 4. Estrutura de diretórios proposta

Nova pasta na raiz do monorepo (não mover o front):

```text
CEO/
├── app/                          # SPA (inalterada neste E1)
│   ├── src/
│   ├── server/                   # plugins Vite — convivem até cutover
│   └── ...
├── server/                       # NOVO — Backend de Produção (BP-001)
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # entrypoint
│   │   ├── app.js                # cria app HTTP + rotas
│   │   ├── config.js             # env, PORT, paths
│   │   ├── routes/
│   │   │   ├── llm.js
│   │   │   ├── queue.js
│   │   │   ├── onboarding.js
│   │   │   └── health.js
│   │   ├── services/
│   │   │   ├── llmClient.js
│   │   │   └── executionQueue.js # port/adapt de app/server/executionQueue.js
│   │   └── lib/
│   │       └── http.js           # lerJson / enviarJson
│   └── README.md
├── executive/                    # dados (fila/onboarding) — paths configuráveis
├── docs/architecture/
│   └── BP-001-e1-arquitetura-migracao-backend.md  # este documento
└── vercel.json                   # front; API apontará para Railway (fase de integração)
```

**Alternativa rejeitada neste E1:** colocar o servidor dentro de `app/server-prod/` — mistura ciclos de vida front/back e complica Railway (`Root Directory`).

---

## 5. Novo entrypoint do servidor

| Item | Proposta |
|------|----------|
| Ficheiro | `server/src/index.js` |
| Comando | `node src/index.js` ou `npm start` |
| Boot | Carregar config → criar app → `listen(process.env.PORT \|\| 8787)` |
| Railway | `Start Command`: `npm start` · Root Directory: `server` |
| Health | `GET /health` → `{ ok: true, service: "ceo-api" }` |

Pseudo-fluxo (não é código a implementar agora):

```text
index.js
  → config.fromEnv()
  → app = createApp(config)
  → app.listen(PORT)
```

---

## 6. Framework recomendado

### Recomendação: **Hono** (em Node via `@hono/node-server`)

| Critério | Hono | Express | Fastify |
|----------|------|---------|---------|
| Peso / cold start futuro | Excelente | Médio | Bom |
| Estilo moderno (ESM, tipagem opcional) | Forte | Legado | Forte |
| Paridade com middleware Connect atual | Adequada (handlers HTTP simples) | Mais próxima do Connect | Adequada |
| Dependências | Mínimas | Maduro, mais histórico | Maduro |
| Railway | Suportado | Suportado | Suportado |

**Justificativa:** as rotas atuais são handlers pequenos (ler body JSON → JSON out → fs/fetch). Hono cobre isso com API clara, ESM nativo e caminho fácil para edge/serverless se no futuro a API migrar parcialmente para Vercel. Express seria aceitável por familiaridade Connect; Fastify seria overkill para o volume atual.

**Decisão vinculante só após Gate do Patrocinador/CTO.** Se o CTO preferir Express por política de stack, a arquitetura de pastas e contratos permanece válida.

---

## 7. Estratégia de compatibilidade total com o frontend atual

### Contrato HTTP (congelado)

Manter **exatamente**:

- Prefixos `/api/ceo/llm-status`, `/api/ceo/deliberar`, `/api/ceo/queue/*`, `/api/ceo/onboarding/*`  
- Métodos e códigos HTTP já usados (200/201/400/404/502/503)  
- Shapes `{ ok, ... }` já consumidos por `llmCliente.js`, `filaCliente.js`, `onboarding/storage`

### Resolução de URL no browser

| Fase | Comportamento |
|------|----------------|
| Dev local atual | `fetch("/api/ceo/...")` → Vite plugins (inalterado) |
| Dev com API nova | Vite `server.proxy`: `/api/ceo` → `http://localhost:8787` **ou** `VITE_CEO_API_BASE` |
| Produção | `VITE_CEO_API_BASE=https://<railway-url>` **ou** rewrite Vercel → Railway |

Regra: **zero mudanças de path** no cliente na primeira entrega; apenas base URL configurável (uma constante / env Vite). Se `VITE_CEO_API_BASE` vazio → relativo (comportamento atual).

### CORS

Servidor de produção deve permitir origem do front Vercel (`sistema-ceo.vercel.app` + previews) quando front e API forem hosts distintos.

---

## 8. Migração incremental (sem interromper o desenvolvimento)

```text
Fase A — Espelho
  Criar server/ com rotas equivalentes; Vite plugins intactos.
  Dev: opcionalmente proxy para server/; default continua plugins.

Fase B — Validação local
  Bateria de smoke HTTP (status, deliberar mock/chave, queue CRUD, onboarding R/W)
  vs. mesmas chamadas via Vite.

Fase C — Deploy API (Railway)
  Publicar só server/; front Vercel continua estático.
  Front ainda sem apontar para Railway (feature flag / env não setada).

Fase D — Cutover front
  Definir VITE_CEO_API_BASE em build Vercel → API Railway.
  Smoke em produção.

Fase E — Desligar plugins Vite (opcional)
  Remover ou no-op plugins; Vite só serve front em local.
  Documentar "API obrigatória em local via server/".
```

Durante A–D o Patrocinador continua a usar `npm run dev` como hoje. Nenhuma feature do MRE no browser é bloqueada.

---

## 9. Critérios de homologação

| ID | Critério | Como medir |
|----|----------|------------|
| H1 | Paridade de rotas | Checklist das 8 rotas (§4 do diagnóstico) 200/contratos OK no `server/` |
| H2 | LLM | `GET /api/ceo/llm-status` e `POST /api/ceo/deliberar` com chave de staging |
| H3 | Fila | Publicar → listar pending → PATCH running/completed; ficheiros coerentes |
| H4 | Onboarding | salvar/carregar perfil + transcrição |
| H5 | Health + PORT | Sobe com `PORT` arbitrário; `/health` ok |
| H6 | Front inalterado em paths | Conversa/Centro/Fila funcionam com proxy ou `VITE_CEO_API_BASE` |
| H7 | Segredos | Nenhuma chave LLM no bundle `app/dist` |
| H8 | Dev não quebrado | `npm run dev` em `app/` continua a servir SPA + API (plugins ou proxy) |
| H9 | CORS produção | Front Vercel consegue chamar API Railway |
| H10 | Documentação | README do `server/` + env listados |

**Homologação BP-001 (API):** H1–H5, H7, H10.  
**Homologação cutover front:** + H6, H8, H9.

---

## 10. Plano de implementação (pequenas etapas)

| Etapa | Nome | Entrega | Depende |
|-------|------|---------|---------|
| **E1** | Arquitetura (este doc) | Proposta aprovada | — |
| **E2** | Scaffold `server/` | `package.json`, entrypoint, `/health`, README | E1 OK |
| **E3** | Extrair LLM | Rotas llm-status + deliberar | E2 |
| **E4** | Extrair fila | Rotas queue + reuso `executionQueue` | E2 |
| **E5** | Extrair onboarding | Rotas carregar/salvar | E2 |
| **E6** | Config paths + CORS + env | `CEO_DATA_ROOT`, origins, `PORT` | E3–E5 |
| **E7** | Smoke tests / script de paridade | Checklist H1–H5 automatizável | E6 |
| **E8** | Proxy Vite opcional | Dev dual-mode documentado | E7 |
| **E9** | Deploy Railway (API) | URL pública API | E7 autorizado |
| **E10** | `VITE_CEO_API_BASE` + rebuild Vercel | Cutover front | E9 |
| **E11** | Desligar plugins Vite (opcional) | Limpeza | E10 estável |

**Persistência em Railway (decisão a fechar em E6/E9):**

| Opção | Prós | Contras |
|-------|------|---------|
| Volume persistente | Menos mudança de código fs | Ops Railway; backup |
| Migrar fila/onboarding para DB/KV | Cloud-native | Escopo maior — **fora do MVP BP-001** se volume bastar |

**Recomendação MVP:** Volume montado em `/data` + `CEO_DATA_ROOT=/data` apontando `executive/` espelhado; evoluir a DB só se o volume for insuficiente.

---

## Riscos residuais (herdados do diagnóstico)

1. Filesystem efémero sem volume → perda de fila/onboarding.  
2. Consumo da fila continua humano/Cursor (não muda nesta BP).  
3. Ligação GitHub↔Vercel para deploys automáticos do front é independente desta BP.  
4. Sem Gate REQ/ARQ formal, este doc é **proposta operacional BP-001**; o CTO pode exigir REQ dedicado antes de E9.

---

## Pedido de autorização

Autorizar **BP-001 E2** (scaffold `server/` + `/health`) com:

- Framework: **Hono** (ou Express, se o CTO mandar),  
- Pasta: **`server/` na raiz**,  
- Sem remover plugins Vite nesta etapa.

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (proposta); Patrocinador (autorização pendente) |
| Quando | 31/07/2026 |
| Por quê | Iniciar Backend de Produção após diagnóstico E1 e front Vercel estático |
| Baseado em quê | Diagnóstico backend 31/07; estado Vite plugins; deploy Vercel SPA |
| Resultado | Documento BP-001 E1; **aguarda Gate para E2** |

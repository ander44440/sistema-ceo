# CEO Server — Backend de Produção (BP-001)

Servidor HTTP Node (Hono) para as APIs `/api/ceo/*` em produção (alvo Railway).

## Estado atual (E5)

- Entrypoint: `npm start` → `src/index.js`
- Porta: `process.env.PORT` ou **8787**
- Rotas:
  - `GET /health`
  - `GET /api/ceo/llm-status` · `POST /api/ceo/deliberar`
  - `GET /api/ceo/queue/pending` · `GET|POST /api/ceo/queue/jobs` · `PATCH /api/ceo/queue/jobs/:id`
  - `GET /api/ceo/onboarding/carregar` · `POST /api/ceo/onboarding/salvar`
- Plugins Vite em `app/` permanecem ativos (convivência temporária)

## Local

```bash
cd server
npm install
npm start
```

Carrega automaticamente `server/.env` e `app/.env` (sem sobrescrever variáveis já definidas no shell).

## Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não (default 8787) | Porta HTTP (Railway) |
| `CEO_DATA_ROOT` | Não | Raiz com `executive/` (default: pai de `server/`) |
| `CEO_LLM_API_KEY` | Sim (ou `OPENAI_API_KEY` / `CEO_OPENAI_API_KEY`) | Chave do provedor |
| `CEO_LLM_BASE_URL` | Não | Default `https://api.openai.com/v1` |
| `CEO_LLM_MODEL` | Não | Default `gpt-4o-mini` |
| `CEO_LLM_TLS_INSECURE` | Não | `1` desativa verificação TLS (só local) |

## Relação com o frontend

O SPA em `app/` não foi alterado. Em desenvolvimento, `npm run dev` em `app/` continua a servir a API via plugins Vite (convivência temporária com este servidor).

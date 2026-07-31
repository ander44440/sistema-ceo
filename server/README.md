# CEO Server — Backend de Produção (BP-001)

Servidor HTTP Node (Hono) para as APIs `/api/ceo/*` em produção (alvo Railway).

## Estado atual (E2)

- Entrypoint: `npm start` → `src/index.js`
- Porta: `process.env.PORT` ou **8787**
- Rota: `GET /health` → `{ ok: true, service: "ceo-api" }`
- Rotas `/api/ceo/*` **ainda não migradas** — continuam nos plugins Vite em `app/`

## Local

```bash
cd server
npm install
npm start
# GET http://localhost:8787/health
```

## Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não (default 8787) | Porta HTTP (Railway define automaticamente) |

## Relação com o frontend

O SPA em `app/` não foi alterado. Em desenvolvimento, `npm run dev` em `app/` continua a servir a API via plugins Vite.

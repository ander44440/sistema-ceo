# Operação — Fila Oficial do MVP (ARQ-021 / REQ-060)

> Referência mínima pós IMP-060. Não substitui ARQ-021 nem REQ-060.

## Invariante

```text
CEO / Motor → executive/queue/ (PC) → Dispatcher local → Agent Cursor
```

Railway (BP-001) = LLM, health, CTO, heartbeat de sinal — **não** fila de Jobs.

## Onde está a fila

`{CEO_REPO_ROOT}/executive/queue/JOB-*.json`

## Como publicar (dev)

Vite local (`npm run dev` em `app/`) — plugin escreve no disco.  
Companion opcional: `VITE_CEO_QUEUE_API_BASE=http://localhost:5173`.

## Como consumir

```powershell
cd executive/dispatcher
# .env: CURSOR_API_KEY + CEO_API_BASE (heartbeat Painel)
npm start
```

## Normas

ARQ-021 · REQ-060 · REQ-045 · REQ-053 · BP-001 (fronteira) · IMP-060

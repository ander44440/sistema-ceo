# Operação — Fila Oficial do MVP (ARQ-021 / REQ-060)

> Referência mínima pós IMP-060. Não substitui ARQ-021 nem REQ-060.

## Invariante

```text
CEO / Motor → executive/queue/ (PC) → Dispatcher local → Agent Cursor
```

Railway (BP-001) = LLM, health, CTO, heartbeat de sinal — **não** fila de Jobs.

## Painel em produção (Vercel)

SPA sem companion: o Painel tenta a API local; se falhar, usa **fallback híbrido** —
CEO / CTO / Backend / Speaker via Railway; Agent / Dispatcher ficam *Aguardando*
(fila oficial só no PC). Uso diário completo = Vite local ou `VITE_CEO_QUEUE_API_BASE`.

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

---
name: consumir-fila-execucao
description: >-
  Consome Jobs pending da Fila de Execução do CEO (REQ-045) em executive/queue/.
  Use when the user says consuma a fila, execute o próximo job, despacho do CEO,
  JOB- pending, or PROXIMO.md da fila; also when starting technical work that
  may have been dispatched by the CEO.
---

# Consumir Fila de Execução (REQ-045)

## Objetivo

Executar o próximo Job `pending` publicado pelo CEO, **sem** o utilizador colar o texto do Job.

## Onde está a fila

- Pasta: `executive/queue/` (raiz do repo CEO)
- Índice: `executive/queue/PROXIMO.md`
- Ficheiros: `JOB-NNNNNN.json`

Se o workspace atual for outro (ex.: MG2), use o caminho absoluto do repo CEO:
`E:/anderson/CEO/executive/queue/` (ajustar se o clone estiver noutro sítio).

## Ciclo de vida (P0-2)

`pending → dispatched → running → result → verificação → completed|needs_correction|failed`

Handoff ≠ conclusão. O Agent regista `result` (ou `failed`); o CEO verifica antes de `completed`.

## Protocolo obrigatório

1. Ler `PROXIMO.md` e/ou listar `JOB-*.json` com `"estado": "pending"` (mais antigo primeiro).
2. Se não houver pending: informar e parar.
3. Antes de executar: atualizar o JSON do Job para `"estado": "running"` e `iniciadoEm` (ISO) (se ainda `pending`/`dispatched`, pode marcar `dispatched` primeiro).
4. Executar **apenas** o que `titulo` + `descricao` pedem; não expandir escopo.
5. Ao terminar: `"estado": "result"` com `resultado` (evidência). **Não** marcar `completed` — a verificação é do CEO. Em erro de execução: `"failed"` com motivo.
6. Após gravar `result`, a verificação formal (`verificarResultadoJob`) é disparada pelo Dispatcher (reconciliação pós-Agent / pass de Jobs em `result`) ou pela API da fila (`registarResultado` / PATCH `result`). O Agent **não** completa o Job.
7. Não inventar Jobs; não marcar `completed` directamente.

## Atualizar estado (PowerShell exemplo)

```powershell
$p = "E:\anderson\CEO\executive\queue\JOB-000001.json"
$j = Get-Content $p -Raw | ConvertFrom-Json
$j.estado = "running"
$j.iniciadoEm = (Get-Date).ToUniversalTime().ToString("o")
($j | ConvertTo-Json -Depth 6) | Set-Content $p -Encoding utf8
```

(Repetir no fim com `result` + `resultado`, ou `failed` + motivo — **não** `completed` directo.)

## Dispatcher V2 (REQ-053)

Um watcher em `executive/dispatcher/` pode acordar este Agent quando há `pending`. Nesse caso: executar o protocolo acima de imediato — o utilizador **não** precisa de repetir «consuma a fila».

## Princípios

- O CEO governa; você executa.
- A Queue transporta; você não decide prioridade estratégica.
- Zero serviços pagos de mensageria: só ficheiros locais (+ Cursor SDK no PC do patrocinador para V2).

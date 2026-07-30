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

## Protocolo obrigatório

1. Ler `PROXIMO.md` e/ou listar `JOB-*.json` com `"estado": "pending"` (mais antigo primeiro).
2. Se não houver pending: informar e parar.
3. Antes de executar: atualizar o JSON do Job para `"estado": "running"` e `iniciadoEm` (ISO).
4. Executar **apenas** o que `titulo` + `descricao` pedem; não expandir escopo.
5. Ao terminar: `"estado": "completed"` ou `"failed"`, preencher `concluidoEm` e `resultado` (resumo curto).
6. Não inventar Jobs; não chamar o CEO de volta automaticamente nesta V1.

## Atualizar estado (PowerShell exemplo)

```powershell
$p = "E:\anderson\CEO\executive\queue\JOB-000001.json"
$j = Get-Content $p -Raw | ConvertFrom-Json
$j.estado = "running"
$j.iniciadoEm = (Get-Date).ToUniversalTime().ToString("o")
($j | ConvertTo-Json -Depth 6) | Set-Content $p -Encoding utf8
```

(Repetir no fim com `completed`/`failed` + `resultado` + `concluidoEm`.)

## Princípios

- O CEO governa; você executa.
- A Queue transporta; você não decide prioridade estratégica.
- Zero serviços pagos: só ficheiros locais.

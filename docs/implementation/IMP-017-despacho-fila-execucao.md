# IMP-017 — Despacho à Fila de Execução (F7)

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 3 — v0.2 (30/07/2026).**  
> Norma: REQ-045; REQ-048 V3; REQ-049; IMP-010 F7.

## Objetivo

Quando `acao.tipo = despachar` e `acao.job` presente num parecer **válido**, publicar Job na Fila (REQ-045), rastreável a `parecerId`. Speaker não executa jobs.

## Critérios

* Só despacha com parecer válido + V3 coerente.
* Idempotente por `parecerId`.
* Não redesenha a fila.

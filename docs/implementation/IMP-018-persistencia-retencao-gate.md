# IMP-018 — Persistência de retenção e Gate de princípios (F8)

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 3 — v0.2 (30/07/2026).**  
> Norma: REQ-051 H1–H4; REQ-048 V4; IMP-010 F8.

## Objetivo

Executar o Plano de Retenção: memória, precedente e proposta de princípio `pendente_gate`. Nunca aplicar princípios automaticamente.

## Critérios

* Efeitos idempotentes por `parecerId`.
* `estadoHomologacaoPrincipio` inicial = `pendente_gate` apenas.
* H1 verificável (API de aplicar princípios continua proibida).

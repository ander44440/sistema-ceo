# IMP-014 — Integração Núcleo Executivo → MRE

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 2 — v0.2 (30/07/2026).**  
> Norma: ADR-019; ARQ-013; REQ-049; IMP-010 F4. Depende do Bloco 1.

## Objetivo

Roteamento: intenções **deliberativas** invocam o MRE; fluxos **determinísticos** permanecem sem MRE.

## Escopo

* Matriz deliberativo vs não deliberativo.
* Fachada Núcleo → `executarDeliberacaoMre`.
* Adapter LLM injetável / CEO.
* Sem redesenhar capacidades determinísticas (memória, projetos, fila, …).

## Fora de escopo

Speaker (IMP-015); canais (IMP-016); Fila a partir de job (F7); persistência F8.

## Critérios de conclusão

* `abrir_dia` / data / saudação / memória **sem** MRE.
* `deliberar` / `deliberar_objetivo` / `pergunta_aberta` **com** parecer válido ou falha controlada.
* Feature flag para desligar rota MRE (rollback IMP-010).

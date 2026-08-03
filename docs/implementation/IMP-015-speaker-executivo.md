# IMP-015 — Speaker Executivo

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 2 — v0.2 (30/07/2026).**  
> Norma: REQ-050; ADR-019; ARQ-013; IMP-010 F5.

## Objetivo

Transformar `ParecerExecutivo` válido em `ComunicadoExecutivo` fiel (G1–G7), sem deliberar nem alterar o parecer.

## Escopo

* Entrada: parecer validado + canal.
* Saída: texto, perguntas, destaques, guiãoVoz, referenciaDecisao.
* Template DET + redação opcional LLM.
* Recusa se parecer inválido.

## Fora de escopo

Integração UI completa (IMP-016); Fila; memória.

## Critérios de conclusão

* `referenciaDecisao` = estado do parecer.
* `solicitar_dados` ⇒ perguntas ≠ ∅.
* Sem campos de nova decisão.

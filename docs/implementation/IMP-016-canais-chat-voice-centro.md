# IMP-016 — Ligação aos canais (Chat / Voice / Centro)

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 2 — v0.2 (30/07/2026).**  
> Norma: REQ-050; REQ-047; IMP-010 F6.

## Objetivo

Canais consomem `ComunicadoExecutivo`; não chamam o MRE diretamente. Mesma decisão, formas distintas.

## Escopo

* Chat (Conversa): usa `texto`.
* Voice: usa `guiãoVoz` ou `texto`.
* Centro de situação: usa `destaques[]`.
* Equivalência semântica entre canais (mesma `referenciaDecisao`).

## Fora de escopo

Fila (F7); redesenho do Voice Engine; Bloco 3.

## Critérios de conclusão

* Conversa deliberativa mostra comunicado do Speaker.
* Voz fala guião derivado do parecer.
* Helper de destaques para centro de situação.

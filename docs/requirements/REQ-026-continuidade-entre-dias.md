# REQ-026 — Continuidade entre dias

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá **preservar entre dias e sessões** o estado do contexto MG2 necessário ao Painel do Dia — no mínimo foco vigente, onde parou, próximo passo confirmado, atenções ainda pertinentes e registros de decisão/conhecimento do fluxo diário — de modo que o patrocinador não precise reconstruir de memória o foco e o próximo passo.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3; §7 item 4 (critério decisivo de sucesso). Sem continuidade, o MVP falha objetivamente.

## Critérios de aceitação

* Após fechar o dia e reabrir em dia seguinte (ou nova sessão), o Painel do Dia reapresenta o estado preservado sem exigir reentrada do foco e do próximo passo já confirmados.
* Decisões e conhecimentos registrados permanecem recuperáveis (REQ-022; REQ-023; REQ-024).
* A continuidade refere-se ao contexto MG2 do MVP (REQ-017).

## Fora do escopo

* Backup técnico, replicação, escolha de mídia (arquitetura).
* Continuidade multi-projeto.

## Dependências

REQ-017; REQ-018; REQ-019; REQ-020; REQ-025.

## Riscos e incertezas

* Estado parcial após falha de sessão — transparência exigida (CON-001 Art. 9º princípio 8).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-003 §3, §7; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 §7 continuidade | Em análise |

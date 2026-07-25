# REQ-027 — Confirmação do patrocinador

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá **sugerir sem impor**: mudanças de foco do dia, próximo passo vigente e consolidação do fechamento do dia só produzem efeito no estado do MVP após **confirmação explícita** do patrocinador.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §2 (autoridade final); §3 passos 3 e 10; CON-001 Art. 6º e Art. 9º princípio 9.

## Critérios de aceitação

* Propostas de foco e de próximo passo não alteram o estado vigente sem confirmação do patrocinador.
* O fechamento do dia não se consolida sem confirmação do patrocinador.
* O patrocinador pode rejeitar ou ajustar a sugestão antes de confirmar.

## Fora do escopo

* Fluxos de aprovação multi-usuário.
* Autonomia de agentes para decidir no lugar do patrocinador.

## Dependências

REQ-019; REQ-020; REQ-025.

## Riscos e incertezas

* Excesso de confirmações — equilibrar com REQ-028 (apenas nos pontos de autoridade do VIS-003).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001 Art. 6º, 9º princípio 9; VIS-003 §2, §3; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 autoridade | Em análise |

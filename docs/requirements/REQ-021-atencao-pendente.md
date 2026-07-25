# REQ-021 — Atenção pendente

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá exibir no Painel do Dia a **atenção** exigida do patrocinador: no máximo três itens que pedem decisão dele, ou a indicação explícita de que não há pendência.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §4; M6. Entregar só o mínimo que exige a autoridade do patrocinador (CON-001 Art. 9º princípio 1).

## Critérios de aceitação

* A área de atenção apresenta 0, 1, 2 ou 3 itens — nunca mais de três no MVP.
* Quando não houver pendência, a indicação “nada pendente” (ou equivalente inequívoco) é exibida.
* Itens de atenção são compreensíveis sem abrir um dashboard.

## Fora do escopo

* Filas longas, notificações de sistemas externos, métricas.

## Dependências

REQ-016.

## Riscos e incertezas

* Inflação de “atenções” — limite rígido de três.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §4, M6; CON-001 Art. 9º princípio 1; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 atenção | Em análise |

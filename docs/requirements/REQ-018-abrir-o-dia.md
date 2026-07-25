# REQ-018 — Abrir o dia

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá permitir ao patrocinador **abrir o dia** no contexto MG2, reapresentando o estado preservado (foco, onde parou, conhecimento útil à mão quando houver, próximo passo sugerido e atenção), de modo que o trabalho no MG2 possa retomar sem reconstruir o contexto do zero.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3 (Manhã) e §7 item 1. Sem abrir o dia, o MVP não cumpre o posto de comando matinal.

## Critérios de aceitação

* Existe um ato explícito ou implícito de “abrir o dia” que leva ao Painel do Dia com estado do contexto MG2.
* O estado reapresentado inclui, no mínimo: foco atual (se houver), onde parou (se houver), próximo passo sugerido (se houver) e atenção (ou “nada pendente”).
* Após abrir o dia, o patrocinador pode partir para as ferramentas de execução do MG2 sem necessidade de reexplicar o contexto ao CEO naquele instante.

## Fora do escopo

* Execução do trabalho no MG2 fora do CEO (REQ-030).
* Detalhe de edição do foco (REQ-019).

## Dependências

REQ-016; REQ-017; REQ-026.

## Riscos e incertezas

* Abrir o dia virar checklist burocrático — mitiga-se por REQ-028 e REQ-032.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §3 Manhã, M1, §7; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 fluxo manhã | Em análise |

# REQ-020 — Próximo passo

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá exibir no Painel do Dia **um** próximo passo sugerido para o contexto MG2 — uma ação clara para agora — e atualizá-lo quando o patrocinador confirmar uma nova proposta (inclusive ao fechar o dia).

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3, §4, M1, §7 item 4. Sem próximo passo, o patrocinador volta a improvisar de memória.

## Critérios de aceitação

* O Painel do Dia exibe no máximo um próximo passo vigente por vez.
* O próximo passo é uma ação compreensível sem consulta a listas auxiliares.
* Ao fechar o dia, o CEO pode propor o próximo passo de amanhã; ele só vigora após confirmação do patrocinador (REQ-025; REQ-027).
* Sugestão não substitui a autoridade do patrocinador.

## Fora do escopo

* Filas de tarefas, burndown, orquestração de agentes.

## Dependências

REQ-016; REQ-025; REQ-027.

## Riscos e incertezas

* Múltiplos “próximos passos” competindo — mitiga-se pelo limite de um.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §3, §4, §7; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 próximo passo | Em análise |

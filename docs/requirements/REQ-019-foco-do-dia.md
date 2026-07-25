# REQ-019 — Foco do dia

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá permitir ao patrocinador definir e ajustar o **foco do dia** do contexto MG2 em **uma única frase**, e exibir esse foco no Painel do Dia após confirmação do patrocinador.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3 passo 3; M2; §4. Sem foco de uma frase, o painel não ancora “o que importa agora”.

## Critérios de aceitação

* O patrocinador pode informar ou alterar o foco do dia como uma frase.
* O foco só passa a vigorar no Painel do Dia após confirmação do patrocinador (REQ-027).
* O Painel do Dia exibe o foco vigente de forma imediata e legível.
* Não é exigido plano detalhado, lista de tarefas ou decomposição para cumprir este requisito.

## Fora do escopo

* Planejamento multi-etapa (CAP-08 ampla).
* Múltiplos focos simultâneos.

## Dependências

REQ-016; REQ-027.

## Riscos e incertezas

* Foco virar mini-backlog — rejeitado pelos critérios (uma frase).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §3, §4, M2; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 M2 | Em análise |

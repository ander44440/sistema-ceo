# REQ-025 — Fechar o dia

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá permitir ao patrocinador **fechar o dia** no contexto MG2: indicar o que avançou e o que ficou pendente; receber uma proposta de próximo passo para amanhã e do estado a preservar; e, após confirmação, encerrar deixando o estado pronto para a próxima abertura do dia.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3 Fim do dia; M7; §7 item 3. Sem fechar o dia, a continuidade matinal falha.

## Critérios de aceitação

* Existe ato de “fechar o dia” acionável a partir do Painel do Dia.
* O patrocinador pode indicar avanços e pendências.
* O CEO propõe próximo passo de amanhã e o estado a preservar.
* Somente após confirmação do patrocinador (REQ-027) o fechamento consolida o estado para o próximo abrir o dia (REQ-018; REQ-026).

## Fora do escopo

* Relatórios executivos, timesheets, métricas de produtividade.

## Dependências

REQ-016; REQ-020; REQ-026; REQ-027.

## Riscos e incertezas

* Fechamento longo demais — mitiga-se por REQ-028 e REQ-032.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §3 Fim, M7, §7; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 fechar o dia | Em análise |

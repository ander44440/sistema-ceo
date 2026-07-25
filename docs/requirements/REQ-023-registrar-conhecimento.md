# REQ-023 — Registrar conhecimento

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento

## Enunciado

O CEO deverá permitir ao patrocinador **registrar um conhecimento reutilizável** ligado ao MG2 — padrão, regra do jogo ou lição que independe de uma decisão específica — a partir do Painel do Dia, distinguindo-o de conversa efêmera.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3 passo 6; M4; §7 item 2. Complementa REQ-004 (estrutura do acervo) com o **ato diário** indispensável ao MVP.

## Critérios de aceitação

* A partir do Painel do Dia, o patrocinador inicia o registro de um conhecimento reutilizável do MG2.
* O conteúdo registrado é tratável como item de conhecimento (CNC-002), não como registro histórico de decisão (CAP-05).
* O registro permanece disponível para consulta posterior (REQ-024).
* Não se exige população massiva do acervo — apenas o que o dia gerar (VIS-003 §6).

## Fora do escopo

* Curadoria avançada, deduplicação automática, taxonomia além do necessário ao registro diário.
* Estrutura canônica completa do acervo (já coberta em REQ-004/014/015 no plano documental).

## Dependências

REQ-016; REQ-017; REQ-004 (estrutura — referência); CNC-002.

## Riscos e incertezas

* Confusão decisão × conhecimento — mitiga-se pela definição CNC-002 e pela separação REQ-022/023.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 |
| Norma superior | VIS-003 §3, M4, §6, §7; CNC-002; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 M4 | Em análise |

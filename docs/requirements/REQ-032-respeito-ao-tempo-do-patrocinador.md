# REQ-032 — Respeito ao tempo do patrocinador

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá respeitar o tempo do patrocinador no MVP: comunicação e atos do fluxo diário limitam-se ao **mínimo necessário** para avançar com segurança no MG2, sem burocracia, repetição ou solicitações desnecessárias.

## Tipo

Não funcional; alto nível.

## Justificativa

VIS-003 §2 (tempo escasso); CON-001 Art. 9º princípio 1; missão do MVP.

## Critérios de aceitação

* O fluxo diário básico não exige repetir informações já confirmadas no estado vigente (alinha-se a REQ-029).
* O CEO não solicita dados ou passos não previstos no VIS-003 §§3–5 para concluir abrir/registrar/fechar o dia.
* Atenção limitada a no máximo três itens (REQ-021).

## Fora do escopo

* SLA técnico de latência (arquitetura).
* Otimizações de performance.

## Dependências

REQ-016; REQ-021; REQ-028; REQ-029.

## Riscos e incertezas

* “Completude documental” pressionar por campos extras — rejeitar salvo derivação explícita do VIS-003.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001 Art. 9º princípio 1; VIS-003 §2, missão; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 tempo do patrocinador | Em análise |

# REQ-030 — Não substituir ferramentas de execução

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-02 — Gestão de Agentes

## Enunciado

O CEO MVP v0.1 **não deverá** substituir as ferramentas de execução do MG2 (por exemplo, ambientes de implementação ou outras IAs usadas na oficina do jogo): o CEO orquestra o dia e guarda o que não pode se perder; a execução permanece fora do posto de comando diário.

## Tipo

Não funcional; alto nível (restritivo).

## Justificativa

VIS-003 §2; §6 (automação do pipeline / oficina). Evita escopo que atrasa o MVP sem aproximar o uso diário do posto de comando.

## Critérios de aceitação

* O fluxo diário do MVP não exige que o patrocinador execute build, deploy ou implementação do MG2 dentro do CEO.
* O Painel do Dia não inclui escolha ou troca de IAs de execução pelo usuário.
* É válido e esperado que o patrocinador alterne: CEO (posto de comando) → ferramentas de execução → CEO (registro/fechamento).

## Fora do escopo

* Orquestração avançada multi-IA (VIS-003 §6).
* Integrações técnicas com IDEs.

## Dependências

REQ-016; REQ-017.

## Riscos e incertezas

* Pressão para “já automatizar o MG2 no CEO” — fora do MVP.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-02 |
| Norma superior | VIS-003 §2, §6; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 fronteira execução | Em análise |

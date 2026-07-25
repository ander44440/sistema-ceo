# REQ-017 — Contexto ativo exclusivo MG2

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá manter, no MVP v0.1, exatamente **um** contexto ativo de trabalho — o Motoboy Game 2 (MG2) — e exibi-lo como contexto do Painel do Dia, sem oferecer troca para outros projetos na experiência diária.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §2, §4 e §6 restringem o MVP ao MG2. Sem contexto único, a primeira tela e o fluxo diário diluem o foco. Teste dos cinco dias: sem MG2 como âncora, o patrocinador não opera o posto de comando previsto.

## Critérios de aceitação

* O contexto ativo exibido no Painel do Dia é MG2.
* A experiência diária do MVP **não** apresenta seleção ou troca entre múltiplos projetos.
* Todo foco, próximo passo, decisão e conhecimento do fluxo diário do MVP referem-se a esse contexto.

## Fora do escopo

* Gestão de portfólio multi-projeto (VIS-003 §6).
* Definição técnica de identificador de projeto.

## Dependências

Nenhuma.

## Riscos e incertezas

* Pressão para “já abrir outro projeto” — fora do MVP por VIS-003 §6.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-003 §2, §4, §6; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 contexto MG2 | Em análise |

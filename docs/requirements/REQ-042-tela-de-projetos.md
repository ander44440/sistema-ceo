# REQ-042 — Tela de Projetos (gestão da especialização Projeto do COA)

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá oferecer uma tela **Projetos** que liste **exclusivamente** os Contextos Operacionais (COAs) da especialização Projeto, permita **Novo Projeto** e **Abrir Projeto** (tornar COA ativo), exibindo para cada item nome, status e última atividade.

## Tipo

Funcional; detalhado.

## Justificativa

VIS-007 §3–§4; especificação do Patrocinador. Capacidade CAP-03 exige superfície de gerenciamento além do seletor rápido.

A Tela de Projetos constitui a **superfície administrativa** da especialização Projeto, enquanto a Home Executiva permanece como a **superfície operacional** do COA ativo.

## Critérios de aceitação

* A tela lista Sistema CEO, Motoboy Game 2, Última Milha e demais Projetos cadastrados.
* Existe botão **+ Novo Projeto** com campos mínimos: nome, objetivo principal, descrição opcional (REQ-036).
* Existe ação **Abrir Projeto** que executa REQ-038.
* Cada item mostra nome, status e última atividade.
* Após a criação de um novo Projeto (REQ-036), o novo COA deverá tornar-se imediatamente disponível na Tela de Projetos para abertura pelo usuário.

## Fora do escopo

* Portfólio analítico (Gantt, orçamento, equipe).
* Tipos de COA não-Projeto neste ciclo.

## Dependências

REQ-036; REQ-038; REQ-043.

## Riscos e incertezas

* Nomenclatura "Projetos" vs conceito COA — glossário na ARQ; UI pode manter "Projetos" como especialização inicial.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §3 |
| Origem | Especificação do Patrocinador; Deliberação CTO |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Tela Projetos | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: lista exclusiva da especialização Projeto; disponibilidade imediata pós-cadastro; superfície administrativa vs operacional | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-042 HOMOLOGADO | **Homologado** |

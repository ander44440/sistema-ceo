# REQ-043 — Navegação auxiliar da Home executiva

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá oferecer navegação auxiliar (menu inferior) com os destinos: **Painel** (Home), **Projetos**, **Conversas**, **Memória** e **Configurações**, preservando sempre o Contexto Operacional Ativo (COA), sem deslocar a conversa do papel de interface principal.

## Tipo

Funcional; detalhado.

## Justificativa

VIS-007 §4 (referência de UX). Destinos auxiliares apoiam contexto e decisão; não substituem a conversa (REQ-041).

A navegação auxiliar tem como finalidade facilitar o acesso às superfícies complementares do sistema, mantendo a Home Executiva e a conversa como **centro da experiência** do usuário.

## Critérios de aceitação

* Os cinco destinos são observáveis e alcançáveis.
* **Painel** retorna à Home executiva (REQ-040).
* **Projetos** abre REQ-042.
* **Conversas**, **Memória** e **Configurações** existem como destinos; conteúdo mínimo pode ser esqueleto nesta versão, desde que não quebrem o COA ativo (REQ-037/039).
* A navegação entre os destinos não poderá alterar o COA ativo nem provocar perda do contexto operacional corrente, exceto quando houver ação explícita de troca de COA prevista no REQ-038.
* A navegação não exige múltiplas telas para o ato conversacional básico na Home.

## Fora do escopo

* Especificação completa de Configurações avançadas.
* Multi-dispositivo / apps nativos.

## Dependências

REQ-040; REQ-041; REQ-042.

## Riscos e incertezas

* Inflar Conversas/Memória antes da ARQ — manter esqueleto até IMP deliberada.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §4; REQ-028 |
| Origem | Especificação UX do Patrocinador |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Menu inferior | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: navegação preserva COA; critério de não-alteração do COA; centro Home+conversa | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-043 HOMOLOGADO | **Homologado** |

# REQ-039 — Isolamento completo entre Contextos Operacionais

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá garantir que **nenhum** registro (decisão, conhecimento, foco, estado do dia, histórico, conversa) seja compartilhado ou misturado entre Contextos Operacionais distintos, tanto na persistência quanto na apresentação das informações ao usuário.

## Tipo

Funcional / integridade; detalhado. **Não negociável** neste ciclo.

## Justificativa

VIS-007 §1: projetos/domínios são completamente distintos (ex.: game ≠ app de entregas). Mistura de contexto é falha grave de governança e de uso diário.

O isolamento entre COAs constitui um requisito de **integridade da informação** e de **governança do conhecimento** do CEO.

## Critérios de aceitação

* Consultas e listagens no COA A nunca retornam itens do COA B.
* Persistência de decisão/conhecimento grava vínculo explícito ao COA ativo.
* Trocar de COA não altera dados do COA deixado.
* Nenhuma funcionalidade disponível ao usuário poderá exibir informações de um COA diferente do COA ativo durante a operação normal do sistema.
* Teste de regressão: criar registros em A e B e verificar ausência cruzada.

## Fora do escopo

* Relatórios consolidados multi-COA (evolução futura, se deliberada).
* Cópia deliberada de um registro entre COAs (não prevista neste ciclo).

## Dependências

REQ-037; REQ-038.

## Riscos e incertezas

* Vazamento por busca global mal desenhada — proibir busca cross-COA na ARQ deste ciclo.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §1; CON-001 Art. 8º |
| Origem | Deliberação CTO 25/07/2026; especificação do Patrocinador item 5 |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Isolamento como requisito central | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: persistência + apresentação; critério UX; integridade/governança | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-039 HOMOLOGADO | **Homologado** |

# REQ-036 — Cadastro de Contextos Operacionais (especialização Projeto)

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos  
> Norma: VIS-007 v0.2 Aprovada para prosseguimento; CON-001; ADR-006.

## Enunciado

O CEO deverá permitir cadastrar e manter **Contextos Operacionais** na especialização inicial **Projeto**, cada um com nome, status de ciclo de vida do Projeto (Ativo / Pausado / Concluído), objetivo principal, descrição opcional e última atividade.

O status (Ativo / Pausado / Concluído) representa **exclusivamente** o ciclo de vida do Projeto e **não** o Contexto Operacional Ativo (COA) da sessão.

A especialização **Projeto** é a primeira especialização do COA neste ciclo; o enunciado **não** implica suporte operacional a outros tipos de COA — apenas que a arquitetura foi preparada para essa evolução futura.

## Tipo

Funcional; detalhado.

## Justificativa

VIS-007 §1–§3: o Patrocinador conduz múltiplos domínios reais; o cadastro é pré-condição do COA e da troca de contexto. Necessidade descoberta em operação (Deliberação CTO, 25/07/2026).

O cadastro estabelece a **identidade persistente** dos Contextos Operacionais (especialização Projeto), servindo como base para a seleção do COA.

## Critérios de aceitação

* É possível criar um novo Projeto com nome e objetivo principal obrigatórios; descrição opcional.
* Cada Projeto exibe status de ciclo de vida entre Ativo, Pausado e Concluído — distinto do COA ativo da sessão (REQ-037).
* A lista de Projetos mostra nome, status de ciclo de vida e última atividade.
* Existe e é mantida a informação de **última atividade** para cada Projeto; a forma de atualização é definida pela arquitetura (ARQ-012), não por este requisito.
* Os três Projetos iniciais (Sistema CEO, Motoboy Game 2, Última Milha) são representáveis.

## Fora do escopo

* Suporte operacional a tipos de COA além de Projeto (iniciativa, programa, operação) neste ciclo — a arquitetura apenas se prepara para essa evolução futura.
* Multi-usuário / permissões por projeto.
* Definição do mecanismo de atualização de “última atividade” (ARQ-012).
* Implementação neste ato.

## Dependências

VIS-007; REQ-037 (COA único) — o REQ-037 utilizará os Projetos cadastrados neste requisito para definir o COA ativo.

## Riscos e incertezas

* Confusão entre "status Ativo do ciclo de vida do Projeto" e "COA ativo da sessão" — mitigar na UX e no glossário da ARQ.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §1–§3; CON-001 Art. 9º princípios 1–3 |
| Origem | Deliberação CTO 25/07/2026; pacote MVP 2.0 / COA |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação com COA/Projeto | Deliberação CTO — detalhamento autorizado | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: ciclo de vida ≠ COA; última atividade sem mecanismo; identidade persistente; dependência REQ-037 explícita; ARQ-012 na rastreabilidade | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência dos ajustes | Deliberação CTO — Roadmap Executivo CAP-03 (REQ-036 ✅) | **Homologado** |

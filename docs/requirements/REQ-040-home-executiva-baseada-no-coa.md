# REQ-040 — Home executiva baseada no COA ativo

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos  
> **Sucedâneo previsto de:** REQ-016 (Painel do Dia) — após homologação/IMP; MVP v0.1 permanece sob REQ-016 até lá.

## Enunciado

O CEO deverá apresentar, como primeira superfície desta capacidade, uma **Home executiva** baseada **exclusivamente** no Contexto Operacional Ativo (COA), contendo: marca/saudação, seletor do COA, card conversacional central, Resumo Executivo (objetivo, situação atual, próximo passo recomendado, risco, pendências) e blocos de decisões/conhecimentos/atividades recentes.

## Tipo

Funcional; detalhado.

## Justificativa

VIS-007 §2–§4: transformar a tela inicial de painel de registros em ambiente de trabalho executivo. Referência de UX = especificação do Patrocinador.

A Home Executiva constitui a **principal superfície operacional do CEO**, substituindo o conceito anterior de painel estático por um ambiente de trabalho orientado ao contexto.

## Critérios de aceitação

* A Home exibe o COA ativo de forma inequívoca.
* Existe um único cartão de Resumo Executivo com os campos: projeto/COA, objetivo, situação atual, próximo passo recomendado, risco, pendências (ou declaração explícita de ausência por campo).
* Existem seções observáveis para decisões pendentes, conhecimentos recentes e atividades recentes — sempre filtradas pelo COA (REQ-039).
* Após qualquer troca de COA (REQ-038), toda a Home deverá ser atualizada para refletir exclusivamente as informações do novo COA ativo, sem necessidade de intervenção manual do usuário.
* A composição transmite posto de comando, não dashboard de métricas.

## Fora do escopo

* Gráficos, KPIs densos, filas genéricas multi-COA.
* Redesenho do MVP v0.1 congelado neste ato.

## Dependências

REQ-037; REQ-041; REQ-043.

## Riscos e incertezas

* Excesso de informação no Resumo — aplicar REQ-028 (mínimo necessário).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §2–§4; REQ-028; REQ-032 |
| Origem | Especificação UX do Patrocinador; Deliberação CTO |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Home executiva | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: exclusividade do COA; atualização automática pós-troca; principal superfície operacional | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-040 HOMOLOGADO | **Homologado** |

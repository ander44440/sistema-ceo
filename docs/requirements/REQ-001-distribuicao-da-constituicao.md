# REQ-001 — Distribuição e manutenção da Constituição para agentes conectados

## Enunciado

O CEO deverá possuir um mecanismo próprio para distribuir e manter sua Constituição e suas regras de governança para qualquer agente conectado ao sistema.

## Tipo

Requisito funcional de alto nível.

## Status

Aprovado (definido pelo CTO, Decisão 4 da ADR-001).

## Justificativa

As regras de governança do CEO não podem depender de nenhuma ferramenta específica (ex.: Cursor). O CEO governa agentes heterogêneos; portanto, a Constituição precisa chegar a qualquer agente por um mecanismo do próprio sistema, de forma consistente e atualizada (Decisão 3 da ADR-001).

## Critérios de alto nível

* Qualquer agente conectado ao sistema recebe a Constituição e as regras de governança vigentes.
* O mecanismo é independente da ferramenta usada pelo agente.
* Atualizações nas regras são propagadas de forma consistente a todos os agentes.
* A versão vigente das regras é rastreável (qual versão, desde quando, aprovada por quem).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Origem | ADR-001, Decisões 3 e 4 |
| Norma superior | CON-001 — Constituição do CEO |
| Arquitetura | A definir (após Fase 0) |
| Implementação | Não iniciada (Fase 0) |

## Observação de governança

O arquivo `.cursor/rules/projeto-ceo.mdc` é apenas um espelho operacional temporário para o agente Cursor durante o desenvolvimento. A fonte canônica das regras é a documentação em `/docs`, e o mecanismo definitivo de distribuição será definido em arquitetura própria que satisfaça este requisito.

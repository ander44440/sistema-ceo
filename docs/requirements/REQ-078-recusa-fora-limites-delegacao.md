# REQ-078 — Recusa de fecho fora dos limites da Autoridade Delegada

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R4** — Recusar fora dos limites

## Enunciado

O CEO deverá recusar ou devolver ao Usuário qualquer fecho que viole os limites objectivos da Autoridade Delegada — incluindo perímetro, soberania, reservas constitucionais, não redelegação e distinção face a execução técnica e autorização pontual — sem alargar o perímetro por iniciativa própria.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A6 e CAP-01 R4: limites objectivos não são discricionários. Decompõe exclusivamente R4.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-078-1** | Tentativa de fecho **fora do perímetro** ⇒ recusa ou devolução ao Usuário. | Caso negativo fora do perímetro: sem fecho autónomo = pass. |
| **CA-078-2** | Tentativa de acto sob reservas constitucionais (alterar CON-001, abrir CAP, emendar ROADMAP, aval directo reservado) ⇒ recusa. | Matriz de reservas: recusadas = pass. |
| **CA-078-3** | Tentativa de redelegar a competência a terceiro ⇒ recusa. | Redelegação impossível = pass. |
| **CA-078-4** | O CEO **não** amplia o perímetro por iniciativa própria. | Inspecção: perímetro só pelo acto do Usuário / omissão ARQ = pass. |

## Fora do escopo

* Exercício no perímetro — **REQ-077** (R3).  
* Encerramento — **REQ-079** (R5).  
* Tecnologia / IMP.

## Dependências

* **REQ-076**; ARQ-032 A6; CAP-01 R4; CON-001.

## Riscos e incertezas

* Pressão operacional para «decidir tudo» — mitigação: CA-078-1…4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R4** |
| ARQ-032 | A6 |
| Norma superior | CON-001 Art. 5º, 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B2`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B2`](../validation/VAL-IMP-071-B2.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R4 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

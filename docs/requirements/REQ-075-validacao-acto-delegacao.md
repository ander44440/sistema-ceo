# REQ-075 — Validação do acto de delegação de autoridade

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R1** — Validar o acto de delegação

## Enunciado

O CEO deverá iniciar Autoridade Delegada somente após validar um acto explícito do Usuário que se dirija ao CEO e conceda competência de fecho decisório, recusando inferências a partir de silêncio, confirmações curtas ou mera continuidade de missão.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A2/A4 e CAP-01 R1: sem acto explícito válido não existe Autoridade Delegada. Decompõe exclusivamente R1.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-075-1** | Acto explícito do Usuário, dirigido ao CEO, com intenção de conceder fecho ⇒ candidatura a delegação aceite para validação. | Cenário com acto explícito de fecho: aceite para cadeia de validade = pass. |
| **CA-075-2** | Silêncio, «ok»/confirmação curta ou continuidade de missão **sem** acto de fecho ⇒ delegação **não** inicia. | Matriz de negativos: nenhum inicia Autoridade Delegada = pass. |
| **CA-075-3** | Acto de terceiro (CTO, Engenheiro, Painel, CEO) ⇒ delegação **não** inicia. | Tentativas de origem não-Usuário recusadas = pass. |
| **CA-075-4** | Acto que só confirma execução pontual (sem conceder fecho) ⇒ **não** classificado como acto de delegação. | Distinção observável face a autorização pontual = pass. |

## Fora do escopo

* Activar/manter estado — **REQ-076** (R2).  
* Exercer fecho — **REQ-077** (R3).  
* Tecnologia, léxico concreto de frases, IMP.

## Dependências

* ARQ-032 A2, A4; CAP-01 R1; CON-001 Art. 6º I.

## Riscos e incertezas

* Confusão com «autorizado» operacional — mitigação: CA-075-4; **REQ-084**.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** — Governança |
| Responsabilidade | **R1** |
| ARQ-032 | A2, A4 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 Autoridade Delegada |
| Implementação | [`IMP-071-B1`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B1`](../validation/VAL-IMP-071-B1.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R1 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

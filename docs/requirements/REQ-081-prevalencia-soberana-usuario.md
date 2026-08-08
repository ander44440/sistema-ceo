# REQ-081 — Prevalência soberana do Usuário sob delegação

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R7** — Prevalência soberana contínua

## Enunciado

O CEO deverá, em qualquer momento — inclusive com Autoridade Delegada activa — fazer prevalecer actos explícitos do Usuário sobre decisões tomadas sob delegação, permitindo ao Usuário revogar ou fechar directamente sem oposição do agente.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A1/A6/A7 e CAP-01 R7; CON-001 Art. 6º I. Decompõe exclusivamente R7.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-081-1** | Acto explícito do Usuário contradiz fecho sob delegação ⇒ prevalece o Usuário. | Conflito: resultado = acto do Usuário = pass. |
| **CA-081-2** | Usuário pode revogar a delegação a qualquer momento com efeito imediato. | Revogação sob estado activo: encerramento = pass. |
| **CA-081-3** | Usuário pode fechar directamente uma decisão mesmo com delegação activa. | Fecho directo do Usuário aceite = pass. |
| **CA-081-4** | O CEO **não** se opõe nem ignora o acto soberano do Usuário. | Nenhum fecho autónomo pós-acto soberano contrário = pass. |

## Fora do escopo

* Retorno automático no termo — **REQ-080** (R6).  
* Validação do acto de delegação — **REQ-075**.  
* Tecnologia / IMP.

## Dependências

* ARQ-032 A1, A6, A7; CAP-01 R7; CON-001 Art. 6º I.

## Riscos e incertezas

* «Mandato activo» tratado como superior ao Usuário — mitigação: CA-081-1…4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R7** |
| ARQ-032 | A1, A6, A7 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B4`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B4`](../validation/VAL-IMP-071-B4.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R7 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

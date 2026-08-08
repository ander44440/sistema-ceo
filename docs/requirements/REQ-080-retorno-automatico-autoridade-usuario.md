# REQ-080 — Retorno automático da competência de fecho ao Usuário

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R6** — Retorno automático ao Usuário

## Enunciado

O CEO deverá, no instante do encerramento da Autoridade Delegada, fazer regressar automaticamente a competência de fecho ao Usuário sem acto adicional de pedido de devolução e sem conservar competência residual sob o mandato findo.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A7 e CAP-01 R6: o termo **é** o retorno. Decompõe exclusivamente R6.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-080-1** | Ao encerrar (qualquer E1–E6), o estado `autoridade_delegada_activa` passa a inactivo **e** a competência de fecho deixa de ser do CEO — **sem** passo de «pedido de devolução». | Pós-termo: estado inactivo **e** ausência de passo de devolução = pass; estado ainda activo ou passo de devolução exigido = fail. |
| **CA-080-2** | Retorno é **integral** — zero alçada residual de fecho sob o mandato findo. | Tentativa de fecho autónomo pós-termo falha = pass. |
| **CA-080-3** | O retorno **não** exige confirmação do CEO. | Sem passo de confirmação do agente = pass. |
| **CA-080-4** | A soberania do Usuário permanece contínua antes, durante e após o retorno. | Titularidade da missão = Usuário em todos os momentos = pass. |

## Fora do escopo

* Critérios que disparam o termo — **REQ-079** (R5).  
* Prevalência durante mandato activo — **REQ-081** (R7).  
* Tecnologia / IMP.

## Dependências

* **REQ-079**; ARQ-032 A7; CAP-01 R6.

## Riscos e incertezas

* Confundir retorno com novo acto do Usuário — mitigação: CA-080-1, CA-080-3.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R6** |
| ARQ-032 | A7 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B3`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B3`](../validation/VAL-IMP-071-B3.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R6 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

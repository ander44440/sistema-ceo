# REQ-076 — Activação e manutenção do estado de Autoridade Delegada

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R2** — Activar e manter o estado activo

## Enunciado

O CEO deverá, quando a delegação for válida, operar sob o estado lógico `autoridade_delegada_activa` já definido na ARQ-032 — missão do Usuário inalterada e competência de fecho concedida ao CEO no perímetro — sem criar estados arquitecturais adicionais.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A3/A4 e CAP-01 R2: o estado activo é o único estado arquitectural de delegação. Decompõe exclusivamente R2.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-076-1** | Delegação válida ⇒ estado `autoridade_delegada_activa` observável enquanto vigente. | Após validação OK: estado activo = pass. |
| **CA-076-2** | Durante o estado activo, o titular da missão permanece o Usuário. | Inspecção: nenhum registo de mudança de dono da missão = pass. |
| **CA-076-3** | Nenhum estado arquitectural novo além de `autoridade_delegada_activa` é introduzido por este requisito. | Inspecção do modelo lógico / especificação: só o estado ARQ-032 = pass. |
| **CA-076-4** | Delegação inválida ou inexistente ⇒ estado activo **ausente**. | Sem acto válido: estado inactivo = pass. |

## Fora do escopo

* Validação do acto — **REQ-075** (R1).  
* Exercício do fecho — **REQ-077** (R3).  
* Encerramento — **REQ-079** (R5).  
* Tecnologia / IMP.

## Dependências

* **REQ-075**; ARQ-032 A3, A4; CAP-01 R2.

## Riscos e incertezas

* Tentação de criar «sub-estados» — mitigação: CA-076-3.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R2** |
| ARQ-032 | A3, A4 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B1`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B1`](../validation/VAL-IMP-071-B1.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R2 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

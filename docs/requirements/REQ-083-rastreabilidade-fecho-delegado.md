# REQ-083 — Rastreabilidade de fechos sob Autoridade Delegada

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R9** — Rastreabilidade do fecho sob delegação

## Enunciado

O CEO deverá registar toda decisão importante fechada sob Autoridade Delegada na Memória Organizacional, incluindo que o fecho ocorreu sob delegação, quem delegou, o perímetro aplicável e quando (início/termo quando pertinente), segundo CON-001 Art. 8º.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A3/A7 e CAP-01 R9; CON-001 Art. 8º. Decompõe exclusivamente R9. CAP-05 cobre o mecanismo geral de MO; este REQ exige os campos específicos do fecho sob delegação.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-083-1** | Fecho importante sob delegação ⇒ registo MO com: quem; quando; o quê; porquê; baseado em quê; resultado (CON-001 Art. 8º). | Os seis elementos presentes = pass; falta qualquer um = fail. |
| **CA-083-2** | O registo indica explicitamente que o fecho ocorreu **sob Autoridade Delegada**. | Campo/marcação de mandato presente = pass. |
| **CA-083-3** | O registo referencia quem delegou e o perímetro aplicável. | Quem + perímetro presentes = pass. |
| **CA-083-4** | Fecho importante sob delegação **sem** MO ⇒ não conforme. | Ausência de MO = fail. |

## Fora do escopo

* Redesign da CAP-05 / armazenamento — fora.  
* Exercício do fecho — **REQ-077**.  
* Tecnologia / IMP.

## Dependências

* **REQ-077** (gera o fecho a registar); ARQ-032 A3, A7; CAP-01 R9; CON-001 Art. 8º; CAP-05 (contexto).

## Riscos e incertezas

* Fechos «informais» sem MO — mitigação: CA-083-4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R9** |
| ARQ-032 | A3, A7 |
| Norma superior | CON-001 Art. 8º |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B5`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B5`](../validation/VAL-IMP-071-B5.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R9 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

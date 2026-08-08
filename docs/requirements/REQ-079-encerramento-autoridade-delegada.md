# REQ-079 — Encerramento da Autoridade Delegada por critérios

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R5** — Encerrar por critérios

## Enunciado

O CEO deverá encerrar a Autoridade Delegada quando se verificar qualquer critério de termo definido na ARQ-032 (revogação explícita, exaurimento do perímetro, expiração, perda de âmbito, acto soberano do Usuário, ou retorno automático), sem manter alçada após o termo.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A5 e CAP-01 R5: o período controlado tem termo objectivo. Decompõe exclusivamente R5.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-079-1** | Revogação explícita do Usuário ⇒ delegação encerrada. | Após revogação: estado inactivo = pass. |
| **CA-079-2** | Exaurimento do perímetro ou expiração (se definida) ⇒ encerramento. | Cenário de termo: estado inactivo = pass. |
| **CA-079-3** | Perda de âmbito ou acto soberano que contradiga o mandato ⇒ encerramento. | Casos E4/E5: estado inactivo = pass. |
| **CA-079-4** | Após qualquer termo, **não** permanece competência de fecho sob o mandato findo. | Pós-termo: fecho autónomo ausente = pass. |

## Fora do escopo

* Mecânica do retorno automático (efeito) — **REQ-080** (R6).  
* Validação do acto inicial — **REQ-075**.  
* Tecnologia / IMP.

## Dependências

* **REQ-076**; ARQ-032 A5; CAP-01 R5.

## Riscos e incertezas

* Mandato «esquecido» activo — mitigação: CA-079-2…4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R5** |
| ARQ-032 | A5 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B3`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B3`](../validation/VAL-IMP-071-B3.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R5 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

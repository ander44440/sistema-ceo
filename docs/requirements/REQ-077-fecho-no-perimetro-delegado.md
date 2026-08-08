# REQ-077 — Fecho decisório no perímetro sob Autoridade Delegada

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R3** — Exercer fecho no perímetro

## Enunciado

O CEO deverá, com Autoridade Delegada activa, poder fechar decisões executivas operacionais cobertas pelo perímetro concedido sem exigir novo acto de fecho do Usuário a cada passo coberto, sem alienar a titularidade da missão.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A1/A3/A6 e CAP-01 R3: a competência concedida é de fecho no perímetro. Decompõe exclusivamente R3.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-077-1** | Estado activo + decisão coberta pelo perímetro ⇒ fecho possível **sem** novo acto de fecho do Usuário. | Cenário no perímetro: fecho pelo CEO = pass. |
| **CA-077-2** | O fecho sob delegação **não** altera o dono da missão (Usuário). | Pós-fecho: titular da missão = Usuário = pass. |
| **CA-077-3** | Fechos sob este REQ são apenas: priorizar; escolher entre alternativas já enquadradas; determinar próximo gesto decisório; declarar a decisão tomada — todos dentro do perímetro. | Checklist do fecho: cada item ∈ lista e ∈ perímetro = pass; qualquer outro tipo = fail. |
| **CA-077-4** | Sem estado activo ⇒ este requisito **não** autoriza fecho autónomo. | Estado inactivo: fecho autónomo ausente = pass. |

## Fora do escopo

* Recusa fora dos limites — **REQ-078** (R4).  
* Prevalência soberana — **REQ-081** (R7).  
* Ampliação de perímetro — vedada.  
* Tecnologia / IMP.

## Dependências

* **REQ-076**; ARQ-032 A1, A3, A6; CAP-01 R3.

## Riscos e incertezas

* Sobreinterpretação do perímetro — mitigação: CA-077-3 + **REQ-078**.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R3** |
| ARQ-032 | A1, A3, A6 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B2`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B2`](../validation/VAL-IMP-071-B2.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R3 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

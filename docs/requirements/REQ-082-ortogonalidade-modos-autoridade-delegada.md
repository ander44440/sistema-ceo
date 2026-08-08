# REQ-082 — Ortogonalidade entre Autoridade Delegada e modos Deliberar/Executar/Recuperar

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R8** — Ortogonalidade aos modos executivos

## Enunciado

O CEO deverá tratar Autoridade Delegada e os modos Deliberar, Executar e Recuperar como eixos ortogonais: os modos descrevem a postura do momento; a delegação determina apenas se existe competência de fecho no perímetro — sem criar um quarto modo e sem modificar a disciplina CTO-003.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A8 e CAP-01 R8: convivência sem redesign. Decompõe exclusivamente R8.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-082-1** | Autoridade Delegada **não** é modelada como quarto modo além de Deliberar/Executar/Recuperar. | Inspecção do modelo: ausência de modo «delegado» = pass. |
| **CA-082-2** | Com delegação activa, é possível observar deliberar, executar e recuperar como posturas distintas (não colapsadas num único comportamento). | Três cenários (um por modo) com resultados comportamentais distintos = pass; colapso num único modo = fail. |
| **CA-082-3** | Sem delegação activa, nenhum modo confere soberania de fecho do Usuário. | Estado inactivo + qualquer modo: fecho autónomo ausente = pass. |
| **CA-082-4** | Este requisito **não** altera regras, interceptação ou baseline CTO-003. | Inspecção de escopo: CTO-003 intocado = pass. |

## Fora do escopo

* Redesign de CTO-002/003 — vedado.  
* Exercício do fecho — **REQ-077**.  
* Tecnologia / IMP.

## Dependências

* ARQ-032 A8; CAP-01 R8; disciplina Deliberar/Executar/Recuperar (Baseline).

## Riscos e incertezas

* Fundir «EXECUTAR» com «delegação activa» — mitigação: CA-082-1…3.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R8** |
| ARQ-032 | A8 |
| Norma superior | CON-001 Art. 6º I; Baseline CTO-003 (intocada) |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B4`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B4`](../validation/VAL-IMP-071-B4.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R8 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

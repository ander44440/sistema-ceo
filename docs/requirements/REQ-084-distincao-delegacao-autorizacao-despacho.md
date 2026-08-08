# REQ-084 — Distinção operacional entre Autoridade Delegada, autorização pontual e despacho de execução

> **Status:** Aprovado v1.0 — 07/08/2026 (Despacho CTO — pacote homologado)
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada)  
> **Responsabilidade:** **R10** — Distinções conceptuais em operação

## Enunciado

O CEO deverá tratar como conceitos operacionais distintos e não intercambiáveis: (1) Autoridade Delegada — competência temporária de fecho; (2) autorização operacional pontual — confirmação de um acto já enquadrado; (3) delegação de execução — despacho CEO→fila/oficina para fazer, não para decidir o fecho de domínio.

## Tipo

Funcional; alto nível.

## Justificativa

ARQ-032 A1 e CAP-01 R10; causa raiz INV-001 (colisão semântica). Decompõe exclusivamente R10.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-084-1** | Autorização operacional pontual **não** activa por si Autoridade Delegada. | «Autorizado»/Gate sem acto de fecho: estado delegado ausente = pass. |
| **CA-084-2** | Despacho à fila/oficina (execução) **não** equivale a Autoridade Delegada. | Job/despacho sem mandato de fecho: conceitos separados = pass. |
| **CA-084-3** | Existindo Gate/autorização pontual **e** Autoridade Delegada activa em simultâneo, os efeitos permanecem atribuíveis a conceitos distintos (confirmação de acto ≠ competência de fecho contínua). | Cenário conjunto: Gate resolve acto pontual; estado delegado permanece independente = pass; fusão num único efeito = fail. |
| **CA-084-4** | Matriz de três casos isolados produz três efeitos distintos: (a) só Gate/autorização pontual; (b) só despacho execução; (c) só acto de delegação de fecho. | (a) sem estado delegado; (b) sem estado delegado; (c) com estado delegado = pass; qualquer colisão de efeitos = fail. |

## Fora do escopo

* Validação do acto de delegação — **REQ-075**.  
* Redesign de Gate / CTO-003 / Motor — vedado.  
* Tecnologia / IMP.

## Dependências

* ARQ-032 A1; CAP-01 R10; INV-001 (contexto).

## Riscos e incertezas

* Reincidência da colisão léxica «autorizado» — mitigação: CA-084-1…4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-01** |
| Responsabilidade | **R10** |
| ARQ-032 | A1 |
| Norma superior | CON-001 Art. 6º I |
| Origem | Despacho CTO — REQs CAP-01 |
| Implementação | [`IMP-071-B5`](../implementation/IMP-071-autoridade-delegada.md) · [`VAL-IMP-071-B5`](../validation/VAL-IMP-071-B5.md) — **congelado** durante IMP-071 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 07/08/2026 | Engenheiro | Criação — R10 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CAs binários PASS/FAIL | **Aprovado** |

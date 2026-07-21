# ADR-005 — Criação do tipo documental ANL (Análise de Capacidade)

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | Engenheiro (Cursor) propôs, em decorrência de ordem do CTO; aguarda ratificação do CTO |
| Quando | 21/07/2026 |
| Por quê | O CTO solicitou um "documento de análise" da CAP-04, tipo que não existe no catálogo oficial; a regra do catálogo exige que novo tipo documental nasça por ADR, nunca ad hoc |
| Baseado em quê | `docs/README.md` (catálogo oficial, regra de criação de tipos); ordem do CTO de 21/07/2026 |
| Resultado | Tipo ANL aprovado pelo CTO em 21/07/2026; ANL-001 (análise da CAP-04) produzida como primeiro exemplar e aprovada v1.0 |

## Status

Aprovada (CTO, 21/07/2026).

## Decisão

Criar o tipo documental **ANL — Análise de Capacidade**:

* **Finalidade:** preparar a estratégia de engenharia de requisitos de uma capacidade antes da escrita dos REQs — objetivo, limites, dependências, agrupamentos, riscos e ordem sugerida.
* **Características oficiais (CTO, 21/07/2026):** preparatório; não normativo; utilizado antes da elaboração da primeira sequência de REQs de cada capacidade.
* **Localização:** `docs/analysis/`.
* **Identificação:** ANL-nnn, sequencial e permanente.
* **Elaboração:** Engenheiro ou CTO. **Aprovação:** CTO (documento preparatório, não normativo — não vincula requisitos futuros; estes continuam sujeitos ao fluxo normal de aprovação).
* **Estrutura mínima:** as seis seções definidas pelo CTO em 21/07/2026 (objetivo, limites, dependências, agrupamentos de requisitos, riscos de engenharia, ordem sugerida).

## Alternativas consideradas

* **Usar um tipo existente** (TSK ou registro em `docs/learning/`): rejeitado — semântica incompatível; análises de capacidade serão recorrentes (uma por capacidade) e merecem tipo próprio e localizável.
* **Criar o documento sem tipo oficial:** rejeitado — violaria a regra do catálogo criada na ADR-004/Índice Documental.

## Rastreabilidade

- Norma superior: CON-001 Art. 5º; catálogo oficial (`docs/README.md`).
- Origem: ordem do CTO — análise da CAP-04 (21/07/2026).
- Gera: `docs/analysis/ANL-001-analise-cap-04.md`; inclusão do tipo na taxonomia do catálogo.

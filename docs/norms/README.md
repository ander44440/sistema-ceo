# Índice Oficial do Registro Canônico de Normas

> **Status: Operacional — Gate E3 homologado (Governança, 22/07/2026).**
> Norma superior: CON-001 v1.0; REQ-002 v1.0; ARQ-004 v1.0 (L1; princípios P1–P7); IMP-002 v1.0.
> Este índice é a **fonte canônica do estado de vigência** das normas integrantes do registro. **A autoridade normativa do texto permanece vinculada ao documento homologado correspondente** — o índice não substitui o documento (ARQ-004, P6).
> **O índice representa o universo normativo inicial homologado na Etapa E2.**
> **As entradas do índice refletem exclusivamente o estado vigente do acervo documental homologado na data da implementação (22/07/2026).**

---

## O que é

A relação oficial das normas de governança que integram o **Registro Canônico de Normas** (REQ-002; ARQ-004). Uma norma existe no registro se, e somente se, consta deste índice com referência ao seu documento (ARQ-004, A1).

## Princípios observáveis (ARQ-004)

| ID | Princípio |
|----|-----------|
| P1 | Fonte canônica única |
| P2 | Unicidade de vigência |
| P3 | Rastreabilidade histórica |
| P4 | Identificadores permanentes |
| P5 | Independência tecnológica |
| P6 | Separação: índice = estado de vigência; documento = autoridade do texto |
| P7 | Correspondência biunívoca índice × documento normativo válido |

## Regras do registro

* **Identificador:** o identificador permanente da norma é o identificador documental `PREFIXO-nnn` (decisão L1).
* **Estado:** status e versão vigente são lidos deste índice; em divergência com o cabeçalho do documento, prevalece o índice para fins de estado (ARQ-004, A3).
* **Conteúdo:** o texto normativo vigente reside exclusivamente no documento sob `/docs`.
* **Histórico:** a cadeia de alterações permanece no documento; recuperável a partir do identificador (REQ-002).
* **Espelhos:** subordinados; em divergência, prevalece o registro (P1).
* **Universo:** categorias iniciais conforme Gate E2; ampliável/redutível por deliberação normativa posterior; critério por natureza documental, não por prefixo.

## Normas registradas

Estado de vigência refletido a partir do catálogo oficial e dos cabeçalhos documentais na data da população E3 (22/07/2026). Nenhum conteúdo normativo foi alterado neste ato.

### CON — Constituição

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| CON-001 | Constituição do CEO | Aprovado | 1.0 | [CON-001-constituicao.md](../CON-001-constituicao.md) |

### VIS — Visão

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| VIS-001 | Visão do Produto | Aprovado | 1.0 | [VIS-001-visao-do-produto.md](../vision/VIS-001-visao-do-produto.md) |
| VIS-002 | Identidade Institucional do Produto | Homologado | 1.0 | [VIS-002-identidade-institucional-do-produto.md](../vision/VIS-002-identidade-institucional-do-produto.md) |

### REQ — Requisitos

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| REQ-001 | Distribuição da Constituição | Aprovado | — | [REQ-001-distribuicao-da-constituicao.md](../requirements/REQ-001-distribuicao-da-constituicao.md) |
| REQ-002 | Registro canônico de normas | Aprovado | 1.0 | [REQ-002-registro-canonico-de-normas.md](../requirements/REQ-002-registro-canonico-de-normas.md) |
| REQ-003 | Resolução da norma vigente | Aprovado | 1.0 | [REQ-003-resolucao-da-norma-vigente.md](../requirements/REQ-003-resolucao-da-norma-vigente.md) |
| REQ-004 | Registro estruturado do conhecimento | Aprovado | 1.0 | [REQ-004-registro-estruturado-do-conhecimento.md](../requirements/REQ-004-registro-estruturado-do-conhecimento.md) |
| REQ-005 | Recuperação contextual do conhecimento | Aprovado | 1.0 | [REQ-005-recuperacao-contextual-do-conhecimento.md](../requirements/REQ-005-recuperacao-contextual-do-conhecimento.md) |
| REQ-006 | Registro de conceitos organizacionais | Aprovado | 1.0 | [REQ-006-registro-de-conceitos-organizacionais.md](../requirements/REQ-006-registro-de-conceitos-organizacionais.md) |
| REQ-007 | Evolução semântica de conceitos | Aprovado | 1.0 | [REQ-007-evolucao-semantica-de-conceitos.md](../requirements/REQ-007-evolucao-semantica-de-conceitos.md) |
| REQ-008 | Resolução de conceitos organizacionais | Aprovado | 1.0 | [REQ-008-resolucao-de-conceitos-organizacionais.md](../requirements/REQ-008-resolucao-de-conceitos-organizacionais.md) |
| REQ-009 | Política de admissão de conceitos | Aprovado | 1.0 | [REQ-009-politica-de-admissao-de-conceitos.md](../requirements/REQ-009-politica-de-admissao-de-conceitos.md) |
| REQ-010 | Composição do pacote de governança | Aprovado | 1.0 | [REQ-010-composicao-do-pacote-de-governanca.md](../requirements/REQ-010-composicao-do-pacote-de-governanca.md) |
| REQ-011 | Vínculo de Distribuição | Aprovado | 1.0 | [REQ-011-vinculo-de-distribuicao.md](../requirements/REQ-011-vinculo-de-distribuicao.md) |
| REQ-012 | Entrega e propagação do pacote | Aprovado | 1.0 | [REQ-012-entrega-e-propagacao.md](../requirements/REQ-012-entrega-e-propagacao.md) |
| REQ-013 | Rastro da Distribuição | Aprovado | 1.0 | [REQ-013-rastro-da-distribuicao.md](../requirements/REQ-013-rastro-da-distribuicao.md) |

### ADR — Decisões arquiteturais

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| ADR-001 | Revisão CTO — sistema de governança | Aceito | — | [ADR-001-revisao-cto-sistema-de-governanca.md](../adr/ADR-001-revisao-cto-sistema-de-governanca.md) |
| ADR-002 | Diretrizes estratégicas e padrão documental | Aceito | — | [ADR-002-diretrizes-estrategicas-e-padrao-documental.md](../adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md) |
| ADR-003 | Consolidação CAP-001 e encerramento Fase 0 | Aceito | — | [ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md](../adr/ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md) |
| ADR-004 | Decisão final da Fase 0 | Aceito | — | [ADR-004-decisao-final-da-fase-0.md](../adr/ADR-004-decisao-final-da-fase-0.md) |
| ADR-005 | Cria tipo documental ANL | Aceito | — | [ADR-005-cria-tipo-documental-anl.md](../adr/ADR-005-cria-tipo-documental-anl.md) |
| ADR-006 | Fluxo oficial de desenvolvimento de capacidades | Aceito | 1.0 | [ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md](../adr/ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md) |
| ADR-007 | Mecanismo de conceitos organizacionais | Aceito | 1.0 | [ADR-007-mecanismo-de-conceitos-organizacionais.md](../adr/ADR-007-mecanismo-de-conceitos-organizacionais.md) |
| ADR-008 | Integração arquitetural do mecanismo de conceitos | Aceito | 1.0 | [ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md](../adr/ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md) |
| ADR-009 | Transição para o mecanismo de conceitos | Aceito | 1.0 | [ADR-009-transicao-para-o-mecanismo-de-conceitos.md](../adr/ADR-009-transicao-para-o-mecanismo-de-conceitos.md) |
| ADR-010 | Cria tipo documental ARQ | Aceito | 1.0 | [ADR-010-cria-tipo-documental-arq.md](../adr/ADR-010-cria-tipo-documental-arq.md) |
| ADR-011 | Criação da capacidade de Identidade Organizacional | Aceito | 1.0 | [ADR-011-criacao-da-capacidade-de-identidade-organizacional.md](../adr/ADR-011-criacao-da-capacidade-de-identidade-organizacional.md) |
| ADR-012 | Cria tipo documental IMP | Aceito | 1.0 | [ADR-012-cria-tipo-documental-imp.md](../adr/ADR-012-cria-tipo-documental-imp.md) |
| ADR-013 | Decisões estruturais do ciclo da Distribuição | Homologada | 1.0 | [ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md](../adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md) |

**Totais E3:** 1 CON + 2 VIS + 13 REQ + 13 ADR = **29** entradas.

### Verificação quantitativa (P7)

| Métrica | Valor |
|---------|-------|
| Documentos do universo E2 no acervo (CON+VIS+REQ+ADR homologados/aprovados/aceitos) | 29 |
| Entradas do índice | 29 |
| Diferença | **0** |

Correspondência 1:1 índice × documentos do universo E2 (P7). Nenhum conteúdo normativo foi alterado neste ato.

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem (E1) | Engenheiro materializou estrutura; Gate E1 homologado pela Governança (22/07/2026) |
| Quem (E3) | Engenheiro (Cursor) populou o índice; alçada: CTO / Governança (gate E3) |
| Quando | 22/07/2026 |
| Por quê | Executar E3 do IMP-002 — operacionalizar o estado de vigência do universo homologado em E2 |
| Baseado em quê | ARQ-004; IMP-002 E3; decisão E2 v1.0; catálogo oficial |
| Resultado | **Gate E3 homologado:** 29 entradas; diferença 0; Registro Canônico operacional no plano documental |

## Rastreabilidade

- ARQ-004 v1.0 (A1, P1–P7)
- IMP-002 v1.0 (Etapas E1–E3)
- Gate E2 — `decisao-universo-normativo-inicial.md` v1.0
- REQ-002 v1.0

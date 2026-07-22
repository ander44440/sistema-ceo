# Composição do Pacote de Governança — Snapshot Arquitetural

> **Status: Homologada — v1.0 (Governança, 22/07/2026). Gate E3 do IMP-003.**
> Versão 1.0 — Instantâneo em 22/07/2026.
> Norma superior: REQ-010; ARQ-005 A3; IMP-003 E3 (X7); ADR-013 D1; D1/D2.
> Este artefato é uma **projeção derivada** (snapshot) das fontes canônicas no instante da composição. **Não** é fonte normativa; **não** acompanha automaticamente alterações posteriores das fontes; em divergência, **prevalece a fonte** (ARQ-005 D1, D5).
> Interfaces: exclusivamente de **leitura**. Nenhuma fonte foi alterada neste ato.

---

## 1. Natureza do snapshot

| Propriedade | Valor |
|-------------|-------|
| Instantâneo | 22/07/2026 — composição documental E3 |
| Tipo | Snapshot arquitetural (IMP-003 X7) |
| Categorias (REQ-010) | (1) Constituição · (2) Normas vigentes · (3) Conceitos vigentes |
| Recomposição | Somente por ato deliberado (REQ-012 / gates futuros) |
| Entrega / propagação | Fora do escopo desta etapa |

---

## 2. Categoria 1 — Constituição

| Identificador | Designação | Fonte canônica | Versão vigente no instante | Documento |
|---------------|------------|----------------|----------------------------|-----------|
| CON-001 | Constituição do CEO | Documento canônico | 1.0 | [`docs/CON-001-constituicao.md`](../CON-001-constituicao.md) |

---

## 3. Categoria 2 — Normas de governança vigentes

Estado de vigência lido do **Registro Canônico de Normas** (`docs/norms/README.md`) no instante do snapshot. Universo = 29 entradas (Gate E3 do IMP-002). Autoridade do texto permanece em cada documento.

### CON

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| CON-001 | Constituição do CEO | Aprovado | 1.0 | [`docs/CON-001-constituicao.md`](../CON-001-constituicao.md) |

> Nota (D1): CON-001 figura na Categoria 1 (Constituição) e como entrada do Registro Canônico. São facetas da mesma fonte — o snapshot não cria segunda autoridade.

### VIS

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| VIS-001 | Visão do Produto | Aprovado | 1.0 | [`docs/vision/VIS-001-visao-do-produto.md`](../vision/VIS-001-visao-do-produto.md) |
| VIS-002 | Identidade Institucional do Produto | Homologado | 1.0 | [`docs/vision/VIS-002-identidade-institucional-do-produto.md`](../vision/VIS-002-identidade-institucional-do-produto.md) |

### REQ

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| REQ-001 | Distribuição da Constituição | Aprovado | — | [`docs/requirements/REQ-001-distribuicao-da-constituicao.md`](../requirements/REQ-001-distribuicao-da-constituicao.md) |
| REQ-002 | Registro canônico de normas | Aprovado | 1.0 | [`docs/requirements/REQ-002-registro-canonico-de-normas.md`](../requirements/REQ-002-registro-canonico-de-normas.md) |
| REQ-003 | Resolução da norma vigente | Aprovado | 1.0 | [`docs/requirements/REQ-003-resolucao-da-norma-vigente.md`](../requirements/REQ-003-resolucao-da-norma-vigente.md) |
| REQ-004 | Registro estruturado do conhecimento | Aprovado | 1.0 | [`docs/requirements/REQ-004-registro-estruturado-do-conhecimento.md`](../requirements/REQ-004-registro-estruturado-do-conhecimento.md) |
| REQ-005 | Recuperação contextual do conhecimento | Aprovado | 1.0 | [`docs/requirements/REQ-005-recuperacao-contextual-do-conhecimento.md`](../requirements/REQ-005-recuperacao-contextual-do-conhecimento.md) |
| REQ-006 | Registro de conceitos organizacionais | Aprovado | 1.0 | [`docs/requirements/REQ-006-registro-de-conceitos-organizacionais.md`](../requirements/REQ-006-registro-de-conceitos-organizacionais.md) |
| REQ-007 | Evolução semântica de conceitos | Aprovado | 1.0 | [`docs/requirements/REQ-007-evolucao-semantica-de-conceitos.md`](../requirements/REQ-007-evolucao-semantica-de-conceitos.md) |
| REQ-008 | Resolução de conceitos organizacionais | Aprovado | 1.0 | [`docs/requirements/REQ-008-resolucao-de-conceitos-organizacionais.md`](../requirements/REQ-008-resolucao-de-conceitos-organizacionais.md) |
| REQ-009 | Política de admissão de conceitos | Aprovado | 1.0 | [`docs/requirements/REQ-009-politica-de-admissao-de-conceitos.md`](../requirements/REQ-009-politica-de-admissao-de-conceitos.md) |
| REQ-010 | Composição do pacote de governança | Aprovado | 1.0 | [`docs/requirements/REQ-010-composicao-do-pacote-de-governanca.md`](../requirements/REQ-010-composicao-do-pacote-de-governanca.md) |
| REQ-011 | Vínculo de Distribuição | Aprovado | 1.0 | [`docs/requirements/REQ-011-vinculo-de-distribuicao.md`](../requirements/REQ-011-vinculo-de-distribuicao.md) |
| REQ-012 | Entrega e propagação do pacote | Aprovado | 1.0 | [`docs/requirements/REQ-012-entrega-e-propagacao.md`](../requirements/REQ-012-entrega-e-propagacao.md) |
| REQ-013 | Rastro da Distribuição | Aprovado | 1.0 | [`docs/requirements/REQ-013-rastro-da-distribuicao.md`](../requirements/REQ-013-rastro-da-distribuicao.md) |

### ADR

| Identificador | Designação | Status | Versão vigente | Documento |
|---------------|------------|--------|----------------|-----------|
| ADR-001 | Revisão CTO — sistema de governança | Aceito | — | [`docs/adr/ADR-001-revisao-cto-sistema-de-governanca.md`](../adr/ADR-001-revisao-cto-sistema-de-governanca.md) |
| ADR-002 | Diretrizes estratégicas e padrão documental | Aceito | — | [`docs/adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md`](../adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md) |
| ADR-003 | Consolidação CAP-001 e encerramento Fase 0 | Aceito | — | [`docs/adr/ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md`](../adr/ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md) |
| ADR-004 | Decisão final da Fase 0 | Aceito | — | [`docs/adr/ADR-004-decisao-final-da-fase-0.md`](../adr/ADR-004-decisao-final-da-fase-0.md) |
| ADR-005 | Cria tipo documental ANL | Aceito | — | [`docs/adr/ADR-005-cria-tipo-documental-anl.md`](../adr/ADR-005-cria-tipo-documental-anl.md) |
| ADR-006 | Fluxo oficial de desenvolvimento de capacidades | Aceito | 1.0 | [`docs/adr/ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md`](../adr/ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md) |
| ADR-007 | Mecanismo de conceitos organizacionais | Aceito | 1.0 | [`docs/adr/ADR-007-mecanismo-de-conceitos-organizacionais.md`](../adr/ADR-007-mecanismo-de-conceitos-organizacionais.md) |
| ADR-008 | Integração arquitetural do mecanismo de conceitos | Aceito | 1.0 | [`docs/adr/ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md`](../adr/ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md) |
| ADR-009 | Transição para o mecanismo de conceitos | Aceito | 1.0 | [`docs/adr/ADR-009-transicao-para-o-mecanismo-de-conceitos.md`](../adr/ADR-009-transicao-para-o-mecanismo-de-conceitos.md) |
| ADR-010 | Cria tipo documental ARQ | Aceito | 1.0 | [`docs/adr/ADR-010-cria-tipo-documental-arq.md`](../adr/ADR-010-cria-tipo-documental-arq.md) |
| ADR-011 | Criação da capacidade de Identidade Organizacional | Aceito | 1.0 | [`docs/adr/ADR-011-criacao-da-capacidade-de-identidade-organizacional.md`](../adr/ADR-011-criacao-da-capacidade-de-identidade-organizacional.md) |
| ADR-012 | Cria tipo documental IMP | Aceito | 1.0 | [`docs/adr/ADR-012-cria-tipo-documental-imp.md`](../adr/ADR-012-cria-tipo-documental-imp.md) |
| ADR-013 | Decisões estruturais do ciclo da Distribuição | Homologada | 1.0 | [`docs/adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md`](../adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md) |

**Totais Categoria 2:** 1 CON + 2 VIS + 13 REQ + 13 ADR = **29** (diferença 0 frente ao índice do Registro Canônico no instante).

---

## 4. Categoria 3 — Conceitos organizacionais vigentes

Estado lido do **Índice Oficial de Conceitos** (`docs/concepts/README.md`) no instante do snapshot.

| Identificador | Termo | Fonte canônica | Situação vigente no instante | Documento |
|---------------|-------|----------------|------------------------------|-----------|
| CNC-001 | Decisão sob governança | Autoridade semântica | Vigente desde 21/07/2026 | [`docs/concepts/CNC-001-decisao-sob-governanca.md`](../concepts/CNC-001-decisao-sob-governanca.md) |
| CNC-002 | Item de conhecimento | Autoridade semântica | Vigente desde 21/07/2026 | [`docs/concepts/CNC-002-item-de-conhecimento.md`](../concepts/CNC-002-item-de-conhecimento.md) |
| CNC-003 | Contexto de Trabalho | Autoridade semântica | Vigente desde 21/07/2026 | [`docs/concepts/CNC-003-contexto-de-trabalho.md`](../concepts/CNC-003-contexto-de-trabalho.md) |
| CNC-004 | Conceito organizacional | Autoridade semântica | Vigente desde 21/07/2026 | [`docs/concepts/CNC-004-conceito-organizacional.md`](../concepts/CNC-004-conceito-organizacional.md) |
| CNC-005 | Agente Conectado | Autoridade semântica | Vigente desde 21/07/2026 | [`docs/concepts/CNC-005-agente-conectado.md`](../concepts/CNC-005-agente-conectado.md) |

**Totais Categoria 3:** **5** conceitos (diferença 0 frente ao índice de conceitos no instante).

---

## 5. Resumo determinável (REQ-010)

| Categoria | Quantidade | Fonte de estado |
|-----------|------------|-----------------|
| Constituição | 1 | Documento CON-001 |
| Normas vigentes | 29 | `docs/norms/README.md` |
| Conceitos vigentes | 5 | `docs/concepts/README.md` |

Composição objetivamente determinável: identificador, fonte e versão/situação vigente de cada elemento neste instantâneo.

---

## 6. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) — composição; CTO — revisão técnica favorável; Governança — homologação |
| Quando | 22/07/2026 |
| Por quê | Materializar snapshot arquitetural do pacote (IMP-003 E3) |
| Baseado em quê | REQ-010; ARQ-005 A3; IMP-003 X7; leitura de CON-001, Registro Canônico e Índice de Conceitos |
| Resultado | **Gate E3 homologado:** snapshot oficial; autoridade permanece nas fontes; recomposição só por ato deliberado |

---

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Snapshot: CON-001 + 29 normas + 5 conceitos | Abertura E3 após homologação E2 | Em revisão técnica do CTO |
| 0.1 | 22/07/2026 | CTO | Revisão técnica — sem ajustes; snapshot conforme REQ-010 / ARQ-005 | Conformidade IMP-003 E3 | Aprovada — encaminhada à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Pacote como projeção oficial subordinada às fontes; sem espelho vivo | Conformidade ADR-006/012/013; REQ-010; ARQ-005; IMP-003 | **Homologada — E3 encerrada; E4 autorizada** |

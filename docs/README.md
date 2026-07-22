# Índice Documental do Projeto CEO

> **Status: APROVADO — catálogo oficial da documentação do projeto (ADR-004).**
> Versão 1.0 — 21/07/2026. Este índice é a fonte única sobre quais tipos de documento existem, onde vivem, e qual vocabulário de status usam. Espelhos (README raiz, regras de ferramenta) são subordinados a ele (CON-001, Art. 7º §4º).

## Taxonomia de tipos documentais

| Prefixo | Tipo | Localização | Quem elabora | Quem aprova |
|---------|------|-------------|--------------|-------------|
| CON | Constituição | `docs/` | qualquer agente propõe (Art. 11) | Usuário |
| VIS | Visão | `docs/vision/` | Engenheiro/CTO | Usuário, com revisão do CTO |
| CAP | Capacidades e estratégias derivadas | `docs/` | Engenheiro/CTO | Usuário, com revisão do CTO |
| REQ | Requisitos | `docs/requirements/` | CTO/Engenheiro | Usuário, com revisão do CTO |
| ADR | Decisões arquiteturais e registros de revisão | `docs/adr/` | Engenheiro registra | decisão do CTO/Usuário |
| ANL | Análises de capacidade (preparatórias, não normativas) | `docs/analysis/` | Engenheiro/CTO | CTO (ADR-005) |
| ARQ | Documentos de arquitetura | `docs/architecture/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-010) |
| IMP | Planos de implementação | `docs/implementation/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-012) |
| FLW | Fluxos | `docs/flows/` | CTO/Engenheiro | CTO |
| TSK | Tarefas | `docs/tasks/` | CEO/Engenheiro | CTO |
| TST | Testes | `docs/tests/` | Engenheiro | CTO |
| REL | Releases | `docs/` (futuro) | Engenheiro | Usuário |
| — | Aprendizado | `docs/learning/` | qualquer participante | — |

Criação de **novo tipo documental** exige registro em ADR e inclusão nesta tabela — nunca criação ad hoc.

## Vocabulário oficial de status

`Rascunho` → `Em análise` (revisão do CTO) → `Aprovado` (Usuário) → `Substituído` ou `Emendado`

Toda mudança de status gera uma linha no histórico de versões do documento, com os cinco campos da Memória Organizacional (CON-001, Art. 8º).

## Documentos estratégicos

Documentos estratégicos (CON, VIS, CAP) abrem respondendo às quatro perguntas do padrão documental (ADR-002, Decisão 1): O que é? Por que existe? Para quem existe? Como seu sucesso será medido?

## Documentos vigentes

| Documento | Status |
|-----------|--------|
| [`D0-fundacao.md`](D0-fundacao.md) | Histórico (fundação) |
| [`CON-001-constituicao.md`](CON-001-constituicao.md) | Aprovado v1.0 |
| [`vision/VIS-001-visao-do-produto.md`](vision/VIS-001-visao-do-produto.md) | Aprovado v1.0 |
| [`vision/VIS-002-identidade-institucional-do-produto.md`](vision/VIS-002-identidade-institucional-do-produto.md) | Homologado v1.0 |
| [`CAP-001-mapa-de-capacidades.md`](CAP-001-mapa-de-capacidades.md) | Aprovado v1.0 |
| [`CAP-002-priorizacao-das-capacidades.md`](CAP-002-priorizacao-das-capacidades.md) | Aprovado v1.0 |
| [`requirements/REQ-001-distribuicao-da-constituicao.md`](requirements/REQ-001-distribuicao-da-constituicao.md) | Aprovado |
| [`requirements/REQ-002-registro-canonico-de-normas.md`](requirements/REQ-002-registro-canonico-de-normas.md) | Aprovado v1.0 |
| [`requirements/REQ-003-resolucao-da-norma-vigente.md`](requirements/REQ-003-resolucao-da-norma-vigente.md) | Aprovado v1.0 |
| [`requirements/REQ-004-registro-estruturado-do-conhecimento.md`](requirements/REQ-004-registro-estruturado-do-conhecimento.md) | Aprovado v1.0 |
| [`requirements/REQ-005-recuperacao-contextual-do-conhecimento.md`](requirements/REQ-005-recuperacao-contextual-do-conhecimento.md) | Aprovado v1.0 |
| [`requirements/REQ-006-registro-de-conceitos-organizacionais.md`](requirements/REQ-006-registro-de-conceitos-organizacionais.md) | Aprovado v1.0 |
| [`requirements/REQ-007-evolucao-semantica-de-conceitos.md`](requirements/REQ-007-evolucao-semantica-de-conceitos.md) | Aprovado v1.0 |
| [`requirements/REQ-008-resolucao-de-conceitos-organizacionais.md`](requirements/REQ-008-resolucao-de-conceitos-organizacionais.md) | Aprovado v1.0 |
| [`requirements/REQ-009-politica-de-admissao-de-conceitos.md`](requirements/REQ-009-politica-de-admissao-de-conceitos.md) | Aprovado v1.0 |
| [`requirements/TEMPLATE-REQ.md`](requirements/TEMPLATE-REQ.md) | Padrão oficial (ADR-003) |
| [`adr/ADR-001-revisao-cto-sistema-de-governanca.md`](adr/ADR-001-revisao-cto-sistema-de-governanca.md) | Aceito |
| [`adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md`](adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md) | Aceito |
| [`adr/ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md`](adr/ADR-003-consolidacao-cap-001-e-encerramento-da-fase-0.md) | Aceito |
| [`adr/ADR-004-decisao-final-da-fase-0.md`](adr/ADR-004-decisao-final-da-fase-0.md) | Aceito |
| [`adr/ADR-005-cria-tipo-documental-anl.md`](adr/ADR-005-cria-tipo-documental-anl.md) | Aceito |
| [`analysis/ANL-001-analise-cap-04.md`](analysis/ANL-001-analise-cap-04.md) | Aprovado v1.1 |
| [`analysis/ANL-002-analise-mecanismo-de-conceitos.md`](analysis/ANL-002-analise-mecanismo-de-conceitos.md) | Aprovado v1.0 |
| [`adr/ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md`](adr/ADR-006-fluxo-oficial-de-desenvolvimento-de-capacidades.md) | Aceito v1.0 |
| [`adr/ADR-007-mecanismo-de-conceitos-organizacionais.md`](adr/ADR-007-mecanismo-de-conceitos-organizacionais.md) | Aceito v1.0 |
| [`adr/ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md`](adr/ADR-008-integracao-arquitetural-do-mecanismo-de-conceitos.md) | Aceito v1.0 |
| [`adr/ADR-009-transicao-para-o-mecanismo-de-conceitos.md`](adr/ADR-009-transicao-para-o-mecanismo-de-conceitos.md) | Aceito v1.0 |
| [`adr/ADR-010-cria-tipo-documental-arq.md`](adr/ADR-010-cria-tipo-documental-arq.md) | Aceito v1.0 |
| [`adr/ADR-011-criacao-da-capacidade-de-identidade-organizacional.md`](adr/ADR-011-criacao-da-capacidade-de-identidade-organizacional.md) | Aceito v1.0 |
| [`architecture/ARQ-001-arquitetura-do-registro-de-conceitos.md`](architecture/ARQ-001-arquitetura-do-registro-de-conceitos.md) | Aprovado v1.0 |
| [`analysis/ANL-003-analise-da-estrategia-de-migracao.md`](analysis/ANL-003-analise-da-estrategia-de-migracao.md) | Aprovada v1.0 |
| [`architecture/ARQ-002-arquitetura-de-identificacao-organizacional.md`](architecture/ARQ-002-arquitetura-de-identificacao-organizacional.md) | Aprovado v1.0 |
| [`architecture/ARQ-003-espaco-de-identificacao-dos-conceitos.md`](architecture/ARQ-003-espaco-de-identificacao-dos-conceitos.md) | Aprovado v1.0 |
| [`architecture/ARQ-004-arquitetura-do-registro-canonico-de-normas.md`](architecture/ARQ-004-arquitetura-do-registro-canonico-de-normas.md) | Homologada v1.0 |
| [`architecture/ARQ-005-arquitetura-da-distribuicao-de-governanca.md`](architecture/ARQ-005-arquitetura-da-distribuicao-de-governanca.md) | Homologada v1.0 |
| [`norms/README.md`](norms/README.md) — Índice Oficial do Registro Canônico de Normas | Operacional — 29 entradas (universo E2) |
| [`norms/decisao-universo-normativo-inicial.md`](norms/decisao-universo-normativo-inicial.md) | Homologada v1.0 (Gate E2) |
| [`norms/verificacao-e4-conformidade-e-estabilidade.md`](norms/verificacao-e4-conformidade-e-estabilidade.md) | Homologada v1.0 (Gate E4) |
| [`norms/encerramento-e5-implementacao-registro-canonico.md`](norms/encerramento-e5-implementacao-registro-canonico.md) | Homologada v1.0 (Gate E5) |
| [`adr/ADR-012-cria-tipo-documental-imp.md`](adr/ADR-012-cria-tipo-documental-imp.md) | Aceito v1.0 |
| [`implementation/IMP-001-plano-de-implementacao-do-mecanismo-de-conceitos.md`](implementation/IMP-001-plano-de-implementacao-do-mecanismo-de-conceitos.md) | Aprovado v1.0 |
| [`implementation/IMP-002-plano-de-implementacao-do-registro-canonico-de-normas.md`](implementation/IMP-002-plano-de-implementacao-do-registro-canonico-de-normas.md) | Homologado v1.0 — **Implementação CONCLUÍDA (E1–E5)** |
| [`analysis/ANL-004-analise-da-distribuicao-de-governanca.md`](analysis/ANL-004-analise-da-distribuicao-de-governanca.md) | Aprovada v1.0 |
| [`adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md`](adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md) | Homologada v1.0 |
| [`requirements/REQ-010-composicao-do-pacote-de-governanca.md`](requirements/REQ-010-composicao-do-pacote-de-governanca.md) | Aprovado v1.0 |
| [`concepts/README.md`](concepts/README.md) — Índice Oficial de Conceitos (CNC-001 a CNC-005) | Oficial — em vigor |
| [`concepts/TEMPLATE-CONCEITO.md`](concepts/TEMPLATE-CONCEITO.md) | Oficial |
| [`concepts/decisoes-de-admissao-da-migracao.md`](concepts/decisoes-de-admissao-da-migracao.md) | Aprovado v1.0 |
| [`concepts/proposta-de-admissao-agente-conectado.md`](concepts/proposta-de-admissao-agente-conectado.md) | Homologada v1.0 |
| [`concepts/decisao-de-admissao-agente-conectado.md`](concepts/decisao-de-admissao-agente-conectado.md) | Aprovado v1.0 |
| [`requirements/REQ-011-vinculo-de-distribuicao.md`](requirements/REQ-011-vinculo-de-distribuicao.md) | Aprovado v1.0 |
| [`learning/2026-07-22-ancora-operacional-pos-cnc-005.md`](learning/2026-07-22-ancora-operacional-pos-cnc-005.md) | Homologada — marco de continuidade pós-CNC-005 |
| [`requirements/REQ-012-entrega-e-propagacao.md`](requirements/REQ-012-entrega-e-propagacao.md) | Aprovado v1.0 |
| [`requirements/REQ-013-rastro-da-distribuicao.md`](requirements/REQ-013-rastro-da-distribuicao.md) | Aprovado v1.0 |

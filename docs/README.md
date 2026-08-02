# Índice Documental do Projeto CEO

> **Status: APROVADO — catálogo oficial da documentação do projeto (ADR-004).**
> Versão 1.0 — 21/07/2026. Este índice é a fonte única sobre quais tipos de documento existem, onde vivem, e qual vocabulário de status usam. Espelhos (README raiz, regras de ferramenta) são subordinados a ele (CON-001, Art. 7º §4º).

## Taxonomia de tipos documentais

| Prefixo | Tipo | Localização | Quem elabora | Quem aprova |
|---------|------|-------------|--------------|-------------|
| CON | Constituição | `docs/` | qualquer agente propõe (Art. 11) | Usuário |
| VIS | Visão | `docs/vision/` | Engenheiro/CTO | Usuário, com revisão do CTO |
| ROADMAP | Planos estratégicos (acima das CAPs) | `docs/roadmap/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-016) |
| CAP | Capacidades e estratégias derivadas | `docs/` | Engenheiro/CTO | Usuário, com revisão do CTO |
| — CAP-E | Capacidade de Evolução — cria capacidade estratégica nova (mapa CAP-001) | `docs/` (ciclo ADR-006) | Engenheiro/CTO | CTO, com aval do Usuário (ADR-017) |
| — CAP-R | Capacidade de Consolidação — aprimora baselines já homologadas; identificação CAP-R-nnn; gera nova baseline e integra a próxima RELEASE | Sede fixada na abertura (ciclo ADR-006) | Engenheiro/CTO | CTO, com aval do Usuário (ADR-017) |
| REQ | Requisitos | `docs/requirements/` | CTO/Engenheiro | Usuário, com revisão do CTO |
| ADR | Decisões arquiteturais e registros de revisão | `docs/adr/` | Engenheiro registra | decisão do CTO/Usuário |
| ANL | Análises de capacidade (preparatórias, não normativas) | `docs/analysis/` | Engenheiro/CTO | CTO (ADR-005) |
| ARQ | Documentos de arquitetura | `docs/architecture/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-010) |
| IMP | Planos de implementação | `docs/implementation/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-012) |
| VAL | Planos de validação | `docs/validation/` | Engenheiro/CTO | CTO, com aval do Usuário (ADR-014) |
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

Documentos estratégicos (CON, VIS, CAP, ROADMAP) abrem respondendo às quatro perguntas do padrão documental (ADR-002, Decisão 1): O que é? Por que existe? Para quem existe? Como seu sucesso será medido?

**Hierarquia metodológica (ADR-016):**  
`ROADMAP → ÉPICO → CAP → VIS → REQ → ARQ → IMP → VAL → BASELINE → RELEASE`  
(O fluxo ADR-006 por capacidade permanece obrigatório; o ROADMAP orienta, não substitui.)

**Classificação de capacidades (ADR-017):**  
- **CAP-E (Evolução):** cria novas capacidades estratégicas.  
- **CAP-R (Consolidação):** consolida e aprimora capacidades já homologadas a partir de OE rastreáveis; segue o mesmo fluxo VIS → REQ → ARQ → IMP → VAL; sua homologação gera **nova baseline** e integra a **próxima RELEASE**. Nenhuma OE altera baseline homologada.

## Documentos vigentes

| Documento | Status |
|-----------|--------|
| [`D0-fundacao.md`](D0-fundacao.md) | Histórico (fundação) |
| [`CON-001-constituicao.md`](CON-001-constituicao.md) | Aprovado v1.2 — mandato temporário revogado; papéis permanentes restabelecidos |
| [`vision/VIS-001-visao-do-produto.md`](vision/VIS-001-visao-do-produto.md) | Aprovado v1.0 |
| [`vision/VIS-002-identidade-institucional-do-produto.md`](vision/VIS-002-identidade-institucional-do-produto.md) | Homologado v1.0 |
| [`CAP-001-mapa-de-capacidades.md`](CAP-001-mapa-de-capacidades.md) | Aprovado v1.0 — CAP-05/07/08 homologadas; **CAP-03 aberta** (25/07/2026, ciclo COA) |
| [`adr/ADR-016-cria-tipo-documental-roadmap.md`](adr/ADR-016-cria-tipo-documental-roadmap.md) | Aceita v1.0 — tipo ROADMAP instituído |
| [`adr/ADR-017-institui-cap-r-consolidacao-de-release.md`](adr/ADR-017-institui-cap-r-consolidacao-de-release.md) | Aceita v1.0 — classificação CAP-E / CAP-R instituída; nenhuma CAP-R aberta |
| [`adr/ADR-018-mandato-cto-temporario.md`](adr/ADR-018-mandato-cto-temporario.md) | **Revogada v1.1** — nenhum trabalho técnico aberto sob o mandato |
| [`adr/ADR-019-motor-de-raciocinio-executivo.md`](adr/ADR-019-motor-de-raciocinio-executivo.md) | **Aceita para modelagem v0.1** — MRE; modelagem REQ-048…051 **encerrada** (ver ARQ-013) |
| [`requirements/REQ-048-parecer-executivo-schema.md`](requirements/REQ-048-parecer-executivo-schema.md) | **Aprovado v0.1** — contrato formal do ParecerExecutivo |
| [`requirements/REQ-049-pipeline-motor-raciocinio-executivo.md`](requirements/REQ-049-pipeline-motor-raciocinio-executivo.md) | **Aprovado v0.1** — pipeline operacional do MRE |
| [`requirements/REQ-050-speaker-executivo.md`](requirements/REQ-050-speaker-executivo.md) | **Aprovado v0.1** — Speaker Executivo (comunicação do parecer) |
| [`requirements/REQ-051-aprendizado-executivo.md`](requirements/REQ-051-aprendizado-executivo.md) | **Aprovado v0.1** — Aprendizado Executivo (retenção pós-deliberação) |
| [`architecture/ARQ-013-consolidacao-motor-raciocinio-executivo.md`](architecture/ARQ-013-consolidacao-motor-raciocinio-executivo.md) | **Homologada / aprovada v1.0** — mapa oficial MRE; Gate ARQ ok |
| [`implementation/IMP-010-plano-de-implementacao-mre.md`](implementation/IMP-010-plano-de-implementacao-mre.md) | **Aprovado v0.1** — plano incremental F1–F9 do MRE |
| [`implementation/IMP-011-contrato-validacao-parecer-executivo.md`](implementation/IMP-011-contrato-validacao-parecer-executivo.md) | **Imp. concluída** — Bloco 1 / F1; aguarda validação conjunta |
| [`implementation/IMP-012-pipeline-mre-estagios-0-7.md`](implementation/IMP-012-pipeline-mre-estagios-0-7.md) | **Imp. concluída** — Bloco 1 / F2; aguarda validação conjunta |
| [`implementation/IMP-013-aprendizado-executivo-estagio-8.md`](implementation/IMP-013-aprendizado-executivo-estagio-8.md) | **Imp. concluída** — Bloco 1 / F3; aguarda validação conjunta |
| [`implementation/evidencias/BLOCO-1-relatorio-consolidado.md`](implementation/evidencias/BLOCO-1-relatorio-consolidado.md) | Relatório consolidado Bloco 1 — **33 testes pass** |
| [`implementation/IMP-014-integracao-nucleo-mre.md`](implementation/IMP-014-integracao-nucleo-mre.md) | **Imp. concluída** — Bloco 2 / F4 — Núcleo → MRE |
| [`implementation/IMP-015-speaker-executivo.md`](implementation/IMP-015-speaker-executivo.md) | **Imp. concluída** — Bloco 2 / F5 — Speaker |
| [`implementation/IMP-016-canais-chat-voice-centro.md`](implementation/IMP-016-canais-chat-voice-centro.md) | **Imp. concluída** — Bloco 2 / F6 — canais |
| [`implementation/evidencias/BLOCO-2-relatorio-consolidado.md`](implementation/evidencias/BLOCO-2-relatorio-consolidado.md) | Relatório consolidado Bloco 2 — **12 testes pass** |
| [`implementation/IMP-017-despacho-fila-execucao.md`](implementation/IMP-017-despacho-fila-execucao.md) | **Imp. concluída** — Bloco 3 / F7 — Fila |
| [`implementation/IMP-018-persistencia-retencao-gate.md`](implementation/IMP-018-persistencia-retencao-gate.md) | **Imp. concluída** — Bloco 3 / F8 — retenção + Gate |
| [`implementation/IMP-019-fecho-imp-preparacao-val.md`](implementation/IMP-019-fecho-imp-preparacao-val.md) | **Imp. concluída** — Bloco 3 / F9 — fecho + prep VAL |
| [`implementation/evidencias/BLOCO-3-relatorio-consolidado.md`](implementation/evidencias/BLOCO-3-relatorio-consolidado.md) | Relatório consolidado Bloco 3 — **14 testes pass** |
| [`validation/VAL-MRE-esboco.md`](validation/VAL-MRE-esboco.md) | **Substituído** — histórico; ver VAL-009 |
| [`validation/VAL-009-validacao-motor-raciocinio-executivo.md`](validation/VAL-009-validacao-motor-raciocinio-executivo.md) | **Homologada v1.0** — Gate Final 30/07/2026; P2 cumprido; 28 C / 0 NC / 4 OE |
| [`learning/2026-07-30-p8-preparacao-producao-mre.md`](learning/2026-07-30-p8-preparacao-producao-mre.md) | **P8** — preparação; autorização **Go** (ver P10) |
| [`learning/2026-07-30-p9-ensaio-operacional-mre.md`](learning/2026-07-30-p9-ensaio-operacional-mre.md) | **P9** — ensaio R1 concluído |
| [`learning/2026-07-30-p10-pacote-autorizacao-producao-mre.md`](learning/2026-07-30-p10-pacote-autorizacao-producao-mre.md) | **P10 Gate Final** — **Go**; Produção MRE **AUTORIZADA** 30/07/2026 (R1) |
| [`learning/2026-07-30-relatorio-consolidado-p9-p10.md`](learning/2026-07-30-relatorio-consolidado-p9-p10.md) | Relatório consolidado P9+P10 |
| [`learning/2026-07-30-checkpoint-fases-mre.md`](learning/2026-07-30-checkpoint-fases-mre.md) | **Checkpoint oficial** — MRE R1 + IMP-020 NCS B1–B4 (`flagNcs` off) |
| [`learning/2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md`](learning/2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md) | **Insumo** — lacuna de produto (parecer consultivo vs ação); **sem** implementação |
| [`learning/2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md`](learning/2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md) | **Insumo** — CEO sem lastro operacional do MG2; briefing mínimo proposto; **sem** implementação |
| [`learning/2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md`](learning/2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md) | **Comunicado ao CTO** — lacuna COA MG2; **respondido** (Opção C) |
| [`learning/2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md`](learning/2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md) | **Deliberação CTO** — Opção C; Gate A (Briefing Curado); B condicionada |
| [`learning/2026-07-30-confirmacao-intermedia-cto-gate-briefing-mg2.md`](learning/2026-07-30-confirmacao-intermedia-cto-gate-briefing-mg2.md) | Confirmação intermédia CTO (pré-parecer final) |
| [`learning/2026-07-30-parecer-tecnico-briefing-operacional-mg2.md`](learning/2026-07-30-parecer-tecnico-briefing-operacional-mg2.md) | Parecer técnico (Engenheiro) — APROVADO COM OE |
| [`learning/2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](learning/2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md) | **Gate CTO ENCERRADO** — Opção A homologada em uso; B condicionada |
| [`learning/2026-07-30-diagnostico-falha-llm-tls-mre.md`](learning/2026-07-30-diagnostico-falha-llm-tls-mre.md) | Diagnóstico — falha MRE por TLS SSL (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) |
| [`learning/2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md`](learning/2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md) | Evidência — Briefing A insuficiente no MRE (pré-B1) |
| [`learning/2026-07-30-b1-briefing-entrada-mre-autorizado.md`](learning/2026-07-30-b1-briefing-entrada-mre-autorizado.md) | **B1 feito** — factos do briefing na entrada MRE; validado |
| [`mvp/briefing-operacional-mg2.md`](mvp/briefing-operacional-mg2.md) | **Briefing Curado v1.0** — mitigação operacional ativa (Gate encerrado) |
| [`vision/VIS-008-natureza-cognitiva-da-solicitacao-no-mre.md`](vision/VIS-008-natureza-cognitiva-da-solicitacao-no-mre.md) | **Rascunho v0.1** — natureza cognitiva pré-deliberação (análise conjunta; sem REQ) |
| [`requirements/REQ-052-natureza-cognitiva-da-solicitacao-mre.md`](requirements/REQ-052-natureza-cognitiva-da-solicitacao-mre.md) | **Rascunho v0.1** — REQ derivado da VIS-008 (revisão conjunta; sem IMP) |
| [`requirements/REQ-053-dispatcher-fila-execucao-v2-local.md`](requirements/REQ-053-dispatcher-fila-execucao-v2-local.md) | **Homologada v0.1** — Dispatcher V2; frente encerrada 01/08/2026 |
| [`requirements/REQ-054-conector-cto.md`](requirements/REQ-054-conector-cto.md) | **Homologada v0.1** — Conector CTO |
| [`implementation/IMP-054-conector-cto.md`](implementation/IMP-054-conector-cto.md) | **Homologada** — frente encerrada 01/08/2026; produção |
| [`architecture/ARQ-015-cto-connector.md`](architecture/ARQ-015-cto-connector.md) | **Homologada v0.2** — CTO Connector; Opção B (chave partilhada); Gate ARQ fechado |
| [`architecture/ARQ-016-painel-orquestracao-tempo-real.md`](architecture/ARQ-016-painel-orquestracao-tempo-real.md) | **Homologada v0.2** — Painel de Orquestração; Progressividade; Conversa central |
| [`requirements/REQ-055-painel-orquestracao-tempo-real.md`](requirements/REQ-055-painel-orquestracao-tempo-real.md) | **Homologada v0.1** — Painel de Orquestração; Progressividade |
| [`implementation/IMP-055-painel-orquestracao-tempo-real.md`](implementation/IMP-055-painel-orquestracao-tempo-real.md) | **Homologada** — frente encerrada 01/08/2026; E1–E7 em produção |
| [`architecture/ARQ-017-motor-de-execucao.md`](architecture/ARQ-017-motor-de-execucao.md) | **Homologada v0.1** — Motor de Execução; fluxo Intenção→Encerramento |
| [`architecture/ARQ-018-classificacao-de-intencao.md`](architecture/ARQ-018-classificacao-de-intencao.md) | **Homologada v0.1** — Classificação de Intenção; quatro classes; Classificador primeiro |
| [`architecture/ARQ-019-continuidade-do-gate-de-execucao.md`](architecture/ARQ-019-continuidade-do-gate-de-execucao.md) | **Homologada v0.1** — Continuidade do Gate de Execução; retoma pós-decisão humana |
| [`architecture/ARQ-020-consciencia-operacional.md`](architecture/ARQ-020-consciencia-operacional.md) | **Homologada v0.1** — Consciência Operacional; Estado Executivo Atual antes de C2/C3 |
| [`requirements/REQ-057-classificacao-de-intencao.md`](requirements/REQ-057-classificacao-de-intencao.md) | **Homologada v0.1** — Classificação de Intenção; CAP-07; alinhada à ARQ-018 |
| [`requirements/REQ-058-continuidade-do-gate-de-execucao.md`](requirements/REQ-058-continuidade-do-gate-de-execucao.md) | **Homologada v0.1** — Continuidade do Gate de Execução; CAP-11; alinhada à ARQ-019 |
| [`requirements/REQ-059-consciencia-operacional.md`](requirements/REQ-059-consciencia-operacional.md) | **Homologada v0.1** — Consciência Operacional; CAP-01; alinhada à ARQ-020 |
| [`implementation/IMP-058-continuidade-do-gate-de-execucao.md`](implementation/IMP-058-continuidade-do-gate-de-execucao.md) | **Homologada** — frente encerrada 01/08/2026; E1–E7 |
| [`implementation/IMP-059-consciencia-operacional.md`](implementation/IMP-059-consciencia-operacional.md) | **Homologada** — frente encerrada 01/08/2026; E1–E7 |
| [`implementation/evidencias/IMP-059-E1-evidencia.md`](implementation/evidencias/IMP-059-E1-evidencia.md) | Evidência IMP-059 E1 — domínio Estado Executivo F1–F8 / P1–P7 |
| [`implementation/evidencias/IMP-059-E2-evidencia.md`](implementation/evidencias/IMP-059-E2-evidencia.md) | Evidência IMP-059 E2 — agregador read-only / degradação por fonte |
| [`implementation/evidencias/IMP-059-E3-evidencia.md`](implementation/evidencias/IMP-059-E3-evidencia.md) | Evidência IMP-059 E3 — consulta obrigatória C2/C3 + lastro Núcleo |
| [`implementation/evidencias/IMP-059-E4-evidencia.md`](implementation/evidencias/IMP-059-E4-evidencia.md) | Evidência IMP-059 E4 — influência MRE / demos Job+Gate |
| [`implementation/evidencias/IMP-059-E5-evidencia.md`](implementation/evidencias/IMP-059-E5-evidencia.md) | Evidência IMP-059 E5 — prosa canónica contextualizada |
| [`implementation/evidencias/IMP-059-E6-evidencia.md`](implementation/evidencias/IMP-059-E6-evidencia.md) | Evidência IMP-059 E6 — fronteiras / read-only |
| [`implementation/evidencias/IMP-059-E7-evidencia.md`](implementation/evidencias/IMP-059-E7-evidencia.md) | Evidência IMP-059 E7 — documentação |
| [`implementation/evidencias/IMP-059-matriz-ca-na.md`](implementation/evidencias/IMP-059-matriz-ca-na.md) | Matriz CA/NA REQ-059 — evidências IMP-059 |
| [`implementation/evidencias/IMP-059-relatorio-consolidado.md`](implementation/evidencias/IMP-059-relatorio-consolidado.md) | Relatório consolidado E1–E7 + fecho IMP-059 |
| [`implementation/evidencias/IMP-059-homologacao-producao.md`](implementation/evidencias/IMP-059-homologacao-producao.md) | Homologação em produção IMP-059 — commit `de9fe81` · Vercel READY |
| [`implementation/evidencias/IMP-058-E1-evidencia.md`](implementation/evidencias/IMP-058-E1-evidencia.md) | Evidência IMP-058 E1 — domínio / estados / Gate pendente |
| [`implementation/evidencias/IMP-058-E2-evidencia.md`](implementation/evidencias/IMP-058-E2-evidencia.md) | Evidência IMP-058 E2 — léxico / reconhecimento determinístico |
| [`implementation/evidencias/IMP-058-E3-evidencia.md`](implementation/evidencias/IMP-058-E3-evidencia.md) | Evidência IMP-058 E3 — store contexto / Gate activo |
| [`implementation/evidencias/IMP-058-E4-evidencia.md`](implementation/evidencias/IMP-058-E4-evidencia.md) | Evidência IMP-058 E4 — integração Conversa → Motor |
| [`implementation/evidencias/IMP-058-E5-evidencia.md`](implementation/evidencias/IMP-058-E5-evidencia.md) | Evidência IMP-058 E5 — Aprovado/Rejeitado/Adiado + P10 |
| [`implementation/evidencias/IMP-058-E6-evidencia.md`](implementation/evidencias/IMP-058-E6-evidencia.md) | Evidência IMP-058 E6 — fronteiras / regressão |
| [`implementation/evidencias/IMP-058-E7-evidencia.md`](implementation/evidencias/IMP-058-E7-evidencia.md) | Evidência IMP-058 E7 — documentação |
| [`implementation/evidencias/IMP-058-matriz-ca-na.md`](implementation/evidencias/IMP-058-matriz-ca-na.md) | Matriz CA/NA REQ-058 — evidências IMP-058 |
| [`implementation/evidencias/IMP-058-relatorio-consolidado.md`](implementation/evidencias/IMP-058-relatorio-consolidado.md) | Relatório consolidado E6+E7 + fecho IMP-058 |
| [`implementation/evidencias/IMP-058-homologacao-producao.md`](implementation/evidencias/IMP-058-homologacao-producao.md) | Homologação em produção IMP-058 — commit `f4c22ae` · Vercel READY |
| [`implementation/IMP-057-classificacao-de-intencao.md`](implementation/IMP-057-classificacao-de-intencao.md) | **Homologada v1.0** — Emenda E5.1 homologada em produção |
| [`implementation/evidencias/IMP-057-E22-abertura.md`](implementation/evidencias/IMP-057-E22-abertura.md) | Abertura Emenda E2.2 — Cobertura de Classificação |
| [`implementation/evidencias/IMP-057-E22-relatorio.md`](implementation/evidencias/IMP-057-E22-relatorio.md) | Relatório homologação Emenda E2.2 (implementação) |
| [`implementation/evidencias/IMP-057-E22-homologacao-producao.md`](implementation/evidencias/IMP-057-E22-homologacao-producao.md) | Homologação em produção Emenda E2.2 |
| [`implementation/evidencias/IMP-057-E51-relatorio.md`](implementation/evidencias/IMP-057-E51-relatorio.md) | Relatório homologação Emenda E5.1 (executor C1) |
| [`implementation/evidencias/IMP-057-E51-homologacao-producao.md`](implementation/evidencias/IMP-057-E51-homologacao-producao.md) | Homologação em produção Emenda E5.1 |
| [`implementation/evidencias/IMP-057-matriz-ca-na.md`](implementation/evidencias/IMP-057-matriz-ca-na.md) | Matriz CA/NA REQ-057 — evidências IMP-057 |
| [`implementation/evidencias/IMP-057-relatorio-consolidado.md`](implementation/evidencias/IMP-057-relatorio-consolidado.md) | Relatório consolidado E6+E7 + fecho IMP-057 |
| [`requirements/REQ-056-motor-de-execucao.md`](requirements/REQ-056-motor-de-execucao.md) | **Homologada v0.1** — Motor de Execução; CAP-11 |
| [`implementation/IMP-056-motor-de-execucao.md`](implementation/IMP-056-motor-de-execucao.md) | **Homologada** — frente encerrada 01/08/2026; E1–E7 |
| [`implementation/evidencias/IMP-056-matriz-ca-na.md`](implementation/evidencias/IMP-056-matriz-ca-na.md) | Matriz CA/NA REQ-056 — evidências IMP-056 |
| [`learning/ANCORA-MESTRA.md`](learning/ANCORA-MESTRA.md) | **Âncora Mestra** — Painel Orquestração + Conector CTO em produção; autonomia local V2 |
| [`learning/2026-08-01-checkpoint-dispatcher-fila-v2-req-053.md`](learning/2026-08-01-checkpoint-dispatcher-fila-v2-req-053.md) | Checkpoint — Dispatcher V2 operacional |
| [`architecture/ARQ-014-natureza-cognitiva-da-solicitacao-mre.md`](architecture/ARQ-014-natureza-cognitiva-da-solicitacao-mre.md) | **Rascunho v0.1** — ARQ da NCS no limiar MRE (revisão conjunta; sem IMP) |
| [`implementation/IMP-020-natureza-cognitiva-da-solicitacao-ncs.md`](implementation/IMP-020-natureza-cognitiva-da-solicitacao-ncs.md) | **Rascunho v0.1** — plano IMP da NCS; C1–C8 materializados (B1–B4); produção NCS **não** declarada |
| [`implementation/IMP-020-blocos-de-implementacao.md`](implementation/IMP-020-blocos-de-implementacao.md) | Decomposição B1–B4; **B1–B4 implementados** (gates internos) |
| [`implementation/evidencias/IMP-020-B1-evidencia.md`](implementation/evidencias/IMP-020-B1-evidencia.md) | Evidência gate B1 (C1/C3/C4) |
| [`implementation/evidencias/IMP-020-B2-evidencia.md`](implementation/evidencias/IMP-020-B2-evidencia.md) | Evidência gate B2 (C2) |
| [`implementation/evidencias/IMP-020-B3-evidencia.md`](implementation/evidencias/IMP-020-B3-evidencia.md) | Evidência gate B3 (C5/C6) |
| [`implementation/evidencias/IMP-020-B4-evidencia.md`](implementation/evidencias/IMP-020-B4-evidencia.md) | Evidência gate B4 (C7/C8); rollback `flagNcs` |
| [`governance/mandato-cto-temporario-vigente.md`](governance/mandato-cto-temporario-vigente.md) | Histórico — mandato revogado |
| [`learning/2026-07-25-checkpoint-pre-cto-temporario.md`](learning/2026-07-25-checkpoint-pre-cto-temporario.md) | Histórico — checkpoint da transição abortada |
| [`learning/2026-07-25-revogacao-mandato-cto-temporario.md`](learning/2026-07-25-revogacao-mandato-cto-temporario.md) | Marco — revogação e restabelecimento dos papéis |
| [`vision/VIS-007-visao-do-ceo-mvp-2-0-ambiente-executivo-multiprojeto.md`](vision/VIS-007-visao-do-ceo-mvp-2-0-ambiente-executivo-multiprojeto.md) | **Aprovada para prosseguimento v0.2** — COA + Home conversacional (CAP-03) |
| [`requirements/pacote-requisitos-ceo-mvp-2-0.md`](requirements/pacote-requisitos-ceo-mvp-2-0.md) | Em análise — inventário REQ-036…044 |
| [`requirements/REQ-036-cadastro-de-contextos-operacionais-projeto.md`](requirements/REQ-036-cadastro-de-contextos-operacionais-projeto.md) … [`REQ-044-migracao-acervo-mvp-para-coa-mg2.md`](requirements/REQ-044-migracao-acervo-mvp-para-coa-mg2.md) | Em análise — pacote COA / CAP-03 |
| [`architecture/ARQ-012-arquitetura-coa-home-executiva-conversacional.md`](architecture/ARQ-012-arquitetura-coa-home-executiva-conversacional.md) | Em análise v0.1 — componentes N–S; D1–D10 |
| [`learning/2026-07-24-institucionalizacao-cap-r.md`](learning/2026-07-24-institucionalizacao-cap-r.md) | Marco — institucionalização da CAP-R |
| [`roadmap/ROADMAP-001-plano-estrategico-do-sistema-ceo.md`](roadmap/ROADMAP-001-plano-estrategico-do-sistema-ceo.md) | Homologado v1.0 — plano estratégico até CEO 1.0; épicos E1–E7 |
| [`learning/2026-07-24-institucionalizacao-roadmap.md`](learning/2026-07-24-institucionalizacao-roadmap.md) | Marco — institucionalização do tipo ROADMAP |
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
| [`analysis/ANL-001-analise-cap-04.md`](analysis/ANL-001-analise-cap-04.md) | Aprovado v1.1 — fase REQ CAP-04 encerrada (Grupo E: Opção 2c) |
| [`analysis/decisao-encerramento-requisitos-cap-04-grupo-e.md`](analysis/decisao-encerramento-requisitos-cap-04-grupo-e.md) | Homologada v1.0 — encerramento fase REQ CAP-04; Grupo E sem REQ próprio |
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
| [`architecture/ARQ-006-arquitetura-do-acervo-de-conhecimento.md`](architecture/ARQ-006-arquitetura-do-acervo-de-conhecimento.md) | Homologada v1.0 — CAP-04; Fase ARQ encerrada com ARQ-007 |
| [`architecture/ARQ-007-espaco-de-identificacao-do-acervo-de-conhecimento.md`](architecture/ARQ-007-espaco-de-identificacao-do-acervo-de-conhecimento.md) | Homologada v1.0 — espaço `KNW-nnn`; Fase ARQ CAP-04 encerrada; IMP não iniciada |
| [`analysis/plano-pre-imp-cap-04-gestao-do-conhecimento.md`](analysis/plano-pre-imp-cap-04-gestao-do-conhecimento.md) | Homologado v1.1 — referência pré-IMP CAP-04; IMP-004 homologado v1.0 |
| [`knowledge/decisao-conjunto-inicial-de-classificacoes.md`](knowledge/decisao-conjunto-inicial-de-classificacoes.md) | Em análise v0.1 — decisão técnica CTO; pré-condição IMP-004; **não** é E1 |
| [`implementation/IMP-004-plano-de-implementacao-documental-do-acervo-de-conhecimento.md`](implementation/IMP-004-plano-de-implementacao-documental-do-acervo-de-conhecimento.md) | Homologado v1.0 — CAP-04; E1+E2 homologadas; E3 não iniciada |
| [`adr/ADR-014-cria-tipo-documental-val.md`](adr/ADR-014-cria-tipo-documental-val.md) | Aceita v1.0 — tipo VAL oficial |
| [`validation/VAL-004-plano-de-validacao-implementacao-documental-acervo-conhecimento.md`](validation/VAL-004-plano-de-validacao-implementacao-documental-acervo-conhecimento.md) | Homologado v1.0 — CAP-04; Validação não executada; E1+E2 homologadas |
| [`norms/README.md`](norms/README.md) — Índice Oficial do Registro Canônico de Normas | Operacional — 29 entradas (universo E2) |
| [`norms/decisao-universo-normativo-inicial.md`](norms/decisao-universo-normativo-inicial.md) | Homologada v1.0 (Gate E2) |
| [`norms/verificacao-e4-conformidade-e-estabilidade.md`](norms/verificacao-e4-conformidade-e-estabilidade.md) | Homologada v1.0 (Gate E4) |
| [`norms/encerramento-e5-implementacao-registro-canonico.md`](norms/encerramento-e5-implementacao-registro-canonico.md) | Homologada v1.0 (Gate E5) |
| [`adr/ADR-012-cria-tipo-documental-imp.md`](adr/ADR-012-cria-tipo-documental-imp.md) | Aceito v1.0 |
| [`implementation/IMP-001-plano-de-implementacao-do-mecanismo-de-conceitos.md`](implementation/IMP-001-plano-de-implementacao-do-mecanismo-de-conceitos.md) | Aprovado v1.0 |
| [`implementation/IMP-002-plano-de-implementacao-do-registro-canonico-de-normas.md`](implementation/IMP-002-plano-de-implementacao-do-registro-canonico-de-normas.md) | Homologado v1.0 — **Implementação CONCLUÍDA (E1–E5)** |
| [`implementation/IMP-003-plano-de-implementacao-documental-da-distribuicao.md`](implementation/IMP-003-plano-de-implementacao-documental-da-distribuicao.md) | Homologado v1.0 — **Implementação CONCLUÍDA (E1–E5); Processo ENCERRADO** |
| [`distribution/README.md`](distribution/README.md) — Índice do Canal de Distribuição | Operacional — IMP-003 encerrado |
| [`distribution/decisao-estado-inicial-dos-vinculos.md`](distribution/decisao-estado-inicial-dos-vinculos.md) | Homologada v1.0 (Gate E2) — alcance inicial vazio |
| [`distribution/registro-de-alcance.md`](distribution/registro-de-alcance.md) | Operacional — vazio (Gate E2) |
| [`distribution/composicao-do-pacote.md`](distribution/composicao-do-pacote.md) | Homologada v1.0 (Gate E3) — snapshot 22/07/2026 |
| [`distribution/rastro.md`](distribution/rastro.md) | Homologada v1.0 (Gate E4) — operacionalmente vazio |
| [`distribution/verificacao-e5-conformidade-e-estabilidade.md`](distribution/verificacao-e5-conformidade-e-estabilidade.md) | Homologada v1.0 (Gate E5) |
| [`distribution/encerramento-e5-implementacao-distribuicao.md`](distribution/encerramento-e5-implementacao-distribuicao.md) | Homologada v1.0 (Gate E5) — IMP-003 encerrado |
| [`analysis/ANL-004-analise-da-distribuicao-de-governanca.md`](analysis/ANL-004-analise-da-distribuicao-de-governanca.md) | Aprovada v1.0 |
| [`analysis/ANL-005-proposta-gates-por-lote-batch-gates.md`](analysis/ANL-005-proposta-gates-por-lote-batch-gates.md) | Homologada v1.0 — análise; Batch Gates para evolução normativa futura; ADR-006 intacta |
| [`adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md`](adr/ADR-013-decisoes-estruturais-do-ciclo-da-distribuicao.md) | Homologada v1.0 |
| [`adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md`](adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md) | Aceita v1.0 — filtro de priorização uso diário MG2; rigor preservado |
| [`learning/2026-07-23-milestone-01-ceo-mvp-strategy.md`](learning/2026-07-23-milestone-01-ceo-mvp-strategy.md) | Marco permanente MILESTONE 01 — tag `CEO-MVP-START` |
| [`knowledge/README.md`](knowledge/README.md) — Índice Oficial do Acervo de Conhecimento | Operacional — E1+E2 homologadas; zero itens KNW; E3 não iniciada |
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
| [`requirements/REQ-014-curadoria-do-conhecimento.md`](requirements/REQ-014-curadoria-do-conhecimento.md) | Aprovado v1.0 — CAP-04 Grupo D (Curadoria) |
| [`requirements/REQ-015-preservacao-do-conhecimento.md`](requirements/REQ-015-preservacao-do-conhecimento.md) | Aprovado v1.0 — CAP-04 Grupo B (Preservação) |
| [`vision/VIS-003-visao-do-ceo-mvp-v0-1-uso-diario-mg2.md`](vision/VIS-003-visao-do-ceo-mvp-v0-1-uso-diario-mg2.md) | Homologado v1.0 — CEO MVP v0.1 uso diário MG2 |
| [`vision/VIS-004-visao-estrategica-cap-05-executivo-digital.md`](vision/VIS-004-visao-estrategica-cap-05-executivo-digital.md) | Homologado v1.0 — CAP-05 **concluída**; baseline CEO |
| [`requirements/REQ-033-requisitos-funcionais-cap-05-executivo-digital.md`](requirements/REQ-033-requisitos-funcionais-cap-05-executivo-digital.md) | Homologado v1.0 — **congelado**; não reabrir |
| [`architecture/ARQ-009-arquitetura-cap-05-executivo-digital.md`](architecture/ARQ-009-arquitetura-cap-05-executivo-digital.md) | Homologada v1.0 — H/I/J; **congelada**; não reabrir |
| [`implementation/IMP-006-plano-de-implementacao-cap-05-executivo-digital.md`](implementation/IMP-006-plano-de-implementacao-cap-05-executivo-digital.md) | Homologado v1.0 — **ENCERRADO**; não reabrir |
| [`cap-05/README.md`](cap-05/README.md) — Sede / baseline CAP-05 | **Homologada e concluída** — baseline do Sistema CEO |
| [`cap-05/relatorio-implementacao-cap-05.md`](cap-05/relatorio-implementacao-cap-05.md) | Aprovado — relatório consolidado IMP-006 |
| [`cap-05/e1-evidencias.md`](cap-05/e1-evidencias.md) … [`e6-evidencias.md`](cap-05/e6-evidencias.md) | Evidências por etapa (rastreabilidade) |
| [`validation/VAL-006-plano-de-validacao-cap-05-executivo-digital.md`](validation/VAL-006-plano-de-validacao-cap-05-executivo-digital.md) | Homologado v1.0 — **ENCERRADO** |
| [`cap-05/val-006-relatorio-consolidado.md`](cap-05/val-006-relatorio-consolidado.md) | Homologado — 32 C / 0 NC / 3 OE; CAP-05 aprovada |
| [`cap-05/oportunidades-evolucao-arquivadas.md`](cap-05/oportunidades-evolucao-arquivadas.md) | Arquivado — EV-033…035 para ciclos futuros |
| [`learning/2026-07-24-encerramento-cap-05-executivo-digital.md`](learning/2026-07-24-encerramento-cap-05-executivo-digital.md) | Marco — encerramento do ciclo CAP-05 |
| [`vision/VIS-005-visao-da-cap-07.md`](vision/VIS-005-visao-da-cap-07.md) | Homologado v1.0 — CAP-07 **concluída**; congelado |
| [`requirements/REQ-034-requisitos-da-cap-07.md`](requirements/REQ-034-requisitos-da-cap-07.md) | Homologado v1.0 — **congelado**; não reabrir |
| [`architecture/ARQ-010-arquitetura-da-cap-07.md`](architecture/ARQ-010-arquitetura-da-cap-07.md) | Homologada v1.0 — componente K; **congelada**; não reabrir |
| [`implementation/IMP-007-plano-de-implementacao-cap-07.md`](implementation/IMP-007-plano-de-implementacao-cap-07.md) | Homologado v1.0 — **ENCERRADO**; não reabrir |
| [`validation/VAL-007-validacao-da-cap-07.md`](validation/VAL-007-validacao-da-cap-07.md) | Aprovada — Homologado v1.0; **ENCERRADA** — 24 C / 0 NC / 3 OE |
| [`cap-07/README.md`](cap-07/README.md) — Sede / baseline CAP-07 | **Homologada e concluída** — baseline do Sistema CEO |
| [`cap-07/relatorio-implementacao-cap-07.md`](cap-07/relatorio-implementacao-cap-07.md) | Homologado v1.0 — evidências IMP-007 (24 pass / 0 fail) |
| [`cap-07/oportunidades-evolucao-arquivadas.md`](cap-07/oportunidades-evolucao-arquivadas.md) | Consolidado — EV-036…038 fora da baseline |
| [`learning/2026-07-24-encerramento-cap-07-comunicacao.md`](learning/2026-07-24-encerramento-cap-07-comunicacao.md) | Marco — encerramento do ciclo CAP-07 |
| [`vision/VIS-006-visao-da-cap-08-planejamento-executivo.md`](vision/VIS-006-visao-da-cap-08-planejamento-executivo.md) | Aprovada / Homologada v1.0 — CAP-08 **concluída**; congelada |
| [`requirements/REQ-035-requisitos-da-cap-08-planejamento-executivo.md`](requirements/REQ-035-requisitos-da-cap-08-planejamento-executivo.md) | Homologado v1.0 — **congelado**; não reabrir |
| [`architecture/ARQ-011-arquitetura-da-cap-08-planejamento-executivo.md`](architecture/ARQ-011-arquitetura-da-cap-08-planejamento-executivo.md) | Homologada v1.0 — L/M; **congelada**; não reabrir |
| [`implementation/IMP-008-plano-de-implementacao-cap-08.md`](implementation/IMP-008-plano-de-implementacao-cap-08.md) | Homologado v1.0 — **ENCERRADO**; não reabrir |
| [`validation/VAL-008-validacao-da-cap-08.md`](validation/VAL-008-validacao-da-cap-08.md) | Homologada v1.0 — **ENCERRADA** — 28 C / 0 NC / 2 OE |
| [`cap-08/README.md`](cap-08/README.md) — Sede / baseline CAP-08 | **Homologada e concluída** — baseline do Sistema CEO |
| [`cap-08/val-008-relatorio-consolidado.md`](cap-08/val-008-relatorio-consolidado.md) | Homologado — relatório VAL-008 |
| [`cap-08/oportunidades-evolucao-arquivadas.md`](cap-08/oportunidades-evolucao-arquivadas.md) | Consolidado — EV-039…040 no backlog de evolução |
| [`cap-08/relatorio-encerramento-cap-08.md`](cap-08/relatorio-encerramento-cap-08.md) | Relatório oficial de encerramento — CAP-08 concluída |
| [`learning/2026-07-24-encerramento-cap-08-planejamento-executivo.md`](learning/2026-07-24-encerramento-cap-08-planejamento-executivo.md) | Marco — encerramento do ciclo CAP-08 |
| [`vision/VIS-007-visao-do-ceo-mvp-2-0-ambiente-executivo-multiprojeto.md`](vision/VIS-007-visao-do-ceo-mvp-2-0-ambiente-executivo-multiprojeto.md) | Homologada v1.0 — CAP-03 **concluída**; congelada |
| [`requirements/pacote-requisitos-ceo-mvp-2-0.md`](requirements/pacote-requisitos-ceo-mvp-2-0.md) | Homologado v1.0 — pacote REQ-036…044 |
| [`requirements/REQ-036-cadastro-de-contextos-operacionais-projeto.md`](requirements/REQ-036-cadastro-de-contextos-operacionais-projeto.md) … [`REQ-044-migracao-acervo-mvp-para-coa-mg2.md`](requirements/REQ-044-migracao-acervo-mvp-para-coa-mg2.md) | Pacote CAP-03 (ver pacote) |
| [`architecture/ARQ-012-arquitetura-coa-home-executiva-conversacional.md`](architecture/ARQ-012-arquitetura-coa-home-executiva-conversacional.md) | Homologada v1.0 — COA / N–T/S; **congelada**; não reabrir |
| [`implementation/IMP-009-plano-de-implementacao-cap-03.md`](implementation/IMP-009-plano-de-implementacao-cap-03.md) | Homologado v1.0 — **ENCERRADO**; não reabrir |
| [`validation/VAL-003-validacao-integrada-cap-03.md`](validation/VAL-003-validacao-integrada-cap-03.md) | Homologada v1.0 — **ENCERRADA** — 36 C / 0 NC / 3 OE |
| [`cap-03/README.md`](cap-03/README.md) — Sede / baseline CAP-03 | **Homologada e concluída** — baseline do Sistema CEO |
| [`cap-03/val-003-relatorio-consolidado.md`](cap-03/val-003-relatorio-consolidado.md) | Homologado — relatório VAL-003 |
| [`cap-03/oportunidades-evolucao-arquivadas.md`](cap-03/oportunidades-evolucao-arquivadas.md) | Consolidado — OE-001…003 (editoriais) |
| [`cap-03/relatorio-encerramento-cap-03.md`](cap-03/relatorio-encerramento-cap-03.md) | Relatório oficial de encerramento — CAP-03 concluída |
| [`learning/2026-07-26-encerramento-cap-03-coa.md`](learning/2026-07-26-encerramento-cap-03-coa.md) | Marco — encerramento do ciclo CAP-03 |
| [`product/README.md`](product/README.md) — Sede IPR-001 (Experiência e Desejabilidade) | F0–F6 concluídas; Ondas 01–03 homologadas |
| [`product/IPR-001-experiencia-do-produto.md`](product/IPR-001-experiencia-do-produto.md) | Documento-mestre; F6 + Onda 03 encerradas |
| [`product/marco-encerramento-f6.md`](product/marco-encerramento-f6.md) | Encerramento oficial F6 (28/07/2026) |
| [`product/marco-encerramento-onda-03.md`](product/marco-encerramento-onda-03.md) | Encerramento oficial Onda Operacional 03 (28/07/2026) |
| [`product/relatorio-final-onda-03.md`](product/relatorio-final-onda-03.md) | Relatório final Onda 03 — Fluxo Executivo Diário |
| [`learning/2026-07-28-encerramento-onda-03-fluxo-executivo-diario.md`](learning/2026-07-28-encerramento-onda-03-fluxo-executivo-diario.md) | Marco — encerramento Onda 03 |
| [`learning/2026-07-28-ciclo-validacao-operacional-pos-onda-03.md`](learning/2026-07-28-ciclo-validacao-operacional-pos-onda-03.md) | Deliberação — ciclo de validação operacional (sem Onda 04/F7) |
| [`product/estudo-nucleo-executivo-v0.md`](product/estudo-nucleo-executivo-v0.md) | Núcleo Executivo — estudo homologado v0 (28/07/2026) |
| [`learning/2026-07-28-homologacao-nucleo-executivo-v0.md`](learning/2026-07-28-homologacao-nucleo-executivo-v0.md) | Marco — Gate de homologação do Núcleo Executivo v0 |
| [`product/principios-de-produto.md`](product/principios-de-produto.md) | Homologado — princípios normativos de produto (Gate IPR-001) |
| [`product/design-system-roadmap.md`](product/design-system-roadmap.md) | Homologado — roadmap do design system (Gate IPR-001) |
| [`product/benchmark/f1-benchmark-estrategico.md`](product/benchmark/f1-benchmark-estrategico.md) | Gate F1 APROVADO — fichas nominadas em revisão |
| [`product/benchmark/fichas/README.md`](product/benchmark/fichas/README.md) | 3 fichas: Linear, Cursor, Notion |
| [`requirements/pacote-requisitos-ceo-mvp-v0-1.md`](requirements/pacote-requisitos-ceo-mvp-v0-1.md) | Homologado — pacote REQ-016…032 |
| [`requirements/REQ-016-painel-do-dia.md`](requirements/REQ-016-painel-do-dia.md) … [`REQ-032-respeito-ao-tempo-do-patrocinador.md`](requirements/REQ-032-respeito-ao-tempo-do-patrocinador.md) | Pacote MVP (ver pacote) |
| [`architecture/ARQ-008-arquitetura-funcional-ceo-mvp-v0-1.md`](architecture/ARQ-008-arquitetura-funcional-ceo-mvp-v0-1.md) | Homologada v1.0 — módulos A–G; Dia de Trabalho |
| [`implementation/IMP-005-plano-de-implementacao-ceo-mvp-v0-1.md`](implementation/IMP-005-plano-de-implementacao-ceo-mvp-v0-1.md) | Homologado v1.0 — **Implementação CONCLUÍDA e ENCERRADA (E1–E7)** |
| [`mvp/README.md`](mvp/README.md) — Sede operacional do Dia de Trabalho | Operacional — IMP-005 encerrado; Validação Operacional autorizada |
| [`validation/VAL-005-plano-de-validacao-operacional-ceo-mvp-v0-1.md`](validation/VAL-005-plano-de-validacao-operacional-ceo-mvp-v0-1.md) | Homologado v1.0 — Validação Operacional; calendário Dia 1=23/07 (Deliberação CTO) |
| [`mvp/validacao-diario.md`](mvp/validacao-diario.md) | Operacional — diário VAL-005; Dia 2 com relatório de sessão |
| [`mvp/val-005-relatorio-sessao-2026-07-24.md`](mvp/val-005-relatorio-sessao-2026-07-24.md) | Arquivado — evidências E-01…E-03; sem implementação na Validação |

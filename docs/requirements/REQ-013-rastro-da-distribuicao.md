# REQ-013 — Rastro da Distribuição

> **Status:** Aprovado
> **Versão:** 1.0 — 22/07/2026
> **Capacidade:** CAP-01 — Governança (Distribuição de Governança, Grupo D — ANL-004 §10; sequência oficial ADR-013, Decisão 2)

## Enunciado

O CEO deverá registrar todo ato de distribuição do pacote de governança (REQ-010) aos agentes alcançados pela obrigação de distribuição (REQ-011) de modo que o rastro preserve, no mínimo, o que foi distribuído, a quem, quando, em que versão e por qual autorização — aplicando os cinco campos da Memória Organizacional (CON-001, Art. 8º) ao ato de distribuir — e que esse histórico permaneça recuperável para comprovação organizacional.

## Tipo

Funcional; alto nível.

## Justificativa

Os Grupos A, B e C definiram o conteúdo do pacote, o alcance do vínculo e as propriedades da entrega e da propagação. Sem o rastro, a organização poderia cumprir formalmente essas obrigações e ainda assim ser incapaz de **comprovar** o que foi disponibilizado a cada agente, quando e sob qual vigência — exatamente a lacuna que a Memória Organizacional (CON-001, Art. 8º) existe para impedir, e que a ANL-004 (§3.1; §8 garantia 4; §10 Grupo D) atribuiu ao fechamento do ciclo da Distribuição. O REQ-012 já exige que cada entrega *identifique* versão e fonte (condição de verificabilidade da correspondência); este requisito eleva essa identificação ao **registro histórico recuperável** do ato. Responsabilidade única: **o rastro organizacional dos atos de distribuição**; composição, vínculo, entrega/propagação e auditoria ativa permanecem nos artefatos e capacidades que já os detêm.

## Critérios de aceitação

* **Abrangência do ato:** todo ato de **entrega** ou de **propagação** (nos termos do REQ-012) gera registro de rastro; nenhum ato de distribuição permanece sem registro. O rastro registra a ocorrência organizacional da distribuição, independentemente do mecanismo técnico utilizado para realizá-la.
* **Conteúdo mínimo do rastro:** cada registro identifica, no mínimo: (1) **o que** foi distribuído — o pacote ou o subconjunto autorizado, conforme a composição vigente (REQ-010); (2) **a quem** — o agente conectado alcançado (CNC-005; REQ-011); (3) **quando** — o momento organizacional do ato; (4) **em que versão** — a versão de cada elemento disponibilizado e a fonte canônica de proveniência (alinhado ao critério de versão identificada do REQ-012); (5) **autorizado por quê** — a base da obrigação (vínculo vigente e normas aplicáveis).
* **Memória Organizacional:** cada registro de rastro carrega os cinco campos exigidos pela CON-001 (Art. 8º) — quem, quando, por quê, baseado em quê e resultado — aplicados ao ato de distribuir (ANL-004 §8, garantia 4).
* **Recuperabilidade (não consulta):** o histórico dos atos de distribuição é recuperável: em qualquer instante é possível reconstruir, a partir dos rastros, o que foi distribuído a um agente alcançado, quando e em que versão. Recuperabilidade não implica requisitos de pesquisa, indexação, desempenho ou interface — esses pertencem a etapas posteriores, se deliberados.
* **Imutabilidade lógica e integridade:** uma vez registrado, o ato de distribuição integra permanentemente a memória organizacional, preservando sua integridade histórica. Registros de rastro não são alterados nem apagados para corrigir o passado; correções ou complementações produzem novos registros (padrão append-only já adotado no REQ-006).
* **Subordinação aos requisitos anteriores:** o rastro descreve atos regidos pelo REQ-010, REQ-011 e REQ-012; não redefine composição, vínculo, correspondência, propagação nem comportamento na indisponibilidade de fonte.
* **Independência de ferramenta:** a obrigação de registrar e recuperar o rastro não depende de fornecedor, ferramenta ou forma de acesso (CON-001, Art. 7º §2º).

## Fora do escopo

* **Composição do pacote de governança** — REQ-010 (Grupo A).
* **Vínculo de distribuição — início, vigência e cessação** — REQ-011 (Grupo B). (O rastro do *ato de estabelecimento ou encerramento do vínculo* já decorre do CNC-005 / decisão sob governança; este requisito cobre o rastro dos *atos de distribuição*.)
* **Entrega, propagação, correspondência de versão e indisponibilidade de fonte** — REQ-012 (Grupo C).
* **Auditoria ativa e detecção sistemática de divergência entre fontes canônicas e espelhos** — candidata à CAP-09.
* **Protocolos, armazenamento técnico, índices, arquitetura, implementação e tecnologia** — etapas posteriores do fluxo (ADR-006), observada a fronteira documental × técnica (ADR-013, Decisão 4).
* **Materialização do registro canônico de normas e demais requisitos da Frente 2** — ADR-013, Decisão 2.

## Dependências

* **REQ-010** — define o objeto cujo rastro registra a composição distribuída.
* **REQ-011** — define o destinatário identificado no rastro (agente alcançado).
* **REQ-012** — define os atos (entrega e propagação) e a identificação de versão que o rastro preserva historicamente.
* **CNC-005** — referência normativa do destinatário.
* **CON-001 (Art. 8º)** — cinco campos da Memória Organizacional.
* **ADR-013** — Decisão 2 (sequência S2) e Decisão 4 (fronteira de fase).
* **ANL-004** — §3.1, §8 (garantia 4) e §10 (Grupo D).

## Riscos e incertezas

* **Rastro especificado sem canal materializado:** até Arquitetura e Implementação, a obrigação é satisfazível no plano da especificação (e, quando deliberado, por implementação documental). Mitigação: ADR-013 D4 e o precedente do IMP-001; limitação declarada (CON-001, Art. 9º, princípio 8).
* **Confusão com o rastro do vínculo:** misturar registro de vínculo e registro de distribuição obscureceria duas naturezas de ato. Mitigação: fora do escopo explícito; este requisito cobre apenas atos de distribuição (entrega/propagação).
* **Deslizamento para auditoria (CAP-09):** “recuperabilidade” convida a exigir verificação ativa de divergência ou capacidades de consulta. Mitigação: o requisito exige reconstrução histórica do que foi registrado como distribuído — não institui detecção sistemática canônico × espelho nem pesquisa, indexação, desempenho ou interface.
* **Granularidade do “ato”:** se cada elemento do pacote ou cada agente gerar rastros excessivos, o volume pode comprometer a usabilidade. Mitigação: o requisito fixa o *conteúdo mínimo* e a abrangência (todo ato de entrega/propagação); a granularidade operacional é matéria de arquitetura posterior.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º, 8º; VIS-001 §5; ADR-013 v1.0 |
| Origem | ANL-004 v1.0 (§3.1, §8 garantia 4, §10 — Grupo D); ADR-013 (Decisão 2); deliberação da Governança — abertura do Gate do Grupo D (22/07/2026) |
| Dependências | REQ-010; REQ-011; REQ-012; CNC-005; CON-001 Art. 8º; ADR-013; ANL-004 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Criação, formalizando o rastro organizacional dos atos de distribuição (conteúdo mínimo, Memória Organizacional, recuperabilidade) | Autorização da Governança — abertura do Gate do Grupo D da Frente 1 | Aprovado pelo CTO com ajustes pontuais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Rastro como ocorrência organizacional (não comprovação técnica); recuperabilidade distinta de consulta; imutabilidade lógica explícita | Revisão técnica do CTO — precisão conceitual sem alteração de escopo | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Incorporação ao acervo normativo; Grupo D e Frente 1 — Distribuição de Governança concluídos | Homologação da Governança — encerramento da Frente 1 | **Aprovado — primeiro requisito do Grupo D; Frente 1 concluída** |

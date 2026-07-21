# Decisão Formal de Admissão — Conceito "Agente Conectado"

> **Status: Aprovado — v1.0 (homologado pelo CTO, 21/07/2026).**
> Versão 1.0 — 21/07/2026. Artefato decisório do fluxo regular de admissão (REQ-009) — **primeira decisão de admissão pós-migração**, sobre proposta elaborada pelo fluxo regular (não por regularização).
> Este documento registra a **decisão formal de admissão tomada pela alçada de governança competente**, nos termos do REQ-009.
> **Este artefato não registra o conceito, não emite identificador** (emissão ocorre exclusivamente no ato de registro — ARQ-003), **não altera conceitos existentes, não cria requisitos e não antecipa o ato de registro previsto no REQ-006** — a aprovação autoriza o registro, mas não o constitui.

---

## 1. Identificação da proposta analisada

| Campo | Conteúdo |
|-------|----------|
| Proposta | Proposta de Admissão — Conceito "Agente Conectado" (`docs/concepts/proposta-de-admissao-agente-conectado.md`) |
| Versão analisada | v0.1, com o ajuste semântico determinado na revisão técnica do CTO ("passa a estar sujeito"), **homologada pelo CTO em 21/07/2026** |
| Abertura do fluxo | Autorizada pela ADR-013, Decisão 3 |
| Termo proposto | Agente Conectado |
| Definição proposta | *Agente conectado* é todo agente — humano ou de inteligência artificial — que possui vínculo formal e vigente com o CEO, estabelecido e encerrado por decisão sob governança (CNC-001), pelo qual passa a estar sujeito às normas de governança vigentes da organização, independentemente da ferramenta pela qual atue. |

A proposta contém os três elementos mínimos exigidos pelo REQ-009 (termo, definição e justificativa da contribuição), verificados na revisão técnica e na homologação do CTO.

## 2. Avaliações obrigatórias (REQ-009)

Nenhuma aprovação ocorre sem estas duas avaliações registradas:

**(a) Contribuição para a interpretação consistente da organização.** O termo é empregado com força normativa pela CON-001 (Art. 7º §3º), pelo REQ-001 (enunciado e critérios), pela VIS-001 (§5) e pela CAP-001 (CAP-01), sem definição em nenhum documento (ANL-004 §5). Dele dependem: o alcance da obrigação central da distribuição (quem recebe o pacote de governança), os critérios de aceitação dos futuros REQs do Grupo B (ANL-004 §6.1; ADR-013, D3 — precedência vinculante desta admissão sobre o Grupo B) e a fronteira entre quem está sujeito às normas do CEO e quem é externo à organização. A contribuição está caracterizada.

**(b) Inexistência de conceito vigente com significado equivalente.** Consulta ao acervo vigente da autoridade semântica (índice oficial `docs/concepts/README.md`, resolução conforme REQ-008), realizada em 21/07/2026: o acervo contém exatamente quatro conceitos vigentes — CNC-001 (Decisão sob governança), CNC-002 (Item de conhecimento), CNC-003 (Contexto de Trabalho) e CNC-004 (Conceito organizacional). Nenhum deles define quem é participante vinculado à organização ou possui significado equivalente ao termo proposto. A inexistência de equivalência está verificada.

## 3. Fundamentação da decisão

1. A proposta cumpre integralmente os requisitos formais do REQ-009 e foi elaborada dentro dos limites determinados pela governança (sem decidir, registrar, emitir identificador ou antecipar o Grupo B).
2. As duas avaliações obrigatórias são positivas: contribuição caracterizada e equivalência inexistente (§2).
3. A admissão preserva a estabilidade da autoridade semântica (REQ-009, princípio 3): promove um termo que já opera com força normativa por convenção informal — exatamente a condição que o mecanismo existe para eliminar (ADR-007) — sem inflação conceitual nem duplicidade.
4. A promoção é plenamente rastreável (REQ-009, princípio 2): a cadeia autorizadora é ANL-004 §5 (constatação da lacuna) → ADR-013 D3 (autorização da abertura) → proposta homologada → esta decisão. Uma vez aprovada, **é este artefato que o registro do conceito referenciará como origem** (REQ-006, critério de origem rastreável).
5. A análise considerou exclusivamente os critérios organizacionais, independentemente da origem da proposta (REQ-009, princípio de impessoalidade).

## 4. Decisão e resultado explícito

> **Decisão da alçada competente: APROVAÇÃO da admissão do conceito "Agente Conectado"**, com a definição exata fixada no §1, autorizando — sem constituir — o seu registro na autoridade semântica conforme o REQ-006.

* Alçada decisória: a definida pela governança vigente (REQ-009 não redefine alçadas; precedente organizacional: CTO, com aval do Usuário).
* O registro do conceito e a emissão do identificador ocorrerão em ato posterior e distinto, conforme o REQ-006 e a ARQ-003.
* Nos termos do REQ-009, a deliberação produziu resultado explícito — **aprovação** — e nenhum estado indefinido persiste.

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) preparou a decisão; alçada decisória: CTO, com aval do Usuário (conforme governança vigente e precedente do gate E2/E3 da migração) |
| Quando | 21/07/2026 |
| Por quê | Concluir a etapa decisória do fluxo regular de admissão (REQ-009) para o conceito "Agente Conectado", pré-condição do Grupo B da Distribuição de Governança (ADR-013, D3) |
| Baseado em quê | REQ-009 (critérios da decisão: duas avaliações obrigatórias, rastreabilidade, resultado explícito); proposta de admissão homologada pelo CTO (21/07/2026); ANL-004 §5; ADR-013 D3; consulta ao acervo vigente (CNC-001 a CNC-004) via índice oficial, conforme REQ-008 |
| Resultado | **A admissão foi aprovada pela alçada competente, autorizando o registro do conceito conforme o REQ-006.** |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Preparação da decisão formal de admissão, com as duas avaliações obrigatórias registradas | Homologação da proposta pelo CTO e determinação de elaborar o artefato decisório (21/07/2026) | Aprovado com ajustes de redação |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou os ajustes | Moldura decisória ajustada (decisão da alçada, não proposta) e harmonização editorial do cabeçalho e do §4 | Revisão do CTO — o documento registra decisão já tomada pela alçada competente | **Homologado — admissão aprovada; registro do conceito autorizado (REQ-006)** |

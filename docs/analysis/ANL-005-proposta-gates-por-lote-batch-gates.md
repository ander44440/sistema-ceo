# ANL-005 — Análise e proposta de Gates por lote (Batch Gates)

> **Status: Homologada — v1.0 (Governança, 22/07/2026). Análise organizacional concluída.**
> Versão 1.0 — 22/07/2026. Tipo ANL (ADR-005) — preparatório, **não normativo**.
> Norma superior consultada (somente leitura): CON-001; ADR-006 v1.0; ADR-012; experiência IMP-001 / IMP-002 / IMP-003.
> **Este documento não altera a ADR-006, não cria requisitos, não atualiza processo oficial e não vincula a organização.** Suas conclusões integram o histórico organizacional e podem referenciar futuros processos normativos.
> Origem: autorização da Governança — proposta de evolução da governança pós-IMP-003 (22/07/2026).
> **Efeito:** ADR-006 permanece integralmente vigente. Batch Gates aguardam processo normativo futuro (ADR-006), quando oportuno.

---

## 1. Motivação

O fluxo da ADR-006 converteu experiência em norma: cada etapa do ciclo (ANL → ADR → REQ → Arquitetura → Implementação → Validação) é um **gate de governança** — a etapa seguinte só se inicia após aprovação da anterior. Esse rigor preservou rastreabilidade e impediu artefatos órfãos.

Na prática recente, porém, o mesmo espírito de “um gate por unidade de trabalho” foi aplicado também **dentro** da etapa de Implementação (planos IMP com E1…En), gerando um ciclo completo de redação → revisão do CTO → deliberação da Governança → commit/push **por cada microetapa**.

O IMP-002 (E1–E5) e o IMP-003 (E1–E5, com E6 consolidada na E5) demonstraram que o modelo é **repetível e seguro** — e, ao mesmo tempo, que o **custo de ciclo** cresce linearmente com o número de microetapas, mesmo quando o risco material de várias delas é baixo e homogêneo (estrutura vazia, snapshot só-leitura, rastro vazio).

A proposta de **Batch Gates** (Gates por lote) busca reduzir a quantidade de ciclos de revisão **sem reduzir o rigor institucional**: manter aprovação explícita da alçada, rastreabilidade e vedação a efeitos permanentes indevidos, permitindo agrupar microetapas elegíveis em um único ato deliberativo.

---

## 2. Problema atual

### 2.1 O que a ADR-006 estabelece (leitura fiel)

| Elemento | Conteúdo vigente |
|----------|------------------|
| Fluxo macro | ANL → ADR (condicional) → REQ → Arquitetura → Implementação → Validação |
| Natureza das etapas | **Cada etapa constitui um gate de governança** |
| Regra de progressão | A etapa só autoriza a seguinte após aprovação da alçada; trabalho posterior antes da abertura do gate é **não oficial** |
| Exceções | Correções editoriais (com histórico); emergência (só Usuário); REQs derivados em agrupamento já analisado (sem nova ANL) |
| Consequência | Artefato fora do fluxo não fundamenta a etapa seguinte; violação gera Memória Organizacional |

A ADR-006 **não** detalha a decomposição interna da Implementação (isso cabe ao IMP — ADR-012). Também **não** proíbe explicitamente lotes internos — mas a prática operacional adotou gate individual por microetapa IMP, por analogia ao princípio “nada permanente sem gate”.

### 2.2 Dois níveis de Gate (distinção analítica)

| Nível | Onde vive | Exemplos | Situação hoje |
|-------|-----------|----------|---------------|
| **L0 — Macro (ADR-006)** | Etapas do fluxo oficial | ANL→REQ; REQ→ARQ; ARQ→IMP; IMP→Validação | Gate individual **obrigatório** pela norma |
| **L1 — Micro (IMP)** | Etapas E1…En do plano de implementação | IMP-003 E1 estrutura; E2 deliberação; E3 snapshot… | Gate individual **por prática** — maior fonte de custo recente |

O problema de fricção concentra-se em **L1**. Qualquer Batch Gate deve **preservar L0 intacto** na proposta inicial, salvo deliberação futura explícita (fora do escopo mínimo desta análise).

### 2.3 Sintoma observado

Para um IMP com N microetapas de baixo risco correlacionado, o custo institucional aproxima-se de:

> N × (redação + revisão CTO + deliberação Governança + publicação)

mesmo quando várias microetapas:

* não alteram fontes canônicas;
* não criam obrigações novas;
* são idempotentes e facilmente reversíveis (artefatos estruturais vazios);
* dependem apenas da homologação da anterior de forma sequencial trivial.

Isso tensiona o princípio 1 da CON-001 (respeito ao tempo) **sem** ganho proporcional de segurança em todos os casos.

---

## 3. Benefícios esperados

| Benefício | Descrição |
|-----------|-----------|
| Menos ciclos | Menor número de idas e voltas CTO ↔ Governança por domínio de implementação documental |
| Rigor preservado | Lotes só sob critérios objetivos; etapas de alto risco continuam com Gate individual |
| Rastreabilidade | Um ato deliberativo do lote registra o conjunto, com checklist por microetapa |
| Previsibilidade | Critérios explícitos evitam agrupamento oportunista ou informal |
| Aprendizado | Segundo domínio (IMP-003) consolidou o padrão; Batch Gates seria a evolução metodológica da ADR-006 **sem** afrouxar L0 |

---

## 4. Etapas que exigem Gate individual (proposta)

### 4.1 Nível L0 — Macro (ADR-006) — **sempre individuais**

Estas transições **não** devem ser agrupadas em Batch Gate na proposta v0.1:

| Gate individual | Motivo |
|-----------------|--------|
| Homologação / aprovação de **ANL** | Define escopo e ordem; erro propaga-se a todo o ciclo |
| Homologação de **ADR estrutural** (quando existir) | Torna vinculante o que era análise |
| Aprovação de cada **REQ** (ou política explícita futura de lote de REQs — ver §6; default = individual) | Norma verificável; impacto em arquitetura e aceitação |
| Homologação de **Arquitetura (ARQ)** | Decide organização lógica; fundamento da implementação |
| Abertura / homologação do **plano IMP** (o IMP em si) | Autoriza a execução; define E1…En |
| **Validação** do ciclo | Encerra capacidade com evidências; não misturar com implementação |

### 4.2 Nível L1 — Micro (IMP) — **sempre individuais** quando

Uma microetapa IMP **deve** ter Gate próprio se **qualquer** condição abaixo for verdadeira:

| ID | Critério de Gate individual (L1) |
|----|----------------------------------|
| G1 | **Risco alto:** pode alterar fontes canônicas, criar/encerrar vínculos, registrar atos com efeito organizacional, ou reinterpretar arquitetura/requisitos |
| G2 | **Impacto arquitetural:** introduz ou altera decisão de estrutura lógica (não apenas materializa o já decidido) |
| G3 | **Deliberação substantiva:** o conteúdo do ato **é** a decisão (ex.: universo normativo; alcance inicial; inclusão/exclusão) — não apenas execução mecânica de plano já homologado |
| G4 | **Irreversibilidade prática:** desfazer exigiria emenda normativa, apagamento de histórico vinculante ou reconstituição custosa de estado |
| G5 | **Dependência externa não resolvida:** depende de fonte ou deliberação ainda não homologada |
| G6 | **Volume / heterogeneidade:** muitos artefatos de naturezas distintas no mesmo passo, impedindo checklist homogêneo |

Exemplos típicos de Gate individual L1: E2 do IMP-002 (universo normativo); E2 do IMP-003 (estado de vínculos); qualquer etapa que popule índices com efeitos de vigência; encerramento institucional quando declarar conclusão de ciclo (pode ser individual ou lote final — ver §5).

---

## 5. Critérios para Gates por lote (Batch Gates)

### 5.1 Definição proposta

**Batch Gate (Lote):** um único ato de revisão do CTO e um único ato de deliberação da Governança que homologa **um conjunto ordenado** de microetapas L1 previamente declaradas no IMP (ou em aditamento do plano), desde que todas sejam **elegíveis** e a progressão interna do lote respeite dependências.

### 5.2 Elegibilidade (todas devem ser verdadeiras)

| ID | Critério de elegibilidade ao lote |
|----|-----------------------------------|
| B1 | **Baixo risco:** não altera fontes canônicas; não cria obrigações novas além do já especificado; não introduz mecanismo técnico |
| B2 | **Baixo impacto arquitetural:** apenas materializa decisões já homologadas (ARQ/IMP/REQ) |
| B3 | **Quantidade limitada:** sugerido **2 a 4** microetapas por lote (acima disso, preferir Gate individual ou dois lotes) |
| B4 | **Dependências lineares e locais:** cada Ei depende apenas de Ei−1 já no mesmo lote ou já homologada; sem ramificações externas |
| B5 | **Reversibilidade:** falha no lote permite rejeitar o conjunto sem efeitos colaterais fora de `docs/<domínio>/` (ou equivalente documental); idempotência observável |
| B6 | **Homogeneidade:** mesmas natureza e alçada (ex.: só estruturação documental; ou só verificação + encerramento institucional) |
| B7 | **Declaração prévia:** o lote está nomeado no IMP homologado (ou autorizado por deliberação de abertura), com produtos e critérios de cada Ei |
| B8 | **Sem surpresa deliberativa:** nenhuma Ei do lote exige escolha de mérito ainda não feita pela Governança |

### 5.3 Regras de operação do lote

1. **Produção:** o Engenheiro materializa **todas** as microetapas do lote antes da revisão (ou em pacote único revisável).
2. **Revisão CTO:** um parecer cobre o lote; pode exigir ajuste em Ei sem invalidar Ej se o critério de separabilidade for atendido — default seguro: **rejeição/ajuste do lote inteiro** se houver dependência sequencial.
3. **Deliberação:** um ato homologa o lote; o registro lista cada Ei com resultado.
4. **Efeitos permanentes:** somente após homologação do lote; até lá, artefatos permanecem não oficiais (ADR-006).
5. **Publicação:** um commit/push (ou sequência atômica acordada) após homologação.
6. **Falha parcial:** se uma Ei do lote falhar na verificação interna, o lote **não** homologa as posteriores dependentes; preferência por não homologar nenhuma até correção.

### 5.4 Matriz resumida: individual vs lote

| Fator | Gate individual | Batch Gate |
|-------|-----------------|------------|
| Risco | Alto ou deliberativo | Baixo (B1) |
| Impacto arquitetural | Sim (G2) | Não (B2) |
| Artefatos | Qualquer | Poucos, homogêneos (B3, B6) |
| Dependências | Complexas / externas (G5) | Lineares locais (B4) |
| Reversão | Difícil (G4) | Fácil (B5) |
| Exemplos | REQ; ARQ; E2 deliberativo | E1 estrutura + índice vazio; E4 rastro vazio + apontamentos |

---

## 6. Exemplos práticos de aplicação

### 6.1 Retrospectiva — IMP-003 (como *poderia* ter sido, hipotético)

| Microetapa | Natureza | Classificação sob esta proposta |
|------------|----------|----------------------------------|
| E1 Estrutura `docs/distribution/` | Materialização mecânica | **Elegível a lote** |
| E2 Alcance inicial (deliberação) | Decisão de mérito | **Gate individual** (G3) |
| E3 Snapshot do pacote | Leitura + projeção; alto volume, mas mecânico pós-fontes | **Elegível a lote** (com checklist quantitativo) *ou* individual se quiser isolamento de auditoria |
| E4 Rastro vazio | Estrutura sem eventos | **Elegível a lote** |
| E5 Verificação + encerramento | Verificação + ato institucional | **Lote final natural** (já consolidado na prática) |

**Lotes hipotéticos:**

* **Lote A:** {E1} isolado *ou* {E1} após IMP — frequentemente o primeiro passo permanece individual por ser a “abertura física” do domínio.
* **Gate individual:** E2 (deliberação de alcance).
* **Lote B:** {E3, E4} — composição snapshot + estrutura de rastro vazia (ambos só-leitura / infraestrutura; B1–B8).
* **Lote C / Gate final:** {E5 verificação + encerramento} — como já ocorreu por deliberação.

Isso teria reduzido ciclos sem enfraquecer o Gate deliberativo E2.

### 6.2 Retrospectiva — IMP-002 (hipotético)

| Microetapa | Classificação |
|------------|---------------|
| E1 Estrutura `docs/norms/` | Elegível a lote / ou individual de abertura |
| E2 Universo normativo | **Gate individual** (deliberação G3) |
| E3 População do índice (29 entradas) | Gate individual *recomendado* (volume + efeito de estado de vigência — G1/G4 atenuado mas impacto de estado) |
| E4 Verificação | Elegível a lote com E5 |
| E5 Encerramento | Lote final com E4 |

### 6.3 O que **não** agrupar (exemplos negativos)

* ANL + primeiro REQ  
* REQ + Arquitetura  
* Arquitetura + início da Implementação  
* E2 deliberativo + E3 população com efeitos de vigência  
* Qualquer microetapa técnica futura (protocolos, sync) com etapas documentais  

### 6.4 REQs em lote (opcional, fase 2 da proposta)

A ADR-006 hoje implica gate por etapa macro; REQs já são “um agrupamento por vez”. Um **Batch Gate de REQs** do mesmo agrupamento ANL (vários REQs redigidos e revisados juntos) poderia ser fase 2, **somente se**:

* todos pertencem ao mesmo grupo da ANL;
* não há dependência de conceito/ADR ainda pendente;
* o CTO emitir parecer único com resultado por REQ.

**Fora do escopo da v0.1 operacional** — registrado como extensão possível.

---

## 7. Impactos na ADR-006

Esta ANL **não modifica** a ADR-006. Caso a Governança venha a acolher a proposta, os impactos *candidatos* a uma futura ADR (emenda ou ADR complementar) seriam:

| Impacto | Descrição |
|---------|-----------|
| Esclarecimento de níveis | Distinguir Gates L0 (fluxo) de Gates L1 (microetapas IMP) |
| Autorização condicional de lotes | Definir Batch Gate como modalidade **permitida** em L1 quando B1–B8 |
| Preservação do princípio | Manter: nenhum efeito permanente sem aprovação da alçada — o lote **é** essa aprovação |
| IMP (ADR-012) | Planos IMP passariam a declarar lotes elegíveis na decomposição E1…En |
| Catálogo / vocabulário | Termo “Batch Gate” / “Gate por lote” no vocabulário de status, se deliberado |
| Não retroatividade | IMP já encerrados (IMP-001…003) não se reprocessam |

**O que a ADR-006 já cobre e permaneceria:** fluxo L0; artefato fora do fluxo = não oficial; exceções (editorial, emergência); Memória Organizacional em violações.

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Agrupamento oportunista (“lote” para acelerar deliberação de mérito) | B8 + G3: deliberação substantiva = Gate individual obrigatório |
| Parecer CTO superficial sobre o lote | Checklist obrigatório por Ei no parecer; veto a Ei falha o lote |
| Homologação com efeito permanente parcial ambíguo | Regra: lote inteiro ou nada (salvo separabilidade explícita pré-declarada) |
| Enfraquecimento percebido do rigor | L0 intocável; comunicar que o lote **é** gate, não bypass |
| Lotes grandes demais | B3: limite sugerido 2–4; volume alto (ex.: 29 entradas) favorece Gate individual |
| Conflito com IMP já homologados | Não retroatividade; Batch Gates só em IMPs futuros ou aditamentos deliberados |
| Confusão L0 × L1 | Vocabulário explícito em futura ADR; exemplos na ANL |
| Reversão difícil após push | Publicação só pós-homologação do lote (já prática atual) |

---

## 9. Questões a submeter à governança (sem decidir)

1. Adotar a distinção L0 / L1 formalmente?  
2. Autorizar Batch Gates em L1 sob B1–B8?  
3. Exigir declaração de lotes no IMP (ADR-012) como condição?  
4. Tratar verificação + encerramento como lote final padrão?  
5. Fase 2: Batch Gate de REQs do mesmo agrupamento ANL?  
6. Instrumento normativo: emenda à ADR-006, ADR complementar, ou ambos?

---

## 10. Conclusão

A ADR-006 continua adequada no **nível macro**. O custo excessivo recente veio da aplicação uniforme de Gate individual a **todas** as microetapas IMP, inclusive as de baixo risco e alta reversibilidade.

**Batch Gates** propõem-se como modalidade disciplinada de Gate L1: mesmo rigor de alçada e rastreabilidade; menos ciclos quando os critérios objetivos forem atendidos; Gate individual obrigatório quando houver deliberação de mérito, risco alto ou irreversibilidade.

Nenhuma norma foi alterada por esta análise. A Governança homologou o ANL-005 como documento de análise (22/07/2026) e autorizou, **em momento oportuno**, a abertura de processo normativo específico para eventual institucionalização dos Batch Gates — pelo fluxo ADR-006, com ADR-006 vigente até lá.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior (leitura) | CON-001 Art. 5º §2º, 8º, 9º (princípio 1); ADR-006; ADR-012 |
| Experiência | IMP-001; IMP-002 (E1–E5); IMP-003 (E1–E5, E6 consolidada) |
| Origem | Proposta de evolução da governança — pós-encerramento IMP-003 (22/07/2026) |
| Não gera (por si) | Emenda à ADR-006; REQ; alteração automática de processo |
| Encaminhamento | Processo normativo futuro autorizado “em momento oportuno” (Governança, 22/07/2026) |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Rascunho: motivação, L0/L1, critérios G/B, exemplos IMP-002/003, impactos e riscos | Autorização da Governança — proposta Batch Gates | Em revisão técnica do CTO |
| 0.1 | 22/07/2026 | CTO | Revisão técnica — sem ajustes obrigatórios; L0/L1 e B1–B8 adequados; ADR-006 intacta | Conformidade ADR-006; experiência IMP-002/003 | Aprovado — encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Análise organizacional concluída; Batch Gates registrados para evolução normativa futura; ADR-006 intacta | Deliberação — natureza exclusivamente analítica | **Homologada — processo normativo futuro autorizado em momento oportuno** |

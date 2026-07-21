# ANL-004 — Análise da Distribuição de Governança

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026, homologada pelo CTO após revisão com três ajustes incorporados. Tipo ANL (ADR-005).
> Norma superior: CON-001 v1.0 (Art. 7º §3º); REQ-001; REQ-002 v1.0; ADR-008 v1.0 (D5); ADR-009 v1.0 (D7).
> Documento preparatório, não normativo: não cria requisitos, não decide arquitetura, não define implementação. Prepara as decisões que serão submetidas à governança pelo fluxo oficial (ADR-006).
> Abertura autorizada pelo CTO em 21/07/2026, com dois ajustes metodológicos incorporados (objetivo e formulação da investigação de dependências). A classificação organizacional da Distribuição — responsabilidade da CAP-01, Governança — foi deliberada pelo CTO em 21/07/2026 e **não é objeto desta análise**.

---

## 1. Objetivo e método

**Compreender o problema organizacional da Distribuição de Governança, delimitando seu domínio, suas dependências, suas fronteiras e as decisões que deverão ser submetidas posteriormente à governança.**

Método: o problema é caracterizado a partir das normas aprovadas que o mencionam (§2); o domínio e as fronteiras são delimitados por confronto com as responsabilidades já atribuídas a outros mecanismos e capacidades (§3); a composição do pacote (§4) e os destinatários (§5) são examinados como elementos do domínio; as dependências organizacionais são identificadas em nível geral e avaliadas quanto ao impacto na sequência do ciclo (§6); a fronteira entre especificação documental e implementação técnica é analisada à luz da fase vigente (§7); as garantias exigíveis do canal são enumeradas como insumo dos futuros requisitos (§8); os riscos (§9) e a proposta de agrupamentos e ordem (§10) fecham a análise. A conclusão (§11) lista as questões a submeter à governança — sem decidi-las.

**Distinção de vocabulário adotada nesta análise:** o acervo usa "distribuir" em dois sentidos. *Distribuição de tarefas* (CON-001 Art. 2º §2º; CAP-02; CAP-08) é ato de coordenação do trabalho. *Distribuição de governança* (REQ-001; CON-001 Art. 7º §3º) é fazer o conteúdo normativo vigente chegar a qualquer agente conectado. Esta análise trata exclusivamente do segundo sentido; nenhuma conclusão aqui se aplica à distribuição de tarefas.

## 2. O problema organizacional

### 2.1 O que a norma exige

A cadeia normativa é direta: a Constituição exige "mecanismo próprio para distribuir e manter sua Constituição e suas regras de governança para qualquer agente conectado" (CON-001, Art. 7º §3º); a Visão inclui *distribuir* entre os três verbos do escopo de governar (VIS-001 §5); o REQ-001 enuncia o requisito de alto nível com quatro critérios: recepção por qualquer agente conectado, independência de ferramenta, propagação consistente de atualizações e correspondência entre a versão distribuída e a versão vigente no registro canônico.

### 2.2 O que existe hoje

* **Nenhum mecanismo oficial de distribuição.** O único artefato que hoje leva normas a um agente é o espelho `.cursor/rules/projeto-ceo.mdc` — classificado pelo próprio REQ-001 como temporário, subordinado e dependente de ferramenta: exatamente o que o requisito veio eliminar.
* **Fontes em estados desiguais.** O conteúdo de governança vive em três acervos: a Constituição (documento único, aprovado), as normas (documentos aprovados sob o catálogo, **sem** o registro canônico estruturado que o REQ-002 especifica) e os conceitos organizacionais (registro operacional completo — `docs/concepts/`, com índice, resolução e identificadores `CNC-nnn`).
* **Pré-condição da migração satisfeita.** A ADR-009 (D7) condicionava a integração à conclusão da migração dos conceitos; a condição foi cumprida em 21/07/2026 (IMP-001 homologado).

### 2.3 O problema, em uma frase

A organização possui conteúdo de governança vigente e agentes que devem obedecê-lo, mas **nenhum caminho oficial, independente de ferramenta e com garantia de versão, entre um e outro** — e as fontes desse conteúdo estão em graus diferentes de maturidade, o que condiciona a ordem do que pode ser distribuído primeiro (§6).

## 3. Domínio e fronteiras

### 3.1 Pertence ao domínio da Distribuição de Governança

* Fazer o **pacote de governança** (§4) chegar a qualquer agente conectado (§5).
* Garantir que o que chega corresponde à **versão vigente** nas fontes canônicas.
* **Propagar atualizações** de forma consistente — nenhum agente permanece indefinidamente com conteúdo substituído sem que isso seja detectável.
* Manter **rastro da distribuição**: o que foi distribuído, a quem, quando e em que versão (aplicação dos cinco campos da Memória Organizacional ao ato de distribuir).

### 3.2 Não pertence ao domínio

| Item | Pertence a | Evidência |
|------|-----------|-----------|
| Registrar e versionar normas | Registro canônico (REQ-002) | REQ-002 (enunciado); fronteira "fonte × canal" (ADR-008, D5) |
| Registrar e evoluir conceitos | Mecanismo de conceitos (REQ-006/REQ-007) | ADR-008 D5: o mecanismo é fonte, o REQ-001 é canal |
| Resolver a norma ou o conceito vigente | REQ-003 / REQ-008 | A resolução determina *o que* está vigente; a distribuição *entrega* o vigente |
| Verificar se agentes obedecem ao que receberam | CAP-10 (Segurança) / futura conformidade | REQ-002 e REQ-003, "fora do escopo" |
| Detectar divergência entre canônico e espelhos | Candidata à CAP-09 (Observabilidade) | REQ-002, REQ-007, REQ-008 (registro reiterado) |
| Coordenar o trabalho dos agentes | CAP-02 | Distinção de vocabulário (§1) |
| Conectar tecnicamente agentes e ferramentas | CAP-11 (Integrações) | CAP-11 exclui "distribuir regras (CAP-01)" do próprio escopo — e, simetricamente, a conexão técnica não é matéria da distribuição |

**Fronteira estrutural herdada (ADR-008, D5):** a separação fonte × canal já é decisão aprovada. As fontes permanecem donas do conteúdo, da vigência e da resolução; o canal responde pela entrega, pela correspondência de versão e pela propagação. Esta análise a assume como dada.

## 4. Composição do pacote de governança

O que se distribui, segundo o acervo:

| Conteúdo | Amparo | Situação do amparo |
|----------|--------|--------------------|
| Constituição (CON-001) | REQ-001 (enunciado); CON-001 Art. 7º §3º | **Normativo** — inequívoco |
| Normas de governança vigentes | REQ-001 (enunciado: "suas regras de governança") | **Normativo** — inequívoco |
| Conceitos organizacionais | ADR-007 §5; ADR-008 D5; ANL-002 §3 | **Arquitetural e preparatório** — a ANL-003 (§6) registrou que o gate da integração deverá formalizá-lo em nível de requisito |

Constatação: a inclusão dos conceitos no pacote é coerente em todo o acervo (um agente que não compartilha o vocabulário não pode obedecer às normas que o usam — ADR-007 §5), mas **ainda não tem enunciado de requisito que a exija**. A necessidade de formalização em nível de requisito deverá ser submetida à deliberação da governança, considerando as evidências apresentadas nesta análise (§11.1). Esta análise não identificou nenhum outro conteúdo candidato ao pacote no estado atual do acervo: conhecimento (CAP-04), memória (CAP-05) e competências (CAP-06) permanecem fora, por ausência de norma que os inclua e pela deliberação do CTO sobre a natureza da Distribuição (21/07/2026).

## 5. Destinatários — "agente conectado"

O termo que delimita os destinatários — usado pelo REQ-001, pela CON-001 (Art. 7º §3º), pela CAP-001 e pela VIS-001 — **não possui definição oficial em nenhum documento**. É a mesma categoria de problema que motivou o mecanismo de conceitos: um termo com força normativa (os critérios de aceitação dos futuros REQs dependerão dele) sem fonte canônica de significado.

Elementos que a definição precisará delimitar (levantamento, não proposta de definição):

* o que caracteriza *estar conectado* — vínculo formal com o sistema, não um estado técnico de sessão;
* se humanos participantes são "agentes conectados" para fins de distribuição ou apenas as IAs (a CON-001, Art. 6º, distingue papéis; o REQ-001 fala genericamente em "qualquer agente");
* o ciclo do vínculo — quando um agente passa a receber o pacote e quando deixa de recebê-lo.

Encaminhamento natural (a decidir pela governança): promoção de "agente conectado" a conceito organizacional pela via oficial — admissão (REQ-009) e registro (REQ-006) — **antes** de os REQs da distribuição o utilizarem em critérios de aceitação. Seria a primeira admissão pós-migração, exercitando o mecanismo recém-implementado no seu fluxo regular.

## 6. Dependências organizacionais e impactos na sequência do ciclo

Investigação em nível geral, conforme a determinação de abertura: quais dependências organizacionais a Distribuição de Governança possui, e como elas condicionam a sequência futura.

### 6.1 Dependências identificadas

**D1 — Fontes canônicas resolúveis para todo conteúdo do pacote.** O canal só distribui com garantia de versão aquilo que uma fonte canônica mantém com vigência resolúvel (REQ-001, critério 4). Estado por conteúdo:

| Conteúdo | Fonte exigida | Estado da fonte |
|----------|---------------|-----------------|
| Constituição | Documento canônico único | **Satisfeita** — CON-001 aprovada, versionada, sob o catálogo |
| Conceitos | Autoridade semântica (REQ-006/ARQ-001) | **Satisfeita** — registro operacional, índice oficial, resolução especificada (REQ-008) |
| Normas | Registro canônico (REQ-002) | **Insatisfeita no plano material** — o REQ-002 está aprovado como requisito, mas nunca percorreu Arquitetura nem Implementação; o papel é cumprido informalmente pela árvore `/docs` + catálogo |

A dependência insatisfeita emergiu naturalmente da análise, como previsto na abertura: é a materialização do registro canônico de normas. Pela definição analítica firmada na ANL-003 (Lacuna Arquitetural Bloqueante: ausência de decisão arquitetural que impede o início seguro da implementação), esta pendência **tem perfil de bloqueio para a parcela de normas do pacote** — não para a análise nem para os requisitos da distribuição, e não para as parcelas cuja fonte está pronta.

**D2 — Vocabulário oficial dos destinatários.** A definição de "agente conectado" (§5) é pré-condição para que os critérios de aceitação dos futuros REQs sejam objetivos. Estado: insatisfeita; caminho oficial existente e operacional (REQ-009 → REQ-006).

**D3 — Resolução da vigência nas fontes.** A distribuição entrega o que a resolução determina como vigente. Estado: especificada em nível de requisito para normas (REQ-003) e conceitos (REQ-008); materializada apenas para conceitos. Acompanha o estado de D1 — não é dependência adicional, mas herda a mesma assimetria.

**D4 — Identificação de elementos próprios da distribuição** (se os futuros REQs exigirem individualizar pacotes, versões distribuídas ou vínculos de agentes). Estado: **fundamento pronto** — a arquitetura geral de identificação (ARQ-002) permite criar espaços novos sem alterar os existentes; nenhuma providência antecipada é necessária.

**D5 — Detecção de divergência entre canônico e espelhos** (candidata à CAP-09). Estado: deliberadamente adiada em três registros (REQ-002, REQ-007, REQ-008). **Não bloqueante** — a distribuição pode nascer sem a auditoria correspondente, mas o risco de operar canal sem detecção de divergência deve permanecer declarado (§9.4).

### 6.2 Impactos sobre a sequência do ciclo

> **Observação metodológica:** as sequências apresentadas representam alternativas organizacionais plausíveis identificadas durante a análise. A presente ANL não estabelece preferência entre elas.

As dependências D1 (parcela de normas) e D2 condicionam a ordem. Três sequências possíveis, com consequências mapeadas — **a escolha é decisão de governança, não desta análise**:

| Sequência | Descrição | Consequências principais |
|-----------|-----------|--------------------------|
| S1 — Fonte antes do canal | Arquitetar e materializar o registro canônico de normas (REQ-002) antes dos REQs da distribuição | Canal nasce com todas as fontes prontas; ciclo da distribuição adiado por um ciclo inteiro de outra frente; repete a lição "construir a fonte antes do canal" já paga no primeiro ciclo |
| S2 — Frentes paralelas | REQs da distribuição e materialização do REQ-002 correm em paralelo, com gate de implementação do canal condicionado à prontidão das fontes | Menor tempo total; exige disciplina de sincronização entre frentes — a implementação do canal não inicia sem as fontes que atender; primeiro caso de paralelismo entre frentes na organização |
| S3 — Distribuição escopada por fonte | REQs e implementação da distribuição limitados às fontes prontas (Constituição + conceitos); normas ingressam no pacote quando o registro do REQ-002 existir | Entrega valor mais cedo com fontes maduras; cria estado intermediário oficial ("pacote parcial") que precisa de disciplina própria de conclusão — análogo controlado do regime transitório da ADR-007, com critério de extinção definido desde o início |

Em qualquer sequência, D2 (definição de "agente conectado") precede os REQs que a utilizarem — é curta, tem via pronta e não conflita com nenhuma das três opções.

## 7. Fronteira entre especificação documental e implementação técnica

A distribuição é o primeiro mecanismo do CEO cuja natureza aponta para fora da árvore documental: envolve agentes heterogêneos e, no limite, ferramentas externas. A regra da Fase 1 (nenhuma linha de código sem requisito aprovado e arquitetura decidida) e a neutralidade tecnológica exigem delimitar desde já:

* **Especificável e implementável documentalmente:** a composição do pacote, as fontes e sua precedência, o vínculo dos destinatários, as garantias de versão e o rastro da distribuição — tudo isso pode existir como estrutura lógica sob `/docs`, no padrão do que foi feito para os conceitos (IMP-001 demonstrou a viabilidade de implementação documental completa).
* **Dependente de implementação técnica futura:** a entrega automática a agentes em ferramentas externas, a propagação ativa de atualizações e qualquer resolução técnica em tempo de uso. Esses elementos devem ser **especificados** (requisitos e arquitetura) na fase atual, com implementação técnica explicitamente remetida a fase futura — nunca improvisada dentro do ciclo documental.

O espelho `.cursor/rules/projeto-ceo.mdc` permanece regime provisório até que o mecanismo o substitua ou o subordine formalmente; o destino do espelho é matéria dos futuros REQs, não desta análise.

## 8. Garantias exigíveis do canal (insumo para os futuros REQs)

Propriedades que os requisitos da distribuição deverão considerar exigir — enumeradas sem redação de requisito:

1. **Correspondência de versão:** o conteúdo distribuído corresponde à versão vigente na fonte canônica no momento da distribuição (já exigida pelo REQ-001, critério 4).
2. **Completude do pacote:** nenhum agente conectado recebe subconjunto não autorizado do pacote — o que compõe o pacote é decisão de governança, não escolha do canal ou do agente.
3. **Propagação consistente:** atualização vigente alcança todos os agentes conectados; nenhum agente permanece indefinidamente com versão substituída sem detecção possível.
4. **Rastreabilidade do ato:** cada distribuição registrável com os cinco campos da Memória Organizacional (o que, a quem, quando, em que versão, autorizado por quê).
5. **Independência de ferramenta:** nenhuma garantia pode depender de recurso específico de uma ferramenta de agente (REQ-001, critério 2; CON-001 Art. 7º §2º).
6. **Subordinação dos espelhos:** todo artefato derivado da distribuição é espelho subordinado; em divergência, prevalece a fonte canônica (padrão do REQ-002, estendido ao canal).

## 9. Riscos

1. **Escopo deslizante:** a distribuição toca registro, resolução, conformidade e observabilidade; sem as fronteiras do §3, os REQs do grupo tenderiam a absorver responsabilidades alheias. Mitigação: fronteiras confrontadas com documentos aprovados; futuros REQs com "fora do escopo" explícito (padrão consolidado).
2. **Antecipação de arquitetura:** as sequências do §6.2 e as garantias do §8 beiram decisões arquiteturais. Mitigação: esta análise mapeia opções e propriedades sem decidi-las — disciplina idêntica à da ANL-003.
3. **Estado intermediário sem disciplina (específico da S3):** um "pacote parcial" sem critério de conclusão definido criaria regime misto permanente. Mitigação: se a governança escolher S3, exigir critério de extinção do estado parcial desde a decisão — o precedente da disposição transitória da ADR-007 (nasceu com previsão de fim e foi extinta formalmente) é o modelo.
4. **Canal sem auditoria:** distribuir sem detecção de divergência (D5 adiada) significa confiar que a propagação funciona sem meio independente de verificá-la. Risco aceitável no curto prazo e já registrado três vezes; deve permanecer declarado nos REQs (transparência — CON-001, Art. 9º, princípio 8).
5. **Contaminação pela homonímia:** requisitos futuros que usem "distribuir" sem a distinção do §1 podem colidir com o vocabulário da CAP-02/CAP-08. Mitigação: a distinção fica registrada aqui e deve ser observada na redação dos REQs.

## 10. Agrupamentos e ordem recomendada dos futuros REQs

Proposta preparatória (a confirmar no gate seguinte), no padrão da ANL-001:

| Grupo | Tema | Conteúdo provável |
|-------|------|-------------------|
| **A — Pacote de governança** | O que se distribui | Composição oficial do pacote (Constituição, normas, conceitos); precedência das fontes; subordinação dos espelhos |
| **B — Vínculo de distribuição** | Para quem | Efeitos do vínculo "agente conectado" para a distribuição: início, recepção obrigatória do pacote, cessação |
| **C — Entrega e propagação** | Como chega e como se atualiza | Correspondência de versão; propagação de atualizações; comportamento na indisponibilidade de fonte |
| **D — Rastro da distribuição** | Como se comprova | Registro dos atos de distribuição com os cinco campos; recuperabilidade do histórico distribuído |

**Ordem recomendada:** A → B → C → D. O pacote (A) delimita o objeto de todos os demais; o vínculo (B) depende da definição de "agente conectado" (D2 — a admissão do conceito deve preceder ou acompanhar o grupo B); entrega (C) pressupõe pacote e vínculo; rastro (D) fecha o ciclo. Antes do grupo A, a governança precisa deliberar a sequência do §6.2 — se S1, o grupo A aguarda a frente do REQ-002; se S2 ou S3, o grupo A pode iniciar imediatamente após a aprovação desta análise e a deliberação das questões do §11.

## 11. Conclusão — questões a submeter à governança

Esta análise **não decide**; identifica quatro questões, com os insumos de deliberação prontos:

1. **Composição do pacote de governança** — se a inclusão dos conceitos organizacionais no pacote deve ser formalizada em nível de requisito (pendência registrada na ANL-003 §6). Encaminhamentos possíveis identificados: ADR do gate seguinte (ADR-006, etapa 2) ou enunciado do primeiro REQ do grupo A.
2. **Sequência do ciclo ante as dependências** — qual das alternativas do §6.2 (S1, S2 ou S3) adotar, em especial quanto ao tratamento da fonte de normas (materialização do REQ-002). Natureza: decisão estrutural de ordem, própria da governança; candidata à mesma ADR.
3. **Vocabulário dos destinatários** — se e quando autorizar a promoção de "agente conectado" a conceito organizacional pela via oficial (REQ-009 → REQ-006), antes do grupo B. Seria a primeira admissão pós-migração, pelo fluxo regular do mecanismo de conceitos.
4. **Fronteira documental × técnica** — se a delimitação do §7 (especificação completa na fase atual; implementação técnica explicitamente remetida a fase futura) deve ser ratificada para o ciclo. Encaminhamentos possíveis: registro na ADR do gate ou na autorização do CTO.

Deliberadas essas quatro questões, o caminho até os REQs do grupo A fica sem pendência conhecida.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 (Art. 7º §3º); REQ-001; REQ-002 v1.0; ADR-008 v1.0 (D5); ADR-009 v1.0 (D7) |
| Analisa | A segunda etapa da CAP-01 (distribuição), entrando no fluxo oficial pela etapa cabível (ADR-006, não retroatividade) |
| Baseia-se em | CAP-001 (CAP-01 e CAP-11); VIS-001 §5; ANL-002 §3 e §6; ANL-003 §6; deliberação do CTO de 21/07/2026 (natureza da Distribuição mantida na CAP-01 — investigação encerrada); análise organizacional e pré-análise aprovadas em 21/07/2026, cujo conteúdo relevante está incorporado a este documento para rastreabilidade |
| Origem | Autorização de abertura do CTO (21/07/2026), com dois ajustes metodológicos incorporados |
| Gera | Questões do §11 (a deliberar pela governança); após deliberadas, gate aberto para os REQs do grupo A |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, incorporando os dois ajustes metodológicos da abertura (objetivo reformulado; dependências investigadas em nível geral) | Autorização do CTO — abertura da ANL da Distribuição (21/07/2026) | Aprovada com três ajustes |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou os ajustes | Três ajustes de neutralidade analítica: formalização do pacote reformulada como matéria de deliberação (§4); observação metodológica sobre as sequências (§6.2 — a ANL não estabelece preferência); "decisões" substituídas por "questões" a submeter à governança (§11 e referências) | Revisão do CTO — preservar a natureza investigativa da ANL | **Aprovada — homologada pelo CTO em 21/07/2026; questões do §11 abertas à deliberação da governança** |

# ANL-003 — Análise da Estratégia de Migração dos Conceitos Organizacionais

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026, aprovada pelo CTO com um ajuste (classificação explícita da lacuna identificada). Tipo ANL (ADR-005).
> Norma superior: CON-001 v1.0; ADR-007, ADR-008, ADR-009, ARQ-001 (v1.0).
> Documento preparatório, não normativo: não cria requisitos funcionais, não altera a ADR-009 nem a ARQ-001, não define implementação nem plano operacional de migração.

---

## 1. Objetivo e método

Validar, antes da implementação, que a estratégia definida pela ADR-009 é **suficiente para executar a migração das definições existentes sem perda de consistência organizacional**.

Método: cada necessidade da migração foi confrontada com a norma aprovada que a cobre (verificação de completude, §2); em seguida foram examinados os riscos remanescentes (§3), a suficiência do corte único (§4), a preservação da identidade organizacional (§5) e a consistência da integração posterior com o REQ-001 (§6). A conclusão (§7) decorre exclusivamente dessas evidências.

## 2. Verificação de completude da estratégia

### 2.1 O inventário é completo e permanece fechado

Varredura integral da documentação (21/07/2026) em busca de definições normativas estabelecidas fora do mecanismo: foram encontradas exatamente **quatro** — "decisão sob governança" (REQ-003), fronteira "item de conhecimento" (ANL-001 §2, transcrita no REQ-004), "Contexto de Trabalho" (REQ-005) e "conceito organizacional" (ANL-002 §2). São as mesmas quatro do inventário oficial (ADR-009, Decisão 1). **Nenhuma definição existe fora do inventário; nenhuma nova definição nasceu após seu fechamento.** Evidência de que o inventário fechado está sendo cumprido.

### 2.2 Cada necessidade da migração possui norma que a cobre

| Necessidade da migração | Coberta por | Verificação |
|-------------------------|-------------|-------------|
| Delimitar o que migra | ADR-009 D1 (inventário fechado) | Completa — confirmada pela varredura (§2.1) |
| Decidir a admissão de cada item | REQ-009 + ADR-009 D2 (regularização; artefatos autorizadores: decisões originais do CTO e a própria ADR-009) | Completa — a admissão na migração já tem autorização e origem rastreável definidas |
| Registrar oficialmente cada item | REQ-006 + ARQ-001 (estrutura da entrada, cadeia evolutiva, índice) | Completa no plano lógico; ver lacuna de identificação (§3.1) |
| Impedir alteração de significado no ato | ADR-009 D2 (migrar ≠ evoluir) + D4 (congelamento) + D6.2 (fidelidade textual verificável) | Completa |
| Evitar regime misto de autoridade | ADR-009 D3 (corte único e atômico) | Completa (§4) |
| Tratar os documentos legados | ADR-009 D5 (anotação de migração, sem reabertura) | Completa |
| Saber quando a migração terminou | ADR-009 D6 (cinco critérios objetivos) + extinção da transitória da ADR-007 | Completa |
| Preservar a identidade dos conceitos | ADR-009 D8 + REQ-007 (identidade preservada) | Completa (§5) |
| Ordenar a integração com a distribuição | ADR-009 D7 (somente após conclusão da migração) | Completa (§6) |

A estratégia **cobre todas as necessidades identificáveis da migração**. A única dependência não satisfeita é externa à ADR-009 e foi deliberadamente adiada pela governança (§3.1).

## 3. Riscos arquiteturais remanescentes

### 3.1 Lacuna declarada e bloqueante: arquitetura de identificação

O corte exige emitir **identificadores oficiais**: o registro os requer (REQ-006, critério 1), os critérios de conclusão os pressupõem (ADR-009 D6.1) e as anotações de migração os referenciam (ADR-009 D5). Porém, por decisões deliberadas da governança, **prefixo, formato, numeração e política de geração dos identificadores ainda não existem**: a ADR-009 D8 não os define, e a revisão da ARQ-001 (21/07/2026) removeu a convenção proposta, remetendo-a a uma arquitetura específica de identificação organizacional (futura capacidade transversal de Identidade Organizacional).

**Consequência:** a implementação da migração não pode iniciar antes dessa definição. Não é falha da estratégia — a ADR-009 permanece íntegra —, mas é **pré-condição arquitetural pendente**, e é exatamente o tipo de lacuna que esta análise deveria detectar.

### 3.2 Riscos não bloqueantes (monitorar na execução)

* **Forma textual do item 2 do inventário:** a definição da fronteira "item de conhecimento" existe em duas formas — a original (ANL-001 §2, par de fronteiras CAP-04 × CAP-05) e a transcrição em forma de termo-definição (REQ-004). O inventário já designa a fonte canônica (ANL-001 §2), e após o corte a transcrição do REQ-004 torna-se informativa (ADR-009 D5). Risco residual: no ato do corte, a verificação de fidelidade (D6.2) deve comparar contra a fonte designada pelo inventário, e o artefato de admissão deve fixar o texto exato registrado. Resolvível na execução, sem nova decisão.
* **Duração do congelamento semântico:** a Decisão 4 não tem prazo — encerra-se apenas com o corte. Se a implementação demorar, necessidades legítimas de evolução ficarão represadas. Risco aceitável com quatro itens estáveis; a mitigação natural é priorizar a pré-condição do §3.1.
* **Alçada da admissão na regularização:** o REQ-009 remete as alçadas à governança vigente. Para a migração, a ADR-009 D2 já resolve (autorização pelas decisões originais do CTO e pela própria ADR); resta apenas, na execução, produzir as decisões de admissão com resultado explícito (REQ-009) — ato operacional, não lacuna arquitetural.

Nenhum outro risco arquitetural foi identificado: registro, evolução, resolução e admissão têm requisitos aprovados; a estrutura receptora está definida (ARQ-001, incluindo extensibilidade — A5); o fluxo de gates (ADR-006) disciplina as etapas restantes.

## 4. Suficiência do corte único

O corte único e atômico (ADR-009 D3) é **suficiente e adequado** ao caso:

* **Escala:** o inventário fechado tem quatro itens estáveis, aprovados pela mesma autoridade (CTO) na mesma data — o custo de atomicidade é mínimo e a alternativa gradual foi corretamente rejeitada (regime misto que a D3 proíbe).
* **Verificabilidade:** o critério D6.4 ("a resolução responde por 100% do inventário") torna a atomicidade objetivamente verificável — ou o mecanismo responde pelos quatro, ou o corte não ocorreu.
* **Ausência de estados intermediários:** antes do corte, autoridade nos documentos de origem (ADR-007); a partir dele, autoridade no mecanismo. Não há estado em que um consumidor não saiba qual autoridade consultar.
* **Pré-condições do corte** (decorrentes das normas, não criadas aqui): mecanismo operacional para registro (gate de implementação da ADR-006) e identificadores disponíveis (§3.1). Satisfeitas ambas, nada mais falta para o corte.

## 5. Preservação da identidade organizacional

A identidade dos conceitos está protegida **em todas as fases** da transição, por camadas independentes:

| Fase | Proteção |
|------|----------|
| Antes do corte | Congelamento semântico (D4): nenhum significado muda |
| No ato do corte | Migração por regularização sem alteração de significado (D2) + fidelidade textual verificável (D6.2) |
| Identidade formal | D8: a migração não cria conceitos novos; o identificador apenas representa formalmente identidade preexistente |
| Depois do corte | REQ-007: evolução altera só a definição vigente, nunca a identidade; cadeia evolutiva imutável (REQ-006, ARQ-001 A2) |

Não há janela em que a identidade fique desprotegida. **Validado.**

## 6. Consistência da integração posterior com o REQ-001

A sequência permanece consistente:

* A ordem é inequívoca: integração somente após os cinco critérios de conclusão (ADR-009 D7 + D6) — distribui-se apenas conceito oficial registrado, nunca definição em regime transitório.
* O REQ-001 distribui a versão vigente a partir do registro canônico (dependência do REQ-002); o mecanismo de conceitos é **fonte análoga e independente** (registro próprio — ADR-008), e a ANL-002 §3 já posiciona os conceitos como parte do pacote distribuído, com o mecanismo como fonte e não canal. Nenhuma contradição entre as normas.
* Observação não bloqueante: o enunciado do REQ-001 fala em "Constituição e regras de governança"; a inclusão dos conceitos oficiais no pacote distribuído está amparada na ANL-002 §3, mas o gate próprio da integração (etapa 4 da ANL-002 §6) deverá formalizá-la — fora do escopo desta análise e da migração.

## 7. Conclusão

**A estratégia da ADR-009 é completa e suficiente no seu escopo.** O inventário está fechado e confirmado por varredura; o corte único é adequado e verificável; a identidade organizacional está protegida em todas as fases; a sequência com o REQ-001 é consistente.

**A organização ainda não está apta a iniciar a implementação da migração.** Existe uma lacuna arquitetural — declarada e deliberada, porém pendente: a **arquitetura de identificação organizacional** (§3.1), pré-condição para emitir os identificadores que o registro, os critérios de conclusão e as anotações de migração exigem. Depois dela, resta apenas o gate de implementação do registro (ADR-006) antes do corte.

### Classificação da lacuna (CTO, 21/07/2026)

A lacuna identificada no §3.1 recebe a classificação analítica de **Lacuna Arquitetural Bloqueante**:

> **Lacuna Arquitetural Bloqueante:** ausência de uma decisão arquitetural cuja inexistência impede o início seguro da implementação de um mecanismo organizacional.

Registra-se explicitamente que a **arquitetura de Identidade Organizacional constitui a primeira lacuna classificada nessa categoria pela organização**. A lacuna não decorre de deficiência do mecanismo de conceitos, mas da maturidade alcançada pela própria organização: o que antes era um detalhe localizado revelou-se uma capacidade transversal. Esta classificação é exclusivamente analítica — não cria processo, requisito nem tratamento.

Encaminhamento sugerido (a decidir pela governança, não decidido aqui): definir a arquitetura de identificação organizacional; em seguida, abrir o gate de implementação do registro; então executar o corte conforme a ADR-009.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; ADR-007, ADR-008, ADR-009, ARQ-001 (v1.0) |
| Valida | ADR-009 (estratégia de transição), sem alterá-la |
| Baseia-se em | REQ-006 a REQ-009 v1.0; ANL-001 §2; ANL-002 §3 e §6; REQ-001; varredura documental de 21/07/2026 |
| Origem | Deliberação do CTO (21/07/2026) — validar a estratégia antes da implementação |
| Gera | Decisão de governança sobre a arquitetura de identificação organizacional; abertura do gate de implementação quando a pré-condição for satisfeita |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Autorização do CTO — validar a estratégia de migração antes da implementação | Aprovada com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionada a classificação analítica "Lacuna Arquitetural Bloqueante" à conclusão, registrando a arquitetura de Identidade Organizacional como a primeira lacuna dessa categoria na organização | Revisão do CTO — a análise de prontidão cumpriu sua finalidade ao revelar a capacidade transversal | **Aprovada — migração condicionada à arquitetura de Identidade Organizacional** |

# ADR-009 — Transição para o Mecanismo de Conceitos Organizacionais

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO autorizou com escopo e restrições delimitados; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | O ciclo de requisitos do mecanismo (REQ-006 a REQ-009) foi encerrado e aprovado; antes da migração das definições existentes e da integração com a distribuição (REQ-001), a transição do estado anterior para o novo modelo precisa de disciplina arquitetural própria |
| Baseado em quê | ADR-007 (disposição transitória); ADR-008 (Decisão 4); REQ-006 a REQ-009 v1.0; ANL-002 §6 (etapas 3 e 4) |
| Resultado | Aprovada v1.0 em 21/07/2026, com um ajuste do CTO: decisão explícita de continuidade da identidade organizacional dos conceitos migrados |

## Status

Aprovada (v1.0 — CTO, 21/07/2026).

## Escopo e restrições

Esta ADR define a **estratégia arquitetural de migração** para a Autoridade Semântica Oficial. Ela não cria requisitos funcionais, não altera os REQ-006 a REQ-009, não define implementação técnica nem ferramentas de migração.

## Decisões

### Decisão 1 — Inventário oficial de transição

Ficam inventariadas como **definições pré-mecanismo** — legítimas sob a disposição transitória da ADR-007 — exclusivamente:

| # | Definição | Estabelecida em | Estabelecida por |
|---|-----------|-----------------|------------------|
| 1 | Decisão sob governança | REQ-003 (Enunciado) | CTO, 21/07/2026 |
| 2 | Item de conhecimento (fronteira CAP-04 × CAP-05) | ANL-001 §2, consumida pelo REQ-004 | CTO, 21/07/2026 |
| 3 | Contexto de Trabalho | REQ-005 (Enunciado) | CTO, 21/07/2026 |
| 4 | Conceito organizacional | ANL-002 §2 | CTO, 21/07/2026 |

O inventário é **fechado**: a partir desta ADR, nenhuma nova definição pode nascer fora do mecanismo — todo novo conceito segue obrigatoriamente admissão (REQ-009) e registro (REQ-006). O regime transitório da ADR-007 cobre apenas os quatro itens inventariados.

### Decisão 2 — Migração por regularização, sem alteração de significado

Cada definição inventariada será migrada por **regularização**: decisão formal de admissão (REQ-009) e registro oficial (REQ-006), tendo como artefatos de governança autorizadores as decisões originais do CTO e esta ADR.

**As definições migram exatamente como estão.** A migração nunca altera significado: qualquer aperfeiçoamento desejado ocorrerá depois, pela evolução semântica (REQ-007), com seu próprio rastro. Migrar e evoluir são atos distintos e nunca se combinam no mesmo evento.

### Decisão 3 — Corte único e atômico

A migração ocorre em **corte único**: os quatro itens do inventário são registrados no mesmo ato de migração, quando o mecanismo estiver operacional para registro (respeitados os gates da ADR-006 — arquitetura e implementação do registro são etapas futuras).

* **Antes do corte:** a autoridade das definições inventariadas são os documentos de origem, sob o regime da ADR-007 (referência, nunca cópia).
* **A partir do corte:** a autoridade de todas as definições inventariadas é o mecanismo. Não existe regime misto — em nenhum instante parte do inventário responde a uma autoridade e parte a outra.

### Decisão 4 — Congelamento semântico durante a transição

Entre a aprovação desta ADR e a conclusão do corte, as definições inventariadas ficam **semanticamente congeladas**: nenhuma alteração de significado é admitida no período. Necessidades de mudança identificadas durante a transição aguardam a migração e seguem o REQ-007.

### Decisão 5 — Documentos legados

Os documentos aprovados que hoje contêm as definições (REQ-003, REQ-004, REQ-005, ANL-001, ANL-002) **não são reabertos nem reversionados** pela migração:

* No ato do corte, cada documento de origem recebe **anotação de migração** — a indicação de que a definição ali transcrita passou a ser informativa e subordinada ao mecanismo, com a referência ao identificador oficial do conceito (ADR-008, Decisão 4).
* A anotação é ato de execução autorizado por esta ADR, registrado no histórico de versões de cada documento, sem novo ciclo de aprovação — análoga à exceção editorial da ADR-006, com rastro obrigatório.
* Nenhum outro conteúdo dos documentos legados é alterado.

### Decisão 6 — Critérios de conclusão da migração

A migração é considerada concluída quando, e somente quando:

1. os quatro itens do inventário possuem decisão de admissão registrada (REQ-009) e registro oficial na autoridade semântica (REQ-006), com origem rastreável aos artefatos autorizadores;
2. a definição registrada de cada conceito é **textualmente idêntica** à definição inventariada — fidelidade verificável por comparação direta;
3. todos os documentos de origem possuem a anotação de migração registrada em seus históricos;
4. nenhuma definição responde a dupla autoridade: a resolução (REQ-008) responde por 100% do inventário;
5. o corte está registrado na Memória Organizacional com os cinco campos (CON-001, Art. 8º).

Cumpridos os cinco critérios, **a disposição transitória da ADR-007 fica extinta**.

### Decisão 7 — Sequência com a integração de distribuição

A integração com o mecanismo de distribuição (REQ-001; etapa 4 da ANL-002 §6) somente se inicia após a conclusão da migração (Decisão 6): o que se distribui aos agentes são conceitos oficiais registrados — nunca definições em regime transitório.

### Decisão 8 — Continuidade da identidade organizacional

**Durante a transição, os conceitos migrados mantêm integralmente sua identidade organizacional.**

A migração não constitui criação de novos conceitos: o identificador oficial atribuído pelo mecanismo passa apenas a **representar formalmente uma identidade já existente** na organização. Esta decisão preserva a continuidade organizacional e impede qualquer interpretação de que a migração tenha alterado o patrimônio conceitual da organização.

Convenção de identificadores, estratégia de numeração e forma de geração dos identificadores não são definidas aqui.

## Alternativas consideradas

* **Migração gradual, conceito a conceito:** rejeitada — prolonga o regime misto de autoridade que a Decisão 3 proíbe; com apenas quatro itens, o custo do corte único é mínimo.
* **Aproveitar a migração para aperfeiçoar definições:** rejeitada — combinaria dois atos com rastros distintos (migrar e evoluir), tornando indistinguível o que mudou por transição e o que mudou por decisão semântica (Decisão 2).
* **Reabrir e reversionar os documentos legados:** rejeitada — reprocessaria aprovações válidas sem ganho; a anotação de migração com rastro no histórico atinge o mesmo efeito (Decisão 5).

## Rastreabilidade

- Norma superior: CON-001 Art. 5º, 7º, 8º; ADR-007 v1.0 (disposição transitória que esta ADR conduz à extinção); ADR-008 v1.0.
- Origem: deliberação arquitetural do CTO (21/07/2026), após encerramento do ciclo REQ-006 a REQ-009; ANL-002 §6 (etapas 3 e 4).
- Relaciona-se com: REQ-001 (Decisão 7); REQ-003, REQ-004, REQ-005, ANL-001, ANL-002 (documentos legados); ADR-006 (gates e exceção editorial).
- Gera: execução da migração quando o mecanismo estiver operacional; anotações de migração nos documentos legados; extinção da disposição transitória da ADR-007.

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação | Deliberação arquitetural do CTO — disciplinar a transição antes da migração e da integração | Aprovada com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionada Decisão 8: continuidade da identidade organizacional — migração não cria conceitos novos; o identificador oficial apenas representa formalmente identidade já existente | Revisão do CTO | **Aprovada — estratégia de transição em vigor** |

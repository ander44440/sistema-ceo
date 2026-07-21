# ADR-008 — Integração arquitetural do Mecanismo de Conceitos Organizacionais

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO autorizou com escopo delimitado; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | A existência e a responsabilidade do mecanismo já foram decididas (ADR-007) e sua responsabilidade organizacional foi analisada (ANL-002); falta integrá-lo formalmente à arquitetura documental do CEO |
| Baseado em quê | ADR-007 v1.0; ANL-002 v1.0 (em especial §3, §4 e §6); REQ-002 v1.0; precedente da ADR-003 (Decisão 2 — BCO como mecanismo) |
| Resultado | Aprovada v1.0 em 21/07/2026, com dois ajustes do CTO: recorrência do princípio canônico registrada sem institucionalização; princípio de independência dos espaços de identificação |

## Status

Aprovada (v1.0 — CTO, 21/07/2026).

## Escopo

Esta ADR decide **apenas questões arquiteturais** de integração. Não define política de admissão de conceitos, estrutura documental detalhada, implementação nem formato físico dos registros — assuntos que pertencem aos requisitos do próprio mecanismo (ANL-002 §2).

## Decisões

### Decisão 1 — Posicionamento formal sob a CAP-01

O Mecanismo de Conceitos Organizacionais é formalmente posicionado como **mecanismo arquitetural de governança sob a CAP-01**, conforme recomendação da ANL-002 §4.

* Não é capacidade, não é subcapacidade e não integra o CAP-001 como entrada própria — segue o precedente do BCO (ADR-003, Decisão 2).
* Seus futuros requisitos serão REQs da CAP-01, entrando no fluxo da ADR-006 pela etapa cabível (a ANL-002 cumpre o gate de análise).

### Decisão 2 — Registro próprio, sob o mesmo padrão canônico

O mecanismo terá **registro próprio**, distinto do registro canônico de normas (REQ-002), instanciando os mesmos princípios arquiteturais: fonte canônica única, identificadores permanentes, exatamente uma definição vigente por conceito e histórico com os cinco campos da Memória Organizacional.

Fundamentos:

* **Responsabilidades distintas:** o registro do REQ-002 é a autoridade normativa (o que obriga); o registro de conceitos é a autoridade semântica (o que significa). Fundi-los diluiria a fronteira norma × conceito estabelecida na ADR-007.
* **Estabilidade do aprovado:** integrar conceitos ao registro do REQ-002 exigiria reabrir um requisito aprovado cujo enunciado é escopado a normas de governança.
* Esta ADR **identifica um princípio arquitetural recorrente** na organização — fonte única, identificadores permanentes, unicidade de vigência e histórico, presente no REQ-002 e neste mecanismo — **cuja formalização como padrão organizacional poderá ser objeto de decisão futura**. A recorrência fica registrada sem institucionalizar formalmente um padrão antes de existir mecanismo próprio para governá-lo.

### Decisão 3 — Identificadores permanentes dos conceitos

A emissão e a garantia dos identificadores dos conceitos são **responsabilidade exclusiva do mecanismo**:

* identificadores permanentes — nunca renumerados nem reutilizados;
* independentes de ferramenta e de representação (mesma exigência do REQ-001 e da lição do REQ-003);
* em espaço de identificação próprio, distinto dos identificadores documentais (CON, VIS, CAP, REQ, ADR, ANL etc.), para que conceito e documento nunca se confundam.

O esquema concreto de identificação é definição dos requisitos do mecanismo.

### Princípio arquitetural — independência dos espaços de identificação

**Os espaços de identificação organizacional são independentes entre si.**

Cada mecanismo organizacional é responsável exclusivamente pelo seu próprio espaço de identificadores, não podendo depender da estrutura interna dos identificadores pertencentes a outros mecanismos.

### Decisão 4 — Forma de referência dos consumidores

* A **referência normativa** a um conceito é feita exclusivamente pelo seu identificador permanente; quando a precisão temporal importar, com a versão vigente no momento do uso (simetria com o rastro temporal do REQ-003).
* Transcrições do texto da definição em documentos consumidores são **informativas e não vinculantes**: em qualquer divergência, prevalece a definição vigente no mecanismo (aplicação direta do princípio da ADR-007 — nenhuma definição local altera significado).
* Documentos aprovados anteriores à migração (REQ-003, REQ-004, REQ-005, ANL-001) permanecem sob a disposição transitória da ADR-007 até o corte único de migração.

### Decisão 5 — Relações arquiteturais

| Elemento | Relação com o mecanismo |
|----------|------------------------|
| Constituição (CON-001) | Supremacia: termos definidos na CON prevalecem; o mecanismo os referencia e nunca os redefine. A integração não exige emenda constitucional (apoia-se nos Art. 7º e 8º) |
| CAP-01 / REQ-002 / REQ-003 | Pertencimento (Decisão 1) e paralelismo: registro de conceitos ao lado do registro de normas, ambos instâncias do padrão canônico; a resolução do significado vigente espelha a resolução da norma vigente |
| REQ-001 (distribuição) | Os conceitos oficiais integram o pacote de governança distribuído a qualquer agente conectado; o mecanismo é fonte, o REQ-001 é canal |
| CAP-04 / CAP-05 | Vizinhança com fronteiras já oficiais: conhecimento informa (CAP-04), memória historia (CAP-05), conceito significa (mecanismo). O mecanismo usa o padrão dos cinco campos apenas para o histórico dos próprios conceitos |
| ADRs, REQs, ANLs, CAPs e demais documentos | Consumidores por referência (Decisão 4). Nenhum documento define conceito localmente; propostas de novos conceitos seguem as alçadas de governança |
| Catálogo documental | Se os requisitos do mecanismo criarem tipo documental, ele nasce por ADR, conforme a regra vigente do catálogo |

## Alternativas consideradas

* **Registro único compartilhado com o REQ-002:** rejeitada — dilui a fronteira norma × conceito e reabre requisito aprovado (Decisão 2).
* **Conceitos como anexo da Constituição:** rejeitada — submeteria vocabulário operacional à alçada de emenda constitucional (Art. 11), tornando a evolução semântica pesada — exatamente o risco de ossificação apontado na ANL-002 §5.
* **Posicionamento sem vínculo formal com capacidade:** rejeitada — mecanismo sem dono organizacional não tem trilha de requisitos nem gate de governança; a CAP-01 é o dono natural (ANL-002 §4).

## Rastreabilidade

- Norma superior: CON-001 v1.0 (Art. 5º, 7º, 8º).
- Origem: autorização do CTO (21/07/2026); ANL-002 v1.0 (§3, §4, §6 — passo 1 da ordem recomendada); ADR-007 v1.0.
- Relaciona-se com: REQ-001, REQ-002, REQ-003; ADR-003 (precedente BCO); ADR-006 (gates).
- Gera: gate aberto para os REQs do mecanismo (grupo da CAP-01); posteriormente, migração das definições existentes e integração com a distribuição (ordem da ANL-002 §6).

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação | Autorização do CTO após aprovação da ANL-002 | Aprovada com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | "Padrão canônico" reformulado como princípio recorrente identificado (formalização é decisão futura); adicionado princípio de independência dos espaços de identificação | Revisão do CTO | **Aprovada — mecanismo integrado à arquitetura documental** |

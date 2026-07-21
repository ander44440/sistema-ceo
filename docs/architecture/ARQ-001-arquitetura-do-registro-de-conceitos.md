# ARQ-001 — Arquitetura do Registro de Conceitos Organizacionais

> **Status: Aprovado — v1.0.**
> Versão 1.0 — 21/07/2026. Tipo criado pela ADR-010.
> Norma superior: CON-001 v1.0; ADR-007, ADR-008, ADR-009 (v1.0); satisfaz REQ-006, REQ-007, REQ-008 e REQ-009 (v1.0).
> Este documento define arquitetura lógica. Não define implementação técnica, tecnologia, banco de dados ou ferramenta; não cria requisitos funcionais; não modifica o comportamento do mecanismo.

---

## Diretriz de reutilização

Por diretriz arquitetural obrigatória do CTO (21/07/2026), esta arquitetura **reutiliza os padrões já consolidados pela organização** em vez de criar modelos paralelos:

| Padrão consolidado | Onde já é usado | Reutilização nesta arquitetura |
|--------------------|-----------------|--------------------------------|
| Fonte canônica única com identificadores permanentes, unicidade de vigência e histórico (princípio recorrente — ADR-008, Decisão 2) | Registro de normas (REQ-002); documentação oficial | Estrutura nuclear do registro de conceitos |
| Documento por unidade normativa, sob a árvore documental canônica `/docs` (CON-001, Art. 7º §4º) | CON, VIS, CAP, REQ, ADR, ANL | Uma entrada documental por conceito |
| Índice/catálogo oficial como fonte de estado | `docs/README.md` | Índice oficial de conceitos |
| Histórico tabular com os cinco campos da Memória Organizacional (CON-001, Art. 8º) | Todos os documentos aprovados | Cadeia evolutiva do conceito |
| Identificadores permanentes | Todos os tipos documentais | Espaço próprio de identificação de conceitos |

## Decisões arquiteturais

### A1 — Forma do registro

O registro oficial de conceitos é uma **coleção documental** sob a árvore de documentação canônica, em localização própria: `docs/concepts/`, composta por:

* **Índice de conceitos** (`docs/concepts/README.md`): relação oficial de todos os conceitos registrados, com identificador, termo e situação de vigência. É a porta de entrada da resolução e a fonte de estado do acervo — papel análogo ao do catálogo documental.
* **Uma entrada por conceito**: documento próprio, permanente, contendo a totalidade das informações do conceito (A2).

### A2 — Organização das informações do conceito

Cada entrada de conceito contém, obrigatoriamente, as seções:

1. **Identificação** — identificador permanente e termo. **O mecanismo possui um espaço próprio de identificação de conceitos organizacionais** (REQ-006; ADR-008, Decisão 3 e princípio de independência dos espaços); identificadores nunca são renumerados nem reutilizados. Prefixo, formato, numeração e política de geração não são definidos aqui: serão tratados em arquitetura específica de identificação organizacional.
2. **Definição normativa vigente** — o texto oficial único; exatamente uma definição vigente por conceito em qualquer instante (REQ-007).
3. **Situação** — vigência atual e desde quando.
4. **Origem e autorização** — referência ao artefato de governança que autorizou a existência oficial (decisão de admissão — REQ-009; critério de origem — REQ-006).
5. **Cadeia evolutiva** — tabela imutável e cronológica de eventos (registro e evoluções), em que cada evento contém: número sequencial do evento, data, tipo (registro | evolução), definição estabelecida, aprovador, referência explícita ao evento imediatamente anterior e os cinco campos da Memória Organizacional. A tabela é **append-only**: eventos nunca são alterados ou removidos; correções geram novos eventos (REQ-006, imutabilidade; REQ-007, rastreabilidade plena).

### A3 — Relação entre registro, histórico e resolução

* O **histórico é parte integrante da entrada** do conceito — não há repositório de histórico separado. A cadeia evolutiva (A2.5) é a fonte da verdade temporal.
* A **definição vigente (A2.2) é sempre a definição do último evento aprovado da cadeia**: a seção 2 é uma projeção de leitura da cadeia, mantida em conformidade com ela. Divergência entre a seção vigente e o último evento resolve-se a favor da cadeia.
* A **resolução corrente** (REQ-008) lê a definição vigente da entrada identificada pelo identificador do conceito; a **resolução com instante de referência** percorre a cadeia evolutiva até o evento vigente naquele instante. Como a fonte é única e a cadeia imutável, o determinismo e a independência do consumidor (REQ-008) decorrem da estrutura.

### A4 — Estratégia de referência pelos consumidores

* Documentos consumidores referenciam conceitos **exclusivamente pelo identificador oficial do conceito**; quando a precisão temporal importar, acrescentam o instante de referência ou o número do evento da cadeia (ADR-008, Decisão 4).
* Transcrições de definição em consumidores são informativas e não vinculantes; em divergência, prevalece a entrada do registro.
* Referências cruzadas do registro para fora (origem, artefatos autorizadores) usam os identificadores documentais existentes (REQ-nnn, ADR-nnn) — os espaços de identificação permanecem independentes: nenhum lado depende da estrutura interna do outro.

### A5 — Extensibilidade do registro

**A arquitetura do registro deverá permanecer extensível.** Novas informações poderão ser incorporadas futuramente ao registro sem invalidar os registros existentes nem alterar sua identidade arquitetural. As seções obrigatórias (A2) constituem o núcleo mínimo, não o limite da entrada. Esta decisão não define estratégia de compatibilidade, versionamento estrutural nem mecanismo de migração.

### A6 — Rastreabilidade arquitetural

Matriz de conformidade — cada elemento desta arquitetura satisfaz normas aprovadas, e nenhum elemento existe sem norma que o exija:

| Elemento arquitetural | Satisfaz |
|-----------------------|----------|
| Identificador permanente em espaço próprio de identificação | REQ-006 (critério 1); ADR-008 (Decisão 3, princípio de independência) |
| Definição vigente única por entrada | REQ-006 (critério 2); REQ-007 (unicidade temporal) |
| Seção de origem e autorização | REQ-006 (origem rastreável); REQ-009 (artefato autorizador) |
| Cadeia evolutiva append-only com referência ao evento anterior | REQ-006 (imutabilidade); REQ-007 (rastreabilidade plena da cadeia) |
| Cinco campos por evento | CON-001 Art. 8º |
| Leitura pela entrada + percurso da cadeia | REQ-008 (resolução corrente, temporal, determinística e fiel) |
| Índice de conceitos | REQ-008 (resposta explícita de inexistência — a ausência no índice é verificável) |
| Localização sob `/docs` e consumo por referência | CON-001 Art. 7º §4º; ADR-008 (Decisão 4); ADR-009 (Decisões 5 e 8) |
| Extensibilidade do registro (A5) | Revisão do CTO da ARQ-001 (21/07/2026) |

## O que esta arquitetura não define

* Implementação técnica, tecnologia, banco de dados ou ferramenta — a estrutura descrita é lógica e documental; qualquer automação futura a implementará sem alterá-la.
* Workflow operacional de admissão, prazos e alçadas (REQ-009, fora do escopo).
* A execução da migração das quatro definições inventariadas — disciplinada pela ADR-009 e executada no gate próprio (a estrutura aqui definida é a que as receberá no corte único).
* Convenções de redação das definições — matéria da governança.
* Prefixo, formato, numeração e política de geração dos identificadores de conceito — matéria de arquitetura específica de identificação organizacional, a ser elaborada futuramente.
* Estratégia de compatibilidade, versionamento estrutural e mecanismo de migração relativos à extensibilidade (A5).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; ADR-007, ADR-008, ADR-009 v1.0 |
| Satisfaz | REQ-006, REQ-007, REQ-008, REQ-009 (v1.0) |
| Origem | Deliberação arquitetural do CTO (21/07/2026), com diretriz obrigatória de reutilização de padrões; ADR-010 (tipo ARQ) |
| Gera | Gate de Implementação do mecanismo (ADR-006), quando autorizado; estrutura receptora da migração (ADR-009) |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação | Autorização do CTO — gate de Arquitetura do mecanismo | Em análise pelo CTO |
| 1.0 | 21/07/2026 | CTO (revisão) / Engenheiro (ajustes) | Aprovação com dois ajustes: remoção da convenção "CNC-nnn" (identificação será objeto de arquitetura própria; mantida apenas a exigência de espaço próprio) e inclusão da decisão A5 — extensibilidade do registro | Impacto transversal da identificação; proteção da evolução futura do mecanismo | ARQ-001 v1.0 aprovada |

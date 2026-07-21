# ARQ-003 — Arquitetura do Espaço de Identificação dos Conceitos Organizacionais

> **Status: Aprovado — v1.0.**
> Versão 1.0 — 21/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; ADR-011 v1.0; ARQ-002 v1.0 (arquitetura geral que este espaço herda integralmente).
> Este documento cria o primeiro espaço de identificação oficialmente arquitetado da organização. Não altera a arquitetura geral (ARQ-002), não cria regras para outros espaços, não define implementação técnica nem mecanismos de persistência.

---

## Finalidade

Definir a arquitetura específica do **espaço de identificação dos conceitos organizacionais**, consumido pelo Mecanismo de Conceitos Organizacionais (ADR-007/ADR-008; REQ-006 a REQ-009; ARQ-001). Com sua aprovação, **extingue-se a Lacuna Arquitetural Bloqueante registrada na ANL-003**, liberando o caminho para o gate de implementação do mecanismo e, na sequência, o corte único de migração (ADR-009).

## Decisões arquiteturais

### A1 — Criação e organização do espaço

* Fica criado o **espaço de identificação dos conceitos organizacionais**, nos termos da ARQ-002 (A1): domínio delimitado, com responsável único — **o registro oficial de conceitos** (ARQ-001), que emite os identificadores e garante suas propriedades.
* O espaço é **único e plano**: não possui hierarquias, partições, categorias ou subespaços. Toda estrutura classificatória de conceitos, se algum dia existir, pertencerá ao conteúdo do registro — nunca ao identificador (opacidade — ARQ-002, A2.5).
* O **índice de conceitos** (ARQ-001, A1) é a relação oficial dos identificadores emitidos: um identificador existe no espaço se, e somente se, consta do índice com sua entrada correspondente.

### A2 — Convenção dos identificadores

O identificador de conceito organizacional tem a forma:

**`CNC-nnn`**

* **`CNC`** — marcador fixo do espaço, invariável para todos os identificadores. Favorece a legibilidade humana (evoca "conceito") **sem significado arquitetural**: nenhuma decisão organizacional pode depender da leitura do marcador; ele existe para qualificar a referência (A4) e facilitar o reconhecimento por humanos (princípio obrigatório 3).
* **`nnn`** — número sequencial natural, iniciado em `001`, com no mínimo três dígitos e sem limite superior (após `CNC-999`, segue `CNC-1000`). O número expressa exclusivamente a ordem de emissão — não expressa importância, categoria, hierarquia ou qualquer característica do conceito (opacidade).
* O identificador é **atômico**: consumidores o tratam como símbolo indivisível; decompô-lo em marcador e número não produz nenhuma informação organizacional legítima (ARQ-002, A2.3 e A2.5).

### A3 — Regras arquiteturais de emissão

1. **Um conceito, um identificador**: cada conceito organizacional possui exatamente um identificador permanente, atribuído no ato de registro (REQ-006) e jamais alterado — inclusive os quatro conceitos da migração, cujos identificadores apenas representarão formalmente identidades preexistentes (ADR-009, D8).
2. **Nunca reutilizado, nunca reatribuído**: um identificador emitido pertence para sempre ao seu conceito, ainda que a definição perca vigência ou o conceito seja descontinuado (ADR-011, princípio 5; ARQ-002, A2.1).
3. **Emissão determinística**: o próximo identificador é sempre o sucessor numérico do último emitido no espaço. Dado o estado do registro, o identificador seguinte é univocamente determinável — sem escolha, sem aleatoriedade.
4. **Emissão rastreável**: todo identificador nasce no evento de registro do conceito (ARQ-001, A2.5 — cadeia evolutiva), que carrega os cinco campos da Memória Organizacional; a emissão não gera rastro próprio separado, pois **é parte do ato de registro** e herda seu rastro integral.
5. **Emissão exclusiva pelo registro**: nenhum identificador do espaço nasce fora do ato de registro na autoridade semântica. Propostas rejeitadas (REQ-009) não consomem identificadores — números são atribuídos apenas a conceitos efetivamente registrados, sem lacunas na sequência.
6. **Neutralidade da ordem de emissão** (princípio arquitetural — revisão do CTO, 21/07/2026): **a ordem de emissão não representa prioridade, relevância, classificação ou qualquer atributo organizacional do conceito.** A sequência numérica existe exclusivamente para garantir unicidade e rastreabilidade da emissão; nenhuma decisão organizacional pode ser baseada na posição ordinal do identificador.

### A4 — Utilização pelos mecanismos consumidores

* A referência a um conceito é a **referência qualificada** da ARQ-002 (A5): o marcador `CNC` determina inequivocamente o espaço, e o número determina o elemento dentro dele. O marcador não colide com nenhum prefixo em uso na organização, mantendo a dupla espaço + identificador sempre determinável.
* Consumidores usam o identificador conforme a estratégia já aprovada na ARQ-001 (A4): referência pelo identificador, com instante de referência ou número de evento quando a precisão temporal importar; transcrições informativas e não vinculantes.
* **Opacidade na prática**: nenhum consumidor infere características do conceito a partir do identificador — significado, vigência, situação e histórico são obtidos exclusivamente pela resolução (REQ-008) junto ao registro (ARQ-001).
* **Estabilidade das referências** (ARQ-002, A7): toda referência `CNC-nnn` estabelecida permanece válida pela vida da organização; evoluções futuras desta convenção, se algum dia aprovadas pela governança, não poderão invalidá-las.

### A5 — Independência do espaço

* Este espaço não depende da estrutura interna de nenhum outro espaço de identificação, e nenhum outro espaço depende dele (ADR-008; ARQ-002, A3).
* As referências do registro de conceitos para fora (artefatos autorizadores — REQ-nnn, ADR-nnn) e de fora para dentro (`CNC-nnn`) são referências qualificadas entre espaços autônomos; nenhuma exige igualdade de convenção.
* Esta arquitetura não cria regra alguma para outros espaços, presentes ou futuros.

### A6 — Fechamento do espaço

**O espaço de identificação dos conceitos deverá permanecer fechado sobre si mesmo** (decisão arquitetural — revisão do CTO, 21/07/2026).

Toda regra específica desta arquitetura — convenção `CNC-nnn`, regras de emissão, organização do espaço — aplica-se exclusivamente aos conceitos organizacionais. **Nenhuma convenção aqui definida pode ser implicitamente estendida a outro espaço de identificação sem uma arquitetura própria que o autorize.** Esta decisão protege a autonomia arquitetural dos espaços prevista na ARQ-002 (A3); não define migração, interoperabilidade adicional nem novas convenções.

### A7 — Rastreabilidade arquitetural

| Elemento arquitetural | Satisfaz |
|-----------------------|----------|
| Espaço com responsável único (registro de conceitos) | ARQ-002 A1; ARQ-001 A1; REQ-006 (emissão pelo próprio mecanismo) |
| Espaço único e plano, sem partições semânticas | ARQ-002 A2.3 e A2.5 (opacidade) |
| Convenção `CNC-nnn` legível sem significado arquitetural | Princípio obrigatório 3 (CTO, 21/07/2026); ARQ-002 A2.3 |
| Um conceito, um identificador permanente | Princípios obrigatórios 1 e 2; ADR-011 princípio 5; REQ-006 critério 1 |
| Emissão determinística e rastreável no ato de registro | Princípio obrigatório 4; REQ-006 (histórico); ARQ-001 A2.5 |
| Neutralidade da ordem de emissão (A3.6) | Revisão do CTO da ARQ-003 (21/07/2026); ARQ-002 A2.5 (opacidade) |
| Referência qualificada e uso pelos consumidores | ARQ-002 A5; ARQ-001 A4; ADR-008 Decisão 4 |
| Estabilidade das referências | ARQ-002 A7 |
| Independência entre espaços | ADR-008; ARQ-002 A3 |
| Fechamento do espaço (A6) | Revisão do CTO da ARQ-003 (21/07/2026); ARQ-002 A3 (autonomia) |
| Identidade preservada na migração | ADR-009 D8 |

## O que esta arquitetura não define

* Implementação técnica, persistência, distribuição ou resolução técnica dos identificadores (ADR-011, Decisão 7; ARQ-002).
* Regras para qualquer outro espaço de identificação, presente ou futuro.
* A execução da migração — disciplinada pela ADR-009; esta arquitetura apenas fornece os identificadores que o corte exigirá.
* A ordem de registro dos conceitos na migração — matéria do ato de execução do corte, sob a ADR-009.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; ADR-011 v1.0; ARQ-002 v1.0 |
| Deriva de | ARQ-002 (primeiro espaço criado sob a arquitetura geral — A1 e A6 da ARQ-002) |
| Serve a | Mecanismo de Conceitos Organizacionais (REQ-006 a REQ-009; ARQ-001); migração (ADR-009) |
| Origem | Deliberação arquitetural do CTO (21/07/2026), com quatro princípios obrigatórios; ANL-003 v1.0 (Lacuna Arquitetural Bloqueante que esta arquitetura extingue) |
| Gera | Gate de implementação do Mecanismo de Conceitos Organizacionais (ADR-006), quando autorizado |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação, incorporando os quatro princípios obrigatórios do CTO | Deliberação do CTO após a ARQ-002 — arquitetar o primeiro espaço de identificação | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Aprovada a convenção CNC-nnn; adicionados o princípio de neutralidade da ordem de emissão (A3.6) e a decisão de fechamento do espaço (A6 — nenhuma convenção estendida implicitamente a outros espaços) | Revisão do CTO — proteger a opacidade e a autonomia arquitetural dos espaços | **Aprovado — Lacuna Arquitetural Bloqueante da ANL-003 extinta** |

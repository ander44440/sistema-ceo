# ADR-011 — Criação da Capacidade de Identidade Organizacional

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO autorizou com escopo, princípios e restrições delimitados; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | A ANL-003 identificou a primeira Lacuna Arquitetural Bloqueante da organização: a ausência de arquitetura de Identidade Organizacional impede o início seguro da implementação da migração dos conceitos; o que era detalhe localizado revelou-se capacidade transversal |
| Baseado em quê | ANL-003 v1.0 (§3.1 e classificação da lacuna); revisão da ARQ-001 (remoção da convenção de identificadores); ADR-008 (princípio de independência dos espaços de identificação); ADR-009 D8 |
| Resultado | Aprovada v1.0 em 21/07/2026, com dois ajustes do CTO: princípio da permanência da identidade e decisão de neutralidade tecnológica |

## Status

Aprovada (v1.0 — CTO, 21/07/2026).

## Escopo e restrições

Esta ADR **institui a capacidade arquitetural** de Identidade Organizacional. Ela não define formatos de identificadores, prefixos, políticas de numeração, mecanismos de geração nem implementação técnica; não altera documentos aprovados; não modifica mecanismos existentes; não cria regras específicas para qualquer mecanismo individual. Esses assuntos pertencem às futuras arquiteturas específicas de identificação, que terão esta capacidade como fundamento.

## Contexto

A organização adotou, por decisões sucessivas e deliberadas, o adiamento da definição de identificadores: a ADR-009 (Decisão 8) não os definiu para a migração; a revisão da ARQ-001 removeu a convenção proposta ("CNC-nnn") por reconhecer impacto transversal; a ANL-003 constatou que essa pendência **bloqueia a implementação da migração** e a classificou como a primeira **Lacuna Arquitetural Bloqueante** da organização. Três mecanismos já dependem de identidades permanentes — o registro de normas (REQ-002), a autoridade semântica (REQ-006/ARQ-001) e a própria documentação (PREFIXO-nnn) — e cada novo mecanismo repetirá a mesma necessidade. Individualizar elementos permanentemente não é um detalhe de cada mecanismo: é uma capacidade da organização.

## Decisões

### Decisão 1 — Instituição e finalidade

Fica instituída a **Identidade Organizacional** como **capacidade arquitetural transversal do CEO**.

Sua finalidade organizacional é garantir que todo elemento da organização que precise de existência individualizada — norma, conceito, documento, competência ou qualquer elemento futuro — possa ser **individualizado de forma permanente e não ambígua**, ao longo de toda a vida da organização, independentemente do mecanismo que o administre.

### Decisão 2 — Responsabilidades arquiteturais

A capacidade de Identidade Organizacional é responsável por:

1. **Fundamentar a individualização permanente** dos elementos da organização: uma identidade, uma vez atribuída, nunca é reutilizada, renumerada ou reatribuída a outro elemento.
2. **Disciplinar os espaços de identificação** da organização, preservando o princípio já aprovado de que os espaços são independentes entre si (ADR-008): cada mecanismo permanece responsável pelo seu próprio espaço, e a capacidade fornece o fundamento comum que evita modelos paralelos e contraditórios.
3. **Servir de fundamento às arquiteturas específicas de identificação** — os documentos que, para cada mecanismo, definirão formato, prefixo, numeração e geração de identificadores derivarão desta capacidade, nunca de decisões locais isoladas.

### Decisão 3 — Princípios fundamentais

Ficam estabelecidos os princípios fundamentais da capacidade (CTO, 21/07/2026):

1. **A identidade organizacional representa exclusivamente a individualização permanente dos elementos da organização.**
2. **A identidade é independente da estrutura, do conteúdo, do estado ou da implementação do elemento identificado.** O elemento pode evoluir, mudar de estado ou de forma; sua identidade permanece.
3. **A existência de uma identidade organizacional não altera nem substitui as responsabilidades próprias do mecanismo que utiliza essa identidade.** Identificar não é registrar, resolver, evoluir nem admitir.
4. **A capacidade de Identidade Organizacional deverá ser reutilizável por qualquer mecanismo presente ou futuro da organização.**
5. **A identidade organizacional é permanente** (princípio arquitetural — revisão do CTO, 21/07/2026): uma identidade, uma vez atribuída a um elemento, jamais poderá ser reutilizada para representar outro elemento, ainda que o elemento original deixe de existir ou seja descontinuado. A permanência é característica arquitetural da identidade, e não apenas responsabilidade operacional dos mecanismos (Decisão 2.1).

### Decisão 4 — Relação com os mecanismos organizacionais existentes

* **Mecanismo de Conceitos Organizacionais:** primeiro consumidor previsto. A exigência já aprovada — espaço próprio de identificação, identificadores permanentes (REQ-006; ARQ-001 A2) — permanece inalterada; a futura arquitetura específica de identificação dos conceitos derivará desta capacidade e, quando aprovada, extinguirá a Lacuna Arquitetural Bloqueante registrada na ANL-003.
* **Registro canônico de normas (REQ-002) e demais mecanismos:** as necessidades de identificação existentes permanecem regidas pelas normas que as criaram; futuras arquiteturas específicas, quando necessárias, derivarão desta capacidade.
* **Identificação documental vigente (PREFIXO-nnn):** permanece válida como está. Esta ADR não reabre, não reversiona e não reinterpreta identificadores já emitidos — a capacidade nasce para o futuro, sem efeito retroativo sobre identidades existentes.
* **Documentos e tipos documentais:** nenhuma relação de subordinação nova é criada; a capacidade subordina-se à CON-001 como toda a arquitetura.

### Decisão 5 — Natureza e posicionamento documental

A Identidade Organizacional é uma **capacidade arquitetural**, categoria distinta das capacidades de domínio do CAP-001:

* **Não integra o CAP-001** nem cria uma CAP-13: pelo teste já firmado (ADR-003, Decisão 2; ANL-002 §4), capacidades de domínio descrevem o que o CEO faz pelo usuário; a Identidade Organizacional é infraestrutura interna que torna os mecanismos consistentes entre si.
* Distingue-se também dos **mecanismos arquiteturais** (BCO, autoridade semântica), que servem a capacidades específicas: a Identidade Organizacional é **transversal** — reutilizável por qualquer mecanismo presente ou futuro (princípio 4).
* Sua instituição, finalidade, princípios e limites são governados por esta ADR; suas derivações concretas nascerão como arquiteturas específicas (tipo ARQ — ADR-010), cada uma pelo gate próprio da governança.

### Decisão 6 — Limites de atuação

A capacidade de Identidade Organizacional **não**:

* define formatos, prefixos, numeração ou geração de identificadores — matéria das arquiteturas específicas de identificação;
* registra, resolve, evolui ou admite elementos — responsabilidades dos mecanismos consumidores (princípio 3);
* interpreta o conteúdo, a estrutura ou o estado dos elementos identificados (princípio 2);
* unifica os espaços de identificação — a independência entre espaços (ADR-008) permanece;
* define implementação técnica, tecnologia ou ferramenta.

### Decisão 7 — Neutralidade tecnológica

**A capacidade de Identidade Organizacional é tecnologicamente neutra.**

Sua existência e seus princípios independem da forma como as identidades serão futuramente implementadas, armazenadas, resolvidas ou distribuídas. Qualquer solução futura deverá conformar-se aos princípios da Decisão 3 — nunca o contrário. Esta decisão reforça a separação entre arquitetura e implementação; não define mecanismos de persistência, resolução de identificadores nem tecnologia.

## Alternativas consideradas

* **Criar CAP-13 no mapa de capacidades:** rejeitada — reprovaria no teste da matriz CON → VIS → CAP e no precedente da ADR-003/ANL-002 (infraestrutura interna não é capacidade de domínio).
* **Deixar cada mecanismo definir sua identificação localmente:** rejeitada — foi exatamente o que a revisão da ARQ-001 evitou; produziria os modelos paralelos que a diretriz de reutilização proíbe e repetiria a lacuna a cada novo mecanismo.
* **Definir desde já a arquitetura de identificação (formatos, prefixos, geração):** rejeitada — anteciparia decisões que pertencem às arquiteturas específicas, violando as diretrizes desta autorização.

## Resultado esperado

A organização passa a possuir uma capacidade arquitetural oficialmente reconhecida de Identidade Organizacional, apta a servir de fundamento para futuras arquiteturas específicas de identificação — a primeira delas, quando autorizada, destinada a extinguir a Lacuna Arquitetural Bloqueante que hoje condiciona a migração dos conceitos organizacionais.

## Rastreabilidade

- Norma superior: CON-001 v1.0 (Art. 5º, 7º, 8º).
- Origem: ANL-003 v1.0 (§3.1 e classificação "Lacuna Arquitetural Bloqueante"); deliberação arquitetural do CTO (21/07/2026) com quatro princípios obrigatórios.
- Baseia-se em: ADR-008 (independência dos espaços de identificação); ADR-009 D8; revisão da ARQ-001 (21/07/2026); ADR-003/ANL-002 (distinção capacidade × mecanismo).
- Gera: futuras arquiteturas específicas de identificação (tipo ARQ), mediante autorização da governança; caminho para a extinção da lacuna registrada na ANL-003.

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação, incorporando os quatro princípios obrigatórios do CTO | Deliberação do CTO após a ANL-003 — instituir a capacidade transversal | Aprovada com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionados o princípio 5 — "a identidade organizacional é permanente" (identidade jamais reutilizada, mesmo se o elemento deixar de existir) — e a Decisão 7 — neutralidade tecnológica da capacidade | Revisão do CTO — consolidar a permanência como característica arquitetural e reforçar a separação entre arquitetura e implementação | **Aprovada — capacidade de Identidade Organizacional instituída** |

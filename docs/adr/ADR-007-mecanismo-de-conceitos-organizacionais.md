# ADR-007 — Existência e responsabilidade do mecanismo de conceitos organizacionais

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO identificou o problema estrutural e autorizou a ADR; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | Conceitos organizacionais normativos estão distribuídos entre documentos, com duplicação controlada apenas por disciplina manual — comportamento que caracteriza uma decisão arquitetural da organização tomada por omissão |
| Baseado em quê | Análise metodológica da revisão do REQ-005; registro de aprendizado `docs/learning/2026-07-21-conceitos-organizacionais.md`; casos concretos: "decisão sob governança" (REQ-003), "item de conhecimento" (ANL-001 §2 e REQ-004), "Contexto de Trabalho" (REQ-005) |
| Resultado | Aprovada v1.0 em 21/07/2026, com dois ajustes do CTO: autoridade semântica oficial e princípio de proibição de definição local. A CAP-04 permanece suspensa antes do Grupo D até deliberação do CTO |

## Status

Aprovada (v1.0 — CTO, 21/07/2026).

## Contexto

A Fase 1 produziu três definições com força normativa, cada uma vivendo no documento que primeiro precisou dela. O caso "item de conhecimento" já exibe o sintoma do problema: a mesma definição existe em dois documentos e permanece idêntica apenas por disciplina manual. Sem decisão explícita, a organização já *tem* uma arquitetura de conceitos — distribuída e frágil. Esta ADR decide **apenas a existência e a responsabilidade arquitetural** de um mecanismo oficial; formato, estrutura documental e implementação ficam expressamente fora.

## Decisão

### 1. Existência

**O CEO deve possuir um mecanismo oficial de conceitos organizacionais.**

### 2. Responsabilidade arquitetural

**O mecanismo de conceitos organizacionais constitui a autoridade semântica oficial do CEO, responsável por manter a definição normativa única e vigente de cada conceito organizacional.**

Ele não é apenas um repositório: é a referência oficial para o significado dos conceitos utilizados pela organização. Dessa responsabilidade decorrem:

* deter a definição oficial de cada conceito, com identificador permanente e histórico de evolução registrado com os cinco campos da Memória Organizacional (CON-001, Art. 8º);
* garantir que cada conceito tenha exatamente uma definição vigente;
* ser a referência obrigatória: todo documento que utilizar um conceito o **referencia** pelo identificador — nunca copia a definição.

### Princípio arquitetural

**Nenhum documento pode alterar o significado de um conceito organizacional por definição local.**

Caso seja necessária a alteração de um conceito, ela ocorre primeiro no mecanismo oficial de conceitos; os documentos consumidores são apenas referências a essa definição.

### 3. Problemas que resolve

* **Divergência silenciosa:** elimina a possibilidade de o mesmo termo evoluir de forma diferente em documentos distintos.
* **Duplicação manual:** encerra a manutenção por disciplina (o sintoma já observado com "item de conhecimento").
* **Ambiguidade entre revisores:** critérios de aceitação que usam conceitos passam a ser interpretáveis de forma única — condição de objetividade exigida desde o REQ-002.
* **Rastreabilidade conceitual:** a evolução de um conceito passa a ter histórico próprio, em vez de se diluir nos históricos dos documentos que o citam.

### 4. Problemas que NÃO resolve

* **Qualidade das definições:** o mecanismo guarda e serve definições; defini-las bem continua sendo responsabilidade das alçadas de governança (CTO propõe/revisa, Usuário aprova).
* **Aplicação em contexto:** interpretar e aplicar um conceito em cada requisito, decisão ou operação continua sendo responsabilidade do documento ou processo que o usa.
* **Comportamento:** conceito define linguagem, não obriga conduta — normas continuam sendo o instrumento de obrigação (CAP-01, REQ-002/REQ-003).
* **Conhecimento e memória:** o mecanismo não organiza conhecimento reutilizável (CAP-04) nem registros históricos (CAP-05); conceitos são vocabulário normativo, não acervo.
* **Adoção:** garantir que agentes usem os conceitos oficiais é responsabilidade da governança e de sua distribuição (CAP-01; REQ-001).

### 5. Relação com os demais documentos

* **Constituição:** o mecanismo é subordinado à CON-001 (Art. 5º e 7º §4º). Termos definidos na própria Constituição prevalecem sobre o mecanismo; nesse caso, o mecanismo apenas os referencia.
* **REQs, ADRs, ANLs, CAPs e demais documentos:** consomem conceitos por referência ao identificador permanente. A definição oficial vive exclusivamente no mecanismo.
* **REQ-001 (distribuição):** conceitos organizacionais integram o conjunto de regras de governança distribuídas a qualquer agente conectado — um agente que não compartilha o vocabulário não pode obedecer às normas que o usam.
* **REQ-002 (registro canônico):** o mecanismo segue o mesmo princípio arquitetural — fonte canônica única, identificadores permanentes, histórico — aplicado a conceitos em vez de normas. Se será o mesmo registro ou um registro próprio é decisão futura, fora desta ADR.

### Disposição transitória

Enquanto o mecanismo não for definido (formato e estrutura são decisões futuras), vale o regime provisório já em vigor: cada definição oficial permanece no documento em que o CTO a estabeleceu, citada por referência e nunca copiada. Após a definição do mecanismo, as três definições existentes serão migradas, permanecendo nos documentos de origem apenas a referência.

## Fora do escopo desta ADR

* Formato do mecanismo (documento, registro, glossário ou outro).
* Estrutura documental, tipo, identificadores concretos e localização (a eventual criação de tipo documental seguirá a regra do catálogo — nascer por ADR própria).
* Implementação, armazenamento ou tecnologia.
* A migração em si das definições existentes (executada quando o formato for decidido).

## Alternativas consideradas

* **Manter definições distribuídas com disciplina manual:** rejeitada — o sintoma de duplicação já se manifestou; a divergência silenciosa é questão de tempo.
* **Centralizar conceitos na Constituição:** rejeitada — a CON-001 mudaria a cada conceito novo, com alçada de emenda pesada (Art. 11), misturando norma fundamental com vocabulário operacional.
* **Tratar conceitos como itens de conhecimento (CAP-04):** rejeitada — pela fronteira oficial, conhecimento informa e não obriga; conceitos organizacionais têm força normativa e pertencem à governança.

## Rastreabilidade

- Norma superior: CON-001 Art. 5º, 7º §4º, 8º.
- Origem: suspensão da CAP-04 e autorização do CTO (21/07/2026); análise metodológica da revisão do REQ-005; `docs/learning/2026-07-21-conceitos-organizacionais.md`.
- Relaciona-se com: REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, ANL-001.
- Gera: decisão futura de formato/estrutura do mecanismo; migração das definições existentes.

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação | Autorização do CTO — problema estrutural de governança identificado | Aprovada com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Responsabilidade reformulada como autoridade semântica oficial; adicionado princípio arquitetural: nenhum documento altera significado de conceito por definição local | Revisão do CTO | **Aprovada — mecanismo decidido em existência e responsabilidade** |

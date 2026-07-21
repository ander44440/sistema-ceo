# ADR-013 — Decisões estruturais do ciclo da Distribuição de Governança

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO deliberou as quatro questões do §11 da ANL-004 e autorizou o registro; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | A ANL-004 (homologada em 21/07/2026) identificou quatro questões estruturais que condicionavam o início dos REQs da Distribuição de Governança; o CTO as deliberou, e as deliberações precisam de registro vinculante antes de fundamentar qualquer etapa posterior (ADR-006, etapa 2; CON-001, Art. 8º) |
| Baseado em quê | ANL-004 v1.0 (§4, §5, §6, §7, §10 e §11); REQ-001; REQ-002 v1.0; REQ-009 v1.0; ADR-008 v1.0 (D5); ADR-006 (fluxo oficial e gates) |
| Resultado | Homologada v1.0 em 21/07/2026, com os dois ajustes da revisão do CTO incorporados; decisões estruturais do ciclo em vigor |

## Status

Homologada (v1.0 — CTO, 21/07/2026).

## Escopo e restrições

Esta ADR registra **exclusivamente as decisões estruturais** do ciclo da Distribuição de Governança, deliberadas pelo CTO em 21/07/2026 sobre as questões da ANL-004 (§11), e seus encaminhamentos. Ela não cria requisitos, não define arquitetura e não especifica implementação — matérias das etapas próprias do fluxo oficial (ADR-006), cada uma pelo seu gate.

## Decisões

### Decisão 1 — Composição do pacote de governança

**O pacote de governança distribuído aos agentes conectados é composto por: a Constituição (CON-001), as normas de governança vigentes e os conceitos organizacionais.**

* A decisão resolve a pendência registrada desde a ANL-003 (§6) e confirmada pela ANL-004 (§4): a inclusão dos conceitos, até então amparada apenas em documentos arquiteturais e preparatórios (ADR-007 §5; ADR-008 D5; ANL-002 §3), passa a ser decisão estrutural registrada.
* **Encaminhamento:** a formalização em nível de requisito ocorrerá no **enunciado do primeiro REQ do Grupo A** (Pacote de Governança — ANL-004 §10), no gate próprio. Esta ADR decide a composição; o REQ a formalizará como obrigação verificável, com seus critérios de aceitação.
* **No estado atual da organização, o pacote é composto exclusivamente pelos elementos acima. Alterações futuras dependerão de nova deliberação de governança**, precedida de norma que as ampare (ANL-004 §4).

### Decisão 2 — Sequência oficial do ciclo: S2 — Frentes Paralelas

**Fica adotada a sequência S2 da ANL-004 (§6.2): os requisitos da Distribuição de Governança e a materialização do registro canônico de normas (REQ-002) correm em frentes paralelas.**

* **Frente 1 — Distribuição:** REQs do Grupo A em diante, na ordem recomendada pela ANL-004 (§10: A → B → C → D), cada um pelo gate próprio.
* **Frente 2 — Registro canônico de normas:** a materialização do REQ-002 entra no fluxo oficial pela etapa cabível (ADR-006, não retroatividade) — sua Arquitetura, uma vez autorizado o gate correspondente pela governança.
* **Princípio organizacional de sincronização:** **a implementação do canal de distribuição permanece condicionada à disponibilidade operacional das fontes canônicas correspondentes aos elementos do pacote definidos nesta ADR.**
* *Consequência operacional do gate de Implementação:* a verificação da disponibilidade das fontes — para cada conteúdo da Decisão 1, fonte canônica operacional e resolúvel (hoje: Constituição e conceitos prontos; normas dependem da Frente 2 — ANL-004 §6.1, D1) — é condição de abertura do gate, no padrão de análise de prontidão validado pela ANL-003.
* Este é o primeiro caso de paralelismo entre frentes na organização: cada frente conserva seus próprios gates e alçadas; o paralelismo não dispensa nenhuma etapa do fluxo oficial em nenhuma das frentes.

### Decisão 3 — Abertura do fluxo de admissão do conceito "Agente Conectado"

**Fica autorizada a abertura do fluxo regular de admissão do conceito "Agente Conectado" no Mecanismo de Conceitos Organizacionais.**

* A admissão segue integralmente o fluxo oficial do mecanismo: proposta e decisão formal de admissão (REQ-009), pela alçada de governança vigente; em caso de aprovação, registro na autoridade semântica (REQ-006) com identificador emitido conforme a ARQ-003. **Esta ADR é o artefato autorizador rastreável da abertura** — não da aprovação, que pertence à alçada da admissão.
* Será a **primeira admissão pós-migração**, exercitando o mecanismo no seu fluxo regular (a migração usou o regime excepcional de regularização da ADR-009).
* **Encaminhamento:** a definição a propor deverá delimitar os elementos levantados na ANL-004 (§5) — o que caracteriza estar conectado, o alcance quanto a humanos e IAs, e o ciclo do vínculo. A admissão **precede ou acompanha o Grupo B** (Vínculo de Distribuição): nenhum REQ utilizará "agente conectado" em critérios de aceitação antes de o conceito estar registrado (ANL-004 §6.1, D2).

### Decisão 4 — Ratificação da fronteira documental × técnica da Fase 1

**Fica ratificada, para o ciclo da Distribuição de Governança, a fronteira delimitada pela ANL-004 (§7):**

* a composição do pacote, as fontes e sua precedência, o vínculo dos destinatários, as garantias de versão e o rastro da distribuição são **especificáveis e implementáveis documentalmente** na fase atual, sob `/docs`;
* a entrega automática a agentes em ferramentas externas, a propagação ativa de atualizações e qualquer resolução técnica em tempo de uso são **dependentes de implementação técnica futura**: serão especificadas (requisitos e arquitetura) na fase atual, com implementação técnica explicitamente remetida a fase futura — nunca improvisada dentro do ciclo documental.

Esta ratificação preserva a regra da Fase 1 (nenhuma linha de código sem requisito aprovado e arquitetura decidida) e a neutralidade tecnológica já praticada pela organização.

## Encaminhamentos consolidados

| Decisão | Destrava | Condição |
|---------|----------|----------|
| D1 — Composição do pacote | Primeiro REQ do Grupo A (formaliza a composição no enunciado) | Gate de REQ (ADR-006, etapa 3) |
| D2 — Sequência S2 | Frente 1 (REQs da Distribuição) e Frente 2 (materialização do REQ-002), em paralelo | Cada frente pelos próprios gates; implementação do canal condicionada à prontidão das fontes |
| D3 — Admissão de "Agente Conectado" | Fluxo regular de admissão (REQ-009 → REQ-006) | Alçada da admissão; precede ou acompanha o Grupo B |
| D4 — Fronteira documental × técnica | Redação de REQs e arquitetura do ciclo com delimitação de fase explícita | Vigente para todo o ciclo |

## Alternativas consideradas

* **S1 — Fonte antes do canal:** rejeitada — adiaria o ciclo da Distribuição por um ciclo inteiro de outra frente, sem necessidade: a disciplina de sincronização da Decisão 2 obtém a mesma garantia (canal não implementa sem fontes prontas) sem o custo serial (ANL-004 §6.2).
* **S3 — Distribuição escopada por fonte:** rejeitada — criaria um estado intermediário oficial ("pacote parcial") com disciplina própria de conclusão; com a Frente 2 correndo em paralelo, o benefício de antecipação não compensa o custo do regime parcial (ANL-004 §6.2 e §9.3).
* **Formalizar a composição do pacote em ADR própria, com REQ apenas consumindo-a:** rejeitada — a composição é matéria natural do enunciado do primeiro REQ do Grupo A (obrigação verificável com critérios de aceitação); a ADR registra a decisão estrutural e delega a formalização ao instrumento adequado, evitando duplicidade normativa.
* **Tratar as deliberações como registradas apenas na conversa de governança:** rejeitada — artefato fora do fluxo é não oficial (ADR-006); decisões estruturais exigem registro com os cinco campos (CON-001, Art. 8º).

## Rastreabilidade

- Norma superior: CON-001 v1.0 (Art. 5º, 7º §3º, 8º); ADR-006 (etapa 2 — ADR condicional).
- Origem: deliberação do CTO (21/07/2026) sobre as quatro questões do §11 da ANL-004 v1.0; autorização de redação do CTO (21/07/2026).
- Baseia-se em: ANL-004 v1.0 (§4 a §11); REQ-001; REQ-002 v1.0; REQ-009 v1.0; ADR-008 v1.0 (D5); ARQ-003 v1.0 (emissão de identificadores para a admissão futura).
- Relaciona-se com: ADR-009 (precedente de artefato autorizador de admissões); ANL-003 (pendência do §6, resolvida pela Decisão 1; padrão de análise de prontidão, reutilizado na Decisão 2).
- Gera: primeiro REQ do Grupo A (Frente 1); abertura do gate de Arquitetura da Frente 2, quando autorizado; fluxo de admissão de "Agente Conectado"; delimitação de fase vigente para todo o ciclo.

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação, registrando as quatro deliberações do CTO e seus encaminhamentos | Autorização do CTO (21/07/2026), após recomendação aprovada pós-homologação da ANL-004 | Aprovada com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou os ajustes | Dois ajustes: composição do pacote registrada como estado atual da decisão, sem exclusão permanente (D1); disciplina de sincronização reformulada como princípio organizacional, com a verificação mantida como consequência operacional do gate (D2) | Revisão do CTO — escopo de ADR confirmado, rastreabilidade íntegra, sem violações do fluxo oficial | **Homologada — decisões estruturais do ciclo da Distribuição em vigor** |

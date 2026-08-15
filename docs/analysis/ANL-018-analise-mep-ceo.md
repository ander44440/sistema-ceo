# ANL-018 — Análise da Memória de Evolução do Produto CEO (MEP-CEO)

> **Status:** **Aprovada** — v1.0 (CTO, 14/08/2026).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Identificação:** ANL-018 (ANL-001…017 ocupados).  
> **Mandato:** Despacho CTO — regularizar a especificação MEP-CEO **antes da homologação**.  
> **Deliberação posterior:** CAP-13 instituída por [`ADR-020`](../adr/ADR-020-institui-cap-13-memoria-evolucao-produto.md). Esta ANL **não** foi reescrita; o §3 permanece o parecer que o CTO aceitou.  
> **Lastro:** VIS-009 v0.1; REQ-085 v0.1; ARQ-033 v0.1 (rascunhos técnicos **aprovados**, **não** homologados); CON-001; CAP-001 v1.1; ADR-002; ADR-003; ADR-005; ADR-006; ADR-008; ADR-010; ADR-011; ADR-016; ADR-017; **ADR-020**; ARQ-002; ARQ-006; ARQ-007; ARQ-009; ARQ-031; ARQ-032.  
> **Proibições:** não implementa; não cria C3; não abre IMP; não toca CAP-04, CAP-05, Motor, Gate G2, MTE, `monitorar`; **não altera** o contrato de isolamento Produto ↔ Organização.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise de capacidade da MEP-CEO: necessidade do eixo Produto, fronteiras, isolamento, autoridade, evidência, histórico, atribuição de CAP, transições de maturidade, identificadores, dependências reais e ADRs que (não) se justificam. |
| **Por que existe?** | VIS-009 / REQ-085 / ARQ-033 nasceram antes da ANL. O fluxo oficial (ADR-006) exige ANL como gate. Sem esta análise, a homologação seria irregular. |
| **Para quem existe?** | CTO (deliberar CAP, IDs, transições, ADRs); Usuário (aval de nova CAP, se for o caso); Engenheiro (espera homologação — sem IMP). |
| **Como medir sucesso desta ANL?** | (1) Questão de CAP registada formalmente, com alternativas avaliadas e **recomendação** explícita — não atribuição silenciosa; (2) tabela de transições fechada; (3) espaços de ID definidos; (4) dependências só as reais; (5) ADRs necessários vs desnecessários; (6) zero código. |

---

## Questão formal de capacidade

> **MEP-CEO exige atribuição de CAP.**

ADR-006: todo REQ rastreia **exactamente uma** capacidade do CAP-001. REQ-085 estava em rascunho **sem** CAP. Esta ANL **não** atribui CAP no seu texto de análise: avalia alternativas e **recomenda**. A atribuição ocorreu **depois**, por deliberação do CTO e [`ADR-020`](../adr/ADR-020-institui-cap-13-memoria-evolucao-produto.md) (**CAP-13**).

**Proibido:** absorver em CAP-04 ou CAP-05.

---

## 1. Objetivo da capacidade (necessidade do eixo Produto)

O Sistema CEO precisa de uma capacidade cujo objecto é o **produto** Sistema CEO — não a organização que o usa.

**Necessidade verificada**

| Evidência | Conclusão |
|-----------|-----------|
| CAP-04 / ARQ-031 / CNC-002 | Património **reutilizável da organização**, independente de uma decisão específica |
| CAP-05 / VIS-004 / REQ-033 / ARQ-009 H | Registos históricos de factos, decisões e contextos da **organização / COA** (CON-001 Art. 8º) |
| VIS-001 §4 | O produto evolui (governança, conhecimento, execução, aprendizado) — mas o mapa CAP-001 descreve o que o CEO **faz pelo utilizador**, não a memória de **si como produto** |
| Contrato CTO 14/08/2026 + VIS-009 | Lacuna estrutural: sem eixo Produto, a evolução mistura-se com memória de cliente **ou** não deixa rastro próprio |

**Objectivo da capacidade (quando atribuída):** manter a memória institucional da evolução do **produto** — capacidades de produto, épicos, módulos, decisões de produto, evidências, pendências, baselines, roadmap de produto e histórico append-only — com isolamento absoluto do eixo organização / cliente.

Isso fortalece os pilares **Conhecimento** (do produto) e **Governança** (rastro e alçadas). Não substitui CAP-04 nem CAP-05.

---

## 2. Limites (fronteira e isolamento)

O contrato de isolamento **não se altera** nesta ANL. Confirma-se.

### 2.1 O que é da MEP-CEO

* Catálogo de evolução do **produto**.  
* Estados de maturidade e de trabalho dos objectos de produto.  
* Decisões **de produto** (distintas das decisões Art. 8º da organização).  
* Evidências de origem de mudanças de produto.  
* Baselines e roadmap **de produto**.  
* Eventos de evolução append-only.

### 2.2 O que não é da MEP-CEO

| Fronteira | Pertence a | Critério |
|-----------|------------|----------|
| Item de conhecimento reutilizável da organização (`KNW-nnn`) | **CAP-04** | CNC-002; ANL-001 §2 |
| Decisão / facto / contexto da organização (cinco campos) | **CAP-05** | CON-001 Art. 8º; definição CTO 21/07/2026 |
| Dados, conversas, conhecimento operacional, decisões privadas, factos de clientes | Eixo organização / cliente | REQ-085 RF-01 — **recusa automática** |
| Normas e sua vigência | **CAP-01** | Norma obriga; memória de produto informa o que o produto é |
| Competências observadas em IAs; ciclo BCO | **CAP-06** / BCO | Competência ≠ objecto de produto |
| Visibilidade do andamento e da cadeia em tempo de execução | **CAP-09** | Observar ≠ ser a memória |
| Condução do patrocinador no COA (I/J) | ARQ-009 | Fora do eixo Produto |
| Motor, Gate G2, MTE, `monitorar` | Frentes alheias | RNF-05 |
| Ponte C3 (proposta desidentificada) | Futuro | RF-08 — **não implementar agora** |

### 2.3 Isolamento de dados de clientes (verificação)

A ANL verifica que RF-01 / ARQ-033 C1 já fecham o perímetro:

1. Escrita automática na MEP-CEO dos cinco tipos proibidos = recusada.  
2. Referência por ID externo **sem** cópia de conteúdo = permitida (P3).  
3. Na dúvida de pertença, o item **não** entra (P2).  
4. C3, se um dia existir, só produz `CONCEBIDO` / hipótese desidentificada.

**Nenhum ajuste de isolamento é necessário para homologar a fronteira.** Qualquer alargamento seria nova deliberação — não esta ANL.

---

## 3. Avaliação das alternativas de CAP

Critério: o objecto da capacidade no CAP-001 tem de **ser** a memória de evolução do produto, não apenas *tocá-la*.

### 3.1 Nova CAP (CAP-E)

| | |
|--|--|
| **Leitura** | O domínio «memória do produto» **não** está no CAP-001 (CAP-01…12). ADR-017: CAP-E cria capacidade estratégica nova. IDs CAP-01…12 são permanentes (não reutilizados); **não** proíbem CAP-13. |
| **A favor** | Objecto único; ADR-006 fica satisfeito com uma CAP dona; evita reabrir baselines 04/05/01; C1–C3 têm sede; VIS/REQ/ARQ já descrevem um ciclo de capacidade, não um mecanismo auxiliar. |
| **Contra** | Emenda ao CAP-001 (Usuário + CTO); ADR estrutural obrigatória; infla o mapa. |
| **Veredicto desta ANL** | **Recomendada.** Única alternativa que não distorce uma CAP homologada nem viola a proibição 04/05. |

Nome candidato (não vinculante): **CAP-13 — Memória de Evolução do Produto.** Classificação: **CAP-E**. Identificador permanente só após ADR + aval do Usuário.

### 3.2 CAP-09 — Observabilidade

| | |
|--|--|
| **Leitura** | «Tornar visível o andamento e a rastreabilidade.» Cadeia requisito → … → deploy (CON-001 Art. 8º §3º). **Fora do escopo:** registrar as decisões em si (CAP-05); intervir na execução. |
| **A favor** | A cadeia de rastreio do **produto** é o que a MEP-CEO historiciza; CAP-09 seria consumidora natural. |
| **Contra** | Observabilidade **mostra**; MEP-CEO **guarda** objectos (capacidades, épicos, baselines, decisões de produto). CAP-09 proíbe registar decisões — a MEP-CEO **tem** o objecto Decisão de produto. Absorver forçaria a CAP-09 a ser memória, contra a sua definição. Ciclo CAP-09 **não** está aberto; seria reabertura silenciosa. |
| **Veredicto** | **Rejeitada como CAP dona.** Relação futura: CAP-09 **consome** a MEP-CEO (visibilidade). Não é dependência actual para existir a memória. |

### 3.3 CAP-06 — Aprendizado

| | |
|--|--|
| **Leitura** | Aprender sobre o utilizador; absorver competências observáveis de outras IAs; ciclo Observação → Hipótese → Validação → Aprovação → Evolução contínua. BCO é mecanismo candidato, **não** capacidade (ADR-003 D2). |
| **A favor** | Analogia de maturação com os estados CONCEBIDO…BASELINE; C3 futuro poderia nascer de observação. |
| **Contra** | Objecto do CAP-06 = competências / utilizador / IAs, **não** catálogo de produto. BCO guarda competências, não épicos/módulos/baselines. REQ-051 (Aprendizado Executivo) é retenção **pós-deliberação organizacional**. Misturar faria o aprendizado copiar cliente para produto — exactamente o que RF-01 proíbe. |
| **Veredicto** | **Rejeitada como CAP dona.** Relação futura: analogia de ciclo; C3 poderá **propor** evolução de produto sem ser CAP-06. Sem dependência real agora. |

### 3.4 CAP-01 — Governança (avaliada porque o CTO pediu)

| | |
|--|--|
| **Leitura** | Estabelecer, distribuir e manter **normas** para qualquer agente. Baseline Autoridade Delegada **encerrada**. **Fora do escopo:** armazenar o histórico das decisões (CAP-05). |
| **A favor** | Alçadas, homologação, hipótese≠facto, append-only são **governação**. A MEP-CEO **consome** CON-001 Art. 6º e o espírito da ARQ-032 («não criar novo dono da missão»). |
| **Contra** | Objecto da CAP-01 = **regras**, não o catálogo do que o produto é. Histórico de decisões está explicitamente fora. Reabrir a baseline CAP-01 para uma memória de produto seria expansão silenciosa. Autoridade Delegada não homologa baseline de produto por omissão (REQ-085 RN-05.2). |
| **Veredicto** | **Rejeitada como CAP dona.** Dependência **real de consumo**: a MEP-CEO usa as alçadas da CAP-01 / CON-001; não é um capítulo da CAP-01. |

### 3.5 CAP-04 e CAP-05

**Rejeitadas por contrato do CTO e por objecto** (ANL-001 §2; CNC-002). Não reavaliar como sede.

### 3.6 CAP-R (consolidação)

**Rejeitada.** CAP-R aprimora baseline **já homologada** a partir de OE (ADR-017). A MEP-CEO não é OE da CAP-04/05/09. Não há baseline de produto a consolidar — a baseline **é o objecto** a criar.

### 3.7 Mecanismo sem CAP (padrão BCO)

**Rejeitada.** BCO não tem ciclo VIS→REQ. A MEP-CEO já tem VIS-009, REQ-085, ARQ-033. Tratar como mecanismo deixaria REQ-085 sem CAP, em violação da ADR-006.

### 3.8 Recomendação de CAP (não é atribuição)

| Decisão | Conteúdo |
|---------|----------|
| **Recomendação técnica** | Nova **CAP-E**, identificador candidato **CAP-13 — Memória de Evolução do Produto**. |
| **O que esta ANL não faz** | Não emenda o CAP-001. Não preenche o campo Capacidade do REQ-085. Não cria a ADR. |
| **Condição de homologação** | CTO delibera a CAP; se aceitar CAP-13, **aí sim** uma ADR (ver §12) + aval do Usuário no CAP-001. |

---

## 4. Autoridade, evidência e histórico (verificação)

A ANL confirma que REQ-085 RF-05…07 / ARQ-033 P4–P6 são **suficientes** como contrato. O que faltava era **operacionalizar transições** (§8) e **IDs** (§9).

| Tema | Estado na spec rascunho | Lacuna fechada nesta ANL? |
|------|-------------------------|---------------------------|
| Agente: registar / organizar / consultar / propor | RF-05 | Sim — reflectido em §8 (quem propõe vs quem promove) |
| Agente não homologa baseline | RF-05 | Sim — só Usuário (+ CTO recomenda) promove a `BASELINE` |
| Agente não apaga histórico | RF-07 | Sim — nenhuma transição destrói estado anterior |
| Hipótese ≠ facto | RF-05; `CONCEBIDO` = hipótese | Sim — promoção a facto começa em `DEFINIDO` com alçada, não pelo agente sozinho |
| Evidência em mudança relevante | RF-06 | Sim — transições listadas em §8 são mudanças relevantes |
| Append-only | RF-07 | Sim — reversão = novo evento; baseline nova = novo ID |

**Relação com Governança:** a MEP-CEO **não** emite normas. Usa a hierarquia CON-001 e as alçadas já existentes. CAP-01 permanece a sede das regras; a MEP-CEO é o **registo de evolução do produto sob essas regras**.

**Relação futura com Aprendizado:** C3 (não construir agora) é o único canal em que uma observação em cliente poderia virar **hipótese de produto**. CAP-06 / BCO **não** alimentam C2. REQ-051 não escreve a MEP-CEO. Qualquer ligação futura exige ciclo próprio.

---

## 5. Dependências (somente as reais)

Regra do despacho: BCO, kernel `sistema-ceo`, CAP-01, CAP-06, CAP-09 **só** se a ANL demonstrar dependência real.

| Alvo | Dependência real agora? | Natureza | Consequência |
|------|-------------------------|----------|--------------|
| **CAP-01** | **Sim — consumo** | Alçadas de homologação / autoridade máxima do Usuário / «não novo dono da missão» | MEP-CEO **usa** CAP-01; não a reabre |
| **CAP-04** | Não (fronteira negativa) | Isolamento | Não absorver; não emendar |
| **CAP-05** | Não (fronteira negativa) | Isolamento | Não absorver; não emendar |
| **CAP-06** | **Não** | Analogia de maturação; C3 futuro | Não acoplar; não BCO |
| **BCO** | **Não** | Mecanismo de competências organizacionais (ADR-002 D4) | Objecto diferente; sem contrato |
| **CAP-09** | **Não agora** | Consumidor futuro (visibilidade) | Não dona; não abrir CAP-09 |
| **CAP-10** | Latente, não bloqueante | Limites de agente (não ultrapassar alçada) | Herda RF-05; sem REQ novo |
| **Kernel `sistema-ceo`** (`IMemoryLayer`, `IKnowledgeManager`, event log do núcleo) | **Não** | Memória de **sessão executiva** / factos de runtime do kernel ≠ catálogo de produto | Acoplar agora misturaria produto com episódios de sessão. Qualquer ponte futura = ADR + ciclo próprio. **Proibido** usar o kernel como atalho de ingestão de cliente. |
| **Tipo documental ROADMAP** | Referência, não dependência de capacidade | ADR-016 | Objecto `RMP-nnn` referencia `ROADMAP-nnn`; não o substitui |
| **ARQ-032** | Precedente, sem emenda | RN-05.2 | Delegação não homologa baseline MEP por omissão |

**Não há dependência real** que justifique abrir ou alterar BCO, kernel, CAP-06 ou CAP-09 nesta regularização.

---

## 6. Transições de maturidade (tabela fechada)

Conjunto fechado (REQ-085 RF-03), ordem canónica:

`CONCEBIDO → DEFINIDO → EM_CONSTRUÇÃO → EM_VALIDAÇÃO → HOMOLOGADO → BASELINE`

Eixo de **trabalho** (RF-04) permanece **ortogonal** e **não** autoriza salto de maturidade.

### 6.1 Princípios da tabela

1. **Só transições listadas são lícitas.** Qualquer salto omitido é **recusado**.  
2. **Nenhuma transição apaga** o estado anterior (evento novo).  
3. **Propor ≠ promover.** O CEO-agente pode propor todas as transições canónicas; só promove as que a coluna «Quem promove» lhe atribui.  
4. Promover a `DEFINIDO` ou acima trata o objecto como **definição/facto de produto em curso**, não como hipótese pura. Hipótese permanece em `CONCEBIDO` até alçada.  
5. `BASELINE` é **congelada**. Evolução posterior = **novo** objecto/baseline (novo ID), referenciando a anterior — nunca mutação do `BSL-nnn` emitido.  
6. Autoridade Delegada **não** altera esta tabela por omissão.

### 6.2 Transições canónicas permitidas

| De | Para | Quem **propõe** | Quem **promove** (executa a vigência) | Evidência mínima (RF-06) |
|----|------|-----------------|----------------------------------------|---------------------------|
| — | `CONCEBIDO` | CEO-agente, CTO, Usuário, Engenheiro | **CEO-agente** pode **registar** (criar hipótese) | Origem da concepção (doc, despacho, lacuna declarada). Sem evidência: lacuna explícita, objecto continua hipótese |
| `CONCEBIDO` | `DEFINIDO` | CEO-agente | **CTO**. **Aval do Usuário** se o objecto é Capacidade ou Épico de produto | VIS/REQ/ANL/ARQ ou despacho que fixa o escopo |
| `DEFINIDO` | `EM_CONSTRUÇÃO` | Engenheiro ou CEO-agente | **CTO** (gate IMP / autorização de construir). Aval do Usuário quando o catálogo o exigir para aquele tipo de objecto | ARQ/IMP autorizada ou equivalente de produto |
| `EM_CONSTRUÇÃO` | `EM_VALIDAÇÃO` | Engenheiro | **CTO** (gate VAL) | IMP concluída ou evidência de constructo pronto a validar |
| `EM_VALIDAÇÃO` | `HOMOLOGADO` | CTO (parecer) ou Engenheiro (evidências VAL) | **CTO** (homologação técnica) **e** **Usuário** quando o tipo documental/catálogo exigir aval | VAL / evidências de conformidade |
| `HOMOLOGADO` | `BASELINE` | CTO | **Usuário** (autoridade máxima). CTO **não** promove sozinho. CEO-agente **nunca** | Acto explícito de congelar baseline; conjunto de objectos `HOMOLOGADO` cobertos |

### 6.3 Transições proibidas (saltos)

| De | Para | Motivo |
|----|------|--------|
| `CONCEBIDO` | `EM_CONSTRUÇÃO`, `EM_VALIDAÇÃO`, `HOMOLOGADO`, `BASELINE` | Hipótese não se constrói nem se congela |
| `DEFINIDO` | `EM_VALIDAÇÃO`, `HOMOLOGADO`, `BASELINE` | Sem construção / sem VAL |
| `EM_CONSTRUÇÃO` | `HOMOLOGADO`, `BASELINE` | Sem validação |
| `EM_VALIDAÇÃO` | `BASELINE` | Baseline só a partir de `HOMOLOGADO` |
| Qualquer | `BASELINE` excepto desde `HOMOLOGADO` | RF-05 |

Não há «atalho documental» (`DEFINIDO` → `HOMOLOGADO`) no mínimo. Objectos só-normativos continuam a passar pelos gates; se o CTO quiser atalho depois, é emenda desta tabela — não omissão.

### 6.4 Transições excepcionais (não canónicas, só com alçada)

| De | Para | Quem promove | Condição |
|----|------|--------------|----------|
| `HOMOLOGADO` | `EM_VALIDAÇÃO` | CTO **e** Usuário | Não conformidade que reabre VAL. Trabalho: `EM_INVESTIGAÇÃO` ou `BLOQUEADO`. Não apaga o `HOMOLOGADO` anterior — evento declara reabertura |
| `EM_CONSTRUÇÃO` | `DEFINIDO` | CTO | Recuo de escopo (constructo abortado). Evento novo; não delete |
| `DEFINIDO` | `CONCEBIDO` | CTO | Definição retirada; volta a hipótese. Evento novo |
| `EM_VALIDAÇÃO` | `EM_CONSTRUÇÃO` | CTO | VAL devolve a construção |

**Proibido mesmo em excepção:** apagar evento; promover a `BASELINE` sem Usuário; CEO-agente promover qualquer linha das tabelas 6.2 (excepto o **registo** inicial em `CONCEBIDO`) ou 6.4.

### 6.5 Quem nunca promove o quê

| Papel | Nunca promove para |
|-------|-------------------|
| CEO-agente | `DEFINIDO`, `EM_CONSTRUÇÃO`, `EM_VALIDAÇÃO`, `HOMOLOGADO`, `BASELINE` |
| Engenheiro | `HOMOLOGADO`, `BASELINE` (propõe evidência; não homologa) |
| CTO sozinho | `BASELINE` |
| Autoridade Delegada (por omissão) | `HOMOLOGADO`, `BASELINE`; qualquer salto da §6.3 |

---

## 7. Espaço de identificadores dos nove objectos

Fundamento: ARQ-002 (espaços autónomos, opacidade, permanência, referência qualificada); ADR-008 (independência); precedente ARQ-003 (`CNC-nnn`) e ARQ-007 (`KNW-nnn`).

**Não se reutilizam** marcadores existentes: `CON`, `VIS`, `CAP`, `REQ`, `ADR`, `ANL`, `ARQ`, `IMP`, `VAL`, `CNC`, `KNW`, `ROADMAP`, `EPICO`, `REL`, `GOV`, `DIC`, `EV` (OE), `MEP` como prefixo **único** de um só tipo (MEP-CEO é o nome da memória, não de um objecto).

### 7.1 Decisão de forma (recomendada nesta ANL; vinculante só após homologação ARQ)

Nove **espaços irmãos**, planos, autónomos, com um responsável único: o **Registo de evolução do produto (C2)**.

Um objecto, um identificador permanente `MARCADOR-nnn` (três dígitos mínimos, sequência sem reutilização, opacidade nos termos ARQ-002 A2).

| Objecto MEP | Marcador | Forma | Colisão evitada |
|-------------|----------|-------|-----------------|
| Capacidade de **produto** | `MCP` | `MCP-nnn` | ≠ `CAP-nn` (mapa CAP-001) |
| Épico de produto | `EPC` | `EPC-nnn` | ≠ `EPICO-nnn` (tipo documental de épico) |
| Módulo de produto | `MDL` | `MDL-nnn` | — |
| Decisão de produto | `DCP` | `DCP-nnn` | ≠ decisão CAP-05 (sem prefixo de espaço próprio no Art. 8º) |
| Evidência de produto | `EVD` | `EVD-nnn` | ≠ `EV-nnn` (OE de VAL) |
| Pendência de produto | `PND` | `PND-nnn` | — |
| Baseline de produto | `BSL` | `BSL-nnn` | — |
| Roadmap (objecto de memória) | `RMP` | `RMP-nnn` | ≠ tipo documental `ROADMAP-nnn` |
| Evento de evolução (histórico) | `MEV` | `MEV-nnn` | O **histórico** é a cadeia de `MEV`; cada evento é a unidade identificável |

### 7.2 Regras de emissão (lógicas)

1. Identificador emitido **somente** no acto de registo do objecto em C2. Proposta não registada não consome número.  
2. Nunca alterado, renumerado, reutilizado. Mudança de maturidade **não** emite ID novo (excepto nova baseline = novo `BSL-nnn`).  
3. Tipo do objecto **não** se infere por consumidores a partir do número — só pelo espaço (marcador) + registo C2. O marcador qualifica o espaço (ARQ-002 A5); **não** carrega arquitectura (A2.3).  
4. Referências cruzadas (ex.: `EPC-002` → `MCP-001`; `MEV-010` → `MDL-003` + `EVD-004`) são referências qualificadas. **Não** copiam conteúdo de `KNW-*` nem de memória organizacional.  
5. `RMP-nnn` **pode** referenciar `ROADMAP-nnn`; não o substitui.  
6. Fechamento: estas convenções aplicam-se **só** à MEP-CEO. Não estender a CAP-04/05 nem ao kernel.

### 7.3 Alternativa rejeitada

**Um único espaço `MEP-nnn` para os nove tipos** (tipo só no registo): mais opaco, mas mistura géneros no mesmo sequencial e enfraquece a referência qualificada entre objectos que RF-02 exige distintos. Rejeitada em favor de nove espaços irmãos (precedente CNC vs KNW vs PREFIXO).

---

## 8. Agrupamentos de requisitos (ADR-005)

REQ-085 já cobre o mínimo em rascunho. A ANL **não** manda escrever REQ novos antes da homologação. Agrupa o que a homologação deve **incorporar** no pacote:

| Grupo | Tema | Onde está | Delta na homologação |
|-------|------|-----------|----------------------|
| A | Isolamento Produto ↔ Organização | RF-01; ARQ-033 C1 | **Nenhum** (contrato intacto) |
| B | Objectos mínimos | RF-02 | Citar espaços §7 |
| C | Maturidade + trabalho | RF-03, RF-04 | Incorporar tabela §6 |
| D | Autoridade / evidência / histórico | RF-05…07 | Alinhar «quem promove» à §6 |
| E | Ponte C3 | RF-08 | Permanece não implementável |
| G | Atribuição de CAP | Cabeçalho REQ-085 | Preencher **após** deliberação CTO — não nesta ANL |

Grupo **F** (integrações CAP-06/09/kernel): **não** abrir REQ. Sem dependência real.

---

## 9. Riscos de engenharia

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Homologar VIS/REQ/ARQ **sem** CAP | Esta ANL; CTO delibera CAP antes do gate de homologação |
| R2 | Absorção silenciosa em CAP-04/05/09/01/06 | §3; proibição explícita; recomendação CAP-13 |
| R3 | Ingestão de cliente via «aprendizado» ou kernel | RF-01; §5 kernel/BCO sem contrato; C3 não construída |
| R4 | Autoridade Delegada usada para baseline | §6.5; RN-05.2 |
| R5 | Colisão `CAP-nn` vs capacidade de produto | Marcador `MCP-nnn` |
| R6 | Tratar ANL como normativa | ADR-005: preparatória; transições/IDs só vinculam na homologação de REQ/ARQ |
| R7 | ADR inflacionário | §12 — só uma ADR condicional (nova CAP) |
| R8 | Abrir IMP / C3 / testes de produto | Proibido pelo despacho; recomendação §13 |
| R9 | Confundir `RMP` com ROADMAP documental | §7.1; ADR-016 intacta |
| R10 | Reabrir CAP-01 porque há alçadas | §3.4 — consumo ≠ dono |

---

## 10. ADRs adicionais

ADR-006: ADR estrutural **só** quando a ANL revelar decisão que precise de ser vinculante (fronteiras de CAP, conceitos candidatos). Não fabricar ADR vazio (CON-001 Art. 9º princípio 1).

| Candidata | Necessária? | Quando | Porquê |
|-----------|-------------|--------|--------|
| **ADR para instituir CAP-13 (CAP-E) e emendar CAP-001** | **Sim, se e só se** o CTO aceitar a recomendação de nova CAP | **Depois** desta ANL, **antes** de preencher CAP no REQ-085 e de homologar o pacote | Fronteira de capacidade + identificador permanente no mapa. Não pode nascer por nota em ANL. |
| ADR de espaços `MCP`…`MEV` | **Não** | — | ARQ-002 A6: espaço novo nasce por **ARQ específica**. Precedente ARQ-003 / ARQ-007. Incorporar §7 em ARQ-033 na homologação **ou** ARQ-034 no mesmo gate — sem ADR. |
| ADR de transições de maturidade | **Não** | — | Conteúdo de REQ/ARQ (§6 → RF-03). |
| ADR BCO ↔ MEP | **Não** | — | Sem dependência real. |
| ADR kernel `sistema-ceo` ↔ MEP | **Não** | — | Sem dependência real. Criá-la agora acoplaria o que a ANL separa. |
| ADR «MEP é mecanismo como BCO» | **Não** | — | Alternativa rejeitada (§3.7). |
| ADR-017 CAP-R | **Não** | — | Não é consolidação de baseline existente. |

**Nenhum ADR é criado nesta frente.**

---

## 11. Ordem sugerida (regularização → homologação)

Alinhado a ADR-006, com o débito já contraído (VIS/REQ/ARQ em rascunho técnico):

1. **ANL-018** (este documento) — revisão CTO.  
2. **Deliberação de CAP** (recomendação: CAP-13 CAP-E).  
3. **Se nova CAP:** ADR + aval do Usuário no CAP-001.  
4. **Homologação conjunta** VIS-009 → REQ-085 → ARQ-033, incorporando: CAP atribuída; tabela §6; espaços §7. **Sem** alterar RF-01 / isolamento.  
5. **IMP / VAL / C3:** **não** abrir.

Até o passo 4, o pacote permanece **rascunho técnico aprovado, não homologado**.

---

## 12. Recomendação final para homologação

A CTO pode homologar o **pacote MEP-CEO** quando:

1. Esta ANL estiver **aprovada**.  
2. A **CAP** estiver **atribuída** por deliberação (não por silêncio). Recomendação: **CAP-13 — Memória de Evolução do Produto (CAP-E)**.  
3. REQ-085 e ARQ-033 incorporarem **§6 (transições)** e **§7 (identificadores)** sem mexer no isolamento.  
4. Continuar **proibido**: código, C3, IMP, testes de produto, toque em CAP-04/05, Motor, G2, MTE, `monitorar`.

Se o CTO **rejeitar** CAP-13, deve escolher explicitamente outra sede **excepto** CAP-04 e CAP-05, e esta ANL deve ser reaberta nesse ponto — não se homologa REQ-085 órfão.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 Art. 4º, 5º §2º, 6º, 8º, 9º; ADR-005; ADR-006; ADR-017 |
| Origem | Despacho CTO 14/08/2026 — regularizar MEP-CEO antes da homologação |
| Rascunhos técnicos | VIS-009; REQ-085; ARQ-033 |
| Capacidade | **CAP-13** instituída após esta ANL ([`ADR-020`](../adr/ADR-020-institui-cap-13-memoria-evolucao-produto.md)) — não atribuída *no corpo da análise* |
| Gera | Deliberação de CAP; ADR-020; CAP-001 v1.1; deltas de homologação em REQ-085 / ARQ-033 (ainda não homologados) |
| Não gera | IMP; C3; código; homologação VIS/REQ/ARQ |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 14/08/2026 | Engenheiro (Cursor) | ANL de regularização: CAP, transições, IDs, dependências, ADRs | Despacho CTO — fluxo oficial ANL antes de homologar | Em análise |
| 1.0 | 14/08/2026 | CTO aprovou; Engenheiro registou | Status Aprovada; CAP-13 formalizada em ADR-020 (análise §3 intacta) | Deliberação CTO — criar CAP-13 | **Aprovada** |

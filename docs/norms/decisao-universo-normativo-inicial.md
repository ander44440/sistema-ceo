# Decisão Formal — Universo Normativo Inicial do Registro Canônico de Normas

> **Status: Homologada — v1.0 (Governança, 22/07/2026). Gate E2 do IMP-002.**
> Versão 1.0 — 22/07/2026.
> Artefato deliberativo da Etapa E2. A população do índice ocorre na Etapa E3.

---

## 1. Objeto

Definir formalmente quais **categorias documentais** integram o universo inicial do Registro Canônico de Normas, aplicando o critério homologado no IMP-002 (§2.1):

> Somente integram o Registro Canônico de Normas os documentos que possuam **natureza normativa** e produzam **efeitos permanentes sobre a governança organizacional**.

Fundamentos: CON-001 (em especial Art. 5º e Art. 7º); REQ-002; ARQ-004 (A2, P1–P7); IMP-002 (E2).

---

## 2. Critério aplicado

| Elemento do critério | Leitura operacional nesta deliberação |
|----------------------|----------------------------------------|
| Natureza normativa | O documento integra a cadeia de normas da organização ou produz obrigação/regra permanente de governança |
| Efeitos permanentes sobre a governança | Sua vigência condiciona decisões, requisitos, arquitetura ou comportamento organizacional de forma duradoura — não é meramente analítico, preparatório, de aprendizado ou de planejamento de execução |

A hipótese de trabalho CON / VIS / REQ / ADR (IMP-002 §2.2) **não** é classificação oficial; foi apenas ponto de partida para esta análise.

---

## 3. Análise por categoria

### 3.1 CON — Constituição

| Campo | Avaliação |
|-------|-----------|
| Critério | Natureza normativa máxima; efeitos permanentes sobre toda a organização (CON-001) |
| Decisão proposta | **INCLUIR** |
| Fundamentação | Norma superior da hierarquia (Art. 5º); fonte das regras permanentes de governança |

### 3.2 VIS — Visão

| Campo | Avaliação |
|-------|-----------|
| Critério | Documentos estratégicos da hierarquia normativa (Art. 5º, nível 2); orientam deliberações permanentes de produto e identidade |
| Decisão proposta | **INCLUIR** |
| Fundamentação | VIS-001 e VIS-002 produzem efeitos permanentes sobre a interpretação e a evolução do produto; subordinam-se à CON e condicionam REQs/ADRs. Natureza normativa de visão institucional, não meramente opinativa |

### 3.3 REQ — Requisitos

| Campo | Avaliação |
|-------|-----------|
| Critério | Obrigações verificáveis permanentes da organização; nível 3 da hierarquia |
| Decisão proposta | **INCLUIR** |
| Fundamentação | REQ-002 e demais REQs são normas de governança/engenharia que obrigam o comportamento do CEO; o próprio registro canônico existe para mantê-los (REQ-002) |

### 3.4 ADR — Decisões arquiteturais e registros vinculantes

| Campo | Avaliação |
|-------|-----------|
| Critério | Decisões com efeito permanente sobre arquitetura e governança do desenvolvimento |
| Decisão proposta | **INCLUIR** |
| Fundamentação | Nível 4 da hierarquia (Art. 5º); ADRs homologadas vinculam etapas posteriores; alterar ou ignorá-las sem deliberação viola a cadeia normativa |

### 3.5 CAP — Capacidades e estratégias derivadas

| Campo | Avaliação |
|-------|-----------|
| Critério | Mapas e priorização de capacidades — estruturam o portfólio, mas não são a sede da obrigação normativa unitária |
| Decisão proposta | **EXCLUIR** do registro de normas (universo inicial) |
| Fundamentação | **CAP disciplina capacidades organizacionais e sua evolução operacional, não produzindo, por si só, normas constitucionais ou regulatórias permanentes do sistema.** Sua força operacional realiza-se via REQs e ADRs. Incluí-los diluiria o registro (risco de burocratização — REQ-002). Podem ser reavaliados em deliberação futura, sempre pelo critério de natureza documental (§1 e §5), não pelo prefixo |

### 3.6 ANL — Análises

| Campo | Avaliação |
|-------|-----------|
| Critério | Preparatórias, não normativas (catálogo; ADR-005) |
| Decisão proposta | **EXCLUIR** |
| Fundamentação | Explicitamente não normativas; não produzem obrigação permanente por si |

### 3.7 ARQ — Arquitetura

| Campo | Avaliação |
|-------|-----------|
| Critério | Arquitetura lógica de mecanismos; vincula implementação, mas não é “norma de governança” no sentido do REQ-002 |
| Decisão proposta | **EXCLUIR** do registro de normas (universo inicial) |
| Fundamentação | ARQs satisfazem REQs; a autoridade normativa da obrigação permanece no REQ. O registro de normas não é o registro de arquiteturas. Reavaliação futura possível se a Governança deliberar fusão de universos |

### 3.8 IMP — Planos de implementação

| Campo | Avaliação |
|-------|-----------|
| Critério | Planos de execução de gates; disciplina metodológica (ADR-012) |
| Decisão proposta | **EXCLUIR** |
| Fundamentação | Não são normas de governança; planejam materialização sem criar obrigação normativa permanente além do plano |

### 3.9 Aprendizado (`docs/learning/`)

| Campo | Avaliação |
|-------|-----------|
| Critério | Registros sem efeito normativo |
| Decisão proposta | **EXCLUIR** |
| Fundamentação | Catálogo e precedentes (R1, Âncora Operacional): sem efeito normativo |

### 3.10 Conceitos (CNC) e autoridade semântica

| Campo | Avaliação |
|-------|-----------|
| Critério | Autoridade semântica (o que significa), distinta da normativa (o que obriga) — ADR-008 |
| Decisão proposta | **EXCLUIR** |
| Fundamentação | Fronteira norma × conceito já decidida; conceitos têm registro próprio (`docs/concepts/`) |

### 3.11 Templates e índices auxiliares

| Campo | Avaliação |
|-------|-----------|
| Critério | Instrumentos de forma, não normas |
| Decisão proposta | **EXCLUIR** |
| Fundamentação | Sem efeitos permanentes de governança por si |

---

## 4. Decisão formal proposta (resultado explícito)

> **Universo normativo inicial do Registro Canônico de Normas:**
>
> **INCLUIR** as categorias: **CON**, **VIS**, **REQ**, **ADR** — exclusivamente os documentos dessas categorias que constem do catálogo oficial com status que expressem existência homologada/aprovada/aceita conforme o vocabulário do tipo.
>
> **EXCLUIR** do universo inicial: **CAP**, **ANL**, **ARQ**, **IMP**, **learning**, **conceitos (CNC)**, **templates** e demais artefatos não listados em INCLUIR.
>
> **O universo definido neste documento corresponde ao universo inicial do Registro Canônico de Normas e poderá ser ampliado ou reduzido mediante deliberação normativa posterior.**
>
> A inclusão efetiva de cada documento no índice ocorrerá apenas na **Etapa E3**, após homologação desta decisão. Documentos futuros que satisfaçam o critério de natureza normativa (§1) ingressam no registro quando homologados, pelo processo de governança documental + atualização do índice — independentemente do prefixo utilizado.

## 5. Natureza documental, não prefixo

A presente decisão utiliza os prefixos (CON, VIS, REQ, ADR, CAP, …) **apenas como representação do estado atual do acervo**, permanecendo o critério normativo baseado na **natureza documental** (natureza normativa e efeitos permanentes sobre a governança — IMP-002 §2.1).

Novos tipos documentais criados no futuro serão avaliados pelo mesmo critério de natureza, não por analogia automática de prefixo. A exclusão ou inclusão de um prefixo hoje não cria regra permanente sobre o rótulo — cria deliberação sobre o conjunto atual de artefatos.

## 6. Escopo e vedações observadas

* Nenhum documento normativo foi alterado.
* O índice `docs/norms/README.md` **não foi populado**.
* ARQ-004 / L1 / P1–P7 intactos.
* E3, E4 e E5 não iniciadas.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) preparou; alçada decisória: CTO (revisão) e Governança (homologação) |
| Quando | 22/07/2026 |
| Por quê | Cumprir o Gate E2 do IMP-002 — decisão formal do universo normativo inicial |
| Baseado em quê | IMP-002 §2.1 e E2; CON-001 Art. 5º e 7º; REQ-002; ARQ-004 A2; homologação do Gate E1 |
| Resultado | **Homologada:** INCLUIR CON, VIS, REQ, ADR; EXCLUIR CAP, ANL, ARQ, IMP, learning, CNC, templates — universo inicial; E3 autorizada |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Análise por categoria com fundamentação de inclusão/exclusão; resultado explícito | Autorização da Governança — abertura E2 | Aprovado pelo CTO com ajustes pontuais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Universo inicial explícito (ampliável/redutível); fundamentação própria de CAP; critério por natureza documental, não por prefixo | Revisão técnica do CTO | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Universo inicial CON/VIS/REQ/ADR homologado; prefixos descritivos; critério por natureza | Homologação do Gate E2 | **Homologada — E3 autorizada** |

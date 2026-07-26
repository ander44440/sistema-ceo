# IPR-001 — Experiência e Desejabilidade do CEO

> **Status: F0 Homologada. F1 CONCLUÍDA. F2 aberta — F2-01 homologada; Gate F2-02 em revisão (Modelo de Interações).**  
> Tipo: Iniciativa de Produto (IPR-001 — experimental v0.x; formalização por ADR futura).  
> Norma: CON-001; ADR-002; ADR-006; ADR-015; P1–P6; **DA-001…DA-003**; **D1–D5 + COA** ([`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md)).  
> **Estado F1:** concluída; corpus **24** fichas; coleta encerrada; L3 coberta; L1/L2/L4/L5/L6 = decisões internas.  
> **HP:** 001–003 promovidas; 004/005 em observação; 006 em observação avançada.  
> **F2-01:** homologada — D1–D5 + COA oficiais.  
> **F2-02:** [`F2-02-modelo-de-interacoes-experiencia.md`](F2-02-modelo-de-interacoes-experiencia.md) — em revisão do CTO.  
> **Proibições:** sem código de interface; sem telas; sem componentes; sem alteração de REQ/ARQ técnica; sem alteração das 24 fichas; sem commit.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A iniciativa que define a estratégia de UX, UI, identidade visual e experiência do produto CEO — a camada de **desejabilidade** sobre a fundação de governança já homologada. |
| **Por que existe?** | O CEO alcançou maturidade funcional (MVP v0.1; CAP-03/05/07/08 em baseline), mas sua experiência nasceu utilitária. Um Sistema Executivo precisa **transmitir controle e inspirar confiança** — a experiência é parte do produto, não decoração. |
| **Para quem existe?** | Patrocinador (usuário executivo diário); CTO (governança das futuras implementações); Engenheiro (referência única de produto ao implementar). |
| **Como o sucesso será medido?** | Quando toda implementação visual futura derivar desta documentação sem decisões estéticas ad hoc, e o Patrocinador reconhecer no CEO um ambiente de comando claro, elegante e consistente. |

---

## 1. Propósito

Transformar a experiência do CEO de "painel funcional" em **ambiente executivo desejável**: um produto que o usuário queira abrir todas as manhãs, no qual cada superfície conduz à decisão e a identidade visual expressa a natureza do sistema — governança, clareza e comando.

## 2. Visão

> O CEO é o posto de comando do executivo. Sua experiência deve transmitir a sensação de conversar com um executivo de confiança — nunca a de preencher formulários. Tudo o que aparece na tela existe para contextualizar uma decisão.

Fundamentos herdados (não renegociáveis nesta iniciativa):

* **A conversa é a interface principal** (VIS-007 / REQ-041).
* **Exatamente um Contexto Operacional Ativo** orienta toda superfície (REQ-037).
* **Respeito absoluto ao tempo do usuário** (CON-001, princípio 1).
* **DA-001…DA-003** — Objetivo antes da ferramenta; contexto que sobrevive; navegação por níveis.

## 3. Objetivos

| # | Objetivo |
|---|----------|
| O1 | Estabelecer princípios de produto normativos para toda decisão de experiência |
| O2 | Definir o roadmap do design system (fundações visuais → componentes → padrões) |
| O3 | Estruturar as frentes de benchmark, UX, UI e branding com sedes documentais próprias |
| O4 | Garantir que implementações visuais futuras ocorram **somente** via ciclo ADR-006, alimentadas por esta base |
| O5 | Elevar a desejabilidade sem comprometer clareza, governança ou desempenho |

## 4. Entregáveis

### F0 — Fundação (homologada)

| Entregável | Artefato |
|------------|----------|
| Sede documental | `docs/product/` + README |
| Documento-mestre | Este documento |
| Princípios de produto | [`principios-de-produto.md`](principios-de-produto.md) |
| Roadmap do design system | [`design-system-roadmap.md`](design-system-roadmap.md) |
| Estruturas de frentes | `benchmark/` · `ux/` · `ui/` · `branding/` |

### F1 — Benchmark Estratégico (concluída)

| Entregável | Artefato |
|------------|----------|
| Plano e corpus | [`benchmark/`](benchmark/README.md) — 24 fichas |
| Encerramento | [`benchmark/encerramento-f1.md`](benchmark/encerramento-f1.md) — homologado |
| Diretrizes promovidas | [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md) |
| Transição F1→F2 | [`transicao-f1-f2.md`](transicao-f1-f2.md) — autorizada via Gate F2-01 |
| F2-01 Arquitetura Conceitual | [`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md) — **homologada** |
| F2-02 Modelo de Interações | [`F2-02-modelo-de-interacoes-experiencia.md`](F2-02-modelo-de-interacoes-experiencia.md) — em revisão |

### De fases futuras (sob deliberação)

* F2 — Fundações visuais (abre só com Gate de Transição + autorização CTO).
* F3+ — UX, UI, branding; design system operacional via ADR-006.

## 5. Critérios de sucesso

| # | Critério | Verificação |
|---|----------|-------------|
| S1 | Documentação-base homologada pelo CTO | Gate desta entrega |
| S2 | Princípios e DA citáveis em revisões de REQ/ARQ futuros | Uso nos próximos ciclos |
| S3 | Roadmap do design system com fases e dependências claras | Inspeção do documento |
| S4 | Nenhuma implementação visual fora do fluxo ADR-006 | Governança contínua |
| S5 | Estruturas de frentes prontas para receber conteúdo sem retrabalho | Abertura das fases seguintes |

## 6. Fases previstas

| Fase | Nome | Conteúdo | Gate |
|------|------|----------|------|
| **F0** | Fundação documental | Sede, documento-mestre, princípios, roadmap, estruturas | ✅ Homologada |
| **F1** | Benchmark Estratégico | Critérios, inventários, 24 fichas, encerramento, DA | ✅ **Concluída** |
| **F2** | Fundações + arquitetura conceitual | F2-01 ✅; F2-02 em revisão; depois fundações visuais | 🟢 Aberta — **F2-02 em revisão** |
| **F3** | UX das superfícies | Navegação, Home, dashboards, onboarding, fluxos | Deliberação CTO |
| **F4** | UI e padrões | Componentes e layouts especificados | Deliberação CTO |
| **F5** | Aplicação | Ciclos ADR-006 de implementação visual | Gates por ciclo |

Cada fase só abre por deliberação formal do CTO. F5 **não** pertence à IPR-001 — é executada pelos ciclos de capacidade que consumirem esta base.

## 7. Restrições vigentes

* Não alterar código-fonte, CAP-03, REQ ou ARQ.
* Não criar telas, componentes React ou qualquer implementação visual.
* Não alterar o conteúdo das 24 fichas homologadas.
* Não realizar commit até homologação e autorização expressa do pacote de transição.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (F2-01 homologado; autorização F2-02); Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Registrar D1–D5 oficiais; abrir Modelo de Interações |
| Baseado em quê | Gate F2-01; autorização F2-02 |
| Resultado | F2-02 submetido; sem REQ/ARQ/wireframes/ADR; sem commit |

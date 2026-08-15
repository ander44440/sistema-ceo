# ADR-020 — Institui a CAP-13 — Memória de Evolução do Produto (CAP-E)

> **Status: Aceita — v1.0 (CTO, 14/08/2026).**  
> Versão 1.0 — 14/08/2026.  
> Esta ADR institui a **CAP-13 — Memória de Evolução do Produto** no mapa CAP-001, classificação **CAP-E**.  
> **Não homologa** VIS-009, REQ-085 nem ARQ-033. **Não** abre IMP. **Não** cria C3. **Não** altera código.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO deliberou a criação da CAP-13; Engenheiro (Cursor) formalizou esta ADR e o mapa; despacho de formalização enviado ao Cursor pelo canal do Usuário |
| Quando | 14/08/2026 |
| Por quê | A MEP-CEO é capacidade própria (memória e governação da evolução do **produto** CEO) e não pode ser absorvida por CAP-04, CAP-05, CAP-06, CAP-09 ou CAP-01 |
| Baseado em quê | ANL-018 **aprovada**; deliberação CTO 14/08/2026; ADR-003 D3 (IDs permanentes CAP-01…12); ADR-006; ADR-017 (CAP-E); VIS-009 / REQ-085 / ARQ-033 (rascunhos técnicos, não homologados); CON-001 Art. 4º, 5º, 6º |
| Resultado | CAP-13 instituída no CAP-001 v1.1; sede `docs/cap-13/`; REQ-085 passa a rastrear CAP-13 **para fins de especificação**; ciclo VIS→REQ→ARQ **não** homologado; zero código; zero commit neste acto |

---

## Status

Aceita — v1.0, deliberação do CTO em 14/08/2026. Formalização documental nesta ADR.

---

## 1. Contexto

O pacote MEP-CEO (VIS-009, REQ-085, ARQ-033) foi aprovado como **rascunho técnico** e regularizado pela ANL-018. O fluxo oficial (ADR-006) exige que todo REQ rastreie **exactamente uma** capacidade do CAP-001.

A ANL-018 demonstrou que o domínio «memória da evolução do **produto**» **não** existe no mapa CAP-01…12, e avaliou — rejeitando como sede — CAP-04, CAP-05, CAP-06, CAP-09 e CAP-01.

Sem um identificador permanente novo, REQ-085 permanece órfão e a homologação do pacote seria irregular.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | REQ-085 sem CAP viola ADR-006 |
| P2 | Absorver a MEP-CEO em CAP existente distorce objecto homologado (memória organizacional, acervo, aprendizado, observabilidade ou governação normativa) |
| P3 | ADR-003 D3 fixou CAP-01…12 como permanentes; faltava o acto que **estende** o mapa sem renumerar nem reutilizar esses IDs |
| P4 | Sem CAP-E explícita, a evolução do produto não tem sede no CAP-001 |

---

## 3. Decisão

Fica instituída a **CAP-13 — Memória de Evolução do Produto**, classificação **CAP-E** (ADR-017).

| ID | Decisão |
|----|---------|
| **D1** | Criar o identificador permanente **CAP-13**. Não renumerar, não reutilizar CAP-01…12 (ADR-003 D3 **preservada** para esses IDs). O conjunto do mapa **deixa de ser fechado em 12**. |
| **D2** | Nome oficial: **Memória de Evolução do Produto**. Sigla de produto da memória: **MEP-CEO**. A sigla não é o identificador da capacidade. |
| **D3** | Classificação: **CAP-E**. Não é CAP-R. |
| **D4** | Objecto: memória e governação da evolução do **produto** Sistema CEO. |
| **D5** | A CAP-13 **permanece separada** da memória de qualquer organização / cliente. Não absorve e não é absorvida por CAP-04 nem CAP-05. |
| **D6** | CAP-13 **não é**: memória organizacional (CAP-05); acervo (CAP-04); aprendizado (CAP-06 / BCO); observabilidade (CAP-09); governação normativa (CAP-01). |
| **D7** | CAP-13 **consome** alçadas da CAP-01 / CON-001 Art. 6º; não as redefine e **não reabre** a baseline da CAP-01. |
| **D8** | Especificação vigente para o ciclo: VIS-009, REQ-085, ARQ-033, ANL-018. Estado: rascunho técnico / ANL aprovada. **Homologação VIS→REQ→ARQ fica para acto posterior.** IMP, C3, código e testes de produto **não** são autorizados por esta ADR. |
| **D9** | Actualização do CAP-001, do catálogo (`docs/README.md`) e da sede `docs/cap-13/` ocorre **neste acto** de formalização (ao contrário da D6 da ADR-017, que diferia o catálogo; aqui o despacho manda catalogar agora). |
| **D10** | REQ-085 (e VIS-009 / ARQ-033, no cabeçalho) passam a declarar **CAP-13** como capacidade de rastreio **para fins de especificação**. Isso **não** equivale a homologar o pacote. |

---

## 4. Definição formal da CAP-13

### 4.1 O que é

Capacidade estratégica do CEO de **registar, organizar, consultar e propor a evolução do produto** — capacidades de produto, épicos, módulos, decisões de produto, evidências, pendências, baselines, roadmap de produto e histórico append-only — com isolamento do eixo organização / cliente.

### 4.2 O que não é

Memória da organização; item de acervo; competência BCO; painel de observabilidade; conjunto de normas; evolução autónoma de clientes; implementação (IMP); canal C3.

### 4.3 Ciclo

Fluxo ADR-006: ANL-018 (aprovada) → VIS-009 → REQ-085 → ARQ-033 → (IMP futura, **não aberta**) → VAL futura.

Gates posteriores a esta ADR: homologação do pacote VIS/REQ/ARQ, **depois** desta formalização, por despacho próprio.

---

## 5. Relação com ADR-003 D3

A Decisão 3 da ADR-003 permanece integralmente válida: os identificadores **CAP-01 a CAP-12** são permanentes, não são renumerados e não são reutilizados.

Esta ADR **não emenda o texto histórico** da ADR-003. **Estende** o mapa: novos identificadores CAP-E (a partir de CAP-13) só nascem por ADR, com a mesma regra de permanência.

---

## 6. Alternativas consideradas

| Alternativa | Resultado |
|-------------|-----------|
| Absorver em CAP-04, CAP-05, CAP-06, CAP-09 ou CAP-01 | Rejeitada pelo CTO na deliberação e pela ANL-018 |
| CAP-R sobre baseline existente | Rejeitada — não há baseline de produto a consolidar; o objecto é novo |
| Mecanismo sem CAP (padrão BCO) | Rejeitada — REQ-085 exigiria CAP (ADR-006) |
| Adiar a CAP até a homologação VIS/REQ/ARQ | Rejeitada pelo despacho — formalizar CAP **antes** da homologação do pacote |

---

## 7. Consequências

* CAP-001 passa a v1.1 com CAP-13.  
* REQ-085 deixa de estar órfão no elo CAP.  
* Homologação VIS-009 → REQ-085 → ARQ-033 **pode** ser despachada a seguir; **não** ocorre neste acto.  
* Incorporação da tabela de transições e dos espaços de ID (ANL-018 §6–§7) permanece para essa homologação.  
* Nenhum módulo de código, Motor, Gate G2, MTE, `monitorar`, CAP-04 ou CAP-05 é alterado.

---

## 8. Riscos

| Risco | Mitigação |
|-------|-----------|
| Confundir formalização da CAP com homologação do pacote | D8, D10; status VIS/REQ/ARQ inalterado quanto a «não homologado» |
| Confundir CAP-13 com CAP-05 | D5, D6; isolamento REQ-085 RF-01 intacto |
| Abrir IMP neste acto | D8 — proibido |

---

## Rastreabilidade

- Norma superior: CON-001 Art. 4º, 5º §2º, 6º; ADR-003 D3; ADR-006; ADR-017.
- Origem: ANL-018 aprovada; deliberação CTO 14/08/2026.
- Relaciona-se com: VIS-009; REQ-085; ARQ-033 (não homologados); CAP-001 v1.1.
- Gera: entrada CAP-13 no mapa; `docs/cap-13/`; actualização do catálogo.
- Não gera: IMP; C3; código; commit.

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 1.0 | 14/08/2026 | CTO deliberou; Engenheiro formalizou | Instituição da CAP-13 (CAP-E) | Despacho de formalização pós-ANL-018 | **Aceita** |

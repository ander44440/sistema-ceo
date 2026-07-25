# ADR-016 — Criação do tipo documental ROADMAP (Plano Estratégico)

> **Status: Aceita — v1.0 (CTO, 24/07/2026).**  
> Versão 1.0 — 24/07/2026.  
> Esta ADR institui oficialmente o tipo **ROADMAP** na metodologia do Sistema CEO.  
> **Não** altera REQs, ARQs, IMPs, VALs, CAPs homologadas nem código.  
> Homologação do ROADMAP-001: ato próprio **após** esta Aceitação, **sem alteração de conteúdo** do plano estratégico.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO homologou; Engenheiro (Cursor) registrou e publicou |
| Quando | 24/07/2026 |
| Por quê | Formalizar o tipo ROADMAP antes e para viabilizar a homologação do ROADMAP-001 |
| Baseado em quê | Deliberação Final do CTO — ADR-016 APROVADA; regra do catálogo; precedentes ADR-005/010/012/014; ADR-004; ADR-006; ADR-015 |
| Resultado | Tipo ROADMAP instituído; ADR-016 Aceita v1.0; catálogo atualizado; ROADMAP-001 homologado sem alteração de conteúdo |

---

## Status

Aceita — v1.0, homologada pelo CTO em 24/07/2026.

---

## Decisão

Criar o tipo documental **ROADMAP — Plano Estratégico**:

| Atributo | Definição |
|----------|-----------|
| **Finalidade** | Definir a evolução estratégica do Sistema CEO em nível **superior às capacidades (CAP)**, agrupando CAPs em **épicos** e vinculando-os a **releases**, sem substituir o fluxo ADR-006 |
| **Localização** | `docs/roadmap/` |
| **Identificação** | ROADMAP-nnn, sequencial e permanente |
| **Elaboração** | Engenheiro ou CTO |
| **Aprovação** | CTO, com aval do Usuário |
| **Natureza** | Documento **estratégico** (padrão ADR-002 — quatro perguntas). Não cria requisitos, não define arquitetura, não planeja implementação, não valida e não abre CAP por si |

---

## 1. Propósito e responsabilidades

### 1.1 Propósito

O ROADMAP existe para:

1. Dar **direção plurianual** ao Sistema CEO acima do nível de capacidade.
2. Organizar as capacidades do CAP-001 em **épicos** coerentes.
3. Vincular épicos a **releases** (versão de produto) com critérios de conclusão.
4. Definir **critérios de abertura** de novas CAPs e **dependências** entre épicos.
5. Declarar critérios objetivos para a marca **CEO 1.0** (ou outra meta estratégica vigente).
6. Preservar a hierarquia normativa: o Roadmap **orienta**; não dispensa CON-001 nem ADR-006.

### 1.2 Responsabilidades (o que o ROADMAP faz)

| Faz | Não faz |
|-----|---------|
| Propõe sequência estratégica (épicos → releases) | Não cria CAP, REQ, ARQ, IMP ou VAL |
| Agrupa CAPs existentes do CAP-001 (ou CAPs criadas por ADR) | Não altera o mapa CAP-001 em mérito sem ADR própria |
| Define critérios de abertura de CAP e de versão 1.0 | Não executa ciclos ADR-006 |
| Registra dependências entre épicos | Não altera código, arquitetura ou baselines homologadas |
| Atualiza-se por emenda versionada após Aceitação | Não homologa automaticamente exemplares nem releases |

### 1.3 Responsáveis

| Papel | Responsabilidade |
|-------|------------------|
| **Usuário / Patrocinador** | Aprova a direção estratégica; autoriza prioridades |
| **CTO** | Elabora/revisa; governa sequenciamento; Aceita ADR e homologa ROADMAP |
| **Engenheiro** | Registra, mantém rastreabilidade; executa apenas ciclos ADR-006 autorizados |

---

## 2. Posição na hierarquia documental

O ROADMAP situa-se **acima das CAPs** e **abaixo da Constituição / Visões estratégicas de produto** no eixo de planejamento:

```text
CON-001 (norma máxima)
  │
  ├── VIS (visão de produto / capacidade)
  │
  ├── ROADMAP  ←── nível estratégico plurianual (acima das CAPs)
  │     │
  │     └── ÉPICO (agregação temática — estrutura interna do ROADMAP)
  │           │
  │           └── CAP (CAP-001)
  │                 │
  │                 └── VIS → REQ → ARQ → IMP → VAL → BASELINE  (ADR-006)
  │
  └── RELEASE (conjunto de baselines entregues como versão)
```

| Relação | Regra |
|---------|-------|
| ROADMAP × CON-001 | Nenhum ROADMAP pode contrariar a Constituição |
| ROADMAP × VIS | O Roadmap alinha-se às VIS homologadas; não as substitui |
| ROADMAP × CAP | O Roadmap **agrupa e sequencia** CAPs; não as redefine |
| ROADMAP × ADR-006 | O fluxo por capacidade permanece obrigatório; o Roadmap não é atalho |
| ROADMAP × ADR-015 | O filtro de uso diário permanece válido na priorização de épicos/releases |

---

## 3. Relação com ÉPICOS, CAPs e RELEASES

```text
ROADMAP
  ├── ÉPICO (ex.: Fundação, Executivo Digital, …)
  │     └── CAP-nn (uma ou mais capacidades do CAP-001)
  │           └── ciclo ADR-006 até BASELINE
  └── RELEASE (ex.: v0.6 … v1.0)
        └── épicos vinculados cuja conclusão fecha a release
```

| Conceito | Definição nesta ADR | Tipo documental? |
|----------|---------------------|------------------|
| **ÉPICO** | Agrupamento temático de CAPs **dentro** do ROADMAP | **Não** — estrutura interna do ROADMAP (não cria prefixo EPIC) |
| **CAP** | Capacidade oficial do CAP-001 | Sim — tipo CAP (já existente) |
| **BASELINE** | Estado homologado e congelado de uma CAP | Estado processual — não é tipo documental |
| **RELEASE** | Conjunto de baselines entregues como versão de produto | Tipo **REL** já previsto no catálogo (futuro); o ROADMAP **vincula** releases, mas não substitui o artefato REL |

### Regras de vínculo

| ID | Regra |
|----|-------|
| R1 | Todo ÉPICO do ROADMAP referencia apenas CAPs existentes no CAP-001 (ou criadas por ADR própria) |
| R2 | Um ÉPICO só se considera **concluído** quando todas as suas CAPs atingem BASELINE homologada |
| R3 | Uma RELEASE prevista no ROADMAP só se considera **fechada** quando os épicos vinculados estão concluídos e a validação correspondente é homologada |
| R4 | A abertura formal de uma CAP continua exigindo deliberação do CTO e início pela fase VIS (ADR-006) — o ROADMAP sozinho **não** abre CAP |
| R5 | Este tipo **não** autoriza a criação de CAP-06 nem de qualquer CAP neste ato |

---

## 4. Atualização da taxonomia oficial

Com a **Aceitação** desta ADR, o Engenheiro deve incluir em `docs/README.md` (taxonomia):

| Prefixo | Tipo | Localização | Quem elabora | Quem aprova |
|---------|------|-------------|--------------|-------------|
| **ROADMAP** | Planos estratégicos (acima das CAPs) | `docs/roadmap/` | Engenheiro/CTO | CTO, com aval do Usuário |

E incluir o exemplar vigente no índice documental.

**Neste momento (Aceita):** o catálogo **foi** atualizado conforme Deliberação Final do CTO (24/07/2026).

Documentos estratégicos (CON, VIS, CAP, **ROADMAP**) abrem respondendo às quatro perguntas do ADR-002.

---

## 5. Conteúdo mínimo de um ROADMAP

Todo ROADMAP oficial contém, no mínimo:

| # | Seção obrigatória |
|---|-------------------|
| 1 | Quatro perguntas (ADR-002) |
| 2 | Objetivo do Roadmap |
| 3 | Visão da meta estratégica (ex.: CEO 1.0) |
| 4 | Princípios de evolução do produto |
| 5 | Hierarquia de governança (ROADMAP → ÉPICO → CAP → … → RELEASE) |
| 6 | Épicos planejados (descrição, objetivo, CAPs associadas, estado) |
| 7 | Releases previstas e vínculo aos épicos |
| 8 | Critérios para abertura de novas CAPs |
| 9 | Dependências entre épicos |
| 10 | Critérios para a meta estratégica (ex.: v1.0) |
| 11 | Limites do artefato |
| 12 | Memória Organizacional e histórico de versões |

---

## 6. Versionamento e governança

### 6.1 Vocabulário de status

Aplica-se o vocabulário oficial do catálogo:

`Rascunho` → `Em análise` → `Aprovado` / `Homologado` → `Substituído` ou `Emendado`

### 6.2 Regras de versionamento

| ID | Regra |
|----|-------|
| V1 | Identificador ROADMAP-nnn é **permanente**; mudanças substantivas geram nova versão (x.y) com linha no histórico |
| V2 | Toda mudança de status registra os cinco campos da Memória Organizacional (CON-001 Art. 8º) |
| V3 | Emenda de ROADMAP homologado exige deliberação do CTO; não se altera conteúdo “em silêncio” |
| V4 | Um ROADMAP vigente por horizonte estratégico (ex.: até v1.0); ROADMAP-002 só nasce por deliberação (novo horizonte ou substituição) |
| V5 | O ROADMAP **não** reabre baselines de CAP, REQ, ARQ, IMP ou VAL homologados |

### 6.3 Critérios de homologação de um exemplar ROADMAP

| # | Critério |
|---|----------|
| H1 | Tipo ROADMAP instituído por esta ADR **Aceita** |
| H2 | Conteúdo mínimo (§5) completo |
| H3 | Não contradiz CON-001, CAP-001, ADR-006 nem ADR-015 |
| H4 | Não cria CAP nem altera artefatos homologados |
| H5 | Parecer favorável do CTO (e aval do Usuário) |
| H6 | Após Aceitação desta ADR, o catálogo está atualizado |

**Aceitação desta ADR ≠ homologação automática do ROADMAP-001.**  
O ROADMAP-001 permanece em análise até ato próprio de homologação **sem alteração de conteúdo**, conforme deliberação do CTO.

---

## 7. Efeitos pós-Aceitação (ordem obrigatória)

Após a Aceitação desta ADR pelo CTO, o Engenheiro executa **nesta ordem**:

1. ~~Atualizar a taxonomia e o índice em `docs/README.md` (tipo ROADMAP).~~ **Cumprido**  
2. ~~Declarar o tipo ROADMAP integrado à metodologia oficial.~~ **Cumprido**  
3. ~~Homologar o **ROADMAP-001** sem alterações de conteúdo.~~ **Cumprido**  
4. ~~Registrar Memória Organizacional / diário do projeto.~~ **Cumprido**

Ciclo de institucionalização do ROADMAP: **encerrado**. Projeto apto à abertura do primeiro Épico e da CAP-06 mediante deliberação própria.

---

## Alternativas consideradas

| Alternativa | Decisão |
|-------------|--------|
| Tratar o plano como emenda ao CAP-001 / CAP-002 | Rejeitada — CAP é catálogo/priorização de capacidades; ROADMAP é horizonte plurianual com épicos e releases |
| Usar VIS como roadmap | Rejeitada — VIS é visão de produto/capacidade; não agrega releases nem épicos plurianuais |
| Documento ad hoc em `docs/learning/` | Rejeitada — viola ADR-004 / regra do catálogo |
| Criar tipo ÉPICO separado | Rejeitada neste ato — épico é estrutura interna do ROADMAP; evita proliferação de tipos |
| Homologar ROADMAP-001 antes da ADR | Rejeitada — a própria observação de governança e a deliberação do CTO exigem ADR primeiro |

---

## Rastreabilidade

- Norma superior: CON-001 Art. 5º, Art. 7º §4º, Art. 8º; catálogo oficial (ADR-004).
- Precedentes de tipo: ADR-005, ADR-010, ADR-012, ADR-014.
- Fluxo de capacidades: ADR-006 (preservado).
- Priorização operacional: ADR-015 (preservada).
- Primeiro exemplar (ainda não homologado): `docs/roadmap/ROADMAP-001-plano-estrategico-do-sistema-ceo.md`.

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — instituir ROADMAP; propósito; hierarquia; épicos/CAPs/releases; taxonomia; versionamento; efeitos pós-Aceitação | Deliberação CTO — ADR antes da homologação do ROADMAP-001 | Em análise |
| 1.0 | 24/07/2026 | CTO homologou; Engenheiro publicou | Aceitação; tipo ROADMAP oficial; catálogo atualizado; ROADMAP-001 homologado | Deliberação Final CTO — ADR-016 APROVADA | **Aceita — publicada** |

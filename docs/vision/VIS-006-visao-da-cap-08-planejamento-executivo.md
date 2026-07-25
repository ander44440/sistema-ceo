# VIS-006 — Visão da CAP-08 (Planejamento Executivo)

> **Status: Aprovada / Homologada — v1.0 (CTO, 24/07/2026). Congelada — CAP-08 concluída.**  
> Versão 1.0 — 24/07/2026. Tipo VIS.  
> **Capacidade:** CAP-08 — Planejamento (CAP-001).  
> **Identificação:** VIS-006 (VIS-001…005 já ocupados).  
> Norma superior: CON-001 v1.0; ROADMAP-001 Homologado v1.0 (E4 — Autonomia Executiva); ÉPICO-002 (Autonomia Executiva); CAP-001 (CAP-08); ADR-006; ADR-015; ADR-016; ADR-017.  
> **Princípio Arquitetural homologado (identidade conceitual do CEO):** *"O CEO analisa antes de recomendar, recomenda antes de planejar e planeja antes de executar."*  
> **Ciclo CAP-08:** **encerrado** (VIS → REQ → ARQ → IMP → VAL). Relatório: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md).  
> **Proibição:** **não** reabrir esta VIS sem novo ciclo formal.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A visão de uma capacidade de **Planejamento Executivo** que transforma objetivos executivos em planos coordenados, precedidos por **Análise Executiva** obrigatória. |
| **Por que existe?** | O CEO já registra, conduz e comunica; ainda não planeja: falta transformar objetivos e prioridades em planos coordenados sem violar a autoridade do usuário. |
| **Para quem existe?** | Patrocinador (autoridade final que aprova planos); CTO (governança); Engenheiro (ciclo ADR-006 futuro). |
| **Como o sucesso será medido?** | Pelos critérios da §9, observáveis na experiência do patrocinador — planos claros, justificados, confirmáveis e rastreáveis. |

---

## 1. Objetivo da CAP-08

Dotar o CEO da capacidade de **transformar objetivos executivos em planos coordenados de execução**, **precedidos por uma etapa obrigatória de Análise Executiva**, mantendo o usuário como **autoridade final** para aprovação.

A CAP-08 qualifica **como** o CEO planeja: primeiro **analisa** (contexto, lacunas, riscos, dependências, alternativas, confiança), então **recomenda**, então **planeja** — e só então, sob confirmação, viabiliza **execução** (fora do CEO). Ela não substitui a condução (CAP-05) nem a comunicação (CAP-07); apoia-se nelas.

---

## 2. Contexto de negócio

* O CEO MVP (v0.1), a CAP-05 (Executivo Digital) e a CAP-07 (Comunicação) já estão na baseline: o sistema abre o dia, registra, conduz, coordena papéis e comunica de forma adaptada e transparente.
* O **ROADMAP-001** posiciona a **Autonomia Executiva (E4)** como próxima evolução, com a **CAP-08** como capacidade núcleo e horizonte de **release v0.7**.
* O **ÉPICO-002** delimitou o E4 às CAP-08 (núcleo), CAP-02 e CAP-03 (recorte inicial), na ordem recomendada `CAP-08 → CAP-02 → CAP-03`.
* O **Princípio Arquitetural** homologado estabelece a cadeia de raciocínio executivo do produto: **analisar → recomendar → planejar → executar**.
* O filtro **ADR-015** permanece: priorizar o que aproxima o uso diário no MG2, sem comprometer o rigor.

---

## 3. Problema a ser resolvido

Hoje, o CEO conduz até o **"próximo passo" único**, porém ainda:

* não transforma objetivos e prioridades em **planos estruturados e coordenados**;
* pode saltar da intenção à ação sem uma **análise executiva** explícita (contexto, riscos, alternativas, confiança);
* não organiza execução entre humanos e agentes de forma governada, sob confirmação.

Consequência: risco de planejar sem fundamento suficiente, de decisões sem rastro de raciocínio e de execução sem a autoridade explícita do usuário — contrariando o Princípio Arquitetural e o respeito ao tempo/autoridade do patrocinador.

---

## 4. Visão da solução

O CEO passa a planejar como um **executivo que raciocina antes de agir**:

1. **Analisa** (Análise Executiva obrigatória): compreende o contexto, identifica lacunas de informação, avalia riscos, identifica dependências, considera alternativas, justifica recomendações e indica o **nível de confiança**.
2. **Recomenda**: apresenta recomendação fundamentada na análise — sem impor.
3. **Planeja**: transforma a recomendação aprovada em plano coordenado (passos/tarefas), sempre distinguindo **proposta** de **vigência**.
4. **Executa (fora do CEO)**: só após confirmação do usuário; a execução técnica (ex.: MG2) permanece fora do CEO.
5. Integra-se à condução (CAP-05) e à comunicação (CAP-07) — **sem reabrir** essas baselines.

A cadeia **analisar → recomendar → planejar → executar** é a espinha dorsal da visão. Formas, requisitos e arquitetura pertencem a ciclos posteriores (ADR-006).

---

## 5. Benefícios esperados

| Benefício | Descrição |
|-----------|-----------|
| Raciocínio explícito | Toda proposta nasce de Análise Executiva rastreável. |
| Decisão mais segura | Riscos, dependências, alternativas e confiança tornados explícitos antes de planejar. |
| Autoridade preservada | Planos são propostos, não impostos; vigência exige confirmação. |
| Coordenação | Do "próximo passo" único a planos coordenados entre humanos e agentes. |
| Rastreabilidade | Cadeia objetivo → análise → recomendação → plano → (execução) observável. |
| Respeito ao tempo | Planejamento com o mínimo necessário, alinhado à CAP-07. |

---

## 6. Escopo (incluído)

| Item | Descrição |
|------|-----------|
| Análise Executiva | Etapa **obrigatória** precedente: contexto, lacunas, riscos, dependências, alternativas, justificativa, confiança. |
| Planejamento Executivo | Transformar objetivos/prioridades em planos coordenados (passos/tarefas). |
| Recomendação fundamentada | Recomendar com base na análise antes de planejar (Princípio Arquitetural). |
| Proposta ≠ vigência | Planos e recomendações não vigoram sem confirmação do usuário. |
| Nível de confiança | Toda proposta indica o grau de confiança associado. |
| Aproveitamento de CAP-05/07 | Usa condução e comunicação existentes como insumo, sem reabri-las. |

---

## 7. Fora do escopo

| Item | Motivo |
|------|--------|
| Requisitos, arquitetura, implementação, validação | Pertencem a REQ/ARQ/IMP/VAL posteriores (ADR-006). |
| Abrir CAP-02 (Gestão de Agentes) e CAP-03 (Gestão de Projetos) | Capacidades do mesmo épico; abertura por deliberação própria. |
| Coordenação plena de agentes | Núcleo da CAP-02; aqui apenas o que o planejamento pressupõe. |
| Observabilidade de portfólio (CAP-09) | Épico E5 / release v0.8. |
| Execução técnica do MG2 | Permanece fora do CEO (fronteira de execução). |
| Alterar registro/decisão da CAP-05 ou a comunicação da CAP-07 | Extensão sem regressão; baselines preservadas. |
| Aprender o perfil do usuário (CAP-06) | Capacidade distinta (E7). |

---

## 8. Atores envolvidos

| Ator | Papel na CAP-08 |
|------|-----------------|
| **Patrocinador / Usuário** | Define objetivos; aprova recomendações e planos; autoridade final. |
| **CTO** | Governa o ciclo; homologa VIS e etapas seguintes. |
| **Engenheiro (Cursor)** | Conduzirá REQ→VAL em ciclos futuros; não implementa nesta fase. |
| **CEO (sistema)** | Analisa, recomenda e planeja; nunca executa sem confirmação. |
| **Agentes de IA** | Fontes substituíveis de execução coordenada; sem dependência de agente específico. |

---

## 9. Critérios de sucesso

A visão da CAP-08 será considerada realizada (em ciclos futuros) quando forem **observáveis**:

| # | Critério |
|---|----------|
| 1 | Todo planejamento é **precedido** por Análise Executiva explícita. |
| 2 | A análise cobre contexto, lacunas, riscos, dependências, alternativas, justificativa e **nível de confiança**. |
| 3 | O CEO **recomenda antes de planejar** e **planeja antes de executar** (Princípio Arquitetural observável). |
| 4 | Planos são coordenados (passos/tarefas) e distinguem **proposta** de **vigência**. |
| 5 | Nenhum plano vigora ou é executado sem **confirmação** do usuário. |
| 6 | Nenhuma **regressão** das baselines MVP / CAP-05 / CAP-07 decorrente do planejamento. |
| 7 | A cadeia objetivo → análise → recomendação → plano é **rastreável**. |

Métricas e testes concretos serão definidos em REQ/VAL futuros — não nesta VIS.

---

## 10. Princípio Arquitetural e Análise Executiva (diretrizes obrigatórias)

Esta visão incorpora, de forma vinculante para os ciclos futuros da CAP-08:

**Princípio Arquitetural homologado (identidade conceitual do CEO):**

> **O CEO analisa antes de recomendar, recomenda antes de planejar e planeja antes de executar.**

```text
Análise Executiva → Recomendação → Planejamento Executivo → Execução (fora do CEO)
```

**Análise Executiva — objetivos obrigatórios (precedentes ao planejamento):**

1. compreender o contexto;  
2. identificar lacunas de informação;  
3. avaliar riscos;  
4. identificar dependências;  
5. considerar alternativas;  
6. justificar recomendações;  
7. indicar o nível de confiança da proposta.

A futura **REQ da CAP-08 deverá materializar** o Princípio e a Análise Executiva em **requisitos verificáveis** (determinação do CTO registrada no ÉPICO-002 §6.1). Tratamento opcional é vedado.

---

## 11. Rastreabilidade

### 11.1 Com o ROADMAP-001

| Elemento ROADMAP-001 | Vínculo |
|----------------------|---------|
| Épico **E4 — Autonomia Executiva** | A CAP-08 é a capacidade núcleo do E4 |
| Release **v0.7** | Horizonte de entrega da CAP-08 |
| Dependência **E3 → E4** | Satisfeita (CAP-07 na baseline) |
| Hierarquia (ADR-016) | ROADMAP → ÉPICO → **CAP-08** → VIS(-006) → REQ → ARQ → IMP → VAL → BASELINE → RELEASE |
| Critérios CEO 1.0 (§9) | A CAP-08 contribui; esta VIS não declara v1.0 |

### 11.2 Com o ÉPICO-002

| Elemento ÉPICO-002 | Vínculo |
|--------------------|---------|
| Capacidade núcleo do épico | **CAP-08 — Planejamento** |
| Objetivos da CAP-08 (§6.1 do épico) | Refletidos nas §1, §4, §9 e §10 desta VIS |
| Princípio Arquitetural (§6.1 do épico) | Incorporado na §10 desta VIS |
| Análise Executiva obrigatória | Incorporada no escopo (§6) e nas diretrizes (§10) |
| Critério de encerramento do épico | CAP-08 em BASELINE — esta VIS abre a primeira fase desse percurso |

### 11.3 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-002 → CAP-08 → VIS-006 (esta) → REQ → ARQ → IMP → VAL → BASELINE → RELEASE v0.7
```

---

## 12. Limites deste artefato

Esta VIS **não**:

* elabora requisitos nem abre REQ;
* propõe ou decide arquitetura nem abre ARQ;
* cria implementação nem validação;
* abre CAP-02, CAP-03 ou CAP-R;
* altera ROADMAP-001, ÉPICO-002, CAP-001, ADRs ou qualquer documento homologado;
* declara sucesso da release v0.7 ou do CEO 1.0.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO aprovou |
| Quando | 24/07/2026 |
| Por quê | Encerrar a fase VIS da CAP-08 e autorizar a fase REQ |
| Baseado em quê | Deliberação CTO — VIS-006 aprovada conceitualmente; abertura REQ; ROADMAP-001 (E4 / v0.7); ÉPICO-002; Princípio Arquitetural; CAP-001 (CAP-08); ADR-006; ADR-015 |
| Resultado | VIS-006 Aprovada v1.0; fase VIS encerrada; REQ-035 autorizado |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — objetivo, contexto, problema, visão, benefícios, escopo, atores, critérios, Princípio Arquitetural / Análise Executiva e rastreabilidade | Deliberação CTO — abertura da CAP-08 | Em elaboração |
| 1.0 | 24/07/2026 | CTO (aprovação) / Engenheiro (registro) | Aprovação conceitual; fase VIS encerrada; fase REQ aberta | Deliberação CTO — VIS-006 aprovada | **Aprovada** |

# ROADMAP-001 — Plano Estratégico do Sistema CEO

> **Status: Homologado — v1.0 (CTO, 24/07/2026).**  
> Versão 1.0 — 24/07/2026. Tipo ROADMAP (ADR-016).  
> **Natureza:** primeiro documento estratégico em nível **superior às capacidades (CAP)**, definindo a evolução do Sistema CEO até a **versão 1.0**.  
> Norma superior: CON-001 v1.0 (norma máxima); VIS-001/002/003/004; CAP-001 (mapa de capacidades); ADR-006 (fluxo de desenvolvimento); ADR-015 (priorização por uso operacional); **ADR-016** (tipo ROADMAP).  
> **Hierarquia:** ROADMAP → ÉPICO → CAP → VIS → REQ → ARQ → IMP → VAL → BASELINE → RELEASE.  
> **Proibições deste artefato:** não cria CAP; não altera código, arquitetura ou requisitos; não gera implementação; não abre ciclo por si — apenas orienta a sequência estratégica.  
> **Conteúdo estratégico:** homologado **sem alteração** em relação à v0.1 (Deliberação Final CTO — ADR-016).

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O plano estratégico de evolução do Sistema CEO, agrupando capacidades (CAP) em **épicos** e vinculando-os a **releases** até a v1.0. |
| **Por que existe?** | Para dar direção plurianual acima do nível de capacidade, evitando evolução ad hoc e preservando a hierarquia normativa. |
| **Para quem existe?** | Patrocinador (direção e prioridade), CTO (governança e sequenciamento) e Engenheiro (execução dentro do ciclo ADR-006). |
| **Como o sucesso será medido?** | Quando os critérios da §9 (CEO 1.0) forem observáveis e cada release entregar os épicos vinculados, sem violar CON-001. |

---

## 1. Objetivo do Roadmap

Estabelecer a **rota estratégica** do Sistema CEO — da fundação metodológica até a versão 1.0 — organizando as doze capacidades do CAP-001 em **épicos** coerentes, atribuindo-os a **releases** e definindo critérios objetivos de avanço.

O Roadmap **orienta**, não implementa. Ele não substitui o fluxo obrigatório de governança (ADR-006): todo avanço concreto continua exigindo VIS → REQ → ARQ → IMP → VAL por capacidade.

Filtro estratégico vigente (ADR-015) permanece válido: priorizar o que aproxima o uso diário do patrocinador (contexto MG2) sem comprometer o rigor arquitetural.

---

## 2. Visão do CEO 1.0

O **CEO 1.0** é o Sistema Executivo de Governança em que o usuário:

1. **Abre o dia** e recebe contexto, prioridades e próximo passo justificados — sem reconstruir de memória;
2. Tem suas **decisões registradas** com histórico vivo (Memória Organizacional) que **alimenta a condução**;
3. Recebe **coordenação** entre Patrocinador, CTO e Engenheiro (e agentes de IA) como uma equipe de alto desempenho;
4. Vê o **andamento e a rastreabilidade** de ponta a ponta (requisito → decisão → implementação → teste → homologação);
5. Conta com um CEO que **planeja, acompanha e aprende** continuamente, respeitando limites e a autoridade final do usuário;
6. Opera com **baixa carga cognitiva** e **independência de ferramenta** — nenhum agente é uma dependência.

O CEO 1.0 maximiza o **progresso do usuário por unidade de tempo** (missão CON-001), consolidando os quatro pilares: **Governança, Conhecimento, Execução, Aprendizado**.

---

## 3. Princípios de evolução do produto

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **P1** | Hierarquia inviolável | Nenhum nível inferior contraria CON-001 nem a hierarquia normativa. |
| **P2** | Uma capacidade por vez, com gates | Épicos e releases não dispensam o fluxo ADR-006 por capacidade. |
| **P3** | Extensão, não regressão | Cada evolução preserva baselines homologadas (ex.: MVP, CAP-05). |
| **P4** | Valor de uso primeiro | Prioriza o que aproxima o uso diário (ADR-015), sem sacrificar arquitetura. |
| **P5** | Rastreabilidade total | Todo avanço mantém a cadeia ROADMAP → … → RELEASE observável. |
| **P6** | Sugerir sem impor | O Roadmap propõe sequência; a autoridade de priorização é do usuário. |
| **P7** | Independência de ferramenta | Releases não criam dependência de nenhum agente/IA específico. |
| **P8** | Aprendizado contínuo | Evidências de uso e validação realimentam o próprio Roadmap. |

---

## 4. Hierarquia de governança

O Roadmap introduz dois níveis de agregação (**ROADMAP** e **ÉPICO**) **acima** do fluxo ADR-006, sem alterá-lo:

```text
ROADMAP  →  ÉPICO  →  CAP  →  VIS  →  REQ  →  ARQ  →  IMP  →  VAL  →  BASELINE  →  RELEASE
```

| Nível | Papel | Autoridade |
|-------|-------|------------|
| **ROADMAP** | Direção estratégica plurianual | Usuário (aprova), CTO (governa) |
| **ÉPICO** | Agrupamento temático de capacidades | CTO propõe; Usuário referenda |
| **CAP** | Capacidade do CAP-001 | CAP-001 (catálogo oficial) |
| **VIS→VAL** | Fluxo obrigatório ADR-006 por capacidade | CTO (gates), Usuário (aval) |
| **BASELINE** | Estado homologado e congelado da CAP | CTO declara; não reabre sem novo ciclo |
| **RELEASE** | Conjunto de baselines entregues como versão | Usuário aprova a versão |

Regra: um **ÉPICO** só é considerado concluído quando todas as suas CAPs atingem **BASELINE**; uma **RELEASE** só fecha quando seus épicos vinculados estão concluídos.

---

## 5. Épicos planejados

> Descrições estratégicas. **Não** criam CAP nem redefinem o CAP-001; apenas agrupam capacidades existentes.

### E1 — Fundação — **Concluído**

* **Objetivo:** Estabelecer a base metodológica, normativa e documental do CEO (constituição, capacidades, ADRs, acervo de conhecimento) e o MVP de uso diário.
* **Capacidades associadas:** CAP-01 (Governança), CAP-04 (Gestão do Conhecimento), infraestrutura documental; MVP v0.1 (VIS-003 / ARQ-008 / IMP-005).
* **Estado:** Fundação metodológica preservada; MVP em trilha própria (VAL-005). Marco `CEO-MVP-START`.

### E2 — Executivo Digital — **Concluído**

* **Objetivo:** Transformar o CEO de registrador em condutor: Memória Organizacional viva, condução executiva e coordenação de papéis.
* **Capacidades associadas:** CAP-05 (Memória Organizacional).
* **Estado:** Ciclo completo homologado (VIS-004 → REQ-033 → ARQ-009 → IMP-006 → VAL-006). Baseline congelada.

### E3 — Inteligência Executiva

* **Objetivo:** Elevar a qualidade da condução — recomendações mais ricas, comunicação adaptada e feedback claro ao patrocinador (evolução das evidências E-01…E-03 da VAL-005).
* **Capacidades associadas:** CAP-07 (Comunicação); reforço de CAP-05; experiência/feedback.
* **Objetivo de sucesso:** O patrocinador percebe o CEO como interlocutor executivo, não apenas painel.

### E4 — Autonomia Executiva

* **Objetivo:** Permitir que o CEO planeje e proponha execução coordenada, transformando prioridades em planos e tarefas distribuíveis — sempre sob confirmação.
* **Capacidades associadas:** CAP-08 (Planejamento); CAP-02 (Gestão de Agentes); CAP-03 (Gestão de Projetos).
* **Objetivo de sucesso:** Do "próximo passo" único a planos coordenados entre humanos e agentes, sem violar autoridade.

### E5 — Gestão Estratégica

* **Objetivo:** Dar ao CEO visão de portfólio e progresso — acompanhar o andamento e a rastreabilidade de ponta a ponta.
* **Capacidades associadas:** CAP-09 (Observabilidade); CAP-03 (Gestão de Projetos).
* **Objetivo de sucesso:** O usuário enxerga progresso e rastro completo sem montá-los manualmente.

### E6 — Inteligência Organizacional

* **Objetivo:** Consolidar segurança, limites e integrações — o CEO opera com múltiplos agentes/ferramentas mantendo independência e respeito a limites.
* **Capacidades associadas:** CAP-10 (Segurança); CAP-11 (Integrações); reforço de CAP-04/CAP-09.
* **Objetivo de sucesso:** Nenhum agente ultrapassa limites; nenhuma dependência de ferramenta única.

### E7 — Aprendizagem Organizacional

* **Objetivo:** Fechar o ciclo de evolução contínua — aprender sobre o usuário e absorver competências observáveis de agentes, e desenvolver o usuário.
* **Capacidades associadas:** CAP-06 (Aprendizado); CAP-12 (Desenvolvimento do Usuário).
* **Restrição:** **Não** abrir CAP-06 neste artefato; épico apenas planejado.
* **Objetivo de sucesso:** Competências viram patrimônio via ciclo de maturação (Observação → Hipótese → Validação → Aprovação → Evolução).

---

## 6. Releases previstas (v0.6 → v1.0)

> Vinculação estratégica; datas e escopo detalhado dependem dos ciclos ADR-006 de cada capacidade.

| Release | Tema | Épicos vinculados | Marco de conclusão |
|---------|------|-------------------|--------------------|
| **v0.5** (base atual) | Fundação + Executivo Digital | E1, E2 (concluídos) | MVP v0.1 + CAP-05 na baseline |
| **v0.6** | Inteligência Executiva | E3 | CAP-07 + evolução E-01…E-03 em baseline |
| **v0.7** | Autonomia Executiva | E4 | CAP-08 (+ CAP-02/03 iniciais) em baseline |
| **v0.8** | Gestão Estratégica | E5 | CAP-09 (+ CAP-03) em baseline |
| **v0.9** | Inteligência Organizacional | E6 | CAP-10 + CAP-11 em baseline |
| **v1.0** | Aprendizagem Organizacional + consolidação | E7 (+ fechamento E3…E6) | CAP-06 + CAP-12 em baseline; critérios §9 atendidos |

Cada release fecha somente quando os épicos vinculados atingem conclusão (todas as CAPs em BASELINE) e a validação correspondente é homologada.

---

## 7. Critérios para abertura de novas CAPs

Uma nova CAP (ou a abertura formal de uma CAP existente do CAP-001) só ocorre quando, cumulativamente:

1. Está prevista no **CAP-001** (ou um ADR a inclui formalmente) e vinculada a um **épico** deste Roadmap;
2. Possui origem rastreável em **CON-001** e em uma **VIS** (sem capacidade órfã);
3. Passa pelo **filtro ADR-015** (valor de uso) e não regride baseline homologada;
4. O **épico anterior dependente** (§8) está concluído ou a dependência é explicitamente dispensada pelo CTO;
5. O CTO **delibera a abertura** e autoriza o início pela fase VIS (ADR-006);
6. Não há reabertura implícita de baseline congelada — divergência exige **novo ciclo**.

Este artefato **não** abre nenhuma CAP.

---

## 8. Dependências entre os épicos

```text
E1 Fundação (✔)
      │
      ▼
E2 Executivo Digital (✔)
      │
      ▼
E3 Inteligência Executiva
      │
      ▼
E4 Autonomia Executiva ──────► E5 Gestão Estratégica
      │                               │
      └───────────────┬───────────────┘
                      ▼
            E6 Inteligência Organizacional
                      │
                      ▼
            E7 Aprendizagem Organizacional
```

| Épico | Depende de | Justificativa |
|-------|------------|---------------|
| E3 | E2 | Condução precisa da Memória Organizacional viva |
| E4 | E3 | Planejar/coordenar pressupõe condução madura |
| E5 | E4 | Observabilidade de portfólio pressupõe planos/execução |
| E6 | E4, E5 | Segurança/integrações regem execução e observabilidade em escala |
| E7 | E3, E4, E5, E6 | Aprender exige base de condução, execução, visão e limites estáveis |

Épicos concluídos (E1, E2) são **pré-condição consolidada** — não reabertos por este Roadmap.

---

## 9. Critérios para o Sistema CEO versão 1.0

O CEO é declarado **v1.0** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | Épicos E1…E7 concluídos (todas as CAPs vinculadas em **BASELINE** homologada). |
| 2 | Releases v0.6…v1.0 entregues, cada uma com sua **VAL** homologada. |
| 3 | Os quatro pilares (Governança, Conhecimento, Execução, Aprendizado) têm capacidade operante e evidenciada. |
| 4 | A cadeia de rastreabilidade ROADMAP → ÉPICO → CAP → VIS → REQ → ARQ → IMP → VAL → BASELINE → RELEASE está observável de ponta a ponta. |
| 5 | O patrocinador declara uso diário com baixa carga cognitiva e sem reconstrução de contexto (evolução do critério VIS-003 §7). |
| 6 | Independência de ferramenta preservada: nenhum agente é dependência única. |
| 7 | Nenhuma baseline homologada foi regredida; divergências viraram novos ciclos. |
| 8 | CTO delibera formalmente a marca **v1.0** e o Usuário a aprova. |

Enquanto qualquer critério não for evidenciado, a v1.0 **não** é declarada.

---

## 10. Limites deste artefato

Este ROADMAP **não**:

* cria capacidades (incluindo **CAP-06**), requisitos, arquitetura ou implementação;
* altera código ou baselines homologadas (MVP, CAP-05);
* dispensa o fluxo ADR-006 nem a autoridade do usuário;
* formaliza, sozinho, o tipo documental — o tipo ROADMAP foi instituído pela **ADR-016 Aceita v1.0**.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Estabelecer o plano estratégico do Sistema CEO acima do nível de capacidade |
| Baseado em quê | Deliberação do CTO — abertura do ROADMAP-001; Aceitação ADR-016; CON-001; VIS-001…004; CAP-001; ADR-006; ADR-015 |
| Resultado | ROADMAP-001 Homologado v1.0 (conteúdo idêntico à v0.1); tipo ROADMAP oficial; projeto apto a Épico / CAP-06 sob deliberação própria |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — objetivo, visão 1.0, princípios, hierarquia, épicos E1–E7, releases v0.6–v1.0, critérios de CAP, dependências e critérios 1.0 | Deliberação CTO — abertura ROADMAP-001 | Em análise |
| 1.0 | 24/07/2026 | CTO homologou; Engenheiro registrou | Homologação sem alteração de conteúdo; tipo ROADMAP instituído (ADR-016) | Deliberação Final CTO — ADR-016 APROVADA | **Homologado** |

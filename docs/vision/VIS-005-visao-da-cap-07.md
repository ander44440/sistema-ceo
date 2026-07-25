# VIS-005 — Visão da CAP-07 (Comunicação)

> **Status: Homologado — v1.0 (CTO, 24/07/2026).**  
> Versão 1.0 — 24/07/2026. Tipo VIS.  
> **Capacidade:** CAP-07 — Comunicação (CAP-001).  
> **Identificação:** VIS-005 (VIS-001…004 já ocupados). Primeiro artefato do ciclo da CAP-07 (fase VIS).  
> Norma superior: CON-001 v1.0; ROADMAP-001 Homologado v1.0 (E3 — Inteligência Executiva); ÉPICO-001 (Inteligência Executiva); CAP-001 (CAP-07); ADR-006; ADR-015; ADR-016.  
> **Proibição explícita:** este documento **não** elabora requisitos por si; **não** propõe arquitetura; **não** cria implementação. Define a **visão funcional** da CAP-07.  
> **Fase de Visão da CAP-07:** **encerrada** com esta homologação. **Fase de Requisitos (REQ):** aberta — ver REQ-034 (Deliberação CTO, 24/07/2026).

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A visão de uma capacidade de **Comunicação** que entrega ao usuário o mínimo necessário para avançar com segurança, de forma adaptada e transparente. |
| **Por que existe?** | A condução (CAP-05) já ocorre, mas a comunicação ainda não é governada: falta síntese, adaptação e transparência sistemáticas. |
| **Para quem existe?** | Patrocinador (destinatário da comunicação); CTO (governança); Engenheiro (ciclo ADR-006 futuro). |
| **Como o sucesso será medido?** | Pelos critérios da §9, observáveis na experiência do patrocinador — sem depender de métricas vagas. |

---

## 1. Objetivo da CAP-07

Dotar o CEO de uma **capacidade de comunicação** que entregue ao usuário **o mínimo necessário para avançar com segurança**: mensagens adaptadas ao perfil e ao momento, sem burocracia nem repetição, com **transparência** sobre limitações e incertezas.

A CAP-07 qualifica **como** o CEO se comunica ao conduzir (CAP-05); não altera **o que** ele registra ou decide.

---

## 2. Contexto de negócio

* O CEO MVP (v0.1) e a CAP-05 (Executivo Digital) já estão na baseline: o sistema abre o dia, registra decisões, conduz e coordena papéis.
* A **VAL-005** evidenciou oportunidades de **inteligência executiva, feedback e clareza** (E-01…E-03) — insumos estratégicos, não correção do MVP.
* O **ROADMAP-001** posiciona a **Inteligência Executiva (E3)** como próxima evolução, com a **CAP-07** como capacidade central e horizonte de **release v0.6**.
* O **ÉPICO-001** delimitou o E3 exclusivamente à **CAP-07** (Alternativa A da reconciliação).
* O filtro **ADR-015** permanece: priorizar o que aproxima o uso diário no MG2, sem comprometer o rigor.

---

## 3. Problema a ser resolvido

Hoje, ao conduzir, o CEO pode:

* comunicar de forma **pouco adaptada** ao momento e ao perfil do patrocinador;
* apresentar contexto, justificativa e feedback **sem a síntese** necessária (excesso ou escassez de informação);
* não tornar **explícitas** suas limitações e incertezas de forma sistemática.

Consequência: risco de **carga cognitiva** desnecessária e de decisões tomadas com clareza insuficiente — contrariando o princípio de respeito ao tempo do usuário.

---

## 4. Visão da solução

O CEO passa a comunicar-se como um **executivo que respeita o tempo do usuário**:

1. **Adapta** a mensagem ao perfil, ao momento e ao tipo de decisão.
2. Entrega o **mínimo necessário** — síntese primeiro; detalhe sob demanda.
3. É **transparente** sobre limitações, incertezas e ausência de base (coerente com “registrado ≠ inventado”).
4. Preserva **“sugerir sem impor”**: comunica opções e recomendações sem forçar vigência.
5. Integra-se à condução (CAP-05) como **camada de expressão**, sem reabrir a baseline CAP-05.

A solução é descrita aqui em **nível de visão**; formas, requisitos e arquitetura pertencem a ciclos posteriores (ADR-006).

---

## 5. Benefícios esperados

| Benefício | Descrição |
|-----------|-----------|
| Menor carga cognitiva | O usuário lê menos e decide melhor (RNF de baixa carga). |
| Decisão mais segura | Contexto e justificativa comunicados com clareza. |
| Confiança | Transparência sobre limitações e incertezas. |
| Respeito ao tempo | Comunicação sem burocracia nem repetição. |
| Coerência executiva | O “CEO” comunica como interlocutor, não apenas como painel. |

---

## 6. Escopo (incluído)

| Item | Descrição |
|------|-----------|
| Comunicação adaptada | Ajuste ao perfil do usuário e ao momento da interação. |
| Mínimo necessário | Síntese como padrão; detalhe sob demanda. |
| Transparência | Explicitar limitações, incertezas e ausência de base. |
| Expressão da condução | Comunicar contexto, justificativa e feedback já produzidos pela CAP-05. |
| Aproveitamento de E-01…E-03 | Tratar as evidências de comunicação/feedback como insumo (sem reabrir CAP-05). |

---

## 7. Fora do escopo

| Item | Motivo |
|------|--------|
| Requisitos, arquitetura, implementação | Pertencem a REQ/ARQ/IMP posteriores (ADR-006). |
| Redesign visual / identidade (E-02/E-03) como obrigação | Oportunidades de evolução; não são objeto desta visão. |
| Aprender o perfil do usuário (CAP-06) | Capacidade distinta (Aprendizado). |
| Conteúdo educacional estruturado (CAP-12) | Capacidade distinta (Desenvolvimento do Usuário). |
| Planejamento de tarefas (CAP-08) | Pertence ao E4 no ROADMAP. |
| Alterar registro/decisão da CAP-05 | A CAP-07 é camada de expressão; não muda o que é registrado. |
| Execução do MG2 | Permanece fora do CEO (fronteira de execução). |

---

## 8. Atores envolvidos

| Ator | Papel na CAP-07 |
|------|-----------------|
| **Patrocinador / Usuário** | Destinatário da comunicação; avalia clareza, adaptação e carga cognitiva; autoridade final. |
| **CTO** | Governa o ciclo; homologa VIS e etapas seguintes. |
| **Engenheiro (Cursor)** | Conduzirá REQ→VAL em ciclos futuros; não implementa nesta fase. |
| **CEO (sistema)** | Emissor da comunicação adaptada, mínima e transparente. |
| **Agentes de IA** | Fontes substituíveis; a comunicação não cria dependência de agente específico. |

---

## 9. Critérios de sucesso

A visão da CAP-07 será considerada realizada (em ciclos futuros) quando forem **observáveis**:

| # | Critério |
|---|----------|
| 1 | O usuário recebe, nos pontos de condução, o **mínimo necessário** para decidir com segurança. |
| 2 | A comunicação é **adaptada** ao momento/perfil (síntese padrão; detalhe sob demanda). |
| 3 | Limitações, incertezas e **ausência de base** são explicitadas (sem invenção). |
| 4 | O princípio **“sugerir sem impor”** é preservado na comunicação. |
| 5 | Percepção de **menor carga cognitiva** e respeito ao tempo (evolução do espírito VIS-003 §7). |
| 6 | Nenhuma **regressão** da baseline CAP-05 / MVP decorrente da comunicação. |

Métricas e testes concretos serão definidos em REQ/VAL futuros — não nesta VIS.

---

## 10. Rastreabilidade

### 10.1 Com o ROADMAP-001

| Elemento ROADMAP-001 | Vínculo |
|----------------------|---------|
| Épico **E3 — Inteligência Executiva** | A CAP-07 é a capacidade central do E3 |
| Release **v0.6** | Horizonte de entrega da CAP-07 |
| Dependência **E2 → E3** | Satisfeita (CAP-05 na baseline) |
| Hierarquia (ADR-016) | ROADMAP → ÉPICO → **CAP-07** → VIS(-005) → REQ → ARQ → IMP → VAL → BASELINE → RELEASE |
| Critérios CEO 1.0 (§9) | A CAP-07 contribui; esta VIS não declara v1.0 |

### 10.2 Com o ÉPICO-001

| Elemento ÉPICO-001 | Vínculo |
|--------------------|---------|
| Capacidade pertencente ao épico | **CAP-07 — Comunicação** (única) |
| Objetivos da CAP-07 (§5 do épico) | Refletidos nas §1, §4 e §9 desta VIS |
| Reforço E-01…E-03 como insumo | Incorporado no escopo (§6) sem reabrir CAP-05 |
| Critério de encerramento do épico | CAP-07 em BASELINE — esta VIS abre a primeira fase desse percurso |

### 10.3 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-001 → CAP-07 → VIS-005 (esta) → REQ → ARQ → IMP → VAL → BASELINE → RELEASE v0.6
```

---

## 11. Limites deste artefato

Esta VIS **não**:

* elabora requisitos nem abre REQ;
* propõe ou decide arquitetura nem abre ARQ;
* cria implementação;
* altera ROADMAP-001, ÉPICO-001, CAP-001 ou qualquer documento homologado;
* declara sucesso da release v0.6 ou do CEO 1.0.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Abrir e encerrar a fase VIS da CAP-07; autorizar a fase REQ |
| Baseado em quê | Deliberação CTO — homologação VIS-005 e abertura REQ; ROADMAP-001; ÉPICO-001; CAP-001 (CAP-07); ADR-006; ADR-015 |
| Resultado | VIS-005 Homologada v1.0; fase VIS encerrada; REQ-034 autorizado |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — objetivo, contexto, problema, visão, benefícios, escopo, atores, critérios de sucesso e rastreabilidade | Deliberação CTO — abertura da CAP-07 | Em análise |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase VIS encerrada; fase REQ aberta | Deliberação CTO — VIS-005 homologada | **Homologado** |

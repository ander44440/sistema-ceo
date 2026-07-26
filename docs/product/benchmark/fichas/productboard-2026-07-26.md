# Ficha — Productboard (26/07/2026)

> **Status: Homologada — Gate F1-F (CTO, 26/07/2026). Integra a base documental da IPR-001.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.  
> Domínio: product management / decisões de produto com evidência e impacto.  
> Foco deliberado: evidências para **HP-005** (decisão como unidade de progresso); sinais para HP-003/HP-004.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Productboard** |
| Categoria | Executiva (product management / roadmap / decisões de produto) |
| URL / fonte | https://www.productboard.com/ (observado 26/07/2026) |
| Versão / superfície observada | Página pública do produto |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Parcial** (forte em decisão grounded + fecho de loop impacto; domínio = PM tooling, não Home conversacional do CEO) |

---

## 1. Identidade do Produto

Productboard apresenta-se como sistema de **product management agentic**: usa sinais de clientes, codebase e estratégia para que **cada decisão de produto seja grounded**, cada spec pronta para entrega e cada lançamento informe o roadmap ([productboard.com](https://www.productboard.com/)). Promessa: oportunidades → specs → **medir impacto do que foi shipped**.

## 2. Primeira Impressão

Tom de **plataforma de decisões de produto com evidência**, não de task tracker por %. “Where 100x product makers do their best work.” Sensação: priorização e alinhamento, não chat executivo genérico.

## 3. Organização da Informação

* Fluxo declarado: **sinais/oportunidades → decisão/spec → entrega → aprendizado pós-lançamento → roadmap**.  
* Insights com **citações/evidências** para cada finding.  
* Roadmap alinhado a strategy / product objectives / business goals.  
* Feedback centralizado ligado a feature ideas.  
* Visibilidade executiva: progresso de initiatives vs. objetivos de negócio.

## 4. Fluxo de Uso

1. Centralizar feedback e sinais.  
2. Surfar oportunidades com evidência citável.  
3. Decidir e produzir spec delivery-ready (agente sintetiza; humano decide).  
4. Alinhar roadmap e entregar.  
5. Medir impacto do que shipped e realimentar o roadmap.

## 5. Apoio à Tomada de Decisão

O produto **nomeia a decisão** como ato central (“decisions only you can make”; “product decisions… backed by evidence”). Progresso não é apenas % de features: inclui **fecho de loop** (spec ↔ shipped ↔ worked?). Case Salesforce: “messy middle” de dados para grandes decisões.

## 6. Diferenciais Observados

### O que pode informar o CEO (adaptar, não copiar)

| Incorporar (conceitual) | Por quê |
|-------------------------|---------|
| Comunicar progresso por **decisões tomadas + efeitos** (impacto pós-entrega) | Evidência central para **HP-005** |
| Decisão grounded em evidência citável | P2 — informação → decisão; rastreabilidade |
| Fechar o loop spec → shipped → aprendizado | Continuidade (HP-002/HP-003) |
| Agente sintetiza; humano decide | Controle (P1); não autonomia opaca total |
| Atenção a oportunidades/tendências antes da árvore completa de feedback | Sinal **HP-004** |

## 7. O que NÃO copiar para o CEO

| Não incorporar | Por quê |
|----------------|---------|
| Identidade de product management suite como Home | CEO ≠ Productboard; domínio PM |
| Roadmap de features como Resumo Executivo | Pode virar board de itens sem decisão explícita |
| Feedback wall / insight browser como superfície inicial | Risco de exploração antes da atenção (conflito HP-004 se mal portado) |
| Multi-função (Sales, CS, Marketing, Devs) no mesmo hub sem COA | Conflita isolamento REQ-039 |
| “Agentic” sem transparência de limites | Risco H5 / CON-001 p.8 |

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Alta (conceitual p/ HP-005) / Média-baixa (forma)** | Alta para tratar **decisão + efeito** como unidade de progresso; baixa-média na forma (PM platform, não conversa+COA). |

### Relação explícita com HP-005

| Aspecto HP-005 | Evidência Productboard |
|----------------|------------------------|
| Decisão como unidade | “every product decision is grounded”; “decisions only you can make” |
| Efeitos, não só % tasks | “Measure the impact of what shipped”; post-launch learnings → roadmap |
| Contraste com % conclusão | Progresso narrado por impacto e alinhamento a objetivos, não por contagem de tasks |

---

## Dimensões (D1–D10) — rubrica complementar

| ID | Nota (1–5 / N/A) | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------------------|-----------|-------------------|----------------|
| D1 Controle | 4 | Humano decide; agente sintetiza | Controlo na decisão | Agentic opaco |
| D2 Info → decisão | 5 | Evidence-backed findings | Evidência antes de decidir | Insight sem ação |
| D3 Clareza | 4 | Fluxo oportunidade→impacto | Vocabulário de decisão | Jargão PM |
| D4 Densidade / elegância | 3 | Plataforma ampla | — | Densidade de suite |
| D5 Consistência | 4 | Processos padronizados de PM | Ritual estável | — |
| D6 Objetivo por superfície | 3 | Roadmap / strategy alignment | Um foco por vista | Multi-persona hub |
| D7 Conversação | 1 | Não é chat-first | — | Forçar chat no PM tool |
| D8 Contexto / isolamento | 2 | Feedback org amplo | — | Sem COA |
| D9 Tempo do usuário | 3 | Spec mais rápida; menos messy middle | Sintetizar para decidir | Intake infinito |
| D10 Identidade / tom | 3 | Product makers | — | Identidade PM |

## Implicações por frente

| Frente | Implicação (se houver) |
|--------|------------------------|
| UX | Progresso executivo = decisões + efeitos, não barra de % de tarefas (HP-005) |
| UI | N/A nesta fase |
| Branding | Governança por decisões ≠ product ops suite |
| Design system | N/A |

## Conclusão

Productboard ensina que **o progresso relevante é a decisão grounded e o impacto do que foi feito** — evidência forte para HP-005; a forma de PM tooling não deve ser a Home do CEO.

---

## Memória Organizacional (da ficha)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Ampliar corpus pós F1-E; testar HP-005 |
| Baseado em quê | productboard.com; deliberação HP-005 |
| Resultado | Ficha v0.1 submetida ao CTO |

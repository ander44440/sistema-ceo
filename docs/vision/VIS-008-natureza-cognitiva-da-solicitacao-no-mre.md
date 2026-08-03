# VIS-008 — Natureza Cognitiva da Solicitação no Motor de Raciocínio Executivo (MRE)

> **Status: Rascunho — v0.1 (30/07/2026).** Aguarda análise conjunta (Patrocinador + CTO).  
> Tipo VIS. **Identificação:** VIS-008 (VIS-001…007 já ocupados).  
> Norma superior: CON-001; VIS-001; ADR-015; ADR-019; ARQ-013; REQ-048…051 (baseline MRE — **não reabre** neste VIS).  
> Origem: uso em produção autorizada do MRE (Gate Final 30/07/2026) + investigação de qualidade do estágio 6.  
> **Proibição explícita:** este documento **não** contém requisitos, ADR, arquitetura nem implementação.  
> **Não altera:** pipeline vigente, orquestrador, Speaker, validador, enums, código.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Visão de evolução do MRE para **classificar a natureza cognitiva** da solicitação **antes** da deliberação operacional, distinguindo método, decisão, planejamento e explicação. |
| **Por que existe?** | Em produção, perguntas metodológicas foram tratadas como decisões operacionais com dados em falta, degradando a qualidade do raciocínio executivo. |
| **Para quem existe?** | Patrocinador (uso diário / MG2); CTO (análise e eventual ciclo ADR-006); Engenheiro (escopo futuro — fora deste documento). |
| **Como o sucesso será medido?** | Quando perguntas do tipo «como decidir» receberem **método/critérios** e só pedidos com alternativas concretas forem tratados como **decisão operacional** — critérios na §8. |

---

## 1. Problema observado em produção

Após a autorização de produção do MRE (regime R1), o patrocinador submeteu uma pergunta **metodológica**:

> «Tenho cinco demandas críticas e só posso executar duas hoje. Como você decidiria quais fazer primeiro?»

O sistema **não** respondeu com um quadro executivo de priorização (critérios, trade-offs, princípios aplicáveis). Em vez disso, o estágio 6 tendeu a atos cautelosos (`solicitar_dados` ou, noutra corrida, `delegar`), como se faltassem as cinco demandas nomeadas para poder deliberar.

**Problema central:** o MRE não distingue a **natureza cognitiva** do pedido. Trata o fluxo deliberativo operacional (diagnóstico → dossier de factos → decisão sobre itens) também quando o utilizador pede **como pensar**, não **o que escolher entre itens concretos**.

Consequência observável: perda de valor executivo — o utilizador queria **método**; o motor exigiu **inventário**.

---

## 2. Evidências coletadas durante a investigação

Investigação técnica (sem alteração de arquitetura) registou:

| Evidência | Achado |
|-----------|--------|
| Classificação de intenção atual | `deliberar` / rota deliberativa MRE (stub); não há tipo «método» vs «decisão sobre itens» |
| Dossier no estágio 6 | `factosUsados: []`; `resumoPainel: "Painel disponível"` (genérico); as cinco demandas **não** estavam no contexto |
| `lacunas` oficiais antes do estágio 6 | `[]`; `shortCircuit: false` — o código **não** forçou `solicitar_dados` |
| Estágios 4 e 5a | Narraram «dados insuficientes» / risco alto de decidir sem dados, **mesmo** com lacunas vazias |
| Estágio 6 (pós-correção do enum) | Valores válidos do enum (`solicitar_dados`, noutro run `delegar`); **sem** `ENUM_ILEGAL` |
| Lacuna «Informação essencial não especificada» | Injetada **depois** quando o LLM escolhe `solicitar_dados` com `lacunas` vazias — efeito, não causa |
| Prompt do estágio 6 | Lista o enum fechado; **não** instrui explicitamente «na dúvida, solicitar_dados»; também **não** distingue pergunta metodológica |
| Princípios (estágio 3) | Já permitiam deliberar um **método** sem listar as demandas; a pergunta era sobre *como* decidir |

**Causa de qualidade (diagnóstico):** contexto pobre + narrativa 4/5a de insuficiência + ausência de classificação cognitiva prévia → deliberação operacional cautelosa em vez de resposta metodológica.

*(Nota: a correção mínima do `schemaHint` do estágio 6 eliminou `estado: "decisao"` ilegal; **não** resolve este problema de natureza cognitiva.)*

---

## 3. Comportamento atual

1. A intenção stub encaminha a pergunta aberta/prioritária para a **rota deliberativa** do MRE.  
2. O pipeline 0–7 assume enquadramento típico de **decisão operacional** (`tipoPedido` tende a `decisao`).  
3. O dossier exige factos/painel para «decidir com segurança».  
4. Sem itens concretos, análise e riscos enfatizam falta de dados.  
5. O estágio 6 escolhe frequentemente `solicitar_dados` (ou `delegar` / alternativas de adiamento), em vez de emitir critérios de priorização.  
6. O Speaker verbaliza o ato cauteloso — o utilizador não recebe o **método** pedido.

Em resumo: **todo deliberativo opera como se fosse decisão sobre instâncias**, salvo short-circuit por lacunas DET.

---

## 4. Comportamento esperado

Antes (ou no limiar) da deliberação operacional, o MRE (ou o Núcleo a montante) deve reconhecer a **natureza cognitiva** da solicitação e adaptar o modo de raciocínio:

| Natureza cognitiva | Resposta esperada do CEO |
|--------------------|---------------------------|
| **Método de decisão** | Oferecer critérios, princípios, trade-offs e processo — **sem** exigir a lista completa de itens |
| **Decisão operacional** | Deliberar sobre alternativas/itens concretos; lacunas materiais → `solicitar_dados` quando faltar o essencial |
| **Planejamento** | Estruturar passos/plano (alinhado à visão CAP-08: analisar → recomendar → planejar) |
| **Explicação** | Justificar ou esclarecer um estado/decisão já existente — sem reabrir escolha operacional |

Para a pergunta observada: natureza **método de decisão** → emitir quadro de priorização (ex.: urgência × impacto × ADR-015 × tempo do patrocinador), eventualmente sugerindo quais dados melhoraríam a escolha **sem bloquear** o método.

A autoridade final do patrocinador e o enum fechado de `EstadoDecisaoExecutiva` (REQ-048) **permanecem**; o que muda é **quando** e **como** se entra no modo «falta de dados operacionais».

---

## 5. Casos de uso afetados

| Caso | Impacto se a visão for adotada |
|------|--------------------------------|
| Priorização diária no MG2 («como escolher o que fazer hoje») | Método primeiro; decisão sobre itens só quando houver lista |
| Trade-offs estratégicos («como balancear X vs Y») | Critérios e princípios, não pedido prematuro de inventário |
| Escolha entre itens nomeados («A ou B?», «qual das cinco?») | Continua deliberação operacional com dossier |
| Pedidos de plano («monte um plano para…») | Modo planejamento, não decisão binária |
| Pedidos de justificação («explique por que…») | Modo explicação; não reabre escolha |
| Uso do Centro / Conversa sob ADR-015 | Menos fricção; mais progresso por unidade de tempo |

---

## 6. Exemplos de classificação

| Solicitação (exemplo) | Natureza cognitiva | Comportamento esperado |
|----------------------|--------------------|-------------------------|
| «Como você decidiria?» / «Como priorizar o que fazer hoje?» | **Método de decisão** | Critérios e processo; não bloquear por ausência da lista de itens |
| «Qual das cinco devo fazer?» (itens conhecidos ou listados) | **Decisão operacional** | Deliberar entre alternativas; `solicitar_dados` só se faltar dado material à escolha |
| «Monte um plano para entregar o Gate E5» | **Planejamento** | Análise → recomendação → plano coordenado (sem tratar como escolha A/B) |
| «Explique por que adiámos o outdoor» | **Explicação** | Justificativa rastreável; sem nova decisão operacional |

Outros exemplos de fronteira (para análise conjunta, sem fechar REQ):

| Solicitação | Natureza provável |
|-------------|-------------------|
| «Quais critérios usarias para cortar o backlog?» | Método |
| «Entre pagamento e outdoor, o que faço primeiro?» | Decisão operacional |
| «Como estruturar a semana do MG2?» | Planejamento (ou método + plano) |
| «Por que o parecer pediu mais dados?» | Explicação |

---

## 7. Impacto esperado na qualidade do raciocínio executivo

1. **Fidelidade à pergunta** — o CEO responde ao que foi pedido (método vs escolha).  
2. **Menos falsos `solicitar_dados`** — ausência de inventário deixa de ser confundida com lacuna material em perguntas metodológicas.  
3. **Melhor uso dos princípios** — o estágio 3 alimenta critérios explícitos em vez de só cautela.  
4. **Respeito ao tempo do patrocinador** (CON-001 / ADR-015) — progresso imediato com quadro de decisão, sem ping-pong desnecessário.  
5. **Preservação da deliberação operacional** — quando houver itens concretos, o pipeline atual continua adequado.  
6. **Rastreabilidade** — natureza cognitiva explícita no parecer/metadados (visão; forma em ciclo futuro).

---

## 8. Critérios de sucesso desta visão (observáveis)

A visão considera-se bem-sucedida quando, no uso diário (MG2):

1. Perguntas do tipo «como decidir / como priorizar» recebem **método ou critérios**, sem exigir primeiro a lista completa de demandas.  
2. Perguntas do tipo «qual destas opções» continuam a produzir **decisão operacional** (ou `solicitar_dados` só com lacuna material real).  
3. O patrocinador percebe menos respostas do tipo «preciso dos itens» quando pediu «o método».  
4. Não se degrada o enum fechado nem a separação MRE → Parecer → Speaker.

---

## 9. Fora de escopo deste VIS

* Criar ou alterar REQ, ADR, ARQ ou IMP.  
* Alterar código, pipeline, orquestrador, Speaker, validador ou enums.  
* Redesenhar o MRE completo ou reabrir ADR-019 / ARQ-013 sem ciclo ADR-006.  
* Fixar gramática de implementação (onde classificar: Núcleo vs estágio 0/1 vs pré-pipeline).

A forma normativa (REQ) e a decisão arquitetural (ADR), se houver acordo, nascem **depois** da análise conjunta deste VIS.

---

## 10. Próximo passo proposto (análise conjunta)

1. Patrocinador e CTO revisam e ajustam as naturezas cognitivas da §6.  
2. Se aprovado o rumo: abrir ciclo ADR-006 (ANL → eventual ADR → REQ → …) — **não** neste documento.  
3. Manter o MRE em produção R1; esta VIS **não** declara mudança de comportamento até REQ/IMP futuros.

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Engenheiro (Cursor) | Rascunho VIS-008 a partir da investigação de qualidade MRE (estágio 6) | Rascunho — análise conjunta |

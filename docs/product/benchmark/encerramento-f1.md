# Encerramento da F1 — Benchmark Estratégico (IPR-001)

> **Status: Homologado — Gate de Encerramento da F1 APROVADO (CTO, 26/07/2026).**  
> Natureza: artefato de **consolidação** — coleta encerrada; deliberação de HP registrada.  
> **Deliberação HP:** HP-001…003 **PROMOVIDAS** (→ DA-001…003); HP-004 e HP-005 **em observação**; HP-006 **em observação avançada**.  
> Diretrizes vigentes: [`../diretrizes-arquiteturais-experiencia.md`](../diretrizes-arquiteturais-experiencia.md).  
> Transição: [`../transicao-f1-f2.md`](../transicao-f1-f2.md) — Gate de Transição F1→F2 em revisão.  
> **Proibições:** sem implementação; sem alteração das 24 fichas; sem commit até homologação do pacote documental de transição.

---

## 1. O que é / Por que existe / Para quem / Como medir sucesso

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Documento de encerramento da fase F1 (Benchmark Estratégico) da IPR-001. |
| **Por que existe?** | Consolidar o corpus homologado, declarar cobertura conceitual, propor critérios objetivos para o destino das HP-001…HP-006 e registrar lacunas remanescentes como decisões internas de arquitetura — sem mais coleta de mercado. |
| **Para quem?** | CTO (deliberação do Gate de Encerramento); Usuário (transparência); Engenheiro (base rastreável para fases seguintes, quando autorizadas). |
| **Sucesso?** | CTO delibera: (a) F1 encerrada ou com pendências explícitas; (b) destino de cada HP (promover / manter / descartar / diferir); (c) lacunas L1/L2/L4/L5/L6 aceitas como decisões internas. |

---

## 2. Estado oficial do corpus (pós Gate F1-Q)

| Item | Valor |
|------|-------|
| Fichas homologadas | **24** (Gates F1-A … F1-Q) |
| Referências oficiais (positivas / parciais) | 21 |
| Antimodelos oficiais | 3 — Tableau (BI); Claude Computer Use (autonomia); **RC-03 ChatGPT** (chat genérico) |
| Hipóteses | HP-001 … HP-006 — **em observação** (nenhuma promovida neste artefato) |
| Lacuna L3 | **Conceitualmente coberta** (OpenAI Responses API + Agents SDK) |
| Coleta de fichas | **Encerrada** — F1 em avaliação formal de encerramento |
| RC-03 | Antimodelo oficial (mantido) |

---

## 3. Síntese das 24 referências homologadas

### 3.1 Inventário por gate

| Gate | Produto | Classe | Contribuição condensada ao CEO |
|------|---------|--------|--------------------------------|
| F1-A | Linear | Referência | Clareza de execução; issues como unidade de trabalho — **não** confundir com decisão |
| F1-A | Cursor | Referência | Conversa + agente no fluxo de trabalho; contexto de projeto |
| F1-A | Notion | Parcial / antimodelo workspace | Workspace flexível **sem** COA; risco de superfície sem objetivo único (P6) |
| F1-B | Claude Projects | Referência | Contexto de projeto persistente na conversa |
| F1-B | Asana | Referência | Goals + work; alinhamento execução↔objetivo |
| F1-C | Linear Initiatives | Referência | Objetivo acima do projeto; contexto que sobrevive a issues |
| F1-C | Obsidian | Referência | Conhecimento local persistente, independente do ciclo de tarefa |
| F1-D | PagerDuty | Referência | Atenção sob pressão; níveis de abstração ops |
| F1-D | Slack AI | Referência | Híbrido conversa + painéis; briefing |
| F1-E | Lattice Goals/OKRs | Referência | Cascata multi-nível (empresa→time→indivíduo) |
| F1-F | Productboard | Referência | Priorização e impacto; decisão de produto |
| F1-F | Tableau | **Antimodelo** | Métricas/insights **sem** decisão como unidade |
| F1-G | Coda Decision Docs | Referência | Decisão como artefato com justificativa |
| F1-G | Claude Computer Use | **Antimodelo** | Autonomia de GUI **sem** trilha organizacional |
| F1-H | ChatGPT (genérico) | **Antimodelo RC-03** | Chat sem COA / sem objetivo executivo |
| F1-I | Glean Assistant | Referência | Contexto org. + respostas citadas |
| F1-J | Raycast | Referência | Invocação rápida NL→ação (launcher) |
| F1-K | Granola | Referência | Decisão/evidência **fora** da conversa in-app (desafia VIS-007) |
| F1-L | Devin | Referência | Agente autônomo com trilha observável de engenharia |
| F1-M | NotebookLM | Referência | Grounded reasoning; origem explícita da informação |
| F1-N | Palantir AIP | Referência | Ontology + governança + auditoria em ops crítica |
| F1-O | Microsoft 365 Copilot | Referência | Continuidade no fluxo cotidiano; permissões herdadas; desafio a P6 (suite) |
| F1-P | Atlassian Rovo | Referência | Teamwork Graph; busca + agentes no ecossistema |
| F1-Q | OpenAI Responses + Agents SDK | Referência arquitetural | Orquestração multi-IA; escolha do modelo pelo controlador (L3) |

### 3.2 Padrões convergentes (o que o mercado já valida)

1. **Contexto deve sobreviver à tarefa** — Initiatives, Obsidian, Rovo Graph, Glean, Claude Projects.  
2. **Navegação por níveis** — Lattice, Initiatives, PagerDuty, Palantir Ontology.  
3. **Atenção antes do detalhe** — PagerDuty; sinais em Slack/Lattice.  
4. **Decisão + justificativa importam** — Coda, Productboard, NotebookLM, Palantir audit.  
5. **Autonomia exige controle e trilha** — Devin (+); Computer Use (−); Agents SDK (guardrails/HITL); Palantir.  
6. **Usuário não precisa (e não deve) escolher a ferramenta/modelo** — Agents SDK (orquestrador); identidade ADR-002 reforçada.  
7. **Chat genérico e dashboard sem decisão são antimodelos claros** — RC-03, Tableau.

### 3.3 Diferenciação do CEO (espaço ainda sem produto de mercado equivalente)

O corpus **não** encontrou um produto que una, na mesma superfície:

* posto de comando com **um COA ativo** (L1);  
* **orquestração multi-IA** sob governança (L3 — coberta como *infra*, não como UX);  
* **decisão como unidade de progresso** com efeito no tempo (HP-005 + L4);  
* **aprendizado maturável** Observação→Aprovação (L2);  
* identidade de **comando do fundador** (L5);  
* papéis Human+AI de governança na mesma superfície (L6).

Isso não é falha de coleta: é **sinal de oportunidade estratégica** — o CEO não compete com as referências; combina e governa o que elas fragmentam.

---

## 4. Avaliação da cobertura conceitual

### 4.1 Domínios de mercado — saturação

| Domínio | Veredito |
|---------|----------|
| Work management / iniciativas / OKRs | Saturado |
| Conhecimento persistente + grounded search | Saturado |
| Conversa (+ antimodelos) | Saturado |
| Atenção / ops hub | Adequado |
| Decisão / justificativa / audit | Adequado |
| Autonomia de agentes | Adequado |
| Suites / ecossistemas AI | Saturado |
| Orquestração multi-IA (L3) | **Coberta** (F1-Q) |
| Launcher / meeting intelligence / BI-antimodelo | Adequados (1 ficha cada) |

**Conclusão de cobertura de mercado:** retorno marginal de novas fichas de domínio já saturado é **baixo**. Coleta de fichas deve permanecer **encerrada**.

### 4.2 Lacunas remanescentes — reclassificação

Após F1-Q, as lacunas L1, L2, L4, L5 e L6 **não** são mais pedidos de benchmark. Passam a ser **decisões internas de arquitetura / produto** (ver §6). L3 está **conceitualmente coberta**.

| Lacuna | Status pós F1-Q |
|--------|-----------------|
| L3 Orquestração Multi-IA | ✅ Conceitualmente coberta |
| L1 Home / COA como superfície | Decisão interna |
| L2 Aprendizado maturável | Decisão interna |
| L4 Loop decisão→efeito no tempo | Decisão interna |
| L5 Identidade / tom de comando | Decisão interna (F2/Branding) |
| L6 Multi-papel Human+AI no COA | Decisão interna |

### 4.3 Veredito de cobertura da F1

A F1 cumpriu o papel de **informar** UX/UI/Branding sem determinar design. Critérios C1–C5 do plano F1 estão atendidos no plano documental. Cobertura de hipóteses HP-001…HP-006 é **suficiente para deliberação**; não é suficiente para promoção automática — exige critérios objetivos (§5).

---

## 5. Critérios objetivos para HP-001 … HP-006

### 5.1 Definições vigentes (em observação)

| ID | Definição |
|----|-----------|
| **HP-001** | Objetivo antes da Ferramenta — o usuário começa declarando objetivo, não escolhendo ferramenta. |
| **HP-002** | O contexto sobrevive às tarefas — conhecimento vivo independente do ciclo de tarefas/projetos/conversas. |
| **HP-003** | Navegação por níveis de abstração — transitando empresa→objetivos→iniciativas→execução→decisões→evidências, com continuidade. |
| **HP-004** | Atenção antes da Informação — primeiro o que exige atenção executiva; depois o detalhe. |
| **HP-005** | A decisão é a unidade de progresso — progresso comunicado por decisões e efeitos, não só % de tarefas. |
| **HP-006** | Toda decisão deve possuir justificativa rastreável — ligada a evidências, contexto e efeitos no tempo. |

### 5.2 Destinos possíveis (vocabulário oficial proposto)

| Destino | Significado | Efeito normativo |
|---------|-------------|------------------|
| **Promover** | Vira princípio de produto (ou cláusula normativa anexada a P1–P6 / VIS) | Obrigatório citar em REQs/UX futuros |
| **Manter** | Permanece hipótese em observação | Informa F2–F5; sem força normativa plena |
| **Diferir** | Adia deliberação até ADR/REQ específico | Explicitamente fora deste Gate |
| **Descartar** | Retirada do corpus de hipóteses | Motivo registrado; não vira princípio |

### 5.3 Critérios objetivos (checklist — todos devem ser avaliados pelo CTO)

Uma HP só pode ser **promovida** se **todos** os critérios P forem verdadeiros:

| # | Critério de promoção (P) | Como verificar |
|---|--------------------------|----------------|
| P-a | **Convergência multi-domínio** | ≥3 fichas de **domínios distintos** reforçam a HP (não 3 work managers) |
| P-b | **Antimodelo negativo** | ≥1 antimodelo homologado ilustra o custo de *não* seguir a HP |
| P-c | **Coerência normativa** | Não contradiz CON-001, VIS-007, P1–P6, REQ-037/039/041 |
| P-d | **Operacionalizável** | Pode virar critério de aceitação mensurável em REQ futuro (sem ambiguidade de UI) |
| P-e | **Não é apenas infra** | Se a evidência for só de SDK/plataforma sem superfície executiva, **não** promover sozinha — no máximo manter/diferir até ADR |
| P-f | **Lacuna residual não bloqueia** | Se a única evidência fraca depende de L1/L2/L4, o CTO pode **manter** ou **diferir**, não promover |

Uma HP deve ser **mantida** se: P-a e P-c verdadeiros, mas P-d ou P-f falham.

Uma HP deve ser **diferida** se: depende criticamente de decisão interna (L1–L6) ainda não tomada em ADR/REQ.

Uma HP deve ser **descartada** se: **qualquer** dos critérios D for verdadeiro:

| # | Critério de descarte (D) | Como verificar |
|---|--------------------------|----------------|
| D-a | **Contradição normativa** | Conflito direto com CON/VIS/P sem resolução possível |
| D-b | **Evidência insuficiente após saturação** | Corpus saturado e reforço fraco/disperso |
| D-c | **Redundância** | Já está integralmente coberto por P1–P6 / REQ existente sem valor adicional |
| D-d | **Falsa generalização** | Só vale para um domínio de mercado irrelevante ao CEO |

### 5.4 Avaliação preliminar do Engenheiro (não vinculante — deliberação do CTO)

| HP | P-a…P-f (resumo) | Recomendação preliminar | Notas |
|----|------------------|-------------------------|-------|
| **HP-001** | Convergência forte; antimodelo RC-03/Notion/suite; coerente com P6/ADR-002; L1 ainda afeta a *forma* | **Manter** ou **Promover** (CTO) | Forma da Home (L1) é decisão interna; o *princípio* “objetivo antes da ferramenta” já tem evidência suficiente |
| **HP-002** | Convergência muito forte; antimodelos de chat efêmero; coerente com REQ-037/039 | **Promover** (candidato mais forte) | Lacuna residual mínima |
| **HP-003** | Convergência forte (Lattice, Initiatives, PagerDuty, Palantir) | **Promover** ou **Manter** | Operacionalizável via navegação COA |
| **HP-004** | Adequada (PagerDuty + sinais); menos densidade que HP-002/003 | **Manter** | Pode anexar-se a P2 se promovida depois |
| **HP-005** | Adequada (+ Tableau −); L4 fraco no loop temporal | **Manter** ou **Diferir** até L4/ADR | Não descartar — núcleo da identidade CEO |
| **HP-006** | Adequada (Coda, NotebookLM, Palantir, Glean); L2 residual | **Manter** ou **Promover** parcial | Distinguir “justificativa de decisão” (promovível) de “maturação de aprendizado” (L2, interna) |

**Este artefato não promove nem descarta nenhuma HP.** Apenas submete critérios e recomendação preliminar.

---

## 6. Lacunas remanescentes como decisões internas de arquitetura

> Declaração: **não** serão abertas novas fichas de benchmark para L1, L2, L4, L5 ou L6, salvo deliberação explícita futura do CTO revertendo o encerramento da coleta.

| ID | Lacuna | Natureza da decisão interna | Fase / artefato sugerido (quando o CTO autorizar) |
|----|--------|-----------------------------|-----------------------------------------------------|
| **L1** | Home / COA como superfície unificada | Definir a metáfora e o comportamento de **um COA ativo** e troca explícita de contexto | ADR de experiência / REQ de Home (pós F1); alinhado a REQ-037/039 |
| **L2** | Aprendizado maturável (Observação→Aprovação) | Codificar o ciclo ADR-002 como capacidade de produto, não como feature de chat | ADR de aprendizado / CAP de conhecimento |
| **L4** | Loop decisão → efeito no tempo | Definir como o CEO registra e revisita **efeitos** de decisões | ADR / REQ de Memória de Decisões (amarra HP-005/006) |
| **L5** | Identidade / tom de comando executivo | Branding e fundações visuais — posto de comando do fundador | F2 / Branding (IPR-001), quando desbloqueados |
| **L6** | Multi-papel Human+AI no mesmo COA | Modelo de papéis (Usuário / CTO / Engenheiro / agentes) na superfície | ADR de colaboração / governança de papéis |

**L3** — registrada como **coberta no plano conceitual** pela ficha OpenAI Responses API + Agents SDK. Implicação arquitetural já registrada na ficha: orquestração é **infraestrutura substituível** (ADR-010), não identidade do produto; a escolha do modelo permanece do CEO.

---

## 7. Critérios de conclusão da F1 (checklist para o Gate)

| # | Critério original (plano F1) | Estado |
|---|------------------------------|--------|
| C1 | Critérios de análise homologáveis (D1–D10) | ✅ |
| C2 | Template de ficha utilizável | ✅ |
| C3 | Inventários executivo e conversacional | ✅ |
| C4 | Síntese com oportunidades de diferenciação | ✅ (este documento + síntese vigente) |
| C5 | Nenhuma implementação de interface | ✅ |

| # | Critério adicional de encerramento | Estado |
|---|------------------------------------|--------|
| E1 | Corpus fechado com contagem oficial | ✅ 24 fichas |
| E2 | Antimodelos oficiais declarados | ✅ RC-03 + Tableau + Computer Use |
| E3 | Cobertura L3 declarada | ✅ |
| E4 | Lacunas L1/L2/L4/L5/L6 reclassificadas como decisões internas | ✅ (proposta; aguarda CTO) |
| E5 | Critérios objetivos para destino das HP | ✅ (proposta; aguarda CTO) |
| E6 | Nenhuma nova ficha iniciada neste Gate | ✅ |

---

## 8. Deliberação do CTO (Gate de Encerramento — homologado)

| ID | Destino | Registro |
|----|---------|----------|
| HP-001 | **PROMOVIDA** → **DA-001** | Objetivo antes da Ferramenta |
| HP-002 | **PROMOVIDA** → **DA-002** | O contexto sobrevive às tarefas |
| HP-003 | **PROMOVIDA** → **DA-003** | Navegação por níveis de abstração |
| HP-004 | **Mantida em observação** | Atenção antes da Informação |
| HP-005 | **Mantida em observação** | A decisão é a unidade de progresso |
| HP-006 | **Mantida em observação avançada** | Justificativa rastreável |

L1, L2, L4, L5 e L6 confirmadas como **decisões internas** de arquitetura/governança. L3 confirmada como **conceitualmente coberta**. Coleta de fichas **encerrada**. F1 **concluída**.

Próximo gate: Transição F1→F2 — [`../transicao-f1-f2.md`](../transicao-f1-f2.md).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gate de Encerramento homologado) |
| Quando | 26/07/2026 |
| Por quê | Encerrar F1; deliberar destino das HP; preparar transição F1→F2 |
| Baseado em quê | 24 fichas; cobertura conceitual; deliberação CTO |
| Resultado | F1 concluída; DA-001…003 vigentes; HP-004/005 observação; HP-006 observação avançada; transição submetida; sem alteração de fichas; sem commit |

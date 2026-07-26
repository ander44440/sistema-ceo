# Ficha — OpenAI Responses API + Agents SDK (26/07/2026)

> **Status: Homologada — Gate F1-Q (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  

> Fontes verificáveis apenas.  
> Tipo: **referência arquitetural** — domínio: **L3 — Orquestração Multi-IA**.  
> Natureza atípica: é **SDK/API**, não produto de interface — dimensões visuais (D3/D4/D10) são `N/A`.  
> **Restrições:** nenhuma nova hipótese; nenhuma promoção de HP; apenas evidências; sem commit.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **OpenAI Responses API + Agents SDK** (`openai-agents`) |
| Categoria | Runtime de orquestração de agentes / camada de controle multi-modelo |
| Fontes | https://openai.github.io/openai-agents-python/ ; `/multi_agent/` ; `/handoffs/` ; `/sessions/` ; `/models/` ; https://developers.openai.com/api/docs/guides/agents ; `/running-agents` (observado 26/07/2026) |
| Superfície observada | Documentação oficial (guias + referência) |
| Observador | Engenheiro (Cursor) |
| Lacuna endereçada | **L3 — Orquestração Multi-IA sem escolha pelo usuário** |
| Classificação | **Parcial** — referência forte de *mecânica* de orquestração; não é referência de experiência executiva |

---

## 1. Modelo arquitetural de agentes

Conjunto **mínimo** de primitivas declarado na doc oficial:

| Primitiva | Definição observada |
|-----------|---------------------|
| **Agent** | "LLM configurado com instruções, ferramentas e comportamento opcional de runtime (handoffs, guardrails, structured outputs)" |
| **Agents as tools / Handoffs** | Delegação a agentes especialistas |
| **Guardrails** | Validação de entrada/saída, executada **em paralelo** à execução, com *fail fast* |
| **Sessions** | Camada de memória persistente do contexto de trabalho |
| **Human in the loop** | Mecanismos embutidos para envolver humanos entre execuções |
| **Tracing** | Rastro embutido de model calls, tools, agents, guardrails e handoffs |

Filosofia declarada: "*enough features to be worth using, but few enough primitives to make it quick to learn*" — **poucas abstrações, runtime explícito**.

**Distinção Responses API vs. SDK** (evidência direta e relevante ao CEO):

| Use **Responses API** direto | Use **Agents SDK** |
|------------------------------|--------------------|
| Você quer **possuir** o loop, o dispatch de ferramentas e o estado | Você quer que o **runtime** gerencie turnos, execução de ferramentas, guardrails, handoffs e sessões |
| Fluxo curto, basicamente devolver a resposta do modelo | O agente produz artefatos ou opera em múltiplos passos coordenados |

> "*You do not need to choose one globally*" — as duas camadas coexistem.

## 2. Orquestração entre ferramentas

**Dois regimes explícitos** (doc `multi_agent`):

| Regime | Como funciona | Quando |
|--------|---------------|--------|
| **Orquestração via LLM** | O LLM planeja, usa tools e delega por handoffs de forma autônoma | Tarefa aberta |
| **Orquestração via código** | O fluxo é determinado por código (structured outputs → roteamento; chaining; loop avaliador; `asyncio.gather` paralelo) | Quando se quer **determinismo, previsibilidade** de custo/velocidade |

Padrões nucleares:

| Padrão | Controle | Consequência |
|--------|----------|--------------|
| **Agents as tools** (`Agent.as_tool()`) | O **manager** mantém o controle da conversa e chama especialistas | Um agente "possui" a resposta final; guardrails compartilhados em um só lugar |
| **Handoffs** | O agente de triagem **roteia**, e o especialista torna-se o agente ativo | O especialista responde diretamente |

Tools disponíveis: function tools (schema automático + validação Pydantic), hosted tools, **MCP server tool calling** ("funciona igual a function tools"), web search, file search, computer use, code execution. **Sandbox agents**: especialistas rodando em workspaces isolados reais, com sessões de sandbox **retomáveis**.

## 3. Handoffs entre agentes

Evidências precisas:

* No handoff, "*o novo agente assume a conversa e vê todo o histórico anterior*".
* **`input_filter`** permite alterar o que é passado adiante (ex.: remover entradas antigas ou remover tools do histórico) — recebe `HandoffInputData`, devolve novo `HandoffInputData`.
* `input_items` filtra a entrada do modelo **preservando** `new_items` no histórico da sessão.
* **`nest_handoff_history`** (beta, desativado por padrão): o runner **colapsa a transcrição anterior em uma única mensagem-resumo** do assistente, que continua acumulando novos turnos em handoffs sucessivos; mapper customizável via `RunConfig.handoff_history_mapper`.
* **Limite importante:** handoffs permanecem **dentro de uma única run**. Input guardrails só se aplicam ao **primeiro** agente da cadeia; output guardrails só ao agente que produz a saída final. Para checagem por chamada, usar **tool guardrails**.
* **Restrição:** conversas server-managed (`conversation_id`, `previous_response_id`, `auto_previous_response_id`) **não suportam** handoff input filters nem o aninhamento de histórico.

## 4. Gestão de contexto

Quatro estratégias oficialmente tabuladas para carregar estado entre turnos:

| Estratégia | Onde vive o estado | Melhor para |
|------------|--------------------|-------------|
| `result.history` | Na aplicação | Loops pequenos; controle máximo |
| `session` | Armazenamento seu + SDK | Estado persistente, runs retomáveis, storage sob seu controle |
| `conversationId` | OpenAI **Conversations API** | Estado server-managed compartilhado entre workers/serviços |
| `previousResponseId` | OpenAI **Responses API** | Continuação server-managed mais leve, de uma resposta à seguinte |

* **Exclusividade mútua:** Sessions **não podem** ser combinadas com `conversation_id` / `previous_response_id` / `auto_previous_response_id` na mesma run — é preciso **escolher** quem detém a memória.
* `SessionSettings(limit=N)` controla quanto histórico é buscado por run.
* Callback de preparação de input recebe cópias das listas; o SDK persiste **apenas** itens do novo turno — reordenar/filtrar histórico antigo não o regrava.

## 5. Memória

`Sessions` = memória de conversa automática, eliminando `.to_input_list()` manual. Backends oficialmente listados:

| Backend | Uso declarado |
|---------|---------------|
| `SQLiteSession` / `AsyncSQLiteSession` | Dev local / apps simples |
| `RedisSession` | Memória compartilhada entre workers/serviços |
| `SQLAlchemySession` | Produção com banco existente |
| `MongoDBSession` | Multi-processo; contador de sequência atômico para ordenação |
| `DaprSession` | Cloud-native; TTL e controles de consistência |
| `OpenAIConversationsSession` | Storage server-managed na OpenAI |
| `OpenAIResponsesCompactionSession` | Conversas longas com **compactação automática** (wrapper) |
| `AdvancedSQLiteSession` | **Branching** + analytics |
| `EncryptedSession` | Criptografia + TTL sobre outro backend |

* **`pop_item()`**: remove o último item — documentado para **desfazer/corrigir** (ex.: remover resposta do agente e a pergunta do usuário e refazer).
* Natureza da memória: **histórico de conversa**, escopo `session_id`. **Não** é conhecimento organizacional com ciclo de maturação.

## 6. Papel do controlador / orquestrador

Este é o núcleo da lacuna L3. Evidências de que **a escolha do modelo pertence ao orquestrador, não ao usuário final**:

| Mecanismo | Escopo | Evidência |
|-----------|--------|-----------|
| `set_default_openai_client` | **Global** | Endpoint OpenAI-compatible como padrão para todos os agentes |
| `ModelProvider` (via `RunConfig`) | **Por run** | "use um provider customizado para todos os agentes desta run" |
| `Agent.model` | **Por agente** | "permite **mix and match** de providers diferentes para agentes diferentes" |
| `MultiProvider` | **Roteamento por prefixo** | Mistura `openai/...` e `any-llm/...` numa mesma run; `openai_prefix_mode` / `unknown_prefix_mode` |
| Adaptadores terceiros (beta) | Cobertura/roteamento extra | "valide o caminho do provider que pretende colocar em produção" |

Recomendação oficial de heterogeneidade deliberada: "*use um modelo menor e mais rápido para triagem, e um maior e mais capaz para tarefas complexas*". Ressalva registrada: os exemplos multi-provider usam **Chat Completions** porque "muitos providers ainda não suportam a Responses API" — a paridade de features **não** é uniforme (`strict_feature_validation` transforma avisos em erro).

Governança do controlador:

* **Guardrails** de input/output/tool, em paralelo, com *fail fast*.
* **Human review**: o fluxo pode **bloquear ou pausar** antes de trabalho arriscado; `interruptions` devem ser resolvidas e a run **retomada a partir de `state`**, não como novo turno.
* **Tracing** unificado atravessando model calls, tools, agents, guardrails e handoffs; integra avaliação, fine-tuning e distillation.
* Limites de run (`max turns`) e erros de guardrail como falhas de runtime explícitas.

## 7. Evidências vs. HP-001…HP-006 (apenas registro)

| HP | Reforça? | Desafia? | Evidência observada |
|----|----------|----------|---------------------|
| **HP-001** Objetivo antes da ferramenta | **Sim (forte, no plano arquitetural)** | — | Agente de triagem roteia a partir do pedido; o **usuário não escolhe o modelo** — `Agent.model` / `ModelProvider` / `MultiProvider` decidem; "orquestração via LLM" planeja os passos |
| **HP-002** Contexto sobrevive às tarefas | Parcial | **Parcial** | Sessions persistentes (Redis/SQLAlchemy/Mongo/Dapr) e Conversations API sustentam continuidade; **porém** o escopo é `session_id`/run — handoffs "*stay within a single run*"; memória = histórico, não patrimônio organizacional |
| **HP-003** Níveis de abstração | Parcial | — | Manager ↔ especialistas (`as_tool`), triagem → especialista, aninhamento de agentes; abstração **técnica**, sem hierarquia estratégica (empresa→objetivo→decisão) |
| **HP-004** Atenção antes da informação | — (N/A) | — | Não há superfície de interface; `nest_handoff_history` (colapsar transcrição em resumo) é o análogo mais próximo de "resumir antes de detalhar" |
| **HP-005** Decisão = unidade de progresso | Fraco | **Parcial** | Progresso é medido em **turnos, run items, tool calls e aprovações**; "decisão + efeito observado" não é unidade de primeira classe |
| **HP-006** Justificativa rastreável | **Sim (parcial-forte)** | — | Tracing embutido cobrindo model calls, tools, handoffs e guardrails; `state` retomável; **porém** é rastro de **execução/depuração**, não justificativa organizacional ligada a evidência e efeito |

**Nenhuma HP promovida. Nenhuma hipótese nova.**

## 8. Comparação com Devin, Claude Computer Use e Palantir AIP

| Dimensão | **OpenAI Agents SDK / Responses** | **Devin** (F1-L) | **Claude Computer Use** (F1-G, antimodelo) | **Palantir AIP** (F1-N) |
|----------|-----------------------------------|------------------|--------------------------------------------|-------------------------|
| Natureza | **Runtime/SDK** — camada de construção | Produto: engenheiro de software autônomo | Capability de modelo: ação em GUI | Plataforma enterprise de IA |
| Quem orquestra | **Você** define (LLM-driven ou code-driven) | O produto orquestra a si mesmo | O modelo age sobre a tela | A plataforma, sobre a **Ontology** |
| Escolha do modelo | **Explícita e do orquestrador** (por agente/run/prefixo) | Opaca ao usuário | Modelo único | Governada pela plataforma |
| Delegação | Handoffs + agents-as-tools, com `input_filter` | Delegação de tarefa ao agente | Sem delegação estruturada | Agentes + AIP Logic |
| Contexto | 4 estratégias explícitas, mutuamente exclusivas | Contexto de repositório/sessão | Contexto de tela, efêmero | Ontology + dados corporativos |
| Governança | Guardrails + human-in-the-loop + tracing | Review humano do resultado | **Ausente** — ação sem trilha organizacional | Roles/markings/purpose + evals + auditoria |
| Semântica de negócio | **Ausente** (é infraestrutura) | Domínio: engenharia | Ausente | **Ontology** (objetos, lógica, ações) |
| Progresso | Turnos / run items | Tarefa concluída, PRs | Ação executada | Ações operacionais auditadas |

**Leitura:** o SDK é a referência **mais explícita** sobre *como* controlar múltiplos modelos e delegações; Palantir é a mais explícita sobre *governança semântica*; Devin sobre *autonomia produtizada*; Computer Use permanece antimodelo por agir **sem trilha**.

## 9. Contribuições potenciais à arquitetura do CEO

| Incorporar (conceitual) | Justificativa / ligação |
|-------------------------|--------------------------|
| **Seleção de IA como responsabilidade do orquestrador** | Evidência de mercado de que "mix and match" por agente/run é padrão viável — sustenta ADR-002 (usuário nunca escolhe a IA) e o filtro de HP-001 |
| **Papéis especializados > agente generalista** | Doc recomenda explicitamente especialistas por tarefa — compatível com Usuário/CTO/Engenheiro |
| **Dois regimes de orquestração** | Fluxo crítico e auditável → **código/determinístico**; exploração → LLM-driven. Modelo mental útil para os gates ADR-006 |
| **`input_filter` / controle explícito do que atravessa a delegação** | Análogo direto ao isolamento do **COA**: o que passa adiante é decisão de projeto, não acidente |
| **Guardrails + human-in-the-loop com `state` retomável** | Formaliza **gate** de governança: pausar antes de trabalho arriscado e **retomar o mesmo turno**, sem reiniciar contexto |
| **Tracing atravessando agentes, tools, handoffs e guardrails** | Base técnica plausível para HP-006 — desde que enriquecida com justificativa e efeito |
| **Exclusividade explícita de estratégias de memória** | Disciplina arquitetural: **um** detentor da memória por execução, evitando contexto ambíguo (coerente com COA único) |

| Não incorporar | Motivo |
|----------------|--------|
| Memória = histórico de conversa | HP-002 exige conhecimento que sobrevive à conversa; sessão não é patrimônio |
| Progresso = turnos / tool calls | Conflita com HP-005 |
| Handoff que entrega **todo** o histórico por padrão | Risco de vazamento de contexto entre COAs |
| Escopo "uma única run" como fronteira do raciocínio | O CEO precisa de continuidade **entre** execuções e ciclos |
| Rastro de depuração como substituto de justificativa | Trace ≠ Memória Organizacional |
| Compactação automática opaca de histórico | Perda silenciosa de evidência conflita com HP-006 |

**Desafio arquitetural registrado:** o SDK demonstra que orquestração multi-IA com governança é tecnicamente viável, mas resolve o problema **abaixo** da camada semântica. Falta exatamente o que o CEO propõe: a **Ontology organizacional** (mais próxima de Palantir) e a **decisão como unidade** — o que sugere que o CEO deve tratar orquestração como **infraestrutura substituível** (ADR-010 / agentes como fontes substituíveis), não como identidade do produto.

## 10. Dimensões (adaptadas — SDK sem interface)

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 5 | Escolha explícita de loop, provider, guardrails, aprovações; `state` retomável |
| D2 Info → decisão | 2 | Run items e traces; próximo passo é do desenvolvedor, não do executivo |
| D3 Clareza (visual) | N/A | Sem superfície |
| D4 Densidade | N/A | Sem superfície |
| D5 Consistência | 4 | Poucas primitivas, repetidas com coerência |
| D6 Objetivo por superfície | 4 | Cada agente = um job especializado (recomendação oficial) |
| D7 Conversação | 3 | Conversa é substrato de execução, não interface executiva |
| D8 Contexto / isolamento | 4 | 4 estratégias explícitas + `input_filter`; escopo limitado à run |
| D9 Tempo do usuário | N/A | Público-alvo é desenvolvedor |
| D10 Identidade | N/A | Infraestrutura, sem tom executivo |

## 11. Conclusão técnica

O par **Responses API + Agents SDK** é a referência mais direta e verificável do corpus para a lacuna **L3**. Ele documenta, como padrão de mercado consolidado, que (a) a **escolha do modelo pertence ao orquestrador** e é configurável por agente, por run ou por prefixo; (b) a delegação pode ser **explícita e filtrada** (`handoffs` + `input_filter`); (c) governança se faz com **guardrails, aprovação humana e run retomável**; e (d) rastreabilidade de execução pode ser **nativa** e atravessar agentes.

Reforça **HP-001** (no plano arquitetural) e **HP-006** (no plano de rastro técnico). **Desafia** HP-002 e HP-005: memória é histórico de conversa com escopo de run, e progresso é contado em turnos — nenhum dos dois satisfaz o CEO. É `N/A` para HP-004.

Classificação: **Parcial — referência arquitetural**. Aplicabilidade alta na **mecânica** de orquestração; nula como referência de experiência executiva. Conclui-se que a lacuna L3 está **coberta no plano conceitual**, com a ressalva de que o mercado ainda não oferece orquestração multi-IA **acoplada a semântica organizacional e à decisão como unidade de progresso** — espaço de diferenciação do CEO.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO determinou a referência |
| Quando | 26/07/2026 |
| Por quê | Gate F1-Q — cobrir a lacuna L3 (Orquestração Multi-IA) do relatório de cobertura conceitual |
| Baseado em quê | Docs oficiais Agents SDK (index, multi_agent, handoffs, sessions, models) + guias developers.openai.com (agents, running-agents); deliberação Gate F1-Q |
| Resultado | Ficha submetida (F1-Q); apenas evidências; sem nova HP; sem promoção; sem commit |

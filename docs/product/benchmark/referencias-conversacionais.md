# Referências Conversacionais — Inventário (IPR-001 / F1)

> **Status: Em elaboração — v0.1 (26/07/2026).**  
> Natureza: **inventário de candidatos** a análise — não são fichas concluídas.  
> Análises profundas usam o [`TEMPLATE-ficha-referencia.md`](TEMPLATE-ficha-referencia.md) e exigem fontes/data.

---

## 1. Propósito da frente

Observar produtos em que a **conversa** é (ou pretende ser) a interface principal — alinhados ao princípio VIS-007 / REQ-041 do CEO.

## 2. Hipótese de aprendizado

O que o CEO pode aprender nesta frente:

* como manter a conversa **central** sem virar chat genérico;  
* como contextualizar a conversa (análogo ao COA ativo);  
* exemplos de comandos / prompts sem burocracia;  
* limites transparentes (CON-001 princípio 8) vs. falsa autonomia.

## 3. Categorias de candidatos

| Categoria | Por que importa ao CEO |
|-----------|------------------------|
| Assistentes / copilots de trabalho | Conversa como centro da ação |
| Chat com contexto de projeto | Isolamento e troca de contexto |
| Interfaces “ask anything” genéricas | Antimodelo: sem objetivo executivo (P6) |
| Comando por linguagem natural em ferramentas | Ponte conversa ↔ ação |

## 4. Inventário inicial de candidatos

| ID | Candidato (nome genérico / tipo) | Categoria | Prioridade sugerida | Status |
|----|----------------------------------|-----------|---------------------|--------|
| RC-01 | **Cursor** (coding agent / copilot de trabalho) | Copilot de trabalho | Alta | ✅ **Homologada (F1-A)** — [`fichas/cursor-2026-07-26.md`](fichas/cursor-2026-07-26.md) |
| RC-02 | **Claude Projects** (chat com contexto/projeto) | Chat contextualizado | Alta | ✅ **Homologada (F1-B)** — [`fichas/claude-projects-2026-07-26.md`](fichas/claude-projects-2026-07-26.md) |
| RC-03 | **ChatGPT** (chat genérico) | Ask anything | Baixa (antimodelo) | ✅ **Homologada (F1-H)** — **RC-03 oficial** — [`fichas/chatgpt-chat-generico-2026-07-26.md`](fichas/chatgpt-chat-generico-2026-07-26.md) |
| RC-04 | **Slack AI** (inbox conversacional + briefing/painéis) | Híbrido conversa + contexto | Alta | ✅ **Homologada (F1-D)** — [`fichas/slack-ai-2026-07-26.md`](fichas/slack-ai-2026-07-26.md) |
| RC-05 | **Claude Computer Use** (agente autônomo de GUI) | Autonomia opaca / execução | Baixa (antimodelo P1) | ✅ **Homologada (F1-G)** — antimodelo — [`fichas/claude-computer-use-2026-07-26.md`](fichas/claude-computer-use-2026-07-26.md) |
| RC-06 | **Glean Assistant** (contexto org. + citações) | Assistente enterprise grounded | Alta | ✅ **Homologada (F1-I)** — referência oficial — [`fichas/glean-assistant-2026-07-26.md`](fichas/glean-assistant-2026-07-26.md) |
| RC-07 | **Raycast** (launcher / NL→ação no SO) | Comando / launcher | Média | ✅ **Homologada (F1-J)** — referência oficial — [`fichas/raycast-2026-07-26.md`](fichas/raycast-2026-07-26.md) |
| RC-08 | **Granola** (notepad de reuniões → memória/ações) | Meeting intelligence | Alta | ✅ **Homologada (F1-K)** — [`fichas/granola-2026-07-26.md`](fichas/granola-2026-07-26.md) |
| RC-09 | **Devin** (Cognition — AI software engineer) | Agente autônomo de engenharia | Alta | ✅ **Homologada (F1-L)** — referência oficial — [`fichas/devin-2026-07-26.md`](fichas/devin-2026-07-26.md) |
| RC-10 | **NotebookLM / Gemini Notebook** (grounded sources) | Research / grounded reasoning | Alta | ✅ **Homologada (F1-M)** — referência oficial — [`fichas/notebooklm-2026-07-26.md`](fichas/notebooklm-2026-07-26.md) |
| RC-11 | **Palantir AIP** (agentes + Ontology + governança) | IA operacional enterprise | Alta | ✅ **Homologada (F1-N)** — referência oficial — [`fichas/palantir-aip-2026-07-26.md`](fichas/palantir-aip-2026-07-26.md) |
| RC-12 | **Microsoft 365 Copilot** (IA no fluxo M365) | Suite / produtividade enterprise | Alta | ✅ **Homologada (F1-O)** — [`fichas/microsoft-365-copilot-2026-07-26.md`](fichas/microsoft-365-copilot-2026-07-26.md) |
| RC-13 | **Atlassian Rovo** (search + chat + agents no ecossistema) | Knowledge + agentes enterprise | Alta | ✅ **Homologada (F1-P)** — [`fichas/atlassian-rovo-2026-07-26.md`](fichas/atlassian-rovo-2026-07-26.md) |
| RC-14 | **OpenAI Responses API + Agents SDK** (runtime de orquestração) | Orquestração multi-IA (lacuna **L3**) | Alta | ✅ **Homologada (F1-Q)** — [`fichas/openai-responses-agents-sdk-2026-07-26.md`](fichas/openai-responses-agents-sdk-2026-07-26.md) |

**Nota metodológica:** igual à frente executiva — tipológico nesta entrega; fichas nominadas virão com observação datada.

## 5. Atenções específicas do CEO

Ao fichar, priorizar:

* a conversa **desloca** ou **reforça** o Resumo Executivo?  
* após “trocar de projeto/espaço”, o histórico e o contexto mudam de forma clara?  
* o produto declara limitações ou finge onisciência?

## 6. Próximo passo (sob deliberação)

Inventário inicial conversacional **concluído**. Coleta **encerrada**. F1 **concluída**. Transição F1→F2 — [`../transicao-f1-f2.md`](../transicao-f1-f2.md).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gates F1-A…Q) |
| Quando | 26/07/2026 |
| Por quê | Homologar Agents SDK (L3); encerrar coleta da F1 |
| Baseado em quê | Gate F1-Q; artefato de encerramento |
| Resultado | 24 fichas; RC-14 homologada; encerramento-f1.md submetido; sem nova ficha; sem commit |

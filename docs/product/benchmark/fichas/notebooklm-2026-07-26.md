# Ficha — NotebookLM / Gemini Notebook (Google) (26/07/2026)

> **Status: Homologada — Gate F1-M (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  
> Fontes verificáveis apenas.  
> Tipo: **referência** — domínio: **raciocínio fundamentado em fontes (grounded reasoning)**.  
> Nota de nomenclatura: em julho/2026 NotebookLM passou a chamar-se **Gemini Notebook**; mesmo produto ([notebooklm.google](https://notebooklm.google/)).  
> **Restrições:** nenhuma nova hipótese; não promover HP-001…006; apenas evidências; sem commit.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **NotebookLM** (agora **Gemini Notebook**, Google) |
| Categoria | Research / knowledge — síntese grounded em documentos |
| URL / fonte | https://notebooklm.google/ ; https://support.google.com/gemininotebook/answer/16179559 ; https://blog.google/innovation-and-ai/technology/ai/notebooklm-google-ai/ (observado 26/07/2026) |
| Superfície observada | Página pública + Help (chat/citações) + blog Google |
| Observador | Engenheiro (Cursor) |
| Classificação | **Parcial — alta relevância conceitual** (grounding + origem explícita; forma ≠ Home COA) |

---

## 1. Posicionamento do produto

Assistente de pesquisa / thinking partner: upload de **sources**, perguntas e insights — respostas **sempre grounded** na informação fornecida pelo usuário ([notebooklm.google](https://notebooklm.google/)). Diferencial declarado vs. outras notas com IA: ser **source-grounded** (reduz erros/alucinações).

## 2. Problema que resolve

| Problema | Evidência |
|----------|-----------|
| Sintetizar volumes grandes de material | “Efficiency in information synthesis” |
| Respostas de IA sem vínculo ao material do usuário | Grounding + reduced hallucinations |
| Fact-check difícil | Citações inline → passagem original ([Help](https://support.google.com/gemininotebook/answer/16179559); [blog](https://blog.google/innovation-and-ai/technology/ai/notebooklm-google-ai/)) |
| Construir conhecimento a partir de docs próprios | Notebook por projeto; sources controladas pelo usuário |

## 3. Modelo de interação

1. Criar notebook e **adicionar sources** (docs, PDFs, sites, áudio, YouTube, etc.).  
2. Incluir/excluir sources por checkbox para o escopo da pergunta.  
3. Chat: perguntas/instruções sobre o material.  
4. Outputs auxiliares: Audio/Video Overviews, Mind Maps, flashcards, quizzes, reports, tables, slides.  
5. Hover/click em **citation** → quote e navegação ao trecho fonte.

## 4. Grounded reasoning e preservação da origem

* Respostas usam quotes/texto/imagens **direto das sources** como citations.  
* Transparência: “knowing exactly where the AI's information comes from”.  
* Chat (modo padrão) **só** usa dados das sources; pedidos “criativos” fora do material podem ser recusados.  
* Fact-check explícito como prática recomendada mesmo com grounding.

## 5. Construção de conhecimento

* Unidade: **notebook** = conjunto curado de sources + chat/sínteses.  
* Síntese cross-document; Notebook guide / overviews.  
* Controlo direto: usuário define a base de conhecimento.  
* Privacy: org data not used for training (claim Workspace); individual subject to feedback policy.

## 6. Evidências vs. HP-001…HP-006 (apenas registro)

| HP | Reforça? | Desafia? | Evidência |
|----|----------|----------|-----------|
| **HP-001** | Parcial | — | Começa por material/objetivo de pesquisa, não por “ferramenta genérica” |
| **HP-002** | **Sim** | — | Sources + notebook persistem além de uma conversa pontual |
| **HP-003** | Parcial | — | Source → síntese → detalhe via citation drill-down |
| **HP-004** | Fraco/Parcial | — | Overviews/briefing docs; não é posto de atenção executiva |
| **HP-005** | Fraco | — | Progresso = insights/sínteses, não decisões + efeitos |
| **HP-006** | **Sim (forte)** | — | Citações obrigatórias à origem; origem preservada e inspecionável |

**Nenhuma HP promovida; nenhuma HP nova.**

## 7. Diferenças vs. referências próximas

| Dimensão | **NotebookLM** | **Glean** (F1-I) | **Obsidian** (F1-C) | **ChatGPT RC-03** |
|----------|----------------|------------------|---------------------|-------------------|
| Base | Sources uploadadas pelo usuário | Índice enterprise org-wide | Vault local de notas | Modelo geral sem COA |
| Grounding | Estrito às sources do notebook | Company context + permissions | Links/grafo humanos | Não grounded por default |
| Origem | Citations → passagem | Cited insights | Ownership do arquivo | Sem trilha de fonte |
| Forma | Research notebook | AI coworker | PKM | Chat vazio |

## 8. Contribuições possíveis à arquitetura do CEO (conceitual)

| Incorporar (adaptar) | Não incorporar |
|----------------------|----------------|
| Resposta/decisão **ligada a evidência citável** (HP-006) | Notebook de estudo como Home |
| Usuário/curadoria define o corpus do contexto | Multipropósito (podcasts, quizzes, slides) como núcleo |
| Drill-down source ↔ síntese (HP-003 parcial) | Workspace único sem isolamento COA |
| Recusar inventar fora das sources | Substituição de Decision Doc por “overview” |

**Desafio útil:** o CEO pode exigir que afirmações relevantes no fluxo executivo carreguem **origem preservada** — sem copiar a UX de research notebook.

## 9. Dimensões (essencial)

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 5 | Controlo das sources; include/exclude |
| D2 Info → decisão | 3 | Síntese forte; decisão de negócio não é unidade |
| D7 Conversação | 4 | Chat grounded |
| D8 Contexto | 4 | Notebook = contexto curado; ≠ COA multi-projeto isolado do CEO |
| D9 Tempo | 4 | Síntese rápida de volumes |

## 10. Conclusão técnica

NotebookLM (Gemini Notebook) documenta o paradigma de **raciocínio grounded em fontes com origem explícita**. Para o CEO, a contribuição central é metodológica: **síntese e afirmações inspecionáveis contra evidências** (forte para HP-006; apoio a HP-002). A forma permanece assistente de pesquisa — aplicabilidade **parcial**; não substitui conversa de governança, COA nem progresso por decisões.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Gate F1-M — grounded reasoning / origem das informações |
| Baseado em quê | notebooklm.google; Help citations; blog Google; deliberação CTO |
| Resultado | Ficha homologada (Gate F1-M) como referência oficial; nenhuma nova hipótese |

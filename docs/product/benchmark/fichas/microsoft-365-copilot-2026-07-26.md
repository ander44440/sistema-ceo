# Ficha — Microsoft 365 Copilot (26/07/2026)

> **Status: Homologada — Gate F1-O (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  
> Fontes verificáveis apenas.  
> Tipo: **referência** — domínio: **IA no ambiente de trabalho cotidiano (suite)**.  
> Foco: continuidade entre apps, contexto organizacional, colaboração, produtividade, governança corporativa.  
> **Restrições:** nenhuma nova hipótese; não promover HP-001…006; apenas evidências; sem commit.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Microsoft 365 Copilot** |
| Categoria | Copilot / produtividade enterprise (suite M365) |
| URL / fonte | https://www.microsoft.com/en-us/microsoft-365/copilot ; https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy ; https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-architecture (observado 26/07/2026) |
| Superfície observada | Página de produto + Learn (privacy + architecture) |
| Observador | Engenheiro (Cursor) |
| Classificação | **Parcial** — forte em contexto org. + permissões herdadas; forma = suite multipropósito ≠ Home COA |

---

## 1. Posicionamento

“**AI built for work**” — transforma dados em insights **nas apps que o usuário já conhece** ([microsoft.com](https://www.microsoft.com/en-us/microsoft-365/copilot)). Camada **Work IQ**: intelligence que conecta data, context e tools ao fluxo de trabalho. Superfícies: Chat, Cowork, Search, Agents, Notebooks, Create.

## 2. Problema que resolve

| Problema | Evidência |
|----------|-----------|
| IA desconectada do trabalho diário | Copilot nas apps M365 + Work IQ |
| Busca/respostas sem contexto do job/company | Graph + working context (email, calendar, chats, meetings, docs) |
| Delegação de tarefas complexas | Cowork — handoff grounded no work context |
| Governança de IA na empresa | Secure by design; herda permissões M365 |

## 3. Continuidade entre aplicações e contexto

* Grounding via **Microsoft Graph** no tenant do usuário ([architecture](https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-architecture)).  
* Combina conteúdo organizacional (docs, emails, calendar, chats, meetings, contacts) com **working context** (reunião atual, threads recentes) ([privacy](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy)).  
* Acesso **sempre scoped** às permissões do usuário logado — não visibilidade tenant-wide.  
* Chat / Cowork / Search / Agents / Notebooks no mesmo ecossistema.

## 4. Colaboração e produtividade

* Drafts, insights, enterprise search (question/phrase/command).  
* Agents (store + Copilot Studio).  
* Notebooks: chats, files, meeting notes, project materials.  
* Create: conteúdo, vídeo, podcast, surveys com brand kit.

## 5. Governança corporativa

| Controlo | Evidência |
|----------|-----------|
| Data ownership | Prompts/inputs/responses **não** treinam foundation models (claim produto + Learn) |
| Governed access | Herda M365 permissions, sensitivity labels, retention |
| IT oversight | Ferramentas para gerir Copilot e agents em escala |
| Boundary | Opera na Microsoft 365 service boundary; RBAC/Conditional Access/MFA do tenant |

## 6. Evidências vs. HP-001…HP-006 (apenas registro)

| HP | Reforça? | Desafia? | Evidência |
|----|----------|----------|-----------|
| **HP-001** | Fraco | **Parcial** | Entrada multipropósito (chat/search/create/agents); risco de começar pela ferramenta da suite |
| **HP-002** | **Sim** | — | Contexto Graph + working context persiste além de uma conversa pontual |
| **HP-003** | Parcial | — | Apps/níveis (Chat→Cowork→Agents); sem hierarquia estratégica explícita tipo Lattice |
| **HP-004** | Parcial | — | Search/insights; não é posto de atenção executiva único |
| **HP-005** | Fraco | **Parcial** | Progresso = produtividade/conteúdo; não decisões + efeitos como unidade |
| **HP-006** | Parcial | — | Permissões/labels/audit (Purview); justificativa de *decisão* não é artefato central |

**Nenhuma HP promovida; nenhuma HP nova.**

## 7. Diferenças vs. referências próximas

| Dimensão | **M365 Copilot** | **Slack AI** (F1-D) | **Glean** (F1-I) | **ChatGPT RC-03** | **Palantir AIP** (F1-N) |
|----------|------------------|---------------------|------------------|-------------------|-------------------------|
| Locus | Suite Office/Teams/Graph | Hub de chat | Search/assistant enterprise | Chat genérico | Ops + Ontology |
| Contexto | Permissões do usuário M365 | Workspace Slack | Company index | Sem COA | Data/logic/action/security |
| Governança | Herança M365/Purview | Planos Slack | Permissions org | Fraca | Role/marking/purpose + evals |
| Forma | Multipropósito no fluxo diário | Briefing+canais | Coworker | Ask anything | Plataforma crítica |

## 8. Contribuições possíveis à arquitetura do CEO

| Incorporar (conceitual) | Não incorporar |
|-------------------------|----------------|
| Contexto organizacional **respeitando autorização** do usuário | Suite “tudo em um” como Home |
| Continuação do trabalho **no fluxo** (não tab isolada) | Agent Store / escolha de agentes pelo usuário (HP-001) |
| Working context (o que está em curso agora) | Notebooks/Create como núcleo de governança |
| Prompts não treinam modelo (transparência) | Progresso = drafts/produtividade sem decisão |

**Desafio:** continuidade rica entre apps **sem** COA único isolado — tensão com REQ-037/039; reforça necessidade de contexto vivo (HP-002) sob controle.

## 9. Dimensões (essencial)

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 4 | Permissões herdadas; IT governance |
| D2 Info → decisão | 3 | Insights/drafts; decisão fraca |
| D6 Objetivo | 2 | Multipropósito (chat/create/search/agents) |
| D7 Conversação | 4 | Chat central na experiência |
| D8 Contexto | 4 | Graph + working context; sem isolamento tipo COA |
| D9 Tempo | 4 | No apps you already know |

## 10. Conclusão técnica

Microsoft 365 Copilot documenta o paradigma de **IA no fluxo de trabalho diário** com grounding no Graph, continuidade entre apps e governança por permissões herdadas. Reforça evidencialmente **HP-002** (contexto org. contínuo) e, em parte, governança alinhada a **HP-006**; desafia **HP-001/P6** pela natureza multipropósito da suite e não trata decisão como unidade de progresso (**HP-005**). Aplicabilidade **parcial** — útil como antimodelo de Home “tudo no Office” e como referência de contexto autorizado.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Gate F1-O — IA no ambiente de trabalho cotidiano |
| Baseado em quê | microsoft.com/copilot; Learn privacy + architecture; deliberação CTO |
| Resultado | Ficha submetida (F1-O); evidências apenas; sem nova HP; sem commit |

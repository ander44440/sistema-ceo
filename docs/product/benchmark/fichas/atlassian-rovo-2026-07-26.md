# Ficha — Atlassian Rovo (26/07/2026)

> **Status: Homologada — Gate F1-P (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  

> Fontes verificáveis apenas.  
> Tipo: **referência** — domínio: **busca corporativa + conhecimento + agentes + automação em ecossistema de trabalho**.  
> Foco: contexto persistente, descoberta de conhecimento, coordenação entre equipes, governança.  
> **Restrições:** nenhuma nova hipótese; não promover HP-001…006; apenas evidências; sem commit.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Atlassian Rovo** |
| Categoria | Enterprise search + knowledge + agents (ecossistema Atlassian) |
| URL / fonte | https://www.atlassian.com/software/rovo ; https://support.atlassian.com/rovo/docs/what-is-rovo/ ; https://support.atlassian.com/rovo/docs/agents/ (observado 26/07/2026) |
| Superfície observada | Página de produto + Support (What is Rovo / Agents) |
| Observador | Engenheiro (Cursor) |
| Classificação | **Parcial** — forte em conhecimento org. + agentes governados; forma = ecossistema Atlassian ≠ Home COA |

---

## 1. Posicionamento

“**Rovo, AI that knows your business**” — desbloqueia conhecimento organizacional com GenAI ([atlassian.com](https://www.atlassian.com/software/rovo)). Turn information into action: **Find / Learn / Act** ([support](https://support.atlassian.com/rovo/docs/what-is-rovo/)). Três pilares: Search, Chat, Agents (+ Studio).

## 2. Problema que resolve

| Problema | Evidência |
|----------|-----------|
| Silos de conhecimento entre apps | Teamwork Graph: “dissolve knowledge silos” |
| Busca fragmentada em SaaS | Rovo Search federado (Atlassian + 3rd-party) |
| Trabalho repetitivo / descoberta lenta | Agents; “information when you need it, not when you find it” |
| Governança de IA | Responsible Tech; SOC2/ISO 27001; controles de acesso |

## 3. Contexto persistente e descoberta de conhecimento

* **Teamwork Graph**: camada de data intelligence que conecta teams/work/apps — “ensures Rovo knows your business”.  
* Search federado sobre índice que abrange Jira, Confluence, Atlas, Bitbucket + conectores externos (Drive, Slack, Teams, GitHub…).  
* Learn: insights, knowledge cards, Chat; resolve jargão/projetos por contexto.  
* Contexto = conhecimento organizacional contínuo, não conversa efêmera.

## 4. Coordenação entre equipes e agentes

* **Rovo Agents**: virtual teammates configuráveis (NL ou Forge/código).  
* Skills: gerar/revisar conteúdo, responder por best practices, editar Jira/Confluence (com permissão).  
* Acessíveis em Chat, automation rules, edição (/rovo, /ai), Studio.  
* Out-of-the-box + Marketplace + MCP agents (Figma, Box, HubSpot…).

## 5. Governança

| Controlo | Evidência |
|----------|-----------|
| Permissões | “Rovo respects your user permissions” — só o que o usuário já pode ver |
| Compliance | SOC 2, ISO 27001; Responsible Technology Principles |
| Admin | AI access controls, data residency, ativar/desativar AI |
| Trust | Políticas restritivas com LLM providers |

## 6. Evidências vs. HP-001…HP-006 (apenas registro)

| HP | Reforça? | Desafia? | Evidência |
|----|----------|----------|-----------|
| **HP-001** | Fraco | **Parcial** | Multi-entrada (Search/Chat/Agents/Studio); risco de começar pela ferramenta |
| **HP-002** | **Sim (forte)** | — | Teamwork Graph: conhecimento persistente que “knows your business” |
| **HP-003** | Parcial | — | Find→Learn→Act; níveis via agents/subagents; sem hierarquia estratégica explícita |
| **HP-004** | Parcial | — | “information when you need it” — descoberta proativa parcial |
| **HP-005** | Fraco | **Parcial** | Progresso = tasks/conteúdo; decisão+efeito não é unidade |
| **HP-006** | Parcial | — | Permissões + fontes citáveis; justificativa de decisão não é artefato central |

**Nenhuma HP promovida; nenhuma HP nova.**

## 7. Diferenças vs. referências próximas

| Dimensão | **Rovo** | **Glean** (F1-I) | **M365 Copilot** (F1-O) | **Palantir AIP** (F1-N) |
|----------|----------|------------------|--------------------------|-------------------------|
| Base | Teamwork Graph (Atlassian + conectores) | Índice enterprise agnóstico | Microsoft Graph / tenant M365 | Ontology |
| Locus | Ecossistema Jira/Confluence | Cross-app coworker | Suite Office | Ops crítica |
| Agents | Rovo Agents + Marketplace/MCP | Glean Agents | Copilot Studio/Agent Store | AIP Logic/Chatbot |
| Governança | Permissões + SOC2/ISO | Permissions org | Herança M365/Purview | Role/marking/purpose + evals |

## 8. Contribuições possíveis à arquitetura do CEO

| Incorporar (conceitual) | Não incorporar |
|-------------------------|----------------|
| **Camada de grafo** de conhecimento que sobrevive a tarefas (HP-002) | Ecossistema Atlassian como Home |
| Descoberta de conhecimento respeitando permissões | Multi-app / Marketplace como núcleo |
| Agents especializados sob permissão explícita | Progresso = edições/tasks |
| Find→Learn→Act como narrativa | Search federado genérico sem COA |

**Desafio:** o CEO pode inspirar-se num “graph” de contexto persistente para HP-002 — sem virar enterprise search multi-app; o COA único deve permanecer.

## 9. Dimensões (essencial)

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 4 | Permissões respeitadas; admin controls |
| D2 Info → decisão | 3 | Find/Learn/Act; decisão fraca |
| D6 Objetivo | 2 | Multi-feature (search/chat/agents/studio) |
| D7 Conversação | 4 | Rovo Chat |
| D8 Contexto | 5 | Teamwork Graph persistente; sem isolamento COA |
| D9 Tempo | 4 | Menos context-switching |

## 10. Conclusão técnica

Atlassian Rovo documenta o paradigma de **conhecimento organizacional persistente (Teamwork Graph) + busca federada + agentes governados**. Reforça fortemente **HP-002** (contexto que sobrevive) e, em parte, governança (**HP-006**); desafia **HP-001/P6** pela multiplicidade de entradas e não trata decisão como unidade (**HP-005**). Aplicabilidade **parcial** — o conceito de grafo de contexto é a contribuição mais relevante; a forma de ecossistema não é a interface do CEO.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Gate F1-P — busca/conhecimento/agentes/automação em ecossistema |
| Baseado em quê | atlassian.com/software/rovo; support (what is / agents); deliberação CTO |
| Resultado | Ficha submetida (F1-P); evidências apenas; sem nova HP; sem commit |

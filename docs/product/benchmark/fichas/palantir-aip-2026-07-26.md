# Ficha — Palantir AIP (26/07/2026)

> **Status: Homologada — Gate F1-N (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  
> Fontes verificáveis apenas (docs oficiais Palantir).  
> Tipo: **referência** — domínio: **plataforma de IA operacional com governança** (agentes + dados + autorização + rastreabilidade).  
> **Restrições:** nenhuma nova hipótese; não promover HP-001…006; apenas evidências; sem commit.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Palantir AIP** (Artificial Intelligence Platform) |
| Categoria | Plataforma enterprise — agentes, Ontology, governança operacional |
| URL / fonte | https://palantir.com/docs/foundry/aip/overview/ ; https://palantir.com/docs/foundry/architecture-center/aip-architecture/ (observado 26/07/2026) |
| Superfície observada | Documentação oficial AIP Overview + AIP Architecture |
| Observador | Engenheiro (Cursor) |
| Classificação | **Parcial — alta relevância arquitetural** (governança/agentes/rastreio; forma ≠ Home conversacional do CEO) |

---

## 1. Posicionamento

AIP **conecta AI a dados e operações**, automatizando processos operacionais para developers e usuários de linha de frente ([overview](https://palantir.com/docs/foundry/aip/overview/)). Com Foundry + Apollo forma um “operating system” de produtos AI-driven. Foco: **domínios operacionais / mission-critical**, não chat genérico.

## 2. Problema que resolve

| Problema | Evidência |
|----------|-----------|
| LLMs sem contexto operacional seguro | Integração a dados Foundry + Ontology |
| Agentes sem os mesmos controles que humanos | Security & governance uniformes human+agent |
| Automação sem auditabilidade | Audit trails, observability, lineage |
| Confiança em produção | Explainability, transparency, AIP Evals |

## 3. Integração agentes ↔ dados ↔ execução

* **Ontology**: data + logic + action + security como representação unificada de **enterprise decision-making** ([architecture](https://palantir.com/docs/foundry/architecture-center/aip-architecture/)).  
* Agentes/workflows (AIP Logic, Chatbot Studio, Evals) **sobre** a Ontology.  
* Automations: schedule, event-driven, API; actions via primitives da Ontology.  
* Lifecycle: build → orchestrate → evaluate (AIP Evals).

## 4. Governança, autorização e rastreabilidade

| Capacidade | Evidência oficial |
|------------|-------------------|
| Access controls | Role-, marking-, purpose-based; humans **e** agents |
| Audit | “expressive audit logging”; detailed audit trails |
| Observability | Logging de ações humanas e de agentes; trace de cadeias |
| Provenance | Provenance-tracking em context engineering |
| Avaliações | AIP Evals: test cases, compare LLMs, variance |
| HITL | Human-in-the-loop entrelaçado com operações autônomas |

## 5. Modelo de interação (evidência)

Espectro **Human + AI applications**: analytics, apps, governance workflows. Infusão de AI “carefully controlled and transparently assessed” — jornada de augmentation → automation. Não é Home de um único COA conversacional; é plataforma multi-persona.

## 6. Evidências vs. HP-001…HP-006 (apenas registro)

| HP | Reforça? | Desafia? | Evidência |
|----|----------|----------|-----------|
| **HP-001** | Parcial | — | Ação/objetivo operacional via Ontology “verbs”; não “escolher LLM” como UX central do operador |
| **HP-002** | **Sim** | — | Ontology como contexto contínuo de decisão empresarial |
| **HP-003** | **Sim** | — | Data/logic/action em representação unificada; apps por persona/nível |
| **HP-004** | Fraco | — | Observability/ops; não briefing executivo pessoal |
| **HP-005** | **Sim (parcial)** | — | Ontology modela *decisions*, não só datasets; progresso operacional via actions |
| **HP-006** | **Sim (forte)** | — | Audit trails, lineage, explainability, evals, mesmas regras human/agent |

**Nenhuma HP promovida; nenhuma HP nova.**

## 7. Diferenças vs. referências próximas

| Dimensão | **Palantir AIP** | **Devin** (F1-L) | **NotebookLM** (F1-M) | **Claude Computer Use** (antimodelo) |
|----------|------------------|------------------|------------------------|--------------------------------------|
| Escopo | Enterprise ops + governança | Eng. software autônoma | Research grounded em sources | GUI actions genéricas |
| Contexto | Ontology (data/logic/action/security) | Codebase + knowledge | Sources do notebook | Screenshot do momento |
| Governança | RBAC/marking/purpose + audit | Review/merge de PRs | Citations | Precauções; sem COA |
| Autonomia | HITL ↔ autonomous sob mesmos controles | Alta execução + approve | Baixa (síntese) | Alta ação, baixa trilha org. |

## 8. Contribuições possíveis à arquitetura do CEO

| Incorporar (conceitual) | Não incorporar |
|-------------------------|----------------|
| Agentes sob **mesmas regras** de autorização/audit que humanos | Suite enterprise como Home do CEO |
| Contexto operacional unificado (análogo fraco a COA + memória) | Ontology completa / Foundry stack |
| Rastreabilidade e evals de ações de IA (HP-006) | Multi-persona ops center como UI default |
| Decisão/ação como objeto de modelagem (HP-005 parcial) | Automação total sem transparência |

**Desafio arquitetural:** o CEO precisa de **governança de agentes + evidência + autorização** em escala — AIP mostra que isso é requisito de plataforma crítica, não opcional; a forma Palantir (Foundry/Ontology) não é o produto CEO.

## 9. Dimensões (essencial)

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 5 | Purpose/role controls; HITL |
| D2 Info → decisão | 4 | Ontology de decision-making + actions |
| D7 Conversação | 3 | Chatbots/agents existem; não é o núcleo exclusivo |
| D8 Contexto | 5 | Ontology + security scope |
| D9 Tempo | 3 | Plataforma densa; valor em criticidade |

## 10. Conclusão técnica

Palantir AIP documenta o paradigma de **IA operacional governada**: agentes e humanos sobre o mesmo contexto (Ontology), com autorização, auditabilidade e avaliação em ambientes críticos. Para o CEO, reforça evidencialmente **HP-002/003/005/006** (contexto vivo, níveis, decisão/ação, justificativa rastreável) e desafia qualquer desenho de autonomia sem trilha. Aplicabilidade **parcial** — contribuição conceitual alta; forma de plataforma enterprise não deve ser copiada como interface do CEO.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Gate F1-N — agentes + governança + rastreabilidade em ambientes críticos |
| Baseado em quê | Docs oficiais AIP overview + architecture; deliberação CTO |
| Resultado | Ficha homologada (Gate F1-N) como referência oficial; nenhuma nova hipótese |

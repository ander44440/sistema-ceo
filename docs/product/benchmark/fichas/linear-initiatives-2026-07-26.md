# Ficha — Linear Initiatives (26/07/2026)

> **Status: Homologada — Gate F1-C (CTO, 26/07/2026). Integra a base documental da IPR-001.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.  
> Nota: superfície distinta da ficha Linear (issues) já homologada no Gate F1-A; observa o **nível estratégico acima de projetos/issues**.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Linear Initiatives** (Linear) |
| Categoria | Executiva (gestão de iniciativas / objetivos acima de projetos) |
| URL / fonte | https://linear.app/docs/initiatives (observado 26/07/2026) |
| Versão / superfície observada | Documentação oficial — Initiatives |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Parcial** (forte em objetivo/contexto que sobrevive ao ciclo de issues; domínio = product development, não governança conversacional) |

---

## 1. Identidade do Produto

Initiatives agrupa **projetos em torno de objetivos da organização**, com status, prioridade e labels, para acompanhar o que importa e revisar progresso no roadmap ([linear.app/docs/initiatives](https://linear.app/docs/initiatives)). Propósito declarado: expressar metas e monitorar avanço em **múltiplos projetos e horizontes longos**, sem obrigar a liderança a descer a cada issue.

## 2. Primeira Impressão

Superfície de **planejamento estratégico**, não de tracker diário. Tom sóbrio e hierárquico: Initiatives → Projects → (implicado) Issues. Sensação de posto de comando de roadmap, não de chat.

## 3. Organização da Informação

* Unidade central: **Initiative** no nível do workspace.  
* Propriedades: status (`Proposed`…`Canceled`), priority, labels, owner, target date, description, resources, projects vinculados.  
* **Initiative Health** e Active Projects: rollup de atualizações (on track / at risk / off track).  
* Distinção explícita: initiatives = conjunto intencional ligado a objetivo compartilhado; project views = coleção automática por filtros.  
* Resources: documentos/links de contexto anexados à initiative.

## 4. Fluxo de Uso

1. Habilitar Initiatives nas settings.  
2. Criar initiative com propósito/escopo na description.  
3. Vincular projects que contribuem ao objetivo.  
4. Atualizar status/priority e consultar health via updates.  
5. Liderança revisa a vista top-level sem drill-down obrigatório em cada projeto.

## 5. Apoio à Tomada de Decisão

Health + updates + target date empurram a pergunta “estamos no caminho?” e “quem é o owner?”. O próximo passo operacional ainda vive nos projects/issues — a initiative **sustenta o porquê**, não substitui a execução.

## 6. Diferenciais Observados

* Camada de **objetivo organizacional** acima do ciclo de vida de tasks/issues.  
* Contexto (description, resources, labels) permanece enquanto projects mudam de status.  
* Clareza de accountability (owner) e de estágio (status).  
* Separação consciente entre objetivo estratégico e views filtradas de trabalho.

## 7. O que NÃO copiar para o CEO

* Modelo exclusivo de product engineering (roadmap de software).  
* Initiatives sempre shared workspace-wide (sem analogia a isolamento COA).  
* Dependência de updates manuais de health como único sinal — risco de ritual sem decisão se mal portado.  
* Hierarquia Initiatives → Projects → Issues como Home conversacional.

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Alta (conceitual) / Média (forma)** | Alta para a ideia de que o **objetivo/contexto sobrevive ao ciclo de tarefas** (apoia HP-002); média na forma (não é conversa; não é COA isolado). |

---

## Dimensões (D1–D10) — rubrica complementar

| ID | Nota (1–5 / N/A) | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------------------|-----------|-------------------|----------------|
| D1 Controle | 4 | Owner, status, priority explícitos | Controlo sem microgestão de issues | Ritual de status vazio |
| D2 Info → decisão | 4 | Health / at risk / off track | Resumo executivo do progresso | KPI wall se só cores |
| D3 Clareza | 5 | Docs claros: initiative ≠ project view | Vocabulário de níveis | Jargão eng |
| D4 Densidade / elegância | 4 | Vista top-level enxuta | Densidade baixa no estratégico | — |
| D5 Consistência | 4 | Propriedades padronizadas | Modelo de atributos estável | — |
| D6 Objetivo por superfície | 5 | Initiative = objetivo compartilhado | Um objetivo por unidade estratégica | Multiplicar níveis sem necessidade |
| D7 Conversação | 1 | Não é interface conversacional | — | Forçar chat em roadmap |
| D8 Contexto / isolamento | 3 | Resources/description no objetivo; sem isolamento tipo COA | Contexto anexado ao objetivo | Workspace único sem COA |
| D9 Tempo do usuário | 4 | Liderança evita drill-down | Respeitar tempo do patrocinador | Updates obrigatórios excessivos |
| D10 Identidade / tom | 4 | Sóbrio, product-centric | Tom de comando | Identidade de issue tracker |

## Implicações por frente

| Frente | Implicação (se houver) |
|--------|------------------------|
| UX | Separar “objetivo/contexto vivo” de “tarefas transitórias” na narrativa de produto |
| UI | N/A nesta fase |
| Branding | Posto de comando de objetivos ≠ board de tasks |
| Design system | N/A |

## Conclusão

Linear Initiatives ensina que **objetivos e contexto podem existir acima e além do ciclo de issues** — evidência forte para HP-002; não ensina a Home conversacional do CEO.

---

## Memória Organizacional (da ficha)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Ampliar corpus pós F1-B com evidência verificável de contexto acima de tarefas |
| Baseado em quê | Docs oficiais Linear Initiatives; deliberação HP-002; restrições F1 |
| Resultado | Ficha v0.1 submetida ao CTO |

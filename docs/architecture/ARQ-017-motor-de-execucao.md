# ARQ-017 — Motor de Execução

> **Status: Homologada v0.1** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-017.  
> **Capacidade:** CAP-11 — Integrações (com apoio CAP-02 Gestão de Agentes; CAP-08 Planejamento).  
> Norma superior: CON-001 (tempo do utilizador; governança; fronteira de papéis); ADR-015; ADR-019; REQ-030; REQ-045; REQ-053; ADR-006.  
> **Finalidade:** arquitectura do **Motor de Execução** — transformar intenções **aprovadas** pelo CEO em **execução real**, com rastreabilidade de ponta a ponta.  
> **Gate:** Homologada (patrocinador). **Próximo artefacto:** **REQ-056**.  
> **Sem implementação** até REQ-056 + IMP + autorização por etapa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada arquitectural que conduz o ciclo **Intenção → … → Encerramento**, ligando deliberação (MRE/Núcleo), aprovação humana quando necessária, Fila (REQ-045), Dispatcher (REQ-053), execução pelo Agent e fecho do resultado no posto de comando. |
| **Por que existe?** | Já existem deliberação (MRE), publicação de Jobs e despacho local — mas falta um **modelo único** que une intenção aprovada a execução real, com estados, responsabilidades e critérios explícitos, sem o CEO substituir as ferramentas de execução (REQ-030). |
| **Para quem existe?** | Patrocinador (aprova e vê resultado); CEO Digital / Orquestrador (conduz o fluxo); Dispatcher e Agent (executam); Painel (ARQ-016) observa. |
| **Como medir sucesso?** | (1) Intenção aprovada produz Job rastreável; (2) Dispatcher/Agent avançam o Job sem copiar/colar; (3) Resultado regressa ao CEO com estado terminal claro; (4) MRE e CTO **não** executam código; (5) Painel reflecte estados sem comandar a execução. |

---

## 1. Objetivo

### 1.1 Objectivo

**Transformar intenções aprovadas pelo CEO em execução real**, fechando o ciclo governança → trabalho → resultado, com o menor atrito para o patrocinador (ADR-015 / CON-001).

### 1.2 Objectivos operacionais

| ID | Objectivo |
|----|-----------|
| O1 | Explicitar o **fluxo executivo mínimo** da intenção ao encerramento. |
| O2 | Separar **deliberar / aprovar / executar / observar**. |
| O3 | Reutilizar e **não redesenhar** a Fila (REQ-045) e o Dispatcher V2 (REQ-053) como portas de execução. |
| O4 | Garantir **estados de Job** canónicos e auditáveis. |
| O5 | Manter a fronteira REQ-030: o CEO **orquestra e despacha**; a oficina (Agent / ferramentas) **executa**. |
| O6 | Alimentar transparência (ARQ-016) sem o Painel comandar a fila. |

### 1.3 Não-objectivos (desta ARQ)

| ID | Fora |
|----|------|
| NO1 | Implementar código, IMP ou rotas novas nesta fase. |
| NO2 | Substituir o MRE (ADR-019) ou o Conector CTO (ARQ-015). |
| NO3 | Dispatcher cloud 24/7 (V3 — backlog). |
| NO4 | Executores além do Agent Cursor na V1 do Motor (salvo emenda futura). |
| NO5 | Publicação automática de Job a partir de **qualquer** prosa LLM sem política de aprovação. |

---

## 2. Escopo

### 2.1 Dentro do escopo (V1 arquitectural)

* Modelo do **Motor de Execução** como orquestração do fluxo §3.  
* Fronteiras de responsabilidade entre Núcleo/MRE, patrocinador, Fila, Dispatcher, Agent, Speaker/CN, Painel.  
* **Estados do Job** alinhados a REQ-045.  
* Critérios arquitecturais para futuros REQ/IMP.  
* Integração **lógica** com: ParecerExecutivo / `acao.job` (REQ-048), Fila, Dispatcher, Painel de Orquestração.

### 2.2 Fora do escopo

* Código, schemas novos obrigatórios, UI nova, ou alteração de CON/ADR nesta ARQ.  
* Controlo remoto start/stop do watcher a partir do browser (já fora da ARQ-016 V1).  
* Multi-utilizador / RBAC da fila.  
* Execução directa no repositório MG2 pelo processo do CEO (continua a ser o Agent / oficina).  
* Redefinir papéis CTO (não implementa) ou Engenheiro (não decide arquitectura sozinho).

### 2.3 Relação com o que já existe

| Peça | Papel face ao Motor |
|------|---------------------|
| **MRE / Núcleo** | Produz intenção deliberada e, quando couber, proposta de despacho (`acao.job` / capacidade fila). **Não** executa o trabalho técnico. |
| **CTO Connector** | Parecer de governança/arquitectura. **Não** cria Job automaticamente (REQ-054 NA2). |
| **Fila REQ-045** | Persistência e máquina de estados do Job. |
| **Dispatcher REQ-053** | Acorda o Agent perante `pending`. |
| **Agent (Cursor)** | Executa o Job segundo skill/protocolo. |
| **Painel ARQ-016** | Observa Agent/Dispatcher/Fila — **só leitura**. |
| **Speaker / CN** | Comunica resultado ao utilizador — não substitui o encerramento do Job. |

---

## 3. Fluxo Executivo

### 3.1 Fluxo mínimo (canónico)

```text
Intenção
  → Plano
  → Aprovação (quando necessária)
  → Criação do Job
  → Dispatcher
  → Execução
  → Monitoramento
  → Resultado
  → Encerramento
```

### 3.2 Descrição por etapa

| Etapa | O que acontece | Quem conduz | Saída típica |
|-------|----------------|-------------|--------------|
| **Intenção** | Utilizador expressa pedido; Núcleo/MRE classifica e delibera. | Utilizador + MRE/Núcleo | Intenção estruturada / parecer |
| **Plano** | Passos, âmbito, risco e necessidade de meios (Job vs resposta só). | MRE / CAP-08 (lógico) | Plano ou `acao` tipada |
| **Aprovação** | Gate humano quando a política exigir (efeito externo, alto risco, despacho). | Patrocinador | Aprovado / rejeitado / adiado |
| **Criação do Job** | Publicação na Fila sem nomear o executor (REQ-045). | Orquestrador / capacidade fila | `JOB-*.json` em `pending` |
| **Dispatcher** | Watcher deteta `pending` e acorda o Agent (REQ-053). | Dispatcher local | Lock / invocação Agent |
| **Execução** | Agent realiza o trabalho no âmbito do Job. | Agent (Cursor SDK) | Trabalho + evidências |
| **Monitoramento** | Estados e sinais (fila, heartbeat, Painel). | Fila + Dispatcher + Painel | Visibilidade operacional |
| **Resultado** | Job actualizado (`completed` / `failed` / …); síntese ao CEO. | Agent + Orquestrador / Speaker | Resultado estruturado + prosa |
| **Encerramento** | Estado terminal; memória/COA actualizados se aplicável; ciclo disponível para nova intenção. | Orquestrador | Fecho auditável |

### 3.3 Diagrama de sequência (lógico)

```text
Utilizador ──► Conversa / Núcleo ──► MRE (parecer)
                    │
                    ▼
            [precisa aprovação?] ──sim──► Patrocinador Gate
                    │ não / aprovado
                    ▼
            Publicar Job (REQ-045) ──► pending
                    │
                    ▼
            Dispatcher (REQ-053) ──► Agent
                    │
                    ▼
            running → completed|failed|cancelled
                    │
                    ▼
            Resultado → Speaker/CN + Painel (observação)
                    │
                    ▼
            Encerramento (ciclo livre)
```

### 3.4 Regras de transição do fluxo

1. **Sem intenção clara** → não criar Job (pedir mínimo ou classificar via NCS/MRE).  
2. **Parecer sem `delegar`/`despachar`** → pode terminar em comunicação; **não** força Job.  
3. **Aprovação necessária e ausente** → não avançar para Criação do Job.  
4. **Job `pending` sem Dispatcher/PC** → permanece `pending` (degradação previsível; Painel: Dispatcher em Erro/Aguardando conforme ARQ-016/IMP-055).  
5. **Falha na Execução** → `failed` + resultado; **não** inventar `completed`.  
6. **Encerramento** só com estado terminal do Job **ou** cancelamento explícito governado.

---

## 4. Responsabilidades

### 4.1 Matriz RACI lógica (V1)

| Responsabilidade | Patrocinador | Orquestrador / MRE | Fila | Dispatcher | Agent | Painel |
|------------------|--------------|--------------------|------|------------|-------|--------|
| Expressar intenção | R | C | — | — | — | — |
| Deliberar / planear | I | R | — | — | — | — |
| Aprovar despacho (quando Gate) | A/R | C | — | — | — | — |
| Criar Job | I | R | C | — | — | — |
| Persistir / estados Job | I | C | R | C | C | I |
| Acordar Agent | I | — | C | R | — | I |
| Executar trabalho | I | — | — | C | R | I |
| Monitorar sinais | I | C | C | C | C | R (leitura) |
| Comunicar resultado | I | R (via Speaker/CN) | — | — | C | I |
| Encerrar ciclo | A (aceite) | R | C | — | C | I |

*(R = realiza; A = aprova; C = contribui; I = informado.)*

### 4.2 Responsabilidades do Motor de Execução (como conceito)

| ID | Responsabilidade |
|----|------------------|
| R1 | Garantir que o fluxo §3 é o **caminho canónico** intenção→encerramento. |
| R2 | Impedir que deliberação (MRE) ou parecer CTO **saltam** directamente para “trabalho feito” sem Job quando a política exige despacho. |
| R3 | Preservar **desacoplamento**: CEO não conhece o Cursor no acto de publicar (REQ-045/053). |
| R4 | Exigir estados de Job coerentes e observáveis. |
| R5 | Definir quando a **Aprovação** é obrigatória (política — detalhe no REQ). |
| R6 | Coordenar o regresso do **Resultado** ao posto de comando sem perder rastreio `jobId`. |

### 4.3 Não responsabilidades

| ID | Não responsabilidade |
|----|----------------------|
| NR1 | Escrever código do MG2 dentro do processo do browser/CEO. |
| NR2 | Decidir arquitectura no lugar do CTO (CON-001). |
| NR3 | Substituir o skill `consumir-fila-execucao` / protocolo do Agent. |
| NR4 | Operar como dashboard de comando remoto do watcher. |
| NR5 | Garantir execução com PC desligado (V3). |

---

## 5. Componentes envolvidos

### 5.1 Componentes lógicos

| Componente | Função no Motor | Norma / artefacto |
|------------|-----------------|-------------------|
| **Conversa (SRF-T03)** | Entrada de intenção; saída de resultado humano | F5; PX-003 |
| **Núcleo Executivo / Orquestrador** | Roteamento; efeitos pós-deliberação; publicação de Job | ARQ-009 / capacidades |
| **MRE** | Deliberação → ParecerExecutivo / plano | ADR-019; REQ-048–049 |
| **Política de Aprovação** | Gate humano (a especificar no REQ) | CON-001 Art. 6º |
| **Fila de Execução** | Store de Jobs + API | REQ-045 |
| **Dispatcher V2** | Watcher + heartbeat + SDK | REQ-053; IMP-055 (sinal) |
| **Agent (Cursor)** | Executor | Skill / REQ-053 |
| **Speaker / Conversação Natural** | Comunicado do resultado | REQ-050; PX-003 |
| **Painel de Orquestração** | Monitoramento visual | ARQ-016; REQ-055 |
| **Memória / COA** | Registo do fecho relevante | CAP-05; CAP-03 |

### 5.2 Portas já existentes (consumo — não redesenhar nesta ARQ)

| Porta | Uso no fluxo |
|-------|----------------|
| `POST /api/ceo/queue/jobs` | Criação do Job |
| `GET /api/ceo/queue/pending` | Observação / Dispatcher |
| `PATCH /api/ceo/queue/jobs/:id` | Transições de estado |
| `GET /api/ceo/orquestracao/snapshot` · `stream` | Monitoramento |
| `POST /api/ceo/orquestracao/heartbeat` | Sinal do Dispatcher |

Novas portas **só** se o REQ futuro o exigir (ex.: “submeter intenção para execução” unificada) — **não** inventadas aqui.

### 5.3 Separação obrigatória de canais

```text
Deliberação (MRE)     ≠  Execução (Fila + Dispatcher + Agent)
Consulta CTO          ≠  Despacho de Job
Painel (observação)   ≠  Comando de execução
```

---

## 6. Estados do Job

### 6.1 Enum canónico (REQ-045 — obrigatório)

| Estado | Significado no Motor |
|--------|----------------------|
| `pending` | Job criado; à espera do Dispatcher/Agent. |
| `running` | Execução em curso pelo Agent. |
| `completed` | Execução concluída com sucesso; resultado registado. |
| `failed` | Execução falhou; motivo/resultado de falha registado. |
| `cancelled` | Cancelado antes ou durante a execução por acto governado. |

### 6.2 Mapeamento fluxo ↔ estado

| Etapa do fluxo §3 | Estado(s) típico(s) |
|-------------------|---------------------|
| Criação do Job | → `pending` |
| Dispatcher / início Execução | `pending` → `running` |
| Resultado OK | `running` → `completed` |
| Resultado NOK | `running` → `failed` |
| Abortagem governada | `pending`\|`running` → `cancelled` |
| Encerramento | Estado terminal estável (`completed` \| `failed` \| `cancelled`) |

### 6.3 Precedência e regras

1. Estados **fora** deste enum **não** são válidos na V1 (emenda REQ/ARQ necessária).  
2. Transições ilegais (ex.: `completed` → `pending`) são **erro de protocolo**.  
3. O Motor trata `pending` prolongado como **espera operacional** (PC/Dispatcher), não como falha semântica do parecer.  
4. O Painel traduz sinais de fila/Dispatcher para o enum de **orquestração** (Disponivel/Executando/…); **não** substitui o enum do Job.

### 6.4 Conteúdo mínimo do Job (herdado / a respeitar)

Conforme REQ-045 e uso actual: `id`, `titulo`, `descricao`, `estado`, marcas temporais, `resultado` quando terminal; origem CEO; **sem** referência ao Cursor no acto de publicação.

---

## 7. Critérios arquitecturais

### 7.1 Critérios de conformidade (obrigatórios)

| ID | Critério |
|----|----------|
| CA1 | O fluxo §3.1 é o caminho canónico intenção→encerramento. |
| CA2 | Deliberação (MRE) e execução (Fila/Dispatcher/Agent) permanecem **separadas**. |
| CA3 | Criação de Job respeita REQ-045 (CEO não nomeia o executor). |
| CA4 | Despacho respeita REQ-053 (Dispatcher local V2; V3 fora de escopo). |
| CA5 | Estados de Job = enum §6; terminais só `completed` \| `failed` \| `cancelled`. |
| CA6 | Aprovação humana quando a política do REQ o exigir — sem bypass silencioso. |
| CA7 | REQ-030: Motor **não** substitui ferramentas de execução do MG2. |
| CA8 | Painel (ARQ-016) **observa**; não publica Jobs nem chama Dispatcher. |
| CA9 | CTO Connector **não** cria Jobs automaticamente. |
| CA10 | Resultado e encerramento são **rastreáveis** ao `jobId` (e ao parecer, se houver). |

### 7.2 Critérios de qualidade / risco

| ID | Critério |
|----|----------|
| CQ1 | Degradação previsível sem PC/watcher (`pending` + sinal no Painel). |
| CQ2 | Sem segredos (`CURSOR_API_KEY`, etc.) em Jobs, pareceres ou Painel. |
| CQ3 | Idempotência razoável no consumo (locks Dispatcher — REQ-053). |
| CQ4 | Extensão a novos executores exige emenda ARQ/REQ — não ad hoc no Orquestrador. |

### 7.3 Critérios de homologação desta ARQ (Gate)

A ARQ-017 considera-se **homologada** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Fluxo §3 aceite como canónico.  
3. Responsabilidades §4 e componentes §5 coerentes com o sistema actual.  
4. Estados do Job §6 alinhados a REQ-045.  
5. Critérios §7 suficientes para abrir o **REQ** do Motor (sem código ainda).  
6. Autorização explícita para o próximo artefacto: **REQ** (não IMP/código).

### 7.4 Critérios para avançar a implementação (referência futura)

Só após: ARQ-017 homologada → REQ homologado → IMP → autorização por etapa (ADR-006).  
**Proibido:** implementar o Motor nesta fase.

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Confundir MRE “disse que fez” com Job `completed` | CA2 / CA5; resultado só após estado terminal da Fila |
| Aprovação omitida em despachos sensíveis | Política explícita no REQ (R5 / CA6) |
| Motor virar “segundo Dispatcher” | Reutilizar REQ-053; Motor orquestra o fluxo, não duplica o watcher |
| Expansão prematura a multi-executor | CQ4; V1 = Agent Cursor |
| PC off interpretado como falha de intenção | CQ1; distinção `pending` vs `failed` |

---

## 9. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 (primária); CAP-02; CAP-08 |
| Norma superior | CON-001; ADR-015; ADR-019; REQ-030 |
| Peças reutilizadas | REQ-045; REQ-053; REQ-048 (`acao.job`); ARQ-015; ARQ-016 |
| Origem | Abertura de frente patrocinador — Motor de Execução (01/08/2026) |
| Próximo | **REQ-056** → IMP → VAL |
| Implementação | *Proibida até Gate REQ-056 / IMP* |

---

## 10. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura ARQ-017 — Motor de Execução | Transformar intenção aprovada em execução real; unificar fluxo | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação ARQ-017 | Gate arquitectura | **Homologada**; abrir REQ-056 |

---

*Nenhuma implementação de código do Motor até homologação do REQ-056 e IMP subsequente.*

---

**Gate ARQ-017:** Homologada. Artefacto seguinte: **REQ-056**.

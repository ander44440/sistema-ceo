# REQ-056 — Motor de Execução

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O Sistema CEO deverá conduzir o ciclo **Intenção → Plano → Aprovação (quando necessária) → Criação do Job → Dispatcher → Execução → Monitoramento → Resultado → Encerramento**, de forma a transformar intenções **aprovadas** em **execução real** rastreável — reutilizando a Fila (REQ-045) e o Dispatcher V2 (REQ-053), **sem** o CEO substituir as ferramentas de execução (REQ-030) e **sem** confundir deliberação (MRE) com trabalho concluído.

## Tipo

Funcional; detalhado (MVP V1 do Motor de Execução).

## Justificativa

A **ARQ-017 v0.1** (homologada) define o Motor de Execução como camada que une deliberação aprovada a despacho e fecho. Já existem MRE, Fila e Dispatcher, mas falta o requisito que obriga o fluxo canónico, a política de aprovação, o regresso do resultado e as restrições de fronteira. CON-001 (tempo do utilizador; papéis); ADR-015 (uso diário MG2); ADR-019 (MRE delibera, não executa oficina); REQ-030; REQ-045; REQ-053; REQ-048 (`acao.job`); ARQ-015/016 (CTO e Painel não executam).

---

## Objetivo

1. Fechar o ciclo **governança → trabalho → resultado** com atrito mínimo para o patrocinador.  
2. Garantir que intenção aprovada que exige despacho produz **Job** com estados canónicos.  
3. Separar **deliberar / aprovar / executar / observar**.  
4. Reutilizar Fila e Dispatcher — **não** duplicar o watcher nem nomear o Cursor no acto de publicar.  
5. Devolver **Resultado** e **Encerramento** rastreáveis ao `jobId` (e ao parecer, se houver).  
6. Manter Painel e CTO fora do comando de execução.

---

## Escopo

### Dentro do escopo (V1)

* Orquestração do fluxo canónico da ARQ-017 §3.  
* Política de **quando** a Aprovação humana é obrigatória antes da Criação do Job.  
* Criação de Job via Fila existente (REQ-045) a partir de intenção/parecer aprovados.  
* Consumo via Dispatcher existente (REQ-053) e execução pelo Agent.  
* Monitoramento por estados da Fila + sinais do Painel (REQ-055) — só observação.  
* Regresso do Resultado ao posto de comando (Conversa / Speaker / CN) e Encerramento.  
* Rastreio `jobId` ↔ parecer/`acao` quando aplicável (REQ-048).

### Capacidade

Exactamente uma capacidade primária: **CAP-11 — Integrações** (apoio conceptual CAP-02 / CAP-08 conforme ARQ-017).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF1 | O Motor deverá seguir o fluxo: Intenção → Plano → Aprovação (se necessária) → Criação do Job → Dispatcher → Execução → Monitoramento → Resultado → Encerramento. |
| RF2 | Face a uma intenção, o sistema deverá produzir um **Plano** ou acção tipada (incl. decisão de despachar ou apenas comunicar), via Núcleo/MRE — **sem** marcar trabalho técnico como concluído só por prosa do modelo. |
| RF3 | Quando a política de aprovação o exigir, o Motor **não** criará Job até Gate explícito do patrocinador (aprovado / rejeitado / adiado). |
| RF4 | A Criação do Job deverá publicar na Fila (REQ-045) com estado inicial `pending`, **sem** referenciar o Cursor nem outro executor no acto de publicar. |
| RF5 | O despacho deverá ocorrer pelo Dispatcher V2 (REQ-053); o Motor **não** implementará um segundo watcher. |
| RF6 | A Execução deverá ser realizada pelo Agent segundo o protocolo/skill da fila; transições `pending` → `running` → terminal. |
| RF7 | Os únicos estados de Job válidos na V1 são: `pending` \| `running` \| `completed` \| `failed` \| `cancelled`. |
| RF8 | Em sucesso, o Job passará a `completed` com `resultado`; em falha, a `failed` com motivo — **proibido** inventar `completed`. |
| RF9 | O Resultado deverá regressar ao posto de comando (mensagem ao utilizador) com referência ao `jobId` quando houver Job. |
| RF10 | O Encerramento só ocorrerá com estado terminal do Job ou `cancelled` governado; o ciclo fica então disponível para nova intenção. |
| RF11 | Parecer MRE **sem** despacho (`delegar`/`despachar` / equivalente) **não** força Criação do Job. |
| RF12 | O Conector CTO **não** criará Jobs automaticamente (alinhado a REQ-054). |
| RF13 | O Painel de Orquestração **não** publicará Jobs nem invocará o Dispatcher (alinhado a REQ-055 / ARQ-016). |
| RF14 | Intenção ambígua ou insuficiente **não** criará Job; o sistema pedirá o mínimo ou classificará via mecanismos existentes (NCS/MRE). |
| RF15 | Job `pending` sem PC/Dispatcher permanecerá `pending` (espera operacional), distinto de `failed`. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | **Tempo do utilizador:** o fluxo não exigirá copiar/colar o conteúdo do Job para o Agent (REQ-045/053). |
| RNF2 | **Segurança:** credenciais (`CURSOR_API_KEY`, API keys) nunca em Jobs, pareceres, Conversa ou Painel. |
| RNF3 | **Degradação previsível:** sem watcher/PC, comportamento documentado (`pending` + sinais no Painel). |
| RNF4 | **Observabilidade:** estados de Job e sinais de orquestração consultáveis sem abrir terminais ad hoc. |
| RNF5 | **Não duplicação:** proibido segundo Dispatcher ou segunda fila incompatível com REQ-045. |
| RNF6 | **Extensibilidade controlada:** novos executores só por emenda ARQ/REQ — V1 = Agent Cursor. |
| RNF7 | **Idempotência razoável** no consumo (locks do Dispatcher — REQ-053). |
| RNF8 | **Rastreabilidade:** fechos de ciclo com Job associáveis a `jobId` (e parecer, se existir). |
| RNF9 | **Fronteira REQ-030:** o Motor orquestra/despacha; não substitui IDE/oficina/build do MG2 no browser do CEO. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| CA1 | Existe condução do fluxo canónico ARQ-017 §3.1 de ponta a ponta num cenário feliz (intenção → Job → execução → resultado → encerramento). |
| CA2 | Deliberação MRE e estado terminal do Job são observacionalmente distintos (prosa ≠ `completed`). |
| CA3 | Job criado pelo Motor cumpre REQ-045 (ficheiro/API; estado `pending`; sem nome de executor). |
| CA4 | Despacho usa Dispatcher REQ-053 (não um watcher paralelo inventado pelo Motor). |
| CA5 | Apenas os cinco estados §RF7; transições ilegais rejeitadas ou impossíveis no protocolo. |
| CA6 | Quando a política marcar aprovação obrigatória, Job **não** é criado sem Gate. |
| CA7 | Após `completed`/`failed`, o utilizador recebe Resultado na Conversa (ou canal Speaker/CN) com `jobId`. |
| CA8 | Painel não cria Jobs; CTO Connector não cria Jobs automaticamente. |
| CA9 | Sem Dispatcher activo, Job permanece `pending` (não vira `failed` só por ausência de PC). |
| CA10 | Documentação mínima do Motor referencia ARQ-017, este REQ, Fila e Dispatcher. |
| CA11 | Nenhuma evidência de execução de código MG2 pelo processo do browser/CEO no lugar do Agent. |

### Critérios negativos

| ID | Critério |
|----|----------|
| NA1 | O Motor **não** é a home conversacional nem substitui a Conversa. |
| NA2 | Falha/ausência do Dispatcher **não** derruba a Conversa nem a deliberação. |
| NA3 | O Motor **não** exige segunda API key nem browser ChatGPT para despachar Jobs. |

---

## Casos de Uso

### CU1 — Despacho com aprovação (feliz)

1. Patrocinador expressa intenção na Conversa.  
2. MRE/Núcleo elabora Plano e propõe despacho.  
3. Política exige Gate → patrocinador **aprova**.  
4. Motor cria Job `pending` (REQ-045).  
5. Dispatcher acorda Agent; Job → `running` → `completed`.  
6. Resultado comunicado; Encerramento; Painel reflecte estados.

**Sucesso:** Job terminal `completed` + mensagem com `jobId`.

### CU2 — Resposta sem Job

1. Intenção deliberada; parecer **sem** necessidade de despacho.  
2. Motor **não** cria Job.  
3. Comunicação via Conversa/Speaker.

**Sucesso:** nenhum `JOB-*` criado indevidamente.

### CU3 — Aprovação rejeitada / adiada

1. Plano requer Gate; patrocinador **rejeita** ou **adia**.  
2. Motor **não** cria Job.  
3. Estado conversacional reflecte a decisão.

**Sucesso:** fila inalterada quanto a esse despacho.

### CU4 — Execução falhada

1. Job criado e despachado.  
2. Agent falha; Job → `failed` com motivo.  
3. Resultado de falha comunicado; Encerramento do ciclo daquele Job.

**Sucesso:** não há `completed` falso.

### CU5 — PC / Dispatcher ausente

1. Job criado → `pending`.  
2. Sem watcher.  
3. Job permanece `pending`; Painel mostra Dispatcher em estado de indisponibilidade (REQ-055).

**Sucesso:** distinção clara entre espera operacional e `failed`.

### CU6 — Parecer CTO sem despacho automático

1. Utilizador consulta CTO (REQ-054).  
2. `ResultadoCto` regressa ao Orquestrador.  
3. **Nenhum** Job criado só por esse resultado.

**Sucesso:** alinhado a REQ-054 NA2 / ARQ-017 CA9.

---

## Restrições

| ID | Restrição |
|----|-----------|
| RES1 | Norma: CON-001; ADR-015; ADR-019; ADR-006 (fluxo REQ→IMP). |
| RES2 | Alinhamento integral à **ARQ-017 homologada**. |
| RES3 | Estados de Job = enum REQ-045; sem estados ad hoc. |
| RES4 | CEO não conhece/nomeia Cursor na publicação (REQ-045/053). |
| RES5 | V1 executor = Agent Cursor local; V3 cloud fora deste REQ. |
| RES6 | Sem implementação até IMP autorizada por etapa. |
| RES7 | Não alterar Constituição, Governança LLM, nem contratos REQ-053/054/055 além do necessário ao fluxo (efeitos do Orquestrador apenas). |
| RES8 | Política de aprovação (lista exacta de gatilhos) deve ser explícita na IMP — mínima na V1: despacho com efeito externo / alteração de código ou docs de produto. |

---

## Fora de Escopo

| ID | Fora | Coberto por / nota |
|----|------|-------------------|
| FE1 | Implementação de código nesta fase | IMP futuro |
| FE2 | Dispatcher 24/7 cloud (máquina off) | Backlog V3 |
| FE3 | Multi-executor (CI, agentes MG2, etc.) | Emenda ARQ/REQ |
| FE4 | Controlo remoto start/stop do watcher na UI | Fora ARQ-016 V1 |
| FE5 | Redesenhar MRE, Speaker ou Conector CTO | ADR-019; ARQ-015 |
| FE6 | RBAC multi-utilizador da fila | Futuro |
| FE7 | Execução directa no repo MG2 pelo browser do CEO | REQ-030 |
| FE8 | Publicação automática de Job a partir de **qualquer** prosa LLM sem política | ARQ-017 NO5 |
| FE9 | Substituir o Painel como canal de intenção | REQ-055 |

---

## Dependências

| Dependência | Papel |
|-------------|--------|
| ARQ-017 | Arquitectura homologada (obrigatória) |
| REQ-045 | Fila e estados de Job |
| REQ-053 | Dispatcher V2 |
| REQ-030 | Fronteira de execução |
| REQ-048 | `acao.job` / parecer |
| REQ-054 | CTO não cria Job automaticamente |
| REQ-055 / ARQ-016 | Monitoramento observacional |
| ADR-019 | MRE delibera |

## Riscos e incertezas

* Política de aprovação demasiado vaga → bypass ou atrito; mitigar com RES8 na IMP.  
* Confusão utilizador entre “CEO disse que fez” e Job `completed` → CA2/CA7.  
* PC off frequente → fila acumulada; aceitável na V1 (RNF3).  
* Tentação de segundo watcher no Orquestrador → RNF5.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 |
| Norma superior | CON-001; ADR-015; ADR-019; REQ-030 |
| Origem | ARQ-017 homologada (01/08/2026) — Motor de Execução |
| Arquitectura | ARQ-017 |
| Decisões derivadas | — |
| Implementação | *— após IMP autorizada* |
| Testes | *— após IMP* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura REQ-056 | Alinhar requisitos ao Motor (ARQ-017) | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação REQ-056 (com IMP-056) | Gate requisitos + implementação | **Homologada** |

---

*Implementação: IMP-056 (E1–E7) — frente encerrada 01/08/2026.*

---

**Gate REQ-056:** Homologada.

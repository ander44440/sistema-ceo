# IMP-056 — Motor de Execução

> **Status: Homologada — frente encerrada** (01/08/2026).  
> Norma: **REQ-056** (homologada); **ARQ-017 v0.1** (homologada).  
> **Natureza:** plano de implementação + execução E1–E7.  
> **Gate técnico:** aprovado pelo patrocinador. Commit/push/deploy autorizados.  
> **Evidências:** `docs/implementation/evidencias/IMP-056-matriz-ca-na.md` · `app/src/motorExecucao/README.md`.

---

## 1. Objetivo

Converter a **REQ-056** / **ARQ-017** num plano executável que materialize o **Motor de Execução** V1: conduzir o ciclo

`Intenção → Plano → Aprovação (quando necessária) → Criação do Job → Dispatcher → Execução → Monitoramento → Resultado → Encerramento`

com rastreabilidade `jobId`, reutilização estrita da Fila (REQ-045) e do Dispatcher V2 (REQ-053), fronteira REQ-030, e sem confundir deliberação MRE com trabalho concluído.

## 2. Escopo

### 2.1 Inclui

* Módulo/capacidade de **condução do fluxo** no Orquestrador (estados do ciclo do Motor, não novos estados de Job).  
* **Política de aprovação** V1 (gatilhos mínimos alinhados a REQ-056 RES8) + Gate na Conversa.  
* Ponte **Parecer / `acao.job` (REQ-048) → publicação Fila** sem nomear executor.  
* Integração de **Resultado + Encerramento** (leitura de Job terminal → mensagem Conversa/Speaker/CN com `jobId`).  
* Garantias de fronteira: Painel e CTO **não** publicam Jobs; Motor **não** duplica Dispatcher.  
* Testes por etapa + documentação operacional mínima do Motor.  
* Matriz CA1–CA11 / NA1–NA3 da REQ-056 → evidências.

### 2.2 Exclui (explícito)

* Alterar enunciados **ARQ-017** ou **REQ-056**.  
* Segundo watcher / segunda fila.  
* Dispatcher cloud V3.  
* Multi-executor além do Agent Cursor.  
* Controlo remoto start/stop do watcher na UI.  
* Execução de código MG2 no browser do CEO.  
* Redesign do MRE, Conector CTO ou Painel (apenas consumir / respeitar).  
* Abrir REQ/ARQ/IMP de outras frentes.

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-017 está **homologada** e é a norma arquitectural do Motor. |
| P2 | REQ-056, após Gate próprio, é a norma de requisitos; este plano assume o enunciado v0.1. |
| P3 | Fila REQ-045 e Dispatcher REQ-053 **já existem** e são as únicas portas de persistência/despacho V1. |
| P4 | MRE produz parecer/`acao`; **não** marca oficina como concluída. |
| P5 | Painel (REQ-055) observa Agent/Dispatcher/Fila — só leitura. |
| P6 | CTO Connector (REQ-054) **não** cria Jobs automaticamente. |
| P7 | Paridade Vite/`server` onde houver superfície HTTP nova (se a IMP o exigir); preferir reutilizar APIs de fila existentes. |
| P8 | Política de aprovação V1 mínima: Gate obrigatório para despacho com efeito externo / alteração de código ou docs de produto (REQ-056 RES8); detalhe fino na E2. |
| P9 | PC off → Jobs ficam `pending` (não `failed` por ausência de watcher). |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-017 | Fluxo, responsabilidades, estados Job, critérios CA arquitecturais |
| REQ-056 | RF/RNF/CA/CU/RES/FE |
| REQ-045 | Publicação e estados `pending`…`cancelled` |
| REQ-053 | Dispatcher; locks; skill de consumo |
| REQ-048 | `acao.job` / tipagem de despacho no parecer |
| REQ-030 | Fronteira de execução |
| REQ-054 / ARQ-015 | Isolamento CTO (sem Job automático) |
| REQ-055 / ARQ-016 | Monitoramento observacional |
| ADR-019 / MRE | Deliberação e plano |
| Núcleo / capacidades `fila`, Conversa, Speaker/CN | Pontos de integração UI/efeito |
| skill `consumir-fila-execucao` | Protocolo do Agent |

## 5. Estratégia de implementação

1. **Domínio do ciclo do Motor primeiro** (estados internos do fluxo + regras de transição) — testável sem UI nova.  
2. **Política de aprovação** antes de ligar publicação automática a partir do parecer.  
3. **Ponte parecer → Job** reutilizando `POST`/capacidade fila existente — zero segundo watcher.  
4. **Resultado/Encerramento** por observação de Job terminal (poll/evento interno), não por “o LLM disse que fez”.  
5. **Fronteiras e regressões** (Painel/CTO/MRE) em testes negativos.  
6. **Gates por etapa E1…:** cada E homologável isoladamente; **sem código** até Gate deste plano + autorização da E.  
7. Preferir **adaptadores finos** sobre reescrita da Fila/Dispatcher.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio do ciclo do Motor

**Objectivo:** modelo canónico in-memory das etapas do fluxo e regras de transição (ARQ-017 §3.4), distinto do enum de Job.

**Entregáveis:**

* Módulo domínio (ex. `motorExecucao/dominio.js` ou equivalente): etapas do ciclo, `validarTransicao`, ligação lógica etapa↔estado Job.  
* Tipos: ciclo (`Intencao`…`Encerramento`), referência opcional a `parecerId` / `jobId`.  
* Testes unitários das regras (ex.: sem aprovação quando exigida → não avança a Criação do Job).

**Critérios de aceite E1:**

* E1-CA1: As nove etapas do fluxo canónico estão representadas e ordenáveis.  
* E1-CA2: Regra “aprovação ausente ⇒ bloqueio antes de Criação do Job” verificada em teste.  
* E1-CA3: Mapeamento documentado etapa → estados Job (REQ-045) sem inventar estados.  
* E1-CA4: Domínio **não** importa UI, Dispatcher SDK, nem escreve na fila.

**Homologação E1:** revisão + testes do domínio. Sem rotas novas obrigatórias.

---

### E2 — Política de Aprovação V1

**Objectivo:** decidir *quando* o Gate humano é obrigatório; estados `aprovado` | `rejeitado` | `adiado`.

**Entregáveis:**

* Função/política pura `exigeAprovacao(contexto)` com gatilhos V1 (RES8): efeito externo; alteração de código/docs de produto; outros gatilhos só se documentados.  
* Contrato mínimo do Gate (entrada: resumo do plano/despacho; saída: decisão).  
* Testes: casos exige=true/false; rejeitado/adiado não publicam Job.

**Critérios de aceite E2:**

* E2-CA1: Despacho classificado como “efeito externo / código ou docs de produto” ⇒ `exigeAprovacao === true`.  
* E2-CA2: Comunicação-only / sem despacho ⇒ não exige aprovação de Job.  
* E2-CA3: Decisão `rejeitado` ou `adiado` impede transição para Criação do Job (teste).  
* E2-CA4: Política **sem** efeitos laterais (não chama Fila).

**Homologação E2:** revisão da tabela de gatilhos + testes. Sem UI obrigatória (pode ser stub de decisão injectável).

---

### E3 — Ponte Parecer / acção → Criação do Job

**Objectivo:** a partir de parecer/`acao` aprovados (ou isentos), publicar Job REQ-045.

**Entregáveis:**

* Adaptador `parecer|acao → payload Job` (titulo, descricao, rastreio `parecerId` se houver).  
* Chamada **única** à API/capacidade de fila existente; **proibido** nomear Cursor no Job.  
* Testes: mock da fila; pacote sem despacho ⇒ zero publicações; com despacho + aprovação ⇒ um `pending`.

**Critérios de aceite E3:**

* E3-CA1: Publicação resulta em Job `pending` via caminho REQ-045.  
* E3-CA2: Job **não** contém referência ao Cursor/executor.  
* E3-CA3: Sem `delegar`/`despachar` (ou equivalente) ⇒ nenhuma publicação.  
* E3-CA4: Rastreio `jobId` ↔ parecer/`acao` quando aplicável.

**Homologação E3:** testes + smoke local de publicação (Job cancelável após teste).

---

### E4 — Integração Orquestrador (Intenção → Plano → Gate → Job)

**Objectivo:** ligar o domínio E1–E3 ao Núcleo/MRE no caminho real de instrução, sem segundo Dispatcher.

**Entregáveis:**

* Pontos de extensão no Orquestrador / capacidade relevante (efeitos pós-parecer).  
* UI mínima de Gate na Conversa **quando** `exigeAprovacao` (aprovar / rejeitar / adiar).  
* Garantia: Motor **não** inicia Agent/SDK.

**Critérios de aceite E4:**

* E4-CA1: Cenário feliz controlado: intenção → plano → (gate se preciso) → Job `pending`.  
* E4-CA2: Nenhum import/uso de `@cursor/sdk` no Motor/Orquestrador deste fluxo.  
* E4-CA3: Painel e rota CTO inalterados quanto a “não publicam Job”.  
* E4-CA4: Falha ao publicar Job não marca o parecer como execução concluída.

**Homologação E4:** smoke conversacional + verificação de ficheiro/API de Job.

---

### E5 — Resultado e Encerramento

**Objectivo:** observar Job terminal e fechar o ciclo no posto de comando.

**Entregáveis:**

* Observador/poller interno (ou hook pós-`PATCH` se já existir caminho) que detecta `completed`|`failed`|`cancelled`.  
* Mensagem ao utilizador (Conversa e/ou Speaker/CN) com `jobId` + síntese do `resultado`.  
* Transição de ciclo do Motor para `Encerramento`; libertar para nova intenção.  
* **Proibido** inferir `completed` só da prosa MRE.

**Critérios de aceite E5:**

* E5-CA1: Job `completed` ⇒ utilizador recebe Resultado com `jobId`.  
* E5-CA2: Job `failed` ⇒ mensagem de falha; estado Job permanece `failed`.  
* E5-CA3: Encerramento só após estado terminal (teste de máquina de estados do ciclo).  
* E5-CA4: Teste negativo: prosa “feito” sem Job terminal **não** dispara Encerramento de execução.

**Homologação E5:** teste automatizado + smoke com Job de teste terminal.

---

### E6 — Fronteiras, degradação e regressões

**Objectivo:** CA/NA de fronteira e comportamento sem Dispatcher.

**Entregáveis:**

* Testes: CTO não cria Job; Painel não cria Job; `pending` sem watcher ≠ `failed`.  
* Checklist operacional: PC off, heartbeat/Painel.  
* Confirmação de que não existe segundo processo watcher introduzido pelo Motor.

**Critérios de aceite E6:**

* E6-CA1: Suite negativa REQ-054/055 (sem publicação indevida) a verde.  
* E6-CA2: Simulação “sem Dispatcher” mantém `pending`.  
* E6-CA3: Inventário de processos: apenas Dispatcher REQ-053 como acordador.  
* E6-CA4: Segredos ausentes em Jobs/mensagens de Resultado (amostra).

**Homologação E6:** relatório de regressão + evidências.

---

### E7 — Documentação, matriz CA REQ-056 e fecho de plano

**Objectivo:** fechar rastreabilidade REQ-056 CA1–CA11 / NA1–NA3; docs mínimas; critérios de commit.

**Entregáveis:**

* README curto do Motor (fluxo, política, portas reutilizadas).  
* Matriz de evidências CA/NA (ficheiro em `docs/implementation/evidencias/`).  
* Actualização de catálogo/Âncora **apenas** no encerramento formal (após Gates de código — não neste plano).

**Critérios de aceite E7:**

* E7-CA1: Cada CA1–CA11 e NA1–NA3 mapeado a evidência (teste, doc ou smoke).  
* E7-CA2: README referencia ARQ-017, REQ-056, REQ-045, REQ-053.  
* E7-CA3: Lista explícita de ficheiros tocados na implementação (para commit futuro).

**Homologação E7:** revisão do pacote de evidências → Gate técnico de implementação (futuro) → só então commit.

---

## 7. Ordem e dependências entre etapas

```text
E1 → E2 → E3 → E4 → E5
                ↘ E6 (pode iniciar após E3; fecha após E5)
E1…E6 → E7
```

Cada etapa exige **homologação interna** (patrocinador ou checklist) antes de avançar código da seguinte.

**Nenhuma etapa de código** começa antes da **homologação deste plano IMP-056**.

## 8. Estratégia de testes

| Tipo | O quê |
|------|--------|
| Unitário | Domínio do ciclo; política `exigeAprovacao`; mapeamento acção→Job |
| Integração | Publicação fila (mock ou temp); observação de Job terminal |
| Negativo | Sem despacho; Gate rejeitado; CTO/Painel sem Job; prosa ≠ completed |
| Regressão | MRE, CTO, Fila API, Painel, Dispatcher inalterados em contrato |
| Manual / smoke | CU1 e CU5 da REQ-056 em ambiente local |
| E2E opcional | Um Job real cancelado/completado em sandbox — só após E4/E5 |

Comando previsto (a criar na implementação): ex. `npm run test:motor` em `app/` (nome exacto na E1).

## 9. Critérios de homologação do **plano** IMP-056 (este documento)

O plano considera-se homologado quando o patrocinador confirmar:

1. Etapas E1–E7 suficientes e na ordem certa.  
2. Reutilização estrita de REQ-045/053 (sem segundo Dispatcher).  
3. Política de aprovação e Resultado/Encerramento cobertos.  
4. Fronteiras REQ-030 / Painel / CTO respeitadas.  
5. Autorização para **iniciar código pela E1** (e só E1) após Gate deste plano **e** após REQ-056 homologada.  
6. Sem alteração a ARQ-017 / REQ-056 neste artefacto (cumprido).

## 10. Critérios de homologação da **implementação** (após código — referência)

* Todas as E homologadas.  
* CA1–CA11 e NA1–NA3 da REQ-056 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke local do CU1 (e CU5 documentado).  
* Relatório técnico de fecho (padrão IMP-054/055).  
* Produção só após commit autorizado.

## 11. Critérios para commit

Commit **só** quando:

1. Gate do plano IMP-056 estiver homologado **e**  
2. REQ-056 estiver homologada **e**  
3. Implementação das etapas autorizadas estiver concluída com Gate técnico de código **e**  
4. Escopo = ficheiros do Motor / integração Orquestrador-Fila (sem BP/PX laterais) **e**  
5. Mensagem de commit referencie REQ-056 / IMP-056 / ARQ-017 **e**  
6. Patrocinador autorizar explicitamente commit/push/deploy.

**Proibido:** commit que altere ARQ-017 ou REQ-056; commit de segundo Dispatcher; commit que faça o Painel ou CTO publicar Jobs; commit parcial que marque execução concluída sem Job terminal.

## 12. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| Motor virar segundo watcher | E4-CA2 / E6-CA3; só REQ-053 |
| Aprovação vaga | E2 + RES8; tabela de gatilhos no Gate E2 |
| “LLM disse feito” = completed | E5-CA4 |
| Scope creep multi-executor | FE REQ-056; fora deste plano |
| Avançar código antes do Gate | Proibição explícita §6 / §9 |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-017 (homologada) — **não alterada por esta IMP** |
| Requisitos | REQ-056 — **não alterada por esta IMP** |
| Capacidade | CAP-11 |
| Peças reutilizadas | REQ-045; REQ-053; REQ-048; REQ-030; REQ-054; REQ-055 |
| Origem | Abertura plano Motor de Execução (01/08/2026) |
| Implementação | *Proibida até Gate deste plano + E autorizada* |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-056 — plano E1–E7 | Materializar Motor sem código nesta fase | Plano aberto |
| 0.2 | 01/08/2026 | Engenheiro (Cursor) | Execução E1–E7 + evidências | Fechar implementação Motor V1 | Aguarda Gate técnico |
| 0.3 | 01/08/2026 | Patrocinador | Homologação IMP-056 | Gate técnico | **Homologada** — commit/push/deploy |

---

*Frente Motor de Execução V1 encerrada após Gate. Código em `app/src/motorExecucao/`.*

---

**Gate IMP-056:** Homologada. Aguardar próximo Gate.

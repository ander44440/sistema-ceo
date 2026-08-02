# IMP-060 — Restauração da Fila Oficial do MVP

> **Status: HOMOLOGADA** (02/08/2026) — frente **ENCERRADA**.  
> **E1–E6:** `docs/implementation/evidencias/IMP-060-E*.md` (+ `IMP-060-E6-homologacao.md`).  
> **Produção:** `docs/implementation/evidencias/IMP-060-homologacao-producao.md`.  
> Norma: **ARQ-021** (homologada); **REQ-060** (homologada); IMP-060.  
> **Capacidade:** CAP-11 — Integrações.  
> **Commit:** `c4abe5ae3a4b7cf713008b8c243b94cd510cc433` · **Vercel:** `dpl_2iR1R7QJkz4u2bbwEKVPdruwpkCm` · **Railway:** `d8cd68e6-038c-443b-95c5-23753abebb14`.

---

## 1. Objetivo

Converter a **ARQ-021** / **REQ-060** num plano executável que **restaure** o invariante do MVP:

```text
CEO publica → executive/queue (PC) → Dispatcher local → Agent
```

de forma que **produtor e consumidor** usem a **mesma** fila oficial; que a fila Railway **deixe** de ser fonte de verdade do ciclo Job; e que o **BP-001** continue a servir LLM/API online **sem** usurpar a fila.

## 2. Escopo

### 2.1 Inclui

* Inventário dos pontos que publicam / listam Jobs via API Railway (`POST/GET /api/ceo/queue/*` + `VITE_CEO_API_BASE`).  
* Redireccionamento da **publicação oficial** para a fila `executive/queue` local, **preservando** o contrato do Motor (`publicarJob` / handoff lógico).  
* Confirmação de que o Dispatcher consome **exclusivamente** essa fila.  
* Despromoção da fila Railway como fonte de verdade do ciclo `pending` → `running` → `completed` / `failed`.  
* Actualização de indicadores / Estado Executivo / Painel para reflectirem a fila oficial.  
* Plano de homologação com cenários de teste obrigatórios (E6).  
* Testes e Gates E1…E6 homologáveis isoladamente.  
* Documentação mínima e evidências CA/NA da REQ-060 (fecho).

### 2.2 Exclui (explícito)

* **Implementar código** neste artefacto / nesta fase de abertura do plano.  
* Alterar enunciados **ARQ-021** ou **REQ-060**.  
* Redesign do **Motor**, **Continuidade do Gate**, **Classificador** ou **Consciência Operacional** (REQ-060 RF9).  
* Dispatcher cloud 24/7 / filas cloud (REQ-060 RF12 / NA3).  
* Sincronização bidireccional Railway ↔ PC como solução MVP (REQ-060 FE5).  
* Limpeza obrigatória de Jobs órfãos já existentes em Railway (REQ-060 FE4 — opcional operacional).  
* Abrir frentes laterais (BP/PX, novas ARQ/REQ).  
* Commit / push / deploy nesta fase.

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-021 está **homologada** e define a fila oficial + convivência com BP-001. |
| P2 | REQ-060, após Gate próprio, é a norma de requisitos; este plano **não** a altera. |
| P3 | REQ-045 e REQ-053 permanecem vigentes; este IMP **restaura conformidade**. |
| P4 | Motor (IMP-056 / REQ-056) continua a usar porta injectável `publicarJob` — **sem** redesign do ciclo. |
| P5 | Dispatcher actual (`executive/dispatcher`) **já** lê `executive/queue` local — E3 é verificação + reforço, não reescrita do protocolo Agent. |
| P6 | O desvio actual é o cutover BP-001 E8 (`VITE_CEO_API_BASE` → Railway) no caminho da fila. |
| P7 | BP-001 permanece para LLM / health / CORS / serviços online (REQ-060 RF6). |
| P8 | Handoff oficial só é válido se o Job existir na fila oficial (REQ-060 RF5). |
| P9 | Gates por etapa: **sem código** até Gate deste plano + autorização explícita da E. |
| P10 | Continuidade do Gate, Classificador e Consciência: **regressão**, não redesign. |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-021 | Invariante; §2.1–2.6; CA-ARQ-021 — **não alterar** |
| REQ-060 | RF/RNF/CA/CU/RES/FE — **não alterar** |
| REQ-045 / REQ-053 | Fila local; Dispatcher local |
| ARQ-017 / REQ-056 / IMP-056 | Motor — porta `publicarJob`; handoff lógico |
| ARQ-019 / REQ-058 / IMP-058 | Continuidade do Gate — regressão |
| ARQ-018 / REQ-057 / IMP-057 | Classificador — regressão |
| ARQ-020 / REQ-059 / IMP-059 | Consciência — ler fila oficial |
| ARQ-016 / REQ-055 / IMP-055 | Painel / coletores de Jobs |
| BP-001 | Fronteira LLM vs fila |
| `filaCliente.js` / `ceoApiBase.js` | Cutover actual |
| `executive/dispatcher` | Consumidor |
| CON-001 / ADR-015 | Tempo do utilizador; uso diário no PC |

## 5. Estratégia de implementação

1. **Mapear** todos os produtores/listadores que batem na fila Railway (E1).  
2. **Redireccionar publicação** oficial para a fila local, mantendo assinatura `publicarJob` do Motor (E2).  
3. **Confirmar / reforçar** consumo exclusivo do Dispatcher na mesma pasta (E3).  
4. **Despromover** Railway `/queue/*` como fonte de verdade do ciclo Job; BP-001 só serviços online (E4).  
5. **Alinhar** Painel / Consciência / indicadores à fila oficial (E5).  
6. **Homologar** com cenários E6 + matriz CA/NA REQ-060.  
7. **Gates** entre etapas; código só após autorização; commit só com autorização explícita do patrocinador.

**Invariante de fecho (obrigatório em todas as E de código):**

```text
Job oficial MVP ∈ executive/queue (PC)
  ∧ Dispatcher observa a mesma pasta
  ∧ Railway ≠ fonte de verdade do ciclo Job
```

---

## 6. Etapas (granulares e homologáveis)

### E1 — Mapear publicações / listagens via API Railway

**Objectivo:** inventário completo e verificável de todos os pontos que publicam, listam ou actualizam Jobs através de `POST|GET|PATCH /api/ceo/queue/*` (especialmente com `VITE_CEO_API_BASE` → Railway).

**Entregáveis:**

* Documento de inventário (secção nesta IMP ou `docs/implementation/evidencias/IMP-060-E1-inventario.md`):  
  - ficheiro / função / chamada HTTP  
  - se usa `ceoApiUrl` / `publicarJobFila` / `listarJobsPendentes` / capacidade `fila` / coletores do Painel / Consciência  
  - ambiente (dev Vite vs produção Vercel)  
  - destino efectivo (plugin local vs Railway).  
* Diagrama textual: caminho actual vs caminho alvo (ARQ-021).  
* Lista de «deve mudar» vs «deve permanecer» (LLM, health, heartbeat).

**Critérios de aceite E1:**

* E1-CA1: Todos os pontos de `publicarJobFila` / `POST …/queue/jobs` no cliente estão inventariados.  
* E1-CA2: Todos os pontos de listagem oficial de Jobs do MVP (Painel, Consciência, capacidade fila) estão inventariados.  
* E1-CA3: Distinção clara: rotas BP-001 a **preservar** (LLM, etc.) vs rotas de fila a **despromover**.  
* E1-CA4: Sem alteração de código de produto nesta E (só inventário / evidência).

**Homologação E1:** Gate sobre o inventário. Sem redireccionamento ainda.

---

### E2 — Redireccionar publicação para a fila oficial (`executive/queue` local)

**Objectivo:** todo Job criado pelo fluxo oficial do CEO é persistido em `executive/queue/JOB-*.json` no PC, **preservando** o contrato do Motor (`deps.publicarJob` / `criarJobDoParecer` / handoff lógico).

**Entregáveis:**

* Alteração do caminho de publicação oficial (mecanismo a escolher na execução, desde que cumpra REQ-060 RF1–RF5 / RF7), por exemplo:  
  - publicação via API/plugin **local** que escreve no disco do PC; e/ou  
  - desligar cutover de fila (`VITE_CEO_API_BASE` **não** prefixa `/api/ceo/queue/*` em produção); e/ou  
  - companion local — **decisão fina na execução da E2**, documentada na evidência.  
* Garantia: Motor continua a chamar a mesma porta `publicarJob`; **sem** mudar etapas do ciclo Motor.  
* RF5: metadado/prosa de «Job criado» / «Handoff ao Dispatcher» só se o ficheiro existir na fila oficial.  
* Testes: publicação → ficheiro `pending` em `executive/queue`; Motor/Continuidade regressão mínima.

**Critérios de aceite E2:**

* E2-CA1: Fluxo oficial C3/Gate → Job `pending` em `executive/queue` no PC (REQ-060 CA2 / CU1).  
* E2-CA2: Contrato do Motor (`publicarJob` injectável / ciclo) **preservado** (REQ-060 RF9 / CA8).  
* E2-CA3: Sem declaração oficial de handoff sem artefacto local (REQ-060 RF5 / CA5).  
* E2-CA4: Continuidade do Gate + Classificador: regressão verde (sem redesign).

**Homologação E2 (Gate):** revisão + testes de publicação local. **Não** avançar E3 em código sem este Gate.

---

### E3 — Dispatcher consome exclusivamente a fila oficial

**Objectivo:** garantir (e documentar) que o Dispatcher V2 observa **só** `executive/queue` (ou API local da **mesma** pasta) — REQ-060 RF3 / CA3.

**Entregáveis:**

* Verificação do `queueDir` em `executive/dispatcher` (já alinhado a REQ-053).  
* Confirmação: **nenhuma** chamada do Dispatcher à Railway `/api/ceo/queue/*`.  
* Teste/smoke: Job `pending` local → watcher deteta → (dry-run ou once) sem depender da API remota.  
* Reforço documental operacional (README dispatcher) se necessário.  
* Se houver lacuna: correcção mínima **só** no Dispatcher/paths — sem alterar Motor/Gate/Classificador/Consciência.

**Critérios de aceite E3:**

* E3-CA1: Dispatcher lê exclusivamente a fila oficial local (REQ-060 RF3).  
* E3-CA2: Job publicado na E2 é visível ao `listarPendentes` / ciclo do Dispatcher.  
* E3-CA3: Dispatcher **não** lista pendentes da fila Railway como fonte oficial.  
* E3-CA4: REQ-053 / lock / heartbeat local preservados.

**Homologação E3 (Gate):** evidência de consumo na mesma pasta. **Não** avançar E4 sem este Gate.

---

### E4 — Remover Railway como fonte de verdade do ciclo Job (BP-001 só online)

**Objectivo:** despromover `/api/ceo/queue/*` no host Railway como produtor/fonte de verdade do ciclo Job MVP; manter BP-001 para LLM e serviços online (REQ-060 RF6–RF7 / CA6–CA7).

**Entregáveis:**

* Política implementada: publicação/listagem **oficial** do ciclo MVP **não** usa Railway queue como canónica.  
* Rotas Railway de fila: desactivadas, rejeitadas com mensagem clara, ou marcadas non-official / não usadas pelo cliente MVP — escolha na execução, documentada.  
* `VITE_CEO_API_BASE` continua a poder apontar LLM/outras rotas para Railway **sem** prefixar o ciclo oficial de Jobs (ou equivalente que cumpra o invariante).  
* Smoke: `GET /health` + LLM deliberação via Railway OK; Jobs oficiais só locais.  
* Nota operacional sobre Jobs órfãos já existentes em Railway (não misturar com fila local).

**Critérios de aceite E4:**

* E4-CA1: Publicação oficial MVP **não** destino Railway `/queue/jobs` (REQ-060 CA6).  
* E4-CA2: BP-001 LLM/health operacionais (REQ-060 CA7).  
* E4-CA3: Ciclo Job oficial independente da fila Railway (REQ-060 NA1).  
* E4-CA4: Documentação de fronteira BP-001 vs fila MVP actualizada (mínimo).

**Homologação E4 (Gate):** smoke BP-001 + ausência de publicação oficial remota. **Não** avançar E5 sem este Gate.

---

### E5 — Indicadores e Estado Executivo na fila oficial

**Objectivo:** Painel de Orquestração, coletores de Jobs e Consciência Operacional reflectem a **fila oficial** (REQ-060 RF8 / CA9) — **sem** redesign dos módulos (só fontes de leitura).

**Entregáveis:**

* Coletores / leitores de Jobs (Painel, Consciência, capacidade `fila` de listagem) apontam para a fila oficial local (ou API local da mesma pasta).  
* Agent «Aguardando / Há trabalho na fila» baseado em `pending` **locais**, não na contagem Railway.  
* Heartbeat Dispatcher → API remota **pode** permanecer (observabilidade); separado da fonte de Jobs.  
* Testes de regressão Consciência (IMP-059) e Painel (IMP-055) com mocks da fila oficial.  
* **Proibido:** mutar contratos do Motor/Gate/Classificador; Consciência permanece read-only.

**Critérios de aceite E5:**

* E5-CA1: Sinais oficiais de Jobs do MVP = fila oficial (REQ-060 RF8 / CA9).  
* E5-CA2: Consciência não mistura Railway vs local como uma só fonte (REQ-060 CA9).  
* E5-CA3: Painel reflecte pending/running coerentes com `executive/queue` local (quando o PC/API local está acessível; senão degradação transparente).  
* E5-CA4: Regressão Consciência / Painel / Classificador / Continuidade — suite relevante verde.

**Homologação E5 (Gate):** indicadores alinhados. **Não** fechar IMP sem E6.

---

### E6 — Plano de homologação (cenários de teste)

**Objectivo:** definir e, na execução, executar o plano de homologação que prova REQ-060 CA1–CA10 / CU1–CU6 e o invariante ARQ-021.

**Entregáveis:**

* Matriz de cenários (abaixo) com procedimento, resultado esperado e evidência.  
* Evidência consolidada (`IMP-060-matriz-ca-na.md` / relatório) **após** execução das E2–E5.  
* README mínimo da restauração (referência ARQ-021, REQ-060, REQ-045, REQ-053, BP-001).

#### Cenários de teste obrigatórios

| ID | Cenário | Esperado |
|----|---------|----------|
| T1 | **Criação de Job** (fluxo oficial C3 / pós-Gate) | `JOB-*.json` criado em `executive/queue` com `pending` |
| T2 | **pending** | Job listado como pendente **só** na fila oficial; Dispatcher consegue vê-lo |
| T3 | **running** | Transição reflectida no ficheiro local; Painel/sinais coerentes |
| T4 | **completed** | Estado terminal no ficheiro local; ciclo oficial fechado |
| T5 | **failed** | Estado `failed` + `resultado` no ficheiro local |
| T6 | **Continuidade após Gate** | Aprovado → Job na fila oficial → handoff válido; rejeitado → sem Job oficial |
| T7 | **Dispatcher** | Watcher local consome pending da mesma pasta; sem Railway queue |
| T8 | **Painel de Orquestração** | Nós Agent/Dispatcher/Fila reflectem fila oficial / heartbeat; sem pending Railway fantasma como oficial |

**Critérios de aceite E6:**

* E6-CA1: T1–T8 executados com evidência (pass/fail registado).  
* E6-CA2: Matriz CA1–CA10 / NA1–NA5 da REQ-060 coberta.  
* E6-CA3: Documentação mínima (REQ-060 CA10).  
* E6-CA4: Nenhuma regressão aberta em Motor / Gate / Classificador / Consciência atribuível a esta IMP.

**Homologação E6 (Gate final do plano de testes):** patrocinador homologa evidências. Commit/push/deploy **só** com autorização explícita posterior.

---

## 7. Ordem e dependências entre etapas

```text
E1 (inventário)
  → Gate E1
  → E2 (publicação local)     ← Gate
  → E3 (Dispatcher)           ← Gate
  → E4 (despromover Railway queue / BP-001)  ← Gate
  → E5 (indicadores / Consciência / Painel) ← Gate
  → E6 (homologação / cenários T1–T8)
  → Gate final + autorização de commit
```

Cada etapa de **código** exige Gate da anterior. E1 pode ser só documental.

## 8. Estratégia de testes

| Tipo | O quê |
|------|--------|
| Unitário / integração | Publicação → ficheiro local; porta Motor `publicarJob` |
| Negativo | Handoff sem artefacto local proibido; Railway ≠ oficial |
| Regressão | Motor, Continuidade, Classificador, Consciência, Painel |
| Smoke BP-001 | Health + LLM via Railway |
| Operacional | Dispatcher dry-run/once + T1–T8 |
| Manual | Produção/local conforme E6 |

Comandos previstos (na execução): ex. `npm run test:…` a definir por E; smoke Dispatcher `npm run dry-run` em `executive/dispatcher`.

## 9. Critérios de homologação do **plano** IMP-060

O plano considera-se homologado quando o patrocinador confirmar:

1. Etapas E1–E6 suficientes e na ordem certa.  
2. Invariante produtor = consumidor = `executive/queue` coberto.  
3. BP-001 delimitado; Motor/Gate/Classificador/Consciência preservados.  
4. Cenários T1–T8 adequados.  
5. Autorização para **iniciar código pela E1** (inventário) após Gate deste plano **e** após **REQ-060 homologada**.  
6. Sem alteração a ARQ-021 / REQ-060 neste artefacto (cumprido).

## 10. Critérios de homologação da **implementação** (após código)

* Todas as E homologadas com Gates.  
* CA1–CA10 / NA1–NA5 da REQ-060 com evidência.  
* T1–T8 pass.  
* Suites de regressão relevantes verdes.  
* Relatório técnico de fecho.  
* Produção só após commit autorizado.

## 11. Critérios para commit

Commit **só** quando:

1. Gate do plano IMP-060 homologado **e**  
2. REQ-060 homologada **e**  
3. E autorizadas concluídas com Gates **e**  
4. Escopo = restauração da fila (sem laterais) **e**  
5. Mensagem referencia REQ-060 / IMP-060 / ARQ-021 **e**  
6. Patrocinador autorizar explicitamente commit/push/deploy.

**Proibido:** commit que torne Railway a fila oficial; commit que redesenhe Motor/Gate/Classificador/Consciência; commit com sync silencioso Railway→PC como «MVP».

## 12. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| SPA Vercel sem disco local | E2 deve escolher mecanismo que escreva no PC; RF5 |
| Dual-run confuso | E1 inventário; E4 cutover; E6 T1–T8 |
| Jobs órfãos Railway | E4 nota operacional; não misturar IDs |
| Scope creep sync cloud | FE5 / P9 — fora |
| Regressão Painel | E5 + heartbeat ≠ fila |
| Avançar código antes do Gate | §9 / §11 |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-021 (homologada) — **não alterada** |
| Requisitos | REQ-060 — **não alterada** por este plano |
| Reafirmados | REQ-045; REQ-053 |
| Preservados | REQ-056; REQ-057; REQ-058; REQ-059 |
| Fronteira | BP-001 |
| Capacidade | CAP-11 |
| Origem | Gate ARQ-021; abertura plano IMP-060 |
| Implementação | E1–E6 executadas; evidências em `docs/implementation/evidencias/IMP-060-*` |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-060 — plano E1–E6 | Materializar ARQ-021 / REQ-060 sem código | Plano aberto — aguarda Gate |
| 0.2 | 01/08/2026 | Engenheiro (Cursor) | E1–E6 executadas | Restaurar invariante fila oficial | Recomendação HOMOLOGAR (E6) |
| 0.3 | 02/08/2026 | Engenheiro (Cursor) | Encerramento autorizado — commit/push/deploy | Ordem do patrocinador | Commit `c4abe5a` |
| 1.0 | 02/08/2026 | Engenheiro (Cursor) | Homologação em produção + fecho | Smoke API 410 + SPA READY | **HOMOLOGADA — frente encerrada** |

---

**IMP-060 HOMOLOGADA e ENCERRADA.** Nenhuma nova frente após este encerramento.

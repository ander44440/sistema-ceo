# IMP-059 — Consciência Operacional

> **Status: Homologada — frente encerrada** (01/08/2026).  
> Norma: **REQ-059** (homologada); **ARQ-020 v0.1** (homologada) — **não alteradas no conteúdo normativo além do status**.  
> **Natureza:** plano + execução E1–E7.  
> **Gate técnico:** aprovado pelo patrocinador. Commit/push/deploy autorizados.  
> **Fecho:** `docs/implementation/evidencias/IMP-059-relatorio-consolidado.md` · matriz CA/NA.

---

## 1. Objetivo

Converter a **REQ-059** / **ARQ-020** num plano executável que materialize a **Consciência Operacional** V1: antes de respostas substantive a intenções **C2** ou **C3**, o CEO **consulta** o **Estado Executivo Atual** (fontes mínimas F1–F8), **sintetiza** conflitos/ocupação com prioridade ARQ-020 §5, e **influencia a prosa / recomendação / aviso** — **sem** alterar o fluxo do Motor, **sem** criar Jobs durante a consulta, e **sem** competir com a Continuidade do Gate (ARQ-019 / REQ-058) quando o léxico de decisão consome a mensagem.

## 2. Escopo

### 2.1 Inclui

* Domínio do **Estado Executivo Atual** (snapshot F1–F8 + conflitos derivados).  
* **Agregador** somente leitura das fontes (Fila, Gates/Continuidade, Dispatcher, CTO, Agent, Painel, frente activa).  
* **Consulta obrigatória** no caminho C2/C3 (após Classificador; após Continuidade se aplicável).  
* Integração Conversa / Núcleo (lastro injectado na deliberação / prosa).  
* Respostas contextualizadas (RF4–RF7; exemplo canónico ARQ-020 §3.3).  
* Fronteiras, regressões e modo somente leitura (E6).  
* Documentação mínima e evidências CA/NA da REQ-059 (E7).  
* Testes por etapa; Gates E1…E7 homologáveis isoladamente.

### 2.2 Exclui (explícito)

* **Implementar código** neste artefacto / nesta fase de abertura.  
* Alterar enunciados **ARQ-020** ou **REQ-059**.  
* Abrir novas frentes (REQ/ARQ/IMP laterais; BP/PX; Emenda E2.1; etc.).  
* UI dedicada de Consciência (REQ-059 FE2 / RNF8).  
* Redesign do Motor, Classificador, Continuidade, Fila, Dispatcher ou Painel — apenas **ler** sinais existentes.  
* Obrigar consulta em C1/C4 (REQ-059 NA3).  
* Auto-aprovação de Gate ou publicação de Job pela Consciência.  
* Commit/push/deploy nesta fase.

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-020 está **homologada** e é a norma arquitectural da Consciência Operacional. |
| P2 | REQ-059, após Gate próprio, é a norma de requisitos; este plano assume o enunciado v0.1 **sem o alterar**. |
| P3 | Classificador (IMP-057 / REQ-057) **já existe** e produz C1–C4. |
| P4 | Continuidade do Gate (IMP-058 / REQ-058) **já existe** e tem **precedência** sobre deliberação consciente (RF8 / CA8). |
| P5 | Motor (IMP-056 / REQ-056) é **soberano** do ciclo; Consciência **não** muta etapas nem Gates. |
| P6 | Fila (REQ-045), Dispatcher (REQ-053), CTO (REQ-054), Painel (REQ-055 / ARQ-016) e Agent são **fontes observáveis** (leitura). |
| P7 | Consciência é **somente leitura** (RF9 / CA5): zero Jobs criados pela consulta; zero decisões de Gate; sem `@cursor/sdk` (REQ-030). |
| P8 | Prioridade de foco: Gates → Jobs running → Jobs pending → Agent/Dispatcher → CTO → Painel → Frente (RF11 / ARQ-020 §5). |
| P9 | Em C3, Consciência **avisa**; o Motor decide o avanço (RF10) — sem bloqueio mecânico salvo clarificação autorizada na E correspondente. |
| P10 | Gates por etapa: **sem código** até Gate deste plano + autorização explícita da E. |
| P11 | Degradação: falha de fonte → omitir/transparência; **não** inventar Jobs/Gates (RNF4 / NA4). |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-020 | Fluxo, fontes F1–F8, prioridade, critérios CA — **não alterar** |
| REQ-059 | RF/RNF/CA/CU/RES/FE — **não alterar** |
| ARQ-018 / REQ-057 / IMP-057 | Classificador; gatilho C2/C3 |
| ARQ-019 / REQ-058 / IMP-058 | Continuidade do Gate — precedência |
| ARQ-017 / REQ-056 / IMP-056 | Motor — fonte de ciclo/Gate; **não mutar fluxo** |
| REQ-045 / REQ-053 | Jobs / Dispatcher (leitura) |
| REQ-054 / REQ-055 / ARQ-016 | CTO / Painel (leitura) |
| Frente activa / COA | Fonte F8 |
| REQ-030 | Fronteira oficina |
| Conversa / Núcleo (`executiveEngine`) | Ponto de injecção do lastro |
| Speaker / CN | Prosa com lastro (sem deliberar Gate) |
| CON-001 / ADR-015 | Contexto; tempo do utilizador; uso diário |

## 5. Estratégia de implementação

1. **Domínio primeiro** — modelo do Estado Executivo Atual (F1–F8 + conflitos); testável sem Conversa.  
2. **Agregador** — funções somente leitura que montam o snapshot a partir das fontes existentes (mocks nos testes).  
3. **Gancho de consulta** — após Classificador = C2/C3 (e Continuidade não consumiu): obrigar `consultarEstadoExecutivo` antes da resposta substantive.  
4. **Integração** — injectar lastro no caminho Conversa→Núcleo/MRE/Speaker sem alterar Motor/Fila.  
5. **Contextualização** — regras RF4–RF7 / prioridade §5 na prosa (1–3 frases; exemplo §3.3).  
6. **Fronteiras** — read-only, sem Job novo, sem SDK, regressão Continuidade/Classificador/Motor.  
7. **Evidências** — matriz CA/NA REQ-059 + README operacional mínimo.  
8. **Gates E1…E7** — cada E homologável isoladamente; código só após Gate deste plano + autorização da E.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio do Estado Executivo

**Objectivo:** modelo canónico in-memory do Estado Executivo Atual alinhado a ARQ-020 §4 / REQ-059 RF2.

**Entregáveis:**

* Módulo domínio (ex. `conscienciaOperacional/dominio.js` ou equivalente):  
  - estrutura do snapshot: `jobsPendentes`, `jobsEmExecucao`, `gatesPendentes`, `dispatcher`, `cto`, `agent`, `painel`, `frenteActiva`  
  - `conflitosFoco[]` derivados (opcional V1, tipados)  
  - validadores / helpers (`temContextoOperacionalRelevante`, `priorizarFontes`)  
  - enum/ordem de prioridade P1–P7 (ARQ-020 §5).  
* Testes unitários do domínio (oito fontes representadas; prioridade; snapshot vazio = sem contexto relevante).

**Critérios de aceite E1:**

* E1-CA1: As oito fontes mínimas (RF2 / CA7) estão no modelo V1.  
* E1-CA2: Prioridade P1–P7 alinhada a ARQ-020 §5 / RF11.  
* E1-CA3: Snapshot vazio / irrelevante → `temContextoOperacionalRelevante === false` (base RF7).  
* E1-CA4: Domínio **sem** I/O, UI, Fila real, Motor, Classificador ou SDK.

**Homologação E1:** revisão + testes do domínio. Sem integração Conversa.

---

### E2 — Agregador de Consciência Operacional

**Objectivo:** montar o Estado Executivo Atual a partir das fontes existentes, em modo **somente leitura**.

**Entregáveis:**

* Agregador puro/orquestrado (ex. `conscienciaOperacional/agregarEstado.js`):  
  - leitores injectáveis (Fila, Continuidade/Gate, Dispatcher, CTO, Agent, Painel, frente)  
  - degradação por fonte (RNF4): falha → omissão/transparência, sem inventar  
  - saída: snapshot domínio E1 + metadado `consultadoEm` / flag de diagnóstico (RNF3).  
* Testes com mocks de fontes (ocupado / ocioso / falha parcial).

**Critérios de aceite E2:**

* E2-CA1: Agregação produz snapshot válido com as oito fontes (presentes ou explicitamente ausentes).  
* E2-CA2: Falha de uma fonte **não** inventa Jobs/Gates (NA4).  
* E2-CA3: Agregador **não** publica Job, **não** chama Motor para mutar ciclo, **não** decide Gate.  
* E2-CA4: Sem `@cursor/sdk` / sem escrita na Fila.

**Homologação E2:** revisão + testes do agregador com mocks.

---

### E3 — Consulta obrigatória antes de responder C2/C3

**Objectivo:** tornar a consulta ao Estado Executivo **obrigatória** no caminho C2/C3 (RF1 / CA6).

**Entregáveis:**

* API de consulta (ex. `consultarEstadoExecutivoAntesDeResponder`):  
  - pré-condição: classe = C2 ou C3  
  - invoca agregador E2  
  - regista indício de consulta (metadado/flag)  
  - C1/C4: **não** obrigatório (NA3).  
* Testes: C2/C3 → consulta ocorre; C1 → sem obrigação; ordem face a Continuidade documentada (RF8).

**Critérios de aceite E3:**

* E3-CA1: Em C2 e C3, a consulta ocorre **antes** da resposta substantive (RF1 / CA6).  
* E3-CA2: C1/C4 não falham por ausência de consulta obrigatória.  
* E3-CA3: Se Continuidade consumiu a mensagem (léxico Gate), Consciência deliberativa **não** substitui (RF8 / CA8) — contrato documentado + teste de ordem.  
* E3-CA4: Consulta em si **não** cria Job (CA4).

**Homologação E3:** revisão + testes do gancho de consulta (ainda sem prosa final).

---

### E4 — Integração com Conversa/Núcleo

**Objectivo:** integrar a Consciência no caminho Conversa → Núcleo / `executiveEngine`, injectando lastro sem mutar Motor/Fila.

**Entregáveis:**

* Ponto de integração (após Classificador; após Continuidade se aplicável):  
  - C2/C3 → consultar → passar lastro ao Núcleo/MRE/Speaker  
  - isolamento: integração **não** chama publicação de Job nem `conduzirAposDecisaoGate`  
* Testes de integração com mocks (Conversa → lastro presente no contexto da resposta).

**Critérios de aceite E4:**

* E4-CA1: Mensagem C2/C3 no caminho real/mock recebe lastro de Estado Executivo.  
* E4-CA2: Fluxo do Motor (etapas) **inalterado** por efeito da integração (RF3).  
* E4-CA3: Contagem de Jobs na Fila **inalterada** pela consulta/integração (CA4 / CA5).  
* E4-CA4: «Aprovado.» com Gate pendente continua a ser consumido pela Continuidade (CA8) — regressão IMP-058.

**Homologação E4:** revisão + testes de integração; sem exigir prosa canónica completa (E5).

---

### E5 — Respostas contextualizadas pelo Estado Executivo

**Objectivo:** garantir que o estado **influencia** a resposta quando relevante (RF3–RF7; CA1–CA3).

**Entregáveis:**

* Regras / formatação de lastro na prosa (1–3 frases — RNF1):  
  - Job `running` relacionado → mencionar execução (RF4 / CA1; exemplo ARQ-020 §3.3)  
  - Gate pendente relacionado → priorizar continuidade (RF5 / CA2)  
  - sem contexto relevante → resposta normal (RF7 / CA3)  
  - prioridade P1–P7 na resolução de conflitos (RF11)  
* Em C3: aviso operacional sem bloquear mecanicamente o Motor (RF10), salvo clarificação explícita se autorizada nesta E.  
* Testes / fixtures dos CU1–CU3 e CU6 da REQ-059.

**Critérios de aceite E5:**

* E5-CA1: CU1 — Job em execução influencia a resposta (CA1).  
* E5-CA2: CU2 — Gate pendente tem prioridade na prosa deliberativa (CA2).  
* E5-CA3: CU3 — sem contexto → resposta normal (CA3).  
* E5-CA4: Estado relevante **não** é ignorado (RF6); prosa sem dump da fila (RNF1).  
* E5-CA5: Credenciais ausentes do lastro/prosa (RNF2).

**Homologação E5:** revisão + testes CU1–CU3 (+ CU6 se aplicável).

---

### E6 — Fronteiras, regressões e modo somente leitura

**Objectivo:** provar fronteiras REQ-059 / ARQ-020 e regressões IMP-056/057/058.

**Entregáveis:**

* Suite de fronteiras:  
  - somente leitura (CA5 / NA1 / NA2)  
  - zero Job criado na consulta (CA4 / CU4)  
  - sem SDK (CA9)  
  - Continuidade não substituída (CA8 / CU5)  
  - Classificador não reclassificado pela Consciência (RNF5)  
  - Motor sem mutação de fluxo (RF3 / RNF7)  
  - C1/C4 sem obrigação (NA3)  
  - falha de fonte sem inventar (NA4)  
* Regressões smoke: Classificador C1–C4; Continuidade «Aprovado.»; ciclo Motor básico.

**Critérios de aceite E6:**

* E6-CA1: CA4 e CA5 verificados (sem Job novo; read-only).  
* E6-CA2: CA8 / CU5 — léxico Gate não vira deliberação C2.  
* E6-CA3: CA9 — código da Consciência sem `@cursor/sdk` / sem publish Fila.  
* E6-CA4: Regressão IMP-057 (Classificador) e IMP-056 (Motor) sem quebra intencional.  
* E6-CA5: NA1–NA4 cobertos por teste ou evidência explícita.

**Homologação E6:** suite de fronteiras a verde + revisão de diffs (sem frentes laterais).

---

### E7 — Documentação e evidências

**Objectivo:** fechar rastreabilidade documental da implementação (após código autorizado nas E anteriores).

**Entregáveis:**

* README operacional mínimo do módulo Consciência Operacional.  
* Matriz CA/NA REQ-059 com ponteiros a testes/commits.  
* Evidências por etapa (`IMP-059-E1` … `E7`) e relatório consolidado (padrão IMP-058).  
* Actualização de catálogo `docs/README.md` (linhas IMP/evidências) — **sem** alterar texto normativo de ARQ-020 / REQ-059.

**Critérios de aceite E7:**

* E7-CA1: CA10 REQ-059 (docs referenciam ARQ-020, REQ-059, Classificador, Continuidade, Motor, Fila/Dispatcher).  
* E7-CA2: Matriz CA/NA preenchida com ponteiros a testes/commits (quando houver).  
* E7-CA3: Relatório de fecho no padrão IMP-055…058.  
* E7-CA4: Nenhum diff normativo em **ARQ-020** nem **REQ-059**.

**Homologação E7:** revisão documental + Gate de fecho da implementação (após código autorizado).

---

## 7. Estratégia de testes

| Camada | O quê | Quando |
|--------|-------|--------|
| Unitário domínio (E1) | F1–F8, prioridade, snapshot vazio | E1 |
| Unitário agregador (E2) | Mocks fontes; falha parcial; read-only | E2 |
| Unitário consulta (E3) | C2/C3 obrigatório; C1 opcional; ordem Continuidade | E3 |
| Integração (E4) | Conversa→Núcleo com lastro; Fila/Motor inalterados | E4 |
| Contextualização (E5) | CU1–CU3, CU6; exemplo §3.3 | E5 |
| Fronteiras (E6) | CU4–CU5; CA4/CA5/CA8/CA9; NA; regressões | E6 |
| Smoke manual (pós-código) | Job running + «Como priorizar MG2?» → menciona execução; Gate pendente deliberativo → remete Gate; fila ociosa → C2 normal | Após E5+E6 |

**Script sugerido (após autorização de código):** `npm run test:consciencia-operacional` (ou suite equivalente no `app/`).

**Princípio:** preferir funções puras e mocks de Fila/Motor/Continuidade; **nunca** Agent real / SDK nos testes automatizados; **nunca** mutar Fila no assert de consulta.

## 8. Critérios de homologação

### 8.1 Homologação deste **plano** (Gate actual)

A IMP-059 v0.1 considera-se **homologada como plano** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Premissas e dependências §3–§4 aceites.  
3. Estratégia §5 e etapas E1–E7 §6 suficientes.  
4. Critérios de aceite por etapa verificáveis.  
5. Estratégia de testes §7 adequada.  
6. Critérios de commit §9 claros.  
7. Autorização explícita para **iniciar código** na E1 (ou na E indicada) — **não** implícita nesta abertura.  
8. Confirmação de que **ARQ-020** e **REQ-059** permanecem **intocadas** no conteúdo normativo.

### 8.2 Homologação da **implementação** (após código — referência)

* Todas as E1–E7 homologadas.  
* CA1–CA10 e NA1–NA4 da REQ-059 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke local CU1 + CU2 + CU3 (+ CU4 read-only).  
* Relatório técnico de fecho.  
* Produção só após commit autorizado.

## 9. Critérios para commit

Commit **só** quando:

1. Gate do **plano** IMP-059 estiver homologado **e**  
2. REQ-059 estiver **homologada** **e**  
3. Implementação das etapas autorizadas estiver concluída com Gate técnico de código **e**  
4. Escopo = ficheiros da Consciência Operacional / integração Conversa–Núcleo (leitura de fontes) — **sem** frentes laterais **e**  
5. Mensagem de commit referencie REQ-059 / IMP-059 / ARQ-020 **e**  
6. Patrocinador autorizar **explicitamente** commit (e push/deploy, se aplicável).

**Proibido:**

* Commit que altere **ARQ-020** ou **REQ-059**.  
* Commit de Consciência antes do Gate deste plano.  
* Commit que crie Job ou mute Motor/Gate por efeito da consulta.  
* Commit com `@cursor/sdk` na Consciência.  
* Commit que redesenhe Classificador / Continuidade / Dispatcher / Painel fora do mínimo de leitura.  
* Commit de outras frentes no mesmo pacote.

## 10. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| Prosa dump da fila | E5-CA4; RNF1 |
| Consciência compete com «Aprovado.» | E3-CA3; E4-CA4; E6-CA2 |
| Consulta cria Job / muta Motor | E2-CA3; E4-CA2/CA3; E6-CA1 |
| Ignorar Job running relevante | E5-CA1; RF6 |
| Inventar estado em falha de fonte | E2-CA2; E6-CA5 |
| Bloquear C3 indevidamente | P9; RF10; E5 |
| Scope creep (UI, C1 obrigatório) | §2.2; FE / NA3 |
| Avançar código antes do Gate | §2.2; §8.1; §9 |

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-020 — **não alterada por esta IMP** |
| Requisitos | REQ-059 — **não alterada por esta IMP** |
| Capacidade | CAP-01 |
| Classificador | ARQ-018; REQ-057; IMP-057 |
| Continuidade | ARQ-019; REQ-058; IMP-058 |
| Motor | ARQ-017; REQ-056; IMP-056 |
| Fila / Dispatcher / CTO / Painel | REQ-045; REQ-053; REQ-054; REQ-055; ARQ-016 |
| Origem | Abertura plano Consciência Operacional (01/08/2026) |
| Implementação | *Proibida até Gate deste plano + E autorizada* |

## 12. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-059 (plano apenas) | Plano executável E1–E7 da Consciência Operacional | Em análise |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E1 domínio implementada | Autorização de execução E1 | Aguarda Gate E1 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E2 agregador implementada | Autorização de execução E2 | Aguarda Gate E2 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E3 consulta C2/C3 implementada | Autorização de execução E3 | Aguarda Gate E3 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E4 integração Núcleo/MRE | Autorização de execução E4 | Aguarda Gate E4 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E5+E6+E7 prosa / fronteiras / docs | Autorização conjunta E5–E7 | Aguarda Gate fecho |
| 0.1 | 01/08/2026 | Patrocinador | Homologação IMP-059 | Gate de fecho E1–E7 | **Homologada** |

---

*Nenhuma linha de código sob esta IMP até homologação do plano e autorização explícita da etapa.*

---

**Pedido de Gate:** IMP-059 v0.1 (plano) pronta para homologação do patrocinador.  
**Após Gate do plano + Gate da REQ-059:** autorizar E1 (código) — não implícito nesta abertura.

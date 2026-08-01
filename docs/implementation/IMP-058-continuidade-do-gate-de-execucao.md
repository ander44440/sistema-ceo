# IMP-058 — Continuidade do Gate de Execução

> **Status: Homologada — frente encerrada** (01/08/2026).  
> Norma: **REQ-058** (homologada); **ARQ-019 v0.1** (homologada) — **não alteradas no conteúdo normativo além do status**.  
> **Natureza:** plano + execução E1–E7.  
> **Gate técnico:** aprovado pelo patrocinador. Commit/push/deploy autorizados.  
> **P10:** Motor `adiado` permanece em Aprovacao.  
> **Fecho:** `docs/implementation/evidencias/IMP-058-relatorio-consolidado.md` · matriz CA/NA.

---

## 1. Objetivo

Converter a **REQ-058** / **ARQ-019** num plano executável que materialize a **Continuidade do Gate de Execução** V1: com Gate do Motor pendente, o CEO **reconhece** decisões curtas do utilizador, **retoma o mesmo ciclo** sem repetir o C3 original, e aplica:

* `aprovado` → Job + continuação do Motor → Dispatcher → … → Encerramento  
* `rejeitado` → Encerramento **sem** Job  
* `adiado` → Gate **permanece pendente** (ciclo retomável)

com prioridade sobre classificação C2/C3 órfã, idempotência, e fronteira REQ-030.

## 2. Escopo

### 2.1 Inclui

* Domínio de estados do Gate (vista Continuidade) + decisões `aprovado` \| `rejeitado` \| `adiado`.  
* Reconhecimento determinístico do léxico mínimo REQ-058 RF5 / ARQ-019 §3.4.  
* Persistência / vínculo do **contexto do Gate pendente mais recente** (ciclo/parecer) na sessão Conversa.  
* Integração Conversa → Continuidade → Motor (`conduzirAposDecisaoGate` / equivalente IMP-056).  
* Fluxos completos de aprovação, rejeição e adiamento (incl. reconciliação `adiado` com política do Motor — ver P10).  
* Fronteiras, regressões e idempotência (E6).  
* Documentação mínima e evidências CA/NA da REQ-058 (E7).  
* Testes por etapa; Gates E1…E7 homologáveis isoladamente.

### 2.2 Exclui (explícito)

* **Implementar código** neste artefacto / nesta fase de abertura.  
* Alterar enunciados **ARQ-019** ou **REQ-058**.  
* Abrir novas frentes (REQ/ARQ/IMP laterais; BP/PX; Emenda E2.1; etc.).  
* UI dedicada / botões de Gate (REQ-058 FE2).  
* Redesign do Motor, Classificador ou Dispatcher — apenas consumir / adaptar o mínimo para RF8 (`adiado` pendente).  
* Multi-utilizador / RBAC / canais externos (e-mail, Slack).  
* Auto-aprovação por timeout (REQ-058 FE7).  
* Commit/push/deploy nesta fase.

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-019 está **homologada** e é a norma arquitectural da Continuidade. |
| P2 | REQ-058, após Gate próprio, é a norma de requisitos; este plano assume o enunciado v0.1. |
| P3 | Motor (IMP-056 / REQ-056) **já existe**, incluindo Gate e `conduzirAposDecisaoGate`. |
| P4 | Classificador (IMP-057 / REQ-057) **já existe**; Continuidade tem prioridade **só** com Gate pendente + léxico de decisão. |
| P5 | Fila (REQ-045) e Dispatcher (REQ-053) são as únicas portas pós-`aprovado`. |
| P6 | Matching V1 do léxico é **determinístico** (REQ-058 RF16 / RES9). |
| P7 | Continuidade **não** publica Job sem `aprovado` quando o Gate é obrigatório; **não** invoca Agent/SDK (REQ-030). |
| P8 | Decisão aplica-se ao Gate pendente **mais recente** (REQ-058 RF4). |
| P9 | Gates por etapa: **sem código** até Gate deste plano + autorização explícita da E. |
| P10 | **Gap conhecido:** o Motor V1 (IMP-056) trata hoje `adiado` → Encerramento em `avancarAposGate`. A REQ-058 / ARQ-019 exigem `adiado` → Gate **permanece pendente**. A E5 deve **reconciliar** este comportamento (ajuste mínimo no Motor ou camada de Continuidade) **sem** alterar o texto da ARQ-019/REQ-058 e **sem** redesenhar o Motor. |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-019 | Fluxo, estados, léxico, critérios CA arquitecturais — **não alterar** |
| REQ-058 | RF/RNF/CA/CU/RES/FE — **não alterar** |
| ARQ-017 / REQ-056 / IMP-056 | Motor; `conduzirAposDecisaoGate`; ciclo; política de Gate |
| ARQ-018 / REQ-057 / IMP-057 | Classificador; C3 origem; não tratar decisão como C2 órfã |
| REQ-045 / REQ-053 | Job `pending` e Dispatcher após aprovação |
| REQ-030 | Fronteira oficina |
| Conversa / Núcleo (`executiveEngine`) | Interceptação da mensagem e retoma |
| Speaker / CN | Prosa de Gate / confirmação de retoma (sem deliberar Gate) |
| ARQ-016 / REQ-055 | Painel observa; não decide |
| CON-001 / ADR-015 | Tempo do utilizador; uso diário |

## 5. Estratégia de implementação

1. **Domínio primeiro** — estados do Gate (Continuidade) + enum de decisão + validadores; testável sem Conversa.  
2. **Reconhecimento** — matcher determinístico do léxico RF5; sem LLM na V1.  
3. **Contexto** — registo do Gate pendente mais recente (parecerId/cicloId/sessão) e API de leitura/escrita/limpeza.  
4. **Integração** — no caminho Conversa→Núcleo, **antes** de reclassificar/deliberar: se Gate pendente + match → Continuidade; senão Classificador normal.  
5. **Efeitos** — chamar Motor com a decisão; `aprovado` → Job; `rejeitado` → encerrar sem Job; `adiado` → manter pendente (P10).  
6. **Fronteiras** — idempotência, sem Gate → sem Job inventado, regressão «Sugiro…» em decisão de Gate, sem SDK.  
7. **Evidências** — matriz CA/NA REQ-058 + README operacional mínimo.  
8. **Gates E1…E7** — cada E homologável isoladamente; código só após Gate deste plano + autorização da E.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio do Gate e estados

**Objectivo:** modelo canónico in-memory dos estados do Gate (vista Continuidade) e decisões, alinhado a ARQ-019 §4 / REQ-058.

**Entregáveis:**

* Módulo domínio (ex. `continuidadeGate/dominio.js`):  
  - decisões: `aprovado` \| `rejeitado` \| `adiado`  
  - estados: `inexistente` \| `pendente` \| `resolvido_aprovado` \| `resolvido_rejeitado` (+ tratamento de adiamento = permanece `pendente` com marca opcional)  
  - `ehDecisaoGate`, `validarTransicaoGate`, helpers de contexto mínimo (`parecerId`, `cicloId`, `abertoEm`).  
* Testes unitários do domínio (enum fechado; transições válidas/inválidas).

**Critérios de aceite E1:**

* E1-CA1: Exactamente três decisões do enum V1; rejeição de decisões ad hoc.  
* E1-CA2: Estados alinhados a ARQ-019 §4.2; `adiado` **não** resolve para Encerramento na vista Continuidade.  
* E1-CA3: Transições: só a partir de `pendente` se aplica decisão; sem Gate → Continuidade não aplica.  
* E1-CA4: Domínio **sem** I/O, UI, Fila, Classificador ou SDK.

**Homologação E1:** revisão + testes do domínio. Sem integração Conversa.

---

### E2 — Reconhecimento das respostas do utilizador

**Objectivo:** reconhecer o léxico mínimo REQ-058 RF5 de forma determinística.

**Entregáveis:**

* Matcher puro (ex. `continuidadeGate/reconhecerDecisao.js`): normalização (caixa, pontuação final) + mapa:  
  - `Aprovado` · `Pode executar` · `Autorizado` · `Pode prosseguir` → `aprovado`  
  - `Cancela` · `Rejeitado` → `rejeitado`  
  - `Depois` · `Adiar` → `adiado`  
* Resultado: `{ reconhecida: boolean, decisao: Decisao|null, enunciadoNormalizado }`.  
* Testes de fixtures do léxico + negativos («ok», frases longas C3, ambíguas).

**Critérios de aceite E2:**

* E2-CA1: Os oito enunciados mínimos mapeiam correctamente.  
* E2-CA2: Variações triviais (ponto final, caixa) reconhecidas.  
* E2-CA3: Fora do léxico → `reconhecida: false` (sem forçar decisão).  
* E2-CA4: Função pura (sem `fetch`, Fila, Motor, SDK).  
* E2-CA5: Sem extensão ad hoc do léxico no Orquestrador (RF15).

**Homologação E2:** suite de fixtures + revisão da tabela léxico.

---

### E3 — Continuidade do contexto do Gate

**Objectivo:** manter e recuperar o contexto do Gate pendente **mais recente** (RF1, RF4).

**Entregáveis:**

* Store de sessão/contexto (ex. `continuidadeGate/contexto.js`): `abrirGate`, `obterGatePendenteMaisRecente`, `marcarResolvido`, `manterPendenteAposAdiamento`, limpeza segura.  
* Vínculo mínimo: `parecerId` / `cicloId` / snapshot necessário para `conduzirAposDecisaoGate`.  
* Testes: abrir → obter mais recente; dois Gates → o mais recente; rejeição limpa; adiamento preserva.

**Critérios de aceite E3:**

* E3-CA1: Com Gate aberto, contexto recuperável sem repetir o C3.  
* E3-CA2: Decisão aplica-se ao Gate **mais recente** quando houver mais de um registo.  
* E3-CA3: Após `rejeitado` / `aprovado` consumido, Gate deixa de estar `pendente` (salvo política de adiamento).  
* E3-CA4: Após `adiado`, Gate permanece recuperável como `pendente`.  
* E3-CA5: Store **sem** publicar Jobs nem chamar Motor nesta etapa.

**Homologação E3:** testes de store + revisão do contrato de contexto.

---

### E4 — Integração Conversa → Motor

**Objectivo:** no caminho da Conversa/Núcleo, interceptar decisão de Gate e encaminhar ao Motor **antes** de deliberação C2 órfã / novo C3.

**Entregáveis:**

* Ponto de integração (ex. início de `executiveEngine.executar` ou adaptador Conversa):  
  1. `obterGatePendenteMaisRecente`  
  2. se pendente + `reconhecerDecisao` → Continuidade  
  3. senão → Classificador (IMP-057) normal  
* Chamada a `conduzirAposDecisaoGate(parecer, decisao, deps)` (ou wrapper).  
* Registo de Gate quando o Motor retorna `aguardando_gate` (abertura do contexto E3).  
* Testes de integração com Motor mock / fixtures (sem Agent).

**Critérios de aceite E4:**

* E4-CA1: Com Gate pendente + «Aprovado.» → **não** passa por deliberação C2 «Sugiro…».  
* E4-CA2: Sem Gate pendente → caminho Classificador inalterado (regressão IMP-057).  
* E4-CA3: Pedido novo claro com Gate pendente (fora do léxico) → clarificação mínima (RF12), sem aprovação silenciosa.  
* E4-CA4: Integração **não** importa `@cursor/sdk`.  
* E4-CA5: Abertura de contexto ocorre quando o Motor exige Gate (`aguardando_gate`).

**Homologação E4:** testes de integração + smoke Conversa (mock Motor).

---

### E5 — Aprovação / Rejeição / Adiamento completos

**Objectivo:** efeitos completos alinhados a REQ-058 RF6–RF8 e ARQ-019 §3.1; reconciliar P10.

**Entregáveis:**

* Fluxo `aprovado`: Motor cria Job; handoff Dispatcher conforme IMP-056; contexto Gate → `resolvido_aprovado`.  
* Fluxo `rejeitado`: Encerramento **sem** Job; contexto limpo/resolvido.  
* Fluxo `adiado`: Gate **permanece pendente**; **proibido** Job; retoma posterior com léxico.  
* Ajuste mínimo necessário ao Motor (`avancarAposGate` / política) para que `adiado` **não** encerre o ciclo de forma incompatível com RF8 — documentar o delta na evidência E5 (sem alterar ARQ-019/REQ-058).  
* Testes CU1–CU3 / CU6 da REQ-058.

**Critérios de aceite E5:**

* E5-CA1: `aprovado` → Job criado; Motor avança (CriacaoDoJob / fluxo).  
* E5-CA2: `rejeitado` → zero Jobs; ciclo/Gate encerrado.  
* E5-CA3: `adiado` → zero Jobs; Gate ainda `pendente` e retomável.  
* E5-CA4: Utilizador não precisa repetir o C3 original (CA2 REQ-058).  
* E5-CA5: Segunda `aprovado` no mesmo ciclo **não** duplica Job (RF11).  
* E5-CA6: Sem redesenho do Dispatcher; reutiliza REQ-045/053.

**Homologação E5:** CU1–CU3 + CU6 verdes; revisão P10 documentada.

---

### E6 — Fronteiras, regressões e idempotência

**Objectivo:** garantir CA/NA de fronteira e não-regressão face a IMP-056/057.

**Entregáveis:**

* Suite negativa: sem Gate + «Aprovado.» → sem Job (CU4).  
* Prioridade sobre C2 órfã (CU5).  
* Idempotência (CU6) reforçada.  
* Clarificação RF12 (CU7).  
* Assertivas: Continuidade sem SDK; CTO/Painel não decidem Gate.  
* Inventário de entrypoints (onde a Continuidade é chamada).  
* Checklist operacional curto.

**Critérios de aceite E6:**

* E6-CA1: CA8 REQ-058 (sem Gate → sem Job).  
* E6-CA2: CA7 REQ-058 (sem «Sugiro…» no lugar da Continuidade).  
* E6-CA3: CA9 / RF11 (idempotência).  
* E6-CA4: CA10 / RF13 (sem `@cursor/sdk` na Continuidade).  
* E6-CA5: Regressão Classificador: C1/C2/C4 e C3 sem Gate comportam-se como IMP-057.  
* E6-CA6: Regressão Motor: ciclo sem Continuidade (chamada programática) permanece válido.

**Homologação E6:** suite E6 verde + checklist.

---

### E7 — Documentação e evidências

**Objectivo:** fecho documental da frente (sem commit até autorização).

**Entregáveis:**

* README operacional do módulo Continuidade (contrato, léxico, fluxo, fronteiras).  
* Matriz CA1–CA11 / NA1–NA4 da REQ-058 → evidências (`docs/implementation/evidencias/IMP-058-matriz-ca-na.md`).  
* Relatório consolidado E6+E7 (`…/IMP-058-relatorio-consolidado.md`).  
* Actualização do catálogo `docs/README.md` (status da IMP).  
* **Proibido** alterar ARQ-019 / REQ-058.

**Critérios de aceite E7:**

* E7-CA1: CA11 REQ-058 (docs referenciam ARQ-019, REQ-058, Motor, Fila/Dispatcher).  
* E7-CA2: Matriz CA/NA preenchida com ponteiros a testes/commits (quando houver).  
* E7-CA3: Relatório de fecho no padrão IMP-055/056/057.  
* E7-CA4: Nenhum diff em ARQ-019 nem REQ-058.

**Homologação E7:** revisão documental + Gate de fecho da implementação (após código autorizado).

---

## 7. Estratégia de testes

| Camada | O quê | Quando |
|--------|-------|--------|
| Unitário domínio (E1) | Enum, transições, estados | E1 |
| Unitário léxico (E2) | 8 positivos + negativos | E2 |
| Unitário contexto (E3) | Mais recente, adiamento, limpeza | E3 |
| Integração (E4) | Interceptação Conversa→Motor mock | E4 |
| Fluxos (E5) | CU1–CU3, CU6; P10 `adiado` | E5 |
| Fronteiras (E6) | CU4–CU5, CU7; regressão IMP-056/057; sem SDK | E6 |
| Smoke manual (pós-código) | C3 → Gate → «Aprovado.» → Job `pending`; «Cancela.»; «Depois.»→«Autorizado.» | Após E5+E6 |

**Script sugerido (após autorização de código):** `npm run test:continuidade-gate` (ou incluir na suite existente do Motor/Classificador).

**Princípio:** preferir funções puras e mocks de Fila/Motor; **nunca** Agent real nos testes automatizados.

## 8. Critérios de homologação

### 8.1 Homologação deste **plano** (Gate actual)

A IMP-058 v0.1 considera-se **homologada como plano** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Premissas (incl. P10) e dependências §3–§4 aceites.  
3. Estratégia §5 e etapas E1–E7 §6 suficientes.  
4. Critérios de aceite por etapa verificáveis.  
5. Estratégia de testes §7 adequada.  
6. Critérios de commit §9 claros.  
7. Autorização explícita para **iniciar código** na E1 (ou na E indicada) — **não** implícita nesta abertura.

### 8.2 Homologação da **implementação** (após código — referência)

* Todas as E1–E7 homologadas.  
* CA1–CA11 e NA1–NA4 da REQ-058 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke local CU1 + CU2 + CU3.  
* Relatório técnico de fecho.  
* Produção só após commit autorizado.

## 9. Critérios para commit

Commit **só** quando:

1. Gate do **plano** IMP-058 estiver homologado **e**  
2. REQ-058 estiver **homologada** **e**  
3. Implementação das etapas autorizadas estiver concluída com Gate técnico de código **e**  
4. Escopo = ficheiros da Continuidade / integração Conversa–Motor (ajuste mínimo Motor para P10 se necessário) — **sem** frentes laterais **e**  
5. Mensagem de commit referencie REQ-058 / IMP-058 / ARQ-019 **e**  
6. Patrocinador autorizar **explicitamente** commit (e push/deploy, se aplicável).

**Proibido:**

* Commit que altere **ARQ-019** ou **REQ-058**.  
* Commit de Continuidade antes do Gate deste plano.  
* Commit que faça «Aprovado.» criar Job **sem** Gate pendente.  
* Commit com `@cursor/sdk` na Continuidade.  
* Commit que redesenhe Dispatcher/Classificador fora do mínimo E4–E5.  
* Commit de outras frentes no mesmo pacote.

## 10. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| «Aprovado.» → C2 «Sugiro…» | E4-CA1; E6-CA2; RF3 |
| `adiado` ainda encerra no Motor (P10) | E5-CA3; evidência do delta |
| Job duplicado | E5-CA5; E6-CA3 |
| Pedido novo com Gate aberto | E4-CA3; RF12 |
| Falso positivo sem Gate | E2-CA3; E6-CA1 |
| Scope creep (UI, multi-canal) | §2.2; FE2–FE4 |
| Avançar código antes do Gate | §2.2; §8.1; §9 |

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-019 (homologada) — **não alterada por esta IMP** |
| Requisitos | REQ-058 — **não alterada por esta IMP** |
| Capacidade | CAP-11 |
| Motor | ARQ-017; REQ-056; IMP-056 |
| Classificador | ARQ-018; REQ-057; IMP-057 |
| Fila / Dispatcher | REQ-045; REQ-053 |
| Origem | Abertura plano Continuidade do Gate (01/08/2026) |
| Implementação | *Proibida até Gate deste plano + E autorizada* |

## 12. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-058 (plano apenas) | Plano executável E1–E7 da Continuidade | Em análise |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E1 domínio implementada | Autorização de execução E1 | Aguarda Gate E1 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E2 léxico implementada | Autorização de execução E2 | Aguarda Gate E2 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E3 contexto implementada | Autorização de execução E3 | Aguarda Gate E3 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E4 integração Conversa→Motor | Autorização de execução E4 | Aguarda Gate E4 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E5 fluxos + P10 Motor | Autorização de execução E5 | Aguarda Gate E5 |
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | E6+E7 fronteiras + docs + fecho | Autorização conjunta E6/E7 | Aguarda Gate fecho |
| 0.1 | 01/08/2026 | Patrocinador | Homologação IMP-058 | Gate de fecho E1–E7 | **Homologada** |

---

*Nenhuma linha de código sob esta IMP até homologação do plano e autorização explícita da etapa.*

---

**Pedido de Gate:** IMP-058 v0.1 (plano) pronta para homologação do patrocinador.  
**Após Gate do plano + Gate da REQ-058:** autorizar E1 (código) — não implícito nesta abertura.

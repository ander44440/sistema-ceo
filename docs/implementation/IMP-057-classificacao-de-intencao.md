# IMP-057 — Classificação de Intenção

> **Status: Homologada (v1.0) — Emenda E5.1 em encerramento (commit/push/deploy)** (01/08/2026).  
> Norma: **REQ-057** (homologada); **ARQ-018 v0.1** (homologada) — **não alteradas**.  
> **Natureza:** plano + implementação E1–E7 + Emendas E2.1 / E2.2 / **E5.1**.  
> **Emenda E2.2:** encerrada em produção.  
> **Emenda E5.1:** Gate aprovado — commit/push/deploy + homologação em produção.

---

## 1. Objetivo

Converter a **REQ-057** / **ARQ-018** num plano executável que materialize o **Classificador de Intenção** V1: classificar **toda** mensagem do utilizador **antes** de qualquer resposta ou acção, nas classes

`conhecimento_geral` | `conversa_projeto` | `trabalho_executivo` | `comando_operacional`

com encaminhamento correcto (C1 resposta leve; C2 frente activa sem Job automático; C3 → Motor ARQ-017/REQ-056; C4 capacidades operacionais), limiar de confiança **0,55**, e **um único** limiar canónico no Núcleo (sem classificadores concorrentes).

## 2. Escopo

### 2.1 Inclui

* Módulo domínio do Classificador (enum C1–C4, contrato de saída §RF7, regras de empate §RF8–RF11).  
* Função pura `classificarIntencaoCanonico` (ou evolução do stub) — **sem** efeitos laterais.  
* Encaminhador pós-classe no Orquestrador/Núcleo (mapa classe → destino).  
* Integração como **primeiro passo** de `executiveEngine.executar` (ou equivalente).  
* Convergência / substituição do stub legado (`classificar.js`) — RF15 / CA11.  
* Testes por etapa + documentação mínima.  
* Matriz CA1–CA11 / NA1–NA3 da REQ-057 → evidências.

### 2.2 Exclui (explícito)

* Alterar enunciados **ARQ-018** ou **REQ-057**.  
* UI dedicada ao Classificador.  
* Redesign do MRE, Motor, CTO ou Painel (apenas consumir / respeitar).  
* Segundo Classificador em paralelo.  
* Novas classes fora do enum V1.  
* Treino de modelo proprietário.  
* Abrir REQ/ARQ/IMP de outras frentes.  
* Implementar código neste artefacto (plano apenas).

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-018 está **homologada** e é a norma arquitectural. |
| P2 | REQ-057, após Gate próprio, é a norma de requisitos; este plano assume o enunciado v0.1. |
| P3 | Motor (IMP-056 / REQ-056) **já existe** como destino de C3. |
| P3a | Em C3, o Núcleo **não** fecha com Parecer Executivo textual; transferência ao Motor é obrigatória (emenda E4 v0.2). |
| P4 | Stub `classificarIntencao` actual é **insumo** a convergir — não norma das quatro classes. |
| P5 | Capacidades operacionais (memória, fila, dashboard, …) já existem para C4. |
| P6 | C1/C4 preferem regras/lexicon (REQ-057 RES8); LLM de classificação só se etapa autorizada o justificar. |
| P7 | Limiar de confiança V1 = **0,55** (RES7). |
| P8 | Classificador **não** publica Jobs nem chama Agent/SDK. |
| P9 | Gates por etapa: **sem código** até Gate deste plano + autorização da E. |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-018 | Classes, fluxo, critérios CA arquitecturais |
| REQ-057 | RF/RNF/CA/CU/RES/FE |
| ARQ-017 / REQ-056 / IMP-056 | Destino C3 (Motor) |
| Núcleo (`executiveEngine`) | Ponto de integração “primeiro passo” |
| `classificar.js` (legado) | Migração / convergência |
| Capacidades (memoria, fila, dashboard, ia, …) | Destinos C1/C4 / apoio C2 |
| MRE / integracaoNucleo | Destino C2 (e apoio deliberativo) |
| REQ-054 / REQ-055 | Sem salto CTO/Painel |
| CON-001 / ADR-015 | Tempo do utilizador; uso diário |

## 5. Estratégia de implementação

1. **Domínio e contrato primeiro** (enum, saída canónica, empates, limiar) — testável sem Orquestrador.  
2. **Regras/lexicon V1** para C1 e C4 (e sinais C3/C2) antes de qualquer LLM.  
3. **Encaminhador** puro (classe → destino) antes de ligar ao Núcleo.  
4. **Integração Núcleo** como primeiro passo; remover/encaminhar stub legado (um só limiar).  
5. **C3 → Motor** via API já existente (`conduzirMotorExecucao` / efeitos), sem redesenhar o Motor.  
6. **Fronteiras e regressões** (sem Job em C1/C2; C4 ≠ C3; sem SDK).  
7. **Gates E1…:** cada E homologável isoladamente; código só após Gate deste plano.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio e contrato do Classificador

**Objectivo:** modelo canónico in-memory das quatro classes + validação do contrato de saída.

**Entregáveis:**

* Módulo domínio (ex. `classificadorIntencao/dominio.js`): enum C1–C4, `validarSaida`, `LIMIAR_CONFIANCA = 0.55`, flags derivadas (`usaFrenteActiva`, `permiteJob`).  
* Tipos: `SaidaClassificador` alinhada a REQ-057 RF7.  
* Testes unitários do domínio (enum fechado; campos obrigatórios; flags por classe).

**Critérios de aceite E1:**

* E1-CA1: Exactamente quatro classes do enum V1; rejeição de classes ad hoc.  
* E1-CA2: Contrato RF7 validado (campos presentes / tipos).  
* E1-CA3: `usaFrenteActiva` / `permiteJob` coerentes com ARQ-018 §3 (C1 false/false; C2 true/false; C3 true/true potencial; C4 conforme regra).  
* E1-CA4: Domínio **sem** I/O, UI, Fila, Motor ou SDK.

**Homologação E1:** revisão + testes do domínio. Sem integração Núcleo.

---

### E2 — Motor de regras / lexicon V1

**Objectivo:** implementar `classificar(texto, contexto?)` por regras (RES8), incluindo empates e limiar.

**Entregáveis:**

* Função pura de classificação com lexicon C1/C4/C3/C2.  
* Aplicação de RF8–RF11 (empates + ambiguidade → sem C3 forçado).  
* Testes: CU1–CU5 da REQ-057 em fixtures de texto.

**Critérios de aceite E2:**

* E2-CA1: Fixtures C1 → `conhecimento_geral` sem Job flags.  
* E2-CA2: Fixtures C4 (status/jobs listar) → `comando_operacional`, não C3.  
* E2-CA3: Empate C2/C3 sem verbo de execução → C2.  
* E2-CA4: Confiança &lt; 0,55 ⇒ clarificação ou classe restritiva; **nunca** C3+Job.  
* E2-CA5: Função pura (sem `fetch`, Fila, SDK).

**Homologação E2:** suite de fixtures + revisão da tabela lexicon.

---

### Emenda E2.1 — Priorização de Intenções Executivas

> **Status:** Implementada — aguarda homologação do patrocinador (01/08/2026).  
> **Âmbito:** regras de classificação **C2 × C3** (motor de regras / lexicon — etapa E2).  
> **Origem:** validação prática pós-IMP-057 (diagnóstico: «Sugiro…» em pedidos imperativos classificados como C2).  
> **Código:** `ehIntencaoExecutivaE21` / lexicon C3 + testes `e21.test.js`.  
> **Não altera:** ARQ-018; REQ-057; Motor de Execução.

#### Objectivo

Ajustar o Classificador para que **intenções executivas** (verbo imperativo dirigido ao CEO + acção potencialmente executável) sejam **sempre** `trabalho_executivo` (C3) → destino `motor_execucao`, **mesmo com frente activa**, sem rebaixamento a C2 por RF8/RF9 ou boost de projecto.

#### Regra obrigatória (E2.1)

Se a mensagem contiver **simultaneamente**:

1. um **verbo imperativo** dirigido ao CEO; **e**  
2. uma **acção potencialmente executável**;

a classificação deverá ser **obrigatoriamente C3** (`trabalho_executivo`), **independentemente da frente activa**.

*Consequências de encaminhamento (já homologadas E3–E5):* C3 → `motor_execucao`; sem fecho consultivo «Sugiro…» (E4).

*Não aplica* quando a mensagem é **interrogativa / deliberativa** (pedido de opinião, priorização, explicação) — permanece C2 quando o lexicon/contexto assim o determinar.

#### Exemplos obrigatórios → C3

| # | Mensagem |
|---|----------|
| 1 | Resolva os bugs. |
| 2 | Corrija esse problema. |
| 3 | Faça um diagnóstico. |
| 4 | Analise este projeto. |
| 5 | Implemente esta funcionalidade. |
| 6 | Acione o CTO. |
| 7 | Acione o Engenheiro. |
| 8 | Delegue esta tarefa. |
| 9 | Execute esta análise. |
| 10 | Gere um relatório. |
| 11 | Crie um Job. |
| 12 | Investigue este erro. |

#### Exemplos obrigatórios → permanecem C2

| # | Mensagem |
|---|----------|
| A | Como devemos priorizar os bugs? |
| B | O que você acha dessa arquitetura? |
| C | Qual seria a melhor estratégia? |
| D | Explique esse módulo. |

#### Entregáveis (após Gate — não nesta abertura)

* Actualizar lexicon / `temVerboExecucao` / `resolverEmpates` para materializar a regra E2.1.  
* Garantir que `frenteActiva === true` **não** force C2 quando a regra E2.1 dispara.  
* Suite de testes com **todos** os exemplos C3 e C2 acima.  
* Evidência em `docs/implementation/evidencias/` (após implementação autorizada).

#### Critérios de aceite E2.1

* **CA-E2.1-1:** Todos os verbos/exemplos executivos da tabela C3 acima resultam em `classe === trabalho_executivo` (destino `motor_execucao`, salvo clarificação por limiar — e estes exemplos **não** devem cair abaixo do limiar por empate C2).  
* **CA-E2.1-2:** A frente activa **nunca** poderá rebaixar uma intenção que cumpra a regra E2.1 para C2 (`conversa_projeto`).  
* **CA-E2.1-3:** Os testes automatizados incluem **todos** os exemplos C3 e C2 listados nesta emenda.

#### Homologação E2.1

Gate do patrocinador sobre **este texto de emenda**. Código só após autorização explícita de implementação da E2.1.

---

### Emenda E2.2 — Cobertura de Classificação

> **Status:** Homologada em produção (01/08/2026).  
> **Âmbito:** regras de classificação **C1** e **C2** (motor de regras / lexicon — etapa E2).  
> **Origem:** clarificações indevidas quando a intenção é classificável com segurança (conhecimento geral ou deliberação de projecto).  
> **Código:** `app/src/classificadorIntencao/{lexicon,regras,e22.test}.js` (+ exports).  
> **Evidência:** `docs/implementation/evidencias/IMP-057-E22-relatorio.md`; prod → `IMP-057-E22-homologacao-producao.md`.  
> **Não altera:** ARQ-018; REQ-057; Motor; Continuidade do Gate; Consciência Operacional (IMP-059).

#### Objectivo

Eliminar **clarificações indevidas** quando a intenção puder ser classificada com segurança — cobrindo (1) conhecimento geral / explicações → **C1** obrigatório e (2) perguntas deliberativas de projecto com padrões lexicais explícitos → **C2** obrigatório (com contexto de projecto).

#### Regra obrigatória — C1 (conhecimento geral)

Mensagens cujo valor esperado é **conhecimento, definição, explicação ou facto** (sem pedido de trabalho executivo e sem deliberação de prioridade/capacidade do projecto) deverão ser classificadas como **C1** (`conhecimento_geral`) → destino `resposta_leve`.

**Domínios / intenções cobertos (lista mínima V1):**

| Domínio / tipo |
|----------------|
| Receita |
| Culinária |
| História |
| Ciência |
| Matemática |
| Programação |
| Tecnologia |
| Pessoas |
| Lugares |
| Definições |
| Explicações |

**Exemplos obrigatórios → C1** (nunca Clarificação):

| # | Mensagem |
|---|----------|
| 1 | Me dê uma receita de bolo de laranja. |
| 2 | Quem foi Albert Einstein? |
| 3 | O que é Docker? |
| 4 | Explique REST. |

*Todos os exemplos da tabela são **obrigatoriamente C1**.*

#### Regra obrigatória — C2 (conversa de projecto)

Perguntas **deliberativas** iniciadas por (ou semanticamente equivalentes a) um dos padrões abaixo, **quando houver contexto de projecto** (frente activa / COA / referência ao projecto em curso), deverão ser classificadas como **C2** (`conversa_projeto`) → destino `nucleo_mre`.

**Padrões lexicais mínimos (início / núcleo da pergunta):**

| Padrão |
|--------|
| Como devemos… |
| Você concorda… |
| O que você acha… |
| Quais capacidades… |
| Qual prioridade… |
| Como organizar… |
| O que falta… |

**Exemplos obrigatórios → C2** (com contexto de projecto; nunca Clarificação):

| # | Mensagem |
|---|----------|
| A | Como devemos priorizar o MG2? |
| B | Você concorda com a arquitetura atual? |
| C | Quais capacidades ainda faltam para o CEO? |
| D | O que você acha da arquitetura do Motor? |

*Estes exemplos (e os padrões acima com contexto de projecto) são **obrigatoriamente C2**.*

#### Critério transversal (E2.2)

Os exemplos obrigatórios C1 e os padrões/exemplos C2 desta emenda **nunca** devem cair em **Clarificação** (`precisaClarificacao` / destino `clarificacao`) por limiar ou empate — a classificação segura prevalece.

#### Entregáveis (implementados)

* Lexicon / regras E2: cobertura C1 (domínios + exemplos) e C2 (padrões deliberativos + contexto de projecto).  
* Exemplos obrigatórios **não** disparam clarificação.  
* Suite `e22.test.js` + `npm run test:classificador:e22` / `test:classificador`.  
* Evidência: `docs/implementation/evidencias/IMP-057-E22-relatorio.md`.  
* Convive com Emenda E2.1: imperativo+acção continua C3; E2.2 não rebaixa C3.

#### Critérios de aceite E2.2

* **CA-E2.2-1:** Todos os exemplos obrigatórios C1 da tabela resultam em `classe === conhecimento_geral` (destino `resposta_leve`) e **não** em Clarificação.  
* **CA-E2.2-2:** Mensagens que casam com os padrões C2 desta emenda **e** têm contexto de projecto resultam em `classe === conversa_projeto` (destino `nucleo_mre`) e **não** em Clarificação.  
* **CA-E2.2-3:** Os testes automatizados incluem **todos** os exemplos C1 e C2 listados nesta emenda.  
* **CA-E2.2-4:** Nenhum exemplo desta emenda é reclassificado como C3 por efeito colateral da E2.1 (interrogativas/deliberativas permanecem fora da regra imperativo+acção).

#### Homologação E2.2

Gate do patrocinador sobre **implementação + CA-E2.2-1…4 + suite verde**. Sem commit até autorização explícita.

---

### E3 — Encaminhador pós-classe

**Objectivo:** mapa determinístico classe → destino lógico (sem executar ainda efeitos pesados).

**Entregáveis:**

* `encaminharPorClasse(saida)` → destino (`resposta_leve` | `nucleo_mre` | `motor_execucao` | `capacidade_operacional` | `clarificacao`).  
* Testes: cada classe → destino correcto; C3 → `motor_execucao`.

**Critérios de aceite E3:**

* E3-CA1: C1 → resposta leve; C2 → núcleo/MRE; C3 → motor; C4 → capacidade operacional.  
* E3-CA2: Encaminhador **não** publica Job nem chama Motor/Fila (só decide destino).  
* E3-CA3: Clarificação quando a saída o indicar.

**Homologação E3:** testes do mapa. Sem UI.

---

### E4 — Integração Núcleo (Classificador primeiro)

**Objectivo:** toda `executar(mensagem)` classifica antes de qualquer capacidade/MRE/Motor; e, quando a classe for **C3 (Trabalho Executivo)**, o Núcleo **transfere obrigatoriamente** o controlo ao Motor de Execução — sem parecer textual «Sugiro…» como resposta final.

**Entregáveis:**

* Hook no Núcleo: `classificar` → `encaminharPorClasse` → só então executar destino.  
* Convergência do stub legado (substituir ou adaptar a emitir classes canónicas — **um** limiar).  
* Registo observável da classificação em `dados` / diagnóstico (sem secrets).  
* Garantia: C1 não entra no pipeline MRE completo.  
* **Regra C3 (obrigatória nesta E4):**
  1. Se `classe === trabalho_executivo` e destino `motor_execucao` (e sem clarificação), o Núcleo **não** poderá tratar a rota deliberativa/MRE como resposta final.  
  2. O Núcleo deverá invocar o Motor (`conduzirMotorExecucao` / ponte IMP-056) **antes** de devolver prosa ao utilizador.  
  3. A mensagem ao utilizador deverá reflectir o **início da execução** (ex.: Job criado/`pending`, handoff ao Dispatcher, ou Gate de aprovação do Motor) — **não** uma recomendação consultiva do tipo «Sugiro…» / parecer executivo textual como fecho.  
  4. Proibido: gerar `ParecerExecutivo` (ou equivalente Speaker de deliberação) como **única** resposta a C3, omitindo o Motor.

**Critérios de aceite E4:**

* E4-CA1: Teste de integração — efeito Fila/Motor/MRE **após** classificação registada.  
* E4-CA2: C1 não invoca `executarDeliberacaoMre` / rota deliberativa.  
* E4-CA3: Um único módulo/caminho de classificação no fluxo Conversa→Núcleo.  
* E4-CA4: Sem `@cursor/sdk` no Classificador / encaminhador.  
* E4-CA5: Fixture C3 («Implementa… e despacha») → Núcleo chama porta do Motor; resposta contém indício de Job/execução/Gate — **não** termina só com «Sugiro…».  
* E4-CA6: Em C3, **não** há `ParecerExecutivo` / comunicado MRE como resposta final sem passagem pelo Motor (teste negativo com mock).  
* E4-CA7: Se o Motor exigir Gate (`aguardando_gate`), a resposta ao utilizador reflecte pedido de aprovação — ainda assim **via Motor**, não via parecer deliberativo solto.  
* E4-CA8: Clarificação (`destino === clarificacao`) **não** força Motor; C2 continua a poder usar MRE.

**Homologação E4:** testes de integração Núcleo + smoke CU1/CU3/CU4; evidência explícita anti-«Sugiro» em C3.

---

### E5 — Destinos C2 / C3 / C4 (ligação real)

**Objectivo:** ligar encaminhamentos aos sistemas existentes sem redesenhar Motor/MRE — cumprindo a transferência C3 já obrigatória na E4.

**Entregáveis:**

* C2 → caminho deliberativo / IA com frente activa (existente).  
* C3 → `conduzirMotorExecucao` / efeitos Motor (IMP-056) — **única** via de resposta final para Trabalho Executivo (reforço E4-CA5–CA7).  
* C4 → capacidades já registadas (memoria, fila listar, dashboard, …) por mapa id.  
* Testes: C2 sem Job automático; C3 chama porta Motor (mock) e resposta operacional; C4 não classifica como C3.

**Critérios de aceite E5:**

* E5-CA1: C2 com mock → zero `publicarJob`.  
* E5-CA2: C3 com mock Motor → invocação do Motor; Job só se política mock permitir; prosa final ≠ parecer «Sugiro» isolado.  
* E5-CA3: C4 “listar jobs” → capacidade fila/consulta, não Motor de implementação.  
* E5-CA4: Falha do destino não apaga o registo de classificação prévia.  
* E5-CA5: Falha do Motor em C3 → erro tipado / mensagem de falha de execução; **não** fallback silencioso para deliberação MRE como substituto.

**Homologação E5:** testes com mocks + checklist CU2–CU4.

---

### Emenda E5.1 — Executor do destino C1 (`resposta_leve`)

> **Status:** Encerramento em curso — commit/push/deploy + homologação produção (01/08/2026).  
> **Âmbito:** `executarDestinoC1` / gerador `respostaLeve.js` — **não** Classificador, Motor, Continuidade nem Consciência.  
> **Origem:** em produção, C1 chegava a `resposta_leve` mas devolvia stub («resposta imediata (C1). Que detalhe precisa?»).  
> **Evidência:** `docs/implementation/evidencias/IMP-057-E51-relatorio.md`.  
> **Não altera:** ARQ-018; REQ-057; regras/lexicon do Classificador; Motor; Continuidade do Gate; Consciência Operacional.

#### Objectivo

Quando `classe === conhecimento_geral` e `destino === resposta_leve`, produzir **imediatamente** uma resposta natural de conhecimento geral via LLM — sem MRE, Motor, Job nem Gate.

#### Fluxo

```text
Conversa → Classificador → C1 → executarDestinoC1 → LLM → Resposta natural (+ Conversação Natural)
```

#### Entregáveis (implementados)

* `app/src/classificadorIntencao/respostaLeve.js` — `gerarRespostaConhecimentoGeral` (LLM directo / inject de teste).  
* `executarDestinoC1` deixa de emitir stub; locais (saudação/data/hora/identidade) inalterados.  
* Suite `e51.test.js` — CA-E5.1-1…10.  
* Proibido: MRE, Motor, Job, Gate, prosa «resposta imediata (C1)» / «Que detalhe precisa?» em pergunta completa.

#### Critérios de aceite E5.1

* **CA-E5.1-1…6:** cenários de conhecimento → resposta completa/natural (sem stub).  
* **CA-E5.1-7:** nenhum Job.  
* **CA-E5.1-8:** nenhum Gate.  
* **CA-E5.1-9:** nenhuma deliberação MRE.  
* **CA-E5.1-10:** Conversação Natural preservada (`naturalizar` em todo C1).

#### Nota (Classificador intacto)

«Como funciona o protocolo HTTP?» ainda pode cair em Clarificação no Classificador (confiança &lt; 0,55) — **fora do escopo E5.1**. O executor foi validado com destino C1; cobertura lexical desse padrão exige emenda futura do Classificador (não feita aqui).

#### Homologação E5.1

Gate do patrocinador sobre implementação + CA-E5.1-1…10 + suite verde. Sem commit até autorização.

---

### E6 — Fronteiras, regressões e anti-bypass

**Objectivo:** CA/NA de fronteira; CTO/Painel; sem classificadores concorrentes.

**Entregáveis:**

* Testes negativos: Classificador sem Fila/SDK; C1/C2 sem Job; ambiguidade sem C3.  
* Verificação estática: CTO/Painel não saltam Classificador no caminho Conversa.  
* Inventário: um só entrypoint de classificação.  
* Checklist operacional curto (README).

**Critérios de aceite E6:**

* E6-CA1: Suite negativa (Job/SDK/bypass) a verde.  
* E6-CA2: Stub legado removido ou reduzido a adapter do canónico (CA11).  
* E6-CA3: Regressão capacidades C4 (memoria/fila) a verde.  
* E6-CA4: Segredos ausentes em `razaoCurta` (amostra).

**Homologação E6:** relatório de regressão + evidências.

---

### E7 — Documentação, matriz CA REQ-057 e fecho de plano

**Objectivo:** fechar rastreabilidade REQ-057 CA1–CA11 / NA1–NA3; docs; critérios de commit.

**Entregáveis:**

* README curto do Classificador (classes, limiar, destinos, portas).  
* Matriz de evidências em `docs/implementation/evidencias/IMP-057-matriz-ca-na.md`.  
* Lista de ficheiros para commit futuro.  
* Actualização de catálogo **apenas** no encerramento formal (após Gates de código — não neste plano).

**Critérios de aceite E7:**

* E7-CA1: Cada CA1–CA11 e NA1–NA3 mapeado a evidência.  
* E7-CA2: README referencia ARQ-018, REQ-057, ARQ-017/REQ-056.  
* E7-CA3: Lista explícita de ficheiros tocados.

**Homologação E7:** pacote de evidências → Gate técnico de implementação (futuro) → só então commit.

---

## 7. Ordem e dependências entre etapas

```text
E1 → E2 → [Emenda E2.1] → [Emenda E2.2] → E3 → E4 → E5
                              ↘ E6 (pode iniciar após E4; fecha após E5)
E1…E6 → E7
```

**Emenda E2.1** (pós-homologação v1.0): ajusta regras C2×C3 do motor E2; implementação **só** após Gate da emenda (não reabre E3–E7 salvo impacto de regressão nos testes E2).  
**Emenda E2.2** (pós-homologação v1.0): cobertura C1/C2 para eliminar Clarificação indevida; **implementada** — aguarda Gate / commit.

Cada etapa exige **homologação interna** antes de avançar código da seguinte.

**Nenhuma etapa de código** começa antes da **homologação deste plano IMP-057**.

## 8. Estratégia de testes

| Tipo | O quê |
|------|--------|
| Unitário | Domínio; lexicon; empates; limiar 0,55 |
| Integração | Núcleo: classificar → encaminhar → destino (mocks) |
| Negativo | C1/C2 sem Job; ambiguidade ≠ C3; sem SDK/Fila no Classificador |
| Regressão | Capacidades C4; MRE C2; Motor C3 (mock); CTO/Painel |
| Manual / smoke | CU1 e CU4 em ambiente local |
| Fixtures | Corpus mínimo por classe (REQ-057 CU1–CU5) |

Comando previsto (na implementação): ex. `npm run test:classificador` / `test:classificador:e1` em `app/`.

## 9. Critérios de homologação do **plano** IMP-057 (este documento)

O plano considera-se homologado quando o patrocinador confirmar:

1. Etapas E1–E7 suficientes e na ordem certa.  
2. “Classificador primeiro” e um só limiar cobertos.  
3. C1–C4 e encaminhamento C3→Motor cobertos.  
4. Empates/ambiguidade sem default C3.  
5. Autorização para **iniciar código pela E1** após Gate deste plano **e** após REQ-057 homologada.  
6. Sem alteração a ARQ-018 / REQ-057 neste artefacto (cumprido).

## 10. Critérios de homologação da **implementação** (após código — referência)

* Todas as E homologadas.  
* CA1–CA11 e NA1–NA3 da REQ-057 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke local CU1 + CU4.  
* Relatório técnico de fecho (padrão IMP-055/056).  
* Produção só após commit autorizado.

## 11. Critérios para commit

Commit **só** quando:

1. Gate do plano IMP-057 estiver homologado **e**  
2. REQ-057 estiver homologada **e**  
3. Implementação das etapas autorizadas estiver concluída com Gate técnico de código **e**  
4. Escopo = ficheiros do Classificador / integração Núcleo (sem BP/PX laterais) **e**  
5. Mensagem de commit referencie REQ-057 / IMP-057 / ARQ-018 **e**  
6. Patrocinador autorizar explicitamente commit/push/deploy.

**Proibido:** commit que altere ARQ-018 ou REQ-057; commit de segundo Classificador; commit que faça C1/C2 publicar Jobs; commit com `@cursor/sdk` no Classificador.

## 12. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| Stub + canónico em paralelo | E4-CA3 / E6-CA2 / RF15 |
| Falsos positivos C3 | E2 empates; preferir C2; Gate Motor; **E2.1** restringe: imperativo+acção → C3 obrigatório |
| Frente activa rebaixa C3→C2 | **Emenda E2.1** CA-E2.1-2 |
| C3 respondido com «Sugiro…» (parecer sem Motor) | E4-CA5–CA8; E5-CA2 / E5-CA5 |
| Scope creep LLM | RES8; E2 regras primeiro |
| C4 vs C3 em “jobs” | Fixtures E2/E5; RF10 |
| Avançar código antes do Gate | Proibição §6 / §9 |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-018 (homologada) — **não alterada por esta IMP** |
| Requisitos | REQ-057 — **não alterada por esta IMP** |
| Capacidade | CAP-07 |
| Destino C3 | ARQ-017; REQ-056; IMP-056 |
| Origem | Abertura plano Classificação de Intenção (01/08/2026) |
| Implementação | *Proibida até Gate deste plano + E autorizada* |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-057 — plano E1–E7 | Materializar Classificador sem código nesta fase | Plano aberto |
| 0.2 | 01/08/2026 | Engenheiro (Cursor) | Emenda E4/E5 — C3 obriga Motor; anti-«Sugiro» | Eliminar parecer textual como resposta final a Trabalho Executivo | Emenda homologada |
| 0.3 | 01/08/2026 | Engenheiro (Cursor) | Implementação E4 — hook Núcleo + C3→Motor | Materializar v0.2; anti-«Sugiro» em C3 | E4 homologável |
| 0.4 | 01/08/2026 | Engenheiro (Cursor) | Implementação E5 — destinos C1–C4 reais + anti-fallback | Ligar classificação às capacidades; E5-CA1–CA5 | E5 homologável |
| 0.5 | 01/08/2026 | Engenheiro (Cursor) | E6 fronteiras + E7 docs/matriz + relatório consolidado | Fechar IMP-057 para Gate técnico | Homologação consolidada |
| 1.0 | 01/08/2026 | Engenheiro (Cursor) | Encerramento — commit/push/deploy/prod | IMP-057 Homologada pelo patrocinador | Frente encerrada (v1.0) |
| 1.1 | 01/08/2026 | Engenheiro (Cursor) | **Emenda E2.1** — Priorização de Intenções Executivas | Validação prática: imperativo+acção → C3; frente activa não rebaixa | Emenda aberta |
| 1.2 | 01/08/2026 | Engenheiro (Cursor) | Implementação E2.1 (regras/lexicon/testes) | Materializar CA-E2.1-1…3; demos Núcleo | Aguarda homologação |
| 1.3 | 01/08/2026 | Engenheiro (Cursor) | **Emenda E2.2** — Cobertura de Classificação (docs) | Eliminar Clarificação indevida em C1/C2 seguros | Texto aberto |
| 1.4 | 01/08/2026 | Engenheiro (Cursor) | Implementação E2.2 (lexicon/regras/testes) | Materializar CA-E2.2-1…4; demos obrigatórios | Implementada |
| 1.5 | 01/08/2026 | Engenheiro (Cursor) | Encerramento E2.2 — commit/push/deploy/prod | Autorização do patrocinador | Homologada em produção |
| 1.6 | 01/08/2026 | Engenheiro (Cursor) | **Emenda E5.1** — Executor destino C1 | Substituir stub por LLM em `resposta_leve` | Gate aprovado |
| 1.7 | 01/08/2026 | Engenheiro (Cursor) | Encerramento E5.1 — commit/push/deploy/prod | Autorização do patrocinador | Em curso |

---

**Emenda E5.1:** Gate aprovado. Encerramento em curso. **Não** abrir nova frente.

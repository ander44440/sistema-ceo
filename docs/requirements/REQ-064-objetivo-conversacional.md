# REQ-064 — Objetivo Conversacional

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **acompanhar o objectivo conversacional da sessão** — detectando **estabelecimento**, **continuação**, **mudança**, **ambiguidade** e **neutralidade** de objectivo — mantendo **no máximo um objectivo activo** e **um objectivo anterior**, com **pergunta curta** quando houver dúvida, **sem** abandonar automaticamente o objectivo activo, **sem** confundir objectivo com tópico, classe ou Job, **sem** alterar o Classificador como único decisor de classe, **sem** influenciar C3/Jobs, e com **Gate**, **Motor** e **NCS** preservados.

## Tipo

Funcional; detalhado (gestor de objectivo / goal tracking — 4ª frente CSC sob CAP-07; pós IMP-061, IMP-062 e IMP-063).

## Justificativa

A **ANL-009** constata que, após histórico (IMP-061), referentes (IMP-062) e tópicos (IMP-063), o CEO ainda **não modela um objectivo conversacional activo multi-turno**. O «objectivo» aparece fragmentado (mensagem no prompt; `objetivoReal` do MRE por turno; `intencaoDoDia` no painel) sem estado contínuo no limiar. Motivações: CON-001 Art. 9º.1–9º.2 (tempo do utilizador; nunca perder contexto; nunca executar sem objectivo claro); ADR-015; EIC (4ª melhoria perceptível CSC); ADR-006; preservação de ARQ-018 e IMP-061/062/063.

---

## Objetivo

1. Introduzir um **gestor de objectivo conversacional** auxiliar (não um segundo classificador).  
2. Manter **exactamente um** objectivo activo (0 ou 1) e **até um** objectivo anterior.  
3. Detectar e expor os eventos: **estabelecer**; **continuar**; **mudar**; **ambíguo**; **neutro**.  
4. Em dúvida de objectivo: **pergunta curta** contextualizada — sem Job e sem C3.  
5. **Não abandonar automaticamente** o objectivo activo.  
6. Garantir fronteiras explícitas: **Objectivo ≠ Tópico**; **Objectivo ≠ Classe**; **Objectivo ≠ Job**.  
7. Preservar o Classificador como **único ponto oficial de decisão de classe**.  
8. **Nenhuma influência em C3**; **nenhuma criação automática de Jobs**.  
9. **Gate**, **Motor** e **NCS** preservados.  
10. Integrar com **IMP-061** (histórico), **IMP-062** (referências) e **IMP-063** (gestão de tópicos) sem os revogar.  
11. Sem sinais de goal ⇒ comportamento actual (061+062+063) preservado.

---

## Motivação

| Problema | Efeito actual | Solução deste REQ |
|----------|---------------|-------------------|
| Sem estado de objectivo multi-turno | Cada turno «redescobre» o paraquê (prompt/MRE) | `objetivoActivo` + `objetivoAnterior` de sessão |
| Objectivo confundido com tópico | Shift 063 muda assunto sem modelar outcome | Fronteira Objectivo ≠ Tópico |
| Objectivo confundido com classe/Job | Risco de C3 «para cumprir o objectivo» | Objectivo ≠ Classe ≠ Job; anti-C3 |
| Mudança silenciosa de propósito | Utilizador muda o paraquê; CEO não confirma | Evento `mudar` + pergunta se ambíguo |
| Fragmentação (`objetivoReal` / dia / mensagem) | Inconsistência entre turnos | Um store conversacional no limiar |

---

## Escopo

### Dentro do escopo (V1)

* Módulo puro de gestão de objectivo (entrada: mensagem + `historicoRecente` IMP-061 + estado de sessão `objetivoActivo`/`objetivoAnterior` + `topicoActivo` IMP-063 read-only + sinais opcionais COA / último `objetivoReal` read-only).  
* Estado V1: **um objectivo activo**; **um objectivo anterior**.  
* Detecção DET dos eventos: `estabelecer`; `continuar`; `mudar`; `ambiguo_objetivo` (ambíguo); `neutro`.  
* Pergunta curta quando `ambiguo_objetivo` (e, se Gate pendente + mudança de objectivo, clarificação combinada).  
* Integração: lastro C2 (orientação); **não** pontuação C3; **não** Jobs.  
* Prioridade de uma pergunta por turno: Gate×conflito > ambiguidade de objectivo > ambiguidade de tópico (063) > ambiguidade de referente (062).  
* Coordenação com IMP-063: shift de tópico **não** apaga objectivo por omissão.  
* Testes de regressão IMP-057 / 061 / 062 / 063 / Continuidade + CT deste REQ.  
* Documentação mínima e rastreio EIC.

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (**sem** CAP nova).

### Fora do escopo

* Alterar limiar 0,55 ou enum/regras C1–C4 do Classificador.  
* Abandono automático do objectivo activo ou do Gate (timeout/descarte sem acto do utilizador).  
* Inferência agressiva de «objectivo cumprido» sem acto explícito.  
* Fundir objectivo com `topicoActivo` (IMP-063), com `intencaoDoDia` ou substituir `objetivoReal` do MRE.  
* Pilha profunda de objectivos; persistência DB multi-sessão.  
* LLM / embeddings no limiar.  
* Novas classes de intenção.  
* Redesign de Gate, Motor, NCS, Fila ou Painel.  
* Influenciar C3 / criar Jobs via evento de objectivo.  
* Auto-despacho C3 «para cumprir o objectivo».

---

## Fronteiras explícitas (obrigatórias)

| Fronteira | Significado normativo deste REQ |
|-----------|----------------------------------|
| **Objectivo ≠ Tópico** | Objectivo = *outcome* desejado no fio; Tópico (IMP-063) = *assunto*. Shift de tópico **não** implica mudança de objectivo por omissão. |
| **Objectivo ≠ Classe** | Classe C1–C4 é decisão exclusiva do Classificador (ARQ-018). O gestor de objectivo **não** escreve `classe`. |
| **Objectivo ≠ Job** | Job / tarefa executável é efeito do Motor pós-Gate (C3). O gestor de objectivo **não** cria Jobs nem define `permiteJob: true`. |

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá disponibilizar um **gestor de objectivo conversacional** que opera sobre a mensagem actual, a janela de histórico do **IMP-061** e o estado de objectivos da sessão. |
| **RF2** | Em qualquer momento da sessão V1 existirá **no máximo um objectivo activo**. |
| **RF3** | Poderá existir **no máximo um objectivo anterior** (slot único); o activo deslocado por `mudar` ocupa esse slot (substituindo o anterior, se houver). |
| **RF4** | O gestor deverá detectar e expor os eventos: **estabelecer** (`estabelecer`); **continuar** (`continuar`); **mudar** (`mudar`); **ambíguo** (`ambiguo_objetivo`); **neutro** (`neutro`). |
| **RF5** | Quando o estado for **ambiguidade de objectivo**, o sistema deverá emitir uma **pergunta curta** e contextualizada — **sem** Job e **sem** forçar C3. |
| **RF6** | O sistema **não** deverá **abandonar automaticamente** o objectivo activo (sem acto explícito do utilizador ou evento `mudar`/`estabelecer` conforme política). |
| **RF7** | O **Classificador de Intenção** permanece o **único ponto oficial de decisão de classe**; o gestor **não** substitui nem duplica `classificar` (**Objectivo ≠ Classe**). |
| **RF8** | O resultado da gestão de objectivo **não** poderá alterar a classificação para **C3**, nem definir `permiteJob: true`, nem **criar** Jobs (**Objectivo ≠ Job**; **nenhuma influência em C3**; **nenhuma criação automática de Jobs**). |
| **RF9** | A Continuidade do **Gate** (ARQ-019 / REQ-058) permanece **preservada**: corre antes; léxico de decisão intacto; o gestor **não** resolve Gates nem publica Jobs. |
| **RF10** | O **Motor** (ARQ-017 / REQ-056) permanece **preservado** — sem alteração de contrato; o gestor não o invoca. |
| **RF11** | O **NCS** (ARQ-014) permanece **preservado** — sem alteração de contrato. |
| **RF12** | Se existir Gate pendente e for detectada **mudança** (ou estabelecimento claramente novo) de objectivo, o sistema poderá emitir **clarificação combinada** mínima (Gate vs novo objectivo) — **sem** abandono automático do Gate nem do objectivo activo. |
| **RF13** | A janela conversacional utilizada para sinais de objectivo **deverá reutilizar** a do **IMP-061** (4 / 200 / 800) — sem alargamento no V1. |
| **RF14** | O gestor deverá **coordenar-se** com o Resolvedor (**IMP-062**): objectivo activo como lastro/orientação fraca **sem** revogar a resolução de referentes; evitar **duas** perguntas no mesmo turno. |
| **RF15** | O gestor deverá **coordenar-se** com o Gestor de Tópicos (**IMP-063**): poderá referenciar `topicoActivo` (read-only); shift de tópico **não** apaga o objectivo activo por omissão (**Objectivo ≠ Tópico**). |
| **RF16** | Sem evento que exija pergunta ou actualização (`neutro` / ausência de sinais) ⇒ comportamento dos destinos permanece o baseline **IMP-061 + IMP-062 + IMP-063** (preservação). |
| **RF17** | O gestor deverá ser **função pura** quanto à decisão de evento (sem I/O, sem SDK, sem efeitos de Job); o estado activo/anterior pode viver em store de **sessão** injectável (sem DB nova no V1). |
| **RF18** | Eventos e estado de objectivo deverão ser auditáveis (`razaoObjectivo` ou equivalente, sem secrets). |
| **RF19** | REQ-057, REQ-061, REQ-062, REQ-063 e IMP-057/061/062/063 permanecem vigentes; este REQ **complementa** e **não** os revoga. |
| **RF20** | `objetivoReal` do MRE e `intencaoDoDia` do painel **não** são substituídos por este REQ; poderão ser sinais **read-only** opcionais na ARQ/IMP — o store canónico de goal conversacional é o deste REQ. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Desempenho:** detecção DET, O(K) com K≤4 na janela; sem LLM no limiar. |
| **RNF2** | **Testabilidade:** suite CT + regressão classificador (057/061/062/063) e Continuidade. |
| **RNF3** | **Tempo do utilizador:** no máximo uma pergunta curta por turno em cascata de ambiguidades. |
| **RNF4** | **EIC / ADR-006:** IMP só após ARQ-025 (ou ID atribuído) + Gates aplicáveis. |
| **RNF5** | **Segurança:** razões e enunciados de objectivo sem secrets. |
| **RNF6** | **Observabilidade:** evento + objectivo activo/anterior inspeccionáveis no diagnóstico do turno. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | **Um** objectivo activo (RF2). |
| **RST2** | **Um** objectivo anterior (RF3). |
| **RST3** | Eventos: estabelecer, continuar, mudar, ambíguo, neutro (RF4). |
| **RST4** | Objectivo ≠ Tópico; Objectivo ≠ Classe; Objectivo ≠ Job. |
| **RST5** | Pergunta curta quando houver dúvida (RF5). |
| **RST6** | **Não** abandonar automaticamente o objectivo activo (RF6). |
| **RST7** | Classificador = único decisor de classe (RF7). |
| **RST8** | **Nenhuma** influência em C3; **nenhuma** criação automática de Jobs (RF8). |
| **RST9** | Gate, Motor e NCS **preservados** (RF9–RF11). |
| **RST10** | Integração obrigatória com IMP-061, IMP-062 e IMP-063 (RF13–RF15). |
| **RST11** | Sem CAP nova; sem LLM no limiar; sem abandono auto de Gate. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Estado de sessão: ≤1 objectivo activo e ≤1 objectivo anterior (RF2–RF3). |
| **CA2** | Eventos `estabelecer`, `continuar`, `mudar`, `ambiguo_objetivo`, `neutro` produzíveis e testáveis (RF4). |
| **CA3** | Ambiguidade de objectivo ⇒ pergunta curta; `motorAcionado` false; 0 Jobs (RF5, RF8). |
| **CA4** | Sem acto do utilizador / sem `mudar`\|`estabelecer` válido ⇒ objectivo activo **não** desaparece sozinho (RF6). |
| **CA5** | Source do gestor não decide `classe`/`permiteJob`; Classificador permanece único decisor (RF7). |
| **CA6** | Nenhum fixture de goal produz C3/`permiteJob` só por evento de objectivo (RF8). |
| **CA7** | Gate pendente + «Aprovado» ⇒ Continuidade; gestor não usurpa (RF9). |
| **CA8** | Gate / Motor / NCS: contratos e suites de regressão intactos (RF9–RF11). |
| **CA9** | Gate pendente + mudança de objectivo ⇒ clarificação combinada ou pergunta; Gate **não** auto-resolvido (RF12). |
| **CA10** | Janela = IMP-061 (4/200/800) (RF13). |
| **CA11** | Shift de tópico (IMP-063) sem marcador de goal ⇒ objectivo activo **preservado** (RF15; Objectivo ≠ Tópico). |
| **CA12** | Suites IMP-057 + IMP-061 + IMP-062 + IMP-063 + Continuidade verdes após IMP. |
| **CA13** | Documentação referencia ANL-009, ARQ-018, IMP-061/062/063, este REQ e EIC CAP-07. |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | Gestor decide ou altera a **classe** C1–C4. |
| **NA2** | Evento de objectivo força **C3** / Job. |
| **NA3** | Abandono **automático** do objectivo activo ou do Gate. |
| **NA4** | Mais de um objectivo activo ou mais de um anterior no V1. |
| **NA5** | LLM no limiar para goal tracking. |
| **NA6** | Fundir objectivo com tópico (IMP-063) ou com Job. |
| **NA7** | Duas ou mais perguntas obrigatórias no mesmo turno sem prioridade. |
| **NA8** | Redesign de Gate, Motor, NCS ou Fila. |
| **NA9** | Implementação sem ARQ + IMP + Gates ADR-006 / EIC aplicáveis. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ANL-009** | Base analítica; Alt. D (gestor DET) |
| **ARQ-018** | Classificador intacto; §4.4 para classe; Objectivo ≠ Classe |
| **ARQ-022 / IMP-061** | Janela reutilizada (Histórico) |
| **ARQ-023 / IMP-062** | Coordenação de referentes; não revogado |
| **ARQ-024 / IMP-063** | Coordenação de tópicos; Objectivo ≠ Tópico; não revogado |
| **ARQ-019 / REQ-058** | Gate preservado |
| **ARQ-017 / REQ-056** | Motor preservado |
| **ARQ-014 / NCS** | NCS preservado |
| **Jobs / Fila** | Contratos inalterados; Objectivo ≠ Job |
| **EIC** | CAP-07; 4ª frente CSC; G-EIC-D antes de IMP |
| **ADR-006 / ADR-015** | Fluxo oficial; uso diário MG2 |

**Nota:** A **ARQ-025** especifica o Gestor de Objectivo como módulo auxiliar (estado, eventos, integração após IMP-061/063/062), **sem** substituir ARQ-018/022/023/024.

---

## Casos de teste previstos

| ID | Tipo | Entrada (síntese) | Esperado |
|----|------|-------------------|----------|
| **CT-G01** | Baseline | Sem marcadores / neutro | Comportamento 061+062+063; activo inalterado se existir (CA4) |
| **CT-G02** | Estado | estabelecer + mudar | ≤1 activo; ≤1 anterior (CA1) |
| **CT-G03** | Estabelecer | «O objectivo é priorizar o outdoor» | Evento `estabelecer`; objectivo activo auditável |
| **CT-G04** | Continuar | Deixis / «continua» com objectivo activo | Evento `continuar`; activo preservado |
| **CT-G05** | Mudar | «Agora o objectivo é decidir o pagamento» | `mudar`; novo activo; anterior preenchido; ≠ C3 |
| **CT-G06** | Ambíguo | Dois outcomes sem marcador claro | `ambiguo_objetivo` + pergunta curta; 0 Jobs |
| **CT-G07** | Anti-C3 | estabelecer / mudar / ambíguo | Classe ≠ C3 só por evento; `permiteJob` false |
| **CT-G08** | C3 actual | «Implementa X» | C3 do Classificador preservado; gestor ≠ Job |
| **CT-G09** | Objectivo ≠ Tópico | Shift tópico 063 sem marcador de goal | Objectivo activo preservado (CA11) |
| **CT-G10** | Gate | Gate + «Aprovado» | Continuidade (CA7) |
| **CT-G11** | Gate×objectivo | Gate pendente + mudança de objectivo | Clarificação combinada; Gate não auto-fechado (CA9) |
| **CT-G12** | Fronteira | Source gestor | Sem Motor/NCS/Fila/SDK como efeito; sem `classe`/`permiteJob` |
| **CT-G13** | Regressão | Suites 057/061/062/063 + Continuidade | Verde (CA12) |
| **CT-G14** | Uma pergunta | Ambiguidade objectivo + tópico/deixis | No máximo uma pergunta (prioridade RF14) |

---

## Estratégia de rollback

| Fase | Acção |
|------|--------|
| **R1** | Desactivar gestor no Núcleo / ignorar eventos ⇒ path IMP-061+062+063 (RF16) — **preferido** |
| **R2** | Flag de activação no IMP | Desligar = R1 |
| **R3** | Revert do IMP | Remove módulo; estado de sessão descartável sem migração DB |
| **R4** | Activar se | Falsas mudanças de objectivo; violação C3/Gate; regressão CA12; colapso com tópico |

---

## Dependências

| Elo | Referência |
|-----|------------|
| Análise | ANL-009 |
| Histórico | ARQ-022, REQ-061, IMP-061 |
| Referentes | ARQ-023, REQ-062, IMP-062 |
| Tópicos | ARQ-024, REQ-063, IMP-063 |
| Classificador | ARQ-018, REQ-057, IMP-057 |
| Gate | ARQ-019, REQ-058 — preservado |
| Motor | ARQ-017, REQ-056 — preservado |
| NCS | ARQ-014 — preservado |
| Governança | ADR-006; EIC; ADR-015 |

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Colapso objectivo ↔ tópico | RF15; CA11; NA6; ARQ-025 fronteiras |
| Colapso objectivo ↔ Job/C3 | RF7–RF8; CT-G07/G08; NA1–NA2 |
| Falsa mudança de objectivo | Preferir `continuar` em dúvida; marcadores explícitos V1 |
| Cascata de perguntas | RF14; CT-G14 |
| Confusão com MRE/`intencaoDoDia` | RF20 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º.1–9º.2; ADR-015; ARQ-018; IMP-061; IMP-062; IMP-063; **ARQ-025**; ADR-006 |
| Origem | ANL-009; comando patrocinador 03/08/2026 |
| Decisões derivadas | ARQ-025 (Em análise v0.1); **IMP-064** (Implementada — pronta para homologação) |
| Implementação | [`IMP-064-objetivo-conversacional.md`](../implementation/IMP-064-objetivo-conversacional.md) |
| Testes | CT-G01…CT-G14; regressão 057/061/062/063 + Continuidade |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação | ANL-009 → REQ oficial | Em análise |

---

**Estado:** REQ elaborada — **ARQ-025** + **IMP-064** concluídas; pronta para homologação.  
**Sem implementação de código, prompts ou comportamento neste acto.**

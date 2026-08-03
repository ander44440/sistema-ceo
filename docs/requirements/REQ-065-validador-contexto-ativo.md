# REQ-065 — Validador de Contexto Ativo

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **validar se a mensagem actual pertence ao contexto conversacional activo** — **antes** de activar a cadeia EIC CSC (IMP-061 → IMP-064) — expondo os estados **pertence**, **independente**, **conhecimento_geral**, **metaconversa**, **novo_contexto** e **ambiguo_contexto**, de modo que **apenas** `pertence` autorize o lastro CSC, os demais estados **preservem** os stores existentes **sem** os utilizar como lastro neste turno, com **pergunta curta** em ambiguidade, **sem** criar Jobs, **sem** influenciar C3, **sem** alterar o Classificador como único decisor de classe, e com **Gate**, **Motor** e **NCS** preservados.

## Tipo

Funcional; detalhado (validador de pertença / VCA — camada **pré-cadeia** EIC sob CAP-07; pós IMP-061…064 homologadas).

## Justificativa

A **ANL-010** constata que, após histórico, referentes, tópicos e objectivo (IMP-061…064), o CEO **assume por omissão** que toda mensagem nova pertence ao fio activo. A pertença nunca é testada; o lastro CSC é injectado automaticamente, causando **falsas continuações** observadas em testes executivos. Motivações: CON-001 Art. 9º.1–9º.2 (tempo do utilizador; nunca perder contexto — stores preservados; CEO ≠ chatbot); ADR-015; EIC (fundação pré-cadeia); ADR-006; preservação de ARQ-018 e IMP-061…064 (condicionar uso, não revogar).

---

## Objetivo

1. Introduzir um **Validador de Contexto Ativo (VCA)** auxiliar (não um segundo classificador).  
2. Decidir a **pertença** da mensagem ao contexto activo **antes** da cadeia IMP-061 → IMP-064.  
3. Expor explicitamente os estados: **pertence**; **independente**; **conhecimento_geral**; **metaconversa**; **novo_contexto**; **ambiguo_contexto**.  
4. Garantir que **apenas** `pertence` activa a cadeia IMP-061 → IMP-064 (lastro CSC).  
5. Nos demais estados: **preservar** stores (tópico, objectivo, etc.) **sem** os utilizar como lastro neste turno.  
6. Em `ambiguo_contexto`: **pergunta curta** — sem Job e sem C3.  
7. Preservar o Classificador como **único ponto oficial de decisão de classe**.  
8. **Nenhuma influência em C3**; **nenhuma criação automática de Jobs**.  
9. **Gate**, **Motor** e **NCS** preservados.  
10. Sem sinais de isolamento / com `pertence` ⇒ comportamento actual (061…064) preservado.

---

## Motivação

| Problema | Efeito actual | Solução deste REQ |
|----------|---------------|-------------------|
| Pertença automática ao fio | Falsas continuações; contaminação C1↔C2 | VCA pré-cadeia; `autorizaLastroCsc` só em `pertence` |
| Pergunta independente no meio do MG2 | Herda outdoor/objectivo | Estado `independente` — classificar sem lastro CSC |
| Conhecimento geral no fio | S3 puxa para projecto | Estado `conhecimento_geral` — path limpo |
| Metaconversa CEO | Lastros de tópico/objectivo indevidos | Estado `metaconversa` — isolamento de lastro |
| Novo contexto sem marcação | Continua o fio antigo | Estado `novo_contexto` — sem lastro; stores preservados |
| Dúvida de pertença | Assumir continuidade (enviesamento) | `ambiguo_contexto` + pergunta curta |

---

## Escopo

### Dentro do escopo (V1)

* Módulo puro `validarContextoAtivo` (entrada: mensagem + sinais read-only: histórico candidato, `topicoActivo`, `objetivoActivo`, `frenteActiva`, marcadores DET).  
* Estados V1: `pertence` | `independente` | `conhecimento_geral` | `metaconversa` | `novo_contexto` | `ambiguo_contexto`.  
* Regra de activação: **somente** `pertence` ⇒ `autorizaLastroCsc = true` ⇒ corre IMP-061 → IMP-063 → IMP-062 → IMP-064 → classificar (path actual).  
* Demais estados ⇒ `autorizaLastroCsc = false` ⇒ classificar **sem** injectar `historicoRecente` / sem orientar 062–064 neste turno; **stores preservados**.  
* Pergunta curta quando `ambiguo_contexto`.  
* Integração no Núcleo: **após Gate**, **antes** da cadeia CSC.  
* Prioridade de uma pergunta por turno: Gate×conflito > `ambiguo_contexto` > ambiguidade objectivo (064) > tópico (063) > referente (062).  
* Testes de regressão IMP-057 / 061 / 062 / 063 / 064 / Continuidade + CT deste REQ.  
* Documentação mínima e rastreio EIC.

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (**sem** CAP nova).

### Fora do escopo

* Alterar limiar 0,55 ou enum/regras C1–C4 do Classificador.  
* Reset / abandono automático permanente de tópico, objectivo ou Gate.  
* Revogar ou reescrever contratos internos de IMP-061…064 (apenas condicionar activação).  
* LLM / embeddings no limiar.  
* Novas classes de intenção.  
* Redesign de Gate, Motor, NCS, Fila ou Painel.  
* Influenciar C3 / criar Jobs via veredicto VCA.  
* Alargar a janela 4/200/800 do IMP-061.

---

## Estados explícitos (obrigatórios)

| Estado | Significado | Activa cadeia IMP-061→064? | Stores (tópico/objectivo/…) |
|--------|-------------|----------------------------|-----------------------------|
| **pertence** | Mensagem continua o contexto activo | **Sim** (`autorizaLastroCsc = true`) | Utilizados como lastro (path actual) |
| **independente** | Pergunta/pedido autónomo | **Não** | **Preservados**; **não** usados como lastro neste turno |
| **conhecimento_geral** | Domínio geral (C1 típico) | **Não** | Preservados; sem lastro CSC |
| **metaconversa** | Sobre o próprio CEO / papel / meta | **Não** | Preservados; sem lastro de projecto/tópico/objectivo |
| **novo_contexto** | Abertura clara de outro fio | **Não** | Preservados no V1 (sem limpeza auto); sem lastro do fio anterior |
| **ambiguo_contexto** | Pertença duvidosa | **Não** (até esclarecer) | Preservados; pergunta curta |

**Regra normativa:** *Apenas `pertence` activa a cadeia IMP-061 → IMP-064.*  
**Regra normativa:** *Os demais estados preservam os stores existentes sem os utilizar como lastro.*

---

## Fronteiras explícitas (obrigatórias)

| Fronteira | Significado normativo deste REQ |
|-----------|----------------------------------|
| **VCA ≠ Classe** | VCA decide **pertença / isolamento**; Classificador decide **C1–C4**. |
| **VCA ≠ Gate** | Gate decide aprovação; VCA não resolve Gates. |
| **VCA ≠ Job** | VCA nunca cria Jobs nem define `permiteJob`. |
| **Isolamento ≠ esquecimento** | Não injectar lastro ≠ apagar stores (CON-001: nunca perder o contexto). |

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá disponibilizar um **Validador de Contexto Ativo** que opera sobre a mensagem actual e sinais read-only do contexto de sessão (histórico candidato, tópico, objectivo, frente). |
| **RF2** | O VCA deverá expor exactamente os estados: `pertence`; `independente`; `conhecimento_geral`; `metaconversa`; `novo_contexto`; `ambiguo_contexto`. |
| **RF3** | **Apenas** o estado `pertence` deverá activar a cadeia **IMP-061 → IMP-064** (montagem/injectação de lastro CSC). |
| **RF4** | Nos estados `independente`, `conhecimento_geral`, `metaconversa`, `novo_contexto` e `ambiguo_contexto`, o sistema **deverá preservar** os stores existentes (tópico, objectivo, e afins) **sem** os utilizar como lastro neste turno. |
| **RF5** | Quando o estado for `ambiguo_contexto`, o sistema deverá emitir uma **pergunta curta** e contextualizada — **sem** Job e **sem** forçar C3. |
| **RF6** | O VCA deverá executar-se **após** a Continuidade do Gate e **antes** de IMP-061 / 062 / 063 / 064. |
| **RF7** | O **Classificador de Intenção** permanece o **único ponto oficial de decisão de classe**; o VCA **não** substitui nem duplica `classificar`. |
| **RF8** | O resultado do VCA **não** poderá alterar a classificação para **C3**, nem definir `permiteJob: true`, nem **criar** Jobs (**nenhuma influência em C3**; **nenhuma criação automática de Jobs**). |
| **RF9** | A Continuidade do **Gate** (ARQ-019 / REQ-058) permanece **preservada**: corre antes; léxico de decisão intacto; o VCA **não** resolve Gates nem publica Jobs. |
| **RF10** | O **Motor** (ARQ-017 / REQ-056) permanece **preservado** — sem alteração de contrato; o VCA não o invoca. |
| **RF11** | O **NCS** (ARQ-014) permanece **preservado** — sem alteração de contrato. |
| **RF12** | Se Gate pendente e VCA indicar isolamento (`independente` / `conhecimento_geral` / `metaconversa` / `novo_contexto`), o sistema poderá emitir **clarificação combinada** mínima (Gate vs mensagem nova) — **sem** abandono automático do Gate. |
| **RF13** | Com veredicto `pertence` (ou ausência de isolamento detectável conforme política de preservação), o comportamento dos destinos permanece o baseline **IMP-061 + IMP-062 + IMP-063 + IMP-064**. |
| **RF14** | Em isolamento (`autorizaLastroCsc = false`), a classificação deverá ocorrer **sem** `historicoRecente` injectado e **sem** orientação de referente/tópico/objectivo neste turno (path alinhado ao baseline IMP-057 sem lastro CSC). |
| **RF15** | O VCA deverá ser **função pura** quanto ao veredicto (sem I/O, sem SDK, sem efeitos de Job). |
| **RF16** | Veredicto e razão deverão ser auditáveis (`razaoContexto` ou equivalente, sem secrets). |
| **RF17** | REQ-057, REQ-061…064 e IMP-057/061…064 permanecem vigentes; este REQ **complementa** e **não** os revoga — apenas **condiciona** a activação do lastro. |
| **RF18** | Em dúvida fraca entre pertença e isolamento, o VCA deverá preferir **isolamento** ou `ambiguo_contexto` (anti **falsa continuação**) — política inversa ao anti falso-shift de tópico quando aplicável. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Desempenho:** detecção DET, O(K) com K≤4 nos sinais; sem LLM no limiar. |
| **RNF2** | **Testabilidade:** suite CT + regressão classificador (057/061/062/063/064) e Continuidade. |
| **RNF3** | **Tempo do utilizador:** no máximo uma pergunta curta por turno em cascata de ambiguidades. |
| **RNF4** | **EIC / ADR-006:** IMP só após ARQ-026 (ou ID atribuído) + Gates aplicáveis. |
| **RNF5** | **Segurança:** razões sem secrets. |
| **RNF6** | **Observabilidade:** veredicto + `autorizaLastroCsc` inspeccionáveis no diagnóstico do turno. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | Estados: pertence, independente, conhecimento_geral, metaconversa, novo_contexto, ambiguo_contexto (RF2). |
| **RST2** | **Apenas** `pertence` activa IMP-061→064 (RF3). |
| **RST3** | Demais estados: stores preservados, sem lastro (RF4). |
| **RST4** | Ambiguidade ⇒ pergunta curta (RF5). |
| **RST5** | Classificador = único decisor de classe (RF7). |
| **RST6** | **Nenhuma** influência em C3; **nenhuma** criação automática de Jobs (RF8). |
| **RST7** | Gate, Motor e NCS **preservados** (RF9–RF11). |
| **RST8** | Sem CAP nova; sem LLM no limiar; sem reset auto de stores no V1. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Os seis estados são produzíveis e testáveis (RF2). |
| **CA2** | Só `pertence` dispara montagem/injectação da cadeia 061→064 (RF3). |
| **CA3** | Em isolamento: stores de tópico/objectivo **inalterados** e **ausentes** do lastro/contexto de classificação neste turno (RF4, RF14). |
| **CA4** | `ambiguo_contexto` ⇒ pergunta curta; `motorAcionado` false; 0 Jobs (RF5, RF8). |
| **CA5** | Source do VCA não decide `classe`/`permiteJob`; Classificador permanece único decisor (RF7). |
| **CA6** | Nenhum fixture de VCA produz C3/`permiteJob` só por veredicto (RF8). |
| **CA7** | Gate pendente + «Aprovado» ⇒ Continuidade; VCA não usurpa (RF9). |
| **CA8** | Gate / Motor / NCS: contratos e suites de regressão intactos (RF9–RF11). |
| **CA9** | Continuação genuína (deixis / «continua» com activo) ⇒ `pertence` + path 061–064 (RF13). |
| **CA10** | Conhecimento geral / pergunta independente no meio do fio ⇒ classificação sem S3 de histórico de projecto (RF14). |
| **CA11** | Suites IMP-057 + 061 + 062 + 063 + 064 + Continuidade verdes após IMP. |
| **CA12** | Documentação referencia ANL-010, ARQ-018, IMP-061…064, este REQ e EIC CAP-07. |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | VCA decide ou altera a **classe** C1–C4. |
| **NA2** | Veredicto VCA força **C3** / Job. |
| **NA3** | Isolamento **apaga** automaticamente tópico/objectivo/Gate. |
| **NA4** | Qualquer estado ≠ `pertence` ainda injecta lastro CSC completo. |
| **NA5** | LLM no limiar para VCA. |
| **NA6** | Duas ou mais perguntas obrigatórias no mesmo turno sem prioridade. |
| **NA7** | Redesign de Gate, Motor, NCS ou Fila. |
| **NA8** | Revogação de IMP-061…064 em vez de condicionar activação. |
| **NA9** | Implementação sem ARQ + IMP + Gates ADR-006 / EIC aplicáveis. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ANL-010** | Base analítica; Alt. C (VCA pré-cadeia) |
| **ARQ-018** | Classificador intacto; VCA ≠ Classe |
| **ARQ-022 / IMP-061** | Janela activada **só** se `pertence` |
| **ARQ-023 / IMP-062** | Resolvedor activado **só** se `pertence` |
| **ARQ-024 / IMP-063** | Tópicos: store preservado; lastro só se `pertence` |
| **ARQ-025 / IMP-064** | Objectivo: store preservado; lastro só se `pertence` |
| **ARQ-019 / REQ-058** | Gate preservado (antes do VCA) |
| **ARQ-017 / REQ-056** | Motor preservado |
| **ARQ-014 / NCS** | NCS preservado |
| **Jobs / Fila** | Contratos inalterados |
| **EIC** | CAP-07; fundação pré-cadeia CSC; G-EIC-D antes de IMP |
| **ADR-006 / ADR-015** | Fluxo oficial; uso diário MG2 |

**Nota:** A **ARQ-026** especifica o VCA como módulo auxiliar pré-cadeia (`autorizaLastroCsc`, isolamento de lastro, stores preservados), **sem** substituir ARQ-018 nem revogar ARQ-022…025.

---

## Casos de teste previstos

| ID | Tipo | Entrada (síntese) | Esperado |
|----|------|-------------------|----------|
| **CT-V01** | Baseline pertença | Deixis / «continua» com tópico activo | `pertence`; cadeia 061–064 activa (CA2, CA9) |
| **CT-V02** | Independente | Pergunta autónoma sem âncora do fio | `independente`; sem `historicoRecente` no classificar; stores intactos |
| **CT-V03** | Conhecimento geral | «O que é um ADR?» no meio do outdoor | `conhecimento_geral`; ≠ C2 por S3 de histórico |
| **CT-V04** | Metaconversa | «Qual é o teu papel?» com objectivo MG2 | `metaconversa`; sem lastro de objectivo/tópico |
| **CT-V05** | Novo contexto | Marcador claro de novo fio | `novo_contexto`; sem lastro do anterior; stores preservados |
| **CT-V06** | Ambíguo | Pertença duvidosa | `ambiguo_contexto` + pergunta curta; 0 Jobs |
| **CT-V07** | Anti-C3 | Todos os estados VCA | Classe ≠ C3 só por veredicto; `permiteJob` false |
| **CT-V08** | C3 actual | «Implementa X» | C3 do Classificador preservado |
| **CT-V09** | Gate | Gate + «Aprovado» | Continuidade (CA7) |
| **CT-V10** | Stores | Isolamento após tópico/objectivo activos | Stores iguais antes/depois; ausentes do lastro |
| **CT-V11** | Fronteira | Source VCA | Sem Motor/NCS/Fila/SDK; sem `classe`/`permiteJob` |
| **CT-V12** | Regressão | Suites 057/061/062/063/064 + Continuidade | Verde (CA11) |
| **CT-V13** | Uma pergunta | ambiguo_contexto + deixis | No máximo uma pergunta (prioridade RF) |
| **CT-V14** | Só pertence activa CSC | Fixture por estado ≠ pertence | Nenhuma chamada efectiva de lastro 061–064 |

---

## Estratégia de rollback

| Fase | Acção |
|------|--------|
| **R1** | Desactivar VCA no Núcleo / forçar `pertence` ⇒ path IMP-061…064 actual — **preferido** |
| **R2** | Flag de activação no IMP | Desligar = R1 |
| **R3** | Revert do IMP | Remove módulo; stores inalterados |
| **R4** | Activar se | Falso isolamento sistemático; violação C3/Gate; regressão CA11; lastro injectado fora de `pertence` |

---

## Dependências

| Elo | Referência |
|-----|------------|
| Análise | ANL-010 |
| Histórico | ARQ-022, REQ-061, IMP-061 — condicionados |
| Referentes | ARQ-023, REQ-062, IMP-062 — condicionados |
| Tópicos | ARQ-024, REQ-063, IMP-063 — condicionados |
| Objectivo | ARQ-025, REQ-064, IMP-064 — condicionados |
| Classificador | ARQ-018, REQ-057, IMP-057 |
| Gate | ARQ-019, REQ-058 — preservado |
| Motor | ARQ-017, REQ-056 — preservado |
| NCS | ARQ-014 — preservado |
| Governança | ADR-006; EIC; ADR-015 |

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Falso isolamento (perder continuidade) | Deixis + overlap de âncora → `pertence`; CT-V01 |
| Falsa continuação residual | RF18; CT-V02…V04 |
| Cascata de perguntas | Prioridade Gate > ambiguo_contexto > 064 > 063 > 062 |
| Apagar contexto ao isolar | RF4; NA3; stores preservados |
| Confusão VCA = Classificador | RF7; NA1 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º.1–9º.2; ADR-015; ARQ-018; IMP-061…064; **ARQ-026**; ADR-006 |
| Origem | ANL-010; comando patrocinador 03/08/2026 |
| Decisões derivadas | ARQ-026 (Em análise v0.1); **IMP-065** (Implementada — pronta para homologação) |
| Implementação | [`IMP-065-validador-contexto-ativo.md`](../implementation/IMP-065-validador-contexto-ativo.md) |
| Testes | CT-V01…CT-V14; regressão 057/061/062/063/064 + Continuidade |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação | ANL-010 → REQ oficial | Em análise |

---

**Estado:** REQ elaborada — **ARQ-026** + **IMP-065** implementada; pronta para homologação.  
**Sem prompts LLM neste acto.**

**Nota:** A **ARQ-026** / **IMP-065** especificam o VCA como módulo auxiliar pré-cadeia (`autorizaLastroCsc`, isolamento de lastro, stores preservados), **sem** substituir ARQ-018 nem revogar ARQ-022…025.

# REQ-063 — Gestão de Mudança de Assunto

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **gerir o tópico conversacional da sessão** — detectando **continuação**, **mudança de assunto**, **retomada** e **ambiguidade** de tópico — mantendo **no máximo um tópico activo** e **até dois tópicos em pausa**, com **pergunta curta** quando houver dúvida, **sem** abandonar automaticamente o tópico activo, **sem** alterar o Classificador como único decisor de classe, **sem** influenciar C3/Jobs, e com o **Gate preservado**.

## Tipo

Funcional; detalhado (gestor de tópicos / topic shift — 3ª frente CSC sob CAP-07; pós IMP-061 e IMP-062).

## Justificativa

A **ANL-008** constata que, após histórico (IMP-061) e referentes (IMP-062), o CEO ainda **reclassifica cada mensagem do zero** (ARQ-018 §4.4) **sem** modelo de tópico activo, shift ou retoma. Mudanças de assunto e retomadas ficam implícitas; com Gate aberto, o conflito é só clarificação de léxico (ARQ-019). Motivações: CON-001 Art. 9º.1–9º.2; ADR-015; EIC (3ª melhoria perceptível CSC); ADR-006; preservação de ARQ-018/022/023 e IMP-061/062.

---

## Objetivo

1. Introduzir um **gestor de mudança de assunto** auxiliar (não um segundo classificador).  
2. Manter **exactamente um** tópico activo (0 ou 1) e **até dois** tópicos em pausa.  
3. Detectar e expor os eventos: **continuação**, **mudança de assunto (shift)**, **retomada**, **ambiguidade** (e neutro quando aplicável).  
4. Em dúvida de tópico: **pergunta curta** contextualizada — sem Job e sem C3.  
5. **Não abandonar automaticamente** o tópico activo.  
6. Preservar o Classificador como **único ponto oficial de decisão de classe**.  
7. **Não influenciar C3**; **não criar Jobs**.  
8. **Gate preservado** (precedência e contratos ARQ-019 / REQ-058).  
9. Reutilizar a janela IMP-061 e coordenar-se com IMP-062 sem os revogar.  
10. Sem sinais de shift/retoma/ambiguidade ⇒ comportamento actual (061+062) preservado.

---

## Motivação

| Problema | Efeito actual | Solução deste REQ |
|----------|---------------|-------------------|
| Sem estado de tópico | Shift e retoma silenciosos ou confusos | Eventos `continuar` / `shift` / `retomar` / `ambiguo_topico` |
| Múltiplos focos MG2 | Outdoor vs pagamento sem pilha | 1 activo + ≤2 pausa |
| Gate + novo assunto | Só clarificação de Gate | Clarificação combinada; sem abandono auto do tópico/Gate |
| Risco de C3 por «mudança» | Histórico/referente já anti-C3 | Gestor **nunca** define classe/Job |

---

## Escopo

### Dentro do escopo (V1)

* Módulo puro de gestão de tópicos (entrada: mensagem + `historicoRecente` IMP-061 + estado de sessão `topicoActivo`/`pausas` + sinais opcionais COA).  
* Estado V1: **um tópico activo**; **até dois** em pausa.  
* Detecção DET de: continuação; mudança de assunto; retomada; ambiguidade (mais neutro).  
* Pergunta curta quando `ambiguo_topico` (e, se Gate pendente + shift, clarificação combinada).  
* Integração: lastro C2 / orientação ao Resolvedor (IMP-062); **não** pontuação C3.  
* Prioridade de uma pergunta por turno: Gate > ambiguidade de tópico > ambiguidade de referente (IMP-062).  
* Testes de regressão IMP-057 / 061 / 062 / Continuidade + CT deste REQ.  
* Documentação mínima e rastreio EIC.

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (**sem** CAP nova).

### Fora do escopo

* Alterar limiar 0,55 ou enum/regras C1–C4 do Classificador.  
* Abandono automático do tópico activo ou do Gate (timeout/descarte sem acto do utilizador).  
* Mais de dois tópicos em pausa.  
* Persistência DB multi-sessão de tópicos.  
* LLM / embeddings no limiar.  
* Novas classes de intenção.  
* Redesign de Gate, Motor, NCS, Fila ou Painel.  
* Influenciar C3 / criar Jobs via evento de tópico.

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá disponibilizar um **gestor de mudança de assunto** que opera sobre a mensagem actual, a janela de histórico do **IMP-061** e o estado de tópicos da sessão. |
| **RF2** | Em qualquer momento da sessão V1 existirá **no máximo um tópico activo**. |
| **RF3** | Poderão existir **até dois tópicos em pausa** simultaneamente; excedentes não são acumulados para além deste limite (política de descarte do mais antigo a detalhar na ARQ/IMP, **sem** abandono silencioso do activo). |
| **RF4** | O gestor deverá detectar e expor pelo menos os eventos: **continuação** (`continuar`); **mudança de assunto** (`shift`); **retomada** (`retomar`); **ambiguidade** (`ambiguo_topico`); e poderá expor `neutro` quando não houver actualização temática. |
| **RF5** | Quando o estado for **ambiguidade de tópico**, o sistema deverá emitir uma **pergunta curta** e contextualizada ao utilizador — **sem** Job e **sem** forçar C3. |
| **RF6** | O sistema **não** deverá **abandonar automaticamente** o tópico activo (sem acto explícito do utilizador ou evento `shift`/`retomar` conforme política). |
| **RF7** | O **Classificador de Intenção** permanece o **único ponto oficial de decisão de classe**; o gestor **não** substitui nem duplica `classificar`. |
| **RF8** | O resultado da gestão de tópicos **não** poderá alterar a classificação para **C3**, nem definir `permiteJob: true`, nem **criar** Jobs. |
| **RF9** | A Continuidade do **Gate** (ARQ-019 / REQ-058) permanece **preservada**: corre antes; léxico de decisão intacto; o gestor **não** resolve Gates nem publica Jobs. |
| **RF10** | Se existir Gate pendente e for detectado `shift` (ou pedido claramente novo), o sistema poderá emitir **clarificação combinada** mínima (Gate vs novo assunto) — **sem** abandono automático do Gate nem do tópico activo. |
| **RF11** | A janela conversacional utilizada para sinais temáticos **deverá reutilizar** a do IMP-061 (4 / 200 / 800) — sem alargamento no V1. |
| **RF12** | O gestor deverá **coordenar-se** com o Resolvedor (IMP-062): orientar foco/`topicoActivo` sem revogar a resolução de referentes; evitar **duas** perguntas no mesmo turno (prioridade RF5/RF10 vs ambiguidade de referente). |
| **RF13** | Sem evento que exija pergunta ou actualização (`neutro` / ausência de sinais) ⇒ comportamento dos destinos permanece o baseline **IMP-061 + IMP-062** (preservação). |
| **RF14** | O gestor deverá ser **função pura** quanto à decisão de evento (sem I/O, sem SDK, sem efeitos de Job); o estado activo/pausas pode viver em store de **sessão** injectável (sem DB nova no V1). |
| **RF15** | Eventos e estado de tópico deverão ser auditáveis (`razaoTopico` ou equivalente, sem secrets). |
| **RF16** | REQ-057, REQ-061, REQ-062 e IMP-057/061/062 permanecem vigentes; este REQ **complementa** e **não** os revoga. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Desempenho:** detecção DET, O(K) com K≤4 na janela; sem LLM no limiar. |
| **RNF2** | **Testabilidade:** suite CT + regressão classificador (057/061/062) e Continuidade. |
| **RNF3** | **Tempo do utilizador:** no máximo uma pergunta curta por turno em cascata de ambiguidades. |
| **RNF4** | **EIC / ADR-006:** IMP só após ARQ-024 (ou ID atribuído) + Gates aplicáveis. |
| **RNF5** | **Segurança:** razões e âncoras sem secrets. |
| **RNF6** | **Observabilidade:** evento + tópico activo/pausas inspeccionáveis no diagnóstico do turno. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | **Um** tópico activo (RF2). |
| **RST2** | **Até dois** tópicos em pausa (RF3). |
| **RST3** | Detectar continuação, mudança, retomada, ambiguidade (RF4). |
| **RST4** | Pergunta curta quando houver dúvida (RF5). |
| **RST5** | **Não** abandonar automaticamente o tópico activo (RF6). |
| **RST6** | Classificador = único decisor de classe (RF7). |
| **RST7** | **Não** influenciar C3; **não** criar Jobs (RF8). |
| **RST8** | **Gate preservado** (RF9–RF10). |
| **RST9** | Sem CAP nova; sem LLM no limiar; sem >2 pausas; sem abandono auto de Gate. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Estado de sessão: ≤1 activo e ≤2 pausas (RF2–RF3). |
| **CA2** | Eventos `continuar`, `shift`, `retomar`, `ambiguo_topico` (e `neutro`) produzíveis e testáveis (RF4). |
| **CA3** | Ambiguidade de tópico ⇒ pergunta curta; `motorAcionado` false; 0 Jobs (RF5, RF8). |
| **CA4** | Sem acto do utilizador / sem `shift`\|`retomar` válido ⇒ tópico activo **não** desaparece sozinho (RF6). |
| **CA5** | Source do gestor não decide `classe`/`permiteJob`; Classificador permanece único decisor (RF7). |
| **CA6** | Nenhum fixture de shift/retoma produz C3/`permiteJob` só por evento de tópico (RF8). |
| **CA7** | Gate pendente + «Aprovado» ⇒ Continuidade; gestor não usurpa (RF9). |
| **CA8** | Gate pendente + shift ⇒ clarificação combinada ou pergunta; Gate **não** auto-resolvido (RF10). |
| **CA9** | Janela = IMP-061 (4/200/800) (RF11). |
| **CA10** | Suites IMP-057 + IMP-061 + IMP-062 + Continuidade verdes após IMP. |
| **CA11** | Documentação referencia ANL-008, ARQ-018/022/023, IMP-061/062, este REQ e EIC CAP-07. |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | Gestor decide ou altera a **classe** C1–C4. |
| **NA2** | Evento de tópico força **C3** / Job. |
| **NA3** | Abandono **automático** do tópico activo ou do Gate. |
| **NA4** | Mais de dois tópicos em pausa no V1. |
| **NA5** | LLM no limiar para topic shift. |
| **NA6** | Duas perguntas obrigatórias no mesmo turno (tópico + referente) sem prioridade. |
| **NA7** | Redesign de Gate, Motor, NCS ou Fila. |
| **NA8** | Implementação sem ARQ + IMP + Gates ADR-006 / EIC aplicáveis. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ANL-008** | Base analítica; Alt. B (gestor DET) |
| **ARQ-018** | Classificador intacto; §4.4 para classe |
| **ARQ-022 / IMP-061** | Janela reutilizada |
| **ARQ-023 / IMP-062** | Coordenação de foco; não revogado |
| **ARQ-019 / REQ-058** | Gate preservado |
| **ARQ-017 / NCS / Jobs** | Contratos inalterados |
| **EIC** | CAP-07; 3ª frente CSC; G-EIC-D antes de IMP |
| **ADR-006 / ADR-015** | Fluxo oficial; uso diário MG2 |

**Nota:** A **ARQ-024** especifica o Gestor de Tópicos como módulo auxiliar (estado, eventos, integração após IMP-061 e com IMP-062), **sem** substituir ARQ-018/022/023.

---

## Casos de teste previstos

| ID | Tipo | Entrada (síntese) | Esperado |
|----|------|-------------------|----------|
| **CT-T01** | Baseline | Sem marcadores / neutro | Comportamento 061+062; activo inalterado se existir (CA4) |
| **CT-T02** | Estado | Operações shift/retomar | ≤1 activo; ≤2 pausas (CA1) |
| **CT-T03** | Continuar | Deixis / «continua» no mesmo tópico | Evento `continuar` |
| **CT-T04** | Shift explícito | «Agora sobre o pagamento» com outdoor activo | `shift`; pagamento activo; outdoor em pausa; ≠ C3 |
| **CT-T05** | Retomar | «Voltando ao outdoor» com outdoor em pausa | `retomar`; lastro outdoor |
| **CT-T06** | Ambiguidade | Dois tópicos sem marcador claro | `ambiguo_topico` + pergunta curta; 0 Jobs |
| **CT-T07** | Anti-C3 | Shift / retomar / ambíguo | Classe ≠ C3 só por evento; `permiteJob` false |
| **CT-T08** | C3 actual | «Implementa X» | C3 do Classificador preservado |
| **CT-T09** | Gate | Gate + «Aprovado» | Continuidade (CA7) |
| **CT-T10** | Gate×shift | Gate pendente + novo assunto | Clarificação combinada; Gate não auto-fechado (CA8) |
| **CT-T11** | Fronteira | Source gestor | Sem Motor/NCS/Fila/SDK como efeito |
| **CT-T12** | Regressão | Suites 057/061/062 + Continuidade | Verde (CA10) |
| **CT-T13** | Uma pergunta | Ambiguidade tópico + deixis | No máximo uma pergunta (prioridade RF12) |

---

## Estratégia de rollback

| Fase | Acção |
|------|--------|
| **R1** | Desactivar gestor no Núcleo / ignorar eventos ⇒ path IMP-061+062 (RF13) — **preferido** |
| **R2** | Flag de activação no IMP | Desligar = R1 |
| **R3** | Revert do IMP | Remove módulo; estado de sessão descartável sem migração DB |
| **R4** | Activar se | Falsos shifts sistemáticos; violação C3/Gate; regressão CA10 |

---

## Dependências

| Elo | Referência |
|-----|------------|
| Análise | ANL-008 |
| Histórico | ARQ-022, REQ-061, IMP-061 |
| Referentes | ARQ-023, REQ-062, IMP-062 |
| Classificador | ARQ-018, REQ-057, IMP-057 |
| Gate | ARQ-019, REQ-058 — preservado |
| Governança | ADR-006; EIC; ADR-015 |

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Falso shift | Preferir `continuar` em dúvida; famílias IMP-062 |
| Duas perguntas | RF12 / CT-T13 |
| Abandono indevido | RF6 / NA3 |
| Confusão com IMP-062 | RF12; ARQ-024 fronteiras |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º.1–9º.2; ADR-015; ARQ-018; ARQ-022; ARQ-023; **ARQ-024**; ADR-006 |
| Origem | ANL-008; comando patrocinador 03/08/2026 |
| Decisões derivadas | ARQ-024 (Em análise v0.1); **IMP-063** (Implementada — pronta para homologação) |
| Implementação | [`IMP-063-gestao-mudanca-de-assunto.md`](../implementation/IMP-063-gestao-mudanca-de-assunto.md) |
| Testes | CT-T01…CT-T13; regressão 057/061/062 + Continuidade |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação | ANL-008 → REQ oficial | Em análise |

---

**Estado:** REQ elaborada — **ARQ-024** + **IMP-063** concluídas; pronta para homologação.  
**Sem implementação de código, prompts ou comportamento neste acto.**

# REQ-035 — Requisitos da CAP-08 (Planejamento Executivo)

> **Status:** Homologado — v1.0 (CTO, 24/07/2026). **Congelado — CAP-08 concluída.**  
> **Versão:** 1.0 — 24/07/2026  
> **Capacidade:** CAP-08 — Planejamento  
> **Identificação:** REQ-035 (REQ-034 = CAP-07).  
> **Natureza:** especificação de requisitos funcionais e não funcionais derivados **exclusivamente** da VIS-006 Aprovada v1.0.  
> **Princípio Arquitetural (obrigatório):** *"O CEO analisa antes de recomendar, recomenda antes de planejar e planeja antes de executar."*  
> **Ciclo CAP-08:** **encerrado**. Relatório: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md).  
> **Proibição:** **não** reabrir este REQ sem novo ciclo formal.

---

## 1. Objetivo

Transformar a VIS-006 em requisitos **claros, testáveis e rastreáveis**, de modo que a CAP-08 (Planejamento Executivo) possa ser arquitetada, implementada e validada sem ambiguidade.

Este REQ especifica **o que** o planejamento e a Análise Executiva devem garantir; **não** define **como** (ARQ/IMP).

Obrigações centrais deste pacote:

1. materializar a **Análise Executiva** em requisitos objetivos, verificáveis e testáveis;  
2. materializar a **Suficiência da Análise Executiva** (quando há base adequada para recomendar, sem ciclos infinitos);  
3. preservar integralmente o Princípio Arquitetural homologado;  
4. respeitar o ÉPICO-002 e as baselines MVP / CAP-05 / CAP-07.

---

## 2. Escopo

### 2.1 Inclui

| Item | Descrição |
|------|-----------|
| Análise Executiva | Etapa obrigatória precedente: contexto, lacunas, riscos, dependências, alternativas, justificativa, confiança |
| Suficiência da Análise | Determinar quando há informação suficiente para recomendar, sem ciclos infinitos de investigação |
| Recomendação fundamentada | Recomendar com base na análise, antes de planejar |
| Planejamento Executivo | Transformar objetivos/prioridades em planos coordenados (passos/tarefas) |
| Proposta ≠ vigência | Recomendações e planos não vigoram sem confirmação do usuário |
| Cadeia do Princípio | Analisar → recomendar → planejar → executar (execução fora do CEO) |
| Preservação de baselines | Extensão sem regressão de MVP, CAP-05 e CAP-07 |

### 2.2 Exclui

| Item | Motivo |
|------|--------|
| Arquitetura / stack / UI kit | Fase ARQ |
| Implementação e validação | Fases IMP / VAL |
| CAP-02 (Gestão de Agentes) | Capacidade distinta; abertura por deliberação própria |
| CAP-03 (Gestão de Projetos) | Capacidade distinta; recorte inicial do E4 por deliberação própria |
| CAP-09 (Observabilidade) | Épico E5 |
| CAP-06 / CAP-12 | Épico E7 |
| Alterar registro/decisão da CAP-05 ou comunicação da CAP-07 | Baselines preservadas |
| Execução técnica do MG2 | Fronteira de execução |

---

## 3. Requisitos Funcionais

### RF-01 — Preceder o planejamento por Análise Executiva

#### Enunciado

O CEO deverá, antes de produzir qualquer recomendação ou plano executivo, realizar uma **Análise Executiva explícita e observável**.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §1, §4.1, §6, §9 critérios 1–2, §10; ÉPICO-002 §6.1; Princípio Arquitetural homologado; CON-001 Art. 9º princípios 3 e 8.

#### Critérios de aceitação

* Não existe recomendação ou plano produzido pela CAP-08 sem Análise Executiva associada e recuperável.
* A Análise Executiva é distinguível do plano e da recomendação (artefato/etapa observável).
* Tentativa de planejar sem análise = **não conformidade**.

#### Regras de negócio

* **RN-01.1** Análise Executiva é **obrigatória** e **precedente** — nunca opcional nem paralelizada “depois”.  
* **RN-01.2** Análise ≠ inventário livre: deve cobrir os elementos do RF-02.

#### Fora do escopo

* Formato técnico de persistência da análise (ARQ).

#### Dependências

VIS-006; Princípio Arquitetural.

---

### RF-02 — Conteúdo obrigatório da Análise Executiva

#### Enunciado

O CEO deverá produzir Análise Executiva que, de forma **objetiva e verificável**, cubra **todos** os elementos seguintes: contexto; lacunas de informação; riscos; dependências; alternativas; justificativa das recomendações; nível de confiança da proposta.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §10 (objetivos 1–7 da Análise Executiva); ÉPICO-002 §6.1; Deliberação CTO 24/07/2026.

#### Critérios de aceitação

Cada Análise Executiva válida contém, de modo observável:

| # | Elemento | Critério verificável |
|---|----------|----------------------|
| 1 | **Contexto** | Enunciado do contexto relevante à decisão/plano |
| 2 | **Lacunas** | Lacunas de informação explícitas **ou** declaração de “nenhuma lacuna identificada” |
| 3 | **Riscos** | Riscos identificados **ou** declaração de “nenhum risco relevante identificado” |
| 4 | **Dependências** | Dependências identificadas **ou** declaração de ausência pertinente |
| 5 | **Alternativas** | Ao menos uma alternativa considerada **ou** justificativa explícita de alternativa única |
| 6 | **Justificativa** | Justificativa da recomendação vinculada aos elementos acima |
| 7 | **Confiança** | Nível de confiança da proposta declarado de forma legível |

* Ausência de qualquer elemento obrigatório sem declaração explícita equivalente = **não conformidade**.
* Conteúdo inventado apresentado como registrado/conhecido = **não conformidade**.

#### Regras de negócio

* **RN-02.1** Declarar ausência/limitação é conformidade; omitir é não conformidade.  
* **RN-02.2** Nível de confiança deve ser interpretável pelo patrocinador (escala concreta será detalhada em ARQ sem alterar o mérito deste RF).

#### Fora do escopo

* Escala numérica específica de confiança (ARQ), desde que o nível seja legível e testável.

#### Dependências

RF-01.

---

### RF-03 — Suficiência da Análise Executiva

#### Enunciado

O CEO deverá ser capaz de **determinar quando a Análise Executiva possui informação suficiente** para produzir uma recomendação — **mesmo reconhecendo incertezas remanescentes** — e, ao declarar suficiência, **evitar ciclos infinitos de investigação**.

#### Tipo

Funcional; alto nível.

#### Justificativa

Deliberação CTO (24/07/2026) — aprimoramento conceitual do REQ-035; VIS-006 §10 (confiança, lacunas, recomendações); CON-001 Art. 9º princípios 1 e 8 (respeito ao tempo; transparência sobre limitações); Princípio Arquitetural (analisa antes de recomendar — sem eternizar a análise).

#### Critérios de aceitação

* Existe ato/estado observável de **suficiência declarada** (ou equivalente explícito) antes da emissão da recomendação.
* Ao declarar suficiência, a Análise Executiva **registra as incertezas remanescentes** (ou declara explicitamente “nenhuma incerteza remanescente relevante”).
* O **nível de confiança** permanece explícito e coerente com as incertezas registradas (alinhado ao RF-02 elemento 7).
* Existe **justificativa observável** de por que a recomendação pode ser emitida **naquele momento**, apesar das incertezas (quando houver).
* Prosseguir indefinidamente em investigação sem critério de parada / sem declaração de insuficiência prolongada tratada = **não conformidade** com o espírito deste RF (ciclo infinito).
* Emitir recomendação **sem** declaração de suficiência (ou sem registrar incertezas/confiança/justificativa de timing) = **não conformidade**.

#### Regras de negócio

* **RN-03.1** Suficiência ≠ certeza absoluta: basta informação **adequada para recomendar com transparência**.  
* **RN-03.2** Insuficiência explícita é conformidade: o CEO pode declarar que **ainda não** há base suficiente e **não** emitir recomendação.  
* **RN-03.3** Incerteza registrada ≠ lacuna omitida: incertezas remanescentes devem ser nomeadas, não silenciadas.  
* **RN-03.4** A declaração de suficiência **não** aplica vigência à recomendação (ver RF-07).

#### Fora do escopo

* Heurísticas/algoritmos concretos de cálculo de suficiência (ARQ/IMP).  
* Número máximo fixo de iterações de investigação (pode ser detalhado em ARQ sem alterar o mérito).

#### Dependências

RF-01; RF-02.

---

### RF-04 — Recomendar antes de planejar

#### Enunciado

O CEO deverá **apresentar recomendação fundamentada na Análise Executiva** antes de materializar o **plano** coordenado.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §4.2–4.3, §9 critério 3, §10; Princípio Arquitetural (“recomenda antes de planejar”).

#### Critérios de aceitação

* Existe recomendação observável associada à análise, anterior ao plano.
* A recomendação referencia (direta ou rastreavelmente) a Análise Executiva.
* A recomendação só é emitida após **suficiência declarada** (RF-03) ou, se emitida sob insuficiência, isso seria **não conformidade**.
* Plano emitido sem recomendação precedente = **não conformidade**.

#### Regras de negócio

* **RN-04.1** Recomendação ≠ plano: a recomendação enuncia *o que* se sugere; o plano estrutura *como* executar sob aprovação.  
* **RN-04.2** Recomendação não vigora por si (ver RF-07).

#### Fora do escopo

* Redação de comunicação (CAP-07) — a CAP-08 produz o conteúdo a expressar; a expressão segue CAP-07 quando aplicável.

#### Dependências

RF-01; RF-02; RF-03.

---

### RF-05 — Planejar a partir de objetivos e da recomendação aprovável

#### Enunciado

O CEO deverá transformar objetivos executivos e/ou prioridades, juntamente com a recomendação fundamentada, em um **plano coordenado** composto por passos ou tarefas ordenáveis.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §1, §4.3, §6, §9 critérios 4 e 7; ROADMAP-001 E4; ÉPICO-002 §1.

#### Critérios de aceitação

* O plano contém ao menos um passo/tarefa identificável.
* O plano é rastreável ao objetivo/prioridade e à recomendação/análise de origem.
* O plano é apresentado como **coordenado** (ordem ou dependência entre passos observável, ou justificativa de passo único).

#### Regras de negócio

* **RN-05.1** Plano sem vínculo à análise/recomendação = **não conformidade**.  
* **RN-05.2** Plano não substitui o “próximo passo” da CAP-05 até deliberação de integração; coexistência sem regressão.

#### Fora do escopo

* Distribuição a agentes (CAP-02) e estrutura plena de projeto (CAP-03).

#### Dependências

RF-04; CAP-05 (insumos de objetivo/prioridade/contexto, somente leitura quando aplicável).

---

### RF-06 — Planejar antes de executar; execução fora do CEO

#### Enunciado

O CEO deverá **planejar antes de qualquer ato de execução** e **não executar** tecnicamente o trabalho do domínio operacional (ex.: MG2) dentro do CEO.

#### Tipo

Funcional / restrição; alto nível.

#### Justificativa

VIS-006 §4.4, §7, §9 critérios 3 e 5; Princípio Arquitetural (“planeja antes de executar”); REQ-030 / ADR-015 (fronteira).

#### Critérios de aceitação

* Não há transição para execução sem plano (ou declaração explícita de impossibilidade de planejar com ausência).
* Nenhuma operação da CAP-08 embute execução técnica do MG2.
* Comunicação/orientação de *o que* fazer ≠ execução.

#### Regras de negócio

* **RN-06.1** Execução permanece com o patrocinador / ferramentas externas.  
* **RN-06.2** Coordenação futura de agentes (CAP-02) não anula esta fronteira neste REQ.

#### Fora do escopo

* Mecanismos de integração externa (CAP-11).

#### Dependências

RF-05; VIS-006 §7.

---

### RF-07 — Distinguir proposta de vigência e exigir confirmação

#### Enunciado

O CEO deverá comunicar recomendações e planos de forma que fique **explícito** que **não vigoram** até confirmação do patrocinador, preservando a autoridade final do usuário.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §4.3, §9 critérios 4–5; ÉPICO-002 §3 e §7.3; CON-001 Art. 6º / princípio 9; alinhamento REQ-027 / CAP-05.

#### Critérios de aceitação

* Toda recomendação/plano distingue-se de estado já vigente.
* Há indicação explícita de necessidade de confirmação para vigência (quando aplicável).
* Operação isolada de “recomendar” ou “planejar” **não** aplica vigência.

#### Regras de negócio

* **RN-07.1** Proposta ≠ vigência.  
* **RN-07.2** A confirmação permanece com o patrocinador (caminho de autoridade existente ou equivalente deliberado — sem redesenhar CAP-05 neste REQ além da preservação).

#### Fora do escopo

* Redesign do fluxo de confirmação da CAP-05.

#### Dependências

RF-04; RF-05; espírito CAP-05 / REQ-027.

---

### RF-08 — Não alterar o registrado das baselines ao planejar

#### Enunciado

O CEO deverá exercer a Análise Executiva, a recomendação e o planejamento **sem alterar**, por conta própria, o conteúdo registrado de decisões, memória ou estado das baselines MVP, CAP-05 e CAP-07 — salvo efeitos de vigência aplicados pelos caminhos de autoridade já existentes e confirmados pelo patrocinador.

#### Tipo

Funcional / restrição; alto nível.

#### Justificativa

VIS-006 §4.5, §7, §9 critério 6; ÉPICO-002 §4–§5; ADR-017 (não corromper baseline).

#### Critérios de aceitação

* Operações de análise/recomendação/planejamento não criam, modificam ou apagam registros decisórios/estado por si.
* Regressão observável das baselines causada pela CAP-08 = **não conformidade**.

#### Regras de negócio

* **RN-08.1** Analisar / recomendar / planejar ≠ registrar / confirmar.  
* **RN-08.2** Qualquer novo registro decisório permanece sob CAP-05 / MVP, não sob CAP-08 isolada.

#### Fora do escopo

* Reabrir ou emendar REQ-033 / REQ-034 / ARQ-009 / ARQ-010.

#### Dependências

Baselines CAP-05 / CAP-07 / MVP.

---

### RF-09 — Rastreabilidade da cadeia executiva

#### Enunciado

O CEO deverá manter **rastreabilidade observável** da cadeia objetivo/prioridade → Análise Executiva (incl. suficiência) → recomendação → plano.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-006 §5, §9 critério 7; CON-001 Art. 8º; ROADMAP-001 P5.

#### Critérios de aceitação

* A partir de um plano, é possível recuperar a recomendação e a análise de origem (ou declaração explícita de ruptura com justificativa — vedada como padrão).
* A partir de uma análise, é possível identificar as recomendações/planos derivados (quando existirem) e o estado de suficiência declarado.
* Cadeia quebrada sem declaração = **não conformidade**.

#### Regras de negócio

* **RN-09.1** Rastreabilidade é requisito de governança, não detalhe cosmético.

#### Fora do escopo

* Formato de IDs (ARQ / Identidade Organizacional).

#### Dependências

RF-01…RF-05.

---

## 4. Requisitos Não Funcionais

### RNF-01 — Baixa carga cognitiva no planejamento

#### Enunciado

O CEO deverá exercer a Análise Executiva, a recomendação e o planejamento de modo a **não aumentar** a carga cognitiva do patrocinador além do mínimo necessário para decidir com segurança.

#### Tipo

Não funcional; alto nível.

#### Justificativa

VIS-006 §5; CON-001 Art. 9º princípio 1; alinhamento REQ-028 / CAP-07.

#### Critérios de aceitação

* A apresentação padrão privilegia síntese acionável; detalhe analítico completo não é obrigatório como primeira leitura (sem omitir elementos críticos do RF-02 na estrutura da análise).
* O patrocinador consegue confirmar ou rejeitar sem preencher formulários burocráticos apenas para “receber” a proposta.

#### Regras de negócio

* **RN-N1.1** Preferir o mínimo necessário; detalhe analítico sob demanda quando a superfície o permitir (sem violar RF-02 quanto à existência dos elementos).

---

### RNF-02 — Preservação das baselines MVP, CAP-05 e CAP-07

#### Enunciado

A introdução do Planejamento Executivo **não** deverá causar regressão funcional do MVP (ARQ-008), da CAP-05 nem da CAP-07.

#### Tipo

Não funcional / restrição; alto nível.

#### Justificativa

VIS-006 §9 critério 6; ROADMAP-001 P3; ÉPICO-002 §7.4.

#### Critérios de aceitação

* Eixo Abrir → Fechar → Continuar do MVP permanece percorrível.
* Fluxos de memória → contexto → proposta → confirmação (CAP-05) e de comunicação (CAP-07) permanecem íntegros.
* Evidência de regressão = **não conformidade** deste RNF.

---

### RNF-03 — Fronteira de execução e independência de ferramenta

#### Enunciado

O planejamento do CEO **não** deverá embutir execução do MG2 nem criar dependência de um agente/IA específico.

#### Tipo

Não funcional / restrição; alto nível.

#### Justificativa

VIS-006 §7–§8; ADR-002; ADR-015; REQ-030.

#### Critérios de aceitação

* Planejamento orienta o *quê* / *porquê* / *como proposto*; execução técnica permanece fora.
* Nenhum enunciado de requisito exige fornecedor de IA nomeado como dependência.

---

### RNF-04 — Aplicabilidade do Princípio a decisões futuras

#### Enunciado

Sempre que a CAP-08 produzir artefatos de decisão (análise, recomendação ou plano), o Princípio Arquitetural deverá ser **avaliável e verificável** na ordem analisar → recomendar → planejar → (executar fora).

#### Tipo

Não funcional / restrição de conformidade; alto nível.

#### Justificativa

Deliberação CTO — princípio de identidade conceitual; VIS-006 §10; ÉPICO-002 §6.1 determinação 3 (avaliação em CAP-E futuras — aqui aplica-se à própria CAP-08).

#### Critérios de aceitação

* Em amostragem de fluxos, a ordem dos elos é observável.
* Inversão da ordem (ex.: plano antes da análise) = **não conformidade**.

---

## 5. Restrições

| ID | Restrição |
|----|-----------|
| RST-01 | Este REQ **não** define arquitetura, tecnologia, UI kit nem persistência. |
| RST-02 | Este REQ **não** autoriza implementação. |
| RST-03 | **Não** reabrir CAP-05, CAP-07, MVP, REQ-033, REQ-034, ARQ-009 ou ARQ-010. |
| RST-04 | **Não** incluir CAP-02, CAP-03, CAP-06, CAP-09 ou CAP-12 no escopo obrigatório deste REQ. |
| RST-05 | Execução do MG2 permanece fora do CEO. |
| RST-06 | Patrocinador único (premissa MVP) até deliberação contrária. |
| RST-07 | Todo RF/RNF deve permanecer rastreável à VIS-006 e ao Princípio Arquitetural; lacuna = emenda deste REQ, não invenção em ARQ. |
| RST-08 | A Análise Executiva **não** pode ser tratada como opcional na ARQ/IMP/VAL. |

---

## 6. Critérios de Aceitação (pacote)

O REQ-035 somente se considera **atendido como pacote** (na Validação futura) quando, cumulativamente:

| # | Critério de pacote |
|---|-------------------|
| P1 | RF-01…RF-09 evidenciados sem lacuna obrigatória |
| P2 | RNF-01…RNF-04 evidenciados (amostra observável suficiente) |
| P3 | Nenhuma violação das restrições RST-01…RST-08 |
| P4 | Matriz VIS-006 §9 ↔ RF/RNF coberta (ver §7.4) |
| P5 | Princípio Arquitetural verificável na ordem analisar → recomendar → planejar → executar |
| P6 | Sem regressão MVP / CAP-05 / CAP-07 (RNF-02) |

Homologação deste **documento** (plano de requisitos) ≠ implementação ≠ validação da CAP-08.

---

## 7. Rastreabilidade

### 7.1 Com a VIS-006

| VIS-006 | REQ-035 |
|---------|---------|
| §1 Objetivo | RF-01…RF-07; Objetivo §1 |
| §4 Visão da solução | RF-01…RF-07; RNF-04 |
| §6 Escopo | §2.1 |
| §7 Fora do escopo | §2.2; RST-* |
| §9 Critérios 1–7 | RF-01…09; RNF-01…02 |
| §10 Princípio / Análise | RF-01, RF-02, RF-03, RF-04, RF-06, RNF-04 |

### 7.2 Com o ÉPICO-002

| ÉPICO-002 | REQ-035 |
|-----------|---------|
| CAP-08 núcleo | Todo o pacote RF/RNF |
| Princípio Arquitetural §6.1 | RF-01…04, RF-06; RNF-04 |
| Análise Executiva obrigatória | RF-01, RF-02, RF-03 |
| Critérios de sucesso do épico | P1…P6 (contribuição; não encerra o épico) |

### 7.3 Com o ROADMAP-001

| ROADMAP-001 | REQ-035 |
|-------------|---------|
| E4 Autonomia Executiva | CAP-08 / este REQ |
| Release v0.7 | Horizonte; não declarado aqui |
| E3 → E4 | RF-08; RNF-02 |
| Hierarquia ADR-016 | ROADMAP → ÉPICO-002 → CAP-08 → VIS-006 → **REQ-035** → ARQ → IMP → VAL |

### 7.4 Matriz VIS-006 §9 → requisitos

| Critério VIS-006 §9 | RF / RNF |
|---------------------|----------|
| 1 Análise precede planejamento | RF-01 |
| 2 Conteúdo da análise (7 elementos) | RF-02 |
| 3 Cadeia do Princípio | RF-03, RF-04, RF-06; RNF-04 |
| 4 Plano coordenado; proposta ≠ vigência | RF-05, RF-07 |
| 5 Confirmação do usuário | RF-07 |
| 6 Sem regressão | RF-08; RNF-02 |
| 7 Rastreabilidade da cadeia | RF-09 |
| *(aprimoramento CTO)* Suficiência da análise | RF-03 |

### 7.5 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-002 → CAP-08 → VIS-006 → REQ-035 (este) → ARQ → IMP → VAL → BASELINE → RELEASE v0.7
```

---

## 8. Limites deste artefato

Este REQ **não**:

* elabora ou abre ARQ;
* inicia implementação;
* abre CAP-02, CAP-03 ou CAP-R;
* altera VIS-006, ROADMAP-001, ÉPICO-002 ou baselines em mérito;
* declara a CAP-08 implementada ou validada.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou e aprimorou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Encerrar a fase REQ da CAP-08 e autorizar a fase ARQ |
| Baseado em quê | Deliberação CTO — REQ-035 homologado; VIS-006; ÉPICO-002; Princípio Arquitetural; ADR-006 |
| Resultado | REQ-035 Homologado v1.0 (RF-01…09; RNF-01…04); fase REQ encerrada; ARQ-011 autorizada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — RF-01…08, RNF-01…04, restrições, critérios de pacote | Deliberação CTO — abertura fase REQ CAP-08 | Em análise |
| 0.1a | 24/07/2026 | Engenheiro (Cursor) | Inclusão RF-03 Suficiência da Análise Executiva; renumeração RF-04…09; matrizes atualizadas | Deliberação CTO — aprimoramento conceitual | Em análise |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase REQ encerrada; fase ARQ aberta (ARQ-011) | Deliberação CTO — REQ-035 homologado | **Homologado** |

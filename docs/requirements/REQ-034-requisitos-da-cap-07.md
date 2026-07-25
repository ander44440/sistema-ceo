# REQ-034 — Requisitos da CAP-07 (Comunicação)

> **Status:** Homologado — v1.0 (CTO, 24/07/2026)  
> **Versão:** 1.0 — 24/07/2026  
> **Capacidade:** CAP-07 — Comunicação  
> **Identificação:** REQ-034 (REQ-033 = CAP-05). Primeiro artefato da **fase REQ da CAP-07**.  
> **Natureza:** especificação de requisitos funcionais e não funcionais derivados **exclusivamente** da VIS-005 Homologada v1.0.  
> **Fase de Requisitos da CAP-07:** **encerrada** com esta homologação. **Fase de Arquitetura (ARQ):** aberta — ver ARQ-010 (Deliberação CTO, 24/07/2026).  
> **Proibição:** o enunciado dos RF/RNF **não** se altera durante a ARQ/IMP; não inicia implementação por si.

---

## 1. Objetivo

Transformar a VIS-005 em requisitos **claros, testáveis e rastreáveis**, de modo que a CAP-07 (Comunicação) possa ser arquitetada, implementada e validada sem ambiguidade.

Este REQ especifica **o que** a comunicação do CEO deve garantir; **não** define **como** (ARQ/IMP).

---

## 2. Escopo

### 2.1 Inclui

| Item | Descrição |
|------|-----------|
| Comunicação adaptada | Mensagens ajustadas ao perfil do usuário e ao momento da interação |
| Mínimo necessário | Síntese como padrão; detalhe sob demanda |
| Transparência | Explicitar limitações, incertezas e ausência de base |
| Expressão da condução | Comunicar contexto, justificativa e feedback já produzidos pela CAP-05 |
| Sugerir sem impor | Comunicação de recomendações/opções sem vigência automática |
| Insumos E-01…E-03 | Tratamento das evidências de clareza/feedback como requisitos de comunicação (sem reabrir CAP-05) |

### 2.2 Exclui

| Item | Motivo |
|------|--------|
| Arquitetura / stack / UI kit | Fase ARQ |
| Redesign visual / identidade (E-02/E-03) como obrigação | Fora da VIS-005; OE |
| CAP-06 (Aprender perfil) | Capacidade distinta |
| CAP-08 (Planejamento) | Épico E4 |
| CAP-12 (Conteúdo educacional) | Capacidade distinta |
| Alterar o que a CAP-05 registra ou decide | CAP-07 é camada de expressão |
| Execução do MG2 | Fronteira de execução |

---

## 3. Requisitos Funcionais

### RF-01 — Comunicar o mínimo necessário nos pontos de condução

#### Enunciado

O CEO deverá, nos pontos de condução em que apresenta contexto, justificativa, recomendação ou feedback ao patrocinador, comunicar o **mínimo necessário** para que o patrocinador avance com segurança — **síntese primeiro**.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §1, §4.2, §6 (mínimo necessário); §9 critério 1; CAP-001 CAP-07; CON-001 Art. 9º princípio 1.

#### Critérios de aceitação

* Em cada ponto de condução observável, existe uma **síntese** legível antes de qualquer bloco longo.
* A síntese basta, por si, para o patrocinador entender *o que* se pede / *o que* se informa e *por que agora*.
* Ausência de síntese em ponto de condução = **não conformidade**.

#### Regras de negócio

* **RN-01.1** Padrão = síntese; detalhe não é obrigatório na primeira apresentação.  
* **RN-01.2** Conteúdo da síntese restringe-se ao registrado/estado conhecido (não inventa).

#### Fora do escopo

* Formato visual específico (tipografia, layout de marca).

#### Dependências

VIS-005; CAP-05 (insumos de condução já existentes).

---

### RF-02 — Detalhe sob demanda

#### Enunciado

O CEO deverá permitir que o patrocinador **obtenha detalhe adicional** sob demanda, sem exigir o detalhe completo como padrão de comunicação.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §4.2, §6; §9 critério 2.

#### Critérios de aceitação

* Existe ato observável de solicitar / expandir detalhe a partir da síntese (ou equivalente explícito).
* O detalhe, quando apresentado, permanece rastreável a memória/estado (ou declara ausência).
* O fluxo padrão **não** inicia pelo detalhe completo.

#### Regras de negócio

* **RN-02.1** Detalhe sob demanda ≠ ocultar informação crítica da síntese.  
* **RN-02.2** Se não houver detalhe registrado, declarar ausência — não fabricar.

#### Fora do escopo

* Mecanismo técnico de UI (acordeão, modal etc.) — decisão de ARQ.

#### Dependências

RF-01.

---

### RF-03 — Adaptar a comunicação ao momento e ao tipo de interação

#### Enunciado

O CEO deverá **adaptar** a comunicação ao **momento** e ao **tipo de interação** (ex.: pedido de autoridade, recomendação, feedback, ausência de base), de modo que a mensagem seja pertinente ao ato em curso — sem burocracia nem repetição desnecessária.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §3, §4.1, §6; CAP-001 CAP-07; CON-001 Art. 9º princípio 7.

#### Critérios de aceitação

* Mensagens de tipos distintos de interação são distinguíveis pelo patrocinador (ex.: “contexto antes de decidir” ≠ “feedback após ato”).
* Não há repetição integral do mesmo bloco narrativo no mesmo ponto sem necessidade.
* A adaptação **não** exige, neste ciclo, aprendizado automático de perfil (CAP-06).

#### Regras de negócio

* **RN-03.1** Adaptação operacional = ao tipo de ato + estado conhecido; não = CAP-06.  
* **RN-03.2** Perfil do patrocinador único do MVP permanece premissa até deliberação contrária.

#### Fora do escopo

* Modelos de personalização avançada / ML de perfil (CAP-06).

#### Dependências

VIS-005; premissa REQ-031 (patrocinador único) do MVP.

---

### RF-04 — Explicitar limitações, incertezas e ausência de base

#### Enunciado

O CEO deverá **explicitar** limitações, incertezas e **ausência de base registrada** sempre que a comunicação depender de informação incompleta, fraca ou inexistente — sem preencher lacunas por invenção.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §4.3, §6, §9 critério 3; CON-001 Art. 9º princípio 8; alinhamento CAP-05 RN “registrado ≠ inventado”.

#### Critérios de aceitação

* Quando não houver base registrada pertinente, a comunicação declara **ausência explícita**.
* Quando a base for fraca/parcial, a limitação é declarada de forma legível.
* Nenhuma mensagem de condução apresenta conteúdo inventado como se fosse registrado.

#### Regras de negócio

* **RN-04.1** Registrado ≠ inventado aplica-se à comunicação.  
* **RN-04.2** Silêncio sobre ausência **não** é conformidade.

#### Fora do escopo

* Formulários longos de disclaimer jurídico.

#### Dependências

VIS-005; coerência com REQ-033 / CAP-05 (sem reabrir).

---

### RF-05 — Expressar a condução da CAP-05 sem alterar o registrado

#### Enunciado

O CEO deverá **expressar** (comunicar) o contexto, a justificativa e o feedback já produzidos pela condução (CAP-05), **sem alterar** o conteúdo registrado de decisões, memória ou estado — a CAP-07 é camada de expressão, não de registro.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §1 (último parágrafo), §4.5, §6, §7; §9 critério 6.

#### Critérios de aceitação

* Contexto, justificativa e feedback de condução são comunicáveis sob as regras RF-01…RF-04.
* Operações de comunicação **não** criam, modificam ou apagam registros decisórios/estado por si.
* Regressão observável da baseline CAP-05 causada pela comunicação = **não conformidade**.

#### Regras de negócio

* **RN-05.1** Comunicar ≠ registrar.  
* **RN-05.2** Qualquer novo registro permanece sob CAP-05 / MVP (REQ-022 etc.), não sob CAP-07.

#### Fora do escopo

* Reabrir ou emendar REQ-033 / ARQ-009 / IMP-006.

#### Dependências

CAP-05 baseline; VIS-005 §4.5.

---

### RF-06 — Comunicar recomendações sem impor vigência

#### Enunciado

O CEO deverá comunicar recomendações e opções de forma que fique **explícito** que **não vigoram** até confirmação do patrocinador — preservando “sugerir sem impor” na camada de comunicação.

#### Tipo

Funcional; alto nível.

#### Justificativa

VIS-005 §4.4, §9 critério 4; CON-001 princípio 9; alinhamento REQ-027 / CAP-05.

#### Critérios de aceitação

* Toda recomendação comunicada distingue-se de estado já vigente.
* A mensagem deixa claro que confirmação é necessária para vigência (quando aplicável).
* Comunicação isolada **não** aplica vigência.

#### Regras de negócio

* **RN-06.1** Proposta comunicada ≠ vigência.  
* **RN-06.2** A autoridade de confirmação permanece no patrocinador.

#### Fora do escopo

* Redesenhar o fluxo de confirmação da CAP-05 (já existente).

#### Dependências

VIS-005; espírito REQ-027.

---

## 4. Requisitos Não Funcionais

### RNF-01 — Baixa carga cognitiva na comunicação

#### Enunciado

O CEO deverá exercer a comunicação (RF-01…RF-06) de modo a **não aumentar** a carga cognitiva do patrocinador além do mínimo necessário para decidir com segurança.

#### Tipo

Não funcional; alto nível.

#### Justificativa

VIS-005 §5, §9 critério 5; CON-001 Art. 9º princípio 1; alinhamento REQ-028.

#### Critérios de aceitação

* Sínteses são curtas e acionáveis (sem relatórios longos como padrão).
* Pedidos de leitura/ação adicionais são poucos e de alto valor.
* O patrocinador consegue avançar sem preencher formulários só para “receber” a comunicação.

#### Regras de negócio

* **RN-N1.1** Preferir o mínimo necessário; detalhe sob demanda (RF-02).

---

### RNF-02 — Sem burocracia nem repetição desnecessária

#### Enunciado

O CEO deverá comunicar **sem burocracia** e **sem repetição desnecessária** do mesmo conteúdo no mesmo ponto de interação.

#### Tipo

Não funcional; alto nível.

#### Justificativa

VIS-005 §1, §3; CAP-001 CAP-07; CON-001 Art. 9º princípio 1.

#### Critérios de aceitação

* Não há blocos duplicados idênticos no mesmo ponto de condução.
* Não se exige confirmação burocrática apenas para “ler” a síntese.

---

### RNF-03 — Preservação das baselines MVP e CAP-05

#### Enunciado

A introdução da comunicação CAP-07 **não** deverá causar regressão funcional do MVP (ARQ-008) nem da CAP-05 (baseline).

#### Tipo

Não funcional / restrição; alto nível.

#### Justificativa

VIS-005 §9 critério 6; ROADMAP-001 (extensão, não regressão); ÉPICO-001 critério 2.

#### Critérios de aceitação

* Eixo Abrir → Fechar → Continuar do MVP permanece percorrível.
* Fluxo memória → contexto → proposta → confirmação da CAP-05 permanece íntegro.
* Evidência de regressão = **não conformidade** deste RNF.

---

### RNF-04 — Fronteira de execução e independência de ferramenta

#### Enunciado

A comunicação do CEO **não** deverá embutir execução do MG2 nem criar dependência de um agente/IA específico.

#### Tipo

Não funcional / restrição; alto nível.

#### Justificativa

VIS-005 §7; §8 (agentes substituíveis); REQ-030; ADR-002; ADR-015.

#### Critérios de aceitação

* Comunicação orienta o *quê* / *porquê*; execução técnica permanece fora.
* Nenhum enunciado de comunicação exige um fornecedor de IA nomeado como dependência.

---

## 5. Restrições

| ID | Restrição |
|----|-----------|
| RST-01 | Este REQ **não** define arquitetura, tecnologia, UI kit nem persistência. |
| RST-02 | Este REQ **não** autoriza implementação nem ARQ. |
| RST-03 | **Não** reabrir CAP-05, MVP, REQ-033, ARQ-009 ou IMP-006. |
| RST-04 | **Não** incluir CAP-06, CAP-08 ou CAP-12 no escopo deste REQ. |
| RST-05 | Redesign visual / identidade (E-02/E-03) **fora** deste ciclo, salvo deliberação futura. |
| RST-06 | Patrocinador único (premissa MVP) até deliberação contrária. |
| RST-07 | Todo RF/RNF deve permanecer rastreável à VIS-005; lacuna = emenda deste REQ, não invenção em ARQ. |

---

## 6. Critérios de Aceitação (pacote)

O REQ-034 somente se considera **atendido como pacote** (na Validação futura) quando, cumulativamente:

| # | Critério de pacote |
|---|-------------------|
| P1 | RF-01…RF-06 evidenciados sem lacuna obrigatória |
| P2 | RNF-01…RNF-04 evidenciados (amostra observável suficiente) |
| P3 | Nenhuma violação das restrições RST-01…RST-07 |
| P4 | Matriz VIS-005 §9 ↔ RF/RNF coberta (ver §7.4) |
| P5 | Sem regressão MVP / CAP-05 (RNF-03) |

Homologação deste **documento** (plano de requisitos) ≠ implementação ≠ validação da CAP-07.

---

## 7. Rastreabilidade

### 7.1 Com a VIS-005

| VIS-005 | REQ-034 |
|---------|---------|
| §1 Objetivo | RF-01…RF-06; Objetivo §1 |
| §4.1 Adaptar | RF-03 |
| §4.2 Mínimo necessário | RF-01, RF-02 |
| §4.3 Transparência | RF-04 |
| §4.4 Sugerir sem impor | RF-06 |
| §4.5 Camada de expressão CAP-05 | RF-05; RNF-03 |
| §6 Escopo | §2.1 |
| §7 Fora do escopo | §2.2; RST-* |
| §9 Critérios 1–6 | RF-01…06; RNF-01; RNF-03 |

### 7.2 Com o ÉPICO-001

| ÉPICO-001 | REQ-034 |
|-----------|---------|
| Capacidade única CAP-07 | Todo o pacote RF/RNF |
| Objetivos CAP-07 (§5) | RF-01…RF-06; RNF-01…02 |
| Encerramento do épico = CAP-07 em BASELINE | Este REQ é passo necessário; não encerra o épico |
| Sem CAP-06/08 | Respeitado (RST-04) |

### 7.3 Com o ROADMAP-001

| ROADMAP-001 | REQ-034 |
|-------------|---------|
| E3 Inteligência Executiva | CAP-07 / este REQ |
| Release v0.6 | Horizonte; não declarado aqui |
| E2 → E3 (CAP-05) | RF-05; RNF-03 |
| Hierarquia ADR-016 | ROADMAP → ÉPICO → CAP-07 → VIS-005 → **REQ-034** → ARQ → IMP → VAL |

### 7.4 Matriz VIS-005 §9 → requisitos

| Critério VIS-005 §9 | RF / RNF |
|---------------------|----------|
| 1 Mínimo necessário | RF-01, RF-02 |
| 2 Adaptada (síntese / detalhe) | RF-02, RF-03 |
| 3 Limitações / ausência | RF-04 |
| 4 Sugerir sem impor | RF-06 |
| 5 Baixa carga / tempo | RNF-01, RNF-02 |
| 6 Sem regressão CAP-05/MVP | RF-05, RNF-03 |

### 7.5 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-001 → CAP-07 → VIS-005 → REQ-034 (este) → ARQ → IMP → VAL → BASELINE → RELEASE v0.6
```

---

## 8. Limites deste artefato

Este REQ **não**:

* elabora ou abre ARQ;
* inicia implementação;
* altera VIS-005, ROADMAP-001, ÉPICO-001 ou baselines em mérito;
* declara a CAP-07 implementada ou validada.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Encerrar a fase REQ da CAP-07 e autorizar a fase ARQ |
| Baseado em quê | Deliberação CTO — homologação REQ-034 e abertura ARQ; VIS-005; ÉPICO-001; ROADMAP-001; CAP-001 CAP-07; ADR-006 |
| Resultado | REQ-034 Homologado v1.0; fase REQ encerrada; ARQ-010 autorizada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — RF-01…06, RNF-01…04, restrições, critérios de pacote, rastreabilidade | Deliberação CTO — abertura fase REQ CAP-07 | Em análise |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase REQ encerrada; fase ARQ aberta | Deliberação CTO — REQ-034 homologado | **Homologado** |

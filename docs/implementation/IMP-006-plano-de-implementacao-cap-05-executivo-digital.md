# IMP-006 — Plano de Implementação da CAP-05 (Executivo Digital)

> **Status: Homologado — v1.0 (CTO, 24/07/2026). Implementação E1–E6 CONCLUÍDA e IMP-006 oficialmente ENCERRADO. CAP-05 na baseline; não reabrir.**  
> Versão 1.0 — 24/07/2026. Tipo IMP (ADR-012).  
> **Identificação:** IMP-006 (IMP-005 = CEO MVP v0.1 — encerrado).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; ADR-015; VIS-004 Homologada v1.0; REQ-033 Homologado v1.0; ARQ-009 Homologada v1.0; ARQ-008 Homologada v1.0 (MVP — **preservada**).  
> Este documento **planejou** a execução da CAP-05. Não cria requisitos; não altera a ARQ-009 nem o REQ-033.  
> **Modelo de execução (Deliberação CTO, 24/07/2026):** implementação **contínua** E1→E6; revisão integrada aprovada; VAL-006 executada e encerrada; **CAP-05 homologada** (Deliberação Final, 24/07/2026).  
> **Proibição:** **não reabrir** o IMP-006.  
> **Diretriz (ARQ-009):** extensão da ARQ-008 — componentes **H**, **I** e **J** — sem substituir o MVP nem os módulos A–G.

---

## 1. Objeto e premissas

Materializar a CAP-05 (**Executivo Digital**) conforme a ARQ-009 homologada e o REQ-033 (RF-01…05, RNF-01…02), de modo que o CEO passe a **conduzir** o patrocinador com base na Memória Organizacional viva — sem abandonar o Dia de Trabalho do MVP nem absorver a execução do MG2.

Premissas:

1. VIS-004, REQ-033 e ARQ-009 estão homologados; fase de Arquitetura da CAP-05 **encerrada**.
2. Implementação **subordina-se** integralmente à ARQ-009 (H/I/J + integração A–G) e ao REQ-033.
3. ARQ-008 (A–G) e o MVP v0.1 **permanecem válidos**; a CAP-05 **estende**, não reescreve.
4. Nenhuma etapa produz efeitos permanentes de uso antes do respectivo gate de homologação do CTO.
5. Idempotência: reexecução de etapa homologada sem mudança deliberada = sem alterações adicionais.
6. Tecnologia, linguagem e ferramenta **não** são decididas neste IMP (ADR-012; ARQ-009 §7); escolhas táticas, se necessárias, exigem deliberação explícita do CTO **dentro** dos limites da ARQ, sem novo escopo funcional.
7. Execução do MG2 permanece **fora** do CEO (RNF-02 / ARQ-008 G / REQ-030).
8. **VAL-005** (MVP) e **VAL da CAP-05** são atos distintos: este IMP **não** abre Validação da CAP-05; o congelamento funcional do MVP sob VAL-005 é respeitado — materialização que toque a superfície operacional do MVP exige liberação explícita do CTO ou sede de extensão sem regressão do produto sob validação.
9. Cada etapa concluída é **submetida ao CTO** com evidências antes da seguinte.

---

## 2. Objetivo Institucional

O IMP-006 existe para tornar observável o fluxo arquitetural da ARQ-009:

**Memória (H) + Estado (F) + Contexto (B) → montagem (I) → superfície (A) → confirmação (C) → persistência (H/F)**

com **coordenação de papéis (J)** em paralelo — transformando registro passivo em **condução executiva** (VIS-004 / E-01).

Durante a execução deste IMP:

* **não** se introduzem capacidades fora do REQ-033 / ARQ-009;
* **não** se altera REQ-033, ARQ-009, ARQ-008 nem ADRs de fundamento;
* **não** se inicia a fase de Validação (VAL) da CAP-05;
* **não** se substitui a oficina de execução do MG2;
* **não** se implementam E-02/E-03 (feedback visual / identidade) como escopo deste IMP.

---

## 3. Critérios de Sucesso do IMP

O IMP-006 somente se considera **encerrado com sucesso** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | Componentes **H**, **I** e **J** da ARQ-009 materializados (responsabilidades observáveis) |
| 2 | Ordem obrigatória contexto → pedido de autoridade (RF-02 / E3) observável nos pontos de condução |
| 3 | Recomendações de próximo passo/prioridade com justificativa ou ausência explícita de base (RF-03, RF-04) |
| 4 | Atenção por papel (Patrocinador / CTO / Engenheiro) observável (RF-05) |
| 5 | REQ-033 (RF-01…05, RNF-01…02) cobertos por evidência de etapa, sem lacuna obrigatória |
| 6 | MVP / ARQ-008 A–G preservados (sem regressão do eixo Abrir → Fechar → Continuar) |
| 7 | Verificação de conformidade (etapa E5) aprovada pelo CTO |
| 8 | Nenhuma funcionalidade além do REQ-033; VAL da CAP-05 **não** aberta por este IMP |

O não cumprimento de qualquer critério impede o encerramento institucional.

---

## 4. Limites do IMP-006

Este IMP **não**:

* amplia escopo além de REQ-033 / ARQ-009;
* altera REQs, ARQs ou ADRs;
* implementa multi-projeto, multi-usuário/IAM, orquestração de IAs, chat multiagente, redesign visual (E-02/E-03), CAP-06;
* unifica fisicamente de forma obrigatória os arquivos do MVP além do necessário à evolução D→H deliberada na ARQ-009 §5.2;
* substitui a Validação ADR-006 da CAP-05;
* declara sucesso da VAL-005 / VIS-003 §7.

---

## 5. Princípios de execução (obrigatórios)

| ID | Princípio | Fundamento |
|----|-----------|------------|
| X1 | Não reinterpretar ARQ-009 nem alterar REQ-033 | Deliberação CTO — IMP CAP-05 |
| X2 | Extensão, não substituição do MVP / ARQ-008 | ARQ-009 E1 |
| X3 | Ordem de materialização: **H → I → J → integração** | ARQ-009 §3–§4 (I depende de H) |
| X4 | Contexto antes da autoridade | ARQ-009 E3; RF-02 |
| X5 | Justificar ou declarar ausência; registrado ≠ inventado | ARQ-009 E4; RN-01.1 |
| X6 | Sugerir sem impor | ARQ-009 E5; RF-04; REQ-027 |
| X7 | Coordenar papéis, não substituí-los | ARQ-009 E6; RF-05 |
| X8 | Fronteira de execução (condução ≠ execução MG2) | ARQ-009 E7; RNF-02 |
| X9 | Baixa carga / mínimo necessário | RNF-01; REQ-028/032 |
| X10 | Idempotência de etapa; evidência + submissão ao CTO a cada gate | ADR-006; Deliberação CTO |

---

## 6. Etapas

### E1 — Memória Organizacional Viva (componente H)

Materializar o componente **H**: persistência/recuperação de registros decisórios com os **cinco campos** (quem, quando, por quê, baseado em quê, resultado); histórico consultável no contexto ativo (MG2); declaração explícita de ausência; alimentação observável à condução (sem inventar).

**Componente:** H.  
**REQ-033:** RF-01 (contribui a RF-02…04).  
**ARQ-009:** §3.2 H; integração D (evolução, não descarte).  
**Apoio ARQ-008:** D, F, B.  

**Critérios de conclusão:**

* Registros decisórios do contexto ativo observáveis com os cinco campos.
* Histórico recuperável em sessão posterior sem reentrada narrativa completa.
* Ausência de registro pertinente declarada de forma explícita.
* Distinção preservada: conhecimento CAP-04 / módulo E ≠ decisão H (RN-01.3).
* Evidência documental da etapa submetida ao CTO.

**Gate:** homologação do CTO antes de E2.

---

### E2 — Condução: contexto antes da decisão (componente I — montagem)

Materializar a **montagem e exibição de contexto pré-decisão**: antes de qualquer pedido de autoridade de condução CAP-05, apresentar contexto pertinente de H + F (+ B), ou ausência explícita; ordem contexto → pedido (nunca o inverso como padrão).

**Componente:** I (montagem) + A (exibição) + C (pedido só após contexto).  
**REQ-033:** RF-02; RNF-01 (amostra).  
**ARQ-009:** §4 passos 1–3 e 5 (parcial); princípio E3.  

**Critérios de conclusão:**

* Em todo ponto de autoridade da condução CAP-05, há apresentação prévia de contexto rastreável a H/F/B.
* Ausência explícita quando não houver base.
* Patrocinador consegue identificar *por que* a decisão é pedida agora.
* Evidência + submissão ao CTO.

**Gate:** homologação antes de E3.

---

### E3 — Condução: recomendações justificadas e prioridades (componente I — proposta)

Materializar recomendações de **próximo passo** e **prioridades** com justificativa obrigatória ligada a H/F (ou declaração de base ausente/fraca); vigência somente após confirmação (sugerir sem impor); no máximo um próximo passo vigente coerente com a disciplina do MVP.

**Componente:** I (recomendação + prioridade) + C (confirmação) + A.  
**REQ-033:** RF-03, RF-04; RNF-01.  
**ARQ-009:** §4 passos 4–6; princípios E4, E5.  

**Critérios de conclusão:**

* Toda proposta de próximo passo/prioridade exibe justificativa legível ou limitações explícitas.
* Nenhuma prioridade vigora sem confirmação; rejeitar/ajustar possível sem perder a base apresentada.
* Recomendação sem justificativa **não** é o padrão de condução.
* RNF-02 reafirmado (orientação ≠ execução MG2).
* Evidência + submissão ao CTO.

**Gate:** homologação antes de E4.

---

### E4 — Coordenação de Papéis (componente J)

Materializar a atribuição observável de atenção a **Patrocinador / CTO / Engenheiro** com base em memória e estado; itens sem papel claro permanecem com o Patrocinador até classificação; sem substituir deliberação do CTO nem implementação do Engenheiro.

**Componente:** J + A.  
**REQ-033:** RF-05.  
**ARQ-009:** §3.2 J; fluxo paralelo §4.  

**Critérios de conclusão:**

* Itens de atenção classificados por papel de forma rastreável a H/F.
* Distinção clara: decisão do patrocinador vs encaminhamento a outro papel.
* Sem IAM multi-usuário; sem chat multiagente.
* Evidência + submissão ao CTO.

**Gate:** homologação antes de E5.

---

### E5 — Integração e verificação de conformidade

Percorrer o fluxo completo memória → contexto → recomendação → confirmação → persistência; verificar matriz ARQ-009 §6 e cobertura REQ-033; confirmar preservação do MVP (eixo A–G); sanar inconsistências **sem** novo escopo.

**Componentes:** H + I + J + A–G (integração).  
**REQ-033:** todos (verificação); RNF-01, RNF-02.  

**Critérios de conclusão:**

* Relatório de verificação com evidências por RF/RNF.
* Ordem RF-02 observável de ponta a ponta nos pontos de condução.
* Zero inconsistências abertas no escopo CAP-05; Critérios de Sucesso §3 itens 1–6 atendidos.
* Declaração explícita: VAL da CAP-05 **não** iniciada.
* Evidência + submissão ao CTO.

**Gate:** homologação antes de E6.

---

### E6 — Encerramento institucional da Implementação

Declarar a CAP-05 implementada nos limites do IMP-006; atualizar catálogo; registrar Memória Organizacional; encaminhar eventual Validação da CAP-05 à **deliberação do CTO** — **sem** abrir VAL por este ato.

**Critérios de conclusão:**

* Declaração formal de encerramento.
* Catálogo atualizado (REQ-033 ↔ ARQ-009 ↔ IMP-006 ↔ evidências E1–E5).
* Critérios de Sucesso §3 integralmente atendidos; escopo não ampliado.
* VAL CAP-05 não aberta.

**Gate:** homologação do CTO encerra o IMP-006.

---

## 7. Ordem e dependências

```text
E1 (H) → E2 (I montagem / RF-02) → E3 (I proposta / RF-03–04) → E4 (J) → E5 (integração) → E6 (fecho)
```

| Dependência | Motivo |
|-------------|--------|
| E2 após E1 | Contexto pré-decisão consome H |
| E3 após E2 | Recomendação justificada pressupõe montagem de contexto |
| E4 após E3 | Coordenação de papéis consome memória + estado de condução estabilizado |
| E5 após E4 | Só então H+I+J estão verificáveis em conjunto |
| E6 após E5 | Encerramento só com conformidade |

**Paralelismo J:** a ARQ-009 admite J em paralelo ao fluxo I; neste IMP, J fica em **E4** (após I) para reduzir risco de superfície incompleta e facilitar gates — sem contrariar a ARQ.

---

## 8. Artefatos por etapa

| Etapa | Artefatos esperados (lógicos — sem prescrever tecnologia) | Evidência mínima |
|-------|-------------------------------------------------------------|------------------|
| E1 | Acervo/mecanismo H com cinco campos; consulta/ausência; vínculo ao contexto MG2 | Relatório E1 + demonstração recuperabilidade |
| E2 | Pacote de contexto pré-decisão; integração à superfície nos pontos de autoridade CAP-05 | Relatório E2 + checklist RF-02 |
| E3 | Proposta de próximo passo/prioridade com justificativa; confirmação; persistência pós-confirmação | Relatório E3 + checklist RF-03/04 |
| E4 | Atenção por papel observável (Patrocinador / CTO / Engenheiro) | Relatório E4 + checklist RF-05 |
| E5 | Relatório de verificação de conformidade CAP-05 (matriz ARQ-009 §6) | Relatório E5 |
| E6 | Encerramento institucional; apontamento cadastral | Declaração E6 |

Sede física dos artefatos (extensão do MVP vs. diretório adjacente): **escolha tática na E1**, submetida ao CTO no gate E1, sem violar X2 nem o congelamento VAL-005.

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Reescrever o MVP “de passagem” | X2; Limites §4; preservar A–G; regressão do eixo diário = falha de etapa |
| Alterar REQ/ARQ durante IMP | X1; rejeitar qualquer mudança — abrir novo ciclo se necessário |
| Inventar contexto/justificativa | X5; RN-01.1 / RN-03.2 |
| Impor prioridade sem confirmação | X6; checklist E3 |
| Embutir execução MG2 | X8; RNF-02 em E3 e E5 |
| Iniciar VAL CAP-05 cedo demais | Premissa 8; E5/E6 explícitos |
| Tocar superfície MVP sob VAL-005 sem liberação | Premissa 8; gate E1 deliberar sede |
| Antecipar E-02/E-03 ou CAP-06 | Limites §4 |
| Tecnologia antecipada no IMP | Premissa 6; ARQ-009 §7 |

---

## 10. Estratégia de validação por etapa (gates — não é VAL de produto)

| Etapa | Verificação no gate |
|-------|---------------------|
| E1 | Cinco campos; recuperabilidade; ausência explícita; E ≠ H |
| E2 | Ordem contexto → autoridade; rastreabilidade H/F/B |
| E3 | Justificativa obrigatória; proposta ≠ vigência; um próximo passo |
| E4 | Atenção por papel; sem substituição de CTO/Engenheiro |
| E5 | Matriz ARQ-009 §6; REQ-033 completo; MVP preservado; sem VAL CAP-05 |
| E6 | Declaração + catálogo; Critérios §3 |

---

## 11. Batch Gates — modelo contínuo (Deliberação CTO, 24/07/2026)

| Gate | Conteúdo |
|------|----------|
| Cumprido | Homologação do **IMP-006** + autorização E1 |
| Cumprido (contínuo) | Execução **E1→E6** sem interrupção para homologações intermediárias |
| Pendente | **Revisão integrada** do conjunto (relatório consolidado) pelo CTO |
| Vedado até deliberação | Abertura de **VAL-006** |

Evidências por etapa (E1…E6) permanecem obrigatórias para rastreabilidade, mesmo sem gates intermediários.


---

## 12. Rastreabilidade

| Fonte | Materialização no IMP |
|-------|------------------------|
| ARQ-009 **H** | E1 |
| ARQ-009 **I** (montagem / RF-02) | E2 |
| ARQ-009 **I** (RF-03, RF-04) | E3 |
| ARQ-009 **J** | E4 |
| Integração A–G + matriz §6 | E5 |
| REQ-033 RF-01 | E1 |
| REQ-033 RF-02 | E2 |
| REQ-033 RF-03, RF-04 | E3 |
| REQ-033 RF-05 | E4 |
| REQ-033 RNF-01 | E2, E3, E5 (transversal) |
| REQ-033 RNF-02 | E3, E5 |
| VIS-004 / evidência E-01 | Objetivo institucional §2 |
| ARQ-008 A–G | Preservação contínua; consumo em E2–E5 |

**Cadeia oficial:** `REQ-033 → ARQ-009 → IMP-006 → (E1…E6) → evidências → (VAL futuro, fora deste IMP)`.

---

## 13. O que este IMP deliberadamente não faz

* Não reabre VIS/REQ/ARQ da CAP-05.
* Não inicia Validação (VAL) da CAP-05.
* Não altera o mérito da VAL-005 nem declara seus critérios.
* Não decide stack tecnológica.
* Não implementa E-02, E-03, CAP-06, multi-usuário.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou e executou E1–E6; CTO homologou o plano e o modelo contínuo; revisão integrada pendente |
| Quando | 24/07/2026 |
| Por quê | Abrir e concluir a fase IMP da CAP-05 após homologação da ARQ-009 |
| Baseado em quê | Deliberação CTO — aprovação IMP-006; modelo contínuo; REQ-033; ARQ-009; VIS-004; ADR-006; ADR-012 |
| Resultado | IMP-006 Homologado e oficialmente encerrado; CAP-05 na baseline do CEO; REQ/ARQ/IMP não reabertos; VAL-006 encerrada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — plano H/I/J em E1–E6; rastreabilidade REQ-033 ↔ ARQ-009 | Deliberação CTO — fase IMP CAP-05 | Em análise — revisão do CTO |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (execução) | Homologação; modelo contínuo; E1–E6 concluídas; revisão integrada aprovada; IMP encerrado | Deliberações CTO — IMP-006, modelo contínuo e aprovação integrada | **Homologado e ENCERRADO** |

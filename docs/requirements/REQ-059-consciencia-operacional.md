# REQ-059 — Consciência Operacional

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-01 — Orquestração

## Enunciado

O Sistema CEO deverá **consultar o Estado Executivo Atual** antes de responder a intenções classificadas como **C2** ou **C3**, de forma que Jobs, Gates, Dispatcher, CTO, Agent, Painel e frente activa **influenciem a prosa e a recomendação** — **sem** alterar o fluxo do Motor nem criar Jobs durante a consulta.

## Tipo

Funcional; detalhado (MVP V1 da Consciência Operacional — ARQ-020).

## Justificativa

A **ARQ-020 v0.1** (homologada) define a Consciência Operacional como lastro obrigatório em C2/C3. Sem este requisito, o Núcleo pode deliberar prioridades ou encaminhar trabalho como se o sistema estivesse ocioso, ignorando Jobs em execução ou Gates pendentes — violação de CON-001 (nunca perder o contexto) e ADR-015 (uso diário fiável). Alinha a ARQ-018 / REQ-057 (Classificador), ARQ-019 / REQ-058 (Continuidade do Gate), ARQ-017 / REQ-056 (Motor), REQ-045 / REQ-053 / REQ-054 / REQ-055 (Fontes) e REQ-030 (oficina ≠ browser).

---

## Objetivo

1. Tornar obrigatória a consulta ao **Estado Executivo Atual** antes de respostas substantive a **C2** e **C3**.  
2. Incorporar, no mínimo, as oito fontes da ARQ-020 §4.  
3. Garantir que o estado **influencia** a resposta quando relevante (RF4–RF6).  
4. Garantir que a Consciência é **somente leitura** e **não** altera o fluxo do Motor (RF3, RF7 implícito em CA4/CA5).  
5. Respeitar a precedência da Continuidade do Gate (ARQ-019) sobre deliberação.  
6. Em ausência de contexto operacional relevante, responder normalmente (RF7).

---

## Escopo

### Dentro do escopo (V1)

* Consulta obrigatória ao Estado Executivo Atual no caminho C2/C3 (após Classificador; após Continuidade do Gate se aplicável).  
* Fontes mínimas: Gates pendentes; Jobs em execução; Jobs pendentes; Dispatcher; CTO; Agent; Painel de Orquestração; Frente activa.  
* Influência na prosa / recomendação conforme prioridade ARQ-020 §5.  
* Somente leitura: zero Jobs criados; zero decisões de Gate; zero alteração do ciclo do Motor pela consulta.  
* Critérios CA/NA verificáveis; documentação mínima.

### Capacidade

Exactamente uma capacidade primária: **CAP-01 — Orquestração** (apoio conceptual CAP-07 Comunicação / CAP-11 Integrações, conforme ARQ-020).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF1 | Antes de responder a uma mensagem classificada como **C2** ou **C3**, o sistema deverá **consultar o Estado Executivo Atual**. |
| RF2 | O Estado Executivo Atual deverá considerar, no mínimo: **Gates pendentes**; **Jobs em execução**; **Jobs pendentes**; **Dispatcher**; **CTO**; **Agent**; **Painel de Orquestração**; **Frente activa**. |
| RF3 | O Estado Executivo deverá **influenciar a resposta** (prosa / recomendação / aviso), mas **nunca alterar o fluxo do Motor** (etapas, criação de Job, handoff Dispatcher) por efeito da consulta. |
| RF4 | Se existir **Job em execução** relacionado ao assunto da mensagem, a resposta deverá **mencionar essa execução**. |
| RF5 | Se existir **Gate pendente** relacionado ao contexto, a resposta (quando em caminho deliberativo C2/C3, não em decisão de léxico ARQ-019) deverá **priorizar a continuidade desse Gate** — informar / remeter à decisão pendente antes de re-priorizar ou empilhar novo trabalho. |
| RF6 | O sistema **não** deverá ignorar o Estado Executivo quando este for **relevante** ao assunto ou à frente activa. |
| RF7 | Se **não** existir contexto operacional relevante, o sistema deverá **responder normalmente** (fluxo C2/C3 sem lastro operacional forçado). |
| RF8 | A consulta à Consciência Operacional deverá ocorrer **depois** do Classificador (ARQ-018 / REQ-057) e **depois** da Continuidade do Gate quando esta consumir a mensagem (ARQ-019 / REQ-058) — não competir com «Aprovado.» / léxico de Gate. |
| RF9 | A Consciência Operacional deverá ser **somente leitura** face a Fila, Motor, Dispatcher, Agent e Gates: **proibido** publicar Job, aprovar/rejeitar/adiar Gate, ou invocar oficina/`@cursor/sdk` (REQ-030). |
| RF10 | Em C3, a Consciência poderá **avisar** sobre ocupação/Gates/Jobs, mas o encaminhamento ao Motor permanece sob política do Motor (REQ-056) — a Consciência **não** bloqueia mecanicamente o Motor salvo clarificação explícita autorizada no IMP. |
| RF11 | A prioridade de resolução de conflitos de foco deverá respeitar ARQ-020 §5: Gates → Jobs em execução → Jobs pendentes → Agent/Dispatcher → CTO → Painel → Frente activa. |
| RF12 | Extensão de fontes do Estado Executivo só por emenda a este REQ / ARQ-020. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | **Tempo do utilizador:** lastro operacional em 1–3 frases quando houver conflito; sem dump da fila (ARQ-020 CQ2). |
| RNF2 | **Segurança:** snapshot / prosa sem credenciais (`CURSOR_API_KEY`, API keys). |
| RNF3 | **Observabilidade:** indício de que a consulta ocorreu (metadado ou flag de diagnóstico) sem terminais ad hoc. |
| RNF4 | **Degradação:** falha de uma fonte → transparência ou omissão dessa fonte; **não** inventar Jobs/Gates (ARQ-020 CA9). |
| RNF5 | **Alinhamento ARQ-018:** Classificador permanece limiar; Consciência não reclassifica. |
| RNF6 | **Alinhamento ARQ-019:** Continuidade do Gate tem precedência sobre deliberação consciente. |
| RNF7 | **Alinhamento ARQ-017 / REQ-056:** Motor soberano do ciclo; Consciência não muta etapas. |
| RNF8 | **UI:** V1 sem painel dedicado de consciência; Painel existente (ARQ-016) pode ser fonte, não obrigatório como UI nova. |
| RNF9 | **Performance:** consulta deve ser local/agregada leve; não bloquear C1 por obrigação desta REQ. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| CA1 | Job em execução relacionado → a resposta **menciona** essa execução (RF4; exemplo ARQ-020 §3.3). |
| CA2 | Gate pendente relacionado → a resposta **prioriza** a continuidade desse Gate (RF5). |
| CA3 | Sem contexto operacional relevante → resposta **normal** C2/C3 (RF7). |
| CA4 | Durante a consulta / resposta consciente, **nenhum Job novo** é criado (RF3 / RF9). |
| CA5 | A Consciência Operacional é **somente leitura** — sem mutação de Motor/Fila/Gate/Dispatcher por efeito da consulta (RF3 / RF9). |
| CA6 | Em mensagem C2/C3, há evidência de consulta ao Estado Executivo Atual **antes** da resposta substantive (RF1). |
| CA7 | As oito fontes mínimas (RF2) estão representadas no modelo de Estado Executivo V1. |
| CA8 | Decisão de léxico de Gate (REQ-058) **não** é substituída por deliberação de Consciência. |
| CA9 | Código da Consciência sem `@cursor/sdk` / sem publicação directa na Fila (RF9). |
| CA10 | Documentação mínima referencia ARQ-020, este REQ, Classificador, Continuidade, Motor e Fila/Dispatcher. |

### Critérios negativos

| ID | Critério |
|----|----------|
| NA1 | A Consciência **não** substitui o Motor, a Fila nem o Dispatcher. |
| NA2 | A Consciência **não** decide Gates automaticamente. |
| NA3 | A Consciência **não** é obrigatória em C1/C4 na V1. |
| NA4 | Falha de fonte **não** inventa estado operacional. |

---

## Casos de Uso

### CU1 — Job em execução influencia priorização (CA1)

1. Existe Job `running` (ex.: correção de bugs).  
2. Utilizador (C2): «Como devemos priorizar o MG2?»  
3. Sistema consulta Estado Executivo.  
4. Resposta menciona a execução em andamento e recomenda concluir (ou suspender explicitamente) antes de redefinir prioridades.

**Sucesso:** CA1, RF4, RF6.

### CU2 — Gate pendente tem prioridade (CA2)

1. Existe Gate pendente relacionado (ex.: despacho à espera de aprovação).  
2. Utilizador (C2/C3 deliberativo, **não** léxico «Aprovado.»): pergunta ou pede novo trabalho no mesmo âmbito.  
3. Resposta prioriza a continuidade do Gate (informar / remeter à decisão) antes de re-priorizar ou empilhar.

**Sucesso:** CA2, RF5.

### CU3 — Sem contexto operacional → normal (CA3)

1. Fila ociosa; sem Gates; Agent/Dispatcher ociosos (ou irrelevantes ao assunto).  
2. Utilizador (C2): pergunta de projecto.  
3. Resposta normal via Núcleo/MRE, sem lastro operacional forçado.

**Sucesso:** CA3, RF7.

### CU4 — Consulta sem criar Job (CA4 / CA5)

1. Qualquer C2/C3 com ou sem estado activo.  
2. Percorre-se a Consciência.  
3. Contagem de Jobs na Fila **inalterada** por efeito da consulta; Motor sem transição induzida pela Consciência.

**Sucesso:** CA4, CA5.

### CU5 — Léxico de Gate não é deliberação

1. Gate pendente.  
2. Utilizador: «Aprovado.»  
3. Continuidade (REQ-058) consome; Consciência **não** reformula como priorização C2.

**Sucesso:** CA8, RF8.

### CU6 — C3 com aviso operacional

1. Job em execução ou Gate pendente.  
2. Utilizador (C3): novo pedido executivo no mesmo domínio.  
3. Sistema consulta estado; resposta/aviso reflecte ocupação; Motor só avança conforme política própria (não mutado pela Consciência).

**Sucesso:** RF1, RF3, RF10.

---

## Restrições

| ID | Restrição |
|----|-----------|
| RES1 | Norma: CON-001; ADR-015; ADR-006 (fluxo REQ→IMP). |
| RES2 | Alinhamento integral à **ARQ-020 homologada**. |
| RES3 | Classificador: **ARQ-018 / REQ-057**. |
| RES4 | Continuidade do Gate: **ARQ-019 / REQ-058** — precedência sobre deliberação. |
| RES5 | Motor soberano: **ARQ-017 / REQ-056** — Consciência não altera o fluxo. |
| RES6 | Fontes: REQ-045, REQ-053, REQ-054, REQ-055, ARQ-016. |
| RES7 | Sem implementação até IMP autorizada por etapa. |
| RES8 | Não alterar Constituição, Governança LLM, nem redesenhar ARQ-016…019 nesta frente além do necessário à leitura de estado. |
| RES9 | REQ-030: Consciência não executa oficina. |

---

## Fora de Escopo

| ID | Fora | Coberto por / nota |
|----|------|-------------------|
| FE1 | Implementação de código nesta fase | IMP futuro |
| FE2 | UI dedicada de Consciência | ARQ-020 NO / RNF8 |
| FE3 | Obrigação de consulta em C1/C4 | ARQ-020 §3.1 |
| FE4 | Auto-aprovação de Gate ou criação de Job pela Consciência | Proibido (RF3 / RF9) |
| FE5 | Redesign do Motor, Classificador, Continuidade ou Painel | ARQ-017…019; ARQ-016 |
| FE6 | Multi-utilizador / RBAC | Futuro |
| FE7 | Substituir o Painel como superfície de observação | ARQ-016 |

---

## Dependências

| Dependência | Papel |
|-------------|--------|
| ARQ-020 | Arquitectura homologada (obrigatória) |
| ARQ-018 / REQ-057 | Gatilho C2/C3 |
| ARQ-019 / REQ-058 | Precedência Continuidade do Gate |
| ARQ-017 / REQ-056 | Motor (não mutar) |
| REQ-045 / REQ-053 | Jobs / Dispatcher |
| REQ-054 / REQ-055 / ARQ-016 | CTO / Painel |
| Frente activa / COA | Fonte F8 |
| REQ-030 | Fronteira oficina |

## Riscos e incertezas

* Prosa verbosa (dump da fila); mitigar RNF1.  
* Conflito com Continuidade; mitigar RF8 / CA8.  
* Estado obsoleto; mitigar RNF4.  
* Consciência bloquear indevidamente C3; mitigar RF10.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 |
| Norma superior | CON-001; ADR-015; ADR-006; REQ-030 |
| Origem | ARQ-020 homologada (01/08/2026) — Consciência Operacional |
| Arquitectura | ARQ-020 |
| Classificação / Continuidade / Motor | ARQ-018; REQ-057; ARQ-019; REQ-058; ARQ-017; REQ-056 |
| Fontes | REQ-045; REQ-053; REQ-054; REQ-055; ARQ-016 |
| Decisões derivadas | — |
| Implementação | *— após IMP autorizada* |
| Testes | *— após IMP* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura REQ-059 | Alinhar requisitos à Consciência Operacional (ARQ-020) | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação REQ-059 | Autoriza IMP-059 | **Homologada** |

---

**Gate REQ-059:** Homologada. Implementação: IMP-059 (frente encerrada).

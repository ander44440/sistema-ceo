# REQ-CEO — Etapa 2 — Correções Críticas v1

> **Status:** Consolidado — Etapa 2 apta a encerramento documental (08/08/2026).  
> **Natureza:** Pacote único de requisitos descobertos, corrigidos e homologados na maturação Etapa 2.  
> **Proibições deste acto:** não cria Job; não executa Dispatcher; não altera código; não altera gameplay; não altera Manifesto; não inicia nova bateria comportamental espontânea.  
> **Norma superior:** CON-001; ADR-006; ADR-015; REQ-045; REQ-053; REQ-056; REQ-057; REQ-058.  
> **Identificadores:** REQ-CEO-001 … REQ-CEO-015 (série de consolidação Etapa 2; não substitui REQ-nnn do fluxo ADR-006).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Especificação consolidada das correções críticas da Etapa 2 de maturação do CEO. |
| **Por que existe?** | Fechar a Etapa 2 com rastreabilidade executiva: requisitos, status, evidências e resíduos — sem reinventar funcionalidade. |
| **Para quem existe?** | Patrocinador (fecho); CTO (governação); Engenheiro (baseline para Reteste Controlado / Etapa 3). |
| **Como medir sucesso?** | 15 requisitos registados; status documentados; resíduos identificados; zero correção P0/P1 conhecida em aberto; Etapa 3 limitada ao conjunto exacto de cenários abaixo. |

---

## 1. Requisitos consolidados

### REQ-CEO-001 — Gate não pode bloquear a conversa

Enquanto existir Gate pendente, o CEO deve continuar capaz de:

- interpretar novas mensagens;
- responder consultas;
- analisar propostas;
- alterar prioridade;
- receber novas instruções;
- cancelar ou adiar o Gate.

**Invariante:** `GATE_PENDING ≠ CONVERSATION_LOCK`.

Somente a execução que depende daquele Gate deve permanecer bloqueada.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-1 / Gate) |
| **Evidência** | `app/src/continuidadeGate/p0-gate-sem-lock.test.js` |

---

### REQ-CEO-002 — Intenção deve controlar o fluxo

Distinguir claramente:

| Classe | Natureza |
|--------|----------|
| **C2** | análise / recomendação / deliberação |
| **C3** | trabalho executivo / execução |
| **C4** | consulta factual de estado |

**Regras:**

- CONSULTA ≠ EXECUÇÃO  
- ANÁLISE ≠ CONSULTA  
- ANÁLISE ≠ EXECUÇÃO  

«Não execute», «não crie Job» e equivalentes **bloqueiam execução**, mas **não alteram** a natureza da intenção.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-1 + P1-1; regressões) |
| **Evidência** | `p0-hierarquia-intencao.test.js`; `p1-1-c2-vs-c4.test.js` |

---

### REQ-CEO-003 — Consulta não pode criar Job

Consultas sobre Jobs, Gates, fila, pendências, resultados, verificações e estado do projeto devem ser **somente leitura**.

Uma consulta deve aceder ao estado real e responder à pergunta.

**Não pode:** criar Job; iniciar Dispatcher; alterar estado; aprovar Gate.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-3 T1–T10) |
| **Evidência** | `app/src/executiveEngine/p0-consulta-estado.test.js` |

---

### REQ-CEO-004 — Job possui ciclo de vida explícito

Ciclo obrigatório:

```
PENDING → DISPATCHED → RUNNING → RESULT → VERIFICATION → COMPLETED
```

Alternativas: `FAILED` | `NEEDS_CORRECTION` | `CANCELLED`.

**Invariantes:** DISPATCHED ≠ concluído; RUNNING ≠ concluído; RESULT ≠ concluído.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-2) |
| **Evidência** | `app/src/motorExecucao/cicloVidaJob.test.js` (13/13) |

---

### REQ-CEO-005 — COMPLETED exige verificação

Somente a verificação formal do CEO pode promover `RESULT → COMPLETED`.

O Agent e o Dispatcher **não** podem declarar `COMPLETED` directamente.

A verificação deve comparar: objectivo; critério de conclusão; resultado; evidência.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (integração + Dispatcher/Agent reais; JOB-000068 → COMPLETED) |
| **Evidência** | `p0-2-integracao-verificacao.test.js`; fila real JOB-000068 |

---

### REQ-CEO-006 — Falhas devem ser explícitas

Falha deve produzir: motivo; etapa; evidência; impacto; possibilidade de retentativa; próxima acção.

`NEEDS_CORRECTION` ≠ `FAILED`.

Ausência de resultado **não** pode virar falso sucesso.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-2) |
| **Evidência** | `cicloVidaJob.test.js` (T6–T8, T9) |

---

### REQ-CEO-007 — Estado executivo deve ser consultável

O CEO precisa informar, de forma factual: estado de Job; resultado; verificação; Gate; fila; pendências; estado relevante do projecto — com dados reais disponíveis.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-3) |
| **Evidência** | `p0-consulta-estado.test.js`; capacidade `consultarEstado.js` |

---

### REQ-CEO-008 — Contexto não pode substituir a resposta

A intenção actual do utilizador tem prioridade.

**Ordem:**

1. INTENÇÃO ACTUAL  
2. RESPOSTA ESPECÍFICA  
3. CONTEXTO NECESSÁRIO  
4. RESUMO EXECUTIVO  

O CEO **não** deve prefixar automaticamente «Objectivo principal…», «Prioridade actual…», «Decisão mais recente…», «Próxima acção…» quando isso não foi solicitado.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P1 — 14/14) |
| **Evidência** | `app/src/conversacaoNatural/p1-intencao-vs-contexto.test.js` |

---

### REQ-CEO-009 — Pendências não podem sequestrar a conversa

«Antecipo pendência aberta…» **não** deve aparecer automaticamente em toda resposta.

Pendência deve aparecer quando: solicitada; directamente relevante; bloqueia a acção; ou faz parte de panorama executivo solicitado.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P1) |
| **Evidência** | `p1-intencao-vs-contexto.test.js` (asserções anti-prefixo) |

---

### REQ-CEO-010 — C2 deve produzir análise real

Quando o utilizador pede análise/recomendação:

`C2 → MRE → análise → recomendação`

**Não** substituir análise por: consulta; delegação fictícia; criação de Job; execução.

Se a capacidade deliberativa não estiver disponível, declarar a limitação **explicitamente**.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P1-2 T1–T7) |
| **Evidência** | `app/src/executiveEngine/p1-2-analise-deliberativa.test.js` |

---

### REQ-CEO-011 — Análise não pode gerar Job por fallback

O MRE **não** pode utilizar fallback de publicação de Job quando C2 estiver a realizar análise.

A ausência de publicador deve **impedir** execução, não provocar publicação alternativa.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P1-2) |
| **Evidência** | `p1-2-analise-deliberativa.test.js` («C2 sem publicador… não faz fallback») |

---

### REQ-CEO-012 — Manifesto canónico é a fonte oficial

**Fonte:** `docs/MANIFESTO-MG2.md` (repositório do jogo MG2).

O runtime deve utilizar o Manifesto canónico. **Não** criar segunda versão hardcoded.

O Manifesto funciona como **diretriz de decisão**, não como texto a repetir.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P1-3 T1–T6 + LLM real) |
| **Evidência** | `app/src/camadaConhecimento/p1-3-manifesto-mg2.test.js`; `manifestoMg2.js` |

---

### REQ-CEO-013 — Decisões devem aplicar o Manifesto ao caso concreto

Quando uma análise pedir avaliação segundo o Manifesto:

- recuperar os princípios relevantes;
- aplicá-los à proposta;
- explicar a relação com a decisão;
- produzir recomendação.

**Não** basta listar princípios. **Não** substituir princípios do Manifesto por princípios genéricos de governação do CEO.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (proposta bairro popular) |
| **Evidência** | P1-3 deliberação; learning `2026-08-08-job-000069-analise-bairro-popular-mg2.md` (artefacto residual — ver §3) |

---

### REQ-CEO-014 — Não abrir nova execução por inferência

Uma conversa anterior sobre uma proposta **não** autoriza execução posterior automaticamente.

Cada nova mensagem deve ser interpretada pela intenção actual.

Autorização e comando de execução devem respeitar a política de Gate.

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (coberto pelos P0/P1 existentes) |
| **Evidência** | Classificador + Continuidade Gate + P1-2 (zero Job em análise) |

---

### REQ-CEO-015 — Resultado deve ser observável e auditável

Deve ser possível reconstruir:

`Job criado → despacho → execução → resultado → verificação → estado final.`

| Campo | Valor |
|-------|--------|
| **Estado de implementação** | **IMPLEMENTADO** |
| **Estado de homologação** | **HOMOLOGADO** (P0-2 T12 + integração) |
| **Evidência** | `cicloVidaJob.test.js` (T12); `executionQueue` / histórico de Job |

---

## 2. Matriz de status (fecho Etapa 2)

| ID | Título curto | Implementado | Homologado | Pendente de implementação |
|----|--------------|:------------:|:----------:|:-------------------------:|
| REQ-CEO-001 | Gate ≠ lock conversa | Sim | Sim (P0-1) | **Não** |
| REQ-CEO-002 | Intenção controla fluxo | Sim | Sim (P0-1/P1-1) | **Não** |
| REQ-CEO-003 | Consulta sem Job | Sim | Sim (P0-3) | **Não** |
| REQ-CEO-004 | Ciclo de vida Job | Sim | Sim (P0-2) | **Não** |
| REQ-CEO-005 | COMPLETED só com verificação | Sim | Sim (JOB-000068) | **Não** |
| REQ-CEO-006 | Falhas explícitas | Sim | Sim (P0-2) | **Não** |
| REQ-CEO-007 | Estado consultável | Sim | Sim (P0-3) | **Não** |
| REQ-CEO-008 | Intenção > contexto | Sim | Sim (P1) | **Não** |
| REQ-CEO-009 | Pendências sem sequestro | Sim | Sim (P1) | **Não** |
| REQ-CEO-010 | C2 análise real | Sim | Sim (P1-2) | **Não** |
| REQ-CEO-011 | Sem Job por fallback C2 | Sim | Sim (P1-2) | **Não** |
| REQ-CEO-012 | Manifesto canónico | Sim | Sim (P1-3 + LLM) | **Não** |
| REQ-CEO-013 | Manifesto aplicado ao caso | Sim | Sim (bairro popular) | **Não** |
| REQ-CEO-014 | Sem execução por inferência | Sim | Sim (P0/P1) | **Não** |
| REQ-CEO-015 | Resultado auditável | Sim | Sim (P0-2) | **Não** |

**Síntese:** 15/15 **IMPLEMENTADOS**; 15/15 **HOMOLOGADOS** no perímetro Etapa 2; **0** requisitos desta série pendentes de implementação.

---

## 3. Homologações já realizadas (bateria Etapa 2)

| Bateria | Resultado | Cobertura REQ-CEO |
|---------|-----------|-------------------|
| **P0-1** Classificador / Gate sem lock | 156/156 PASS (suite classificador referida); Gate sem lock PASS | 001, 002, 014 |
| **P0-2** Ciclo de vida | 13/13 PASS; integração RESULT→VERIFICATION PASS; JOB-000068 → COMPLETED | 004, 005, 006, 015 |
| **P0-3** Consulta de estado | T1–T10 PASS | 003, 007 |
| **P1** Intenção vs contexto | 14/14 PASS | 008, 009 |
| **P1-1** C2 vs C4 | 14/14 PASS; regressões 77/77 PASS | 002 |
| **P1-2** Análise deliberativa | T1–T7 PASS; regressões 113/113 PASS | 010, 011, 014 |
| **P1-3** Manifesto canónico | T1–T6 PASS; regressões 146/146 PASS; LLM real PASS | 012, 013 |

---

## 4. Resíduos / pendências conhecidas

Registo **sem** obrigação de correcção nesta etapa:

| # | Resíduo | Bloqueia Etapa 2? | Bloqueia Reteste Controlado (Etapa 3)? |
|---|---------|:-----------------:|:--------------------------------------:|
| R1 | **JOB-000069** existe como artefacto residual de bug anterior; **não** foi criado pelas correcções P1-2/P1-3 | Não | Não |
| R2 | Se o Dispatcher estiver parado, Jobs em `RESULT` podem aguardar o próximo tick de verificação; com Dispatcher em watch o fluxo é automático | Não | Não (pré-condição operacional do reteste: Dispatcher em watch se o cenário exigir verificação) |
| R3 | Agents antigos com protocolo «→ completed» podem tentar marcar COMPLETED directamente; a fila actual **recusa** e a reconciliação cobre o legado | Não | Não |
| R4 | Manifesto depende de ambiente LLM/API para deliberação substantiva; sem capacidade deliberativa → incapacidade **explícita** (REQ-CEO-010) | Não | Não (cenário P1-2 T7 cobre a declaração explícita) |
| R5 | Manifesto **ainda não** incorporado ao Acervo como item KNW — **fora** desta consolidação; **não** implementar agora | Não | Não |

**Pendências bloqueadoras para encerrar Etapa 2:** **nenhuma**.

**Correcções P0/P1 conhecidas aguardando implementação:** **nenhuma**.

---

## 5. Regra de governação pós-Etapa 2

A partir deste ponto:

1. **NÃO** criar novos requisitos por sintomas isolados.  
2. **NÃO** criar novas features do MG2 neste fecho.  
3. **NÃO** iniciar nova bateria de testes espontâneos.  
4. **NÃO** alterar código já homologado sem evidência de regressão.

Qualquer problema encontrado na **Etapa 3** deverá seguir:

```
EVIDÊNCIA → CLASSIFICAÇÃO → REQUISITO EXISTENTE OU NOVO → DECISÃO
```

---

## 6. Critério de encerramento da Etapa 2

| Critério | Estado |
|----------|--------|
| Requisitos acima registados | **Cumprido** (este documento) |
| Status documentados | **Cumprido** (§2) |
| Pendências residuais identificadas | **Cumprido** (§4) |
| Nenhuma correcção P0/P1 conhecida aguardando implementação | **Cumprido** |
| Nenhuma nova alteração de código necessária para iniciar o Reteste Controlado | **Cumprido** |

### Veredicto

**A Etapa 2 pode ser oficialmente encerrada** no plano documental/executivo desta consolidação.

Próximo acto autorizado: **Etapa 3 — Reteste Controlado**, limitado ao conjunto exacto da §7 — sem novas correcções «para melhorar».

---

## 7. Conjunto EXACTO de cenários para a Etapa 3 (Reteste Controlado)

Repetir **apenas** o que se segue. Não expandir a bateria.

### 7.1 P0-1 — Gate sem lock / hierarquia de intenção

**Ficheiros:**  
`app/src/continuidadeGate/p0-gate-sem-lock.test.js`  
`app/src/classificadorIntencao/p0-hierarquia-intencao.test.js`  
(+ suite classificador referida na homologação P0-1, se o reteste formal incluir a regressão 156/156)

**Cenários Gate (mínimo):**

1. Análise com Gate pendente não repete só o pedido de aprovação  
2. Estado actual com Gate pendente processa (sem lock)  
3. Encerrar Gate sem execução → rejeita e sai do pendente  
4. Aprovação continua a criar Job (autorização intacta)  
5. Mudança de prioridade com Gate pendente não trava  
6. Consulta Gate + «Não execute nada» → sem Job  

### 7.2 P0-2 — Ciclo de vida + verificação

**Ficheiros:**  
`app/src/motorExecucao/cicloVidaJob.test.js` (T1–T12 + ilegalidade running→completed)  
`app/src/motorExecucao/p0-2-integracao-verificacao.test.js`

**Cenários:**

1. PENDING → DISPATCHED → RUNNING → RESULT → VERIFICATION → COMPLETED  
2. Falhas / NEEDS_CORRECTION / ausência de resultado explícita  
3. Agent → result → verificação CEO → COMPLETED (integração)  
4. Recusa de COMPLETED directo pelo Agent  

### 7.3 P0-3 — Consulta de estado (T1–T10)

**Ficheiro:** `app/src/executiveEngine/p0-consulta-estado.test.js`

1. T1 — estado do Job → estado real, 0 Jobs  
2. T2 — estado + «Não execute nada» → estado real, 0 Jobs  
3. T3 — resultado do Agent → real ou ainda não disponível  
4. T4 — verificação pelo CEO  
5. T5 — Gates pendentes  
6. T6 — pendências abertas  
7. T7 — estado da fila  
8. T8 — Job inexistente  
9. T9 — consulta com Gate pendente → responde, sem Job, sem re-pedir aprovação  
10. T10 — consulta após criar Job → não cria segundo Job  

### 7.4 P1 — Intenção actual vs contexto (T1–T12 + unit)

**Ficheiro:** `app/src/conversacaoNatural/p1-intencao-vs-contexto.test.js`

1. Consulta Job / Gate sem resumo executivo genérico  
2. Prioridade / decisão / pendências só quando pedidas  
3. Saudação natural sem relatório  
4. Análise sem prefixos genéricos  
5. Execução segue C3/Gate  
6. Consulta + «Não execute» → estado, 0 Jobs  
7. Estado com Gate pendente: responde, não re-pede aprovação  
8. Mudança de assunto com Gate: processa nova intenção  
9. CN não prefixa «Objectivo» em prosa de consulta  

### 7.5 P1-1 — C2 vs C4

**Ficheiro:** `app/src/classificadorIntencao/p1-1-c2-vs-c4.test.js`  
(+ regressões do perímetro classificador já usadas na homologação P1-1)

1. Pedidos de análise/recomendação → C2  
2. Consultas de estado → C4  
3. «Não crie Job» **não** transforma C2 em C4  

### 7.6 P1-2 — Análise deliberativa (T1–T7)

**Ficheiro:** `app/src/executiveEngine/p1-2-analise-deliberativa.test.js`

1. T1 — Análise simples → C2 + análise  
2. T2 — Recomendação → C2 + recomendação  
3. T3 — Análise + não execute → zero Jobs  
4. T4 — Análise segundo Manifesto (mock) → análise + princípios  
5. T5 — Consulta Job → C4 sem alteração  
6. T6 — Comando de execução → C3 sem alteração  
7. T7 — Motor deliberativo indisponível → mensagem explícita, sem falsa delegação  
8. Aceite: mensagem «bairro popular» nunca vira Job nem delegação fictícia  
9. C2 sem publicador injectado **não** faz fallback para fila oficial  

### 7.7 P1-3 — Manifesto canónico (T1–T6)

**Ficheiro:** `app/src/camadaConhecimento/p1-3-manifesto-mg2.test.js`

1. T1 — Runtime carrega Manifesto canónico do disco  
2. T2 — Origem `docs/MANIFESTO-MG2.md`  
3. T3–T6 — Deliberação bairro: Manifesto → análise aplicada → 0 Jobs; princípios do Manifesto (não governação genérica); sem despejo integral do texto  
4. Homologação com LLM real (repetir o mesmo prompt de análise do bairro, se o ambiente API estiver disponível; caso contrário registar incapacidade explícita — REQ-CEO-010 / R4)

### 7.8 Fora do Reteste Controlado

- Não criar Job novo para «validar» esta consolidação.  
- Não alterar Manifesto nem gameplay.  
- Não incorporar Manifesto ao Acervo (KNW) nesta etapa.  
- Não limpar JOB-000069 como pré-condição do reteste (R1 é residual conhecido).

---

## 8. Rastreabilidade de código (âncoras)

| Área | Caminhos principais |
|------|---------------------|
| Gate sem lock | `app/src/continuidadeGate/` |
| Classificador C2/C3/C4 | `app/src/classificadorIntencao/` |
| Ciclo de vida / verificação | `app/src/motorExecucao/cicloVidaJob.js`; `app/server/executionQueue.js`; `executive/dispatcher/` |
| Consulta de estado | `app/src/executiveEngine/capacidades/consultarEstado.js` |
| Prioridade de intenção / CN | `app/src/conversacaoNatural/prioridadeIntencao.js` |
| Análise deliberativa | `app/src/mre/politicaAnaliseDeliberativa.js` |
| Manifesto canónico | `app/src/camadaConhecimento/manifestoMg2.js` |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 1.0 | 08/08/2026 | Engenheiro (Cursor) | Consolidação REQ-CEO-001…015 + fecho Etapa 2 | Despacho consolidação Etapa 2 — sem código | Pacote registado; Etapa 2 apta a encerramento; Etapa 3 = Reteste Controlado §7 |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (consolidação); Patrocinador/CTO (fecho formal da Etapa 2, se aplicável) |
| Quando | 08/08/2026 |
| Por quê | Consolidar correcções críticas já descobertas/homologadas antes do Reteste Controlado |
| Baseado em quê | Baterias P0-1…P1-3; invariantes Gate/Intenção/Ciclo/Manifesto |
| Resultado | Documento único; 15/15 implementados e homologados no perímetro; resíduos não bloqueadores; Etapa 2 encerrável |

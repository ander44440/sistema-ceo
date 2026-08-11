# ANL-017 — Parecer Técnico pré-abertura da F3 (Lastro operacional MG2)

> **Status:** Emitido — 06/08/2026 (parecer técnico; aguarda deliberação CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Identificação:** ANL-017.  
> **Mandato:** CTO — escopo técnico da F3 antes de autorização.  
> **Lastro:** [`ROADMAP-002`](../roadmap/ROADMAP-002-planejamento-proxima-onda-evolucao.md) §F3; [`ANL-014`](ANL-014-mapa-capacidades-executivas-baseline-eic.md); [`REL-001`](../REL-001-estado-atual-do-sistema-ceo.md) P1-6; [`briefing-operacional-mg2.md`](../mvp/briefing-operacional-mg2.md); ADR-015; CAP-03/CAP-04; ARQ-006/007 (lastro histórico).  
> **Proibições:** não implementa; **não** altera arquitectura; **não** altera governação; **não** abre F3.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Parecer objectivo do escopo técnico da F3 (lastro operacional MG2) face aos critérios de autorização do CTO. |
| **Por que existe?** | F2 retirada; F3 é a candidata principal de evolução perceptível — falta Gate de abertura. |
| **Para quem existe?** | CTO (autorizar / restringir / recusar); Patrocinador; Engenheiro. |
| **Como medir sucesso?** | Nove respostas objectivas + veredicto explícito sobre percepção, custo/benefício e aderência arquitectural. |

---

## 1. Definição oficial da F3 (ROADMAP-002)

| Campo | Conteúdo |
|-------|----------|
| **Nome** | Lastro operacional MG2 (conhecimento curado no COA) |
| **Objectivo** | Elevar a qualidade deliberativa do CEO no contexto MG2 — briefing/lastro além da mitigação actual |
| **Proibição explícita** | Não importar arquitectura / engenharia do MG2 para dentro do CEO |
| **Prioridade** | P1 — próxima candidata principal de produto |

**Estado actual (pré-F3):** existe Briefing Operacional Curado MG2 v1.0 (30/07/2026) como **mitigação** — Gate CTO encerrado na Opção A; **não** substitui CAP-04; REL-001 ainda regista lacuna P1-6.

---

## 2. Respostas objectivas

### 2.1 Qual problema real do Sistema CEO a F3 resolve?

| Problema | Evidência |
|----------|-----------|
| Deliberações e despachos **genéricos** sobre o MG2 apesar do COA activo | Briefing §4 (dor «CEO sem lastro»); learning 30/07 |
| Uso diário ADR-015 **frágil** — o CEO não carrega estado operacional suficiente do projecto real | REL-001 **P1-6** |
| Risco de Jobs fracos / inventados quando o lastro é fino | Briefing: na dúvida declarar ignorância — política ainda não é produto robusto |
| Mitigação documental **estática** (ficheiro curado) sem ciclo de evolução controlada | Briefing = Opção A; F3 = evoluir lastro de forma governada |

**Não é o problema da F3:** Classificador, voz, NCS, redesign do Motor, ou fecho só-documental (ex-F2).

---

### 2.2 Qual capacidade do produto será ampliada?

| Capacidade | Papel na F3 |
|------------|-------------|
| **CAP-04** Gestão do Conhecimento (**selectiva**) | Ampliar património **operacional consultável** do COA MG2 — não o ciclo CAP-04 pleno (isso é F7) |
| **CAP-03** Gestão de Projetos / COA | Consumir lastro no **único COA activo** (MG2) — sem reabrir baseline CAP-03 |
| **CAP-08** (indirecto) | Planos/tarefas mais ancorados no estado real do projecto |
| **CAP-07 / EIC** | Apenas **consome** melhor contexto em caminhos deliberativos (C2) — não é a capacidade alvo |

---

### 2.3 Qual comportamento perceptível mudará para o utilizador?

Com F3 bem delimitada, o utilizador deve observar:

1. Respostas e pareceres sobre o MG2 **menos genéricos** (cidade, dores, decisões recentes, próximo passo).  
2. Despachos / Jobs **mais alinhados** ao foco operacional actual do briefing.  
3. Quando o lastro não cobrir: CEO **declara limite** e pergunta o mínimo — em vez de inventar.  
4. Sensação de «o CEO está no circuito do meu projecto» (filtro ADR-015) — **perceptível em uso diário**.

**Não muda (se a F3 respeitar fronteiras):** classes C1–C4, limiar EIC, voz, UI radical, build do jogo MG2.

---

### 2.4 Quais módulos serão alterados?

**Estimativa de perímetro** (a fixar em REQ/ARQ após Gate — não inventar desenho agora):

| Área | Alteração provável | Fora de escopo F3 |
|------|--------------------|-------------------|
| Lastro / briefing / repositório de contexto COA | **Sim** — evolução do lastro curado + eventual mecanismo de consumo | Importar repo/código do jogo |
| Montagem de contexto deliberativo (pré-MRE / Consciência) | **Possível** — injectar lastro MG2 onde já se injecta briefing | Redesign do MRE/Speaker «para conhecer o MG2» (proibido no Gate 30/07 sem novo mandato) |
| Catálogo / sessão COA (CAP-03) | **Mínimo** se necessário amarrar lastro ao COA | Reabrir VAL-003 / baseline |
| DIC / path meta (IMP-067) | **Não** como veículo do MG2 — DIC = institucional CEO | Confundir MG2 com DIC-001 |
| Classificador / CSC / VCA | **Não** | — |
| Motor / Fila / Gate | **Não** (salvo consumo de texto já classificado C2) | — |
| `ceoOuvindo` | **Não** | — |

**Resumo:** alterações concentradas em **camada de conhecimento/contexto do COA**, não no núcleo de intenção nem no Motor.

---

### 2.5 Existe impacto na Executive Engine?

| Tipo de impacto | Avaliação |
|-----------------|-----------|
| Redesign do Motor / pipeline de execução | **Não** (não deve) |
| Entrada de contexto mais rica em rotas deliberativas (C2 / MRE) | **Sim, indirecto** — melhor lastro → melhor deliberação |
| Novas classes / limiares | **Não** |
| NCS | **Não** (F4) |

**Conclusão:** impacto na EE = **consumo de contexto**, não alteração estrutural da engine. Qualquer toque em MRE/Speaker exige Gate explícito separado (histórico 30/07).

---

### 2.6 Existe impacto na Baseline da EIC?

| Camada | Impacto |
|--------|---------|
| EIC runtime (Classificador, CSC, VCA, complexidade, DIC institucional) | **Não** — F3 **não** emenda a baseline |
| Qualidade observada em C2 | Melhora **indireita** (melhor lastro), sem mudar regras EIC |
| EIC documental | Irrelevante ao objecto F3 (salvo lote ex-F2 opcional no arranque) |

**Conclusão:** aderente à arquitectura consolidada **se** a F3 permanecer «lastro no COA», não «nova intenção conversacional».

---

### 2.7 A F3 cria nova capacidade ou apenas amplia uma existente?

**Amplia capacidades existentes** — **não** cria CAP nova.

- Primário: **CAP-04 selectiva** (conhecimento operacional do COA).  
- Secundário: uso mais forte do **CAP-03** (COA MG2).  
- **Não** é CAP-E; **não** substitui F7 (CAP-04 plena).

---

### 2.8 Qual o risco técnico da implementação?

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| R1 | Scope creep — importar arquitectura/código do MG2 | **Alta** | Proibição ROADMAP + ADR-015; fora de escopo explícito |
| R2 | «Ensinar» o MRE/Speaker a fingir conhecimento | **Alta** | Manter lastro como **contexto curado**; Gate 30/07 |
| R3 | Confundir lastro MG2 com DIC institucional | **Média** | Fronteiras: DIC = CEO; briefing/acervo COA = MG2 |
| R4 | Lastros desactualizados → decisões erradas | **Média** | Processo de curadoria + declaração de ignorância |
| R5 | Reabrir CAP-04 plena / F7 sem querer | **Média** | Escopo MVP: lastro COA MG2 apenas |
| R6 | Tocar Classificador «para ajudar o MG2» | **Alta** | Proibido; regressão EIC |
| R7 | Esforço de curadoria humana subestimado | **Média** | MVP estreito; métrica = uso diário, não volume de docs |

---

### 2.9 Qual o ganho esperado em relação ao esforço?

| Dimensão | Avaliação |
|----------|-----------|
| **Esforço** | Médio (ROADMAP) — sobretudo governação de lastro + injecção de contexto; **sem** feature EIC/voz |
| **Ganho** | Alto para o filtro ADR-015 — uso diário do CEO no desenvolvimento do MG2 |
| **Percepção** | Alta se o patrocinador usa o CEO no circuito do jogo todos os dias |
| **ROI** | **Favorável** — maior ROI de evolução de valor na onda actual (ANL-014 / ROADMAP) |
| **Comparação** | Superior a ex-F2 (zero percepção); tipicamente superior a F5 (marco) em valor de turno; complementar a F6 (voz) |

---

## 3. Avaliação face aos critérios de autorização

| Critério CTO | Resultado |
|--------------|-----------|
| Evolução **perceptível** do Sistema CEO | **Sim** — qualidade deliberativa / despachos no COA MG2 |
| Benefício **superior** ao custo técnico | **Sim**, se MVP estreito (lastro curado + consumo; sem importar MG2; sem redesign MRE/EIC) |
| Aderência à arquitectura consolidada | **Sim**, se CAP-04 selectiva / COA; EIC e EE estruturalmente intactos |

---

## 4. Escopo mínimo recomendado (para Gate de abertura)

Se o CTO autorizar, o primeiro ciclo ADR-006 da F3 deve limitar-se a:

1. **Modelo de lastro operacional** do COA MG2 (evolução do briefing, não dump do repo do jogo).  
2. **Consumo** desse lastro nas rotas deliberativas já existentes (C2 / consciência / contexto).  
3. Política explícita: **declarar ignorância** quando fora do lastro.  
4. **Fora:** EIC, Motor, voz, NCS, CAP-04 plena, código do MG2.  
5. Opcional: absorver **lote ex-F2** no arranque **sem** Sprint só-docs.

---

## 5. Veredicto técnico

| Questão | Parecer |
|---------|---------|
| Autorizar abertura da F3? | **Recomendado — SIM**, com escopo mínimo §4 |
| Passa o teste de percepção? | **Sim** |
| Passa custo/benefício? | **Sim** (MVP estreito) |
| Passa aderência arquitectural? | **Sim** (com fronteiras R1–R6) |
| Criar CAP nova? | **Não** |

**Condição:** o artefacto de abertura (ANL/REQ) deve responder por escrito aos filtros ADR-015 + percepção CTO e listar o fora de escopo §4.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), mandato CTO pré-F3 |
| Quando | 06/08/2026 |
| O quê | ANL-017 — Parecer técnico F3 (lastro MG2) |
| Por quê | Gate de autorização com critério de percepção / ROI / arquitectura |
| Resultado | Emitido — **recomendação de autorizar** F3 sob MVP estreito |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro (Cursor) | Parecer completo — 9 respostas + veredicto | Emitido — aguarda deliberação CTO |

---

**Estado:** Em análise pelo CTO.  
**Engenheiro:** não abre F3 nem implementa até mandato explícito de autorização.

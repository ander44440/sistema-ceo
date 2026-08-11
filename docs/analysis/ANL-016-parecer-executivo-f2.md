# ANL-016 — Parecer Executivo pré-abertura da F2

> **Status:** **Decisão CTO homologada** — 06/08/2026: **F2 NÃO AUTORIZADA**; retirada como frente (ver ROADMAP-002 v0.2).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Identificação:** ANL-016.  
> **Mandato:** CTO — parecer obrigatório antes de abrir F2 (pós-fecho F1).  
> **Lastro:** [`ROADMAP-002`](../roadmap/ROADMAP-002-planejamento-proxima-onda-evolucao.md) §F2; [`REL-001`](../REL-001-estado-atual-do-sistema-ceo.md) P1-1…P1-3; [`ANL-014`](ANL-014-mapa-capacidades-executivas-baseline-eic.md) (**aprovada**); GATE-009 NB-3.  
> **Proibições:** não implementa; **não** altera arquitectura; **não** altera governação; **não** abre F2.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Parecer executivo objectivo sobre a F2 candidata, face ao critério CTO de evolução perceptível. |
| **Por que existe?** | F1 encerrada; CTO só autoriza F2 se houver ganho perceptível no Sistema CEO. |
| **Para quem existe?** | CTO (decisão de abrir / replanejar / fundir); Patrocinador; Coordenador; Engenheiro. |
| **Como medir sucesso?** | Oito respostas objectivas + recomendação explícita alinhada ao critério de decisão. |

---

## 1. Definição oficial da F2 (ROADMAP-002)

| Campo | Conteúdo oficial |
|-------|------------------|
| **Nome** | Fecho documental e espelhamento do índice (066/067 + REQ/ARQ) |
| **Objectivo declarado** | Homologar formalmente IMP-066 e IMP-067 no catálogo; alinhar status REQ/ARQ 061–067 ao estado real; fechar EIC-14 se o patrocinador deliberar |
| **Benefício declarado** | Índice = verdade operacional; reduz risco de governação falsa; barato |
| **Impacto declarado** | Médio (governação / auditoria) |
| **Código novo** | Explicitamente **não** necessário |

---

## 2. Respostas objectivas

### 2.1 Qual o objectivo da F2?

**Alinhar a verdade documental à verdade operacional** já existente no runtime:

1. Formalizar no catálogo a homologação de **IMP-066** (tempo ∝ complexidade) e **IMP-067** (DIC).  
2. Corrigir status de **REQ/ARQ 061–067** (hoje muitos «Em análise» apesar de IMP 061–065 **Homologadas** e 066–067 **Implementadas**).  
3. Opcionalmente fechar item **EIC-14** / NB-3 do GATE-009 no índice EIC.

Não é objectivo da F2: nova feature, novo comportamento de conversa, nem evolução de voz.

---

### 2.2 Qual problema do Sistema CEO ela resolve?

| Problema | Tipo |
|----------|------|
| Índice / REQ / ARQ **desmentem** o runtime (governação falsa) | Governação documental |
| IMP-066/067 **sem** fecho formal de homologação no catálogo (REL-001 P1-1/P1-2) | Rastreabilidade / Gate de produto documental |
| Risco de despachos e auditorias sobre estado errado (lição F1/REG) | Processo |

**Não resolve:** qualidade deliberativa MG2, NCS, voz avançada, CAP-04 plena, observabilidade nova, nem lacunas de capacidade sentidas pelo utilizador no dia a dia.

---

### 2.3 Qual ganho perceptível o utilizador terá ao final da F2?

| Dimensão | Ganho |
|----------|--------|
| Experiência na Conversa / voz / painel | **Nenhum perceptível** — o código 066/067 **já corre** |
| Latência / DIC / respostas institucionais | **Inalterado** em runtime (salvo se a «homologação» descobrir defeito — fora do escopo nominal) |
| Confiança do utilizador em «o sistema está alinhado» | Indirecto e **fraco** — só se o utilizador consultar índices/docs |
| Tempo do utilizador (CON-001 Art. 9º) | **Não reduz** tarefas do dia a dia no MG2 |

**Veredicto:** sob o critério CTO («evolução perceptível no Sistema CEO»), a F2 **isolada não demonstra** ganho perceptível ao utilizador final.

---

### 2.4 Quais módulos serão efectivamente alterados?

| Área | Alteração prevista na F2 nominal |
|------|----------------------------------|
| `app/src/**` (runtime) | **Nenhuma** |
| Executive Engine | **Nenhuma** |
| Baseline EIC runtime | **Nenhuma** |
| Documentos REQ-061…067, ARQ-022…028, IMP-066/067, `docs/README.md`, possivelmente `docs/EIC/` | **Sim** — status, Memória, Histórico, índices, evidências de homologação |
| VAL dedicada 066/067 (se criada) | Possível artefacto documental de fecho — **sem** obrigação de código |

---

### 2.5 Existe impacto na Executive Engine?

**Não** — no perímetro nominal da F2.

Homologar e espelhar status **não** altera `executiveEngine`, Classificador, CSC, VCA, complexidade ou DIC em código. Esses módulos **já** foram implementados em frentes anteriores.

---

### 2.6 Existe impacto na Baseline da EIC?

| Camada | Impacto |
|--------|---------|
| EIC **runtime** (pipeline conversacional) | **Não** |
| EIC **documental** (`docs/EIC/`, índices, eventual EIC-14) | **Sim, editorial** — alinhamento / fecho de item documental |
| Congelamento de princípios / Classificador | **Não reabre** desenho; não emenda ARQ-018 |

---

### 2.7 A F2 entrega evolução de produto ou apenas organização documental?

**Apenas organização documental / governação de catálogo.**

Classificação rigorosa:

| Entrega | F2? |
|---------|-----|
| Evolução de produto (comportamento novo ou melhorado perceptível) | **Não** |
| Fecho de Gate documental de peças já em produção | **Sim** |
| Higiene de índice (anti-governação falsa) | **Sim** |

É análoga em natureza ao pacote REG-001 da F1 (regularização), **não** a uma frente de capacidade nova.

---

### 2.8 É possível fundir a F2 com outra frente sem perda técnica?

**Sim — recomendado.**

| Fusão | Perda técnica? | Nota |
|-------|----------------|------|
| **F2 ⊂ lote editorial** (sem abrir «frente F2») | Nenhuma | Executar como REG/higiene sob mandato curto, como REG-001 |
| **F2 + F3** (Lastro MG2) | Nenhuma se F2 for *pré-requisito documental* nos primeiros dias de F3 | Utilizador ganha F3; docs limpam-se no arranque |
| **F2 + F5** (CAP-R / RELEASE) | Nenhuma | Natural: RELEASE exige índice verdadeiro |
| **F2 + F4** (NCS) | Desaconcelhável como fusão de *produto* | Mistura higiene docs com activação cognitiva |
| Absorver F2 em **F1** | N/A | F1 já encerrada |

**Sem perda técnica:** o conteúdo da F2 é independável de F3/F5; fundir **não** atrasa runtime porque F2 não entrega runtime.

---

## 3. Avaliação face ao critério de decisão do CTO

> *«O CTO somente autorizará a abertura da F2 caso fique demonstrado que ela produz evolução perceptível no Sistema CEO.»*

| Teste | Resultado |
|-------|-----------|
| Evolução perceptível ao utilizador? | **Não demonstrada** |
| Evolução de produto? | **Não** |
| Valor de governação / auditoria? | **Sim** (real, mas não perceptível como produto) |
| Autorizar F2 como frente estratégica isolada? | **Não recomendado** |

---

## 4. Recomendação técnica

### Opção recomendada: **Não abrir F2 como frente estratégica isolada**

Em alternativa (escolha do CTO):

| Opção | Descrição |
|-------|-----------|
| **R1 — Replanar** | Descer F2 a **lote de higiene documental** (mandato REG-style), executável em paralelo leve ou imediatamente antes de F3/F5, **sem** consumir o slot de «próxima frente executiva» do ANL-014 |
| **R2 — Fundir em F3** | Abrir **F3** (lastro MG2 — ganho perceptível ADR-015) com **pacote mínimo F2** como pré-voo documental (1–2 dias de índice/Gates 066/067) |
| **R3 — Fundir em F5** | Se a prioridade for marco de versão: F5 inclui espelhamento 061–067 + VAL formal 066/067 |
| **R4 — Abrir F2 mesmo assim** | Só se o CTO **redefinir** o critério para «evolução de governação» — o critério actual de percepção de produto **não** é satisfeito |

**Parecer do Engenheiro:** adoptar **R1** ou **R2**.  
A próxima frente com evolução perceptível alinhada a ADR-015 / ANL-014 é **F3** (ou F4/F6 conforme prioridade do patrocinador) — **não** F2 isolada.

---

## 5. Síntese para o CTO (uma página)

| # | Pergunta | Resposta curta |
|---|----------|----------------|
| 1 | Objectivo F2 | Espelhar índice + homologar formalmente 066/067 (+ EIC-14 opcional) |
| 2 | Problema | Governação falsa / Gates documentais em aberto |
| 3 | Ganho utilizador | **Nenhum perceptível** |
| 4 | Módulos alterados | Só documentação / índices |
| 5 | Impacto EE | **Não** |
| 6 | Impacto Baseline EIC | Só docs EIC; runtime **não** |
| 7 | Produto vs docs | **Só organização documental** |
| 8 | Fundir? | **Sim** — com F3 ou F5, ou lote REG |

**Decisão sugerida:** **não autorizar F2 isolada**; replanejar (R1) ou incorporar a F3/F5 (R2/R3).

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), mandato CTO pré-F2 |
| Quando | 06/08/2026 |
| O quê | ANL-016 — Parecer executivo F2 |
| Por quê | Critério de evolução perceptível antes de abrir frente |
| Resultado | Emitido — F2 isolada **não** passa o critério; recomendar R1/R2 |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro (Cursor) | Parecer completo — 8 respostas + recomendação | Emitido |
| 0.2 | 06/08/2026 | Engenheiro (Cursor) | Registo decisão CTO — F2 não autorizada; ROADMAP-002 actualizado | Homologada |

---

**Estado:** Decisão CTO **homologada** — F2 não autorizada; conteúdo → lote REG / preparatório.  
**Engenheiro:** não trata ex-F2 como frente; aguarda mandato de frente de **produto** (tipicamente F3).

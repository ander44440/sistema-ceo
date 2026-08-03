# ANL-010 — Validador de Contexto Ativo (VCA)

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação (Compreensão Semântica e Contextual — camada **pré-cadeia** EIC, pós IMP-061…064 homologadas).  
> **Normas consultadas (somente leitura):** CON-001; ADR-006; ADR-015; ARQ-018; ARQ-019; ARQ-022 / IMP-061; ARQ-023 / IMP-062; ARQ-024 / IMP-063; ARQ-025 / IMP-064; REQ-057; ARQ-017; ARQ-014 (NCS); PX-003; ANL-006…009; `docs/EIC/`.  
> **Origem:** Comando do patrocinador — Análise Técnica da capacidade «Validador de Contexto Ativo (VCA)»; motivação: testes executivos com **falsas continuações**.  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **REQ**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise da estratégia para o CEO **validar se a mensagem actual pertence ao contexto conversacional activo** — *antes* de alimentar histórico, referentes, tópicos e objectivo — evitando que capacidades CSC contaminem interpretações independentes. |
| **Por que existe?** | Após IMP-061…064, a cadeia EIC **assume por omissão** que toda mensagem nova pertence ao fio activo. Testes executivos mostraram **falsas continuações** que enviesam C1↔C2, referentes, tópicos e objectivos. |
| **Para quem existe?** | Patrocinador (uso diário MG2 — perguntas soltas / meta / conhecimento geral no meio do fio); CTO (REQ); Engenheiro (IMP futuro). |
| **Como medir sucesso desta ANL?** | (1) Diagnóstico da decisão implícita de «pertença»; (2) causa raiz; (3) estratégia pré-cadeia clara; (4) impacto em 061–064; (5) invariantes Gate/Classificador/Motor/NCS; (6) sem implementação nesta etapa. |

---

## 1. Objetivo

Diagnosticar como o CEO decide hoje se uma nova mensagem **pertence ao contexto activo** e definir a **estratégia arquitectural** para:

1. validar essa decisão **antes** de toda a cadeia EIC CSC (061→063→062→064→classificar);  
2. evitar **falsas continuações**;  
3. identificar **perguntas independentes**, **conhecimento geral**, **metaconversas** sobre o CEO e **abertura de novo contexto**;  
4. tratar **ambiguidade** com pergunta curta (sem Job/C3);  
5. preservar Gate, Classificador, Motor, NCS e Jobs;  
6. preparar a **REQ** «Validador de Contexto Ativo» (CAP-07 — **sem CAP nova**).

---

## 2. Arquitectura actual (pós-IMP-061…064)

### 2.1 Cadeia de limiar homologada

```text
Utilizador → historico[]  (UI — tipicamente inclui o fio recente)
                │
                ▼
         Continuidade Gate          ← só léxico Aprovado/Cancela/Adiar
                │                     (não valida «pertença» temática)
                ▼
         historicoRecente (4/200/800)     ← IMP-061  ★ assume pertença
                │
                ▼
         gestorTopicos                   ← IMP-063  ★ assume fio
                │
                ▼
         resolverReferencias             ← IMP-062  ★ assume deixis no fio
                │
                ▼
         gestorObjectivo                 ← IMP-064  ★ assume outcome do fio
                │
                ▼
         classificar (C1–C4)             ← recebe histórico/objectivo no contexto
                │
                ▼
         destinos + lastro
```

**Lacuna:** não existe um passo que pergunte *«esta mensagem pertence ao contexto activo?»*. A pertença é **implícita e automática**.

### 2.2 Como o «contexto activo» é determinado hoje

| Fonte | O que decide | Momento | É VCA? |
|-------|--------------|---------|--------|
| `historico[]` da UI | O que a interface envia (últimos turnos) | Entrada do Núcleo | **Não** — transporte, não validação |
| Continuidade Gate | Só se há Gate pendente + léxico de decisão | Antes da cadeia CSC | **Não** — acto de aprovação, não pertença temática |
| `seleccionarHistoricoRecente` | Janela mecânica das **últimas 4** mensagens | Sempre, se há histórico | **Não** — não filtra por relevância semântica |
| `frenteActiva` / COA | Bias de projecto (C2 / E2.2) | Classificação | **Parcial** — frente ≠ «esta fala é continuidade» |
| Deixis (`isso`, `continua`) | Heurística de follow-up | 061 / 062 | **Parcial** — só cobre deixis explícita |
| IMP-063 / 064 | Preferem `continuar` em dúvida (anti falso-shift) | Após janela | **Amplifica** falsa continuação |
| ARQ-018 §4.4 | Reclassifica **classe** do zero | Classificar | **Não impede** lastro de histórico na desambiguação C1↔C2 |

### 2.3 Momento da decisão (hoje)

A «decisão» de pertença ocorre **por omissão no instante em que a janela IMP-061 é montada e injectada** — imediatamente após o Gate (ou na sua ausência). Não há ramo «contexto isolado».

### 2.4 Componentes que participam (sem validar pertença)

| Componente | Papel actual face à pertença |
|------------|------------------------------|
| UI / Conversa | Envia `historico[]` completo recente |
| Gate (ARQ-019) | Precedência de decisão; clarificação se texto fora do léxico |
| IMP-061 | Assume que a janela é lastro válido |
| IMP-062 | Resolve deixis **no** lastro |
| IMP-063 | Mantém / shift de tópico **no** fio |
| IMP-064 | Mantém / muda objectivo **no** fio |
| Classificador | Pode ser puxado C1→C2 por histórico/frente (S3) |
| Motor / NCS / Jobs | Downstream; herdam interpretação já contaminada |

---

## 3. Limitações

| ID | Limitação | Impacto UX / testes executivos |
|----|-----------|--------------------------------|
| L1 | Pertença automática a todo o histórico recente | Pergunta solta interpretada como continuação do MG2/outdoor |
| L2 | Janela 061 é mecânica (N últimas), não semântica | «O que é um ADR?» após outdoor → risco de C2/projecto |
| L3 | Anti falso-shift (063/064) prefere continuar | Novo assunto fraco fica colado ao activo |
| L4 | Deixis alarga continuidade sem pedir confirmação | «Ok» / «e agora?» reforçam o fio mesmo quando o utilizador mudou de intenção |
| L5 | Metaconversa («qual o teu papel?») no meio do fio | Pode herdar lastro de tópico/objectivo |
| L6 | Conhecimento geral no meio do fio | Contaminação C1↔C2 via S3 |
| L7 | Sem estado «contexto suspenso / isolado» | Não há modo de processar mensagem **sem** CSC |
| L8 | Gate não cobre pertença | Gate pendente + pergunta geral → clarificação de Gate, não de contexto |

---

## 4. Causa raiz

```text
Hipótese confirmada pela arquitectura actual:

  H0 — «Se existe histórico (e/ou frente activa), a mensagem pertence ao contexto.»

Essa hipótese nunca é testada. As capacidades 061–064 foram desenhadas para
*melhorar a continuidade quando a pertença é verdadeira*, não para *provar* a
pertença. O resultado é um enviesamento sistemático para falsa continuação.
```

**Causa raiz:** ausência de um **validador de pertença** (pré-condição) antes da cadeia de continuidade conversacional.  
Não é falha do Classificador como único decisor de classe; é falha de **orquestração do lastro**.

---

## 5. Casos a cobrir (requisitos analíticos)

| Caso | Descrição | Comportamento desejado (estratégia) |
|------|-----------|-------------------------------------|
| **Continuação genuína** | Deixis / mesma âncora / «continua» alinhado ao activo | `pertence` → cadeia 061–064 normal |
| **Pergunta independente** | Questão autónoma sem âncora do fio | `independente` → classificar **sem** lastro CSC (ou lastro mínimo) |
| **Conhecimento geral** | «O que é Docker?», «Quem foi Einstein?» | `conhecimento_geral` → path C1 limpo; sem S3 de projecto |
| **Metaconversa CEO** | Papel, decisões, Jobs (E2.3) | `metaconversa` → C2 institucional **sem** forçar tópico/objectivo do MG2 |
| **Novo contexto** | Marcador / âncora nova clara sem continuidade | `novo_contexto` → opcional reset/suspensão de lastro CSC; classificar |
| **Ambíguo** | Pode ser continuação ou independente | `ambiguo_contexto` → pergunta curta; 0 Jobs |

---

## 6. Alternativas consideradas

| ID | Alternativa | Veredicto |
|----|-------------|-----------|
| **A** | Endurecer só IMP-061 (não injectar histórico se mensagem «parece C1») | **Insuficiente** — duplica Classificador; não cobre tópico/objectivo |
| **B** | Preferir `neutro` em 063/064 | **Insuficiente** — S3 do Classificador e 062 ainda contaminam |
| **C** | Validador DET **antes** da cadeia CSC: decide pertença; se não pertence, omite/suspende lastro 061–064 | **Recomendada (núcleo V1)** |
| **D** | LLM classifica pertença no limiar | **Rejeitada** no limiar (não-DET; custo; ARQ-018) |
| **E** | Nova classe C5 «fora de contexto» | **Rejeitada** — polui enum; pertença ≠ intenção |
| **F** | Só prosa CN («mudámos de assunto?») sem estado | **Insuficiente** — não impede lastro técnico |

**Escolha:** **C**; A/B como reforços opcionais na IMP; D/E/F fora do MVP.

---

## 7. Estratégia recomendada

### 7.1 Princípio

Introduzir um módulo puro **Validador de Contexto Ativo (VCA)** — auxiliar, **pré-cadeia CSC**:

| Módulo | Decide |
|--------|--------|
| Gate | Decisão de aprovação (inalterado) |
| **VCA (esta ANL)** | **Pertença** ao contexto activo (sim / não / ambíguo / tipo de isolamento) |
| IMP-061…064 | Continuidade **só se** VCA autorizar lastro |
| Classificador | **Classe** C1–C4 (único decisor) |

```text
Gate
  │
  ▼
validarContextoAtivo({ mensagem, historico?, topicoActivo?, objetivoActivo?, frente? })
  │
  ├─ pertence / continuar_contexto
  │     → historicoRecente → 063 → 062 → 064 → classificar   (path actual)
  │
  ├─ independente | conhecimento_geral | metaconversa | novo_contexto
  │     → classificar **sem** injectar historicoRecente / sem orientar 062–064
  │       (stores de tópico/objectivo: preservar ou suspender — política REQ)
  │
  └─ ambiguo_contexto
        → pergunta curta; commitEstado false; 0 Jobs
```

### 7.2 Evitar falsas continuações

| Regra V1 | Efeito |
|----------|--------|
| Sem deixis e sem overlap de âncora/família com tópico/objectivo activos | Preferir **não pertence** (ou ambíguo se houver overlap fraco) |
| Marcadores de conhecimento geral / meta CEO (alinhados E2.2 / E2.3) | Isolamento — **não** passar janela a S3 |
| Preferir isolamento em dúvida fraca (inverso do anti falso-shift 063) | Anti **falsa continuação** |
| Deixis explícita com activo | `pertence` |

### 7.3 Impacto sobre IMP-061…064

| IMP | Impacto V1 | Revoga? |
|-----|------------|---------|
| **061** | Janela só montada/injectada se VCA = pertence (ou modo «janela vazia» no isolamento) | **Não** — contrato 4/200/800 intacto quando activo |
| **062** | Não corre (ou corre em no-op) se isolamento — evita referente fantasioso | **Não** |
| **063** | Não actualiza / não «continuar» forçado em isolamento; activo **preservado** (sem abandono auto) | **Não** |
| **064** | Idem objectivo — preservar activo; sem `continuar` fantasma | **Não** |

**Princípio:** VCA **condiciona o uso** do lastro; não reescreve as regras internas de 061–064.

### 7.4 Compatibilidade Gate / Classificador / Motor / NCS

| Peça | Política |
|------|----------|
| **Gate** | Continua primeiro; VCA **não** resolve Gates nem altera léxico. Se Gate pendente + mensagem isolada → clarificação Gate **ou** clarificação combinada (política REQ — sem auto-abandonar Gate) |
| **Classificador** | Único decisor de classe; VCA **não** escreve `classe` / `permiteJob`. Isolamento = contexto de classificação **sem** `historicoRecente` (path baseline IMP-057) |
| **Motor / Jobs** | Intocados; VCA nunca cria Jobs |
| **NCS** | Intocado |
| **C3** | Mensagem com verbos E2.1 → C3 do Classificador; VCA não promove nem bloqueia C3 |

### 7.5 Impacto esperado na UX

| Antes | Depois (MVP) |
|-------|----------------|
| «O que é um ADR?» no meio do outdoor → cheira a C2/projecto | Path C1 limpo (isolamento) |
| «Qual o teu papel?» com objectivo MG2 activo | Metaconversa sem lastro de outdoor |
| «Continua» no outdoor | Pertença → cadeia CSC intacta |
| Dúvida pertença | Uma pergunta curta; sem Job |

---

## 8. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Falso isolamento (perder continuidade genuína) | Deixis + overlap de âncora → pertence; testes SC de continuação |
| R2 | Falsa continuação residual | Preferir isolamento em dúvida; CT anti-contaminação |
| R3 | Duplicar Classificador (VCA decide C1) | VCA só decide **pertença**; classe fica no Classificador |
| R4 | Quebrar 061–064 homologados | Condicionar injectação; regressão 057/061/062/063/064 obrigatória |
| R5 | Cascata de perguntas (VCA + tópico + referente) | Prioridade: Gate > ambiguo_contexto > objectivo > tópico > referente |
| R6 | Abandono indevido de tópico/objectivo | Em isolamento: **preservar** stores (não limpar no V1) |
| R7 | Conflito com princípio «nunca perder o contexto» | Contexto preservado em store; apenas **não injectado** neste turno |

---

## 9. Compatibilidade com a EIC

| Elemento | Compatibilidade |
|----------|-----------------|
| **CAP-07** | Sem CAP nova |
| **EIC CSC** | Camada **pré-cadeia** (fundação); 061–064 permanecem melhorias de continuidade **condicionadas** |
| **ARQ-018** | Classificador intacto; §4.4 para classe; lastro opcional respeitado |
| **ARQ-019** | Gate antes do VCA; contrato intacto |
| **IMP-061…064** | Homologadas; VCA não as revoga — condiciona activação |
| **G-EIC-D + ADR-006** | Obrigatórios antes de IMP |
| **Princípios** | Tempo do utilizador; nunca perder contexto (store); CEO ≠ chatbot (não forçar fio) |

---

## 10. MVP recomendado (futura REQ)

### 10.1 Dentro

* Módulo puro `validarContextoAtivo` (nome IMP a fixar).  
* Entrada: mensagem + sinais read-only (`historico` bruto ou janela candidata, `topicoActivo`, `objetivoActivo`, `frenteActiva`, marcadores DET).  
* Saída: `{ veredicto: pertence \| independente \| conhecimento_geral \| metaconversa \| novo_contexto \| ambiguo_contexto, perguntaCurta?, razaoContexto, autorizaLastroCsc: boolean }`.  
* Integração no Núcleo: **após Gate**, **antes** de montar/injectar cadeia 061→063→062→064.  
* Se `autorizaLastroCsc = false` → classificar sem `historicoRecente` / sem orientação 062–064 neste turno; stores preservados.  
* Ambiguidade → pergunta curta; 0 Jobs; `motorAcionado` false.  
* Testes: regressão 057/061/062/063/064 + Continuidade + CT de isolamento/pertença.  

### 10.2 Fora do MVP

* LLM no limiar.  
* Reset automático permanente de tópico/objectivo.  
* Novas classes C1–C4.  
* Alterar limiar 0,55 / Gate / Motor / NCS / Jobs.  
* Redesign da janela 4/200/800.  

### 10.3 Ordem ADR-006 sugerida

```text
ANL-010 (este) → aprovação CTO
  → REQ-065 Validador de Contexto Ativo   ← elaborada (Em análise v0.1)
  → ARQ-026 (VCA pré-cadeia; contrato autorizaLastroCsc)
  → G-EIC-D + IMP-065 → VAL
```

### 10.4 Critérios de aceite sugeridos (para a REQ)

1. Sem sinais de isolamento ⇒ path 061–064 actual preservado.  
2. Conhecimento geral / pergunta independente no meio do fio ⇒ classificação **sem** S3 de histórico de projecto.  
3. Metaconversa CEO ⇒ sem forçar tópico/objectivo MG2 no lastro.  
4. «Continua» / deixis com activo ⇒ `pertence`; cadeia CSC activa.  
5. Ambiguidade ⇒ pergunta curta; 0 Jobs.  
6. Classificador único decisor; Gate/Motor/NCS intactos.  
7. Suites IMP-057 + 061 + 062 + 063 + 064 + Continuidade verdes.

---

## 11. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Implementação / prompts / comportamento |
| X2 | Criar CAP nova |
| X3 | Emendar texto de ARQ-018…025 nesta ANL |
| X4 | Fechar léxico exacto de isolamento (cabe à REQ/IMP) |
| X5 | Reabrir homologação 061–064 (apenas condicionar uso) |

---

## 12. Conclusão

O CEO **já gere** continuidade (061–064), mas **não valida** se a mensagem actual **pertence** ao contexto activo. A pertença é uma hipótese implícita no momento da injectação do lastro — causa raiz das falsas continuações observadas nos testes executivos.

A próxima frente EIC sob CAP-07 deve introduzir um **Validador de Contexto Ativo** auxiliar **antes** da cadeia CSC: autorizar ou suspender o lastro por turno, sem usurpar o Classificador nem alterar Gate/Motor/NCS/Jobs, e **sem** revogar IMP-061…064.

Esta ANL está **pronta para abertura da REQ** «Validador de Contexto Ativo».

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Análise técnica inicial | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-065-validador-contexto-ativo.md`](../requirements/REQ-065-validador-contexto-ativo.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-026-validador-contexto-ativo.md`](../architecture/ARQ-026-validador-contexto-ativo.md) (Em análise v0.1 — 03/08/2026).  
**Próximo passo oficial:** Homologação do patrocinador (Gate) da **IMP-065** / REQ-065 / ARQ-026.

# ANL-008 — Gestão de Mudança de Assunto (Topic Shift)

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação (Compreensão Semântica e Contextual — 3ª melhoria perceptível sob EIC).  
> **Normas consultadas (somente leitura):** CON-001; ADR-006; ADR-015; ARQ-018 §4.4; ARQ-019; ARQ-022 / IMP-061; ARQ-023 / REQ-062 / IMP-062; REQ-057; ARQ-017; ARQ-014 (NCS); PX-003; ANL-006; ANL-007; `docs/EIC/`.  
> **Origem:** Comando do patrocinador — Análise Técnica da capacidade «Gestão de Mudança de Assunto (Topic Shift)».  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **REQ**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise da estratégia para o CEO **detectar e gerir mudanças de assunto** (topic shift), retomadas de tópicos e múltiplos focos no fio conversacional, sem redesenhar Classificador, Gate, Motor, NCS ou Jobs. |
| **Por que existe?** | Após IMP-061 (rota via histórico) e IMP-062 (referente de deixis), o sistema ainda **não modela o tópico activo** nem distingue *continuar o mesmo fio* de *mudar de assunto*. Com Gate aberto, a mudança de assunto é risco conhecido (ARQ-019) mitigado só por clarificação de léxico — não por gestão de tópicos. |
| **Para quem existe?** | Patrocinador (uso diário MG2 com vários frentes); CTO (REQ); Engenheiro (IMP futuro). |
| **Como medir sucesso desta ANL?** | (1) Diagnóstico pós-061/062; (2) estratégia e MVP claros; (3) integração com histórico/referente; (4) invariantes de preservação; (5) sem implementação nesta etapa. |

---

## 1. Objetivo

Diagnosticar o tratamento actual de mudanças de assunto e definir a **estratégia arquitectural** para:

1. identificar mudanças **explícitas** e **implícitas** de tópico;  
2. reconhecer **retomadas** de tópicos anteriores na janela;  
3. diferenciar **continuação** vs **mudança de contexto**;  
4. lidar com **múltiplos tópicos** activos sem forçar C3/Job;  
5. integrar com **IMP-061** e **IMP-062** sem os revogar;  
6. preservar Gate, Classificador, Motor, NCS e Jobs;  
7. preparar a **REQ** «Gestão de Mudança de Assunto» (CAP-07 — **sem CAP nova**).

---

## 2. Arquitectura actual (pós-IMP-061 / IMP-062)

### 2.1 Cadeia de limiar

```text
Utilizador → historico[]
                │
                ▼
         Continuidade Gate          ← só léxico Aprovado/Cancela/Adiar
                │                     (mudança de assunto com Gate → clarificação RF12)
                ▼
         historicoRecente (4/200/800)     ← IMP-061
                │
                ▼
         resolverReferencias              ← IMP-062 (referente OU ambiguidade)
                │
                ▼
         classificar (C1–C4)              ← único decisor de classe; «do zero» por mensagem
                │
                ▼
         destinos + lastro (se referente)
```

### 2.2 Como mudanças de assunto são tratadas hoje

| Situação | Comportamento actual | Gestão de tópico? |
|----------|----------------------|-------------------|
| Nova mensagem sem Gate | **Reclassificada do zero** (ARQ-018 §4.4) | **Não** — só nova classe |
| «Mudança explícita» («vamos falar de pagamento») | Léxico C2 se projecto; sem etiqueta «shift» | **Não** |
| Retoma («voltando ao outdoor») | Pode acertar C2 + IMP-062 se deixis; senão LLM | **Parcial / acidental** |
| Continuação («continua», «e isso?») | IMP-061 → C2; IMP-062 → referente | Continuação **implícita**, sem estado de tópico |
| Gate aberto + texto novo fora do léxico | Clarificação Gate (pedir decisão **ou** tratar pedido novo) | **Não** modela tópico; só prioridade Gate |
| Gate + «Aprovado» | Retoma C3 anterior | Retoma **acto**, não tópico conversacional |
| Múltiplos tópicos no histórico | IMP-062 pode marcar **ambiguo** (ex. outdoor vs pagamento) | Ambiguidade de **referente**, não pilha de tópicos |

### 2.3 Activos reutilizáveis (IMP-061 / IMP-062)

| Activo | Papel para Topic Shift |
|--------|------------------------|
| Janela `historicoRecente` | Fonte de tópicos recentes (mesmos caps) |
| Léxico / famílias de âncora (IMP-062) | Candidatos a «tópico» DET |
| `ReferenteResolvido` | *Foco pontual* do turno — não é pilha de assuntos |
| Clarificação de referente | Já pergunta quando N focos competem no *mesmo* deixis |
| Classificador | Continua a decidir **intenção**; shift não deve usurpar C3 |

**Conclusão:** 061/062 resolvem **rota** e **referente do turno**. Falta um modelo de **tópico activo / histórico de tópicos / evento de shift**.

---

## 3. Limitações

| ID | Limitação | Impacto UX |
|----|-----------|------------|
| L1 | Sem detector de topic shift | CEO não «fecha» o fio anterior nem anuncia mudança |
| L2 | Sem pilha / set de tópicos activos | Retomas dependem de deixis ou repetição explícita |
| L3 | Continuação vs mudança confundíveis | «E o pagamento?» pode ser shift ou subtópico |
| L4 | Gate aberto + assunto novo | Utilizador preso em clarificação de Gate sem política de «abandonar / estacionar» tópico |
| L5 | Múltiplos tópicos | Só ambiguidade pontual IMP-062; sem «tópico A em pausa, B activo» |
| L6 | ARQ-018 §4.4 «do zero» | Correcto para **classe**; insuficiente para **continuidade temática** |
| L7 | Sem sinal para prosa (CN) | IQ-CO / CA-EIC-08 (continuidade do fio) sem lastro de shift |

---

## 4. Oportunidades

1. **MVP perceptível:** ao detectar shift explícito, o CEO confirma o novo foco («Mudámos para pagamento; outdoor fica em pausa») sem burocracia.  
2. **Retoma:** «Voltando ao outdoor» reactiva tópico anterior na pilha — alimenta IMP-062 / lastro C2.  
3. **Integração limpa:** módulo auxiliar **Gestor de Tópicos** ao lado de Resolvedor e Classificador (padrão ARQ-023).  
4. **Gate:** política explícita «novo assunto com Gate pendente» (estacionar Gate vs priorizar decisão) — sem redesenhar Motor.  
5. **Reutilizar** léxico/famílias IMP-062 + janela 061.  
6. Fechar lacuna EIC CSC (após histórico + referentes).

---

## 5. Alternativas consideradas

| ID | Alternativa | Veredicto |
|----|-------------|-----------|
| **A** | Só melhorar IMP-062 (mais ambiguidade) | **Insuficiente** — não modela shift/retoma/pilha |
| **B** | Gestor de Tópicos DET: estado `topicoActivo` + eventos `continuar` \| `shift` \| `retomar` \| `ambiguo_topico` | **Recomendada (núcleo V1)** |
| **C** | LLM classifica shift no limiar | **Rejeitada** no limiar (custo; não-DET; ARQ-018) |
| **D** | Persistência longa de tópicos (DB) | **Fase 2** — V1 = sessão + janela 061 |
| **E** | Fundir shift dentro do Classificador (nova «classe») | **Rejeitada** — polui C1–C4; CQ3 ARQ-018 |

**Escolha:** **B**; A como apoio; D/C/E fora do MVP.

---

## 6. Estratégia recomendada

### 6.1 Princípio

Introduzir um módulo puro **Gestor de Mudança de Assunto** (auxiliar), **paralelo** ao Resolvedor (IMP-062) e **anterior/independente** da decisão de classe:

| Módulo | Decide |
|--------|--------|
| Classificador | **Classe** de intenção (C1–C4) |
| Resolvedor (062) | **Referente** do deixis do turno |
| Gestor de Tópicos (esta ANL) | **Evento temático**: continuar / shift / retomar / ambíguo |

```text
Gate → historicoRecente (061)
         │
         ├─► gestorTopicos(...)     ← NOVO (evento + topicoActivo sugerido)
         ├─► resolverReferencias    ← 062 (pode consumir topicoActivo)
         └─► classificar            ← único decisor de classe
```

### 6.2 Como diferenciar continuação vs mudança

| Sinal | Interpretação V1 |
|-------|------------------|
| Deixis / «continua» + mesmo família de âncora que tópico activo | **continuar** |
| Marcadores explícitos («mudando de assunto», «agora sobre», «deixemos o X», «passemos ao Y») | **shift** |
| Menção a âncora que esteve activa antes e ≠ activo | **retomar** |
| Nova âncora distinta sem marcador, com activo forte | **shift** candidato (confiança média) ou **ambiguo_topico** |
| Sem âncoras / C1 genérico | **neutro** (não actualiza pilha) |

### 6.3 Múltiplos tópicos activos

V1: pilha curta em memória de **sessão** (não DB):

* `topicoActivo` (0..1)  
* `topicosEmPausa[]` (máx. **2** no MVP)  

Regras:

* **shift** → activo anterior vai para pausa (se distinto); novo torna-se activo.  
* **retomar** → troca activo ↔ pausa.  
* **ambiguo_topico** → pergunta curta («Seguimos no outdoor ou passamos ao pagamento?») — **sem** Job/C3.  
* Não acumular mais de 2 em pausa: descartar o mais antigo com transparência mínima na prosa (fase IMP).

### 6.4 Integração IMP-061 / IMP-062

| Integração | Regra |
|------------|--------|
| **061** | Gestor **reutiliza** a mesma janela; não cria janela maior no MVP |
| **062** | Se evento `continuar` / `retomar`, preferir `topicoActivo` como prioridade acima de P2 genérico; se `shift`, não forçar referente do tópico antigo |
| Ordem | Gestor → Resolvedor → Classificador (recomendado) |
| Sem overlap | 062 responde «*o quê* do deixis»; gestor responde «*qual fio* estamos» |

### 6.5 Gate / Classificador / Motor / NCS / Jobs

| Peça | Política |
|------|----------|
| **Gate** | Inalterado no contrato; se Gate pendente + evento `shift` claro → clarificação **combinada** mínima («Há Gate pendente sobre X. Queres decidir o Gate ou tratar Y agora?») — **sem** auto-abandonar Gate no MVP sem REQ explícita |
| **Classificador** | Único decisor de classe; gestor **não** escreve `classe` / `permiteJob` |
| **Motor / Jobs** | Intocados; shift **nunca** publica Job |
| **NCS** | Intocado |

### 6.6 Impacto esperado na UX

| Antes | Depois (MVP) |
|-------|----------------|
| Mudança de assunto silenciosa | Confirmação curta do novo foco (opcional, 1 frase) |
| Retoma exige repetir o tema | «Voltando ao outdoor» reactiva lastro |
| Gate + novo pedido | Pergunta clara Gate vs novo assunto |
| Outdoor + pagamento | Ambiguidade de tópico gerida, não só de deixis |

---

## 7. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Falso shift (subtópico tratado como mudança) | Limiar + famílias IMP-062; preferir `continuar` em dúvida |
| R2 | Duas perguntas (referente + tópico) no mesmo turno | Priorizar uma: Gate > tópico ambiguo > referente ambiguo |
| R3 | Usurpar Classificador / C3 | Invariantes I-ONE / I-C3; testes |
| R4 | Redesenhar Gate «para ajudar» | Só clarificação; sem timeout/abandono automático no MVP |
| R5 | Pilha complexa demais | Máx. 1 activo + 2 pausa |
| R6 | Conflito conceptual com IMP-062 | Documentar fronteiras na REQ/ARQ |

---

## 8. Compatibilidade com a EIC

| Elemento | Compatibilidade |
|----------|-----------------|
| **CAP-07** | Sem CAP nova |
| **EIC CSC** | 3ª frente após histórico (061) e referentes (062) |
| **ARQ-018** | §4.4 preservado para classe; gestor é sinal auxiliar |
| **ARQ-019** | Gate antes; clarificação de conflito Gate×shift alinhada ao risco já registado |
| **ARQ-022 / IMP-061** | Janela reutilizada |
| **ARQ-023 / IMP-062** | Consumidor/produtor de foco; não revogado |
| **G-EIC-D + ADR-006** | Obrigatórios antes de IMP |
| **Princípios** | Nunca perder contexto; tempo do utilizador; CEO ≠ chatbot |

---

## 9. MVP recomendado (futura REQ)

### 9.1 Dentro

* Módulo puro `gestorTopicos` (ou nome IMP).  
* Entrada: mensagem + `historicoRecente` (061) + `topicoActivo`/`pausas` de sessão + sinais opcionais COA.  
* Saída: `{ evento: continuar\|shift\|retomar\|ambiguo_topico\|neutro, topicoActivo?, pausas?, perguntaCurta? }`.  
* Marcadores explícitos de shift/retoma (léxico DET).  
* Shift implícito só com âncora nova distinta + margem de confiança.  
* Integração: alimentar lastro C2 e orientar IMP-062; **uma** pergunta se ambíguo.  
* Gate pendente + shift: clarificação combinada (texto fixo/template) — sem abandono automático.  
* Testes: regressão 057/061/062; anti-C3; Gate intacto; SC de shift/retoma.  

### 9.2 Fora do MVP

* LLM no limiar; embeddings de tópico.  
* Persistência DB multi-sessão.  
* Mais de 2 tópicos em pausa.  
* Timeout/abandono automático de Gate.  
* Novas classes no Classificador.  
* Alterar limiar 0,55 / Motor / NCS / Jobs.

### 9.3 Ordem ADR-006 sugerida

```text
ANL-008 (este) → aprovação CTO
  → REQ-0xx Gestão de Mudança de Assunto
  → ARQ-0xx (gestor auxiliar; integração 061/062/Gate)
  → G-EIC-D + IMP → VAL
```

### 9.4 Critérios de aceite sugeridos (para a REQ)

1. Sem sinais de shift/retoma ⇒ comportamento actual (061+062) preservado.  
2. Marcador explícito + novo tópico ⇒ evento `shift`; classe ≠ C3 só por shift.  
3. «Voltando ao outdoor» com outdoor em pausa ⇒ `retomar` + lastro outdoor.  
4. Dois tópicos sem deixis clara ⇒ pergunta curta; 0 Jobs.  
5. Gate pendente + shift ⇒ clarificação combinada; Continuidade/Gate intactos.  
6. Suites IMP-057/061/062 + Continuidade verdes.

---

## 10. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Implementação / prompts / comportamento |
| X2 | Criar CAP nova |
| X3 | Emendar texto de ARQ-018/019 nesta ANL |
| X4 | Fechar léxico exacto de marcadores (cabe à REQ/IMP) |

---

## 11. Conclusão

O CEO **reclassifica** cada mensagem e já gere **rota** (061) e **referente** (062), mas **não gere mudança de assunto** como capacidade de primeira classe. A próxima frente EIC sob CAP-07 deve introduzir um **Gestor de Tópicos auxiliar** (continuar / shift / retomar), reutilizando a janela IMP-061 e coordenando-se com IMP-062, **sem** tocar Classificador-como-decisor, Gate/Motor/NCS/Jobs.

Esta ANL está **pronta para abertura da REQ** «Gestão de Mudança de Assunto».

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Análise técnica inicial | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-063-gestao-mudanca-de-assunto.md`](../requirements/REQ-063-gestao-mudanca-de-assunto.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-024-gestao-mudanca-de-assunto.md`](../architecture/ARQ-024-gestao-mudanca-de-assunto.md) (Em análise v0.1 — 03/08/2026).  
**IMP:** [`IMP-063-gestao-mudanca-de-assunto.md`](../implementation/IMP-063-gestao-mudanca-de-assunto.md) (Implementada — pronta para homologação).  
**Próximo passo oficial:** Homologação IMP-063 (3ª capacidade perceptível EIC / CSC).

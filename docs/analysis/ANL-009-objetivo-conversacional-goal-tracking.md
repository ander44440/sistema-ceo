# ANL-009 — Objetivo Conversacional (Goal Tracking)

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação (Compreensão Semântica e Contextual — 4ª melhoria perceptível sob EIC, pós IMP-061/062/063).  
> **Normas consultadas (somente leitura):** CON-001; ADR-006; ADR-015; ARQ-018; ARQ-019; ARQ-022 / IMP-061; ARQ-023 / IMP-062; ARQ-024 / IMP-063; REQ-057; ARQ-017; ARQ-014 (NCS); ADR-019 / MRE (`objetivoReal`); PX-003; ANL-006…008; `docs/EIC/`.  
> **Origem:** Comando do patrocinador — Análise Técnica da capacidade «Objetivo Conversacional (Goal Tracking)».  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **REQ**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise da estratégia para o CEO **identificar, manter e actualizar o objectivo** que o utilizador pretende alcançar ao longo da conversa — distinto de tópico, referente, tarefa/Job e intenção C1–C4. |
| **Por que existe?** | Após histórico (061), referentes (062) e tópicos (063), o sistema ainda **não modela um objectivo conversacional activo multi-turno**. O «objectivo» aparece fragmentado (mensagem = objectivo do prompt; `objetivoReal` do MRE por turno; `intencaoDoDia` no painel) sem estado contínuo no limiar. |
| **Para quem existe?** | Patrocinador (uso diário MG2 — «para onde vamos?»); CTO (REQ); Engenheiro (IMP futuro). |
| **Como medir sucesso desta ANL?** | (1) Diagnóstico pós-061/062/063; (2) distinção objectivo ≠ tarefa ≠ tópico; (3) estratégia e MVP claros; (4) integração com cadeia EIC; (5) invariantes de preservação; (6) sem implementação nesta etapa. |

---

## 1. Objetivo

Diagnosticar como o CEO identifica hoje o objectivo do utilizador e definir a **estratégia arquitectural** para:

1. identificar objectivos **explícitos**;  
2. distinguir **objectivo** de **tarefa** (e de tópico / referente / classe);  
3. identificar **mudança de objectivo**;  
4. manter um **objectivo activo** durante vários turnos;  
5. integrar com **IMP-063** (tópicos), **IMP-061** (histórico) e **IMP-062** (referentes);  
6. preservar Gate, Classificador, Motor, NCS e Jobs;  
7. estimar impacto na **experiência** do utilizador;  
8. preparar a **REQ** «Objetivo Conversacional (Goal Tracking)» (CAP-07 — **sem CAP nova**).

---

## 2. Arquitectura actual (pós-IMP-061 / 062 / 063)

### 2.1 Cadeia de limiar (estado homologável)

```text
Utilizador → historico[]
                │
                ▼
         Continuidade Gate
                │
                ▼
         historicoRecente (4/200/800)     ← IMP-061
                │
                ▼
         gestorTopicos                   ← IMP-063 (fio temático)
                │
                ▼
         resolverReferencias             ← IMP-062 (referente do deixis)
                │
                ▼
         classificar (C1–C4)             ← único decisor de classe
                │
                ▼
         destinos + lastro (tópico / referente)
                │
         C2 → MRE (objetivoReal *por turno*)
         C3 → Motor → Gate → Job
```

### 2.2 Onde o «objectivo» aparece hoje

| Fonte | O que é | Persistência | É Goal Tracking? |
|-------|---------|--------------|------------------|
| Prompt de governação (`OBJETIVO ATUAL DA INTERAÇÃO`) | Texto **da mensagem actual** | 1 turno | **Não** — eco da mensagem |
| MRE Estágio 0 (`diagnostico.objetivoReal`) | Extracção LLM **por deliberação C2** | Parecer do turno | **Não** — não sobrevive ao próximo turno como estado de sessão |
| CN (`objetivoAtual` / `objetivoJaNoFio`) | Prosa: evita eco do objectivo do parecer | Turno | **Não** — higiene de prosa |
| Painel / `contextoSessao` («Objetivo atual») | `intencaoDoDia` do **dia executivo** | Dia / catálogo | **Parcial** — objectivo de **dia**, não do fio conversacional |
| COA / frente activa | Frente de projecto (ex. MG2) | Sessão COA | **Não** — frente ≠ objectivo conversacional |
| Classificador C2 (`deliberar_objetivo`) | **Classe** de intenção | Turno | **Não** — rota, não estado de goal |
| Job / título Motor | **Tarefa** executável | Fila | **Não** — efeito C3 |
| IMP-063 `topicoActivo` | **Fio temático** (outdoor, pagamento) | Sessão (≤1+2) | **Não** — tópico ≠ outcome |

**Conclusão:** o CEO **menciona** e **extrai** objectivos em vários sítios, mas **não acompanha** um objectivo conversacional activo multi-turno no limiar EIC.

### 2.3 Como objectivos explícitos são tratados

| Situação | Comportamento actual |
|----------|----------------------|
| «Quero priorizar o outdoor esta semana» | C2 (tipicamente); MRE pode preencher `objetivoReal`; **sem** gravar goal de sessão |
| «O objectivo é decidir o pagamento» | Léxico C2; tópico IMP-063 pode activar «pagamento»; **sem** etiqueta `objetivoActivo` |
| «Continua» / «e isso?» | 061→C2; 062→referente; 063→continuar tópico; objectivo **implícito** herdado só se o LLM/MRE o reinventar |
| «Implementa o painel» | C3 → Motor (tarefa); pode **confundir** tarefa com objectivo se não houver modelo |
| Mudança («agora o objectivo é X») | Reclassifica do zero; shift de **tópico** possível (063); **sem** evento `mudanca_objetivo` |

### 2.4 Distinção conceptual (necessária para a REQ)

| Conceito | Pergunta que responde | Dono actual / futuro |
|----------|----------------------|----------------------|
| **Classe** (C1–C4) | Que tipo de acto é este turno? | Classificador (ARQ-018) |
| **Tópico** | De que assunto falamos? | Gestor IMP-063 |
| **Referente** | A que âncora aponta o deixis? | Resolvedor IMP-062 |
| **Objectivo** | Que resultado o utilizador quer alcançar neste fio? | **Lacuna** (esta ANL) |
| **Tarefa / Job** | Que unidade executável despachar? | Motor / Fila (C3) |
| **Frente / COA** | Qual projecto/frente institucional? | COA / catálogo |
| **Intenção do dia** | Qual foco do dia executivo? | Catálogo dia |

**Regra de ouro proposta:**  
*Objectivo* = **outcome** desejado (multi-turno).  
*Tarefa* = **acção executável** (pode servir o objectivo; C3/Job).  
*Tópico* = **assunto** sob o qual o objectivo vive.

Exemplo MG2:  
- Objectivo: «Ter o outdoor priorizado e alinhado para a sprint»  
- Tópico activo: outdoor  
- Tarefa: «Implementa o painel lateral» (C3) — **serve** o objectivo; **não o substitui**

---

## 3. Limitações

| ID | Limitação | Impacto UX |
|----|-----------|------------|
| L1 | Sem estado `objetivoActivo` de sessão no limiar | CEO «esquece» o paraquê entre turnos (só redescobre via LLM/MRE) |
| L2 | Mensagem = «objectivo» no prompt | Confunde pedido pontual com outcome estável |
| L3 | `objetivoReal` MRE efémero | Cada C2 reinventa; inconsistência entre turnos |
| L4 | Objectivo ≠ tarefa não modelado | Risco de C3 «para cumprir o objectivo» sem clarificar outcome vs execução |
| L5 | Objectivo ≠ tópico (063) | Shift de assunto pode ocorrer sem mudança de objectivo (e vice-versa) |
| L6 | Mudança de objectivo invisível | Utilizador muda o «paraquê»; CEO continua no tópico antigo sem confirmar |
| L7 | `intencaoDoDia` ≠ goal conversacional | Painel pode mostrar objectivo de dia desalinhado do fio actual |
| L8 | Sem sinal para Consciência / lastro C2 | IQ de continuidade de propósito sem lastro estruturado |

---

## 4. Oportunidades

1. **MVP perceptível:** «Objectivo activo: priorizar outdoor. Seguimos?» — uma frase; reduz repetição (CON-001 Art. 9º.1).  
2. **Continuidade real:** follow-ups («continua», «e o próximo?») herdam objectivo + tópico + referente.  
3. **Anti-confusão tarefa:** antes de C3, lastro pode recordar o objectivo sem o gestor decidir classe.  
4. **Mudança explícita:** «Mudámos o objectivo para decidir pagamento» — confirmação curta; tópico pode shiftar em coordenação com 063.  
5. **Integração limpa:** 4.º módulo auxiliar na cadeia CSC (padrão 061→063→062→classificar).  
6. **EIC / ADR-015:** uso diário MG2 — o utilizador sente que o CEO «sabe para onde vamos».

---

## 5. Alternativas consideradas

| ID | Alternativa | Veredicto |
|----|-------------|-----------|
| **A** | Só melhorar prosa CN / Speaker com eco de `objetivoReal` | **Insuficiente** — sem estado multi-turno |
| **B** | Reutilizar `intencaoDoDia` como goal conversacional | **Rejeitada** — níveis distintos (dia vs fio); risco de poluir catálogo |
| **C** | Fundir objectivo dentro de IMP-063 (tópico = goal) | **Rejeitada** — colapsa outcome com assunto |
| **D** | Gestor de Objectivos DET auxiliar: `objetivoActivo` + eventos continuar/mudar/cumprir?/ambiguo | **Recomendada (núcleo V1)** |
| **E** | LLM classifica goal no limiar | **Rejeitada** no limiar (não-DET; custo; ARQ-018) |
| **F** | Objectivo só no MRE (persistir último `objetivoReal`) | **Parcial / fase 2** — útil como sinal, insuficiente no limiar pré-classe |
| **G** | Nova classe C5 «goal» | **Rejeitada** — polui enum C1–C4 |

**Escolha:** **D**; F como fonte opcional de sinal; A/C/E/G fora do MVP.

---

## 6. Estratégia recomendada

### 6.1 Princípio

Introduzir um módulo puro **Gestor de Objectivo Conversacional** (auxiliar), **coordenado** com o Gestor de Tópicos e o Resolvedor, **sem** decidir classe:

| Módulo | Decide |
|--------|--------|
| Classificador | **Classe** C1–C4 |
| Gestor de Tópicos (063) | **Fio temático** |
| Resolvedor (062) | **Referente** do deixis |
| Gestor de Objectivo (esta ANL) | **Outcome activo**: continuar / mudar / ambíguo / neutro (e opcionalmente «alcançado?» só com acto explícito) |

```text
Gate → historicoRecente (061)
         │
         ├─► gestorTopicos (063)
         ├─► gestorObjectivo (NOVO)   ← objectivoActivo / eventos
         ├─► resolverReferencias (062)  ← pode consumir tópico (+ objectivo como lastro fraco)
         └─► classificar                ← único decisor de classe
```

Ordem sugerida V1: **após** tópicos (063) e **antes ou junto** do resolvedor — o objectivo orienta foco sem usurpar referente.

### 6.2 Objectivos explícitos (DET V1)

| Sinal | Interpretação |
|-------|----------------|
| Marcadores («o objectivo é», «quero alcançar», «o foco desta conversa é», «para que consigamos») + âncora/frase curta | **estabelecer** / **mudar** objectivo |
| Deixis / «continua» com `objetivoActivo` presente | **continuar** objectivo (não reinventar) |
| «Já está» / «objectivo cumprido» / «fechámos isto» (explícito) | **encerrar** objectivo (só com marcador — sem auto-sucesso) |
| Sem sinais | **neutro** — preservar activo se existir |

### 6.3 Objectivo vs tarefa

| Critério V1 | Objectivo | Tarefa |
|-------------|-----------|--------|
| Verbos E2.1 / C3 na mensagem | Pode **coexistir**; não substitui o goal | Classificador decide C3 |
| Resultado desejado sem execução | Objectivo / C2 | — |
| Job publicado | Nunca pelo gestor de objectivo | Só Motor pós-Gate |
| Persistência | Sessão (`objetivoActivo`) | Fila |

**Invariante:** evento de objectivo **nunca** define `classe`, `permiteJob` nem cria Job.

### 6.4 Mudança de objectivo

| Caso | Evento | Efeito |
|------|--------|--------|
| Marcador explícito + novo outcome distinto | `mudanca_objetivo` | Anterior → `objectivoAnterior` (1 slot); novo → activo; confirmação curta opcional |
| Novo outcome implícito sem marcador + activo forte | Preferir **continuar** ou `ambiguo_objetivo` (anti falso-shift de goal) | Alinhado à política 063 |
| Mudança de **tópico** (063) sem marcador de objectivo | Objectivo **preservado** por omissão | Tópico ≠ goal |
| Gate pendente + mudança de objectivo | Clarificação combinada (padrão RF10 do 063) | Sem abandono auto do Gate |

### 6.5 Manter objectivo activo multi-turno

V1 — store de **sessão** (padrão `topicosSessao`):

```text
EstadoObjectivoSessao = {
  objetivoActivo: { id, enunciado, ancora?, topicoId?, origem, actualizadoEm } | null
  objetivoAnterior: mesmo | null   // 1 slot (não pilha profunda)
}
```

Regras:

* **≤1** objectivo activo.  
* Sem abandono automático (timeout).  
* `neutro` / deixis ⇒ **preservar** activo.  
* Encerrar só com acto explícito do utilizador (ou futura política REQ).

### 6.6 Integração IMP-061 / 062 / 063

| Integração | Regra |
|------------|--------|
| **061** | Sinais de objectivo usam a **mesma** janela 4/200/800; sem alargar |
| **063** | Objectivo pode **referenciar** `topicoActivo.id`; shift de tópico **não** apaga objectivo automaticamente; mudança de objectivo **pode** sugerir shift se a âncora mudar |
| **062** | Objectivo activo como lastro / desempate fraco (não substitui referente); ambiguidade de goal ≠ ambiguidade de referente |
| Prioridade de pergunta | Gate×conflito > ambiguo_objetivo > ambiguo_topico > ambiguo_referente (uma pergunta / turno) |

### 6.7 Preservação Gate / Classificador / Motor / NCS / Jobs

| Peça | Política |
|------|----------|
| **Gate** | Contrato intacto; enriquecimento de clarificação se conflito (como 063) |
| **Classificador** | Único decisor de classe; gestor **não** escreve `classe` / `permiteJob` |
| **Motor / Jobs** | Intocados; goal **nunca** publica Job |
| **NCS** | Intocado |
| **C3** | Nenhuma influência na pontuação; C3 da mensagem actual preservado (padrão 061/062/063) |

### 6.8 Impacto esperado na UX

| Antes | Depois (MVP) |
|-------|----------------|
| Cada turno «descobre» o paraquê de novo | Objectivo activo estável entre turnos |
| «Continua» só retoma tópico/referente | Retoma também o **outcome** |
| C3 parece o objectivo | Tarefa explícita sob objectivo declarado |
| Mudança silenciosa de propósito | Confirmação curta / pergunta se ambíguo |
| Painel «objectivo do dia» desalinhado do fio | Goal conversacional distinto (dia permanece) |

---

## 7. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Colapsar objectivo com tópico (063) | Fronteiras explícitas na REQ/ARQ; testes de independência |
| R2 | Colapsar objectivo com tarefa/C3 | Invariante anti-Job; CT anti-C3 |
| R3 | Falsa mudança de objectivo | Preferir continuar; marcadores explícitos no V1 |
| R4 | Quatro perguntas em cascata | Prioridade única (§6.6) |
| R5 | Duplicar `objetivoReal` MRE / `intencaoDoDia` | Goal = sessão conversacional; MRE/dia = sinais read-only opcionais |
| R6 | Usurpar Classificador | I-ONE; source do gestor sem `classe` |
| R7 | Persistência prematura (DB) | V1 = memória de processo / sessão |

---

## 8. Compatibilidade com a EIC

| Elemento | Compatibilidade |
|----------|-----------------|
| **CAP-07** | Sem CAP nova |
| **EIC CSC** | **4ª** frente perceptível após histórico, referentes e tópicos |
| **ARQ-018** | §4.4 para classe; goal auxiliar |
| **ARQ-019** | Gate antes; clarificação de conflito alinhada a 063 |
| **ARQ-022 / IMP-061** | Janela reutilizada |
| **ARQ-023 / IMP-062** | Orientação fraca; não revogado |
| **ARQ-024 / IMP-063** | Coordenação tópico↔objectivo; não fundir |
| **ADR-019 / MRE** | `objetivoReal` permanece do parecer; não é store de sessão |
| **G-EIC-D + ADR-006** | Obrigatórios antes de IMP |
| **Princípios** | Nunca perder contexto; tempo do utilizador; nunca executar sem objectivo claro (reforço conversacional) |

---

## 9. MVP recomendado (futura REQ)

### 9.1 Dentro

* Módulo puro `gestorObjectivo` (nome IMP a fixar).  
* Entrada: mensagem + `historicoRecente` (061) + estado sessão + `topicoActivo` (063, read-only) + sinais opcionais COA / último `objetivoReal` (read-only).  
* Saída: `{ evento: continuar\|mudanca_objetivo\|estabelecer\|ambiguo_objetivo\|neutro\|encerrar?, objetivoActivo?, objetivoAnterior?, perguntaCurta?, razaoObjectivo, commitEstado }`.  
* **≤1** objectivo activo; **≤1** anterior.  
* Marcadores explícitos DET para estabelecer/mudar/encerrar.  
* Integração: lastro C2 (e opcional C1); **não** pontuação C3; **não** Jobs.  
* Coordenação com 063: preservar objectivo em shift de tópico por omissão.  
* Uma pergunta / turno na cascata de ambiguidades.  
* Testes: regressão 057/061/062/063 + Continuidade + anti-C3 + CT de goal.  

### 9.2 Fora do MVP

* LLM/embeddings no limiar para goal.  
* Inferência agressiva de «objectivo cumprido» sem acto do utilizador.  
* Fundir com `intencaoDoDia` ou substituir MRE `objetivoReal`.  
* Pilha profunda de objectivos; DB multi-sessão.  
* Novas classes C1–C4; alterar limiar 0,55.  
* Alterar Gate / Motor / NCS / Jobs.  
* Auto-despacho C3 «para cumprir o objectivo».

### 9.3 Ordem ADR-006 sugerida

```text
ANL-009 (este) → aprovação CTO
  → REQ-064 Objetivo Conversacional (Goal Tracking)   ← elaborada (Em análise v0.1)
  → ARQ-025 (gestor auxiliar; integração 061/062/063)
  → G-EIC-D + IMP-064 → VAL
```

### 9.4 Critérios de aceite sugeridos (para a REQ)

1. Sem sinais de goal ⇒ comportamento actual (061+062+063) preservado.  
2. Marcador explícito ⇒ `objetivoActivo` auditável; classe ≠ C3 só por evento de goal.  
3. «Continua» com objectivo activo ⇒ evento `continuar`; objectivo **não** desaparece.  
4. Mudança explícita de objectivo ⇒ `mudanca_objetivo` + anterior guardado (1 slot).  
5. Ambiguidade de objectivo ⇒ pergunta curta; 0 Jobs; `motorAcionado` false.  
6. Shift de tópico (063) **sem** marcador de goal ⇒ objectivo activo preservado.  
7. C3 «Implementa X» ⇒ classe C3 do Classificador; gestor não cria Job.  
8. Suites IMP-057/061/062/063 + Continuidade verdes.

---

## 10. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Implementação / prompts / comportamento |
| X2 | Criar CAP nova |
| X3 | Emendar ARQ-018/019/024 nesta ANL |
| X4 | Fechar léxico exacto de marcadores (cabe à REQ/IMP) |
| X5 | Homologar IMP-063 (paralelo; esta ANL assume 063 como base) |

---

## 11. Conclusão

O CEO **extrai** objectivos pontuais (prompt, MRE, dia) e já gere **rota**, **referente** e **tópico**, mas **não acompanha** um objectivo conversacional activo ao longo do fio. A próxima frente EIC sob CAP-07 deve introduzir um **Gestor de Objectivo auxiliar** (estabelecer / continuar / mudar / ambíguo), distinto de tarefa e de tópico, reutilizando a janela IMP-061 e coordenando-se com IMP-062/063, **sem** tocar Classificador-como-decisor, Gate, Motor, NCS ou Jobs.

Esta ANL está **pronta para abertura da REQ** «Objetivo Conversacional (Goal Tracking)».

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Análise técnica inicial | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-064-objetivo-conversacional.md`](../requirements/REQ-064-objetivo-conversacional.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-025-objetivo-conversacional.md`](../architecture/ARQ-025-objetivo-conversacional.md) (Em análise v0.1 — 03/08/2026).  
**IMP:** [`IMP-064-objetivo-conversacional.md`](../implementation/IMP-064-objetivo-conversacional.md) (Implementada — pronta para homologação).  
**Próximo passo oficial:** Homologação IMP-064 (4ª capacidade perceptível EIC / CSC).

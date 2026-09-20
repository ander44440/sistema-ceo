# ARQ-094 — Arquitectura do Funil de Turno / Porta Canónica

> **Status:** Aprovado (CTO) — v0.1  
> **Versão:** 0.1 — 16/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-094.  
> **Capacidade:** CAP-01 — Governança.  
> Norma superior: CON-001 Art. 5º, 7º, 9º; ADR-006; ADR-010; ADR-015; **ADR-024** (direcção D1–D5); **REQ-094 v0.1** (fonte exclusiva desta ARQ — Aprovado CTO).  
> Normas consumidas (não emendadas): ADR-019 (MRE); ADR-021…023 / REQ-092 (LFC/RFR); REQ-093 / ARQ-093 (CG); REQ-065 / ARQ-026 (VCA); REQ-037/039 (COA/isolamento); REQ-045 (Jobs).  
> **Finalidade:** arquitectura lógica do **funil único de turno** e da **Porta Canónica** — precedência, fronteiras e observabilidade para a futura VAL UI (TC-01…TC-20 / LN-* do REQ-094).  
> **Gate ARQ:** fechado — Aprovado (CTO) 16/09/2026.  
> **Proibições deste acto:** não implementar; não criar IMP; não criar VAL; não alterar código; não emendar REQ-094; não inventar capacidades fora de ADR-024 / REQ-094.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do funil único de turno: Porta Canónica → Deliberar (MRE+CG) → Job → Clarificação rara; com um veredicto de caminho por turno e fronteira explícita canónico × deliberação LLM. |
| **Por que existe?** | ADR-024 / REQ-094: caminhos paralelos pré-resposta fragilizam o MVP; é preciso fechar precedência e fronteiras antes de IMP/VAL. |
| **Para quem existe?** | CTO (homologação); Engenheiro (IMP futura); Classificador / EE / VCA / CG / LFC / MRE (integradores); futura VAL UI (observabilidade). |
| **Como medir sucesso?** | CA-01…CA-09 e TC-01…TC-20 / LN-* do REQ-094; invariantes desta ARQ; um veredicto observável por turno. |

---

## 1. Funil único de turno

### 1.1 Diagrama lógico

```text
UI (mensagem + COA Abrir quando lastro de projecto)
        │
        ▼
┌───────────────────────┐
│  Classificador         │  sinais de intenção / destino candidato
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  VCA                   │  pertença de contexto / sessão (não é Porta Canónica)
└───────────┬───────────┘
            │
            ▼
╔═══════════════════════╗
║  PORTA CANÓNICA       ║  ← anterior a qualquer LLM
║  LFC | Protocolo | DIC║
╚───────────┬───────────╝
            │ se resolvido → RESPONDER (fim do turno)
            │ se não aplicável ↓
            ▼
┌───────────────────────┐
│  DELIBERAR             │  único caminho LLM de projecto: MRE → … → CG → LLM
└───────────┬───────────┘
            │ se deliberação resolvida → RESPONDER
            │ se handoff operacional ↓
            ▼
┌───────────────────────┐
│  OPERACIONAL / JOB     │  Gate quando política exigir; fila REQ-045
└───────────┬───────────┘
            │ se não bloqueado por ambiguidade essencial ↓
            ▼
┌───────────────────────┐
│  CLARIFICAÇÃO RARA     │  só ambiguidade bloqueante explícita
└───────────────────────┘
```

### 1.2 Ordem de precedência (normativa)

| Ordem | Ramo | Condição de activação | Efeito |
|-------|------|----------------------|--------|
| **1** | **Porta Canónica** | Pedido enquadra LFC tipado, protocolo executivo ou DIC/identidade (REQ-094 PC/LFC/PE/DIC) | Resposta determinística; **turno termina** neste ramo |
| **2** | **Deliberar** | Pedido de deliberação/análise de projecto **e** Porta Canónica **não** aplicável | Único caminho LLM: **MRE + CG** (ADR-024 D4; REQ-094 DEL-*) |
| **3** | **Job** | Política de Gate/fila exige handoff operacional após veredicto canónico ou deliberativo | Handoff Job; **não** substitui PC nem MRE |
| **4** | **Clarificação rara** | Ambiguidade **bloqueante** (dado essencial em falta) **e** ramos 1–3 não resolvem o turno | Uma pergunta de bloqueio; **proibido** como default |

**Regra de corte:** o primeiro ramo que **resolve** o turno emite o veredicto e **impede** os ramos seguintes no mesmo turno.

---

## 2. Porta Canónica

### 2.1 Definição

A **Porta Canónica** é a camada lógica que produz respostas **determinísticas** (sem LLM) para as famílias MVP:

| Família | Objecto | Saída típica |
|---------|---------|--------------|
| **LFC** | registar / listar / corrigir / consultar campo | valor / lista / confirmação / ausência |
| **Protocolo executivo** | papel, diferença especialista, demanda, CTO, autorização, fluxo | texto de protocolo |
| **DIC / identidade** | identidade institucional curta | texto DIC/protocolo |

### 2.2 Posição

| ID | Invariante |
|----|------------|
| **I-PC-1** | Opera **depois** do Classificador (e VCA, quando aplicável) e **antes** de clarificação, MRE, `llm_rapido` ou qualquer LLM. |
| **I-PC-2** | Se a Porta Canónica **casa** o pedido, **proibido** encaminhar o mesmo turno a Deliberar / LLM. |
| **I-PC-3** | Resposta canónica deve expor modo/família **auditável** (observabilidade §7). |

Não redefine o contrato LFC (ADR-021…023 / REQ-092) nem o DIC: **consome-os**.

---

## 3. Um único veredicto de caminho por turno

| ID | Invariante |
|----|------------|
| **I-V-1** | Cada turno MVP produz **exactamente um** veredicto ∈ {`canonico`, `deliberar`, `job`, `clarificacao`}. |
| **I-V-2** | Veredicto `canonico` implica subtipo ∈ {`lfc`, `protocolo`, `dic`} (extensível só por emenda REQ). |
| **I-V-3** | Proibido emitir dois caminhos deliberativos LLM no mesmo turno (REQ-094 LN-10 / X1). |
| **I-V-4** | Clarificação **não** pode coexistir como destino final com Porta Canónica resolvida no mesmo turno. |

O veredicto é o contrato observável para a futura VAL UI (CA-02).

---

## 4. Fronteira canónico × deliberação LLM

```text
                    ┌─────────────────────────────┐
   Pedido tipado    │  CANÓNICO (sem LLM)          │
   LFC/protocolo/DIC│  Porta Canónica              │
                    └─────────────────────────────┘
                    ┌─────────────────────────────┐
   Análise/projecto │  DELIBERAÇÃO LLM             │
   com lastro       │  MRE + Context Governor only │
                    └─────────────────────────────┘
```

| Lado | Permitido | Proibido |
|------|-----------|----------|
| **Canónico** | LFC, protocolo, DIC; ausência LFC sem inventar; «Não» a reautorização ritual | MRE/LLM; prosa de consultoria; «lastro insuficiente» em meta |
| **Deliberação** | Parecer via MRE; pacote autorizado pelo CG; insuficiência factual **correcta** | LFC tipado / protocolo / DIC neste caminho; `llm_rapido` paralelo; inventar factos |

Fronteira alinhada a REQ-094 PC-2, DEL-2, PE-2, LN-04…LN-08, LN-11.

---

## 5. Relação com Classificador, VCA, CG, LFC e MRE

### 5.1 Papéis (sem emendar contratos existentes)

| Componente | Papel no funil | Não faz |
|------------|----------------|---------|
| **Classificador** | Produz sinais / destino **candidato**; alimenta a decisão de ramo | Não é Porta Canónica; não autoriza contexto LLM; não escreve LFC |
| **VCA** | Valida pertença/autorização de **contexto de sessão** (COA) a montante | Não responde canónico; não é CG; não delibera |
| **Porta Canónica** | Resolve LFC / protocolo / DIC **sem LLM** | Não chama LLM; não substitui VCA nem CG |
| **LFC** (Reader/Writer) | Fonte/escrita canónica de factos do caso (REQ-092) | Writer não delibera; Reader não é funil |
| **MRE** | Único motor de **deliberação** de projecto no MVP | Não trata protocolo/LFC/DIC; não governa pacote LLM sozinho |
| **CG** | Gate de **autorização de contexto** imediatamente antes do LLM (REQ-093 / ARQ-093) | Não classifica; não é Porta Canónica; caminhos sem LLM **não** invocam CG |
| **Job / Gate** | Handoff operacional quando política exigir | Não substitui PC nem MRE+CG |

### 5.2 Sequência de integração (lógica)

1. Classificador → destino candidato.  
2. VCA → sessão/COA (quando o turno depende de contexto activo).  
3. Porta Canónica → se match, responde e **para**.  
4. Senão, Deliberar: montagem MRE → **CG** → LLM → Speaker (contrato existente).  
5. Job se Gate exigir.  
6. Clarificação **somente** se bloqueante e sem resolução nos passos 3–5.

### 5.3 Isolamento COA

| ID | Invariante |
|----|------------|
| **I-ISO-1** | LFC, listagens, consultas e lastro deliberativo pertencem ao `coaId` (+ `casoId` quando exigido) **activo** — zero contaminação silenciosa (REQ-094 ISO-*). |
| **I-ISO-2** | Menção textual a outro COA/caso **não** autoriza injectar o LFC desse contexto. |
| **I-ISO-3** | Alternância A↔B↔A preserva lastros distintos (HFC/LFC/transcript/resposta). |
| **I-ISO-4** | VCA e Porta Canónica / consumo LFC devem **concordar** no COA resolvido; divergência ⇒ falha observável (não escolha silenciosa). |

---

## 6. Escopo e não-escopo desta ARQ

### 6.1 Especifica (somente)

- Funil único e precedência §1.  
- Porta Canónica §2.  
- Veredicto único §3.  
- Fronteira canónico × LLM §4.  
- Relações Classificador / VCA / CG / LFC / MRE §5.  
- Isolamento COA §5.3.  
- Observabilidade para VAL §7.

### 6.2 Não especifica / não abre

- IMP, código, flags de rollback.  
- VAL UI (script TC-01…TC-20 — acto futuro; este ARQ só define **pontos** observáveis).  
- Novas capacidades além de ADR-024 / REQ-094.  
- Emenda a ARQ-093, REQ-092, classificador, MRE ou VCA.  
- Detalhe de detector LN de «bloqueante» além do contrato REQ-094 CL-*.

---

## 7. Pontos de observabilidade (futura VAL UI)

A futura VAL deve poder observar, **por turno**, no caminho UI real:

| ID | Ponto | Uso VAL / CA |
|----|-------|----------------|
| **OBS-1** | `veredictoCaminho` ∈ {canonico, deliberar, job, clarificacao} | CA-02; I-V-1 |
| **OBS-2** | Se canónico: `familiaCanonico` ∈ {lfc, protocolo, dic} + modo (quando existir) | TC-02…TC-18; CA-05/06 |
| **OBS-3** | Flag `llmInvocado` (boolean) | CA-05 (TC-02…TC-14 ⇒ false); CA-07 (TC-20 ⇒ true via MRE+CG) |
| **OBS-4** | Flag `cgAplicado` quando `llmInvocado` | DEL-1; paridade ARQ-093 |
| **OBS-5** | `coaId` / `casoId` resolvidos na resposta de lastro | ISO; TC-15…TC-19; LN-01/09 |
| **OBS-6** | Marcadores de falha LN-* (lastro falso em meta; reauth ritual; «120 funcionários»; clarificação indevida) | CA-04; LN-01…LN-12 |
| **OBS-7** | Destino de clarificação vs PC resolvida (não coexistir) | CL-2; LN-08 |
| **OBS-8** | Identidade do caminho deliberativo (MRE — não `llm_rapido` paralelo) | LN-10; DEL-1 |

Estes pontos são **requisitos de arquitectura de observação**; o formato exacto de telemetria/trilha fica para IMP/VAL futuros, sem violar REQ-088 / trilha existente.

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Direcção | ADR-024 |
| REQ fonte | REQ-094 v0.1 (Aprovado CTO) |
| Consumidos | ADR-019; ADR-021…023; REQ-092; REQ-093 / ARQ-093; VCA; REQ-037/039; REQ-045 |
| VAL futura | Bateria UI TC-01…TC-20 + LN-* (não aberta neste acto) |
| IMP | Não aberta neste acto |

---

## 9. Riscos

| Risco | Tratamento arquitectural |
|-------|--------------------------|
| Classificador a saltar a Porta Canónica | I-PC-1/2; OBS-1/2/3 |
| CG confundido com Porta Canónica | §5.1: CG só com LLM; PC sem LLM |
| Observabilidade insuficiente para VAL | §7 obrigatório antes de fechar IMP de funil |
| Alargamento de âmbito na ARQ | §6.2; só REQ-094 / ADR-024 |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 16/09/2026 | Engenheiro (Cursor) | Funil; Porta Canónica; precedência; relações; veredicto; fronteira; ISO; OBS-* | Despacho Usuário pós-aprovação REQ-094 | Em análise (CTO); IMP/VAL não abertos |
| 0.1 | 16/09/2026 | CTO | Aprovação do ARQ-094 v0.1 (conteúdo técnico inalterado) | Gate ARQ fechado para abertura de IMP | **Aprovado (CTO)** |

# ADR-024 — Consolidação do Funil de Turno / Caminhos Pré-Resposta

> **Status:** Aprovada (CTO) — v0.1  
> **Versão:** 0.1 — 16/09/2026  
> **Não homologa** implementação. **Não** abre REQ, ARQ, IMP nem VAL. **Não** altera código nem arquitectura existente.  
> **Âmbito:** decisão de direcção sobre o funil de turno e a consolidação dos caminhos pré-resposta do runtime conversacional.  
> **Fora deste acto:** especificação detalhada de requisitos, desenho ARQ, plano IMP por fases, bateria VAL das 20 turnos, alteração de classificador/MRE/`llm_rapido`/CG/VCA.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO — decisões D1–D5; Engenheiro (Cursor) redige o ADR a pedido do Usuário |
| Quando | 16/09/2026 |
| Por quê | Runtime com múltiplos caminhos paralelos até à resposta (clarificação, `llm_rapido`, MRE, patches tipados) fragiliza o MVP; é necessário fechar o funil único e o perímetro canónico antes de novas IMPs |
| Baseado em quê | Proposta de consolidação de caminhos (Engenheiro, 16/09/2026); evidência operacional de uso + auditoria (contaminação COA/LFC, protocolo a cair em MRE, clarificação indevida); ADR-015; ADR-006; ADR-019; ADR-021…023; REQ/ARQ-093 (CG) |
| Resultado | ADR-024 v0.1. Zero código. Zero REQ/ARQ/IMP/VAL neste acto |

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Decisão que institui o **funil único de turno** e a **consolidação dos caminhos pré-resposta**: Porta Canónica → Deliberar → Job → Clarificação rara; com MRE+CG como único caminho deliberativo da Fase 3 e congelamento do âmbito MVP até VAL das 20 turnos. |
| **Por que existe?** | Disponibilidade de caminhos ≠ autorização; facto/protocolo/identidade ≠ deliberação. Sem funil único, patches por sintoma competem entre si e o MVP não fecha. |
| **Para quem existe?** | CTO (norma de direcção); Usuário (prioridade MVP); Engenheiro (actos futuros REQ→ARQ→IMP→VAL subordinados a esta ADR). |
| **Como medir sucesso?** | Artefactos futuros (REQ/ARQ/IMP/VAL) alinhados a D1–D5; bateria UI de 20 turnos aprovada; um veredicto de caminho observável por turno. |

---

## 1. Contexto

O runtime conversacional actual admite **vários caminhos paralelos** até à resposta (classificador → clarificação | conhecimento | `llm_rapido` | MRE → VCA → CG → disciplina de lastro → patches de protocolo/LFC).

Efeitos observados em uso real e auditoria:

- contaminação / COA errado (factos de outro caso);
- consulta LFC a perder COA ou a cair em clarificação;
- perguntas de protocolo/papel a ir ao MRE («falha técnica / lastro insuficiente»);
- LLM a improvisar o ofício do Agente Executivo;
- testes unitários verdes sem garantir o caminho real da UI.

O que já existe e deve **manter-se** como património (sem reabertura neste ADR): LFC tipado, preservação de sessão em consulta LFC, protocolo Agente Executivo determinístico (parcela), amarração COA na UI, Context Governor pré-LLM.

A lacuna de direcção: **um funil único de turno** e um **contrato MVP** de comportamento — não um rewrite total do CEO.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | Múltiplos caminhos pré-resposta competem no mesmo turno |
| P2 | Facto / protocolo / identidade misturados com deliberação LLM |
| P3 | Clarificação usada como default perante lacuna de lexicon |
| P4 | Âmbito MVP a alargar-se antes de fechar o funil e a VAL de uso |
| P5 | Risco de big-bang rewrite vs consolidação controlada |

---

## 3. Decisão (aprovada pelo CTO) — D1–D5

### 3.1 D1 — Consolidação controlada (plano A)

**Aprovado:** consolidação controlada do runtime e MVP estreito **em alternativa preferente** a rewrite total do CEO.

Princípios:

- Disponibilidade ≠ autorização.
- Facto / protocolo / identidade ≠ deliberação.
- Um turno = um funil = um veredicto de caminho.

### 3.2 D2 — Funil único de turno

**Aprovado** o funil único, em ordem de precedência:

```text
UI (COA Abrir obrigatório para lastro de projecto)
  → Classificar intenção
    → 1. PORTA CANÓNICA          (sem LLM)
    → 2. DELIBERAR               (um só caminho LLM + CG)
    → 3. OPERACIONAL / JOB       (Gate quando exigido)
    → 4. CLARIFICAÇÃO RARA       (só ambiguidade bloqueante explícita)
```

Tudo o que hoje compete em paralelo (`llm_rapido` vs MRE vs clarificação-default vs patches tipados) **subordina-se** a este funil — não compete como caminho autónomo de mesmo nível.

### 3.3 D3 — Porta Canónica anterior a qualquer LLM

**Aprovado:** a **Porta Canónica** é camada **anterior** a clarificação, MRE, `llm_rapido` ou qualquer outro caminho LLM.

Respostas **determinísticas** (sem LLM) para:

| Família | Exemplos (ilustrativos; catálogo fechado em REQ/ARQ futuros) |
|---------|--------------------------------------------------------------|
| **LFC** | registar / listar / corrigir / consultar campo tipado |
| **Protocolo executivo** | demanda, CTO, autorização, papel, diferença especialista |
| **DIC / identidade** | identidade institucional curta |

**Norma:** LFC, protocolo executivo e DIC/identidade **não entram** em deliberação LLM.

Clarificação **não** é default para estes modos; **proibido** clarificar protocolo, LFC tipado, identidade DIC ou demanda já clara.

### 3.4 D4 — Caminho deliberativo único da Fase 3 (MRE + CG)

**Aprovado (opção A):** na Fase 3 de consolidação, a deliberação de projecto usa **um único caminho LLM**: **MRE + Context Governor (CG)**.

| Regra | Conteúdo |
|-------|----------|
| **Único caminho** | Deliberação de projecto = MRE + CG; acaba a competição `llm_rapido` vs MRE multi-estágio para o mesmo turno |
| **Exclusão** | Meta / protocolo / LFC / DIC **nunca** entram neste caminho |
| **Lastro** | Com lastro autorizado responde com lastro; sem lastro declara insuficiência correcta — **não** inventa; **não** confunde com falha de protocolo |
| **Apresentação** | «Falha técnica no raciocínio» **não** se apresenta como lacuna de caso |

Opção B (LLM único com MRE apenas como orquestração interna) fica **rejeitada** como plano da Fase 3.

### 3.5 D5 — Congelamento do âmbito MVP até VAL das 20 turnos

**Aprovado:** o âmbito MVP (secção 4) fica **congelado** até aprovação da **VAL** da bateria de **20 turnos** de uso (UI).

| Incluir no MVP (congelado) | Excluir do MVP imediato |
|----------------------------|-------------------------|
| Conversa com COA activo explícito (Abrir = lei) | Multi-caminho deliberativo concorrente |
| LFC: registar / listar / corrigir / consultar campo | Meta-conversa aberta «sobre tudo» via LLM sem DIC |
| Protocolo Agente Executivo determinístico | Autonomia exploratória ampla sem lastro |
| Deliberação de projecto com lastro via MRE+CG | Reescrita total de classificador/MRE/CSC no mesmo sprint |
| Job/fila com Gate quando política exigir | |
| Isolamento entre COAs (HFC/LFC/transcript) | |

Critério de sucesso MVP (direcção; detalhe em VAL futura): sequência real de 15–25 turnos (UI) sem contaminação COA, sem inventar campo LFC, sem «falha técnica/lastro» em protocolo/meta, sem reautorização ritual com demanda clara, sem prosa genérica de consultoria no lugar do protocolo.

---

## 4. Fases de consolidação (direcção — sem abrir IMP)

Ordem obrigatória (actos documentais e de implementação **futuros**, subordinados a ADR-006):

| Fase | Objectivo de direcção | Nota |
|------|----------------------|------|
| **0** | Contrato documental (REQ/ARQ/VAL) alinhado a D1–D5 | Este ADR **não** cria esses artefactos |
| **1** | Porta Canónica única (LFC + protocolo + DIC) | Aceite e rollback em IMP futura |
| **2** | Clarificação só se bloqueante | Zero clarificação indevida nos modos canónicos |
| **3** | Um caminho deliberativo = MRE + CG (D4) | |
| **4** | COA/sessão à prova de utilizador | |
| **5** | VAL de uso diário — 20 turnos UI | Gate de descongelamento do âmbito (D5) |

Implementação **em etapas com VAL**; big-bang sem funil **rejeitado**.

---

## 5. O que esta ADR não faz

- Não altera código, runtime, classificador, MRE, CG, VCA, LFC nem UI.
- Não cria nem emenda REQ, ARQ, IMP ou VAL.
- Não remove VCA, CG, LFC nem MRE.
- Não autoriza alargar o âmbito MVP antes da VAL das 20 turnos (D5).
- Não substitui ADR-019 (MRE), ADR-021…023 (LFC/RFR) nem REQ/ARQ-093 (CG); **orienta** a consolidação de caminhos em relação a esses patrimónios.

---

## 6. Alternativas rejeitadas

| Alternativa | Motivo |
|-------------|--------|
| Rewrite total do CEO como plano A | D1 — alto risco; património útil (LFC, CG, protocolo, COA) já existe |
| Manter caminhos deliberativos concorrentes (`llm_rapido` ∥ MRE) | Viola D2/D4 |
| Porta Canónica *depois* do LLM / como pós-filtro | Viola D3 |
| Enviar LFC / protocolo / DIC à deliberação LLM | Viola D3 |
| Opção B (LLM único; MRE só interno) na Fase 3 | Rejeitada em D4 |
| Alargar MVP antes da VAL das 20 turnos | Viola D5 |
| Continuar só patches por sintoma sem funil | Raiz do P1–P3 |

---

## 7. Consequências

- Norma de direcção vigente para o funil de turno e caminhos pré-resposta.
- Próximos actos oficiais (ordem ADR-006), **quando o Usuário/CTO os abrir**:
  - REQ — contrato MVP de comportamento (turnos canónicos + lista negativa);
  - ARQ — funil + Porta Canónica + relação com VCA/CG/LFC/MRE;
  - IMP — fases 1→5 com critérios VAL e rollback;
  - VAL — bateria UI das 20 turnos + isolamento COA/LFC.
- Engenheiro **não** inicia IMP de consolidação sem esses artefactos autorizarem cada fase.
- Zero alteração de arquitectura documentada existente neste acto.

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001; ADR-002; ADR-006; ADR-015 |
| Património deliberativo | ADR-019 (MRE); REQ-048…050 |
| Lastro / RFR | ADR-021; ADR-022; ADR-023; REQ/ARQ-092 |
| Context Governor | REQ-093; ARQ-093; IMP-093 (plano) |
| Capacidade | CAP-01 (governança de turno); CAP-05 (deliberação); CAP-03 (LFC); CAP-07 (DIC) |
| Explicitamente fora deste acto | REQ/ARQ/IMP/VAL de consolidação; código |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 16/09/2026 | Engenheiro (Cursor) | D1–D5; funil; Porta Canónica; MRE+CG; congelamento MVP | Despacho Usuário — formalizar decisões do CTO | Aprovada (CTO); REQ/ARQ/IMP/VAL não abertos |

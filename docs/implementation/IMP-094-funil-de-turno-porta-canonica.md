# IMP-094 — Implementação controlada do Funil de Turno / Porta Canónica

> **Status:** Aprovado (CTO) — v0.1  
> **Versão:** 0.1 — 16/09/2026  
> Norma: **ADR-024** (D1–D5); **REQ-094 v0.1** (Aprovado CTO); **ARQ-094 v0.1** (Aprovado CTO).  
> Capacidade: **CAP-01** — Governança.  
> **Natureza:** plano de implementação por **Fases 1→5** (ADR-024 §4); funil único; Porta Canónica; um veredicto por turno.  
> **Proibições deste acto (plano):** não criar VAL neste acto de plano; não emendar REQ-094 nem ARQ-094; não alargar âmbito MVP (REQ-094 X1–X5 / ADR-024 D5).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano IMP controlado do funil de turno e Porta Canónica, em cinco fases com rollback, critérios de entrada/saída e preservação de VCA/CG/LFC/MRE. |
| **Por que existe?** | ADR-024 / REQ-094 / ARQ-094 fecham o contrato; falta execução faseada sem big-bang. |
| **Para quem existe?** | CTO (aprovação do plano); Engenheiro (execução por fase); futura VAL UI (Fase 5). |
| **Como medir sucesso?** | Saída de cada fase (§3); CA-01…CA-09 e TC-01…TC-20 / LN-* do REQ-094 na Fase 5; MVP estável **só** após VAL UI aprovada. |

---

## 1. Objectivo e limites

### 1.1 Objectivo

Implementar o funil único (Porta Canónica → Deliberar → Job → Clarificação rara) conforme ARQ-094, de modo que cada turno MVP emita **um** veredicto observável, com LFC/protocolo/DIC fora do LLM, deliberação só via MRE+CG, e validação UI antes de declarar o MVP estável.

### 1.2 Preservar (inalterado em responsabilidade)

| Peça | Norma |
|------|--------|
| **VCA** | Continua pertença/sessão COA; **não** substituir pela Porta Canónica |
| **CG** | Continua gate pré-LLM (REQ/ARQ-093); caminhos sem LLM **não** invocam CG |
| **LFC** | Reader/Writer e contratos ADR-021…023 / REQ-092 **consumidos**, não reescritos como funil |
| **MRE** | Único motor deliberativo de projecto (ADR-024 D4); **não** remover nem substituir por chat LLM |

### 1.3 Fora do escopo MVP / deste IMP

| Proibido | Motivo |
|----------|--------|
| Big-bang (Fases 1–5 num único corte) | ADR-024 |
| Multi-caminho deliberativo concorrente | REQ-094 X1 / LN-10 |
| Meta aberta via LLM sem DIC/protocolo | X2 |
| Autonomia exploratória sem lastro | X3 |
| Reescrita total classificador/MRE/CSC | X4 |
| Alargar âmbito antes da VAL UI | X5 / D5 |
| Criar VAL neste acto | Despacho actual |
| Remover VCA, CG, LFC ou MRE «para simplificar» | ADR-024 §5 |

### 1.4 Ordem obrigatória

```text
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 (VAL UI)
```

Nenhuma fase inicia sem **entrada** cumprida; nenhuma fase declara-se fechada sem **saída** cumprida.  
**MVP estável** = somente após **saída da Fase 5** (VAL UI aprovada).

---

## 2. Dependências globais

| Dependência | Estado exigido para iniciar Fase 1 |
|-------------|-------------------------------------|
| ADR-024 | Aprovada (CTO) |
| REQ-094 | Aprovado (CTO) |
| ARQ-094 | Aprovado (CTO) |
| VCA / CG / LFC / MRE existentes | Património a preservar (baseline) |
| VAL UI (artefacto) | **Não** criada neste acto; obrigatória na **Fase 5** |

Dependências entre fases: cada fase N+1 depende da saída da fase N (§3).

---

## 3. Fases 1→5

### Fase 1 — Porta Canónica única (LFC + protocolo + DIC)

| Campo | Conteúdo |
|-------|----------|
| **Ordem** | 1 |
| **Escopo** | Introduzir/consolidar a Porta Canónica **antes** de clarificação/MRE/LLM; LFC tipado, protocolo executivo e DIC/identidade resolvem no ramo canónico (ARQ-094 §2; REQ-094 PC/LFC/PE/DIC); emitir veredicto `canonico` + família (OBS-1/2/3) |
| **Dependências** | Globais §2; baseline LFC/protocolo existentes **reutilizados**, não duplicados |
| **Não incluir** | Unificar deliberação LLM; endurecer COA além do necessário à PC; script VAL completo |
| **Entrada** | ARQ-094 aprovada; flag de rollback definida (§4) |
| **Saída** | TC-02…TC-18 relevantes a PC (protocolo + LFC tipado) em regressão mínima **e** amostra UI: zero LLM nesses modos; zero LN-04/05/07/08 nesses casos; OBS-1/2/3 presentes no caminho canónico |
| **Rollback** | `CEO_FUNIL_PORTA_CANONICA=off` (ou equivalente documentado) — desactiva precedência obrigatória da PC e restaura comportamento pré-Fase 1 **sem** apagar LFC/protocolo |

### Fase 2 — Clarificação disciplinada

| Campo | Conteúdo |
|-------|----------|
| **Ordem** | 2 |
| **Escopo** | Clarificação **somente** se ambiguidade bloqueante; proibido clarificar protocolo, LFC tipado, DIC, demanda clara, reautorização ritual (REQ-094 CL-*; ARQ-094 ramo 4) |
| **Dependências** | Saída Fase 1 |
| **Não incluir** | Mudança do caminho deliberativo MRE vs `llm_rapido`; VAL completa |
| **Entrada** | Fase 1 fechada; rollback Fase 1 testado uma vez |
| **Saída** | Zero clarificação indevida nos modos canónicos (LN-08); TC-02…TC-14 sem destino `clarificacao`; OBS-7 verificável |
| **Rollback** | Reverter política de clarificação da Fase 2; manter Porta Canónica da Fase 1 **ou** desligar ambas via flags (§4) se regressão grave |

### Fase 3 — Um caminho deliberativo (MRE + CG)

| Campo | Conteúdo |
|-------|----------|
| **Ordem** | 3 |
| **Escopo** | Deliberação de projecto = **somente** MRE + CG; meta/protocolo/LFC/DIC **nunca** neste caminho; acabar competição `llm_rapido` ∥ MRE no mesmo turno de projecto (ADR-024 D4; REQ-094 DEL-*; ARQ-094 §4–5) |
| **Dependências** | Saída Fase 2; CG existente (IMP-093) operacional no transporte LLM |
| **Não incluir** | Remover MRE; Opção B (LLM único com MRE só interno) — rejeitada; alargar meta LLM |
| **Entrada** | Fase 2 fechada; CG enforce/sombra conhecida e preservável |
| **Saída** | TC-20: `llmInvocado` + `cgAplicado` via MRE; zero LN-10/11; insuficiência factual correcta quando sem lastro; OBS-4/8 |
| **Rollback** | Restaurar política pré-Fase 3 de encaminhamento deliberativo (documentar caminho anterior); **não** desligar CG global sem flag CG própria; PC/clarificação das Fases 1–2 permanecem |

### Fase 4 — COA / sessão à prova de utilizador

| Campo | Conteúdo |
|-------|----------|
| **Ordem** | 4 |
| **Escopo** | Abrir projecto = fonte de verdade para lastro; UI/sessão reflectem `coaId`; recusa/esclarecimento se lastro de caso sem COA; isolamento A↔B↔A (REQ-094 ISO-*; ARQ-094 I-ISO-*; TC-01, TC-19) |
| **Dependências** | Saída Fase 3; VCA preservada |
| **Não incluir** | Novas capacidades de produto; VAL formal completa (só pré-cheque isolamento) |
| **Entrada** | Fase 3 fechada |
| **Saída** | TC-01 + TC-15…TC-19: zero LN-01/02/03/09; alternância A↔B↔A sem contaminação; I-ISO-4 (VCA ↔ PC/LFC concordam) |
| **Rollback** | Reverter endurecimentos de sessão/COA da Fase 4; manter funil Fases 1–3 se estáveis |

### Fase 5 — Validação UI / uso diário (gate MVP)

| Campo | Conteúdo |
|-------|----------|
| **Ordem** | 5 |
| **Escopo** | Executar bateria UI dos **20 turnos canónicos** (REQ-094 TC-01…TC-20) + checklist LN-*; repetir **≥3×**; usar OBS-1…OBS-8 (ARQ-094 §7) |
| **Dependências** | Saída Fase 4; **artefacto VAL** criado em acto **separado** (não neste IMP-acto de plano) |
| **Não incluir** | Novas features; descongelar âmbito MVP antes da aprovação VAL |
| **Entrada** | Fase 4 fechada; VAL UI oficial aberta e aprovada para execução pelo CTO/Usuário |
| **Saída** | VAL UI **aprovada**: 20/20 PASS; zero LN-*; CA-03 + CA-08; **só então** declarar MVP estável e descongelar âmbito (ADR-024 D5 / REQ-094 CA-09) |
| **Rollback** | Se VAL falhar: **não** declarar MVP estável; corrigir na fase responsável (1–4) com rollback da fase afectada; reexecutar VAL |

---

## 4. Rollback explícito (resumo)

| Flag / mecanismo (nome lógico) | Efeito |
|--------------------------------|--------|
| `CEO_FUNIL_PORTA_CANONICA=off` | Desliga precedência obrigatória da Porta Canónica (Fase 1) |
| `CEO_FUNIL_CLARIFICACAO_ESTRITA=off` | Desliga disciplina de clarificação da Fase 2 |
| `CEO_FUNIL_DELIBERAR_UNICO=off` | Restaura encaminhamento deliberativo pré-Fase 3 (sem remover MRE/CG) |
| `CEO_FUNIL_COA_RIGIDO=off` | Desliga endurecimentos de sessão/COA da Fase 4 |
| Rollback CG | Usar mecanismo já definido em IMP-093 (`CEO_CG_MODO=sombra` / equivalente) — **não** reinventar |

**Regras:**

- Rollback de fase N **não** apaga dados LFC/HFC/Jobs.  
- Preferir rollback da fase em falha antes de desligar fases anteriores estáveis.  
- Big-bang sem flags = **fora** deste IMP.

---

## 5. Observabilidade mínima por fase

| Fase | OBS mínimos (ARQ-094 §7) |
|------|---------------------------|
| 1 | OBS-1, OBS-2, OBS-3 |
| 2 | + OBS-7 |
| 3 | + OBS-4, OBS-8 |
| 4 | + OBS-5, OBS-6 (LN isolamento) |
| 5 | OBS-1…OBS-8 completos na VAL UI |

Sem OBS exigidos na saída da fase, a fase **não** fecha.

---

## 6. Critério de MVP estável

| Condição | Obrigatória |
|----------|-------------|
| Fases 1–4 com saída cumprida | Sim |
| VAL UI (Fase 5) aprovada: TC-01…TC-20 + LN-* + 3× repetição | Sim |
| Unitários verdes **sem** VAL UI | **Insuficiente** (LN-12) |
| Declaração informal «parece ok» | **Inválida** |

---

## 7. Ordem de trabalho do Engenheiro (quando autorizado a codificar)

1. Confirmar flags de rollback §4 no ambiente.  
2. Executar **somente** a fase autorizada (entrada cumprida).  
3. Evidenciar saída da fase (testes + amostra UI / OBS).  
4. Parar e reportar — **não** avançar automaticamente à fase seguinte sem autorização.  
5. Fase 5: aguardar VAL oficial; não criar VAL neste acto de plano.

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Direcção | ADR-024 |
| REQ | REQ-094 v0.1 |
| ARQ | ARQ-094 v0.1 |
| Preservados | VCA; CG (REQ/ARQ/IMP-093); LFC (REQ-092 / ADR-021…023); MRE (ADR-019) |
| VAL | Futura (Fase 5) — **não** criada neste acto |
| Código | **Não** iniciado neste acto |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 16/09/2026 | Engenheiro (Cursor) | Plano Fases 1→5; entrada/saída; rollback; preservação VCA/CG/LFC/MRE; gate MVP=VAL UI | Despacho Usuário pós-aprovação ARQ-094 | Em análise (CTO); código/VAL não iniciados |
| 0.1 | 16/09/2026 | CTO | Aprovação do IMP-094 v0.1 (plano inalterado) | Autoriza execução faseada; Fase 1 em diante sob despacho | **Aprovado (CTO)** |
| 0.1.1 | 16/09/2026 | Engenheiro (Cursor) | Execução **Fase 1** (Porta Canónica + OBS-1/2/3 + rollback); Fase 2 **não** iniciada | Despacho Usuário — só Fase 1 | Ver relatório de saída Fase 1 |
| 0.1.2 | 18/09/2026 | Engenheiro (Cursor) | Execução **Fase 2** (clarificação disciplinada CL-1/2/3 + OBS-7 + rollback); Fase 3 **não** iniciada | Despacho Usuário — só Fase 2 | Ver relatório de saída Fase 2 |
| 0.1.3 | 18/09/2026 | Engenheiro (Cursor) | Execução **Fase 3** (caminho deliberativo único MRE+CG; `CEO_FUNIL_DELIBERAR_UNICO`; OBS-4/8; TC-20); Fase 4 **não** iniciada | Despacho Usuário — só Fase 3 | Ver relatório de saída Fase 3 |
| 0.1.4 | 18/09/2026 | Engenheiro (Cursor) | Execução **Fase 4** (COA rígido; `resolverCoaTurno`; OBS-5/6; A→B→A; `CEO_FUNIL_COA_RIGIDO`); Fase 5 **não** iniciada | Despacho Usuário — só Fase 4 | Ver relatório de saída Fase 4 |

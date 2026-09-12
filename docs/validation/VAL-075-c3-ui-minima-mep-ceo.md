# VAL-075 — Validação da IMP-074 (C3 + UI mínima da MEP-CEO)

> **Status:** **HOMOLOGADA** — 16/08/2026 (CTO + Usuário). **25/25 PASS · 0 FAIL.**  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-075 (VAL da IMP-074).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 v1.1 · REQ-085 v1.1 · ARQ-033 v1.1 (homologados); IMP-074 IMPLEMENTADA.  
> **Código:** **não alterado** neste acto de homologação. Sem correcção. Sem nova IMP. Sem nova VAL. Sem ADR. Sem commit.  
> **Limitações L1 e L2:** permanecem **limitações de validação**; **não** são falhas e **não** foram convertidas em FAIL.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que o canal C3 e o bloco só-leitura no Centro de Situação da IMP-074 cumprem o contrato aprovado, sem regressão de C1/C2/IMP-073. |
| **Por que existe?** | Despacho 16/08/2026: VAL da IMP-074 após aprovação do CTO para validação. |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Itens 1–25 do despacho em PASS/FAIL; 0 FAIL; limitações explícitas, não tratadas como defeito. |

---

## 1. Escopo validado

Itens 1–12 (C3), 13–21 (UI), 22–25 (regressão e evidência de UI).

**Fora desta VAL:** correcção de código; nova IMP; ADR; API; formulário; Conversa; F1/F2/F3; Motor/MRE/EIC/CAP-04/05; commit.

---

## 2. Evidências executadas (16/08/2026)

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd app && npm run test:mep-ceo` | **20/20 pass**, 0 fail |
| **E2** | `cd app && npm run test:mep-ceo-persistencia` | **15/15 pass**, 0 fail |
| **E3** | `cd app && npm run test:mep-ceo-c3` | **8/8 pass**, 0 fail |
| **E4** | Inspecção `app/src/mepCeo/c3.js` | Acto fechado; só `criarObjecto`/`listarObjectos`; sem `promoverMaturidade`; `origemCanal` escrito por C3 |
| **E5** | Inspecção UI: `blocoMepC3.js` + `centroSituacao.js` | Bloco após `cs-cmd-top`, antes de `cs-cmd-mid`; sem `<form>` C3; sem import Conversa |
| **E6** | Inspecção HTML do bloco (Node, sem browser): vazio + um acto C3 | Vazio sem IDs fictícios; preenchido mostra MCP-001 + CONCEBIDO; sem `origemCanal`/transcript no HTML |
| **E7** | `index.js` C1+C2 | Não exporta C3 (teste IMP-072 «Não exporta C3» PASS em E1) |

Não houve sessão browser do Centro completo (posto de comando + navegador). E6 cobre o HTML do bloco C3.

---

## 3. Matriz dos critérios

Legenda: **PASS** · **FAIL** · **LIMITAÇÃO** (não é FAIL).

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| 1 | Acto `proporEvolucaoDesidentificada` | **PASS** | E4; E3 testes 1–5 |
| 2 | Quatro campos obrigatórios | **PASS** | E4 linhas 111–115; E3 teste campo em falta |
| 3 | `objectoCandidato` ∈ MCP/EPC/MDL | **PASS** | E4 `OBJECTOS_CANDIDATOS_C3`; E3 teste BSL recusado |
| 4 | Rejeição de chaves extras | **PASS** | E4 `camposExtra`; E3 teste id/maturidade/origem |
| 5 | `origemCanal: "C3"` interno | **PASS** | E4 payload C3; E3 teste criação |
| 6 | ID/MEV/maturidade não vêm do proponente | **PASS** | E4 recusa extras; C2 emite ID/MEV; C3 não passa `maturidade` a `criarObjecto` |
| 7 | Criação só via C2 | **PASS** | E4 único write = `criarObjecto` |
| 8 | Estado inicial `CONCEBIDO` | **PASS** | E3 teste 1; E4 não envia maturidade |
| 9 | Fail-closed nos casos proibidos | **PASS** | E3 testes 2–5; recusa sem novo objecto |
| 10 | Privado não chega à criação | **PASS** | E4 matriz + `avaliarIsolamento` **antes** de `criarObjecto`; E3 conteúdo COA/transcript recusado |
| 11 | Nenhuma promoção via C3 | **PASS** | E4 sem import de `promoverMaturidade`/`proporMaturidade` |
| 12 | Persistência via IMP-073 | **PASS** | E3 teste store activo; C3 não chama adapter |
| 13 | Bloco no Centro de Situação | **PASS** | E5 `htmlBlocoMepC3()` em `montarCentroSituacao` |
| 14 | Posição após `cs-cmd-top` | **PASS** | E5 linhas: fecha `cs-cmd-top` → bloco → `cs-cmd-mid` |
| 15 | Somente leitura | **PASS** | E5 sem escrita MEP na UI |
| 16 | Sem formulário C3 | **PASS** | E5/E6 sem `<form>` no bloco; compositor `#cs-form` é comando rápido pré-existente, **não** acto C3 |
| 17 | Sem Conversa | **PASS** | E5 `blocoMepC3.js` não importa conversa |
| 18 | Só ID, tipoLacuna, enunciado, CONCEBIDO | **PASS** | E4 `listarPropostasC3`; E5 markup; E3 teste chaves da vista |
| 19 | Filtro CONCEBIDO + origem C3 | **PASS** | E4 filter; E3 teste 6–7 |
| 20 | Estado vazio sem fictício | **PASS** | E6 `VAZIO_HAS_FICTICIO false`; mensagem canónica |
| 21 | Privado ausente na UI | **PASS** | E3 vista sem payload/transcript; E6 |
| 22 | Suítes C1/C2 | **PASS** | E1 20/20 |
| 23 | Suíte C3 | **PASS** | E3 8/8 |
| 24 | 0 FAIL nas suítes | **PASS** | E1+E2+E3 = 43/43 |
| 25 | Evidência UI aplicável | **PASS** | E5 inspecção de posição; E6 HTML do bloco (sem browser headed) |

**FAIL: 0.**

---

## 4. Limitações (não corrigidas; não são FAIL)

| # | Limitação |
|---|-----------|
| L1 | Detector C3 de conteúdo proibido é **lista fechada de padrões** (não NLP). Identidade de cliente sem marcadores (`COA-`, `transcript`, chaves C1) pode não ser recusada — análogo à L5 da VAL-074 / C1 estrutural. |
| L2 | Não houve inspeção visual headed do dashboard no browser; evidência UI = código + HTML do bloco em Node. |

---

## 5. Veredicto

**APROVADA** (execução 16/08/2026). **HOMOLOGADA** (CTO + Usuário, 16/08/2026).

A IMP-074 cumpre o contrato C3 + UI só-leitura no recorte validado. **25/25 PASS. Zero FAIL.** L1 e L2 permanecem limitações, não defeitos. A primeira superfície UI da CAP-13 (bloco somente-leitura C3 no Centro de Situação) está **validada e homologada**. Este acto **não** reabre a homologação da CAP-13 de 14/08/2026 (contrato mínimo C1+C2).

---

## 6. Homologação formal

CTO + Usuário **homologam** a VAL-075.

Cadeia vigente deste recorte:

```
CAP-13
  → VIS-009 v1.1
  → REQ-085 v1.1
  → ARQ-033 v1.1
  → IMP-074
  → VAL-075  ← HOMOLOGADA
```

| Facto | Estado |
|-------|--------|
| Critérios 1–25 | **PASS** |
| FAIL | **0** |
| L1, L2 | Limitações de validação **preservadas** (não FAIL) |
| UI C3 no Centro de Situação | **Validada** (só-leitura) |

---

## 7. Recomendação ao CTO

1. VAL-075 está **homologada** como fecho da IMP-074 neste recorte.  
2. **Não** corrigir L1–L2 sem despacho.  
3. O próximo acto é definido pelo CTO.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-13** |
| Visão | **VIS-009 v1.1** homologada |
| Requisitos | **REQ-085 v1.1** homologado |
| Arquitectura | **ARQ-033 v1.1** homologada |
| IMP | [`IMP-074`](../implementation/IMP-074-c3-ui-minima-mep-ceo.md) |
| VAL | este documento — **HOMOLOGADA** |
| Suites | `mepCeo.test.js` · `mepCeo.persistencia.test.js` · `c3.test.js` |
| Código | `c3.js`, `blocoMepC3.js` — **não modificado** neste acto |

---

## Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | Execução: Engenheiro (Cursor). Homologação: **CTO + Usuário** |
| Quando | 16/08/2026 |
| Por quê | Fecho formal da VAL da IMP-074 (C3 + UI mínima) |
| Baseado em quê | VAL-075 25/25 PASS, 0 FAIL; L1/L2 explícitas; VIS-009/REQ-085/ARQ-033 v1.1 |
| Resultado | VAL-075 **HOMOLOGADA**; primeira superfície UI CAP-13 (bloco C3 só-leitura no Centro) **validada** |

# VAL-076 — Validação da correcção de fronteira browser/Node da IMP-074

> **Status:** **HOMOLOGADA** — 16/08/2026 (CTO + Usuário). **11/11 PASS · 0 FAIL.**  
> **Tipo:** VAL (ADR-006 / ADR-014). **Identificação:** VAL-076 (VAL da correcção de entrega da IMP-074).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 v1.1 · REQ-085 v1.1 · ARQ-033 v1.1 (homologados); IMP-074 + correcção de fronteira UI/Node (local).  
> **Antecedente:** VAL-075 HOMOLOGADA (contrato C3+UI). Esta VAL **não** reabre VAL-075; valida **apenas** a separação Node/browser.  
> **Código:** **não alterado** neste acto. Sem nova IMP. Sem ADR. Sem alteração a ARQ-033. Sem commit / push / PR / deploy.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a correcção de entrega da IMP-074 removeu `adapterFs` / Node do grafo do SPA, mantendo o contrato C3 e C1/C2/IMP-073. |
| **Por que existe?** | Despacho CTO 16/08/2026: iniciar VAL da correcção após aprovação da implementação. |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Critérios 1–11 do despacho em PASS/FAIL; 0 FAIL; limitações explícitas. |

---

## 1. Escopo validado

Separação de fronteira:

```
Plugin Vite (Node) → listarPropostasC3() → virtual:mep-c3-propostas (array)
  → Centro: htmlBlocoMepC3(vista)  (browser: markup só)
```

**Fora desta VAL:** revalidação completa da VAL-075; nova IMP; ADR; API pública; formulário; deploy; commit; alteração de ARQ-033.

---

## 2. Evidências executadas (16/08/2026)

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd app && npm run test:mep-ceo` | **20/20 pass**, 0 fail |
| **E2** | `cd app && npm run test:mep-ceo-persistencia` | **15/15 pass**, 0 fail |
| **E3** | `cd app && npm run test:mep-ceo-c3` | **9/9 pass**, 0 fail (inclui teste de fronteira UI sem import mepCeo/adapter) |
| **E4** | `npm run build --prefix app` (`vite build`) | **OK** — 140 módulos; `dist/assets/index-Cn1wVU-r.js` (332.06 kB) |
| **E5** | Inspecção `app/server/mepC3VistaPlugin.js` + `vite.config.js` | Plugin `ceo-mep-c3-vista`; `load` chama `listarPropostasC3()` em Node; serializa `export default ${JSON.stringify(...)}`; **sem** API HTTP; **sem** boot do store canónico |
| **E6** | Inspecção `blocoMepC3.js` + `centroSituacao.js` | Bloco: só `htmlBlocoMepC3(propostas)` (markup). Centro: `import propostasMepC3 from "virtual:mep-c3-propostas"` + `htmlBlocoMepC3(propostasMepC3)`; **zero** imports `mepCeo` / `adapterFs` / `registo` / `persistencia` / `node:*` |
| **E7** | Scan UTF-8 do bundle `index-Cn1wVU-r.js` | Contagens **0**: `adapterFs`, `node:fs`, `node:path`, `node:crypto`, `node:url`, `__vite-browser-external`, `mepCeo/c3`, `listarPropostasC3`, `criarObjecto`, `appendRegistoFisico` |
| **E8** | Minificado do Centro no bundle | `${_m(Sm)}` entre deliberação e `cs-chat`; `Sm=[]` (vista serializada = array vazio no build); `function _m(e){...cs-mep-c3...}` = markup |
| **E9** | Evidência HTML Node (vazio + preenchido + filtro pós-promo) | `VAZIO_OK true`; `VAZIO_SEM_FICTICIO true`; `PREENCHIDO true`; `SEM_PRIVADO true`; `FILTRO_APOS_PROMO true`; `VISTA_KEYS enunciadoDesidentificado,id,maturidade,tipoLacunaProduto` |
| **E10** | Diff C1/C2/IMP-073 / ARQ-033 vs HEAD | `isolamento.js`, `registo.js`, `persistencia.js`, `adapterFs.js`, `c3.js`, `ARQ-033` **sem alteração** neste working tree |
| **E11** | Inspecção `listarPropostasC3` em `c3.js` | Filtro `maturidade === "CONCEBIDO"` ∧ `payload.origemCanal === "C3"`; chaves de vista fechadas |

**Evidência visual headed:** não executada (SPA client-rendered; sem sessão browser). E8+E9 cobrem markup no bundle + HTML do bloco em Node. A ocorrência de `transcript` no bundle é **STT/voz** (`SpeechRecognition`), **não** MEP/C3.

---

## 3. Matriz dos critérios

Legenda: **PASS** · **FAIL** · **LIMITAÇÃO** (não é FAIL).

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| 1 | `mepC3VistaPlugin` executa a consulta no Node | **PASS** | E5: `load` → `listarPropostasC3()` no processo Vite |
| 2 | `virtual:mep-c3-propostas` entrega só o array da vista | **PASS** | E5 serialização; E8 `Sm=[]` |
| 3 | `blocoMepC3.js` só apresentação/markup | **PASS** | E6; E3 teste fronteira; E8 `_m(e)` |
| 4 | `centroSituacao.js` sem import directo C3/registo/persistência | **PASS** | E6; grep módulos Centro sem `mepCeo`/`adapterFs` |
| 5 | Bundle sem adapterFs / node:fs|path|crypto|url / `__vite-browser-external` da cadeia | **PASS** | E4+E7 |
| 6 | Vista filtra CONCEBIDO + `origemCanal === "C3"` | **PASS** | E11; E3; E9 `FILTRO_APOS_PROMO` |
| 7 | UI só ID, tipoLacunaProduto, enunciadoDesidentificado, CONCEBIDO | **PASS** | E6 markup; E9 `VISTA_KEYS`; E3 |
| 8 | Estado vazio correcto | **PASS** | E8/E9 mensagem canónica; sem IDs fictícios |
| 9 | Conteúdo privado ausente na vista/UI | **PASS** | E9 `SEM_PRIVADO`; E3; E7 sem `origemCanal` no bundle |
| 10 | Contrato C3 idêntico ao homologado | **PASS** | E10 `c3.js` intacto; E3 testes 2–9 (acto, fail-closed, origemCanal, persistência via C2) |
| 11 | C1/C2/IMP-073 íntegros | **PASS** | E1 20/20; E2 15/15; E10 ficheiros núcleo sem diff |

**FAIL: 0.**

---

## 4. Limitações (não corrigidas; não são FAIL)

| # | Limitação |
|---|-----------|
| L1 | Sem inspeção visual headed do dashboard no browser; evidência UI = bundle minificado + HTML do bloco em Node (análoga à L2 da VAL-075). |
| L2 | No `vite build`, a vista serializada reflecte o estado C2 **no momento do build** (sem boot do store canónico no plugin). Em produção Vercel o array pode ser `[]` até haver boot/invocador Node com store — coerente com o desenho actual do plugin; não invalida a separação de fronteira. |

---

## 5. Veredicto

**APROVADA** (execução 16/08/2026). **HOMOLOGADA** (CTO + Usuário, 16/08/2026).

A correcção de fronteira UI/Node da IMP-074 cumpre o despacho: o browser recebe só o array da vista; Node permanece o dono da consulta C3; o bundle de produção **não** inclui a cadeia `adapterFs` / `node:*`. **11/11 PASS. Zero FAIL.** C1/C2/IMP-073 e o contrato C3 homologado (VAL-075) **não** foram alterados. L1–L2 são limitações de evidência/operação, não defeitos da fronteira.

---

## 6. Homologação formal

CTO + Usuário **homologam** a VAL-076.

| Facto | Estado |
|-------|--------|
| Critérios 1–11 | **PASS** |
| FAIL | **0** |
| L1, L2 | Limitações de validação **preservadas** (não FAIL) |
| Separação Node/browser | **Validada** |

---

## 7. Recomendação ao CTO

1. VAL-076 está **homologada** como fecho da correcção de entrega da IMP-074.  
2. Publicar a correcção e sincronizar ambientes oficiais (Vercel / Railway).  
3. **Não** converter L1–L2 em FAIL sem despacho.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-13** |
| Arquitectura | **ARQ-033 v1.1** (inalterada) |
| IMP | [`IMP-074`](../implementation/IMP-074-c3-ui-minima-mep-ceo.md) + correcção de entrega |
| VAL anterior | [`VAL-075`](./VAL-075-c3-ui-minima-mep-ceo.md) HOMOLOGADA |
| VAL | este documento — **HOMOLOGADA** |
| Suites | `mepCeo.test.js` · `mepCeo.persistencia.test.js` · `c3.test.js` |
| Build | `vite build` → `index-Cn1wVU-r.js` |
| HEAD base | `e04604b9b44104d17e0d36ff0d6f3d326703c96d` (+ working tree da correcção, não commitado) |

---

## Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | Execução: Engenheiro (Cursor) |
| Quando | 16/08/2026 |
| Por quê | VAL da correcção de fronteira browser/Node da IMP-074 |
| Baseado em quê | Despacho CTO; ARQ-033 §7.7; evidências E1–E11 |
| Resultado | VAL-076 **HOMOLOGADA**; fronteira browser/Node da IMP-074 **validada** |

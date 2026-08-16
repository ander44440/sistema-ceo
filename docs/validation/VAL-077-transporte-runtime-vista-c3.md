# VAL-077 — Validação do transporte runtime da vista C3 (ARQ-033 v1.2)

> **Status:** **HOMOLOGADA** — 16/08/2026 (CTO + Usuário). **12/12 PASS · 0 FAIL.**  
> **Tipo:** VAL (ADR-006 / ADR-014). **Identificação:** VAL-077 (VAL da IMP-075 — transporte runtime C3).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 v1.1 · REQ-085 v1.1 · ARQ-033 **v1.2 Homologada**; [`IMP-075`](../implementation/IMP-075-transporte-runtime-vista-c3.md).  
> **Antecedentes:** VAL-075 (C3+UI); VAL-076 (fronteira browser/Node). Esta VAL **não** reabre VAL-075/076; valida **apenas** o GET interno + consumo runtime no Centro.  
> **Limitações L1–L4:** permanecem limitações de validação; **não** são FAIL.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a vista C3 chega ao Centro via GET interno runtime (Railway/ceo-api → SPA), com payload fechado de 4 campos e fail-closed, sem Node/MEP no browser. |
| **Por que existe?** | Despacho CTO: VAL da IMP de transporte após ARQ-033 v1.2 homologada e IMP implementada. |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Critérios 1–12 do despacho em PASS/FAIL; 0 FAIL; limitações explícitas. |

---

## 1. Escopo validado

```
Vercel/Browser → GET /api/ceo/mep/c3/propostas
Railway/ceo-api → boot IMP-073 em {CEO_DATA_ROOT}/mep-ceo/store
               → listarPropostasC3() → JSON [4 campos]
Centro → htmlBlocoMepC3(vista)
```

**Fora desta VAL:** formulário; POST acto C3; store de produção populado; deploy Railway/Vercel; alteração ARQ-033; reabertura C1/C2/IMP-073/`c3.js`.

---

## 2. Evidências executadas (16/08/2026)

Worktree: `E:\anderson\CEO-cap13-c3` · HEAD base `2eb510d` (+ IMP local não commitada).

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd server && npm run test:mep-c3-vista` | **9/9 pass**, 0 fail — cobre critérios 1–7 + path canónico GET |
| **E2** | `cd app && npm run test:mep-ceo` | **20/20 pass**, 0 fail |
| **E3** | `cd app && npm run test:mep-ceo-persistencia` | **15/15 pass**, 0 fail |
| **E4** | `cd app && npm run test:mep-ceo-c3` | **9/9 pass**, 0 fail — inclui fronteira Centro/`carregarVistaMepC3` sem mepCeo/adapter/`virtual:mep-c3` |
| **E5** | `cd app && npm run build` (`vite build`) | **OK** — 140 módulos; `dist/assets/index-CdjzxqFV.js` (332.79 kB) |
| **E6** | Scan do bundle `index-CdjzxqFV.js` | Contagens **0**: `adapterFs`, `node:fs`, `node:path`, `node:crypto`, `virtual:mep-c3`, `listarPropostasC3`, `inicializarPersistenciaFisica`; path API `mep/c3/propostas` **presente** |
| **E7** | Inspecção `server/src/services/mepC3Vista.js` + rota | `PATH_VISTA_C3 = /api/ceo/mep/c3/propostas`; `resolverDirectorioStoreMep` → `join(CEO_DATA_ROOT, 'mep-ceo', 'store')`; **sem** referência a `executive` |
| **E8** | Inspecção Centro | `carregarVistaMepC3` → `fetch(GET)`; `htmlBlocoMepC3`; mensagem vazia canónica; campos id/tipo/enunciado/maturidade |
| **E9** | `vite.config.js` | **sem** `mepC3VistaPlugin` / snapshot de build |
| **E10** | `git diff` núcleo C1/C2/IMP-073 / `c3.js` / ARQ-033 v1.1 | **vazio** para `c3.js`, `registo.js`, `adapterFs.js`, `persistencia.js`, `isolamento.js`, `ARQ-033-fronteira-mep-ceo.md` |
| **E11** | Endpoint local Node (via `createApp` + `app.request` nos testes E1) | Store vazio/`[]`; C3 CONCEBIDO 4 campos; não-C3 ausente; pós-promo ausente; boot corrupto → `[]`; POST → 404/405 |

**Não executado nesta VAL:** HTTP contra Railway de produção; criação de proposta C3 no volume `/data` de produção; browser headed.

---

## 3. Matriz dos critérios

Legenda: **PASS** · **FAIL** · **LIMITAÇÃO** (não é FAIL).

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| 1 | Endpoint `GET /api/ceo/mep/c3/propostas` | **PASS** | E1; E7; E11 |
| 2 | Store vazio → `[]` | **PASS** | E1 testes 1–2 |
| 3 | C3 CONCEBIDO → só 4 campos; `maturidade = CONCEBIDO` | **PASS** | E1 teste 3 |
| 4 | Objecto não-C3 → não aparece | **PASS** | E1 teste 4 |
| 5 | C3 ≠ CONCEBIDO → não aparece | **PASS** | E1 teste 5 |
| 6 | Privados / transcript / payload bruto ausentes | **PASS** | E1 teste 6 |
| 7 | Falha de boot/persistência → `[]` | **PASS** | E1 teste 7 |
| 8 | Isolamento path: só `{CEO_DATA_ROOT}/mep-ceo/store`; sem `/data/executive/*` | **PASS** | E7; E1 path; sem string `executive` no serviço |
| 9 | Browser: só `fetch`; sem C3/C2/persistência/adapterFs; bundle limpo | **PASS** | E4; E6; E8; E9 |
| 10 | Centro: vista runtime; vazio canónico; markup 4 campos | **PASS** | E8; E4 |
| 11 | Regressão MEP + `test:mep-c3-vista` + `vite build` | **PASS** | E1–E5 |
| 12 | Validação local Node do endpoint (antes de ambiente oficial) | **PASS** | E1/E11 via Hono `app.request` (sem deploy) |

**FAIL: 0.**

---

## 4. Limitações (não corrigidas; não são FAIL)

| # | Limitação |
|---|-----------|
| **L1** | IMP ainda **não** está em `main`/produção Railway; VAL corre sobre working tree local. |
| **L2** | Sem prova headed no browser Vercel contra API live; cobertura = testes + bundle + inspeção. |
| **L3** | Sem proposta C3 real no store de produção (proibido pelo despacho). |
| **L4** | Em lab sem `VITE_CEO_API_BASE`, o `fetch` relativo falha → Centro permanece no vazio canónico (fail-closed perceptivo). |

---

## 5. Isolamento — síntese

| Fronteira | Evidência |
|-----------|-----------|
| Store MEP | `join(CEO_DATA_ROOT, 'mep-ceo', 'store')` → prod `/data/mep-ceo/store` |
| Executive | Serviço de vista **não** referencia `executive` |
| Browser ↔ domínio | Zero imports `mepCeo` / `adapterFs` / `virtual:mep-c3` no Centro |
| Bundle | Zero `adapterFs` / `node:fs|path|crypto` / `listarPropostasC3` |
| Contrato C3/C1/C2/IMP-073 | Ficheiros núcleo sem diff (E10); regressão E2–E4 |

---

## 6. Veredicto

**VAL-077 HOMOLOGADA com 12/12 PASS e 0 FAIL.**

O transporte runtime da vista C3 cumpre o contrato ARQ-033 v1.2 no âmbito desta VAL.

---

## 7. Histórico

| Data | Acto |
|------|------|
| 16/08/2026 | VAL-077 executada (Engenheiro/Cursor); matriz 12/12 PASS |
| 16/08/2026 | Homologação CTO + Usuário; publicação IMP-075 + VAL-077 em `main` |

---

*Fim VAL-077. Código não alterado neste acto.*

# IMP-074 — Canal C3 e UI só-leitura no Centro de Situação (CAP-13)

> **Status:** **IMPLEMENTADA** — 16/08/2026. **VAL-075 HOMOLOGADA** (25/25 PASS; L1/L2 limitações).  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-074.  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 Homologada v1.1 · REQ-085 Homologado v1.1 · ARQ-033 Homologada v1.1.  
> **VAL:** [`VAL-075`](../validation/VAL-075-c3-ui-minima-mep-ceo.md) — **HOMOLOGADA** (CTO + Usuário, 16/08/2026; 25/25 PASS; L1/L2 limitações).  
> **Não reabre:** C1/C2 (IMP-072); persistência física (IMP-073); VIS-009; REQ-085; F1/F2/F3.  
> **Fora (recorte da IMP):** API pública; formulário; Conversa; jobs; ingestão automática; promoção de maturidade; Motor; MRE; EIC; CAP-04; CAP-05; Gate; MTE.  
> **Correcção de entrega (CTO, 16/08/2026):** o Centro deixa de importar a cadeia C3→C2→adapter no bundle browser; consulta C3 permanece em Node (plugin Vite interno).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Primeira implementação do canal C3 (`proporEvolucaoDesidentificada`) e do bloco só-leitura no Centro de Situação. |
| **Por que existe?** | ARQ-033 v1.1 homologada; despacho CTO 16/08/2026 — primeira mudança perceptível da MEP-CEO. |
| **Para quem existe?** | Usuário (ver propostas CONCEBIDO); CTO (VAL futura); Engenheiro (execução). |
| **Como medir sucesso?** | Suite `c3.test.js`; regressão IMP-072 e IMP-073; UI lista só CONCEBIDO + `origemCanal === "C3"`. **Não** é VAL. |

---

## 1. Cadeia

```
VIS-009 v1.1 · REQ-085 v1.1 · ARQ-033 v1.1  (homologados)
    ↓
IMP-074  ← este documento
    ↓
VAL (não aberta neste acto)
```

---

## 2. Recorte

| Item | Estado |
|------|--------|
| Módulo `app/src/mepCeo/c3.js` | Sim |
| Acto `proporEvolucaoDesidentificada` | Sim |
| Quatro campos + papel; recusa de extras | Sim |
| Fail-closed conteúdo proibido | Sim |
| `origemCanal: "C3"` | Sim |
| Criação só via C2 `criarObjecto` | Sim |
| Maturidade inicial `CONCEBIDO` / hipótese | Sim |
| Persistência = IMP-073 (via C2) | Sim |
| UI Centro só-leitura | Sim |
| Formulário / API / Conversa | **Não** |

---

## 3. Arquitectura (conforme ARQ-033 §7)

C3 é irmão de C1/C2. Não edita `isolamento.js`, `registo.js`, `adapterFs.js`, `persistencia.js`.  
A superfície pública C1+C2 (`index.js`) **não** exporta C3 (teste IMP-072 preservado). Testes e o invocador Node importam `c3.js`.

**Fronteira UI/Node (correcção de entrega):** o SPA **não** importa `c3.js` / `registo.js` / `persistencia.js` / `adapterFs.js`. A consulta ARQ-033 §7.7 (`listarObjectos` filtrado CONCEBIDO + `origemCanal === "C3"`) corre no processo Vite (Node) via plugin interno `mepC3VistaPlugin` (módulo virtual `virtual:mep-c3-propostas`). Serializa só a vista de `listarPropostasC3()`. **Não** é API HTTP; **não** amplia o contrato externo. O markup `htmlBlocoMepC3(propostas)` é só apresentação.

```
proporEvolucaoDesidentificada  (Node: testes / invocador interno)
  → validação acto + matriz negativa + C1.avaliarIsolamento
  → C2.criarObjecto (nasce CONCEBIDO; persiste se IMP-073 activa)

Plugin Vite (Node) → listarPropostasC3() → JSON no módulo virtual
  → Centro: htmlBlocoMepC3(vista)  (browser: sem I/O nem adapter)

O plugin **não** faz boot do store canónico no `vite build` (não cria manifesto/log). Persistência IMP-073 permanece no invocador Node / testes.
```

---

## 4. Testes (não VAL)

```
cd app && npm run test:mep-ceo
cd app && npm run test:mep-ceo-persistencia
cd app && npm run test:mep-ceo-c3
```

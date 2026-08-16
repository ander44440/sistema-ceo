# IMP-072 — Núcleo persistente da MEP-CEO (CAP-13)

> **Status:** **HOMOLOGADA** — 14/08/2026 (Despacho CTO). Recorte exclusivo **C1 + C2**.  
> **Estado da entrega:** **IMPLEMENTADA** · **VAL-072 CONCLUÍDA** (0 FAIL) · **IMP-072 HOMOLOGADA**.  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-072.  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020). *Neste acto da IMP, a CAP-13 não foi homologada.* **Acto posterior (14/08/2026):** CAP-13 **HOMOLOGADA** — [`homologacao-cap-13.md`](../cap-13/homologacao-cap-13.md).  
> **Norma:** VIS-009 Homologada v1.0 · REQ-085 Homologado v1.0 · ARQ-033 Homologada v1.0.  
> **VAL:** [`VAL-072`](../validation/VAL-072-nucleo-persistente-mep-ceo.md) — **concluída**; 0 FAIL.  
> **Registo formal:** [`evidencias/IMP-072-homologacao.md`](evidencias/IMP-072-homologacao.md).  
> **Fora do recorte homologado:** persistência física; adapters; C3; UI; integrações Motor / MRE / EIC / G2 / MTE.  
> **Proibição:** sem C3; sem UI; sem evolução autónoma; sem Motor / MRE / EIC / Gate G2 / MTE; sem alterar CAP-04 ou CAP-05; sem `monitorar`; sem diagnóstico do acionamento indevido do Motor.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Primeira versão mínima do núcleo persistente da MEP-CEO: C1 (isolamento) + C2 (registo append-only em memória). |
| **Por que existe?** | Despacho CTO de 14/08/2026: abrir IMP da CAP-13 após homologação da especificação. |
| **Para quem existe?** | CTO (transições técnicas); Usuário (baseline); Engenheiro (execução); CEO-agente (registo em CONCEBIDO e propostas). |
| **Como medir sucesso?** | Testes estruturais do próprio núcleo (isolamento, transições, alçada, evidência, append-only, BSL). **Não** é VAL de produto. |

---

## 1. Cadeia de rastreabilidade

```
ADR-020 (institui CAP-13)
    ↓
VIS-009 v1.0 → REQ-085 v1.0 → ARQ-033 v1.0  (especificação homologada)
    ↓
IMP-072  ← este documento (núcleo C1+C2) — IMPLEMENTADA / HOMOLOGADA
    ↓
VAL-072 — CONCLUÍDA (0 FAIL)
    ↓
Homologação da IMP-072 (14/08/2026) — recorte C1+C2
    ↓
Acto de homologação da CAP-13 — **não aberto / não ocorrido neste documento**
```

---

## 2. Escopo implementado

| Item | Estado |
|------|--------|
| C1 Portão de isolamento | Implementado |
| C2 Registo de evolução (9 objectos, estados, transições, evidência, append-only) | Implementado (em memória) |
| C3 Canal de proposta desidentificada | **Não** implementado (RF-08 / CA-085-31) |
| UI | **Não** |
| Persistência em ficheiro / adapters extra | **Não** — não especificados |
| Ponte RMP ↔ ROADMAP documental | **Não** — sem semântica extra |
| Integração Motor / MRE / EIC / G2 / MTE | **Não** |

---

## 3. Arquitectura efectivamente implementada

Módulo isolado `app/src/mepCeo/`. Não importa Motor, MRE, EIC, Camada de Conhecimento, Gate G2 nem CAP-04/05.

| Ficheiro | Responsabilidade |
|----------|------------------|
| `dominio.js` | Espaços, maturidades, trabalhos, papéis, transições canónicas |
| `isolamento.js` | C1 — recusa dos cinco tipos de conteúdo de organização / cliente |
| `identificadores.js` | Emissão `MARCADOR-nnn` por espaço; sem reutilização |
| `transicoes.js` | Saltos e alçadas (RN-03.5 / RN-03.6 / RN-05.2) |
| `registo.js` | C2 — projecção em memória subordinada ao log append-only |
| `index.js` | Superfície pública |
| `mepCeo.test.js` | Testes estruturais do núcleo |

Persistência: **Map + array em processo**. Reinício de processo perde o estado. Schema em disco **não** foi inventado.

### Transições e alçadas (conforme REQ-085 RN-03.5)

| De | Para | Quem promove |
|----|------|----------------|
| — | `CONCEBIDO` | CEO-agente **regista** (CTO / Usuário / Engenheiro também podem originar) |
| `CONCEBIDO` | `DEFINIDO` | CTO (+ Usuário se `MCP` ou `EPC`) |
| `DEFINIDO` | `EM_CONSTRUÇÃO` | CTO |
| `EM_CONSTRUÇÃO` | `EM_VALIDAÇÃO` | CTO |
| `EM_VALIDAÇÃO` | `HOMOLOGADO` | CTO + Usuário quando o catálogo exigir (`MCP` / `EPC`) |
| `HOMOLOGADO` | `BASELINE` | Usuário apenas |

Autoridade Delegada **não** promove `HOMOLOGADO` nem `BASELINE` por omissão. Propor ≠ promover.

---

## 4. Relação com RNF-07 (CA-085-32…37)

CA-085-32…37 descrevem o **estado da homologação da especificação** (sem runtime). Este IMP **não emenda** o texto homologado do REQ-085.

| Critério | Neste IMP |
|----------|-----------|
| CA-085-32 C3 não implementado | **Mantido** |
| CA-085-33 IMP não aberto | **Supersedido** pelo despacho que abre IMP-072 — sem emenda ao REQ |
| CA-085-34 Sem código MEP | **Supersedido** pelo mesmo despacho (núcleo C1+C2) — sem emenda ao REQ |
| CA-085-35 Sem UI | **Mantido** |
| CA-085-36 Sem evolução autónoma | **Mantido** |
| CA-085-37 Sem Motor/MRE/EIC/G2/MTE | **Mantido** |

---

## 5. Testes

```
cd app && npm run test:mep-ceo
```

Result (14/08/2026): **20 passed, 0 failed.**

Cobertura estrutural: isolamento; criação CONCEBIDO; transições válidas; saltos; autoridade; evidência; append-only; baseline congelada; novo BSL; cinco tipos de organização; distinção dos nove objectos.

**Não** é validação de produto. **Não** declara a CAP-13 homologada.

---

## 6. Decisões que permaneceram não especificadas

Ver VAL-072 §6. As lacunas **não** constituem FAIL nem defeito de conformidade. Não foram tratadas como correcção neste ciclo.

---

## 7. Homologação (14/08/2026)

| Campo | Valor |
|-------|--------|
| Acto | Homologação da **IMP-072** |
| Recorte | Exclusivamente o núcleo **C1 + C2** implementado |
| Base | VAL-072 concluída com **0 FAIL** |
| IMP-072 | **IMPLEMENTADA** e **HOMOLOGADA** |
| VAL-072 | **CONCLUÍDA** |
| CAP-13 | **Não homologada** por este acto |
| Fora | Persistência física, adapters, C3, UI, integrações |

*Acto posterior (14/08/2026):* CAP-13 **HOMOLOGADA** — [`homologacao-cap-13.md`](../cap-13/homologacao-cap-13.md). O quadro acima descreve o acto da IMP-072 e **não** é reescrito.

### Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO despachou; Engenheiro (Cursor) formalizou nos artefactos canónicos |
| Quando | 14/08/2026 |
| O quê | Homologação da IMP-072 (núcleo persistente MEP-CEO C1+C2) |
| Por quê | VAL-072: requisitos aplicáveis PASS; 0 FAIL; lacunas não tratadas como defeito; persistência volátil permitida no escopo |
| Baseado em quê | VIS-009 · REQ-085 · ARQ-033 v1.0 · IMP-072 · VAL-072 (E1–E5; suite 20/20) |
| Resultado | IMP-072 **HOMOLOGADA** no recorte C1+C2; CAP-13 **não** homologada |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-13 |
| VIS / REQ / ARQ | VIS-009 · REQ-085 · ARQ-033 (v1.0 homologados) |
| ADR | ADR-020 |
| Código | `app/src/mepCeo/` |
| VAL | [`VAL-072`](../validation/VAL-072-nucleo-persistente-mep-ceo.md) — **concluída / 0 FAIL** |
| Homologação | [`evidencias/IMP-072-homologacao.md`](evidencias/IMP-072-homologacao.md) (IMP) · [`homologacao-cap-13.md`](../cap-13/homologacao-cap-13.md) (CAP-13, acto posterior) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| — | 14/08/2026 | Engenheiro | Núcleo C1+C2 implementado; VAL pendente | Despacho CTO — abrir IMP da CAP-13 | Implementada |
| — | 14/08/2026 | Engenheiro | VAL-072 executada; 0 FAIL | Despacho CTO — VAL da IMP-072 | Aguarda homologação |
| — | 14/08/2026 | CTO despachou; Engenheiro formalizou | Homologação da IMP-072 (C1+C2) | VAL-072 0 FAIL | **HOMOLOGADA**; CAP-13 não homologada *neste* acto |
| — | 14/08/2026 | CTO + Usuário; Engenheiro formalizou | CAP-13 homologada (contrato mínimo; C1+C2) | Diagnóstico de prontidão + VAL-072 | CAP-13 **HOMOLOGADA** (acto próprio) |

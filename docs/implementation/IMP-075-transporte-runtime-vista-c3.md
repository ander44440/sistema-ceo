# IMP-075 — Transporte runtime da vista C3 (CAP-13)

> **Status:** **IMPLEMENTADA** — 16/08/2026. **VAL-077 HOMOLOGADA** (12/12 PASS).  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-075.  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 Homologada v1.1 · REQ-085 Homologado v1.1 · ARQ-033 Homologada **v1.2**.  
> **VAL:** [`VAL-077`](../validation/VAL-077-transporte-runtime-vista-c3.md) — **HOMOLOGADA** (CTO + Usuário, 16/08/2026; 12/12 PASS).  
> **Não reabre:** C1/C2 (IMP-072); persistência física (IMP-073); contrato do acto C3 (IMP-074); VIS-009; REQ-085.  
> **Fora:** POST/formulário C3; criação de proposta na UI; API pública; Conversa; promoção; Motor/MRE/EIC; deploy neste acto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Transporte interno GET da vista C3 só-leitura em runtime (Railway/`ceo-api` → SPA Vercel), substituindo o snapshot de build. |
| **Por que existe?** | ARQ-033 v1.2 homologada: percepção = store, não artefacto estático do `vite build`. |
| **Para quem existe?** | Usuário (lastro no Centro); CTO (VAL); Engenheiro (execução). |
| **Como medir sucesso?** | VAL-077: payload de 4 campos; fail-closed; bundle sem Node/MEP; regressão C1/C2/C3. |

---

## 1. Cadeia

```
ARQ-033 v1.2 (homologada)
    ↓
IMP-075  ← este documento
    ↓
VAL-077 (homologada)
```

---

## 2. Recorte

| Item | Estado |
|------|--------|
| `GET /api/ceo/mep/c3/propostas` | Sim |
| Boot IMP-073 em `{CEO_DATA_ROOT}/mep-ceo/store` | Sim |
| `listarPropostasC3()` (contrato intacto) | Sim |
| Payload: id, tipoLacunaProduto, enunciadoDesidentificado, maturidade=CONCEBIDO | Sim |
| Fail-closed → `[]` | Sim |
| Centro: `fetch` + `htmlBlocoMepC3` | Sim |
| Remoção do snapshot `virtual:mep-c3-propostas` | Sim |
| POST / formulário / acto C3 via HTTP | **Não** |

---

## 3. Arquitectura (ARQ-033 v1.2)

```
Vercel/Browser → GET /api/ceo/mep/c3/propostas
Railway/ceo-api → inicializarPersistenciaFisica(join(CEO_DATA_ROOT,'mep-ceo','store'))
               → listarPropostasC3() → JSON [4 campos]
Centro → carregarVistaMepC3() → htmlBlocoMepC3(vista)
```

Browser **não** importa `c3.js` / `registo.js` / `persistencia.js` / `adapterFs.js`.

---

## 4. Ficheiros

| Ficheiro | Papel |
|----------|-------|
| `server/src/services/mepC3Vista.js` | Boot + vista |
| `server/src/routes/mepC3Vista.js` | Rota GET |
| `server/src/routes/mepC3Vista.test.js` | Suite transporte |
| `server/src/app.js` | Registo da rota |
| `app/src/modules/centroSituacao/carregarVistaMepC3.js` | Cliente SPA |
| `app/src/modules/centroSituacao/centroSituacao.js` | Consumo runtime |
| `app/vite.config.js` | Sem plugin snapshot |
| `app/src/mepCeo/c3.test.js` | Fronteira browser actualizada |

---

## 5. Histórico

| Data | Acto |
|------|------|
| 16/08/2026 | IMP-075 implementada; VAL-077 homologada; publicação em `main` |

---

*Fim IMP-075.*

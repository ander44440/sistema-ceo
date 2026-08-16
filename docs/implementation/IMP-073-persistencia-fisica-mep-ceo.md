# IMP-073 — Persistência física e adapter filesystem da MEP-CEO (CAP-13)

> **Status:** **IMPLEMENTADA** · **VAL-074 CONCLUÍDA e APROVADA** — 15/08/2026.  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-073.  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 · REQ-085 · ARQ-033 v1.0; contrato de persistência física aprovado 15/08/2026.  
> **VAL:** [`VAL-074`](../validation/VAL-074-persistencia-fisica-mep-ceo.md) — **APROVADA** (0 FAIL).  
> **Não reabre:** IMP-072 (núcleo C1+C2 homologado permanece).  
> **Fora:** C3; UI; Motor; MRE; EIC; Gate G2; MTE; CAP-04; CAP-05; writers externos; localStorage; `docs/` como store; git como adapter.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Elo que transforma o C2 em memória de processo numa persistência física append-only, via adapter filesystem. |
| **Por que existe?** | Restart do processo destruía a MEP-CEO (limitação da IMP-072). Uso real exige sobreviver ao boot. |
| **Para quem existe?** | CTO (VAL); Usuário (baseline do produto); Engenheiro (execução). |
| **Como medir sucesso?** | Suite T1–T14 (incl. restart real em dois processos); `npm run test:mep-ceo` 20/20; zero writers externos. |

---

## 1. Cadeia

```
CAP-13 HOMOLOGADA (C1+C2 / IMP-072)
    ↓
Contrato persistência física + adapters (aprovado 15/08/2026)
    ↓
IMP-073  ← este documento
    ↓
VAL-074 — **APROVADA** (15/08/2026)
```

---

## 2. Recorte implementado

| Item | Estado |
|------|--------|
| Manifesto `mep-ceo/store/manifesto.json` | Sim |
| Log canónico `eventos.jsonl` | Sim |
| Adapter FS `app/src/mepCeo/adapterFs.js` | Sim |
| Rehidratação no boot (`inicializarPersistenciaFisica`) | Sim |
| Append só após C1+C2 aceitarem | Sim |
| Projecção reconstruída a partir do log | Sim |
| Contadores reconstruídos a partir dos IDs | Sim |
| Fail closed (truncamento / identidade) | Sim |
| Recusa de envelope contaminado | Sim |
| Sem delete/squash | Sim |
| C3 / UI / integrações | **Não** |

Path canónico: `mep-ceo/store/` (raiz do repositório CEO). Não parametrizado por COA/projecto/cliente.

---

## 3. Arquitectura

C1 e C2 continuam donos das regras. O adapter só faz I/O. `node:fs` apenas em `adapterFs.js`.

```
API C2 (registo.js)
    → comprometer() após aceite
        → persistirSeActivo()
            → appendRegistoFisico()  [eventos.jsonl]
    → inicializarPersistenciaFisica()
        → carregarStore() → hidratarDesdeLog()
```

Sem persistência activa, o núcleo homologado permanece só em processo (suite `mepCeo.test.js`).

---

## 4. Testes

```
cd app && npm run test:mep-ceo
cd app && npm run test:mep-ceo-persistencia
```

T3 usa dois processos Node (`persistenciaRestartWorker.js`). `reiniciarMepParaTestes()` não satisfaz T3.

---

## 5. Isolamento

Nenhum import de Motor, MRE, EIC, Gate, MTE, conversa, COA, CAP-04, CAP-05, `catalogoProjetos`. Sem localStorage. Sem writers automáticos.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-13 |
| IMP anterior | IMP-072 (intácta) |
| Código | `app/src/mepCeo/adapterFs.js`, `persistencia.js`; ligações mínimas em `registo.js` |
| Store | `mep-ceo/store/` |
| Suite | `app/src/mepCeo/mepCeo.persistencia.test.js` |

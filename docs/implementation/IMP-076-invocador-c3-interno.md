# IMP-076 — Invocador C3 interno (Node / ceo-api)

> **Status:** **IMPLEMENTADA** — 16/08/2026. **VAL-078** (matriz nesta publicação).  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-076.  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 Homologada v1.1 · REQ-085 Homologado v1.1 · ARQ-033 Homologada **v1.1** (acto C3) · ARQ-033 Homologada **v1.2** (sede/store) · proposta [`ARQ-034`](../architecture/ARQ-034-invocador-c3-producao-proposta.md) (Opção A homologada para IMP).  
> **VAL:** [`VAL-078`](../validation/VAL-078-invocador-c3-interno.md).  
> **Não reabre:** C1/C2 (IMP-072); persistência (IMP-073); contrato `c3.js` (IMP-074); transporte GET (IMP-075); VIS-009; REQ-085; ARQ-033.  
> **Fora deste acto:** deploy Railway/Vercel; execução do invocador em produção; primeiro lastro C3 real; POST/formulário/UI; promoção; Motor/MRE/Conversa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Serviço interno Node no `ceo-api` que executa `proporEvolucaoDesidentificada` contra o store canónico, com gate de confirmação e `dryRun`, **sem** HTTP de escrita. |
| **Por que existe?** | Transporte (IMP-075) está vivo com GET `[]`; falta mecanismo oficial controlado para criar lastro C3 na sede — sem API pública nem formulário. |
| **Para quem existe?** | Engenheiro (ops Node); CTO (VAL); Usuário (lastro futuro em acto separado). |
| **Como medir sucesso?** | VAL-078: 12 critérios PASS; regressão MEP; zero rota POST; isolamento C1/C2/C3/IMP-073/adapter/GET/UI. |

---

## 1. Cadeia

```
CAP-13
  → ARQ-033 v1.1 (acto C3) + v1.2 (sede /data/mep-ceo/store)
  → ARQ-034 proposta (Opção A — serviço interno)
  → IMP-076  ← este documento
  → VAL-078
```

**Separação obrigatória:** publicação desta IMP ≠ execução do acto C3 em produção (lastro = acto futuro).

---

## 2. Recorte

| Item | Estado |
|------|--------|
| `executarActoC3({ acto, confirmacao, dryRun }, { repoRoot })` | Sim |
| `confirmacao === true` obrigatória | Sim |
| `dryRun` valida via C3 sem persistir | Sim |
| Rejeição de campos extras (topo + acto) | Sim |
| Rejeição de conteúdo privado (via C3 canónico) | Sim |
| Boot `garantirBootMep(CEO_DATA_ROOT)` → `{root}/mep-ceo/store` | Sim |
| Chama só `proporEvolucaoDesidentificada` | Sim |
| Resultado sanitizado (id, CONCEBIDO, origemCanal C3, 2 campos vista) | Sim |
| Rota HTTP / POST / formulário / UI | **Não** |
| Promoção de maturidade | **Não** |
| Segundo MEP / store | **Não** |

---

## 3. Contrato

```text
executarActoC3(
  { acto, confirmacao, dryRun },
  { repoRoot }   // CEO_DATA_ROOT; produção → /data → /data/mep-ceo/store
)
```

**Topo permitido:** `acto` | `confirmacao` | `dryRun`  
**Acto permitido:** `papel` | `tipoLacunaProduto` | `objectoCandidato` (`MCP`\|`EPC`\|`MDL`) | `enunciadoDesidentificado` | `evidenciaNaoPrivada`

**Sucesso (sanitizado):** `ok`, `dryRun`, `id`, `maturidade: "CONCEBIDO"`, `origemCanal: "C3"`, `tipoLacunaProduto`, `enunciadoDesidentificado`  
**Falha:** `ok: false`, `motivo`, fail-closed (zero objecto parcial).

---

## 4. Arquitectura

```
[Node sede ceo-api]
    → garantirBootMep(repoRoot)     // reuso IMP-075
    → proporEvolucaoDesidentificada(acto)  // c3.js intacto
    → C2 + IMP-073 (store canónico)
[GET IMP-075] → Centro (só leitura; inalterado)
```

Fronteira **Node-only**. Browser não importa o invocador.

---

## 5. Ficheiros

| Ficheiro | Papel |
|----------|-------|
| `server/src/services/mepC3Invocador.js` | Núcleo `executarActoC3` |
| `server/src/services/mepC3Invocador.test.js` | Suite do invocador |
| `server/src/services/mepC3Vista.js` | **Reutilizado** (boot/path); contrato GET intacto |
| `server/package.json` | Script `test:mep-c3-invocador` |

**Não alterados:** `c3.js`, `registo.js`, `adapterFs.js`, `persistencia.js`, `isolamento.js`, `app.js` (sem nova rota), Centro, Vercel.

---

## 6. Histórico

| Data | Acto |
|------|------|
| 16/08/2026 | IMP-076 implementada; VAL-078 executada; publicação em `main` (sem deploy; sem lastro) |

---

*Fim IMP-076.*

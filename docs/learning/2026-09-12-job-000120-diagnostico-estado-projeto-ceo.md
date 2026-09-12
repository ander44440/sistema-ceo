# JOB-000120 — Diagnóstico geral do estado do projeto CEO

**Data:** 2026-09-12  
**Job:** JOB-000120  
**Projecto:** prj-sistema-ceo (Sistema CEO)  
**Branch:** `cursor/ipr-001-experiencia-f1-f2`  
**HEAD no momento do diagnóstico:** `5364a0f`  
**vs remote da branch:** ahead 32  
**vs `origin/main`:** ~47 à frente / ~28 atrás  

## Objectivo

Faça um diagnostico geral do atual estado do projeto CEO e aponte onde você considera que ha deficiências que precisem ser melhoradas.

## Resumo executivo

O Sistema CEO é operacionalmente maduro (gabinete, MRE, fila, CAP-13 em produção via `main`), mas **esta cópia de trabalho** está fortemente dessincronizada: dezenas de commits locais não publicados na branch remota, divergência grave com `main`, e ~70 ficheiros dirty (≈40 modificados + ≈30 untracked). Várias fatias declaradas homologadas (IMP/VAL-087…089, C3 UI) ainda vivem só no working tree. O risco principal não é falta de capacidade — é **perda de lastro, publicação parcial e governação documental desatualizada**.

## Pontos fortes

- Ciclo ADR-006 denso em `docs/` (VIS/REQ/ARQ/IMP/VAL) e sede CAP-13.
- Runtime `app/` rico e testado (~185 `*.test.js`), com módulos claros (`executiveEngine`, `classificadorIntencao`, `motorExecucao`, `mepCeo`, `consultaRegistados`, trilha, etc.).
- Fila executiva operacional (120 jobs; protocolo P0-2; dispatcher + regras `.cursor/`).
- CAP-13 com lastro de produção (C3 → Railway → Centro) documentado na Âncora / MCP-001.
- Histórico recente coerente na branch (consulta registados, Trilha Auditável, memória, correcções de precedência).

## Deficiências prioritárias

### P0 — lastro e verdade operacional

1. **Trabalho “homologado” fora do Git**  
   Untracked no momento do diagnóstico: `app/src/historicoFisicoConversas/`, `app/server/historicoFisicoConversasPlugin.js`, `executive/historico-conversas/`, docs REQ/ARQ/IMP/VAL-087/088/089, `app/src/mepCeo/c3.js` (+ UI Centro), `server/src/routes/mepC3.js`. Risco: perder prova HFC/087–089/C3 UI apesar de VAL PASS.

2. **Working tree massivo sem commit**  
   Branch `ahead 32`; ≈40 `M` + ≈30 `??` (ex.: `faixaDoDia.js` com diff grande; refactors de classificador/consulta/centro).

3. **Divergência com `main`**  
   `git rev-list --left-right --count origin/main...HEAD` → `28 47`. Produção ≠ objecto CEO-A; merge futuro será custoso.

4. **Docs de entrada contradizem a realidade**  
   - `README.md` raiz: “Ainda não existe implementação… Fase 1”.  
   - `docs/README.md` (ARQ-033): “C3 **não** implementada” vs docs CAP-13 / VAL-075 / código C3.  
   - `ROADMAP-002`: “Frente activa: nenhuma” (06/08) vs frentes activas na branch.

### P1 — qualidade e manutenção

5. **Sem suite unificada / sem CI** — `app/package.json` com muitos `test:*` fragmentados; sem `.github/`; `server/` com poucos testes; scripts não agregam HFC / Trilha / `c3.test.js`.

6. **God-modules** — `executiveEngine/index.js` (~2k linhas), `classificadorIntencao/regras.js` (~1.3k), `faixaDoDia.js` a crescer no WIP.

7. **Arquitectura dual de backend pouco explícita** — plugins Vite (`app/server/*`) vs Hono (`server/src/`); risco de feature só num lado (ex. rota `mepC3`).

8. **Fila com dívida operacional** — 12 `needs_correction`, 16 `failed` (vários `melhoria_nao_especificada_no_payload` / `resultado_ausente_apos_agent`); artefactos `_bat*` / `projeto-teste*` na queue; encoding UTF-8 frágil nos JSON.

9. **Âncora Mestra desactualizada face ao objecto de trabalho** — HEAD real `5364a0f`; retrato de produção mais antigo; não cobre de forma fiável HFC / Trilha / IMP-086…089 neste WT.

### P2 — higiene

10. Nome da branch (`ipr-001-experiencia-f1-f2`) desalinhado da frente actual.  
11. Ruído na raiz (`teste-evidencia-verificavel.txt`, etc.).  
12. Volume documental alto sem um único “estado actual” fiável.  
13. Regra `.cursor/rules/sincronia-publicacao.mdc` ainda untracked.

## Riscos

- Homologação sem commit → perda de lastro.  
- Publicação parcial Vercel/Railway sem as fatias locais.  
- Regressão conversacional por concentração em EE + regras.  
- Jobs ambíguos de “melhoria aprovada” sem payload.  
- Múltiplas “fontes de verdade” documentais desencontradas.

## Estado da fila (snapshot)

| Estado | Qtd |
|--------|-----|
| completed | 72 |
| cancelled | 19 |
| failed | 16 |
| needs_correction | 12 |
| running | 1 (JOB-000120) |
| pending | 0 |

Backlog útil imediato: triagem dos `needs_correction`, não novos pending.

## Recomendações (sem implementar neste Job)

1. Versionar o WT crítico (HFC/087, Trilha/088, consulta/089, C3 UI) em commits/PRs separados de refactors de UI.  
2. Reconciliar com `main` (inventário dos 28 commits em falta) sob política de sincronia.  
3. Actualizar README raiz, linha ARQ-033 em `docs/README.md`, Âncora e ROADMAP-002.  
4. Higiene da fila (fechar/cancelar `needs_correction` antigos; UTF-8; arquivar testes da queue).  
5. Agregar `npm test` / CI mínimo; testes de rotas no `server/`.  
6. Refactors deliberados pós-commit em EE / regras / faixaDoDia.  
7. Contrato de jobs: exigir parecer/payload antes de despachar melhorias.  
8. Renomear/retomar branch alinhada à frente (memória/arquivo/observabilidade).

## Veredicto

O Sistema CEO está **operacional e documentado em profundidade**, mas o estado *desta* cópia é de **integração incompleta**: muita evolução real (e até “homologada”) vive só no working tree, enquanto os documentos de entrada ainda apontam para um mundo mais antigo ou só para `main`. Prioridade máxima: **lastro no Git + reconciliação `main` + limpeza da fila/docs de estado**, não mais features.

## Evidência de verificação usada

- `git status -sb`, `git log -1`, `git rev-list --left-right --count origin/main...HEAD`
- Contagem de estados em `executive/queue/JOB-*.json`
- Grep em `README.md`, `docs/README.md`, `docs/roadmap/ROADMAP-002-*.md`
- Inventário de untracked (HFC, C3, docs 087–089)

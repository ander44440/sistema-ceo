# VAL-074 — Validação da IMP-073 (persistência física da MEP-CEO)

> **Status:** **CONCLUÍDA e APROVADA** — 15/08/2026. **0 FAIL.**  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-074 (VAL da IMP-073).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** contrato de persistência física aprovado 15/08/2026; VIS-009 · REQ-085 · ARQ-033 v1.0; IMP-073 IMPLEMENTADA.  
> **Código:** **não alterado** neste acto. Sem C3. Sem UI. Sem Motor / MRE / EIC / Gate G2 / MTE / CAP-04 / CAP-05. Sem commit.  
> **Não corrige** as seis limitações registadas na verificação técnica aceite.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a persistência física + adapter filesystem da IMP-073 cumpre o contrato aprovado, sem regressão do núcleo C1+C2. |
| **Por que existe?** | Despacho 15/08/2026: VAL da persistência física CAP-13 após verificação técnica aceite (pronta para VAL). |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Itens 1–9 do despacho em PASS/FAIL; 0 FAIL; limitações explícitas, não tratadas como defeito. |

---

## 1. Escopo validado

| # | Item do despacho | Âmbito |
|---|------------------|--------|
| 1 | Persistência só após aceite C2 | `comprometer`; T1; T2 |
| 2 | Reidratação a partir de `eventos.jsonl` | `hidratarDesdeLog`; T4; T5; T11 |
| 3 | Contadores do histórico | `restaurarContadoresDesdeIds`; T4 |
| 4 | Append-only | T1; T10; APIs de delete recusadas |
| 5 | Fail closed | T6; T8 |
| 6 | Isolamento | T2; T7; T9; T14 |
| 7 | Restart real (dois processos) | T3 + `persistenciaRestartWorker.js` |
| 8 | Sem regressão C1+C2 | `npm run test:mep-ceo` 20/20 |
| 9 | C3 / UI / integrações fora | Inspecção + T9 |

**Fora desta VAL:** C3; UI; Motor/MRE/EIC/G2/MTE; CAP-04/05; correcção das seis limitações; homologação nova da CAP-13; commit.

---

## 2. Evidências executadas (15/08/2026)

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd app && npm run test:mep-ceo` | **20/20 pass**, 0 fail |
| **E2** | `cd app && npm run test:mep-ceo-persistencia` | **15/15 pass**, 0 fail (T1–T14 + T9b) |
| **E3** | Inspecção `comprometer` / `hidratarDesdeLog` / `appendRegistoFisico` / `PATH_CANONICO` | Disco antes da projecção; log canónico; path fixo `mep-ceo/store/` |
| **E4** | Inspecção de imports em `mepCeo/` (exceto testes) | Sem Motor, MRE, EIC, Gate, MTE, CAP-04/05, conversa, `catalogoProjetos`; sem `canalC3` |
| **E5** | Inspecção: `dominio.js`, `isolamento.js`, `transicoes.js`, `mepCeo.test.js` sem alteração neste ciclo de persistência | Contrato C1+C2 intacto |

T3 (E2): dois `spawnSync` de `process.execPath` sobre o mesmo directório; processo B só `inicializarPersistenciaFisica(dir)` + consulta.

---

## 3. Resultados por item do despacho

Legenda: **PASS** · **FAIL** · **LIMITAÇÃO** (registada; não corrigida).

| # | Item | Veredicto | Evidência |
|---|------|-----------|-----------|
| 1 | Persistência somente após aceite C2 | **PASS** | E3: `persistirSeActivo` antes de `aplicar()`; E2 T1 grava `MEV`; T2 recusa C1/alçada/salto não altera o JSONL |
| 2 | Reidratação a partir de `eventos.jsonl` | **PASS** | E3: `carregarStore` lê JSONL; `hidratarDesdeLog` substitui memória; E2 T11 log vence cache; T4/T5 recarregam do disco |
| 3 | Contadores reconstruídos do histórico | **PASS** | E3: `restaurarContadoresDesdeIds`; E2 T4 `MDL-002` / `BSL-003` após reset+load |
| 4 | Append-only | **PASS** | E2 T1; T10 delete/compactar recusados, ficheiro inalterado |
| 5 | Fail closed (corrupção/truncamento) | **PASS** | E2 T8 `log_truncado`; T6 `identidade_invalida`; memória de teste vazia após reset |
| 6 | Isolamento COA/cliente/conversa/MTE/KNW/CAP-05 | **PASS** | E2 T2/T7/T9/T14; E4 sem imports alheios; path canónico não parametrizado por COA |
| 7 | Restart real em dois processos | **PASS** | E2 T3; worker `gravar` encerra; worker `ler` rehidrata do mesmo store |
| 8 | Regressão C1+C2 = 20/20 | **PASS** | E1 **20/20** |
| 9 | C3, UI, integrações fora | **PASS** | E4; `index.js` sem canal C3; E2 T9 |

**FAIL: 0.**

---

## 4. Limitações (não corrigidas nesta VAL)

Registo explícito, conforme despacho. **Não** são FAIL.

| # | Limitação |
|---|-----------|
| L1 | Buraco de contador possível após falha de I/O: `emitirIdentificador` corre antes de `comprometer`. |
| L2 | Append reescreve o JSONL inteiro (re-serialização + nova linha), não `O_APPEND`. |
| L3 | Manifesto presente sem `eventos.jsonl` materializa log vazio (`garantirPrimeiroBoot`). |
| L4 | Boot com erro não limpa memória prévia (`inicializarPersistenciaFisica` não hidrata em falha). |
| L5 | C1 continua estrutural (não classifica texto livre). Lacuna VAL-072, fora deste elo. |
| L6 | `appendRegistoFisico` permanece na superfície pública (`index.js`). |

---

## 5. Veredicto

**APROVADA.**

A IMP-073 cumpre o contrato de persistência física da CAP-13 no recorte validado. Zero FAIL. Limitações L1–L6 registadas; **não** autorizam correcção neste acto. C3, UI e integrações permanecem fora. Homologação adicional da CAP-13 **não** ocorre neste documento.

---

## 6. Recomendação ao CTO

1. Aceitar esta VAL como fecho da IMP-073.  
2. **Não** abrir C3, UI nem integrações por este acto.  
3. **Não** corrigir L1–L6 sem despacho novo.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-13 |
| IMP | [`IMP-073`](../implementation/IMP-073-persistencia-fisica-mep-ceo.md) |
| IMP anterior (intácta) | IMP-072 / VAL-072 |
| Suite persistência | `app/src/mepCeo/mepCeo.persistencia.test.js` |
| Suite núcleo | `app/src/mepCeo/mepCeo.test.js` |
| Código | `app/src/mepCeo/` — **não modificado** nesta VAL |

---

## Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor) executou VAL-074; despacho CTO 15/08/2026 |
| Quando | 15/08/2026 |
| O quê | VAL da persistência física + adapters (IMP-073) |
| Por quê | Verificação técnica aceite; pronta para VAL |
| Baseado em | Contrato 15/08; IMP-073; E1–E5; T1–T14; verificação técnica |
| Resultado | VAL **CONCLUÍDA e APROVADA**; 0 FAIL; L1–L6 limitações; sem commit; código intocado |

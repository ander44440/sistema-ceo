# IMP-089 — Recuperação de discussões e decisões antigas

> **Status: IMPLEMENTADA · VALIDADA · HOMOLOGADA — v1.0 (11/09/2026).** Fatia 1 encerrada.  
> **Versão:** 1.0 — 11/09/2026  
> Norma: **REQ-089 v1.0 Homologado**; **ARQ-089 v1.0 Homologada**; **VAL-089 APROVADO · HOMOLOGADO**.  
> Baseline: **REQ-086 / ARQ-086 / IMP-086 v1.0 Homologados** — **não emendados**. Evolução **somente** da **camada de consulta** (`consultaRegistados`).  
> Fontes consumidoras: **HFC-087** e **Trilha-088** (read-only) — **não reabertas nem alteradas**.  
> **F8/MO:** **não** alterada (F-MO intacto). **F5-C3:** preservado.  
> Capacidade: **CAP-05** — Memória Organizacional (consulta).  
> **Evidência:** VAL-089 — **92/92 PASS**; build OK; **0 regressões**; CA-089-1…9 atendidos.  
> **Sem** novo store; **sem** nova memória; CAP-13/C3 fora; JOB-000118 intocado.  
> **Gate da entrega:** fechado (homologada). Commit/push: fora deste acto de fechamento documental.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Implementação da Fatia 1 que evolui `consultaRegistados` (IMP-086): F-TX lê HFC; F-TR recebe deps Trilha; F-MO e D-PED intactos. |
| **Por que existe?** | REQ/ARQ-089 exigem sobrevivência de discussões via HFC e refs de execução via Trilha sem novo store. |
| **Para quem existe?** | Patrocinador (uso diário); Engenheiro; CTO/Usuário (Gates). |
| **Como medir sucesso?** | CA-089-1…9 + regressão CA-086; spies de zero writes; suites HFC/Trilha/MO/F5-C3/engine verdes — **cumprido (VAL-089)**. |

---

## 1. O que já existia (IMP-086) — baseline

Módulo `app/src/consultaRegistados/`:

| Peça | Ficheiro | Papel V1 |
|------|----------|----------|
| D-PED | `pedidoExplicito.js` | Âncoras +/− |
| C-ORQ | `orquestrarConsulta.js` | Ramos + portas |
| C-SEP | `montarResposta.js` | Secções + ausência |
| F-* | `portasLeitura.js` | F-MO / F-TX / F-TR |
| Hook | `executiveEngine/index.js` | Pós-Gate/AD, pré-classificador |

**Preservado:** pedido explícito; isolamento COA; F-MO Art. 8º; read-only; ausência explícita; mesmo ponto de hook.

---

## 2. O que a Fatia 1 acrescentou (implementado)

1. **F-TX** — leitura HFC por `coaId` (`deps.listarHfcPorCoa`) + união dedupe `msgId` com F5-C3.  
2. **F-TR** — `criarDepsConsultaProducao()` injecta `listarPorMo` (soft-fail) no hook de produção.  
3. Testes `imp089.fatia1.test.js` + regressão IMP-086.  
4. GET read-only no plugin HFC **apenas** para consumo da consulta (writers/schema/store HFC **inalterados**).

---

## 3. O que permanece inalterado (registo explícito)

* **HFC-087** — **não** reaberto nem alterado (writers, schema, store, hook de gravação).  
* **Trilha-088** — **não** reaberta nem alterada (tipos, writers, store).  
* **F8/MO** — **não** alterada.  
* **F5-C3** — contrato preservado.  
* D-PED e posição do hook.  
* **Sem** novo store; **sem** nova memória.  
* CAP-13/C3; JOB-000118; textos homologados 086/087/088.

---

## 4. Estrutura técnica entregue

| Peça | Onde | Delta Fatia 1 |
|------|------|----------------|
| F-TX | `portasLeitura.js` (`lerDiscussao`) | HFC primário + dedupe F5-C3 |
| C-ORQ | `orquestrarConsulta.js` | Usa `lerDiscussao`; deps HFC/Trilha |
| C-SEP | `montarResposta.js` | Rótulo histórico; limite N |
| Deps produção | `depsProducao.js` | `listarHfcPorCoa` + `listarPorMo` soft-fail |
| Hook | `executiveEngine/index.js` | Injecta deps; **mesmo ponto** |
| Testes | `imp089.fatia1.test.js` | CA-089-* |

---

## 5. Etapas — estado

| Etapa | Conteúdo | Estado |
|-------|----------|--------|
| **E0** | Formalização REQ/ARQ/IMP | **Concluída** |
| **E1** | F-TX ← HFC read | **Concluída** |
| **E2** | F-TR produção soft-fail | **Concluída** |
| **E3** | Regressão + VAL-089 | **Concluída · HOMOLOGADA** |

---

## 6. Limites conhecidos da Fatia 1 (homologados — não FAIL)

* Sem busca semântica, UI dedicada, backfill, correlação obrigatória mensagem↔MO↔Trilha.  
* HFC vazio (pré-writer) ⇒ ausência explícita.  
* Limite N (12) na C-SEP.  
* Refs Trilha vazias se não houver eventos para o `moId`.  
* Limitações Railway / fiabilidade Trilha V1 **permanecem** (não objecto desta fatia).

---

## 7. Critérios de fecho — resultado

| Critério | Resultado |
|----------|-----------|
| CA-089-1…9 | **PASS** (VAL-089) |
| CA-086-1…9 regressão | **PASS** |
| Zero writes no caminho de consulta | **PASS** |
| Writers HFC/Trilha/MO/F5-C3 intocados | **PASS** |
| Sem novo store / sem nova memória | **PASS** |
| Build app OK | **PASS** |
| Suíte validação completa | **92/92 PASS · 0 FAIL** |

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | REQ-089 v1.0 Homologado (CA-089-1…9) |
| ARQ | ARQ-089 v1.0 Homologada (I1–I12) |
| VAL | VAL-089 APROVADO · HOMOLOGADO |
| Baseline | IMP-086 v1.0 Homologada (camada de consulta) |
| Fontes | HFC-087 (consumo); Trilha-088 (refs); MO (Art. 8º) |
| Capacidade | CAP-05 |
| Imp. | **IMPLEMENTADA · VALIDADA · HOMOLOGADA** v1.0 — Fatia 1 |
| Testes | **92/92 PASS**; build OK |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Plano Fatia 1 (delta F-TX/F-TR; F-MO intacto; sem código) | Autorização ABRIR REQ/ARQ/IMP | Em análise |
| 1.0 (impl.) | 11/09/2026 | Engenheiro (Cursor) | Implementação Fatia 1 + testes | Autorização IMPLEMENTAÇÃO | Implementada |
| 1.0 | 11/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação: VAL-089 92/92; build OK; 0 regressões; HFC/Trilha/MO preservados | Despacho FECHAMENTO E HOMOLOGAÇÃO | **IMPLEMENTADA · VALIDADA · HOMOLOGADA** |

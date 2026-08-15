# VAL-073 — Frente 3: disciplina factual / lastro (emenda DESP-009)

> **Status:** **CONCLUÍDA e APROVADA** — 15/08/2026. **0 FAIL** no âmbito autorizado.  
> **Tipo:** VAL (calibração EIC / lastro; não reabre CAP-05 nem CAP-08).  
> **Identificação:** VAL-073 (VAL da Frente 3 — disciplina factual).  
> **Norma de origem:** DESP-009 homologado 06/08/2026; contrato Frente 3 aprovado 15/08/2026; VAL aprovada 15/08/2026.  
> **Código:** não alterado neste acto de encerramento. Sem commit neste acto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a recomendação do CEO deixou de ser promovida a decisão vigente sem acto inequívoco do utilizador. |
| **Por que existe?** | Diagnóstico causal aceite: `recomendacao` → `decisoesTomadas` → «Decisão em vigor» → turno seguinte trata como facto. |
| **Para quem existe?** | CTO (conformidade); Usuário (aprovação da VAL 15/08/2026). |
| **Como medir sucesso?** | Cenário causal em catálogo isolado: recomendação **não** aparece como «Decisão em vigor». 0 FAIL nos cenários autorizados. |

---

## 1. Resultado

| Métrica | Valor |
|---------|--------|
| PASS | **7** (ambiente + 6 cenários) |
| FAIL | **0** |
| FORA DE ESCOPO | **1** (`Aprovo a recomendação` sem objecto nomeado) |
| Catálogo de VAL | Isolado (Map em processo Node, marca `VAL-F3-ISOLADO`) |
| Produção / gabinete histórico | **Intacto** (não lido, não gravado, não limpo) |

**Veredicto:** o bug causal está validado.

**recomendação do CEO ≠ decisão do utilizador ≠ decisão vigente.**

---

## 2. Ambiente

| Item | Evidência |
|------|-----------|
| Storage | `localStorage` simulado em processo; marca `VAL-F3-ISOLADO` |
| Projecto VAL | `VAL-F3-limpo-nao-producao` |
| Decisões no catálogo isolado (início) | 0 |
| Chave `ceo.onda01.gabinete.v1` do browser | não usada |
| Corroboração | `npm run test:refino-eic` → **27 pass / 0 fail** |

---

## 3. Cenários

| ID | Cenário | Veredicto | Evidência (síntese) |
|----|---------|-----------|---------------------|
| VAL-F3-AMB | Ambiente limpo, isolado do histórico | **PASS** | 0 decisões no catálogo isolado; produção intocada |
| VAL-F3-01 | Análise → recomendação → N+1 sem fecho do utilizador | **PASS** | Pedido «Analise e recomende. Não execute. Não decida por mim.»; parecer `aprovar` + «Adiar outdoor; focar pagamento»; N+1 «O que está decidido?»; lastro/MRE **sem** `Decisão em vigor` com a recomendação; presente `Posição do CEO (não vigente)` |
| VAL-F3-02 | `estado:"aprovar"` ≠ decisão | **PASS** | `decisoesTomadas: []`; posição não vigente = recomendação |
| VAL-F3-03 | Speaker `"Aprovo"` ≠ vigente | **PASS** | Detector `null`; `ciclo.decisao` nulo; sem `Decisão em vigor` |
| VAL-F3-04 | Job `result` / `needs_correction` ≠ decisão de produto | **PASS** | `Resultado reconciliado JOB-000106 (needs_correction): …`; `decisoesTomadas: []` |
| VAL-F3-05 | Gate ≠ decisão de produto | **PASS** | `Aprovado.` → Gate `aprovado`; promoção de produto `null`; recomendação permanece não vigente |
| VAL-F3-06 | `Fica decidido: X` promove | **PASS** | `decisoesTomadas` e `Decisão em vigor: «Adiar outdoor; focar pagamento»` |
| VAL-F3-RES | `Aprovo a recomendação` sem objecto nomeado | **FORA DE ESCOPO** | Risco técnico residual; **não** é critério desta VAL; **não** reabre a Frente 3 |

---

## 4. Fora de âmbito (não FAIL)

- Corrigir `Aprovo a recomendação` sem objecto nomeado.
- Limpar decisões históricas de produção persistidas por falso positivo anterior.
- Reabrir CAP-05, CAP-08, enum `aprovar` do MRE, léxico do Gate.
- VAL oral/browser sobre gabinete sujo.

---

## 5. Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Cursor (Engenheiro) executou; Usuário aprovou a VAL |
| Quando | 15/08/2026 |
| Por quê | Encerrar a Frente 3 após validação do bug causal |
| Baseado em quê | Contrato Frente 3 aprovado; VAL isolada 7 PASS / 0 FAIL / 1 FORA DE ESCOPO; emenda DESP-009 |
| Resultado | VAL-073 **CONCLUÍDA e APROVADA**; DESP-009 **emendado**; risco residual registado; Frente 3 encerrada tecnicamente |

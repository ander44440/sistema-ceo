# VAL-IMP-071-B2 — Validação exclusiva do Bloco B2 (REQ-077 · REQ-078)

> **Status:** Homologada — 07/08/2026 (CTO).  
> **IMP:** IMP-071-B2 · REQ-077 · REQ-078 · **ENCERRADO / HOMOLOGADO**.  
> **Nota:** REQ-077 e REQ-078 **congelados** durante a IMP-071; implementação inalterada salvo regressão comprovada.  
> **Escopo:** exercício da competência de fecho no perímetro + recusa fora dos limites.  
> **Excluído:** encerramento (B3), soberania/ortogonalidade (B4), rastreabilidade/distinções R10 (B5).

---

## 1. Escopo validado

| Incluído | Excluído |
|----------|----------|
| Fecho no perímetro sem novo acto (REQ-077) | Encerramento da delegação (REQ-079) |
| Titular da missão permanece Usuário pós-fecho | Retorno automático (REQ-080) |
| Checklist dos 4 tipos de fecho (CA-077-3) | Prevalência soberana / ortogonalidade (REQ-081/082) |
| Sem estado activo ⇒ sem fecho autónomo | Rastreabilidade MO completa (REQ-083) |
| Fora do perímetro ⇒ devolução fundamentada | Distinções R10 completas (REQ-084 / B5) |
| Reservas constitucionais / redelegação / não ampliação | Novos estados arquitecturais |

---

## 2. Entregáveis

| Artefacto | Papel |
|-----------|--------|
| `app/src/autoridadeDelegada/autoridadeDelegada.js` | `avaliarPedidoFecho` · `exercerFechoDelegado` · `tentarAmpliarPerimetro` |
| `app/src/autoridadeDelegada/autoridadeDelegada.test.js` | CA-077-1…4 · CA-078-1…4 (+ regressão B1) |
| Este VAL | Evidência B2 |

---

## 3. Matriz CA

| CA | Resultado | Evidência |
|----|-----------|-----------|
| CA-077-1 | **PASS** | Fecho no perímetro com estado activo, sem novo acto |
| CA-077-2 | **PASS** | `titularMissao` = `usuario` após fecho |
| CA-077-3 | **PASS** | Só `priorizar` / `escolher_entre_alternativas` / `determinar_proximo_gesto` / `declarar_decisao` |
| CA-077-4 | **PASS** | Estado inactivo → `estado_inactivo` |
| CA-078-1 | **PASS** | Fora do perímetro → `devolver_ao_usuario` + fundamentação |
| CA-078-2 | **PASS** | CON-001 / CAP / ROADMAP / aval directo recusados |
| CA-078-3 | **PASS** | `redelegarPara` → `redelegacao_vedada` |
| CA-078-4 | **PASS** | `tentarAmpliarPerimetro` não altera perímetro |

---

## 4. Suite executada

```text
node --test src/autoridadeDelegada/*.test.js
→ 18/18 pass (07/08/2026) — inclui regressão B1 (9) + B2 (9)
```

---

## 5. Observações

- Fecho **não** encerra a delegação (encerramento é B3).
- Sem novos estados: inventário continua só `autoridade_delegada_activa`.
- ARQ-032, CAP-01, CTO-003 e CAP-04 **não** alterados.
- EE: sem alteração adicional além do hook B1 já homologado.
- B2 **encerrado**; REQ-077 / REQ-078 **congelados** durante a IMP-071.

---

## 6. Homologação

| Campo | Valor |
|-------|--------|
| Resultado técnico Engenheiro | **PASS** (8/8 CAs + suite) |
| Homologação CTO | **HOMOLOGADA** — 07/08/2026 |
| Decisão | Encerrar B2; congelar REQ-077/078; autorizar B3 |

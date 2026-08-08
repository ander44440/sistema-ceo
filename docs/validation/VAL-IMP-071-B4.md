# VAL-IMP-071-B4 — Validação exclusiva do Bloco B4 (REQ-081 · REQ-082)

> **Status:** Homologada — 07/08/2026 (CTO).  
> **IMP:** IMP-071-B4 · REQ-081 · REQ-082 · **ENCERRADO / HOMOLOGADO**.  
> **Nota:** REQ-081 e REQ-082 **congelados** durante a IMP-071; implementação inalterada salvo regressão comprovada.  
> **Escopo:** prevalência soberana do Usuário + ortogonalidade aos modos Deliberar/Executar/Recuperar.  
> **Excluído:** rastreabilidade MO (B5) · distinções R10 (B5) · fecho IMP (B6).

---

## 1. Escopo validado

| Incluído | Excluído |
|----------|----------|
| Prevalência do acto do Usuário sobre fecho delegado | Rastreabilidade de fecho (REQ-083) |
| Revogação imediata soberana | Distinção delegação vs autorização/despacho (REQ-084) |
| Fecho directo do Usuário com AD activa | Novos estados arquitecturais |
| AD ≠ quarto modo; posturas distintas | Ampliação de mandato / ciclo de vida |
| Sem AD ⇒ nenhum modo confere fecho autónomo | Alteração CTO-003 |
| Contrato de escopo CTO-003 intocado | — |

---

## 2. Entregáveis

| Artefacto | Papel |
|-----------|--------|
| `autoridadeDelegada.js` | `resolverConflitoSoberano` · `fecharDirectamentePeloUsuario` · `revogarDelegacaoImediatamente` · posturas A8 |
| `autoridadeDelegada.test.js` | CA-081-1…4 · CA-082-1…4 (+ regressão B1–B3) |
| Este VAL | Evidência B4 |

---

## 3. Matriz CA

| CA | Resultado | Evidência |
|----|-----------|-----------|
| CA-081-1 | **PASS** | Conflito → prevalece Usuário; fecho delegado anulado |
| CA-081-2 | **PASS** | `revogarDelegacaoImediatamente` → efeito imediato |
| CA-081-3 | **PASS** | Fecho directo com AD activa; ciclo intacto |
| CA-081-4 | **PASS** | `oposicaoCeo: false`; sem fecho autónomo pós-acto |
| CA-082-1 | **PASS** | Só deliberar/executar/recuperar; AD ≠ modo |
| CA-082-2 | **PASS** | Três posturas distintas com AD activa |
| CA-082-3 | **PASS** | Sem AD: fecho autónomo ausente em qualquer modo |
| CA-082-4 | **PASS** | `escopoCto003Intocado()` — sem alteração CTO-003 |

---

## 4. Suite executada

```text
node --test src/autoridadeDelegada/*.test.js
→ 36/36 pass (07/08/2026) — B1–B3 (27) + B4 (9)
```

---

## 5. Observações

- Ciclo de vida da delegação **não** redesenhado: revogação reutiliza E1; fecho directo não encerra salvo `contradizer`/`revogarApos`.
- Perímetro e titularidade intactos.
- ARQ-032 / CAP-01 / CTO-003 / CAP-04 **não** alterados.
- B4 **encerrado**; REQ-081 / REQ-082 **congelados** durante a IMP-071.

---

## 6. Homologação

| Campo | Valor |
|-------|--------|
| Resultado técnico Engenheiro | **PASS** (8/8 CAs + suite) |
| Homologação CTO | **HOMOLOGADA** — 07/08/2026 |
| Decisão | Encerrar B4; congelar REQ-081/082; autorizar B5 |

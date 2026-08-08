# VAL-IMP-071-B5 — Validação exclusiva do Bloco B5 (REQ-083 · REQ-084)

> **Status:** Homologada — 07/08/2026 (CTO).  
> **IMP:** IMP-071-B5 · REQ-083 · REQ-084 · **ENCERRADO / HOMOLOGADO**.  
> **Nota:** REQ-083 e REQ-084 **congelados** durante a IMP-071; implementação inalterada salvo regressão comprovada.  
> **Escopo:** rastreabilidade MO (Art. 8º) + distinções formais entre conceitos operacionais.  
> **Excluído:** consolidação / VAL integrada / fecho IMP (B6).

---

## 1. Escopo validado

| Incluído | Excluído |
|----------|----------|
| MO em activação, fecho e encerramento | Redesign CAP-05 / armazenamento persistente |
| Seis elementos CON-001 Art. 8º no fecho | Novos estados arquitecturais |
| Marcação sob AD + quemDelegou + perímetro | Ampliação de mandato |
| Distinção Gate / fila / AD / soberania permanente | Alteração do ciclo de vida |
| Matriz de efeitos distintos (CA-084-4) | Alteração CTO-003 / Gate / Motor |

---

## 2. Entregáveis

| Artefacto | Papel |
|-----------|--------|
| `autoridadeDelegada.js` | Ledger MO · `fechoImportanteConformeMo` · `CONCEPTOS_OPERACIONAIS` · matriz de distinções |
| `autoridadeDelegada.test.js` | CA-083-1…4 · CA-084-1…4 (+ regressão B1–B4) |
| Este VAL | Evidência B5 |

---

## 3. Matriz CA

| CA | Resultado | Evidência |
|----|-----------|-----------|
| CA-083-1 | **PASS** | Art. 8º: quem/quando/oQue/porque/baseadoEmQue/resultado |
| CA-083-2 | **PASS** | `sobAutoridadeDelegada: true` no fecho |
| CA-083-3 | **PASS** | `quemDelegou` + `perimetro` |
| CA-083-4 | **PASS** | Fecho órfão sem MO → não conforme |
| CA-084-1 | **PASS** | «Aprovado»/Gate não activa AD |
| CA-084-2 | **PASS** | Despacho fila sem mandato de fecho |
| CA-084-3 | **PASS** | Gate+AD simultâneos: efeitos separados |
| CA-084-4 | **PASS** | Matriz (a)(b)(c) com efeitos distintos |

---

## 4. Suite executada

```text
node --test src/autoridadeDelegada/*.test.js
→ 46/46 pass (07/08/2026) — B1–B4 (36) + B5 (10)
```

---

## 5. Observações

- Ledger MO é auditoria operacional — **não** estado ARQ-032.
- Distinções classificam sem fundir efeitos nem alterar Gate/CTO-003.
- Ciclo de vida e inventário de estados intactos.
- B5 **encerrado**; REQ-083 / REQ-084 **congelados** durante a IMP-071.

---

## 6. Homologação

| Campo | Valor |
|-------|--------|
| Resultado técnico Engenheiro | **PASS** (8/8 CAs + suite) |
| Homologação CTO | **HOMOLOGADA** — 07/08/2026 |
| Decisão | Encerrar B5; congelar REQ-083/084; autorizar B6 |

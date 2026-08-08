# VAL-IMP-071-B3 — Validação exclusiva do Bloco B3 (REQ-079 · REQ-080)

> **Status:** Homologada — 07/08/2026 (CTO).  
> **IMP:** IMP-071-B3 · REQ-079 · REQ-080 · **ENCERRADO / HOMOLOGADO**.  
> **Nota:** REQ-079 e REQ-080 **congelados** durante a IMP-071; implementação inalterada salvo regressão comprovada.  
> **Escopo:** encerramento por critérios E1–E6 + retorno automático da competência ao Usuário.  
> **Excluído:** prevalência soberana / ortogonalidade (B4), rastreabilidade/distinções (B5).

---

## 1. Escopo validado

| Incluído | Excluído |
|----------|----------|
| Encerramento E1–E6 verificável (REQ-079) | Prevalência soberana durante mandato (REQ-081) |
| Retorno automático sem pedido de devolução (REQ-080) | Ortogonalidade Deliberar/Executar/Recuperar (REQ-082) |
| Sem alçada residual pós-termo | Rastreabilidade MO (REQ-083) |
| Sem estados órfãos | Distinções R10 (REQ-084) |
| Titularidade contínua do Usuário | Novos estados arquitecturais |

---

## 2. Entregáveis

| Artefacto | Papel |
|-----------|--------|
| `autoridadeDelegada.js` | `encerrarAutoridadeDelegada` · E1–E6 · `processarCandidaturaEncerramento` · `processarMensagemAutoridadeDelegada` |
| `autoridadeDelegada.test.js` | CA-079-1…4 · CA-080-1…4 (+ regressão B1/B2) |
| Hook EE | `processarMensagemAutoridadeDelegada` (substitui só candidatura B1) |
| Este VAL | Evidência B3 |

---

## 3. Matriz CA

| CA | Resultado | Evidência |
|----|-----------|-----------|
| CA-079-1 | **PASS** | Revogação explícita → estado inactivo |
| CA-079-2 | **PASS** | Exaurimento + expiração → inactivo |
| CA-079-3 | **PASS** | Perda de âmbito + acto soberano → inactivo |
| CA-079-4 | **PASS** | Pós-termo: fecho autónomo ausente |
| CA-080-1 | **PASS** | Inactivo + `pedidoDevolucaoExigido: false` |
| CA-080-2 | **PASS** | Zero alçada residual |
| CA-080-3 | **PASS** | `confirmacaoCeoExigida: false` |
| CA-080-4 | **PASS** | `titularMissao` = Usuário antes/durante/após |

---

## 4. Suite executada

```text
node --test src/autoridadeDelegada/*.test.js
→ 27/27 pass (07/08/2026) — B1 (9) + B2 (9) + B3 (9)
```

---

## 5. Observações

- `ultimoEncerramento` é auditoria verificável — **não** estado arquitectural novo.
- Inventário continua só `autoridade_delegada_activa`.
- Perímetro não é alterado em vida; no termo o estado activo limpa-se (sem órfão).
- ARQ-032 / CAP-01 / CTO-003 / CAP-04 intactos.
- B3 **encerrado**; REQ-079 / REQ-080 **congelados** durante a IMP-071.

---

## 6. Homologação

| Campo | Valor |
|-------|--------|
| Resultado técnico Engenheiro | **PASS** (8/8 CAs + suite) |
| Homologação CTO | **HOMOLOGADA** — 07/08/2026 |
| Decisão | Encerrar B3; congelar REQ-079/080; autorizar B4 |

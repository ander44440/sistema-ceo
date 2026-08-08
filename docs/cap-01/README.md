# CAP-01 — Governança (Autoridade Delegada)

> **Status: Homologada e concluída — Baseline oficial do Sistema CEO (Despacho CTO, 07/08/2026).**  
> **Marco arquitectural:** A Autoridade Delegada integra **oficialmente** a arquitectura operacional do Sistema CEO.  
> **Ciclo CAP-01 (Autoridade Delegada):** **ENCERRADO integralmente**.  
> Rastreabilidade: **ARQ-032** → CAP-01 → **REQ-075…084** → **IMP-071** → **VAL-IMP-071** → Homologação → **Baseline**.  
> Sede deste README. Runtime: `app/src/autoridadeDelegada/`.  
> **Congelado:** ARQ-032 · CAP-01 · REQ-075…084 · IMP-071.  
> **Modo sistema:** Maturidade por Evidências **ACTIVO** — sem novas frentes até evidência consistente de uso real.  
> Relatório: [`relatorio-encerramento-cap-01-autoridade-delegada.md`](relatorio-encerramento-cap-01-autoridade-delegada.md).  
> Registo Baseline: [`../learning/2026-08-07-despacho-baseline-oficial-maturidade.md`](../learning/2026-08-07-despacho-baseline-oficial-maturidade.md).

---

## Cadeia oficial

| Elo | Artefacto | Estado |
|-----|-----------|--------|
| ARQ | [`ARQ-032`](../architecture/ARQ-032-autoridade-delegada.md) | Homologada · **congelada** |
| CAP | este ciclo Autoridade Delegada | **Baseline** |
| REQs | REQ-075…084 | Aprovados · **congelados** |
| IMP | [`IMP-071`](../implementation/IMP-071-autoridade-delegada.md) | **HOMOLOGADA / ENCERRADA** |
| VAL | [`VAL-IMP-071`](../validation/VAL-IMP-071.md) | **Homologada** |
| Blocos | VAL-B1…B5 | Homologados |

---

## Componentes (baseline runtime)

| Bloco | REQ | Função |
|-------|-----|--------|
| B1 Acto + estado | REQ-075/076 | Validação explícita · `autoridade_delegada_activa` |
| B2 Fecho | REQ-077/078 | Exercício no perímetro · recusa fora |
| B3 Termo | REQ-079/080 | Encerramento E1–E6 · retorno automático |
| B4 Soberania | REQ-081/082 | Prevalência Usuário · ortogonalidade aos modos |
| B5 MO + distinções | REQ-083/084 | Rastreabilidade Art. 8º · conceitos distintos |
| B6 Fecho | conjunto | `imp071.integracao.test.js` |

Hook EE mínimo: `processarMensagemAutoridadeDelegada` (sem alterar CTO-003).

---

## Evidências

| Acto | Documento |
|------|-----------|
| Abertura ciclo | [`CAP-01-abertura-ciclo-autoridade-delegada.md`](CAP-01-abertura-ciclo-autoridade-delegada.md) |
| Responsabilidades | [`CAP-01-autoridade-delegada-responsabilidades.md`](CAP-01-autoridade-delegada-responsabilidades.md) |
| Pacote REQs | [`CAP-01-pacote-reqs-autoridade-delegada.md`](CAP-01-pacote-reqs-autoridade-delegada.md) |
| Fecho IMP | [`../implementation/evidencias/IMP-071-fecho-b6.md`](../implementation/evidencias/IMP-071-fecho-b6.md) |
| VAL integrada | [`../validation/VAL-IMP-071.md`](../validation/VAL-IMP-071.md) |
| Encerramento | [`relatorio-encerramento-cap-01-autoridade-delegada.md`](relatorio-encerramento-cap-01-autoridade-delegada.md) |
| MO | [`../learning/2026-08-07-encerramento-imp-071-baseline-cap-01.md`](../learning/2026-08-07-encerramento-imp-071-baseline-cap-01.md) |

---

## Verificação (baseline)

```powershell
node --test "app/src/autoridadeDelegada/*.test.js" "app/src/autoridadeDelegada/imp071.integracao.test.js"
```

Resultado de referência (07/08/2026): **48/48 pass** · **40/40 CAs**.

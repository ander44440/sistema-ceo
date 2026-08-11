# CTO-003 — Homologação Prática (Persistência do Estado Operacional)

> **Status:** **APROVADO / HOMOLOGADO** — 06/08/2026.  
> **Promoção:** CTO-003 incorpora oficialmente a **Baseline** do Sistema CEO.  
> **Frente:** **ENCERRADA** (despacho CTO de reconhecimento).  
> **Despacho:** Homologação prática autorizada → reconhecida → Baseline.  
> **Suite:** `app/src/conversacaoNatural/cto003.homologacao.test.js` — **7/7**.  
> **Canónico:** `2026-08-06-cto-003-persistencia-estado-operacional.md`.

---

## 1. Critério de aprovação (CTO) — reconhecido

Durante qualquer operação aberta, o CEO **não** pode:

| Proibição | Resultado |
|-----------|-----------|
| Regressar a DELIBERAR | **OK** |
| Perguntar novamente o objectivo | **OK** |
| Reclassificar a missão | **OK** |
| Criar novos objectivos | **OK** |
| Perder o Job activo | **OK** |

Critérios adicionais reconhecidos pelo CTO: preservação da missão; preservação da execução; prioridade do Estado Operacional sobre o classificador.

---

## 2. Cenários obrigatórios

| ID | Cenário | Resultado |
|----|---------|-----------|
| HOM-CTO-003.1 | Job running → «reenviar» | **APROVADO** |
| HOM-CTO-003.2 | Job falhado → «forçar» | **APROVADO** (→ Motor / recuperação) |
| HOM-CTO-003.3 | Dispatcher indisponível | **APROVADO** |
| HOM-CTO-003.4 | Agent em erro | **APROVADO** (modo RECUPERAR) |
| HOM-CTO-003.5 | Reinício do backend com operação aberta | **APROVADO** (lastro/fila persiste modo) |
| HOM-CTO-003.6 | Sequência extensa de comandos operacionais | **APROVADO** (8 comandos) |
| (controlo) | Sem operação → DELIBERAR permitido | **OK** |

**Execução:** `node --test src/conversacaoNatural/cto003.homologacao.test.js` — pass 7/7 (06/08/2026).

---

## 3. Evidência de comportamento

1. Com Job running, «reenviar» mantém modo operacional; prosa sem «mudámos de prioridade?».  
2. Com Job falhado, «forçar» em clarificação redirecciona a Motor (`recuperacaoOperacional: true`, preservacao `CTO-003`).  
3. Dispatcher em erro + Job pending → operação aberta; «estado» não delibera.  
4. Agent em erro → `requerRecuperacao`; preservação de missão forçada.  
5. Pós-«restart» (histórico vazio + lastro com pending) → continua EXECUTAR.  
6. Sequência `estado → reenviar → forçar → tentar → continuar → ha jobs → pausar → cancelar` sem regressão a DELIBERAR.

---

## 4. Decisão arquitectural (CTO)

| Campo | Valor |
|-------|--------|
| Quem | CTO |
| Quando | 06/08/2026 |
| Decisão | CTO-003 integra oficialmente a Baseline; frente **ENCERRADA** |
| Congelamento | Sem refinamentos adicionais nesta frente sem novas evidências de uso real |
| Base | Homologação prática 7/7 + critérios de aprovação atendidos |

---

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 1.0 | 06/08/2026 | Engenheiro | Suite HOM + promoção Baseline |
| 1.1 | 06/08/2026 | CTO | Reconhecimento oficial; ENCERRADA |

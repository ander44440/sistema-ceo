# CTO-003 — Validação Prática Pós-Reinício (Invariante Pré-Classificador)

> **Status:** **APROVADO** — 06/08/2026.  
> **Substitui:** versão anterior do CTO-003 (só camada conversacional pós-classificador).  
> **Referência oficial Baseline:** esta implementação (interceptação pré-classificador).  
> **Suite:** `app/src/conversacaoNatural/cto003.validacao-pratica.test.js` — **2/2**.  
> **Backend:** reiniciado antes da validação (Vite app + API).

---

## 1. Invariante arquitectural (CTO)

A Interceptação Operacional permanece **imediatamente após o Continuidade Gate** e **antes** de:

- VCA  
- CSC (tópicos / objectivos / referentes no fluxo principal)  
- Classificador de intenção  
- Interpretação conversacional deliberativa  

Esta posição é **invariante** — não pode ser deslocada sem despacho CTO e novas evidências.

---

## 2. Critério de aprovação

Com operação aberta, os comandos:

| Comando | Interceptação CTO-003 | Classificador evitado | Sem prosa deliberativa |
|---------|----------------------|----------------------|------------------------|
| REPITA | ✓ | ✓ | ✓ |
| REENVIAR | ✓ | ✓ | ✓ |
| FORÇAR | ✓ | ✓ | ✓ |
| ESTADO | ✓ | ✓ | ✓ |
| CANCELAR | ✓ | ✓ | ✓ |
| PAUSAR | ✓ | ✓ | ✓ |

Encaminhamento: **Motor Operacional** (`modo: interceptacao_operacional`, `classificacaoEvitada: true`).

Proibido: «Entendi…», «Mudámos de prioridade?», clarificações de objectivo/referente.

---

## 3. Resultado

| Item | Estado |
|------|--------|
| Invariante de posição no EE | **OK** |
| Seis comandos → Motor sem classificador | **OK** |
| Reinício backend | **OK** (API :8787; app Vite) |
| Decisão | **Substitui definitivamente** a versão anterior na Baseline |

**Execução:** `node --test src/conversacaoNatural/cto003.validacao-pratica.test.js` — pass 2/2.

---

## 4. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (critério + invariante); Engenheiro (validação + promoção) |
| Quando | 06/08/2026 |
| O quê | Validação prática + promoção da interceptação pré-classificador à Baseline |
| Resultado | **Aprovado** — referência oficial CTO-003 |

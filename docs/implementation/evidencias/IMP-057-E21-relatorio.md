# IMP-057 Emenda E2.1 — Relatório para homologação

**Data:** 01/08/2026  
**Emenda:** E2.1 — Priorização de Intenções Executivas  
**Normas:** ARQ-018 / REQ-057 / Motor — **não alterados**  
**Commit:** *não realizado* (pedido explícito)

---

## 1. Objectivo cumprido

Imperativo dirigido ao CEO + acção executável → **C3 obrigatório**, independentemente da frente activa. Deliberativos/interrogativos permanecem C2.

---

## 2. Entregáveis

| Item | Local |
|------|--------|
| Regra `ehIntencaoExecutivaE21` / `ehPerguntaDeliberativa` | `app/src/classificadorIntencao/regras.js` |
| Lexicon C3/C2 alargado | `app/src/classificadorIntencao/lexicon.js` |
| Testes CA-E2.1-1…3 + demos | `app/src/classificadorIntencao/e21.test.js` |
| Script | `npm run test:classificador:e21` |

---

## 3. Critérios de aceite

| ID | Resultado |
|----|-----------|
| CA-E2.1-1 | OK — 12 exemplos C3 → `trabalho_executivo` / `motor_execucao` |
| CA-E2.1-2 | OK — `frenteActiva: true` não rebaixa |
| CA-E2.1-3 | OK — 4 exemplos C2 permanecem `conversa_projeto` |

---

## 4. Suite

```text
npm run test:classificador     → 52/52 pass
npm run test:classificador:e21 →  4/4 pass
```

---

## 5. Demo Núcleo (obrigatória)

| Entrada | Classe | Destino | Efeito | Anti-Sugiro |
|---------|--------|---------|--------|-------------|
| Resolva os bugs do projeto. | C3 | `motor_execucao` | Gate G2 | OK |
| Acione o CTO para fazer um diagnóstico. | C3 | `motor_execucao` | Job `pending` + handoff | OK |
| Implemente esta funcionalidade. | C3 | `motor_execucao` | Job `pending` + handoff | OK |

---

## 6. Pedido de Gate

Homologar a **implementação da Emenda E2.1**. Commit/push/deploy só sob ordem explícita.

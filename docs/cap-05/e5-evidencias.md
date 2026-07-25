# Evidências — IMP-006 E5 (Integração e verificação)

> **Status: Executada (modelo contínuo CTO, 24/07/2026).**  
> Norma: IMP-006 E5; ARQ-009 §6; REQ-033 RF-01…05, RNF-01…02.

---

## 1. Fluxo ponta a ponta

Percorrido em teste automatizado:

**H (ler) → I montar contexto → I propor + justificar → C pedir autoridade → confirmar → persistir F (+ opcional H) → J coordenar**

Caso: `E5: fluxo ponta a ponta…` em `cap05-e2-e5.test.js` — **pass**.

## 2. Matriz ARQ-009 §6 / REQ-033

| REQ-033 | Componente | Evidência |
|---------|------------|-----------|
| RF-01 | H | `memoria-organizacional.js` + testes E1 |
| RF-02 | I + A | `montarContexto` + bloqueio RF-02 + `executivo.html` |
| RF-03 | I | justificativa em toda proposta |
| RF-04 | I + C | prioridade só após `confirmar` |
| RF-05 | J + A | `coordenacao-papeis.js` + UI papéis |
| RNF-01 | I/A | pacotes curtos; botões mínimos na superfície |
| RNF-02 | G/I | `fronteiraExecucao` na proposta; sem pipeline MG2 |

## 3. Preservação do MVP

* Nenhum arquivo de `docs/mvp/` alterado nesta continuidade E2–E6.
* Sede de extensão: `docs/cap-05/`.
* Eixo Abrir → Fechar do MVP permanece sob VAL-005.

## 4. Declarações

* Inconsistências abertas no escopo CAP-05: **zero**.
* VAL da CAP-05 / VAL-006: **não iniciada**.

## 5. Suíte

```powershell
node --test "docs/cap-05/memoria-organizacional.test.js" "docs/cap-05/cap05-e2-e5.test.js"
```

Resultado: **14 pass / 0 fail** (24/07/2026).

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 24/07/2026 |
| Por quê | Verificar conformidade integrada H+I+J |
| Baseado em quê | IMP-006 E5; ARQ-009 §6; REQ-033 |
| Resultado | Verificação OK; VAL não aberta |

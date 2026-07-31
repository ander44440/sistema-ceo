# Evidência — IMP-020 Bloco B4 (NCS: C7, C8)

> **Data:** 30/07/2026  
> **Status:** B4 implementado — gate interno cumprido.  
> Norma: IMP-020; IMP-020-blocos §B4; ARQ-014; REQ-052.  
> Depende de: B1–B3 (C1–C6).

---

## 1. Componentes

| ID | Componente | Sede |
|----|------------|------|
| C7 | Registo NCS em metadados do parecer | `app/src/mre/ncs/metadadosParecer.js` |
| C8 | Flag de ativação NCS (`flagNcs`) | `app/src/mre/ncs/flagNcs.js` |

**Integração:** `executarDeliberacao.js` (gate limiar + mescla metadados); `ncs/portador.js` (classificação só com flag on); exports em `ncs/index.js` e `mre/index.js`.

**Não alterado:** Speaker; topologia pipeline 0–8; políticas C6; validador V1–V6; conteúdo deliberativo do parecer (decisão/ação/riscos/…).

---

## 2. Critérios B4 ↔ evidência

| # | Critério | Evidência |
|---|----------|-----------|
| 1 | Flag on → metadados `naturezaCognitiva` + `fundamentoNatureza` | TN-09 |
| 2 | Speaker só consome parecer (sem canal NCS paralelo) | TN-10 |
| 3 | Aprendizado não muta decisão/ação/NCS | TN-11 |
| 4 | Flag off (default) = baseline (sem classificar; sem metadados NCS) | TN-12; TR-01 |
| 5 | Rollback off→on→off restaura baseline | teste Rollback; §3 abaixo |
| 6 | V1–V6 intactos; parecer sem NCS válido | TR-03; T11-* |
| 7 | Topologia 0–8 inalterada | TB3-topo + T12-* verdes |
| 8 | Ausência de NCS não falha | TN-12; harness com `pacoteNcs` null |

---

## 3. Procedimento de rollback (`flagNcs`)

**Princípio:** rollback desliga o limiar NCS; **não** remove código. Independente de `flagMre`.

### 3.1 Desligar (restaurar baseline)

1. Em `app/src/mre/ncs/flagNcs.js`, garantir `flagNcs.ativo = false` (default).  
   Alternativa em runtime de ensaio: `desligarNcs()` ou `deps.flagNcs = false`.
2. Confirmar: novas corridas **não** classificam automaticamente e **não** gravam chaves NCS em `parecer.metadados`.
3. Harness pode continuar a injetar `pacoteNcs` para testes de políticas (C5/C6); metadados NCS só com flag on.

### 3.2 Religar (só sob mandato / ensaio)

1. `ligarNcs()` ou `flagNcs.ativo = true` (ou `deps.flagNcs: true` no harness).  
2. **Produção NCS** exige Gate explícito do Patrocinador — B4 **não** declara produção.

### 3.3 Verificação

```text
off → sem pacote automático; metadados NCS ausentes
on  → classifica; metadados NCS presentes
off → baseline restaurada
```

Ensaiado no teste `Rollback: off → on → off restaura baseline observável`.

---

## 4. Resultado dos testes

```text
npm run test:mre:ncs:b4  → 11 pass / 0 fail
npm run test:mre:ncs     → 37 pass / 0 fail  (B1+B2+B3+B4)
npm run test:mre         → 96 pass / 0 fail  (85 pré-B4 + 11 B4)
```

---

## 5. Gate B4

**Cumprido.** IMP-020 C1–C8 materializados.  
**Produção NCS não declarada** — default `flagNcs.ativo = false` até Gate externo de ativação.

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Engenheiro (Cursor) | Entrega B4 C7+C8 + testes TN-09…12 + rollback |

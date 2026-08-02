# IMP-057 Emenda E2.2 — Relatório de homologação

> **Data:** 01/08/2026  
> **Emenda:** E2.2 — Cobertura de Classificação  
> **Status:** Implementada — **aguarda Gate** do patrocinador  
> **Norma:** IMP-057 § Emenda E2.2; REQ-057; ARQ-018 (**não alteradas**)  
> **Commit:** **não realizado** (proibido até autorização)

---

## 1. Objectivo cumprido

Aumentar a cobertura do Classificador para eliminar clarificações indevidas em:

* **C1** — conhecimento geral (receitas, culinária, história, ciência, matemática, programação, tecnologia, pessoas, lugares, definições, explicações).  
* **C2** — conversa de projecto com padrões deliberativos + contexto de projecto.

## 2. Preservações (confirmadas)

| Frente | Resultado |
|--------|-----------|
| Emenda E2.1 (imperativo → C3) | Intacta — CA-E2.1 + CA-E2.2-4 verdes |
| Continuidade do Gate | Sem alteração |
| Motor de Execução | Sem alteração de contrato |
| Consciência Operacional (IMP-059) | Sem alteração |
| ARQ / REQ | Sem alteração |

## 3. Ficheiros tocados (código)

| Ficheiro | Alteração |
|----------|-----------|
| `app/src/classificadorIntencao/lexicon.js` | Lexico C1 (domínios) + padrões C2 E2.2; `explique` estreito a deixis de projecto |
| `app/src/classificadorIntencao/regras.js` | `ehConhecimentoGeralE22`, `ehDeliberacaoProjetoE22`, `temContextoProjetoE22`; early-return após E2.1; fix `\b` após `é` |
| `app/src/classificadorIntencao/index.js` | Exports dos helpers E2.2 |
| `app/src/classificadorIntencao/e22.test.js` | CA-E2.2-1…4 + demo obrigatória |
| `app/package.json` | `test:classificador:e22`; suite inclui `e22.test.js` |

## 4. Critérios de aceite

| ID | Critério | Resultado |
|----|----------|-----------|
| CA-E2.2-1 | Exemplos C1 → `conhecimento_geral` / `resposta_leve`, sem Clarificação | **PASS** |
| CA-E2.2-2 | Exemplos C2 → `conversa_projeto` / `nucleo_mre`, sem Clarificação | **PASS** |
| CA-E2.2-3 | Suite cobre exemplos C1/C2 + amostras de domínio | **PASS** |
| CA-E2.2-4 | E2.2 não rebaixa E2.1; explique de projecto permanece C2 | **PASS** |

## 5. Demos obrigatórios (saída da suite)

### C1 — conhecimento_geral (clarificacao: false, conf: 0.93)

| Mensagem | Classe | Destino |
|----------|--------|---------|
| Me dê uma receita de bolo de laranja. | conhecimento_geral | resposta_leve |
| Quem foi Albert Einstein? | conhecimento_geral | resposta_leve |
| O que é Docker? | conhecimento_geral | resposta_leve |
| Explique REST. | conhecimento_geral | resposta_leve |

### C2 — conversa_projeto (clarificacao: false, conf: 0.93)

| Mensagem | Classe | Destino |
|----------|--------|---------|
| Como devemos priorizar o MG2? | conversa_projeto | nucleo_mre |
| Você concorda com a arquitetura atual? | conversa_projeto | nucleo_mre |
| Quais capacidades ainda faltam para o CEO? | conversa_projeto | nucleo_mre |
| O que você acha da arquitetura do Motor? | conversa_projeto | nucleo_mre |

## 6. Suite automatizada

```text
npm run test:classificador:e22  →  5/5 pass
npm run test:classificador      → 57/57 pass  (inclui E2, E2.1, E2.2, E3–E7)
```

Nenhum dos exemplos obrigatórios gera Clarificação.

## 7. Nota técnica (fix E2.2)

Em JavaScript sem flag `u`, `\b` após `é` falhava (acento não é `\w`). Padrões `^o que é …` passaram a usar `\s+` em vez de `\b` após o acento — necessário para definições do tipo «O que é Docker?».

## 8. Pedido de Gate

Homologar a **implementação da Emenda E2.2** com base neste relatório e na suite verde.  
**Sem commit** até autorização explícita do patrocinador.

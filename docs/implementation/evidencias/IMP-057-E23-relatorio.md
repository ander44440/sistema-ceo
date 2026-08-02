# IMP-057 Emenda E2.3 — Relatório de homologação

> **Data:** 01/08/2026  
> **Emenda:** E2.3 — Autoexplicação Institucional do CEO  
> **Status:** Gate aprovado — encerramento (commit/push/deploy/prod)  
> **Norma:** IMP-057 § Emenda E2.3; REQ-057; ARQ-018 (**não alteradas**)  
> **Commit:** autorizado pelo patrocinador (01/08/2026)

---

## 1. Objectivo cumprido

Perguntas deliberativas/institucionais sobre o próprio CEO (papel, decisões, meta-política de Job vs resposta, diferença entre agentes, capacidades, fraquezas) classificam como **C2** (`conversa_projeto`) → destino `nucleo_mre`, sem Clarificação, sem Job e sem Gate.

## 2. Preservações (confirmadas)

| Frente | Resultado |
|--------|-----------|
| ARQ-018 / REQ-057 | Sem alteração |
| Motor de Execução | Sem alteração de contrato |
| Continuidade do Gate | Sem alteração |
| Consciência Operacional (IMP-059) | Sem alteração |
| Emenda E2.1 (imperativo → C3) | Intacta — «Crie um job…» permanece C3 |
| Emenda E2.2 / E5.1 | Suite regressão verde |

## 3. Ficheiros tocados (código)

| Ficheiro | Alteração |
|----------|-----------|
| `app/src/classificadorIntencao/regras.js` | `ehAutoexplicacaoInstitucionalE23`; early-return em `classificar` e `resolverEmpates` (após E2.1, antes de RF10/jobs) |
| `app/src/classificadorIntencao/lexicon.js` | Entradas LEXICO_C2 `e23_*` |
| `app/src/classificadorIntencao/index.js` | Export do helper E2.3 |
| `app/src/classificadorIntencao/e23.test.js` | CA-E2.3-1…10 + demo + anti-regressão E2.1 |
| `app/package.json` | `test:classificador:e23`; suite inclui `e23.test.js` |

## 4. Critérios de aceite

| ID | Critério | Resultado |
|----|----------|-----------|
| CA-E2.3-1 | «Qual é o seu papel?» → C2 | **PASS** |
| CA-E2.3-2 | «Como você toma decisões?» → C2 | **PASS** |
| CA-E2.3-3 | «Quando você decide criar um Job?» → C2 | **PASS** |
| CA-E2.3-4 | «Quando você prefere apenas responder?» → C2 | **PASS** |
| CA-E2.3-5 | «Qual a diferença entre você e o CTO?» → C2 | **PASS** |
| CA-E2.3-6 | «Qual capacidade você considera mais importante desenvolver agora?» → C2 | **PASS** |
| CA-E2.3-7 | «Qual é a maior fraqueza do CEO hoje?» → C2 | **PASS** |
| CA-E2.3-8 | Nenhum Job | **PASS** |
| CA-E2.3-9 | Nenhum Gate | **PASS** |
| CA-E2.3-10 | Nenhuma Clarificação | **PASS** |

## 5. Demos obrigatórios (saída da suite)

Todas: `classe: conversa_projeto`, `destino: nucleo_mre`, `clarificacao: false`, `conf: 0.93`.

| ID | Mensagem | Classe | Destino |
|----|----------|--------|---------|
| CA-E2.3-1 | Qual é o seu papel? | conversa_projeto | nucleo_mre |
| CA-E2.3-2 | Como você toma decisões? | conversa_projeto | nucleo_mre |
| CA-E2.3-3 | Quando você decide criar um Job? | conversa_projeto | nucleo_mre |
| CA-E2.3-4 | Quando você prefere apenas responder? | conversa_projeto | nucleo_mre |
| CA-E2.3-5 | Qual a diferença entre você e o CTO? | conversa_projeto | nucleo_mre |
| CA-E2.3-6 | Qual capacidade você considera mais importante desenvolver agora? | conversa_projeto | nucleo_mre |
| CA-E2.3-7 | Qual é a maior fraqueza do CEO hoje? | conversa_projeto | nucleo_mre |

Variante produção: «Qual é o seu papel dentro desta empresa?» → C2 (coberta em teste).

## 6. Suite automatizada

```text
npm run test:classificador:e23  →  6/6 pass
npm run test:classificador      → 72/72 pass  (inclui E2, E2.1, E2.2, E2.3, E3–E7, E5.1)
```

## 7. Nota técnica

**Problema raiz em produção:**

1. Perguntas institucionais sem lexicon → confiança 0,4 → Clarificação (frente activa + C2 restritivo).  
2. «Quando você decide criar um Job?» → RF10/`desambiguarJobs` interpretava «criar … job» como C3.

**Mitigação:** detector E2.3 com prioridade **após** E2.1 e **antes** de jobs/RF10; meta-perguntas com «quando você decide/prefere» + Job/resposta → C2; imperativos E2.1 continuam C3.

## 8. Gate

**Aprovado** pelo patrocinador (01/08/2026). Autorizado commit, push, deploy e homologação em produção.

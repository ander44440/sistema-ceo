# IMP-057 Emenda E5.1 — Relatório de homologação

> **Data:** 01/08/2026  
> **Emenda:** E5.1 — Executor do destino C1 (`resposta_leve`)  
> **Status:** Homologada em produção — ver `IMP-057-E51-homologacao-producao.md`  
> **Norma:** IMP-057 § Emenda E5.1; REQ-057; ARQ-018 (**não alteradas**)  
> **Commit:** **não realizado** (proibido até autorização)

---

## 1. Objectivo cumprido

Eliminar o stub de desenvolvimento em `executarDestinoC1` e produzir resposta natural de conhecimento geral via LLM quando o destino for `resposta_leve`.

## 2. Diagnóstico (produção)

Entradas C1 correctas chegavam a `resposta_leve`, mas o ramo `else` de `executarDestinoC1` devolvia:

`Sobre «…»: resposta imediata (C1). Que detalhe precisa?`

Causa: stub E5; não invocava gerador LLM.  
Nota: chamar `capacidadeIa` com `id: resposta_leve` cairia em MRE (`ehRotaDeliberativa`) — por isso o gerador C1 é **LLM directo**, não a rota deliberativa.

## 3. Preservações

| Frente | Resultado |
|--------|-----------|
| Classificador (regras/lexicon) | **Não alterado** |
| Motor / Continuidade / Consciência | **Não alterado** |
| ARQ-018 / REQ-057 | **Não alterado** |
| Locais C1 (saudação/data/hora/identidade) | Intactos |
| Emendas E2.1 / E2.2 | Intactas (suite regressão verde) |

## 4. Ficheiros tocados

| Ficheiro | Alteração |
|----------|-----------|
| `app/src/classificadorIntencao/respostaLeve.js` | **Novo** — gerador C1 (`gerarRespostaConhecimentoGeral`) |
| `app/src/classificadorIntencao/destinos.js` | `executarDestinoC1` usa gerador; `naturalizar` em todo C1 |
| `app/src/classificadorIntencao/e51.test.js` | **Novo** — CA-E5.1-1…10 + demo |
| `app/src/classificadorIntencao/index.js` | Exports E5.1 |
| `app/package.json` | `test:classificador:e51`; suite inclui `e51.test.js` |

## 5. Critérios de aceite

| ID | Critério | Resultado |
|----|----------|-----------|
| CA-E5.1-1 | Receita bolo de laranja → completa | **PASS** |
| CA-E5.1-2 | Albert Einstein → explicação completa | **PASS** |
| CA-E5.1-3 | Docker → explicação completa | **PASS** |
| CA-E5.1-4 | REST → explicação completa | **PASS** |
| CA-E5.1-5 | Como funciona HTTP → resposta imediata (executor) | **PASS** (*) |
| CA-E5.1-6 | Árvore binária → resposta imediata | **PASS** |
| CA-E5.1-7 | Nenhum Job | **PASS** |
| CA-E5.1-8 | Nenhum Gate | **PASS** |
| CA-E5.1-9 | Nenhuma deliberação MRE | **PASS** |
| CA-E5.1-10 | Conversação Natural preservada | **PASS** |

(\*) **CA-E5.1-5 — nota:** o Classificador actual ainda classifica «Como funciona o protocolo HTTP?» com confiança 0,4 → Clarificação. Por restrição «não alterar o Classificador», o teste valida o **executor** com destino C1 forçado. Cobertura e2e desse padrão = emenda futura do Classificador.

## 6. Demos (saída da suite)

Todos os cenários CA-E5.1-1…6: `destino=resposta_leve`, `gerador=llm_c1`, `stub=false`, prosa completa (mocks injectados nos testes; produção usa `/api/ceo/deliberar`).

## 7. Suite automatizada

```text
npm run test:classificador:e51  →  8/8 pass
npm run test:classificador      → 65/65 pass
```

## 8. Pedido de Gate

Homologar a **implementação da Emenda E5.1**.  
**Sem commit** até autorização explícita do patrocinador.

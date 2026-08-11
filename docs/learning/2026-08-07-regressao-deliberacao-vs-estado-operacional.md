# Regressão — Perguntas deliberativas capturadas por Estado Operacional

> **Tipo:** evidência / diagnóstico de causa raiz (sem implementação).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — regressão distinta do CTO-003.  
> **Estado:** Causa raiz identificada · solução **não** implementada.

---

## 1. Evidência

Com operação aberta (Job pending / recuperação):

| Entrada | Interceptação pré-classificador | `detectarModoExecutivo` | Composição ESPELHO |
|---------|----------------------------------|-------------------------|--------------------|
| `oi` | não | `executar` | «Operação em curso…» |
| `bom dia` | não | `executar` | «Operação em curso…» |
| `como está o projeto MG2?` | não | `executar` | «Operação em curso…» |
| `o que acha do roadmap?` | não | `deliberar` | «Operação em curso…» (forçado) |
| `REPITA` | sim | `executar` | (N/A — sai antes) |
| `qual o próximo passo?` | não | `executar` | «Operação em curso…» |

Consequências alinhadas ao despacho: saudações e perguntas de projeto recebem respostas operacionais; deliberação legítima não chega ao utilizador.

---

## 2. Onde NÃO está a causa

**Não** é a Interceptação Operacional pré-classificador (CTO-003 v1.2).

- Ponto: `executiveEngine/index.js` → `deveInterceptarOperacional`
- Critério correcto: só `ehComandoSobreJobActivo(texto)` **e** `operacaoAberta`
- Saudações e perguntas deliberativas **não** entram neste ramo (reproduzido).

A Baseline de posição do intercept (após Continuidade Gate, antes do classificador) permanece válida para comandos operacionais.

---

## 3. Causa raiz (precisa)

O Executive Engine **diferencia mal** no **modo conversacional pós-classificador**: `operacaoAberta` passa a ser tratado como modo global EXECUTAR/RECUPERAR, em vez de condicionar apenas comandos operacionais.

### Locus primário

`app/src/conversacaoNatural/disciplinaExecutiva.js` — `detectarModoExecutivo`:

```text
se operacaoAberta:
  se SINAL_DELIBERAR estreito → deliberar
  senão → executar | recuperar   ← captura o resto (saudação, pergunta de projeto, …)
```

Comentário e testes de CTO-003 codificam este comportamento como desejado («não regressa a deliberação»), o que conflita com o critério arquitectural actual do CTO.

### Amplificador (mesmo com `modo === deliberar`)

`app/src/conversacaoNatural/compor.js` — ramos `TIPO_TURNO.ESPELHO`:

```text
se modoEx ∈ {executar, recuperar} OU opAberta → ack operacional «Operação em curso.»
modoExecutivo out: se deliberar && opAberta → forçar executar
```

Reprodução: «o que acha do roadmap?» detecta `deliberar` e mesmo assim a prosa ESPELHO vira retomada operacional.

### Camada de compressão

`app/src/conversacaoNatural/adaptacaoConversacional.js` — `detectarModoAdaptacao` mapeia `executar`/`recuperar` → modo `execucao` (prosa comprimida, sem deliberação residual).

### Contexto

`contextoImediato.js` propaga `operacaoAberta` e eleva `missaoActiva` quando há operação aberta — alimenta as regras acima sem distinguir tipo de turno.

---

## 4. Critério arquitectural (CTO) — alvo

Com operação aberta:

1. **Comandos operacionais** → continuam interceptados pelo Motor (pré-classificador).  
2. **Perguntas deliberativas** (e saudações / prosa não-comando) → resposta deliberativa normal; preservar missão/contexto; **não** reclassificar a operação nem desviar para despacho operacional.

---

## 5. Fronteira correcta (diagnóstico)

| Camada | Comportamento actual | Comportamento exigido |
|--------|----------------------|------------------------|
| Interceptação pré-classificador | Só comandos sobre Job | Manter |
| `detectarModoExecutivo` + `operacaoAberta` | Quase tudo → EXECUTAR | Só comando/ordem operacional → EXECUTAR/RECUPERAR |
| ESPELHO + `\|\| opAberta` | Força ack operacional | Não forçar só por operação aberta |
| Missão / lastro | Preservar contexto | Preservar sem sequestrar o tipo de resposta |

---

## 6. Distinção vs CTO-003

| | CTO-003 (Baseline) | Esta regressão |
|--|--------------------|----------------|
| Problema | Comando operacional passava pelo classificador/CN | Pergunta deliberativa é tratada como execução |
| Camada | Pré-classificador (faltava intercept) | Pós-classificador (disciplina / composição) |
| Acção | Já corrigido e homologado | Diagnóstico concluído; **sem** patch até autorização |

---

## 7. Filtro CTO (pré-solução)

1. Evidência recorrente de uso real — **confirmada pelo CTO**.  
2. Causa raiz — **identificada** (secção 3).  
3. Solução — **não implementada** (aguarda autorização / desenho mínimo).  
4. Qualquer patch deve preservar o invariante do intercept pré-classificador.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (despacho) + Engenheiro (diagnóstico) |
| Quando | 07/08/2026 |
| O quê | Localização da captura de perguntas deliberativas por Estado Operacional |
| Resultado | Causa raiz no modo pós-classificador (`detectarModoExecutivo` + ESPELHO/`opAberta`); intercept CTO-003 inocente |
| Próximo | Aguardar autorização CTO para calibração — sem alterar Baseline até então |

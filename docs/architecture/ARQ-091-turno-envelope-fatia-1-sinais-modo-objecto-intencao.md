# ARQ-091 — TurnEnvelope Fatia 1: sinais, modo, objecto, intenção

> **Status: Rascunho — v0.3 (12/09/2026).** Aguarda nova homologação técnica e CTO.  
> **Versão:** 0.3 — 12/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-091.  
> **Capacidade:** CAP-01 — Governança.  
> **Lastro adjacente:** CAP-07; [ARQ-018](ARQ-018-classificacao-de-intencao.md) (**sem** nova autoridade).  
> Norma: CON-001; ADR-006; ADR-010; ADR-015; **REQ-091 v0.3**; Fatia 0 (REQ/ARQ/IMP/VAL-090).  
> **Finalidade:** arquitectura da autoridade interpretativa do turno no envelope; Precedência = único decisor; escritor só sela; catálogo de sinais fechado; projecção unidireccional; anti-redetecção; sem packaging MRE.  
> **Gate ARQ:** aberto.  
> **Proibições:** não IMP-091 neste acto; não alterar REQ/ARQ-090; não emendar ARQ-088; **não** deixar decisões de catálogo/produtor para a IMP.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura Fatia 1: sinais canónicos → Precedência → `modo`/`objecto`/`intençãoAtual` selados no TurnEnvelope; flags só como projecção. |
| **Por que existe?** | REQ-091; eliminar re-detecção e verdades paralelas sem mudar destino/classe/rota intencionalmente. |
| **Para quem existe?** | CTO; Engenheiro (IMP futura); Núcleo. |
| **Como medir sucesso?** | CA-091-1…12; casos A–F; N1–N7; matriz de equivalência verde. |

---

## 1. Transição Fatia 0 → Fatia 1

* Fatia 0: envelope **sombra**.  
* Fatia 1: envelope = **autoridade interpretativa** (`sinais`, `modo`, `objecto`, `intençãoAtual`).  
* Selagem Fatia 0 (`mensagemAtual`, `perguntaAtual`, `coaId`, `idTurno`, `timestamp`, `canal`) **permanece**; **não reabrir**.  
* REQ/ARQ-090 **não** são alterados in-place; esta secção + REQ-091 § Transição constituem a ponte.

---

## 2. Regra definitiva de autoridade

| Papel | Componente | Poder | Não pode |
|-------|------------|-------|----------|
| **Fonte canónica (estado)** | `TurnEnvelope` | Guardar `sinais`, `modo`, `objecto`, `intençãoAtual` selados | Ser reescrito por flags |
| **Produtores de sinal** | Detectores do **catálogo fechado** §5 | Append-once em `sinais` | Decidir `modo`/destino; inventar chaves fora do catálogo |
| **Interpretação candidata** | Classificador (ARQ-018) | Classe/destino **candidatos** | Selar; arbitrar após Precedência |
| **Único decisor** | `resolucaoPrecedenciaTurno` | Destino efectivo, bloqueios, **decisão** de `modo` / `objecto` / conteúdo de `intençãoAtual` | — |
| **Escritor pós-Precedência** | Núcleo (materializador) | **Apenas** materializar/selar no envelope a decisão já tomada; projectar `envelope → flags` | Interpretar, escolher, arbitrar, “corrigir” a Precedência |
| **Downstream** | MRE, Speaker, CN, disciplina, reflexo, VCA*, NCS | Só leitura de flags projectadas / assert | Reclassificar; escrever campos interpretativos |

\*VCA/CSC **produzem** sinais de clarificação na sua fase (antes da selagem plena); após selagem não reabrem `modo`.

**Inequívoco:**

* `resolucaoPrecedenciaTurno` = **único decisor**.  
* O escritor pós-Precedência **não tem poder interpretativo próprio**.  
* **Proibido:** flags → envelope; “espelho bidireccional”; escritor a escolher `modo` à margem da Precedência.

---

## 3. Relação `TIPO_TURNO_PREC` × `modo`

| Conceito | Papel |
|----------|--------|
| `resolucaoPrecedenciaTurno` / `TIPO_TURNO_PREC` | Instrumento **interno** do **único decisor** (destino, bloqueios, e decisão de `modo`/`objecto`/`intençãoAtual`). `TIPO_TURNO_PREC` **não** é a face semântica do turno para o utilizador. |
| `envelope.modo` | Classificação **semântica** canónica do turno (`deliberar` \| `informar` \| `decidir` \| `executar` \| `clarificar` \| `info_gathering`). |

Normas:

1. **Um só decisor:** `resolucaoPrecedenciaTurno` (destino **e** decisão de `modo`/`objecto`/`intençãoAtual`).  
2. `TIPO_TURNO_PREC` é instrumento **interno** desse decisor — **não** cria segunda ordem nem face semântica alternativa.  
3. Se `TIPO_TURNO_PREC` disser `DECISAO` por destino `nucleo_mre`, isso **não** implica `modo=decidir`.  
4. O mapa sinal→modo (§6) é a **tabela de decisão** que a Precedência aplica; o escritor **só copia** o resultado.  
5. **C2 nunca implica automaticamente `modo=decidir`.**

---

## 4. Timeline definitiva

```text
create                          # Fatia 0: mensagemAtual, perguntaAtual, coaId, … selados
→ carregar fio/contexto         # fioConversacional mesmo coaId (para objecto / E4)
→ produzir sinais               # append-once; catálogo fechado; mensagemAtual (+ fio só onde exigido)
→ classificador                 # candidatos (classe/destino)
→ precedência DECIDE            # único decisor: destino + modo + objecto + intenção
→ escritor MATERIALIZA/SELA     # sem interpretação própria
→ espelhar flags                # envelope → flags apenas
→ downstream somente leitura
```

**Early-return:** a autoridade early (Gate/AD/VCA/CSC) actua **através** da Precedência (ou do seu veredicto early equivalente documentado); o escritor **só sela** o schema §8 **antes** do return; depois projecção de flags aplicáveis; **sem** classificador completo se o path não o corre.

Ordem dos sinais (obrigatória quando ambos existem):

1. Produzir `ig`  
2. Produzir `pd` (produtor já recusa se IG; se ambos true → Precedência força `pd=false` + telemetria)  
3. Produzir `consulta` (primário; situacional **não** como sinal autónomo)  
4. Restantes do catálogo fechado / `objecto_turno`

---

## 5. Contrato dos sinais

### Formato

```text
envelope.sinais[chave] = {
  id, valor, fonte, em /* ISO */, fase
}
```

**Append-once por chave.** Segunda escrita = violação (teste falha; produção: telemetria + manter primeiro valor).

### Catálogo fechado (Fatia 1) — completo; nada “para a IMP”

O conjunto abaixo é **exaustivo** para autoridade de sinal nesta fatia. Expandir exige emenda REQ/ARQ — **não** IMP.

| Chave | Produtor canónico | API | Significado | Casos cobertos |
|-------|-------------------|-----|-------------|----------------|
| **`consulta`** | `detectarPedidoConsultaResposta` | `app/src/mre/politicaAnaliseDeliberativa.js` | Pedido de **responder** sobre estado do trabalho (não executar); **inclui** situacional via `ehPedidoSituacionalTrabalho` quando aplicável | `ctx.consultaNaoEAcao`; `tipoTurno==="consulta"`; senão `ehPedidoSituacionalTrabalho(texto)` |
| **`consulta_composta`** | `ehPedidoConsultaOuRespostaComposta` | `app/src/autoridadeDelegada/autoridadeDelegada.js` | Pedido composto consulta+acção / «estado da fila» — bloqueia AD indevido | Regex composta / estado da fila |
| **`panorama`** | Heurística já usada em Precedência (`estado atual` / resumo executivo, **exceto** autodiagnóstico CEO) | Núcleo (mesmo critério actual) | Panorama geral ≠ consulta situacional de trabalho | Distinto de autodiagnóstico |
| **`ig`** | `detectarPedidoInfoGathering` | `pedidoInfoGathering.js` | Descobrir lacunas/info | Ordem 74, «o que falta saber», etc. |
| **`pd`** | `detectarPedidoDecisaoExplicita` | `pedidoDecisaoExplicita.js` | Fecho decisório explícito | «Decida», «Tome a decisão» — **não** propósito |
| **`analise`** | `detectarPedidoAnaliseDeliberativa` | `politicaAnaliseDeliberativa.js` | Análise deliberativa estrita | ≠ E4 A isolado; **≠** `ehPedidoAnaliseOuRecomendacao` (lato) |
| **`delegacao`** | Activação AD / pedido delegação explícita | `autoridadeDelegada` + política MRE | Mandato | Ack AD |
| **`execucao`** | `ehOrdemExecucaoOperacional` | `autoridadeDelegada.js` | Ordem de execução | «executa», etc. |
| **`objeto_operacional`** | Decisão da Precedência (materializada no sinal) | Núcleo — critério AD/CTO já usado | Objecto operacional real | Gate AD/CTO |
| **`gate_continuidade`** | `decidirInterceptacaoContinuidade` | continuidadeGate | Continuidade Gate | «Aprovado.» |
| **`gate_clarificacao`** | idem | idem | Clarificação Gate | |
| **`vca_clarificacao`** | VCA; Precedência autoriza o efeito | `validadorContextoAtivo` | Clarificar contexto | `ambiguo_contexto` |
| **`csc_clarificacao`** | CSC; Precedência autoriza o efeito | gestores tópico/objectivo/ref | Clarificar CSC | |
| **`objecto_turno`** | `objectoDoTurno` | `recomendacaoOperacional.js` | A\|B\|misto\|indefinido | valor string |
| **`classe_c`** | Classificador (candidato); Precedência decide efectivo | regras/encaminhador | C1–C4 | |
| **`destino`** | Precedência (efectivo) | — | Destino efectivo | string |
| **`cto003_candidato`** | Interceptação CTO-003 | Núcleo | Candidato operacional | boolean |
| **`ad_activacao_ack`** | AD primeira activação | Núcleo | Ack mandato | boolean |

### Fora do catálogo canónico (sem autoridade de sinal)

| Item | Por quê |
|------|---------|
| **`situacional` como chave em `envelope.sinais`** | Redundante com `consulta` (mesmo produtor cobre situacional). Só `derivacoes.situacional` / telemetria — **sem** mapa de modo, **sem** conflito, **sem** flag soberana |
| Detectores / chaves não listadas | Expandir catálogo = emenda REQ/ARQ |
| `ehPedidoAnaliseOuRecomendacao` (lato) | Não produz `analise` |
| Metadados (`forcarC2`, `mreInvocado`, …) | Não são sinais; derivados pós-selagem sob não-contradição |

### `consulta` × `situacional` (norma absoluta)

* **Sinal canónico primário:** `consulta` (`detectarPedidoConsultaResposta`).  
* **`situacional` não é sinal com autoridade** — não aparece na tabela do catálogo; não entra no mapa §6; não arbitra.  
* Derivação/telemetria opcional: `derivacoes.situacional` / passo `rastreio`, calculada do **mesmo** critério interno do produtor de `consulta`, **sem** segunda verdade.  
* `consulta_composta` e `panorama` permanecem sinais **distintos** do catálogo (já fechados acima).

### Objecto

* **Única autoridade de cálculo:** `objectoDoTurno(mensagemAtual, fioMesmoCoa)` (produtor do sinal `objecto_turno`).  
* **Único decisor de selagem:** Precedência decide o valor efectivo a selar; escritor só materializa.  
* Fio = mesmo `coaId` do envelope; **outro COA nunca entra**.  
* Uma vez; resultado em `sinais.objecto_turno` **e** `envelope.objecto`; selado; downstream **não** reclassifica.

---

## 6. Mapa sinal → modo

Tabela de **decisão** aplicada por `resolucaoPrecedenciaTurno` (primeiro match vence). O escritor **copia** o resultado — não reavalia condições.

| # | Condição | modo |
|---|----------|------|
| 1 | `gate_clarificacao` ∨ `vca_clarificacao` ∨ `csc_clarificacao` | `clarificar` |
| 2 | `ig` | `info_gathering` |
| 3 | `pd` | `decidir` |
| 4 | `execucao` ∧ objecto operacional ∧ **não** bloqueado por `consulta` ∨ `panorama` ∨ `consulta_composta` | `executar` |
| 5 | destino `motor_execucao` / C3 | `executar` |
| 6 | `consulta` ∨ `panorama` ∨ destino `resposta_leve` / C1 | `informar` |
| 7 | destino `capacidade_operacional` / C4 | `informar` (**distinção A:** `objecto=A` + destino C4; **≠** B/C2) |
| 8 | destino `nucleo_mre` / C2 | `deliberar` |
| 9 | fallback | `deliberar` se C2; senão `informar` |

**Proibido no mapa:** condição `situacional` (não é sinal canónico). Situacional puro cai em `consulta=true` → linha 6.

IG vence PD. C2 ≠ `decidir` automático. Operação A não recebe `decidir` por acidente.

---

## 7. Intenção

```text
intençãoAtual = {
  classe,      // string canónica (C1|C2|C3|C4|sentinel early-return)
  destino,     // string destino efectivo
  confiança,   // number|null
  sinais       // string[] chaves de sinais com valor true / relevantes
}
```

Sem campos inventados. Early-returns: §8.

---

## 8. Schema de early-returns / caminhos

| Path | Quando sela | modo | objecto | intençãoAtual |
|------|-------------|------|---------|---------------|
| **Gate continuidade** | Antes do return | `clarificar` se clarificação Gate; senão `informar` (continuidade operacional) | `objectoDoTurno` 1× com fio disponível, senão `indefinido` | `{ classe: "continuidade_gate", destino: "continuidade_gate"\|clarif, confiança: null, sinais: ["gate_continuidade",…] }` |
| **Gate clarificação** | Antes do return | `clarificar` | idem | `{ classe: "clarificacao_gate", destino: "continuidade_gate_clarificacao"\|…, confiança: null, sinais: ["gate_clarificacao",…] }` |
| **AD ack** | Antes do return | `informar` | `A` se operacional, senão `objectoDoTurno` | `{ classe: "autoridade_delegada", destino: "autoridade_delegada", confiança: null, sinais: ["delegacao","ad_activacao_ack",…] }` |
| **AD execução** | Antes do return | `executar` | tipicamente `A` | `{ classe: "C3", destino: "motor_execucao", confiança: null, sinais: ["execucao","delegacao",…] }` |
| **VCA clarificar** | Antes do return | `clarificar` | `objectoDoTurno` ou `indefinido` | `{ classe: "clarificacao_contexto", destino: "clarificacao_contexto", confiança: null, sinais: ["vca_clarificacao",…] }` |
| **CSC clarificar** | Antes do return | `clarificar` | idem | `{ classe: "clarificacao_topico"\|objectivo\|referente\|…, destino: correspondente, confiança: null, sinais: ["csc_clarificacao",…] }` |
| **C1** | Pós-precedência | `informar` | objecto selado | classe C1, destino `resposta_leve` |
| **C2** | Pós-precedência | `deliberar` \| `info_gathering` \| `decidir` \| `informar` (mapa) | objecto selado | classe C2, destino `nucleo_mre` |
| **C3** | Pós-precedência / AD | `executar` | tipicamente A | classe C3, destino `motor_execucao` |
| **C4** | Pós-precedência | `informar` | **A** (E4) | classe C4, destino `capacidade_operacional` |

Todos os campos da linha são **obrigatórios** na selagem desse path (nenhum `intençãoAtual` parcial).

---

## 9. Matriz completa sinal ↔ flag (projecção)

| Sinal | Produtor | Flag legada | Regra de projecção |
|-------|----------|------------|-------------------|
| `ig` | `detectarPedidoInfoGathering` | `pedidoInfoGathering` | `flag = sinal.valor` |
| `pd` | `detectarPedidoDecisaoExplicita` | `pedidoDecisao` / uso em Precedência | `flag = sinal.valor` |
| `consulta` | `detectarPedidoConsultaResposta` | `pedidoConsulta` / `pedidoConsultaResposta` | `flag = sinal.valor` (**única** autoridade consulta/situacional) |
| `consulta_composta` | `ehPedidoConsultaOuRespostaComposta` | *(input Precedência; sem flag única nomeada)* | projectar para booleano interno de Precedência se existir; senão só sinal |
| `panorama` | heurística Núcleo | *(Precedência)* | idem |
| *(fora do catálogo)* `derivacoes.situacional` | critério interno de `consulta` | **nenhuma** flag soberana | telemetria apenas; **não** projectar como verdade paralela |
| `analise` | `detectarPedidoAnaliseDeliberativa` | `pedidoAnalise` / `pedidoAnaliseDeliberativa` | `flag = sinal.valor` |
| `delegacao` | AD / delegação explícita | estados AD / `pedidoDelegacaoExplicita` | projectar booleanos AD existentes |
| `execucao` | `ehOrdemExecucaoOperacional` | *(Precedência AD)* | idem |
| `objeto_operacional` | Precedência | *(Precedência)* | idem |
| `gate_*` | continuidade | `dados` Gate / modos | não criar flag nova; metadados existentes |
| `vca_clarificacao` / `csc_*` | VCA/CSC | modos clarificação | idem |
| `objecto_turno` | `objectoDoTurno` | **sem flag booleana** | só `envelope.objecto` |
| `classe_c` / `destino` | Classificador + Precedência | `classificacao` / `encaminhamento` | já estruturais; alinhar a `intençãoAtual` |

### Flags / metadados **sem** sinal 1:1 (não-espelho directo)

`consultaNaoEAcao`, `forcarC2`, `publicarJobProibido`, `motorAcionado`, `mreInvocado`, `exploratoria`, `preferirSolicitarDados`, `antiSugiro`, `mreFallback`, contagens Consciência, etc.

**Norma:** continuam a ser derivados pelo pipeline legado **depois** da selagem, **desde que** não contradigam `modo`/`objecto`/`intençãoAtual`. Se contradisserem → divergência (§ REQ produção: envelope vence).

### Sinais sem flag booleana

`objecto_turno`, `classe_c`, `destino`, vários `gate_*` / clarificação — vivem no envelope + `dados` estruturais.

### Semântica diferente / conflitos fechados

| Par | Norma |
|-----|--------|
| `TIPO_TURNO_PREC.DECISAO` vs `modo` | Não equivalentes; ver §3 |
| `consulta` vs `consulta_composta` | Produtores distintos; ambos no catálogo fechado |
| `consulta` vs `situacional` | **Uma verdade:** `consulta` primário; `situacional` só derivação/telemetria |
| `consulta` vs `panorama` | Distintos; ambos canónicos |
| `analise` vs `ehPedidoAnaliseOuRecomendacao` | Sinal canónico = detector **estrito** apenas |
| Precedência vs escritor | Precedência decide; escritor só sela — se o escritor “escolhe”, violação |

### Testes normativos (fecho consulta × situacional)

| ID | Caso | Esperado |
|----|------|----------|
| **S1** | Pedido situacional puro («onde paramos?») | `consulta=true`; **sem** `sinais.situacional` com autoridade; `modo=informar` (mapa #6) |
| **S2** | Situacional + execução lexical | `consulta` bloqueia execução no mapa #4; telemetria situacional opcional |
| **S3** | Flag legada “situacional” órfã ≠ envelope | Envelope/`consulta` vence; flag sem autoridade |
| **S4** | `consulta_composta` | Sinal distinto; não fundir com `consulta` |

Casos A–F / N1–N7 (REQ-091) permanecem; matriz de equivalência IMP deve incluir S1–S4.

---

## 10. Re-detecção (política completa)

1. Se `envelope.sinais[chave]` existe → **não** rerodar o detector.  
2. Caller legado sem fase de sinais / envelope ausente → fallback **controlado**: correr detector **uma vez**, e se o envelope ainda for mutável na fase de sinais, gravar; se já selado, usar resultado só localmente **igualando** ao que o envelope teria (telemetria `fallback_sem_sinal`) — **proibido** criar valor oposto ao envelope.  
3. Downstream (`integracaoNucleo`, `ia.js`, orquestrador, CN, disciplina, reflexo) **proibido** sobrescrever sinais; devem consumir flags projectadas / opts.  
4. Fallback **não** é segunda verdade: na via oficial Fatia 1 o envelope já tem o sinal.

---

## 11. Rastreio Fatia 1 (sem violar freeze Fatia 0)

* **Proibido** mutar in-place `envelope.rastreio` após freeze.  
* Função autorizada: `registarPassoEnvelope(envelope, passo) → novoEnvelope`.  
  * Copy-on-write: novo objecto congelado com `rastreio` = `[...antigo, passo]`.  
  * Só o Núcleo (fábrica TurnEnvelope) pode emitir o novo envelope e substituir a referência no turno.  
* Passos mínimos Fatia 1: `create` (Fatia 0), `sinais`, `selagem`, `projecao_flags`, opcional `divergencia_flag`.

---

## 12. Compatibilidade e equivalência

* Flags existem; são **projecção**.  
* Destino/classe/rota: **sem delta intencional**.  
* IMP só aprovável com matriz de equivalência verde (REQ-091).  
* Divergência produção: REQ-091 § Divergência.

---

## 13. Não escopo

Packaging MRE; `políticaSubstituição`; remoção de flags; Trilha; alteração REQ/ARQ-090; Fatia 2+.

---

## 14. Dependências Fatia 2

Requer Fatia 1 homologada (sinais/modo/objecto/intenção estáveis) antes de packaging seccionado MRE.

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | Proposta chat | NÃO APROVADO |
| 0.2 | 12/09/2026 | Engenheiro | Correcções bloqueantes + persistência | **Rascunho** |
| 0.3 | 12/09/2026 | Engenheiro | Catálogo fechado; consulta×situacional; Precedência=decisor / escritor=sela | **Rascunho** — aguarda re-homologação |

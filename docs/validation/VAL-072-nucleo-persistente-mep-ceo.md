# VAL-072 — Validação da IMP-072 (núcleo persistente da MEP-CEO)

> **Status:** **CONCLUÍDA** — 14/08/2026. **0 FAIL.** Base da **homologação da IMP-072**.  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-072 (VAL da IMP-072).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020). **CAP-13 não homologada por este acto.**  
> **Norma:** VIS-009 Homologada v1.0 · REQ-085 Homologado v1.0 · ARQ-033 Homologada v1.0 · IMP-072 **HOMOLOGADA** (recorte C1+C2).  
> **Código:** **não alterado** neste acto nem no de homologação. Sem C3. Sem UI. Sem Motor / MRE / EIC / G2 / MTE / CAP-04 / CAP-05 / `monitorar`. Sem commit.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que o núcleo C1 + C2 da IMP-072 cumpre o contrato homologado da MEP-CEO. |
| **Por que existe?** | Despacho CTO 14/08/2026: abrir exclusivamente a VAL da IMP-072. |
| **Para quem existe?** | CTO (parecer de conformidade); Usuário (alçada de homologação da IMP / CAP-13). |
| **Como medir sucesso?** | Cada CA aplicável classificado em PASS / FAIL / LACUNA / LIMITAÇÃO, com evidência. Zero FAIL nos requisitos aplicáveis ao núcleo. |

---

## 1. Escopo validado

| # | Item do despacho | Âmbito |
|---|------------------|--------|
| 1 | Isolamento C1 | Cinco tipos proibidos; referência opaca; sem ingestão automática |
| 2 | Nove objectos C2 | `MCP` `EPC` `MDL` `DCP` `EVD` `PND` `BSL` `RMP` `MEV` |
| 3 | Maturidade + saltos | Cadeia canónica; saltos ilícitos recusados |
| 4 | Trabalho | Quatro estados; ortogonalidade; `PENDÊNCIA_ATIVA` exige `PND` |
| 5 | Alçadas | Agente / CTO / Usuário / Autoridade Delegada |
| 6 | Evidência | Recusa sem evidência; vínculo no registo |
| 7 | Append-only | Eventos permanecem; delete recusado |
| 8 | Baseline | Congelada; novo `BSL` não muta o anterior |
| 9 | Identificadores | `MARCADOR-nnn`; nove espaços sem colisão |
| 10 | Independência | Sem imports Motor / MRE / EIC / Camada / G2 / MTE / CAP-04 / CAP-05 |
| 11 | Persistência | Somente Map + log em processo |
| 12 | Integração mínima | Superfície pública `app/src/mepCeo/` como consumidor |

**Fora deste VAL:** C3; UI; persistência em disco; semântica `RMP`↔`ROADMAP`; correcção de código; homologação executada da CAP-13.

---

## 2. Evidências executadas

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd app && npm run test:mep-ceo` (14/08/2026, reexecução VAL) | **20/20 pass**, 0 fail |
| **E2** | Inspecção de `app/src/mepCeo/*.js` (domínio, isolamento, transições, registo, identificadores, `index.js`) | Contrato C1+C2 observável; sem C3 |
| **E3** | Inspecção de imports: todos os `from` do núcleo são internos a `mepCeo/` ou `node:*` nos testes | Sem acoplamento a Motor / MRE / EIC / Camada / G2 / MTE |
| **E4** | Consumidor da superfície pública (`node --input-type=module` importando `./src/mepCeo/index.js`) | Criar, consultar, promover, recusar salto/alçada, emitir BSL, trabalho `EM_INVESTIGAÇÃO` |
| **E5** | Inspecção de catálogo: VIS-009 / REQ-085 / ARQ-033 **não emendados**; CAP-04 / CAP-05 / Motor / MRE **não** alterados por esta VAL | Independência documental da frente |

### E4 — resultado do consumidor (síntese)

```
criar MDL-001 CONCEBIDO          ok
consultar titulo                 "consumidor-val"
salto CONCEBIDO→HOMOLOGADO       salto_ilicito
DEFINIDO sem evidência           evidencia_obrigatoria
DEFINIDO→…→HOMOLOGADO (CTO)      ok
EM_INVESTIGAÇÃO (maturidade HOMOLOGADO) ok
agente → BASELINE                alçada
cto → BASELINE                   alçada
usuario → BASELINE               ok, congelado
BSL-001 / BSL-002 (precedente)   BSL-001 intacto
isolamento dados_cliente         recusado
ref opaca KNW-001                ok
apagarEvento                     historico_append_only
propor não muda vigência         CONCEBIDO
```

---

## 3. Resultados por requisito (REQ-085)

Legenda: **PASS** = conforme contrato · **FAIL** = viola requisito homologado · **LACUNA** = contrato não define · **LIMITAÇÃO** = permitida pela spec / despacho da IMP · **N/A** = não aplicável a esta IMP (proibido implementar ou supersedido).

### RF-01 Isolamento

| ID | Veredicto | Evidência | Nota |
|----|-----------|-----------|------|
| CA-085-01 | **PASS** | E2: `EIXO_PRODUTO = "produto"`; objectos só neste eixo | Dois eixos nomeados; nenhum objecto nos dois |
| CA-085-02 | **PASS** | E1 teste isolamento; E4 `dados_cliente` recusado | Recusa dos cinco tipos via `tipoConteudo` + chaves de payload |
| CA-085-03 | **PASS** | E2/E5 | Núcleo não sede em CAP-04/05; REQ-033 / ARQ-009 / ARQ-031 intactos nesta frente |
| CA-085-04 | **PASS** | E1 consulta sem conversas/factos de cliente | `consultar` / `listar` / `historico` sem transcript |
| RN-01.2 | **PASS** | E1 referência opaca `KNW-001`; absorção `itemKnwConteudo` recusada | |
| RN-01.3 | **PASS** | E3: sem ingestão desde conversa/COA/Acervo/MRE/EIC/fila | Não há writer automático para C2 |

Detecção **semântica** de texto livre que ainda identifique cliente (ARQ-033 §6.1 «resumo») **não** está no contrato como classificador. C1 implementado é estrutural (eixo, flag, chaves, `tipoConteudo`). → **LACUNA** de mecanismo de reconhecimento; **não** é FAIL.

### RF-02 Nove objectos

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-05 | **PASS** | E1 + E4: nove espaços; marcadores ≠ `CAP` `KNW` `ROADMAP` `EPICO` `EV`; `MEV` só por log |
| CA-085-06 | **PASS** | E1: DCP exige cinco campos de produto; `decisao_privada_cliente` não cria DCP |
| CA-085-07 | **PASS** | E1: `RMP-001` coexiste com `ROADMAP-002` por ID opaco; sem projecção |
| CA-085-08 | **PASS** | E1/E4: `MEV` = objecto + transição + evidência; sem transcript |
| RN-02.1 | **PASS** | E1: `MDL-001` / `MDL-002`; contador não reutiliza |

Semântica `RMP` *projectado* a partir do documento ROADMAP: **LACUNA** (ARQ-033 §8.1; despacho: não resolver).

### RF-03 Maturidade

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-09 | **PASS** | E2/E4: conjunto fechado dos seis estados |
| CA-085-10 | **PASS** | E1: cada promoção gera `MEV` com evidência |
| CA-085-11 | **PASS** | E1/E4: agente sozinho → BASELINE = `alçada` |
| CA-085-12 | **PASS** | E1: CONCEBIDO = hipótese; HOMOLOGADO/BASELINE = `facto_homologado` |
| RN-03.1 / 03.6 | **PASS** | E1: saltos listados no REQ recusados (`salto_ilicito`) |
| RN-03.3 | **PASS** | E1/E4: objecto em BASELINE congelado; `BSL-002` não muta `BSL-001` |
| RN-03.4 | **PASS** | E4: `proporMaturidade` não altera vigência |
| RN-03.5 | **PASS** | E1: MCP/EPC exigem CTO+Usuário em DEFINIDO e HOMOLOGADO; MDL: CTO até HOMOLOGADO; BASELINE só Usuário |
| RN-03.7 | **PASS** | E1: `autoridade_delegada` não promove BASELINE |

`criarNovaBaseline` emite `BSL` já em `BASELINE` (recorte), distinto do ciclo CONCEBIDO→… de um objecto criado por `criarObjecto`. O contrato diz «novo BSL se for nova baseline» e não obriga o recorte a percorrer a cadeia. → **LACUNA** de unificação dos dois nascimentos de `BSL`; interpretação da IMP **não** viola salto ilícito de um objecto existente.

Campo `cobre`: lista opcional de IDs. Sem regra de cobertura no contrato. **Não** validado como contrato. → **LACUNA** (despacho item 8).

### RF-04 Trabalho

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-13 | **PASS** | E1: HOMOLOGADO + PENDÊNCIA_ATIVA; E4: HOMOLOGADO + EM_INVESTIGAÇÃO; default SEM_PENDÊNCIA na cadeia |
| CA-085-14 | **PASS** | E2/E4: quatro estados fechados |
| CA-085-15 | **PASS** | E1: PENDÊNCIA_ATIVA sem PND recusada |
| RN-04.2 | **PASS** | E1: resolver trabalho não promove BASELINE |

Objecto já em BASELINE recusa mudança de trabalho (`baseline_congelada`). Eixos são ortogonais **até** congelar. Se trabalho deveria permanecer mutável em BASELINE, o contrato não decide. → **LACUNA**; não FAIL.

### RF-05 Autoridade

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-16 | **PASS** | E4: criar / consultar / propor / organizar (`definirEstadoTrabalho`) |
| CA-085-17 | **PASS** | E1/E4: agente e CTO recusados em BASELINE |
| CA-085-18 | **PASS** | E1/E4: `apagarEvento` / `apagarObjecto` = `historico_append_only` |
| CA-085-19 | **PASS** | E1: promoção sem evidência recusada; CONCEBIDO permanece hipótese |
| CA-085-20 | **PASS** | E2: alçadas herdam RN-03.5; ARQ-032 não emendada |
| RN-05.1 | **PASS** | propor ≠ promover |
| RN-05.2 | **PASS** | Autoridade Delegada não contorna HOMOLOGADO/BASELINE |

### RF-06 Evidência

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-21 | **PASS** | E1/E4: criação com lacuna ou evidência; transições exigem `{ tipo, referência }`; evidência fica no objecto e no `MEV` |
| CA-085-22 | **PASS** | evidência = `{ tipo, referência }`; sem payload de conversa |
| CA-085-23 | **PASS** | criação sem evidência nem `lacunaEvidencia` recusada |

Alteração dos cinco campos de um `DCP` já criado: **não há API pública de mutate**. → **LACUNA** (como corrigir DCP); não é FAIL (não há reescrita silenciosa).

`TIPOS_EVIDENCIA` está declarado mas a validação aceita qualquer par `{ tipo, referência }` não vazio (RN-06.1: lista extensível). → **LACUNA** de fechamento do enumerado; não FAIL.

### RF-07 Append-only

| ID | Veredicto | Evidência |
|----|-----------|-----------|
| CA-085-24 | **PASS** | delete recusado; clone da consulta não muta o log |
| CA-085-25 | **PASS** | E1: evento com objecto, estados, quando, papel, evidência |
| CA-085-26 | **PASS** | E4: `hist.len=7` após criar + 4 promoções + trabalho + baseline |
| RN-07.1 | **PASS** | correcção = novo evento (`propor` / nova promoção); sem reescrita de `MEV` |

### RF-08 / C3

| ID | Veredicto | Nota |
|----|-----------|------|
| CA-085-27…30 | **N/A** | Fronteira futura; não exigível em código nesta etapa |
| CA-085-31 | **PASS** | C3 **não** implementado (E2: `index.js` não exporta canal C3) |

### RNF

| ID | Veredicto | Nota |
|----|-----------|------|
| RNF-01 | **PASS** | Consulta C2 sem conteúdo de Memória Organizacional (E1/E3) |
| RNF-02 | **PASS** | Sem UI |
| RNF-03 | **PASS** | Sem escrita em CAP-04/05 nem evolução autónoma |
| RNF-04 | **PASS** | Núcleo lógico; Map em processo; sem fornecedor |
| RNF-05 | **PASS** | E3/E5: zero acoplamento nesta frente |
| RNF-06 | **PASS** | `classificacao` distingue hipótese / facto proposto / facto homologado |
| CA-085-32 | **PASS** | C3 ausente |
| CA-085-33 | **N/A** | Critério da homologação da **especificação** (sem IMP). Supersedido pelo despacho que abriu IMP-072. **Não** é FAIL da IMP. |
| CA-085-34 | **N/A** | Idem: runtime C2 é o objecto desta VAL. |
| CA-085-35 | **PASS** | Sem UI |
| CA-085-36 | **PASS** | Sem evolução autónoma |
| CA-085-37 | **PASS** | Sem integração Motor / MRE / EIC / G2 / MTE |

---

## 4. Itens 1–12 do despacho (síntese)

| # | Veredicto |
|---|-----------|
| 1 Isolamento C1 | **PASS** (mecanismo semântico de texto livre = **LACUNA**) |
| 2 Nove objectos | **PASS** |
| 3 Maturidade + saltos | **PASS** |
| 4 Trabalho | **PASS** |
| 5 Alçadas | **PASS** |
| 6 Evidência | **PASS** |
| 7 Append-only | **PASS** |
| 8 Baseline | **PASS** (`cobre` = **LACUNA**) |
| 9 Identificadores | **PASS** |
| 10 Independência | **PASS** |
| 11 Persistência Map+log | **LIMITAÇÃO** da IMP-072 — **não** é FAIL |
| 12 Superfície pública / consumidor | **PASS** (E4) |

---

## 5. Defeitos reais encontrados

**Nenhum FAIL.** Nenhum comportamento observado viola requisito homologado **aplicável** ao núcleo C1+C2 da IMP-072.

Não se corrige código. Não há retorno obrigatório para correcção.

---

## 6. Lacunas de especificação (não são bugs)

1. Persistência em disco / schema físico / adapters.  
2. Relação `RMP` ↔ tipo documental `ROADMAP` além de ID opaco.  
3. Regras de cobertura `cobre` de um `BSL`.  
4. Se promover um objecto a BASELINE deve emitir automaticamente um `BSL` (a IMP separa os actos).  
5. Se um `BSL` criado em CONCEBIDO é o mesmo recorte que `criarNovaBaseline`.  
6. API para alterar campos de um `DCP` já persistido.  
7. Reconhecimento semântico C1 de conteúdo organizacional em texto livre.  
8. Mutabilidade do eixo trabalho depois de BASELINE.  
9. Fecho do enumerado `TIPOS_EVIDENCIA` vs. lista extensível (RN-06.1).

---

## 7. Limitações da IMP-072 (permitidas)

| Limitação | Fundamento |
|-----------|------------|
| Estado só em processo (perde-se ao reiniciar) | REQ-085 RF-02 fora de âmbito: schema físico; despacho VAL item 11 |
| Sem C3 | RF-08 / CA-085-31 / ARQ-033 §7 |
| Sem UI | RNF-02 |
| Sem integração Motor / MRE / EIC / G2 / MTE | RNF-05 |
| C1 estrutural, não classificador de linguagem natural | Contrato não define motor de detecção |

---

## 8. Riscos

| Risco | Gravidade | Nota |
|-------|-----------|------|
| Memória de produto volátil em processo | Operacional | LIMITAÇÃO conhecida; não impede conformidade da IMP-072 |
| Confundir PASS desta VAL com homologação da CAP-13 | Governança | A CAP-13 **ainda não** está homologada |
| Confundir `BSL` de ciclo com `BSL` de recorte | Operacional | LACUNA; não bloqueia IMP |
| Pressão para ligar C2 ao Motor/MRE «para persistir» | Arquitectura | Fora de contrato; exigiria despacho novo |

---

## 9. Recomendação ao CTO *(acto de validação — preservado)*

1. **Homologar a IMP-072** — núcleo C1+C2 conforme VIS-009 / REQ-085 / ARQ-033 no recorte especificado. Requisitos aplicáveis: **PASS**. FAIL: **0**.  
2. **Abrir o acto de homologação da CAP-13** — o ciclo VIS→REQ→ARQ→IMP→VAL do mínimo está completo. A homologação da CAP-13 **não ocorre neste documento**; é acto próprio (CTO + Usuário), com as limitações da §7 explícitas (persistência volátil, sem C3, sem UI).  
3. **Não** abrir C3, UI, persistência em disco, ponte RMP↔ROADMAP nem integração Motor/MRE nesta sequência, salvo despacho novo.  
4. **Não** corrigir código — não há defeito de conformidade a corrigir.

---

## 10. Homologação da IMP-072 *(acto posterior — 14/08/2026)*

A recomendação §9.1 foi **aceite**. A recomendação §9.2 **não** foi executada neste acto: a CAP-13 permanece **não homologada**.

| Campo | Valor |
|-------|--------|
| CTO | Homologou a **IMP-072** (14/08/2026) |
| Recorte | Exclusivamente **C1 + C2** |
| VAL-072 | **CONCLUÍDA** · 0 FAIL · suite 20/20 |
| IMP-072 | **IMPLEMENTADA** e **HOMOLOGADA** |
| Lacunas VAL-072 §6 | Não são FAIL nem defeito de conformidade |
| Persistência volátil | **LIMITAÇÃO** permitida no escopo; não é FAIL |
| Fora do recorte | Persistência física; adapters; C3; UI; integrações |
| CAP-13 | **Não homologada** |

*Acto posterior (14/08/2026):* a recomendação §9.2 foi aceite em acto próprio. CAP-13 **HOMOLOGADA** — [`homologacao-cap-13.md`](../cap-13/homologacao-cap-13.md). O quadro §10 descreve o acto da IMP-072 e **não** é reescrito.

---

## 11. Homologação da CAP-13 *(acto posterior — 14/08/2026)*

| Campo | Valor |
|-------|--------|
| CTO + Usuário | Homologaram a **CAP-13** |
| Contrato | VIS-009 / REQ-085 / ARQ-033 v1.0 (mínimo) |
| Implementação | IMP-072 C1+C2 |
| VAL-072 | Base de evidência (0 FAIL) — inalterada |
| Autorização de C3/UI/persistência/integrações | **Não** |
| Registo formal | [`homologacao-cap-13.md`](../cap-13/homologacao-cap-13.md) |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-13 |
| VIS / REQ / ARQ | VIS-009 · REQ-085 · ARQ-033 v1.0 homologados |
| IMP | [`IMP-072`](../implementation/IMP-072-nucleo-persistente-mep-ceo.md) |
| Suite | `app/src/mepCeo/mepCeo.test.js` — E1 **20/20** |
| Código | `app/src/mepCeo/` — **não modificado** na VAL, na homologação da IMP nem na homologação da CAP-13 |

---

## Memória organizacional (acto de validação — preservado)

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor) executou VAL-072; CTO despachou; Usuário ainda não homologou |
| Quando | 14/08/2026 |
| O quê | Validação do núcleo persistente MEP-CEO (C1+C2) |
| Baseado em | VIS-009 · REQ-085 · ARQ-033 · IMP-072 · E1–E5 |
| Resultado | VAL **executada**; **recomenda** homologar IMP-072 e abrir acto de homologação da CAP-13; CAP-13 **não** homologada neste acto |

## Memória organizacional (acto de homologação da IMP-072)

| Campo | Valor |
|-------|--------|
| Quem | CTO despachou a homologação; Engenheiro (Cursor) formalizou |
| Quando | 14/08/2026 |
| O quê | Homologação da IMP-072 no recorte C1+C2 |
| Por quê | VAL-072 concluída com 0 FAIL |
| Baseado em | VAL-072; VIS-009; REQ-085; ARQ-033; IMP-072 |
| Resultado | IMP-072 **HOMOLOGADA**; VAL-072 **CONCLUÍDA**; CAP-13 **não** homologada *neste* acto |

## Memória organizacional (acto de homologação da CAP-13)

| Campo | Valor |
|-------|--------|
| Quem | CTO + Usuário aprovaram; Engenheiro formalizou |
| Quando | 14/08/2026 |
| O quê | Homologação da CAP-13 (contrato mínimo; C1+C2) |
| Por quê | Diagnóstico de prontidão PRONTA; VAL-072 0 FAIL |
| Baseado em | VIS-009 · REQ-085 · ARQ-033 · IMP-072 · VAL-072 |
| Resultado | CAP-13 **HOMOLOGADA**; evolução futura não autorizada por este acto |

# IMP-091 — TurnEnvelope Fatia 1 (sinais → modo / objecto / intenção)

> **Status: PLANO — v0.1 (12/09/2026).** **Não implementado.** Aguarda execução após este plano.  
> **Versão:** 0.1 — 12/09/2026  
> Norma: **REQ-091 v0.3 HOMOLOGADO**; **ARQ-091 v0.3 HOMOLOGADA**.  
> Dependência: REQ/ARQ/IMP/VAL-090 (Fatia 0) — **não alterar**.  
> Capacidade: **CAP-01** — Governança. Lastro adjacente CAP-07 / ARQ-018 (**sem** nova autoridade).  
> **Natureza:** plano executável apenas — **zero** decisões arquitecturais novas; **zero** novo sinal/detector/regra de precedência.  
> **Proibições deste acto documental:** não alterar código; não criar VAL-091 ainda; não commit.  
> **Fora de escopo (REQ/ARQ):** packaging MRE; `políticaSubstituição`; remoção de flags; Trilha/HFC/MO/MEP; migração Speaker/CN/NCS/disciplina/reflexo para consumir só `envelope.modo`.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano de implementação da Fatia 1: catálogo fechado de sinais → Precedência decide → escritor sela → projecção `envelope → flags` → anti-redetecção. |
| **Por que existe?** | REQ/ARQ-091 homologados exigem autoridade interpretativa no TurnEnvelope sem delta intencional de destino/classe/rota. |
| **Para quem existe?** | Engenheiro (execução); CTO (gate VAL); Núcleo. |
| **Como medir sucesso?** | CA-091-1…15; A–F; N1–N7; S1–S4; matriz de equivalência verde; critérios VAL-091 objectivos. |

---

## 1. Princípios de execução (não negociáveis)

1. `resolucaoPrecedenciaTurno` / `resolverPrecedenciaTurno` = **único decisor** de destino, `modo`, `objecto` e conteúdo de `intençãoAtual`.  
2. Escritor pós-Precedência = **só materializa/sela** + projecta flags — **sem** escolha própria.  
3. Catálogo de sinais = **fechado** (ARQ-091 §5). Nada “para a IMP”.  
4. `consulta` primário; `situacional` **nunca** em `envelope.sinais` com autoridade — só `derivacoes.situacional` / telemetria.  
5. Projecção **somente** `TurnEnvelope → flags`. Divergência: envelope vence; fail-soft.  
6. Qualquer incerteza técnica = **BLOQUEIO** (§13) — **não** resolver por suposição.

---

## 2. Inventário exacto de ficheiros/módulos

### 2.1 Tocados (escrita esperada)

| # | Ficheiro | Papel na Fatia 1 |
|---|----------|------------------|
| 1 | `app/src/turnEnvelope/index.js` | COW: `registarPassoEnvelope`; append-once de sinais; selagem `modo`/`objecto`/`intençãoAtual`/`autoridade`; helpers de projecção/divergência; manter freeze Fatia 0 |
| 2 | `app/src/executiveEngine/index.js` | Timeline: fio → fase sinais (ponto único) → classificador → Precedência → escritor → flags; early-returns §8; `comEnvelope`; deixar de chamar detectores ad hoc quando sinal já existe |
| 3 | `app/src/executiveEngine/resolucaoPrecedenciaTurno.js` | **Único decisor:** além do destino/bloqueios V1 já existentes, **devolver** a decisão de `modo` / `objecto` / `intençãoAtual` segundo mapa ARQ §6 e schema §7–§8 — **sem** alterar a ordem de autoridade V1 nem inventar regras novas |
| 4 | `app/src/executiveEngine/resolucaoPrecedenciaTurno.test.js` | Cobrir decisão de `modo`/objecto/intenção + regressão V1 destino |
| 5 | `app/src/turnEnvelope/imp091-fatia1.test.js` | **Novo** — CA-091-1…15; A–F; N1–N7; S1–S4; equivalência |

### 2.2 Tocados sob anti-redetecção / consumo de flags projectadas (leitura + remoção de 2.ª detecção)

| # | Ficheiro | Motivo |
|---|----------|--------|
| 6 | `app/src/mre/integracaoNucleo.js` | Hoje redetecta IG/consulta/PD; passar a flags/`opts` do envelope |
| 7 | `app/src/mre/pipeline/orquestrador.js` | Idem consulta/PD |
| 8 | `app/src/executiveEngine/capacidades/ia.js` | Idem consulta |
| 9 | `app/src/conversacaoNatural/compor.js` | Idem consulta/IG/análise |

### 2.3 Produtores existentes — **só invocados** (alteração mínima ou nula de API)

| # | Ficheiro | Sinal(is) |
|---|----------|-----------|
| 10 | `app/src/classificadorIntencao/pedidoInfoGathering.js` | `ig` |
| 11 | `app/src/classificadorIntencao/pedidoDecisaoExplicita.js` | `pd` |
| 12 | `app/src/mre/politicaAnaliseDeliberativa.js` | `consulta`, `analise` |
| 13 | `app/src/autoridadeDelegada/autoridadeDelegada.js` | `consulta_composta`, `execucao`, apoio `delegacao` |
| 14 | `app/src/classificadorIntencao/recomendacaoOperacional.js` | `objecto_turno` via `objectoDoTurno` |
| 15 | `app/src/classificadorIntencao/fioConversacional.js` | Fio mesmo `coaId` (input de objecto) |
| 16 | `app/src/continuidadeGate/integracaoConversa.js` | `gate_continuidade`, `gate_clarificacao` |
| 17 | `app/src/classificadorIntencao/validadorContextoAtivo.js` | `vca_clarificacao` |
| 18 | `app/src/classificadorIntencao/gestorTopicos.js` | componente CSC → `csc_clarificacao` |
| 19 | `app/src/classificadorIntencao/gestorObjectivo.js` | componente CSC → `csc_clarificacao` |
| 20 | `app/src/classificadorIntencao/resolverReferencias.js` | componente CSC → `csc_clarificacao` |
| 21 | `app/src/classificadorIntencao/regras.js` | `ehPedidoSituacionalTrabalho` **só** para `derivacoes.situacional` / telemetria; `ehPedidoAutodiagnosticoOuAutoavaliacaoCeo` no critério actual de panorama |
| 22 | `app/src/executiveEngine/classificar.js` + pipeline classificador (`classificadorIntencao/index.js` / integração Núcleo) | candidatos `classe_c` / destino (Precedência sela efectivo) |

### 2.4 Explicitamente **fora** do inventário de escrita

* REQ/ARQ/IMP/VAL-090; Trilha; HFC; Speaker; disciplina; reflexo; NCS (excepto se spy provar redetecção — aí só consumo de flag, sem nova regra).  
* `docs/README.md` — indexação IMP-091 fica para acto documental separado, se o CTO exigir.  
* **Não** criar detector novo; **não** criar chave `sinais.situacional`.

### 2.5 Ficheiros opcionais (só se reduzir risco de `index.js` monolítico)

Criar **apenas** se o Bloco B1 mostrar que helpers no `turnEnvelope/index.js` ficam ilegíveis — sem nova autoridade:

* `app/src/turnEnvelope/produzirSinais.js` — orquestra o ponto único de execução  
* `app/src/turnEnvelope/projectarFlags.js` — matriz ARQ §9  

Se criados, continuam sob o mesmo módulo `turnEnvelope` e a mesma norma.

---

## 3. Sequência de implementação por blocos pequenos

| Bloco | Objectivo | Critério de saída | Dependência |
|-------|-----------|-------------------|-------------|
| **B0** | Congelar baseline observável (destino, classe, early-path, flags chave) **antes** de código Fatia 1 | Artefacto: `app/src/turnEnvelope/imp091-b0-baseline.json` (+ fixtures/captura/teste) — **FEITO 12/09/2026** | — |
| **B1** | API TurnEnvelope COW: `registarPassoEnvelope`, `gravarSinalAppendOnce`, `selarInterpretacao` (materializa decisão), freeze | Testes unitários envelope; Fatia 0 continua verde — **FEITO 12/09/2026** (`imp091-b1-infra.test.js`) | B0 |
| **B2** | Ponto único de produção de sinais (ordem ARQ: ig → pd → consulta → restantes / objecto_turno) + `derivacoes.situacional` opcional | CA-091-1,2,13,14 parciais — **FEITO 12/09/2026** (BLOQUEIO-1 e -5 fechados) | B1 + BLOQUEIO-1/5 fechados |
| **B3** | Precedência devolve decisão interpretativa (`modo`/`objecto`/`intençãoAtual`) via mapa §6; escritor só copia | CA-091-3,4,5,15; regressão destino V1 | B2 + fecho **BLOQUEIO-1** e **BLOQUEIO-2** |
| **B4** | Early-returns: selagem schema ARQ §8 + projecção mínima antes de `return` | CA-091-11 | B3 |
| **B5** | Projecção unidireccional + divergência fail-soft | CA-091-6 | B3 |
| **B6** | Anti-redetecção nos consumidores §2.2 | CA-091-7,12 | B5 |
| **B7** | Matriz CA + A–F + N1–N7 + S1–S4 | CA-091-9,10 + S* | B4–B6 |
| **B8** | Matriz de equivalência vs baseline B0 | CA-091-8; critério VAL | B7 |

**Regra:** um bloco = um PR/commit lógico futuro; não misturar packaging MRE.

---

## 4. Produtor de cada sinal e ponto único de execução

### 4.1 Ponto único

**Local canónico:** fase no `executiveEngine.executar`, **após** `criarTurnEnvelope` + carga de fio mesmo `coaId`, **antes** do classificador completo (path feliz).

Função orquestradora (nome sugerido, sem nova autoridade): `produzirSinaisTurno(envelope, ctx) → novoEnvelope`.

* Input textual: **somente** `envelope.mensagemAtual` (e fio do mesmo `coaId` onde ARQ exige).  
* Append-once por chave; segunda escrita → telemetria + manter primeiro (produção); teste falha.  
* Early-return: produzir **apenas** os sinais já disponíveis nesse ponto (gate/AD/VCA/CSC conforme path) — ver §7.

### 4.2 Catálogo fechado → produtor → invocação

| Sinal | Produtor (existente) | Ponto único / fase |
|-------|----------------------|--------------------|
| `ig` | `detectarPedidoInfoGathering` | `produzirSinaisTurno` — **1.º** |
| `pd` | `detectarPedidoDecisaoExplicita` | idem — **2.º** (se ambos true, Precedência força `pd=false` + telemetria — regra já normativa) |
| `consulta` | `detectarPedidoConsultaResposta` | idem — **3.º** |
| `consulta_composta` | `ehPedidoConsultaOuRespostaComposta` | idem — restantes |
| `panorama` | **mesmo critério actual** em `executiveEngine` (`estado atual` / resumo executivo / memória executiva, **exceto** situacional e autodiagnóstico CEO) | idem — **não** novo detector |
| `analise` | `detectarPedidoAnaliseDeliberativa` | idem |
| `delegacao` | Activação AD / pedido delegação explícita (APIs AD já usadas no Núcleo) | fase AD / sinais quando AD já avaliada |
| `execucao` | `ehOrdemExecucaoOperacional` | idem |
| `objeto_operacional` | Boolean já usado como `objetoOperacionalReal` na Precedência (hoje tipicamente alinhado a ordem AD) | **materializado após/durante** decisão Precedência — não é detector lexical novo |
| `gate_continuidade` / `gate_clarificacao` | `decidirInterceptacaoContinuidade` | path Gate |
| `vca_clarificacao` | VCA (`validadorContextoAtivo`) | path VCA |
| `csc_clarificacao` | gestores tópico/objectivo/referente | path CSC |
| `objecto_turno` | `objectoDoTurno(mensagemAtual, fioMesmoCoa)` | `produzirSinaisTurno` (1×) |
| `classe_c` | Classificador (candidato) | pós-classificador; Precedência sela efectivo |
| `destino` | Precedência (efectivo) | pós-Precedência |
| `cto003_candidato` | Interceptação CTO-003 já existente no Núcleo | path CTO-003 |
| `ad_activacao_ack` | AD primeira activação (já existente) | path AD ack |

### 4.3 Fora do catálogo (obrigatório na implementação)

* **Não** gravar `sinais.situacional`.  
* Opcional: `envelope.derivacoes.situacional` **ou** passo `rastreio` com o resultado de `ehPedidoSituacionalTrabalho(mensagemAtual)` — **sem** mapa de modo, **sem** flag soberana.  
* **Não** usar `ehPedidoAnaliseOuRecomendacao` como produtor de `analise`.

---

## 5. Mecanismo de escrita / selagem do TurnEnvelope

### 5.1 Freeze Fatia 0

`criarTurnEnvelope` continua a devolver `Object.freeze`. **Proibido** mutar in-place.

### 5.2 Copy-on-write (ARQ §11)

| API | Responsabilidade |
|-----|------------------|
| `registarPassoEnvelope(envelope, passo) → novoEnvelope` | Concatena `rastreio`; freeze |
| `gravarSinalAppendOnce(envelope, chave, registo) → novoEnvelope` | Só se chave ausente; formato `{ id, valor, fonte, em, fase }` |
| `selarInterpretacao(envelope, decisaoPrecedencia) → novoEnvelope` | Copia **somente** campos decididos: `modo`, `objecto`, `intençãoAtual`, `autoridade`, sinais `classe_c`/`destino`/`objeto_operacional` quando a Precedência os emitir; **sem** reavaliar mapa |

Passos mínimos de `rastreio`: `create` → `sinais` → `selagem` → `projecao_flags` → opcional `divergencia_flag`.

### 5.3 Quem escreve o quê

| Campo | Quem decide | Quem escreve |
|-------|-------------|--------------|
| `sinais.*` (catálogo) | Produtores (valor) | `produzirSinaisTurno` / append-once |
| `modo`, `objecto`, `intençãoAtual`, `autoridade` | **`resolverPrecedenciaTurno`** | `selarInterpretacao` (escritor) |
| Flags legadas | — | Função de projecção (§6) |

**Violação:** qualquer `if` no escritor que escolha `modo` sem ler a decisão da Precedência.

---

## 6. Projecção unidireccional `envelope → flags`

Implementar `projectarFlagsDoEnvelope(envelope, alvoFlags) → { flags, divergencias[] }` conforme ARQ §9:

| Sinal | Flag / alvo |
|-------|-------------|
| `ig` | `pedidoInfoGathering` |
| `pd` | `pedidoDecisao` (e inputs Precedência já existentes) |
| `consulta` | `pedidoConsulta` / `pedidoConsultaResposta` |
| `consulta_composta` | booleano interno Precedência se já existir; senão só sinal |
| `panorama` | input Precedência `panoramaEstadoGeral` |
| `analise` | `pedidoAnalise` / `pedidoAnaliseDeliberativa` |
| `delegacao` / `execucao` / `objeto_operacional` | booleanos AD/Precedência existentes |
| `objecto_turno` | **sem** flag booleana — só `envelope.objecto` |
| `derivacoes.situacional` | **nenhuma** flag soberana |

Norma produção (REQ):

1. Envelope vence.  
2. Flag divergente não altera rota/destino/modo/prosa.  
3. Reprojectar **ou** ignorar órfã.  
4. Telemetria `divergencia_flag`; **fail-soft** (não aborta).  

**Proibido:** flags → envelope.

---

## 7. Anti-redetecção

1. Se `envelope.sinais[chave]` existe → **não** rerodar o detector canónico.  
2. Consumidores §2.2: preferir opts/flags projectadas (`pedidoInfoGathering`, `pedidoConsultaResposta`, etc.).  
3. Fallback controlado (ARQ §10): só se fase de sinais/envelope ausente; **proibido** valor oposto ao envelope; telemetria `fallback_sem_sinal`.  
4. Spy/contagem nos testes: detectores canónicos ≤1× no path feliz (CA-091-1).

---

## 8. Tratamento dos early-returns

Antes de **cada** `return` early (Gate / AD ack / AD execução / VCA / CSC), nesta ordem:

1. Garantir sinais aplicáveis já append-once.  
2. Obter decisão da Precedência **ou** veredicto early já emitido por `resolverPrecedenciaTurno` nesse path (o Núcleo **já** chama Precedência em vários early-paths — reutilizar).  
3. Escritor aplica schema **obrigatório** ARQ §8 (`modo`, `objecto`, `intençãoAtual` completa).  
4. Projectar flags aplicáveis.  
5. `anexarTurnEnvelopeNaResposta` / `comEnvelope`.

| Path | `modo` (schema) | `intençãoAtual.classe` (schema) |
|------|-----------------|----------------------------------|
| Gate continuidade | `informar` (ou `clarificar` se clarif) | `continuidade_gate` |
| Gate clarificação | `clarificar` | `clarificacao_gate` |
| AD ack | `informar` | `autoridade_delegada` |
| AD execução | `executar` | `C3` |
| VCA | `clarificar` | `clarificacao_contexto` |
| CSC | `clarificar` | `clarificacao_topico` \| objectivo \| referente \| … |
| C1…C4 | mapa §6 | C1…C4 |

Objecto: `objectoDoTurno` 1× se fio disponível; senão `indefinido` (schema).

---

## 9. Estratégia de compatibilidade / fail-soft

| Situação | Comportamento |
|----------|----------------|
| Divergência flag ↔ envelope | Envelope vence; telemetria; não aborta |
| Segunda escrita de sinal | Mantém primeiro; telemetria; teste falha |
| Fallback detector sem sinal | Uma vez; alinhar ao envelope se já selado; telemetria |
| Delta na matriz de equivalência | **Bloqueio VAL** — não “aceitar por omissão” |
| Metadados sem sinal 1:1 (`forcarC2`, `mreInvocado`, …) | Continuam pós-selagem **se** não contradisserem `modo`/`objecto`/`intençãoAtual` |
| Downstream | Só flags projectadas / assert; não reescreve interpretativos |

Compatibilidade com API actual de Precedência que ainda nomeia `pedidoSituacionalTrabalho`: ver **BLOQUEIO-1** — mapeamento explícito, sem gravar sinal `situacional`.

---

## 10. Matriz de testes (CA-091-1…15 + A–F + N1–N7 + S1–S4)

Ficheiro principal: `app/src/turnEnvelope/imp091-fatia1.test.js` (+ regressão Precedência / Gate / AD / VCA / E4 / IG-PD / D25 conforme VAL).

| ID | Verificação objectiva |
|----|------------------------|
| **CA-091-1** | Spy: cada detector canónico ≤1 chamada no path feliz |
| **CA-091-2** | `envelope.sinais` contém só chaves do catálogo aplicáveis; formato `{id,valor,fonte,em,fase}` |
| **CA-091-3** | Exactamente um `modo` ∈ enum ARQ |
| **CA-091-4** | Exactamente um `objecto` selado; origem `objectoDoTurno` |
| **CA-091-5** | `intençãoAtual` = `{ classe, destino, confiança, sinais }` completo |
| **CA-091-6** | Após projecção flags ≡ sinais; injecção de flag órfã → envelope vence |
| **CA-091-7** | Tentativa downstream de reescrever `modo`/sinais falha ou é no-op + telemetria |
| **CA-091-8** | Matriz §11 verde vs baseline B0 |
| **CA-091-9** | Casos **A–F** (REQ) PASS |
| **CA-091-10** | **N1–N7** PASS |
| **CA-091-11** | Cada early-return com schema §8 completo |
| **CA-091-12** | Com sinal presente, 2.ª chamada ao detector = 0 |
| **CA-091-13** | Assert: nenhuma chave fora do catálogo com autoridade; zero `sinais.situacional` |
| **CA-091-14** | Situacional puro → `consulta=true`; sem sinal situacional autoritativo; `modo=informar` |
| **CA-091-15** | `modo`/`objecto`/`intençãoAtual` iguais à struct devolvida pela Precedência (escritor byte-a-byte / deepEqual) |
| **A** | T1 factos → T2 prioridade negócio → B / `deliberar` / C2 / `nucleo_mre` |
| **B** | «Tome a decisão agora.» → `decidir` / PD / não IG |
| **C** | E4 operacional → A / `informar` / C4 |
| **D** | IG+PD lexical em propósito → `info_gathering`; `pd=false` |
| **E** | Misto A+B → `misto`; não força E4 |
| **F** | Fio outro COA excluído |
| **N1–N7** | Conforme REQ-091 |
| **S1** | Situacional puro → `consulta`; sem `sinais.situacional`; `modo=informar` |
| **S2** | Situacional + execução lexical → `consulta` bloqueia execução (mapa #4) |
| **S3** | Flag “situacional” órfã → envelope/`consulta` vence |
| **S4** | `consulta_composta` ≠ fundir com `consulta` |

Comando previsto:  
`node --test src/turnEnvelope/imp091-fatia1.test.js src/executiveEngine/resolucaoPrecedenciaTurno.test.js` (+ suites regressão listadas no VAL).

---

## 11. Matriz de equivalência contra a baseline

### 11.1 Baseline (B0)

Correr **antes** da mudança Fatia 1 um harness que, para cada fixture da matriz, regista:

| Observável | Campo |
|------------|--------|
| Destino efectivo | `encaminhamento.destino` / equivalente |
| Classe | C1…C4 / sentinel early |
| Early-path | gate \| ad_ack \| ad_exec \| vca \| csc \| none |
| `forcarC2` | boolean se existir |
| Flags chave | `pedidoInfoGathering`, `pedidoDecisao`, consulta/AD relevantes |
| Prosa (opcional hash) | só se VAL exigir — default: **não** bloquear por prosa se destino/classe iguais |

Fixtures mínimas: A–F, N1–N7, S1–S4, 1× Gate, 1× AD ack, 1× VCA, 1× E4 A, 1× B/C2, 1× IG/PD/D25.

### 11.2 Pós-Fatia 1

Mesmos inputs → comparar observáveis. **Verde** só se:

* destino = baseline  
* classe = baseline  
* early-path = baseline  
* sem delta intencional de rota  

Delta detectado = **falha CA-091-8 / bloqueio VAL** (REQ).

Envelope acrescenta `modo`/`sinais` — campos novos **não** contam como regressão desde que os observáveis baseline coincidam.

---

## 12. Critérios objectivos de VAL-091

VAL-091 (documento futuro) só pode **APROVAR** se:

1. CA-091-1…15 PASS.  
2. A–F, N1–N7, S1–S4 PASS.  
3. Matriz de equivalência §11 verde.  
4. Build OK (`app` test/build conforme prática do repo).  
5. Regressão mínima verde: `resolucaoPrecedenciaTurno`, continuidade Gate, AD EE, VCA, E4 recomendação, IG vs PD / D25 disciplina.  
6. Auditoria estática amostral: zero escrita flags→envelope; zero `sinais.situacional` autoritativo; escritor sem ramo de escolha de `modo`.  
7. Nenhum BLOQUEIO §13 aberto.

**Não** exige: remoção de flags; packaging MRE; commit (acto separado).

---

## 13. Bloqueios técnicos (não resolver por suposição)

| ID | Incerteza | Por que bloqueia | Desbloqueio exigido |
|----|-----------|------------------|---------------------|
| **BLOQUEIO-1** | API actual de `resolverPrecedenciaTurno` consome `pedidoSituacionalTrabalho`, não `consulta`. ARQ: `consulta` canónico; `situacional` só telemetria. | Mapear mal = nova regra de precedência **ou** regressão de destino | **FECHADO (B2):** ver §16 — `detectarPedidoConsultaResposta(texto)` plain ≡ `ehPedidoSituacionalTrabalho`; Precedência continua a receber `pedidoSituacionalTrabalho` ← `derivacoes.situacional` (mesmo produtor); `sinais.consulta` separado; sem fundir produtores |
| **BLOQUEIO-2** | Código actual da Precedência **não** devolve `modo`/`objecto`/`intençãoAtual` | ARQ exige Precedência como decisor desses campos | Estender **só** o *output* com campos derivados do mapa ARQ §6 + destino já calculado pela V1; se mapa §6 divergir do comportamento baseline observável → VAL bloqueado / CTO — **não** “ajustar” o mapa na IMP |
| **BLOQUEIO-3** | Gate early-return ocorre **antes** da fase AD/sinais completos no `executiveEngine` actual | Timeline ARQ vs ordem real de early Gate | **Mitigado em B2:** sinais produzidos imediatamente após create (antes do Gate); Gate early leva envelope com sinais sem alterar decisão Gate. Selagem §8 = B4 |
| **BLOQUEIO-4** | Critério exacto de `objeto_operacional` / `objetoOperacionalReal` espalhado por callsites | Risco de novo detector disfarçado | Fixar: reutilizar **apenas** o boolean já passado hoje a `resolverPrecedenciaTurno` em cada fase; inventário call-site na B3 |
| **BLOQUEIO-5** | Interleaving exacto: classificador chama `objectoDoTurno` internamente **e** sinal `objecto_turno` | Dupla execução vs CA-091-1 | **FECHADO (B2):** ver §16 — única chamada em `produzirSinaisTurno`; `contexto.objectoTurno` / `opts.objectoTurno` no classificador e `ehRecomendacaoOperacional` |

Enquanto BLOQUEIO-2 estiver aberto, **não** avançar B3+ em código de produção (decisão de `modo`).

---

## 16. Evidência BLOQUEIO-1 e BLOQUEIO-5 (B2)

### BLOQUEIO-1 — fechado

| Facto | Evidência |
|-------|-----------|
| Precedência consome `pedidoSituacionalTrabalho` | `resolucaoPrecedenciaTurno.js` typedef `SinaisPrecedencia` + ramos `if (s.pedidoSituacionalTrabalho)` |
| EE (pré-B2) alimentava com `ehPedidoSituacionalTrabalho` | `executiveEngine/index.js` (histórico) |
| `detectarPedidoConsultaResposta(texto)` sem ctx | `politicaAnaliseDeliberativa.js` L177–184 → `return ehPedidoSituacionalTrabalho(normalizarTexto(texto))` |
| Equivalência B0 plain | Em **todos** os 24 fixtures B0: `sit === consulta` (plain); `tipoTurno:"consulta"` força consulta true (ctx pós-Precedência — **não** usar na produção de sinal) |
| Mapeamento B2 | `sinais.consulta` ← `detectarPedidoConsultaResposta(texto)` plain; `derivacoes.situacional` ← `ehPedidoSituacionalTrabalho`; Precedência ← `derivacoes.situacional`; **sem** `sinais.situacional` |

### BLOQUEIO-5 — fechado

| Call site produção (pré-B2) | Papel |
|-----------------------------|--------|
| `recomendacaoOperacional.objectoDoTurno` | Definição |
| `ehRecomendacaoOperacional` → `objectoDoTurno` | E4 |
| `ehPedidoAnaliseOuRecomendacao` → `objectoDoTurno` | C2 análise |
| `regras.classificar` / `mapearCapacidadePorTexto` | Via E4/análise |
| Testes / B0 harness | Observação |

**Decisão B2:** `produzirSinaisTurno` chama `objectoDoTurno` **1×**; grava `sinais.objecto_turno`; classificador recebe `objectoTurno` e **não** recalcula.

---

## 14. Não fazer

* Novo sinal, detector, ou regra de precedência.  
* `sinais.situacional` com autoridade.  
* Espelho bidireccional.  
* Packaging MRE / `políticaSubstituição`.  
* Alterar REQ/ARQ-090.  
* Commit sem pedido explícito.

---

## 15. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | REQ-091 v0.3 HOMOLOGADO |
| ARQ | ARQ-091 v0.3 HOMOLOGADA |
| Fatia 0 | REQ/ARQ/IMP/VAL-090 |
| Capacidade | CAP-01 |
| VAL | VAL-091 *(a criar após implementação)* |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | Plano executável pós-homologação REQ/ARQ-091 v0.3 | **PLANO** — sem código |
| 0.1-B0 | 12/09/2026 | Engenheiro | Bloco B0: baseline observável congelada | **B0 FEITO** |
| 0.1-B1 | 12/09/2026 | Engenheiro | Bloco B1: COW TurnEnvelope (sem wiring produção) | **B1 FEITO** |
| 0.1-B2 | 12/09/2026 | Engenheiro | Bloco B2: produzirSinaisTurno + fecho BLOQUEIO-1/5 | **B2 FEITO** — B3+ não iniciados |

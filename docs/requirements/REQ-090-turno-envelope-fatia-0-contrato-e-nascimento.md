# REQ-090 — Contrato e nascimento do TurnEnvelope (Fatia 0)

> **Status: Rascunho — v0.2 (12/09/2026).** Aguarda nova homologação CTO.  
> **Versão:** 0.2 — 12/09/2026  
> **Capacidade:** CAP-01 — Governança  
> **Nome normativo:** TurnEnvelope — Fatia 0 (contrato e nascimento)  
> **Lastro adjacente (não altera contratos):** CAP-07 — Comunicação; [ARQ-018](../architecture/ARQ-018-classificacao-de-intencao.md) (classificação de intenção no limiar da conversa).  
> **Limites vigentes desta fatia:** só contrato + criação + transporte paralelo em sombra; **zero** mudança comportamental; **zero** migração de autoridade/detectores/políticas.  
> **IMP:** ainda **não** autorizado (sem IMP-090 até homologação).

## Enunciado

O CEO deverá representar cada turno conversacional admitido no Núcleo por uma unidade central de execução chamada **TurnEnvelope**, criada no início do fluxo do `executiveEngine` (após `normalizarInstrucao`), com contrato mínimo estável, campos `mensagemAtual`, `perguntaAtual` e `coaId` selados na criação, isolamento semântico por COA no envelope, e transporte em paralelo ao contexto legado (`ctx.envelope`) como **sombra** — **sem** alterar rota, destino, prosa, flags nem política observáveis na Fatia 0.

## Tipo

Funcional; detalhado (primeira fatia verificável). Requisitos de governação do ciclo de turno.

## Justificativa

CON-001 Art. 9º princípios 2 (nunca perder o contexto), 3 (nunca executar sem objectivo claro) e 8 (transparência sobre limitações); ADR-006 (fluxo REQ→ARQ→IMP→VAL); ADR-015; ARQ-013; ARQ-018 / REQ-057; ARQ-020 / REQ-059; ARQ-026 / REQ-065.

A Lente de Engenharia TurnEnvelope diagnosticou que o turno actual viaja como `texto` / `instrucao` / `mensagem` / string enriquecida, com detectores e substituições locais. Sem unidade central, a pergunta actual deixa de governar o pipeline nas fatias futuras. A Fatia 0 formaliza o **contrato e o nascimento** antes de qualquer migração de autoridade.

## Problema actual

* Não existe objecto canónico de turno no Núcleo.
* A mesma intenção é reconstruída em vários módulos.
* Contexto, memória e estado operacional misturam-se com a instrução no pipeline legado.
* A Fatia 0 **não** corrige o pipeline legado — apenas introduz a unidade em sombra.

## Objectivo da capacidade (Fatia 0)

1. Definir o contrato semântico do `TurnEnvelope`.
2. Criar o envelope no início de `executiveEngine.executar`, após `normalizarInstrucao`, **antes** de early-returns.
3. Transportá-lo em paralelo (`ctx.envelope`) até pelo menos o caminho C2, e garantir nascimento também nos early-returns oficiais.
4. Preservar **bit-a-bit** o comportamento observável das respostas (envelope = sombra).

## Escopo

### Inclui (Fatia 0)

* Contrato mínimo dos campos (secção Contrato).
* Ponto canónico de criação: imediatamente após `normalizarInstrucao` em `executiveEngine.executar`.
* Preenchimento mínimo no nascimento e selagem de `mensagemAtual`, `perguntaAtual`, `coaId` (e metadados de create).
* Transporte `ctx.envelope` em paralelo às flags e estruturas legadas (**sombra**).
* Rastreio mínimo em memória (`rastreio`), **sem** escrever na Trilha Auditável V1.
* Testes: nascimento (incluindo early-returns), selagem, âncora de mensagem, `coaId` no create, presença em C2, critério negativo de sombra, não-regressão comportamental.

### Fora do escopo (Fatia 0) — explícito

* Sinais canónicos únicos; migração de detectores para “sinais”.
* Escrita canónica de `objecto` / `modo` / `intençãoAtual` como autoridade (campos existem no contrato; permanecem `null` / `indefinido`; **proibida** escrita com efeito comportamental).
* Fio único obrigatório no envelope; novo packaging MRE; `políticaSubstituição`.
* Alterações a Speaker, CN, NCS, disciplina, reflexo, VCA, classificador, Precedência (além de anexar a referência do envelope sem a consultar para decidir).
* Resolução de divergências `envelope.coaId` vs `ctx.coaAtivo` pós-VCA.
* Alterações de encerramento / pós-deliberação / Trilha V1 / HFC / MO / MEP.
* Qualquer mudança intencional de prosa, rota, destino ou flags observáveis.
* **Não** migra autoridade do pipeline legado para o envelope.

## Fronteiras

```
TurnEnvelope ≠ ParecerExecutivo ≠ ComunicadoExecutivo ≠ HFC ≠ Trilha V1 ≠ MO ≠ MTE
```

| Artefacto | Relação |
|-----------|---------|
| **TurnEnvelope** | Unidade de execução do turno (este REQ); na Fatia 0 = **sombra** |
| **Precedência V1 / Classificador / MRE / Speaker / CN / disciplina / reflexo** | Continuam autoridade operacional; **não** leem envelope para decidir |
| **Trilha Auditável V1 (ARQ-088)** | **Não** alterada |
| **HFC (REQ-087)** | Isolada |
| **CAP-07 / ARQ-018** | Lastro adjacente do limiar conversacional; contratos **inalterados** |

## Âncoras de criação (normativas)

### Mensagem

* **`mensagemAtual`** = o campo **`texto`** produzido por `normalizarInstrucao(entrada)` no `executiveEngine`.
* **`perguntaAtual`** = **`mensagemAtual`** na Fatia 0 (ambos selados na criação).

### COA

No create:

```text
coaId = coaIdEntrada || obterCoaAtivo()?.id || "__sem_coa__"
```

onde `coaIdEntrada` é o `coaId` devolvido por `normalizarInstrucao`.

* **CA-090-3** mede o `coaId` **somente no momento da criação**.
* Divergências posteriores entre `envelope.coaId` e o contexto pós-VCA (`ctx.coaAtivo` / isolamento) **não** são resolvidas nesta fatia e **não** são lidas para comportamento.

### Selagem

Estratégia documentada: propriedades seladas (`mensagemAtual`, `perguntaAtual`, `coaId`, e metadados de create `idTurno` / `timestamp` / `canal`) tornam-se **não reatribuíveis** (ex. `Object.freeze` / descritores non-writable).  
Tentativa de alteração em teste → **falha** (`TypeError` ou equivalente) **ou** no-op sem mutar o valor — a IMP deve escolher **uma** estratégia e os testes CA-090-8 devem conformar-se a ela; o REQ exige que o valor observado **permaneça** o da criação.

## Shadow envelope (critério negativo)

Na Fatia 0:

* Nenhum ramo comportamental pode consultar `ctx.envelope` (nem campos seus) para **alterar** rota, destino, prosa, flags ou política.
* O envelope **existe** e é **transportado**; permanece **sombra**.
* Leitura permitida **apenas** para asserts de teste / observabilidade de presença e selagem.

## Contrato mínimo (semântica)

| Campo | Semântica Fatia 0 | Valor inicial Fatia 0 |
|-------|-------------------|------------------------|
| `idTurno` | Identificador estável do turno | Gerado na criação; selado |
| `timestamp` | Instante de criação (ISO-8601) | Gerado na criação; selado |
| `canal` | `chat` \| `voz` \| `centro` \| outro documentado | Do ingresso; selado |
| `coaId` | Regra de create acima | Selado no create |
| `mensagemAtual` | `texto` de `normalizarInstrucao` | Obrigatório; selado |
| `perguntaAtual` | Pergunta que governa (futuro) | `= mensagemAtual`; selado |
| `objecto` | `A` \| `B` \| `misto` \| `indefinido` | `indefinido` (não preenchido como autoridade) |
| `intençãoAtual` | `{ classe, destino, confiança?, sinais? }` | `null` |
| `modo` | `deliberar` \| `informar` \| `decidir` \| `executar` \| `clarificar` \| `info_gathering` | `null` |
| `fioConversacional` | Mensagens do mesmo COA (futuro) | `[]` |
| `evidênciasRelevantes` | Factos oficiais (futuro) | `[]` |
| `memóriaRelevante` | Recorte memória/MTE (futuro) | `null` |
| `estadoDaTarefa` | Gate/Job/AD (futuro) | `null` |
| `restrições` | Restrições do turno (futuro) | `null` ou `{}` |
| `autoridade` | Snapshot precedência (futuro) | `null` |
| `sinais` | Sinais brutos (futuro) | `null` ou `{}` |
| `rastreio` | Passos do envelope | `[{ fase: "create", ... }]` |
| `parecer` / `candidatoProsa` / `prosaFinal` / `políticaSubstituição` | Saída reservada | `null` |

## Invariantes (Fatia 0)

| ID | Invariante | Âmbito |
|----|------------|--------|
| **I1** | `mensagemAtual` nunca é alterada após criação. | Envelope |
| **I2** | Nenhuma camada pode substituir a **pergunta actual no envelope**: `perguntaAtual` permanece igual a `mensagemAtual` e ambos selados. | **Somente TurnEnvelope** — o pipeline legado pode continuar a enriquecer strings (`entrada.mensagem`, etc.) e a substituir prosa até fatias de migração posteriores. |
| **I3** | Contexto não é instrução **no envelope**: fio/evidência/memória não são concatenados em `mensagemAtual`/`perguntaAtual`. | Envelope |
| **I4** | Memória não é mandato **no envelope**: `memóriaRelevante` (quando existir) não redefine `modo`/`intençãoAtual` do envelope. | **Somente TurnEnvelope** — o legado pode continuar a usar MTE/memória como hoje. |
| **I5** | Estado operacional não substitui intenção **no envelope**: `estadoDaTarefa` não escreve `intençãoAtual` do envelope. | **Somente TurnEnvelope** — Gate/Job/AD no legado mantêm comportamento próprio. |
| **I6** | Outro COA não é fundido no `coaId` selado do create; fio futuro (fatias posteriores) filtrará pelo mesmo id. | Envelope |
| **I7** | Comportamento observável do pipeline legado **inalterado** na Fatia 0 (sombra). | Sistema |
| **I8** | Envelope ≠ Parecer ≠ Comunicado ≠ HFC ≠ Trilha V1. | Sistema |
| **I9** | Ausência de envelope em callers de teste legados não quebra o pipeline (fail-soft); via conversacional oficial **sempre** cria. | Sistema |
| **I10** | Fatia 0 **não** escreve Trilha Auditável V1. | Sistema |
| **I11** | Nenhum ramo comportamental consulta o envelope para decidir (shadow). | Sistema |

**Nota explícita:** I2, I4 e I5 **não** declaram que essas regras já governam toda a aplicação na Fatia 0.

## Critérios de aceitação

| ID | Critério | Observável |
|----|----------|------------|
| **CA-090-1** | Envelope nasce em **todo** turno admitido em `executiveEngine.executar` pela via conversacional oficial, **incluindo** early-returns (Gate continuidade/clarificação, AD, VCA/CSC e demais early-returns relevantes do mesmo `executar`). | `envelope` presente após create em cada path |
| **CA-090-2** | `mensagemAtual` = `texto` de `normalizarInstrucao` e permanece igual até ao fim do turno. | Assert create↔fim |
| **CA-090-3** | `coaId` no **momento da criação** = `coaIdEntrada \|\| obterCoaAtivo()?.id \|\| "__sem_coa__"`. | Assert só no create |
| **CA-090-4** | No caminho C2 (rota deliberativa / integração MRE / `capacidadeIa` MRE), `ctx.envelope` está disponível. | Assert de presença |
| **CA-090-5** | Comportamento observável das respostas **inalterado** face à baseline da suíte existente. | Suíte verde sem mudança de expectativas de conteúdo |
| **CA-090-6** | Trilha Auditável V1 **sem** novos eventos nem writers por esta fatia. | Diff / testes Trilha intactos |
| **CA-090-7** | Campos de saída reservados existem e não são obrigatoriamente preenchidos; `modo`/`objecto`/`intençãoAtual` não actuam como autoridade. | Contrato + defaults |
| **CA-090-8** | Tentativa de alterar `mensagemAtual`, `perguntaAtual` ou `coaId` após create → falha ou no-op conforme estratégia de selagem; valor permanece o da criação. | Teste de selagem |
| **CA-090-9** | Critério negativo (sombra): nenhum ramo de produção usa `ctx.envelope` para alterar rota, destino, prosa, flags ou política. | Revisão estática / teste de ausência de dependência comportamental |
| **CA-090-10** | Early-returns Gate, AD e VCA/CSC (e demais relevantes) nascem envelope sem alterar a prosa/destino esperados pela baseline. | Testes dedicados + CA-090-5 |

## Compatibilidade

Flags legadas, classificador, fio, VCA, MRE, Speaker, CN, disciplina e reflexo **permanecem** a autoridade operacional. O envelope convive em paralelo e **não** as substitui na Fatia 0.

## Dependências

* CON-001; ADR-006; ADR-010; ADR-015.
* ARQ-013; ARQ-018 (lastro adjacente); ARQ-020; ARQ-026; ARQ-088 (fronteira — não emendar).
* ARQ-090 (este ciclo).
* Lente de Engenharia TurnEnvelope (aprovada) — origem.
* Homologação técnica prévia (ajustes v0.2).

## Riscos e incertezas

* Envelope “morto” sem asserts de early-return — mitigado por CA-090-1/10.
* IMP que leia envelope para “ajudar” — proibido por CA-090-9 / I11.
* Confundir I2/I4/I5 com governação total do sistema — esclarecido no âmbito.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 (primária) |
| Lastro adjacente | CAP-07; ARQ-018 (**sem** alterar esses contratos) |
| Norma superior | CON-001 Art. 9º p. 2, 3, 8; ADR-006; ADR-015 |
| Origem | Lente de Engenharia TurnEnvelope; homologação técnica NÃO APROVADO → ajustes v0.2 |
| Arquitectura | ARQ-090 |
| Implementação | *(após homologação CTO — IMP-090; ainda não criado)* |
| Testes | CA-090-1…10; VAL futuro |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | Proposta inicial (chat) | Formalizar unidade de turno | Não persistida; NÃO APROVADO na homologação técnica |
| 0.2 | 12/09/2026 | Engenheiro | Persistência + ajustes homologação | coaId, âncora mensagem, sombra, early-returns, selagem, âmbito I2/I4/I5 | **Rascunho** — aguarda homologação CTO |

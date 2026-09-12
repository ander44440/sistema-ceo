# REQ-091 — Sinais canónicos e escrita de modo/objecto/intenção no TurnEnvelope (Fatia 1)

> **Status: Rascunho — v0.3 (12/09/2026).** Aguarda nova homologação técnica e CTO.  
> **Versão:** 0.3 — 12/09/2026  
> **Capacidade:** CAP-01 — Governança  
> **Nome normativo:** TurnEnvelope — Fatia 1 (sinais → modo / objecto / intenção)  
> **Lastro adjacente (não cria autoridade nova):** CAP-07 — Comunicação; [ARQ-018](../architecture/ARQ-018-classificacao-de-intencao.md).  
> **Dependência:** REQ-090 / ARQ-090 / IMP-090 / VAL-090 (Fatia 0 homologada).  
> **IMP-091:** **não** criado; **proibido** até homologação deste REQ/ARQ.  
> **Emenda de transição Fatia 0→1:** ver § Transição (não altera o texto congelado de REQ-090; declara o efeito normativo desta fatia).

## Enunciado

O CEO deverá, em cada turno admitido no Núcleo, produzir **uma vez** o **catálogo fechado** de sinais canónicos (ARQ-091) a partir de `mensagemAtual` (e fio do mesmo COA quando exigido), gravá-los no `TurnEnvelope` como **única fonte canónica** de interpretação do turno; o **único decisor** de destino, `modo`, `objecto` e composição de `intençãoAtual` é `resolucaoPrecedenciaTurno` (alimentado pela interpretação do Classificador e pelos sinais); o escritor pós-Precedência **apenas materializa e sela** essa decisão (sem poder interpretativo próprio); projecta-se depois **somente** `TurnEnvelope → flags legadas` — sem re-detecção que crie segunda verdade, sem flags a reescrever o envelope, e sem delta **intencional** de destino/classe/rota face à baseline; qualquer delta causado pela execução única dos detectores só é aceitável se a **matriz de equivalência** da IMP estiver verde.

## Tipo

Funcional; detalhado (segunda fatia verificável).

## Justificativa

CON-001 Art. 9º p. 2–3, 8; ADR-006; ADR-015; Lente de Engenharia TurnEnvelope; Fatia 0 (unidade nasce selada). Re-homologação v0.1 e fecho v0.3: catálogo de sinais fechado (nada “para a IMP”); `consulta` primário vs `situacional` só derivação; Precedência = único decisor, escritor só sela.

## Autoridade de escrita (norma absoluta)

| Papel | Quem | Pode | Não pode |
|-------|------|------|----------|
| **Único decisor** | `resolucaoPrecedenciaTurno` | Decidir destino efectivo, bloqueios, e a **decisão** de `modo` / `objecto` / conteúdo de `intençãoAtual` (com base em sinais + Classificador) | — |
| **Interpretação candidata** | Classificador (ARQ-018) | Propor classe/destino candidatos | Selar ou sobrescrever após Precedência |
| **Escritor pós-Precedência** | Núcleo (materializador) | **Somente** materializar/selar no envelope o que a Precedência já decidiu; projectar flags | Interpretar, arbitrar, escolher `modo`/`objecto`/`destino` por conta própria |
| **Produtores de sinal** | Detectores do catálogo fechado | Append-once de `sinais` | Decidir `modo`/destino |

**Inequívoco:** se o escritor pós-Precedência precisar “escolher” entre alternativas, a norma está violada — a escolha pertence à Precedência.

## Catálogo de sinais (fechado na Fatia 1)

O conjunto canónico necessário à Fatia 1 está **fechado** em ARQ-091 §5. **Nenhuma** decisão de produtor, chave ou significado fica “para a IMP”.

**Dentro do catálogo (autoridade de sinal):**  
`ig`, `pd`, `consulta`, `consulta_composta`, `panorama`, `analise`, `delegacao`, `execucao`, `objeto_operacional`, `gate_continuidade`, `gate_clarificacao`, `vca_clarificacao`, `csc_clarificacao`, `objecto_turno`, `classe_c`, `destino`, `cto003_candidato`, `ad_activacao_ack`.

**Fora do catálogo canónico (sem autoridade de sinal nesta fatia):**

| Item | Por quê |
|------|---------|
| `situacional` como sinal com autoridade própria | Redundante com `consulta` (ver secção seguinte); só derivação/telemetria |
| Novos detectores ad hoc / “outros sinais existentes” não listados | Expandir catálogo exige emenda REQ/ARQ — não IMP |
| `ehPedidoAnaliseOuRecomendacao` (lato) | Não é o produtor de `analise`; produtor = `detectarPedidoAnaliseDeliberativa` |
| Metadados (`forcarC2`, `mreInvocado`, …) | Não são sinais; derivados pós-selagem sob norma de não-contradição |

## `consulta` × `situacional` (norma absoluta)

* **Sinal canónico primário:** `consulta`, produzido **somente** por `detectarPedidoConsultaResposta` (`politicaAnaliseDeliberativa.js`).  
* Esse produtor **já** cobre o caso situacional via `ehPedidoSituacionalTrabalho` quando aplicável.  
* **`situacional` não é sinal com autoridade** na Fatia 1: não entra no mapa de modo, não arbitra conflitos, não é espelhado como flag soberana.  
* Pode existir **apenas** como derivação/telemetria (`rastreio` / campo auxiliar `derivacoes.situacional`) calculada a partir do mesmo critério interno do produtor de `consulta`, **sem** segunda verdade e **sem** poder de alterar `modo`/destino.  
* `consulta_composta` permanece sinal **distinto** (bloqueio AD / pedido composto) — não é sinónimo de `consulta` nem de situacional.  
* `panorama` permanece sinal **distinto** (panorama geral ≠ consulta situacional de trabalho).

## Transição Fatia 0 → Fatia 1 (emenda normativa desta fatia)

| Aspecto | Fatia 0 (REQ-090) | Fatia 1 (este REQ) |
|---------|-------------------|---------------------|
| Papel do envelope | **Sombra** (CA-090-9 / I11) | **Autoridade interpretativa** de `sinais` / `modo` / `objecto` / `intençãoAtual` |
| `mensagemAtual`, `perguntaAtual`, `coaId` | Selados; **não reabrir** | Permanecem selados; **inalteráveis** |
| Leitura comportamental | Proibida | Downstream usa **flags projectadas** do envelope; não reclassifica |
| Texto REQ-090 | Congelado | **Não emendado in-place**; esta tabela é a ponte normativa |

## Fonte única (norma absoluta)

```text
TurnEnvelope  →  flags legadas
```

* Envelope é a **única** fonte canónica de `sinais`, `modo`, `objecto`, `intençãoAtual`.  
* Flags legadas **NUNCA** escrevem nem corrigem esses campos.  
* **Proibido** o termo e o conceito de “espelho bidireccional”.

## Divergência em produção

Se, após projecção, uma flag legada divergir do envelope:

1. **Envelope vence** (fonte canónica).  
2. A flag divergente **não pode** alterar rota, destino, `modo`, prosa nem política.  
3. O runtime deve **reprojectar** a flag a partir do envelope **ou** ignorar a flag órfã (tratar como se espelhasse o envelope).  
4. Registar telemetria/`rastreio` (`fase: "divergencia_flag"`) — **fail-soft** (não aborta o turno).  
5. Nenhuma flag órfã assume autoridade.

## Equivalência comportamental (substitui “zero mudança absoluta”)

Nesta fatia:

* **Nenhum delta intencional** de destino, classe ou rota.  
* A execução única dos detectores sobre `mensagemAtual` (em vez de re-detecção em strings enriquecidas) pode, em teoria, divergir da baseline.  
* A IMP-091 só será aprovada se a **matriz de equivalência** (casos A–F, N1–N7, Gate/AD/VCA, E4 A, B/C2, IG/PD/D25) estiver **verde** face à baseline acordada.  
* Qualquer delta detectado na matriz = **bloqueio de VAL**, não “aceitável por omissão”.

## Escopo

* Catálogo de sinais **fechado** + produtores (incluindo `consulta` primário).  
* Timeline create → fio → sinais → classificador → **precedência (decide)** → **escritor (só sela)** → projecção → downstream.  
* Escrita única e selagem de `modo`, `objecto`, `intençãoAtual`, `autoridade` **como materialização da Precedência**.  
* Projecção `envelope → flags`.  
* Anti-redetecção.  
* Schemas de early-return.  
* Matriz sinal↔flag; CA A–F e N1–N7.  
* Estratégia de `rastreio` Fatia 1.

## Fora do escopo

* Packaging seccionado MRE; `políticaSubstituição`.  
* Remoção definitiva das flags.  
* Trilha Auditável V1; HFC; MO; MEP.  
* Reabrir ou alterar REQ/ARQ-090.  
* Migração de Speaker/CN/NCS/disciplina/reflexo para consumir só `envelope.modo` sem flags (lêem flags projectadas).

## Critérios de aceitação (CA-091)

| ID | Critério |
|----|----------|
| **CA-091-1** | Detectores canónicos ≤1× no path feliz. |
| **CA-091-2** | `envelope.sinais` completo conforme catálogo aplicável ao turno. |
| **CA-091-3** | Exactamente um `modo` selado. |
| **CA-091-4** | Exactamente um `objecto` selado via `objectoDoTurno`. |
| **CA-091-5** | Exactamente uma `intençãoAtual` completa `{ classe, destino, confiança, sinais }`. |
| **CA-091-6** | Após projecção, flags = envelope; em divergência envelope vence (norma produção). |
| **CA-091-7** | Downstream não reescreve campos interpretativos selados. |
| **CA-091-8** | Matriz de equivalência verde (sem delta intencional de destino/classe/rota). |
| **CA-091-9** | Casos **A–F** PASS (tabela normativa). |
| **CA-091-10** | Negativos **N1–N7** PASS. |
| **CA-091-11** | Early-returns com schema completo selado. |
| **CA-091-12** | Anti-redetecção: sinal presente ⇒ detector não reroda. |
| **CA-091-13** | Catálogo fechado: só chaves listadas em ARQ-091 §5 com autoridade; nenhuma decisão “para a IMP”. |
| **CA-091-14** | `consulta` primário; `situacional` ausente de `sinais` com autoridade (só derivação/telemetria). |
| **CA-091-15** | `modo`/`objecto`/`intençãoAtual` selados = materialização da Precedência; escritor sem escolha própria. |

## Casos normativos A–F

| ID | Input (resumo) | objecto | modo | classe | destino | Esperado |
|----|----------------|---------|------|--------|---------|----------|
| **A** | T1 factos → T2 «Qual deve ser nossa prioridade agora?» (negócio) | B | `deliberar` | C2 | `nucleo_mre` | Não E4; pergunta governa |
| **B** | T1 factos → T2 «Tome a decisão agora.» | B | `decidir` | C2 | `nucleo_mre` (ou forçar C2) | PD verdadeiro; não IG |
| **C** | T1 operação → T2 «Qual é a próxima decisão que você recomenda?» | A | `informar` | C4 | `capacidade_operacional` | E4 operacional; não B/C2 |
| **D** | IG + PD lexical em propósito («para decidir» / «tomar a decisão») | B ou misto | `info_gathering` | C2 | `nucleo_mre` | `ig`; `pd=false` |
| **E** | Pedido misto A+B | `misto` (B governa deliberação) | `deliberar` ou `info_gathering` conforme texto | C2 | `nucleo_mre` | Não força A/E4 |
| **F** | Fio/histório de outro COA | — | — | — | — | **Não entra** no `objectoDoTurno` nem em sinais de fio |

## Negativos normativos N1–N7

| ID | Caso | Esperado |
|----|------|----------|
| **N1** | «para decidir» / «antes de tomar a decisão…» | `pd=false`; tipicamente `ig=true`; `modo=info_gathering` |
| **N2** | Ordem IG tipo 74 | IG ≠ PD; `modo=info_gathering` |
| **N3** | Prioridade lexical sozinha | Não força `objecto=A` |
| **N4** | Fio com mandato/recomendação anterior | Não substitui intenção/pergunta actual |
| **N5** | C4/A operacional | `objecto=A`; destino operacional; não vira B |
| **N6** | B/misto legítimo | Permanece B/misto; C2 quando aplicável |
| **N7** | Outro COA no fio | Excluído do cálculo |
| **S1** | Situacional puro | `consulta=true`; sem `sinais.situacional` autoritativo; `modo=informar` |
| **S2** | Situacional + execução lexical | `consulta` bloqueia execução; telemetria situacional opcional |
| **S3** | Flag “situacional” órfã | Envelope/`consulta` vence |
| **S4** | `consulta_composta` | Distinto de `consulta`; não fundir |

## Pronto para IMP / VAL

Só após: este REQ + ARQ-091 **v0.3** **homologados**; catálogo fechado; `consulta`×`situacional` inequívoco; Precedência=único decisor / escritor=sela; matriz sinal↔flag e timeline fechadas; IMP-091 **sem** decisões arquitecturais em aberto; equivalência comportamental (incl. S1–S4) definida e verificável.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 |
| Lastro adjacente | CAP-07; ARQ-018 |
| Superior | CON-001; ADR-006; ADR-015 |
| Fatia 0 | REQ-090; ARQ-090; IMP-090; VAL-090 |
| Arquitectura | ARQ-091 |
| IMP | *(após homologação — IMP-091 inexistente)* |

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | Proposta chat | NÃO APROVADO (re-homologação) |
| 0.2 | 12/09/2026 | Engenheiro | Correcções bloqueantes + persistência | Rascunho |
| 0.3 | 12/09/2026 | Engenheiro | Catálogo fechado; consulta×situacional; Precedência=decisor / escritor=sela | **Rascunho** — aguarda re-homologação |

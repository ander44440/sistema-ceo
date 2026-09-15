# REQ-093 — Context Governor (governança do contexto autorizado pré-LLM)

> **Status:** Em análise (CTO)  
> **Versão:** 0.1 — 15/09/2026  
> **Capacidade:** CAP-01 — Governança  
> **Limite desta fatia:** especificação de requisito **somente**; **sem** ADR derivado; **sem** ARQ; **sem** IMP; **sem** alteração de código; **sem** testes.

---

## Enunciado

O CEO deverá dispor de um **Context Governor** — mecanismo **único** e **transversal** — que, **imediatamente antes** de qualquer envio de contexto a um motor de linguagem (LLM), valide o **contexto efectivamente autorizado** para aquele acto e **autorizar, isolar ou bloquear** o conteúdo candidato, de modo que **nenhuma** informação seja tratada como autorizada apenas por estar disponível em memória, histórico, sessão, MRE, prompt ou outra fonte acessível.

## Tipo

Funcional; detalhado (contrato de governança pré-LLM). Sem especificação de meio de implementação nesta fatia.

## Justificativa

CON-001 Art. 5º (hierarquia e fluxo); Art. 7º (governança); Art. 9º princípios 2 (nunca perder o contexto), 3 (nunca executar sem objectivo claro) e 8 (transparência sobre limitações); VIS-007 / REQ-037 / REQ-039 (COA único e isolamento entre contextos); REQ-065 / ARQ-026 (VCA — pertença pré-cadeia CSC, **não** auditoria final pré-LLM); REQ-049 / ADR-019 (MRE consome contexto; não governa sozinho a autorização); REQ-092 / ADR-021–023 (LFC canónico; consumo MRE; RFR — isolamento HFC sob restrição factual).

Evidência operacional: o pipeline real possui controlos **em camadas e path-dependent** (VCA, precedência, RFR, disciplina de lastro, gates do LfcReader, validação de Parecer/Speaker), **sem** um ponto único que audite o pacote efectivamente enviado ao LLM em **todos** os caminhos que chamam o LLM (MRE estágio-a-estágio **e** caminhos directos via `montarMensagensLlm` / equivalentes). Lacuna: disponibilidade ≠ autorização; risco de contaminação entre COAs/casos e de inferência apresentada como facto após isolamento.

O Context Governor **não** substitui VCA nem MRE: opera **depois** das decisões de sessão/classificação/deliberação e **antes** do transporte LLM, como **fechadura de autorização do contexto**.

---

## 1. Definição e posição no fluxo

### 1.1 O que é

O **Context Governor (CG)** é o mecanismo oficial que produz o **veredicto de autorização de contexto** sobre um **pacote candidato** destinado a um LLM, para um **acto de chamada** concreto.

### 1.2 Quando opera (obrigatório)

| Regra | Norma |
|-------|--------|
| **CG-POS-1** | O CG **deve** operar **imediatamente antes** do envio do contexto ao LLM (último gate de conteúdo antes do transporte `/api/ceo/deliberar` ou equivalente oficial). |
| **CG-POS-2** | **Nenhuma** chamada LLM de produção do Núcleo Executivo poderá omitir o CG quando houver conteúdo contextual candidato (mensagens, factos, lastro, fio, briefing injectável, etc.). |
| **CG-POS-3** | O CG é **transversal**: aplica-se a **todos** os caminhos que efectivamente chamam o LLM (pipeline MRE por estágio; caminho directo/`llm_rapido`; conhecimento geral via LLM; quaisquer outros caminhos oficiais futuros com a mesma fronteira). |
| **CG-POS-4** | Caminhos **sem** LLM (respostas locais determinísticas, C3 Motor sem deliberação LLM, consulta registados sem LLM, LFC restrito sem LLM, clarificações locais) **não** invocam o CG. |

### 1.3 O que não é

O CG **não** é classificador, **não** é VCA, **não** é MRE, **não** é Speaker, **não** é writer de lastro, **não** é orçamentador de tokens por si só (pode reportar insuficiência; **não** redefine prioridade estratégica do turno).

---

## 2. Entradas

O CG recebe um **pedido de autorização** (`PedidoGovernancaContexto`). Campos **quando disponíveis** (ausência explícita ≠ autorização implícita):

| Campo | Obrigatório | Significado |
|-------|-------------|-------------|
| `coaAtivo` | quando o turno tem COA resolvido | Identidade do COA activo (`coaId` + metadados mínimos). Ausência ⇒ regime sem lastro de projecto (só o que for explicitamente autorizado para metaconversa / conhecimento geral / isolamento). |
| `casoAtivo` | quando houver caso resolvido | `casoId` (+ título só como rótulo, **nunca** como chave). Ausência com pedido que exige caso ⇒ insuficiência / esclarecimento, **não** escolha silenciosa. |
| `objetivoOuAssuntoTurno` | quando disponível | Objectivo/assunto do turno (objectivo CSC, sinal de objecto, pedido actual). |
| `fontesLastroAutorizadas` | sim (pode ser lista vazia) | Conjunto declarado de fontes **já** autorizadas a montante (ex.: LFC activos do caso; CSC se `autorizaLastroCsc`; HFC só nos usos permitidos; MO só em consulta explícita; DIC; briefing oficial; turno actual do utilizador). **Fonte não listada = não autorizada.** |
| `conteudoCandidato` | sim | Pacote candidato ao prompt / envelope deliberativo (mensagens, blocos de factos, fio, anexos textuais injectáveis). |
| `actoChamada` | sim | Identificador do acto (ex.: estágio MRE `S3`; `llm_direct`; `conhecimento_geral`). |
| `regimeEspecial` | não | Ex.: `RFR` activo; isolamento VCA; metaconversa; consulta. |

**Regra de admissão (invariante de entrada):**

| ID | Regra |
|----|--------|
| **IN-1** | Disponibilidade em memória, histórico, sessão, store, MRE ou rascunho de prompt **não** constitui autorização. |
| **IN-2** | Só entram no universo avaliável os fragmentos do `conteudoCandidato` que o chamador pretende enviar; o CG **não** vasculha stores para «completar» o pacote. |
| **IN-3** | O chamador **deve** declarar `fontesLastroAutorizadas` com base em decisões a montante (VCA, LfcReader, RFR, consulta explícita, etc.); o CG **verifica** coerência e pertença, **não** inventa autorização. |

---

## 3. Saída de autorização

O CG devolve um **ResultadoGovernancaContexto**:

| Campo | Valores / tipo | Significado |
|-------|----------------|-------------|
| `estado` | ver §4 | Estado canónico do acto |
| `autorizado` | boolean | `true` só se o pacote resultante pode seguir para o LLM |
| `pacoteAutorizado` | object \| null | Conteúdo **após** isolamento/remoção; **null** se bloqueado |
| `remocoes` | lista | Fragmentos removidos (origem, motivo, identificador estável) |
| `motivo` | string curta | Razão legível (código + mensagem) |
| `exigeEsclarecimento` | boolean | Se o utilizador deve ser interpelado antes de nova tentativa |
| `declaraInsuficienciaLastro` | boolean | Se a resposta deve declarar lastro insuficiente (sem inventar) |
| `violacoes` | lista | Códigos de violação detectados (ver §7 / §9) |

| ID | Regra de saída |
|----|----------------|
| **OUT-1** | Se `autorizado = true`, **apenas** `pacoteAutorizado` pode ser enviado ao LLM neste acto. |
| **OUT-2** | Se `autorizado = false`, **proibido** enviar o candidato original (ou qualquer reconstituição por inferência). |
| **OUT-3** | Remoções **nunca** são substituídas por texto inferido apresentado como facto, lastro ou «continuação natural» do removido. |
| **OUT-4** | O CG **não** redige a resposta executiva final; no máximo sinaliza esclarecimento / insuficiência para camadas a jusante (disciplina, Speaker, CN) consumirem. |

---

## 4. Estados de bloqueio / isolamento

Estados canónicos (exactamente um por acto):

| Estado | `autorizado` | Comportamento obrigatório |
|--------|--------------|---------------------------|
| `autorizado_integral` | true | Candidato passa sem remoções materiais. |
| `autorizado_apos_isolamento` | true | Candidato passa **após** remoção/isolamento de fragmentos incompatíveis; `pacoteAutorizado` ≠ candidato original; `remocoes` não vazias. |
| `bloqueado_contaminacao` | false | Contaminação COA/caso/fonte estranha **não** isolável com segurança sem comprometer o acto; **não** envia ao LLM. |
| `bloqueado_insuficiencia` | false | Após isolamento (ou na ausência de lastro autorizado), o lastro restante é **insuficiente** para o pedido; declarar insuficiência / lacuna; **não** inventar. |
| `bloqueado_esclarecimento` | false | Ambiguidade de COA/caso/pertença/fonte exige esclarecimento ao utilizador **antes** de nova chamada LLM com esse pacote. |
| `bloqueado_violacao_invariante` | false | Violação de invariante CG (ex.: tentativa de bypass; fonte não declarada forçada); falha fechada. |

**Precedência operacional (quando vários se aplicam):**  
`bloqueado_violacao_invariante` > `bloqueado_contaminacao` > `bloqueado_esclarecimento` > `bloqueado_insuficiencia` > `autorizado_apos_isolamento` > `autorizado_integral`.

---

## 5. Verificações obrigatórias

Sobre cada fragmento material do `conteudoCandidato`, o CG **deve** verificar:

| ID | Verificação | Critério de falha |
|----|-------------|-------------------|
| **V1** | **Pertencimento ao COA activo** | Fragmento ligado a outro `coaId`, ou sem vínculo quando o regime exige COA, ou metadado de origem cross-COA. |
| **V2** | **Pertinência ao caso activo** (quando houver `casoAtivo` ou o pedido o exige) | Fragmento de outro `casoId`; título homónimo sem resolução; deixis ambígua sem ponteiro. |
| **V3** | **Autorização da fonte** | Fonte do fragmento ∉ `fontesLastroAutorizadas`, ou fonte listada mas uso incompatível com o `regimeEspecial` (ex.: HFC como facto sob RFR). |
| **V4** | **Ausência de contexto estranho** | Conteúdo de sessão/histórico/MRE/prompt auxiliar que **não** pertence ao âmbito autorizado do acto (outro projecto, outro caso, lastro CSC isolado pelo VCA, MO sem pedido explícito, etc.). |
| **V5** | **Suficiência do lastro após isolamento** | Se remoções eliminam factos/contexto **necessários** ao pedido actual ⇒ não autorizar integralmente; transitar para `bloqueado_insuficiencia` ou `bloqueado_esclarecimento`. |

**Política em incompatibilidade (obrigatória):**

| ID | Acção |
|----|--------|
| **P1** | Isolar/remover o conteúdo indevido **quando possível** com fronteira clara (por fragmento / por bloco etiquetado). |
| **P2** | Impedir o envio do indevido ao LLM. |
| **P3** | Se a remoção comprometer a capacidade de responder ao pedido actual ⇒ `bloqueado_esclarecimento` **ou** `bloqueado_insuficiencia` (nunca «preencher o buraco»). |
| **P4** | **Nunca** substituir o removido por inferência apresentada como facto, lastro vigente ou conclusão factual. |

---

## 6. Responsabilidades

### 6.1 Responsabilidades do Context Governor

| ID | Responsabilidade |
|----|------------------|
| **R-CG-1** | Validar autorização efectiva do pacote candidato pré-LLM. |
| **R-CG-2** | Produzir `pacoteAutorizado` ou bloqueio tipificado. |
| **R-CG-3** | Registar remoções e violações de forma auditável no resultado do acto (contrato de saída; meio de trilha fica para ARQ/IMP). |
| **R-CG-4** | Aplicar-se de forma uniforme a todos os caminhos LLM oficiais. |

### 6.2 Responsabilidades explicitamente **fora** do CG

| ID | Proibição |
|----|-----------|
| **X1** | **Não** criar factos. |
| **X2** | **Não** escrever LFC. |
| **X3** | **Não** alterar MO (Memória Organizacional / decisões Art. 8º). |
| **X4** | **Não** alterar HFC (prova append-only). |
| **X5** | **Não** alterar CSC (tópico/referente/objectivo/envelope de sessão). |
| **X6** | **Não** substituir o VCA (pertença pré-cadeia / `autorizaLastroCsc`). |
| **X7** | **Não** substituir o MRE (deliberação / parecer). |
| **X8** | **Não** decidir o conteúdo executivo da resposta (prosa final, recomendação de negócio, despacho de Jobs). |
| **X9** | **Não** promover inferência a lastro nem «reparar» isolamento com conteúdo sintético factual. |

### 6.3 Responsabilidades das camadas vizinhas (contrato de fronteira)

| Camada | Continua responsável por | Relação com CG |
|--------|--------------------------|----------------|
| **VCA** | Pertença/isolamento **pré-CSC**; flags de autorização de lastro de sessão | Alimenta `fontesLastroAutorizadas` / regime; **não** é o gate LLM |
| **CSC** | Gestão de tópico/referente/objectivo | CG não muta stores CSC |
| **LFC Reader/Writer** | Factos canónicos do caso; escrita só via writer | CG consome declaração de LFC autorizado; não escreve |
| **RFR (ADR-023)** | Regime de restrição factual LFC×HFC | CG **aplica** o regime no pacote LLM; não redefine a norma RFR |
| **MRE** | Pipeline deliberativo e parecer | Chama CG antes de cada `chamarLlm` (ou equivalente) |
| **Caminho LLM directo** | `montarMensagensLlm` / knowledge via LLM | Mesma obrigação CG-POS-2/3 |
| **Disciplina / Speaker / CN** | Prosa, recusa, naturalização | Consomem bloqueio/insuficiência; **não** contornam o CG reenviando candidato rejeitado |

---

## 7. Invariantes

| ID | Invariante |
|----|------------|
| **I1** | **Disponível ≠ autorizado.** |
| **I2** | Todo acto LLM oficial com contexto candidato passa pelo CG **uma vez por envio** (por chamada). |
| **I3** | Pacote enviado ao LLM ⊆ `pacoteAutorizado` do último CG desse acto. |
| **I4** | Fragmento de COA B **nunca** é autorizado sob COA A activo (salvo relatório multi-COA futuro **fora** deste REQ). |
| **I5** | Fragmento de `casoId` Y **nunca** é autorizado como lastro do caso X activo sem autorização explícita de âmbito. |
| **I6** | Sob RFR + LFC autorizado: HFC/fio **não** entra como facto nem como objecto factual substituto (ADR-023); o CG trata violação como V3/V4. |
| **I7** | Isolamento **não** autoriza preenchimento inferencial do vazio. |
| **I8** | O CG é **read-only** quanto a LFC, MO, HFC e CSC. |
| **I9** | Bypass do CG em caminho LLM de produção = defeito de conformidade (falha de aceitação). |

---

## 8. Casos de contaminação entre COAs / casos

Cenários **normativos** (aceitação futura deve cobri-los; esta fatia não cria testes):

| ID | Cenário | Resultado exigido |
|----|---------|-------------------|
| **CC-01** | COA A activo; candidato inclui facto/mensagem etiquetada com `coaId` B | Remover fragmento B **ou** `bloqueado_contaminacao` se inseparável; **nunca** enviar B. |
| **CC-02** | Troca recente de COA; fio/HFC do COA anterior ainda no candidato | Tratar como contexto estranho (V4); isolar; se o pedido depender só do lastro anterior sem reautorização ⇒ insuficiência/esclarecimento. |
| **CC-03** | Mesmo COA; `casoId` activo X; candidato inclui factos activos do caso Y | Remover Y do lastro autorizado **ou** bloquear; **não** fundir casos por título. |
| **CC-04** | Dois casos com o mesmo `titulo` no COA; candidato mistura enunciados sem `casoId` inequívoco | `bloqueado_esclarecimento` (sem escolha silenciosa). |
| **CC-05** | VCA isolou CSC (`autorizaLastroCsc = false`); candidato ainda contém tópico/objectivo/Jobs do envelope CSC | Remover lastro CSC; se a resposta depender dele ⇒ insuficiência/esclarecimento — **não** reautorizar CSC no CG. |
| **CC-06** | RFR activo; LFC limpo; HFC residual do mesmo COA reintroduce tema antigo no envelope | Remover uso factual/objecto do HFC residual; se restar só HFC para o pedido ⇒ `bloqueado_insuficiencia` (ADR-023). |
| **CC-07** | Sem pedido explícito de MO; candidato injecta decisões Art. 8º de outro âmbito ou do mesmo COA «porque estavam em memória» | Remover; MO só se fonte autorizada por consulta explícita. |
| **CC-08** | Caminho `llm_rapido` / directo (fora do MRE) com as mesmas contaminações CC-01…07 | **Mesmas** regras; transversalidade obrigatória (CG-POS-3). |
| **CC-09** | Estágio MRE N autorizado; estágio N+1 remonta candidato com fragmento já removido | Novo acto CG; remoção/bloqueio outra vez; **proibido** «rehidratar» removidos. |
| **CC-10** | Placeholder / memória de sessão / transcript UI sem etiqueta de COA/caso sob COA activo exigente | Tratar como não autorizado até prova de pertença; preferir isolamento ou esclarecimento (anti falsa continuação). |

---

## 9. Critérios objetivos de aceitação

*Lista verificável para VAL futura (esta fatia **não** cria TST/IMP).*

| ID | Critério | Evidência esperada |
|----|----------|-------------------|
| **CA-093-1** | Existe contrato REQ deste Governor com entradas, saída, estados e invariantes acima. | Este documento aprovado |
| **CA-093-2** | Toda chamada LLM oficial de produção com contexto candidato invoca o CG imediatamente antes do transporte. | ARQ/IMP + inspeção de caminhos MRE e directo |
| **CA-093-3** | Caminho MRE e caminho LLM directo aplicam o **mesmo** contrato CG. | Teste de paridade / matriz de paths |
| **CA-093-4** | IN-1 observável: conteúdo só «disponível» sem fonte autorizada **não** chega ao LLM. | Fixture de contaminação |
| **CA-093-5** | CC-01 e CC-03: zero envio cross-COA / cross-caso no pacote LLM. | Fixtures dedicadas |
| **CA-093-6** | CC-04: ambiguidade de caso ⇒ esclarecimento; sem escolha silenciosa. | Fixture |
| **CA-093-7** | CC-05: lastro CSC isolado pelo VCA não é reintroduzido pelo CG. | Fixture VCA+CG |
| **CA-093-8** | CC-06: sob RFR, HFC residual não redefine universo factual no pacote LLM. | Fixture RFR |
| **CA-093-9** | Em `autorizado_apos_isolamento`, `remocoes` listam o removido e o LLM recebe só `pacoteAutorizado`. | Asserção de I/O |
| **CA-093-10** | Em bloqueio por insuficiência, a camada a jusante declara lacuna; **não** há preenchimento factual inferido no lugar do removido. | Fixture de prosa/disciplina |
| **CA-093-11** | X1–X8: CG não escreve LFC/MO/HFC/CSC; não substitui VCA/MRE; não decide prosa executiva. | Revisão de fronteiras + testes negativos |
| **CA-093-12** | Bypass do CG em path LLM = falha de aceitação. | Teste de conformidade / hook de transporte |

---

## 10. Fora do escopo

* Desenho de ARQ/IMP, APIs concretas, nomes de módulos ou refactors.
* Alteração do contrato VCA (REQ-065), MRE (REQ-049), LFC (REQ-092), HFC (REQ-087), RFR (ADR-023) — o CG **consome** essas normas.
* Orçamento global de tokens / compressão semântica como produto.
* Relatórios multi-COA deliberados.
* Criação de testes, baterias VAL ou código nesta fatia.
* Substituição da Consciência Operacional, Precedência de turno, Speaker ou Conversação Natural.

## 11. Dependências

| Dependência | Papel |
|-------------|--------|
| REQ-037 / REQ-038 / REQ-039 | COA único; troca; isolamento entre contextos |
| REQ-065 / ARQ-026 | VCA — autorização de lastro CSC **a montante** |
| REQ-049 / ADR-019 | MRE — consumidor; deve respeitar CG nos `chamarLlm` |
| REQ-092 / ADR-021 / ADR-022 / ADR-023 | LFC; consumo; RFR |
| REQ-087 / REQ-086 / REQ-089 | HFC e consultas registadas (MO/discussões) como fontes distintas |
| REQ-059 | Consciência operacional — lastro de Jobs/Gates como fonte **só se autorizada** |
| Mapeamento de pipeline (15/09/2026) | Evidência da lacuna: controlos path-dependent sem gate único pré-LLM |

## 12. Riscos e incertezas

* Falso positivo de isolamento a degradar continuidade legítima do **mesmo** COA/caso — mitigar com etiquetagem clara de fragmentos na ARQ.
* Duplicação conceptual com VCA/RFR se fronteiras não forem mantidas — mitigar por §6.3 e X6–X7.
* Custo/latência se o CG for ingénuo em pacotes grandes — fora do contrato funcional; ARQ deve preservar CG-POS-1 sem contornar I3.
* Chamadas LLM fora do Núcleo (ferramentas externas) — este REQ cobre caminhos **oficiais do CEO**; extensão exige REQ/ADR próprios.
* Sem ADR ainda: numeração e nome de módulo ficam para o CTO na fase ARQ.

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º, 9º (2, 3, 8); VIS-007 §1 |
| Origem | Despacho de especificação Context Governor (15/09/2026); lacuna observada no pipeline real pré-LLM; continuidade REQ-039 / REQ-065 / REQ-092 / ADR-023 |
| Decisões derivadas | *(ADR/ARQ — a criar após aprovação CTO/Usuário)* |
| Implementação | — (proibido nesta fatia) |
| Testes | — (proibido nesta fatia) |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 15/09/2026 | Engenheiro (Cursor), sob despacho do Usuário | Criação do REQ do Context Governor | Fechar contrato de governança pré-LLM transversal; revisão CTO | Em análise |

# REQ-085 — Requisitos mínimos da Memória de Evolução do Produto CEO (MEP-CEO)

> **Status: Homologado — v1.0 (CTO, 14/08/2026).** Pacote MEP-CEO VIS → REQ → ARQ **homologado como especificação**. **IMP não aberta.** Sem código.  
> **Versão:** 1.0 — 14/08/2026  
> **Capacidade:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020). Proprietária da MEP-CEO. Não é CAP-04. Não é CAP-05.  
> **Identificação:** REQ-085.  
> **Natureza:** pacote mínimo de requisitos funcionais e não funcionais derivados da VIS-009 Homologada v1.0 e da ANL-018 aprovada.  
> **Proibição:** não reabre CAP-04, CAP-05, Motor, MRE, EIC, Gate G2, MTE, `monitorar`. Não cria UI, C3, IMP nem código.

---

## 0. Propósito deste artefacto

Especificar, de forma rastreável e verificável, o **mínimo** para a MEP-CEO existir como fronteira de solução: isolamento, objectos, estados, autoridade, evidência, histórico e a ponte futura **apenas como regra de fronteira**.

Cada RF / RNF possui enunciado testável e critérios de aceitação. Todos rastreiam à VIS-009.

---

## Enunciado do pacote

O CEO deverá possuir uma Memória de Evolução do Produto (MEP-CEO), distinta da Memória da Organização, na qual só entram factos e hipóteses **do produto CEO**, com objectos mínimos, estados de maturidade e de trabalho, autoridade limitada do agente, evidência obrigatória em mudanças relevantes e histórico append-only — sem armazenar automaticamente dados, conversas, conhecimento operacional, decisões privadas ou factos de organizações / clientes.

## Tipo

Pacote: funcionais e não funcionais; alto nível.

## Justificativa

VIS-009: o produto não tem memória de si mesmo. CAP-05 e CAP-04 cobrem o eixo organização / cliente. Sem estes requisitos, a arquitectura de fronteira não tem o que satisfazer (ADR-010).

---

## RF-01 — Isolamento: a MEP-CEO não absorve o eixo organização / cliente

### Enunciado

O CEO deverá tratar a MEP-CEO como memória **exclusiva do produto** e deverá **recusar armazenamento automático** na MEP-CEO de: dados de clientes; conversas de clientes; conhecimento operacional de clientes; decisões privadas de clientes; factos pertencentes a organizações.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §3 (separação canónica) e §8 critério 2.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-01** | Existem dois eixos nomeados: **Produto CEO ↔ MEP-CEO (CAP-13)**; **Organização/cliente ↔ CAP-04 / CAP-05**. | Inspecção normativa: a distinção está nos artefactos oficiais e nenhum objecto é definido como pertencendo aos dois eixos ao mesmo tempo. |
| **CA-085-02** | Tentativa de gravar automaticamente na MEP-CEO qualquer um dos cinco tipos proibidos é recusada. | Matriz negativa: cada tipo (dados; conversa; conhecimento operacional; decisão privada; facto da organização) não entra na MEP-CEO sem acto explícito de proposta desidentificada (RF-08). |
| **CA-085-03** | A Memória Organizacional (CAP-05) e o Acervo (CAP-04) **não** são sede da evolução do produto. | Nenhum requisito deste pacote altera REQ-033, ARQ-009, ARQ-031 ou REQ-070…074. |
| **CA-085-04** | Consultar a MEP-CEO **não** exige (nem devolve) conversas, decisões privadas ou factos de um cliente. | Cenário: pergunta «qual é a baseline do produto?» respondível só com objectos MEP. |

### Regras de negócio

* **RN-01.1** Pertença ao produto ≠ pertença à organização. Em dúvida, o item **não** entra na MEP-CEO.  
* **RN-01.2** Referência por identificador a um artefacto organizacional (ex.: `KNW-nnn`, decisão CAP-05) **pode** existir como ponte de evidência **se** não copiar o conteúdo privado. Absorção do conteúdo é recusada.  
* **RN-01.3** «Automático» inclui ingestão silenciosa a partir de conversa, COA, Acervo, Memória Organizacional, MRE, EIC ou fila.

### Fora do escopo

* Como a Memória da Organização persiste — CAP-05 / ARQ-009 (não reabrir).  
* Admissão de itens KNW — REQ-073 (não reabrir).

---

## RF-02 — Objectos mínimos da MEP-CEO

### Enunciado

A MEP-CEO deverá ser capaz de representar, como objectos distintos e identificáveis, pelo menos: **capacidade**, **épico**, **módulo**, **decisão** (de produto), **evidência**, **pendência**, **baseline**, **roadmap** e **histórico de evolução**.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §4.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-05** | Os nove tipos existem como objectos lógicos distintos, cada um no seu espaço: `MCP` `EPC` `MDL` `DCP` `EVD` `PND` `BSL` `RMP` `MEV`. | Inventário: nove espaços; nenhum absorve o outro; marcadores não colidem com `CAP`, `KNW`, `CNC`, `ROADMAP`, `EPICO`, `EV`. |
| **CA-085-06** | **Decisão** na MEP-CEO (`DCP`) é decisão **de produto**, não decisão da organização cliente. | Caso: uma decisão Art. 8º de um COA não cria, por si, um `DCP`. |
| **CA-085-07** | **Roadmap** na MEP-CEO é objecto de memória de produto; não substitui o tipo documental ROADMAP (ADR-016). | Coexistência: ROADMAP-002 permanece documento; o objecto MEP pode referenciá-lo por ID. |
| **CA-085-08** | **Histórico de evolução** não é um dump de conversas; é a cadeia de eventos dos objectos MEP. | Evento referencia objecto + transição + evidência; não armazena transcript. |

### Regras de negócio

* **RN-02.1** Todo objecto persistido na MEP-CEO possui identidade permanente `MARCADOR-nnn` no espaço da tabela abaixo; nunca reutilizada.  
* **RN-02.2** Capacidade MEP (`MCP`) descreve o produto; não é `CAP-nn` do mapa CAP-001 nem instância de uso numa organização.  
* **RN-02.3** Evidência (`EVD`) é lastro (apontador + tipo + origem), não o payload de dados de cliente.
* **RN-02.4** Espaços oficiais (ANL-018 §7; ARQ-033):

| Objecto | Marcador | Forma |
|---------|----------|-------|
| Capacidade de produto | `MCP` | `MCP-nnn` |
| Épico de produto | `EPC` | `EPC-nnn` |
| Módulo de produto | `MDL` | `MDL-nnn` |
| Decisão de produto | `DCP` | `DCP-nnn` |
| Evidência de produto | `EVD` | `EVD-nnn` |
| Pendência de produto | `PND` | `PND-nnn` |
| Baseline de produto | `BSL` | `BSL-nnn` |
| Roadmap (memória) | `RMP` | `RMP-nnn` |
| Evento de evolução | `MEV` | `MEV-nnn` |

### Fora do escopo

* Schema físico, ficheiros, base de dados.

---

## RF-03 — Estados de maturidade

### Enunciado

Todo objecto de produto sujeito a ciclo de evolução na MEP-CEO deverá possuir exactamente um estado de maturidade, pertencente ao conjunto fechado: `CONCEBIDO`, `DEFINIDO`, `EM_CONSTRUÇÃO`, `EM_VALIDAÇÃO`, `HOMOLOGADO`, `BASELINE`.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §5.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-09** | O conjunto de estados de maturidade é fechado e igual ao enunciado. | Nenhum estado extra no modelo mínimo; nenhum dos seis omitido. |
| **CA-085-10** | Transição de maturidade gera evento de evolução (RF-07) e aponta evidência (RF-06) quando a mudança é relevante. | Transição sem evento = fail. |
| **CA-085-11** | Chegar a `BASELINE` exige homologação pela autoridade do projecto — não acto unilateral do CEO-agente (RF-05). | Tentativa do agente sozinho promover a `BASELINE` = recusada. |
| **CA-085-12** | `CONCEBIDO` comporta hipótese; `HOMOLOGADO` e `BASELINE` não se apresentam como hipótese. | Objecto em BASELINE marcado só como hipótese = fail. |

### Regras de negócio

* **RN-03.1** Só as transições da tabela abaixo são lícitas. Qualquer salto omitido é recusado.  
* **RN-03.2** Estado anterior de maturidade permanece no histórico (`MEV`); não é sobrescrito com apagamento.  
* **RN-03.3** `BASELINE` é **congelada**. Evolução posterior gera **novo** `BSL-nnn` que referencia o anterior — nunca mutação do identificador emitido.  
* **RN-03.4** Propor ≠ promover. O CEO-agente pode propor todas as transições canónicas; só **regista** a criação em `CONCEBIDO`.  
* **RN-03.5** Transições canónicas (ANL-018 §6; vinculantes neste REQ):

| De | Para | Quem promove | Evidência |
|----|------|----------------|-----------|
| — | `CONCEBIDO` | CEO-agente **regista** (também CTO/Usuário/Engenheiro podem originar o registo) | Origem da concepção ou lacuna explícita |
| `CONCEBIDO` | `DEFINIDO` | **CTO** (+ aval do Usuário se o objecto é Capacidade/`MCP` ou Épico/`EPC`) | VIS/REQ/ANL/ARQ ou despacho de escopo |
| `DEFINIDO` | `EM_CONSTRUÇÃO` | **CTO** | Autorização de construir / gate IMP |
| `EM_CONSTRUÇÃO` | `EM_VALIDAÇÃO` | **CTO** | Constructo pronto a validar |
| `EM_VALIDAÇÃO` | `HOMOLOGADO` | **CTO** e **Usuário** quando o catálogo exigir | VAL / evidências de conformidade |
| `HOMOLOGADO` | `BASELINE` | **Usuário** apenas. CTO recomenda. CEO-agente **nunca** | Acto explícito de congelar; novo `BSL` se for nova baseline |

* **RN-03.6** Saltos proibidos: de `CONCEBIDO` para qualquer estado excepto `DEFINIDO`; de `DEFINIDO` para `EM_VALIDAÇÃO`/`HOMOLOGADO`/`BASELINE`; de `EM_CONSTRUÇÃO` para `HOMOLOGADO`/`BASELINE`; de `EM_VALIDAÇÃO` para `BASELINE`; para `BASELINE` excepto desde `HOMOLOGADO`.  
* **RN-03.7** Autoridade Delegada **não** altera esta tabela por omissão.

---

## RF-04 — Estados de trabalho

### Enunciado

Todo objecto de produto na MEP-CEO deverá possuir exactamente um estado de trabalho, pertencente ao conjunto fechado: `SEM_PENDÊNCIA`, `PENDÊNCIA_ATIVA`, `EM_INVESTIGAÇÃO`, `BLOQUEADO` — **ortogonal** ao estado de maturidade.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §5.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-13** | Maturidade e trabalho são eixos independentes. | Ex.: `HOMOLOGADO` + `PENDÊNCIA_ATIVA` é representável; `EM_CONSTRUÇÃO` + `SEM_PENDÊNCIA` é representável. |
| **CA-085-14** | O conjunto de estados de trabalho é fechado e igual ao enunciado. | Idem CA-085-09 para este eixo. |
| **CA-085-15** | `PENDÊNCIA_ATIVA` liga-se a pelo menos uma Pendência (RF-02). | Estado `PENDÊNCIA_ATIVA` sem objecto Pendência associado = fail. |

### Regras de negócio

* **RN-04.1** `BLOQUEADO` declara impedimento; não apaga o objecto nem o histórico.  
* **RN-04.2** Resolver pendências não homologa baseline.

---

## RF-05 — Autoridade na MEP-CEO

### Enunciado

O CEO (Agente Executivo) poderá registar, organizar, consultar e propor actualizações na MEP-CEO; **não** poderá, sozinho, homologar baseline; **não** poderá apagar histórico; **não** poderá transformar hipótese em facto. A homologação permanece na autoridade definida pelo projecto.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §6; CON-001 Art. 6º e Art. 9º princípio 9.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-16** | Actos permitidos ao CEO-agente: registar; organizar; consultar; propor actualização. | Cada acto é representável sem exigir alçada de homologação. |
| **CA-085-17** | Acto «homologar baseline» pelo CEO-agente **sem** autoridade do projecto é recusado. | Tentativa unilateral = recusada; estado não muda para `BASELINE`. |
| **CA-085-18** | Acto «apagar histórico» ou «apagar evento de evolução» é recusado para o CEO-agente e para qualquer rotina automática. | Operação de delete de evento = fail. |
| **CA-085-19** | Acto que apresente hipótese como facto de produto (ex.: promover `CONCEBIDO` a facto vigente sem homologação) é recusado. | Hipótese continua hipótese até alçada. |
| **CA-085-20** | A alçada de homologação **não** é redefinida por este REQ; herda CON-001 Art. 6º (Usuário autoridade máxima; CTO nas alçadas técnicas já atribuídas). | Este REQ não cria novo dono da missão (alinhado a ARQ-032 no espírito; **sem** alterar ARQ-032). |

### Regras de negócio

* **RN-05.1** Proposta ≠ vigência.  
* **RN-05.2** Autoridade Delegada (ARQ-032), se activa, **não** autoriza por omissão apagar histórico, homologar baseline de produto nem transformar hipótese em facto — salvo perímetro **explícito** futuro, que **não** existe neste pacote.  
* **RN-05.3** «Organizar» não inclui reescrever o passado.

---

## RF-06 — Evidência de origem

### Enunciado

Toda mudança **relevante** na MEP-CEO deverá apontar para a sua evidência de origem. Mudança relevante sem evidência não se apresenta como facto de produto.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §6; CON-001 Art. 8º §3º (rastreio da cadeia do produto, sem absorver a Memória Organizacional).

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-21** | Mudanças relevantes (criação de objecto; transição de maturidade; promoção a `HOMOLOGADO` / `BASELINE`; alteração de decisão de produto) carregam apontador de evidência. | Objecto/evento sem evidência nesses casos = fail. |
| **CA-085-22** | Evidência identifica origem (tipo + referência), não o conteúdo privado de um cliente. | Evidência = `{ tipo, referência }`; payload de conversa/cliente ausente. |
| **CA-085-23** | Ausência de evidência é declarada; não é preenchida por invenção. | Declaração explícita de lacuna de evidência = pass; facto inventado = fail. |

### Regras de negócio

* **RN-06.1** Tipos de evidência admitidos (mínimo lógico): documento oficial (`VIS`/`REQ`/`ARQ`/`IMP`/`VAL`/`ADR`); commit/teste quando existirem; declaração de lacuna. Lista extensível pelo CTO sem reabrir o isolamento (RF-01).  
* **RN-06.2** Evidência organizacional referenciada por ID não copia o facto da organização para a MEP-CEO (RN-01.2).

### Fora do escopo

* Motor de ficheiros de evidência; UI de anexo.

---

## RF-07 — Histórico append-only e eventos de evolução

### Enunciado

Estados anteriores na MEP-CEO nunca são apagados. Toda mudança gera um evento de evolução. O histórico é a fonte do que o produto foi e do que passou a ser.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-009 §6.

### Critérios de aceitação

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-24** | Não existe operação de apagamento de estado anterior ou de evento. | Delete / squash destrutivo = fail. |
| **CA-085-25** | Cada mudança gera evento com: objecto afectado; estado anterior; estado novo; quando; quem (papel); evidência quando RF-06 exigir. | Evento incompleto nesses campos mínimos = fail. |
| **CA-085-26** | Consulta do histórico reconstitui a sequência sem perda dos estados passados. | Após N mudanças, os N estados anteriores permanecem consultáveis. |

### Regras de negócio

* **RN-07.1** Correcção faz-se por **novo evento**, não por reescrita.  
* **RN-07.2** Compactação / projecção de leitura, se existir no futuro, é subordinada ao log; em divergência, prevalece o histórico de eventos.

---

## RF-08 — Ponte futura: proposta de evolução sem transferência de dados privados

### Enunciado

Uma necessidade observada numa organização / cliente **poderá**, no futuro, originar uma **proposta** de evolução do produto na MEP-CEO **somente** como enunciado desidentificado de produto (hipótese / `CONCEBIDO`), **sem** transferir dados, conversas, conhecimento operacional, decisões privadas ou factos da organização. Este requisito **especifica a fronteira**; **não** exige implementar a transformação nesta etapa.

### Tipo

Funcional; alto nível; **não implementável agora**.

### Justificativa

VIS-009 §7. Contrato CTO item 12–13.

### Critérios de aceitação *(de fronteira — verificáveis em especificação; não em código nesta etapa)*

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-27** | A ponte, quando existir, produz **proposta de produto**, não facto e não baseline. | Saída lógica ∈ `CONCEBIDO` + hipótese; ∉ `HOMOLOGADO`/`BASELINE`. |
| **CA-085-28** | Conteúdo permitido na proposta: tipo de lacuna de produto; capacidade/épico/módulo candidato; enunciado desidentificado; apontador de evidência **não privado** (ex.: «padrão observado», ID de VAL de produto). | Checklist de campos da proposta. |
| **CA-085-29** | Conteúdo proibido na proposta: identidade de cliente; transcript; decisão privada; facto operacional da organização; conhecimento do Acervo daquela organização. | Matriz negativa = zero campos proibidos. |
| **CA-085-30** | Não há fluxo automático Memória da Organização → MEP-CEO. Qualquer atravessamento futuro exige acto explícito de proposta (humano ou agente **propondo**, nunca promovendo). | Automação de cópia = fora da fronteira. |
| **CA-085-31** | Nenhuma IMP desta frente implementa RF-08. | Este critério permanece N/A em código até o CTO abrir etapa própria. |

### Regras de negócio

* **RN-08.1** Observação em cliente **não** é facto de produto.  
* **RN-08.2** A transformação **não está autorizada a ser construída** neste ciclo.  
* **RN-08.3** RF-08 não cria evolução autónoma de organizações.

### Fora do escopo

* Mecanismo, pipeline, jobs, UI da ponte.  
* Qualquer escrita no Motor, MRE, EIC ou CAP-05 para «exportar» necessidades.

---

## RNF-01 — Independência da Memória da Organização

A MEP-CEO deve poder ser especificada, e no futuro consultada, **sem** depender do conteúdo da Memória Organizacional de qualquer cliente. Falha de isolamento (acoplamento de schema, ingestão ou query cruzada de conteúdo privado) é não conformidade.

## RNF-02 — Sem UI nesta etapa

Nenhum requisito deste pacote exige superfície de utilizador, painel ou conversa nova. UI da MEP-CEO é fora de escopo.

## RNF-03 — Sem evolução autónoma de organizações

A MEP-CEO não desencadeia, por si, mudança na Memória da Organização, no Acervo de um cliente, nem «melhoria automática» de uma organização.

## RNF-04 — Independência tecnológica

A arquitectura que satisfizer estes REQs é lógica. Nenhuma obrigação depende de fornecedor, base de dados ou ferramenta (ADR-010).

## RNF-05 — Não interferência com frentes alheias

A especificação e a futura implementação da MEP-CEO **não** alteram: Motor de Execução; MRE; EIC; Gate G2; MTE; rota `monitorar`; CAP-04; CAP-05; problemas já conhecidos do CEO que não sejam esta frente.

## RNF-06 — Auditabilidade

Qualquer leitura da MEP-CEO deve permitir distinguir: facto homologado; hipótese; pendência; baseline. Sem evidência, **não** tratar como facto de produto (RF-06). Silêncio que confunda hipótese com facto é não conformidade.

## RNF-07 — Estado desta homologação (sem produto em runtime)

Fica requisito não funcional, verificável por inspecção do repositório da CAP-13:

| ID | Critério | Verificação |
|----|----------|-------------|
| **CA-085-32** | C3 **não** está implementado | Nenhum módulo, job, pipeline ou IMP realiza o canal de proposta desidentificada |
| **CA-085-33** | IMP da MEP-CEO **não** está aberto | Não existe IMP-xxx da CAP-13 |
| **CA-085-34** | Não existe código da MEP-CEO | Nenhum runtime `MCP`/`MEV`/C2 |
| **CA-085-35** | Não existe UI da MEP-CEO | Nenhuma superfície nova |
| **CA-085-36** | Não existe evolução autónoma de organizações | RNF-03 + RF-08 |
| **CA-085-37** | Não existe integração com Motor, MRE, EIC, Gate G2 ou MTE | RNF-05; zero acoplamento nesta homologação |

---

## Fora do escopo (pacote)

* Código, commits, módulos existentes.  
* Implementação de RF-08 / C3.  
* IMP e VAL da CAP-13.  
* Alteração de CAP-04, CAP-05, Motor, MRE, EIC, Gate G2, MTE, `monitorar`.

---

## Dependências

* VIS-009 Homologada v1.0.  
* ANL-018 aprovada.  
* ADR-020 (CAP-13).  
* CON-001 Art. 6º, 8º, 9º.  
* CAP-04 e CAP-05 como **fronteiras a não absorver**.  
* ADR-016 (tipo ROADMAP).  
* ARQ-032 apenas como precedente — **sem emenda**.

---

## Riscos e incertezas

* **Confusão CAP-05 × MEP-CEO** na operação — mitigação: RF-01 + RN-01.1.  
* **Pressão para «aprender com o cliente» copiando memória** — mitigação: RF-08 como fronteira, C3 não implementada.  
* **Autoridade Delegada mal interpretada como alçada de baseline de produto** — mitigação: RN-05.2; RN-03.7.  
* **Tratar esta homologação como autorização de IMP** — mitigação: RNF-07.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-13** — Memória de Evolução do Produto (CAP-E; ADR-020) |
| Visão | **VIS-009 Homologada v1.0** |
| Arquitectura | **ARQ-033 Homologada v1.0** |
| Análise | **ANL-018 aprovada** |
| Norma superior | CON-001 Art. 4º, 6º, 8º, 9º; VIS-001; ADR-006; ADR-010; ADR-016; ADR-020 |
| Origem | Contrato CTO 14/08/2026; despacho de homologação 14/08/2026 |
| Implementação | **Não aberta** |
| Testes | — |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 14/08/2026 | Engenheiro (Cursor) | Pacote mínimo RF-01…08 + RNF-01…06 | Contrato CTO — VIS → REQ; sem código | Rascunho |
| 0.1 (anotação) | 14/08/2026 | Engenheiro (Cursor) | Elo CAP preenchido: **CAP-13** (ADR-020) | Formalização da CAP antes da homologação | Rascunho técnico aprovado |
| 1.0 | 14/08/2026 | CTO despachou; Engenheiro incorporou IDs, transições, RNF-07 | Homologação do pacote | Despacho CTO — homologar especificação MEP-CEO | **Homologado** |

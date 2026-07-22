# ARQ-004 — Arquitetura do Registro Canônico de Normas

> **Status: Homologada — v1.0 (Governança, 22/07/2026).**
> Versão 1.0 — 22/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; REQ-002 v1.0; REQ-003 v1.0 (consumidor da resolução); ADR-008 v1.0; ADR-013 v1.0 (Frente 2); ARQ-001 v1.0 (precedente de reutilização); ARQ-002 v1.0.
> Este documento define **arquitetura lógica** do Registro Canônico de Normas. Não define implementação técnica, tecnologia, banco de dados, protocolos ou sincronização; não cria nem altera requisitos; não arquiteta a Distribuição de Governança; não institui auditoria ativa (CAP-09).
> **Decisão homologada:** L1 — índice sobre o espaço documental existente (princípios P1–P7).

---

## Finalidade

Responder exclusivamente à pergunta: **como se organiza o Registro Canônico de Normas?**

Satisfaz o REQ-002 (registro canônico, único e versionado das normas de governança) e fornece a estrutura de estado da qual a resolução da norma vigente (REQ-003) lê vigência e histórico — sem absorver o REQ-003.

---

## 1. Princípios arquiteturais

Estes princípios **precedem** qualquer alternativa de organização (L1, L2 ou equivalente). São critérios objetivos de avaliação: nenhuma decisão desta arquitetura pode violá-los.

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **P1** | Fonte canônica única | Existe exatamente um registro canônico das normas de governança. Espelhos e derivados são subordinados; em divergência, prevalece o registro (CON-001 Art. 7º §4º; REQ-002). |
| **P2** | Unicidade de vigência | Em qualquer instante, cada norma do registro possui no máximo uma versão vigente — nunca duas vigentes simultâneas (REQ-002; REQ-003). |
| **P3** | Rastreabilidade histórica | Toda alteração de conteúdo ou de status gera entrada de histórico com os cinco campos da Memória Organizacional; versões anteriores permanecem recuperáveis (CON-001 Art. 8º; REQ-002). |
| **P4** | Identificadores permanentes | Toda norma no registro possui identificador único e permanente — nunca renumerado nem reutilizado (REQ-002; ADR-011 / ARQ-002). |
| **P5** | Independência tecnológica | A arquitetura é lógica e documental sob `/docs`. Nenhuma capacidade do registro depende de fornecedor, plataforma, banco ou protocolo específico (CON-001 Art. 7º §2º; ADR-013 D4). |
| **P6** | Separação entre identidade normativa e representação documental | O **estado normativo** (pertença ao registro, status, versão vigente, histórico) não se confunde com a **representação textual** do conteúdo da norma. Consumidores obtêm vigência e histórico pelo registro; o texto vigente pela representação documental associada. Em divergência de estado, prevalece o registro. |
| **P7** | Consistência índice × documento | Toda entrada do índice deverá corresponder exatamente a um único documento normativo válido. Não existem entradas órfãs, documentos normativos vigentes fora do índice, nem uma entrada apontando para mais de um documento. |

---

## 2. Diretriz de reutilização

Por precedente obrigatório da ARQ-001 e parecer do CTO (22/07/2026), esta arquitetura **reutiliza padrões consolidados** antes de criar modelos ou espaços novos:

| Padrão consolidado | Onde | Reutilização |
|--------------------|------|--------------|
| Fonte canônica, identificadores permanentes, unicidade de vigência, histórico com MO | REQ-002; ARQ-001; ADR-008 | Núcleo do registro de normas |
| Índice/catálogo como fonte de estado | `docs/README.md`; `docs/concepts/README.md` | Índice oficial do registro de normas |
| Documento sob `/docs` | CON-001 Art. 7º §4º | Representação textual das normas |
| Histórico tabular append-oriented | Documentos aprovados; ARQ-001 (cadeia evolutiva) | Histórico de alterações da norma |
| Independência de espaços de identificação | ADR-008; ARQ-002 | Não criar espaço novo sem necessidade demonstrada |

---

## 3. Deliberação L1 × L2

### 3.1 Alternativas

| Linha | Organização |
|-------|-------------|
| **L1** | Registro como **índice e estrutura de estado** sobre o **espaço documental existente** (`PREFIXO-nnn` já emitidos pela governança documental). |
| **L2** | Registro em **espaço próprio de identificação normativa** (novo espaço sob ARQ-002), com identificadores dedicados referenciando a representação documental. |

### 3.2 Avaliação pelos princípios

| Princípio | L1 | L2 |
|-----------|----|----|
| **P1** Fonte única | Satisfeito — um índice oficial do registro | Satisfeito — um registro com espaço próprio |
| **P2** Unicidade de vigência | Satisfeito — estado no índice/registro | Satisfeito |
| **P3** Rastreabilidade | Satisfeito — histórico no documento e/ou no registro | Satisfeito |
| **P4** Identificadores permanentes | Satisfeito — reutiliza `PREFIXO-nnn` já permanentes | Satisfeito — novos IDs; exige ARQ de espaço + migração de todo o acervo normativo |
| **P5** Independência tecnológica | Satisfeito | Satisfeito |
| **P6** Identidade × representação | Satisfeito **se** o registro (estado) for distinto do arquivo (texto), ainda que compartilhem o mesmo identificador documental | Satisfeito por dualidade de IDs — ao custo de camada adicional não exigida pelo REQ-002 |

### 3.3 Evidências do acervo

* O REQ-002 ancora o universo normativo ao **catálogo oficial** e exige que cada documento normativo vigente **conste do registro com identificador permanente** — redação compatível com o identificador documental já existente.
* A organização já opera normas como documentos `PREFIXO-nnn` com histórico e status no próprio artefato; L2 imporia segunda identidade sem requisito que a exija.
* O precedente dos conceitos (espaço CNC) nasceu de decisão explícita (ADR-008): conceito ≠ documento. Para normas de governança, o artefato documental **é** a sede do texto normativo; a distinção necessária é **estado no registro** × **texto no documento** (P6), não necessariamente dois espaços de ID.
* Criar L2 agora geraria dependência arquitetural adicional (ARQ de identificação + regularização de todo o acervo) **sem lacuna bloqueante** demonstrada — oposto à maturidade de “reutilizar antes de criar espaços” reconhecida pelo CTO.

### 3.4 Decisão

> **Adota-se a linha L1:** o Registro Canônico de Normas organiza-se como **índice oficial e estrutura de estado** sobre o espaço documental existente; o identificador permanente da norma é o identificador documental `PREFIXO-nnn` já atribuído pela governança documental.
>
> A separação P6 realiza-se assim: **identidade normativa / estado** = entrada no registro (pertença, status, versão vigente, ponteiros de histórico); **representação documental / autoridade do texto** = arquivo sob `/docs` que carrega o texto homologado. O mesmo identificador liga as duas faces; não se cria espaço de identificação normativo distinto.
>
> **O índice representa a fonte canônica do estado de vigência das normas, permanecendo a autoridade normativa vinculada ao documento homologado correspondente.** O índice não substitui o documento; não é sede do texto normativo.
>
> **A adoção da alternativa L1 decorre da inexistência de lacuna arquitetural identificada no estado atual do projeto. Novas alternativas somente poderão ser consideradas mediante nova decisão arquitetural formal.**
>
> **L2 permanece alternativa futura** apenas nesse regime: se evidência organizacional demonstrar necessidade de religar representação sem alterar identidade normativa (ou equivalente), sua adoção exigirá ARQ específica de espaço (ARQ-002) e deliberação de governança — não está autorizada por esta decisão.

**Dependências arquiteturais adicionais decorrentes desta decisão:** nenhuma bloqueante. Não se cria novo espaço de identificação. Não se exige ADR estrutural prévia à implementação documental do índice.

---

## 4. Decisões arquiteturais

### A1 — Forma do registro

O Registro Canônico de Normas é uma **estrutura documental** sob `/docs`, composta por:

1. **Índice oficial do registro** — relação canônica de todas as normas integrantes do registro, com identificador, designação, status, versão vigente e referência à representação documental. É a **fonte canônica do estado de vigência** do acervo normativo: uma norma existe no registro se, e somente se, consta deste índice. **A autoridade normativa do texto permanece vinculada ao documento homologado correspondente** — o índice não a substitui (P6).
2. **Representações documentais** — os documentos normativos sob a árvore `/docs`, em suas localizações já definidas pelo catálogo e pelos tipos documentais; esta arquitetura **não relocaciona** artefatos homologados.

Localização do índice: `docs/norms/README.md` (pasta `docs/norms/` dedicada ao registro; não confunde com o catálogo geral `docs/README.md`, que permanece o catálogo de tipos e documentos do projeto).

### A2 — Universo do registro

* Integram o registro exatamente os documentos que o **catálogo oficial** classifica como **normativos de governança**, no sentido do REQ-002.
* Esta arquitetura **não redefine** a taxonomia do catálogo nem o que é “norma de governança”; apenas exige que a classificação no catálogo e a presença no índice do registro permaneçam consistentes (**P7**).
* Toda entrada do índice corresponde exatamente a um único documento normativo válido; todo documento normativo vigente classificado como tal no catálogo consta exatamente de uma entrada no índice.
* Inclusão, exclusão ou reclassificação de um documento quanto à pertença normativa é ato de governança documental (catálogo + índice), com rastro na Memória Organizacional.

### A3 — Organização das informações por norma

Para cada norma no registro, o conjunto lógico de informações é:

| Face | Conteúdo | Onde reside |
|------|----------|-------------|
| Identificação | Identificador permanente `PREFIXO-nnn` | Índice + documento |
| Estado normativo | Status (vocabulário oficial do catálogo) e versão vigente | **Índice** (fonte de estado); espelhado no cabeçalho do documento |
| Representação textual | Texto normativo vigente | **Documento** sob `/docs` |
| Histórico | Cadeia de alterações de conteúdo/status com os cinco campos da MO | **Documento** (histórico de versões / cadeia equivalente), recuperável a partir do identificador (REQ-002) |
| Aprovação | Quem aprovou e quando (normas Aprovadas) | Documento + refletido no estado quando aplicável |

Em divergência entre o status/versão declarados no índice e no documento, **prevalece o índice** para fins de estado do registro (P1, P6); a correção produz novo evento de histórico, sem apagar o passado (P3).

### A4 — Relação entre registro, histórico e resolução

* O **índice** responde: quais normas existem no registro; qual o status e a versão vigente de cada uma.
* O **histórico no documento** responde: cadeia temporal de alterações; versões anteriores recuperáveis.
* A **resolução corrente** (REQ-003) lê do registro (índice + documento) a versão vigente; a resolução com instante de referência percorre o histórico. Esta ARQ não define o algoritmo de conflitos horizontais/verticais do REQ-003 — apenas garante que a estrutura de estado e histórico seja legível de forma determinística.
* Exatamente uma versão vigente por norma no índice, em qualquer instante (P2).

### A5 — Precedência sobre espelhos

Todo artefato derivado (espelhos operacionais, regras de ferramenta, cópias) é subordinado ao Registro Canônico de Normas. Em divergência, prevalece o registro (REQ-002; P1). A **detecção** sistemática de divergência permanece fora desta arquitetura (CAP-09).

### A6 — Estratégia de referência

* Consumidores referenciam normas pelo identificador documental permanente `PREFIXO-nnn`.
* Quando a precisão temporal importar, acrescentam instante de referência ou identificação da versão/evento histórico.
* Transcrições em consumidores são informativas e não vinculantes; prevalecem registro e representação canônicos.

### A7 — Extensibilidade

A arquitetura do registro permanece extensível: novas colunas ou metadados poderão ser acrescentados ao índice sem invalidar entradas existentes nem alterar a identidade das normas (precedente ARQ-001 A5). Não define migração estrutural nem versionamento do esquema do índice.

### A8 — Rastreabilidade arquitetural

| Elemento | Satisfaz |
|----------|----------|
| Índice único como fonte de estado | P1; REQ-002 (registro único) |
| Identificador = `PREFIXO-nnn` documental | P4; REQ-002; decisão L1 |
| Status + versão vigente no índice | P2; REQ-002 |
| Histórico com MO no documento | P3; CON-001 Art. 8º; REQ-002 |
| Separação índice (estado de vigência) × documento (autoridade do texto) | P6 |
| Consistência biunívoca índice × documento | P7 |
| Localização sob `/docs` | P5; CON-001 Art. 7º §4º |
| Precedência sobre espelhos | P1; REQ-002 |
| Estrutura legível pela resolução | REQ-003 (suporte estrutural) |
| Sem novo espaço de identificação | ARQ-002; ADR-008; decisão L1 |
| Extensibilidade | ARQ-001 A5 (precedente) |

---

## 5. O que esta arquitetura não define

* Implementação técnica, tecnologia, banco de dados, protocolos, sincronização ou automação.
* Arquitetura da Distribuição de Governança (REQ-010 a REQ-013) — gate futuro, após esta Frente.
* Algoritmo completo de resolução de conflitos do REQ-003 (suspensão, comunicação ao Usuário).
* Detecção de divergência canônico × espelhos (CAP-09).
* Redefinição do que é documento normativo (taxonomia do catálogo).
* Criação de espaço de identificação `NOR-nnn` ou equivalente (L2 — não adotada).
* Alteração de REQ-002, REQ-003 ou de artefatos homologados.
* Execução da materialização do índice (gate de Implementação).

---

## 6. Dependências e encaminhamentos

| Item | Situação |
|------|----------|
| Dependências bloqueantes para esta ARQ | Nenhuma adicional |
| Próximo gate desta frente (após homologação) | **Implementação** documental do índice `docs/norms/` e alinhamento consistente com o catálogo — quando autorizado |
| Arquitetura da Distribuição | Reavaliar abertura após homologação desta ARQ e, preferencialmente, após a fonte de normas estar operacional no plano documental |
| L2 / novo espaço de ID | Somente se evidência futura + ARQ específica + deliberação de governança |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; REQ-002 v1.0; ADR-008; ADR-013 (Frente 2); ARQ-001; ARQ-002 |
| Satisfaz | REQ-002; suporte estrutural a REQ-003 |
| Origem | Deliberação da Governança — autorização ARQ-004 (22/07/2026); Recomendação Técnica aprovada pelo CTO; ajuste metodológico dos princípios |
| Decisão estrutural | **L1** (índice sobre espaço documental); L2 rejeitada no estado atual |
| Gera | Gate de Implementação do registro (quando autorizado); base para reavaliar Arquitetura da Distribuição |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Redação: princípios P1–P6; deliberação L1×L2 com decisão L1; decisões A1–A8 | Autorização da Governança — Gate de Arquitetura da Frente 2 | Aprovado pelo CTO com ajustes pontuais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Índice = fonte do estado (não da autoridade do texto); P7 consistência índice×documento; reversibilidade formal da decisão L1 | Revisão técnica do CTO — precisão conceitual sem alteração da decisão L1 | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | L1 e princípios P1–P7 incorporados ao acervo arquitetural; Gate de Arquitetura do REQ-002 / Frente 2 encerrados | Homologação da Governança | **Homologada — Registro Canônico de Normas arquitetado (L1)** |

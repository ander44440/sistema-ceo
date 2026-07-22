# ARQ-005 — Arquitetura da Distribuição de Governança

> **Status: Homologada — v1.0 (Governança, 22/07/2026).**
> Versão 1.0 — 22/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; REQ-001; REQ-010 a REQ-013 v1.0; CNC-005; ADR-008 v1.0 (fonte × canal); ADR-013 v1.0; ARQ-004 v1.0; IMP-002 concluído; ARQ-001/ARQ-002 (precedentes).
> Este documento define **arquitetura lógica** do domínio de Distribuição de Governança. Não implementa o canal; não define protocolos, tecnologia, sincronização ou persistência técnica; não altera o Registro Canônico de Normas nem os REQ-010 a REQ-013; não redefine a autoridade das fontes canônicas.
> **Gate de Arquitetura da Distribuição:** encerrado com esta homologação.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organiza logicamente o domínio de Distribuição de Governança e como ele se relaciona com as fontes canônicas da organização?**

Integrar, sem absorver, as responsabilidades de REQ-010 (pacote), REQ-011 (vínculo), REQ-012 (entrega e propagação) e REQ-013 (rastro), e definir as interfaces com o Registro Canônico de Normas, a autoridade semântica de conceitos e a Constituição.

---

## 1. Princípios arquiteturais

Estes princípios **precedem** qualquer decisão de estrutura. São critérios objetivos: nenhuma decisão desta arquitetura pode violá-los.

### 1.1 Princípios específicos do canal (obrigatórios — Governança / CTO)

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **D1** | Não duplicação de autoridade | O canal de distribuição **nunca** constitui fonte normativa; toda autoridade permanece vinculada às fontes canônicas homologadas. |
| **D2** | Transitividade da distribuição | A distribuição **transporta** autoridade, mas **não a transforma** — preserva integralmente o significado organizacional recebido da fonte, inclusive perante múltiplos destinatários ou espelhos. |
| **D3** | Direção da dependência | O canal **depende** das fontes canônicas; as fontes canônicas **não dependem** do canal. |

### 1.2 Separação fonte × canal (ADR-008)

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **D4** | Fonte × canal | As fontes são donas do conteúdo, da vigência e da resolução; o canal responde pela entrega, pela correspondência de versão, pela propagação e pelo rastro do ato de distribuir. |

### 1.3 Princípios reutilizados da fonte (ARQ-004), quando aplicáveis ao canal

| ID | Princípio | Aplicação ao canal |
|----|-----------|-------------------|
| **P1** | Fonte canônica única | O canal não cria segunda fonte; em divergência, prevalecem as fontes (REQ-010; D1) |
| **P2** | Unicidade de vigência | O que se entrega corresponde à única versão vigente na fonte no momento da entrega (REQ-012) |
| **P3** | Rastreabilidade histórica | Todo ato de distribuição gera rastro com Memória Organizacional (REQ-013) |
| **P4** | Identificadores permanentes | Destinatários e elementos do pacote referenciados por IDs permanentes das fontes (CNC-005; PREFIXO-nnn; CNC-nnn) |
| **P5** | Independência tecnológica | Arquitetura lógica/documental; nenhuma obrigação do canal depende de ferramenta específica (REQ-001; CON-001 Art. 7º §2º) |
| **P6** | Identidade × representação | Espelhos/derivados do canal são representação subordinada; não alteram identidade normativa na fonte |
| **P7** | Correspondência biunívoca | Onde o canal mantiver índices próprios (vínculos, atos), cada entrada corresponde a exatamente um objeto organizacional válido |

> **Nota de reutilização:** os princípios P1–P7 da ARQ-004 permanecem válidos neste documento **apenas quando compatíveis com o domínio da Distribuição**. Não há reaproveitamento automático: cada aplicação acima é contextual ao canal e subordinada a D1–D6.

### 1.4 Princípios complementares do domínio

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **D5** | Subordinação dos espelhos | Todo artefato derivado da distribuição é espelho subordinado; em divergência, prevalece a fonte canônica (REQ-010; ANL-004 §8) |
| **D6** | Fronteira de fase | O especificável documentalmente na Fase 1 distingue-se do remetido à implementação técnica futura (ADR-013, Decisão 4) |

---

## 2. Mapa de responsabilidades (integração sem absorção)

| Componente | REQ | Responsabilidade (inalterada) | Papel na ARQ-005 |
|------------|-----|-------------------------------|------------------|
| Pacote | REQ-010 | O quê se distribui; proveniência; precedência da fonte | Organização lógica da composição a partir das fontes |
| Vínculo | REQ-011 | Para quem; início / vigência / cessação da obrigação | Representação arquitetural dos efeitos do CNC-005 |
| Entrega e propagação | REQ-012 | Correspondência; propagação; indisponibilidade; neutralidade temporal | Modelo organizacional dos atos de disponibilização e disseminação |
| Rastro | REQ-013 | Memória dos atos; recuperabilidade (≠ consulta); imutabilidade lógica | Estrutura lógica do histórico de distribuição |
| Fontes | REQ-002/ARQ-004; REQ-006/008; CON-001 | Autoridade normativa/semântica | Interfaces de leitura — nunca escrita de autoridade pelo canal |

---

## 3. Decisões arquiteturais

### A1 — Organização lógica do canal

O domínio de Distribuição de Governança materializa-se, no plano documental da Fase 1, como estrutura sob:

**`docs/distribution/`**

Composta, no mínimo, por:

1. **Índice do canal** (`docs/distribution/README.md`) — porta de entrada e fonte de estado do *mecanismo de distribuição* (não das normas): aponta pacote vigente derivado, vínculos ativos para fins de distribuição, e referência ao rastro.
2. **Composição do pacote** — artefato(s) que registram a projeção determinável do pacote a partir das fontes (REQ-010), com versão/fonte de cada elemento.
3. **Vínculos de distribuição** — relação dos agentes alcançados pela obrigação (REQ-011), referenciando CNC-005 e as decisões sob governança que estabelecem/encerram o vínculo.
4. **Rastro** — registro append-oriented dos atos de entrega e propagação (REQ-013).

O canal **não** hospeda o texto normativo canônico; hospeda apenas projeções, estados de vínculo e rastros (D1, D2, D4).

### A2 — Interfaces com as fontes canônicas

| Fonte | Interface de leitura do canal | O canal não faz |
|-------|-------------------------------|-----------------|
| Constituição (CON-001) | Lê a versão vigente do documento canônico | Não emenda CON-001 |
| Registro Canônico de Normas | Lê estado de vigência em `docs/norms/` e texto no documento apontado (ARQ-004 P6) | Não altera o índice de normas nem os documentos |
| Autoridade semântica de conceitos | Resolve via índice `docs/concepts/` e REQ-008 | Não altera CNC nem definições |

Esta arquitetura estabelece **dependências lógicas** de leitura — não uma **ordem de leitura** nem um procedimento operacional. A sequência concreta de composição, entrega ou verificação, se necessária, pertence ao gate de Implementação.

**Dependência unidirecional (D3):** alteração nas fontes pode exigir nova composição/propagação no canal; alteração no canal **nunca** altera as fontes.

### A3 — Composição do pacote a partir das fontes

* O pacote é uma **projeção derivada** das três categorias do REQ-010: Constituição; normas vigentes (universo e estado do Registro Canônico); conceitos vigentes.
* A composição registra, para cada elemento: identificador permanente, fonte, versão vigente no instante da composição.
* Em divergência entre projeção distribuída e fonte, **prevalece a fonte** (D1, D5).
* Recomposição ocorre quando a vigência nas fontes muda de modo relevante para o pacote; a propagação aos vínculos ativos observa REQ-012.

### A4 — Representação arquitetural do vínculo

* O vínculo de distribuição é o efeito organizacional do **CNC-005** (REQ-011): nasce e cessa por decisão sob governança (CNC-001).
* O canal mantém um **registro de alcance** (quem está sob obrigação de receber o pacote integral), sem redefinir o conceito de agente conectado.
* Estar vinculado e estar alcançado pela distribuição são inseparáveis (REQ-011); o registro de alcance reflete apenas vínculos vigentes.

### A5 — Entrega e propagação (modelo organizacional)

* **Entrega** = disponibilização do pacote a um agente alcançado.
* **Propagação** = disseminação de atualizações de vigência ao conjunto de alcançados.
* Cada ato registra correspondência com a versão vigente na fonte (REQ-012); indisponibilidade de fonte é estado **declarado**, nunca suprido por conteúdo presumido.
* Neutralidade temporal: conformidade independe do instante, desde que a defasagem seja identificável e a propagação preserve consistência (REQ-012).
* Na Fase 1, esses atos são **registráveis documentalmente**; entrega automática a ferramentas externas permanece na fronteira técnica (D6).

### A6 — Organização do rastro

* Todo ato de entrega ou propagação gera entrada de rastro com o conteúdo mínimo do REQ-013 e os cinco campos da Memória Organizacional.
* O rastro registra a **ocorrência organizacional** do ato, independentemente de mecanismo técnico (REQ-013).
* Imutabilidade lógica: atos registrados não são apagados; correções geram novos registros.
* Recuperabilidade ≠ consulta/indexação/desempenho (REQ-013).

### A7 — Identificação

* Elementos do pacote e destinatários usam identificadores **já existentes** das fontes (PREFIXO-nnn; CNC-nnn).
* **Não se cria**, nesta arquitetura, novo espaço de identificação organizacional. O critério é o da ARQ-002: **reutilizar estruturas e espaços existentes antes de criar novos identificadores**; novo espaço só nasce por arquitetura específica quando a necessidade for demonstrada.
* Identificadores locais de atos de rastro, se necessários na implementação documental, são convenção interna do canal sob `docs/distribution/` — **sem** pretender espaço ARQ-002. Se evidência futura exigir espaço permanente próprio, nascerá ARQ específica (ARQ-002, A1/A6).

### A8 — Fronteira documental × técnica (ADR-013 D4)

| Documental (Fase 1 / implementação futura do canal sob `/docs`) | Técnico (fase futura) |
|----------------------------------------------------------------|------------------------|
| Composição do pacote; registro de vínculos; garantias de versão; rastro; precedência das fontes | Entrega automática a ferramentas externas; propagação ativa em tempo de uso; protocolos; cache; sincronização técnica |

A ARQ-005 especifica ambos os lados como *obrigações e limites*; só o lado documental é candidato ao próximo gate de Implementação do canal.

### A9 — Extensibilidade

Novos metadados de pacote, vínculo ou rastro podem ser acrescentados sem invalidar registros existentes nem alterar D1–D6. Não define migração estrutural do canal.

### A10 — Rastreabilidade arquitetural

| Elemento | Satisfaz |
|----------|----------|
| D1–D3; D4 fonte × canal | CTO/Governança; ADR-008 |
| Pacote como projeção das fontes | REQ-010; D1; D2 |
| Vínculo como alcance do CNC-005 | REQ-011; CNC-005 |
| Entrega / propagação / indisponibilidade | REQ-012 |
| Rastro append-oriented com MO | REQ-013; CON-001 Art. 8º |
| Interfaces de leitura com normas e conceitos | ARQ-004; REQ-006/008; D3 |
| Sem novo espaço de ID | ARQ-002; precedente ARQ-004 L1 |
| Fronteira documental × técnica | ADR-013 D4; D6 |
| Localização `docs/distribution/` | CON-001 Art. 7º §4º; P5 |

---

## 4. O que esta arquitetura não define

* Implementação do canal (documental ou técnica)
* Protocolos, tecnologias, sincronização, cache, armazenamento
* Alteração do Registro Canônico de Normas ou de `docs/concepts/`
* Emenda aos REQ-010 a REQ-013 ou ao CNC-005
* Auditoria ativa canônico × espelho (CAP-09)
* Algoritmo completo de resolução de conflitos de normas (REQ-003)
* Convenção definitiva de nomes de arquivos internos do rastro (matéria do gate de Implementação, observada A7)

---

## 5. Dependências e encaminhamentos

| Item | Situação |
|------|----------|
| Dependências bloqueantes | **Nenhuma** — fontes operacionais; REQs homologados |
| Próximo gate (após homologação) | Implementação **documental** do canal sob `docs/distribution/`, quando autorizado (ADR-013 D2: fontes prontas) |
| Fase técnica | Remetida explicitamente (A8) |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001; REQ-001; REQ-010…013; CNC-005; ADR-008; ADR-013; ARQ-004; IMP-002 |
| Origem | Deliberação da Governança — autorização ARQ-005 (22/07/2026); Recomendação Técnica com D1–D3 |
| Integra | REQ-010, REQ-011, REQ-012, REQ-013 (sem absorção) |
| Consome | Registro Canônico de Normas; autoridade semântica; CON-001 |
| Gera | Base para Implementação documental do canal (quando autorizada) |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Princípios D1–D6 + P aplicáveis; decisões A1–A10; integração REQ-010…013; interfaces com fontes | Autorização da Governança — redação ARQ-005 | Aprovado pelo CTO com ajustes editoriais mínimos |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Nota de reutilização condicional dos P da ARQ-004; interfaces = dependências lógicas (não ordem de leitura); A7 com referência explícita à ARQ-002 | Revisão técnica do CTO — precisão editorial sem alteração arquitetural | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Arquitetura oficial da Distribuição; Gate de Arquitetura encerrado | Homologação da Governança | **Homologada — domínio arquiteturalmente consolidado** |

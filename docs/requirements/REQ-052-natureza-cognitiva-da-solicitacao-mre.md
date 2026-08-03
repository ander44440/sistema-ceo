# REQ-052 — Natureza Cognitiva da Solicitação (MRE)

> **Status:** Rascunho  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá classificar a **Natureza Cognitiva da Solicitação** em toda rota deliberativa do Motor de Raciocínio Executivo (MRE), **antes** de conduzir a deliberação como se fosse decisão operacional sobre itens concretos, de modo que o pipeline adapte o modo de raciocínio (método, decisão operacional, planejamento ou explicação) e deixe de tratar perguntas metodológicas como inventário em falta.

## Tipo

Funcional (núcleo) e não funcional (qualidade / fidelidade deliberativa); detalhado.

## Objetivo

Transformar a VIS-008 em requisitos testáveis: definir o conceito, o catálogo inicial de categorias, o momento obrigatório da classificação no fluxo MRE, o que essa classificação fornece aos estágios seguintes, regras obrigatórias, aceitação, casos positivos/negativos, compatibilidade com a baseline MRE e impactos esperados — **sem** fixar arquitetura nem implementação.

## Escopo

### Inclui

* Definição normativa de **Natureza Cognitiva da Solicitação**.
* Categorias iniciais fechadas.
* Momento da classificação relativamente ao pipeline REQ-049.
* Informações que a classificação deve disponibilizar aos estágios seguintes.
* Regras obrigatórias de comportamento por categoria.
* Critérios de aceitação, casos positivos e negativos.
* Compatibilidade explícita com ADR-019 e REQ-048…051.
* Impactos esperados na qualidade do raciocínio executivo.

### Fora do escopo

* Arquitetura de componentes, classes, ficheiros, APIs ou prompts literais.
* Alteração do enum `EstadoDecisaoExecutiva` ou demais enums fechados da REQ-048.
* Redesign do pipeline 0–8 (REQ-049) além do **ponto de inserção lógico** da classificação.
* Alteração das responsabilidades do Speaker (REQ-050) ou do Aprendizado (REQ-051), salvo consumo da natureza quando registada no parecer.
* Classificação de intenções determinísticas do Núcleo que **não** entram no MRE.
* Novas categorias além do catálogo inicial (requerem emenda a esta REQ).

## Justificativa

VIS-008: em produção R1, perguntas do tipo «como decidir» foram tratadas como decisões operacionais sem itens, levando a `solicitar_dados` / cautela indevida. ADR-015 (progresso por unidade de tempo); CON-001 (respeito ao tempo do utilizador; nunca executar sem objetivo claro — aqui: objetivo *metodológico* vs *operacional*); ADR-019 (MRE delibera com qualidade, não apenas com schema válido).

---

## 1. O que é «Natureza Cognitiva da Solicitação»

**Natureza Cognitiva da Solicitação** é a classificação normativa do **tipo de trabalho intelectual** que o utilizador pede ao CEO numa interação deliberativa, distinta de:

* a **intenção de roteamento** do Núcleo (ex.: `deliberar`, `pergunta_aberta`);
* o **`tipoPedido`** do enquadramento REQ-048/049 (`informacao` | `decisao` | `execucao` | `ambiguo`);
* o **`estado`** da decisão executiva (`aprovar` | `rejeitar` | …).

Ela responde à pergunta: *o utilizador pede um método, uma escolha entre instâncias, um plano, ou uma explicação?*

A classificação é um **artefacto lógico** da deliberação: deve ser determinada uma vez por corrida deliberativa e permanecer estável até ao fecho do `ParecerExecutivo` (salvo regeneração controlada por falha, caso em que pode ser reavaliada).

---

## 2. Categorias iniciais (catálogo fechado)

O catálogo inicial é **fechado**. Apenas estes valores são válidos na v0.1 desta REQ:

| Valor lógico | Nome | Definição normativa |
|--------------|------|---------------------|
| `metodo_de_decisao` | Método de decisão | Pedido de critérios, processo, trade-offs ou princípios para decidir — **sem** exigir escolha imediata entre itens concretos nomeados |
| `decisao_operacional` | Decisão operacional | Pedido de escolha, priorização ou ato de governo sobre **alternativas ou itens concretos** (nomeados, listados ou recuperáveis do dossier com identidade suficiente) |
| `planejamento` | Planejamento | Pedido para estruturar passos, sequência ou plano coordenado a partir de um objetivo |
| `explicacao` | Explicação | Pedido para justificar, esclarecer ou narrar o fundamento de um estado, decisão ou parecer já existente — **sem** reabrir escolha operacional |

**Regra de exclusividade:** cada deliberação MRE tem **exatamente uma** natureza cognitiva primária. Em pedidos mistos, aplica-se a regra de desempate da §5.

---

## 3. Quando a classificação ocorre no pipeline

Relativamente ao fluxo REQ-049:

```text
Núcleo: rota deliberativa confirmada
        ↓
★ Natureza Cognitiva da Solicitação  ← OBRIGATÓRIO neste limiar
        ↓
Estágios 0 → 1 → 2 → 3 → 4 → 5a ∥ 5b → 6 → 7 → 8
        ↓
ParecerExecutivo (REQ-048) + Speaker (REQ-050)
```

### Requisitos de momento

1. A classificação **deve** ocorrer **após** a confirmação de que a mensagem segue a **rota deliberativa** do MRE.  
2. A classificação **deve** estar **concluída e disponível** **antes do início do estágio 4 (Análise)**.  
3. **Recomendação normativa (obrigatória para conformidade):** a natureza deve estar disponível **no mais tardar ao concluir o estágio 1 (Enquadramento)**, para que o estágio 2 (Dossier) e os seguintes não assumam por omissão o modo `decisao_operacional`.  
4. A classificação **não** pode ser omitida em falha controlada: o parecer de falha deve ainda assim registar a natureza determinada até ao ponto da falha, ou `indeterminada_por_falha` apenas se a falha ocorrer **antes** de qualquer classificação — nesse caso, a corrida seguinte deve classificar de novo.  
   - *Nota:* `indeterminada_por_falha` **não** é categoria do catálogo §2; é apenas marcador de metadado de falha pré-classificação.

Esta REQ **não** fixa se a classificação é um pré-estágio, parte do estágio 0, parte do estágio 1 ou passo do Núcleo imediatamente antes da entrada no MRE — apenas o **limiar temporal** acima.

---

## 4. Informações fornecidas aos estágios seguintes

A classificação deve disponibilizar, no mínimo, o seguinte **pacote lógico** (nomes ilustrativos; serialização fora de escopo):

| Campo lógico | Obr. | Descrição |
|--------------|------|-----------|
| `naturezaCognitiva` | Sim | Um dos valores do catálogo §2 |
| `confiancaNatureza` | Sim | Número `0..1` — confiança na classificação |
| `fundamentoNatureza` | Sim | Frase curta: por que esta categoria (não prosa de UI) |
| `exigeItensConcretos` | Sim | Booleano derivado: `true` só se `decisao_operacional` |
| `politicaLacunas` | Sim | Ver §5 — política aplicável a lacunas de inventário |
| `modoEsperadoEstagio6` | Sim | Orientação lógica ao estágio 6 (não substitui o enum REQ-048) |

### Consumo por estágios (obrigatório)

| Estágio / passo | Uso obrigatório da natureza |
|-----------------|----------------------------|
| 2 — Dossier | Se `exigeItensConcretos = false`, a ausência de lista de itens **não** deve, por si só, gerar lacuna material de inventário |
| 3 — Princípios | Deve privilegiar princípios úteis ao modo (ex.: método → critérios; explicação → transparência / rastreio) |
| 4 — Análise | Deve analisar no modo da natureza (método/plano/explicação/decisão), **sem** narrar «dados insuficientes para decidir itens» quando a natureza for `metodo_de_decisao` e o pedido for metodológico |
| 5a / 5b | Riscos/oportunidades no modo da natureza; risco «decidir sem inventário» **não** é risco alto por omissão em `metodo_de_decisao` |
| 6 — Decisão | Deve emitir ato coerente com a natureza (ver §5); enum REQ-048 permanece fechado |
| 7 — Ação | Gesto coerente (ex.: método → `orientar` com critérios; não `perguntar` só por falta de inventário) |
| 8 — Aprendizado | Pode considerar a natureza ao decidir memória/precedente (sem alterar a decisão) |
| Parecer / metadados | A natureza **deve** ficar registada de forma recuperável no `ParecerExecutivo` (via `metadados` ou campo dedicado futuro **sem** violar V1–V6 atuais) |
| Speaker (REQ-050) | Comunica o parecer; **não** reclassifica; deve permanecer fiel ao ato (incl. método/critérios quando for o caso) |

---

## 5. Regras obrigatórias

### R1 — Catálogo fechado
Só são válidas as categorias da §2. Valores livres são inválidos.

### R2 — Uma natureza por deliberação
Exatamente uma natureza primária por corrida MRE.

### R3 — Desempate em pedidos mistos
Se a mensagem misturar naturezas, aplicar por ordem de prioridade:

1. Se há **escolha explícita entre itens/alternativas concretas** → `decisao_operacional`.  
2. Senão, se pede **plano/passos/estruturação de execução** → `planejamento`.  
3. Senão, se pede **como / critérios / método de decidir** → `metodo_de_decisao`.  
4. Senão, se pede **porquê / explique** sobre facto ou decisão já existente → `explicacao`.  
5. Em dúvida residual com `confiancaNatureza < 0,5` → classificar `metodo_de_decisao` **ou** `decisao_operacional` com fundamentação explícita; **proibido** omitir a classificação.

### R4 — Método ≠ inventário em falta (`metodo_de_decisao`)
Quando `naturezaCognitiva = metodo_de_decisao`:

* É **proibido** tratar a ausência da lista completa de itens/demandas como lacuna material que **obriga** `estado = solicitar_dados`.  
* O estágio 6 **deve** privilegiar um ato que entregue **critérios, processo ou quadro de priorização** (tipicamente coerente com `aprovar` + ação `orientar`, ou equivalente fiel ao enum), podendo **sugerir** dados que melhorariam uma escolha futura **sem bloquear** o método.  
* `solicitar_dados` só é permitido se faltar informação **essencial ao próprio método** (ex.: domínio ou objetivo real ininteligível), não a lista de instâncias.

### R5 — Decisão operacional (`decisao_operacional`)
Mantêm-se as regras de lacunas materiais da REQ-049: se itens/alternativas essenciais faltarem e impedirem escolha segura → preferir `solicitar_dados` (salvo urgência crítica justificada).

### R6 — Planejamento (`planejamento`)
O raciocínio deve tender a estruturar passos/plano; **não** deve reduzir-se a escolha binária A/B salvo o utilizador pedir explicitamente essa escolha (aí R3 → `decisao_operacional`).

### R7 — Explicação (`explicacao`)
**Proibido** reabrir escolha operacional ou exigir inventário novo só para «explicar». O parecer deve justificar/esclarecer; estados típicos alinham-se a orientar/monitorar/adiar conforme o caso — sem inventar nova decisão de itens.

### R8 — Não confundir com `tipoPedido` nem com `estado`
* `tipoPedido = decisao` **não** implica `naturezaCognitiva = decisao_operacional`.  
* `estado = solicitar_dados` **não** é natureza cognitiva.  
* O id de estágio ou nomes de campos contendo a palavra «decisão» **não** autorizam valores fora do enum REQ-048.

### R9 — Compatibilidade de contrato
A introdução da natureza **não** pode invalidar pareceres que cumpram REQ-048 V1–V6; o registo da natureza não remove campos obrigatórios existentes.

### R10 — Speaker e Aprendizado não deliberam natureza
REQ-050 e REQ-051 **não** classificam nem alteram a natureza; apenas consomem o parecer.

---

## 6. Critérios de aceitação

| ID | Critério (observável) |
|----|------------------------|
| CA-01 | Em toda corrida deliberativa MRE, existe `naturezaCognitiva` ∈ catálogo §2 antes do estágio 4. |
| CA-02 | Pedido «Como você decidiria / como priorizar…» (sem lista de itens) → `metodo_de_decisao`. |
| CA-03 | Em CA-02, o parecer **não** usa como fundamento exclusivo a ausência da lista de itens para `solicitar_dados`. |
| CA-04 | Em CA-02, a saída deliberativa contém **critérios ou método** utilizáveis (no parecer e, via Speaker, na mensagem). |
| CA-05 | Pedido «Qual das N opções / entre A e B…» com itens suficientes → `decisao_operacional`. |
| CA-06 | Em CA-05, lacunas materiais reais ainda podem produzir `solicitar_dados` (REQ-049). |
| CA-07 | Pedido «Monte um plano…» → `planejamento`. |
| CA-08 | Pedido «Explique por que…» sobre decisão/estado existente → `explicacao`; sem nova escolha operacional. |
| CA-09 | `ParecerExecutivo` resultante permanece válido sob REQ-048 (V1–V6). |
| CA-10 | Speaker gera comunicado a partir do parecer sem reclassificar a natureza (REQ-050). |
| CA-11 | Enum `EstadoDecisaoExecutiva` permanece fechado; nenhum valor livre (ex.: `"decisao"`) é aceite. |
| CA-12 | Aprendizado (REQ-051) não altera `decisaoExecutiva` / `acao` após a deliberação. |

---

## 7. Casos positivos

| ID | Entrada (exemplo) | Natureza esperada | Resultado esperado |
|----|-------------------|-------------------|--------------------|
| P1 | «Como você decidiria quais fazer primeiro?» (sem listar as cinco) | `metodo_de_decisao` | Quadro de critérios/prioridades; sem bloqueio por inventário |
| P2 | «Quais critérios usarias para cortar o backlog?» | `metodo_de_decisao` | Critérios explícitos |
| P3 | «Qual das cinco devo fazer?» + cinco itens no texto ou dossier | `decisao_operacional` | Escolha ou `solicitar_dados` só se faltar dado material à escolha |
| P4 | «Entre pagamento e outdoor, o que faço primeiro?» | `decisao_operacional` | Ato sobre as duas alternativas |
| P5 | «Monte um plano para entregar o Gate E5» | `planejamento` | Estrutura de plano / passos |
| P6 | «Explique por que adiámos o outdoor» | `explicacao` | Justificativa; sem reabrir A/B |
| P7 | «Por que o parecer pediu mais dados?» | `explicacao` | Esclarecimento do fundamento |

---

## 8. Casos negativos

| ID | Situação | Violação |
|----|----------|----------|
| N1 | «Como priorizar o dia?» → `solicitar_dados` **somente** porque as demandas não foram listadas | Viola R4 / CA-03 |
| N2 | «Como decidir?» classificado como `decisao_operacional` sem itens concretos | Viola CA-02 / R3 |
| N3 | Natureza omitida até ao estágio 6 | Viola §3 / CA-01 |
| N4 | `naturezaCognitiva = "decisao"` ou outro valor fora do catálogo | Viola R1 |
| N5 | Speaker inventa método ou escolha não presente no parecer | Viola REQ-050 / CA-10 |
| N6 | Estágio 4 narra «impossível deliberar sem inventário» sob `metodo_de_decisao` e isso determina sozinho o estágio 6 | Viola §4 consumo estágio 4 + R4 |
| N7 | Confundir `tipoPedido: decisao` com natureza operacional e forçar inventário | Viola R8 |
| N8 | Parecer inválido REQ-048 após introdução da natureza | Viola R9 / CA-09 |
| N9 | Aprendizado altera `estado` pós-deliberação | Viola REQ-051 / CA-12 |

---

## 9. Compatibilidade com ADR-019 e REQ-048…051

| Artefacto | Compatibilidade exigida |
|-----------|-------------------------|
| **ADR-019** | Mantém separação deliberação ≠ comunicação; natureza cognitiva **fortalece** a qualidade da deliberação, não cria canal paralelo ao utilizador. MRE continua a única via deliberativa; Speaker não delibera. |
| **REQ-048** | Enums e V1–V6 **inalterados** por esta REQ. Natureza registada sem remover campos obrigatórios; extensão preferencial via `metadados` até eventual emenda futura do schema (fora deste REQ). |
| **REQ-049** | Sequência 0–8 preservada. Esta REQ **insere um limiar lógico** obrigatório (§3) sem eliminar estágios. Regras de lacunas da REQ-049 **permanecem** para `decisao_operacional`; são **restringidas** quanto ao inventário sob `metodo_de_decisao` (R4). |
| **REQ-050** | Speaker continua a consumir apenas parecer válido; não classifica natureza; fidelidade ao parecer inclui comunicar método/critérios quando o parecer os contiver. |
| **REQ-051** | Aprendizado permanece pós-parecer; não delibera; não aplica princípios automaticamente; pode **ler** a natureza se estiver no parecer, sem mutar decisão/ação. |

**Não reabre:** ADR-019, ARQ-013, nem o contrato fechado de estados da REQ-048.

---

## 10. Impactos esperados

1. Fidelidade à pergunta (método vs escolha vs plano vs explicação).  
2. Redução de falsos `solicitar_dados` em perguntas metodológicas.  
3. Melhor uso dos princípios (estágio 3) como critérios explícitos.  
4. Maior progresso por unidade de tempo (ADR-015 / CON-001).  
5. Preservação da deliberação operacional quando há itens concretos.  
6. Rastreabilidade da natureza no parecer para auditoria e aprendizado.  
7. Sem degradação da separação MRE → Parecer → Speaker.

---

## Requisitos não funcionais

| ID | Requisito NFR |
|----|----------------|
| NFR-01 | A classificação não deve impedir a conclusão de uma deliberação em condições normais de operação do MRE (sem introduzir etapa opaca sem saída). |
| NFR-02 | A natureza e o `fundamentoNatureza` devem ser auditáveis a partir do parecer produzido. |
| NFR-03 | Em caso de conflito entre entregar método e pedir inventário sob `metodo_de_decisao`, prevalece entregar o método (R4). |

---

## Dependências

| Dependência | Papel |
|-------------|--------|
| VIS-008 | Origem exclusiva desta REQ |
| ADR-019 | Marco do MRE |
| REQ-048 | Contrato do parecer |
| REQ-049 | Pipeline 0–8 |
| REQ-050 | Speaker |
| REQ-051 | Aprendizado |
| ADR-015 | Filtro de uso diário MG2 |

## Riscos e incertezas

* Fronteira método vs planejamento («como estruturar a semana») — R3 mitiga, mas pode exigir exemplos adicionais em VAL futura.  
* Pedidos mistos («como priorizar e já escolhe entre A e B») — R3 prioriza decisão operacional.  
* VIS-008 ainda em rascunho à data desta REQ — ambos sujeitos a revisão conjunta.  
* Sem ADR de inserção: o *onde* físico da classificação permanece deliberadamente aberto (fora de escopo).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; VIS-001; VIS-008; ADR-015; ADR-019 |
| Origem | VIS-008 — Natureza Cognitiva da Solicitação no MRE |
| Decisões derivadas | *(ADR futuro de inserção, se necessário — não criado aqui)* |
| Implementação | *(não iniciada)* |
| Testes | *(TST futuro)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Engenheiro (Cursor) | Criação do REQ-052 a partir exclusivamente da VIS-008 | Evolução MRE pós-investigação de qualidade (estágio 6) | Rascunho — revisão conjunta |

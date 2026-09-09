# REQ-086 — Consulta de discussões e decisões registadas

> **Status: Homologado — v1.0 (09/09/2026).** Auditoria APTO contra definição V1, D1–D9 e resoluções de bloqueio; despacho de homologação registado.  
> **Versão:** 1.0 — 09/09/2026  
> **Capacidade:** CAP-05 — Memória Organizacional  
> **Nome normativo:** Consulta de discussões e decisões registadas  
> **(Rótulo de produto admitido:** Recuperação de discussões e decisões antigas — não altera o nome normativo deste REQ.)

## Enunciado

O CEO deverá, perante pedido explícito de consulta no caminho conversacional, devolver o que já foi **decidido** (registos Art. 8º da Memória Confiável) e/ou o que já foi **discutido** (mensagens do transcript do COA indicado), com lastro às fontes canónicas, **separando** decisão de discussão, respeitando **isolamento por COA**, em modo **somente leitura**, e declarando **ausência explícita** quando não houver lastro aplicável — sem inventar conteúdo e sem criar store paralelo.

## Tipo

Funcional; alto nível (V1).

## Justificativa

CON-001 Art. 8º (memória organizacional viva e consultável); CAP-05 / REQ-033 (histórico recuperável); espírito de ausência explícita (CON-001 Art. 9º princípio 8; alinhado a REQ-024 sem o substituir); ADR-015 (uso diário MG2). A definição V1 consolidada (D1–D9 aprovadas, 09/09/2026) fecha a fronteira entre consulta de arquivo decisório/conversacional e as frentes F5 (estado), recuperação de Jobs, Trilha Auditável, Histórico Físico, CAP-04 e MEP/CAP-13.

## Fronteira de capacidade (CAP-05 × transcript)

Este REQ rastreia **CAP-05**. A parte decisória consulta a Memória Organizacional (Art. 8º). A parte de discussões **lê** o transcript do COA já persistido pela interface conversacional; **não** atribui à CAP-05 a posse, curadoria ou evolução do arquivo conversacional. CAP-07 / CAP-03 permanecem donos da conversa como interface; este REQ apenas **consome** essa persistência em modo consulta.

## Relação com REQ-033

REQ-033 permanece a norma geral da Memória Organizacional viva (RF-01 e correlatos). O REQ-086 **não** reabre nem altera REQ-033. Acrescenta apenas: (a) invocação por **pedido explícito** no caminho conversacional; (b) inclusão da **consulta de discussões** via transcript do COA, distinta da decisão Art. 8º; (c) regras V1 de fontes canónicas, isolamento por COA, read-only e ausência explícita nesse acto de consulta. Cumprir REQ-033 **não** dispensa CA-086-* para o acto de consulta aqui definido.

## Pedido explícito (V1)

Conta como pedido de consulta deste REQ a mensagem do utilizador que, no COA activo (ou COA nomeado), expressa intenção de **reencontrar** o registado, incluindo pelo menos uma âncora do conjunto: *o que decidimos / que decisão / o que discutimos / no transcript / o que ficou registado / consulta à memória organizacional* (flexão e sinónimos óbvios admitidos).

**Não** conta: *continuar / despacha / status do job / o que sabes do domínio (KNW) / retomar o fio sem pedido de arquivo / perguntas só de estado operacional do dia* — esses seguem F5, Jobs, REQ-061, Porta EIC ou capacidades próprias.

Em dúvida objectiva entre consulta deste REQ e outro destino, **não** se inventa lastro; declara-se limitação ou pede-se desambiguação mínima.

## Escopo (V1)

* Consulta **sob demanda** por **pedido explícito** no **caminho conversacional**.
* Resposta com lastro apenas das **fontes canónicas V1** (secção seguinte).
* Distinção explícita na resposta entre **decisão** (Art. 8º / Memória Confiável) e **discussão** (transcript).
* Filtro por **COA / contexto** indicado ou activo; sem fuga entre COAs.
* Consumo de `consultarRegistosMo` (ou equivalente estável do ledger MO) no caminho de decisões.
* Correlação opcional à Trilha Auditável **somente** quando `refs` já existirem (referência auxiliar, não corpo da resposta).
* Operação **read-only**: zero append/gravação nos stores vizinhos só para cumprir a consulta.

## Fontes canónicas (V1)

### Sede Art. 8º para consulta (V1 deste REQ)

Unicamente o ledger da **Memória Confiável V1**. Registos em workspace, catálogo de projeto, Painel do Dia (REQ-022) ou prosa sem entrada no ledger **não** são decisão recuperável sob CA-086-*. Podem ser mencionados só como *estado operacional*, nunca como Memória Organizacional Art. 8º. A eventual declaração arquitectural de que este ledger realiza o componente H (ARQ-009) é **fora deste REQ** e não altera a sede de consulta V1 aqui fixada.

| Tipo de pergunta | Fonte canónica | Nota |
|------------------|----------------|------|
| Decisão organizacional (Art. 8º) | **Memória Confiável V1** (ledger MO) | Única verdade decisória recuperável nesta V1 |
| Discussão / prosa | **Transcript por COA** (F5-C3; `ceo.conversa.transcript.v1`) | Consumo read-only; CAP-05 **não** é dona do arquivo; **não** é Histórico Físico append-only — limitação declarada |
| Evento de execução | **Trilha Auditável** | Correlação **opcional** por `refs`; **não** substitui discussão nem decisão |
| Estado do dia / workspace | `executiveMemory` / catálogo | **Não** é decisão Art. 8º nesta V1 |

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-086-1** | Pedido explícito de consulta sobre decisão e/ou discussão obtém resposta **somente** com lastro das fontes canónicas V1, ou **ausência explícita**. | Lastro só MO e/ou transcript (e refs de Trilha só como referência) = pass; invenção ou silêncio ambíguo = fail. |
| **CA-086-2** | A resposta **separa** decisão (MO) de discussão (transcript); não funde os conceitos nem rotula workspace como Art. 8º. | Separação observável = pass. |
| **CA-086-3** | Isolamento por COA: a consulta não devolve conteúdo de outro COA sem indicação explícita desse COA. | Fuga entre COAs = fail. |
| **CA-086-4** | O caminho de decisões consome a API de consulta do ledger MO (`consultarRegistosMo` ou equivalente); deixa de ser API órfã relativamente a este REQ. | Consumo no caminho conversacional de consulta = pass. |
| **CA-086-5** | A consulta é **read-only**: não grava em MO, transcript, Trilha, MEP nem workspace apenas para indexar ou “cumprir” a resposta. | Qualquer escrita introduzida só por este fluxo = fail. |
| **CA-086-6** | Pedido de consulta **não** é interpretado como recuperação de Job, reactivação de fio F5, Porta EIC/CAP-04, nem janela REQ-061 do classificador. | Confusão de destino = fail. |
| **CA-086-7** | Quando o ledger MO ou o transcript do COA não tiverem lastro aplicável, a ausência é **declarada explicitamente**. | Ausência explícita = pass; silêncio ou preenchimento por outra memória = fail. |
| **CA-086-8** | A classificação pedido explícito vs não-pedido respeita a secção **Pedido explícito (V1)** (âncoras positivas e negativas). | Caso positivo sem âncora tratada como este REQ = fail; caso negativo (continuar/despacha/KNW/estado do dia) roteado como este REQ = fail. |
| **CA-086-9** | Decisão recuperável sob este REQ provém **somente** da Memória Confiável V1; workspace/REQ-022 não satisfazem CA de decisão Art. 8º. | Usar workspace como Art. 8º = fail. |

## Fora do escopo

* Emendar ou substituir **REQ-033** ou **REQ-024** (este REQ é **novo** e **complemento especializado** do acto de consulta; REQ-024/033 são lastro, não texto a reabrir).
* Atribuir à CAP-05 a posse, curadoria ou evolução do arquivo conversacional (transcript).
* **Histórico Físico** append-only de conversas (evolução futura; **não** pré-requisito V1).
* API HTTP dedicada de consulta (fora da V1).
* Correlação estrutural obrigatória mensagem ↔ MO ↔ Trilha.
* Redesign ou absorção de Memória Confiável, Trilha Auditável, transcript F5-C3, CAP-04/KNW, MEP/CAP-13.
* Gravar decisões novas (Gate / AD / writers MO).
* Recuperação de **Jobs** (`recuperacaoJob`) e reactivação de estado/fio (**F5**).
* Histórico recente do classificador (**REQ-061**).
* Busca em ferramentas externas (MG2, GitHub, etc.).
* Indexação semântica avançada, ranking ML ou UI rica.
* Tratar `executiveMemory` / workspace / REQ-022 como decisão Art. 8º recuperável.
* Pré-requisito de fecho das frentes Trilha ou Histórico Físico.
* Declaração arquitectural ARQ-009 H ↔ ledger MO (fora deste REQ).

## Dependências

* **CAP-05** / espírito **REQ-033** (MO consultável) — lastro; não reabrir; ver **Relação com REQ-033**.
* **Memória Confiável V1** (ledger MO + `consultarRegistosMo`) — sede Art. 8º deste REQ.
* **Transcript por COA** (F5-C3) como store conversacional V1 — **consumo** read-only; posse na interface conversacional (CAP-07/CAP-03).
* **Isolamento por COA** (REQ-037/038/039 / F5–F7) — recuperação sem cruzar contextos sem pedido.
* **CON-001** Art. 8º e Art. 9º princípio 8 (ausência explícita).
* **Não depende de:** Histórico Físico, API HTTP nova, fecho completo da Trilha, CAP-04 plena, MEP/C3, CAP-09, ARQ que alinhe H↔ledger.

## Decisões de base preservadas (D1–D9)

| ID | Decisão |
|----|---------|
| **D1** | REQ sob CAP-05; sem CAP nova na V1; discussões = fonte lida. |
| **D2** | REQ **novo**; não emenda REQ-033; não substitui REQ-024. |
| **D3** | V1 sem esperar Histórico Físico; MO + transcript F5-C3. |
| **D4** | Decisão recuperável = **somente** Memória Confiável V1. |
| **D5** | Discussão recuperável = mensagens do transcript do COA. |
| **D6** | Trilha/Histórico Físico não são pré-requisito; Trilha só correlação opcional. |
| **D7** | Superfície V1 = caminho conversacional sob pedido explícito. |
| **D8** | Read-only; sem correlação obrigatória mensagem↔MO↔trilha. |
| **D9** | Nome normativo = *Consulta de discussões e decisões registadas*; distinto de F5 e de recuperação de Jobs. |

## Riscos e incertezas

* Writers MO ainda estreitos (Gate/AD): muitas “decisões” de workspace não entram no ledger — a V1 declara ausência em vez de promover workspace a Art. 8º.
* Transcript mutável ≠ arquivo físico auditável — limitação declarada até existir Histórico Físico.
* Colisão semântica com “recuperação” F5 / Jobs — mitigação: CA-086-6, CA-086-8 e D9.
* Nomenclatura operacional F8/F9 vs este REQ — este artefacto usa só o nome normativo.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-05 — Memória Organizacional** (discussões = consumo da interface conversacional, não posse CAP-05) |
| Norma superior | CON-001 Art. 8º, Art. 9º princípios 1 e 8; CAP-001 CAP-05; ADR-015 |
| Origem | Definição V1 consolidada (D1–D9 aprovadas, 09/09/2026); diagnóstico da frente «Recuperação de discussões e decisões antigas»; resoluções de bloqueio de homologação (v0.2) |
| Lastro relacionado | REQ-033 (complemento especializado do acto de consulta); REQ-024 (não substituído); Memória Confiável V1; F5-C3 transcript |
| Decisões derivadas | — (ARQ não aberta por este acto) |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 09/09/2026 | Engenheiro (Cursor) | Criação do REQ a partir da definição V1 consolidada (D1–D9) | Autorização para criar somente o REQ; sem ARQ/IMP | Em análise |
| 0.2 | 09/09/2026 | Engenheiro (Cursor) | Quatro resoluções de bloqueio: CAP-05×transcript; fronteira REQ-033; pedido explícito testável; sede Art. 8º = Memória Confiável V1 | Autorização para aplicar só as resoluções ao REQ-086 | Em análise |
| 1.0 | 09/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação formal: status Homologado; versão final 1.0; conteúdo normativo = v0.2 APTO | Despacho «Registrar a homologação do REQ-086 v0.2»; auditoria APTO | **Homologado** |

# REQ-057 — Classificação de Intenção

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **classificar a intenção de cada mensagem do utilizador** numa das classes canónicas da ARQ-018 **antes** de responder ou executar qualquer acção, de forma a encaminhar correctamente Conhecimento Geral, Conversa sobre Projeto, Trabalho Executivo e Comandos Operacionais — **sem** criar Jobs indevidos e **sem** saltar o Classificador.

## Tipo

Funcional; detalhado (MVP V1 do Classificador de Intenção).

## Justificativa

A **ARQ-018 v0.1** (homologada) define o Classificador como limiar obrigatório da Conversa. O stub actual de classificação por capacidade não materializa as quatro classes nem a regra “Classificador primeiro”. CON-001 (tempo do utilizador; sem burocracia); ADR-015 (uso diário MG2); ADR-019 (MRE delibera); ARQ-017 / REQ-056 (Motor só para Trabalho Executivo); ARQ-015/016 (CTO e Painel não classificam nem saltam o limiar); REQ-030 (oficina ≠ browser CEO).

---

## Objetivo

1. Garantir que **toda** mensagem passa pelo Classificador antes de qualquer efeito.  
2. Distinguir e aplicar as quatro classes ARQ-018 §3 (C1–C4).  
3. Encaminhar C3 exclusivamente ao Motor de Execução (ARQ-017 / REQ-056).  
4. Impedir Job automático em C1 e C2; resolver C4 por capacidades operacionais.  
5. Em ambiguidade, **não** defaultar para C3 / Job.  
6. Convergir o limiar do Núcleo para **um** Classificador canónico (sem dois classificadores concorrentes).

---

## Escopo

### Dentro do escopo (V1)

* Classificação single-label nas classes:  
  `conhecimento_geral` | `conversa_projeto` | `trabalho_executivo` | `comando_operacional`.  
* Contrato de saída: `classe`, `confianca`, `razaoCurta`, `destino`, `usaFrenteActiva`, `permiteJob` (ARQ-018 §5.3).  
* Encaminhamento pós-classe conforme ARQ-018 §4.  
* Critérios de classificação / empates (ARQ-018 §5.2).  
* Integração no pipeline da Conversa / Núcleo como **primeiro passo**.  
* Documentação mínima e critérios CA/NA verificáveis.

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (apoio conceptual CAP-01 / CAP-11 conforme ARQ-018).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF1 | Toda mensagem do utilizador na Conversa deverá ser classificada **antes** de qualquer resposta substantive, deliberação MRE, consulta CTO automática, publicação de Job ou handoff ao Motor. |
| RF2 | O Classificador deverá emitir exactamente uma classe do enum V1: `conhecimento_geral` \| `conversa_projeto` \| `trabalho_executivo` \| `comando_operacional` — ou sinalizar necessidade de clarificação mínima. |
| RF3 | Face a **C1 (Conhecimento Geral)**, o sistema deverá responder de forma imediata/leve, **sem** criar Job e **sem** exigir lastro da frente activa. |
| RF4 | Face a **C2 (Conversa sobre Projeto)**, o sistema deverá usar o contexto da frente activa (COA/memória/briefing conforme disponível) e **não** criar Job automaticamente. |
| RF5 | Face a **C3 (Trabalho Executivo)**, o sistema deverá encaminhar ao **Motor de Execução** (ARQ-017 / REQ-056); Jobs só pela política do Motor. |
| RF6 | Face a **C4 (Comandos Operacionais)**, o sistema deverá resolver via capacidades operacionais (ex.: status, painel, listagem de jobs, contexto, memória) **sem** tratar o pedido como implementação de oficina (C3). |
| RF7 | A saída do Classificador deverá incluir pelo menos: `classe`, `confianca`, `razaoCurta`, `destino`, `usaFrenteActiva`, `permiteJob`. |
| RF8 | Em empate C2/C3, o sistema deverá preferir **C2** até haver indício claro de execução/despacho. |
| RF9 | Em empate C1/C2 com frente activa e referência implícita ao projecto, o sistema deverá preferir **C2**. |
| RF10 | Em empate C3/C4 sobre “jobs”: listar/consultar → **C4**; criar/despachar trabalho de projecto → **C3**. |
| RF11 | Ambiguidade com confiança abaixo do limiar V1 (**0,55**, salvo emenda) **não** deverá classificar como C3 nem criar Job; deverá pedir o mínimo ou seguir a regra restritiva de efeitos (ARQ-018 §3.5). |
| RF12 | O Classificador **não** deverá publicar Jobs, invocar Dispatcher, nem importar Agent/SDK. |
| RF13 | O Conector CTO e o Painel de Orquestração **não** deverão saltar o Classificador. |
| RF14 | Cada nova mensagem deverá ser reclassificada do zero (sem “modo C3” persistente que force a classe seguinte). |
| RF15 | Deverá existir um único limiar canónico de classificação no caminho da Conversa (o stub legado converge ou é substituído — proibido dois classificadores concorrentes em produção). |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | **Tempo do utilizador:** C1 não deverá percorrer o pipeline MRE completo só para factos/saudações. |
| RNF2 | **Segurança:** `razaoCurta` e metadados de classificação sem credenciais (`CURSOR_API_KEY`, API keys). |
| RNF3 | **Observabilidade:** classe + confiança (+ razão) consultáveis em diagnóstico sem abrir terminais ad hoc. |
| RNF4 | **Falsos positivos C3** são preferencialmente evitados face a falsos positivos C2 (CQ1 ARQ-018). |
| RNF5 | **Extensibilidade:** novas classes só por emenda ARQ/REQ — enum V1 fechado. |
| RNF6 | **Não efeitos laterais:** classificar ≠ executar; classificar ≠ deliberar mérito. |
| RNF7 | **UI:** classificação invisível ou residualmente transparente — sem painel dedicado obrigatório na V1. |
| RNF8 | **Alinhamento ARQ-017:** só C3 encaminha ao Motor; C1/C2 não criam Job automático. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| CA1 | Em teste/smoke, nenhuma resposta/efeito de Fila/Motor ocorre sem registo prévio de classificação da mensagem. |
| CA2 | As quatro classes do enum V1 são produzíveis e mutuamente exclusivas por mensagem. |
| CA3 | Cenário C1: resposta sem Job e sem dependência obrigatória de COA/frente activa. |
| CA4 | Cenário C2: usa frente activa; zero Jobs criados automaticamente. |
| CA5 | Cenário C3: encaminhamento ao Motor (REQ-056); Job só se a política do Motor permitir. |
| CA6 | Cenário C4: comando operacional (ex. listar jobs / status) sem classificar como C3 de implementação. |
| CA7 | Empate C2/C3 resolve para C2 na ausência de verbo/indicação clara de execução. |
| CA8 | Ambiguidade de baixa confiança não cria Job nem força C3. |
| CA9 | Código do Classificador sem `@cursor/sdk` / sem publicação directa na Fila. |
| CA10 | Documentação mínima referencia ARQ-018, este REQ, e o encaminhamento ao Motor (ARQ-017). |
| CA11 | Um único ponto de classificação no caminho Conversa→Núcleo (sem classificadores concorrentes). |

### Critérios negativos

| ID | Critério |
|----|----------|
| NA1 | O Classificador **não** é a home conversacional nem substitui a Conversa. |
| NA2 | Falha/ambiguidade de classificação **não** derruba a Conversa (degradação: clarificação ou classe restritiva). |
| NA3 | O Classificador **não** exige segunda API key nem browser ChatGPT só para classificar C1/C4. |

---

## Casos de Uso

### CU1 — Conhecimento Geral (C1)

1. Utilizador: «Que horas são?» / saudação / pergunta genérica.  
2. Classificador → `conhecimento_geral`.  
3. Resposta imediata.  
4. Nenhum Job; frente activa não é lastro obrigatório.

**Sucesso:** CA3.

### CU2 — Conversa sobre Projeto (C2)

1. Frente MG2 activa.  
2. Utilizador: «Onde estamos no outdoor?»  
3. Classificador → `conversa_projeto`.  
4. Núcleo/MRE usa dossier/COA; **não** cria Job só por deliberar.

**Sucesso:** CA4.

### CU3 — Trabalho Executivo (C3)

1. Utilizador: «Implementa o outdoor lateral e despacha.»  
2. Classificador → `trabalho_executivo`.  
3. Encaminhamento ao Motor (REQ-056); Gate/Job conforme política.  

**Sucesso:** CA5.

### CU4 — Comando Operacional (C4)

1. Utilizador: «Lista os jobs pendentes» / «status» / «mostra o painel».  
2. Classificador → `comando_operacional`.  
3. Capacidade operacional responde; **não** trata como implementação MG2.

**Sucesso:** CA6.

### CU5 — Ambiguidade restritiva

1. Mensagem vaga («resolve isso»).  
2. Confiança &lt; limiar ou empate sem verbo de execução.  
3. Preferência C2 ou clarificação mínima; **sem** Job.

**Sucesso:** CA7 / CA8.

### CU6 — Sem bypass CTO/Painel

1. Utilizador consulta CTO ou observa Painel.  
2. Qualquer mensagem na Conversa que dispare efeitos continua a passar pelo Classificador.  
3. CTO/Painel não publicam Jobs nem saltam o limiar.

**Sucesso:** alinhado a RF13 / CA1.

---

## Restrições

| ID | Restrição |
|----|-----------|
| RES1 | Norma: CON-001; ADR-015; ADR-019; ADR-006 (fluxo REQ→IMP). |
| RES2 | Alinhamento integral à **ARQ-018 homologada**. |
| RES3 | Encaminhamento C3 alinhado a **ARQ-017 / REQ-056** — sem segundo Motor. |
| RES4 | Enum V1 fechado; novas classes só por emenda ARQ/REQ. |
| RES5 | Sem implementação até IMP autorizada por etapa. |
| RES6 | Não alterar Constituição, Governança LLM, ARQ-017 nem REQ-056 além do necessário ao limiar (efeitos de encaminhamento apenas). |
| RES7 | Limiar de confiança V1 por omissão: **0,55** (ajustável só por emenda REQ). |
| RES8 | Preferência de implementação: regras/lexicon para C1/C4; LLM de classificação só se o REQ/IMP o justificar sem violar RNF1. |

---

## Fora de Escopo

| ID | Fora | Coberto por / nota |
|----|------|-------------------|
| FE1 | Implementação de código nesta fase | IMP futuro |
| FE2 | UI dedicada ao Classificador | ARQ-018 NO / RNF7 |
| FE3 | Multi-label / taxonomia alargada | Emenda ARQ/REQ |
| FE4 | Redesenhar MRE, Motor, CTO ou Painel | ADR-019; ARQ-017; ARQ-015; ARQ-016 |
| FE5 | Treino de modelo proprietário | Fora V1 |
| FE6 | RBAC multi-utilizador | Futuro |
| FE7 | NCS completa como substituto deste REQ | VIS-008 / REQ-052 — frentes distintas; este REQ é o limiar C1–C4 |
| FE8 | Bypass do Classificador por atalho de capacidade | Proibido (RF1 / CA1) |

---

## Dependências

| Dependência | Papel |
|-------------|--------|
| ARQ-018 | Arquitectura homologada (obrigatória) |
| ARQ-017 / REQ-056 | Destino C3 (Motor) |
| Conversa / Núcleo | Ponto de integração |
| REQ-045 / capacidades fila | C4 operacional (listar/publicar tipado) |
| REQ-054 / REQ-055 | Sem salto CTO/Painel |
| ADR-019 | MRE após C2 (e apoio a C3 via Motor) |

## Riscos e incertezas

* Falsos positivos C3 → Jobs a mais; mitigar com empates §RF8 e Gate do Motor.  
* Dois classificadores (stub + novo) em paralelo; mitigar com RF15 / CA11.  
* Over-use de LLM em C1; mitigar com RES8 / RNF1.  
* Confusão “jobs” C3 vs C4; mitigar com RF10 / CU4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001; ADR-015; ADR-019; REQ-030 |
| Origem | ARQ-018 homologada (01/08/2026) — Classificação de Intenção |
| Arquitectura | ARQ-018 |
| Destino execução | ARQ-017; REQ-056 |
| Decisões derivadas | — |
| Implementação | *— após IMP autorizada* |
| Testes | *— após IMP* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura REQ-057 | Alinhar requisitos ao Classificador (ARQ-018) | **Em análise** — aguarda homologação |

---

*Nenhuma implementação até homologação deste REQ-057 e IMP subsequente autorizada por etapa.*

---

**Pedido de Gate:** REQ-057 v0.1 pronta para homologação do patrocinador.

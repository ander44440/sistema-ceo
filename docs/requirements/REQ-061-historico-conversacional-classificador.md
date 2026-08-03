# REQ-061 — Histórico Conversacional no Classificador

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá permitir que o **Classificador de Intenção** (ARQ-018 / REQ-057) utilize **histórico conversacional recente opcional** exclusivamente para **desambiguar C1↔C2**, sem alterar o limiar de confiança **0,55**, sem influenciar **C3**/Jobs, e com comportamento **idêntico** ao IMP-057 quando o histórico estiver ausente.

## Tipo

Funcional; detalhado (realização do sinal ARQ-018 §5.1 — histórico recente opcional).

## Justificativa

A **ARQ-018 §5.1** prevê o sinal «Histórico recente (opcional)» para desambiguar C2 vs C1 **sem forçar C3**. A **ANL-006** constata que o runtime IMP-057 só passa `frenteActiva` ao Classificador, embora o Núcleo já receba `historico` da Conversa/Centro — follow-ups elípticos pedem reexplicação ou caem em rota incorrecta (CON-001 Art. 9º.1–9º.2; NA-EIC-11). Motivações: ADR-015 (uso diário MG2); EIC (CAP-07 — primeira melhoria perceptível de Compreensão Semântica e Contextual no limiar); ADR-006 (REQ antes de ARQ/IMP).

---

## Objetivo

1. Disponibilizar histórico conversacional **opcional** ao Classificador via contrato de contexto.  
2. Fixar a janela V1: **4 mensagens** anteriores, **≤200 caracteres** por mensagem, **≤800 caracteres** no total.  
3. Restringir o uso do histórico à **desambiguação C1↔C2**.  
4. Proibir **absolutamente** que o histórico influencie **C3**, `permiteJob` ou publicação de Jobs.  
5. Preservar o limiar **`LIMIAR_CONFIANCA = 0,55`**.  
6. Garantir: ausência de histórico ⇒ comportamento **idêntico** ao baseline **IMP-057**.  
7. Não interferir em Continuidade do Gate, Motor, NCS, MRE (contratos) nem no ponto único de classificação (EIC V1).

---

## Motivação

| Problema | Efeito actual | Solução deste REQ |
|----------|---------------|-------------------|
| Classificador sem histórico | Follow-ups («isso», «continua», referência implícita à frente) falham ou clarificam em excesso | Sinal opcional no contexto de classificação |
| Dívida ARQ-018 §5.1 | Sinal previsto, não realizado | Realização normativa + testável |
| Risco de C3 por eco | Concatenar histórico ao texto poluiria léxico | Contexto estruturado + proibição C3 |

---

## Escopo

### Dentro do escopo (V1)

* Extensão de `ContextoClassificacao` com histórico recente **opcional**.  
* Selecção/normalização da janela no Núcleo (fonte: `historico` já existente na UI).  
* Política determinística de desambiguação **C1↔C2** no Classificador.  
* Integração no único passo `primeiroPassoClassificar` / `classificar` (sem reclassificar no adapter).  
* Clarificação ancorada **opcional** (RF auxiliar) quando houver lastro de frente/último objectivo.  
* Testes de regressão IMP-057 + casos de deixis + fronteiras Gate/Motor/NCS.  
* Documentação mínima (README do módulo / evidências IMP).

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação**.

### Fora do escopo

* Alterar o valor do limiar 0,55 ou o enum C1–C4.  
* Classificação por LLM no limiar do Classificador.  
* Concatenar histórico ao texto da mensagem como estratégia principal.  
* Usar histórico para promover C3 / Job.  
* Redesign de Gate (ARQ-019), Motor (ARQ-017), NCS (ARQ-014), MRE, CN, Fila ou Painel.  
* Persistência nova de histórico (DB); V1 usa o array in-memory já passado pela UI.  
* Detector completo de mudança de assunto.  
* Criar CAP nova.  
* Resolução de deixis por reescrita da mensagem (ANL-006 Alt. C — fase 2).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O histórico conversacional no Classificador é **opcional**: o campo de contexto correspondente pode estar ausente ou vazio. |
| **RF2** | Quando o histórico estiver **ausente ou vazio**, a saída do Classificador para a mesma mensagem e o mesmo `frenteActiva` deverá ser **idêntica** à do baseline **IMP-057** (amostra de regressão fixa no IMP). |
| **RF3** | A janela V1 considera no máximo as **4 mensagens** imediatamente anteriores à mensagem actual (não inclui a mensagem sob classificação, salvo se a ARQ/IMP definir exclusão explícita equivalente). |
| **RF4** | Cada mensagem da janela é truncada a **200 caracteres** (com marcação de truncagem se aplicável). |
| **RF5** | O total de caracteres normalizados da janela não excede **800**. |
| **RF6** | O histórico, quando presente, só pode ser usado para **desambiguação entre C1 (`conhecimento_geral`) e C2 (`conversa_projeto`)**, incluindo empates C1/C2 previstos na ARQ-018 §5.2. |
| **RF7** | É **proibido** que o histórico, isoladamente ou em combinação com scores, altere a classificação para **C3** (`trabalho_executivo`), eleve `permiteJob` para `true`, ou contribua para publicação de Job. |
| **RF8** | O limiar de confiança permanece **`0,55`** (`LIMIAR_CONFIANCA`); este REQ **não** altera o valor nem a regra «abaixo do limiar → clarificação / bloqueio de Job» do REQ-057. |
| **RF9** | Atalhos e regras canónicas da mensagem actual (incl. emendas E2.1–E2.3 / REQ-057) têm **prioridade** sobre o histórico: o histórico **não** anula um C3 legítimo da mensagem actual nem um C1/C2 seguro já decidido sem necessidade de desambiguação. |
| **RF10** | O Classificador permanece **função pura** sem I/O, sem importar Gate, Motor, NCS, Fila, Dispatcher ou `@cursor/sdk`. |
| **RF11** | O Núcleo deverá montar o contexto de classificação a partir do `historico` já fornecido pela Conversa/Centro e passá-lo ao **único** passo canónico de classificação (`primeiroPassoClassificar` / `classificar`), preservando o adapter sem reclassificar (EIC V1 / IMP-057). |
| **RF12** | A Continuidade do Gate (ARQ-019 / REQ-058) continua a correr **antes** do Classificador; quando interceptar (continuidade ou clarificação de Gate), o Classificador **não** corre — este REQ não altera essa precedência. |
| **RF13** | C4 (`comando_operacional`) continua a depender de sinais da **mensagem actual**; o histórico **não** deve pontuar C4 por eco de turnos anteriores. |
| **RF14** | Quando o histórico for usado na decisão, `razaoCurta` deverá ser auditável e poder indicar o contributo do histórico (sem secrets). |
| **RF15** | *(Opcional no mesmo IMP)* Clarificação ancorada: se o destino for clarificação e existir lastro de frente/objectivo no contexto de sessão ou histórico, a mensagem ao utilizador **pode** citar esse lastro — sem inventar factos. |
| **RF16** | REQ-057 permanece vigente; este REQ **complementa** a realização do sinal ARQ-018 §5.1 e **não** o revoga. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Desempenho:** processamento do histórico no Classificador é determinístico (DET), com custo O(K) e K≤4; sem chamada LLM no limiar de classificação. |
| **RNF2** | **Short-circuit:** se a mensagem actual já for decidida por atalho canónico que não requer desambiguação C1↔C2, o processamento de histórico pode ser omitido. |
| **RNF3** | **Compatibilidade:** callers existentes de `classificar(texto)` / `classificar(texto, { frenteActiva })` sem histórico continuam válidos (RF1–RF2). |
| **RNF4** | **Testabilidade:** suite IMP-057 + novos casos deste REQ executáveis via `npm run test:classificador` (ou script IMP dedicado). |
| **RNF5** | **Tempo do utilizador:** reduzir clarificações desnecessárias em follow-ups com frente activa (CON-001 Art. 9º.1). |
| **RNF6** | **Segurança / privacidade:** histórico no Classificador não inclui secrets; `razaoCurta` sem dados sensíveis (REQ-057). |
| **RNF7** | **EIC:** implementação de produto só após Gate EIC aplicável (G-EIC-D) e fluxo ADR-006 (ARQ → IMP → VAL), além da homologação deste REQ. |
| **RNF8** | **Observabilidade:** classificação com histórico permanece rastreável (classe, confiança, razão) em diagnóstico. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | Histórico **opcional** (RF1). |
| **RST2** | Janela V1 = **4** mensagens (RF3). |
| **RST3** | Limite **200** caracteres por mensagem (RF4). |
| **RST4** | Máximo **800** caracteres na janela (RF5). |
| **RST5** | Uso **apenas** para desambiguação **C1↔C2** (RF6). |
| **RST6** | **Proibição absoluta** de influenciar **C3** / Job via histórico (RF7). |
| **RST7** | Limiar **0,55** preservado (RF8). |
| **RST8** | Ausência de histórico ⇒ comportamento **idêntico** ao **IMP-057** (RF2). |
| **RST9** | Sem concatenação do histórico ao texto como mecanismo principal de score (ANL-006 Alt. A rejeitada). |
| **RST10** | Sem alteração de contratos do Motor, Gate, NCS ou Consciência para além da passagem de contexto ao Classificador. |
| **RST11** | Sem CAP nova; sem redesign MRE/CN. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Contrato de contexto documentado e implementável com histórico **opcional** (RF1). |
| **CA2** | Suite de regressão: amostra fixa **sem** histórico produz as mesmas classes/destinos/`permiteJob` que o baseline IMP-057 (RF2, RST8). |
| **CA3** | Janela limitada a 4 mensagens; truncagem 200/msg; total ≤800 — verificável por testes unitários (RF3–RF5). |
| **CA4** | Caso de deixis/follow-up com frente activa + histórico de projecto → **C2**, não C1 indevido (RF6). |
| **CA5** | Nenhum fixture de histórico (incluindo prosa longa com verbos de execução em turnos anteriores) produz **C3** ou `permiteJob: true` **sem** sinal C3 na mensagem actual (RF7, RST6). |
| **CA6** | `LIMIAR_CONFIANCA === 0.55` e testes de limiar REQ-057/IMP-057 permanecem verdes (RF8). |
| **CA7** | Mensagem actual «Implementa…» / E2.1 → **C3** independentemente do histórico (RF9). |
| **CA8** | Módulo Classificador sem imports de Gate/Motor/NCS/Fila/SDK (RF10). |
| **CA9** | Núcleo passa histórico ao único passo de classificação; adapter não reclassifica (RF11). |
| **CA10** | Com Gate pendente + «Aprovado», Continuidade consome e Classificador não corre (RF12; regressão IMP-058). |
| **CA11** | SC-01…SC-05 (EIC / IMP-057) permanecem verdes; novos casos de deixis documentados no IMP. |
| **CA12** | Documentação mínima referencia ANL-006, ARQ-018 §5.1, REQ-057, este REQ e EIC (CAP-07). |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | Histórico **obrigatório** para classificar (viola RF1). |
| **NA2** | Alteração do limiar para valor ≠ 0,55. |
| **NA3** | Histórico usado para forçar ou favorecer **C3**/Job. |
| **NA4** | Concatenação do histórico ao texto da mensagem como estratégia principal de pontuação. |
| **NA5** | Classificador com LLM / I/O / efeitos laterais. |
| **NA6** | Quebra da precedência Continuidade Gate → Classificador. |
| **NA7** | Dois passos canónicos de `classificar` no fluxo de execução (regressão EIC V1). |
| **NA8** | Alteração de NCS, Motor ou contratos de Gate sob pretexto deste REQ. |
| **NA9** | Comportamento sem histórico diferente do IMP-057 na amostra de regressão. |
| **NA10** | Implementação em produto sem REQ homologado + ARQ (se exigida) + IMP + Gates ADR-006 / EIC aplicáveis. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ARQ-018** | Realiza §5.1 (histórico opcional; C2 vs C1; sem forçar C3); preserva §5.2–§5.4, CA1–CA10, CQ1. |
| **REQ-057 / IMP-057** | Complementa; regressão obrigatória; limiar e C1–C4 intactos. |
| **ARQ-019 / REQ-058 / IMP-058** | Precedência Gate preservada (RF12). |
| **ARQ-017 / REQ-056** | Motor só via C3 da mensagem actual; Classificador sem efeitos. |
| **ARQ-014 / NCS** | Fora do perímetro; sem sinal novo no NCS. |
| **ARQ-020 / REQ-059** | Consciência após classificação; inalterada. |
| **EIC** | CAP-07; ponto único de classificação; G-EIC-D antes de IMP de produto; SC regressão + deixis. |
| **ADR-006** | Fluxo: este REQ → ARQ (emenda ou ARQ de detalhe se CTO exigir) → IMP → VAL. |
| **ADR-015** | Melhoria perceptível no fio diário MG2. |
| **ANL-006** | Base analítica; este REQ torna-a normativa no perímetro V1. |

**Nota:** A **ARQ-022** especifica a integração arquitectural deste REQ como complemento da ARQ-018 §5.1 (não substitui a ARQ-018). A ARQ-018 permanece a norma-mãe do Classificador.

---

## Casos de teste previstos

| ID | Tipo | Entrada (síntese) | Esperado |
|----|------|-------------------|----------|
| **CT-01** | Regressão | Mensagens da suite IMP-057 **sem** `historicoRecente` | Idêntico ao baseline (CA2) |
| **CT-02** | Janela | Histórico com 6+ mensagens | Só as 4 anteriores entram; caps 200/800 (CA3) |
| **CT-03** | Deixis C2 | Frente activa; histórico fala de outdoor/MG2; mensagem «e isso?» / «continua» | **C2**; não C3 (CA4, CA5) |
| **CT-04** | Anti-C3 | Histórico com «implementa o outdoor»; mensagem actual «ok» / «e agora?» | **Não** C3 só por eco (CA5) |
| **CT-05** | C3 actual | Mensagem «Implementa o outdoor lateral» + histórico irrelevante | **C3** (CA7) |
| **CT-06** | Limiar | Confiança / clarificação REQ-057 | Limiar 0,55; SC-05 (CA6, CA11) |
| **CT-07** | C1 puro | «O que é um ADR?» sem projecto no histórico | **C1** (SC-01) |
| **CT-08** | C4 actual | «lista os jobs» | **C4**; histórico não altera (RF13) |
| **CT-09** | Gate | Gate pendente + «Aprovado» | Continuidade; Classificador não invocado (CA10) |
| **CT-10** | Fronteira | Source do módulo Classificador | Sem imports Gate/Motor/NCS/SDK (CA8) |
| **CT-11** | EIC V1 | `executiveEngine` | Um `classificar`; adapter com `saidaPrevia` (CA9) |
| **CT-12** | SC-01…05 | Catálogo EIC T-CL | Pass (CA11) |

Mapeamento EIC sugerido (emenda documental em `docs/EIC/05` no ciclo IMP, se autorizado): SC-deixis-01…n derivados de CT-03/CT-04.

---

## Estratégia de rollback

| Fase | Acção |
|------|--------|
| **R1 — Feature inerte** | Se o Núcleo deixar de passar `historicoRecente`, o Classificador regressa automaticamente ao path IMP-057 (RF1–RF2). **Primeira linha de rollback operacional.** |
| **R2 — Flag / deps** | Se o IMP introduzir flag de activação, desligar a flag restaura baseline sem revert de schema de saída. |
| **R3 — Revert de código** | Reverter o commit/PR do IMP restaura o módulo; suite IMP-057 deve voltar a passar integralmente. |
| **R4 — Sem migração de dados** | Não há schema persistente novo; rollback **não** exige migração. |
| **R5 — Critério de activação do rollback** | Regressão CA2/CA5/CA6 a vermelho em produção ou homologação; falso C3 atribuível ao histórico; latência anómala no limiar (não esperado em DET). |

---

## Dependências

| Elo | Referência |
|-----|------------|
| Análise | ANL-006 — Histórico Conversacional no Classificador |
| Arquitectura | ARQ-018 §5.1 (sinal); ARQ-018 vigente (classes, limiar no REQ-057) |
| REQ base | REQ-057 (Classificação de Intenção) |
| Implementação baseline | IMP-057 |
| Gate / Motor / NCS | REQ-058, REQ-056, REQ-052/ARQ-014 — **não modificar**; só não-interferência |
| Governança | ADR-006; EIC (`docs/EIC/`); ADR-015 |
| UI | Histórico da Conversa/Centro (já existente) |

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Falso C3 por eco | RF7, CA5, CT-04; proibição absoluta |
| Regressão IMP-057 | CA2, CT-01; rollback R1 |
| Expectativa de memória longa | Comunicar: V1 = janela 4; CSC completa é frente EIC posterior |
| Interferência Gate | RF12, CT-09 |
| Implementar sem Gates | RNF7, NA10 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º.1–9º.2; ADR-015; ARQ-018 §5.1; **ARQ-022**; ADR-006 |
| Origem | ANL-006; comando patrocinador 03/08/2026; diagnóstico EIC CSC |
| Decisões derivadas | ARQ-022 (Em análise v0.1); *(IMP — pendente)* |
| Implementação | IMP-061 (implementada — pronta para homologação) |
| Testes | CT-01…CT-12; regressão `test:classificador`; SC-01…05 |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação | ANL-006 → REQ oficial; comando patrocinador | Em análise |

---

**Estado:** REQ elaborada — pronta para revisão técnica (CTO) e posterior ARQ/IMP.  
**Sem implementação de código, prompts ou comportamento neste acto.**

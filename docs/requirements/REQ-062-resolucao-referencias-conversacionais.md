# REQ-062 — Resolução de Referências Conversacionais

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **resolver referências conversacionais implícitas** (ex.: «isso», «aquele», «o anterior», «continua») para um **referente** auditável do fio recente — ou declarar ambiguidade com pergunta curta e contextualizada — **sem** alterar o Classificador de Intenção como único ponto de decisão de classe, **sem** influenciar C3/Jobs, e com comportamento **idêntico** ao baseline actual quando não houver referente válido.

## Tipo

Funcional; detalhado (resolvedor de referentes — complemento da Compreensão Semântica e Contextual sob CAP-07; pós IMP-061).

## Justificativa

A **ANL-007** constata que o **IMP-061** (REQ-061 / ARQ-022) usa histórico e deixis apenas para **desambiguar a rota C1↔C2**, sem identificar o *objecto* da referência. Sem referente, C2/MRE e prosa operam sobre texto elíptico — risco de resposta desligada ou pedido de reexplicação (CON-001 Art. 9º.1–9º.2; NA-EIC-11). Motivações: ADR-015 (uso diário MG2); EIC (2ª melhoria perceptível CSC); ADR-006; preservação de ARQ-018 (Classificador) e ARQ-022/IMP-061 (janela de histórico).

---

## Objetivo

1. Introduzir um **resolvedor determinístico de referências conversacionais** adjacente ao Classificador (não um segundo classificador).  
2. **Reutilizar** a janela do IMP-061: **4** mensagens · **200** chars/msg · **800** chars total — sem alargar no V1.  
3. Resolver **apenas** referências conversacionais (deixis / anáfora / follow-up elíptico) — não redesenhar intenção C1–C4.  
4. Preservar o Classificador como **único ponto oficial de decisão de classe**.  
5. **Não influenciar C3**; **não criar Jobs**.  
6. Em ambiguidade de referente: **pergunta curta e contextualizada** (não Job, não C3).  
7. Sem referente válido ⇒ **comportamento actual preservado** (IMP-061 + IMP-057 / destinos).  
8. Não interferir em Gate, Motor, NCS nem contratos de Fila.

---

## Motivação

| Problema | Efeito actual (pós-IMP-061) | Solução deste REQ |
|----------|----------------------------|-------------------|
| Deixis sem referente | C2 correcto em rota, conteúdo ainda vazio | Extrair `ReferenteResolvido` da janela |
| «Isso» / «continua» / «o anterior» | LLM pós-rota adivinha sem contrato | Resolvedor DET testável + auditoria |
| Ambiguidade silenciosa | Objecto errado ou reexplicação | Clarificação ancorada de referente |
| Risco de C3 por eco | Histórico já proibido de forçar C3 | Referente **nunca** define classe/Job |

---

## Escopo

### Dentro do escopo (V1)

* Módulo puro de resolução de referências (entrada: mensagem + `historicoRecente` IMP-061 + sinais opcionais `frenteActiva`/COA).  
* Tipos de referente V1 fechados (mínimo): `topico_projeto` | `frente_coa` | `acto_gate` | `mensagem_anterior` | `desconhecido`.  
* Gatilho por deixis/follow-up (reutilizar/estender detecção IMP-061).  
* Saídas: referente único | ambiguidade | nenhum.  
* Injecção do referente no **lastro** de destinos C2 (e, se aplicável, C1) — **não** na pontuação/decisão C3.  
* Clarificação curta e contextualizada quando ≥2 candidatos competidores.  
* Testes de regressão IMP-057 / IMP-061 / Continuidade + CT deste REQ.  
* Documentação mínima e rastreio EIC (SC de anáfora, se emenda documental autorizada).

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (**sem** CAP nova).

### Fora do escopo

* Alterar limiar 0,55 ou enum/regras canónicas C1–C4 do Classificador.  
* Tornar o resolvedor um segundo ponto de decisão de classe.  
* Influenciar C3 / `permiteJob` / publicação de Jobs via referente.  
* LLM / ML de coreference no limiar do Classificador.  
* Aumentar a janela além de 4/200/800 no V1.  
* Store persistente de «foco conversacional» / topic tracker completo.  
* Redesign de Gate, Motor, NCS, MRE, CN, Fila ou Painel.  
* Reescrita agressiva da mensagem que introduza verbos de execução (E2.1) ausentes no original.  
* Resolução de referências não conversacionais (documentos externos, web, etc.).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá disponibilizar um **resolvedor de referências conversacionais** que opera sobre a mensagem actual e a janela de histórico do **IMP-061**. |
| **RF2** | A janela utilizada **deverá ser a do IMP-061**: no máximo **4** mensagens anteriores, **≤200** caracteres por mensagem, **≤800** caracteres no total — **sem** alargamento no V1 deste REQ. |
| **RF3** | O resolvedor deverá tratar **apenas** referências conversacionais (deixis, anáfora, follow-ups elípticos tais como «isso», «aquele», «o anterior», «continua» e equivalentes normalizados). |
| **RF4** | O **Classificador de Intenção** permanece o **único ponto oficial de decisão de classe** (C1–C4 / clarificação de intenção); o resolvedor **não** substitui nem duplica `classificar`. |
| **RF5** | O resultado da resolução **não** poderá alterar a classificação para **C3** (`trabalho_executivo`), nem definir `permiteJob: true`, nem **criar** ou publicar **Jobs**. |
| **RF6** | Quando existir **exactamente um** referente válido segundo a política V1, o sistema deverá expor um artefacto auditável `ReferenteResolvido` (tipo, âncora textual, confiança/razão curta sem secrets). |
| **RF7** | Quando existirem **dois ou mais** candidatos competidores sem desempate seguro, o sistema deverá produzir **ambiguidade de referente** e uma **pergunta curta e contextualizada** ao utilizador (citando âncoras), **sem** abrir Job e **sem** forçar C3. |
| **RF8** | Quando **não** houver referente válido (sem deixis, sem lastro, ou resolução vazia), o comportamento do sistema deverá ser **idêntico** ao baseline actual (IMP-061 + Classificador / destinos homologados) — *sem referente válido = comportamento actual preservado*. |
| **RF9** | O resolvedor deverá ser **função pura** (sem I/O, sem SDK, sem publicar Jobs, sem importar Motor/NCS/Fila como efeito). |
| **RF10** | A Continuidade do Gate (ARQ-019 / REQ-058) permanece **antes** do Classificador; no caminho de continuidade/clarificação de Gate, o resolvedor **não** compete com o léxico de decisão de Gate. |
| **RF11** | Quando houver referente válido e a rota for C2 (ou clarificação de intenção compatível), o referente deverá poder ser injectado no **lastro/contexto** consumido a jusante — **sem** alterar a pontuação C3 do Classificador. |
| **RF12** | Qualquer reescrita opcional da mensagem para consumo a jusante (fase controlada) **não** poderá introduzir verbos de execução E2.1 que não existam na mensagem original. |
| **RF13** | REQ-057, REQ-061 e IMP-061 permanecem vigentes; este REQ **complementa** (referente) e **não** os revoga. |
| **RF14** | A resolução deverá registar razão auditável mínima (`razaoReferente` ou equivalente) sem secrets. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Desempenho:** resolução DET, O(K) com K≤4 (janela IMP-061); sem LLM no limiar. |
| **RNF2** | **Testabilidade:** suite dedicada + regressão `test:classificador` (IMP-057/061) e Continuidade. |
| **RNF3** | **Tempo do utilizador:** preferir pergunta curta ancorada a repetir o tema já no lastro (CON-001 Art. 9º). |
| **RNF4** | **Compatibilidade:** callers sem deixis / sem histórico inalterados (RF8). |
| **RNF5** | **EIC / ADR-006:** IMP de produto só após ARQ deste REQ + Gates aplicáveis (incl. G-EIC-D quando exigido). |
| **RNF6** | **Segurança:** âncoras e razões sem secrets (alinhado REQ-057). |
| **RNF7** | **Observabilidade:** referente/ambiguidade inspeccionáveis em diagnóstico de turno. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | Reutilizar janela IMP-061 (**4 / 200 / 800**) — RF2. |
| **RST2** | Resolver **apenas** referências conversacionais — RF3. |
| **RST3** | Classificador = **único** ponto de decisão de classe — RF4. |
| **RST4** | **Não** influenciar C3 — RF5. |
| **RST5** | **Não** criar Jobs — RF5. |
| **RST6** | Ambiguidade ⇒ pergunta **curta e contextualizada** — RF7. |
| **RST7** | Sem referente válido ⇒ comportamento **actual** preservado — RF8. |
| **RST8** | Sem CAP nova; sem alargar janela no V1; sem LLM no limiar. |
| **RST9** | Sem alteração de contratos do Motor, Gate, NCS ou Fila. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Resolvedor documentado e implementável conforme RF1–RF3; janela = IMP-061 (4/200/800). |
| **CA2** | Sem deixis / sem histórico / sem referente ⇒ saídas de classificação e destinos iguais ao baseline IMP-061 (amostra fixa) — RF8. |
| **CA3** | «e isso?» (ou equivalente) + histórico com outdoor/MG2 ⇒ `ReferenteResolvido` ancora outdoor (ou equivalente) **e** classe ≠ C3 / `permiteJob` false — RF5, RF6. |
| **CA4** | Dois tópicos competidores no histórico + deixis ⇒ ambiguidade + pergunta curta contextualizada; **zero** Jobs — RF7. |
| **CA5** | «Implementa o outdoor…» na mensagem actual ⇒ C3 inalterado com ou sem resolvedor — RF4, RF5. |
| **CA6** | Source do resolvedor sem imports de efeito Gate/Motor/NCS/Fila/SDK — RF9. |
| **CA7** | Gate pendente + «Aprovado» ⇒ Continuidade; resolvedor não usurpa decisão de Gate — RF10. |
| **CA8** | Suite IMP-057 + IMP-061 + Continuidade verdes após IMP deste REQ. |
| **CA9** | Documentação referencia ANL-007, ARQ-018, ARQ-022, IMP-061, este REQ e EIC CAP-07. |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | Resolvedor decide ou altera a **classe** C1–C4 no lugar do Classificador. |
| **NA2** | Referente força ou favorece **C3** / Job. |
| **NA3** | Criação de Job a partir da resolução de referência. |
| **NA4** | Alargar janela além de 4/200/800 neste V1. |
| **NA5** | LLM no limiar para coreference. |
| **NA6** | Sem referente válido mas comportamento **diferente** do baseline (viola RF8). |
| **NA7** | Ambiguidade resolvida por «adivinhar» sem pergunta quando a política exige clarificação. |
| **NA8** | Redesign de Gate, Motor, NCS ou Fila sob pretexto deste REQ. |
| **NA9** | Implementação em produto sem ARQ + IMP + Gates ADR-006 / EIC aplicáveis. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ANL-007** | Base analítica; este REQ torna normativo o MVP (Alt. B). |
| **ARQ-018** | Classificador intacto como limiar de intenção; CQ1 (falso C3) reforçado. |
| **ARQ-022 / REQ-061 / IMP-061** | Consome `historicoRecente`; não revoga S3; janela fixa. |
| **REQ-057 / IMP-057** | Regressão; um Classificador. |
| **ARQ-019 / REQ-058** | Gate antes; sem competir com léxico de decisão. |
| **ARQ-017 / Motor / NCS** | Contratos inalterados; referente só lastro pós-rota. |
| **EIC** | CAP-07; 2ª frente CSC; SC de anáfora; G-EIC-D antes de IMP. |
| **ADR-006 / ADR-015** | Fluxo oficial; filtro uso diário MG2. |

**Nota:** A **ARQ-023** especifica o Resolvedor como módulo auxiliar (contrato `ReferenteResolvido`, integração, P1–P4), **sem** substituir ARQ-018 nem ARQ-022.

---

## Casos de teste previstos

| ID | Tipo | Entrada (síntese) | Esperado |
|----|------|-------------------|----------|
| **CT-R01** | Baseline | Sem deixis / sem histórico | Idêntico a IMP-061 (CA2) |
| **CT-R02** | Janela | Confirma uso 4/200/800 (sem nova janela) | RST1 |
| **CT-R03** | Referente | «e isso?» + histórico outdoor | Referente ancora outdoor; ≠ C3 (CA3) |
| **CT-R04** | Continua | «continua» + último objectivo CEO explícito | Referente = âncora do objectivo; ≠ C3 |
| **CT-R05** | O anterior | «o anterior» + duas mensagens distintas | Ambiguidade **ou** regra P1 documentada; se ambíguo → pergunta (CA4) |
| **CT-R06** | Anti-C3 | Histórico com «implementa…»; mensagem «isso» | ≠ C3; sem Job (CA3) |
| **CT-R07** | C3 actual | «Implementa X» + histórico | C3 preservado (CA5) |
| **CT-R08** | Ambiguidade | Outdoor + pagamento no histórico + «isso» | Pergunta curta contextualizada; 0 Jobs (CA4) |
| **CT-R09** | Gate | Gate + «Aprovado» | Continuidade; sem usurpação (CA7) |
| **CT-R10** | Fronteira | Source resolvedor | Sem Motor/NCS/Fila/SDK (CA6) |
| **CT-R11** | Regressão | Suite classificador IMP-057/061 | Verde (CA8) |
| **CT-R12** | C4 | «lista os jobs» | C4 inalterado; referente não pontua C4 |

---

## Estratégia de rollback

| Fase | Acção |
|------|--------|
| **R1** | Desactivar injecção/chamada do resolvedor no Núcleo ⇒ path IMP-061 imediato (RF8) — **rollback preferido**. |
| **R2** | Flag de activação no IMP (se existir) ⇒ desligar = R1. |
| **R3** | Revert do IMP ⇒ remove módulo; sem migração de dados (puro / sem persistência nova). |
| **R4** | Critério de activação: referente sistematicamente errado; falso C3; regressão CA2/CA5/CA8. |

---

## Dependências

| Elo | Referência |
|-----|------------|
| Análise | ANL-007 |
| Histórico / janela | ARQ-022, REQ-061, IMP-061 |
| Classificador | ARQ-018, REQ-057, IMP-057 |
| Gate / Motor / NCS | REQ-058, REQ-056, ARQ-014 — não-interferência |
| Governança | ADR-006; EIC; ADR-015 |

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Referente errado | RF7 (clarificar se ambíguo); limiar interno na ARQ/IMP |
| Confusão com IMP-061 | RF4: rota vs referente documentados |
| Reescrita → E2.1 | RF12; testes CT-R06/R07 |
| Escopo creep (topic tracker) | Fora do escopo V1 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º.1–9º.2; ADR-015; ARQ-018; ARQ-022; **ARQ-023**; ADR-006 |
| Origem | ANL-007; comando patrocinador 03/08/2026 |
| Decisões derivadas | ARQ-023 (Em análise v0.1); IMP-062 (implementada — pronta para homologação) |
| Implementação | IMP-062 |
| Testes | CT-R01…CT-R12; regressão classificador + Continuidade |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação | ANL-007 → REQ oficial | Em análise |

---

**Estado:** REQ elaborada — pronta para elaboração da **ARQ** e posterior implementação.  
**Sem implementação de código, prompts ou comportamento neste acto.**

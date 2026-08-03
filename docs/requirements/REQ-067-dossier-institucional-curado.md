# REQ-067 — Dossier Institucional Curado (DIC)

> **Status:** Em análise  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação  
> **Nota de numeração:** o pedido de elaboração usou o rótulo «REQ-066»; esse identificador **já está atribuído** a [`REQ-066-tempo-resposta-proporcional-complexidade.md`](REQ-066-tempo-resposta-proporcional-complexidade.md). Este requisito recebe o próximo ID livre (**REQ-067**), conforme ADR-003 (numeração sequencial, nunca reutilizada).

## Enunciado

O Sistema CEO deverá disponibilizar um **Dossier Institucional Curado (DIC)** — artefacto documental **subordinado** à documentação canónica em `/docs` — que **consolida, resume e referencia** conhecimento institucional homologado sobre o próprio CEO e o Sistema CEO, para utilização **exclusiva** no path de respostas **institucionais e metaconversacionais**, **sem** criar normas, decisões ou arquitectura, **sem** substituir CON/VIS/ADR/REQ/ARQ, e **sem** confundir-se com Memória Organizacional (CAP-05), Acervo CAP-04 ou BCO (CAP-06).

## Tipo

Funcional; detalhado (artefacto de consumo institucional — camada curada sob CAP-07; compatível com CAP-04 / CAP-01; pós ANL-011).

## Justificativa

A **ANL-011** demonstra que o **routing** institucional já existe e funciona (Emenda E2.3 → C2; VCA `metaconversa`; complexidade **moderada** via REQ-066 / IMP-066). O problema não é classificação nem arquitectura conversacional do limiar: o LLM recebe mandato executivo (`constituicaoCeo.js`) e governação de prosa (`governancaLlm.js`), mas **não** recebe património institucional suficiente para responder correctamente a perguntas sobre identidade, missão, arquitectura, governança, critérios de decisão, limites e funcionamento do Sistema CEO. Motivações: CON-001 (Art. 2º natureza; Art. 6º papéis; Art. 7º §4º `/docs` canónico; Art. 9º tempo do utilizador e transparência); VIS-001 / VIS-002; ADR-002; ADR-011; ADR-015; EIC (autoexplicação / metaconversa); preservação de ARQ-018, Gate, Motor e NCS.

---

## Objectivo

1. Definir oficialmente o **Dossier Institucional Curado (DIC)** como **única fonte institucional curada** de consumo para respostas sobre o próprio CEO e a organização no path institucional/metaconversacional.  
2. Garantir que o DIC **não cria** conhecimento normativo — apenas **consolida, resume e referencia** documentos oficiais homologados.  
3. Fixar finalidade, âmbito, estrutura, curadoria, actualização, hierarquia de fontes, versionamento e qualidade.  
4. Declarar fronteiras explícitas face a CAP-04, CAP-05, CAP-06, CON-001, EIC, briefing de COA e Constituição de cargo runtime.  
5. Preparar a **ARQ** do DIC (pontos de injecção, política de exposição, contrato de consumo) **sem** implementar código, prompts, retrieval ou RAG nesta etapa de requisito.

---

## Motivação

| Problema | Efeito actual | Solução deste REQ |
|----------|---------------|-------------------|
| Routing OK; património fino | Respostas institucionais inconsistentes / inventadas | DIC curado como carga do path meta |
| CON-001.md ≠ `constituicaoCeo.js` | Papéis, hierarquia e missão incompletos na prosa | DIC espelha CON/VIS/ADR com referências |
| Governação proíbe «expor orquestração» sem política | Arquitectura evasiva ou dump indevido | DIC define **mapa divulgável** (nível patrocinador) |
| CAP-04 vazio (0 KNW) | Sem retrieval; stub de acervo | DIC **não** depende de CAP-04 E3 no MVP |
| Briefing MG2 ≠ Sistema CEO | Contaminação projecto ↔ instituição | DIC separado do briefing de COA; path exclusivo |

---

## Arquitectura conceptual

```text
Documentação canónica (/docs)
  CON · VIS · ADR · REQ · ARQ · EIC · PX …
           │
           │  curadoria (consolida / resume / referencia)
           │  NUNCA cria norma / decisão / arquitectura
           ▼
    ┌─────────────────────────────┐
    │  DIC — Dossier Institucional │  ← única fonte curada de CONSUMO
    │  Curado (este REQ)           │     no path institucional / meta
    └─────────────────────────────┘
           │
           │  (consumo — especificado na ARQ derivada)
           ▼
    Path institucional / metaconversacional
      (E2.3 · VCA metaconversa · complexidade moderada)
           │
    ┌──────┴──────┐
    │ NÃO injectar │  deliberação de projecto por omissão;
    │ por omissão  │  C1 conhecimento geral mundano;
    │              │  MRE completa de COA; briefing MG2
    └─────────────┘

Camadas irmãs (não substituídas pelo DIC):
  constituicaoCeo.js     → mandato de cargo (quem é na prosa executiva)
  governancaLlm.js       → conduta / prosa / anti-alucinação
  briefing COA           → domínio do projecto activo
  Consciência Operacional→ estado (Jobs/Gates), não manual institucional
  CAP-04 acervo KNW      → património reutilizável geral (futuro; ≠ DIC)
```

**Princípio:** o DIC é **camada curada de consumo**, não repositório canónico nem motor de recuperação.

---

## Responsabilidades

| O DIC **deve** | O DIC **não deve** |
|----------------|-------------------|
| Consolidar e resumir conhecimento institucional homologado | Substituir CON-001, VIS, ADR, REQ, ARQ ou EIC |
| Referenciar fontes oficiais por identificador | Criar normas, requisitos ou ADRs |
| Servir o path institucional / metaconversacional | Criar decisões (isso é CAP-05 / Gates) |
| Manter-se subordinado a `/docs` (CON Art. 7º §4º) | Alterar arquitectura vigente |
| Declarar versão e rastreio às fontes | Ser Memória Organizacional (CAP-05) |
| Distinguir conteúdo **divulgável** de orquestração interna | Ser o Acervo CAP-04 nem emitir `KNW-*` por si |
| Alinhar-se conceptualmente a mandato (`constituicaoCeo`) e prosa (`governancaLlm`) | Ser BCO / ciclo de maturação (CAP-06) |
| | Fazer retrieval/RAG automático de `/docs` (fora deste REQ) |
| | Definir implementação de prompt/runtime (cabe à ARQ/IMP) |

---

## Âmbito

### Dentro do escopo (definição normativa deste REQ)

* Finalidade, âmbito, estrutura documental do DIC.  
* Regras de curadoria e critérios de actualização.  
* Hierarquia das fontes e política de versionamento.  
* Critérios de qualidade do conteúdo curado.  
* Fronteiras e compatibilidade com CAP-04, CON-001, EIC, CAP-05, CAP-06, mandato runtime e briefing de COA.  
* Destino de consumo: **apenas** path institucional / metaconversacional.  
* Critérios de aceite / não aceite verificáveis na futura IMP.  
* Estratégia de evolução (fases).

### Capacidade

Exactamente uma capacidade primária: **CAP-07 — Comunicação** (**sem** CAP nova).  
Compatibilidade explícita com **CAP-04** (acervo), **CAP-01** (governança/papéis), **ADR-011** (identidade) — sem fundir o DIC nessas capacidades.

### Fora do escopo

* Código, runtime, prompts, retrieval, RAG, alterações comportamentais (esta etapa).  
* Redacção integral do texto final do DIC (conteúdo — ARQ/IMP após Gate; este REQ fixa **estrutura e regras**).  
* Emissão de itens `KNW-*` / IMP-004 E3.  
* Ingestão automática de todo o `/docs`.  
* Alteração de CON-001, VIS, ADR, limiar 0,55, C1–C4, Gate, Motor, NCS, Fila.  
* Substituição de `constituicaoCeo.js` ou `governancaLlm.js`.  
* Exposição de NCS, schemas MRE, APIs, chaves ou prompts internos.  
* Briefing operacional de COA (ex.: MG2).

---

## Fontes oficiais (hierarquia)

Ordem de prevalência quando houver tensão entre fontes (a inferior cede):

| Prioridade | Fonte | Papel face ao DIC |
|------------|-------|-------------------|
| **1** | CON-001 | Norma máxima; identidade, papéis, pilares, hierarquia |
| **2** | VIS-001 / VIS-002 | Visão e identidade institucional do produto |
| **3** | ADR homologados (ex.: ADR-002, ADR-006, ADR-011, ADR-015, ADR-019) | Decisões arquitecturais / estratégicas vigentes |
| **4** | REQ / ARQ / IMP / VAL homologados aplicáveis | Funcionamento oficial do Sistema (mapa divulgável) |
| **5** | Pacote EIC / PX homologados | Conversação, autoexplicação, prosa |
| **6** | Proposta de identidade permanente (homologada) + espelhos runtime `constituicaoCeo` / `governancaLlm` | Contrato de cargo e conduta — o DIC **alinha** e **não contradiz**; em divergência prevalece `/docs` |

**Regra normativa:** o DIC deriva **exclusivamente** de documentação **homologada** (ou de espelhos runtime **já homologados** como composição de mandato). Rascunhos, learning não homologado e hypotéticos **não** entram como fonte de verdade.

**Regra normativa:** em divergência DIC ↔ documento canónico, **prevalece o documento canónico**; o DIC deve ser corrigido.

---

## Estrutura do DIC

O DIC deverá organizar-se, no mínimo, nas secções seguintes (nomes exactos podem ser fixados na ARQ; o **conteúdo normativo mínimo** é obrigatório):

| # | Secção | Conteúdo mínimo | Tipo de conhecimento (ANL-011) |
|---|--------|-----------------|--------------------------------|
| **S1** | Natureza e missão | O que é o CEO; o que não é; missão (espelho CON Art. 1º–3º) | Institucional |
| **S2** | Papéis | Usuário / CTO / Cursor / Agente Executivo CEO (CON Art. 6º) | Institucional |
| **S3** | Mandato e limites | O que o CEO faz / não faz; autoridade vs sugestão; não programar | Institucional |
| **S4** | Pilares e hierarquia normativa | Governança, Conhecimento, Execução, Aprendizado; CON→VIS→REQ→ADR→IMP | Institucional / Governança |
| **S5** | Mapa divulgável do Sistema | Classificador → deliberação → Gate → Job/fila — **nível patrocinador** (sem internals proibidos) | Técnico (divulgável) |
| **S6** | Critérios de decisão conversacional | Quando só responder; quando deliberar; quando propor Job; quando perguntar | Conversacional / Governança |
| **S7** | Protocolo reflexão × decisão | Como distinguir reflexão do utilizador de pedido de decisão | Conversacional |
| **S8** | Fronteira Sistema CEO × COA | Instituição ≠ projecto activo (ex.: MG2); briefing não define quem o CEO é | Institucional / Operacional (fronteira) |
| **S9** | Índice de fontes | Lista de IDs documentais referenciados + versão do DIC | Rastreio |

Cada secção deverá:

* conter **referências** aos IDs canónicos de origem;  
* evitar factos de estado de sessão (isso é Contexto / Consciência);  
* evitar factos de domínio de COA (isso é Briefing).

---

## Regras de curadoria

| ID | Regra |
|----|-------|
| **CUR1** | Toda afirmação do DIC deve ser **rastreável** a pelo menos uma fonte da hierarquia oficial. |
| **CUR2** | O DIC **resume**; não republica documentos inteiros. |
| **CUR3** | Linguagem alinhada à prosa executiva (PX), sem contrariar `governancaLlm` (anti-ajuda genérica, anti-inventar). |
| **CUR4** | Conteúdo **divulgável** apenas: proibido NCS interno, schemas de estágio MRE, nomes de APIs, prompts, chaves, orquestração de implementação. |
| **CUR5** | Proibido misturar briefing de COA ou estado de Jobs/Gates como se fossem identidade institucional. |
| **CUR6** | Proibido introduzir política nova (norma, decisão, ARQ) sob capa de “resumo”. |
| **CUR7** | Alteração do DIC exige Gate de curadoria (CTO + alinhamento a fontes); não é edição livre ad hoc no runtime. |
| **CUR8** | Uma voz: o resumo de identidade usado em respostas locais deverá ser **derivável** do DIC (S1/S3), sem terceira narrativa. |

---

## Critérios de actualização

O DIC **deverá** ser actualizado quando ocorrer qualquer um dos seguintes (após homologação da mudança na fonte):

1. Emenda ou nova versão de CON-001 que altere natureza, missão, papéis ou pilares.  
2. VIS ou ADR que altere identidade institucional ou papéis.  
3. Homologação de ARQ/REQ que altere o **mapa divulgável** (S5) ou critérios conversacionais oficiais (S6).  
4. Detecção de **divergência** DIC ↔ canónico (incidente de qualidade).  
5. Homologação de protocolo conversacional novo (ex.: reflexão × decisão) sob CAP-07 / EIC.

O DIC **não** deverá ser actualizado apenas porque:

* mudou o estado operacional (Jobs, Gates, sprint MG2);  
* surgiu learning não homologado;  
* o modelo “preferiria” outra redação sem mudança de fonte.

---

## Política de versionamento

| Regra | Enunciado |
|-------|-----------|
| **V1** | O DIC possui identificador e **versão** explícitos (ex.: `DIC-001` vX.Y — ID exacto na ARQ). |
| **V2** | Cada versão regista data, autor da curadoria, fontes reflectidas e resumo da alteração. |
| **V3** | Versionamento do DIC **não** versiona CON-001 nem substitui o histórico das normas. |
| **V4** | Em runtime futuro, o consumo deverá referenciar a **versão vigente** do DIC (contrato na ARQ). |
| **V5** | Correcção por divergência com canónico → nova versão do DIC (não silêncio). |

---

## Critérios de qualidade

| ID | Critério |
|----|----------|
| **Q1** | **Fidelidade:** nenhuma afirmação sem lastro em fonte homologada. |
| **Q2** | **Subordinação:** zero contradição detectável com CON-001 / VIS / ADR vigentes nas secções cobertas. |
| **Q3** | **Brevidade:** volume adequado a injecção no path moderado (orientação: ordem de 1–2 ecrãs de prosa curada — exacto na ARQ). |
| **Q4** | **Separação de camadas:** institucional / técnico divulgável / conversacional presentes; operacional de sessão ausente. |
| **Q5** | **Exposição segura:** passa a política de mapa divulgável (CUR4). |
| **Q6** | **Testabilidade:** fixtures institucionais (papel, papéis Art. 6º, Job vs resposta, mapa, reflexão×decisão) verificáveis na IMP. |
| **Q7** | **Não expansão:** não introduz REQ/ADR/ARQ novos no texto do DIC. |

---

## Registos explícitos (obrigatórios)

Este requisito **regista explicitamente**:

| # | Enunciado normativo |
|---|---------------------|
| 1 | O DIC **não substitui** documentos oficiais. |
| 2 | O DIC deriva **exclusivamente** de documentação homologada (e espelhos de mandato/conduta já homologados). |
| 3 | O DIC **nunca cria** normas. |
| 4 | O DIC **nunca cria** decisões. |
| 5 | O DIC **nunca altera** arquitectura. |
| 6 | O DIC é **subordinado** aos documentos canónicos (`/docs`; CON Art. 7º §4º). |
| 7 | O DIC destina-se **apenas** ao path institucional / metaconversacional. |
| 8 | O DIC **não é** Memória Organizacional (CAP-05). |
| 9 | O DIC **não é** CAP-04 (não é o acervo `KNW-*` nem a capacidade de gestão do conhecimento). |
| 10 | O DIC **não é** BCO (CAP-06). |
| 11 | O DIC é uma **camada curada de consumo**. |

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá reconhecer o **DIC** como artefacto oficial de conhecimento institucional curado, com estrutura mínima S1–S9. |
| **RF2** | O DIC deverá ser a **única fonte institucional curada** autorizada para respostas sobre o próprio CEO e a organização no path institucional/metaconversacional (sem prejuízo do mandato `constituicaoCeo` e da conduta `governancaLlm`, que permanecem camadas distintas). |
| **RF3** | Todo o conteúdo do DIC deverá **referenciar** fontes canónicas; afirmações sem referência são inválidas (CUR1, Q1). |
| **RF4** | O DIC **não** poderá introduzir norma, decisão ou alteração arquitectural novas (registos 3–5). |
| **RF5** | Em divergência com documento canónico, o canónico prevalece e o DIC deve ser corrigido (hierarquia). |
| **RF6** | O consumo do DIC fica **restrito** ao path institucional / metaconversacional; **não** é, por omissão, lastro de deliberação de projecto COA nem de C1 conhecimento mundano (registo 7). |
| **RF7** | O DIC deverá manter fronteira explícita face a briefing de COA, Consciência Operacional (estado), CAP-04, CAP-05 e CAP-06. |
| **RF8** | O resumo de identidade para respostas locais deverá ser **derivável** do DIC (CUR8), alinhado a S1/S3. |
| **RF9** | O DIC deverá expor versão vigente e índice de fontes (S9, V1–V4). |
| **RF10** | A **ARQ-028** especifica: representação do DIC, ponto(s) de injecção no path E2.3 / `metaconversa` / complexidade moderada, política de exposição (divulgável vs interno), e relação exacta com `montarMensagensLlm` / mandato / governação — **sem** este REQ fixar código. |
| **RF11** | Classificador, Gate, Motor, NCS e limiar 0,55 permanecem **preservados**; o DIC é **carga**, não score de classe. |
| **RF12** | Autoexplicação institucional **não** cria Jobs nem Gates por causa do DIC (preserva E2.3). |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Subordinação documental:** DIC sempre auditável contra `/docs`. |
| **RNF2** | **Tempo do utilizador:** DIC curto o suficiente para path moderado (Q3). |
| **RNF3** | **Testabilidade:** critérios CA abaixo verificáveis sem RAG. |
| **RNF4** | **ADR-006:** IMP só após ARQ do DIC + Gates aplicáveis; este REQ **não** autoriza implementação. |
| **RNF5** | **Segurança:** sem secrets; sem exposição de orquestração interna (CUR4). |
| **RNF6** | **Evolução:** actualização por critérios deste REQ; não por drift de modelo. |

---

## Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | Sem criação de norma/decisão/ARQ via DIC. |
| **RST2** | Sem substituição de documentos oficiais. |
| **RST3** | Sem confusão com CAP-04 / CAP-05 / CAP-06. |
| **RST4** | Sem retrieval/RAG neste REQ. |
| **RST5** | Sem alteração de Classificador / Gate / Motor / NCS / Jobs por este REQ. |
| **RST6** | Sem CAP nova. |
| **RST7** | Sem implementação (código/prompt/runtime) sob a vigência isolada deste REQ. |

---

## Critérios de aceite

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Existe definição oficial do DIC com secções S1–S9 (ou equivalente ARQ que as cubra). |
| **CA2** | Hierarquia de fontes e prevalência do canónico estão documentadas e aplicáveis (CUR/hierarquia). |
| **CA3** | Os onze **registos explícitos** (§ acima) constam do artefacto normativo e não são contraditos pela ARQ. |
| **CA4** | Regras de curadoria CUR1–CUR8 e critérios de actualização estão especificados. |
| **CA5** | Política de versionamento V1–V5 especificada. |
| **CA6** | Fronteiras CAP-04 / CAP-05 / CAP-06 / briefing COA / Consciência / mandato runtime estão explícitas. |
| **CA7** | Destino de consumo limitado ao path institucional/metaconversacional está normativo (RF6). |
| **CA8** | Compatibilidade com CON-001 Art. 7º §4º (DIC subordinado) verificável na redacção. |
| **CA9** | Compatibilidade com EIC: DIC como **carga** do path E2.3/`metaconversa`; Classificador intacto (RF11). |
| **CA10** | Compatibilidade com CAP-04: DIC ≠ acervo; evolução futura para `KNW` opcional e não bloqueante do MVP (estratégia). |
| **CA11** | Critérios de qualidade Q1–Q7 adoptados como gate de curadoria. |
| **CA12** | ARQ derivada pode ser elaborada sem ambiguidade de âmbito (RF10). |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | DIC tratado como norma superior ou substituto de CON/VIS/ADR. |
| **NA2** | DIC cria política nova (norma, decisão, arquitectura) sem fonte. |
| **NA3** | DIC identificado como implementação de CAP-04, CAP-05 ou BCO. |
| **NA4** | Consumo do DIC por omissão em deliberações de projecto COA / MRE completa / C1 mundano. |
| **NA5** | Inclusão de briefing MG2 ou estado de Jobs como identidade institucional. |
| **NA6** | Exposição de orquestração interna proibida (NCS, APIs, prompts, chaves). |
| **NA7** | REQ que embute solução de código, prompt ou RAG como obrigação deste documento. |
| **NA8** | Alteração do Classificador / limiar / Gate / Motor / NCS sob pretexto do DIC. |
| **NA9** | Implementação sem ARQ + fluxo ADR-006. |
| **NA10** | Reutilizar o ID REQ-066 (já atribuído) para este requisito. |

---

## Compatibilidade

| Norma / peça | Relação |
|--------------|---------|
| **ANL-011** | Base analítica; MVP = DIC |
| **CON-001** | Fonte máxima; DIC subordinado (Art. 7º §4º); espelha Art. 1º–6º em S1–S4 |
| **VIS-001 / VIS-002** | Fontes de identidade institucional |
| **ADR-002 / ADR-011 / ADR-015** | Identidade estratégica; identidade organizacional; uso diário |
| **ADR-006** | Fluxo REQ → ARQ → IMP; este REQ não salta etapas |
| **CAP-07 / EIC** | Capacidade primária; path E2.3 / metaconversa / autoexplicação |
| **CAP-04** | Compatível e **distinto**: acervo `KNW` pode espelhar extractos no futuro; DIC ≠ CAP-04 |
| **CAP-05** | Distinto (decisões históricas) |
| **CAP-06 / BCO** | Distinto (maturação de competências) |
| **REQ-057 / ARQ-018** | Classificador intacto; DIC = carga |
| **REQ-065 / ARQ-026 / IMP-065** | VCA `metaconversa` isola lastro CSC; DIC alimenta esse path |
| **REQ-066 / ARQ-027 / IMP-066** | Complexidade moderada = caminho típico de consumo do DIC |
| **IMP-057 E2.3** | Routing de autoexplicação preservado |
| **proposta-identidade + `constituicaoCeo` / `governancaLlm`** | Camadas de mandato/conduta; DIC alinha e não as revoga |
| **Briefing COA / Consciência** | Operacional; fora do DIC |
| **MRE / NCS / Gate / Motor / Jobs** | Preservados; DIC não os redesenha |

---

## Estratégia de evolução

| Fase | Conteúdo | Depende de |
|------|----------|------------|
| **F0** | Este REQ (definição) | ANL-011 |
| **F1** | ARQ-028 do DIC (representação, injecção, política de exposição, contrato com mandato/governação) | Aprovação REQ-067 |
| **F2** | IMP-067 — materializar DIC vigente + consumo no path meta + alinhar resumo local; testes CA | ARQ-028 + Gates ADR-006 / EIC |
| **F3** | (Opcional) Registo de extractos estáveis como `KNW-*` no acervo CAP-04, **sem** fundir DIC no acervo | CAP-04 E3 + curadoria |
| **F4** | (Opcional) Recuperação contextual (REQ-005) para outros conhecimentos — **não** substitui o DIC no path institucional | REQ-005 operativo |

**Não** na evolução deste REQ: RAG genérico sobre `/docs` como substituto do DIC.

---

## Dependências

| Dependência | Natureza |
|-------------|----------|
| ANL-011 | Origem analítica |
| CON-001; VIS-001; VIS-002 | Fontes de conteúdo |
| REQ-057 / IMP-057 E2.3; REQ-065; REQ-066 | Path de consumo (routing + isolamento + complexidade) |
| Proposta identidade permanente (homologada) | Separação mandato / governação / contexto / briefing |
| CAP-001 (CAP-07) | Capacidade primária |

## Riscos e incertezas

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | DIC drift vs CON-001 | Hierarquia + CUR1 + actualização obrigatória |
| R2 | Prompt demasiado longo | Q3; só path meta |
| R3 | Contaminação em deliberação de projecto | RF6; NA4 |
| R4 | Confusão com CAP-04 | Registos 9–11; CA10 |
| R5 | Exposição indevida de internals | CUR4; política na ARQ |
| R6 | Três vozes de identidade | CUR8; RF8 |
| R7 | Pressão para implementar antes da ARQ | RST7; NA9; RNF4 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 1º–3º, 6º, 7º §4º, 9º; VIS-001; VIS-002 |
| Origem | ANL-011; comando do patrocinador 03/08/2026 (elaborar REQ do DIC) |
| Decisões derivadas | ARQ-028; IMP-067 (a elaborar) |
| Implementação | — (proibida nesta etapa) |
| Testes | CT institucionais — a especificar na ARQ/IMP |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação REQ-067 (DIC); ID ajustado — REQ-066 já ocupado | ANL-011 + pedido de elaboração do DIC | Em análise — pronta para ARQ |

---

**Estado:** REQ concluída (rascunho engenheiro).  
**ARQ derivada:** [`ARQ-028-dossier-institucional-curado.md`](../architecture/ARQ-028-dossier-institucional-curado.md).  
**IMP:** [`IMP-067-dossier-institucional-curado.md`](../implementation/IMP-067-dossier-institucional-curado.md) — implementada; aguarda homologação.  
**Próximo passo oficial:** Homologação CTO / patrocinador.

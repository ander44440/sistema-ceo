# ADR-023 — Deliberação com base factual restrita (LFC × HFC)

> **Status:** Aprovada (Usuário) — v0.1  
> **Versão:** 0.1 — 13/09/2026  
> **Não homologa** implementação. **Não** abre IMP. **Não** altera código.  
> **Âmbito:** geral — qualquer deliberação com **restrição factual explícita**; **não** específica ao T05 ValeVerde.  
> **Fora desta frente:** calibração P1-2 / detecção LN de análise deliberativa; modos restritos IMP-092.3; alteração do contrato append-only do HFC (REQ-087).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | Usuário (autoridade máxima) — D1–D4 aprovados para formalização; Engenheiro (Cursor) redige |
| Quando | 13/09/2026 |
| Por quê | Auditoria normativa pós-T05: LFC correcto e `factosOficiais` limpos; HFC residual do mesmo COA contaminava `mensagem`/envelope MRE e `objetivoReal` antes da geração |
| Baseado em quê | Auditoria LFC × HFC (D1–D4); ADR-021; ADR-022; REQ-092 v0.3; ARQ-092 v0.3; REQ-087; REQ-049 (histórico = contexto, não factos inventados) |
| Resultado | ADR-023 v0.1 + REQ-092 v0.4 + ARQ-092 v0.4 + ponteiros em ADR-022. Zero código. Zero IMP |

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Decisão que fecha o regime **Deliberação com Base Factual Restrita (RFR)**: quando o utilizador restringe explicitamente a análise aos factos registados/assertados do caso e o consumo LFC está autorizado, o universo factual e o objecto deliberativo limitam-se ao LFC (e ao turno actual de registo/correção, se aplicável), com HFC residual **sem** poder redefinir esse universo. |
| **Por que existe?** | ADR-022 fechou *quando* injectar LFC e que lista é autoridade em `factosOficiais`; **não** fechou o papel do HFC/fio no envelope deliberativo sob restrição explícita — permitindo autoridade nominal LFC e autoridade efectiva HFC. |
| **Para quem existe?** | CTO (revisão); Engenheiro (IMP futura); MRE / Conversa / Speaker (consumidores do contrato). |
| **Como medir sucesso?** | Critérios **CA-RFR-*** do REQ-092 v0.4; IMP futura (acto separado) sem violar D1–D4 nem ADR-022. |

---

## 1. Contexto

ADR-021 institui o LFC como fonte canónica de factos vigentes; HFC/transcript = **prova**. ADR-022 / REQ-092 §11 fecham consumo MRE: LFC activos = autoridade; HFC/reparse = prova histórica que **não substitui** activos.

Evidência operacional (bateria T05, 3 reproduções): com LFC autorizado e 4 activos correctos, o fio HFC residual (temas antigos de preço/10%/elasticidade/serviço) entrava na `mensagem` MRE e propagava-se a `objetivoReal` / parecer **antes** da prosa final. `factosOficiais` permaneciam só LFC — conformidade parcial CM7 na lista, falha do objecto deliberativo.

A auditoria normativa concluiu lacuna contratual (D1–D4), não ausência de LFC.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | «HFC = prova» sem limite de *uso deliberativo* sob restrição explícita → prova vira mandato / objecto |
| P2 | Precedência LFC cumprida em `factosOficiais` mas contornada via envelope/`objetivoReal` |
| P3 | Confusão com M2, modos restritos, P1-2, `solicitar_dados`, «há LFC ⇒ lastro suficiente» |
| P4 | Risco de norma ad hoc T05 em vez de regime geral |

---

## 3. Decisão (aprovada) — D1–D4

### 3.1 D1 — Deliberação com base factual restrita (RFR)

Quando **ambas** as condições se verificam:

1. **Consumo LFC autorizado** (ADR-022 / CM2: COA resolvido **e** caso resolvido ou inequívoco), **e**
2. O pedido **actual** do utilizador contém **restrição explícita de base factual** aos factos registados / assertados / registados no lastro do caso (ou equivalente semântico inequívoco no pedido actual),

então aplica-se o regime **RFR**:

| Elemento | Limite |
|----------|--------|
| **Universo factual permitido** | Factos `activo` do LFC do `casoId` resolvido; **e**, quando aplicável no mesmo acto, o turno actual de **registo** ou **correção** explícita do utilizador (entrada para o writer — REQ-092 §7 prio 2) |
| **Objecto deliberativo restrito** | `objetivoReal`, problema de negócio, análise, riscos/oportunidades na medida em que dependam de factos do caso, recomendação e acção proposta — **só** podem assentar no universo factual permitido |
| **Proibição** | Introduzir, como facto ou como objecto a resolver, enunciados / hipóteses / recomendações / objectivos que existam **apenas** no HFC, transcript, reparse, prosa CEO anterior ou inferência sem lastro no universo permitido |

Ausência de facto **necessário** no universo permitido → declarar limitação / lacuna deliberativa real (CM9–CM11); **não** inventar nem importar do HFC.

### 3.2 D2 — Papel residual do HFC sob RFR

Sob RFR, o HFC (e o transcript / fio recente derivado) **pode**:

| Uso permitido | Finalidade |
|---------------|------------|
| Continuidade conversacional | Não perder o fio do **pedido actual** (CON-001 Art. 9º.2) |
| Deixis / referência | Resolver «isso», «o caso», «a empresa» quando o referente é o caso já resolvido |
| Identidade / resolução | Apoiar COA/`casoId` já sujeitos a ADR-022 (sem escolha silenciosa) |
| Prova auditável | Rastreio do que foi dito (`origemTurnoRef`, auditoria) — **fora** do universo factual de decisão |

Sob RFR, o HFC **não pode**:

| Uso proibido | Motivo |
|--------------|--------|
| Introduzir **factos** de turnos anteriores no universo factual restrito | Viola D1 / CM7 |
| Introduzir **hipóteses**, cenários ou pressupostos só do fio | Não são LFC activo |
| Introduzir **recomendações** ou **objectivos** de turnos anteriores como mandato ou como `objetivoReal` | CM14 + D1 |
| **Substituir** ou **estender** a lista vigente de factos do caso | CM8 / T15 |
| Mascarar ausência de facto LFC necessário | CM9 |

**Preservação:** HFC permanece append-only e prova (REQ-087). RFR **não** apaga, reescreve nem invalida o arquivo HFC.

### 3.3 D3 — Regime sem restrição explícita

Quando o pedido actual **não** contém restrição factual explícita:

- HFC / histórico recente **continua permitido** como **contexto conversacional** (REQ-049 estágio 0: contexto, não factos inventados);
- Continua a aplicar-se a **autoridade do LFC** quando o consumo está autorizado (ADR-022 CM7–CM8): HFC/reparse **não** substituem factos activos;
- Inferências do MRE **não** viram facto LFC (CM14).

### 3.4 D4 — Separações obrigatórias

Esta ADR **não** é, e **não** deve ser implementada como:

| Confusão | Norma correcta |
|----------|----------------|
| **M2** / anti-injecção LFC | M2 impede injectar LFC **sem** pedido do caso; RFR limita o **HFC** quando o caso **já** está em deliberação restrita |
| **Modos restritos IMP-092.3** (`registo` / `confirmação` / `factos` / `dado_unico`) | Gates de escrita/leitura LFC; RFR é regime **deliberativo** C2 |
| **P1-2** / `detectarPedidoAnaliseDeliberativa` | Fora desta frente; RFR **não** calibra detecção de «análise deliberativa» |
| **`solicitar_dados`** | CM10–CM12 intactos: lacunas deliberativas **reais** não cobertas pelo LFC; RFR **não** cria «há LFC ⇒ nunca solicitar» |
| **«LFC existe = lastro suficiente»** | Explicitamente rejeitado (CM10; ADR-022 R-SD1) |

### 3.5 Gatilho da restrição (normativo)

| ID | Regra |
|----|--------|
| **RFR-G1** | O gatilho é o **pedido actual** do utilizador (não turnos anteriores isolados). |
| **RFR-G2** | Há restrição explícita quando o pedido limita a análise/deliberação aos factos **registados**, **assertados**, **registados no lastro/caso**, ou equivalente semântico **inequívoco** no mesmo pedido. |
| **RFR-G3** | Exemplos **ilustrativos** (não léxico fechado de IMP): «analisando apenas os fatos registrados sobre…»; «só com os factos do lastro do caso»; «com base unicamente nos factos assertados…». |
| **RFR-G4** | A calibração exacta do detector LN da restrição é **acto de IMP futura** (separado); esta ADR fecha o **contrato** do que ocorre **quando** a restrição está presente e o consumo LFC autorizado. |
| **RFR-G5** | Ambiguidade de caso → ADR-022 §3.3 / CM6 (esclarecimento; **proibida** escolha silenciosa) — RFR **não** se aplica com lastro LFC injectado sob caso ambíguo. |

### 3.6 Preservações (invioláveis neste acto)

- Isolamento `coaId` / `casoId` (ADR-021; REQ-037/039).  
- Precedência LFC sob consumo autorizado (ADR-022 §3.4).  
- MRE somente consumidor (W3; CM13–CM15).  
- HFC append-only / prova (REQ-087).  
- Proibição de escolha silenciosa em caso ambíguo (CM6).

---

## 4. Relação com ADR-022 / REQ-092 / ARQ-092

| Documento | Relação |
|-----------|---------|
| **ADR-022** | Permanece a norma de **consumo** LFC→MRE (gatilho, não-consumo, ambiguidade, precedência em factos, `solicitar_dados`). ADR-023 **complementa**: uso do HFC/fio no **objecto deliberativo** sob RFR. Não reabre P1-2. |
| **REQ-092** | v0.4 materializa regras **CM-RFR-*** e critérios **CA-RFR-***. |
| **ARQ-092** | v0.4 acrescenta §13.2 (contrato arquitectural RFR). |
| **ADR-021** | Hierarquia e prova HFC preservadas; RFR operacionaliza a prova sem a transformar em autoridade. |
| **REQ-087** | HFC intacto como arquivo; RFR só restringe **consumo deliberativo**, não a gravação. |
| **REQ-049** | Histórico como contexto conversacional permanece no regime D3; sob RFR cede ao universo D1. |

---

## 5. Alternativas rejeitadas

| Alternativa | Motivo |
|-------------|--------|
| Norma só para T05 / ValeVerde | Viola generalidade pedida; mesmo defeito em qualquer COA |
| Apagar ou truncar HFC do COA | Viola REQ-087 / Art. 9º.2; prova ≠ contaminação |
| «Há LFC ⇒ ignorar sempre o HFC» | Excessivo; quebra continuidade legítima (D3) |
| Tratar RFR como modo restrito IMP-092.3 | Objectos distintos (gate LFC vs deliberação) |
| Fundir com P1-2 | Escopo misturado; rejeitado |
| «Há LFC ⇒ nunca `solicitar_dados`» | Já rejeitado em ADR-022 |

---

## 6. Consequências

- REQ-092 v0.4 e ARQ-092 v0.4 incorporam o contrato RFR.  
- ADR-022 recebe ponteiro normativo (sem reabrir regras 1–10 de consumo).  
- **IMP de RFR / isolamento HFC no envelope:** acto **futuro e separado** — **não** aberto por esta ADR.  
- Zero alteração de código neste acto.

---

## 7. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 Art. 9º; ADR-015; ADR-006; **ADR-021**; **ADR-022** |
| Capacidade | CAP-03 (LFC); CAP-05 (deliberação MRE) |
| REQ | REQ-092 v0.4; REQ-087 (HFC); REQ-049 (contexto histórico) |
| ARQ | ARQ-092 v0.4 |
| Evidência | Auditoria LFC × HFC; diag T05 invencão factual (3×) |
| Explicitamente fora | P1-2; IMP-092.3; abertura de IMP RFR |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 13/09/2026 | Engenheiro (Cursor) | D1–D4; gatilho; usos HFC; separações | Despacho Usuário — formalizar auditoria | Aprovada (Usuário); IMP não aberta |

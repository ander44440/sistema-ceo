# Ficha — Coda Decision Docs (26/07/2026)

> **Status: Homologada — Gate F1-G (CTO, 26/07/2026). Integra a base documental da IPR-001.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.  
> Tipo: **referência positiva** (decisão como artefato estruturado e rastreável).  
> Foco deliberado: evidências para **HP-006** (justificativa rastreável); reforço HP-005.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Coda** — padrão **Decision Docs** (e templates Decision Doc) |
| Categoria | Executiva / Knowledge (decisão estruturada em doc interativo) |
| URL / fonte | https://coda.io/solutions/role/product-teams ; https://coda.io/@lshackleton/the-ultimate-coda-handbook-for-product-teams/2-decision-docs-8 (observado 26/07/2026) |
| Versão / superfície observada | Página Coda for product teams + handbook oficial “2. Decision Docs” |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Parcial** (forte em decisão com justificativa e processo rastreável; domínio = doc colaborativo all-in-one, não Home conversacional COA) |

---

## 1. Identidade do Produto

Coda posiciona-se como plataforma all-in-one (docs + apps) para product teams; destaca **effective decision-making** — estruturar feedback para clareza nas perguntas importantes, em contraste com decisões perdidas em comments de Google Docs ([product teams](https://coda.io/solutions/role/product-teams)). O handbook oficial descreve o padrão **Decision Docs**: templates que enquadram memos de decisão e conduzem a conclusões reais ([Decision Docs](https://coda.io/@lshackleton/the-ultimate-coda-handbook-for-product-teams/2-decision-docs-8)).

## 2. Primeira Impressão

Tom de **co-decisioning** (não só co-editing). Exemplos citados: Zoom Decision Doc / RCR; templates Decision Doc com options, sentiment, consensus. Sensação: a decisão é um artefato de primeira classe.

## 3. Organização da Informação

* Unidade: **Decision Doc** — writeup + estruturas interativas (Done Reading, Dory topic voting, Pulse/sentiment).  
* Contraste explícito: decisões importantes não devem viver no painel lateral de comments (~“100-pixel panel”).  
* Frameworks culturais nomeados (RCR, S.P.A.D.E., PR/FAQ, etc.) — justificativa e processo visíveis.  
* Team hub centraliza notes, decisions, roadmap.  
* Claim: >1M Decision Docs criados em Coda (handbook).

## 4. Fluxo de Uso

1. Escrever proposta/contexto no doc.  
2. Revisores marcam leitura; elevam tópicos a Dory (votação).  
3. Discutir o que importa; medir sentiment.  
4. Chegar a consenso/conclusão explícita.  
5. Doc permanece como registro vivo da decisão.

## 5. Apoio à Tomada de Decisão

A decisão **é** o objeto: não se confunde com thread de comentários. Justificativa (writeup), evidência de engajamento (Done Reading) e tópicos prioritários (Dory) tornam o raciocínio inspecionável. Efeitos ao longo do tempo dependem de o doc permanecer vivo no hub — parcial vs. fecho de loop de impacto (Productboard).

## 6. Diferenciais Observados

### O que pode informar o CEO (adaptar, não copiar) — REFERÊNCIA POSITIVA

| Incorporar (conceitual) | Por quê |
|-------------------------|---------|
| Decisão como artefato de primeira classe com writeup | **HP-006** — não isolada; ligada a justificativa |
| Separar ruído (comments) de tópicos que exigem deliberação | **HP-004** + rastreabilidade |
| Registro persistente do “porquê” e do processo | Memória organizacional; CON-001 rastreabilidade |
| Conclusão explícita (consensus/final) | **HP-005** — decisão como unidade |

## 7. O que NÃO copiar para o CEO

| Não incorporar | Por quê |
|----------------|---------|
| All-in-one doc/workspace como Home | Similar Notion — risco “tudo em um” sem COA |
| Templates de voting/Dory como UI default | Densidade; pode burocratizar (CON-001 p.1) |
| Substituir conversa principal por memo assíncrono sempre | REQ-041 — conversa é interface principal |
| Multiplicar frameworks (SPADE, RCR…) sem objetivo único | Conflita HP-001 / P6 |
| Packs/integrações infinitas | Tool sprawl |

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Alta (conceitual p/ HP-006) / Média-baixa (forma)** | Alta para exigir **justificativa + processo rastreável** em decisões relevantes; baixa-média na forma (doc suite). |

### Relação explícita com HP-006

| Aspecto HP-006 | Evidência Coda |
|----------------|----------------|
| Não isolada | Writeup + estruturas de deliberação no mesmo artefato |
| Ligada a evidências/contexto | Background/proposal no doc; frameworks de reasoning |
| Efeitos ao longo do tempo | Doc persistente no hub (parcial — impacto pós-decisão menos enfatizado que Productboard) |

---

## Dimensões (D1–D10) — rubrica complementar

| ID | Nota (1–5 / N/A) | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------------------|-----------|-------------------|----------------|
| D1 Controle | 4 | Processo explícito de aprovação/consenso | Controlo via ritual claro | Burocracia |
| D2 Info → decisão | 5 | Writeup → Dory → conclusão | Decisão inspecionável | Doc sem fecho |
| D3 Clareza | 4 | Separar comments vs. tópicos | Clareza do que importa | — |
| D4 Densidade / elegância | 3 | Templates ricos | — | Over-structure |
| D5 Consistência | 4 | Templates culturais | Padrão de decisão | — |
| D6 Objetivo por superfície | 4 | Um Decision Doc = uma decisão | Um objetivo por artefato | Hub multipropósito |
| D7 Conversação | 2 | Async co-decisioning | — | Substituir Home conversacional |
| D8 Contexto / isolamento | 3 | Contexto no doc; hub amplo | Contexto na decisão | Sem COA |
| D9 Tempo do usuário | 3 | Menos “sticky notes”; ritual tem custo | — | Over-process |
| D10 Identidade / tom | 3 | Product collab docs | — | Identidade Coda/Notion-like |

## Implicações por frente

| Frente | Implicação (se houver) |
|--------|------------------------|
| UX | Toda decisão relevante carrega justificativa e vínculos inspecionáveis (HP-006) |
| UI | N/A nesta fase |
| Branding | Governança por decisões rastreadas ≠ wiki de templates |
| Design system | N/A |

## Conclusão

Coda Decision Docs ensina que **a decisão deve ser um artefato com justificativa e processo rastreável**, não um comentário lateral — evidência forte para HP-006; a forma all-in-one não é a Home do CEO.

---

## Memória Organizacional (da ficha)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Referência positiva pós F1-F; testar HP-006 |
| Baseado em quê | coda.io product teams; handbook Decision Docs; deliberação HP-006 |
| Resultado | Ficha v0.1 submetida ao CTO |

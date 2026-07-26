# Ficha — Glean Assistant (26/07/2026)

> **Status: Homologada — Gate F1-I (CTO, 26/07/2026). Integra a base documental da IPR-001 como referência oficial.**  
> Template: v0.2; evidências relevantes e verificáveis.  
> Tipo: **referência** (assistente com contexto organizacional).  
> Coleta ágil F1-H+: domínio novo após inventário inicial; **nenhuma nova hipótese** proposta.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Glean Assistant** |
| Categoria | Conversacional / Knowledge (assistente enterprise grounded) |
| URL / fonte | https://www.glean.com/ai-assistant (observado 26/07/2026) |
| Superfície observada | Página pública do produto |
| Observador | Engenheiro (Cursor) |
| Classificação | **Parcial** — forte em contexto org. + citações; forma ≠ Home COA do CEO |

## 1. Identidade do Produto

Glean Assistant posiciona-se como **um AI coworker para todo o trabalho**: respostas personalizadas e confiáveis, sugestões proativas do que precisa de atenção, e execução de workflows — grounded no conhecimento da empresa ([glean.com/ai-assistant](https://www.glean.com/ai-assistant)).

## 2. Primeira Impressão

Assistente de trabalho com **contexto empresarial**, não chat genérico. Tom: “stay ahead of what matters”; cards de atividade; insights citados.

## 3. Organização da Informação

* Conhecimento conectado across apps/teams/systems.  
* Respostas com **cited insights**.  
* Reuniões → summaries, **decisions** e next steps.  
* Proactive intelligence: activity cards do que mudou / blockers / prioridades.

## 4. Fluxo de Uso

1. Assistente sugere o que merece atenção (antes de perguntar).  
2. Usuário pergunta / pesquisa com grounding no contexto da empresa.  
3. Obtém insights citados; pode gerar conteúdo ou delegar workflows.

## 5. Apoio à Tomada de Decisão

Prioriza atenção e respostas grounded; transforma reuniões em decisões e próximos passos. Não declara, na superfície observada, um único COA isolado nem artefato normativo de governança do tipo Decision Doc.

## 6. Incorporar (conceitual)

| Incorporar | Por quê |
|------------|---------|
| Contexto organizacional grounding respostas | Contrasta RC-03; apoia HP-002 |
| Sugestões do que precisa atenção antes da exploração | Apoia HP-004 |
| Insights citados | Apoia HP-006 (evidência ligada à resposta) |
| Reuniões → decisões + next steps | Apoia HP-005 (parcial) |

## 7. Não incorporar

| Não incorporar | Por quê |
|----------------|---------|
| “One AI coworker for all your work” como Home | Multipropósito vs. P6 / posto de comando |
| Busca enterprise org-wide sem isolamento COA | Conflita REQ-037/039 |
| Autonomia de workflows multi-sistema sem trilha decisória | Risco HP-006 / P1 |
| Geração de decks/spreadsheets como núcleo | Domínio produtividade ≠ governança |

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Média–Alta (conceito) / Baixa–Média (forma)** | Útil para contexto vivo + atenção + citação; não copiar como workspace único sem COA. |

## Dimensões (D1–D10) — essencial

| ID | Nota | Evidência |
|----|------|-----------|
| D1 Controle | 3 | Sugestões + execução; risco se workflows forem opacos |
| D2 Info → decisão | 4 | Attention cards; decisions/next steps |
| D4 Densidade | 3 | Plataforma ampla |
| D6 Objetivo | 2 | Multipropósito (“all your work”) |
| D7 Conversação | 4 | Assistente conversacional central |
| D8 Contexto | 4 | Company context; frágil vs. isolamento COA |
| D9 Tempo | 4 | Proactive / prepare faster |

## Conclusão

Glean ensina que **conversa útil exige contexto organizacional e evidência citável** — reforça HP-002/004/006 sem nova hipótese; a forma “coworker para tudo” não é a arquitetura do CEO.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Coleta ágil pós inventário inicial; domínio knowledge/assistant |
| Baseado em quê | glean.com/ai-assistant; Gate F1-H |
| Resultado | Ficha homologada (Gate F1-I) como referência oficial; nenhuma nova hipótese |

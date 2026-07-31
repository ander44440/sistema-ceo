# IMP-012 — Pipeline do MRE (Estágios 0–7)

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 1 — v0.2 (30/07/2026).**  
> Tipo IMP (ADR-012). **Bloco 1 / Fase F2** do [IMP-010](IMP-010-plano-de-implementacao-mre.md).  
> Norma superior: REQ-049; REQ-048; ARQ-013; IMP-010; ADR-019 (*não alterado*).  
> **Código:** `app/src/mre/pipeline/`, `executarDeliberacao.js`. Relatório: [`evidencias/BLOCO-1-relatorio-consolidado.md`](evidencias/BLOCO-1-relatorio-consolidado.md).  
> **Proibições cumpridas:** sem Speaker, Núcleo, Voice, Chat, Fila.

---

## 1. Objetivo

Materializar o **orquestrador do pipeline** do MRE para os estágios **0 a 7**, produzindo um **parecer candidato** (blocos até `acao`) conforme REQ-049, sem emitir prosa de utilizador e sem executar o estágio 8 (IMP-013).

## 2. Escopo

### Inclui

* Sequência 0 → 1 → 2 → 3 → 4 → 5a ∥ 5b → 6 → 7.  
* Responsabilidades, pré/pós-condições e modos DET / LLM / HIB por estágio (REQ-049).  
* Montagem parcial do parecer (raiz mínima + blocos 0–7); validação via IMP-011 **pode** ser parcial até existir `aprendizado` (ver dependências).  
* Tratamento de falhas LLM com retentativa única e falha deliberativa controlada (sem assistente livre).  
* Regras de transição T1–T5 e mapeamento decisão→ação (T3) na produção do estágio 7.  
* Short-circuit T4 controlado (ainda produz blocos mínimos 3–5).

### Fora do escopo

* Estágio 8 / Aprendizado Executivo (IMP-013).  
* Speaker, canais, Voice.  
* Roteamento completo do Núcleo (F4) — entrada desta IMP é um **pedido deliberativo já admitido** (contrato de entrada lógico).  
* Persistência de memória/precedentes/princípios.  
* Despacho real na Fila (apenas preencher `acao.job` quando o tipo exigir).

## 3. Componentes envolvidos

| Componente lógico | Responsabilidade |
|-------------------|------------------|
| Orquestrador MRE (0–7) | Ordem, gates de pós-condição, paralelismo 5a/5b |
| Estágio 0 Diagnóstico | LLM + saneamento DET |
| Estágio 1 Enquadramento | HIB |
| Estágio 2 Memória / Dossier | **DET** — só fontes oficiais |
| Estágio 3 Princípios | HIB — seleção no catálogo |
| Estágio 4 Análise | LLM |
| Estágio 5a Riscos | HIB |
| Estágio 5b Oportunidades | LLM |
| Estágio 6 Decisão | LLM + validação DET do enum |
| Estágio 7 Ação | DET no tipo (T3) + redação |
| Adaptador de fontes do dossier | Leitura Painel/memória/sessão (sem inventar) |
| Tratador de falhas de estágio | Retry + parecer/caminho controlado |

## 4. Dependências

| Dependência | Tipo | Nota |
|-------------|------|------|
| **IMP-011** (gate) | Rígida | Validador e modelo do parecer |
| REQ-049 | Norma | Pipeline |
| REQ-048 | Norma | Forma dos blocos 0–7 |
| Painel / memória existentes | Sistema | Entrada DET do estágio 2 |
| Catálogo de princípios / Constituição | Sistema | Entrada estágio 3 |

**Bloqueia parcialmente:** IMP-013 (precisa dos blocos até `acao`).  
**Não bloqueia sozinho:** Speaker (precisa também F3 + parecer completo).

## 5. Estratégia de implementação

1. Fixar **contrato de entrada** lógico: mensagem, metadados de intenção, `coaId`, snapshot de fontes para dossier.  
2. Implementar orquestração estrita (T1); 5a/5b só após 4; 6 só após ambos (T5).  
3. Estágio 2 primeiro em DET com fixtures de Painel (evita alucinação factual).  
4. Estágios LLM com **schema de saída parcial** por estágio (não prosa livre).  
5. Estágio 7: determinar `acao.tipo` por tabela T3 **antes** de redigir descrição/job.  
6. Em falha: 1 retry → falha controlada (`adiar` ou `solicitar_dados` + ação coerente), nunca texto de assistente.  
7. Integração com validador IMP-011: validar blocos disponíveis; validação V4 completa fica para após IMP-013.  
8. Evidência: 2–3 cenários (decisão fechada; solicitar_dados; falha simulada de LLM).

## 6. Critérios de conclusão

* Pipeline 0–7 executável de ponta a ponta em ambiente de evidência.  
* Saída contém `diagnostico` … `acao` alinhados a REQ-048.  
* Nenhuma saída destinada ao utilizador final (proibição Speaker).  
* T3 observável: inconsistência decisão↔ação não passa sem correção/falha.  
* Estágio 2 não inventa factos ausentes das fontes.  
* Gate F2 do IMP-010 satisfazível com evidências anexas.  
* Estágio 8 **ausente** ou stub explícito não usado em produção desta fase.

## 7. Critérios de teste

| ID | Caso | Esperado |
|----|------|----------|
| T12-01 | Fluxo feliz → `aprovar`/`orientar` ou equivalente coerente | Blocos 0–7 presentes; enum válido |
| T12-02 | Lacunas materiais | Preferência `solicitar_dados` + `perguntar` + lacunas ≠ ∅ |
| T12-03 | Paralelo 5a/5b | 6 não inicia antes de ambos |
| T12-04 | Tentativa de saltar estágio | Rejeitada (T1) |
| T12-05 | Dossier sem COA/Painel | Lacuna explícita; sem factos inventados |
| T12-06 | LLM devolve enum ilegal no estágio 6 | Saneamento/retry/falha controlada; não propaga enum livre |
| T12-07 | `delegar` | `despachar` + `job` com título/descrição |
| T12-08 | Short-circuit T4 | Ainda produz análise/riscos/oportunidades mínimos + decisão `solicitar_dados` |
| T12-09 | Timeout LLM | Retry único + falha controlada |
| T12-10 | Saída não contém campo de “mensagem ao utilizador” como produto do MRE | Cumprido |

## 8. Riscos conhecidos

| Risco | Mitigação |
|-------|-----------|
| Latência de múltiplos LLM | Aceitável no Bloco 1; medir; não fundir estágios sem Gate |
| Contaminação factual no estágio 2 | DET + proibição de inventar; testes T12-05 |
| Validação completa V4 sem estágio 8 | Validação parcial documentada; IMP-013 fecha |
| Overlap com roteamento do Núcleo | Entrada já “deliberativa”; F4 separado |
| Short-circuit T4 abusivo | Pós-condições mínimas obrigatórias (REQ-049) |

## 9. Rastreabilidade

| Elo | Ref. |
|-----|------|
| Fase IMP-010 | F2 |
| REQ | 049 (0–7), 048 |
| Anterior | IMP-011 |
| Seguinte | IMP-013 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Spec F2 — pipeline 0–7 | Em análise |
| 0.2 | 30/07/2026 | Engenheiro (Cursor) | Implementação + testes T12 | Aguarda validação conjunta Bloco 1 |

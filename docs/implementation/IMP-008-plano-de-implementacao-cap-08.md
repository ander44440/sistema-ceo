# IMP-008 — Plano e Execução de Implementação da CAP-08 (Planejamento Executivo)

> **Status: Homologado v1.0 — ENCERRADO (Deliberação CTO, 24/07/2026). Congelado — CAP-08 concluída.**  
> Versão 1.0 — 24/07/2026. Tipo IMP (ADR-012).  
> **Identificação:** IMP-008 (IMP-007 = CAP-07).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; ADR-015; VIS-006 Aprovada v1.0; REQ-035 Homologado v1.0; ARQ-011 Homologada v1.0; ARQ-008/009/010 preservadas.  
> Este documento **planejou e registrou** a materialização dos componentes **L** e **M** conforme ARQ-011.  
> **Cadeia obrigatória:** Analisar → Avaliar suficiência → Recomendar → Planejar → Executar (fora).  
> **Ciclo CAP-08:** **encerrado**. Relatório: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md).  
> Evidências: [`../cap-08/relatorio-implementacao-cap-08.md`](../cap-08/relatorio-implementacao-cap-08.md).  
> **Proibição:** **não** reabrir esta IMP sem novo ciclo formal.

---

## 1. Objeto

Implementar integralmente a ARQ-011, limitado ao escopo homologado:

1. Componente **L — Análise Executiva** (Objeto de Análise + suficiência)
2. Componente **M — Planejamento Executivo** (recomendação + plano)
3. Gate estrutural: M bloqueia recomendação se L insuficiente
4. Contratos Análise / Recomendação / Plano (`vigencia=proposta`)
5. Somente leitura sobre H, I e F
6. Fronteira de execução (MG2 fora)
7. Preservação das baselines MVP, CAP-05 e CAP-07

Sede: `docs/cap-08/` (extensão adjacente).

---

## 2. Etapas executadas

| Etapa | Conteúdo | Resultado |
|-------|----------|-----------|
| E1 | Componente L + contrato Análise | `analise-executiva.js` |
| E2 | Componente M + gate de suficiência + plano | `planejamento-executivo.js` |
| E3 | Testes RF-01…09 / cadeia / read-only | `cap08-planejamento.test.js` |
| E4 | Superfície mínima | `planejamento.html` |
| E5 | Validação técnica + evidências | relatório — **35 pass / 0 fail** (11 CAP-08 + 24 regressão) |

---

## 3. Critérios de sucesso do IMP

| # | Critério | Status |
|---|----------|--------|
| 1 | L e M materializados conforme ARQ-011 | Atendido |
| 2 | Contrato Análise (7 elementos + suficiência + confiança + justificativa) | Atendido |
| 3 | M bloqueia recomendação se insuficiente | Atendido |
| 4 | RF-01…09 cobertos por evidência de teste | Atendido |
| 5 | H/I/F não escritos por L/M | Atendido |
| 6 | Baselines MVP/CAP-05/07 não alteradas em código | Atendido |
| 7 | Cadeia Analisar→Suficiência→Recomendar→Planejar preservada | Atendido |
| 8 | CAP-08 **não** homologada por este IMP | Atendido |

---

## 4. Rastreabilidade

`REQ-035 → ARQ-011 → IMP-008 → docs/cap-08/* → evidências`

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará |
| Quando | 24/07/2026 |
| Por quê | Materializar CAP-08 após homologação da ARQ-011 |
| Baseado em quê | Deliberação CTO — ARQ-011 homologada e abertura IMP; REQ-035; ARQ-011 |
| Resultado | L/M implementados e testados (35/35); IMP-008 homologado e ENCERRADO; VAL-008 autorizada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação e execução da implementação L/M | Deliberação CTO — ARQ-011 homologada; abertura IMP | Em execução |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase IMP encerrada; fase VAL aberta (VAL-008) | Deliberação CTO — IMP-008 aprovada | **Homologado e ENCERRADO** |

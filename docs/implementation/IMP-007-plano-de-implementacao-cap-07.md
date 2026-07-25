# IMP-007 — Plano e Execução de Implementação da CAP-07 (Comunicação)

> **Status: Homologado v1.0 — ENCERRADO (Deliberação Final CTO, 24/07/2026). Baseline CAP-07 congelada; não reabrir.**  
> Versão 1.0 — 24/07/2026. Tipo IMP (ADR-012).  
> **Identificação:** IMP-007 (IMP-006 = CAP-05 — encerrado).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; ADR-015; VIS-005 Homologada v1.0; REQ-034 Homologado v1.0; ARQ-010 Homologada v1.0; ARQ-008/009 preservadas.  
> Este documento **planeja e registra** a materialização do componente **K** conforme ARQ-010.  
> **Proibição:** não altera H/I/F em comportamento; não modifica governança; não homologa a CAP-07; não abre VAL por este ato.  
> Evidências: [`../cap-07/relatorio-implementacao-cap-07.md`](../cap-07/relatorio-implementacao-cap-07.md).

---

## 1. Objeto

Implementar integralmente a ARQ-010:

1. Componente **K — Comunicação Executiva**
2. Contrato de **Mensagem**
3. Síntese por padrão
4. Detalhe sob demanda
5. Transparência (origem / ausência / limitação) e vigência (proposta ≠ vigente)
6. Somente leitura sobre H, I e F
7. Preservação das baselines MVP e CAP-05

Sede: `docs/cap-07/` (extensão adjacente — não altera `docs/mvp/` nem o código de `docs/cap-05/`).

---

## 2. Etapas executadas

| Etapa | Conteúdo | Resultado |
|-------|----------|-----------|
| E1 | Componente K + contrato Mensagem + tipos | `comunicacao-executiva.js` |
| E2 | Síntese, detalhe sob demanda, transparência, vigência | API `montarMensagem` / `expandirDetalhe` |
| E3 | Garantia read-only H/I/F + testes | `comunicacao-executiva.test.js` |
| E4 | Superfície mínima de expressão | `comunicacao.html` |
| E5 | Validação técnica + evidências | [`../cap-07/relatorio-implementacao-cap-07.md`](../cap-07/relatorio-implementacao-cap-07.md) — **24 pass / 0 fail** |

---

## 3. Critérios de sucesso do IMP

| # | Critério | Status |
|---|----------|--------|
| 1 | K materializado conforme ARQ-010 | Atendido |
| 2 | Contrato Mensagem (síntese, detalhe, transparência, vigência, fontes) | Atendido |
| 3 | RF-01…06 cobertos por evidência de teste | Atendido (10 testes CAP-07) |
| 4 | RNF-01…04 amostrados / verificados | Atendido (RNF-04 automatizado; demais por inspeção de contrato) |
| 5 | H/I/F não escritos por K | Atendido |
| 6 | Baselines MVP/CAP-05 não alteradas em código | Atendido (+ 14 testes CAP-05) |
| 7 | CAP-07 **não** homologada por este IMP | Atendido |

---

## 4. Rastreabilidade

`REQ-034 → ARQ-010 → IMP-007 → docs/cap-07/* → evidências`

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará |
| Quando | 24/07/2026 |
| Por quê | Materializar CAP-07 após homologação da ARQ-010 |
| Baseado em quê | Deliberação CTO — ARQ-010 homologada e abertura IMP; REQ-034; ARQ-010 |
| Resultado | K implementado e testado (24/24); VAL-007 aprovada; CAP-07 homologada v1.0 e congelada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação e execução da implementação do componente K | Deliberação CTO — ARQ-010 homologada; abertura IMP | Em execução |
| 0.2 | 24/07/2026 | Engenheiro (Cursor) | Registro de validação técnica (24/24) e evidências | Execução IMP-007 | Submetido ao CTO |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação e encerramento; baseline CAP-07 congelada | Deliberação Final CTO — VAL-007 aprovada; CAP-07 v1.0 | **Homologado e ENCERRADO** |

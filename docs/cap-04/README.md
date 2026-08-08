# CAP-04 — Gestão do Conhecimento (Camada)

> **Status: Homologada e concluída — Baseline oficial do Sistema CEO (Despacho CTO, 07/08/2026).**  
> **Marco arquitectural:** A Capacidade de Conhecimento integra **definitivamente** a arquitectura operacional do Sistema CEO.  
> **Ciclo CAP-04:** **ENCERRADO**.  
> Rastreabilidade: **ARQ-031** → CAP-04 → **REQ-070…074** → **IMP-070** → **VAL-IMP-070** → Homologação → **Baseline**.  
> Sede deste README. Runtime: `app/src/camadaConhecimento/`.  
> **Congelado:** ARQ-031 · CAP-04 · REQ-070…074 · IMP-070.  
> **Modo:** maturidade por evidências — evoluções só com uso real; priorizar utilização operacional.  
> Relatório: [`relatorio-encerramento-cap-04-camada.md`](relatorio-encerramento-cap-04-camada.md).

---

## Cadeia oficial

| Elo | Artefacto | Estado |
|-----|-----------|--------|
| ARQ | [`ARQ-031`](../architecture/ARQ-031-capacidade-de-conhecimento.md) | Homologada · **congelada** |
| CAP | este ciclo Camada | **Baseline** |
| REQs | REQ-070…074 | Aprovados · **congelados** |
| IMP | [`IMP-070`](../implementation/IMP-070-capacidade-de-conhecimento-camada.md) | **HOMOLOGADA / ENCERRADA** |
| VAL | [`VAL-IMP-070`](../validation/VAL-IMP-070.md) | **Homologada** |
| Blocos | VAL-B1…B5 | Homologados |

Ciclo documental prévio (sede acervo): IMP-004 E1+E2 — infraestrutura `docs/knowledge/`; **não** substitui esta Baseline de Camada.

---

## Componentes (baseline runtime)

| Bloco | REQ | Módulo |
|-------|-----|--------|
| B1 Fonte Oficial | REQ-070 | `fonteOficial.js` |
| B2 Limites | REQ-073 | `limitesAdmissao.js` |
| B3 Governação | REQ-074 | `governancaAcervo.js` |
| B4 Actualização | REQ-071 | `atualizacaoAcervo.js` |
| B5 Porta EIC | REQ-072 | `portaRecuperacao.js` |
| B6 Fecho | conjunto | `imp070.integracao.test.js` |

Consumidores via Porta: `mre/integracaoNucleo.js`, `executiveEngine/promptGovernanca.js`.  
Projecção subordinada: `executiveEngine/briefingsProjeto.js`.

---

## Evidências

| Acto | Documento |
|------|-----------|
| Abertura ciclo | [`CAP-04-abertura-ciclo-camada-conhecimento.md`](CAP-04-abertura-ciclo-camada-conhecimento.md) |
| Fecho IMP | [`../implementation/evidencias/IMP-070-fecho-b6.md`](../implementation/evidencias/IMP-070-fecho-b6.md) |
| VAL integrada | [`../validation/VAL-IMP-070.md`](../validation/VAL-IMP-070.md) |
| Encerramento | [`relatorio-encerramento-cap-04-camada.md`](relatorio-encerramento-cap-04-camada.md) |
| MO | [`../learning/2026-08-07-encerramento-imp-070-baseline-cap-04.md`](../learning/2026-08-07-encerramento-imp-070-baseline-cap-04.md) |

---

## Verificação (baseline)

```powershell
node --test "app/src/camadaConhecimento/*.test.js"
```

Resultado de referência (07/08/2026): **33/33 pass**.

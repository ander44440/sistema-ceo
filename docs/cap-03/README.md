# CAP-03 — Gestão de Contextos Operacionais (COA)

> **Status: Homologada e concluída — v1.0 (Gate Final CTO, 26/07/2026). Baseline oficial do Sistema CEO.**  
> Data: 26/07/2026.  
> Rastreabilidade: VIS-007 → REQ-036…044 → ARQ-012 → IMP-009 → VAL-003.  
> Sede adjacente ao MVP (`docs/mvp/` **não** alterado — D8).  
> **Baselines E1–E8:** congeladas.  
> **Rastreabilidade oficial:** E4 → REQ-042 · E5 → REQ-040 · E6 → REQ-041 · E7 → REQ-043 · E8 → REQ-044.  
> Relatório de Encerramento: [`relatorio-encerramento-cap-03.md`](relatorio-encerramento-cap-03.md).  
> VAL-003: [`../validation/VAL-003-validacao-integrada-cap-03.md`](../validation/VAL-003-validacao-integrada-cap-03.md) · Relatório: [`val-003-relatorio-consolidado.md`](val-003-relatorio-consolidado.md).  
> OE arquivadas: [`oportunidades-evolucao-arquivadas.md`](oportunidades-evolucao-arquivadas.md).  
> **Proibição:** não reabrir REQ/ARQ/IMP/VAL sem novo ciclo formal.

---

## Componentes (progresso)

| ID | Componente | Arquivo | Etapa IMP |
|----|------------|---------|-----------|
| N + RepoCOA | Catálogo | [`catalogo-coa.js`](catalogo-coa.js) | **E1 ✅** |
| O + RepoSessão | Sessão | [`sessao-coa.js`](sessao-coa.js) | **E2 ✅** |
| P + RepoOperacional | Isolamento | [`politica-isolamento.js`](politica-isolamento.js) | **E3 ✅** |
| N-UI | Tela Projetos (**REQ-042**) | [`tela-projetos.js`](tela-projetos.js) · [`projetos.html`](projetos.html) | **E4 ✅** |
| Q | Home (**REQ-040**) | [`home-executiva.js`](home-executiva.js) | **E5 ✅** |
| R | Conversa (**REQ-041**) | [`conversa-executiva.js`](conversa-executiva.js) · [`home.html`](home.html) | **E6 ✅** |
| T | Navegação (**REQ-043**) | [`navegacao.js`](navegacao.js) · [`menu-inferior.js`](menu-inferior.js) · [`conversas.html`](conversas.html) · [`memoria.html`](memoria.html) · [`configuracoes.html`](configuracoes.html) | **E7 ✅** |
| S | Migração (**REQ-044**) | [`migracao-mg2.js`](migracao-mg2.js) · [`inventario-mvp-mg2.js`](inventario-mvp-mg2.js) | **E8 ✅** |

## Evidências

| Etapa | Documento |
|-------|-----------|
| E1–E8 | Homologadas — **IMP-009 encerrada** |
| E6 proposta | [`e6-proposta-tecnica.md`](e6-proposta-tecnica.md) — Aprovada |
| E6 | [`e6-evidencias.md`](e6-evidencias.md) — Homologada |
| E7 proposta | [`e7-proposta-tecnica.md`](e7-proposta-tecnica.md) — Aprovada |
| E7 | [`e7-evidencias.md`](e7-evidencias.md) — Homologada |
| E8 proposta | [`e8-proposta-tecnica.md`](e8-proposta-tecnica.md) — Aprovada |
| E8 | [`e8-evidencias.md`](e8-evidencias.md) — Homologada |
| VAL-003 | [`../validation/VAL-003-validacao-integrada-cap-03.md`](../validation/VAL-003-validacao-integrada-cap-03.md) — Homologada / ENCERRADA |
| Relatório VAL | [`val-003-relatorio-consolidado.md`](val-003-relatorio-consolidado.md) — 36 C / 0 NC / 3 OE |
| Encerramento | [`relatorio-encerramento-cap-03.md`](relatorio-encerramento-cap-03.md) — Oficial |

## Verificação

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js" "docs/cap-03/home-executiva.test.js" "docs/cap-03/conversa-executiva.test.js" "docs/cap-03/navegacao.test.js" "docs/cap-03/migracao-mg2.test.js"
```

Resultado atual: **72 testes, 72 aprovados, 0 falhas.**

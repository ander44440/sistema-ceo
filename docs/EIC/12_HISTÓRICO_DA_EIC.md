# 12 — Histórico da EIC

> **Status:** BLOCO 4 — Memória consolidada (pronta para homologação geral)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Memória organizacional da disciplina — factos da Fase 1 e Fase 2 (conteúdo). Sem impacto no produto.  
> **Fontes:** Comandos do patrocinador 03/08/2026; Marco Zero; BLOCOS 1–4; Âncora Mestra (continuidade).

## Objetivo

Manter o histórico oficial da EIC: marcos documentais, decisões e mudanças de estado da Fase 1 (estrutura) e da Fase 2 (conteúdo por blocos).

## Finalidade

Rastreio temporal Art. 8º. Navegação actual → [`ÍNDICE.md`](ÍNDICE.md). Encerramento estrutural → [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md).

---

## 1. Convenções de registo

| Campo | Uso |
|-------|-----|
| Data | Dia do marco (UTC-3 / projecto) |
| Marco | Nome curto |
| Resultado | O que ficou oficial |
| Base | Comando / norma / documento |

Não se reescreve o passado: correcções entram como nova linha.

---

## 2. Marcos documentais

### Fase 1 — Estrutura documental

| Data | Marco | Resultado | Base |
|------|-------|-----------|------|
| 03/08/2026 | Abertura `docs/EIC/` | Pasta oficial criada | Comando patrocinador |
| 03/08/2026 | Esqueleto 00–06 | Primeiros documentos estruturais | Comando EIC |
| 03/08/2026 | Expansão 07–12 | Estrutura completa de suporte | Comando EIC |
| 03/08/2026 | Auditoria + `ÍNDICE.md` | Padrão único; porta de entrada | Comando auditoria |
| 03/08/2026 | **Marco Zero** (`13`) | Fase 1 **encerrada**; estrutura congelada | Comando Marco Zero |

### Fase 2 — Desenvolvimento de conteúdo (por blocos)

| Data | Marco | Resultado | Base |
|------|-------|-----------|------|
| 03/08/2026 | **BLOCO 1 — Identidade** | `00`, `01`, `06`, `13` consolidados | Comando BLOCO 1 |
| 03/08/2026 | **BLOCO 2 — Engenharia** | `02`, `03`, `07`, `09`, `10` consolidados | Comando BLOCO 2 |
| 03/08/2026 | **BLOCO 3 — Qualidade** | `04`, `05`, `11` consolidados | Comando BLOCO 3 |
| 03/08/2026 | **BLOCO 4 — Governança** | `08`, `12`, `ÍNDICE` consolidados | Comando BLOCO 4 |

---

## 3. Decisões relevantes

| Decisão | Resultado |
|---------|-----------|
| EIC desacoplada do runtime | Código/prompts/comportamento intocados até G-EIC-D |
| Conteúdo = consolidação | Sem conceitos novos; só CON/VIS/ARQ/ADR/PX/CAP + EIC |
| Relação com Âncora Mestra | Complementar; Âncora sem efeito normativo sobre CON/ADR |
| CA/NA e SC-* | Restatements de ARQ-018 / PX-003 E4 / CON — não critérios inventados |
| Homologação geral | Documentação pronta; aguarda aprovação do patrocinador |

---

## 4. Mudanças de status (síntese)

| Documento | De | Para (BLOCO 4) |
|-----------|-----|----------------|
| 00, 01, 06 | Estrutura → BLOCO 1 | Identidade consolidada |
| 02, 03, 07, 09, 10 | Estrutura/ordem → BLOCO 2 | Engenharia consolidada |
| 04, 05, 11 | Estrutura → BLOCO 3 | Qualidade consolidada |
| 08, 12, Índice | Estrutura → BLOCO 4 | Governança / memória / índice actualizados |
| 13 | Marco Zero | Fase 1 encerrada + registo BLOCO 1 |

Detalhe actual: [`ÍNDICE.md`](ÍNDICE.md).

---

## 5. Referências cruzadas (memória)

| Artefacto | Papel |
|-----------|--------|
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Encerramento Fase 1 |
| [`03_ROADMAP.md`](03_ROADMAP.md) | M0–M9 / Ondas / Gates |
| [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md) | Autoridade |
| [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Aceite |
| `docs/learning/ANCORA-MESTRA.md` | Continuidade operacional do produto |

---

## 6. Linha do tempo

```text
03/08/2026
  │
  ├─ Fase 1: estrutura 00–12 + Índice + auditoria
  ├─ Marco Zero (13) — Fase 1 ENCERRADA
  │
  └─ Fase 2 (conteúdo documental):
        BLOCO 1 Identidade
        BLOCO 2 Engenharia
        BLOCO 3 Qualidade
        BLOCO 4 Governança  ← documentação EIC CONCLUÍDA (aguarda homologação geral)
```

**Não ocorrido neste histórico:** G-EIC-D, alteração de código/prompts, execução SC-* em produto.

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`ÍNDICE.md`](ÍNDICE.md) | Estado actual de todos os docs |
| [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md) | Quem autoriza |
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Fase 1 |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 4 — Fase 1+2 registadas | Memória oficial; doc EIC concluída |

---

**Estado:** BLOCO 4 — histórico consolidado. Documentação EIC concluída (aguarda homologação geral). Sem impacto no produto.

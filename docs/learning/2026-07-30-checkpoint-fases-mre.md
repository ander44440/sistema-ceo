# Checkpoint — Estado das fases do Motor de Raciocínio Executivo (MRE)

> **O que é?** Mapa único de orientação: onde estamos, o que já está feito, o que falta.  
> **Por que existe?** Reorientar CTO/Engenheiro/Patrocinador sem depender do histórico de chat.  
> **Para quem?** CTO (ChatGPT), Engenheiro (Cursor), Patrocinador.  
> **Sucesso:** Qualquer papel responde em &lt;1 min: fase atual, próximo gate, o que **não** fazer.  
> **Data:** 30/07/2026 · **Autor do registo:** Engenheiro (Cursor), a pedido do Patrocinador  
> **Atualização:** 30/07/2026 — IMP-020 NCS B1–B4 (C1–C8) materializados; produção NCS **não** declarada.

---

## 1. Resposta em uma frase

**MRE em PRODUÇÃO AUTORIZADA (regime R1).** IMP-020 NCS **implementada** (B1–B4 / C1–C8) com `flagNcs` **off** (baseline); produção NCS aguarda Gate explícito.

---

## 2. Mapa das fases (não confundir)

```text
MODELAGEM MRE (encerrada)
  ADR-019  → institui MRE
  REQ-048…051 → Parecer / pipeline / Speaker / Aprendizado   ✅ Aprovadas
  ARQ-013  → consolidação                                    ✅ Homologada

PLANO + IMPLEMENTAÇÃO MRE BASELINE
  IMP-010…019 / Blocos 1–3                                   ✅ Código + VAL-009 Homologada
  Produção R1                                                ✅ AUTORIZADA (P10 · 30/07/2026)
  Monitoramento R1                                           ⏳ Diário / uso real

NCS (Natureza Cognitiva da Solicitação) — ciclo atual
  VIS-008 / REQ-052 / ARQ-014                                📄 Rascunhos (norma superior à IMP)
  IMP-020 plano + blocos B1–B4                               ✅ C1–C8 materializados
    B1 C1/C3/C4  ✅   B2 C2  ✅   B3 C5/C6  ✅   B4 C7/C8  ✅
  flagNcs.ativo                                              ❌ off (default seguro)
  Produção NCS                                               ⛔ NÃO declarada — exige Gate
```

---

## 3. Tabela de status (fonte rápida)

| Artefato | Papel | Status |
|----------|--------|--------|
| ADR-019 / ARQ-013 | MRE baseline | Aceites — não alterar sem Gate |
| REQ-048…051 | Requisitos MRE | **Aprovadas** |
| IMP-010…019 | Implementação MRE | **Feitas** + VAL-009 Homologada |
| Produção MRE R1 | Uso deliberativo | **Autorizada** (`flagMre` on) |
| VIS-008 / REQ-052 / ARQ-014 | Norma NCS | Rascunhos — origem da IMP-020 |
| IMP-020 | NCS no limiar MRE | **B1–B4 feitos** (C1–C8) |
| `flagNcs` | Ativação NCS | **off** (rollback = manter/desligar) |
| Produção NCS | Limiar em R1 | **Não** — só com Gate do Patrocinador |

---

## 4. Evidências de testes

| Bloco | Comando | Resultado | Relatório |
|-------|---------|-----------|-----------|
| MRE 1–3 | `npm run test:mre:bloco{1,2,3}` | 33+12+14 | evidências BLOCO-* |
| NCS B1–B4 | `npm run test:mre:ncs` | **37 pass** | `IMP-020-B{1..4}-evidencia.md` |
| Suíte total | `npm run test:mre` | **96 pass / 0 fail** | — |

Código: `app/src/mre/` · NCS: `app/src/mre/ncs/`.

---

## 5. O que o fluxo faz hoje

```text
Mensagem
  → Núcleo classifica
  → se determinístico → caminho antigo, SEM MRE
  → se deliberativo e flagMre on → MRE (0–8) → ParecerExecutivo
       → se flagNcs on: Classificador NCS → Pacote imutável → políticas 2–7
                        → metadados NCS no parecer (C7)
       → se flagNcs off: baseline pré-IMP-020 (sem limiar automático)
       → Speaker → ComunicadoExecutivo → Chat / Voice / Centro
```

| Flag | Ficheiro | Default | Rollback |
|------|----------|---------|----------|
| `flagMre` | `roteamentoDeliberativo.js` | **on** | `ativo = false` → sem MRE |
| `flagNcs` | `ncs/flagNcs.js` | **off** | `desligarNcs()` / `ativo = false` |

---

## 6. O que NÃO fazer agora

1. **Não** declarar produção NCS nem ligar `flagNcs` em R1 sem Gate explícito do Patrocinador.  
2. **Não** reabrir ARQ-014 / REQ-052 / topologia 0–8 / Speaker / V1–V6.  
3. **Não** alterar ADR-019 nem REQ-048…051 sem Gate.  
4. **Não** misturar prosa de utilizador dentro do Reasoner (Speaker só comunica).  
5. **Não** aplicar princípios automaticamente (H1 / REQ-051).  
6. **Não** implementar «parecer consultivo vs ação» sob este tema — só insumo: [`2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md`](2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md).

---

## 7. Próximo passo recomendado

1. **CTO + Patrocinador:** rever fecho IMP-020 (evidências B1–B4; critérios §11).  
2. Decidir se/quando ativar `flagNcs` (ensaio → Gate → produção NCS).  
3. Continuar **monitoramento R1** do MRE no uso diário MG2.  
4. VAL formal NCS só após mandato — não inventar produção.  
5. Lacuna consultivo/ação: **aguardar autorização** para VIS→REQ→ARQ (não abrir IMP agora).

---

## 8. Mensagem pronta para colar no chat do CTO

```text
CHECKPOINT CEO / MRE+NCS (30/07/2026) — leia docs/learning/2026-07-30-checkpoint-fases-mre.md

Estado:
- MRE baseline: PRODUÇÃO R1 autorizada (VAL-009 / P10).
- IMP-020 NCS: B1–B4 (C1–C8) IMPLEMENTADOS — suite test:mre 96+ pass.
- flagNcs: OFF (default). Produção NCS: NÃO declarada.
- Rollback NCS: desligarNcs() / flagNcs.ativo = false.
- Insumo produto (sem IMP): parecer consultivo vs ação executiva —
  docs/learning/2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md

Pedido: rever fecho IMP-020; só ativar flagNcs com Gate do Patrocinador;
não implementar o tema consultivo/ação sem novo ciclo VIS→REQ→ARQ.
```

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Patrocinador pediu; Engenheiro registrou | Checkpoint inicial MRE |
| 30/07/2026 | Engenheiro (P10) | Produção R1 autorizada |
| 30/07/2026 | Engenheiro (pós B4) | IMP-020 B1–B4; flagNcs off; 96 testes |
| 30/07/2026 | Engenheiro | Aponta insumo parecer consultivo vs ação (sem implementação) |

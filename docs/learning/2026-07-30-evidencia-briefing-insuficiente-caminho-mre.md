# Evidência de uso — Briefing Curado insuficiente no caminho MRE (30/07/2026)

> **O que é?** Evidência operacional pós-Gate Opção A: o CEO **ainda não demonstra** lastro do MG2 nas deliberações MRE.  
> **Por que existe?** Diretriz do parecer final CTO: recolher evidências; reabrir arquitetura **só** se a mitigação A for insuficiente.  
> **Para quem?** Patrocinador; CTO (deliberação Opção B ou mitigação pontual).  
> **Status:** Evidência pré-B1 — **B1 autorizado e implementado** · [`2026-07-30-b1-briefing-entrada-mre-autorizado.md`](./2026-07-30-b1-briefing-entrada-mre-autorizado.md)  
> **Relacionados:** Gate encerrado [`2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](./2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md); OE-01 no parecer técnico; diagnóstico TLS [`2026-07-30-diagnostico-falha-llm-tls-mre.md`](./2026-07-30-diagnostico-falha-llm-tls-mre.md).

---

## 1. Contexto de sessão (Patrocinador)

| # | Utilizador | Resposta CEO (síntese) |
|---|------------|-------------------------|
| 1 | `PROJETO MG2` | OK — ativa COA «Motoboy Game 2» (rota **projetos**, não MRE) |
| 2 | `DÊ UM DIAGNÓSTICO DESTE PROJETO.` | MRE → **delegar** recolha genérica de viabilidade — **sem** factos do briefing |
| 3 | `O QUÊ VOCÊ SABE SOBRE ESTE PROJETO?` | MRE → **solicitar_dados** / «Informação essencial não especificada» — **sem** WorldLab2, perf, outdoors, DEC-MVP-001, etc. |

Pré-condição técnica: LLM já operacional após mitigação TLS (`CEO_LLM_TLS_INSECURE=1`). A falha **não** é rede/SSL nesta evidência.

---

## 2. Diagnóstico técnico (Engenheiro)

1. Briefing Curado v1.0 existe e o espelho `briefingsProjeto.js` alimenta **`montarMensagensLlm`** (caminho legado / conversa não-MRE).  
2. Perguntas de diagnóstico/conhecimento sobre o projeto ativo caem em **`deliberar*` / MRE**.  
3. `montarEntradaMre` monta `factosOficiais` só a partir de memória/painel (próximo passo, pendências) — **não** inclui o Briefing Curado.  
4. O dossier MRE fica pobre → decisão `solicitar_dados` / `delegar` genérico.  
5. Isto **confirma OE-01**: Briefing na camada de contexto ≠ lastro na camada deliberativa.

**Conclusão:** a Opção A **mitigou o artefacto** e a conversa legado; **não** resolve o uso diário quando a intenção segue pelo MRE — que é o caminho dominante para “diagnóstico / o que sabes”.

---

## 3. Classificação face ao Gate

| Afirmação do Gate | Estado agora |
|-------------------|--------------|
| Mitigação A em uso | Sim (briefing publicado) |
| Evidências de insuficiência? | **Sim — esta peça** |
| Autorização para alterar MRE/Speaker? | **Não** (ainda) |
| Reabrir discussão arquitetural? | **Pedido ao CTO** (abaixo) |

---

## 4. Opções pedidas ao CTO

| Opção | Descrição |
|-------|-----------|
| **B1 (mínima)** | Núcleo/contexto: ao montar entrada MRE, injetar resumo do Briefing Curado em `factosOficiais` / dossier — **sem** mudar Speaker nem lógica deliberativa; conhecimento continua a nascer no contexto. |
| **B2** | Ciclo formal VIS→REQ→ARQ para ligação estrutural COA↔conhecimento↔MRE. |
| **B0** | Manter A; aceitar que perguntas MRE continuam “cegas” até B1/B2. |

Recomendação Engenheiro: **B1 agora** (desbloqueia uso diário), **B2** se o padrão se repetir noutros COAs.

---

## 5. Texto curto para o CTO

```text
CTO — Evidência pós-Gate Opção A (30/07/2026).

Após TLS OK, o Patrocinador perguntou diagnóstico / “o que sabes” do MG2.
O MRE responde solicitar_dados / delegar genérico — sem factos do Briefing Curado.

Conclusão: Opção A insuficiente no caminho deliberativo (confirma OE-01).

Pedido: autorizar B1 (injetar briefing na entrada MRE via camada de contexto)
e/ou abrir B2 (VIS→REQ→ARQ)?

Evidência: docs/learning/2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md
```

---

## 6. Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (uso); Engenheiro (registo e diagnóstico) |
| Quando | 30/07/2026 |
| Por quê | Demonstrar insuficiência da mitigação A no MRE |
| Baseado em quê | Sessão Conversa; Gate A encerrado; OE-01; código `montarEntradaMre` / `briefingsProjeto` |
| Resultado | Evidência formal; **aguarda deliberação CTO** (B0/B1/B2) |

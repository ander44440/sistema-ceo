# DESP-005 — Calibração da capacidade de antecipação

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Precedente:** DESP-004 **HOMOLOGADO**  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

O CEO já pensa, conversa, decide e planeja. Faltava **antecipar** riscos, dependências e oportunidades com evidência — sem ser intrusivo.

---

## Antes / Depois

| | Antes | Depois |
|---|-------|--------|
| Riscos | Só no plano ou omitidos | «Antecipo risco…» + pergunta de controlo |
| Pendências | Só pergunta D | Prosa N + «agora ou depois?» |
| Sem evidência | — | Sem antecipação |
| Controlo | Autorização genérica | Utilizador escolhe se trata já |

---

## Refinamento

`antecipacaoExecutiva.js` — no máximo um sinal/turno a partir de riscos, dependências, oportunidades, pendências ou próxima acção já presentes no contexto.

Camada **N** na CN (após decisão, antes da pergunta).

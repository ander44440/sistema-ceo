# CTO-001 — Preservação da Missão sob Incerteza

> **Status:** **HOMOLOGADO / ENCERRADO** — 06/08/2026 (CTO).  
> **Natureza:** Refinamento comportamental de experiência — integra a **Baseline** do Sistema CEO.  
> **Origem:** Evidência de uso real; autorização e homologação do CTO.  
> **Código:** `app/src/classificadorIntencao/preservarMissao.js` · `destinos.js` (`executarDestinoClarificacao`).  
> **Testes:** `preservarMissao.test.js` — **8/8**.  
> **Capacidade:** CAP-07 (comportamento conversacional) — **sem** CAP nova.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Refinamento que, sob baixa confiança do classificador, preserva a missão activa em vez de expor o motor interno. |
| **Por que existe?** | Em uso real, a clarificação por menu (Job / deliberar / comando operacional) quebrava o fluxo e a percepção de inteligência executiva. |
| **Para quem existe?** | Utilizador em missão; CTO (baseline de experiência); Engenheiro (diretriz permanente). |
| **Como medir sucesso?** | Em missão activa, nenhuma resposta de baixa confiança exige reinício de contexto; prosa sem jargão interno. |

---

## 1. Problema (evidência)

Sob baixa confiança, o destino `clarificacao` perguntava se o utilizador queria «deliberar», «Job» ou «comando operacional» — abandonava a missão e expunha conceitos internos.

## 2. Diagnóstico homologado

A causa raiz **não** estava no classificador (limiar / pontuação).  
Estava na **estratégia de recuperação após a incerteza**.

| Antes | Depois (CTO-001) |
|-------|------------------|
| Recuperar a classificação | Recuperar a **missão** |
| Menu de arquitectura interna | Hipótese contextual / confirmação natural |

## 3. Refinamentos homologados

1. Preservação automática da missão activa (continuidade via C2 quando há lastro/histórico).  
2. Recuperação por hipótese contextual.  
3. Confirmação em linguagem natural (sem missão clara).  
4. Eliminação da exposição de Job, Deliberação, Comando Operacional (e afins).  
5. Continuidade da experiência executiva.

## 4. Aderência (Gate CTO)

| Item | Estado |
|------|--------|
| Nova capacidade | **Não** |
| Alteração arquitectural | **Não** |
| Alteração Executive Engine | **Não** |
| Alteração Baseline EIC (regras C1–C4) | **Não** |
| Natureza | Exclusivamente **comportamental** |

## 5. Diretriz permanente (lição de engenharia)

> **Diante da dúvida, preservar a missão é mais importante do que explicar o funcionamento interno do sistema.**

Qualquer clarificação futura ao utilizador deve obedecer a esta diretriz: hipótese / confirmação em prosa natural; nunca menu de mecanismos internos.

## 6. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (homologação); Engenheiro (implementação) |
| Quando | 06/08/2026 |
| O quê | CTO-001 — preservação da missão sob incerteza |
| Por quê | Evidência de uso real; quebra de experiência em missão |
| Resultado | **Homologado / Encerrado** — integra Baseline de experiência |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro | Implementação + testes 8/8 | Implementada |
| 1.0 | 06/08/2026 | CTO | Homologação + diretriz permanente | **Homologado / Encerrado** |

# CTO-003 — Persistência do Estado Operacional

> **Status:** **HOMOLOGADO / ENCERRADO** — 06/08/2026 (CTO).  
> **Baseline:** Incorporado oficialmente — **referência = interceptação pré-classificador**.  
> **Frente:** **ENCERRADA** — sem refinamentos adicionais sem novas evidências de uso real.  
> **Natureza:** Refinamento comportamental de experiência.  
> **Código canónico:** `interceptacaoOperacional.js` · `estadoOperacional.js` · `executiveEngine/index.js` (invariante de posição) · `disciplinaExecutiva.js` · `preservarMissao.js` · `destinos.js`.  
> **Validação prática (oficial):** `cto003.validacao-pratica.test.js` · `2026-08-06-cto-003-validacao-pratica-invariante.md`.  
> **Capacidade:** CAP-07 — **sem** CAP nova.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Persistência do estado operacional + modo **RECUPERAR**, com **Interceptação Operacional** antes do classificador. |
| **Por que existe?** | Com Job aberto, o CEO regressava a deliberação; a lógica CTO-003 na prosa pós-classificador era insuficiente. |
| **Para quem existe?** | Utilizador em missão operacional; CTO (baseline); Engenheiro. |
| **Como medir sucesso?** | Com operação aberta, comandos operacionais vão ao Motor sem classificador e sem prosa deliberativa. |

---

## 1. Invariante arquitectural (obrigatório)

```
Continuidade Gate
  → ★ Interceptação Operacional (CTO-003)     ← posição fixa
  → VCA / CSC / Classificador / CN
```

A Interceptação Operacional **deve** permanecer imediatamente após o Continuidade Gate e antes de qualquer etapa de classificação, VCA, CSC ou interpretação conversacional deliberativa.

---

## 2. Três estados executivos (Baseline)

| Modo | Objectivo |
|------|-----------|
| **DELIBERAR** | Pensar |
| **EXECUTAR** | Executar |
| **RECUPERAR** | Restabelecer execução interrompida |

## 3. Regras permanentes

1. Job activo > classificador.  
2. Em recuperação: não reclassificar missão.  
3. Comandos (`enviar` / `reenviar` / `repita` / `forçar` / `cancelar` / `pausar` / `continuar` / `estado`) → Job activo / Motor.  
4. Proibido perguntar prioridade / objectivo / «quer deliberar?» com operação aberta.  
5. Agent erro / Job falhado recente → **RECUPERAR**.

## 4. Evolução da Baseline

| Versão | Conteúdo | Estado |
|--------|----------|--------|
| 1.0 | Camada CN / clarificação pós-classificador | Superada |
| **1.2** | **Interceptação pré-classificador (invariante)** | **Referência oficial** |

Ver: `2026-08-06-cto-003-inconsistencia-pipeline.md` · `2026-08-06-cto-003-validacao-pratica-invariante.md`.

## 5. Congelamento

Sem refinamentos adicionais nesta frente sem novas evidências de uso real.

## 6. Diretriz permanente

> **Enquanto existir operação aberta, comandos operacionais não passam pelo classificador. A decisão operacional ocorre antes do interpretador conversacional.**

## 7. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO; Engenheiro |
| Quando | 06/08/2026 |
| O quê | CTO-003 — estado operacional + interceptação pré-classificador |
| Resultado | **Homologado / Encerrado** — Baseline (ref. 1.2) |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro | Implementação CN/destino | Implementada |
| 1.0 | 06/08/2026 | CTO | Homologação prática + Baseline | Homologado |
| 1.1 | 06/08/2026 | CTO | Frente ENCERRADA | Encerrado |
| 1.2 | 06/08/2026 | CTO / Engenheiro | Correção pipeline + validação prática; **substitui 1.0** | **Referência oficial** |

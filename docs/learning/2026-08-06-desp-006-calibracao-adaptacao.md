# DESP-006 — Calibração da capacidade de adaptação

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline da Capacidade de Conversação  
> **Precedente:** DESP-005 **HOMOLOGADO**  
> **Restrições:** sem novas capacidades; sem alterar arquitectura/governação

---

## Problema

O CEO já pensa, conversa, decide, planeja e antecipa. Faltava **adaptar** profundidade, detalhe e modo de condução ao momento da conversa — e manter coerência quando a intenção muda.

---

## Antes / Depois

| | Antes | Depois |
|---|-------|--------|
| Confirmação («ok») | Mesma profundidade que deliberação completa | Modo `rapido`: decisão + pergunta; sem plano/antecipação/síntese |
| «Porquê / explica» | Profundidade indiferente | Modo `detalhe`: preserva síntese e camadas |
| Mudança de assunto | Transição pontual | Modo `mudanca`: âncora do objectivo; sem fecho/oportunidade leve |
| Exploração | Podia fechar com muleta | Modo `exploratorio`: sem fecho F; mantém condução |
| Execução | Síntese sempre | Modo `execucao`: omite síntese longa se confiança alta |
| Bloqueio | Plano/antecipação possíveis | Modo `bloqueio`: só o necessário para desbloquear |

---

## Refinamento

`adaptacaoConversacional.js` — detecta modo a partir de instrução, `pediuDetalhe`, shift de tópico/objectivo e estado do parecer; adapta camadas CN e ordem de composição.

Integração em `compor.js` / `contextoImediato.js` (`eventoObjectivo`).

Modos: `rapido` · `exploratorio` · `detalhe` · `execucao` · `mudanca` · `bloqueio` · `padrao` · `compacto`.

---

## Validação

| Suite | Resultado |
|-------|-----------|
| `test:cn` | **47/47** |
| `test:continuidade-gate:e4` | **7/7** |
| `test:refino-eic` | **13/13** |

---

## Aderência

- nenhuma nova capacidade;
- nenhuma alteração arquitectural;
- nenhuma alteração de governação;
- refinamento exclusivamente comportamental (camadas/ordem da CN).

---

## Ficheiros

| Ficheiro | Papel |
|----------|--------|
| `app/src/conversacaoNatural/adaptacaoConversacional.js` | Detecção + adaptação |
| `app/src/conversacaoNatural/adaptacaoConversacional.test.js` | Unitários DESP-006 |
| `app/src/conversacaoNatural/compor.js` | Aplica modo na deliberação |
| `app/src/conversacaoNatural/contextoImediato.js` | Expõe `eventoObjectivo` |
| `app/src/conversacaoNatural/index.js` | Propaga `modoAdaptacao` |
| `app/src/conversacaoNatural/conversacaoNatural.test.js` | Integração DESP-006 |
| `app/package.json` | `test:cn` inclui novo ficheiro |

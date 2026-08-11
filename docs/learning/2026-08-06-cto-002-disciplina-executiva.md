# CTO-002 — Disciplina Executiva (Deliberar / Executar)

> **Status:** **IMPLEMENTADO** — aguarda homologação CTO.  
> **Natureza:** Refinamento comportamental de experiência — Baseline do Sistema CEO.  
> **Origem:** Evidência de uso real (missão MG2 / dispatcher); autorização CTO-002.  
> **Código:** `disciplinaExecutiva.js` · `adaptacaoConversacional.js` · `compor.js` · `contextoImediato.js` · `executiveMemory` · `integracaoNucleo` (prosa Motor).  
> **Testes:** `disciplinaExecutiva.test.js`.  
> **Capacidade:** CAP-07 (comportamento conversacional) — **sem** CAP nova.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Disciplina que, antes de responder, determina se a interação está em **DELIBERAR** ou **EXECUTAR**, e restringe o comportamento em conformidade. |
| **Por que existe?** | Em missões operacionais, o CEO reclassificava, inventava objectivos, pedia confirmações redundantes e exponha mecanismos internos — reduzindo a percepção de Diretor Executivo. |
| **Para quem existe?** | Utilizador em missão operacional; CTO (baseline); Engenheiro (diretriz permanente). |
| **Como medir sucesso?** | Em missão operacional: zero reclassificação desnecessária, zero confirmação redundante, zero jargão interno, zero objectivo inventado, prosa curta pós-execução. |

---

## 1. Problema (evidência)

Ordens explícitas (`AUTORIZADO`, `ENVIE AO CURSOR`, `REENVIAR`, `FORCE O ENVIO`) geravam:

1. Objectivo inventado: «Definir o efeito esperado da última instrução…» (`derivarProximoPasso`).  
2. Confirmações «É isso — ou mudámos de prioridade?» sobre esse objectivo falso.  
3. Exposição de `payload_proibido` / etapa Plano.  
4. Prolixidade deliberativa no meio da execução.

## 2. Diagnóstico

| Causa | Efeito |
|-------|--------|
| Placeholder de `proximoPasso` promovido a `objectivoPrincipal` | Missão substituída por texto interno |
| Modo conversacional não distinguia EXECUTAR de DELIBERAR | Confirmações e perguntas no meio da ordem |
| Prosa do Motor ecoava motivos técnicos | Utilizador via arquitectura, não resultado |

## 3. Refinamentos

1. **Modos** `deliberar` \| `executar` (`detectarModoExecutivo`).  
2. Em **EXECUTAR**: sem pergunta D, sem fecho F, sem plano P, prosa curta (A/B).  
3. **Nunca** promover placeholder a objectivo (`filtrarPlaceholderObjectivo` / `ehObjectivoInventado`).  
4. `derivarProximoPasso` usa efeito esperado explícito ou a instrução — **não** inventa.  
5. ESPELHO sob autoridade → ack curto, sem «mudámos de prioridade?».  
6. Prosa do Motor sem `payload_proibido` / etapa interna.

## 4. Princípios permanentes (CTO-002)

1. Missão > classificação.  
2. Autoridade explícita > deliberação.  
3. Quanto maior a certeza operacional, menor a resposta.  
4. Após executar: o quê / resultado / próximo estado — nada além.  
5. Nunca substituir objectivo activo por objectivo inventado.

## 5. Aderência (Gate CTO)

| Item | Estado |
|------|--------|
| Nova capacidade | **Não** |
| Alteração arquitectural | **Não** |
| Redesign Executive Engine | **Não** |
| Alteração Baseline EIC (C1–C4) | **Não** |
| Natureza | Exclusivamente **comportamental** |

## 6. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (autorização); Engenheiro (implementação) |
| Quando | 06/08/2026 |
| O quê | CTO-002 — disciplina Deliberar/Executar |
| Por quê | Evidência de uso real em missão MG2 / dispatcher |
| Resultado | Implementado — pendente homologação CTO |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro | Implementação + testes | Implementada |

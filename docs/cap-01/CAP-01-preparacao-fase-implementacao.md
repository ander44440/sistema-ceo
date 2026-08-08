# Preparação da fase de implementação — CAP-01 Autoridade Delegada

> **Status:** Preparação **autorizada e cumprida** — 07/08/2026.  
> **Ciclo:** CAP-01 — Autoridade Delegada.  
> **ARQ:** [`ARQ-032`](../architecture/ARQ-032-autoridade-delegada.md) Homologada / **congelada**.  
> **REQs:** REQ-075…084 **Aprovados** v1.0.  
> **Pré-condição CAs:** [`CAP-01-verificacao-cas-pre-imp.md`](CAP-01-verificacao-cas-pre-imp.md) — **satisfeita**.  
> **IMP:** **ainda não aberta** — aguarda despacho CTO de abertura de IMP.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Acto de preparação da fase IMP da Autoridade Delegada, sem iniciar implementação. |
| **Por que existe?** | Despacho CTO aprovou REQs e exige CAs binários verificados antes de qualquer IMP. |
| **Para quem existe?** | CTO (autoriza IMP); Engenheiro (aguarda despacho IMP). |
| **Como medir sucesso?** | Pacote aprovado + CAs verificados + plano de blocos IMP esboçado + IMP ainda fechada. |

---

## 1. Pré-condições (todas cumpridas)

| Pré-condição | Estado |
|--------------|--------|
| ARQ-032 Homologada / congelada | Cumprida |
| CAP-01 ciclo aberto; R1–R10 base | Cumprida |
| REQ-075…084 Aprovados | Cumprida |
| CAs objectivos binários PASS/FAIL verificados | Cumprida |
| Sem conflito CTO-003 / ARQ-031 / CAP-04 | Cumprida |

---

## 2. Princípios da IMP futura (quando aberta)

1. Implementar **estritamente** REQ-075…084.  
2. Preservar **integralmente** ARQ-032 e CAP-01.  
3. Cada bloco/VAL responde só **PASS** ou **FAIL** por CA.  
4. **Não** modificar CTO-003, CAP-04, EIC, EE além do estritamente necessário para cumprir os REQs (e só se o despacho IMP o autorizar explicitamente).  
5. **Não** ampliar o escopo da delegação.  
6. **Não** criar estados arquitecturais novos.

---

## 3. Esboço de blocos IMP (não iniciado — só preparação)

Ordem candidata alinhada às dependências dos REQs:

| Bloco | REQs | Objectivo lógico |
|-------|------|------------------|
| B1 | REQ-075, REQ-084 | Acto de delegação + distinções conceptuais |
| B2 | REQ-076 | Estado `autoridade_delegada_activa` |
| B3 | REQ-077, REQ-078 | Fecho no perímetro + recusa fora dos limites |
| B4 | REQ-079, REQ-080 | Encerramento + retorno automático |
| B5 | REQ-081, REQ-082, REQ-083 | Prevalência · ortogonalidade modos · rastreabilidade |
| B6 | Conjunto | Fecho IMP + VAL integrada |

Este esboço **não** constitui abertura de IMP nem numeração IMP oficial.

---

## 4. Estado

| Item | Estado |
|------|--------|
| Preparação IMP | **CUMPRIDA** |
| IMP | **Não aberta** |
| Próximo acto | Despacho CTO a abrir IMP (ID a atribuir) |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (preparou) · CTO (autorizou preparação) |
| Quando | 07/08/2026 |
| O quê | Preparação fase IMP CAP-01 Autoridade Delegada |
| Resultado | Pronta para despacho IMP; IMP **não** iniciada |

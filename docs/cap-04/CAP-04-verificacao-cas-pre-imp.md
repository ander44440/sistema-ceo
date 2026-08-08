# Verificação pré-IMP — Critérios de aceitação REQ-070…074

> **Tipo:** verificação de pré-condição (Gate documental).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — pacote aprovado; CAs objectivos obrigatórios antes da primeira IMP.  
> **Resultado:** **PRÉ-CONDIÇÃO SATISFEITA.**  
> **Efeito:** fica **autorizada** a abertura do ciclo de implementação da CAP-04 (Camada) por despacho próprio de IMP — **este documento não abre a IMP**.

---

## 1. Critério da pré-condição

> Cada REQ deverá possuir critérios de aceitação **objectivos e verificáveis** antes da abertura da primeira IMP.

Método: para cada CA, confirmar (1) condição observável pass/fail; (2) método de verificação explícito; (3) ausência de tecnologia/IMP embutida no critério.

---

## 2. Matriz de verificação

| REQ | CAs | Objectivo? | Verificável pass/fail? | Sem tecnologia? | Resultado |
|-----|-----|------------|------------------------|-----------------|-----------|
| REQ-070 v1.0 | CA-070-1…4 | Sim | Sim (inspecção/cenário) | Sim | **OK** |
| REQ-071 v1.0 | CA-071-1…4 | Sim | Sim (antes/depois; processo) | Sim | **OK** |
| REQ-072 v1.0 | CA-072-1…5 | Sim | Sim (fluxo; fixture; deps) | Sim | **OK** |
| REQ-073 v1.0 | CA-073-1…5 | Sim | Sim (checklist; matrizes) | Sim | **OK** |
| REQ-074 v1.0 | CA-074-1…6 | Sim | Sim (rastro; actos) | Sim | **OK** |

**Total:** 24 critérios nomeados · 5/5 REQs conformes.

---

## 3. Conformidade adicional (pacote aprovado)

| Constatação CTO | Estado |
|-----------------|--------|
| Cobertura integral CAP-04 (D1–D5) | Mantida |
| ARQ-031 preservada | Mantida |
| Responsabilidades segregadas | Mantida |
| Sem deriva arquitectural | Mantida |

---

## 4. Autorizações

| Acto | Estado |
|------|--------|
| Pacote REQ-070…074 | **Aprovado** |
| Preparação da fase de implementação | **Autorizada** |
| Pré-condição CAs objectivos | **Verificada — OK** |
| Abertura do ciclo IMP CAP-04 Camada | **Autorizável** — exige despacho/IMP dedicado (ainda **não** aberto) |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (verificou) sob despacho CTO |
| Quando | 07/08/2026 |
| O quê | Verificação de CAs objectivos REQ-070…074 |
| Resultado | Pré-condição satisfeita; ciclo IMP autorizável; IMP **não** iniciada neste acto |

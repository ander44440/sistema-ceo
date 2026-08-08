# Diretriz CTO — Fase de REQs do ciclo CAP-04 (Camada)

> **Tipo:** diretriz de governação (fase REQs).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — CAP-04 reconhecida aberta; regras para decomposição em REQs.  
> **Ciclo:** [`CAP-04-abertura-ciclo-camada-conhecimento.md`](../cap-04/CAP-04-abertura-ciclo-camada-conhecimento.md)  
> **Arquitectura:** congelada (ARQ-006, ARQ-007, **ARQ-031**).  
> **Natureza:** regras obrigatórias para redacção de REQs. **Não** redige REQs neste acto. **Não** inicia IMP.

---

## 1. Reconhecimento

A **CAP-04** (ciclo Camada / ARQ-031) está **oficialmente aberta**.

---

## 2. Missão dos REQs

Os REQs deverão **apenas decompor** a CAP-04 (escopo aprovado na ARQ-031):

- Fonte Oficial de Conhecimento  
- Processo de Actualização  
- Porta de Recuperação para a EIC  
- Limites da Capacidade  
- Governação do Acervo  

---

## 3. Vedações

É **vedado** aos REQs:

| Vedação | Efeito se violada |
|---------|-------------------|
| Alterar a arquitectura | REQ **inválido** |
| Introduzir tecnologia | REQ **inválido** |
| Criar novas capacidades | REQ **inválido** |
| Modificar decisões homologadas da ARQ-031 (D1–D5) | REQ **inválido** |

Qualquer necessidade de alterar a arquitectura **invalida o REQ** e exige **nova deliberação do CTO**.

---

## 4. Forma obrigatória de cada REQ

Cada REQ deverá possuir:

1. **Objectivo único**  
2. **Responsabilidade única**  
3. **Critério claro de aceitação**  
4. **Rastreabilidade directa para a CAP-04**

Norma de forma: `docs/requirements/TEMPLATE-REQ.md` (ADR-006 / catálogo).

---

## 5. Relação com REQs CAP-04 já existentes

REQ-004, REQ-005, REQ-014 e REQ-015 permanecem vigentes (fundação do acervo).  
REQs deste ciclo **decompoem a Camada (ARQ-031)** sem reabrir nem contradizer esses requisitos; em tensão aparente, elevação ao CTO — não emenda silenciosa à ARQ-031.

---

## 6. Estado da sequência

```
ARQ-031  Homologada (congelada)
CAP      Aberta (reconhecida)
REQs     Autorizados sob esta diretriz — redacção ainda não despachada neste acto
IMP …    Não autorizados
```

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (diretriz) + Engenheiro (registo) |
| Quando | 07/08/2026 |
| O quê | Regras obrigatórias da fase REQs CAP-04 Camada |
| Resultado | Vigente — REQs só decompõem CAP-04; arquitectura intocável |

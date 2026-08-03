# 15 — Transição para Implementação

> **Status:** Transição oficial — fase documental → fase de implementação (condicionada a Gates)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documento de transição — **não** altera código, prompts nem comportamento do CEO.  
> **Data:** 03/08/2026  
> **Fontes:** [`14_HOMOLOGAÇÃO_GERAL.md`](14_HOMOLOGAÇÃO_GERAL.md); [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md); [`03_ROADMAP.md`](03_ROADMAP.md); [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md); [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md); [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md); Âncora Mestra.

---

## 1. Objetivo

Registar oficialmente a transição entre:

1. a **fase documental** da EIC (estrutura + conteúdo dos BLOCOS 1–4 + instrumento de homologação geral); e  
2. a **fase de implementação** no produto CEO —

estabelecendo que **qualquer evolução conversacional futura do CEO deverá seguir obrigatoriamente as diretrizes da EIC** já consolidadas, sem criar diretrizes novas neste documento.

---

## 2. Encerramento da fase documental

Declara-se encerrada, para efeitos de transição, a fase documental da EIC:

| Marco | Referência |
|-------|------------|
| Estrutura congelada | [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) |
| Conteúdo BLOCOS 1–4 | [`12_HISTÓRICO_DA_EIC.md`](12_HISTÓRICO_DA_EIC.md); [`ÍNDICE.md`](ÍNDICE.md) |
| Instrumento de homologação geral | [`14_HOMOLOGAÇÃO_GERAL.md`](14_HOMOLOGAÇÃO_GERAL.md) |
| Porta de entrada | [`ÍNDICE.md`](ÍNDICE.md) |

A documentação em `docs/EIC/` (00–14 + Índice + este 15) é a **referência oficial** da disciplina.  
Aprovação formal do patrocinador no termo da secção 9 de `14` permanece o acto de homologação geral; este documento **não** a substitui — **vincula** a implementação futura às diretrizes EIC já publicadas.

---

## 3. Início da fase de implementação

A fase de implementação **não** começa com alteração automática de código.

Inicia-se **somente** quando forem cumulativos:

1. Homologação documental da EIC (instrumento `14` / decisão do patrocinador);  
2. Necessidade de mudança conversacional no produto;  
3. Gate **G-EIC-C** (discussão) e **G-EIC-D** (autorização de produto), conforme [`03_ROADMAP.md`](03_ROADMAP.md);  
4. Fluxo **ADR-006** (ANL → ADR quando preciso → REQ → ARQ → IMP → VAL), conforme [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md).

Até lá: produto intocado (código, prompts, comportamento).

---

## 4. Regras obrigatórias para futuras implementações

Regras **já** vigentes na EIC — aqui apenas reiteradas como obrigatórias na transição:

| # | Regra | Origem |
|---|-------|--------|
| R1 | Seguir a hierarquia CON → VIS → REQ → ADR → ARQ → IMP → EIC | [`01`](01_PRINCÍPIOS.md); [`08`](08_GOVERNANÇA_DA_EIC.md) |
| R2 | Não alterar código/prompts/comportamento sem **G-EIC-D** + ADR-006 | [`03`](03_ROADMAP.md); Marco Zero; `14` §6 |
| R3 | Classificar intenção **antes** de qualquer efeito (C1–C4) | ARQ-018; [`01`](01_PRINCÍPIOS.md); [`04`](04_CRITÉRIOS_DE_QUALIDADE.md) |
| R4 | Qualidade de prosa/turno conforme PX-003 E4 (CA/NA EIC) | [`04`](04_CRITÉRIOS_DE_QUALIDADE.md); [`05`](05_TESTES_CONVERSACIONAIS.md) |
| R5 | CEO ≠ chatbot; personalidade institucional | CON-001; VIS-002; [`00`](00_VISÃO_GERAL.md) |
| R6 | Filtro ADR-015 (uso diário MG2) em propostas de produto | [`03`](03_ROADMAP.md); [`10`](10_MATRIZ_DE_PRIORIZAÇÃO.md) |
| R7 | Validar com testes SC-* / processo [`11`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) antes de fechar onda | [`05`](05_TESTES_CONVERSACIONAIS.md); [`11`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) |
| R8 | Não inventar conceitos; não confundir NCS com Classificador de Intenção | [`06`](06_GLOSSÁRIO.md); `14` |
| R9 | Actualizar memória Art. 8º e, se frente operacional, a Âncora Mestra | [`08`](08_GOVERNANÇA_DA_EIC.md); Âncora Mestra |

**Nenhuma regra nova** é introduzida por este documento.

---

## 5. Relação entre EIC e o produto CEO

| EIC | Produto CEO |
|-----|-------------|
| Disciplina documental da evolução conversacional | Sistema Executivo de Governança em execução |
| Define *como julgar e ordenar* evolução de prosa/intenção | Realiza conversa, classificação, motor, painel, fila |
| Não é nó runtime ([`02`](02_ARQUITETURA.md)) | Contém Classificador, CN, Motor, Painel, etc. |
| Obriga conformidade em IMP futuras | Só muda após Gate + normas de produto |
| Complementa a Âncora Mestra (doutrina vs estado operacional) | Âncora regista frentes homologadas e retomada diária |

A EIC **não substitui** o produto; **condiciona** a forma de o evoluir no eixo conversacional.

---

## 6. Fluxo oficial

Fluxo já alinhado ao Roadmap EIC e ao ADR-006:

```text
EIC (diretrizes documentais)
        │
        ▼
Homologação documental (14 + decisão do patrocinador)
        │
        ▼
Gate EIC de produto (G-EIC-C → G-EIC-D) + ADR-006 (REQ → ARQ → IMP…)
        │
        ▼
Implementação (código / prompts — só o autorizado)
        │
        ▼
Validação (testes SC-* / VAL / processo 11)
        │
        ▼
Produção + memória (Art. 8º; Âncora Mestra se aplicável; G-EIC-E ao fechar onda)
```

Saltar etapas (em especial Homologação → Implementação sem Gate) é **proibido** pelas regras já registadas na EIC.

---

## 7. Responsabilidades

| Papel | Na transição / implementação futura |
|-------|-------------------------------------|
| **Patrocinador** | Homologa EIC documental; autoriza Gates de produto; valida resultados |
| **CTO** | Revisa requisitos/arquitectura; QA — não implementa código |
| **Engenheiro** | Implementa **somente** o autorizado por norma + Gate; mantém rastreio |
| **CEO (produto)** | Objecto da evolução conversacional — não autor da EIC |

Conforme CON-001 Art. 6º e [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md).

---

## 8. Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | Criação do documento de transição | Transição oficial registada; implementações futuras vinculadas à EIC |

---

**TRANSICÃO REGISTADA.**  
Fase documental da EIC referenciada como base oficial.  
Toda implementação futura no eixo conversacional do CEO **deverá seguir** a Engenharia da Inteligência Conversacional.  
**Sem alteração de código, prompts ou comportamento neste acto.**

# F4-12 — Fluxos Arquiteturais Canônicos

> **Status: Homologada — Gate F4-12 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CMP-001…014 · ciclo executivo · continuidade · honestidade · FLX-01…06  
> **Specs:** [`F4-11-especificacao-canonica-componentes.md`](F4-11-especificacao-canonica-componentes.md) — **homologada**  
> **Força:** estes Fluxos = **referência obrigatória** para validação do comportamento integrado da Arquitetura Técnica.  
> **IFA / CAT / REL / ACI:** F4-10 · F4-09 — **obrigatórios**  
> **Marco:** [`marco-integracao-arquitetural-canonica.md`](marco-integracao-arquitetural-canonica.md)  
> **Proibições:** sem APIs; sem protocolos; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Descrever os **Fluxos Arquiteturais Canônicos (FLX)** que percorrem os componentes do CEO: sequência de colaboração, IFA/CAT/REL/ACI utilizados e rastreio a PAT/CX — **sem** APIs, protocolos, tecnologias ou infraestrutura.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Definir os principais FLX do MVP-A.  
* Explicitar a ordem de colaboração entre CMP.  
* Referenciar IFA, CAT, REL e ACI por fluxo.  
* Rastrear PAT e CX.  
* Orientar validação de desenhos posteriores.

### Não compete a este artefato

* Sequências de rede, filas ou diagramas de sequência de runtime.  
* APIs, protocolos, tech ou infra.  
* Alterar specs CMP, CAT ou IFA.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Specs CMP; CAT; IFA; ACI | Entrada | Permanente | F4-11; F4-09; F4-10 |
| Ciclo F2-02; CX | Entrada | Permanente | F2; F3 |
| Catálogo FLX-01…06 | Saída | Permanente | F4-13+; auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-11, F4-09, F4-10, F4-08 | → estrutural |
| Depende de | F2-02 ciclo; F3 CX | → estrutural |
| É pré-requisito de | F4-13+ (detalhe/cenários) | → |
| Relacionada | ACI / C1–C10 | ↔ — fluxos não violam proibições |

---

## 5. Critérios de validação técnica

1. Cada FLX cita sequência CMP + IFA + CAT + REL + ACI.  
2. Cobertura do ciclo Objetivo→…→Nova Atenção + continuidade + honestidade.  
3. Nenhum fluxo inverte L4↔L5 nem expõe seletor de meios.  
4. Zero API/tech; conformidade F4-02 / D-F4 / N-F4.  
5. Rastreio PAT/CX explícito.

---

## 6. Restrições arquiteturais

* Fluxo não autoriza contornar CMP-011 quando O-03 exige.  
* Fluxo inter-sessões não altera ciclo de vida por logout.  
* Exceções: N-F4-03.

---

## 7. Catálogo de fluxos canônicos

### Convenções

* Prefixo **FLX-nn**.  
* Passos numerados: `CMP-a → CMP-b` com CAT/IFA/REL.  
* ACI listados quando restringem o fluxo.

---

### FLX-01 — Estabelecer lente (COA ativo)

**Objetivo:** Colocar o sistema sob um único COA ativo antes de qualquer ciclo.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| 1 | Ativa/confirma **CMP-001** | IFA-01 | CAT-001 | REL-S |
| 2 | Demais CMP operam sob CAT-001 | IFA-01 | CAT-001 | REL-S |

| ACI | ACI-01, ACI-04 |
| CX | CX-01 |
| PAT | PAT-05, PAT-07 |

```text
CMP-001 (lente)
    └── premissa estrutural para CMP-002…014
```

---

### FLX-02 — Intenção, vida e Foco

**Objetivo:** Do diálogo à intenção governada e ao Foco executivo.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| 1 | **CMP-003** ↔ **CMP-004** (intenção) | IFA-03 | CAT-004 | REL-P / ↔ |
| 2 | **CMP-007** ancora **CMP-004** | IFA-05 | CAT-003 | REL-S |
| 3 | **CMP-004** → **CMP-005** (vida) | IFA-04 | CAT-005 | REL-G |
| 4 | **CMP-005** → **CMP-006** (Ativados→Foco) | IFA-04 | CAT-006 | REL-G |
| 5 | **CMP-007** / **CMP-006** alimentam **CMP-002** | IFA-02/05 | CAT-002 | REL-S / REL-V |

| ACI | ACI-01, ACI-07; G-02/G-03 |
| CX | CX-03, CX-04, CX-05, CX-07, CX-08, CX-09 |
| PAT | PAT-01, PAT-08, PAT-09 |

```text
CMP-003 ◄──► CMP-004 ──► CMP-005 ──► CMP-006
                ▲                      │
             CMP-007                   ▼
                                   CMP-002
```

---

### FLX-03 — Pedido de meios → encaminhamento → gate → execução → efeito

**Objetivo:** Realizar o bloco de execução O3 sem expor orquestração.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| 0 | Pré: FLX-01 + Foco/Ativado (CMP-006/005) + intenção | IFA-01/04/03 | CAT-007 | REL-S |
| 1 | **CMP-003/004** → **CMP-009** (pedido) | IFA-06 | CAT-008 | REL-P |
| 2 | **CMP-007** → **CMP-009** (recorte) | IFA-05 | CAT-003 | REL-S |
| 3 | **CMP-009** → **CMP-010** | IFA-06→07 | CAT-009 | REL-E |
| 4a | Se O-03: **CMP-010** → **CMP-011** | IFA-07 | CAT-010 | REL-G |
| 4b | **CMP-011** ↔ **CMP-003/002** (autorizar/rejeitar) | IFA-07/02/03 | CAT-018 | REL-V / REL-P |
| 5 | **CMP-010/011** → **CMP-012** (se autorizado ou sem gate) | IFA-07→08 | CAT-011 | REL-E |
| 6 | **CMP-012** → **CMP-002/003** (efeito) | IFA-08 | CAT-012 | REL-V |
| — | Se rejeição no gate: **não** há passo 5–6 de execução | — | — | — |

| ACI | ACI-02, ACI-03, ACI-06 |
| CX | CX-10, CX-11, CX-12 (+ CX-04/05/07/09) |
| PAT | PAT-01, PAT-02, PAT-10 |

```text
CMP-009 ──► CMP-010 ──► CMP-011? ──► CMP-012 ──► CMP-002/003
                │                        │
                └──── (invisível) ───────┘
```

---

### FLX-04 — Aprendizado seletivo e Nova Atenção

**Objetivo:** Fechar F-Ret: candidato → promoção seletiva → renovação do quadro.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| 1 | **CMP-012** → **CMP-008** (candidato) | IFA-08→05 | CAT-013 | REL-C |
| 2 | **CMP-008** promove seletivamente (ou não) | IFA-05 | — | — |
| 3 | Se promoveu: **CMP-008** → **CMP-013** | IFA-05→09 | CAT-014 | REL-C |
| 4 | **CMP-013** → **CMP-002** (Nova Atenção) | IFA-09/02 | CAT-015 | REL-R |
| 5 | Opcional: **CMP-014** marca o que permaneceu transitório | IFA-09 | CAT-017 | REL-T |

| ACI | ACI-05; PAT-04 |
| CX | CX-12, CX-13, CX-14, CX-16 |
| PAT | PAT-03, PAT-04, PAT-08, PAT-11 |

```text
CMP-012 ──candidato──► CMP-008 ──atualização──► CMP-013 ──► CMP-002
                              │
                         (não promover) ──► CMP-014 (honestidade)
```

---

### FLX-05 — Continuidade entre sessões

**Objetivo:** Encerrar posto sem apagar permanente; restaurar estado governado ao reabrir.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| 1 | Fim de sessão: permanente permanece (não chama CMP-005 para suspender) | IFA-05/01 | — | — |
| 2 | Reabertura: **CMP-013** restaura sob **CMP-001** | IFA-09, IFA-01 | CAT-016, CAT-001 | REL-R, REL-S |
| 3 | Restaura **CMP-005/006/007** e projeta **CMP-002** | IFA-04/05/02 | CAT-016 | REL-R |
| 4 | Pendências transitórias: **CMP-014** | IFA-09 | CAT-017 | REL-T |
| 5 | Retomada de trabalho: volta a FLX-02/03 via **CMP-003** — **sem** autoexecução | IFA-03 | — | REL-P |

| ACI | ACI-04, ACI-05; G-04 |
| CX | CX-15, CX-01, CX-08, CX-09, CX-07, CX-03, CX-16 |
| PAT | PAT-03, PAT-07, PAT-08, PAT-11 |

```text
[Sessão N] … CMP-007/005/006 …
     │ fim (não apaga permanente)
     ▼
[Sessão N+1] CMP-001 ← CMP-013 → CMP-005/006/007 → CMP-002
                              └─ CMP-014 (pendências)
```

---

### FLX-06 — Honestidade situacional (transversal)

**Objetivo:** Em qualquer ponto crítico, explicitar limites sem substituir o dono do fluxo.

| Passo | Colaboração | IFA | CAT | REL |
|-------|-------------|-----|-----|-----|
| * | **CMP-014** ↔ **CMP-003** (não sei / não posso) | IFA-09/03 | CAT-017 | REL-T |
| * | **CMP-014** ↔ **CMP-009…012** (pré-promoção, gate, efeito incerto) | IFA-09/06/07/08 | CAT-017 | REL-T |
| * | **CMP-014** ↔ **CMP-013** (pendência na retomada) | IFA-09 | CAT-017 | REL-T |

| ACI | ACI-05 |
| CX | CX-16 |
| PAT | PAT-11 |

Não é um fluxo linear substituto de FLX-03/04/05 — é **overlay** obrigatório nos pontos críticos.

---

### 7.1 Mapa de cobertura

| FLX | Camadas | CMP principais |
|-----|---------|----------------|
| FLX-01 | L0 | 001 |
| FLX-02 | L1–L3 | 002–007 |
| FLX-03 | L4–L5 (+L1) | 009–012 (+003/002) |
| FLX-04 | L5→L3→Tx→L1 | 012, 008, 013, 002, 014 |
| FLX-05 | Tx→L0/L2/L3/L1 | 013, 001, 005–007, 002, 014 |
| FLX-06 | Tx | 014 (+ pontos críticos) |

| Ciclo F2-02 | FLX |
|-------------|-----|
| Objetivo/Intenção/Contexto | FLX-02 |
| Orquestração/Gate/Execução | FLX-03 |
| Aprendizado/Atualização/Nova Atenção | FLX-04 |
| Continuidade temporal | FLX-05 |
| Honestidade | FLX-06 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 → FLX-03; DA-002 → FLX-04/05; DA-003 → FLX-01 | Diretrizes |
| **F2** | Ciclo contínuo; T≠P; O-03; G-04 | Conceito |
| **F3** | CX por FLX §7 | Funcional |
| **PAT** | Por FLX §7 | Princípios |
| **F4** | F4-09/10/11; Integração Arquitetural consolidada | Specs, contratos e fluxos |
| **Este catálogo** | FLX-01…06 — **obrigatórios** p/ validação integrada | Fluxos |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F4-12); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F4-12 — Fluxos Arquiteturais Canônicos |
| Baseado em quê | F4-11; F4-09; F4-10; F2-02; CX |
| Resultado | F4-12 **homologada**; FLX = referência obrigatória do comportamento integrado; Integração Arquitetural consolidada; F4-13 aberta |

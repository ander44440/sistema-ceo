# F5-10 — Matriz Canônica de Validação da Arquitetura UX/UI

> **Status: Homologada — Gate F5-10 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **matriz de validação arquitetural da UX/UI** (conformidade / completude / consistência / rastreabilidade documental) — não plano de testes de UI nem de software.  
> **Força:** a **MVX** = **mecanismo normativo obrigatório** para validação de **toda a F5**.  
> **Escopo:** F5-01…F5-09 · PUX · AX · INT · NAV · SRF · CMP-S · specs SRF-T · CX MVP-A · FLX  
> **Padrão:** F5-02 · D-F5-01…03 · N-F5-01…03  
> **Specs:** [`F5-09-especificacao-canonica-superficies.md`](F5-09-especificacao-canonica-superficies.md) — **obrigatórias** p/ validação  
> **Marco:** [`marco-encerramento-f5.md`](marco-encerramento-f5.md) · [`marco-fase-f5-arquitetura-ux-ui-concluida.md`](marco-fase-f5-arquitetura-ux-ui-concluida.md)  
> **Proibições neste registro:** sem layouts; sem wireframes; sem design visual; sem design system; sem implementação; sem commit neste registro.  
> **Condução:** Fase F5 **encerrada** — nenhum artefato novo até deliberação formal do CTO.

---

## 1. Objetivo do artefato

Produzir a **Matriz Canônica de Validação da Arquitetura UX/UI (MVX)**: critérios por camada F5, regras de conformidade, completude, consistência transversal, rastreabilidade obrigatória, preservação **AX-COA** e matriz de verificação F5-01…F5-09 — **sem** layouts, wireframes, design ou implementação.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Critérios de validação por camada (F5-01…09).  
* Regras de conformidade, completude e consistência transversal.  
* Regras obrigatórias de rastreabilidade.  
* Verificação AX-COA.  
* Matriz de verificação documental F5-01…09.  
* Identificar lacunas documentais sem propor design/IMP.

### Não compete a este artefato

* Testes de UI, protótipos ou VAL de software.  
* Layouts, wireframes, design visual, design system.  
* Alterar PUX/AX/INT/NAV/SRF/CMP-S/specs — apenas validar.  
* Código ou stack (D-F5-03).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| F5-01…F5-09 | Entrada | Permanente | Artefatos F5 |
| CX MVP-A; FLX; MVA (F4); PUX | Entrada | Permanente | F3; F4; F5-03 |
| Matriz MVX + checklist | Saída | Permanente | Gates F5; deliberação CTO |
| Lacunas | Saída | Situacional | Deliberação CTO |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-01…09 (Camada de Especificação) | → estrutural |
| Depende de | F3 CX; F4 FLX/MVA | → estrutural |
| Relacionada | F5-09 (specs) | ↔ — MVX valida o que as specs afirmam |
| É pré-requisito de | Encerramento/deliberação F5; F6 quando autorizado | ⇢ |

---

## 5. Critérios de validação da experiência arquitetural (deste gate)

1. Critérios por camada F5-01…09 inspecionáveis.  
2. Matriz de verificação cobre todos os artefatos F5-01…09.  
3. AX-COA e rastreio F3/F4 explícitos.  
4. Zero layout/wireframe/design/IMP; conformidade F5-02 / D-F5 / N-F5.

---

## 6. Restrições arquiteturais

* “Validação” ≠ teste de interface nem de código.  
* Lacuna exige deliberação — não “corrigir” specs neste artefato.  
* Exceções: N-F5-03.

---

## 7. Critérios de validação por camada

| Camada | Artefato | Critérios mínimos de validação |
|--------|----------|--------------------------------|
| **Mandato** | F5-01 | D-F5-01…03 vigentes; F4 encerrada; escopo MVP-A explícito |
| **Canônico** | F5-02 | N-F5-01…03; estrutura 7 eixos aplicável a F5-03+; proibição de forma visual neste estágio |
| **Princípios** | F5-03 | PUX-01…12 presentes; rastreio CX/F3/F4; sem mapas/telas |
| **Experiência** | F5-04 | AX-S0…S8 + AX-H; transições; AX-COA; AX-C; mapa CX↔FLX |
| **Interação** | F5-05 | INT-01…11; IEV; IRT; IRS; INT-C; subordinação AX |
| **Navegação** | F5-06 | NAV-P01…08; NAV-E; NAV-R; NAV-X; NAV-C; subordinação INT/AX |
| **Superfícies** | F5-07 | SRF-T01…11; SRF-R; SRF-C; sem seletor de meios |
| **Composição** | F5-08 | REG-01…11; COR; COC; centro REG-03; COR-11 (sem meios) |
| **Especificação** | F5-09 | 9 eixos em T01…T11; alinhamento REG/COR/SRF-R; AX-COA por spec |

---

## 8. Regras de conformidade arquitetural (CONF)

| ID | Regra |
|----|-------|
| **CONF-01** | Conformidade D-F5-01 — toda decisão de UX rastreia F3/CX |
| **CONF-02** | Conformidade D-F5-02 — toda decisão de UI/interação rastreia F4 (FLX/MVA) |
| **CONF-03** | Conformidade D-F5-03 — ausência de código/stack/IMP na F5 |
| **CONF-04** | Conformidade N-F5-01 — artefatos F5-03+ seguem F5-02 |
| **CONF-05** | Conformidade PUX — decisões citam PUX aplicáveis |
| **CONF-06** | Subordinação em cascata: AX ← INT ← NAV ← SRF ← CMP-S ← Specs |
| **CONF-07** | Proibição de seletor de meios em INT/NAV/SRF/REG/specs |
| **CONF-08** | D4≠D5 na experiência (cumprimento ≠ efeito; orquestração invisível) |
| **CONF-09** | Conversa como centro (PUX-12; COR-02; SRF-R02) |
| **CONF-10** | Forma — sem layout/wireframe/design visual/design system neste nível |

---

## 9. Critérios de completude (COMP)

| ID | Critério | Status |
|----|----------|--------|
| **COMP-01** | F5-01…09 homologáveis/homologados na cadeia | ✅ (até F5-09; este gate valida) |
| **COMP-02** | PUX-01…12 definidos | ✅ |
| **COMP-03** | AX-S0…S8 + AX-H + AX-COA | ✅ |
| **COMP-04** | INT-01…11 | ✅ |
| **COMP-05** | NAV-P01…08 | ✅ |
| **COMP-06** | SRF-T01…11 | ✅ |
| **COMP-07** | REG-01…11 | ✅ |
| **COMP-08** | Specs 9 eixos para T01…T11 | ✅ |
| **COMP-09** | CX MVP-A cobertas via SRF/INT/AX | ✅ (ver §12) |
| **COMP-10** | FLX-01…06 refletidos em AX/INT/NAV | ✅ |
| **COMP-11** | Evolutivas CX-02/06/17/18 fora | ✅ explícito |

---

## 10. Critérios de consistência transversal (CTX)

| ID | Critério | Verificação |
|----|----------|-------------|
| **CTX-01** | AX ↔ INT | Cada INT cita AX-S; IRT ⊂ transições AX |
| **CTX-02** | INT ↔ NAV | Cada NAV-P cita INT; NAV-E = AX-S |
| **CTX-03** | NAV ↔ SRF | Cada SRF-T cita NAV-P |
| **CTX-04** | SRF ↔ CMP-S | Cada SRF-T tem REG; COR respeita SRF-R |
| **CTX-05** | CMP-S ↔ Specs | Cada spec cita REG/COR/COC/SRF-R |
| **CTX-06** | F5 ↔ F3 | CX MVP-A em AX/INT/SRF/specs |
| **CTX-07** | F5 ↔ F4 | FLX em AX/INT/NAV; CMP técnicos rastreados |
| **CTX-08** | Gate / rejeição | AX, IRT, NAV, SRF-C07, COR-06 alinhados |
| **CTX-09** | Sessão | AX-S8, INT-09, NAV-P05, SRF-T10, REG-10, COC-04 alinhados |
| **CTX-10** | Honestidade | AX-H, INT-10, NAV-P07, SRF-T11, REG-11 alinhados |

---

## 11. Regras obrigatórias de rastreabilidade (RAS)

| ID | Regra |
|----|-------|
| **RAS-01** | Todo artefato F5-03+ tem matriz F3 e F4 (N-F5-02) |
| **RAS-02** | Toda spec SRF cita NAV, INT, AX, PUX, CX, FLX (e CMP técnico) |
| **RAS-03** | Toda transição de experiência cita FLX ou pré-FLX-01 |
| **RAS-04** | Toda superfície cita CX do catálogo F3-04 (nome canônico) |
| **RAS-05** | Célula N/A só com justificativa |
| **RAS-06** | Falha de rastreio = artefato não homologável |

---

## 12. Preservação do AX-COA (matriz)

| AX-COA | Evidência F5 | Verificação MVX |
|--------|--------------|-----------------|
| **01** | AX; INT-01; NAV-P01; SRF-T01; REG-01; COR-01 | Um COA em composições válidas |
| **02** | AX-COA-02; IRS-01; SRF-C; COC-09 | Conteúdo só do COA ativo |
| **03** | INT-11; NAV-P06; SRF-R10; COR-09 | Troca sem mistura |
| **04** | INT-09; NAV-R04; SRF-T10; COC-04 | Sessão ≠ vida de objetivos |
| **05** | FLX-05; AX-S8→S1; COR-08 | Restauração reafirma lente |

**Falha em qualquer AX-COA = não conformidade MVX.**

---

## 13. Matriz de verificação F5-01…F5-09

Usar F5-09 e a cadeia como referência. Para cada linha: **Sim / Não / N/A**.

| # | Artefato | Pergunta de verificação |
|---|----------|-------------------------|
| V01 | F5-01 | D-F5-01…03 explícitas e permanentes? |
| V02 | F5-02 | N-F5-01…03 e template de 7 eixos definidos? |
| V03 | F5-03 | PUX-01…12 com rastreio CX/F3/F4 e sem antecipar mapas/telas? |
| V04 | F5-04 | AX-S0…S8 + AX-H + AX-COA + AX-C + CX↔FLX? |
| V05 | F5-05 | INT-01…11 + IEV + IRT + IRS + INT-C + subordinação AX? |
| V06 | F5-06 | NAV-P01…08 + NAV-E/R/X/C + subordinação INT? |
| V07 | F5-07 | SRF-T01…11 + SRF-R + SRF-C + sem SRF de meios? |
| V08 | F5-08 | REG-01…11 + COR + COC + COR-02/11 + centro conversa? |
| V09 | F5-09 | Specs T01…T11 com 9 eixos e AX-COA? |
| V10 | Cadeia | CONF-06 (cascata AX→…→Specs) sem contradição CTX-01…10? |
| V11 | F3 | Todas as CX MVP-A aparecem em ≥1 SRF/INT/AX? |
| V12 | F4 | FLX-01…06 refletidos; D4≠D5 preservado? |
| V13 | AX-COA | COA-01…05 com evidência §12 = Sim? |
| V14 | Forma | Nenhum F5-01…09 introduz layout/wireframe/design system/IMP? |
| V15 | PUX | PUX-01,02,05,06,08,10,12 evidenciados na cadeia? |

**Homologação da Arquitetura UX/UI (até F5-09):** V01–V15 = Sim (ou N/A justificado).

### 13.1 Cobertura CX MVP-A (resumo)

| CX | Evidência principal F5 |
|----|------------------------|
| CX-01 | AX-S1; INT-01; SRF-T01; REG-01 |
| CX-03 | AX-S2; INT-02; SRF-T02 |
| CX-04 | AX-S3; INT-03; SRF-T04 |
| CX-05 | SRF-T03; REG-03 |
| CX-07 | SRF-T05; REG-05 |
| CX-08/09 | INT-04; SRF-T04; SRF-T02 |
| CX-10 | INT-05; SRF-T06 |
| CX-11 | INT-06; SRF-T07 |
| CX-12 | INT-07; SRF-T08 |
| CX-13/14 | INT-08; SRF-T09 |
| CX-15 | INT-09; SRF-T10 |
| CX-16 | INT-10; SRF-T11; AX-H |

**Resultado:** 14/14 CX MVP-A **cobertas**.

---

## 14. Lacunas

| Item | Avaliação |
|------|-----------|
| CX evolutivas | **Esperado** — fora do MVP-A |
| Design system / identidade visual | **Fora** — deliberação futura |
| Lacunas bloqueantes F5-01…09 | **Nenhuma identificada** neste gate |

---

## 15. Rastreabilidade deste artefato

| Eixo | Referências |
|------|-------------|
| F5-01…09 | §7; §13 |
| PUX / AX-COA | §8; §12 |
| F3 / F4 | §13.1; CONF-01/02 |
| Este | MVX (CONF · COMP · CTX · RAS · verificação) |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-10); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-10 — Matriz Canônica de Validação da Arquitetura UX/UI |
| Baseado em quê | F5-01…09; PUX; AX; CX; FLX |
| Resultado | F5-10 **homologada**; MVX = mecanismo normativo obrigatório de validação da F5; Fase F5 concluída e encerrada; sem artefato novo; sem commit |

# F5-09 — Especificação Canônica das Superfícies Arquiteturais

> **Status: Homologada — Gate F5-09 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** SRF-T01…11 · REG-01…11 · COR · COC · AX-COA  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **CMP-S:** [`F5-08-arquitetura-canonica-composicao-superficies.md`](F5-08-arquitetura-canonica-composicao-superficies.md) — **obrigatória**  
> **Força:** specs SRF-T01…11 = **referência obrigatória** para a **validação** da Arquitetura UX/UI da F5.  
> **SRF / NAV / INT / AX:** F5-07…04 — **obrigatórias**  
> **Diretrizes / Normas / PUX:** D-F5-01…03 · N-F5-01…03 · PUX-01…12  
> **Marco:** [`marco-camada-especificacao-arquitetural-ux-ui.md`](marco-camada-especificacao-arquitetural-ux-ui.md)  
> **Proibições neste registro:** sem layouts finais; sem wireframes; sem identidade visual; sem design system; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Produzir a **Especificação Canônica** de cada superfície arquitetural (SRF-T01…11) do MVP-A, sob modelo uniforme e subordinada a **CMP-S**, **SRF**, **NAV**, **INT**, **AX** e **PUX** — **sem** layout, wireframe, identidade visual, design system ou implementação.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Definir o modelo obrigatório de especificação de superfície (§7.0).  
* Especificar SRF-T01…11 nos nove eixos exigidos.  
* Garantir AX-COA e rastreio NAV/INT/AX/PUX/F3/F4 por superfície.

### Não compete a este artefato

* Layouts finais, wireframes, identidade visual ou design system.  
* Componentes gráficos ou implementação.  
* Alterar SRF, CMP-S, NAV, INT, AX, PUX, CX ou FLX.  
* Inventar superfícies fora de SRF-T01…11.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| F5-07 SRF; F5-08 CMP-S | Entrada | Permanente | F5 |
| NAV; INT; AX; PUX; CX; FLX; CMP | Entrada | Permanente | F5…F1 / F4 |
| Specs SRF-T01…11 | Saída | Permanente | F5 posteriores (se deliberados); auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-08 (CMP-S) — **obrigatória** | → estrutural |
| Depende de | F5-07…04; F5-03; F3; F4 | → estrutural |
| É pré-requisito de | F5 posteriores **somente** se CTO autorizar | ⇢ |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada spec preenche os 9 eixos (§7.0).  
2. REG/COR/COC citados ∈ F5-08; SRF-R ∈ F5-07.  
3. Nenhuma spec introduz seletor de meios nem layout/wireframe/identidade visual.  
4. AX-COA explícito em cada spec.  
5. Conformidade F5-02, D-F5, PUX.

---

## 6. Restrições arquiteturais

* Spec ≠ tela ≠ layout.  
* Exceções: N-F5-03.

---

## 7. Modelo e especificações

### 7.0 Modelo obrigatório de especificação

Cada superfície **deve** conter, nesta ordem:

| # | Eixo |
|---|------|
| 1 | Identificação (SRF-Tnn · nome · REG) |
| 2 | Objetivo arquitetural |
| 3 | Regiões arquiteturais (REG) |
| 4 | Responsabilidades (compete / não compete) |
| 5 | Relações arquiteturais (SRF-R) |
| 6 | Regras de composição (COR) |
| 7 | Critérios de consistência (COC + SRF-C aplicáveis) |
| 8 | Preservação do AX-COA |
| 9 | Rastreabilidade (NAV, INT, AX, PUX, F3, F4) |

---

### Spec SRF-T01 — Lente / COA

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T01** · Lente / COA · **REG-01** |
| **2. Objetivo** | Estabelecer e manter o único COA ativo como premissa de toda composição |
| **3. REG** | REG-01 (obrigatória em toda composição válida — COR-01) |
| **4. Responsabilidades** | **Compete:** ativar/confirmar/trocar COA; sinalizar lente. **Não:** misturar patrimônios; escolher meios |
| **5. SRF-R** | R01 (pré-condiciona todas); R10 (troca reinicia T02…T09); R09 (com T10) |
| **6. COR** | COR-01, COR-09; presente em COR-04…08 como premissa |
| **7. COC / SRF-C** | COC-01, COC-09; SRF-C01 |
| **8. AX-COA** | Realiza COA-01…03, 05; troca = COA-03 |
| **9. Rastreio** | NAV P01/P06 · INT-01/11 · AX-S0→S1 · PUX-12 · CX-01 · FLX-01 · CMP-001 |

---

### Spec SRF-T02 — Atenção

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T02** · Atenção · **REG-02** |
| **2. Objetivo** | Projetar o quadro situacional do COA (o que exige atenção / Foco perceptível) |
| **3. REG** | REG-02 (apoio ao centro) |
| **4. Responsabilidades** | **Compete:** situar atenção. **Não:** governar vida de objetivos (T04); executar |
| **5. SRF-R** | R02 (↔ T03); R03 (↔ T04); R08 (← T09); R01 (sob T01) |
| **6. COR** | COR-03, COR-04, COR-07 (retorno), COR-13 |
| **7. COC / SRF-C** | COC-03, COC-05; SRF-C02, C09 |
| **8. AX-COA** | COA-01/02 — só conteúdo do COA ativo |
| **9. Rastreio** | NAV P02/P08 · INT-02 · AX-S2 · PUX-04/09 · CX-03/09 · FLX-02 · CMP-002 |

---

### Spec SRF-T03 — Conversa

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T03** · Conversa · **REG-03** |
| **2. Objetivo** | Ser a interface principal de intenção e atos do utilizador |
| **3. REG** | REG-03 (**centro** — COR-02) |
| **4. Responsabilidades** | **Compete:** conduzir diálogo; receber INT. **Não:** formulário de meios; substituir T02/T04 |
| **5. SRF-R** | R02 (centro ↔ apoios/situacionais); R04 (← T05); R11 (↔ T11) |
| **6. COR** | COR-02, COR-03, COR-04, COR-05 (permanece em P03), COR-02 em P02–P04 |
| **7. COC / SRF-C** | COC-02, COC-08; SRF-C04 |
| **8. AX-COA** | COA-01/02 — atos sob lente; não mistura COAs |
| **9. Rastreio** | NAV P02/P03/P07 · INT-03…06/10 · AX-S2…S5 · PUX-12 · CX-05 (+04/11/16) · FLX-02/03/06 · CMP-003 |

---

### Spec SRF-T04 — Intenção / Objetivos

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T04** · Intenção / Objetivos · **REG-04** |
| **2. Objetivo** | Declarar e governar objetivos, ciclo de vida e Foco |
| **3. REG** | REG-04 (apoio ao centro) |
| **4. Responsabilidades** | **Compete:** intenção, vida, Foco. **Não:** encaminhar meios; promover patrimônio |
| **5. SRF-R** | R03 (↔ T02); R04 (← T05); R05 (→ T06); R02 (↔ T03) |
| **6. COR** | COR-03, COR-04; pré-condição de COR-05 (intenção≺cumprimento) |
| **7. COC / SRF-C** | COC-06; SRF-C05 |
| **8. AX-COA** | COA-01/02; logout não via T04 automática (COA-04 via T10) |
| **9. Rastreio** | NAV P02/P08 · INT-03/04 · AX-S3 · PUX-08 · CX-04/08/09 · FLX-02 · CMP-004…006 |

---

### Spec SRF-T05 — Âncora / Conhecimento

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T05** · Âncora / Conhecimento · **REG-05** |
| **2. Objetivo** | Consultar permanente do COA que ancora a intenção |
| **3. REG** | REG-05 (apoio; entra quando âncora necessária — COR-04) |
| **4. Responsabilidades** | **Compete:** expor âncora relevante. **Não:** arquivar tudo automaticamente; executar |
| **5. SRF-R** | R04 (→ T04/T03); R01; R09 (com T10 — permanente sobrevive) |
| **6. COR** | COR-03, COR-04, COR-08 (não esvaziar na sessão — COC-04/AX-COA-04) |
| **7. COC / SRF-C** | COC-01/04; SRF-C01/C03 |
| **8. AX-COA** | COA-02/04 — permanente isolado por COA; sessão não apaga |
| **9. Rastreio** | NAV P02 · INT-03 (ancoragem) · AX-S3 · PUX-05 · CX-07 · FLX-02 · CMP-007 |

---

### Spec SRF-T06 — Cumprimento

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T06** · Cumprimento · **REG-06** |
| **2. Objetivo** | Pedir cumprimento e perceber andamento **sem** expor meios |
| **3. REG** | REG-06 (situacional — NAV-P03) |
| **4. Responsabilidades** | **Compete:** aceitar pedido; ocultar orquestração. **Não:** seletor de meios; executar |
| **5. SRF-R** | R05 (← T04); R06/R07 (→ T07/T08); R12 (sem SRF de meios); R02 (↔ T03) |
| **6. COR** | COR-05, COR-11, COR-12, COR-13 |
| **7. COC / SRF-C** | COC-07; SRF-C05/C06 |
| **8. AX-COA** | COA-01/02 — cumprimento só sob lente e intenção do COA ativo |
| **9. Rastreio** | NAV P03 · INT-05 · AX-S4 · PUX-02/08 · CX-10 · FLX-03 · CMP-009/010 |

---

### Spec SRF-T07 — Gate

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T07** · Gate · **REG-07** |
| **2. Objetivo** | Pausar para autorizar/rejeitar sob risco/irreversibilidade/ambiguidade |
| **3. REG** | REG-07 (situacional — só O-03) |
| **4. Responsabilidades** | **Compete:** autorização humana. **Não:** expor meios; executar se rejeitado |
| **5. SRF-R** | R06 (T06→T07→T08); R02 (↔ T03); R11 (↔ T11 — não substitui) |
| **6. COR** | COR-05, COR-06, COR-13 |
| **7. COC / SRF-C** | COC-06; SRF-C07 |
| **8. AX-COA** | COA-01/02 — gate no COA ativo |
| **9. Rastreio** | NAV P03 · INT-06 · AX-S5 · PUX-09/02 · CX-11 · FLX-03 · CMP-011 |

---

### Spec SRF-T08 — Efeito

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T08** · Efeito · **REG-08** |
| **2. Objetivo** | Tornar efeito ou bloqueio da execução perceptível |
| **3. REG** | REG-08 (situacional — pós-autorização ou sem gate) |
| **4. Responsabilidades** | **Compete:** efeito perceptível. **Não:** reencaminhar meios; promover por padrão |
| **5. SRF-R** | R06/R07 (← T06/T07); R08 (→ T09→T02); R02 (↔ T03) |
| **6. COR** | COR-05, COR-06 (bloqueio se rejeição), COR-07, COR-12 |
| **7. COC / SRF-C** | COC-03/07; SRF-C06/C07 |
| **8. AX-COA** | COA-01/02 — efeito do COA ativo |
| **9. Rastreio** | NAV P03/P04 · INT-07 · AX-S6 · PUX-02 · CX-12 · FLX-03/04 · CMP-012 |

---

### Spec SRF-T09 — Renovação

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T09** · Renovação · **REG-09** |
| **2. Objetivo** | Candidatar promoção seletiva e renovar Nova Atenção |
| **3. REG** | REG-09 (situacional — NAV-P04) |
| **4. Responsabilidades** | **Compete:** renovar atenção; promoção seletiva. **Não:** promover plano bruto de orquestração por padrão |
| **5. SRF-R** | R08 (T08→T09→T02); R01; R10 (reinício se troca COA) |
| **6. COR** | COR-07, COR-13 |
| **7. COC / SRF-C** | COC-03; SRF-C02 |
| **8. AX-COA** | COA-01/02 — renovação no mesmo COA; não migra em troca |
| **9. Rastreio** | NAV P04 · INT-08 · AX-S7→S2 · PUX-05 · CX-13/14 · FLX-04 · CMP-008/013 |

---

### Spec SRF-T10 — Continuidade

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T10** · Continuidade · **REG-10** |
| **2. Objetivo** | Encerrar/restaurar sessão sem apagar permanente nem autoexecutar |
| **3. REG** | REG-10 (situacional — NAV-P05) |
| **4. Responsabilidades** | **Compete:** continuidade temporal. **Não:** suspender/cancelar objetivos por logout |
| **5. SRF-R** | R09 (↔ T01…T05, T11); R01 |
| **6. COR** | COR-08, COR-01 (restauração reafirma lente) |
| **7. COC / SRF-C** | COC-04; SRF-C03 |
| **8. AX-COA** | COA-04/05 — sessão ≠ vida; T10→T01→T02/T04 |
| **9. Rastreio** | NAV P05 · INT-09 · AX-S8 · PUX-05 · CX-15 · FLX-05 · CMP-013 |

---

### Spec SRF-T11 — Honestidade

| Eixo | Conteúdo |
|------|----------|
| **1. ID** | **SRF-T11** · Honestidade · **REG-11** |
| **2. Objetivo** | Explicitar limites, incerteza e estados não consolidados |
| **3. REG** | REG-11 (overlay — COR-10) |
| **4. Responsabilidades** | **Compete:** honestidade situacional. **Não:** substituir T07; autorizar execução |
| **5. SRF-R** | R11 (↔ T03, T06…T10); não substitui R06 |
| **6. COR** | COR-10, COR-11 (não cria meios) |
| **7. COC / SRF-C** | COC-08; SRF-C08; PUX-10 |
| **8. AX-COA** | COA-01/02 — honestidade no COA ativo; overlay não muda lente |
| **9. Rastreio** | NAV P07 · INT-10 · AX-H · PUX-10 · CX-16 · FLX-06 · CMP-014 |

---

### 7.1 Índice de cobertura

| SRF | REG | NAV-P | CX | Status spec |
|-----|-----|-------|-----|-------------|
| T01…T11 | REG-01…11 | P01…P08 | MVP-A CX | ✅ neste artefato |

---

## 8. Rastreabilidade deste artefato

| Eixo | Referências | Papel |
|------|-------------|-------|
| **CMP-S** | REG; COR; COC | Modelo de composição — obrigatório |
| **SRF** | SRF-T; SRF-R; SRF-C | Tipos e relações |
| **NAV / INT / AX / PUX** | Por spec §7 | Experiência |
| **F3 / F4** | CX; FLX; CMP técnicos | Capacidades / organização |
| **Este** | Specs T01…T11 | Especificação canônica |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-09); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-09 — Especificação Canônica das Superfícies |
| Baseado em quê | CMP-S; SRF; NAV; INT; AX; PUX; CX; FLX |
| Resultado | F5-09 **homologada**; specs = referência obrigatória da validação UX/UI; Camada de Especificação consolidada; F5-10 aberta |

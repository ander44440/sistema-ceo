# F5-04 — Arquitetura da Experiência Canônica (AX)

> **Status: Homologada — Gate F5-04 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16 · FLX-01…06 · PUX-01…12  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **Diretrizes:** D-F5-01, D-F5-02, D-F5-03  
> **Normas:** N-F5-01, N-F5-02, N-F5-03  
> **Princípios:** PUX-01…12 — **obrigatórios**  
> **Força:** **AX** (estados, transições, AX-COA, AX-C) = **referência obrigatória** para toda arquitetura de interação da F5.  
> **Marco:** [`marco-arquitetura-experiencia-canonica.md`](marco-arquitetura-experiencia-canonica.md)  
> **Proibições neste registro:** sem telas; sem layouts; sem wireframes; sem componentes visuais; sem design system; sem navegação detalhada; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Arquitetura da Experiência Canônica (AX)** do MVP-A: o objetivo arquitetural da experiência, os **estados** em que o utilizador se encontra no ciclo executivo, as **transições permitidas**, a **continuidade**, a **preservação do COA** e a relação explícita com **CX** e **FLX** — com rastreio integral a F3, F4 e PUX.

Este artefato descreve **o que a experiência deve preservar e permitir** no plano arquitetural. **Não** descreve telas, layouts, navegação detalhada nem forma visual.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Enunciar o objetivo arquitetural da experiência (AX).  
* Definir estados arquiteturais da experiência e transições permitidas/proibidas.  
* Explicitar continuidade ao longo do ciclo executivo e entre sessões.  
* Explicitar preservação do COA (lente única).  
* Relacionar experiência ↔ CX ↔ FLX.  
* Definir critérios de consistência arquitetural da experiência.  
* Manter rastreabilidade F3 / F4 / PUX.

### Não compete a este artefato

* Telas, layouts, wireframes, componentes visuais ou design system.  
* Navegação detalhada (menus, rotas, destinos de UI).  
* Papéis de superfície como inventário de UI (fica para deliberação futura, se houver).  
* Código, stack ou implementação (D-F5-03).  
* Alterar CX, CMP, FLX, MVA ou PUX.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Specs CX MVP-A; F3-02/04 | Entrada | Permanente | F3 |
| FLX-01…06; MVA; CMP | Entrada | Permanente | F4 |
| PUX-01…12; F5-01…03 | Entrada | Permanente | F5 |
| Ciclo F2-02 (T≠P; O0…O5) | Entrada | Permanente | F2 |
| Catálogo de estados AX-S / transições | Saída | Permanente | F5 posteriores (se deliberados); auditoria |
| Critérios de consistência AX | Saída | Permanente | Gates F5 / MVA (lado experiência) |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-02, F5-03 (PUX) | → estrutural |
| Depende de | F3 (CX) — D-F5-01 | → estrutural |
| Depende de | F4 (FLX, MVA) — D-F5-02 | → estrutural |
| Depende de | F2-02 ciclo; DA-001…003 | → estrutural |
| É pré-requisito de | Artefatos F5 posteriores **somente** se CTO autorizar | ⇢ |
| Relacionada | FLX / MVA | ↔ — AX não pode contradizer comportamento integrado |

---

## 5. Critérios de validação da experiência arquitetural

1. Estados e transições cobrem o ciclo MVP-A sem inventar capacidades fora das CX.  
2. Toda transição cita CX e/ou FLX aplicáveis.  
3. COA único preservado; mistura de COAs proibida.  
4. Nenhuma transição expõe seletor de meios ou funde D4/D5.  
5. Continuidade inter-sessões ≠ alteração de ciclo de vida por logout.  
6. Zero telas/layouts/wireframes/navegação detalhada/design system/código.  
7. Conformidade F5-02, D-F5-01…03, PUX-01…12.

---

## 6. Restrições arquiteturais

* Não antecipar navegação detalhada nem inventário de telas.  
* Não alterar FLX/CX/PUX.  
* Overlay de honestidade (AX-H) não substitui o estado dono do trecho.  
* Exceções: N-F5-03.

---

## 7. Arquitetura da Experiência Canônica (AX)

### 7.1 Objetivo arquitetural da experiência

> A experiência do MVP-A deve colocar o utilizador num **posto de comando sob um único COA ativo**, no qual a **conversa** conduz a **intenção**, a **atenção** situa o trabalho, o **cumprimento** ocorre sem exposição de orquestração, o **gate humano** preserva o controle sob risco, o **efeito** e a **Nova Atenção** renovam o ciclo, e a **continuidade** preserva o permanente entre sessões — com **honestidade** nos limites.

| Obrigação | Fundamento |
|-----------|------------|
| Um COA ativo | CX-01; PUX-12; FLX-01 |
| Conversa como centro | CX-05; PUX-12 |
| Intenção antes de meios | CX-04 ≺ CX-10; PUX-08; FLX-02→03 |
| Orquestração invisível | CX-10; PUX-02; FLX-03 |
| Gate quando O-03 | CX-11; FLX-03 |
| Efeito perceptível | CX-12; FLX-03 |
| Promoção seletiva + Nova Atenção | CX-13/14; FLX-04 |
| Continuidade de sessão | CX-15; FLX-05 |
| Honestidade | CX-16; FLX-06; PUX-10 |

---

### 7.2 Estados arquiteturais da experiência

Estados descrevem **condição experiencial** no ciclo — não ecrãs. Prefixo **AX-S**.

| ID | Estado | O que o utilizador “está” (arquiteturalmente) | CX | FLX |
|----|--------|-----------------------------------------------|----|-----|
| **AX-S0** | Sem lente | Fora de COA ativo; ciclo ainda não pode avançar com segurança | CX-01 | pré-FLX-01 |
| **AX-S1** | Sob lente | COA ativo estabelecido; isolamento vigente | CX-01 | FLX-01 |
| **AX-S2** | Em atenção | Orientado pelo quadro situacional do COA (atenção / Foco visível em significado) | CX-03, CX-09 | FLX-02 |
| **AX-S3** | Em intenção | Declarando/conduzindo objetivo; ciclo de vida e Foco em governança | CX-04, CX-05, CX-07, CX-08, CX-09 | FLX-02 |
| **AX-S4** | Em cumprimento | Pediu cumprimento da intenção; encaminhamento **não** é experiência de escolha de meios | CX-10 (+ 04/05/07/09) | FLX-03 |
| **AX-S5** | Em gate | Pausa para autorizar/rejeitar sob risco/irreversibilidade/ambiguidade | CX-11 | FLX-03 |
| **AX-S6** | Em efeito | Efeito ou bloqueio da execução é perceptível | CX-12 | FLX-03 |
| **AX-S7** | Em renovação | Candidato/promoção seletiva e/ou Nova Atenção | CX-13, CX-14 | FLX-04 |
| **AX-S8** | Em restauração | Retoma estado governado após intervalo de sessão | CX-15 (+ 01, 08, 09, 07, 03) | FLX-05 |

#### Overlay (não exclui o estado base)

| ID | Overlay | Papel | CX | FLX |
|----|---------|-------|----|-----|
| **AX-H** | Honestidade situacional | Explicitar limites/incerteza/não consolidado **sem** substituir o estado dono | CX-16 | FLX-06 |

**Classes (F2):** AX-S1…S3 e permanente do COA → Permanente; AX-S4…S6 e trechos de execução → misturam Transitório sob Permanente; AX-S7 promove seletivamente; AX-S8 restaura Permanente; AX-H = Transitório de honestidade.

---

### 7.3 Transições permitidas

Convenção: `origem → destino` · pré-condição · proibições associadas.

| Transição | Pré-condição | CX / FLX | Notas |
|-----------|--------------|----------|-------|
| **AX-S0 → AX-S1** | Estabelecer/confirmar COA ativo | CX-01 · FLX-01 | Obrigatória antes de qualquer outro avanço |
| **AX-S1 → AX-S2** | Lente ativa | CX-03 · FLX-02 | Atenção sob COA |
| **AX-S1/S2 → AX-S3** | Lente ativa; diálogo/intenção | CX-04/05/07/08/09 · FLX-02 | Intenção ≺ meios |
| **AX-S3 → AX-S2** | Atualização de Foco/âncora | CX-03/09 · FLX-02 | Atenção alimentada |
| **AX-S3 → AX-S4** | Intenção governada + Foco/Ativado quando aplicável | CX-10 · FLX-03 | Sem seletor de meios |
| **AX-S4 → AX-S5** | Condição O-03 (risco/irreversibilidade/ambiguidade) | CX-11 · FLX-03 | Gate condicional |
| **AX-S4 → AX-S6** | Sem gate **ou** gate já autorizado | CX-12 · FLX-03 | Encaminhamento permanece invisível |
| **AX-S5 → AX-S6** | Autorização humana | CX-11→12 · FLX-03 | — |
| **AX-S5 → AX-S3/S2** | Rejeição no gate | CX-11 · FLX-03 | **Proibido** avançar a AX-S6 |
| **AX-S6 → AX-S7** | Efeito disponível para julgamento | CX-12→13/14 · FLX-04 | Promoção **seletiva** |
| **AX-S7 → AX-S2** | Nova Atenção | CX-14 · FLX-04 | Reabre ciclo |
| **AX-S7 → AX-S3** | Continuidade de intenção no mesmo COA | CX-04… · FLX-02 | Opcional |
| **Qualquer AX-S1…S7 → AX-S8** | Fim de sessão de uso | CX-15 · FLX-05 | Não altera ciclo de vida por logout |
| **AX-S8 → AX-S1** | Reabertura | CX-01/15 · FLX-05 | Restaura sob lente |
| **AX-S8 → AX-S2/S3** | Restauração de atenção/objetivos/Foco | CX-03/08/09/07 · FLX-05 | Sem autoexecução |
| **\* → AX-H** (overlay) | Ponto crítico | CX-16 · FLX-06 | Pode coexistir com S2…S8 |
| **AX-H → \*** | Limite declarado | CX-16 | Não cria atalho de meios |

#### Transições proibidas (normativas)

| Proibição | Motivo |
|-----------|--------|
| AX-S0 → AX-S3/S4/S5/S6 | Sem lente (PUX-12; FLX-01) |
| AX-S2 → AX-S4 sem passar por intenção governada (AX-S3) quando o trecho exige objetivo | PUX-08; DA-001; FLX-02≺03 |
| Qualquer → “escolha de meios/IA” como estado | PUX-02/08; PAT-01/02 |
| AX-S5 → AX-S6 após rejeição | FLX-03; CX-11 |
| AX-S6 → AX-S4 como “reencaminhar execução pelo efeito” | D4≠D5; ACI-03 |
| Mistura de patrimônios / Foco entre COAs | CX-01; PUX-12 |
| Logout → suspender/cancelar objetivos automaticamente | PAT-03; FLX-05; CX-15 |
| AX-H substituir AX-S5 ou autorizar execução | PUX-10; FLX-06 |

```text
AX-S0 ──► AX-S1 ──► AX-S2 ◄──► AX-S3
                      │           │
                      │           ▼
                      │        AX-S4 ──► AX-S5 ──► AX-S6
                      │           │         │ rejeição
                      │           └─────────┴──► AX-S3/S2
                      │                    │
                      │                    ▼
                      │                 AX-S6 ──► AX-S7 ──► AX-S2/S3
                      │
                 (sessão) AX-S* ──► AX-S8 ──► AX-S1/S2/S3

AX-H = overlay em pontos críticos (não mostrado como ramo substituto)
```

---

### 7.4 Continuidade ao longo do ciclo executivo

| Trecho do ciclo (F2) | Estado(s) AX | Continuidade exigida |
|----------------------|--------------|----------------------|
| Premissa COA | S0→S1 | Sem COA, não há experiência válida do MVP-A |
| Atenção / Intenção / Contexto | S2, S3 | Permanente ancora; Foco não apaga concorrentes |
| Orquestração / Gate / Execução | S4, S5, S6 | Transitório de cumprimento; orquestração invisível |
| Aprendizado / Atualização / Nova Atenção | S7→S2 | Ciclo **não** morre na tarefa (PUX-05) |
| Entre sessões | S8 | Permanente sobrevive; retomada sem autoexecução |
| Honestidade | AX-H | Em qualquer trecho crítico |

**Regra:** concluir tarefa, rejeitar gate ou fechar sessão **encerra trechos**, não o ciclo do COA.

---

### 7.5 Preservação do contexto (COA)

| Regra AX-COA | Enunciado | Rastreio |
|--------------|-----------|----------|
| **AX-COA-01** | Existe **no máximo um** COA ativo na experiência do MVP-A | CX-01; FLX-01; PUX-12 |
| **AX-COA-02** | Atenção, intenção, Foco, âncora, cumprimento e permanente são **sempre** sob a lente ativa | CX-01/03/04/07/09; FLX-01/02 |
| **AX-COA-03** | Troca de COA (quando existir no produto) reinicia atenção no novo COA; **não** mistura patrimônios | CX-01; F2 E-IN-06 / E-OUT-04 |
| **AX-COA-04** | Saída de sessão **não** apaga permanente nem equivale a transição de ciclo de vida de objetivos | CX-15; FLX-05; PUX-05 |
| **AX-COA-05** | Restauração (AX-S8) reafirma a lente antes de retomar S2/S3 | FLX-05; AX-S8→S1 |

---

### 7.6 Relação experiência ↔ CX ↔ FLX

| FLX | Estados AX principais | CX cobertas |
|-----|----------------------|-------------|
| **FLX-01** | S0→S1 | CX-01 |
| **FLX-02** | S1/S2/S3 | CX-03, 04, 05, 07, 08, 09 |
| **FLX-03** | S4/S5/S6 | CX-10, 11, 12 (+ 04/05/07/09) |
| **FLX-04** | S6→S7→S2/S3 | CX-12, 13, 14 (+ 16) |
| **FLX-05** | \*→S8→S1/S2/S3 | CX-15 (+ 01, 03, 07, 08, 09, 16) |
| **FLX-06** | AX-H (overlay) | CX-16 |

**Leitura normativa:** a experiência **percorre** os FLX; não os substitui. Desvio de FLX = inconsistência AX (PUX-02, PUX-06).

---

### 7.7 Critérios arquiteturais de consistência da experiência

| ID | Critério | Verificação |
|----|----------|-------------|
| **AX-C01** | Cobertura do ciclo | S0…S8 + AX-H cobrem O0…O5 + continuidade + honestidade |
| **AX-C02** | Rastreio CX | Todo estado cita CX do MVP-A |
| **AX-C03** | Rastreio FLX | Toda transição permitida cita FLX (ou pré-FLX-01) |
| **AX-C04** | Lente | Nenhuma transição válida parte de S0 para cumprimento/efeito |
| **AX-C05** | Intenção≺meios | Não há caminho canônico S2→S4 sem S3 quando o trecho exige objetivo |
| **AX-C06** | Invisibilidade D4 | Nenhum estado é “escolha de meios” |
| **AX-C07** | Gate | Rejeição bloqueia S6 |
| **AX-C08** | Continuidade | S8 não altera vida de objetivos por logout |
| **AX-C09** | PUX | Cada critério C01–C08 mapeia a ≥1 PUX (abaixo) |
| **AX-C10** | Forma | Documento e decisões sob AX não introduzem tela/layout/wireframe/navegação detalhada/design system/código |

| Critério | PUX |
|----------|-----|
| C01 | PUX-05, PUX-06 |
| C02 | PUX-01 |
| C03 | PUX-02, PUX-06 |
| C04 | PUX-12 |
| C05 | PUX-08 |
| C06 | PUX-02, PUX-08 |
| C07 | PUX-02, PUX-09 |
| C08 | PUX-05 |
| C09 | — (meta) |
| C10 | PUX-11, PUX-03, PUX-07 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001…003 | Intenção; permanente; lente/níveis |
| **F2** | Ciclo contínuo; T≠P; O-03; G-04 | Mecânica do ciclo |
| **F3** | CX-01, 03–05, 07–16 | Capacidades (D-F5-01) |
| **F4** | FLX-01…06; MVA; PAT-01…03, 08, 10, 11 | Comportamento integrado (D-F5-02) |
| **F5** | F5-01…03; PUX-01…12; D-F5; N-F5 | Mandato, canônico, princípios |
| **Este** | AX-S0…S8; AX-H; AX-COA; AX-C; transições | Arquitetura da experiência |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-04); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-04 — Arquitetura da Experiência Canônica (AX) |
| Baseado em quê | Deliberação CTO; F3 CX; F4 FLX/MVA; PUX; F5-02 |
| Resultado | F5-04 **homologada**; AX = referência obrigatória da arquitetura de interação F5; marco AX consolidado; F5-05 aberta |

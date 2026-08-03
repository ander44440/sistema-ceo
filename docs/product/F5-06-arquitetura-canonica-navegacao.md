# F5-06 — Arquitetura Canônica de Navegação

> **Status: Homologada — Gate F5-06 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** AX-S0…S8 · AX-H · INT-01…11 · AX-COA · CX MVP-A · FLX-01…06 · PUX-01…12  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **AX / ACI-X:** F5-04 · F5-05 — **obrigatórias**  
> **Força:** **NAV** (NAV-P · NAV-E · NAV-R · NAV-X · NAV-C) = **referência obrigatória** para toda **Arquitetura de Superfícies** da F5.  
> **Diretrizes / Normas / PUX:** D-F5-01…03 · N-F5-01…03 · PUX-01…12  
> **Marco:** [`marco-base-arquitetural-navegacao.md`](marco-base-arquitetural-navegacao.md)  
> **Proibições neste registro:** sem telas específicas; sem layout; sem componentes gráficos; sem design system; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Arquitetura Canônica de Navegação (NAV)** do MVP-A: tipos canônicos de **percurso**, estados **navegáveis** e transições permitidas, regras de **continuidade e retorno**, preservação do **AX-COA**, restrições e critérios de consistência — com rastreio a **AX**, **INT**, **PUX**, **F3** e **F4**.

**Navegação**, neste artefato, significa **deslocamento arquitetural no ciclo de experiência** (onde o utilizador pode estar e para onde pode ir no espaço de estados AX/INT) — **não** menus, rotas de UI, telas ou layout.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Tipificar percursos canônicos de navegação.  
* Definir estados navegáveis e transições permitidas/proibidas.  
* Definir continuidade e retorno (incl. sessão e COA).  
* Garantir AX-COA em todo percurso.  
* Definir restrições e critérios de consistência da navegação.  
* Manter rastreabilidade AX / INT / PUX / F3 / F4.

### Não compete a este artefato

* Telas específicas, layouts ou wireframes.  
* Componentes gráficos ou design system.  
* Navegação visual (menus, tabs, deep-links de UI).  
* Código, stack ou implementação (D-F5-03).  
* Alterar AX, INT, PUX, CX ou FLX.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| AX (estados, transições, AX-COA) | Entrada | Permanente | F5-04 |
| INT / IEV / IRT / IRS | Entrada | Permanente | F5-05 |
| PUX; CX; FLX | Entrada | Permanente | F5-03; F3; F4 |
| DA-003 (níveis de abstração) | Entrada | Permanente | F1 |
| Tipos NAV-P · estados NAV-E · regras NAV-R / NAV-C | Saída | Permanente | F5 posteriores (se deliberados); auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-05 (ACI-X) — **obrigatória** | → estrutural |
| Depende de | F5-04 (AX) — **obrigatória** | → estrutural |
| Depende de | F5-03 (PUX); F3; F4 | → estrutural |
| É pré-requisito de | F5 posteriores **somente** se CTO autorizar | ⇢ |
| Relacionada | IRT / transições AX | ↔ — percurso não cria atalhos |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada percurso NAV-P cita INT e estados AX.  
2. Estados navegáveis ⊂ estados AX (ou overlay AX-H).  
3. Continuidade/retorno respeitam AX-COA e INT-09/11.  
4. Nenhuma transição NAV viola IRT ou AX proibidas.  
5. Zero telas/layout/componentes gráficos/design system/código.  
6. Conformidade F5-02, D-F5, PUX, AX, ACI-X.

---

## 6. Restrições arquiteturais

Ver §7.5 (NAV-X). Exceções: N-F5-03.

---

## 7. Arquitetura Canônica de Navegação (NAV)

### 7.1 Tipos canônicos de percurso (NAV-P)

| ID | Percurso | Definição | INT principais | AX | FLX |
|----|----------|-----------|----------------|----|-----|
| **NAV-P01** | Entrada sob lente | Do posto sem COA (ou pós-restauração) até lente ativa | INT-01, INT-09 | S0→S1 (via S8 se sessão) | FLX-01/05 |
| **NAV-P02** | Orientação situacional | Percorrer atenção ↔ intenção no mesmo COA | INT-02, 03, 04 | S1↔S2↔S3 | FLX-02 |
| **NAV-P03** | Cumprimento governado | Da intenção ao efeito, com gate condicional | INT-05…07 | S3→S4→S5?→S6 | FLX-03 |
| **NAV-P04** | Renovação do ciclo | Do efeito à Nova Atenção (e retorno à orientação) | INT-07, 08 | S6→S7→S2/S3 | FLX-04 |
| **NAV-P05** | Continuidade temporal | Encerrar posto e restaurar sem perder permanente | INT-09 | \*→S8→S1… | FLX-05 |
| **NAV-P06** | Mudança de lente | Trocar COA e reiniciar orientação no novo COA | INT-11 | →S0/S1 (novo) | FLX-01 + F-Coa |
| **NAV-P07** | Percurso de honestidade | Overlay de limites em qualquer percurso base | INT-10 | +AX-H | FLX-06 |
| **NAV-P08** | Zoom de abstração | Mudar nível de abstração **sem** perder a lente (DA-003) | INT-02, 03 (mesmo COA) | permanece S1–S3 | FLX-02 |

**Proibido como percurso canônico:** “galeria de meios/ferramentas/IAs”; “inventário sem atenção”; “atalho S0→S4/S6”.

---

### 7.2 Estados navegáveis e transições

#### 7.2.1 Estados navegáveis (NAV-E)

Todo estado navegável é um **AX-S** (ou overlay). Não se criam estados de ecrã.

| NAV-E | = AX | Navegável? | Notas |
|-------|------|------------|-------|
| **NAV-E0** | AX-S0 | Sim (só saída → E1) | Não se “permanece” para cumprir |
| **NAV-E1** | AX-S1 | Sim | Hub de lente |
| **NAV-E2** | AX-S2 | Sim | Atenção |
| **NAV-E3** | AX-S3 | Sim | Intenção / vida / Foco |
| **NAV-E4** | AX-S4 | Sim | Cumprimento em curso |
| **NAV-E5** | AX-S5 | Sim | Gate — retorno só por autorização/rejeição |
| **NAV-E6** | AX-S6 | Sim | Efeito |
| **NAV-E7** | AX-S7 | Sim | Renovação |
| **NAV-E8** | AX-S8 | Sim | Restauração |
| **NAV-EH** | AX-H | Overlay | Não substitui NAV-E base |

#### 7.2.2 Transições navegáveis permitidas

Herdam AX §7.3 e IRT; formulação navegacional:

| Transição | Percurso | Condição |
|-----------|----------|----------|
| E0 → E1 | P01 | INT-01 |
| E8 → E1 → E2/E3 | P01/P05 | INT-09; sem autoexecução |
| E1 ↔ E2 ↔ E3 | P02, P08 | INT-02…04; mesmo COA |
| E3 → E4 | P03 | INT-05; IRT-02 |
| E4 → E5 | P03 | IEV-S03 / O-03 |
| E4 → E6 | P03 | sem gate ou pós-autorização |
| E5 → E6 | P03 | IEV-U06 |
| E5 → E2/E3 | P03 | IEV-U07 — **não** E6 |
| E6 → E7 → E2/E3 | P04 | INT-08 |
| \* → E8 | P05 | INT-09 |
| E* → E0/E1 (novo COA) | P06 | INT-11 |
| \* + EH | P07 | INT-10 |

#### 7.2.3 Transições navegáveis proibidas

| Proibição | Motivo |
|-----------|--------|
| E0 → E3/E4/E5/E6 | Sem lente (AX-C04; IRT-01) |
| E2 → E4 sem E3 quando o trecho exige intenção | PUX-08; IRT-02 |
| E5 → E6 após rejeição | IRT-04 |
| E6 → E4 como “reencaminhar por efeito” | D4≠D5 |
| Qualquer salto para “escolha de meios” | INT proibido; PUX-02/08 |
| P06 misturando patrimônios | AX-COA-03 |
| P05 alterando ciclo de vida por logout | IRT-07; AX-COA-04 |
| P08 trocando COA implicitamente | DA-003 sob mesma lente |

```text
E0 ──► E1 ──► E2 ◄──► E3 ──► E4 ──► E5? ──► E6 ──► E7 ──► E2/E3
              ▲                        │ rejeição
              │                        └──► E2/E3
         P08 (zoom)              P05: * ──► E8 ──► E1…
         P06: * ──► (novo) E0/E1
         P07: EH overlay
```

---

### 7.3 Continuidade e retorno (NAV-R)

| ID | Regra | Enunciado |
|----|-------|-----------|
| **NAV-R01** | Continuidade do ciclo | Concluir P03/P04 **não** encerra o ciclo do COA; P04 devolve a P02 |
| **NAV-R02** | Retorno de gate | Rejeição retorna a E2/E3; autorização avança a E6 |
| **NAV-R03** | Retorno de cumprimento | Após E6, o retorno canônico é P04 (não P03 reverso por meios) |
| **NAV-R04** | Retorno de sessão | P05 restaura E1 antes de E2/E3; permanente intacto |
| **NAV-R05** | Retorno pós-troca de COA | P06 não “volta” ao COA anterior com estado misturado; permanente isolado |
| **NAV-R06** | Retorno de honestidade | Sair de EH não cria atalho de cumprimento |
| **NAV-R07** | Memória de percurso | O sistema pode restaurar posição arquitetural (E2/E3/Foco) sob a **mesma** lente; não restaura trecho de execução automaticamente |
| **NAV-R08** | Zoom reversível | P08 permite ir e voltar de nível de abstração sem quebrar P02 nem AX-COA |

---

### 7.4 Preservação do AX-COA

| AX-COA | Na navegação |
|--------|--------------|
| **01** | Todo NAV-P02…P05/P07/P08 exige NAV-E1+ no COA ativo |
| **02** | Transições P02–P04/P08 não carregam conteúdo de outro COA |
| **03** | Só P06 troca lente; encerra percursos do COA anterior |
| **04** | P05 não apaga permanente nem equivale a INT-04 automática |
| **05** | P01/P05: E8→E1 antes de retomar E2/E3 |

---

### 7.5 Restrições arquiteturais da navegação (NAV-X)

| ID | Restrição |
|----|-----------|
| **NAV-X01** | Proibido definir telas específicas, layout ou wireframes neste artefato e sob NAV até deliberação |
| **NAV-X02** | Proibido componentes gráficos ou design system |
| **NAV-X03** | Proibido tratar navegação como menu/rota de UI — só percursos de estado/interação |
| **NAV-X04** | Proibido percurso de escolha de meios/IA |
| **NAV-X05** | Proibido violar AX, IRT ou FLX |
| **NAV-X06** | Proibido absorver evolutivas (CX-02/06/17/18) sem deliberação |
| **NAV-X07** | Proibido código/stack/IMP (D-F5-03) |

---

### 7.6 Critérios arquiteturais de consistência (NAV-C)

| ID | Critério | Verificação |
|----|----------|-------------|
| **NAV-C01** | Cobertura | P01…P08 cobrem lente, ciclo, sessão, COA, honestidade, zoom |
| **NAV-C02** | Rastreio AX | Cada NAV-E = AX-S / AX-H |
| **NAV-C03** | Rastreio INT | Cada NAV-P cita INT |
| **NAV-C04** | Rastreio CX/FLX | Cada NAV-P cita FLX (e CX via INT/AX) |
| **NAV-C05** | AX-COA | P01…P08 respeitam AX-COA-01…05 |
| **NAV-C06** | Continuidade | NAV-R01…08 coerentes com PUX-05 e FLX-04/05 |
| **NAV-C07** | Sem atalhos proibidos | Nenhuma transição §7.2.3 presente como permitida |
| **NAV-C08** | Subordinação ACI-X | Conformidade IRT-01…10 |
| **NAV-C09** | PUX | PUX-05, 06, 08, 09, 12 (e 01/02 via CX/FLX) |
| **NAV-C10** | Forma | Sem telas/layout/componentes gráficos/design system/código |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **AX** | AX-S; AX-H; AX-COA; transições | Espaço navegável |
| **INT** | INT-01…11; IRT; IEV | Atos que realizam percursos |
| **PUX** | PUX-01…12 | Princípios |
| **F3** | CX MVP-A | Capacidades |
| **F4** | FLX-01…06; MVA | Comportamento integrado |
| **F1** | DA-003 | Zoom de abstração (P08) |
| **F5** | F5-01…05 | Mandato → ACI-X |
| **Este** | NAV-P · NAV-E · NAV-R · NAV-X · NAV-C | Arquitetura de navegação |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-06); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-06 — Arquitetura Canônica de Navegação |
| Baseado em quê | AX; ACI-X; PUX; CX; FLX; DA-003 |
| Resultado | F5-06 **homologada**; NAV = referência obrigatória da Arquitetura de Superfícies F5; Base Arquitetural da Navegação consolidada; F5-07 aberta |

# F5-05 — Arquitetura Canônica de Interação

> **Status: Homologada — Gate F5-05 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** AX-S0…S8 · AX-H · AX-COA · CX MVP-A · FLX-01…06 · PUX-01…12  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **AX:** [`F5-04-arquitetura-experiencia-canonica.md`](F5-04-arquitetura-experiencia-canonica.md) — **obrigatória** p/ arquitetura de interação  
> **Força:** **ACI-X** (INT · IEV · IRT · IRS · INT-C) = **referência obrigatória** para toda arquitetura de **navegação** da F5.  
> **Diretrizes / Normas / PUX:** D-F5-01…03 · N-F5-01…03 · PUX-01…12  
> **Marco:** [`marco-base-arquitetural-interacao.md`](marco-base-arquitetural-interacao.md)  
> **Proibições neste registro:** sem telas; sem navegação visual; sem componentes gráficos; sem design system; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Arquitetura Canônica de Interação (ACI-X)** do MVP-A: tipos canônicos de interação utilizador↔sistema, eventos arquiteturais, regras de transição entre interações, responsabilidades de cada parte, preservação do **AX-COA** e critérios de consistência — com rastreio a **AX**, **PUX**, **F3** e **F4**.

> Nota de nomenclatura: **ACI-X** (interação experiencial) ≠ **ACI-01…08** (acoplamento técnico F4-09).

Este artefato descreve **atos e eventos de interação** no plano arquitetural. **Não** descreve telas, navegação visual nem componentes gráficos.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Tipificar interações canônicas utilizador↔sistema.  
* Definir eventos arquiteturais de interação e encadeamentos.  
* Definir regras de transição entre interações (alinhadas a AX).  
* Explicitar responsabilidades do utilizador e do sistema.  
* Garantir preservação AX-COA em toda interação.  
* Definir critérios de consistência da interação.  
* Manter rastreabilidade AX / PUX / F3 / F4.

### Não compete a este artefato

* Telas, navegação visual, menus, rotas ou destinos de UI.  
* Componentes gráficos, tokens ou design system.  
* Layouts, wireframes ou protótipos.  
* Código, stack ou implementação (D-F5-03).  
* Alterar AX, PUX, CX, FLX ou MVA.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| AX (estados, transições, AX-COA, AX-C) | Entrada | Permanente | F5-04 |
| PUX-01…12 | Entrada | Permanente | F5-03 |
| CX MVP-A; FLX-01…06 | Entrada | Permanente | F3; F4 |
| Eventos F2 (E-IN / E-OUT) | Entrada | Permanente | F2-02 |
| Tipos INT · eventos IEV · regras IRT · papéis IRS | Saída | Permanente | F5 posteriores (se deliberados); auditoria |
| Critérios INT-C | Saída | Permanente | Gates F5 |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-04 (AX) — **obrigatória** | → estrutural |
| Depende de | F5-03 (PUX); F5-02 | → estrutural |
| Depende de | F3 CX; F4 FLX | → estrutural |
| Depende de | F2-02 eventos | → estrutural |
| É pré-requisito de | F5 posteriores **somente** se CTO autorizar | ⇢ |
| Relacionada | AX transições / FLX | ↔ — interação não inventa atalhos |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada tipo INT cita estado(s) AX e CX/FLX.  
2. Cada IEV cita origem (utilizador/sistema) e transição AX permitida.  
3. Nenhuma regra IRT viola AX-COA nem FLX.  
4. Responsabilidades IRS não atribuem escolha de meios ao utilizador nem execução a D4.  
5. Zero telas/navegação visual/componentes gráficos/design system/código.  
6. Conformidade F5-02, D-F5, PUX, AX.

---

## 6. Restrições arquiteturais

* Interação ≠ navegação visual.  
* Evento de interação ≠ clique/coordenada — é ato arquitetural.  
* Overlay de honestidade não autoriza execução.  
* Exceções: N-F5-03.

---

## 7. Arquitetura Canônica de Interação (ACI-X)

### 7.1 Tipos canônicos de interação (INT)

| ID | Tipo | Definição | Quem inicia | AX | CX | FLX |
|----|------|-----------|-------------|----|----|-----|
| **INT-01** | Estabelecer lente | Ativar/confirmar o COA sob o qual toda interação ocorre | Utilizador (ou restauração que reafirma) | S0→S1 | CX-01 | FLX-01 |
| **INT-02** | Orientar atenção | Percibir/selecionar o que exige atenção no COA | Utilizador ↔ Sistema | S1/S2 | CX-03, 09 | FLX-02 |
| **INT-03** | Declarar / conduzir intenção | Formular ou refinar objetivo/intenção via conversa | Utilizador (sistema ancora) | S2↔S3 | CX-04, 05, 07 | FLX-02 |
| **INT-04** | Governar vida / Foco | Criar/ativar/suspender/retomar/concluir/cancelar; ordenar Foco | Utilizador (sistema aplica regras) | S3 | CX-08, 09 | FLX-02 |
| **INT-05** | Pedir cumprimento | Solicitar que a intenção seja cumprida **sem** escolher meios | Utilizador | S3→S4 | CX-10 | FLX-03 |
| **INT-06** | Autorizar / rejeitar | Decidir em gate sob risco/irreversibilidade/ambiguidade | Utilizador | S5 | CX-11 | FLX-03 |
| **INT-07** | Perceber efeito | Tomar conhecimento do efeito/bloqueio da execução | Sistema → Utilizador | S6 | CX-12 | FLX-03 |
| **INT-08** | Julgar promoção / Nova Atenção | Aceitar renovação situacional; promoção permanece seletiva no sistema | Utilizador ↔ Sistema | S6→S7→S2 | CX-13, 14 | FLX-04 |
| **INT-09** | Encerrar / restaurar sessão | Sair do posto sem apagar permanente; retomar sob lente | Utilizador ↔ Sistema | \*→S8→S1… | CX-15 | FLX-05 |
| **INT-10** | Explicitar limites | Declarar incerteza, “não sei/não posso”, não consolidado | Sistema (utilizador reconhece) | AX-H | CX-16 | FLX-06 |
| **INT-11** | Trocar COA | Mudar lente; reinicia atenção; não mistura patrimônios | Utilizador | →S0/S1 (novo) | CX-01 | FLX-01 (+ F-Coa) |

**Proibido como tipo canônico:** “escolher ferramenta / modelo / provedor / meio” (PUX-08; PAT-01).

---

### 7.2 Eventos arquiteturais de interação (IEV)

Eventos delimitam **atos** — alinhados a E-IN/E-OUT (F2) quando aplicável, sem depender de UI.

#### 7.2.1 Eventos iniciados pelo utilizador

| ID | Evento | INT | AX (efeito típico) | F2 (âncora) |
|----|--------|-----|--------------------|-------------|
| **IEV-U01** | Confirmar / ativar COA | INT-01 | S0→S1 | E-IN-01 / E-IN-06 |
| **IEV-U02** | Selecionar foco de atenção | INT-02 | S1/S2 | E-IN-03 |
| **IEV-U03** | Declarar ou alterar intenção | INT-03 | →S3 | E-IN-02 |
| **IEV-U04** | Ato de ciclo de vida / Foco | INT-04 | permanece S3 (±S2) | — (G-01…03) |
| **IEV-U05** | Pedir cumprimento da intenção | INT-05 | S3→S4 | E-IN-02→orquestração |
| **IEV-U06** | Autorizar gate | INT-06 | S5→S6 | E-IN-05 |
| **IEV-U07** | Rejeitar gate | INT-06 | S5→S3/S2 (**não** S6) | E-IN-05 / E-OUT-03 |
| **IEV-U08** | Sair do posto (sessão) | INT-09 | →S8 | E-OUT-05 |
| **IEV-U09** | Reabrir posto | INT-09 | S8→S1… | E-IN-01 |
| **IEV-U10** | Trocar COA | INT-11 | reinício sob nova lente | E-IN-06 / E-OUT-04 |

#### 7.2.2 Eventos iniciados pelo sistema

| ID | Evento | INT | AX (efeito típico) | F2 (âncora) |
|----|--------|-----|--------------------|-------------|
| **IEV-S01** | Projetar / renovar atenção | INT-02 / 08 | S2 / S7→S2 | Nova Atenção |
| **IEV-S02** | Ancorar intenção no permanente | INT-03 | S3 | Contexto |
| **IEV-S03** | Exigir gate (O-03) | INT-06 | S4→S5 | O-03 |
| **IEV-S04** | Encaminhar meios (invisível) | — (não é interação de escolha) | permanece S4 | FLX-03 |
| **IEV-S05** | Tornar efeito perceptível | INT-07 | →S6 | E-IN-07 |
| **IEV-S06** | Apresentar candidato / Nova Atenção | INT-08 | S6→S7→S2 | F-Ret |
| **IEV-S07** | Restaurar estado sob lente | INT-09 | S8→S1/S2/S3 | FLX-05 |
| **IEV-S08** | Explicitar limite / incerteza | INT-10 | +AX-H | FLX-06 |
| **IEV-S09** | Bloquear cumprimento sem lente/intenção | — | permanece / →S1 ou S3 | AX-C04/C05 |

**IEV-S04** é evento de sistema **sem** superfície de escolha — a interação do utilizador **não** inclui selecionar o meio.

---

### 7.3 Regras de transição entre interações (IRT)

| ID | Regra | Enunciado |
|----|-------|-----------|
| **IRT-01** | Lente primeiro | Nenhuma INT-03…08 válida sem INT-01 vigente (AX-S1+) |
| **IRT-02** | Intenção antes de cumprimento | INT-05 exige INT-03 (e INT-04 quando Foco/Ativado for pré-condição FLX-03) |
| **IRT-03** | Cumprimento sem meios | INT-05 **não** pode ser seguida de interação de escolha de meios |
| **IRT-04** | Gate condicional | INT-06 só após IEV-S03; rejeição (IEV-U07) **proíbe** INT-07 no mesmo trecho |
| **IRT-05** | Efeito após autorização ou ausência de gate | INT-07 só via IEV-U06 ou caminho S4→S6 sem O-03 |
| **IRT-06** | Renovação após efeito | INT-08 sucede INT-07 (ou julgamento sem promoção — AX-H se não consolidado) |
| **IRT-07** | Sessão não mata ciclo | INT-09 não dispara INT-04 de suspensão/cancelamento automática |
| **IRT-08** | Honestidade não substitui gate | INT-10 não equivale a INT-06 nem autoriza INT-07 |
| **IRT-09** | Troca de COA prevalece | INT-11 encerra trechos do COA anterior; permanente isolado (AX-COA-03) |
| **IRT-10** | Subordinação AX | Toda transição INT deve mapear a transição AX **permitida**; se AX proíbe, IRT proíbe |

```text
INT-01 → INT-02 ↔ INT-03 → INT-04
                │
                ▼
             INT-05 → (IEV-S04 invisível) → INT-06? → INT-07 → INT-08 → INT-02
                │                              │ rejeição
                │                              └──► INT-02/03
             INT-09 (sessão) · INT-10 (overlay) · INT-11 (nova lente)
```

---

### 7.4 Responsabilidades utilizador ↔ sistema (IRS)

| ID | Responsabilidade | Utilizador | Sistema |
|----|------------------|------------|---------|
| **IRS-01** | Lente COA | Confirma/escolhe COA ativo; troca explícita | Mantém isolamento; recusa mistura |
| **IRS-02** | Atenção | Orientar-se / selecionar foco de atenção | Projetar quadro situacional sob COA |
| **IRS-03** | Intenção | Declarar e conduzir objetivo | Ancorar; não antecipar meios |
| **IRS-04** | Vida / Foco | Atos de governança de objetivos | Aplicar regras; Foco ≠ cancelar concorrentes |
| **IRS-05** | Cumprimento | Pedir cumprimento | Encaminhar **invisivelmente**; **nunca** pedir escolha de meios |
| **IRS-06** | Gate | Autorizar ou rejeitar | Pausar; não executar se rejeitado |
| **IRS-07** | Efeito | Perceber e decidir próximo ato | Tornar efeito/bloqueio perceptível |
| **IRS-08** | Patrimônio | Não trata logout como apagar memória | Promoção **seletiva**; permanente sobrevive |
| **IRS-09** | Continuidade | Reabre e retoma | Restaura sob lente; sem autoexecução |
| **IRS-10** | Honestidade | Não exigir fingimento de certeza | Explicitar limites (INT-10) |

---

### 7.5 Preservação do AX-COA

| Regra | Aplicação na interação |
|-------|------------------------|
| **AX-COA-01** | Toda INT-02…10 ocorre sob um único COA ativo (INT-01) |
| **AX-COA-02** | IEV de atenção/intenção/cumprimento/efeito carregam a lente; sistema rejeita ato cross-COA |
| **AX-COA-03** | INT-11 / IEV-U10 reinicia; permanente do COA anterior não migra |
| **AX-COA-04** | INT-09 / IEV-U08 não apaga permanente |
| **AX-COA-05** | IEV-S07 reafirma lente antes de INT-02/03 |

**Falha AX-COA em qualquer INT = interação inválida (INT-C04).**

---

### 7.6 Critérios arquiteturais de consistência da interação

| ID | Critério | Verificação |
|----|----------|-------------|
| **INT-C01** | Cobertura | INT-01…11 cobrem ciclo + sessão + honestidade + troca de COA |
| **INT-C02** | Rastreio AX | Cada INT cita estado AX |
| **INT-C03** | Rastreio CX/FLX | Cada INT cita CX e FLX |
| **INT-C04** | AX-COA | Nenhuma INT válida viola AX-COA-01…05 |
| **INT-C05** | IRT↔AX | IRT-01…10 não contradizem transições AX proibidas |
| **INT-C06** | Sem seletor de meios | Nenhum INT/IEV/IRS atribui escolha de meios ao utilizador |
| **INT-C07** | Gate | IEV-U07 bloqueia INT-07 no trecho |
| **INT-C08** | Encaminhamento invisível | IEV-S04 sem interação de escolha |
| **INT-C09** | PUX | Conformidade PUX-01,02,05,06,08,09,10,12 |
| **INT-C10** | Forma | Sem telas, navegação visual, componentes gráficos, design system, código |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **AX** | AX-S0…S8; AX-H; AX-COA; AX-C; transições | Referência obrigatória de interação |
| **PUX** | PUX-01…12 | Princípios |
| **F3** | CX-01, 03–05, 07–16 | Capacidades |
| **F4** | FLX-01…06; MVA; PAT-01/02/10/11 | Comportamento integrado |
| **F2** | E-IN / E-OUT; F-Sit…F-Coa | Eventos conceituais |
| **F5** | F5-01…04; D-F5; N-F5 | Mandato → AX |
| **Este** | INT · IEV · IRT · IRS · INT-C | Arquitetura de interação |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-05); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-05 — Arquitetura Canônica de Interação |
| Baseado em quê | AX; PUX; CX; FLX; F2 eventos |
| Resultado | F5-05 **homologada**; ACI-X = referência obrigatória da arquitetura de navegação F5; Base Arquitetural da Interação consolidada; F5-06 aberta |

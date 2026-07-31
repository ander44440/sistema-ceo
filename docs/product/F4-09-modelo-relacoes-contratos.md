# F4-09 — Modelo Canônico de Relações e Contratos Arquiteturais

> **Status: Homologada — Gate F4-09 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CMP-001…014 · RTB-01…08 · L0–L5 · Tx · CX MVP-A · CAT-001…018  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Inventário:** [`F4-08-inventario-componentes-arquiteturais.md`](F4-08-inventario-componentes-arquiteturais.md) — **referência oficial**  
> **Força:** este Modelo = **referência obrigatória** para as interações entre componentes.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Marco:** [`marco-modelo-relacoes-arquiteturais-consolidado.md`](marco-modelo-relacoes-arquiteturais-consolidado.md)  
> **Proibições:** sem APIs; sem protocolos; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir o **Modelo Canônico de Relações e Contratos Arquiteturais**: tipos de relação entre componentes, **contratos de alto nível** (obrigações conceituais), regras de dependência/acoplamento/isolamento e rastreabilidade obrigatória — **sem** APIs, protocolos, tecnologias ou infraestrutura.

**Contrato arquitetural (neste modelo):** acordo normativo entre dois ou mais CMP sobre *o que* um deve oferecer e *o que* o outro pode exigir, em linguagem de estado/ato/obrigação — não endpoint, schema ou mensagem de rede.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Tipificar relações permitidas entre CMP.  
* Definir contratos de alto nível (CAT) entre pares/fluxos de componentes.  
* Estabelecer regras de dependência, acoplamento e isolamento (incl. COA).  
* Exigir rastreio contrato → CMP → RTB → camada → CX.  
* Orientar F4-10+ (instanciação detalhada de contratos, ainda sem API).

### Não compete a este artefato

* Especificar APIs, OpenAPI, gRPC, tópicos, filas ou payloads.  
* Escolher protocolos, serializers ou middlewares.  
* Implementar ou amarrar infraestrutura.  
* Alterar inventário CMP, RTB ou camadas.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Inventário CMP-001…014 + deps F4-08 | Entrada | Permanente | F4-08 |
| C1–C10; deps camadas | Entrada | Permanente | F4-05 |
| D1–D6 componentização | Entrada | Permanente | F4-07 |
| Tipos REL; catálogo CAT; regras ACI | Saída | Permanente (norma) | F4-10+ |
| Matriz de rastreio de contratos | Saída | Permanente | Auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-08 (CMP oficiais) | → estrutural |
| Depende de | F4-05, F4-06, F4-07 | → estrutural |
| Depende de | F3 / PAT | → estrutural |
| É pré-requisito de | F4-10+ (contratos detalhados / fluxos) | → |
| Relacionada | Comunicação entre camadas C1–C10 | ↔ — contratos não violam C1–C10 |

---

## 5. Critérios de validação técnica

1. Tipos REL cobrem o grafo lícito de F4-08 sem autorizar deps proibidas.  
2. Cada CAT cita provedor, consumidor, obrigação, classe P/T/Ato e rastreio.  
3. Regras ACI preservam L4≠L5, lente COA e isolamento.  
4. Zero API/protocolo/tech; conformidade F4-02 / D-F4 / N-F4.  
5. Rastreabilidade F1/F2/F3/PAT explícita.

---

## 6. Restrições arquiteturais

* Contrato não é licença para expor orquestração (CMP-010) como superfície.  
* Contrato não autoriza promoção automática total (CMP-008).  
* Contrato não contorna gate (CMP-011).  
* Exceções: N-F4-03.

---

## 7. Modelo canônico

### 7.1 Tipos de relações permitidas (REL)

| ID | Tipo | Significado | Exemplo típico |
|----|------|-------------|----------------|
| **REL-S** | Estrutural (→) | A requer B para existir/operar sob premissa | Qualquer CMP → CMP-001 (lente) |
| **REL-C** | Ciclo (⇒) | A produz candidato que B consome no ciclo contínuo | CMP-012 ⇒ CMP-008 |
| **REL-G** | Governança (⇢) | A consolida/autoriza estado que B ordena ou libera | CMP-005 ⇢ CMP-006; CMP-010 ⇢ CMP-011 |
| **REL-T** | Transversal (↔) | A e B cooperam sem hierarquia de ciclo | CMP-014 ↔ pontos críticos |
| **REL-P** | Pedido (→ ato) | A emite ato de usuário/intenção para B | CMP-003 → CMP-009 |
| **REL-E** | Encaminhamento (→) | A libera execução em B sem transferir orquestração | CMP-010/011 → CMP-012 |
| **REL-V** | Visibilidade (→) | A projeta estado perceptível para B (comando) | CMP-012 → CMP-002 |
| **REL-R** | Restauração/Renovação (→) | A restaura ou renova quadro/estado em B | CMP-013 → CMP-002 |

**Relações proibidas (além de F4-05/08):** REL que inverta execução→encaminhamento; REL de “escolha de meio”; REL que misture permanentes de COAs distintos; REL oculta (sem CAT).

---

### 7.2 Contratos arquiteturais de alto nível (CAT)

Todo CAT declara:

| Campo | Obrigatório |
|-------|-------------|
| **ID** | `CAT-nnn` |
| **Provedor** | CMP-… |
| **Consumidor** | CMP-… (ou “ciclo/Tx”) |
| **Tipo REL** | Um de §7.1 |
| **Obrigação do provedor** | O que garante (estado/ato) |
| **Direito do consumidor** | O que pode exigir |
| **Classe** | Permanente / Transitório / Ato |
| **Não inclui** | O que explicitamente fica de fora |
| **Rastreio** | RTB, Camada, CX, PAT |

#### Catálogo canônico (MVP-A)

| ID | Provedor → Consumidor | REL | Obrigação (síntese) | Classe | CX |
|----|----------------------|-----|---------------------|--------|-----|
| **CAT-001** | CMP-001 → (todos) | REL-S | COA ativo identificável; isolamento | Permanente | CX-01 |
| **CAT-002** | CMP-007 → CMP-002 | REL-S | Recorte permanente para o quadro | Permanente | CX-07, CX-03 |
| **CAT-003** | CMP-007 → CMP-004/009 | REL-S | Âncora de contexto para intenção/pedido | Permanente | CX-07, CX-04/10 |
| **CAT-004** | CMP-003 → CMP-004 | REL-P / ↔ | Atos conversacionais de intenção | Ato | CX-05, CX-04 |
| **CAT-005** | CMP-004 → CMP-005 | REL-G | Objetivo formulado elegível a vida | Ato→P | CX-04, CX-08 |
| **CAT-006** | CMP-005 → CMP-006 | REL-G | Conjunto de Ativados elegíveis a Foco | Permanente | CX-08, CX-09 |
| **CAT-007** | CMP-006 → CMP-009 | REL-S | Foco vigente (ou ausência explícita) como pré-condição | Permanente | CX-09, CX-10 |
| **CAT-008** | CMP-003/004 → CMP-009 | REL-P | Pedido de cumprimento sem escolha de meio | Ato | CX-05/04, CX-10 |
| **CAT-009** | CMP-009 → CMP-010 | REL-E | Pedido interpretável para encaminhamento | Transitório | CX-10 |
| **CAT-010** | CMP-010 → CMP-011 | REL-G | Encaminhamento sujeito a gate quando O-03 | Transitório | CX-10, CX-11 |
| **CAT-011** | CMP-010/011 → CMP-012 | REL-E | Encaminhamento autorizado (ou sem gate) | Transitório | CX-10/11, CX-12 |
| **CAT-012** | CMP-012 → CMP-002/003 | REL-V | Efeito/bloqueio/em curso em linguagem de comando | Transitório | CX-12, CX-03/05 |
| **CAT-013** | CMP-012 → CMP-008 | REL-C | Candidato a promoção (não patrimônio ainda) | Transitório | CX-12, CX-13 |
| **CAT-014** | CMP-008 → CMP-013 | REL-C | Permanente atualizado (quando houver promoção) | Permanente | CX-13, CX-14 |
| **CAT-015** | CMP-013 → CMP-002 | REL-R | Nova Atenção / quadro renovado | Permanente projetado | CX-14, CX-03 |
| **CAT-016** | CMP-013 → CMP-001/005/006/007 | REL-R | Restauração inter-sessões do estado governado | Permanente | CX-15 |
| **CAT-017** | CMP-014 ↔ CMP-003/009…013 | REL-T | Sinais de limite/incerteza/pré-promoção | Transitório | CX-16 |
| **CAT-018** | CMP-011 → CMP-003/002 | REL-V / REL-P | Pedido de autorização compreensível; ato autorizar/rejeitar | Ato | CX-11 |

**Não inclui (global aos CAT):** payloads de rede; nomes de endpoints; escolha de ferramenta pelo consumidor; plano interno de meios exposto a CMP-002/003.

---

### 7.3 Dependência, acoplamento e isolamento (ACI)

| ID | Regra |
|----|-------|
| **ACI-01** | Dependência entre CMP só via CAT catalogado (ou emenda deliberada). |
| **ACI-02** | Acoplamento **fraco** entre L4 e L1: CMP-010 não é dependência de superfície; só desfechos/gates via CAT-012/018. |
| **ACI-03** | Acoplamento **proibido** CMP-012 → CMP-010 (execução não orquestra). |
| **ACI-04** | Isolamento de COA: todo CAT que leia/escreva permanente inclui obrigação CAT-001; proibido vazar permanente entre COAs. |
| **ACI-05** | Classe Transitório não atravessa sessão como Permanente (salvo pendência honesta via CMP-014/013). |
| **ACI-06** | Gate (CMP-011) não pode ser contornado por composição de CAT. |
| **ACI-07** | Preferir dependência de **obrigação** (o que é garantido) a dependência de **estrutura interna** do provedor. |
| **ACI-08** | Ciclos no grafo de CAT do fluxo Objetivo→…→Nova Atenção são proibidos; Tx pode realimentar L1 sem reabrir L4↔L5 invertido. |

---

### 7.4 Rastreabilidade obrigatória de cada contrato

| Eixo | Obrigatório |
|------|-------------|
| **CAT-nnn** | ID estável |
| **CMP** provedor e consumidor | Do inventário F4-08 |
| **REL** | Tipo §7.1 |
| **RTB** | Dos CMP envolvidos |
| **Camada(s)** | L0–L5 / Tx |
| **CX** | Uma ou mais |
| **PAT** | Aplicáveis |
| **F1/F2/F3/F4** | DA/mecanismo/F3-02/F4-05…08 |
| **Classe P/T/Ato** | Sim |

**Matriz mínima:**

| CAT | Provedor | Consumidor | REL | RTB | Camadas | CX | Classe |
|-----|----------|------------|-----|-----|---------|-----|--------|
| … | … | … | … | … | … | … | … |

---

### 7.5 Diagrama de relações (ciclo principal)

```text
CMP-001 (lente)
    │
CMP-007 ──► CMP-002
    │
CMP-003 ◄──► CMP-004 ──► CMP-005 ──► CMP-006
    │              │
    └─────► CMP-009 ──► CMP-010 ──► CMP-011? ──► CMP-012
                                      │              │
                                      │              ├──► CMP-002/003
                                      │              └──► CMP-008 ──► CMP-013 ──► CMP-002
CMP-014 ◄─────────────────────────────┴──────────────────────────────┘
```

---

## 8. Rastreabilidade (deste artefato)

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 (CAT-008…011); DA-002 (CAT-013…016); DA-003 (CAT-001) | Diretrizes |
| **F2** | Ciclo; T≠P; D4≠D5; O-03 | Conceito |
| **F3** | CX nas CAT | Funcional |
| **PAT** | PAT-01,02,04,07,10,11 | Princípios |
| **F4** | F4-05 C1–C10; F4-07 D; F4-08 CMP | Base |
| **Este modelo** | REL · CAT-001…018 · ACI | Relações e contratos |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-09 — Relações e Contratos; F4-08 homologada |
| Baseado em quê | F4-08; F4-07; F4-05; PAT; F2-02 |
| Resultado | F4-09 **homologada**; REL/CAT/ACI obrigatórios para interações; marco consolidado; F4-10 aberta |

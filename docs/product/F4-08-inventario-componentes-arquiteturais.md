# F4-08 — Inventário Canônico de Componentes Arquiteturais

> **Status: Homologada — Gate F4-08 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16 · RTB-01…RTB-08 · CMP-001…014  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Componentização:** [`F4-07-modelo-canonico-componentizacao.md`](F4-07-modelo-canonico-componentizacao.md) — **obrigatória**  
> **Força:** este Inventário = **referência oficial** dos componentes da Arquitetura Técnica.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Marco:** [`marco-inventario-componentes-consolidado.md`](marco-inventario-componentes-consolidado.md)  
> **Proibições:** sem contratos neste registro; sem APIs; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Publicar o **Inventário Canônico** dos **componentes arquiteturais de alto nível** do CEO (MVP-A): identidade, RTB predominante, camada, CX suportadas e conformidade com CMP/G/D/R — **sem** contratos, APIs, tecnologias ou implementação.

Este inventário responde: *quais unidades lógico-técnicas existem no mapa?* — não *como se integram em runtime*.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Identificar componentes de alto nível (CMP-001…).  
* Associar cada um a **um** RTB e à(s) camada(s) cabíveis.  
* Rastrear CX suportadas.  
* Declarar conformidade com F4-07 (CMP-01…07, G1–G6, D1–D6, R1–R6).  
* Servir de índice para specs detalhadas posteriores (sem contratos neste gate).

### Não compete a este artefato

* Definir contratos, interfaces, APIs ou schemas.  
* Escolher tecnologias ou infraestrutura.  
* Detalhar fluxos de implementação ou código.  
* Alterar RTB, camadas, CX ou critérios F4-07.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Critérios CMP/G/D/R | Entrada | Permanente | F4-07 |
| RTB-01…08; L0–L5; Tx | Entrada | Permanente | F4-06; F4-05 |
| Specs CX MVP-A | Entrada | Permanente | F3 |
| Inventário CMP-001…014 | Saída | Permanente | F4-09+; ARQ futuros |
| Matriz de rastreio | Saída | Permanente | Auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-07 | → estrutural |
| Depende de | F4-06, F4-05 | → estrutural |
| Depende de | F3-04 / specs CX | → estrutural |
| É pré-requisito de | Specs/contratos de componente (futuros, sob deliberação) | → |
| Relacionada | Dependências entre componentes (§7.3) | ↔ — respeitam D1–D6 e F4-05 |

---

## 5. Critérios de validação técnica

1. Cada CMP tem exatamente um RTB; camada coerente com F4-06 §7.2.  
2. Toda CX MVP-A aparece em ≥1 componente; sem CX evolutiva.  
3. Nenhum componente mistura RTB-05 e RTB-06.  
4. Conformidade declarada com CMP/G/D/R; responsabilidade única (G1).  
5. Zero contratos/APIs/tech/infra; conformidade F4-02 / D-F4 / N-F4.

---

## 6. Restrições arquiteturais

* Inventário = alto nível; proibido detalhe de implementação neste artefato.  
* Proibido componente “seletor de meios/IA”.  
* Novos CMP fora desta lista exigem emenda + deliberação.  
* Exceções: N-F4-03.

---

## 7. Inventário canônico

### 7.1 Catálogo (alto nível)

| ID | Componente | Responsabilidade única (uma frase) |
|----|------------|-------------------------------------|
| **CMP-001** | Lente de COA Ativo | Estabelecer e manter o único COA ativo que recorta o sistema |
| **CMP-002** | Quadro de Atenção | Projetar o quadro situacional do COA (Foco, alertas, ecos relevantes) |
| **CMP-003** | Porta de Conversa | Conduzir a conversa como interface principal de intenção e atos do usuário |
| **CMP-004** | Formulador de Objetivo/Intenção | Declarar e conduzir objetivo/intenção antes de meios |
| **CMP-005** | Ciclo de Vida de Objetivos | Governar criar/ativar/suspender/retomar/concluir/cancelar |
| **CMP-006** | Ordenador de Foco | Selecionar e manter o Foco entre objetivos Ativados |
| **CMP-007** | Âncora de Conhecimento | Consultar e ancorar o permanente do COA |
| **CMP-008** | Promotor Seletivo | Promover seletivamente Transitório → Permanente |
| **CMP-009** | Solicitador de Meios | Aceitar o pedido de cumprimento da intenção sem expor meios |
| **CMP-010** | Encaminhador Invisível | Decidir e encaminhar meios sem superfície de escolha |
| **CMP-011** | Gate de Autorização Humana | Pausar para autorizar/rejeitar sob risco/irreversibilidade/ambiguidade |
| **CMP-012** | Executor de Efeito | Executar a ação autorizada e tornar efeito/bloqueio perceptível |
| **CMP-013** | Renovador de Atenção e Sessão | Renovar Nova Atenção pós-atualização e restaurar estado entre sessões |
| **CMP-014** | Explicitador de Limites | Explicitar limites, incerteza e estados ainda não consolidados |

### 7.2 Matriz obrigatória — RTB · Camada · CX · PAT

| Componente | RTB | Camada(s) | CX | PAT principais |
|------------|-----|-----------|----|----------------|
| CMP-001 | RTB-01 | L0 | CX-01 | PAT-05, PAT-07 |
| CMP-002 | RTB-02 | L1 | CX-03 | PAT-08 |
| CMP-003 | RTB-02 | L1 | CX-05 | PAT-01, PAT-08 |
| CMP-004 | RTB-03 | L2 | CX-04 | PAT-01, PAT-09 |
| CMP-005 | RTB-03 | L2 | CX-08 | PAT-09 |
| CMP-006 | RTB-03 | L2 | CX-09 | PAT-09 |
| CMP-007 | RTB-04 | L3 | CX-07 | PAT-03, PAT-04 |
| CMP-008 | RTB-04 | L3 | CX-13 | PAT-03, PAT-04 |
| CMP-009 | RTB-05 | L4 | CX-10 | PAT-01, PAT-02 |
| CMP-010 | RTB-05 | L4 | CX-10 | PAT-01, PAT-02 |
| CMP-011 | RTB-05 | L4 | CX-11 | PAT-02, PAT-10 |
| CMP-012 | RTB-06 | L5 | CX-12 | PAT-02, PAT-04 |
| CMP-013 | RTB-07 | Tx | CX-14, CX-15 | PAT-03, PAT-08 |
| CMP-014 | RTB-08 | Tx | CX-16 | PAT-11 |

**Cobertura CX:** 01, 03, 04, 05, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16 — completa no MVP-A.  
**Nota CMP-009/010:** ambos em RTB-05/CX-10 — responsabilidades distintas (pedido vs encaminhamento invisível); não fundem com CMP-012 (G6 / PAT-02).

### 7.3 Fronteiras (*Não compete* — síntese)

| ID | Não compete (síntese) |
|----|------------------------|
| CMP-001 | Conteúdo de atenção; vida de objetivos; execução |
| CMP-002 | Governar Foco/vida; conversa como centro; execução |
| CMP-003 | Quadro de Atenção; ciclo de vida; meios/execução |
| CMP-004 | Suspender/concluir (CMP-005); ordenar Foco (CMP-006); meios |
| CMP-005 | Declarar intenção pura (CMP-004); Foco (CMP-006); execução |
| CMP-006 | Alterar ciclo de vida; escolher meios |
| CMP-007 | Promover (CMP-008); executar |
| CMP-008 | Executar; promover plano de orquestração por padrão |
| CMP-009 | Decidir meios (CMP-010); gate (CMP-011); executar |
| CMP-010 | Executar (CMP-012); ser superfície de escolha; gravar plano como permanente |
| CMP-011 | Executar; escolher meios; esconder-se só em telemetria |
| CMP-012 | Encaminhar; promover; substituir Atenção |
| CMP-013 | Suspender por logout; reexecutar automaticamente; honestidade pura (CMP-014) |
| CMP-014 | Promover; executar; substituir donos de RTB |

### 7.4 Dependências permitidas entre componentes (alto nível)

Conforme D1–D6 e F4-05; grafo acíclico no ciclo:

| De | Para | Tipo | Nota |
|----|------|------|------|
| Todos (mutação/leitura de contexto) | CMP-001 | → | Lente COA |
| CMP-007 | CMP-002, CMP-004, CMP-009 | → | Âncora / recorte |
| CMP-003 | CMP-004 | ↔ | Intenção via conversa |
| CMP-004 | CMP-005 | ⇢ | Consolidação de vida |
| CMP-005 | CMP-006 | ⇢ | Ativados elegíveis a Foco |
| CMP-003 / CMP-004 | CMP-009 | → | Pedido de meios |
| CMP-006 / CMP-005 | CMP-009 | → | Pré-condições Foco/Ativado |
| CMP-009 | CMP-010 | → | Pedido → encaminhamento |
| CMP-010 | CMP-011 | ⇢ condicional | Gate quando O-03 |
| CMP-010 / CMP-011 | CMP-012 | → | Encaminhamento autorizado |
| CMP-012 | CMP-002 / CMP-003 | → | Efeito perceptível |
| CMP-012 | CMP-008 | ⇒ | Candidato a promoção |
| CMP-008 | CMP-013 | → | Atualização → Nova Atenção |
| CMP-013 | CMP-001, CMP-002, CMP-005, CMP-006, CMP-007 | → | Restauração / renovação |
| CMP-014 | CMP-003, CMP-009…012, CMP-013 | ↔ | Honestidade nos pontos críticos |

**Proibido:** CMP-012 → CMP-010 (execução orquestra); CMP-010 → superfície de escolha; CMP-008 promoção total automática de andamento.

### 7.5 Conformidade F4-07 (declaração)

| Família | Conformidade |
|---------|----------------|
| **CMP-01…07** | Cada linha do inventário: um RTB; camada correta; CX do RTB; responsabilidade única; inspecionável; sem redefinir CX; sem tech |
| **G1–G6** | Uma frase de responsabilidade; RTB-07/08 separados (CMP-013 ≠ CMP-014); sem tubo sem responsabilidade; sem misturar encaminhar/executar |
| **D1–D6** | Dependências §7.4 alinhadas a F4-05; lente CMP-001; acíclico no ciclo |
| **R1–R6** | Composição só no fluxo permitido; sem contornar gate; sem evolutivas |

### 7.6 DA (F1) por componente (amostra normativa)

| DA | Componentes que a realizam tecnicamente |
|----|----------------------------------------|
| DA-001 | CMP-004, CMP-009, CMP-010 (intenção antes / meios invisíveis) |
| DA-002 | CMP-007, CMP-008, CMP-013 |
| DA-003 | CMP-001 (lente preservada; zoom fino evolutivo fora do inventário) |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001…003 §7.6 | Diretrizes |
| **F2** | D1–D5 via camadas; ciclo; T≠P; D4≠D5 | Conceito |
| **F3** | CX §7.2 | Funcional |
| **PAT** | §7.2 | Princípios |
| **F4** | F4-05…07; Fundação de Componentização | Método |
| **Este inventário** | CMP-001…014 | Componentes de alto nível |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-08 — Inventário de Componentes; F4-07 homologada |
| Baseado em quê | F4-07 CMP/G/D/R; F4-06; F4-05; F3 |
| Resultado | F4-08 **homologada**; inventário referência oficial; marco consolidado; F4-09 aberta |

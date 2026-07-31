# F4-11 — Especificação Canônica dos Componentes Arquiteturais

> **Status: Homologada — Gate F4-11 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: (1) **modelo** de especificação canônica de componentes — **obrigatório**; (2) especificações CMP-001…014 — **homologadas** neste gate.  
> **Inventário oficial:** [`F4-08-inventario-componentes-arquiteturais.md`](F4-08-inventario-componentes-arquiteturais.md)  
> **IFA / CAT:** F4-10 · F4-09 — **obrigatórios**  
> **Marco:** [`marco-base-especificacao-arquitetural.md`](marco-base-especificacao-arquitetural.md)  
> **Proibições:** sem APIs; sem protocolos; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## Parte A — Modelo canônico de especificação de componente

### A.1 Objetivo do modelo

Padronizar **como** cada CMP do inventário F4-08 é especificado, de forma homogênea e rastreável, antes de qualquer contrato de runtime ou implementação.

### A.2 Estrutura obrigatória (dez eixos)

Toda especificação de componente **deve** conter, nesta ordem:

| # | Eixo | Conteúdo |
|---|------|----------|
| 1 | **Identificação** | `CMP-nnn`, nome canônico, versão, status |
| 2 | **Objetivo arquitetural** | Por que o componente existe na Arquitetura Técnica |
| 3 | **RTB predominante** | Exatamente um RTB-01…08 |
| 4 | **Camada arquitetural** | L0–L5 ou Tx (conforme F4-06/08) |
| 5 | **Responsabilidades** | Compete / Não compete |
| 6 | **Interfaces (IFA)** | Categorias IFA que expõe e/ou consome |
| 7 | **Contratos (CAT)** | CAT em que é provedor e/ou consumidor |
| 8 | **Relações (REL)** | Tipos REL permitidos incidentes |
| 9 | **Restrições de acoplamento (ACI)** | ACI aplicáveis + proibições locais |
| 10 | **Rastreabilidade PAT e CX** | PAT e CX obrigatórios |

Campos adicionais permitidos: classe P/T/Ato nas fronteiras; memória organizacional da spec.

### A.3 Template

```markdown
### CMP-nnn — Nome
| Campo | Valor |
|-------|-------|
| Versão / Status | v0.1 — … / Em revisão \| Homologada |
| Objetivo | … |
| RTB | RTB-0n |
| Camada | Lx \| Tx |
| Compete | … |
| Não compete | … |
| IFA (expõe) | … |
| IFA (consome) | … |
| CAT (provedor) | … |
| CAT (consumidor) | … |
| REL | … |
| ACI | … |
| CX | … |
| PAT | … |
```

### A.4 Regras

* Um documento pode agrupar specs (este F4-11) ou haver um ficheiro por CMP — desde que os dez eixos estejam completos.  
* Spec **não oficial** se omitir eixo ou contradisser F4-08…F4-10.  
* Sem APIs/protocolos/tech/infra/implementação.

---

## Parte B — Especificações iniciadas (CMP-001…014)

> Estado coletivo: **Em revisão (Gate F4-11)** — primeira versão canônica consolidada no inventário oficial.

### CMP-001 — Lente de COA Ativo

| Campo | Valor |
|-------|-------|
| **Objetivo** | Garantir um único COA ativo como lente de todo o sistema |
| **RTB** | RTB-01 |
| **Camada** | L0 |
| **Compete** | Estabelecer/manter COA ativo; isolamento entre patrimônios |
| **Não compete** | Atenção; vida de objetivos; execução; meios |
| **IFA expõe** | IFA-01 |
| **IFA consome** | — (premissa); restauração via IFA-09 |
| **CAT provedor** | CAT-001 |
| **CAT consumidor** | CAT-016 (restauração) |
| **REL** | REL-S (para todos); REL-R (de CMP-013) |
| **ACI** | ACI-04, ACI-01; proibido vazamento entre COAs |
| **CX** | CX-01 |
| **PAT** | PAT-05, PAT-07 |

### CMP-002 — Quadro de Atenção

| Campo | Valor |
|-------|-------|
| **Objetivo** | Projetar o quadro situacional do posto de comando |
| **RTB** | RTB-02 |
| **Camada** | L1 |
| **Compete** | Espelhar Foco, alertas, ecos relevantes do COA |
| **Não compete** | Governar Foco/vida; conversa-centro; execução; meios |
| **IFA expõe** | IFA-02 |
| **IFA consome** | IFA-01, IFA-05, IFA-08, IFA-09 |
| **CAT provedor** | — (projeção a L1/usuário via IFA-02) |
| **CAT consumidor** | CAT-002, CAT-012, CAT-015 |
| **REL** | REL-V, REL-R, REL-S |
| **ACI** | ACI-02 (não acoplar a CMP-010); ACI-05 |
| **CX** | CX-03 |
| **PAT** | PAT-08 |

### CMP-003 — Porta de Conversa

| Campo | Valor |
|-------|-------|
| **Objetivo** | Ser a interface principal de intenção e atos do usuário |
| **RTB** | RTB-02 |
| **Camada** | L1 |
| **Compete** | Diálogo de intenção; atos que alimentam governança/pedido/gate |
| **Não compete** | Quadro de Atenção; ciclo de vida; meios/execução |
| **IFA expõe** | IFA-03 |
| **IFA consome** | IFA-01, IFA-08, IFA-07 (gate legível), IFA-09 |
| **CAT provedor** | CAT-004, CAT-008 |
| **CAT consumidor** | CAT-012, CAT-018, CAT-017 |
| **REL** | REL-P, REL-T, REL-V |
| **ACI** | ACI-02; sem seletor de meios |
| **CX** | CX-05 |
| **PAT** | PAT-01, PAT-08 |

### CMP-004 — Formulador de Objetivo/Intenção

| Campo | Valor |
|-------|-------|
| **Objetivo** | Declarar e conduzir objetivo/intenção antes de meios |
| **RTB** | RTB-03 |
| **Camada** | L2 |
| **Compete** | Formulação e condução da intenção |
| **Não compete** | Suspender/concluir; ordenar Foco; meios |
| **IFA expõe** | IFA-03, IFA-04 (entrada à governança) |
| **IFA consome** | IFA-01, IFA-05, IFA-03 |
| **CAT provedor** | CAT-005, CAT-008 |
| **CAT consumidor** | CAT-003, CAT-004 |
| **REL** | REL-G, REL-P, REL-S |
| **ACI** | ACI-07 |
| **CX** | CX-04 |
| **PAT** | PAT-01, PAT-09 |

### CMP-005 — Ciclo de Vida de Objetivos

| Campo | Valor |
|-------|-------|
| **Objetivo** | Governar estados de vida dos objetivos no COA |
| **RTB** | RTB-03 |
| **Camada** | L2 |
| **Compete** | Criar/ativar/suspender/retomar/concluir/cancelar |
| **Não compete** | Intenção pura; Foco; execução |
| **IFA expõe** | IFA-04 |
| **IFA consome** | IFA-01, IFA-03, IFA-09 (restauração) |
| **CAT provedor** | CAT-006 |
| **CAT consumidor** | CAT-005, CAT-016 |
| **REL** | REL-G, REL-R |
| **ACI** | ACI-04; logout ≠ transição de vida |
| **CX** | CX-08 |
| **PAT** | PAT-09 |

### CMP-006 — Ordenador de Foco

| Campo | Valor |
|-------|-------|
| **Objetivo** | Selecionar o Foco entre objetivos Ativados |
| **RTB** | RTB-03 |
| **Camada** | L2 |
| **Compete** | Declarar/mudar Foco; ausência explícita |
| **Não compete** | Alterar ciclo de vida; escolher meios |
| **IFA expõe** | IFA-04, IFA-02 (insumo) |
| **IFA consome** | IFA-01, IFA-04 |
| **CAT provedor** | CAT-007 |
| **CAT consumidor** | CAT-006, CAT-016 |
| **REL** | REL-G, REL-S |
| **ACI** | G-02 (não cancelar concorrentes ao focar) |
| **CX** | CX-09 |
| **PAT** | PAT-09 |

### CMP-007 — Âncora de Conhecimento

| Campo | Valor |
|-------|-------|
| **Objetivo** | Consultar e ancorar o permanente do COA |
| **RTB** | RTB-04 |
| **Camada** | L3 |
| **Compete** | Leitura/âncora do Estado Permanente |
| **Não compete** | Promover; executar; orquestrar |
| **IFA expõe** | IFA-05 |
| **IFA consome** | IFA-01 |
| **CAT provedor** | CAT-002, CAT-003 |
| **CAT consumidor** | CAT-016 |
| **REL** | REL-S, REL-R |
| **ACI** | ACI-04, ACI-05 |
| **CX** | CX-07 |
| **PAT** | PAT-03, PAT-04 |

### CMP-008 — Promotor Seletivo

| Campo | Valor |
|-------|-------|
| **Objetivo** | Promover seletivamente Transitório → Permanente |
| **RTB** | RTB-04 |
| **Camada** | L3 |
| **Compete** | Julgamento/promoção seletiva; não arquivar plano de meios por padrão |
| **Não compete** | Executar; promoção total automática |
| **IFA expõe** | IFA-05 |
| **IFA consome** | IFA-01, IFA-08 (candidato) |
| **CAT provedor** | CAT-014 |
| **CAT consumidor** | CAT-013 |
| **REL** | REL-C |
| **ACI** | ACI-05; PAT-04 |
| **CX** | CX-13 |
| **PAT** | PAT-03, PAT-04 |

### CMP-009 — Solicitador de Meios

| Campo | Valor |
|-------|-------|
| **Objetivo** | Aceitar pedido de cumprimento sem expor meios |
| **RTB** | RTB-05 |
| **Camada** | L4 |
| **Compete** | Pedido e desfecho compreensível do pedido |
| **Não compete** | Decidir meios; gate; executar |
| **IFA expõe** | IFA-06 |
| **IFA consome** | IFA-01, IFA-03, IFA-04, IFA-05, IFA-09 |
| **CAT provedor** | CAT-009 |
| **CAT consumidor** | CAT-007, CAT-008, CAT-003, CAT-017 |
| **REL** | REL-P, REL-E, REL-S, REL-T |
| **ACI** | ACI-02; sem seletor |
| **CX** | CX-10 |
| **PAT** | PAT-01, PAT-02 |

### CMP-010 — Encaminhador Invisível

| Campo | Valor |
|-------|-------|
| **Objetivo** | Decidir e encaminhar meios sem superfície de escolha |
| **RTB** | RTB-05 |
| **Camada** | L4 |
| **Compete** | Encaminhamento invisível a partir do pedido |
| **Não compete** | Executar; UI de meios; gravar plano como permanente |
| **IFA expõe** | IFA-07 |
| **IFA consome** | IFA-06, IFA-01, IFA-05 |
| **CAT provedor** | CAT-010, CAT-011 |
| **CAT consumidor** | CAT-009 |
| **REL** | REL-E, REL-G |
| **ACI** | ACI-02, ACI-03, ACI-07 |
| **CX** | CX-10 |
| **PAT** | PAT-01, PAT-02 |

### CMP-011 — Gate de Autorização Humana

| Campo | Valor |
|-------|-------|
| **Objetivo** | Pausar para autorização humana quando O-03 exigir |
| **RTB** | RTB-05 |
| **Camada** | L4 |
| **Compete** | Pedido de autorização; autorizar/rejeitar; liberar ou abortar encaminhamento |
| **Não compete** | Executar; escolher meios; gate só em telemetria |
| **IFA expõe** | IFA-07 (gate legível via IFA-02/03) |
| **IFA consome** | IFA-07, IFA-01, IFA-09 |
| **CAT provedor** | CAT-011, CAT-018 |
| **CAT consumidor** | CAT-010, CAT-017 |
| **REL** | REL-G, REL-V, REL-P, REL-T |
| **ACI** | ACI-06 |
| **CX** | CX-11 |
| **PAT** | PAT-02, PAT-10 |

### CMP-012 — Executor de Efeito

| Campo | Valor |
|-------|-------|
| **Objetivo** | Executar ação autorizada e tornar efeito perceptível |
| **RTB** | RTB-06 |
| **Camada** | L5 |
| **Compete** | Execução; em curso/efeito/bloqueio em linguagem de comando |
| **Não compete** | Encaminhar; promover; substituir Atenção |
| **IFA expõe** | IFA-08 |
| **IFA consome** | IFA-07, IFA-01 |
| **CAT provedor** | CAT-012, CAT-013 |
| **CAT consumidor** | CAT-011 |
| **REL** | REL-E, REL-V, REL-C |
| **ACI** | ACI-03 |
| **CX** | CX-12 |
| **PAT** | PAT-02, PAT-04 |

### CMP-013 — Renovador de Atenção e Sessão

| Campo | Valor |
|-------|-------|
| **Objetivo** | Fechar o ciclo com Nova Atenção e restaurar estado entre sessões |
| **RTB** | RTB-07 |
| **Camada** | Tx |
| **Compete** | Renovação pós-promoção; restauração inter-sessões |
| **Não compete** | Suspender por logout; reexecutar; honestidade pura (CMP-014) |
| **IFA expõe** | IFA-09, IFA-02 |
| **IFA consome** | IFA-05, IFA-01 |
| **CAT provedor** | CAT-015, CAT-016 |
| **CAT consumidor** | CAT-014 |
| **REL** | REL-R, REL-C |
| **ACI** | ACI-05; G-04 |
| **CX** | CX-14, CX-15 |
| **PAT** | PAT-03, PAT-08 |

### CMP-014 — Explicitador de Limites

| Campo | Valor |
|-------|-------|
| **Objetivo** | Explicitar limites, incerteza e transitório não consolidado |
| **RTB** | RTB-08 |
| **Camada** | Tx |
| **Compete** | Sinais honestos nos pontos críticos |
| **Não compete** | Promover; executar; substituir donos de RTB |
| **IFA expõe** | IFA-09 |
| **IFA consome** | IFA-01; pontos IFA-03/06/07/08 |
| **CAT provedor** | CAT-017 |
| **CAT consumidor** | — (atravessa) |
| **REL** | REL-T |
| **ACI** | ACI-05 |
| **CX** | CX-16 |
| **PAT** | PAT-11 |

---

## Parte C — Validação e restrições deste gate

### C.1 Critérios de validação

1. Modelo (Parte A) com dez eixos obrigatórios.  
2. Specs CMP-001…014 iniciadas com os dez eixos preenchidos.  
3. Coerência com F4-08…F4-10; cobertura CX MVP-A.  
4. Zero API/protocolo/tech/infra/implementação.  
5. Conformidade F4-02 / D-F4 / N-F4.

### C.2 Restrições

* Emendas a CMP individuais em versões posteriores não alteram inventário sem deliberação.  
* Detalhamento adicional (cenários, critérios UXC) não introduz stack.  
* Exceções: N-F4-03.

### C.3 Rastreabilidade do artefato F4-11

| Eixo | Referências |
|------|-------------|
| F1 | DA via PAT/CX nas specs |
| F2 | Camadas / ciclo / T≠P |
| F3 | CX por CMP |
| F4 | F4-08…10; Fundação Canônica |
| PAT | Por CMP (Parte B) |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-11 — modelo de spec + início CMP-001…014; F4-10 homologada |
| Baseado em quê | F4-08…F4-10; F4-02; Fundação Canônica |
| Resultado | F4-11 **homologada**; modelo de spec obrigatório; Base de Especificação consolidada; F4-12 aberta |

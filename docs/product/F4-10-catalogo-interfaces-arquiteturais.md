# F4-10 — Catálogo Canônico de Interfaces Arquiteturais

> **Status: Homologada — Gate F4-10 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CMP-001…014 · CAT-001…018 · RTB · L0–L5 · Tx · CX MVP-A · IFA-01…09  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Relações/Contratos:** [`F4-09-modelo-relacoes-contratos.md`](F4-09-modelo-relacoes-contratos.md) — **obrigatório**  
> **Força:** este Catálogo IFA = **referência obrigatória** para todos os pontos de interação da Arquitetura Técnica.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Marco:** [`marco-fundacao-canonica-arquitetura-tecnica.md`](marco-fundacao-canonica-arquitetura-tecnica.md)  
> **Proibições:** sem APIs; sem protocolos; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Publicar o **Catálogo Canônico de Interfaces Arquiteturais**: categorias de interface (IFA), responsabilidades/limites, regras de exposição e consumo, critérios de estabilidade/evolução e rastreabilidade a CAT/CMP/RTB/camada/CX — **sem** APIs, protocolos, tecnologias ou infraestrutura.

**Interface arquitetural (neste catálogo):** fronteira conceitual pela qual um componente **expõe** obrigações e outro **consome** — classificada por natureza do que atravessa a fronteira (lente, atenção, intenção, permanente, encaminhamento, efeito, etc.), não por transporte técnico.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Definir categorias IFA e seus limites.  
* Regras de exposição (provedor) e consumo (consumidor).  
* Critérios de estabilidade e evolução das interfaces.  
* Rastreio obrigatório IFA → CAT → CMP → RTB → camada → CX.  
* Orientar F4-11+ (detalhamento por interface, ainda sem API).

### Não compete a este artefato

* Especificar REST/GraphQL/gRPC, tópicos, schemas ou SDKs.  
* Escolher protocolos, formatos ou infraestrutura.  
* Implementar ou versionar código.  
* Alterar CAT/CMP/RTB/camadas.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| CAT-001…018; REL; ACI | Entrada | Permanente | F4-09 |
| CMP-001…014 | Entrada | Permanente | F4-08 |
| C1–C10 | Entrada | Permanente | F4-05 |
| Catálogo IFA-01…09; regras EXP/EVO | Saída | Permanente (norma) | F4-11+ |
| Matriz IFA ↔ CAT | Saída | Permanente | Auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-09 (CAT/REL/ACI) | → estrutural |
| Depende de | F4-08, F4-07, F4-05 | → estrutural |
| Depende de | F3 / PAT | → estrutural |
| É pré-requisito de | F4-11+ (specs de interface) | → |
| Relacionada | Contratos CAT | ↔ — cada IFA agrupa CAT de mesma natureza |

---

## 5. Critérios de validação técnica

1. Toda CAT homologada mapeia a ≥1 IFA.  
2. Categorias não autorizam exposição de meios (IFA de encaminhamento permanece invisível ao usuário).  
3. Regras EXP/EVO e rastreio completos; zero API/protocolo/tech.  
4. Conformidade F4-02 / D-F4 / N-F4 / ACI.  
5. Rastreabilidade F1/F2/F3/PAT explícita.

---

## 6. Restrições arquiteturais

* Interface ≠ superfície de UX (F5).  
* Interface de encaminhamento ≠ seletor de ferramentas.  
* Evolução de IFA não pode violar PAT-02 (L4≠L5) nem G-04 (sessão≠vida).  
* Exceções: N-F4-03.

---

## 7. Catálogo canônico

### 7.1 Categorias de interfaces arquiteturais (IFA)

| ID | Categoria | Natureza do que atravessa a fronteira |
|----|-----------|----------------------------------------|
| **IFA-01** | Interface de Lente | Identidade do COA ativo; premissa de isolamento |
| **IFA-02** | Interface de Atenção | Quadro situacional / Foco refletido / ecos de comando |
| **IFA-03** | Interface de Intenção | Objetivo/intenção e atos conversacionais de vontade |
| **IFA-04** | Interface de Governança | Estados de vida de objetivos; Foco ordenado |
| **IFA-05** | Interface de Patrimônio | Leitura/âncora de permanente; promoção seletiva |
| **IFA-06** | Interface de Pedido de Meios | Pedido de cumprimento (sem escolha de meio) |
| **IFA-07** | Interface de Encaminhamento e Gate | Encaminhamento invisível; autorização humana |
| **IFA-08** | Interface de Efeito | Em curso / efeito / bloqueio em linguagem de comando |
| **IFA-09** | Interface de Continuidade e Honestidade | Nova Atenção; restauração; limites e transitório |

### 7.2 Responsabilidades e limites por categoria

| IFA | Compete (expor/consumir) | Não compete |
|-----|--------------------------|-------------|
| **IFA-01** | COA ativo; isolamento | Conteúdo de atenção; execução |
| **IFA-02** | Quadro situacional perceptível | Arquivo completo; telemetria bruta; meios |
| **IFA-03** | Intenção/objetivo formulados; atos de diálogo | Ciclo de vida completo; Foco; meios |
| **IFA-04** | Transições de vida; Foco vigente/ausência | Meios; execução; promoção |
| **IFA-05** | Recorte permanente; resultado de promoção seletiva | Plano de orquestração; andamento bruto |
| **IFA-06** | Pedido de cumprimento / desfecho do pedido | Lista de meios; execução |
| **IFA-07** | Encaminhamento autorizado; pedido de gate; ato autorizar/rejeitar | Execução; superfície de escolha de ferramenta |
| **IFA-08** | Efeito perceptível; bloqueio; em curso | Patrimônio automático; orquestração |
| **IFA-09** | Renovação/restauração; sinais de limite/pré-promoção | Reexecução automática; suspender por logout |

### 7.3 Mapeamento IFA ↔ CAT ↔ CMP (provedores típicos)

| IFA | CAT principais | CMP provedores típicos | CMP consumidores típicos |
|-----|----------------|------------------------|--------------------------|
| IFA-01 | CAT-001 | CMP-001 | Todos |
| IFA-02 | CAT-002, CAT-012, CAT-015 | CMP-002, CMP-012, CMP-013 | Usuário via L1; ciclo |
| IFA-03 | CAT-004, CAT-005 | CMP-003, CMP-004 | CMP-004, CMP-005 |
| IFA-04 | CAT-005, CAT-006, CAT-007 | CMP-005, CMP-006 | CMP-006, CMP-009 |
| IFA-05 | CAT-002, CAT-003, CAT-013, CAT-014 | CMP-007, CMP-008 | CMP-002/004/009; CMP-013 |
| IFA-06 | CAT-008, CAT-009 | CMP-009 | CMP-010 |
| IFA-07 | CAT-009, CAT-010, CAT-011, CAT-018 | CMP-010, CMP-011 | CMP-012; L1 (gate) |
| IFA-08 | CAT-012 | CMP-012 | CMP-002, CMP-003 |
| IFA-09 | CAT-015, CAT-016, CAT-017 | CMP-013, CMP-014 | CMP-001/002/005/006/007; pontos críticos |

### 7.4 Regras de exposição e consumo (EXP)

| ID | Regra |
|----|-------|
| **EXP-01** | Só se expõe o que o CAT correspondente autoriza; nada além. |
| **EXP-02** | Consumidor só consome via IFA da categoria correta (não “furar” IFA-07 a partir de IFA-02). |
| **EXP-03** | IFA-07 **não** se expõe ao usuário como escolha de meios; exposição humana limita-se a gate/desfecho (CAT-018 / linguagem de comando). |
| **EXP-04** | IFA-05 não expõe plano de encaminhamento nem dump de execução. |
| **EXP-05** | IFA-08 não substitui IFA-02 (efeito ≠ novo inventário). |
| **EXP-06** | Toda exposição que muta permanente exige IFA-01 (lente) ativa. |
| **EXP-07** | Consumo cruzando COAs é **proibido**. |
| **EXP-08** | Exposição transitória declara classe Transitório; consumidor não a trata como permanente (IFA-09/CMP-014). |

### 7.5 Estabilidade e evolução (EVO)

| ID | Critério |
|----|----------|
| **EVO-01** | **Estável:** obrigação e classe (P/T/Ato) da IFA; IDs IFA/CAT/CMP. |
| **EVO-02** | **Evolução compatível:** esclarecer limites *Não compete* sem remover obrigação já consumida por CAT homologado. |
| **EVO-03** | **Evolução quebrante:** remover/alterar obrigação de CAT ou mudar classe P↔T — exige **MAJOR** + deliberação (N-F4-03). |
| **EVO-04** | Nova IFA só por deliberação; não fragmentar IFA-07 para criar “UI de meios”. |
| **EVO-05** | Evolução deve preservar PAT-01/02/04/07 e ACI-03/04/06. |
| **EVO-06** | Versionamento documental: `vMAJOR.MINOR` alinhado a F4-02 §7; contrato CAT cita versão da IFA quando detalhado em F4-11+. |
| **EVO-07** | Deprecação: CAT/IFA marcada obsoleta permanece citável até substituição homologada. |

### 7.6 Rastreabilidade obrigatória por interface

| Eixo | Obrigatório |
|------|-------------|
| **IFA-nn** | Categoria |
| **CAT** | Um ou mais |
| **CMP** provedor/consumidor | Do inventário |
| **RTB** | Dos CMP |
| **Camada** | L0–L5 / Tx |
| **CX** | Uma ou mais |
| **PAT** | Aplicáveis |
| **REL** | Tipo(s) dos CAT |
| **F1–F4** | DA / F2 / F3 / F4-05…09 |

**Matriz mínima:**

| IFA | CAT | Provedor(es) | Consumidor(es) | RTB | Camada | CX | Estabilidade |
|-----|-----|--------------|----------------|-----|--------|-----|--------------|
| … | … | … | … | … | … | … | EVO-01… |

---

## 8. Rastreabilidade (deste artefato)

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 → IFA-06/07; DA-002 → IFA-05/09; DA-003 → IFA-01 | Diretrizes |
| **F2** | Ciclo; T≠P; D4≠D5; O-03 | Conceito |
| **F3** | CX por IFA §7.3 | Funcional |
| **PAT** | PAT-01,02,04,07,10,11 | Princípios |
| **F4** | F4-09 CAT; F4-08 CMP; Relações consolidadas | Base |
| **Este catálogo** | IFA-01…09; EXP; EVO | Interfaces |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-10 — Catálogo de Interfaces; F4-09 homologada |
| Baseado em quê | F4-09; F4-08; F4-05; PAT |
| Resultado | F4-10 **homologada**; IFA obrigatórias; Fundação Canônica consolidada; F4-11 aberta |

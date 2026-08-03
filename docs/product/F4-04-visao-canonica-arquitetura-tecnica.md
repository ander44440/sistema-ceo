# F4-04 — Visão Canônica da Arquitetura Técnica

> **Status: Homologada — Gate F4-04 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios oficiais:** PAT-01…PAT-12  
> **Força:** esta Visão = **macroestrutura oficial** do CEO (camadas L0–L5 + Tx).  
> **Marco:** [`marco-estrutura-canonica-arquitetura-tecnica.md`](marco-estrutura-canonica-arquitetura-tecnica.md)  
> **Proibições:** sem componentes concretos; sem tecnologias; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Visão Canônica** da Arquitetura Técnica do CEO: a **macroestrutura** em camadas lógico-técnicas, suas responsabilidades e dependências — traduzindo F1–F3 e PAT-01…12 em um mapa de camadas **sem** nomear componentes, stack, APIs ou infraestrutura.

Este artefato responde: *como o sistema se organiza em camadas para realizar o MVP-A?* — não *com qual tecnologia*.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Definir a macroestrutura técnica em **camadas** (L0…L5 + transversais).  
* Atribuir responsabilidades por camada, alinhadas a D1–D5 e CX.  
* Explicitar relações e dependências entre camadas.  
* Demonstrar rastreabilidade a F1, F2, F3 e PAT-01…12.  
* Orientar F4-05+ (detalhamento de módulos/contextos) sem contradizer F3.

### Não compete a este artefato

* Inventariar componentes, serviços, bibliotecas ou telas.  
* Definir APIs, protocolos, schemas ou topologia de rede.  
* Escolher tecnologias ou fornecedores (PAT-12).  
* Alterar CX, precedências ou PAT (D-F4-02).  
* Produzir UX/UI (D-F4-03 / F5).  
* Detalhar contratos internos de módulo (artefatos posteriores).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Fundação Normativa F4 (mandato, canônico, PAT) | Entrada | Permanente | F4-01…03 |
| Domínios D1–D5 + lente COA | Entrada | Permanente | F2-01 |
| Ciclo / T≠P / D4≠D5 | Entrada | Permanente | F2-02 |
| Specs CX MVP-A + F3-02 | Entrada | Permanente | F3 |
| DA-001…003 | Entrada | Permanente | F1 |
| Macroestrutura em camadas L0…L5 + Tx | Saída | Permanente (visão) | F4-05+; futuros ARQ |
| Grafo de dependências entre camadas | Saída | Permanente | Validação / desenho posterior |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-01, F4-02, F4-03 | → estrutural |
| Depende de | F2-01…F2-04; F3-01…04; DA | → estrutural |
| É pré-requisito de | F4-05+ (módulos/contextos sob as camadas) | → |
| Relacionada | CX MVP-A | ↔ — cada CX realiza-se em uma ou mais camadas |

**Precedência de montagem (espelho F3-02):** L0 antes de tudo; patrimônio (L3) e comando (L1) antes de encaminhamento (L4); execução (L5) após encaminhamento; continuidade (Tx) amarra o tempo.

---

## 5. Critérios de validação técnica

1. Camadas cobrem o MVP-A sem deixar CX órfã e sem inventar camada de “escolha de meios”.  
2. D4≠D5 preservado (L4 ≠ L5).  
3. Lente COA (L0) é transversal e obrigatória.  
4. Cada camada cita PAT e CX; matriz F1/F2/F3 completa (N-F4-02).  
5. Ausência total de tech/componentes/APIs/infra.  
6. Conformidade D-F4 / N-F4 / F4-02.

---

## 6. Restrições arquiteturais

* Não fundir L4 (encaminhamento) com L5 (execução).  
* Não tornar L4 superfície de comando (PAT-01, PAT-02).  
* Não tratar L3 como log efêmero nem L5 como substituto de Atenção.  
* Não absorver evolutivas (multi-COA rico, etc.) na macroestrutura MVP-A.  
* Exceções à visão exigem deliberação formal (N-F4-03).

---

## 7. Visão canônica — macroestrutura

### 7.1 Diagrama de camadas

```text
                    ┌──────────────────────────────────────┐
                    │  L0 — Lente COA (transversal)         │
                    │  um contexto ativo; isolamento        │
                    └──────────────────────────────────────┘
                                      │ recorta
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ L1 — Comando     │◄────►│ L2 — Governança  │      │ L3 — Patrimônio  │
│ Atenção+Conversa │      │ Objetivos/Foco   │◄────►│ Conhecimento     │
│ (D1+D2)          │      │ (vida + Foco)    │      │ Permanente (D3)  │
└────────┬─────────┘      └────────┬─────────┘      └────────▲─────────┘
         │ intenção                │ Ativado/Foco            │ promoção
         ▼                         ▼                         │
┌──────────────────┐      ┌──────────────────┐               │
│ L4 — Encaminha-  │─────►│ L5 — Execução    │───────────────┘
│ mento (D4)       │      │ e Efeito (D5)    │  efeito candidato
│ invisível+gates  │      │                  │
└──────────────────┘      └──────────────────┘

        Tx — Continuidade e Honestidade (transversal ao ciclo e ao tempo)
        Nova Atenção · Sessões · Limites/transitório
```

### 7.2 Camadas — responsabilidades

| ID | Camada | Responsabilidade única | Não compete |
|----|--------|------------------------|-------------|
| **L0** | **Lente COA** | Estabelecer e manter o **único COA ativo** que recorta todas as demais camadas; garantir isolamento | Ser um “sexto domínio” de conteúdo; multi-COA rico (evolutivo) |
| **L1** | **Comando (Atenção + Conversa)** | Materializar o posto: quadro situacional e conversa como interface principal de intenção | Arquivo morto; seletor de meios; execução |
| **L2** | **Governança de Objetivos** | Ciclo de vida dos objetivos e Foco executivo no COA | Escolher meios; executar; promover patrimônio |
| **L3** | **Patrimônio (Conhecimento)** | Consultar/ancorar permanente; receber promoção seletiva; sobreviver a tarefa/sessão | Andamento bruto de execução; plano de orquestração como memória |
| **L4** | **Encaminhamento** | Interpretar pedido de meios; decidir/encaminhar **invisivelmente**; gates humanos quando O-03 | Executar; expor escolha de ferramenta; ser home do usuário |
| **L5** | **Execução e Efeito** | Executar a ação autorizada; tornar efeito/bloqueio perceptível em linguagem de comando | Promover ao permanente; orquestrar meios |
| **Tx** | **Continuidade e Honestidade** | Renovar Nova Atenção pós-atualização; continuidade entre sessões; explicitar limites e transitório | Substituir L1–L5; fingir conclusão |

### 7.3 Relações e dependências entre camadas

| De → Para | Natureza | Obrigações |
|-----------|----------|------------|
| **L0 → todas** | Estrutural (lente) | Sem L0 ativo, demais camadas não operam no MVP-A |
| **L3 → L1** | Alimenta atenção | Permanente projeta quadro situacional |
| **L3 → L2** | Âncora | Objetivos/Foco vivem no permanente do COA |
| **L3 → L4** | Recorte | Encaminhamento lê contexto; não grava patrimônio no lugar de L3 |
| **L1 ↔ L2** | Intenção / Foco | Conversa declara; governança consolida vida/Foco |
| **L1 → L4** | Pedido de meios | Intenção clara sob Foco/Ativado |
| **L2 → L4** | Pré-condição | Só objetivo Ativado + Foco coerente |
| **L4 → L5** | Encaminhamento | D4 nunca executa; L5 só após encaminhamento (+ gate se aplicável) |
| **L5 → L3** | Candidato a promoção | Efeito transitório; promoção seletiva (não automática) |
| **L3 → L1 (via Tx)** | Nova Atenção | Após atualização, Tx renova o quadro |
| **Tx ↔ L0/L2/L3** | Inter-sessões | Restaura lente, vida/Foco e permanente; logout ≠ suspender |
| **Tx ↔ L1/L4/L5** | Honestidade | Limites, gate legível, transitório ≠ permanente |

**Anti-dependências (proibidas):** L5 → L4 como “orquestração na execução”; L4 → L1 como superfície; L5 → L3 promoção total automática; qualquer camada → escolha de meios pelo usuário.

### 7.4 Mapeamento camadas ↔ CX (MVP-A)

| Camada | CX primárias | CX de apoio |
|--------|--------------|-------------|
| L0 | CX-01 | — (CX-02 evolutiva) |
| L1 | CX-03, CX-05 | CX-14 (renovação do quadro), CX-16 |
| L2 | CX-04, CX-08, CX-09 | — |
| L3 | CX-07, CX-13 | CX-15 (restaura permanente) |
| L4 | CX-10, CX-11 | CX-16 |
| L5 | CX-12 | — |
| Tx | CX-14, CX-15, CX-16 | — |

### 7.5 Ciclo contínuo atravessando as camadas

```text
L2/L1  Objetivo/Intenção
  → L3 Contexto
    → L4 Encaminhamento (+ gate)
      → L5 Execução/Efeito
        → L3 Aprendizado/Promoção (seletiva)
          → Tx/L1 Nova Atenção
```

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 → L4 invisível / intenção antes de meios; DA-002 → L3/Tx; DA-003 → L0 preservada em qualquer zoom | Derivação |
| **F2** | D1–D5 ↔ L1…L5; COA ↔ L0; ciclo F2-02; T≠P; D4≠D5 | Alinhamento |
| **F3** | CX conforme §7.4; F3-02 precedências | Aderência |
| **PAT** | PAT-01 (L1→L4); PAT-02 (L4≠L5); PAT-03/04 (L3); PAT-05 (L0); PAT-06 (visão⊂F3); PAT-07 (L0); PAT-08 (ciclo); PAT-09 (L2); PAT-10 (L4 gate); PAT-11 (Tx); PAT-12 (visão sem tech) | Princípios oficiais |
| **F4** | F4-01…03; Fundação Normativa | Mandato |
| **PX/IX** | PX-02/04/06; IX-01/03/04/05/06/07/09 | Invariantes |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-04 — Visão Canônica; F4-03 homologada; Fundação Normativa |
| Baseado em quê | F4-02; PAT-01…12; F2-01/02; F3; DA |
| Resultado | F4-04 **homologada**; macroestrutura oficial; Estrutura Canônica consolidada; F4-05 aberta |

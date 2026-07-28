# F6-02 — Arquitetura do Ecossistema Executivo

> **Status: Homologada — Gate F6-02 APROVADO (CTO, 28/07/2026).**  
> **Versão:** v0.1 — 28/07/2026 (homologada)  
> Natureza: **arquitetura de alto nível do ecossistema** (estratégica / organizacional).  
> Sede: **IPR-001**.  
> Visão: [`F6-01-visao-do-ecossistema-executivo.md`](F6-01-visao-do-ecossistema-executivo.md) — **Gate F6-01 aprovado**.  
> Mandato: [`F6-00-mandato-fase-f6.md`](F6-00-mandato-fase-f6.md).  
> **Não é** arquitetura técnica (F4), UX/UI (F5), REQ, backlog, IMP nem ADR.  
> **Próximo artefato:** [`F6-03-modelo-evolutivo-do-ecossistema-executivo.md`](F6-03-modelo-evolutivo-do-ecossistema-executivo.md) — aguarda Gate F6-03.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O mapa de responsabilidades e relações entre Core Executivo e os quatro domínios do ecossistema. |
| **Por que existe?** | Sem este mapa, Product, Business, Governance e Intelligence competem por autoridade ou fragmentam o CEO. |
| **Para quem?** | CTO (gate); Usuário (clareza estratégica); Engenheiro (fronteira para F6-03/F6-04). |
| **Sucesso?** | Fica inequívoco: o que cada domínio faz, o que não faz, e como o Core permanece único e protegido. |

---

## 1. Propósito desta arquitetura

A Arquitetura do Ecossistema Executivo descreve **como o ecossistema se organiza**, não como o software se implementa.

Ela fixa:

1. o **Core Executivo** como elemento comum e protegido;  
2. as **responsabilidades** de cada domínio estruturante;  
3. as **relações** permitidas e proibidas entre domínios;  
4. o modo como **especializações futuras** se conectam ao Core **sem o alterar**.

Herda a visão de F6-01. Não a repete. Não redesenha F1–F5.

---

## 2. Core Executivo — elemento comum e protegido

### 2.1 O que é (neste nível)

O **Core Executivo** é o núcleo de identidade e condução do CEO: a lógica permanente que governa colaboração Human + IA, contexto, decisão e execução sob um único sistema.

Neste documento, o Core é tratado como **invariante organizacional** — não como stack, módulo de código ou superfície de UI.

### 2.2 Papel arquitetural

| O Core é | O Core não é |
|----------|--------------|
| Centro comum a todos os domínios | Propriedade exclusiva de um domínio |
| Referência de identidade do CEO | Um “produto Business” paralelo |
| Protegido por Governance | Alterável por Intelligence sozinha |
| Base de onde derivam especializações | Um template que cada especialização reescreve |

### 2.3 Proteção (princípio)

> **Nenhum domínio altera o Core por conta própria.**  
> Mudança estrutural do Core exige **Governance** (e deliberação formal nos termos do programa).  
> Domínios **operam sobre**, **apresentam** ou **aprendem com** o Core — não o substituem.

---

## 3. Os quatro domínios — responsabilidades

### 3.1 CEO Product

**Missão:** tornar o Core **utilizável** no trabalho diário.

| Responsável por | Não responsável por |
|-----------------|---------------------|
| Experiência de uso do Gabinete / produto | Estratégia comercial como sede |
| Capacidades operacionais de uso | Redefinir a identidade do Core |
| Continuidade do contexto de trabalho do usuário | Autorizar mudanças estruturais do Core |
| Materializar o Core na prática | Substituir Governance ou Intelligence |

Product é a face cotidiana do Core. Amplia profundidade de uso; não bifurca o CEO.

### 3.2 CEO Business

**Missão:** expandir e demonstrar o **valor** do Core perante o mundo, sem criar um segundo CEO.

| Responsável por | Não responsável por |
|-----------------|---------------------|
| Posicionamento e demonstração de valor | Arquitetura do Core |
| Relação empresarial / comercial do ecossistema | Priorizar features que contradigam Governance |
| Narrativa de entrada (“a primeira reunião é com o CEO”) | Orquestrar IAs fora dos limites de Governance |
| Canalizar demanda de mercado para o programa | Transformar o Core em funil improvisado |

Business **orbita** o Core. Não compete com Product como identidade alternativa.

### 3.3 CEO Governance

**Missão:** proteger o Core e arbitrar o que pode mudar.

| Responsável por | Não responsável por |
|-----------------|---------------------|
| Limites, autoridade e rastreabilidade | Executar o trabalho diário do usuário (Product) |
| Gates e homologações que afetam o Core | Campanhas ou canais de aquisição (Business) |
| Subordinação de Intelligence e Business ao Core | Ser a sede de aprendizado contínuo (Intelligence) |
| Coerência com o programa estratégico (IPR-001) | Inventar produto paralelo |

Governance é o **fiador da unidade**. Sem ela, o ecossistema vira coleção de iniciativas.

### 3.4 CEO Intelligence

**Missão:** aprender e propor — **sob** Governance — para fortalecer o Core e os demais domínios.

| Responsável por | Não responsável por |
|-----------------|---------------------|
| Observação, hipótese e aprendizado contínuo | Alterar o Core sem gate |
| Uso estruturado de sinais (incl. mercado, quando pertinente) | Definir UX ou arquitetura técnica por conta própria |
| Apoiar deliberação com evidência | Substituir a autoridade humana / Governance |
| Alimentar Product e Business com insight homologável | Operar como “CEO paralelo” |

Intelligence é estruturante e **obrigatória** na arquitetura do ecossistema. Não é licença de autonomia estrutural.

---

## 4. Como os domínios se relacionam

### 4.1 Mapa de relações

```text
                    ┌──────────────────────┐
                    │   CORE EXECUTIVO     │
                    │  (comum, protegido)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         Product            Business       Intelligence
         opera o            apresenta /    observa /
         Core no uso        expande valor  propõe
              │                │                │
              └────────────┬───┴────────────────┘
                           ▼
                      Governance
                   protege o Core
                   e arbitra mudança
```

### 4.2 Relações permitidas (resumo)

| De → Para | Relação |
|-----------|---------|
| **Product → Core** | Usa e aprofunda sem redefinir identidade |
| **Business → Core** | Demonstra e posiciona; devolve demanda ao programa |
| **Intelligence → Core** | Observa e propõe melhorias; não aplica sozinha |
| **Governance → Core** | Protege; autoriza ou bloqueia mudança estrutural |
| **Intelligence → Governance** | Submete propostas relevantes a gate |
| **Business → Governance** | Expansão comercial respeita limites do Core |
| **Product ↔ Intelligence** | Product fornece uso real; Intelligence devolve aprendizado |
| **Business ↔ Product** | Business não redefine Product; Product não vira GTM |

### 4.3 Relações proibidas (resumo)

| Proibição | Motivo |
|-----------|--------|
| Business altera Core | Fragmenta identidade |
| Intelligence altera Core sem Governance | Quebra proteção |
| Product absorve Business/Intelligence como “tudo no app” sem fronteira | Confunde responsabilidades |
| Quatro identidades de CEO | Viola Core único (F6-01) |
| Marketplace como eixo de relação entre domínios | Não é fundacional (F6-00 / F6-01) |

### 4.4 Fluxo típico de tensão (exemplo conceitual)

1. **Product** revela necessidade no uso.  
2. **Intelligence** formula hipótese.  
3. **Governance** decide se há impacto no Core.  
4. Se não há impacto estrutural, Product (e, se autorizada, uma Onda Operacional) evolui o uso.  
5. **Business** comunica valor sem antecipar mudança não homologada.

Isso não é processo de implementação: é **arquitetura de autoridade**.

---

## 5. Especializações — conexão ao Core sem alterá-lo

### 5.1 O que são

Especializações (ex.: **Legal**, **Health**, **Industry**) são **modos de expansão** do ecossistema: adaptações de linguagem, prioridade e contexto **derivadas do mesmo Core**.

Não são domínios estruturantes.  
Não são novos Cores.  
Não são produtos concorrentes.

### 5.2 Como se conectam

```text
  Core Executivo (inalterado)
           │
           ├── Especialização Legal      ⎫
           ├── Especialização Health     ⎬  derivam / adaptam
           └── Especialização Industry   ⎭  não reescrevem
```

| Regra | Significado |
|-------|-------------|
| **Derivação** | Especialização herda identidade e lógica do Core |
| **Adaptação** | Ajusta ênfase e vocabulário ao domínio de aplicação |
| **Não alteração** | Não muda o núcleo comum; não cria “CEO Legal” separado |
| **Governance** | Qualquer especialização que force mudança estrutural do Core passa por Governance |
| **Product** | Materializa a especialização no uso **sobre** o Core |
| **Intelligence** | Pode detectar padrão de domínio e **propor** especialização; não a institui sozinha |

### 5.3 O que a especialização não faz

* Não justifica fork do Core.  
* Não autoriza o usuário a “escolher outro CEO”.  
* Não transforma Marketplace em pré-requisito (Marketplace, se existir, continua sendo consequência futura — fora desta arquitetura fundacional).

Detalhamento de plataforma e modelo evolutivo: F6-03 / F6-04 — fora deste documento.

---

## 6. Síntese arquitetural (uma página mental)

| Elemento | Papel |
|----------|-------|
| **Core** | Único, comum, protegido |
| **Product** | Uso |
| **Business** | Valor e expansão empresarial |
| **Governance** | Limites e autoridade |
| **Intelligence** | Aprendizado e proposta sob Governance |
| **Especializações** | Expansão derivada, sem alterar o Core |

Em uma frase:

> **A arquitetura do ecossistema é a órbita de quatro domínios em torno de um Core Executivo único — com Governance como guardiã e especializações como derivações, nunca como substitutos.**

---

## Encerramento deste artefato

Este F6-02 define **apenas** a arquitetura de alto nível do ecossistema.

**Não** define modelo evolutivo (F6-03), plataforma detalhada (F6-04) nem estratégia de expansão (F6-05).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO autorizou após Gate F6-01 |
| Quando | 28/07/2026 |
| Por quê | Fixar responsabilidades e relações dos domínios antes de F6-03+ |
| Baseado em quê | F6-00; F6-01 homologada; restrições CTO (sem ARQ técnica / REQ / backlog / IMP / ADR) |
| Resultado | F6-02 **homologada** (Gate F6-02); F6-03 elaborado e aguarda Gate F6-03 |

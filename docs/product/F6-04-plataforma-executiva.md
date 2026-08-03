# F6-04 — Plataforma Executiva

> **Status: Homologada — Gate F6-04 APROVADO (CTO, 28/07/2026).**  
> **Versão:** v0.1 — 28/07/2026 (homologada)  
> Natureza: **definição estratégica** da Plataforma Executiva.  
> Sede: **IPR-001**.  
> Modelo evolutivo: [`F6-03-modelo-evolutivo-do-ecossistema-executivo.md`](F6-03-modelo-evolutivo-do-ecossistema-executivo.md) — **Gate F6-03 aprovado**.  
> Arquitetura: [`F6-02-arquitetura-do-ecossistema-executivo.md`](F6-02-arquitetura-do-ecossistema-executivo.md).  
> Visão: [`F6-01-visao-do-ecossistema-executivo.md`](F6-01-visao-do-ecossistema-executivo.md).  
> Mandato: [`F6-00-mandato-fase-f6.md`](F6-00-mandato-fase-f6.md).  
> **Não cria** requisitos, backlog, implementação nem ADRs.  
> **Não altera** documentos homologados.  
> **Próximo artefato:** [`F6-05-estrategia-de-expansao-do-ecossistema-executivo.md`](F6-05-estrategia-de-expansao-do-ecossistema-executivo.md) — aguarda Gate F6-05.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A definição do CEO como **Plataforma Executiva**: materialização única do Core, sobre a qual módulos e especializações se compõem. |
| **Por que existe?** | Sem esta distinção, Produto, Plataforma e Ecossistema se confundem e a expansão vira fragmentação. |
| **Para quem?** | CTO (gate); Usuário (clareza estratégica); Engenheiro (fronteira para F6-05 e futuras composições autorizadas). |
| **Sucesso?** | Fica inequívoco: há uma plataforma, um Core, expansão por composição + governança — nunca por fork do produto. |

---

## 1. O que é a Plataforma Executiva?

A **Plataforma Executiva** é a forma pela qual o **Core Executivo único** se materializa como base estável e compartilhada de uso, extensão e condução.

Não é “mais um módulo”.  
Não é o ecossistema inteiro.  
Não é um marketplace.

É a **base comum** sobre a qual:

* o produto (Gabinete / Product) opera;  
* especializações se acoplam por derivação;  
* novas capacidades, quando maduras, podem compor-se **sem** criar outro CEO;  
* Business demonstra valor **do mesmo** núcleo;  
* Governance protege a unidade;  
* Intelligence observa e propõe sobre a mesma base.

Em uma frase:

> **Plataforma Executiva = Core materializado como base única de composição — não como coleção de produtos concorrentes.**

O Gabinete já existente é a **evidência atual** dessa plataforma no domínio Product — não um segundo conceito paralelo.

---

## 2. Produto × Plataforma × Ecossistema

Três camadas distintas; uma só identidade.

| Camada | O que é | Pergunta que responde |
|--------|---------|------------------------|
| **Produto** | A face utilizável do Core (Gabinete, experiência, capacidades de uso) | *Como o usuário trabalha com o CEO hoje?* |
| **Plataforma** | A base comum que torna o Core extensível por composição | *Sobre o que tudo se apoia sem se fragmentar?* |
| **Ecossistema** | A órbita de domínios (Product, Business, Governance, Intelligence) em torno do Core | *Como as frentes coexistem e evoluem?* |

```text
  ECOSSISTEMA  (domínios e relações — F6-01 / F6-02)
        │
        ▼
  PLATAFORMA   (base única de composição — este documento)
        │
        ▼
  PRODUTO      (materialização de uso — Gabinete / Product)
```

| Confusão comum | Correção |
|----------------|----------|
| “O produto é o ecossistema” | Produto é a face; ecossistema é a órbita de domínios |
| “A plataforma é um app novo” | Plataforma é a base do mesmo CEO |
| “Cada especialização é um produto” | Especialização compõe sobre a plataforma; não a substitui |
| “Ecossistema = Marketplace” | Marketplace, se existir, é consequência futura — não a definição |

---

## 3. Papel do Core Executivo na plataforma

Na Plataforma Executiva, o **Core** é:

| Papel | Significado |
|-------|-------------|
| **Núcleo de identidade** | O que faz o CEO ser o CEO — em qualquer composição |
| **Base de composição** | Módulos e especializações apoiam-se nele; não o reescrevem |
| **Ponto único de verdade operacional** | Um contexto de condução; não vários “núcleos” por domínio |
| **Objeto protegido** | Governance controla o que pode tornar-se parte estrutural do Core (F6-03) |

O Core **dentro** da plataforma não é um plugin entre outros. É o **centro** sem o qual a plataforma deixa de ser executiva e vira mera agregação.

Regra:

> **A plataforma existe para servir ao Core.  
> O Core não existe para servir a um canal, módulo ou especialização.**

---

## 4. Integração sem alterar o Core

### 4.1 Composição (modo permitido)

Tudo que amplia a plataforma deve **compor-se** sobre o Core:

```text
                 ┌─────────────────────┐
                 │   CORE EXECUTIVO    │
                 │ (inalterado / único)│
                 └──────────┬──────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
         Módulos      Especializações   Capacidades
         de uso         (Legal, Health,   (quando
         (Product)       Industry…)        maduras)
                            │
                            ▼
                    composição + gate
                    (nunca fragmentação)
```

| Elemento | Como integra |
|----------|--------------|
| **Módulos de uso** | Estendem a superfície Product **sobre** a plataforma |
| **Especializações** | Derivam contexto/linguagem/prioridade; **não** criam outro Core |
| **Futuras capacidades** | Entram na órbita; só sobem ao Core via Governance (F6-03) |
| **Business** | Usa a plataforma para demonstrar o mesmo Core |
| **Intelligence** | Lê e propõe sobre a plataforma; não a bifurca |

### 4.2 Fragmentação (modo proibido)

| Proibido | Por quê |
|----------|---------|
| Fork do produto por especialização | Quebra plataforma única |
| “CEO Legal” / “CEO Health” como identidades separadas | Multiplica o Core |
| Módulo que redefine regras permanentes sem Governance | Contorna proteção |
| Expansão que exige Marketplace como fundação | Inverte a ordem (consequência ≠ base) |
| Product e Business como dois CEOs | Fragmenta identidade |

### 4.3 Tese de expansão

> **Toda expansão ocorre por composição e governança — nunca por fragmentação do produto.**

* **Composição** = acrescentar sobre a base.  
* **Governança** = decidir o que pode aproximar-se ou entrar no Core.  
* **Fragmentação** = criar outro centro — fora do modelo.

---

## 5. O que a plataforma garante (e o que não promete)

### 5.1 Garante (nível estratégico)

* Um único Core Executivo.  
* Uma única base de composição (a plataforma).  
* Expansão por acoplamento controlado, não por clonagem.  
* Domínios do ecossistema orbitando a mesma base.  
* Especializações como derivações, não como substitutos.

### 5.2 Não promete (neste documento)

* Lista de módulos a construir.  
* Roadmap de especializações.  
* Arquitetura técnica / APIs / stack.  
* Marketplace como componente fundacional.

**Marketplace:** se um dia existir, será **possível consequência** de uma plataforma já coerente e confiável — não parte da definição da Plataforma Executiva neste F6-04.

---

## 6. Relação com o Gabinete atual

O Gabinete Executivo (F1–F5 + Ondas 01–02) é a **primeira materialização Product** da Plataforma Executiva.

| Afirmação | Estado |
|-----------|--------|
| O Gabinete prova que o Core pode ser usado diariamente | Evidência |
| O Gabinete **é** a plataforma completa do ecossistema | Não — é a face Product atual |
| Evoluir o Gabinete (Ondas autorizadas) | Evolução na órbita da plataforma |
| Substituir o Gabinete por outro “CEO” | Fragmentação — proibida |

---

## 7. Síntese

| Termo | Definição curta |
|-------|-----------------|
| **Core** | Identidade única e protegida |
| **Plataforma** | Base única de composição em torno do Core |
| **Produto** | Uso cotidiano dessa base |
| **Ecossistema** | Domínios que orbitam e conduzem a evolução |
| **Expansão** | Composição + Governance |
| **Antimodelo** | Fragmentação / fork / múltiplos CEOs |

Em uma frase:

> **A Plataforma Executiva é o Core tornado base única: tudo se compõe sobre ela; nada a parte ao meio.**

---

## Encerramento deste artefato

Este F6-04 define a **Plataforma Executiva**.

**Não** define estratégia de expansão detalhada (F6-05).  
**Não** cria requisitos, backlog, implementação nem ADRs.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO autorizou após Gate F6-03 |
| Quando | 28/07/2026 |
| Por quê | Fixar Produto × Plataforma × Ecossistema e a regra de composição |
| Baseado em quê | F6-00…F6-03; restrições CTO (Marketplace só como consequência futura) |
| Resultado | F6-04 **homologada** (Gate F6-04); F6-05 elaborado e aguarda Gate F6-05 |

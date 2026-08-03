# F6-03 — Modelo Evolutivo do Ecossistema Executivo

> **Status: Homologada — Gate F6-03 APROVADO (CTO, 28/07/2026).**  
> **Versão:** v0.1 — 28/07/2026 (homologada)  
> Natureza: **modelo evolutivo** do ecossistema (estratégico / organizacional).  
> Sede: **IPR-001**.  
> Arquitetura: [`F6-02-arquitetura-do-ecossistema-executivo.md`](F6-02-arquitetura-do-ecossistema-executivo.md) — **Gate F6-02 aprovado**.  
> Visão: [`F6-01-visao-do-ecossistema-executivo.md`](F6-01-visao-do-ecossistema-executivo.md).  
> Mandato: [`F6-00-mandato-fase-f6.md`](F6-00-mandato-fase-f6.md) — em especial **D-F6-04**.  
> **Não cria** requisitos, backlog, implementação nem ADRs.  
> **Não altera** documentos homologados.  
> **Próximo artefato:** [`F6-04-plataforma-executiva.md`](F6-04-plataforma-executiva.md) — aguarda Gate F6-04.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O modelo que explica **como** o ecossistema evolui no tempo sem fragmentar o Core Executivo. |
| **Por que existe?** | Sem modelo evolutivo, Ondas, especializações e novas capacidades competem com a identidade do CEO. |
| **Para quem?** | CTO (gate); Usuário (orientação); Engenheiro (fronteira conceitual para F6-04 e futuras Ondas autorizadas). |
| **Sucesso?** | Fica claro o que pode evoluir na órbita do Core, o que exige Governance para entrar no Core, e o que nunca deve ocorrer. |

---

## 1. Princípio do modelo

O Ecossistema Executivo evolui por **camadas de mudança**, não por reescrita contínua do Core.

> **Estabilidade no Core. Movimento na órbita. Incorporação ao Core somente sob Governança.**

Três verdades simultâneas:

1. O **Core** deve permanecer reconhecível (identidade do CEO).  
2. O **ecossistema** deve poder crescer (Product, Business, Intelligence, especializações).  
3. **Governance** decide o que sobe de “órbita” para “núcleo”.

Este documento não lista features. Define **regime de evolução**.

---

## 2. Elementos do modelo e suas relações

### 2.1 Mapa evolutivo

```text
  Sinais de uso / mercado / hipótese
              │
              ▼
        Intelligence  ──propõe──►  Governance
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              Rejeitar /          Autorizar         Autorizar
              diferir             Onda (órbita)     incorporação
                                                    ao Core
                    │                 │                 │
                    │                 ▼                 ▼
                    │         Ondas Operacionais    Core atualizado
                    │         Product / manutenção  (raro, deliberado)
                    │                 │
                    │                 ▼
                    │            Especializações
                    │         (derivam; não reescrevem)
                    └─────────────────────────────────────
```

### 2.2 Papéis no ciclo evolutivo

| Elemento | Papel na evolução |
|----------|-------------------|
| **Core Executivo** | Âncora de identidade; muda pouco e só com gate |
| **Governance** | Controla o que pode ser tentado na órbita e o que pode ser incorporado ao Core |
| **Ondas Operacionais** | Veículo de evolução do **produto existente** (órbita Product), quando formalmente autorizadas |
| **Especializações** | Expansão por derivação; adaptam contexto **sem** alterar o Core |
| **Product** | Onde a evolução se torna uso real |
| **Business** | Traz demanda e valor; não institui mudança de Core |
| **Intelligence** | Detecta padrões e formula hipóteses; não incorpora sozinha |

---

## 3. Dois planos de evolução

### 3.1 Evolução na órbita (frequente)

Mudanças que **não** redefinem a identidade do CEO.

Exemplos de *natureza* (não backlog):

* aprofundar uso do Gabinete;  
* melhorar organização do trabalho já existente;  
* adaptação de linguagem em especialização;  
* manutenção e correção do produto homologado.

**Meio típico:** Ondas Operacionais **autorizadas** (D-F6-04) ou evolução documental da F6 sem IMP da própria F6.

**Efeito no Core:** nenhum, ou apenas evidência de que o Core continua adequado.

### 3.2 Evolução do Core (rara)

Mudanças que afetam o que o CEO **é** — identidade, limites estruturais, regras permanentes de condução.

**Meio típico:** deliberação formal sob **Governance** (e os instrumentos do programa já existentes — sem criar ADR neste documento).

**Efeito:** Core permanece único; versão seguinte do Core é **homologada**, não improvisada por Onda.

---

## 4. Ondas Operacionais no modelo evolutivo

As Ondas Operacionais são o mecanismo de **evolução controlada do produto** na órbita do Core.

| Ondas fazem | Ondas não fazem |
|-------------|-----------------|
| Evoluir o produto existente com autorização formal | Redefinir o Core por padrão |
| Manutenção e consolidação do Gabinete / Product | Substituir Governance |
| Entregar valor de uso mensurável no dia a dia | Abrir especialização que force fork do Core |
| Respeitar F1–F5 e o que já foi homologado | Implementar “a F6 em código” sem deliberação específica |

**Relação com a F6:** a F6 define o *regime*; Ondas executam *mudança de produto* quando autorizadas. Não são a mesma coisa.

**Relação com o Core:** Onda bem-sucedida fortalece a evidência do Core; não o reescreve silenciosamente.

---

## 5. Especializações no modelo evolutivo

Especializações (ex.: Legal, Health, Industry) entram como **ramificações de uso e contexto**, não como novos núcleos.

| Etapa conceitual | Descrição |
|------------------|-----------|
| **Detecção** | Intelligence / uso / Business sinalizam padrão de domínio |
| **Proposta** | Especialização é proposta como derivação do Core |
| **Gate** | Governance avalia: deriva ou exige mudança de Core? |
| **Ativação na órbita** | Se deriva: Product pode materializar adaptação **sem** alterar o Core |
| **Incorporação** | Só se a especialização revelar necessidade estrutural verdadeira — e mesmo assim via Governance, não via atalho |

Regra:

> **Especializar = adaptar ao redor do Core.  
> Não especializar = clonar o CEO.**

---

## 6. Como novas capacidades podem surgir sem comprometer a identidade

### 6.1 Definição operacional de “nova capacidade” (neste modelo)

Neste nível, “nova capacidade” significa uma **nova aptidão do ecossistema ou do produto** — não um REQ numerado nem um item de backlog.

Ela pode nascer de:

* uso real (Product);  
* aprendizado (Intelligence);  
* demanda de valor (Business);  
* necessidade de limite (Governance).

### 6.2 Filtro de identidade

Antes de qualquer incorporação, a pergunta obrigatória é:

> **Isto reforça o CEO como único Core Executivo — ou cria um segundo centro de gravidade?**

| Resultado do filtro | Caminho |
|---------------------|---------|
| Reforça o Core / uso na órbita | Pode seguir como evolução orbital (ex.: Onda autorizada) |
| Exige redefinir identidade | Só via Governance + deliberação formal |
| Fragmenta identidade / “outro CEO” | Rejeitar |
| Depende de Marketplace como fundação | Fora do modelo fundacional (consequência futura, se houver) |

### 6.3 Maturação antes da incorporação

Nada entra no Core “por entusiasmo”. O modelo presume ciclo de maturação conceitual:

**Observação → Hipótese → Validação na órbita → Proposta de incorporação → Gate de Governance → (só então) Core.**

Intelligence participa da observação e da hipótese. Governance mandata o gate. Product valida na órbita. Business não pula etapas.

---

## 7. Como a Governança controla a incorporação ao Core

### 7.1 Autoridade

**Somente Governance** autoriza incorporação estrutural ao Core.

| Ação | Governance |
|------|------------|
| Incorporar capacidade à identidade do Core | Autoriza ou bloqueia |
| Permitir Onda que toque fronteira sensível | Autoriza com limites |
| Especialização que pressiona o Core | Exige gate antes de qualquer “virar núcleo” |
| Proposta de Intelligence / Business / Product | Recebe, arbitra, registra decisão |

### 7.2 Critérios conceituais de incorporação (não REQ)

Uma proposta só é candidata a Core se:

1. **Necessária** à identidade ou à estabilidade do CEO — não apenas conveniente a um canal.  
2. **Madura** — já observada/validada na órbita o suficiente para não ser moda.  
3. **Não fragmentadora** — preserva Core único.  
4. **Rastreável** — origem, motivo e resultado da decisão ficam explícitos.  
5. **Compatível** com o já homologado (F1–F5 e mandato F6) — sem reabrir fases por atalho.

### 7.3 O que Governance não faz neste modelo

* Não executa a Onda (isso é Product / engenharia sob autorização).  
* Não substitui Intelligence na detecção de padrões.  
* Não transforma toda evolução em mudança de Core (a maioria deve permanecer orbital).

---

## 8. Síntese do regime evolutivo

| Camada | Frequência | Quem controla | Efeito |
|--------|------------|---------------|--------|
| Órbita (Product / Ondas / especializações derivadas) | Alta | Autorização formal + Product | Uso melhora; Core estável |
| Proposta (Intelligence / Business) | Contínua | Governance filtra | Hipóteses, não fato estrutural |
| Core | Baixa | Governance + deliberação formal | Identidade evolui sem se perder |

Em uma frase:

> **O ecossistema evolui depressa ao redor do Core e depressa demais nunca dentro do Core — salvo quando Governance reconhece maturidade e necessidade de identidade.**

---

## Encerramento deste artefato

Este F6-03 define o **modelo evolutivo**.

**Não** define plataforma (F6-04) nem estratégia de expansão (F6-05).  
**Não** cria requisitos, backlog, implementação nem ADRs.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO autorizou após Gate F6-02 |
| Quando | 28/07/2026 |
| Por quê | Fixar como o ecossistema evolui sem comprometer o Core |
| Baseado em quê | F6-00 (D-F6-04); F6-01; F6-02 homologada; restrições CTO |
| Resultado | F6-03 **homologada** (Gate F6-03); F6-04 elaborado e aguarda Gate F6-04 |

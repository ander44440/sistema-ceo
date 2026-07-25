# ARQ-011 — Arquitetura da CAP-08 (Planejamento Executivo)

> **Status: Homologada — v1.0 (CTO, 24/07/2026). Congelada — CAP-08 concluída.**  
> Versão 1.0 — 24/07/2026. Tipo ARQ (ADR-010).  
> **Identificação:** ARQ-011 (ARQ-008 = MVP; ARQ-009 = CAP-05; ARQ-010 = CAP-07).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-010; ADR-015; ADR-017; VIS-006 Aprovada v1.0; REQ-035 Homologado v1.0; ARQ-008/009/010 Homologadas (**preservadas**); ÉPICO-002.  
> **Princípio Arquitetural (identidade conceitual):** *"O CEO analisa antes de recomendar, recomenda antes de planejar e planeja antes de executar."*  
> Este documento define a **arquitetura funcional** que implementou REQ-035 (componentes L/M).  
> **Ciclo CAP-08:** **encerrado**. Relatório: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md).  
> **Cadeia obrigatória:** Analisar → Avaliar suficiência → Recomendar → Planejar → Executar (fora).  
> **Proibição:** **não** reabrir esta ARQ sem novo ciclo formal.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os componentes da CAP-08 para satisfazer REQ-035 (RF-01…09, RNF-01…04), materializando a cadeia Analisar → Avaliar suficiência → Recomendar → Planejar → Executar (fora), sem reabrir baselines e sem antecipar tecnologia?**

---

## 1. Objetivo arquitetural

Materializar a CAP-08 como dois componentes lógicos cooperantes:

1. **L — Análise Executiva** — produz análise completa, avalia **suficiência** e registra incertezas/confiança;
2. **M — Planejamento Executivo** — emite **recomendação** somente após suficiência e, em seguida, **plano** coordenado (proposta ≠ vigência).

Ambos:

* leem insumos de B/F/H/I/J/K (somente leitura onde aplicável);
* **não gravam** memória/estado/vigência por conta própria;
* encaminham atos de autoridade a **C** (confirmação);
* **não executam** o domínio operacional (MG2).

Objetivo de conformidade: cobertura integral do REQ-035, com rastreabilidade explícita e preservação das baselines MVP, CAP-05 e CAP-07.

---

## 2. Visão geral da solução

```text
┌─────────────────────────────────────────────────────────────┐
│              ARQ-008 — MVP (PRESERVADA)                       │
│  A Superfície · B Contexto · C Ciclo · D…G                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ extensão
                            ▼
┌─────────────────────────────────────────────────────────────┐
│     ARQ-009 CAP-05 (H/I/J) · ARQ-010 CAP-07 (K) — PRESERVADAS │
└───────────────────────────┬─────────────────────────────────┘
                            │ insumos (somente leitura)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ARQ-011 — CAP-08 Planejamento                     │
│  L Análise Executiva                                          │
│    · monta análise (7 elementos)                              │
│    · avalia SUFICIÊNCIA / INSUFICIÊNCIA                       │
│    · registra incertezas + confiança                          │
│  M Planejamento Executivo                                     │
│    · emite RECOMENDAÇÃO (só se suficiente)                    │
│    · monta PLANO coordenado (proposta)                        │
│    · marca proposta ≠ vigência                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ artefatos comunicáveis
                            ▼
              A (exibe) · K (expressa, se usado) · C (confirma)
```

Cadeia obrigatória (CTO / REQ-035):

```text
Analisar → Avaliar suficiência → Recomendar → Planejar → Executar (fora do CEO)
```

Princípios estruturais:

* **Analisar ≠ Recomendar ≠ Planejar ≠ Confirmar ≠ Executar**  
* **Suficiência ≠ certeza absoluta**  
* **Proposta ≠ vigência**

---

## 3. Componentes envolvidos

### 3.1 Novos componentes

| ID | Componente | Responsabilidade única |
|----|------------|------------------------|
| **L** | **Análise Executiva** | Produzir análise com os 7 elementos obrigatórios; declarar suficiência ou insuficiência; registrar incertezas e confiança |
| **M** | **Planejamento Executivo** | Emitir recomendação apenas após suficiência; montar plano coordenado; preservar proposta ≠ vigência; manter rastreabilidade L→recomendação→plano |

### 3.2 Componentes existentes (consumidos, não redefinidos)

| ID | Origem | Papel em relação a L/M |
|----|--------|------------------------|
| **A** | ARQ-008 | Exibe análise/recomendação/plano; solicita detalhe se houver |
| **B** | ARQ-008 | Contexto ativo (MG2) |
| **C** | ARQ-008 | Único caminho de confirmação/vigência |
| **F** | ARQ-008 | Estado do Dia (leitura) |
| **G** | ARQ-008 | Limites transversais (fronteira, carga) |
| **H** | ARQ-009 | Memória / ausência (leitura) |
| **I** | ARQ-009 | Pacote de condução / proposta vigente ou candidata (leitura) |
| **J** | ARQ-009 | Atenção por papel (leitura) |
| **K** | ARQ-010 | Pode expressar artefatos de L/M; **não** substitui L/M |

L/M **não substituem** I (condução) nem K (comunicação): I conduz o dia; L/M analisam e planejam; K expressa.

---

## 4. Fluxo de informações

```text
1. Objetivo / prioridade / evento de planejamento
        │
        ▼
2. L LÊ insumos (somente leitura): B · F · H · I · J · (K se necessário)
        │
        ▼
3. L monta ANÁLISE EXECUTIVA
   ┌──────────────────────────────────────────────┐
   │ contexto · lacunas · riscos · dependências   │
   │ alternativas · justificativa · confiança     │
   └──────────────────────────────────────────────┘
        │
        ▼
4. L avalia SUFICIÊNCIA
   ├─► INSUFICIENTE ──► declara insuficiência + lacunas/incertezas
   │                    NÃO emite recomendação (RF-03)
   │
   └─► SUFICIENTE ──► registra incertezas remanescentes
                      + confiança + justificativa de timing
                        │
                        ▼
5. M emite RECOMENDAÇÃO (fundada em L; proposta)
                        │
                        ▼
6. M monta PLANO coordenado (passos/tarefas; proposta)
   ┌──────────────────────────────────────────────┐
   │ id · passos · ordem/deps · fontes L/M        │
   │ vigencia=proposta · rastreio análise/rec.    │
   └──────────────────────────────────────────────┘
                        │
                        ▼
7. A/K apresentam · C confirma (fora de L/M)
                        │
                        ▼
                 H/F atualizam só via caminhos existentes
                 L/M NÃO gravam · execução MG2 FORA
```

Ordem obrigatória: **nunca** recomendar antes da suficiência; **nunca** planejar antes de recomendar; **nunca** executar dentro do CEO.

---

## 5. Responsabilidades de cada componente

### L — Análise Executiva

| | |
|--|--|
| **Faz** | Montar análise com RF-02; declarar suficiência/insuficiência (RF-03); registrar incertezas; indicar confiança; justificar timing da suficiência; impedir ciclo infinito de investigação sem critério de parada |
| **Não faz** | Emitir plano; confirmar vigência; executar MG2; inventar fatos; gravar H/F |
| **REQs** | RF-01, RF-02, RF-03; partes de RF-08/09; RNF-01, RNF-04 |

### M — Planejamento Executivo

| | |
|--|--|
| **Faz** | Emitir recomendação só se L=suficiente (RF-04); montar plano coordenado (RF-05); marcar proposta≠vigência (RF-07); preservar rastreabilidade (RF-09); respeitar fronteira de execução (RF-06) |
| **Não faz** | Analisar no lugar de L; confirmar (C); executar MG2; alterar baselines (RF-08); abrir CAP-02/03 |
| **REQs** | RF-04…RF-09; RNF-01…RNF-04 |

### A / C / H / I / F / K

Permanecem com ARQ-008/009/010. L/M são **consumidores somente leitura** de H/I/F/B/J; confirmação permanece em **C**.

---

## 6. Decisões arquiteturais

| ID | Decisão | Justificativa técnica | Rastreabilidade |
|----|---------|----------------------|-----------------|
| **D1** | Separar **L** (análise/suficiência) de **M** (recomendação/plano) | Torna a cadeia Analisar→Suficiência→Recomendar→Planejar estruturalmente testável | Princípio; RF-01…05 |
| **D2** | L/M são **somente leitura** sobre H/I/F/B/J | Analisar/planejar ≠ registrar; impede regressão | RF-08; RNF-02 |
| **D3** | Contrato de **Análise Executiva** com 7 elementos obrigatórios | RF-02 verificável: omissão = falha estrutural | RF-02 |
| **D4** | Estado explícito de **suficiência** (`suficiente` \| `insuficiente`) | RF-03; evita ciclos infinitos; permite não recomendar | RF-03 |
| **D5** | Suficiência exige incertezas + confiança + justificativa de timing | Distingue suficiência de certeza absoluta | RF-03; RN-03.1–3 |
| **D6** | **M bloqueia recomendação** se L ≠ suficiente | Gate estrutural da cadeia CTO | RF-03; RF-04 |
| **D7** | Contrato de **Recomendação** e **Plano** com `vigencia=proposta` por padrão | Proposta ≠ vigência; só C confirma | RF-07 |
| **D8** | Plano como lista ordenável de passos/tarefas com rastreio a L/M | RF-05; RF-09 | RF-05; RF-09 |
| **D9** | Extensão adjacente; sem unificação obrigatória de superfícies | Preserva baselines; unificação visual = OE | RNF-02; RST |
| **D10** | Independência tecnológica | Arquitetura lógica; stack no IMP deliberado | ADR-010; RNF-03 |
| **D11** | Execução permanece fora (G / fronteira MG2) | RF-06; RNF-03 | RF-06 |
| **D12** | K pode expressar L/M; não os substitui | CAP-07 = expressão; CAP-08 = análise/plano | ARQ-010; RF-04 fora |

### Contrato lógico — Análise Executiva (D3/D4/D5)

| Campo | Obrigatório | Regra |
|-------|-------------|-------|
| `contexto` | Sim | Não vazio |
| `lacunas` | Sim | Lista **ou** declaração explícita de ausência |
| `riscos` | Sim | Lista **ou** declaração explícita de ausência |
| `dependencias` | Sim | Lista **ou** declaração explícita de ausência |
| `alternativas` | Sim | ≥1 alternativa **ou** justificativa de alternativa única |
| `justificativa` | Sim | Vinculada aos elementos acima |
| `confianca` | Sim | Nível legível |
| `suficiencia` | Sim | `suficiente` \| `insuficiente` |
| `incertezasRemanescentes` | Sim se suficiente | Lista **ou** “nenhuma relevante” |
| `justificativaTiming` | Sim se suficiente | Por que recomendar agora |
| `fontes` | Sim | Refs a B/H/I/F/J — vazias só com ausência explícita |

### Contrato lógico — Recomendação (D6/D7)

| Campo | Obrigatório | Regra |
|-------|-------------|-------|
| `enunciado` | Sim | Não vazio |
| `analiseId` | Sim | Ref a L com `suficiencia=suficiente` |
| `vigencia` | Sim | `proposta` até confirmação em C |
| `confianca` | Sim | Herdada/alinhada a L |

### Contrato lógico — Plano (D7/D8)

| Campo | Obrigatório | Regra |
|-------|-------------|-------|
| `passos` | Sim | ≥1 passo/tarefa identificável |
| `ordemOuDependencias` | Sim | Ordem/deps **ou** justificativa de passo único |
| `recomendacaoId` | Sim | Ref a recomendação de M |
| `analiseId` | Sim | Ref a L |
| `vigencia` | Sim | `proposta` por padrão |

---

## 7. Riscos e mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Recomendar sem suficiência | Viola RF-03/04 e a cadeia CTO | D6 — bloqueio estrutural em M |
| Ciclo infinito de investigação | Viola RF-03 / respeito ao tempo | D4/D5 — declaração de suficiência ou insuficiência explícita |
| Tratar suficiência como certeza | Omite incertezas | D5; RN-03.1 |
| L/M gravarem H/F | Regressão baselines | D2; testes de não-escrita |
| Plano vigorar sem C | Viola autoridade | D7; só C confirma |
| Executar MG2 em M | Viola RF-06 | D11 |
| Misturar L/M com K | Escopo CAP-07/08 | D12 |
| Antecipar CAP-02/03 | Escopo creep E4 | Fora desta ARQ |

---

## 8. Critérios de validação da arquitetura

A ARQ-011 somente se considera **adequada** (gate de arquitetura) quando:

| # | Critério |
|---|----------|
| V1 | Todo RF-01…09 e RNF-01…04 do REQ-035 tem componente/decisão responsável |
| V2 | Cadeia Analisar → Suficiência → Recomendar → Planejar → Executar(fora) está estruturalmente garantida (D1, D4, D6, D11) |
| V3 | Nenhuma decisão altera o mérito de ARQ-008 / 009 / 010 |
| V4 | Contratos de Análise, Recomendação e Plano são suficientes para RF-02…05, RF-07, RF-09 |
| V5 | Riscos da §7 possuem mitigação rastreável |
| V6 | Independência tecnológica preservada |
| V7 | Parecer favorável do CTO (homologação desta ARQ) |

Homologação da ARQ ≠ abertura de IMP ≠ implementação.

---

## 9. Rastreabilidade

### 9.1 REQ-035 → componentes / decisões

| REQ-035 | Componente / decisão |
|---------|----------------------|
| RF-01 Análise precede | L + D1 |
| RF-02 Sete elementos | L + D3 |
| RF-03 Suficiência | L + D4 + D5; M + D6 |
| RF-04 Recomendar antes de planejar | M + D6 |
| RF-05 Plano coordenado | M + D8 |
| RF-06 Execução fora | D11; G |
| RF-07 Proposta ≠ vigência | M + D7; C |
| RF-08 Sem alterar baselines | D2 |
| RF-09 Rastreabilidade | D8; campos `analiseId` / `recomendacaoId` |
| RNF-01 Baixa carga | Apresentação via A/K; síntese |
| RNF-02 Preservar baselines | D2, D9 |
| RNF-03 Fronteira / independência | D10, D11 |
| RNF-04 Princípio verificável | D1, D4, D6 |

**Cobertura:** RF-01…09 e RNF-01…04 atribuídos. Nenhuma lacuna obrigatória.

### 9.2 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-002 → CAP-08 → VIS-006 → REQ-035 → ARQ-011 (este)
  → IMP (futuro, não autorizado neste ato) → VAL → BASELINE → RELEASE v0.7
```

---

## 10. O que esta arquitetura deliberadamente não decide

* Tecnologia, linguagem, framework, UI kit, persistência física.  
* Escala numérica concreta de confiança (apenas legibilidade).  
* Heurística detalhada de cálculo de suficiência (apenas o contrato e o gate).  
* Abertura de CAP-02 / CAP-03.  
* Unificação visual das superfícies.  
* Abertura de IMP.

---

## 11. Limites deste artefato

Esta ARQ **não**:

* implementa código;  
* abre IMP;  
* altera REQ-035, VIS-006, ARQ-008/009/010, ROADMAP-001 ou ÉPICO-002 em mérito;  
* declara a CAP-08 implementada ou validada.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Encerrar a fase ARQ da CAP-08 e autorizar a fase IMP |
| Baseado em quê | Deliberação CTO — ARQ-011 homologada; REQ-035; VIS-006; Princípio Arquitetural; ARQ-008/009/010; ÉPICO-002; ADR-010 |
| Resultado | ARQ-011 Homologada v1.0 (L/M; contrato; gate de suficiência); fase ARQ encerrada; IMP-008 autorizada |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — L/M; fluxo com gate de suficiência; contratos; D1–D12; riscos; rastreabilidade REQ-035 | Deliberação CTO — abertura fase ARQ CAP-08 | Em análise |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase ARQ encerrada; fase IMP aberta (IMP-008) | Deliberação CTO — ARQ-011 homologada | **Homologada** |

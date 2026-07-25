# ARQ-010 — Arquitetura da CAP-07 (Comunicação)

> **Status: Homologada — v1.0 (CTO, 24/07/2026).**  
> Versão 1.0 — 24/07/2026. Tipo ARQ (ADR-010).  
> **Identificação:** ARQ-010 (ARQ-008 = MVP; ARQ-009 = CAP-05). Primeiro artefato da **fase ARQ da CAP-07**.  
> Norma superior: CON-001 v1.0; ADR-006; ADR-010; ADR-015; VIS-005 Homologada v1.0; REQ-034 Homologado v1.0; ARQ-008 Homologada v1.0; ARQ-009 Homologada v1.0 (CAP-05 — **preservada**).  
> Este documento define a **arquitetura funcional** para implementar REQ-034. **Não** cria requisitos; **não** altera o mérito da ARQ-008 nem da ARQ-009.  
> **Fase de Arquitetura da CAP-07:** **encerrada** com esta homologação. **Fase de Implementação (IMP):** aberta — ver IMP-007 (Deliberação CTO, 24/07/2026).  
> **Diretriz:** a CAP-07 é uma **camada de expressão** sobre a condução (CAP-05) e a superfície (ARQ-008 A); extensão sem regressão.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os componentes da CAP-07 para satisfazer REQ-034 (RF-01…06, RNF-01…04), expressando a condução da CAP-05 sem alterar o registrado, sem redesenhar o MVP e sem antecipar tecnologia?**

---

## 1. Objetivo arquitetural

Materializar a CAP-07 como componente lógico **K — Comunicação Executiva**, que:

1. recebe insumos já produzidos por H/I/J/F/B (CAP-05 / ARQ-008);
2. monta **mensagens** com síntese obrigatória, detalhe sob demanda, tipo de interação e transparência;
3. entrega essas mensagens à superfície **A** para exibição;
4. **não grava** memória, estado nem vigência por conta própria.

Objetivo de conformidade: cobertura integral do REQ-034, com rastreabilidade explícita e preservação das baselines MVP e CAP-05.

---

## 2. Visão geral da solução

```text
┌─────────────────────────────────────────────────────────────┐
│              ARQ-008 — MVP (PRESERVADA)                       │
│  A Superfície · B Contexto · C Ciclo · D…G                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ extensão (CAP-05)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ARQ-009 — CAP-05 (PRESERVADA)                    │
│  H Memória · I Condução · J Papéis                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ insumos (somente leitura)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ARQ-010 — CAP-07 Comunicação                     │
│  K Comunicação Executiva                                     │
│  · classifica tipo de interação                              │
│  · monta síntese (+ detalhe sob demanda)                     │
│  · declara ausência / limitação                              │
│  · marca proposta ≠ vigência                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ mensagem comunicável
                            ▼
                    ┌───────────────┐
                    │ A Superfície  │  (exibe; não altera H/F)
                    └───────────────┘
```

Princípio central: **Comunicar ≠ Registrar ≠ Confirmar**.

---

## 3. Componentes envolvidos

### 3.1 Novo componente

| ID | Componente | Responsabilidade única |
|----|------------|------------------------|
| **K** | **Comunicação Executiva** | Transformar insumos de condução/estado em mensagens mínimas, adaptadas, transparentes e não impositivas |

### 3.2 Componentes existentes (consumidos, não redefinidos)

| ID | Origem | Papel em relação a K |
|----|--------|----------------------|
| **A** | ARQ-008 | Exibe mensagens de K; oferece pedido de detalhe sob demanda |
| **B** | ARQ-008 | Fornece contexto ativo (MG2) |
| **C** | ARQ-008 | Continua sendo o único caminho de confirmação/vigência |
| **F** | ARQ-008 | Fornece estado do Dia (somente leitura para K) |
| **H** | ARQ-009 | Fornece memória / ausência (somente leitura para K) |
| **I** | ARQ-009 | Fornece pacote de contexto, proposta e justificativa |
| **J** | ARQ-009 | Fornece atenção por papel (expressável por K) |
| **G** | ARQ-008 | Limites transversais (fronteira MG2, carga) |

K **não substitui** I: I decide *o que* propor; K decide *como comunicar*.

---

## 4. Fluxo de informações

```text
1. Evento de condução / superfície
        │
        ▼
2. K classifica o TIPO DE INTERAÇÃO
   (autoridade | recomendação | feedback | ausência | atenção)
        │
        ▼
3. K LÊ insumos (somente leitura)
   I (pacote/proposta) · H (memória) · F (estado) · B · J
        │
        ▼
4. K monta MENSAGEM
   ┌──────────────────────────────────────┐
   │ tipo                                 │
   │ síntese (obrigatória)                │
   │ detalhe (opcional / sob demanda)     │
   │ transparência (ausência|limitação|ok)│
   │ vigência (proposta|vigente|N/A)      │
   │ fontes (ids H/I/F — só registrados)  │
   └──────────────────────────────────────┘
        │
        ▼
5. A exibe síntese (e metadados de transparência/vigência)
        │
        ├─► usuário pede detalhe ──► K expande detalhe (ou ausência)
        │
        └─► se houver autoridade ──► C confirma (fora de K)
                                      │
                                      ▼
                               H/F atualizam (CAP-05/MVP)
                               K NÃO grava
```

Ordem obrigatória de comunicação (RF-01/RF-02): **síntese → (detalhe sob demanda)**. Nunca o inverso como padrão.

---

## 5. Responsabilidades de cada componente

### K — Comunicação Executiva

| | |
|--|--|
| **Faz** | Classificar tipo de interação; montar síntese; disponibilizar detalhe sob demanda; declarar ausência/limitação; distinguir proposta de vigência; evitar repetição desnecessária no mesmo ponto |
| **Não faz** | Persistir decisões/estado; confirmar autoridade; inventar conteúdo; aprender perfil (CAP-06); planejar tarefas (CAP-08); executar MG2; redesenhar identidade visual |
| **REQs** | RF-01…RF-06; RNF-01…RNF-04 |

### A — Superfície (extensão de uso)

| | |
|--|--|
| **Faz** | Renderizar mensagem de K; expor controle de “ver detalhe”; encaminhar atos de autoridade a C |
| **Não faz** | Reescrever síntese; gravar em H/F |

### I / H / F / B / J / C

Permanecem com as responsabilidades da ARQ-009 / ARQ-008. K é **consumidor somente leitura** (exceto o encaminhamento de atos de autoridade a C, que já existia).

---

## 6. Decisões arquiteturais

| ID | Decisão | Justificativa técnica | Rastreabilidade |
|----|---------|----------------------|-----------------|
| **D1** | Introduzir componente **K** separado de I | Separar “o que conduzir” de “como comunicar” evita misturar registro/proposta com expressão; facilita testar RF-01…06 sem reabrir CAP-05 | VIS-005 §4.5; RF-05; ADR-010 |
| **D2** | K é **somente leitura** sobre H/F/I/J | Garante comunicar ≠ registrar; impede regressão silenciosa da baseline | RF-05; RNF-03; RN-05.1 |
| **D3** | Contrato de **Mensagem** com síntese obrigatória | Torna RF-01 verificável: ausência de síntese = falha estrutural | RF-01; RNF-01 |
| **D4** | Detalhe como **expansão sob demanda**, não como payload padrão | Evita carga cognitiva e burocracia; detalhe continua rastreável | RF-02; RNF-01; RNF-02 |
| **D5** | Catálogo finito de **tipos de interação** | Adaptação operacional sem CAP-06 (sem ML de perfil) | RF-03; RN-03.1 |
| **D6** | Campo obrigatório de **transparência** (ok \| limitação \| ausência) | Impede silêncio sobre lacunas; alinha a “registrado ≠ inventado” | RF-04; RN-04.1–2 |
| **D7** | Campo obrigatório de **vigência** em recomendações (proposta \| vigente \| N/A) | Comunica “sugerir sem impor” sem alterar C | RF-06; RN-06.1 |
| **D8** | Deduplicação no mesmo ponto de interação | Atende RNF-02 sem redesenhar a UI | RNF-02 |
| **D9** | Extensão de A, sem unificação obrigatória MVP×CAP-05 neste ciclo | Preserva baselines; unificação visual permanece OE (E-02/E-03) | RNF-03; RST-05 do REQ-034 |
| **D10** | Independência tecnológica | Arquitetura lógica; stack fica para IMP deliberado | ADR-010; ARQ-008 M9; RNF-04 |

### Tipos de interação (D5) — catálogo mínimo

| Tipo | Uso típico |
|------|------------|
| `autoridade` | Pedido de confirmação / escolha |
| `recomendacao` | Próximo passo ou prioridade proposta |
| `feedback` | Resultado de ato já confirmado / rejeitado |
| `ausencia` | Declaração de base inexistente |
| `atencao` | Expressão de item classificado por J |
| `contexto` | Apresentação de pacote pré-decisão |

### Contrato lógico da Mensagem (D3)

| Campo | Obrigatório | Regra |
|-------|-------------|-------|
| `tipo` | Sim | Um dos tipos do catálogo |
| `sintese` | Sim | Não vazia; conteúdo só de fontes registradas |
| `detalhe` | Não | Só após pedido; ou declaração de ausência |
| `transparencia` | Sim | `ok` \| `limitacao` \| `ausencia` |
| `vigencia` | Sim se `recomendacao` | `proposta` \| `vigente` \| `N/A` |
| `fontes` | Sim | IDs/refs a H/I/F/B/J — vazias só com `transparencia=ausencia` |

---

## 7. Riscos e mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| K passar a gravar estado/memória | Regressão CAP-05; viola RF-05 | D2; checklist IMP; testes de não-escrita |
| Síntese virar texto longo | Viola RF-01 / RNF-01 | Limite lógico de síntese no IMP; VAL amostral |
| Detalhe embutido por padrão | Viola RF-02 | D4; UI só expõe expansão sob demanda |
| Adaptação confundida com CAP-06 | Escopo creep | D5; RN-03.1 explícito |
| Inventar conteúdo na comunicação | Viola RF-04 | D6; fontes obrigatórias |
| Comunicação aplicar vigência | Viola RF-06 | D7; só C confirma |
| Redesign visual “de passagem” | Escopo E-02/E-03 | D9; fora deste ARQ |
| Dependência de IA específica | Viola RNF-04 | D10; sem stack obrigatória |

---

## 8. Critérios de validação da arquitetura

A ARQ-010 somente se considera **adequada** (gate de arquitetura) quando:

| # | Critério |
|---|----------|
| V1 | Todo RF-01…06 e RNF-01…04 do REQ-034 tem componente/decisão responsável |
| V2 | Princípio comunicar ≠ registrar ≠ confirmar está estruturalmente garantido (D2, D7) |
| V3 | Nenhuma decisão altera o mérito de ARQ-008 / ARQ-009 |
| V4 | Tipos de interação e contrato de Mensagem são suficientes para RF-03/01/02/04/06 |
| V5 | Riscos da §7 possuem mitigação rastreável |
| V6 | Independência tecnológica preservada (sem stack obrigatória) |
| V7 | Parecer favorável do CTO (homologação desta ARQ) |

Homologação da ARQ ≠ abertura de IMP ≠ implementação.

---

## 9. Rastreabilidade

### 9.1 REQ-034 → componentes / decisões

| REQ-034 | Componente / decisão |
|---------|----------------------|
| RF-01 Síntese | K + D3; A exibe |
| RF-02 Detalhe sob demanda | K + D4; A solicita expansão |
| RF-03 Adaptação por tipo | K + D5 |
| RF-04 Transparência / ausência | K + D6 |
| RF-05 Expressar sem alterar | K + D2; leitura H/I/F |
| RF-06 Proposta ≠ vigência | K + D7; C confirma |
| RNF-01 Baixa carga | D3, D4; síntese curta |
| RNF-02 Sem burocracia/repetição | D8 |
| RNF-03 Preservar baselines | D2, D9 |
| RNF-04 Fronteira / independência | D10; G |

**Cobertura:** RF-01…06 e RNF-01…04 atribuídos. Nenhuma lacuna obrigatória.

### 9.2 VIS-005

| VIS-005 | ARQ-010 |
|---------|---------|
| §4 Visão da solução | Componente K + fluxo §4 |
| §4.5 Camada de expressão | D1, D2 |
| §6 Escopo | Mensagem + tipos |
| §7 Fora do escopo | §5 “Não faz” de K; D9 |
| §9 Critérios | Matriz §9.1 |

### 9.3 ÉPICO-001

| ÉPICO-001 | ARQ-010 |
|-----------|---------|
| Capacidade única CAP-07 | Escopo exclusivo deste ARQ |
| Sem CAP-06/08 | Confirmado (fora de K) |
| Encerramento = CAP-07 em BASELINE | Esta ARQ habilita IMP futuro; não encerra |

### 9.4 ROADMAP-001

| ROADMAP-001 | ARQ-010 |
|-------------|---------|
| E3 Inteligência Executiva | CAP-07 / este ARQ |
| Release v0.6 | Horizonte pós-IMP/VAL |
| Extensão sem regressão | D2, D9, RNF-03 |

### 9.5 Cadeia oficial

```text
ROADMAP-001 → ÉPICO-001 → CAP-07 → VIS-005 → REQ-034 → ARQ-010 (este)
  → IMP (futuro) → VAL → BASELINE → RELEASE v0.6
```

---

## 10. O que esta arquitetura deliberadamente não decide

* Tecnologia, linguagem, framework, UI kit, persistência física.  
* Unificação visual MVP × CAP-05 × CAP-07 (E-02/E-03).  
* Aprendizado de perfil (CAP-06) ou planejamento (CAP-08).  
* Abertura de IMP ou alteração de baselines homologadas.

---

## 11. Limites deste artefato

Esta ARQ **não**:

* implementa código;
* abre IMP;
* altera REQ-034, VIS-005, ARQ-008, ARQ-009, ROADMAP-001 ou ÉPICO-001 em mérito;
* declara a CAP-07 implementada ou validada.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO em revisão |
| Quando | 24/07/2026 |
| Por quê | Abrir a fase ARQ da CAP-07 após homologação do REQ-034 |
| Baseado em quê | Deliberação CTO — REQ-034 homologado e abertura ARQ; REQ-034; VIS-005; ARQ-008; ARQ-009; ÉPICO-001; ROADMAP-001; ADR-010 |
| Resultado | ARQ-010 v0.1 submetida (componente K; D1–D10); sem código/IMP; aguarda revisão do CTO |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — K Comunicação Executiva; fluxo; responsabilidades; D1–D10; riscos; validação; rastreabilidade | Deliberação CTO — abertura fase ARQ CAP-07 | Em análise |

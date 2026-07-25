# ARQ-009 — Arquitetura da CAP-05 (Executivo Digital)

> **Status: Homologada — v1.0 (CTO, 24/07/2026). CAP-05 concluída; baseline congelada.**  
> Versão 1.0 — 24/07/2026. Tipo ARQ (ADR-010).  
> **Identificação:** ARQ-009 (ARQ-007 = espaço KNW; ARQ-008 = MVP v0.1).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-010; ADR-015; VIS-004 Homologada v1.0; REQ-033 Homologado v1.0; ARQ-008 Homologada v1.0 (MVP — **preservada**).  
> Este documento define a **arquitetura funcional** que materializou REQ-033. **Não** cria requisitos; **não** altera o mérito da ARQ-008.  
> **Ciclo CAP-05:** VIS → REQ → ARQ → IMP → VAL **encerrado** (Deliberação Final CTO, 24/07/2026).  
> **Proibição:** **não reabrir** esta ARQ; componentes H/I/J permanecem na baseline congelada.  
> **Diretriz:** estender a ARQ-008 sem absorvê-la; objeto central do MVP (Dia de Trabalho) permanece; a CAP-05 adiciona a **condução executiva** alimentada pela Memória Organizacional.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os componentes da CAP-05 para satisfazer REQ-033 (RF-01…05, RNF-01…02), integrando-se à ARQ-008 sem substituir o MVP nem antecipar tecnologia?**

---

## 1. Princípios arquiteturais

Além dos princípios M1–M9 da ARQ-008 (preservados), aplicam-se:

| ID | Princípio | Enunciado | Fundamento |
|----|-----------|-----------|------------|
| **E1** | Extensão, não substituição | A CAP-05 estende a ARQ-008; módulos A–G permanecem válidos | Deliberação CTO — ARQ CAP-05 |
| **E2** | Memória serve à condução | A Memória Organizacional alimenta contexto e recomendações; não é só arquivo | VIS-004; RF-01 |
| **E3** | Contexto antes da autoridade | Nenhum pedido de decisão de autoridade sem montagem prévia de contexto | RF-02 |
| **E4** | Justificar ou declarar ausência | Recomendação sem base registrada não é oferecida como padrão | RF-03; RN-01.1 |
| **E5** | Sugerir sem impor | Prioridades e próximo passo só vigoram após confirmação | RF-04; ARQ-008 M4 |
| **E6** | Coordenar papéis, não substituí-los | Patrocinador / CTO / Engenheiro permanecem distintos | RF-05 |
| **E7** | Fronteira de execução | Condução ≠ execução do MG2 | RNF-02; ARQ-008 M7 |
| **E8** | Independência tecnológica | Arquitetura lógica; sem obrigação de stack | ADR-010; ARQ-008 M9 |

---

## 2. Relação com a ARQ-008 (MVP)

```text
┌─────────────────────────────────────────────────────────────┐
│                    ARQ-008 — MVP (PRESERVADA)                 │
│  A Superfície · B Contexto · C Ciclo · D Decisões            │
│  E Acervo uso diário · F Continuidade · G Limites            │
└───────────────────────────┬─────────────────────────────────┘
                            │ extensão (sem quebra)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ARQ-009 — CAP-05 Executivo Digital               │
│  H Memória Organizacional Viva · I Condução Executiva         │
│  J Coordenação de Papéis                                      │
└─────────────────────────────────────────────────────────────┘
```

| Módulo ARQ-008 | Papel na CAP-05 |
|----------------|-----------------|
| **A** Superfície | Continua compondo a UI; passa a exibir saídas de I e J (contexto pré-decisão, justificativas, atenção por papel) |
| **B** Contexto | Continua fixando o contexto ativo; H/I amarram memória a esse contexto |
| **C** Ciclo | Continua governando Abrir/Foco/Próximo/Fechar/Confirmar; **consome** recomendações de I **somente após** contexto (E3) |
| **D** Memória de Decisões | Permanece o registro diário de decisões do MVP; **H** eleva esse acervo ao papel de Memória Organizacional viva (CAP-05) — evolução, não descarte |
| **E** Acervo uso diário | Permanece CAP-04 / uso diário; **não** absorvido por H (RN-01.3) |
| **F** Continuidade | Continua fornecendo estado do Dia a I (montagem de contexto) |
| **G** Limites | Continua restringindo; RNF-02 reforça fronteira de execução |

**MVP sob VAL-005:** a ARQ-009 descreve a arquitetura-alvo da CAP-05; a materialização ocorre só sob IMP-006 autorizado — sem modificar o produto sob VAL-005 sem liberação explícita.

---

## 3. Componentes arquiteturais (CAP-05)

### 3.1 Visão dos componentes

| ID | Componente | Responsabilidade única |
|----|------------|------------------------|
| **H** | **Memória Organizacional Viva** | Guardar e recuperar decisões/contexto com os cinco campos; alimentar condução; declarar ausência |
| **I** | **Condução Executiva** | Montar contexto pré-decisão; gerar recomendações justificadas; propor prioridades (sugerir sem impor) |
| **J** | **Coordenação de Papéis** | Classificar e expor o que exige atenção do Patrocinador, do CTO ou do Engenheiro |

### 3.2 Responsabilidades e limites

#### H — Memória Organizacional Viva

| | |
|--|--|
| **Faz** | Persistir/recuperar registros decisórios (quem, quando, por quê, baseado em quê, resultado); disponibilizar histórico ao contexto ativo; declarar ausência explícita |
| **Não faz** | Inventar conteúdo; curar acervo CAP-04; decidir prioridades; implementar UI |
| **REQs** | RF-01; contribui a RF-02…04 |

#### I — Condução Executiva

| | |
|--|--|
| **Faz** | Montar pacote de contexto antes de pedido de autoridade; emitir recomendação de próximo passo/prioridade **com justificativa** ligada a H/F/B; respeitar confirmação (C) |
| **Não faz** | Impor vigência sem confirmação; executar trabalho do MG2; orquestrar IAs externas |
| **REQs** | RF-02, RF-03, RF-04; RNF-01 |

#### J — Coordenação de Papéis

| | |
|--|--|
| **Faz** | Atribuir itens de atenção a Patrocinador / CTO / Engenheiro com base em memória e estado; tornar a atribuição observável na superfície |
| **Não faz** | Substituir deliberação do CTO ou implementação do Engenheiro; IAM multi-usuário |
| **REQs** | RF-05 |

---

## 4. Fluxo de informação — memória → contexto → decisão

```text
                    ┌──────────────┐
                    │  B Contexto  │
                    │  (ativo)     │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌──────────────┐ ┌────────────────┐
│ H Memória      │ │ F Estado do  │ │ E Acervo uso   │
│ Organizacional │ │ Dia (ARQ-008)│ │ diário (CAP-04)│
│ Viva           │ │              │ │ (consulta só)  │
└───────┬────────┘ └──────┬───────┘ └───────┬────────┘
        │                 │                 │
        └────────────┬────┴─────────────────┘
                     │ insumos registrados apenas
                     ▼
            ┌─────────────────┐
            │ I Condução      │
            │ Executiva       │
            │ 1) monta contexto
            │ 2) justifica recomendação
            │ 3) propõe prioridade
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ A Superfície    │──── contexto visível
            │ (ARQ-008)       │──── justificativa
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ C Ciclo /       │  pedido de autoridade
            │ Confirmação     │  só APÓS contexto
            └────────┬────────┘
                     │ confirmação do patrocinador
                     ▼
            ┌─────────────────┐
            │ H Memória       │  novo registro / atualização
            │ + F Estado      │  se aplicável
            └─────────────────┘

Paralelo:
            ┌─────────────────┐
            │ J Coordenação   │ ← H + F + tipo do item
            │ de Papéis       │ → atenção por papel em A
            └─────────────────┘
```

### Ordem obrigatória (RF-02 / E3)

1. **Ler** H + F (+ B) — só registrado.  
2. **Montar contexto** (I) — ou ausência explícita.  
3. **Exibir contexto** (A).  
4. **Emitir recomendação justificada** (I), se houver.  
5. **Pedir autoridade** (C) — confirmar / rejeitar / ajustar.  
6. **Persistir efeito** em H e/ou F após confirmação.

---

## 5. Integração, impactos e pontos de extensão

### 5.1 Integração

| Ponto | Integração |
|-------|------------|
| Registro diário (D / REQ-022) | H consome e eleva registros decisórios ao padrão CAP-05 (cinco campos) |
| Próximo passo (C / REQ-020) | I propõe; C confirma; justificativa obrigatória (RF-03) |
| Consulta (E / REQ-024) | E permanece para conhecimento; H para decisão/contexto histórico; ambos: sem inventar |
| Painel (A) | Passa a renderizar blocos de contexto pré-decisão, justificativa e atenção por papel |

### 5.2 Impactos

| Impacto | Mitigação |
|---------|-----------|
| Risco de reescrever o MVP | E1 — extensão; IMP futuro em etapas; MVP congelado na VAL |
| Sobreposição D × H | H é evolução do papel de D para CAP-05; um acervo lógico, duas vistas (diário / organizacional) até IMP deliberar unificação |
| Sobreposição com CAP-07 | J limita-se a atenção por papel baseada em memória/estado — não é canal de comunicação plena |

### 5.3 Pontos de extensão (futuros — fora deste ARQ)

* Feedback visual / identidade (E-02, E-03) — extensão de A, não de H/I/J.  
* Multi-contexto / multi-usuário — exigiria novo ciclo.  
* CAP-06 (aprendizado de competências) — não acoplar agora.

---

## 6. Matriz de rastreabilidade REQ-033 → componentes

| REQ-033 | Componente(s) primário(s) | Apoio ARQ-008 |
|---------|---------------------------|---------------|
| RF-01 Memória viva | **H** | D, F, B |
| RF-02 Contexto antes da decisão | **I** (montagem) + **A** (exibição) | F, B, C |
| RF-03 Justificar recomendações | **I** | H, F |
| RF-04 Prioridades fundamentadas | **I** + **C** (confirmação) | A |
| RF-05 Coordenação de papéis | **J** + **A** | H, F |
| RNF-01 Baixa carga | **I**, **A** (mínimo necessário) | G |
| RNF-02 Fronteira execução | **G** (preservado) + limite de I | — |

**Cobertura:** RF-01…05 e RNF-01…02 atribuídos. Nenhum requisito REQ-033 sem componente.

---

## 7. O que esta arquitetura deliberadamente não decide

* Tecnologia, linguagem, UI kit, persistência física, APIs.  
* Unificação física imediata dos arquivos do MVP (`decisoes.md`, etc.).  
* Redesign visual (E-02/E-03).  
* Qualquer capacidade fora do REQ-033.  
* Tecnologia e unificação física imediata dos arquivos do MVP (permanecem para o IMP).

---

## 8. Limites

Esta ARQ **não**:

* altera ARQ-008 em mérito (apenas a estende);
* cria requisitos novos;
* substitui o plano de implementação (IMP-006);
* declara sucesso da VAL-005 / VIS-003 §7;
* inicia a fase de Validação da CAP-05.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Encerrar a fase ARQ da CAP-05 e autorizar a fase IMP |
| Baseado em quê | Deliberação CTO — aprovação ARQ-009; REQ-033 Homologado; VIS-004; ARQ-008; ADR-006; ADR-010 |
| Resultado | ARQ-009 Homologada v1.0; fase ARQ CAP-05 encerrada; IMP-006 autorizado para elaboração/execução sob gates |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — H/I/J; fluxo memória→contexto→decisão; integração ARQ-008; matriz REQ-033 | Deliberação CTO — fase ARQ CAP-05 | Em análise — revisão do CTO |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação; fase ARQ encerrada; fase IMP aberta | Deliberação CTO — aprovação ARQ-009 | Homologada |

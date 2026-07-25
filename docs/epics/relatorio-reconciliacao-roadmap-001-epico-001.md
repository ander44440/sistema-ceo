# Relatório de Reconciliação — ROADMAP-001 × ÉPICO-001

> **Status: Em análise — deliberação do CTO (24/07/2026).**  
> Tipo: relatório técnico de reconciliação (não normativo).  
> **Proibição:** este artefato **não** altera ROADMAP-001, ÉPICO-001, CAP-001, código nem baselines.  
> Objetivo: identificar divergências de vinculação Épico↔CAP e propor **uma** estrutura consistente, preservando a intenção estratégica do ROADMAP-001 Homologado v1.0.

---

## 1. Escopo da revisão

| Artefato | Status | Papel |
|----------|--------|-------|
| ROADMAP-001 | Homologado v1.0 | Fonte estratégica superior (ADR-016) |
| ÉPICO-001 | Em análise v0.1 | Materialização pretendida do E3 — Inteligência Executiva |
| CAP-001 | Aprovado v1.0 | Catálogo de capacidades (não alterado) |

Premissa de governança: em caso de conflito, o **ROADMAP homologado** prevalece até emenda deliberada (ADR-016: ROADMAP orienta; Épico não redefine o Roadmap).

---

## 2. Matriz de vinculação — estado atual

### 2.1 ROADMAP-001 (homologado)

| Épico | Capacidades associadas | Release |
|-------|------------------------|---------|
| E1 Fundação *(concluído)* | CAP-01, CAP-04; MVP | v0.5 |
| E2 Executivo Digital *(concluído)* | CAP-05 | v0.5 |
| **E3 Inteligência Executiva** | **CAP-07**; reforço CAP-05; experiência/feedback (E-01…E-03) | **v0.6** |
| E4 Autonomia Executiva | **CAP-08**; CAP-02; CAP-03 | **v0.7** |
| E5 Gestão Estratégica | CAP-09; CAP-03 | v0.8 |
| E6 Inteligência Organizacional | CAP-10; CAP-11; reforço CAP-04/09 | v0.9 |
| E7 Aprendizagem Organizacional | **CAP-06**; CAP-12 | **v1.0** |

Dependências ROADMAP: E2 → **E3** → **E4** → (E5) → E6 → **E7**.

### 2.2 ÉPICO-001 (em análise)

| Campo | Valor declarado |
|-------|-----------------|
| Identidade | Inteligência Executiva (= E3 do ROADMAP) |
| Capacidades previstas | **CAP-06, CAP-07, CAP-08** |
| Ordem sugerida de abertura | CAP-07 → CAP-08 → CAP-06 |
| Critério de encerramento | Baseline das **três** CAPs (ou diferimento formal) |
| Release citada | v0.6 |

---

## 3. Divergências encontradas

| ID | Divergência | ROADMAP-001 | ÉPICO-001 |
|----|-------------|-------------|-----------|
| **D1** | CAP-06 no épico de Inteligência Executiva | CAP-06 está no **E7** (Aprendizagem) / release **v1.0** | CAP-06 está nas capacidades **previstas do E3** |
| **D2** | CAP-08 no épico de Inteligência Executiva | CAP-08 está no **E4** (Autonomia) / release **v0.7** | CAP-08 está nas capacidades **previstas do E3** |
| **D3** | Escopo do E3 / ÉPICO-001 | Núcleo = **CAP-07** (+ reforço CAP-05 / E-01…E-03) | Núcleo = CAP-06 + CAP-07 + CAP-08 |
| **D4** | Critério de encerramento do épico | E3 conclui com CAP-07 (+ evolução E-01…E-03) em baseline (marco v0.6) | Exige CAP-06, CAP-07 e CAP-08 em baseline |
| **D5** | Marco de release v0.6 | Fecha com E3 = essencialmente **CAP-07** | Implicitamente exige também CAP-06 e CAP-08 para “fechar” o épico — conflita com v0.7 e v1.0 |
| **D6** | Ordem CAP-07 → CAP-08 → CAP-06 | Coerente com E3 → E4 → E7 **se** CAPs permanecerem em épicos distintos | Mistura três épicos ROADMAP num único artefato ÉPICO-001 |
| **D7** | Dupla alocação de CAP | Cada CAP tem épico “dono” principal no ROADMAP | CAP-06 e CAP-08 ficariam com dois “donos” (E3 via ÉPICO-001 **e** E7/E4) sem emenda do ROADMAP |

**Não é divergência:** ambos reconhecem dependência de E2/CAP-05; ambos citam CAP-07; ambos afirmam não abrir CAP neste ato; ambos respeitam ADR-006 para ciclos futuros.

**Fora do escopo desta reconciliação (sem divergência E3↔ÉPICO-001):** CAP-02/03 no E4; CAP-03 também no E5 (sobreposição deliberada no ROADMAP); reforços CAP-04/09 no E6.

---

## 4. Alternativas e impacto

### Alternativa A — Preservar ROADMAP; alinhar ÉPICO-001 ao E3

**Estrutura:** ÉPICO-001 = E3 = **CAP-07** (+ reforço CAP-05 / evolução E-01…E-03 como escopo de comunicação/experiência, sem reabrir CAP-05). CAP-08 permanece E4; CAP-06 permanece E7.

| Impacto | Avaliação |
|---------|------------|
| Intenção estratégica do ROADMAP | **Preservada** |
| Releases v0.6 / v0.7 / v1.0 | **Preservadas** |
| ADR-016 (Roadmap acima do Épico) | **Respeitada** |
| Trabalho no ÉPICO-001 | Emenda de conteúdo (CAPs, encerramento, ordem) após deliberação |
| ROADMAP-001 | **Sem alteração** (preferível — já homologado) |
| Risco | Percepção de “redução” do épico vs. rascunho que citava três CAPs — mitigável explicando que CAP-08/06 seguem nos épicos seguintes |

### Alternativa B — Emendar ROADMAP para igualar o ÉPICO-001 (CAP-06+07+08 no E3)

**Estrutura:** E3 absorve CAP-06, CAP-07 e CAP-08; E4/E7 perdem ou redefinem essas CAPs; releases v0.6–v1.0 recalibradas.

| Impacto | Avaliação |
|---------|------------|
| Intenção estratégica do ROADMAP | **Alterada** — comprime Inteligência + Autonomia + parte da Aprendizagem num único épico |
| Release v0.6 | Fica **sobrecarregada** (três ciclos ADR-006) — atrasa valor de uso (ADR-015) |
| E4 / E7 | Esvaziam-se ou precisam redefinição (CAP-02/03; CAP-12 isolada) |
| ROADMAP homologado | Exige **emenda formal** + novo histórico |
| Risco | Quebra da progressão E3→E4→E7; CAP-06 cedo demais (pouca evidência de uso para maturação) |

### Alternativa C — Híbrido: ÉPICO-001 = E3 (CAP-07) + “antecipação” documentada de CAP-08/06 como *dependências futuras*

**Estrutura:** Capacidades **do épico** = só CAP-07; CAP-08 e CAP-06 listadas como *próximos épicos / não critério de encerramento do ÉPICO-001*.

| Impacto | Avaliação |
|---------|------------|
| Intenção do ROADMAP | **Preservada** |
| Clareza | Boa, se a distinção “do épico” vs “horizonte” for explícita |
| Risco residual | Confusão se a lista “previstas” continuar sem hierarquia — exige redação rigorosa |

### Alternativa D — Fundir E3+E4 no ÉPICO-001 (CAP-07+CAP-08), deixar CAP-06 no E7

| Impacto | Avaliação |
|---------|------------|
| Intenção do ROADMAP | **Parcialmente alterada** (E3 e E4 colapsam) |
| v0.6 vs v0.7 | Exige emenda de releases |
| CAP-06 | Alinha com E7 — positivo |
| Risco | Autonomia Executiva perde identidade; CAP-02/03 ficam órfãs de épico imediato |

---

## 5. Estrutura única recomendada (preservando o ROADMAP)

```text
ROADMAP-001 (inalterado em mérito)

E3 Inteligência Executiva  ←→  ÉPICO-001
    └── CAP-07 Comunicação
    └── (escopo de evolução) reforço experiencial E-01…E-03 / OE de comunicação
        sem reabrir baseline CAP-05
    └── Release: v0.6

E4 Autonomia Executiva  ←→  (ÉPICO futuro, ex. ÉPICO-002)
    └── CAP-08 Planejamento
    └── CAP-02, CAP-03 (conforme ROADMAP)
    └── Release: v0.7

E7 Aprendizagem Organizacional  ←→  (ÉPICO futuro)
    └── CAP-06 Aprendizado
    └── CAP-12 Desenvolvimento do Usuário
    └── Release: v1.0
```

**Ordem de abertura (inalterada em espírito):** CAP-07 → (épico seguinte) CAP-08 → … → CAP-06.

---

## 6. Recomendação técnica do Engenheiro

**Recomenda-se a Alternativa A** (com redação da Alternativa C apenas se o CTO quiser manter menção pedagógica a CAP-08/06 como *fora do escopo de encerramento*).

### Por quê

1. **Preserva a intenção estratégica do ROADMAP-001 homologado** — progressão Inteligência → Autonomia → Aprendizagem.  
2. **Respeita ADR-016:** o Épico materializa o Roadmap; não o redefine sem emenda.  
3. **Protege o ADR-015:** v0.6 entrega valor de comunicação/feedback cedo, sem bloquear em CAP-06/08.  
4. **Evita CAP-06 prematura:** aprendizado organizacional (E7) exige base de uso e condução estáveis.  
5. **Evita dupla alocação** de CAP-06 e CAP-08.  
6. **Minimiza alteração documental:** emenda só no ÉPICO-001 (ainda em análise); ROADMAP permanece estável.

### O que NÃO fazer agora

* Não homologar o ÉPICO-001 na redação atual (CAP-06+07+08).  
* Não emendar o ROADMAP-001 sem deliberação explícita que aceite a Alternativa B ou D.  
* Não abrir CAP-06, CAP-07 ou CAP-08 neste ato.

### Encaminhamento sugerido (após deliberação do CTO)

| Se o CTO escolher | Ação subsequente (só após deliberação) |
|-------------------|----------------------------------------|
| **A** (recomendado) | Emendar ÉPICO-001: capacidades do épico = CAP-07 (+ escopo E-01…E-03); CAP-08/06 → referências a E4/E7; ajustar §7 encerramento e §8 rastreabilidade |
| **B** | Emendar ROADMAP-001 (E3, E4, E7, §6 releases) **e** alinhar ÉPICO-001 |
| **C** | Como A, com seção explícita “horizonte / não critério de fecho” |
| **D** | Emendar ROADMAP (fundir E3–E4) + ÉPICO-001; redefinir v0.6/v0.7 |

---

## 7. Pedido ao CTO

Deliberar qual alternativa adotar (**A, B, C ou D**).  
Até lá: **nenhum** artefato será modificado com base neste relatório.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO deliberará |
| Quando | 24/07/2026 |
| Por quê | Reconciliar vinculação Épico↔CAP antes da homologação do ÉPICO-001 |
| Baseado em quê | Deliberação CTO — divergência ROADMAP × ÉPICO; ROADMAP-001 Homologado; ÉPICO-001 v0.1; ADR-016; ADR-015 |
| Resultado | Relatório submetido; recomendação **Alternativa A**; nenhum documento estratégico alterado |

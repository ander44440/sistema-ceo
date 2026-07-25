# ADR-017 — Institui CAP-R (Capacidade de Consolidação de Release)

> **Status: Aceita — v1.0 (CTO, 24/07/2026).**  
> Versão 1.0 — 24/07/2026.  
> Esta ADR institui oficialmente o conceito de **CAP-R (Capacidade de Consolidação)** como mecanismo de evolução contínua do Sistema CEO, distinguindo-o de **CAP-E (Capacidade de Evolução)**.  
> Taxonomia e catálogo atualizados após a Aceitação (Deliberação Final CTO, 24/07/2026).  
> **Preservados:** ROADMAP-001, ÉPICOS e CAPs homologadas; nenhuma CAP-R iniciada por este ato; nenhum código alterado.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO homologou; Engenheiro (Cursor) registrou e publicou |
| Quando | 24/07/2026 |
| Por quê | Formalizar o destino metodológico das Oportunidades de Evolução (OE) sem reabrir baselines homologadas |
| Baseado em quê | Deliberação Final do CTO — ADR-017 APROVADA; precedentes CAP-05/CAP-07 (OE arquivadas); ADR-006; ADR-014; ADR-016; CON-001 Art. 8º |
| Resultado | ADR-017 Aceita v1.0; classificação CAP-E/CAP-R oficial; taxonomia e catálogo atualizados; nenhuma CAP-R aberta; ROADMAP/ÉPICOS/CAPs preservados |

---

## Status

Aceita — v1.0, homologada pelo CTO em 24/07/2026.

---

## 1. Contexto

O Sistema CEO desenvolve capacidades pelo fluxo ADR-006 (`VIS → REQ → ARQ → IMP → VAL → BASELINE`). Com a homologação da CAP-05 e da CAP-07, a Validação passou a produzir, de forma recorrente, três classes de achados:

| Classe | Efeito sobre a baseline |
|--------|-------------------------|
| **Conformidade (C)** | Compõe evidência de aprovação |
| **Não conformidade (NC)** | Pode impedir aprovação; correção exige deliberação (reabrir IMP ou novo ciclo) |
| **Oportunidade de Evolução (OE)** | Melhoria desejável **sem** violar o escopo homologado — **não** se incorpora à baseline |

As OE das VAL-006 (EV-033…035) e VAL-007 (EV-036…038) foram corretamente **arquivadas fora da baseline**. Falta, porém, um **mecanismo oficial** que:

1. receba e priorize OE com rastreabilidade;
2. consolide aprimoramentos sobre capacidades **já homologadas**, sem reabri-las em silêncio;
3. produza, ao final, uma **nova baseline** integrável à próxima **RELEASE**.

Sem esse mecanismo, a evolução contínua tende a ocorrer por reabertura indevida de CAP homologada, por documentos ad hoc ou por diluição de OE em backlog sem governança.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | OE acumulam-se após cada VAL sem destino metodológico formal |
| P2 | Reabrir uma CAP-E homologada para “pequenas melhorias” corrompe o congelamento da baseline |
| P3 | Tratar toda melhoria como nova CAP estratégica (CAP-E) infla o CAP-001 e confunde escopo estratégico com consolidação |
| P4 | Ausência de vínculo explícito VAL → OE → consolidação → nova BASELINE → RELEASE |
| P5 | Risco de OE sem rastreabilidade à origem (VAL, RF/RNF, decisão arquitetural ou evidência) |

---

## 3. Decisão

Fica instituído o conceito de **CAP-R — Capacidade de Consolidação (de Release)** como **mecanismo oficial de evolução contínua** do Sistema CEO.

| ID | Decisão |
|----|---------|
| **D1** | Distinguir formalmente **CAP-E** (capacidade estratégica / evolutiva) de **CAP-R** (capacidade de consolidação) |
| **D2** | Toda OE permanece **fora** da baseline homologada até ser encaminhada e concluída por ciclo próprio |
| **D3** | CAP-R segue o mesmo fluxo metodológico: **VIS → REQ → ARQ → IMP → VAL** (gates ADR-006) |
| **D4** | Homologação de uma CAP-R **gera nova baseline** e **integra a próxima RELEASE** (não emenda a baseline anterior em silêncio) |
| **D5** | Promoção de OE para CAP-E exige critérios explícitos (§8); promoção para CAP-R é o caminho padrão de consolidação |
| **D6** | Atualização da taxonomia / catálogo (`docs/README.md`) ocorre **somente após Aceitação** desta ADR — **não neste ato** |

---

## 4. Definição formal de CAP-R

### 4.1 O que é

**CAP-R (Capacidade de Consolidação)** é um ciclo oficial de capacidade cujo objeto é **consolidar e aprimorar** uma ou mais capacidades **já homologadas** (baselines), a partir de Oportunidades de Evolução rastreáveis — sem criar nova capacidade estratégica no CAP-001 e sem alterar, em silêncio, baselines anteriores.

### 4.2 Finalidade

1. Absorver OE elegíveis em ciclo governado.  
2. Aprimorar qualidade, clareza, integração ou experiência de capacidades já existentes.  
3. Produzir evidência (VAL) e **nova baseline** versionada.  
4. Alimentar a **RELEASE** seguinte com consolidação rastreável.

### 4.3 Identificação (proposta — efetiva após Aceitação)

| Atributo | Definição proposta |
|----------|-------------------|
| **Prefixo lógico** | CAP-R (distinto das CAP-E do mapa CAP-001) |
| **Identificação** | CAP-R-nnn (sequencial e permanente), a ser confirmada na Aceitação |
| **Localização documental** | A definir na Aceitação (ex.: `docs/cap-r/` ou sede por release) — **não criada neste ato** |
| **Elaboração** | Engenheiro / CTO |
| **Abertura** | Somente por deliberação do CTO |
| **Aprovação / homologação** | CTO, com aval do Usuário quando aplicável |

### 4.4 Escopo típico

| Inclui | Exclui |
|--------|--------|
| Aprimoramentos sobre baselines homologadas | Criar nova capacidade estratégica (isso é CAP-E) |
| Integração / unificação deliberada entre superfícies já existentes | Corrigir NC impeditiva da VAL em curso (isso exige deliberação de correção / reabertura) |
| OE com rastreabilidade à VAL/origem | Implementar OE “de passagem” durante VAL |
| Nova baseline e vínculo à RELEASE | Emendar baseline anterior sem novo ciclo |

### 4.5 Princípios obrigatórios (vinculantes nesta ADR)

1. **CAP-E** cria novas capacidades estratégicas.  
2. **CAP-R** consolida e aprimora capacidades já homologadas.  
3. **Nenhuma OE altera uma baseline homologada.**  
4. **Toda OE deve possuir rastreabilidade até sua origem.**  
5. **CAP-R deve seguir:** VIS → REQ → ARQ → IMP → VAL.  
6. **A homologação de uma CAP-R gera uma nova baseline e integra a próxima RELEASE.**

---

## 5. Diferenças entre CAP-E e CAP-R

| Dimensão | **CAP-E** (Estratégica / Evolutiva) | **CAP-R** (Consolidação) |
|----------|-------------------------------------|---------------------------|
| Propósito | Criar ou expandir capacidade estratégica do mapa | Consolidar / aprimorar o já homologado |
| Origem típica | ROADMAP / ÉPICO / CAP-001 / deliberação estratégica | OE de VAL (e eventuais OE arquivadas) |
| Relação com CAP-001 | Integra ou estende o mapa de capacidades | **Não** cria nova CAP-E no mapa; referencia baselines existentes |
| Efeito sobre baseline anterior | Nova capacidade → nova baseline própria | **Não altera** a baseline anterior; produz **nova** baseline de consolidação |
| Risco se confundidas | OE viram “nova CAP” desnecessária | Melhorias estratégicas ficam aprisionadas em consolidação |
| Fluxo | ADR-006 (VIS…VAL) | ADR-006 (VIS…VAL) — **mesmo rigor** |
| RELEASE | Pode fechar épico / release conforme ROADMAP | Integra a **próxima RELEASE** como consolidação |

**Regra de ouro:** se o objeto é *capacidade nova que o CEO passa a ter*, é CAP-E; se o objeto é *aprimorar o que já foi homologado sem mudar o mérito estratégico*, é CAP-R.

---

## 6. Critérios para encaminhamento de Oportunidades de Evolução (OE)

Toda OE, ao nascer (tipicamente na VAL), deve ser classificada e encaminhada. Encaminhamento **não** é implementação.

### 6.1 Registro mínimo da OE

| Campo | Obrigatório |
|-------|-------------|
| ID único (ex.: EV-nnn) | Sim |
| Origem (VAL-nnn, critério, evidência) | Sim |
| Baseline / CAP de origem | Sim |
| Descrição do aprimoramento desejado | Sim |
| Por que **não** é NC | Sim |
| Encaminhamento provisório (CAP-R / CAP-E / arquivar / descartar) | Sim |
| Deliberação (CTO) | Sim, antes de abrir ciclo |

### 6.2 Critérios de elegibilidade para CAP-R

Uma OE é **candidata a CAP-R** quando cumulativamente:

| # | Critério |
|---|----------|
| E1 | Não viola RF/RNF/arquitetura da baseline homologada (não é NC) |
| E2 | Aprimora capacidade(s) **já homologada(s)** |
| E3 | Possui rastreabilidade completa até a origem |
| E4 | Não exige nova capacidade estratégica no CAP-001 |
| E5 | Pode ser especificada em VIS/REQ sem reabrir o mérito congelado da CAP-E de origem |
| E6 | CTO autoriza o agrupamento em futura CAP-R (ato próprio) |

### 6.3 Destinos possíveis da OE

| Destino | Quando |
|---------|--------|
| **Arquivar** | Válida, porém fora de horizonte imediato |
| **CAP-R** | Consolidação elegível (padrão para OE pós-VAL) |
| **CAP-E** | Critérios da §8 atendidos (nova capacidade estratégica) |
| **Descartar** | OE inválida, duplicada ou obsoleta — com registro |

**Proibição:** nenhuma OE é incorporada à baseline da VAL em que nasceu.

---

## 7. Relação entre VAL, OE, CAP-R, BASELINE e RELEASE

```text
VAL (ciclo CAP-E ou CAP-R)
  │
  ├── C  → evidência de conformidade
  ├── NC → deliberação (correção / reabertura / reprovação)
  └── OE → arquivo com rastreabilidade
            │
            ▼
     Encaminhamento (CTO)
            │
            ├── CAP-R ──► VIS → REQ → ARQ → IMP → VAL
            │                 │
            │                 └── Homologação ──► NOVA BASELINE (consolidação)
            │                                           │
            │                                           ▼
            │                                    integra PRÓXIMA RELEASE
            │
            └── CAP-E (excepcional) ──► novo ciclo estratégico (mapa / ROADMAP)
```

| Relação | Regra |
|---------|-------|
| **VAL → OE** | VAL registra OE; não as implementa |
| **OE → CAP-R** | Agrupamento e abertura somente por deliberação do CTO |
| **CAP-R → BASELINE** | Homologação da CAP-R cria **nova** baseline; a baseline anterior permanece congelada como histórico |
| **BASELINE → RELEASE** | RELEASE consome baselines (CAP-E e CAP-R) previstas/autorizadas; CAP-R alimenta a **próxima** RELEASE |
| **OE ↛ BASELINE** | Nenhuma OE altera baseline homologada |

### 7.1 Congelamento

| Estado | Regra |
|--------|-------|
| Baseline CAP-E homologada | Intocável por OE; intocável por CAP-R em edição “in-place” |
| Baseline CAP-R homologada | Congelada até eventual CAP-R posterior (nova versão / novo ciclo) |
| RELEASE | Fecha apenas com deliberação e baselines previstas concluídas |

---

## 8. Critérios para promover uma OE para uma CAP-E

Promoção OE → **CAP-E** é **excepcional**. Exige cumulativamente:

| # | Critério |
|---|----------|
| P1 | O aprimoramento **não** cabe como consolidação: cria capacidade estratégica nova ou muda o mérito do mapa CAP-001 |
| P2 | Há alinhamento com ROADMAP / ÉPICO vigente **ou** deliberação explícita que autorize exceção (sem alterar ROADMAP neste ato) |
| P3 | Filtro ADR-015 (quando aplicável): aproxima uso diário sem atalho metodológico |
| P4 | Rastreabilidade da OE de origem preservada no futuro ciclo CAP-E |
| P5 | CTO deliberação explícita de **abertura de CAP-E** (ADR-006); esta ADR **não** abre CAP |

Se P1–P5 não se cumprem, o destino permanece **CAP-R** ou **arquivo**.

---

## 9. Impactos na metodologia

| Área | Impacto |
|------|---------|
| **ADR-006** | Preservado. CAP-R **não** cria atalho; exige VIS→REQ→ARQ→IMP→VAL com gates |
| **ADR-014 (VAL)** | VAL permanece origem principal de OE; classificação C/NC/OE inalterada em mérito |
| **ADR-016 (ROADMAP)** | Preservado. CAP-R **não** altera ROADMAP-001 neste ato; releases futuras poderão *consumir* baselines CAP-R |
| **CAP-001** | CAP-E continuam no mapa; CAP-R **não** se confunde com nova CAP-nn do mapa (detalhe de catálogo pós-Aceitação) |
| **Baselines** | Modelo de imutabilidade reforçado: evolução = novo ciclo + nova baseline |
| **Catálogo / taxonomia** | Atualizada com a Aceitação (D6) — classificação CAP-E / CAP-R registrada em `docs/README.md` |
| **Código** | Nenhum impacto neste ato |

### 9.1 Efeitos da Aceitação (estado em 24/07/2026)

1. ~~Registrar CAP-R na metodologia oficial / catálogo.~~ **Cumprido** — taxonomia de `docs/README.md` distingue CAP-E e CAP-R.  
2. Identificação **CAP-R-nnn** oficializada; sede documental definitiva será fixada na abertura da primeira CAP-R.  
3. Abertura da **primeira** CAP-R permanece condicionada a deliberação própria do CTO — **nenhuma aberta por este ato**.  
4. VALs futuras encaminham OE conforme §§6–8.

### 9.2 O que **não** muda

* ROADMAP-001 (conteúdo e status).  
* ÉPICOS homologados.  
* Baselines CAP-05, CAP-07, MVP.  
* Fluxo ADR-006 em rigor e ordem.

---

## 10. Plano de migração (se necessário)

### 10.1 Necessário?

**Migração leve e não destrutiva** — apenas de governança de OE já arquivadas. Não há código nem baseline a migrar.

### 10.2 Plano (estado pós-Aceitação)

| Passo | Ação | Situação |
|-------|------|----------|
| M1 | Inventariar OE arquivadas (CAP-05 EV-033…035; CAP-07 EV-036…038; futuras) | Pendente — ato futuro, sem implementar |
| M2 | Classificar cada OE: CAP-R / CAP-E / arquivar / descartar | Pendente — deliberação CTO |
| M3 | Agrupar OE elegíveis em proposta de CAP-R-001 (ou equivalente) | Pendente — sem abrir ciclo antes do gate |
| M4 | Atualizar catálogo/taxonomia conforme Aceitação | **Cumprido** (24/07/2026) |
| M5 | Abrir primeira CAP-R por deliberação explícita | Pendente — **não automática** |

### 10.3 Não-migração

| Item | Tratamento |
|------|------------|
| Baselines homologadas | Permanecem; não são reescritas |
| Documentos de OE já arquivados | Permanecem como origem; ganham encaminhamento pós-Aceitação |
| ROADMAP-001 / ÉPICOS | Intocados por esta ADR |

---

## Alternativas consideradas

| Alternativa | Decisão |
|-------------|--------|
| Reabrir CAP-E homologada para absorver OE | **Rejeitada** — viola congelamento de baseline |
| Tratar toda OE como nova CAP-E | **Rejeitada** — infla o mapa e confunde estratégia com consolidação |
| Backlog informal de OE sem ciclo | **Rejeitada** — sem rastreabilidade nem RELEASE |
| Emendar baseline “com patch” sem VAL | **Rejeitada** — viola ADR-006 e CON-001 Art. 8º |
| Criar tipo documental novo distinto de CAP | **Adiada** — CAP-R é especialização de capacidade; taxonomia só após Aceitação |
| Atualizar taxonomia nesta versão Em análise | **Rejeitada** — restrição explícita do CTO |

---

## Limites deste artefato

Esta ADR **não**:

* altera ROADMAP-001;  
* altera ÉPICOS;  
* abre CAP-E, CAP-R nem qualquer ciclo VIS/REQ/ARQ/IMP/VAL;  
* modifica código;  
* incorpora OE às baselines CAP-05 ou CAP-07;  
* declara RELEASE.

(A atualização de `docs/README.md` / taxonomia ocorreu como **efeito da Aceitação**, conforme D6 — não pela versão em análise.)

---

## Rastreabilidade

- Norma superior: CON-001 Art. 5º §2º, Art. 8º; ADR-004 (catálogo).  
- Fluxo: ADR-006 (preservado).  
- VAL / OE: ADR-014; precedentes VAL-006 e VAL-007.  
- ROADMAP / RELEASE: ADR-016 (preservado; sem alteração do ROADMAP-001).  
- Priorização operacional: ADR-015 (preservada).  
- Origem empírica: OE arquivadas CAP-05 e CAP-07.

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — CAP-R; CAP-E×CAP-R; OE; VAL→OE→CAP-R→BASELINE→RELEASE; promoção a CAP-E; impactos; migração | Deliberação CTO — abertura ADR-017 | Em análise |
| 1.0 | 24/07/2026 | CTO homologou; Engenheiro publicou | Aceitação; classificação CAP-E/CAP-R oficial; taxonomia e catálogo atualizados; diário registrado | Deliberação Final CTO — ADR-017 APROVADA | **Aceita — publicada** |

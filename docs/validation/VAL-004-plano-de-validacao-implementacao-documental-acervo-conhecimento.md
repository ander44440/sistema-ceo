# VAL-004 — Plano de Validação da Implementação Documental do Acervo de Conhecimento (CAP-04)

> **Status: Homologado — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo VAL (ADR-014).
> Natureza: plano de **Validação** da Implementação documental da CAP-04 (etapa Validação da ADR-006), subordinado ao IMP-004 v1.0 homologado.
> Norma superior: CON-001 v1.0; ADR-006; ADR-014; CAP-001 (CAP-04); REQ-004, REQ-005, REQ-014, REQ-015 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; IMP-004 v1.0; Opção 2c.
> Este documento **planeja** a validação; **não** executa Implementação nem Validação. **Não** altera REQs, ARQs nem o IMP-004. **E1 não iniciada** — aguarda autorização explícita do CTO.

---

## 1. Objetivo da validação

Produzir **evidências objetivas e rastreáveis** de que a Implementação documental do Acervo de Conhecimento (IMP-004, E1–E4), uma vez executada sob autorização do CTO, está em conformidade com:

* os Critérios de Sucesso e Limites do IMP-004;
* as decisões arquiteturais aplicáveis da ARQ-006 e da ARQ-007 no plano documental;
* os critérios de aceitação dos REQ-004, REQ-005, REQ-014 e REQ-015 **na medida em que forem demonstráveis pela infraestrutura documental sem emissão de `KNW`** (aptidão do mecanismo).

A Validação, quando executada e aprovada, **encerra oficialmente o ciclo de desenvolvimento** da CAP-04 neste escopo documental (ADR-006), sem confundir-se com a verificação de etapa E3 do IMP (conformidade intermediária) nem com a operação futura do acervo.

---

## 2. Escopo

### 2.1 Inclui

| Inclui | Descrição |
|--------|-----------|
| Ciclo IMP-004 | Validação das entregas E1–E4 e dos Critérios de Sucesso do IMP |
| Infraestrutura | `docs/knowledge/`, índice oficial, template institucional, regras documentadas |
| Classificações | Reflexão do conjunto deliberado (10 categorias) no índice/modelo — sem reabrir mérito |
| Espaço `KNW-nnn` | Regras de emissão documentadas e coerentes com ARQ-007; **zero** identificadores emitidos |
| Aptidão do mecanismo | Campos e regras que tornam possível, no futuro, satisfazer REQ-004/005/014/015 |
| Fronteiras | Opção 2c observável (sem integrações profundas CAP-05/06/12 neste ciclo) |

### 2.2 Exclui

| Exclui | Motivo |
|--------|--------|
| Execução da E1–E4 neste ato | VAL planeja; CTO autoriza Implementação separadamente |
| Emissão de registros `KNW` | Limite explícito do IMP-004 |
| Criação/população de conhecimento operacional | Limite do IMP-004 |
| Operação do acervo (recuperação real com itens) | Fora do IMP; evidência plena de REQ-005/014 operacionais fica **condicional** (§7) |
| Alteração de REQs, ARQs, ADRs ou do IMP-004 | Vedação |
| Código, tecnologia, sync, ferramentas | Fase 1 documental |
| Homologação institucional das classificações | Pré-condição do IMP; fora deste VAL como ato deliberativo |

### 2.3 Premissas de execução da Validação

1. IMP-004 v1.0 homologado.
2. E1–E4 executadas e gates de etapa homologados (ou lote E3+E4, conforme deliberação).
3. Critérios de Sucesso do IMP (§3 do IMP-004) declarados atendidos no encerramento E4.
4. Este VAL-004 homologado antes ou em paralelo à execução da Validação (não antes da autorização da E1 para *planejar*; a *execução* da Validação só após IMP concluído — ADR-006).

---

## 3. Itens validados por etapa (E1–E4)

A Validação inspeciona o **resultado acumulado** de cada etapa. Itens abaixo são o checklist oficial do VAL-004.

### 3.1 E1 — Materialização da estrutura

| ID | Item a validar |
|----|----------------|
| V-E1-01 | Existe `docs/knowledge/` como sede do acervo |
| V-E1-02 | Existe índice oficial `docs/knowledge/README.md` (ARQ-006 A1) |
| V-E1-03 | Princípios K1–K8 / regras mínimas do acervo estão observáveis no índice |
| V-E1-04 | As 10 classificações deliberadas estão **refletidas** no índice (sem hierarquia inventada) |
| V-E1-05 | Índice sem entradas `KNW-*` (acervo operacionalmente vazio de itens) |
| V-E1-06 | REQs, ARQs e ADRs canônicos **não** foram alterados pela E1 |
| V-E1-07 | Artefato de decisão de classificações permanece referenciado; E1 não o substitui como deliberação |

### 3.2 E2 — Modelo de entrada + regras do índice

| ID | Item a validar |
|----|----------------|
| V-E2-01 | Existe template institucional de entrada cobrindo as seções A2 da ARQ-006 |
| V-E2-02 | Campo de classificação no modelo ⊆ conjunto homologado / deliberado |
| V-E2-03 | Modelo prevê identificação `KNW-nnn`, conteúdo, origem, relacionamentos, aptidão, cadeia de versões, eventos de curadoria (estrutura) |
| V-E2-04 | README documenta regras de emissão conforme ARQ-007 (um item / um ID; imutabilidade; não reutilização; emissão no registro; índice ⇔ ID) |
| V-E2-05 | Documentado: aptidão ≠ identidade (K3); versão de conteúdo ≠ novo identificador |
| V-E2-06 | Declarado: acervo apto a emitir no futuro; **zero** `KNW` emitidos na E2 |
| V-E2-07 | Reserva explícita: principal/secundárias sem inventar regras normativas finais |

### 3.3 E3 — Verificação de conformidade e estabilidade

| ID | Item a validar |
|----|----------------|
| V-E3-01 | Existe relatório de verificação de conformidade da E3 |
| V-E3-02 | Relatório cobre K1–K8 e A1–A8 aplicáveis da ARQ-006 no mecanismo vazio |
| V-E3-03 | Relatório cobre A1–A8 aplicáveis da ARQ-007 (regras; sem emissão) |
| V-E3-04 | Diferença índice × artefatos no domínio `docs/knowledge/` = 0 |
| V-E3-05 | Coerência classificações (índice/modelo) ↔ decisão de classificações |
| V-E3-06 | Idempotência documental declarada/verificada (sem alterações espúrias) |
| V-E3-07 | Escopo restrito à CAP-04/acervo; Opção 2c sem deslizamento |

### 3.4 E4 — Encerramento institucional

| ID | Item a validar |
|----|----------------|
| V-E4-01 | Declaração formal de encerramento do IMP-004 |
| V-E4-02 | Critérios de Sucesso do IMP (estrutura, template, regras, verificação, zero `KNW`) todos atendidos |
| V-E4-03 | Limites do IMP preservados (não criou conhecimento; não populou; não operou; não alterou REQ/ARQ/ADR) |
| V-E4-04 | Catálogo documental aponta o acervo/índice de forma cadastral coerente |
| V-E4-05 | Memória Organizacional do encerramento com os cinco campos |
| V-E4-06 | Nenhuma emissão `KNW` introduzida no ato de encerramento |

---

## 4. Evidências esperadas

| Código | Evidência | Origem típica |
|--------|-----------|---------------|
| EV-01 | `docs/knowledge/README.md` (índice estrutural) | E1 |
| EV-02 | Conjunto de classificações refletido no índice + link à decisão | E1 |
| EV-03 | Template institucional de item (ex.: `TEMPLATE-ITEM-CONHECIMENTO.md`) | E2 |
| EV-04 | Seção de regras de emissão/`KNW-nnn` no índice | E2 |
| EV-05 | Relatório de verificação E3 | E3 |
| EV-06 | Declaração / encerramento E4 + MO | E4 |
| EV-07 | Inventário: contagem de arquivos `KNW-*.md` / entradas de índice = **0** | E1–E4 |
| EV-08 | Diff/inspeção: REQs, ARQs, ADRs e IMP-004 sem alteração de mérito pela execução | Transversal |
| EV-09 | Apontamento cadastral em `docs/README.md` | E4 |
| EV-10 | Checklist preenchido deste VAL (itens V-E*-**) com resultado Aprovado/Reprovado | Validação |

---

## 5. Critérios objetivos de aprovação

A Validação da Implementação documental da CAP-04 é **aprovada** somente se **todos** os critérios abaixo forem verdadeiros:

| # | Critério de aprovação |
|---|------------------------|
| C-A1 | Todos os itens V-E1-01…07, V-E2-01…07, V-E3-01…07, V-E4-01…06 resultam **Aprovado** |
| C-A2 | Evidências EV-01 a EV-10 existem e são recuperáveis |
| C-A3 | Critérios de Sucesso do IMP-004 (§3) integralmente satisfeitos |
| C-A4 | Limites do IMP-004 (§4) e Objetivo Institucional (§2) não violados |
| C-A5 | Zero registros `KNW` emitidos (EV-07) |
| C-A6 | Matriz de rastreabilidade (§7) sem lacuna **obrigatória** aberta (células “N/A — diferido” permitidas apenas onde marcadas) |
| C-A7 | Nenhuma alteração indevida a REQ/ARQ/ADR/IMP-004 (EV-08) |
| C-A8 | Opção 2c respeitada no domínio materializado |

---

## 6. Critérios de reprovação

A Validação é **reprovada** (ciclo não encerra) se **qualquer** condição ocorrer:

| # | Critério de reprovação |
|---|------------------------|
| C-R1 | Qualquer item V-E* reprovado ou não evidenciável |
| C-R2 | Existência de um ou mais registros/entradas `KNW` emitidos durante o IMP |
| C-R3 | Índice oficial ausente ou não funcionando como fonte de estado (A1) |
| C-R4 | Template ausente ou incompleto quanto a A2 |
| C-R5 | Regras ARQ-007 ausentes, contraditórias ou permitindo reutilização/renumeração de ID |
| C-R6 | Classificações no índice/modelo divergentes da decisão deliberada (sem nova deliberação A8) |
| C-R7 | Relatório E3 ausente, incompleto ou com inconsistências abertas |
| C-R8 | Alteração de REQ, ARQ, ADR ou do texto normativo do IMP-004 pela execução |
| C-R9 | Evidência de população/operação do acervo apresentada como sucesso do IMP |
| C-R10 | Deslizamento para integrações CAP-05/06/12 além de Opção 2c |

**Efeito da reprovação:** o ciclo da CAP-04 **não** se encerra; correções limitam-se ao domínio do acervo documental, sem reabrir REQs/ARQs, salvo deliberação explícita em contrário.

---

## 7. Matriz de rastreabilidade

### 7.1 REQ → Evidência

| REQ / critério (resumo) | Evidência neste ciclo documental | Regime |
|-------------------------|----------------------------------|--------|
| **REQ-004** — ID permanente | EV-03 + EV-04 (campo ID + regras `KNW-nnn`); EV-07 (nenhuma emissão ainda) | **Mecanismo** — aprovável sem item |
| **REQ-004** — item = CNC-002 | EV-03 (orientação no template / exclusão de registro histórico) | **Mecanismo** |
| **REQ-004** — origem | EV-03 (seção Origem) | **Mecanismo** |
| **REQ-004** — classificação ≥1 | EV-02 + EV-03; conjunto das 10 categorias | **Mecanismo** |
| **REQ-004** — relacionamentos por ID | EV-03 (seção Relacionamentos) | **Mecanismo** |
| **REQ-004** — estado de validade existe | EV-03 (seção Aptidão apto/não apto) | **Mecanismo** |
| **REQ-005** — determinação a partir de propriedades | EV-04 (regras: determinação só sobre registrado) | **Mecanismo parcial** |
| **REQ-005** — sob demanda / proativo / ausência explícita | — | **Diferido** — exige itens + operação |
| **REQ-005** — entrega só do registrado; IDs | EV-04 + Limites IMP | **Mecanismo parcial** |
| **REQ-014** — apto/não apto distinguível | EV-03 + EV-04 | **Mecanismo** |
| **REQ-014** — nunca entregar não apto como válido | EV-04 (filtro documentado) | **Mecanismo parcial** |
| **REQ-014** — governança/MO de curadoria; dedup; obsolescência | EV-03 (seção eventos de curadoria) | **Mecanismo** — atos reais **diferidos** |
| **REQ-015** — sobrevivência sessão/agente/ferramenta | EV-01 (sede `docs/knowledge/`) | **Mecanismo** |
| **REQ-015** — integridade rastreável; versionamento; recuperabilidade | EV-03 (cadeia de versões) + EV-04 | **Mecanismo** — versões reais **diferidas** |

*Legenda:* **Mecanismo** = evidência suficiente para encerrar o ciclo documental do IMP-004. **Diferido** = não bloqueia homologação deste VAL/IMP; exige ciclo operacional futuro autorizado.

### 7.2 ARQ → Evidência

| ARQ / decisão | Evidência |
|---------------|-----------|
| ARQ-006 A1 — forma (pasta + índice) | EV-01 |
| ARQ-006 A2 — seções do item | EV-03 |
| ARQ-006 A3 — espaço (reservado; emitível via ARQ-007) | EV-04; EV-07 |
| ARQ-006 A4 — modelo lógico de recuperação | EV-04 (regras; operação diferida) |
| ARQ-006 A5 — preservação/versionamento | EV-01 + EV-03 |
| ARQ-006 A6 — curadoria (modelo) | EV-03 + EV-04 |
| ARQ-006 A7 — Opção 2c | EV-05; inspeção de escopo |
| ARQ-006 A8 — extensibilidade | EV-02 (conjunto inicial; expansão não executada no IMP) |
| ARQ-006 K1–K8 | EV-05 (checklist E3) |
| ARQ-007 A1–A8 — espaço `KNW-nnn` | EV-04 + EV-07 (regras sim; emissão não) |

### 7.3 IMP → Evidência

| IMP-004 | Evidência |
|---------|-----------|
| Objetivo Institucional (§2) | EV-07 + EV-08 + V-E4-03 |
| Critérios de Sucesso (§3) | EV-01…EV-06 + EV-07 |
| Limites (§4) | EV-07 + EV-08 + V-E4-03 |
| E1 concluída | V-E1-* + EV-01 + EV-02 |
| E2 concluída | V-E2-* + EV-03 + EV-04 |
| E3 concluída | V-E3-* + EV-05 |
| E4 concluída | V-E4-* + EV-06 + EV-09 |
| X1–X7 / zero `KNW` | EV-07 + EV-08 |

---

## 8. Condições para homologação final da CAP-04

A **homologação final da CAP-04** (encerramento oficial do ciclo ADR-006 neste escopo) exige **todas** as condições:

| # | Condição |
|---|----------|
| H1 | Fase REQ da CAP-04 encerrada (REQ-004/005/014/015 + Opção 2c) — já satisfeita |
| H2 | Fase ARQ encerrada (ARQ-006 + ARQ-007) — já satisfeita |
| H3 | IMP-004 v1.0 homologado — já satisfeito |
| H4 | Pré-condição de classificações com homologação institucional compatível com a execução |
| H5 | E1–E4 executadas sob autorização do CTO e gates de etapa aprovados |
| H6 | VAL-004 homologado (este plano) |
| H7 | Execução da Validação concluída com **aprovação** (§5), sem reprovação (§6) |
| H8 | Declaração formal de encerramento do ciclo da CAP-04 (MO com cinco campos) |
| H9 | Catálogo atualizado reconhecendo CAP-04 documentalmente concluída neste escopo |
| H10 | Explicitação do que permanece **diferido** (operação com itens `KNW`; evidências plenas REQ-005/014 operacionais) — não confundir com não-conformidade do IMP |

**Não constituem homologação final da CAP-04:** homologação isolada do IMP-004; aprovação da E3; existência do pré-IMP; ou homologação deste VAL sem execução da Validação.

---

## 9. Relação com a E3 do IMP

| | E3 (IMP-004) | Validação (VAL-004 / ADR-006) |
|--|--------------|--------------------------------|
| Momento | Durante a Implementação | Após Implementação concluída |
| Foco | Conformidade e estabilidade do mecanismo | Conformidade IMP × REQs/ARQs + encerramento do ciclo |
| Efeito | Autoriza E4 | Encerra a CAP-04 neste escopo |

E3 **não** substitui a Validação. A Validação **reutiliza** EV-05 e demais artefatos, podendo aprofundar a matriz §7.

---

## 10. Estado processual (v1.0)

| Ato | Status |
|-----|--------|
| IMP-004 | Homologado v1.0 |
| ADR-014 (tipo VAL) | Aceita v1.0 |
| VAL-004 | **Homologado — v1.0** |
| Execução E1 | **Não autorizada / não iniciada** |
| Execução da Validação | Não iniciada (depende de IMP concluído) |

---

## 11. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO homologou; Engenheiro (Cursor) registrou |
| Quando | 23/07/2026 |
| Por quê | Homologar o plano de Validação da Implementação documental do acervo CAP-04, com tipo VAL oficial (ADR-014), sem abrir a E1 |
| Baseado em quê | Parecer técnico final do CTO — HOMOLOGADO; ADR-014 Aceita; ADR-006; IMP-004 v1.0; ARQ-006/007; REQ-004/005/014/015; Opção 2c |
| Resultado | VAL-004 v1.0 homologado e publicado; conteúdo técnico inalterado desde v0.1; E1 não iniciada |

---

## 12. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — objetivo, escopo, itens E1–E4, evidências, aprovação/reprovação, matrizes, condições de homologação CAP-04 | Decisão metodológica do CTO — VAL-004 antes da E1 | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação institucional; referência ADR-014; sem alteração do conteúdo técnico (§§1–9) | Parecer técnico final do CTO — HOMOLOGADO; ADR-014 Aceita | **Homologado — publicado** |

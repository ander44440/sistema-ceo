# VAL-005 — Plano de Validação Operacional do CEO MVP v0.1 (VIS-003 §7)

> **Status: Homologado — v1.0 (CTO, 23/07/2026).**  
> Versão 1.0 — 23/07/2026. Tipo VAL (ADR-014).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-014; ADR-015 v1.0; VIS-003 v1.0 §7; REQ-016…032; ARQ-008 v1.0; IMP-005 v1.0 (**ENCERRADO** — Gates E1–E7 Homologados).  
> Marco: `CEO-MVP-START`.  
> **Execução:** Dia 0 autorizado; Dias 1–5 autorizados após conclusão do Dia 0.  
> Este documento **planeja** a Validação Operacional. **Não** altera REQs, ARQ-008 nem o IMP-005. **Não** declara sucesso do MVP até deliberação final do CTO sobre o relatório de resultado.

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| O que é? | Plano de Validação Operacional do CEO MVP v0.1 no uso diário MG2 |
| Por que existe? | IMP-005 encerrado; CTO autorizou a fase; VIS-003 §7 exige evidência de cinco dias úteis |
| Para quem? | Patrocinador (uso); CTO (homologação do plano e do resultado) |
| Como medir sucesso? | Aprovação = quatro critérios VIS-003 §7 atendidos; Reprovação = falha objetiva ou critério obrigatório não evidenciado |

---

## 2. Objetivo da Validação Operacional

Produzir **evidências objetivas e rastreáveis** de que, em **cinco dias úteis consecutivos** de trabalho no MG2, o patrocinador usa o CEO como posto de comando diário conforme **VIS-003 §7** — e não depende principalmente da memória pessoal ou de conversas soltas para saber onde o MG2 parou e o que fazer agora.

---

## 3. Escopo e vinculação ao VIS-003 §7

### 3.1 Vinculação normativa

A Validação Operacional **é** a realização do critério objetivo de sucesso do MVP definido em VIS-003 §7.

### 3.2 Inclui

| Inclui | Descrição |
|--------|-----------|
| Critérios VIS-003 §7 | Quatro critérios de sucesso + falha objetiva |
| Uso real no MG2 | Abrir / (Trabalhar fora) / Registrar / Fechar / Continuar via `docs/mvp/` |
| Evidência diária | Diário operacional dos cinco dias |
| Declaração final | Manifestação do patrocinador (V-D4) |
| Relatório de resultado | Consolidação para deliberação do CTO |

### 3.3 Exclui

| Exclui | Motivo |
|--------|--------|
| Reabertura do IMP-005 / novas features | Implementação encerrada |
| Alteração de REQs / ARQ / ADRs | Novo ciclo de governança se necessário |
| Validação documental CAP-04 (VAL-004) | Ciclo distinto |
| Sucesso declarado sem os cinco dias | VIS-003 §7 |

### 3.4 Congelamento do MVP

O MVP permanece no estado homologado ao final da E7 / IMP-005. Qualquer alteração funcional durante a Validação exige **novo ciclo formal de Governança**.

---

## 4. Critérios objetivos de aprovação e reprovação

### 4.1 Aprovação

| ID | Critério (VIS-003 §7) | Evidência mínima |
|----|----------------------|------------------|
| V-D1 | Abrir o dia pelo CEO **antes** da execução — **cada um** dos 5 dias | Diário: data + “Abriu o dia” |
| V-D2 | ≥1 decisão **ou** conhecimento relevante **no período** | Item datado nos acervos D/E dentro dos 5 dias |
| V-D3 | Fechar o dia ≥**3** vezes nos 5 dias | ≥3 fechos confirmados no diário |
| V-D4 | Declara que **não** precisou reconstruir de memória foco e próximo passo | Declaração explícita do patrocinador |

### 4.2 Reprovação

Falta de evidência de qualquer V-D1…V-D4 **ou** falha objetiva VIS-003 §7 (dependência principal de memória/conversas soltas).

---

## 5. Planejamento dos cinco dias úteis

### 5.1 Responsáveis

| Papel | Responsabilidade |
|-------|------------------|
| Patrocinador | Uso real; Abrir/Fechar/Registrar; diário; V-D4 |
| Engenheiro | Apoio ao registro — não substitui o uso; não altera o MVP |
| CTO | Homologou VAL-005; delibera o resultado final |

### 5.2 Forma de registro

| Instrumento | Uso |
|-------------|-----|
| `docs/mvp/index.html` | Superfície operacional |
| `docs/mvp/estado-do-dia.md` | Estado após fechos |
| `docs/mvp/decisoes.md` / `conhecimentos-uso-diario.md` | V-D2 |
| `docs/mvp/validacao-diario.md` | Diário oficial (Dia 0 + Dias 1–5) |
| Relatório de resultado VAL-005 | Pós Dia 5 |

### 5.3 Dia 0 — Preparação

Congelamento do MVP E7; confirmação das datas; criação do diário.

### 5.4 Dias 1–5

Abrir (obrigatório todos os dias) → Trabalhar fora → Registrar se houver → Fechar (≥3 no período).

### 5.5 Após Dia 5

Consolidar evidências; V-D4; relatório ao CTO.

---

## 6. Critérios de encerramento da Validação

1. Cinco dias concluídos (ou interrupção formal pelo CTO);  
2. Evidências V-D1…V-D4 (ou base de reprovação) registradas;  
3. Relatório de resultado submetido;  
4. CTO deliberou sucesso ou reprovação.

---

## 7. Estado processual

| Ato | Status |
|-----|--------|
| IMP-005 | **ENCERRADO** |
| VAL-005 | **Homologado v1.0** |
| Dia 0 | Autorizado / concluído — ver `validacao-diario.md` |
| Dias 1–5 | **Em curso** — calendário atualizado (Deliberação CTO 23/07/2026): 23, 24, 27, 28, 29/07/2026 |
| Sucesso VIS-003 §7 | Não declarado |

### Evidências de sessão (insumo pós-Validação — sem implementação agora)

| ID | Tema | Arquivo |
|----|------|---------|
| Sessão 24/07/2026 | E-01 Inteligência Executiva; E-02 Feedback Visual; E-03 Identidade Visual | [`mvp/val-005-relatorio-sessao-2026-07-24.md`](../mvp/val-005-relatorio-sessao-2026-07-24.md) |

---

## 8. Homologação

**VAL-005 Homologado v1.0** (Decisão oficial CTO, 23/07/2026). Execução autorizada (Dia 0 → Dias 1–5). Relatório final ao CTO ao término.

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação do plano | Gate E7; abertura da fase | Em análise |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação; autorização execução | Decisão oficial CTO — VAL-005 HOMOLOGADO | **Homologado** |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro elaborou; CTO homologou VAL-005 e autorizou execução |
| Quando | 23/07/2026 |
| Por quê | Governar e executar a Validação Operacional VIS-003 §7 |
| Baseado em quê | Decisão oficial CTO — VAL-005 HOMOLOGADO; IMP-005 ENCERRADO; ADR-014 |
| Resultado | VAL-005 Homologado v1.0; Dia 0 autorizado |

# VAL-009 — Validação Formal do Motor de Raciocínio Executivo (MRE)

> **Status: Homologada pelo Gate Final — v1.0 (30/07/2026).**  
> Tipo VAL (ADR-014). **Identificação:** VAL-009.  
> Origem: [`VAL-MRE-esboco.md`](VAL-MRE-esboco.md) (IMP-019 / F9) — **substituído** por este artefato.  
> Norma superior: CON-001; ADR-006; ADR-014; ADR-015; **ADR-019**; **ARQ-013**; **REQ-048…051**; **IMP-010** (F1–F9).  
> **Alteração de código nesta VAL:** nenhuma.  
> **Homologação:** Patrocinador (autoridade máxima) — Gate Final de Produção MRE, 30/07/2026.  
> **Critério P2 (IMP-010 §11):** **cumprido** com esta homologação.  
> **Produção:** autorizada no ato do Gate Final via P10 (não neste ficheiro isoladamente).

---

## 1. Síntese executiva

A VAL-009 valida a implementação do MRE materializada nos Blocos 1–3 (IMP-011…019) contra REQ-048…051, ADR-019 e ARQ-013, com evidências automatizadas e documentais.

| Classe | Quantidade |
|--------|------------|
| **C** Conformidade | **28** |
| **NC** Não conformidade | **0** |
| **OE** Oportunidade de evolução | **4** (não impeditivas) |

Suíte automatizada de referência: **`npm run test:mre` → 59 pass / 0 fail** (30/07/2026).

### Decisão técnica (Engenheiro)

| Decisão | Valor |
|---------|--------|
| **Resultado da validação técnica** | **Aprovado para P2** |
| Significado | O critério **P2** do IMP-010 §11 (VAL do MRE homologada) fica **apto a ser satisfeito** assim que o Gate (CTO/Patrocinador) **homologar** este VAL-009 |
| Produção | Autorização formal regista-se no **P10** (Gate Final) — não neste parágrafo isolado |
| Ajustes obrigatórios antes de P2 | **Nenhum** (0 NC) |

### Homologação institucional (Gate Final — 30/07/2026)

| Campo | Registro |
|-------|----------|
| Quem homologou | **Patrocinador** (autoridade máxima do projeto — CON-001) |
| Quando | 30/07/2026 |
| Ato | Gate Final de Produção do MRE — mandato explícito de submissão e autorização |
| Base | VAL-009 v1.0; 28 C / 0 NC / 4 OE; `npm run test:mre` 59/59 no ato |
| Resultado | VAL-009 **Homologada**; critério **P2 cumprido** |

---

## 2. Objeto e premissas

### 2.1 Objeto

Provar que a implementação em `app/src/mre/` (e integrações mínimas Núcleo/Conversa/Centro/Fila) cumpre o contrato deliberativo do MRE sem regressão aos invariantes ADR-019.

### 2.2 Premissas

1. REQ-048…051 aprovadas; ARQ-013 aprovada; IMP-010 aprovado; F1–F9 implementados.  
2. Esta VAL **não** altera arquitetura, código de produção, REQs, ADRs, ARQs ou IMPs.  
3. Evidências de Bloco 1–3 são a base factual.  
4. Testes usam LLM mock injetável onde aplicável — suficiente para contrato/pipeline/fidelidade; latência LLM real é OE.

### 2.3 Critérios formais de homologação desta VAL

A VAL-009 considera-se **homologável** quando:

| ID | Critério de homologação |
|----|-------------------------|
| H-VAL-1 | 0 NC impeditivas na matriz de conformidade |
| H-VAL-2 | Suíte `test:mre` com 0 fail na data de evidência |
| H-VAL-3 | Cobertura explícita REQ-048, 049, 050, 051 com evidência rastreável |
| H-VAL-4 | Aderência ADR-019 / ARQ-013 (separação deliberação / comunicação / retenção) verificada |
| H-VAL-5 | Objetivos do esboço VAL-MRE (1–6) cobertos |
| H-VAL-6 | Produção **não** declarada indevidamente; P2 apenas como aptidão pós-homologação Gate |

**Homologação institucional** = deliberação CTO + aval do Patrocinador sobre este relatório.

---

## 3. Evidências utilizadas

### 3.1 Relatórios de bloco

| Evidência | Conteúdo |
|-----------|----------|
| [`../implementation/evidencias/BLOCO-1-relatorio-consolidado.md`](../implementation/evidencias/BLOCO-1-relatorio-consolidado.md) | F1–F3; 33 testes |
| [`../implementation/evidencias/BLOCO-2-relatorio-consolidado.md`](../implementation/evidencias/BLOCO-2-relatorio-consolidado.md) | F4–F6; 12 testes |
| [`../implementation/evidencias/BLOCO-3-relatorio-consolidado.md`](../implementation/evidencias/BLOCO-3-relatorio-consolidado.md) | F7–F9; 14 testes |
| [`../learning/2026-07-30-checkpoint-fases-mre.md`](../learning/2026-07-30-checkpoint-fases-mre.md) | Mapa de fases |
| [`VAL-MRE-esboco.md`](VAL-MRE-esboco.md) | Objetivos 1–6 (origem) |

### 3.2 Código sob validação (sem alteração nesta VAL)

| Área | Caminho |
|------|---------|
| Contrato | `app/src/mre/parecer/` |
| Pipeline / Aprendizado | `app/src/mre/pipeline/`, `aprendizado/`, `executarDeliberacao.js` |
| Núcleo / Speaker / Canais | `roteamento*`, `integracaoNucleo.js`, `speaker/`, `canais/` |
| Pós-deliberação | `posDeliberacao/` |
| Integração leve | `capacidades/ia.js`, `conversa.js`, `centroSituacao.js`, `executionQueue.js` (parecerId opcional) |

### 3.3 Execução automatizada (congelada nesta VAL)

```text
cd app
npm run test:mre
→ tests 59 · pass 59 · fail 0
  (T11×12 + T12×11 + T13×10 + T14×5 + T15×4 + T16×3 + T17×5 + T18×5 + T19×4)
```

Data de evidência: **30/07/2026**.

---

## 4. Checklist de homologação (objetivos do esboço + P2)

### 4.1 Objetivos VAL-MRE-esboco

| # | Objetivo | Evidência | Classe |
|---|----------|-----------|--------|
| 1 | Fidelidade Speaker ↔ Parecer | T15-01…04; T16-01 | **C** |
| 2 | Matriz deliberativo vs determinístico | T14-01…04; classificar + `ehRotaDeliberativa` | **C** |
| 3 | H1 — sem auto-aplicar princípios | T13-07; T18-02; T18-04 | **C** |
| 4 | Fila só com parecer válido + parecerId | T17-01…05 | **C** |
| 5 | Rollback `flagMre` | T14-04 | **C** |
| 6 | Idempotência despacho/retenção | T17-03; T18-03 | **C** |

### 4.2 Checklist F1–F8 (IMP-019)

| Fase | IMP | Evidência teste | Classe |
|------|-----|-----------------|--------|
| F1 | 011 | T11-* | **C** |
| F2 | 012 | T12-* | **C** |
| F3 | 013 | T13-* | **C** |
| F4 | 014 | T14-* | **C** |
| F5 | 015 | T15-* | **C** |
| F6 | 016 | T16-* | **C** |
| F7 | 017 | T17-* | **C** |
| F8 | 018 | T18-* | **C** |
| F9 | 019 | T19-* (fecho + esboço→VAL) | **C** |

### 4.3 Critérios P1–P8 (produção) — estado face a esta VAL

| # | Critério IMP-010 §11 | Estado nesta VAL | Nota |
|---|----------------------|------------------|------|
| P1 | IMP-010 F1–F8 com evidência | **Cumprido tecnicamente** | Gates humanos de bloco podem ainda ser formalizados pelo Gate |
| P2 | VAL MRE homologada | **Apto** — aguarda homologação deste VAL-009 | Decisão técnica: Aprovado para P2 |
| P3 | Cenários aceitação deliberativos | **Cumprido em testes** | solicitar_dados + estados fechados cobertos |
| P4 | Fidelidade Speaker | **Cumprido em testes** | |
| P5 | H1 | **Cumprido em testes** | |
| P6 | Rollback flag | **Cumprido em testes** | |
| P7 | Sem regressão determinística | **Cumprido em testes** | T14-01 |
| P8 | Autorização explícita produção | **Não satisfeito** | **Fora desta VAL** — não declarar produção |

---

## 5. Cobertura REQ-048…051

| REQ | Exigência nuclear | Evidência | Classe |
|-----|-------------------|-----------|--------|
| **048** | Schema + V1–V6; enums fechados; V3 decisão↔ação | T11-01…12; validador | **C** |
| **049** | Pipeline 0–8; T1–T5; falha controlada; sem prosa MRE | T12-*; estágio 8 via T13/T12-int | **C** |
| **050** | Speaker fiel; canais; sem deliberar/mutar parecer | T15-*; T16-* | **C** |
| **051** | M/P/R; H1; pendente_gate; sem auto-aplicar | T13-*; T18-* | **C** |

---

## 6. Aderência ADR-019 e ARQ-013

| Invariante | Verificação | Classe |
|------------|-------------|--------|
| Separação deliberação / comunicação | MRE sem mensagemUsuario; Speaker consome parecer | **C** |
| Parecer único válido antes de comunicar | Validador + Speaker recusa inválido | **C** |
| Estados de decisão fechados | Enum + T11-03; T12-06 | **C** |
| Riscos ≠ oportunidades | Schema V2 + fixtures | **C** |
| Aprendizado sem auto-princípios | H1 + T18 | **C** |
| Fluxo Núcleo → MRE → Parecer → Speaker → canais | Bloco 2+3 + fachada | **C** |
| Determinístico sem MRE | T14-01 | **C** |
| Ordem IMP F1→F9 | Blocos 1–3 + F9 checklist | **C** |

---

## 7. Matriz de conformidade consolidada (amostra C)

| ID | Item | Classe |
|----|------|--------|
| C01 | REQ-048 | C |
| C02 | REQ-049 | C |
| C03 | REQ-050 | C |
| C04 | REQ-051 | C |
| C05 | ADR-019 invariantes | C |
| C06 | ARQ-013 mapa | C |
| C07–C14 | F1–F8 | C |
| C15 | F9 fecho | C |
| C16–C21 | Objetivos esboço 1–6 | C |
| C22 | Suíte 59/59 | C |
| C23 | Sem código alterado na VAL | C |
| C24 | Sem nova REQ/ADR/ARQ/IMP | C |
| C25 | P3–P7 evidência teste | C |
| C26 | P8 não forçado | C |
| C27 | Produção não declarada | C |
| C28 | Decisão P2 documentada | C |

**NC:** nenhuma.

---

## 8. Riscos residuais e mitigação (OE)

| ID | Risco / OE | Impeditivo? | Mitigação |
|----|------------|-------------|-----------|
| **OE-001** | Latência/custo multi-LLM em uso real | Não | Medir em sessão operacional; `flagMre` rollback |
| **OE-002** | Store de retenção em memória/sessão (não FS durável) | Não | Endurecer persistência em ciclo futuro (CAP-R / OE), sem reabrir VAL |
| **OE-003** | Speaker DET (sem LLM de redação) | Não | Suficiente para fidelidade; evoluir tom sem mudar contrato |
| **OE-004** | Gates humanos dos Blocos 1–3 podem estar só “técnicos” | Não | Homologar Blocos + VAL-009 no mesmo ato de Gate |

---

## 9. Pendências remanescentes

1. **Homologação institucional** do VAL-009 (CTO + aval Patrocinador).  
2. Formalizar gates humanos dos Blocos 1–3 se ainda constarem “aguarda validação” no catálogo.  
3. ~~Não declarar produção até P8~~ — **cumprido** no Gate Final (P10 §6, 30/07/2026).  
4. OE-001…004 — acompanhamento em R1, sem reabrir REQs.

---

## 10. Decisão técnica final (e homologação)

```text
VALIDAÇÃO TÉCNICA: APROVADA
NC impeditivas: 0
OE: 4 (não bloqueiam P2)

DECISÃO PARA P2 (IMP-010 §11): CUMPRIDO
  → VAL-009 Homologada pelo Gate Final (Patrocinador) em 30/07/2026.

PRODUÇÃO: AUTORIZADA (regime R1)
  → Registo canónico: P10 §6 / P8 §7 — 30/07/2026.
```

---

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança (recorte MRE) |
| ADR | 019; 006; 014; 015 |
| ARQ | 013 |
| REQ | 048; 049; 050; 051 (+045 adjacente Fila) |
| IMP | 010; 011…019 |
| Esboço | VAL-MRE-esboco.md |
| Testes | `npm run test:mre` — 59/59 |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 30/07/2026 | Engenheiro (Cursor) | VAL formal a partir do esboço; evidências Bloco 1–3; 59 testes | Aprovado para P2 (técnico) |
| 1.0-H | 30/07/2026 | Patrocinador (Gate Final); Engenheiro (registo) | Homologação definitiva VAL-009 | **Homologada**; P2 cumprido |

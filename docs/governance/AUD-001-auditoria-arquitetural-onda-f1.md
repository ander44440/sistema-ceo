# AUD-001 — Auditoria Arquitetural da Onda F1

> **Status:** Emitida — 04/08/2026 (diagnóstica; aguarda acolhimento pela Alçada de Governança).  
> **Versão:** 1.0.  
> **Tipo:** AUD — Auditoria arquitectural (diagnóstica).  
> **Identificação:** AUD-001.  
> **Despacho:** DESP-C-004.  
> **Normas aplicadas:** [`GOV-001`](GOV-001-norma-emissao-pareceres-arquiteturais.md); [`GOV-002`](GOV-002-processo-revisao-arquitetural.md).  
> **Lastro de análise prévia:** Parecer DESP-C-001 (ARQ-030).  
> **Natureza:** **Exclusivamente diagnóstica** — nenhum artefato modificado; nenhum REQ/ADR/ARQ criado.  
> **Objecto:** Onda **F1** — Paridade Produção do CEO Ouvindo.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Auditoria arquitectural e de governação da cadeia documental e de entrega da Onda F1. |
| **Por que existe?** | Primeira aplicação plena de GOV-001/GOV-002 sobre uma onda real; verificar integridade antes de declarar encerramento arquitectural. |
| **Para quem existe?** | Alçada de Governança; Alçada Executiva; Alçada do Patrocinador; Alçada de Arquitetura. |
| **Como medir sucesso desta AUD?** | (1) Escopo e metodologia claros; (2) evidências citáveis; (3) NCs classificadas; (4) índice de maturidade; (5) recomendação explícita de encerramento ou não. |

---

## 1. Escopo auditado

### 1.1 Cadeia oficial F1

| Ordem | Artefato | Caminho |
|-------|----------|---------|
| 1 | ANL-013 | `docs/analysis/ANL-013-paridade-producao-ceo-ouvindo.md` |
| 2 | REQ-069 | `docs/requirements/REQ-069-paridade-producao-ceo-ouvindo.md` |
| 3 | ARQ-030 | `docs/architecture/ARQ-030-implantacao-producao-ceo-ouvindo.md` |
| 4 | IMP-069 | `docs/implementation/IMP-069-implantacao-producao-ceo-ouvindo.md` |
| 5 | Evidências IMP-069 | `docs/implementation/evidencias/IMP-069-homologacao-producao.md` |
| 6 | VAL-011 | `docs/validation/VAL-011-homologacao-paridade-producao-ceo-ouvindo.md` |
| 7 | VAL-011R | `docs/validation/VAL-011R-revalidacao-pos-correcao-stt.md` |

### 1.2 Lastro e contexto (leitura)

| Artefato | Papel na auditoria |
|----------|-------------------|
| REQ-068 / ARQ-029 / IMP-068 / VAL-010 / ENC-006 | Produto voz (MVP) — lastro; não redesenhados por F1 |
| GATE-009 | Certificação que abriu a ressalva de paridade |
| ROADMAP-002 | Posicionamento da frente F1 |
| VIS-005 / CAP-07 | Capacidade de comunicação |
| CON-001 · ADR-006 · ADR-015 | Normas superiores |
| `docs/README.md` | Índice de status aparente |
| GOV-001 · GOV-002 | Normas de parecer/processo (critério de auditoria) |

### 1.3 Fora de escopo

- Auditoria de código linha a linha.  
- Homologação de F2–F8.  
- Redesign de ARQ-029.  
- Correcção dos achados (proibida por despacho).

---

## 2. Metodologia aplicada

### 2.1 Normas

| Norma | Uso nesta AUD |
|-------|----------------|
| **GOV-001** | Classes NC-A/G/I/D; alçadas; severidade; rastreabilidade de elos; unicidade de status; critérios de decisão (como referência de maturidade) |
| **GOV-002** | Integridade do ciclo ANL→…→VAL; elegibilidade de Gate; fecho de onda; evidências mínimas |

### 2.2 Procedimento

1. Inventariar cadeia F1 e lastro.  
2. Extrair **status aparente** (cabeçalho, rodapé, Memória, Histórico, índices).  
3. Verificar **elos cruzados** (A cita B com status X).  
4. Avaliar **conformidade** CON/VIS/ADR/REQ/ARQ/IMP/VAL (desenho vs governação).  
5. Classificar NCs (GOV-001 §5).  
6. Pontuar maturidade (§7).  
7. Emitir conclusão e recomendação de encerramento.

### 2.3 Critério de evidência

Só se registam factos observáveis no texto dos artefatos (ou índices) na data da auditoria (**04/08/2026**). Sem alteração de ficheiros.

---

## 3. Evidências coletadas

### 3.1 Integridade estrutural da cadeia

| Verificação | Resultado |
|-------------|-----------|
| Sequência ANL→REQ→ARQ→IMP→VAL existe | **Sim** |
| CAP-07 rastreada nos elos F1 | **Sim** |
| Separação produto (ARQ-029) × implantação (ARQ-030) | **Sim** (desenho) |
| Evidências de deploy IMP-069 | **Sim** (`dpl_B1UgTVLv…`, bundle pós-068) |
| VAL-011 com 13/13 engenharia | **Sim** (documento) |
| Ciclo pós-defeito STT (VAL-011R) | **Sim** (deployment distinto `dpl_Bfm7V3pP…`) |
| Gate final do patrocinador em VAL-011 / VAL-011R | **Pendente** |

**Veredicto estrutural:** cadeia **completa na forma**; **incompleta no Gate final**.

### 3.2 Matriz de status (coerência interna)

| Artefato | Cabeçalho | Rodapé / Memória / Histórico | Índice README | Consistente? |
|----------|-----------|------------------------------|---------------|--------------|
| ANL-013 | Homologada | Estado: Em análise (também Memória) | Homologada | **Não** |
| REQ-069 | Homologada | Estado: Em análise; Histórico «aguarda homologação» | Homologada | **Não** |
| ARQ-030 | Homologada | Estado: Em análise; Memória «aguarda homologação»; cita IMP Homologada | Homologada | **Não** |
| IMP-069 | Homologada | Estado: Implementada — aguarda homologação | Homologada | **Não** |
| VAL-011 | Homologada (engenharia); aguarda Gate | Idem | Homologada (engenharia) | **Parcial** (coerente no dual status) |
| VAL-011R | Homologada (engenharia); aguarda patrocinador | — | Homologada (engenharia) | **Parcial** |
| ROADMAP-002 | Em análise; F1 activa / aguarda Gate VAL-011 | Em análise | F1 aberta | **Sim** (ainda aberta) |

### 3.3 Divergências de metadados (elos cruzados)

| Origem | Afirmação | Destino / contradicção |
|--------|-----------|-------------------------|
| ANL-013 | ARQ-030 **Em análise** | README + cabeçalho ARQ: **Homologada** |
| REQ-069 header | ARQ-030 **Em análise** | REQ-069 rastreabilidade: ARQ **Homologada** |
| ARQ-030 | IMP-069 **Homologada** + rodapé «não cria IMP até Gate» | IMP já existe; rodapé obsoleto |
| ARQ-030 Memória | «zero código/IMP; aguarda homologação» | IMP-069 + VAL-011 existentes |
| IMP-069 | ARQ-030 homologada (pré-IMP) | ARQ-030 corpo ainda «Em análise» |
| ENC-006 | Residual produção alias sem IMP-068 | Superado operacionalmente por F1; ENC não actualizado nesta auditoria (apontamento) |

### 3.4 Conformidade por elo normativo

| Elo | Avaliação |
|-----|-----------|
| **CON-001** | Objectivo F1 (transparência, tempo, uso real) **conforme** no propósito; Art. 8º **parcial** — rastreabilidade enfraquecida por status dúbios |
| **VIS-005 / CAP-07** | F1 como residual de canal de comunicação — **conforme** (sem CAP nova) |
| **ADR-006** | Forma da cadeia presente — **conforme estruturalmente**; gates explícitos **parcialmente opacos** (IMP/VAL avançaram com ARQ internamente contraditória) |
| **ADR-015** | Paridade produção aproxima uso diário — **conforme** |
| **REQ-069** | RF/RNF/CA cobertos por ARQ-030/IMP/VAL no desenho — **conforme de conteúdo**; metadados — **não conforme** |
| **ARQ-030** | Desenho de implantação — **conforme** (ver DESP-C-001); governação documental — **não conforme** |
| **IMP-069** | Publicação sem redesign EIC — **conforme** ao RNF7/G3 no relato; residual STT gerou correcção posterior (VAL-011R) |
| **VAL-011 / 011R** | Evidência de paridade engenharia — **forte**; Gate patrocinador — **aberto** |

### 3.5 Achados arquitectónicos (produto / plataforma)

| ID | Achado | Classe |
|----|--------|--------|
| A1 | ARQ-030 mantém EIC intocada e ARQ-029 congelada — boa fronteira | Positivo |
| A2 | Marcadores de bundle: `enviarAoNucleo` / `criarVoiceController` ausentes pós-minify (IMP-069 D2); fallback para outras strings | NC-A (dívida de verificação) |
| A3 | Promoção/deploy manual Vercel — aceitável F1; não é padrão de plataforma | NC-A (dívida operacional) |
| A4 | Defeito STT pós-paridade exigiu patch (`sync start`) e VAL-011R — ciclo de implantação não encerrou só com promoção | NC-I / risco de fecho |

### 3.6 Achados de governação

| ID | Achado | Classe |
|----|--------|--------|
| G1 | Unicidade de status violada em ANL/REQ/ARQ/IMP | NC-G + NC-D |
| G2 | Gate ADR-006 ARQ→IMP documentalmente ambíguo | NC-G |
| G3 | VAL-011 / VAL-011R sem Gate final do patrocinador | NC-G (fecho de onda) |
| G4 | GATE-010 cancelado até VAL-011R — coerente, mas F1 não encerrável entretanto | Processo |
| G5 | GOV-001/002 existem mas ainda **Em análise** — auditoria usa-as como critério contratado pelo despacho | Dependência processual |

---

## 4. Não conformidades encontradas

Campos conforme GOV-001 (decisão = alçada; execução = operacional).

### 4.1 NC-A — Arquitetura

| ID | Descrição | Severidade | Impacto | Responsável pela decisão | Responsável pela execução |
|----|-----------|------------|---------|--------------------------|---------------------------|
| **NC-A1** | Verificação de artefacto acoplada a strings sujeitas a minificação (marcadores incompletos no bundle). | Média | Risco de falso negativo/positivo de paridade em frentes futuras. | Alçada de Arquitetura | Engenheiro |
| **NC-A2** | Ausência de gate automatizado `main → alias Production`. | Baixa (F1) / Média (plataforma) | Repetição do gap lab↔prod em ondas futuras. | Alçada de Arquitetura | Engenheiro |

### 4.2 NC-G — Governança

| ID | Descrição | Severidade | Impacto | Responsável pela decisão | Responsável pela execução |
|----|-----------|------------|---------|--------------------------|---------------------------|
| **NC-G1** | Status contraditório intra-documento em ANL-013, REQ-069, ARQ-030, IMP-069. | **Alta** | Gate e índices não são fonte de verdade. | Alçada de Governança | Engenheiro |
| **NC-G2** | Autorização ARQ→IMP opaca face ao rodapé ARQ-030 vs existência de IMP-069/VAL-011. | **Alta** | Violação aparente do espírito ADR-006 / GOV-002. | Alçada de Governança | Engenheiro |
| **NC-G3** | Gate final do patrocinador pendente em VAL-011 e VAL-011R. | **Alta** (fecho F1) | Onda não pode encerrar-se arquitecturalmente. | Alçada do Patrocinador | Coordenador Executivo / Engenheiro (suporte) |
| **NC-G4** | L1–L6 de ARQ-030 sem checklist de satisfação registado no próprio ARQ. | Média | Auditoria de Gate incompleta. | Alçada de Governança | Engenheiro |

### 4.3 NC-I — Implementação

| ID | Descrição | Severidade | Impacto | Responsável pela decisão | Responsável pela execução |
|----|-----------|------------|---------|--------------------------|---------------------------|
| **NC-I1** | Defeito STT em produção pós-IMP-069, corrigido em ciclo VAL-011R (deployment distinto). | Média | Paridade oral real dependia de patch além da promoção inicial. | Alçada Executiva · Alçada do Patrocinador (Gate) | Engenheiro |
| **NC-I2** | Smoke STT com fala humana completa limitado na automação (notas VAL-011/IMP). | Baixa–Média (evidência) | Gate humano ainda necessário para confiança plena. | Alçada do Patrocinador | Engenheiro |

### 4.4 NC-D — Documentação

| ID | Descrição | Severidade | Impacto | Responsável pela decisão | Responsável pela execução |
|----|-----------|------------|---------|--------------------------|---------------------------|
| **NC-D1** | Memória/Histórico/rodapé desactualizados vs cabeçalhos «Homologada». | **Alta** | Memória Organizacional inválida. | Alçada de Governança | Engenheiro |
| **NC-D2** | Referências cruzadas ANL/REQ vs README/IMP/rastreabilidade divergentes sobre ARQ-030. | **Alta** | Despachos sobre estado errado. | Alçada de Governança | Engenheiro |
| **NC-D3** | Rodapé ARQ-030 («não cria IMP») incompatível com cadeia já executada. | Média | Instrução operacional obsoleta. | Alçada de Governança | Engenheiro |
| **NC-D4** | ENC-006 ainda reflecte residual de produção pré-F1 (apontamento). | Baixa–Média | Narrativa de encerramento de produto desactualizada face a F1. | Alçada de Governança | Engenheiro |

---

## 5. Recomendações

1. **Não declarar encerramento arquitectural de F1** até NC-G1/G2/G3 e NC-D1/D2 tratados (ou risco aceite formalmente pela Alçada do Patrocinador).  
2. **Regularizar metadados** da cadeia (unicidade de status) sob despacho da Alçada de Governança — correcção editorial, sem redesign.  
3. **Registar Gate ARQ→IMP** (mesmo que retrospectivo) com Memória Organizacional explícita.  
4. **Concluir Gate VAL-011 + VAL-011R** na Alçada do Patrocinador antes de encerrar F1 no ROADMAP-002.  
5. **Manter** a fronteira ARQ-029 × ARQ-030 (não fundir).  
6. **Agendar** (pós-F1) endurecimento de marcadores de build e/ou promoção automatizada (NC-A1/A2) via ciclo ADR-006 próprio — fora desta AUD.  
7. **Homologar GOV-001/GOV-002** para que auditorias seguintes tenham lastro normativo estável.

---

## 6. Conclusão executiva

A Onda F1 **cumpriu o objectivo técnico central** na forma documental e nas evidências de engenharia: o MVP CEO Ouvindo foi tratado como problema de **implantação**, não de redesenho; a cadeia ANL→REQ→ARQ→IMP→VAL existe; a EIC permanece protegida; há deploy e validação de paridade em produção (com ciclo correctivo STT).

Contudo, a **maturidade de governação documental é insuficiente** para encerramento arquitectural: status contraditórios, elos cruzados inconsistentes, Gate final aberto e opacidade do gate ARQ→IMP violam GOV-001 (unicidade de status, rastreabilidade) e GOV-002 (fecho de ciclo / homologação).

**Síntese:** F1 está **tecnicamente avançada** e **governativamente aberta**.

---

## 7. Índice de maturidade arquitectural da Onda F1

Escala por dimensão: **0–5** (0 = ausente; 3 = utilizável com ressalvas; 5 = exemplar).  
Peso: governação e fecho de Gate têm peso acrescido no índice geral.

| Dimensão | Nota | Peso | Justificativa breve |
|----------|------|------|---------------------|
| D1 Integridade estrutural da cadeia | **4** | 1.0 | Cadeia completa; residual pós-defeito absorvido em VAL-011R |
| D2 Conformidade CON/VIS/ADR/REQ (conteúdo) | **4** | 1.0 | Alinhamento ADR-015/CAP-07/REQ-069 sólido |
| D3 Qualidade do desenho ARQ (implantação) | **4** | 1.0 | Fronteiras claras; rollback; validação A/B/C |
| D4 Coerência de estados / metadados | **1** | 1.5 | Contradições sistemáticas cabeçalho↔rodapé↔cruzamentos |
| D5 Rastreabilidade operacional (deploy/evidências) | **4** | 1.0 | Deploy IDs, bundles, evidências presentes |
| D6 Fecho de Gate / ADR-006 | **2** | 1.5 | Gates opacos + Gate patrocinador pendente |
| D7 Robustez de verificação de artefacto | **3** | 0.5 | Marcadores parciais; minify |
| D8 Estabilidade pós-produção (STT) | **3** | 1.0 | Corrigido em 011R; Gate 011R pendente |
| D9 Preparação para evolução (F2–F8 / F6) | **3** | 0.5 | F1 não fecha limpo; F6 correctamente bloqueada até F1 |

### 7.1 Índice geral

\[
\text{Índice} = \frac{\sum (nota_i \times peso_i)}{\sum peso_i} = \frac{4+4+4+1.5+4+3+1.5+3+1.5}{9.0} = \frac{26.5}{9.0} \approx \mathbf{2.9\ /\ 5.0}
\]

Recálculo explícito:  
\(4×1 + 4×1 + 4×1 + 1×1.5 + 4×1 + 2×1.5 + 3×0.5 + 3×1 + 3×0.5\)  
= \(4+4+4+1.5+4+3+1.5+3+1.5 = 26.5\)  
\(26.5 / (1+1+1+1.5+1+1.5+0.5+1+0.5) = 26.5 / 9.0 = \mathbf{2.94}\)

| Faixa | Interpretação |
|-------|----------------|
| 0.0–1.9 | Não apto a encerrar |
| 2.0–2.9 | Avançado tecnicamente; **governação impede encerramento** |
| 3.0–3.9 | Encerrável com ressalvas formais |
| 4.0–5.0 | Encerramento limpo |

**Índice geral de maturidade arquitectural F1: 2.9 / 5.0** — faixa *governação impede encerramento limpo*.

### 7.2 Leitura por pilar

| Pilar | Maturidade |
|-------|------------|
| Arquitectura de implantação | Alta |
| Entrega / evidências | Alta |
| Governação documental | Baixa |
| Fecho de Gate | Baixa–Média |

---

## 8. Classificação de riscos (plataforma)

| ID | Risco | Classificação | Nota |
|----|-------|---------------|------|
| R-AUD-1 | Encerrar F1 com metadados contraditórios → precedente tóxico | **Alto** | Contamina F2–F8 |
| R-AUD-2 | Gate patrocinador pendente → uso diário sem aceite formal | **Alto** | ADR-015 / CON |
| R-AUD-3 | Repetir gap alias↔main em frentes futuras | **Médio** | NC-A2 |
| R-AUD-4 | Marcadores frágeis como único prova de paridade | **Médio** | NC-A1 |
| R-AUD-5 | Abrir F6 antes de fecho F1 | **Alto** | ROADMAP-002 / GATE-009 |
| R-AUD-6 | Dívida STT/VAL-011R esquecida no narrativo de «paridade OK» | **Médio** | NC-I1/G3 |
| R-AUD-7 | Desenho ARQ-030 inadequado | **Baixo** | Desenho aprovável (DESP-C-001) |

---

## 9. Recomendação de encerramento arquitectural da Onda F1

### **NÃO RECOMENDADO** (neste corte)

**Condições mínimas para reassessorar encerramento (futuro despacho):**

1. NC-G1, NC-G2, NC-D1, NC-D2 → CORRIGIDA ou ACEITE_RISCO formal.  
2. NC-G3 → Gate VAL-011 **e** VAL-011R pela Alçada do Patrocinador.  
3. ROADMAP-002 actualizado quanto ao estado de F1 **após** os itens acima.  
4. Índice D4 ≥ 3 e D6 ≥ 3 em reauditoria (AUD delta).

Até lá: F1 permanece **aberta sob governação**, ainda que **operacionalmente avançada**.

---

## 10. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Alçada de Arquitetura (DESP-C-004) |
| Quando | 04/08/2026 |
| O quê | AUD-001 v1.0 — Auditoria Arquitectural da Onda F1 |
| Por quê | Primeira auditoria sob GOV-001/GOV-002; diagnóstico pré-encerramento |
| Resultado | Índice 2.9/5; encerramento arquitectural **não recomendado**; zero alteração a artefatos |

---

## 11. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 04/08/2026 | Alçada de Arquitetura (DESP-C-004) | Auditoria completa F1 — evidências, NCs, maturidade, riscos, recomendação | Emitida — diagnóstica |

---

**Fim de AUD-001.**  
Aguardar novo despacho.

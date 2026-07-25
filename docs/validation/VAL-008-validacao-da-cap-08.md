# VAL-008 — Validação da CAP-08 (Planejamento Executivo)

> **Status: Homologada — v1.0; VAL-008 ENCERRADA (Deliberação Final CTO, 24/07/2026). Congelada — CAP-08 concluída.**  
> Versão 1.0 — 24/07/2026. Tipo VAL (ADR-014).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-014; ADR-015; VIS-006 Aprovada v1.0; REQ-035 Homologado v1.0; ARQ-011 Homologada v1.0; IMP-008 Homologado v1.0; ARQ-008/009/010 e baselines CAP-05/07 preservadas.  
> Este documento definiu o plano e registrou a execução da validação da CAP-08. **Resultado:** homologada — CAP-08 homologada v1.0.  
> Relatório VAL: [`../cap-08/val-008-relatorio-consolidado.md`](../cap-08/val-008-relatorio-consolidado.md) — 28 C / 0 NC / 2 OE.  
> Relatório de Encerramento: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md).  
> **Baseline CAP-08 congelada.** OE EV-039…040 em [`../cap-08/oportunidades-evolucao-arquivadas.md`](../cap-08/oportunidades-evolucao-arquivadas.md).  
> **Cadeia obrigatória:** Analisar → Avaliar suficiência → Recomendar → Planejar → Executar (fora).  
> **Proibição:** **não** reabrir esta VAL sem novo ciclo formal.

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| O que é? | Plano de validação técnica, funcional, arquitetural, comportamental-executiva e de regressão da CAP-08 — componentes L e M |
| Por que existe? | A IMP-008 foi aprovada e o CTO autorizou a abertura da fase VAL-008 |
| Para quem? | Patrocinador (qualidade da decisão), CTO (revisão/deliberação) e Engenheiro (execução técnica sem alteração) |
| Como medir sucesso? | RF-01…09, RNF-01…04, D1…D12, contratos L→M, comportamento executivo e regressão evidenciados; nenhuma NC impeditiva ou maior aberta |

---

## 2. Objetivos

1. validar todos os requisitos do REQ-035;
2. validar as decisões arquiteturais D1…D12 da ARQ-011;
3. confirmar a implementação aprovada na IMP-008;
4. avaliar o **comportamento executivo** (não só conformidade unitária);
5. verificar declaração correta de **suficiência** e de **insuficiência**;
6. verificar coerência análise → recomendação → plano;
7. verificar rastreabilidade e o Princípio Arquitetural;
8. confirmar somente leitura sobre H/I/F e fronteira de execução;
9. executar regressão CAP-05 / CAP-07 (e amostragem MVP);
10. consolidar C / NC / OE e submeter ao CTO **sem** homologar a CAP-08 neste ato.

---

## 3. Escopo

### 3.1 Inclui

| Área | Objeto |
|------|--------|
| REQ-035 | RF-01…RF-09, RNF-01…RNF-04, RST-01…RST-08 |
| ARQ-011 | L, M, contratos, gate de suficiência, D1…D12 |
| IMP-008 | Artefatos em `docs/cap-08/` |
| Comportamento executivo | Suficiência, insuficiência, coerência, rastreabilidade, princípio |
| Não escrita | H, I, F consumidos somente em leitura por L/M |
| Regressão | Suítes CAP-05 e CAP-07; amostragem MVP |
| Achados | C, NC e OE |

### 3.2 Exclui

| Exclui | Motivo |
|--------|--------|
| Correção de código durante VAL | IMP-008 homologada; congelamento |
| Alteração de REQ/ARQ/IMP/baselines | Homologados |
| Homologação automática da CAP-08 | Depende da deliberação final sobre esta VAL |
| CAP-02, CAP-03, CAP-R | Fora do escopo desta CAP |
| Execução técnica do MG2 | Fronteira RF-06 / RNF-03 |

---

## 4. Congelamento e tratamento de achados

Durante a VAL-008:

* `docs/cap-08/`, `docs/cap-05/`, `docs/cap-07/` e `docs/mvp/` permanecem funcionalmente congelados;
* não se corrige código nem se amplia escopo;
* achados classificam-se em **C / NC / OE**;
* NC impeditiva ou maior pode impedir aprovação;
* OE não se incorpora à baseline nesta VAL.

### 4.1 Severidade de NC

| Nível | Definição |
|-------|-----------|
| **Impeditiva** | Recomenda/planeja sem suficiência; escreve H/I/F; aplica vigência; executa MG2; quebra baseline; viola autoridade |
| **Maior** | RF/RNF, contrato L→M ou coerência da cadeia falha em cenário relevante |
| **Menor** | Desvio localizado sem impacto em autoridade, suficiência ou baseline |

---

## 5. Critérios objetivos — REQ-035

| ID VAL | REQ | Critério objetivo | Evidência mínima |
|--------|-----|-------------------|------------------|
| V-RF01 | RF-01 | Análise precede recomendação/plano | Tentativa de recomendar sem análise / ordem observada |
| V-RF02 | RF-02 | Sete elementos presentes ou com declaração explícita | Inspeção do Objeto de Análise |
| V-RF03 | RF-03 | Suficiência e insuficiência corretas; incertezas/confiança/timing | Cenários S1 e S2 |
| V-RF04 | RF-04 | Recomendação só após suficiência; antes do plano | Gate M + ordem |
| V-RF05 | RF-05 | Plano coordenado rastreável | Passos + `analiseId`/`recomendacaoId` |
| V-RF06 | RF-06 | Sem execução MG2 | Fronteira nas saídas + inspeção API |
| V-RF07 | RF-07 | `vigencia=proposta` até C | Metadados de recomendação/plano |
| V-RF08 | RF-08 | L/M não alteram H/I/F | Antes/depois + spies |
| V-RF09 | RF-09 | Cadeia rastreável | Percurso ANL→REC→PLN |
| V-RNF01 | RNF-01 | Baixa carga amostral | Observação patrocinador / superfície |
| V-RNF02 | RNF-02 | Sem regressão baselines | Suítes CAP-05/07 + MVP amostral |
| V-RNF03 | RNF-03 | Fronteira / independência | Inspeção |
| V-RNF04 | RNF-04 | Princípio verificável na ordem | Cenário S5 |

---

## 6. Critérios — comportamento executivo (diretriz CTO)

Além da conformidade técnica, a VAL-008 **obriga** evidência de comportamento executivo:

| ID | Critério comportamental | Evidência mínima |
|----|-------------------------|------------------|
| V-BE01 | Declaração correta de **suficiência** (com incertezas + confiança + justificativa de timing) | Cenário com base adequada |
| V-BE02 | Declaração correta de **insuficiência** (sem emitir recomendação) | Cenário sem base / forçado |
| V-BE03 | Coerência entre análise, recomendação e plano (conteúdo alinhado, sem contradição material) | Comparação dos três artefatos |
| V-BE04 | Rastreabilidade preservada (`analiseId`, `recomendacaoId`) | Navegação inversa plano→rec→análise |
| V-BE05 | Respeito ao Princípio: Analisar → Suficiência → Recomendar → Planejar → Executar(fora) | Registro cronológico do percurso |
| V-BE06 | Suficiência ≠ certeza absoluta (incertezas remanescentes coexistindo com recomendação) | Caso com incerteza explícita |
| V-BE07 | Insuficiência como comportamento válido (não erro silencioso) | Bloqueio observável em M |

---

## 7. Critérios — ARQ-011

| ID VAL | Decisão | Critério |
|--------|---------|----------|
| V-D01 | D1 | L e M separados e com APIs distintas |
| V-D02 | D2 | Somente leitura H/I/F |
| V-D03…D05 | Contratos | Objeto de Análise conforme ARQ-011 |
| V-D06 | Gate | M bloqueia se `suficiencia≠suficiente` |
| V-D07 | Vigência | Recomendação/plano em `proposta` |
| V-D08 | Plano | Passos + rastreio |
| V-D09…D12 | Extensão / fronteira / K | Baselines intactas; sem execução; K não substitui L/M |

---

## 8. Cenários de validação

| Cenário | Sequência | Cobertura |
|---------|-----------|-----------|
| **S1 — Suficiência correta** | Insumos adequados → L analisa → `suficiente` + incertezas/confiança/timing → M recomenda → M planeja | V-RF02/03/04/05; V-BE01/03/05/06 |
| **S2 — Insuficiência correta** | Base fraca/ausente → L `insuficiente` → tentativa de recomendar **bloqueada** | V-RF03/04; V-BE02/07 |
| **S3 — Coerência da cadeia** | Comparar enunciados análise↔recomendação↔plano; sem contradição material | V-BE03; V-RF05/09 |
| **S4 — Rastreabilidade** | Do plano recuperar recomendação e análise; ids consistentes | V-RF09; V-BE04 |
| **S5 — Princípio Arquitetural** | Percurso completo na ordem obrigatória; execução permanece fora | V-RNF04; V-BE05; V-RF06 |
| **S6 — Somente leitura** | Antes/depois H/I/F; spies de escrita | V-RF08; V-D02 |
| **S7 — Vigência proposta** | Recomendação e plano sem confirmação não vigoram | V-RF07 |
| **S8 — Regressão** | `node --test` CAP-08 + CAP-07 + CAP-05; amostragem MVP | V-RNF02 |
| **S9 — Superfície executiva** | Percurso em `planejamento.html` observando decisões do sistema | V-BE01…05; V-RNF01 |

---

## 9. Estratégia e ordem

```text
V0 Congelamento
  → V1 Contratos e RF-01…03 (análise/suficiência)
  → V2 Comportamento executivo S1–S5
  → V3 RF-04…09 e D1…D12
  → V4 RNF e regressão
  → V5 Consolidação C/NC/OE
  → V6 Submissão ao CTO (sem homologar CAP)
```

---

## 10. Instrumentos

| Instrumento | Uso |
|-------------|-----|
| `docs/cap-08/analise-executiva.js` | L |
| `docs/cap-08/planejamento-executivo.js` | M |
| `docs/cap-08/cap08-planejamento.test.js` | Evidência automatizada |
| `docs/cap-08/planejamento.html` | Observação de comportamento executivo |
| Suítes CAP-05 / CAP-07 | Regressão |
| Registro VAL-008 | Evidências `VAL008-EV-nnn` |

Comando de referência:

```powershell
node --test "docs/cap-08/cap08-planejamento.test.js" "docs/cap-07/comunicacao-executiva.test.js" "docs/cap-05/memoria-organizacional.test.js" "docs/cap-05/cap05-e2-e5.test.js"
```

### 10.1 Registro mínimo por evidência

1. ID (`VAL008-EV-nnn`); 2. data/executor; 3. cenário/critérios; 4. passos; 5. esperado × observado; 6. C/NC/OE; 7. severidade se NC; 8. anexo (saída/teste/captura); 9. encaminhamento sem correção durante VAL.

---

## 11. Critérios de aprovação e reprovação

### Aprovação técnica recomendada

1. RF-01…09 e RNF-01…04 evidenciados;  
2. V-BE01…V-BE07 conformes;  
3. D1…D12 / contratos conformes;  
4. regressão 35/35 (ou equivalente atual) sem falha;  
5. nenhuma NC impeditiva ou maior aberta;  
6. OE separadas.

### Reprovação técnica

* recomenda/planeja sob insuficiência;  
* omite elementos obrigatórios da análise sem declaração;  
* quebra rastreabilidade ou ordem do Princípio;  
* escreve H/I/F ou executa MG2;  
* regressão de baseline;  
* NC impeditiva/maior aberta.

**A homologação final da CAP-08 depende da deliberação do CTO sobre o resultado desta VAL.**

---

## 12. Estado processual

| Ato | Status |
|-----|--------|
| REQ-035 | Homologado v1.0 — congelado |
| ARQ-011 | Homologada v1.0 — congelada |
| IMP-008 | Homologado v1.0 — **ENCERRADO** |
| VAL-008 | **Homologada v1.0 — ENCERRADA** |
| CAP-08 | **Homologada v1.0** — baseline do Sistema CEO |
| Relatório consolidado | [`../cap-08/val-008-relatorio-consolidado.md`](../cap-08/val-008-relatorio-consolidado.md) — 28 C / 0 NC / 2 OE |
| OE EV-039…040 | Arquivadas — [`../cap-08/oportunidades-evolucao-arquivadas.md`](../cap-08/oportunidades-evolucao-arquivadas.md) |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — critérios RF/RNF, comportamento executivo, cenários S1–S9 | Deliberação CTO — IMP-008 aprovada; abertura VAL-008 | Em análise |
| 0.2 | 24/07/2026 | Engenheiro (Cursor) | Execução S1–S9; relatório consolidado; CAP Em validação | Deliberação CTO — estrutura aprovada; autorização de execução | Executada — submetida |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (registro) | Homologação VAL e CAP-08; OE arquivadas; baseline congelada | Deliberação Final CTO — VAL-008 e CAP-08 | **Homologada e ENCERRADA** |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou e executou; CTO homologou VAL e CAP-08 |
| Quando | 24/07/2026 |
| Por quê | Validar e encerrar formalmente a CAP-08 |
| Baseado em quê | Deliberação Final do CTO; relatório VAL-008 (28 C / 0 NC / 2 OE) |
| Resultado | VAL-008 encerrada; CAP-08 homologada na baseline; OE arquivadas |

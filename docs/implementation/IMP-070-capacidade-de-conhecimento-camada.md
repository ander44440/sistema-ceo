# IMP-070 — Implementação da Capacidade de Conhecimento (Camada)

> **Status:** **HOMOLOGADA / ENCERRADA** — 07/08/2026 (Despacho CTO).  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-070.  
> **Capacidade:** CAP-04 — Gestão do Conhecimento (ciclo Camada) — **Baseline**.  
> **Norma:** **ARQ-031** Homologada (**congelada**); ARQ-006; ARQ-007; **REQ-070…074** (**congelados**).  
> **VAL:** [`VAL-IMP-070`](../validation/VAL-IMP-070.md) — **Homologada**.  
> **Baseline:** [`cap-04/README.md`](../cap-04/README.md) · [`relatorio-encerramento-cap-04-camada.md`](../cap-04/relatorio-encerramento-cap-04-camada.md).  
> **Proibição:** não reabrir sem evidência de uso real + deliberação CTO. **Não** emenda ARQ-031.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Implementação da Camada de Conhecimento (fonte, actualização, porta EIC, limites, governação) conforme REQ-070…074. |
| **Por que existe?** | Substituir a dependência do Briefing Curado estático por património consultável governado, sem acoplar EIC ao interior do Acervo. |
| **Para quem existe?** | Usuário (baseline); CTO (gates); Engenheiro (execução). |
| **Como medir sucesso?** | CAs de REQ-070…074 observáveis; VAL homologada; Baseline actualizada; ARQ-031 intacta. |

---

## 1. Cadeia de rastreabilidade (obrigatória)

```
ARQ-031
    ↓
CAP-04
    ↓
REQ-070 … REQ-074
    ↓
IMP-070  ← este documento
    ↓
VAL (futura)
    ↓
HOMOLOGAÇÃO
    ↓
BASELINE
```

Cada bloco funcional abaixo rastreia a exactamente o(s) REQ(s) indicado(s).

---

## 2. Diretrizes de execução (CTO)

1. Implementar **estritamente** REQ-070 a REQ-074.  
2. Preservar **integralmente** ARQ-031 e CAP-04.  
3. **Não** introduzir capacidades não previstas.  
4. Execução **incremental**, com **validação ao término de cada bloco** funcional.  
5. Necessidade de alterar arquitectura → **interromperse imediatamente** a IMP e deliberar com o CTO.

---

## 3. Princípios operacionais

| ID | Princípio |
|----|-----------|
| P1 | Acervo Oficial = fonte; projecções subordinadas (REQ-070) |
| P2 | Consumidores (EIC/EE/MRE/CN) só via Porta de lastro (REQ-072) |
| P3 | Separação Conhecimento × EIC × Executive Engine |
| P4 | Sem sync automático com oficina MG2 (REQ-071 / REQ-030) |
| P5 | Alçadas de governação observáveis (REQ-074); limites de admissão (REQ-073) |
| P6 | Reutilizar sede `docs/knowledge/` (IMP-004 E1+E2) — não reinventar o acervo documental |
| P7 | Zero emenda a ARQ-006/007/031 |

---

## 4. Blocos funcionais (incrementais)

Ordem fixa. **Nenhum** bloco seguinte inicia sem validação do anterior.

### B1 — Fonte oficial e subordinção de projecções

| Campo | Conteúdo |
|-------|----------|
| **REQs** | REQ-070 (CA-070-1…4) |
| **Objectivo** | Tornar o Acervo a fonte oficial observável; projecções (incl. briefing) subordinadas; lacuna explícita quando sem item apto |
| **Entregáveis lógicos** | Hierarquia de verdade no runtime de conhecimento; caminho de consumo que não trate briefing JS como canónico; declaração de lacuna no lastro vazio |
| **Validação de bloco** | CA-070-1…4 · [`VAL-IMP-070-B1`](../validation/VAL-IMP-070-B1-fonte-oficial.md) **Homologada** |
| **Estado** | **HOMOLOGADO / ENCERRADO** — REQ-070 congelado |

### B2 — Limites de admissão

| Campo | Conteúdo |
|-------|----------|
| **REQs** | REQ-073 (CA-073-1…5) |
| **Objectivo** | Recusar admissão fora dos limites; aplicar proibições absolutas |
| **Entregáveis lógicos** | Verificações/guardas de admissão alinhadas aos limites homologados; matrizes de casos negativos cobertas na VAL de bloco |
| **Validação de bloco** | CA-073-1…5 · [`VAL-IMP-070-B2`](../validation/VAL-IMP-070-B2-limites-admissao.md) **Homologada** |
| **Estado** | **HOMOLOGADO / ENCERRADO** — REQ-073 congelado |

### B3 — Governação de promoção e aptidão

| Campo | Conteúdo |
|-------|----------|
| **REQs** | REQ-074 (CA-074-1…6) |
| **Objectivo** | Cadeia propor→validar→homologar→publicar observável; aptidão só por decisão sob governação |
| **Entregáveis lógicos** | Registo de actos de governação; bloqueio de publicação sem homologação Usuário; transição apto/não apto com MO |
| **Validação de bloco** | CA-074-1…6 · [`VAL-IMP-070-B3`](../validation/VAL-IMP-070-B3-governanca.md) **Homologada** |
| **Estado** | **HOMOLOGADO / ENCERRADO** — REQ-074 congelado |

### B4 — Actualização por curadoria

| Campo | Conteúdo |
|-------|----------|
| **REQs** | REQ-071 (CA-071-1…4) |
| **Objectivo** | Actualizar só via curadoria; versionar conteúdo; candidatos ≠ oficiais |
| **Entregáveis lógicos** | Versionamento de conteúdo sem novo ID; ausência de sync oficina→acervo; projecção isolada não actualiza património |
| **Validação de bloco** | CA-071-1…4 · [`VAL-IMP-070-B4`](../validation/VAL-IMP-070-B4-atualizacao.md) **Homologada** |
| **Estado** | **HOMOLOGADO / ENCERRADO** — REQ-071 congelado |

### B5 — Porta de recuperação para a EIC

| Campo | Conteúdo |
|-------|----------|
| **REQs** | REQ-072 (CA-072-1…5) |
| **Objectivo** | Única superfície de leitura em runtime; lastro apto + lacunas; consumidores desacoplados |
| **Entregáveis lógicos** | Porta contextual; integração EIC/EE/MRE/CN a consumir lastro; remoção de bypass de briefing como fonte |
| **Validação de bloco** | CA-072-1…5 · [`VAL-IMP-070-B5`](../validation/VAL-IMP-070-B5-porta-eic.md) **Homologada** |
| **Estado** | **HOMOLOGADO / ENCERRADO** — REQ-072 congelado |

### B6 — Fecho IMP e preparação VAL

| Campo | Conteúdo |
|-------|----------|
| **REQs** | Conjunto 070…074 |
| **Objectivo** | Evidências de B1–B5; validação integrada CAP-04; rastreabilidade; pacote para homologação final |
| **Entregáveis lógicos** | [`VAL-IMP-070`](../validation/VAL-IMP-070.md); [`evidencias/IMP-070-fecho-b6`](evidencias/IMP-070-fecho-b6.md); teste integrado |
| **Validação de bloco** | Todos os CAs + P1–P7 · VAL integrada **PASS** |
| **Estado** | **EXECUTADO — PASS** · **HOMOLOGADO** com IMP-070 · Baseline promovida |

---

## 5. Gates

| Gate | Condição | Efeito |
|------|----------|--------|
| G0 | Despacho CTO 07/08 + CAs verificados | **IMP-070 ABERTA** (cumprido) |
| G1…G5 | VAL de bloco Bi pass | Autoriza B(i+1) |
| G6 | B6 pass | Autoriza redacção/abertura VAL |
| Interrupt | Necessidade de alterar ARQ-031 / arquitectura | **PARA** IMP → CTO |

---

## 6. Fora de escopo desta IMP

* Novas ARQs ou emenda a ARQ-031/006/007.  
* Novas capacidades (CAP-*).  
* Importação de engenharia do MG2 / sync do repo do jogo.  
* Redesign da EIC, Classificador ou interceptação CTO-003 Baseline.  
* População massiva do acervo “por obrigação” (só itens sob REQ-074).  
* Abertura de VAL ou Baseline neste documento.

---

## 7. Relação com IMP-004

IMP-004 (documental E1+E2) permanece a infraestrutura de sede `docs/knowledge/`.  
IMP-070 **opera a Camada** (consulta, governação observável, subordinção de projecções, porta EIC) sobre essa sede e o runtime — **não** substitui nem reabre IMP-004 E3.

---

## 8. Estado actual

| Item | Estado |
|------|--------|
| IMP-070 | **HOMOLOGADA / ENCERRADA** |
| B1–B6 | Homologados / Encerrados |
| VAL integrada | **Homologada** |
| Baseline CAP-04 Camada | **Oficial** — [`cap-04/README.md`](../cap-04/README.md) |
| Congelados | ARQ-031 · CAP-04 · REQ-070…074 · IMP-070 |

**Próxima acção:** uso real da Capacidade; evolução só com novas evidências + deliberação CTO.

---

## 9. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1–0.3 | 07/08/2026 | — | B1–B2 | — | Homologados |
| 0.4 | 07/08/2026 | CTO + Engenheiro | B3 + VAL | Despacho B2 homologado | VAL B3 PASS |
| 0.5 | 07/08/2026 | CTO + Engenheiro | B3 Homologado; B4 + VAL | Despacho B3 homologado | VAL B4 PASS |
| 0.6 | 07/08/2026 | CTO + Engenheiro | B4 Homologado; B5 + VAL | Despacho B4 homologado | VAL B5 PASS |
| 0.7 | 07/08/2026 | CTO + Engenheiro | B5 Homologado; B6 fecho + VAL integrada | Despacho B5 homologado | VAL-IMP-070 PASS |
| 1.0 | 07/08/2026 | CTO | Homologação final + Baseline | Despacho IMP-070 Homologada | **ENCERRADA · Baseline** |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (homologou) + Engenheiro (executou B1–B6) |
| Quando | 07/08/2026 |
| O quê | IMP-070 Homologada / Encerrada; CAP-04 Camada na Baseline |
| Resultado | Capacidade de Conhecimento operacional oficial; artefactos congelados |

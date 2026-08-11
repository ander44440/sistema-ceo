# Cancelar uma funcionalidade para acelerar o Sistema CEO — JOB-000049

> **Entrega do Job da fila CEO.** Parecer sobre qual frente/funcionalidade cancelar (ou adiar formalmente) para ganhar velocidade na próxima onda do Sistema CEO.  
> **Origem:** MRE (parecer `parecer-c3-1786147752135-45ml5k`).  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.  
> **Nota de escopo:** JOB-000048 já respondeu a mesma pergunta para **MG2**; este parecer cobre o **Sistema CEO** (ROADMAP-002), coerente com `projeto: null` e frente activa pós-GATE-009.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **Qual funcionalidade cancelaria para acelerar o projeto?** | **F6 — Evolução do modo voz** (conversa contínua, barge-in, VAD, wake word, TTS servidor) |
| **Confiança** | Alta — alinhado a ROADMAP-002, ENC-006 §7, REL-001, GATE-009 e fecho F1 (REG-001) |
| **Efeito esperado** | Liberta **semanas** de engenharia de alto risco; evita regressão no pipeline EIC/voz já homologado |
| **O que **não** cancelar** | F2 (fecho documental), F3 (lastro operacional MG2) — baixo custo / maior ROI ADR-015 |

**Síntese:** Se for obrigatório cortar **uma** frente candidata da próxima onda CEO, cortaria **F6 (evolução de voz)**. O MVP oral (IMP-068 + F1 encerrada) já permite uso diário por voz; F6 empilha complexidade alta sobre uma cadeia congelada (ENC-006) sem passar o filtro ADR-015 tão bem quanto **F3 (lastro MG2)**. Manter F2 (higiene barata) e abrir F3 como primeira frente de valor; **retirar F6 desta onda** sem prejudicar conversa por voz turno-a-turno.

---

## 2. Critérios de decisão

| Critério | Peso | F6 Evolução voz | Alternativas descartadas |
|----------|------|-----------------|--------------------------|
| **ADR-015** — aproxima uso diário MG2? | Alto | **Baixo-médio** — conforto oral, não deliberar melhor sobre MG2 | F3 **não** cancelável (ROI principal) |
| **ROADMAP-002** | Alto | **P2**, complexidade **Alta** | F2 = P1, complexidade **Baixa** |
| **Risco de regressão** | Alto | Toca STT/TTS, estados Ouvindo/Respondendo, EIC | F2 = só documentos |
| **Estado actual** | Alto | ENC-006 **congelou** §7; F1 **encerrada** | F4 NCS = médio, não o maior custo |
| **Dependências** | Médio | Recomendava F1 (já fechada) — mas escopo F6 >> F1 | F5 RELEASE depende de F2, não compete |
| **Precedente ENC-006** | Médio | Limitações §7 já aceites no encerramento | F8 observabilidade = P3, menor WIP |

---

## 3. Por que F6 (evolução de voz) e não outra

### 3.1 O que é F6

| Campo | Detalhe |
|-------|---------|
| **Escopo** | Superar limitações ENC-006 §7: microfone permanente, barge-in, wake word, VAD robusto, TTS servidor |
| **Estado** | **Prevista** (ROADMAP-002); **não** aberta; frente ENC-006 **encerrada** |
| **Posição** | 5º na ordem sugerida — após F2, F3, F4, F5 |

### 3.2 Por que cancelar (ou adiar formalmente) **agora**

1. **MVP oral suficiente para uso diário** — IMP-068 homologado; F1 (paridade produção) encerrada 06/08/2026; turno STT→pipeline→TTS funciona sem F6.  
2. **Custo desproporcionado** — F6 exige nova cadeia ANL→REQ→ARQ→IMP→VAL; semanas vs. F2 (dias documentais).  
3. **Risco EIC** — ROADMAP-002 e ENC-006 proíbem alterar EIC na evolução de voz; mesmo assim, estados de áudio e reentrada a Ouvindo são frágeis (ENC-006 §6: cauda acústica, sem barge-in).  
4. **Filtro ADR-015** — F3 (lastro operacional MG2) melhora **deliberação** sobre o projecto real; F6 melhora **conforto** da interface oral.  
5. **Governança explícita** — ENC-006 §7 listou estas evoluções como **fora de escopo** no encerramento; reabrir F6 agora **contradiz** o congelamento recente.

### 3.3 Alternativas consideradas e rejeitadas como «cancelamento»

| Frente | Por que **não** cancelar |
|--------|---------------------------|
| **F2 — Fecho documental / índice** | Baixíssimo custo; reduz deriva de governação; não compete com oficina MG2 |
| **F3 — Lastro operacional MG2** | **Maior ROI** ADR-015; recomendação principal ROADMAP-002 pós-F2 |
| **F4 — NCS em produção** | Esforço médio; melhora encaminhamento cognitivo; **adiável**, mas menos caro que F6 |
| **F5 — CAP-R / RELEASE** | Marco de versão; útil após F2; cancelar adia auditabilidade, não acelera MG2 |
| **F7 — CAP-04 (expansão)** | Baseline IMP-070 **já encerrada**; expansão já proibida sem evidência — não está no plano activo |
| **F8 — Observabilidade executiva** | P3; **adiável**, mas F6 tem **maior** risco e custo se aberta |

---

## 4. Ganho de velocidade estimado

| Efeito | Estimativa |
|--------|------------|
| **Tempo engenharia recuperado** | 2–4+ semanas (ANL→VAL completa; depende do escopo MVP2 de voz) |
| **WIP libertado** | 1 frente no limite «uma frente activa» (ROADMAP-001 P2) |
| **Risco pipeline voz** | Evita commits transversais em `conversacaoNatural/`, estados Ouvindo, STT/TTS |
| **Foco patrocinador** | F2 (governação) + F3 (MG2) sem dispersão para hands-free |

**Trade-off aceite:** conversa oral permanece turno-a-turno (sem barge-in/contínua); limitações ENC-006 §7 vigentes até onda futura com mandato explícito.

---

## 5. Onda recomendada pós-corte

```
F1 (paridade voz) ENCERRADA → F2 (índice) → F3 (lastro MG2) → F4 (NCS) → F5 (RELEASE)
                                                              │
                                                    F6 (voz avançada) CANCELADA nesta onda
```

| Ordem | Manter | Cortar desta onda |
|-------|--------|-------------------|
| 1 | F2 fecho documental | — |
| 2 | F3 lastro MG2 (1ª frente de valor) | — |
| 3 | F4/F5 conforme mandato | — |
| 4 | — | **F6 evolução modo voz** |

---

## 6. Quando reabrir F6

Reavaliar **evolução de voz** apenas se **todas** as condições:

1. F2 + F3 fechados (ou F3 em maturidade operacional).  
2. Uso oral diário com fricção **documentada** (ex.: barge-in bloqueia sessões > N turnos).  
3. Mandato explícito do Patrocinador com escopo MVP2 **reduzido** (1–2 evoluções, não bloco ENC-006 §7 inteiro).  
4. Gate ADR-006 completo; **proibição** de alterar EIC mantida.

---

## 7. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Próxima onda CEO | `docs/roadmap/ROADMAP-002-planejamento-proxima-onda-evolucao.md` |
| Estado produto | `docs/REL-001-estado-atual-do-sistema-ceo.md` |
| Mapa capacidades | `docs/analysis/ANL-014-mapa-capacidades-executivas-baseline-eic.md` |
| Encerramento voz MVP | `docs/learning/ENC-006-encerramento-modo-ceo-ouvindo.md` |
| Fecho F1 | `docs/governance/REG-001-pacote-fecho-f1.md` |
| CAP-04 baseline | `docs/learning/2026-08-07-encerramento-imp-070-baseline-cap-04.md` |
| Parecer MG2 (JOB-000048) | `docs/learning/2026-08-08-job-000048-cancelar-funcionalidade-mg2.md` |

---

## Resultado da fila

`completed` — parecer entregue: cancelar **F6 (evolução do modo voz)** desta onda CEO para acelerar; manter F2/F3 activos; MVP oral vigente; sem implementação técnica nem alteração de Constituição/Governança.

# ANL-015 — Diagnóstico Técnico da Pendência F1 (REG)

> **Status:** Emitido — 06/08/2026 (diagnóstico; aguarda decisão CTO A|B).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Identificação:** ANL-015.  
> **Lastro:** Parecer CTO — ANL-014 **APROVADO**; pendência obrigatória **F1 (REG)** antes de nova frente.  
> **Fontes:** [`REG-001`](../governance/REG-001-plano-regularizacao-arquitetural-onda-f1.md); [`AUD-001`](../governance/AUD-001-auditoria-arquitetural-onda-f1.md); VAL-011; VAL-011R; ARQ-030; ROADMAP-002; cadeia ANL-013→IMP-069.  
> **Proibições:** não implementa; **não** altera arquitectura; **não** altera governação; **não** executa REG-A*.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Diagnóstico objectivo do que ainda impede o encerramento definitivo da Onda F1 (regularização REG-001). |
| **Por que existe?** | O CTO aprovou ANL-014 e exige fecho de F1 (REG) antes de abrir a próxima frente; falta decidir entre encerrar já ou executar última regularização. |
| **Para quem existe?** | CTO (decisão A|B); Patrocinador (Gate); Coordenador Executivo; Engenheiro (aguarda mandato). |
| **Como medir sucesso?** | Seis respostas objectivas + menor conjunto de acções + enquadramento claro para opção A ou B. |

---

## 1. Factos verificados (corte 06/08/2026)

| Facto | Evidência |
|-------|-----------|
| Objectivo técnico F1 (publicar MVP voz no alias + smoke) | Cumprido em engenharia: IMP-069 + VAL-011 13/13 + VAL-011R (STT) |
| REG-001 | **Plano emitido**; acções REG-A01…A08 **não executadas** |
| VAL-011 | Homologada (engenharia); **aguarda Gate final do patrocinador** |
| VAL-011R | Homologada (engenharia); **aguarda aprovação do patrocinador**; GATE-010 cancelado até lá |
| ARQ-030 (e elos ANL/REQ/IMP) | Cabeçalho «Homologada» vs rodapé/Memória «Em análise» — **ainda contraditório** |
| ROADMAP-002 | F1 ainda **frente activa** |
| Desenho ARQ-030 / EIC / Motor | Sem pedido de redesign no REG; F1 = implantação + governação |

---

## 2. Respostas objectivas

### 2.1 O que ainda impede o encerramento definitivo da F1?

Três bloqueios **conjuntos** (não um único):

| # | Bloqueio | Natureza |
|---|----------|----------|
| **B1** | Gate formal do patrocinador em **VAL-011** e **VAL-011R** não registado | Operacional / decisório |
| **B2** | Metadados e elos da cadeia F1 inconsistentes (status Homologada vs Em análise; cruzamentos ANL/REQ/README) | Documental / governação |
| **B3** | Gate ADR-006 ARQ→IMP não registado de forma auditável (L1–L6 / Memória); REG-A01…A05 por executar | Governação processual |

Enquanto B1+B2+B3 permanecerem abertos, **não** se pode declarar F1 «arquitecturalmente / oficialmente encerrada» sem aceite explícito de risco (AUD-001 / REG-001 §5).

**Não impede** (já resolvido em produto):
- ausência do MVP no `main`;
- necessidade de novo desenho de voz;
- alteração da EIC ou do pipeline textual.

---

### 2.2 Pendência técnica, documental ou operacional?

| Camada | Peso no bloqueio actual | Nota |
|--------|-------------------------|------|
| **Técnica (código / runtime)** | **Baixo** | Entrega e correcção STT já feitas; REG-A07/A08 são pós-F1 |
| **Documental** | **Alto** | B2 — unicidade de status e índices |
| **Operacional / decisória** | **Alto** | B1 — Gate do patrocinador |
| **Governação processual** | **Alto** | B3 — registo de Gates e pacote de fecho |

**Classificação sintética:** pendência **documental + operacional (Gate)**, com lastro de governação. **Não** é pendência técnica de produto em aberto.

---

### 2.3 Existe impacto na arquitectura?

| Pergunta | Resposta |
|----------|----------|
| Redesign de ARQ-029 / ARQ-030 / EIC necessário para fechar F1? | **Não** |
| REG-A01…A05 alteram arquitectura de produto? | **Não** — editorial + registo de Gate |
| REG-A07/A08 (marcadores / promoção automática)? | Impacto arquitectónico **futuro**; **fora** do mínimo de encerramento F1 |

**Conclusão:** impacto arquitectónico do fecho F1 = **nulo** no perímetro de produto. Só higiene documental e decisão de Gate.

---

### 2.4 Existe impacto na Executive Engine?

| Componente | Impacto do fecho F1 (REG) |
|------------|---------------------------|
| `executiveEngine` / Classificador / CSC / VCA / DIC | **Nenhum** — F1 não os altera; VAL já validou path texto em prod |
| Motor / Gate de Execução / MRE | **Nenhum** — destinos inalterados |
| Fila / Dispatcher | **Nenhum** |
| Camada voz (`ceoOuvindo`) | Já publicada; REG não mexe em runtime |

**Conclusão:** **zero impacto** na Executive Engine para encerrar F1 via REG. Qualquer acção REG é fora do motor executivo.

---

### 2.5 O bloqueio é real ou apenas administrativo?

| Leitura | Veredicto |
|---------|-----------|
| Bloqueio de **uso** do alias / pipeline texto? | **Não** (engenharia já homologou funcionamento) |
| Bloqueio de **declaração oficial** «F1 encerrada»? | **Sim — real** |
| Bloqueio de **abrir F6** (voz avançada) sem ressalva? | **Sim — real** (ROADMAP / GATE-009) |
| Bloqueio de **abrir F2/F3** sob ANL-014? | **Político-processual** (mandato CTO: nenhuma frente antes de F1 REG) — real enquanto a deliberação vigorar |

**Síntese:** não é “ficção burocrática sem efeito”; é **bloqueio de governação e de narrativa oficial**, não de runtime. Chamar só de “administrativo” subestima o risco de precedente (AUD-001 R-AUD-1). Chamar de “bloqueio técnico de produto” seria incorrecto.

---

### 2.6 Menor conjunto de acções para F1 definitivamente encerrada

Alinhado a REG-001 caminho crítico, **mínimo bloqueante**:

| # | Acção | Tipo | Obrigatória? |
|---|-------|------|--------------|
| 1 | **REG-A01** — Unificar status (ANL-013, REQ-069, ARQ-030, IMP-069) | Editorial + Governança | **Sim** |
| 2 | **REG-A02** — Sincronizar elos / `docs/README.md` | Editorial + Governança | **Sim** |
| 3 | **REG-A03** — Registar Gate ARQ→IMP + L1–L6 | Governança | **Sim** |
| 4 | **REG-A05** — Pacote de fecho STT / VAL-011R (NC-I1 CORRIGIDA) | Editorial + Governança | **Sim** |
| 5 | **REG-A04** — Gate patrocinador VAL-011 **e** VAL-011R | Operacional / decisório | **Sim** |
| 6 | Actualizar ROADMAP-002: F1 **encerrada** | Editorial | **Sim** (fecho) |

**Fora do mínimo:** REG-A06 (ENC-006), REG-A07, REG-A08, reauditoria formal AUD delta (recomendável mas pode fundir-se num checklist curto pós-A01…A05).

**Contagem mínima:** **6 passos** (5 REG-A + ROADMAP), todos **sem código de produto** salvo descoberta de regressão no Gate (improvável).

---

## 3. Enquadramento para a decisão CTO (A | B)

### Opção A — Encerrar definitivamente a F1 *já*

Só é tecnicamente honesta se o Patrocinador/CTO emitir **por escrito**:

1. Aprovação (ou ACEITE_RISCO) de VAL-011 e VAL-011R; **e**  
2. ACEITE_RISCO explícito das NC-G/D de metadados **ou** mandato imediato para as corrigir *no mesmo acto de fecho*; **e**  
3. Declaração «F1 encerrada» no ROADMAP-002.

Sem (1), a opção A **colide** com o próprio texto de VAL-011/011R (“aguarda Gate”).  
Sem (2), a opção A **reabre** o risco AUD de precedente tóxico.

### Opção B — Executar uma última acção de regularização

**Recomendação técnica deste diagnóstico:** tratar “última acção” como **pacote mínimo §2.6** (REG-A01→A02→A03→A05→A04 + ROADMAP), num único mandato de execução ao Engenheiro + Gate do Patrocinador — não como oito frentes REG-A07/A08.

Isto corresponde à opção **B** do CTO: regularizar, depois encerrar, depois abrir a próxima frente (tipicamente F2).

---

## 4. Parecer técnico (Engenheiro)

| Questão | Parecer |
|---------|---------|
| F1 está tecnicamente entregue? | **Sim** (lab + prod engenharia + STT) |
| F1 está oficialmente encerrável sem REG? | **Não**, sob as regras AUD/REG e o mandato ANL-014 |
| Precisa de mudança de arquitectura / EE? | **Não** |
| Menor caminho limpo | **Opção B** com o conjunto mínimo §2.6 |
| Opção A viável? | Só com Gates + aceite de risco documental explícitos |

**Recomendação ao CTO:** escolher **B** (pacote mínimo de regularização), salvo o Patrocinador preferir **A** com Gates e ACEITE_RISCO documentados no mesmo acto.

---

## 5. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor) |
| Quando | 06/08/2026 |
| O quê | ANL-015 — Diagnóstico F1 (REG) pós-aprovação ANL-014 |
| Por quê | Permitir decisão CTO A (encerrar) vs B (regularizar) |
| Resultado | Emitido — bloqueio documental/operacional real; zero impacto EE/ARQ de produto |

---

## 6. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro (Cursor) | Diagnóstico completo — 6 respostas + mínimo de acções + A\|B | Emitido — aguarda decisão CTO |

---

**Estado:** Diagnóstico concluído. **Nenhuma implementação.**  
**Aguarda:** deliberação CTO — **A** ou **B**.

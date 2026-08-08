# ARQ-032 — Autoridade Delegada

> **Status:** **Homologada v1.0** — 07/08/2026 (CTO). **Congelada.**  
> **Tipo:** ARQ (ADR-010). **Identificação:** ARQ-032.  
> **Título:** Autoridade Delegada.  
> **Origem:** INV-001 ENCERRADA → arquitectura → homologação CTO.  
> **Norma superior:** CON-001 Art. 6º I; Art. 8º; ADR-006; ADR-010; ADR-015.  
> **Baseline:** integrada via CAP-01 / IMP-071 (07/08/2026). Sem conflito com CTO-003, ARQ-031, CAP-04, Executive Engine, EIC.  
> **Ciclo CAP:** [`CAP-01 — Autoridade Delegada`](../cap-01/README.md) — **ENCERRADO · Baseline**.  
> **Proibição:** não alterar esta ARQ sem nova evidência + deliberação CTO. Sem tecnologia neste documento.

---

## Princípio arquitectural central (congelado)

**Autoridade Delegada NÃO cria um novo dono da missão.**

Cria apenas um **período controlado** em que o CEO possui **competência para decidir** dentro dos **limites concedidos pelo Usuário**.

---

## Decisões homologadas A1–A8 (congeladas)

| ID | Decisão (síntese) |
|----|-------------------|
| **A1** | Competência temporária, explícita e subordinada de **fecho** Usuário→CEO |
| **A2** | Nasce só por **acto explícito** do Usuário |
| **A3** | Estado `autoridade_delegada_activa` — missão continua do Usuário; CEO com competência concedida |
| **A4** | Validade: V1–V5 (acto, destinatário CEO, soberania reconhecida, perímetro, não encerrada) |
| **A5** | Encerramento: E1–E6 (revogação, exaurimento, expiração, perda de âmbito, acto soberano, retorno automático) |
| **A6** | Limites objectivos 1–10; fecho operacional no perímetro; exclusões constitucionais |
| **A7** | Retorno automático da competência de fecho ao Usuário ao terminar |
| **A8** | Ortogonal a Deliberar / Executar / Recuperar; não é quarto modo CTO-003 |

O corpo normativo completo permanece nas secções abaixo — **texto congelado** na homologação.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Modelo arquitectural da Autoridade Delegada: transferência temporária, explícita e subordinada de competência decisória do Usuário para o CEO. |
| **Por que existe?** | A INV-001 mostrou lacuna estrutural: o sistema não modela essa transferência; só autoridade permanente e autorização operacional pontual. |
| **Para quem existe?** | CTO (homologou); Usuário (soberania permanente); Engenheiro (CAP aberta — sem IMP até REQs). |
| **Como medir sucesso?** | A1–A8 homologados; soberania do Usuário intacta; CAP decompõe sem alterar esta ARQ. |

---

## A1. Conceito de Autoridade Delegada

**Autoridade Delegada** é a competência **temporária**, **explícita** e **subordinada** conferida pelo Usuário ao CEO (Agente Executivo) para **fechar decisões** num perímetro delimitado, sem exigir novo acto de fecho do Usuário a cada decisão coberta por esse perímetro.

| É | Não é |
|---|--------|
| Competência de **decidir** (fecho) concedida | Mudança de dono da missão |
| Estado / período controlado | Autoridade permanente do Usuário |
| Subordinada e revogável | Cessão de soberania |
| Distinta de autorização operacional pontual | Gate / «autorizado» sobre um único acto já proposto |
| Distinta de delegação de execução | Despacho CEO → fila / oficina (fazer, não decidir) |

---

## A2. Acto de delegação

O **acto de delegação** é o enunciado **explícito** do Usuário que confere ao CEO a Autoridade Delegada.

1. **Agente:** somente o Usuário.  
2. **Destinatário:** somente o CEO (Agente Executivo).  
3. **Forma:** explícita — não se infere de silêncio, cortesia, «ok» ou continuidade de missão.  
4. **Conteúdo mínimo lógico:** intenção de conceder competência para **decidir** (fecho), não apenas de confirmar um passo.  
5. **Perímetro:** o acto pode delimitar âmbito; se omisso, vigora o perímetro por omissão definido em A6.  
6. **Unicidade de origem:** CTO, Engenheiro, Painel, Dispatcher ou o próprio CEO **não** emitem acto de delegação.

Sem acto de delegação válido, **não** existe Autoridade Delegada.

---

## A3. Estado arquitectural durante a delegação

Durante a delegação válida e vigente, o sistema encontra-se no estado lógico **`autoridade_delegada_activa`**.

| Dimensão | Conteúdo lógico |
|----------|-----------------|
| **Titular da missão** | Usuário (inalterado) |
| **Competência de fecho no perímetro** | CEO (concedida) |
| **Competência soberana** | Usuário (permanente; pode revogar / prevalecer) |
| **Perímetro** | O definido no acto + limites A6 |
| **Duração** | Até encerramento (A5) / retorno (A7) |
| **Rastreabilidade** | Decisões fechadas sob este estado assinalam-se como tomadas **sob Autoridade Delegada** (CON-001 Art. 8º) |

O estado **não** substitui Deliberar / Executar / Recuperar (A8); **modula** a competência de fecho enquanto activo.

---

## A4. Critérios de validade da delegação

| ID | Critério |
|----|----------|
| V1 | Existe **acto de delegação** explícito do Usuário (A2). |
| V2 | O acto dirige-se ao **CEO** e concede competência de **decidir / fechar**. |
| V3 | A autoridade permanente do Usuário permanece **reconhecida**. |
| V4 | O perímetro é **determinável** (pelo acto ou por omissão A6). |
| V5 | Não há **revogação** nem outro critério de encerramento já consumado (A5). |

Invalidade ⇒ a delegação **não entra em vigor**.

---

## A5. Critérios de encerramento da delegação

| ID | Critério |
|----|----------|
| E1 | **Revogação explícita** pelo Usuário |
| E2 | **Exaurimento do perímetro** |
| E3 | **Expiração** (se definida) |
| E4 | **Perda de âmbito** |
| E5 | **Acto soberano** do Usuário que reafirme fecho exclusivo ou contradiga o mandato |
| E6 | **Retorno automático** (A7) |

Após encerramento: competência de fecho **regressa** integralmente ao Usuário.

---

## A6. Limites objectivos da autoridade delegada

1. Soberania do Usuário — não cria novo dono da missão.  
2. Subordinação — acto explícito do Usuário prevalece.  
3. Revogabilidade.  
4. Temporalidade.  
5. Explicitação — só por acto (A2).  
6. Perímetro — só dentro do âmbito concedido.  
7. Não redelegação.  
8. Reservas constitucionais (CON-001, CAP, ROADMAP, aval directo quando reservado).  
9. Decidir ≠ execução técnica / oficina.  
10. Distinta de autorização operacional pontual (Gate).

**Pode** cobrir no perímetro: fecho de decisões executivas operacionais (priorizar, escolher, próximo gesto, declarar decisão).  
**Não pode** cobrir o excluído por 1–10 nem o fora do perímetro.

---

## A7. Retorno automático da autoridade ao Usuário

Ao encerrar-se a delegação (A5), a competência de fecho **regressa ao Usuário sem acto adicional**.

1. Automático.  
2. Integral — sem alçada residual.  
3. Imediato no plano lógico.  
4. Preserva soberania.  
5. Rastreável (Art. 8º).

---

## A8. Relação Deliberar / Executar / Recuperar / Autoridade Delegada

Eixos **ortogonais**: modos = postura do momento; Autoridade Delegada = competência de fecho concedida.

| Modo | Sem delegação activa | Com delegação activa |
|------|----------------------|----------------------|
| Deliberar | Prepara; Usuário fecha | Pode **fechar** no perímetro |
| Executar | Ordens / autorização pontual | Executa; fecho no perímetro se coberto |
| Recuperar | Recupera ops; fecho sensível no Usuário | Não amplia perímetro; fecho só se coberto por A6 |

1. Não substitui Deliberar / Executar / Recuperar.  
2. Não é quarto modo CTO-003.  
3. CTO-003 permanece intocado.  
4. Sem delegação, nenhum modo confere soberania de fecho.  
5. Com delegação, o modo escolhe a postura; a delegação escolhe a competência de fecho.

---

## Fora de escopo desta ARQ (permanente)

Tecnologia · prompts · código · CAP (excepto rastreio) · REQ · IMP · alteração EIC/EE · léxico de frases · política fina de Gates.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (homologou) · Engenheiro (registou) |
| Quando | 07/08/2026 |
| O quê | Homologação e congelamento ARQ-032; abertura CAP-01 ciclo Autoridade Delegada |
| Por quê | Despacho CTO — ARQ-032 Homologada |
| Baseado em quê | INV-001; A1–A8; CON-001 Art. 6º I |
| Resultado | **Homologada / congelada** · CAP aberta |

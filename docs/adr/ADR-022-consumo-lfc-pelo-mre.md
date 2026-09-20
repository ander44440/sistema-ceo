# ADR-022 — Consumo do Lastro Factual do Caso (LFC) pelo MRE

> **Status:** Aprovada (Usuário) — v0.1.1  
> **Versão:** 0.1.1 — 13/09/2026  
> **Não homologa** implementação. **Não** abre IMP. **Não** altera código.  
> **Fora desta frente:** detecção de linguagem natural de análise deliberativa / P1-2.  
> **Complemento:** uso do HFC/fio sob restrição factual explícita → [ADR-023](ADR-023-deliberacao-base-factual-restrita.md) (não reabre §3.1–3.6).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | Usuário (autoridade máxima) — regra de consumo aprovada; Engenheiro (Cursor) formaliza |
| Quando | 13/09/2026 |
| Por quê | Auditoria T05 pós-fix: LFC com factos activos; MRE deliberativo não lia `LfcReader`; lastro vinha de HFC/reparse; W3/ARQ-092 §13 exigiam consumo sem gatilho fechado |
| Baseado em quê | ADR-021 v0.2; REQ-092 v0.2; ARQ-092 v0.2; auditoria de conformidade LFC→MRE; despacho Usuário com regras 1–10 |
| Resultado | ADR-022 v0.1 + REQ-092 v0.3 + ARQ-092 v0.3. Zero código. Zero IMP neste acto |

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Decisão arquitetural que fecha **quando** e **como** o MRE consome o LFC via Reader, sem escrever. |
| **Por que existe?** | ADR-021 W3 / ARQ-092 §13 afirmavam consumo; IMP-092.3 só ligou modos restritos; deliberação C2 ficou sem contrato de gatilho. |
| **Para quem existe?** | CTO (revisão); Engenheiro (IMP futura); MRE / Conversa (consumidores RO). |
| **Como medir sucesso?** | Critérios CA-MRE-* do REQ-092 v0.3; IMP futura (acto separado) sem violação das regras 1–10. |

---

## 1. Contexto

O LFC é a fonte canónica dos factos **assertados e vigentes** do caso (ADR-021). O MRE **consome** e **não escreve** (W3).

IMP-092.3 ligou Writer/Reader aos modos restritos (`registo` / `confirmacao` / `factos` / `dado_unico`). O caminho deliberativo (`montarEntradaMre`) não chamava `LfcReader`, usando Acervo + reparse HFC — em conflito com a precedência factual do REQ-092 §7 quando o LFC já existe.

A bateria operacional T05 («preocupação executiva… factos registrados… ValeVerde») mostrou: LFC válido ≠ lastro deliberativo injectado; `solicitar_dados` / disciplina de lastro são políticas **distintas** da existência de factos de caso.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | «MRE consome LFC» sem gatilho → IMP ambígua ou omissão |
| P2 | Injectar LFC em toda deliberação viola M2 (contaminação) |
| P3 | Escolher caso em silêncio viola multi-caso / ARQ §9 |
| P4 | HFC/reparse como autoridade factual do caso após LFC existir |
| P5 | Confundir «há factos no LFC» com «há lastro suficiente para qualquer decisão» |
| P6 | Misturar calibração P1-2 com a frente LFC→MRE |

---

## 3. Decisão (aprovada)

### 3.1 Gatilho de consumo

O MRE **pode** consumir o LFC (somente via **`LfcReader`**, read-only) **quando**:

1. existir **COA resolvido** (`coaId` activo / identificável), **e**
2. existir **caso resolvido ou inequívoco** (`casoId` por resolução canónica do Reader: `casoId` explícito, título com match único, ou deixis/ponteiro inequívoco).

### 3.2 Condições de não consumo

**Não** injectar factos do LFC na entrada deliberativa quando:

| Condição | Comportamento |
|----------|----------------|
| Sem COA resolvido | Não inventar `coaId`; não injectar LFC |
| Sem caso identificável / inequívoco | Não injectar LFC (alinha REQ-092 M2) |
| Pedido sem âmbito de caso | Não injectar LFC |
| LFC indisponível / sem activos para o caso | Não mascarar ausência como facto; declarar limitação se a deliberação depender desses factos |

### 3.3 Tratamento de ambiguidade

Com **múltiplos casos possíveis** (ex.: N títulos iguais no mesmo COA):

- **Pedir esclarecimento** (qual `casoId` / qual caso);
- **Proibido** escolher silenciosamente;
- **Proibido** fundir ou misturar activos de vários `casoId` num único lastro.

Reutiliza o contrato de `resolverCaso` (ARQ-092 §9).

### 3.4 Precedência factual

Quando o consumo está autorizado e o LFC do caso resolvido tem factos **`activo`**:

| Prioridade | Fonte | Papel |
|------------|-------|--------|
| **1** | **LFC** (factos activos via Reader) | **Autoridade factual do caso** |
| 2 | HFC / transcript / reparse | **Prova histórica** do que foi dito — **não** substitui factos activos do LFC |
| — | Inferência / prosa MRE | Nunca vira facto LFC (ADR-021) |

Ausência de LFC ou de facto **necessário** **não** deve ser mascarada como facto (nem por reparse, nem por inventário ops/Acervo).

### 3.5 Relação com `solicitar_dados`

| Regra | Texto |
|-------|--------|
| R-SD1 | A existência de factos no LFC **não** significa automaticamente lastro suficiente para **qualquer** decisão. |
| R-SD2 | A política `solicitar_dados` **permanece válida** para **lacunas deliberativas reais** **não cobertas** pelo LFC (dados essenciais à decisão que o LFC não contém). |
| R-SD3 | `solicitar_dados` **não** deve ser usado para fingir que faltam factos de caso que o LFC **já** tem como activos, quando o consumo LFC está autorizado e resolvido. |
| R-SD4 | Disciplina de lastro insuficiente e políticas vizinhas (ex. Acervo / REQ-070) **não** são reabertas nesta ADR além do necessário para R-SD1…R-SD3. |

### 3.6 Limites de autoridade do MRE

| Limite | Norma |
|--------|--------|
| Somente consumidor | MRE **nunca** escreve no LFC (W3; writer canónico único) |
| Sem promoção | Deliberação, recomendação, urgência, conclusão → **fora** do LFC |
| Sem autoridade paralela | MRE não cria store próprio de factos de caso |
| Sem bypass do Reader | Consumo canónico = `LfcReader`; não inventar lista vigente a partir só do HFC quando LFC do caso existe |

### 3.7 Fora desta frente (explícito)

A **detecção de linguagem natural** de análise deliberativa / P1-2 (**não** faz parte desta decisão nem de qualquer IMP desta frente). Calibração P1-2 é acto normativo/IMP separado, se houver.

---

## 4. Alternativas rejeitadas

| Alternativa | Motivo |
|-------------|--------|
| Injectar LFC em toda deliberação C2 | Viola M2 / contaminação (T03) |
| Nunca injectar no MRE (só modos restritos) | Deixa W3 / ARQ §13 incumpridos na deliberação |
| HFC/reparse como autoridade quando LFC existe | Viola REQ-092 §7; falhou nas baterias |
| Escolha silenciosa do «melhor» caso | Viola multi-caso / ARQ §9 |
| «Há LFC ⇒ nunca `solicitar_dados`» | Confunde facto de caso com lastro deliberativo completo |
| Incluir P1-2 nesta frente | Escopo misturado; rejeitado pelo Usuário (regra 10) |

---

## 5. Consequências

- REQ-092 v0.3 materializa CA verificáveis de consumo MRE (v0.4+ acrescenta RFR via ADR-023).
- ARQ-092 v0.3 detalha o contrato LFC→MRE em §13 (v0.4+ §13.2 RFR).
- **IMP de consumo MRE:** acto **futuro e separado** — **não** aberto por esta ADR (entregue depois como IMP-092.4).
- IMP-092.3 permanece válida para modos restritos; esta ADR **não** a invalida.
- **ADR-023** fecha deliberação com base factual restrita (HFC residual ≠ objecto deliberativo) — **complementa** §3.4 sem a reabrir.
- Zero alteração de código neste acto.

---

## 6. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 Art. 9º; ADR-015; ADR-006; **ADR-021** |
| Capacidade | CAP-03 (LFC); CAP-05 consome (deliberação) |
| REQ | REQ-092 v0.3+ |
| ARQ | ARQ-092 v0.3+ |
| Complemento | **ADR-023** (RFR / LFC × HFC) |
| Vizinhos | REQ-087 (HFC); REQ-037/039 (COA); REQ-048/049 (`solicitar_dados`); REQ-070 (Acervo ≠ lacuna material) |
| Explicitamente fora | P1-2 / `detectarPedidoAnaliseDeliberativa` |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 13/09/2026 | Engenheiro (Cursor) | Gatilho, não-consumo, ambiguidade, precedência, `solicitar_dados`, limites MRE | Despacho Usuário — fechar LFC→MRE | Aprovada (Usuário); IMP não aberta |
| 0.1.1 | 13/09/2026 | Engenheiro (Cursor) | Ponteiro → ADR-023 (RFR) | Formalização D1–D4 sem reabrir consumo | Cross-ref apenas |

# ARQ-023 — Resolução de Referências Conversacionais

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-023.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; ADR-015; ADR-006; **ARQ-018** (Classificador — vigente, não substituída); **ARQ-022** / **REQ-061** / **IMP-061** (janela de histórico); **REQ-062**; REQ-057 / IMP-057; ARQ-019 / REQ-058; ARQ-017 / REQ-056; ARQ-014 (NCS); EIC (`docs/EIC/`).  
> Base analítica: **ANL-007**.  
> **Finalidade:** arquitectura do **Resolvedor de Referências Conversacionais** — módulo **auxiliar** que identifica o referente de deixis/anáfora no fio recente, **sem** alterar a arquitectura homologada do limiar C1–C4.  
> **Gate:** aguarda homologação. **Próximo artefacto:** **IMP-062** (após Gates ADR-006 / EIC aplicáveis).  
> **Sem implementação** de código, prompts ou comportamento neste documento.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada arquitectural **auxiliar** que resolve referências implícitas («isso», «aquele», «o anterior», «continua», …) para um `ReferenteResolvido` auditável — ou declara ambiguidade — usando a janela IMP-061. |
| **Por que existe?** | IMP-061 desambigua a **rota** C1↔C2; ainda falta o **objecto** da referência (REQ-062; ANL-007). |
| **Para quem existe?** | Patrocinador (fio MG2); Núcleo (orquestra); Classificador (inalterado na decisão de classe); destinos C2/C1 (consomem lastro); CTO/Engenheiro (IMP/VAL). |
| **Como medir sucesso?** | (1) Resolvedor auxiliar, não classificador; (2) janela 4/200/800 reutilizada; (3) sem influência C3/Jobs; (4) Gate/Motor/NCS inalterados; (5) sem referente = comportamento actual; (6) ambiguidade → pergunta curta; (7) CA REQ-062 verificáveis. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **Resolvedor** é um módulo **auxiliar** e **puro**.  
O **Classificador** permanece o **único ponto de decisão de classe** (ARQ-018 / EIC V1).

```text
IMP-061                          +  ARQ-023 (auxiliar)
───────────────────────────────     ────────────────────────────
historicoRecente → desambigua       historicoRecente → resolve
                   ROTA C1↔C2                          REFERENTE
```

Divisão de responsabilidades:

| Módulo | Decide |
|--------|--------|
| Classificador (ARQ-018 + ARQ-022) | **Classe** / destino de intenção |
| Resolvedor (esta ARQ) | **Referente** (âncora semântica do turno) ou ambiguidade |

### 1.2 O que permanece (invariante de sistema)

| Peça | Estado |
|------|--------|
| Enum C1–C4 + limiar 0,55 | **Preservado** |
| Um Classificador canónico | **Preservado** |
| Continuidade Gate **antes** | **Preservado** — **não alterar Gate** |
| Motor | **Não alterar** |
| NCS | **Não alterar** |
| Jobs / Fila | **Não alterar**; resolvedor **não** cria Jobs |
| Janela IMP-061 (4/200/800) | **Reutilizar** — sem alargar no V1 |
| Influência C3 via histórico/referente | **Proibida** |
| Sem referente válido | **Comportamento actual** (IMP-061 + destinos) |

### 1.3 O que se acrescenta

1. Módulo puro **Resolvedor de Referências** (`resolverReferencias` ou equivalente).  
2. Contrato de saída `ResultadoResolucaoReferencia` (`ReferenteResolvido` | ambiguidade | nenhum).  
3. Integração no Núcleo: após Gate e após (ou em paralelo lógico com) preparação da janela; **antes ou após** `classificar` **sem** alimentar pontuação C3.  
4. Injecção do referente no **lastro** C2 (e opcionalmente C1) / clarificação de referente.  
5. *(Opcional fase controlada)* reescrita segura `M→M'` **sem** verbos E2.1 novos — só se ARQ/IMP o activarem com testes anti-C3.

---

## 2. Relação com ARQ-018 e ARQ-022

| Norma | Papel face a ARQ-023 |
|-------|----------------------|
| **ARQ-018** | Norma-mãe do Classificador; esta ARQ **não** emenda classes, limiar nem §5.3 de saída de intenção |
| **ARQ-022** | Fornece `historicoRecente` e S3 de **rota**; ARQ-023 **consome** a mesma janela para **referente** |
| **IMP-061** | Implementação da janela; contrato 4/200/800 **obrigatório** nesta ARQ |

```text
ARQ-018 (classe) ←── único decisor de C1–C4
ARQ-022 / IMP-061 (janela + rota C1↔C2)
ARQ-023 (referente) ── auxiliar; lastro pós-rota
```

---

## 3. Componentes envolvidos

| ID | Componente | Responsabilidade | Altera contrato? |
|----|------------|------------------|------------------|
| **C-UI** | Conversa / Centro | Fornece `historico[]` | Não |
| **C-GATE** | Continuidade Gate | Precedência inalterada | **Não** |
| **C-PREP** | `seleccionarHistoricoRecente` (IMP-061) | Janela 4/200/800 | Não (reutilizar) |
| **C-REF** | Resolvedor de Referências (**novo**, puro) | `resolverReferencias(...)` | Novo módulo auxiliar |
| **C-CLS** | Classificador | Único decisor de classe | **Não** (decisão); contexto de histórico inalterado na política C3 |
| **C-ADP** | Adapter `classificarIntencao` | Sem reclassificar | Não |
| **C-NUC** | `executiveEngine.executar` | Orquestra: Gate → janela → (resolvedor + classificar) → destinos + lastro | Passagem de lastro |
| **C-COA** | COA / frente (read-only) | Sinal P3 de candidato | Não |
| **C-DEST** | Destinos C1/C2 | Consomem `referente` no lastro se presente | Só lastro |
| **C-MOT** | Motor | — | **Não** |
| **C-NCS** | NCS | — | **Não** |
| **C-JOB** | Fila / Jobs | — | **Não** |
| **C-CN** | Conversação Natural | Pode reflectir pergunta de ambiguidade | Prosa apenas |

---

## 4. Ponto de integração

### 4.1 Posição na cadeia

```text
executar({ texto: M, historico: H })
  │
  ├─ [1] Continuidade Gate                    ← inalterado
  │       (se interceptar → fim; C-REF NÃO compete)
  │
  ├─ [2] historicoRecente = C-PREP(H, M)      ← IMP-061
  │
  ├─ [3] resultadoRef = C-REF.resolverReferencias({
  │         mensagem: M,
  │         historicoRecente,
  │         frenteActiva?,
  │         coa?                                ← read-only
  │       })
  │
  ├─ [4] classificacao = primeiroPassoClassificar(M, {
  │         frenteActiva,
  │         historicoRecente?                   ← IMP-061; C-REF NÃO altera scores C3
  │       })                                    ← ÚNICO ponto de decisão de classe
  │
  ├─ [5] Se resultadoRef.estado === "ambiguo"
  │       → destino clarificação de REFERENTE (pergunta curta)
  │         (sem Job; sem forçar C3)
  │
  └─ [6] Senão → executarPorDestino + lastro.referente se "resolvido"
```

**Ordem [3] vs [4]:** ambas são puras e independentes na V1. O IMP pode executar [3] antes de [4] (preferido para clarificação precoce de referente) ou [4] antes de [3], desde que:

* C-REF **nunca** escreva em `classe` / `permiteJob`;  
* C-CLS **nunca** receba texto reescrito que introduza E2.1 (se reescrita existir, só pós-validação I-R2).

### 4.2 Único ponto de decisão de classe

```text
primeiroPassoClassificar / classificar  →  SaidaClassificador
```

C-REF **não** é ponto de decisão de intenção.

---

## 5. Estruturas de dados

### 5.1 Entrada do Resolvedor

```text
EntradaResolucaoReferencia = {
  mensagem: string
  historicoRecente: HistoricoRecenteItem[]   // contrato IMP-061 / ARQ-022
  frenteActiva?: boolean
  coa?: { id?: string, nome?: string }       // opcional, read-only
  gateResumo?: string | null                 // opcional, read-only (acto pendente)
}
```

`HistoricoRecenteItem` = contrato IMP-061 (`papel: usuario|ceo`, `texto` truncado).

### 5.2 Tipos de referente V1 (enum fechado)

```text
TipoReferente =
  | "topico_projeto"
  | "frente_coa"
  | "acto_gate"
  | "mensagem_anterior"
  | "desconhecido"
```

### 5.3 Referente resolvido

```text
ReferenteResolvido = {
  tipo: TipoReferente
  ancora: string              // texto curto auditável (ex.: "outdoor lateral")
  confianca: number           // 0..1
  razaoReferente: string      // sem secrets
  fonte: "ceo" | "usuario" | "coa" | "gate"
}
```

### 5.4 Resultado

```text
ResultadoResolucaoReferencia =
  | { estado: "nenhum" }
  | { estado: "resolvido", referente: ReferenteResolvido }
  | {
      estado: "ambiguo",
      candidatos: ReferenteResolvido[],   // ≥2
      perguntaCurta: string               // contextualizada
    }
```

### 5.5 Limiar interno de confiança do referente (V1)

| Parâmetro | Valor proposto V1 | Nota |
|-----------|-------------------|------|
| `LIMIAR_REFERENTE` | **0,60** | Independente de `LIMIAR_CONFIANCA` (0,55) do Classificador |
| Abaixo do limiar com 1 candidato fraco | Tratar como `nenhum` ou `ambiguo` se houver rival | Fechar no IMP com testes |

**Proibição:** este limiar **não** altera `LIMIAR_CONFIANCA` do Classificador.

### 5.6 Janela (obrigatória)

| Parâmetro | Valor | Origem |
|-----------|-------|--------|
| Máx. mensagens | **4** | IMP-061 / REQ-062 RF2 |
| Cap / mensagem | **200** | idem |
| Cap total | **800** | idem |

---

## 6. Fluxo de execução / sequência operacional

| Passo | Operação | Notas |
|-------|----------|-------|
| S0 | Gate | Se continuidade/clarificação Gate → **skip** C-REF e Classificador de intenção do pedido novo conforme ARQ-019 |
| S1 | Preparar `historicoRecente` | C-PREP IMP-061 |
| S2 | Detectar deixis/follow-up | Reutilizar/estender `mensagemEhDeixisOuFollowUp`; se falso → `{ estado: "nenhum" }` (RF8) |
| S3 | Extrair candidatos P1–P4 | Ver §7 |
| S4 | Ranquear / filtrar por `LIMIAR_REFERENTE` | DET |
| S5 | Emitir resultado | `nenhum` \| `resolvido` \| `ambiguo` |
| S6 | Classificar intenção | C-CLS — **único** decisor de classe |
| S7 | Encaminhar | Se `ambiguo` e política de turno o exigir → pergunta curta; senão destinos + lastro |

---

## 7. Estratégia de resolução

### 7.1 Prioridade de candidatos (mais recente → mais antigo na janela)

| Pri | Fonte | Tipo típico | Exemplo |
|-----|-------|-------------|---------|
| **P1** | Último objectivo/tópico explícito na fala do **CEO** | `topico_projeto` / `mensagem_anterior` | «Frente outdoor: falta o painel lateral» |
| **P2** | Última menção de entidade de projecto na fala do **utilizador** | `topico_projeto` | «outdoor», «pagamento», `JOB-…` |
| **P3** | Nome da **frente activa / COA** | `frente_coa` | Motoboy Game 2 |
| **P4** | Resumo de **Gate** pendente (read-only) | `acto_gate` | «bugs do projecto» |

### 7.2 Regras de selecção

1. Sem deixis → `nenhum` (não resolver agressivamente).  
2. Um candidato com `confianca ≥ LIMIAR_REFERENTE` e margem clara face ao 2.º → `resolvido`.  
3. Dois ou mais acima do limiar sem margem → `ambiguo` + `perguntaCurta`.  
4. Só P3 (COA) sem menção no histórico e deixis fraca → preferir `nenhum` ou clarificar (evitar inventar foco).  
5. Candidatos **nunca** incluem «criar Job» / imperativos de execução como *tipo de resolução* — o referente é âncora, não ordem.

### 7.3 O que o Resolvedor **não** faz

* Não define `classe`, `destino` de intenção, `permiteJob`.  
* Não publica Jobs.  
* Não chama Motor, NCS, Dispatcher, SDK.  
* Não altera o store do Gate.  
* Não concatena histórico ao texto para pontuação C3 do Classificador.

---

## 8. Tratamento de ambiguidades

| Situação | Resultado | UX |
|----------|-----------|-----|
| 0 candidatos / abaixo limiar | `nenhum` | Comportamento actual (IMP-061) |
| 1 candidato forte | `resolvido` | Lastro C2/C1 com `ancora` |
| ≥2 candidatos fortes | `ambiguo` | **Pergunta curta e contextualizada** (ex.: «Refere-te ao outdoor ou ao pagamento?») |
| Deixis + Gate pendente + tópico novo | Preferir clarificação se P4 e P1/P2 competem | Sem usurpação do léxico Gate |

A pergunta de ambiguidade de referente:

* **não** é decisão de Gate;  
* **não** cria Job;  
* **não** força C3;  
* pode coexistir com clarificação de intenção do Classificador, mas o IMP deve evitar **duas** perguntas no mesmo turno (preferir a de referente se `ambiguo` e deixis clara).

---

## 9. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-AUX** | Resolvedor é módulo **auxiliar**. |
| **I-ONE** | Classificador = **único** ponto de decisão de classe. |
| **I-WIN** | Janela = IMP-061 (**4/200/800**). |
| **I-GATE** | Gate **não** alterado; precedência preservada. |
| **I-MOT** | Motor **não** alterado. |
| **I-NCS** | NCS **não** alterado. |
| **I-JOB** | Jobs **não** alterados; resolvedor não cria Jobs. |
| **I-C3** | Referente **não** influencia C3 / `permiteJob`. |
| **I-BASE** | Sem referente válido (`nenhum`) = **comportamento actual**. |
| **I-PURE** | C-REF sem I/O / efeitos laterais. |
| **I-LIM-CLS** | `LIMIAR_CONFIANCA` 0,55 do Classificador **intacta**. |

---

## 10. Compatibilidade

| Artefacto | Compatibilidade |
|-----------|-----------------|
| **REQ-062** | Esta ARQ especifica a realização arquitectural |
| **ANL-007** | Alt. B (resolvedor DET) adoptada |
| **ARQ-018** | Classificador intacto |
| **ARQ-022 / IMP-061** | Janela e S3 de rota preservados |
| **ARQ-019** | Gate antes |
| **EIC** | CAP-07; G-EIC-D antes de IMP-062 |

---

## 11. Estratégia de rollback

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Núcleo omite chamada a C-REF / ignora resultado | Path IMP-061 imediato (I-BASE) — **preferido** |
| **L2** | Flag de activação no IMP | Desligar = L1 |
| **L3** | Revert IMP-062 | Remove C-REF; sem migração (sem persistência nova) |
| **L4** | Activar se | Referentes errados sistemáticos; violação I-C3; regressão IMP-057/061 |

---

## 12. Critérios arquitecturais (Gate desta ARQ)

A ARQ-023 considera-se **pronta para IMP-062** quando o patrocinador/CTO confirmar:

1. Visão auxiliar §1 e divisão Resolvedor ≠ Classificador.  
2. Integração §4 (Gate antes; I-ONE; I-C3).  
3. Estruturas §5 e janela 4/200/800.  
4. Estratégia P1–P4 e ambiguidades §7–§8.  
5. Invariantes §9 e rollback §11.  
6. REQ-062 como norma de CA/NA.

---

## 13. Fora do escopo arquitectural

* Segundo classificador de intenção.  
* LLM/ML de coreference no limiar.  
* Store persistente de foco / topic shift completo.  
* Alargar janela >4/200/800.  
* Redesign Motor, Gate, NCS, Fila.  
* Reescrita agressiva com verbos E2.1 novos.

---

## 14. Ordem sugerida de implementação (informativa → IMP-062)

```text
E1 — Contrato ReferenteResolvido + resolverReferencias (puro) + testes unidade
E2 — Prioridades P1–P4 + ambiguidade + perguntaCurta
E3 — Integração Núcleo (pós-Gate; lastro C2; skip em Continuidade)
E4 — Regressão IMP-057/061 + CT-R01…12 REQ-062 + anti-C3 + Gate
E5 — Docs / evidências / VAL
```

---

## Referências

| Documento | Relação |
|-----------|---------|
| ANL-007 | Análise |
| REQ-062 | Requisitos CA/NA |
| ARQ-018 | Classificador |
| ARQ-022 / IMP-061 | Janela e rota |
| docs/EIC/ | Disciplina CAP-07 |

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação — arquitectura REQ-062 | Em análise; pronta para IMP-062 |

---

**Estado:** Arquitectura elaborada — pronta para revisão/homologação e abertura da **IMP-062**.  
**Sem implementação de código, prompts ou comportamento neste acto.**

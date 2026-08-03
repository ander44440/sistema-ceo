# ARQ-026 — Validador de Contexto Ativo (VCA)

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-026.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; ADR-015; ADR-006; **ARQ-018** (Classificador — vigente); **ARQ-022** / IMP-061; **ARQ-023** / IMP-062; **ARQ-024** / IMP-063; **ARQ-025** / IMP-064; **REQ-065**; ARQ-019 / REQ-058 (Gate — **não alterado**); ARQ-017 (Motor — **não alterado**); ARQ-014 (NCS — **não alterado**); EIC.  
> Base analítica: **ANL-010**.  
> **Finalidade:** arquitectura do **Validador de Contexto Ativo** — módulo **auxiliar** **pré-cadeia** que decide se a mensagem **herda** o lastro conversacional CSC; **apenas** `pertence` activa IMP-061→064; demais estados **preservam** stores **sem** lastro; **sem** alterar a arquitectura homologada do limiar C1–C4.  
> **Gate:** aguarda homologação. **Próximo artefacto:** homologação / VAL (IMP-065 implementada).  
> **Sem implementação** de código, prompts ou comportamento neste documento (a implementação vive em IMP-065).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada auxiliar que valida a **pertença** da mensagem ao contexto activo **antes** de histórico, tópicos, referentes e objectivo. |
| **Por que existe?** | IMP-061…064 melhoram continuidade **quando** a pertença é verdadeira; sem VCA, a pertença é assumida e gera falsas continuações (REQ-065; ANL-010). |
| **Para quem existe?** | Patrocinador (perguntas soltas / meta / C1 no meio do fio MG2); Núcleo; Classificador (inalterado na classe); cadeia CSC; CTO/Engenheiro. |
| **Como medir sucesso?** | (1) VCA auxiliar pós-Gate pré-CSC; (2) só `pertence` activa 061→064; (3) isolamento preserva stores sem lastro; (4) Classificador único decisor; (5) Gate/Motor/NCS/Jobs inalterados; (6) sem influência C3; (7) CA REQ-065. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **VCA** é um módulo **auxiliar**.  
O **Classificador** permanece o **único ponto de decisão de classe**.  
O VCA decide **pertença / isolamento**, **não** intenção C1–C4.

```text
Gate → VCA (esta) → [se pertence] IMP-061 → IMP-063 → IMP-062 → IMP-064 → Classificador → Motor
                  └ [senão] Classificador (sem lastro CSC) → destinos
```

| Módulo | Decide |
|--------|--------|
| Gate (ARQ-019) | Decisão de aprovação |
| **VCA (esta ARQ)** | **Pertença** ao contexto activo |
| IMP-061…064 | Continuidade (lastro) **só se** autorizada |
| Classificador (ARQ-018) | **Classe** C1–C4 |
| Motor | Execução C3 (inalterado) |

### 1.2 Fronteiras obrigatórias

| Fronteira | Significado arquitectural |
|-----------|---------------------------|
| **VCA ≠ Classe** | Veredicto de pertença ≠ `classe` / `permiteJob` |
| **VCA ≠ Gate** | Não resolve Gates; não altera léxico |
| **VCA ≠ Job** | Não cria Jobs |
| **Isolamento ≠ esquecimento** | Sem lastro neste turno; stores **preservados** |

### 1.3 O que permanece

| Peça | Estado |
|------|--------|
| C1–C4 + limiar 0,55 | **Preservado** |
| Um Classificador | **Preservado** |
| Gate | **Nenhuma alteração** |
| Motor | **Nenhuma alteração** |
| NCS | **Nenhuma alteração** |
| Jobs | **Nenhuma alteração** |
| Influência C3 | **Nenhuma** |
| Contratos IMP-061…064 | **Preservados** — só condicionados |

### 1.4 O que se acrescenta

1. Módulo puro `validarContextoAtivo`.  
2. Contrato `ResultadoVca` com `veredicto` + `autorizaLastroCsc`.  
3. Orquestração no Núcleo: **após Gate**, **antes** de 061→064.  
4. Ramo de isolamento: classificar sem injectar lastro CSC.  
5. Pergunta curta em `ambiguo_contexto`.

---

## 2. Relação com ARQ-018 e IMP-061…064

| Norma | Papel face a ARQ-026 |
|-------|----------------------|
| **ARQ-018** | Norma-mãe do Classificador; VCA **não** emenda classes/limiar |
| **ARQ-022 / IMP-061** | Janela montada/injectada **só** se `autorizaLastroCsc` |
| **ARQ-024 / IMP-063** | Gestor de tópicos **só** se autorizado; store lido pelo VCA (read-only) |
| **ARQ-023 / IMP-062** | Resolvedor **só** se autorizado |
| **ARQ-025 / IMP-064** | Gestor de objectivo **só** se autorizado; store lido pelo VCA (read-only) |

```text
ARQ-019  ←── Gate (antes)
ARQ-026  ←── VCA / pertença (esta)
ARQ-022…025 ←── CSC condicionada
ARQ-018  ←── único decisor de classe
ARQ-017  ←── Motor (depois, se C3)
```

---

## 3. Componentes envolvidos

| ID | Componente | Responsabilidade | Altera? |
|----|------------|------------------|---------|
| **C-UI** | Conversa / Centro | `historico[]` | Não |
| **C-GATE** | Continuidade Gate | Precedência; léxico | **Não** |
| **C-VCA** | **Validador de Contexto Ativo** | Veredicto + `autorizaLastroCsc` | Novo auxiliar |
| **C-PREP** | `seleccionarHistoricoRecente` | Janela 4/200/800 | Condicionado |
| **C-TOP** | Gestor Tópicos IMP-063 | Evento temático | Condicionado |
| **C-REF** | Resolvedor IMP-062 | Referente | Condicionado |
| **C-OBJ** | Gestor Objectivo IMP-064 | Outcome | Condicionado |
| **C-STORE-T/O** | Stores tópico/objectivo | Persistência de sessão | **Não mutados pelo VCA** |
| **C-CLS** | Classificador | Único decisor de classe | **Não** |
| **C-NUC** | `executiveEngine.executar` | Orquestra ramos | Passagem |
| **C-MOT / C-NCS / C-JOB** | Motor / NCS / Fila | — | **Não** |

---

## 4. Ponto de integração

### 4.1 Mapa da cadeia EIC (obrigatório)

```text
Gate
  ↓
VCA (ARQ-026)
  ↓
  ├─ [pertence] ─────────────────────────────────────────┐
  │     IMP-061 (histórico)                              │
  │       ↓                                              │
  │     IMP-063 (tópicos)                                │
  │       ↓                                              │
  │     IMP-062 (referentes)                             │
  │       ↓                                              │
  │     IMP-064 (objectivo)                              │
  │       ↓                                              │
  │     Classificador                                    │
  │       ↓                                              │
  │     Motor Executivo (se destino C3)                  │
  │                                                      │
  └─ [≠ pertence]                                        │
        Classificador (sem lastro CSC) ──────────────────┘
          ↓
        destinos (C1/C2/C4/…); Motor só se classe C3 do Classificador
```

### 4.2 Cadeia detalhada no Núcleo (V1)

```text
executar({ texto: M, historico: H })
  │
  ├─ [1] Continuidade Gate                         ← inalterado
  │       (decisão → fim; clarificação Gate → fim ou enriquecimento)
  │
  ├─ [2] resultadoVca = validarContextoAtivo({
  │        mensagem: M,
  │        historicoCandidato?: H,                 ← read-only
  │        topicoActivo?: storeT.obter().activo,   ← read-only
  │        objetivoActivo?: storeO.obter().activo, ← read-only
  │        frenteActiva?, coa?,
  │        gatePendente?: boolean                  ← read-only
  │      })
  │
  ├─ [3] se ambiguo_contexto → pergunta curta; return
  │       (stores intactos; motorAcionado false)
  │
  ├─ [4] se autorizaLastroCsc === true  (somente pertence)
  │       historicoRecente = C-PREP(H, M)          ← IMP-061
  │       gestorTopicos …                          ← IMP-063
  │       resolverReferencias …                    ← IMP-062
  │       gestorObjectivo …                        ← IMP-064
  │       contextoClassificacao += historico / obj
  │
  ├─ [5] senão (independente | conhecimento_geral | metaconversa | novo_contexto)
  │       NÃO chamar C-PREP injectável / NÃO orientar 062–064
  │       NÃO mutar stores
  │       contextoClassificacao = { frenteActiva? } sem historicoRecente
  │
  ├─ [6] classificacao = primeiroPassoClassificar(...)  ← ÚNICO decisor
  │
  └─ [7] destinos + lastro só do que foi autorizado neste turno
```

**Integração:** **imediatamente após** o Gate e **antes** da cadeia IMP-061 → IMP-064.

### 4.3 O que o VCA não faz

* Não escreve `classe`, `destino`, `permiteJob`.  
* Não publica Jobs; não chama Motor/NCS/SDK.  
* Não altera léxico/store do Gate.  
* Não apaga `topicoActivo` / `objetivoActivo` / pausas.  
* Não substitui o Classificador.

---

## 5. Modelo e estados do VCA

### 5.1 Resultado (puro)

```text
VeredictoVca =
  | "pertence"
  | "independente"
  | "conhecimento_geral"
  | "metaconversa"
  | "novo_contexto"
  | "ambiguo_contexto"

ResultadoVca = {
  veredicto: VeredictoVca
  autorizaLastroCsc: boolean     // true ⟺ veredicto === "pertence"
  perguntaCurta?: string         // se ambiguo_contexto
  clarificacaoGateIsolamento?: string  // opcional se gatePendente && isolamento
  razaoContexto: string          // sem secrets
}
```

**Invariante:** `autorizaLastroCsc === (veredicto === "pertence")`.

### 5.2 Tabela de estados

| Estado | Activa IMP-061→064? | Stores | Classificador |
|--------|---------------------|--------|---------------|
| **pertence** | **Sim** | Usados como lastro | Com `historicoRecente` / orientação CSC |
| **independente** | Não | Preservados; sem lastro | Sem lastro CSC |
| **conhecimento_geral** | Não | Preservados; sem lastro | Sem lastro CSC (path C1 limpo tipicamente) |
| **metaconversa** | Não | Preservados; sem lastro de projecto | Sem lastro CSC |
| **novo_contexto** | Não | Preservados (V1 sem limpeza) | Sem lastro do fio anterior |
| **ambiguo_contexto** | Não | Preservados | Não avança destino deliberativo; pergunta |

---

## 6. Regras de transição (DET V1)

### 6.1 Diagrama

```text
                    mensagem M
                         │
                         ▼
              ┌─────────────────────┐
              │  sinais DET / overlap│
              └──────────┬──────────┘
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   deixis/overlap    marcadores      overlap fraco
   forte c/ activo   C1/meta/novo    / dúvida
         │               │               │
         ▼               ▼               ▼
     pertence      conhecimento_geral   ambiguo_contexto
                   metaconversa
                   independente
                   novo_contexto
```

### 6.2 Tabela de regras (propostas; fechar no IMP)

| Prioridade | Condição | Veredicto |
|------------|----------|-----------|
| P1 | Deixis / «continua» / follow-up curto **e** existe tópico ou objectivo activo | `pertence` |
| P2 | Léxico meta-CEO (papel, decisões, Jobs como meta — alinhado E2.3) | `metaconversa` |
| P3 | Léxico conhecimento geral sem âncora do fio (alinhado E2.2 C1) | `conhecimento_geral` |
| P4 | Marcador explícito de novo fio («mudando de assunto…», novo domínio sem overlap) | `novo_contexto` |
| P5 | Sem deixis, sem overlap de família/âncora com activo, pergunta autónoma | `independente` |
| P6 | Overlap fraco / dois candidatos sem margem | `ambiguo_contexto` |
| P7 | Overlap claro de âncora/família com `topicoActivo` ou `objetivoActivo` | `pertence` |

**Anti falsa continuação (REQ-065 RF18):** em dúvida fraca, preferir isolamento ou `ambiguo_contexto` — **não** assumir `pertence`.

### 6.3 Sinais de entrada (read-only)

* Mensagem actual.  
* Histórico candidato (não ainda a janela injectada).  
* `topicoActivo` / `pausas` (IMP-063 store).  
* `objetivoActivo` (IMP-064 store).  
* `frenteActiva` / COA.  
* `gatePendente` (boolean).

---

## 7. Tratamento de ambiguidades

| Caso | Resposta arquitectural |
|------|------------------------|
| Pertença duvidosa | `ambiguo_contexto` + pergunta («Isto continua o outdoor ou é um assunto novo?») |
| Gate pendente + isolamento | Clarificação combinada opcional — Gate **não** auto-resolvido |
| Cascata VCA + tópico + referente | **Uma** pergunta: Gate > `ambiguo_contexto` > objectivo > tópico > referente |

Ambiguidade **não** cria Job, **não** força C3, **não** apaga stores.

---

## 8. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-AUX** | VCA = módulo **auxiliar** |
| **I-ORD** | Executa **após** Gate e **antes** de IMP-061→064 |
| **I-ONLY** | **Apenas** `pertence` ⇒ `autorizaLastroCsc = true` |
| **I-STORE** | Estados ≠ pertence: stores **preservados**, **sem** lastro |
| **I-ONE** | Classificador = **único** decisor de classe |
| **I-GATE** | **Nenhuma alteração** no Gate |
| **I-MOT** | **Nenhuma alteração** no Motor |
| **I-NCS** | **Nenhuma alteração** no NCS |
| **I-JOB** | **Nenhuma alteração** em Jobs; VCA não cria Jobs |
| **I-C3** | **Nenhuma influência** em C3 / `permiteJob` |
| **I-BASE** | `pertence` ⇒ path 061…064 actual |
| **I-NOREV** | IMP-061…064 **não** revogados — só condicionados |

---

## 9. Compatibilidade

| Artefacto | Compatibilidade |
|-----------|-----------------|
| **REQ-065** | Realização arquitectural |
| **ANL-010** | Alt. C |
| **ARQ-018** | Complemento; não substitui |
| **ARQ-022…025 / IMP-061…064** | Condicionados; contratos internos intactos |
| **ARQ-019 / 017 / 014** | Gate / Motor / NCS intactos |
| **EIC** | CAP-07; fundação pré-cadeia; G-EIC-D antes de IMP-065 |

---

## 10. Estratégia de rollback

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Omitir VCA / forçar `pertence` | Path IMP-061…064 imediato — **preferido** |
| **L2** | Flag `VCA_ATIVO` | Desligar = L1 |
| **L3** | Revert IMP-065 | Remove módulo |
| **L4** | Activar se | Falso isolamento; lastro fora de `pertence`; violação I-C3/I-GATE; regressão 057/061…064 |

---

## 11. Mapa de integração da EIC (resumo)

```text
┌─────────────────────────────────────────────────────────────┐
│                    LIMIAR CONVERSACIONAL                     │
│                                                             │
│  [1] Gate (ARQ-019)     decisão humana de aprovação         │
│           │                                                 │
│  [2] VCA (ARQ-026)      pertença?  ←── NOVO                 │
│           │                                                 │
│           ├─ pertence ──► CSC:                              │
│           │     061 Histórico (rota C1↔C2)                  │
│           │     063 Tópicos (fio)                           │
│           │     062 Referentes (deixis)                     │
│           │     064 Objectivo (outcome)                     │
│           │                                                 │
│           └─ isolamento ► sem lastro CSC (stores vivos)     │
│                                                             │
│  [3] Classificador (ARQ-018)   único decisor C1–C4          │
│           │                                                 │
│  [4] Destinos → Motor (C3) / MRE (C2) / leve (C1) / C4      │
└─────────────────────────────────────────────────────────────┘
```

Papel EIC: VCA é **fundação de qualidade do lastro**; 061–064 são **melhorias de continuidade condicionadas**.

---

## 12. Critérios arquitecturais (Gate desta ARQ)

Pronta para **IMP-065** quando confirmados:

1. Visão auxiliar e divisão VCA / Classificador / CSC.  
2. Integração §4 (após Gate, antes 061→064).  
3. Estados §5 e regra «só pertence activa CSC».  
4. Ambiguidades §7 e invariantes §8.  
5. Rollback §10 e mapa EIC §11.  
6. REQ-065 como CA/NA.

---

## 13. Fora do escopo

* LLM/embeddings no limiar.  
* Reset automático de stores.  
* Novas classes C1–C4; alterar limiar 0,55.  
* Redesign Gate/Motor/NCS/Fila.  
* Revogar IMP-061…064.

---

## 14. Ordem sugerida IMP-065 (informativa)

```text
E1 — Contrato ResultadoVca + autorizaLastroCsc
E2 — validarContextoAtivo puro (estados + testes CT-V)
E3 — Integração Núcleo (pós-Gate; ramo pertence vs isolamento)
E4 — Anti-C3; stores preservados; regressão 057/061/062/063/064 + Continuidade
E5 — Docs / VAL
```

---

## Referências

| Documento | Relação |
|-----------|---------|
| ANL-010 / REQ-065 | Análise / requisitos |
| ARQ-018 / 022 / 023 / 024 / 025 | Cadeia EIC |
| IMP-061 / 062 / 063 / 064 | Runtime a condicionar |
| ARQ-019 / 017 / 014 | Gate / Motor / NCS |

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação — arquitectura REQ-065 | Em análise; pronta para IMP-065 |

---

**Estado:** Arquitectura elaborada — **IMP-065** implementada; pronta para revisão/homologação.  
**Sem implementação de código neste artefacto ARQ.**

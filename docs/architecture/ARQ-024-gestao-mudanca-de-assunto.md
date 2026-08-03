# ARQ-024 — Gestão de Mudança de Assunto

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-024.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; ADR-015; ADR-006; **ARQ-018** (Classificador — vigente); **ARQ-022** / IMP-061 (janela); **ARQ-023** / IMP-062 (referentes); **REQ-063**; ARQ-019 / REQ-058 (Gate — **não alterado**); ARQ-017; ARQ-014 (NCS); EIC.  
> Base analítica: **ANL-008**.  
> **Finalidade:** arquitectura do **Gestor de Tópicos** — módulo **auxiliar** que detecta continuação, mudança de assunto, retomada e ambiguidade temática, com **1 tópico activo** e **até 2 em pausa**, **sem** alterar a arquitectura homologada do limiar C1–C4.  
> **Gate:** aguarda homologação. **Próximo artefacto:** homologação / VAL (IMP-063 implementada).  
> **Sem implementação** de código, prompts ou comportamento neste documento (a implementação vive em IMP-063).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada auxiliar que gere o **fio temático** da sessão (activo / pausas / eventos de shift) usando a janela IMP-061 e coordenando-se com o Resolvedor IMP-062. |
| **Por que existe?** | 061 resolve rota; 062 resolve referente do deixis; falta modelar **mudança / retoma de assunto** (REQ-063; ANL-008). |
| **Para quem existe?** | Patrocinador (vários focos MG2); Núcleo; Classificador (inalterado na classe); Resolvedor; destinos C2; CTO/Engenheiro. |
| **Como medir sucesso?** | (1) Gestor auxiliar; (2) ≤1 activo e ≤2 pausas; (3) eventos continuar/shift/retomar/ambiguo; (4) Classificador único decisor; (5) Gate/Motor/NCS/Jobs inalterados; (6) sem influência C3; (7) CA REQ-063. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **Gestor de Tópicos** é um módulo **auxiliar**.  
O **Classificador** permanece o **único ponto de decisão de classe**.

```text
IMP-061          ARQ-024 (auxiliar)         ARQ-023 / IMP-062         ARQ-018
────────         ──────────────────         ─────────────────         ───────
janela 4     →   evento temático        →   referente (deixis)    →   classe
                 + topicoActivo/pausas      (+ orientação de foco)
```

| Módulo | Decide |
|--------|--------|
| Classificador | **Classe** C1–C4 |
| Resolvedor (ARQ-023) | **Referente** do deixis do turno |
| Gestor de Tópicos (esta ARQ) | **Fio temático**: continuar / shift / retomar / ambíguo / neutro |

### 1.2 O que permanece

| Peça | Estado |
|------|--------|
| C1–C4 + limiar 0,55 | **Preservado** |
| Um Classificador | **Preservado** |
| Gate (ARQ-019) | **Nenhuma alteração** de contrato; precedência intacta |
| Motor | **Nenhuma alteração** |
| NCS | **Nenhuma alteração** |
| Jobs | **Nenhuma alteração**; gestor não cria Jobs |
| Influência C3 | **Nenhuma** |
| Janela 4/200/800 | **Reutilizar** IMP-061 |

### 1.3 O que se acrescenta

1. Módulo puro `gestorTopicos` (decisão de evento).  
2. Store de sessão injectável: `topicoActivo` + `pausas[≤2]`.  
3. Integração no Núcleo **após** a janela IMP-061 e **em conjunto** com o Resolvedor IMP-062 (ordem §4).  
4. Pergunta curta / clarificação combinada Gate×shift (prosa), sem efeitos de Job.

---

## 2. Relação com ARQ-018 / 022 / 023

| Norma | Papel |
|-------|--------|
| **ARQ-018** | Norma-mãe do Classificador; §4.4 (reclassificar do zero) aplica-se à **classe**, não impede estado temático auxiliar |
| **ARQ-022 / IMP-061** | Fornece `historicoRecente`; gestor **não** cria outra janela |
| **ARQ-023 / IMP-062** | Consome/orienta foco; ambiguidade de referente ≠ ambiguidade de tópico (prioridade §8) |

```text
ARQ-018  ←── único decisor de classe
ARQ-022  ←── janela + rota C1↔C2
ARQ-023  ←── referente do deixis
ARQ-024  ←── fio temático (esta)
```

---

## 3. Componentes envolvidos

| ID | Componente | Responsabilidade | Altera? |
|----|------------|------------------|---------|
| **C-UI** | Conversa / Centro | `historico[]` | Não |
| **C-GATE** | Continuidade Gate | Precedência; léxico decisão | **Não** (contrato) |
| **C-PREP** | `seleccionarHistoricoRecente` | Janela 4/200/800 | Não |
| **C-TOP** | **Gestor de Tópicos** (novo) | Evento + proposta de estado | Novo auxiliar |
| **C-STORE** | Store de sessão de tópicos | Persistir activo/pausas no processo | Novo (sessão) |
| **C-REF** | Resolvedor IMP-062 | Referente; pode receber `topicoActivo` | Só entrada opcional |
| **C-CLS** | Classificador | Único decisor de classe | **Não** |
| **C-NUC** | `executiveEngine.executar` | Orquestra cadeia | Passagem de lastro |
| **C-MOT / C-NCS / C-JOB** | Motor / NCS / Fila | — | **Não** |

---

## 4. Ponto de integração

### 4.1 Cadeia obrigatória (V1)

```text
executar({ texto: M, historico: H })
  │
  ├─ [1] Continuidade Gate                         ← inalterado
  │       (se interceptar → fim; C-TOP NÃO compete com léxico Gate)
  │
  ├─ [2] historicoRecente = C-PREP(H, M)           ← IMP-061
  │
  ├─ [3] estadoTop = C-STORE.obter()
  │      resultadoTop = C-TOP.gestorTopicos({
  │        mensagem: M,
  │        historicoRecente,
  │        topicoActivo: estadoTop.activo,
  │        pausas: estadoTop.pausas,
  │        frenteActiva?, coa?,
  │        gatePendente?: boolean                  ← read-only
  │      })
  │      C-STORE.aplicar(resultadoTop)             ← excepto se pergunta bloqueia commit
  │
  ├─ [4] resultadoRef = C-REF.resolverReferencias({
  │        ...,
  │        topicoActivoSugerido: resultadoTop.topicoActivo  ← orientação
  │      })
  │
  ├─ [5] classificacao = primeiroPassoClassificar(...)   ← ÚNICO decisor de classe
  │
  ├─ [6] Prioridade de clarificação (uma pergunta):
  │        Gate pendente+shift → clarificação combinada
  │        else ambiguo_topico → perguntaCurta tópico
  │        else ambiguo referente → perguntaCurta referente (IMP-062)
  │
  └─ [7] Destinos + lastro (tópico + referente) se não houver pergunta bloqueante
```

**Integração:** **após** a janela do IMP-061 e **em conjunto** com o Resolvedor do IMP-062 (passos [3]→[4]).

### 4.2 O que o Gestor não faz

* Não escreve `classe`, `destino` de intenção, `permiteJob`.  
* Não publica Jobs; não chama Motor/NCS/SDK.  
* Não altera o store nem o léxico do Gate.  
* Não abandona automaticamente o tópico activo nem o Gate.

---

## 5. Modelo de gestão de tópicos

### 5.1 Entidade `TopicoConversacional`

```text
TopicoConversacional = {
  id: string                    // estável na sessão (ex. hash da âncora)
  ancora: string                // texto curto auditável («outdoor», «pagamento»)
  familia?: string              // alinhado a famílias IMP-062 quando aplicável
  origem: "usuario" | "ceo" | "coa" | "sistema"
  actualizadoEm: string         // ISO
}
```

### 5.2 Estado de sessão

```text
EstadoTopicosSessao = {
  topicoActivo: TopicoConversacional | null    // 0..1
  pausas: TopicoConversacional[]               // length ≤ 2
}
```

### 5.3 Resultado do gestor (puro)

```text
EventoTopico =
  | "continuar"
  | "shift"
  | "retomar"
  | "ambiguo_topico"
  | "neutro"

ResultadoGestaoTopicos = {
  evento: EventoTopico
  topicoActivo: TopicoConversacional | null
  pausas: TopicoConversacional[]              // ≤2
  perguntaCurta?: string
  clarificacaoGateShift?: string              // se gatePendente && shift
  razaoTopico: string                         // sem secrets
  commitEstado: boolean                       // false se só pergunta sem transição
}
```

---

## 6. Estados do tópico

| Estado lógico | Significado |
|---------------|-------------|
| **Ausente** | `topicoActivo = null`, `pausas = []` — início / neutro prolongado |
| **Activo** | Um tópico em foco |
| **Em pausa** | Até 2 tópicos estacionados por `shift` (FIFO do mais antigo se exceder) |
| **Ambíguo (turno)** | Não é estado persistido; evento do turno até o utilizador esclarecer |

**Proibição:** transição para «abandonado» **automática** do activo (REQ-063 RF6).

---

## 7. Regras de transição

### 7.1 Diagrama (resumo)

```text
            ┌──────────────┐
            │   Ausente    │
            └──────┬───────┘
       âncora clara│
                   ▼
            ┌──────────────┐     shift (nova âncora)
            │    Activo    │────────────────────────┐
            └──────┬───────┘                        ▼
                   │ retomar / shift          ┌──────────┐
                   │◄─────────────────────────│  Pausa   │ (≤2)
                   │                          └──────────┘
                   │
            ambiguo_topico → pergunta (sem commit, ou commit diferido)
```

### 7.2 Tabela de transições V1

| Evento | Condição principal | Efeito no estado |
|--------|--------------------|------------------|
| **continuar** | Deixis/«continua» ou mesma família que `topicoActivo` | Activo inalterado; pausas inalteradas |
| **shift** | Marcador explícito **ou** âncora nova distinta com confiança ≥ limiar interno | Activo anterior → pausa (se distinto); novo → activo; pausas trim ≤2 (descarta mais antigo da pausa) |
| **retomar** | Marcador de retoma + âncora ∈ pausas (ou match família) | Esse tópico → activo; antigo activo → pausa |
| **ambiguo_topico** | ≥2 candidatos sem margem | `commitEstado = false`; `perguntaCurta`; estado actual **preservado** |
| **neutro** | Sem sinais temáticos | Estado inalterado |

### 7.3 Limiares internos (propostos; fechar no IMP)

| Parâmetro | Valor V1 | Nota |
|-----------|----------|------|
| `LIMIAR_SHIFT` | **0,65** | Independente de `LIMIAR_CONFIANCA` 0,55 |
| `MARGEM_TOPICO` | **0,12** | Abaixo → `ambiguo_topico` |
| Marcadores explícitos | Léxico DET | «agora sobre», «mudando de assunto», «voltando a/ao», «deixemos o…» |

### 7.4 Sinais de entrada (DET)

* Janela `historicoRecente` (IMP-061).  
* Estado actual (activo/pausas).  
* Léxico/famílias alinhados ao IMP-062 quando possível.  
* COA / frente (read-only) como candidato fraco.  
* `gatePendente` (boolean read-only) — **não** muta Gate.

---

## 8. Tratamento de ambiguidades

| Caso | Resposta arquitectural |
|------|------------------------|
| Dois tópicos sem marcador | `ambiguo_topico` + pergunta («Seguimos no outdoor ou passamos ao pagamento?») |
| Gate pendente + `shift` | `clarificacaoGateShift` («Há Gate pendente sobre X. Queres decidir o Gate ou tratar Y agora?») — Gate **não** auto-resolvido |
| Ambiguidade tópico + referente | **Uma** pergunta: Gate×shift > tópico > referente |
| Dúvida fraca shift vs continuar | Preferir **continuar** (anti falso-shift) |

Ambiguidade **não** cria Job, **não** força C3, **não** abandona o activo.

---

## 9. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-AUX** | Gestor = módulo **auxiliar** |
| **I-ONE** | Classificador = **único** decisor de classe |
| **I-WIN** | Integração **após** janela IMP-061 |
| **I-REF** | Em conjunto com Resolvedor IMP-062 (orientação de foco) |
| **I-ACT** | **≤1** tópico activo |
| **I-PAU** | **≤2** tópicos em pausa |
| **I-GATE** | **Nenhuma alteração** no Gate |
| **I-MOT** | **Nenhuma alteração** no Motor |
| **I-NCS** | **Nenhuma alteração** no NCS |
| **I-JOB** | **Nenhuma alteração** em Jobs; gestor não cria Jobs |
| **I-C3** | **Nenhuma influência** em C3 / `permiteJob` |
| **I-NOAUTO** | Sem abandono automático do activo |
| **I-BASE** | `neutro` / sem sinais ⇒ comportamento 061+062 |

---

## 10. Compatibilidade

| Artefacto | Compatibilidade |
|-----------|-----------------|
| **REQ-063** | Realização arquitectural |
| **ANL-008** | Alt. B |
| **ARQ-018 / 022 / 023** | Complemento; não substitui |
| **IMP-061 / 062** | Janela + resolvedor preservados |
| **ARQ-019** | Gate intacto |
| **EIC** | CAP-07; 3ª frente CSC; G-EIC-D antes de IMP-063 |

---

## 11. Estratégia de rollback

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Omitir C-TOP / store | Path IMP-061+062 imediato — **preferido** |
| **L2** | Flag IMP | Desligar = L1 |
| **L3** | Revert IMP-063 | Remove módulo; store sessão descartável |
| **L4** | Activar se | Falsos shifts; violação I-C3/I-GATE; regressão 057/061/062 |

---

## 12. Critérios arquitecturais (Gate desta ARQ)

Pronta para **IMP-063** quando confirmados:

1. Visão auxiliar e divisão Classificador / Resolvedor / Gestor.  
2. Integração §4 (após 061, com 062).  
3. Modelo §5–§7 (1 activo, ≤2 pausas, transições).  
4. Ambiguidades §8 e invariantes §9.  
5. Rollback §11.  
6. REQ-063 como CA/NA.

---

## 13. Fora do escopo

* LLM/embeddings no limiar.  
* DB multi-sessão.  
* >2 pausas; abandono auto de tópico/Gate.  
* Novas classes C1–C4.  
* Redesign Motor/Gate/NCS/Fila.

---

## 14. Ordem sugerida IMP-063 (informativa)

```text
E1 — Contrato TopicoConversacional + EstadoTopicosSessao + store sessão
E2 — gestorTopicos puro (eventos + transições + testes unidade)
E3 — Integração Núcleo (após 061 → gestor → 062 → classificar) + prioridade perguntas
E4 — Gate×shift clarificação; anti-C3; regressão 057/061/062 + Continuidade
E5 — Docs / VAL
```

---

## Referências

| Documento | Relação |
|-----------|---------|
| ANL-008 / REQ-063 | Análise / requisitos |
| ARQ-018 / 022 / 023 | Cadeia EIC CSC |
| IMP-061 / 062 | Runtime a preservar |
| ARQ-019 | Gate |

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação — arquitectura REQ-063 | Em análise; pronta para IMP-063 |

---

**Estado:** Arquitectura elaborada — pronta para revisão/homologação e abertura da **IMP-063**.  
**Sem implementação de código, prompts ou comportamento neste acto.**

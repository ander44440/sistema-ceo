# ARQ-025 — Objetivo Conversacional (Goal Tracking)

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-025.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; ADR-015; ADR-006; **ARQ-018** (Classificador — vigente); **ARQ-022** / IMP-061 (janela); **ARQ-023** / IMP-062 (referentes); **ARQ-024** / IMP-063 (tópicos); **REQ-064**; ARQ-019 / REQ-058 (Gate — **não alterado**); ARQ-017 (Motor — **não alterado**); ARQ-014 (NCS — **não alterado**); EIC.  
> Base analítica: **ANL-009**.  
> **Finalidade:** arquitectura do **Gestor de Objectivos Conversacionais** — módulo **auxiliar** que estabelece, continua, muda ou declara ambiguidade do **outcome** do fio, com **1 objectivo activo** e **1 objectivo anterior**, **sem** alterar a arquitectura homologada do limiar C1–C4.  
> **Gate:** aguarda homologação. **Próximo artefacto:** homologação / VAL (IMP-064 implementada).  
> **Sem implementação** de código, prompts ou comportamento neste documento (a implementação vive em IMP-064).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada auxiliar que gere o **objectivo conversacional** da sessão (activo / anterior / eventos de goal) usando a janela IMP-061 e coordenando-se com IMP-063 e IMP-062. |
| **Por que existe?** | 061 resolve rota; 062 resolve referente; 063 resolve tópico; falta modelar o **outcome multi-turno** (REQ-064; ANL-009). |
| **Para quem existe?** | Patrocinador (uso diário MG2 — «para onde vamos?»); Núcleo; Classificador (inalterado na classe); gestores 062/063; destinos C2; CTO/Engenheiro. |
| **Como medir sucesso?** | (1) Gestor auxiliar; (2) ≤1 activo e ≤1 anterior; (3) eventos estabelecer/continuar/mudar/ambíguo/neutro; (4) Objectivo ≠ Tópico ≠ Classe ≠ Job; (5) Classificador único decisor; (6) Gate/Motor/NCS/Jobs inalterados; (7) sem influência C3; (8) CA REQ-064. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **Gestor de Objectivos Conversacionais** é um módulo **auxiliar**.  
O **Classificador** permanece o **único ponto de decisão de classe**.

```text
IMP-061          IMP-063              IMP-062              ARQ-025 (auxiliar)     ARQ-018
────────         ───────              ───────              ─────────────────     ───────
janela 4     →   fio temático     →   referente        →   outcome / goal    →   classe
                 topicoActivo         (deixis)             objetivoActivo
```

| Módulo | Decide |
|--------|--------|
| Classificador (ARQ-018) | **Classe** C1–C4 |
| Resolvedor (ARQ-023 / IMP-062) | **Referente** do deixis |
| Gestor de Tópicos (ARQ-024 / IMP-063) | **Fio temático** |
| Gestor de Objectivos (esta ARQ) | **Outcome**: estabelecer / continuar / mudar / ambíguo / neutro |

### 1.2 Fronteiras obrigatórias

| Fronteira | Significado arquitectural |
|-----------|---------------------------|
| **Objectivo ≠ Tópico** | Outcome independente do assunto; shift 063 **não** apaga goal por omissão |
| **Objectivo ≠ Classe** | Gestor **não** escreve `classe` / destino de intenção |
| **Objectivo ≠ Job** | Gestor **não** cria Jobs nem define `permiteJob` |

### 1.3 O que permanece

| Peça | Estado |
|------|--------|
| C1–C4 + limiar 0,55 | **Preservado** |
| Um Classificador | **Preservado** |
| Gate (ARQ-019) | **Nenhuma alteração** |
| Motor (ARQ-017) | **Nenhuma alteração** |
| NCS (ARQ-014) | **Nenhuma alteração** |
| Jobs / Fila | **Nenhuma alteração**; gestor não cria Jobs |
| Influência C3 | **Nenhuma** |
| Janela 4/200/800 | **Reutilizar** IMP-061 |
| IMP-062 / IMP-063 | **Preservados**; não revogados |
| `objetivoReal` MRE / `intencaoDoDia` | **Não substituídos** (sinais read-only opcionais) |

### 1.4 O que se acrescenta

1. Módulo puro `gestorObjectivo` (decisão de evento).  
2. Store de sessão injectável: `objetivoActivo` + `objetivoAnterior` (≤1 cada).  
3. Integração no Núcleo **após** IMP-061, **após** IMP-063 e **após** IMP-062 (ordem §4).  
4. Pergunta curta / clarificação combinada Gate×objectivo (prosa), sem efeitos de Job.  
5. Lastro C2 (e opcional C1) com enunciado do objectivo activo — **sem** pontuação C3.

---

## 2. Relação com ARQ-018 / 022 / 023 / 024

| Norma | Papel face a ARQ-025 |
|-------|----------------------|
| **ARQ-018** | Norma-mãe do Classificador; esta ARQ **não** emenda classes, limiar nem decisão de intenção |
| **ARQ-022 / IMP-061** | Fornece `historicoRecente`; gestor **não** cria outra janela |
| **ARQ-023 / IMP-062** | Corre **antes** do gestor neste turno; pode **ler** `objetivoActivo` já commitado da sessão (orientação fraca); ambiguidade de referente ≠ ambiguidade de objectivo |
| **ARQ-024 / IMP-063** | Corre **antes** do gestor; fornece `topicoActivo` read-only; Objectivo ≠ Tópico |

```text
ARQ-018  ←── único decisor de classe
ARQ-022  ←── janela + rota C1↔C2
ARQ-024  ←── fio temático
ARQ-023  ←── referente do deixis
ARQ-025  ←── objectivo / outcome (esta)
```

---

## 3. Componentes envolvidos

| ID | Componente | Responsabilidade | Altera? |
|----|------------|------------------|---------|
| **C-UI** | Conversa / Centro | `historico[]` | Não |
| **C-GATE** | Continuidade Gate | Precedência; léxico decisão | **Não** |
| **C-PREP** | `seleccionarHistoricoRecente` | Janela 4/200/800 | Não |
| **C-TOP** | Gestor de Tópicos IMP-063 | Evento temático | Não (contrato) |
| **C-REF** | Resolvedor IMP-062 | Referente; pode ler `objetivoActivo` de sessão | Só entrada opcional |
| **C-OBJ** | **Gestor de Objectivos** (novo) | Evento + proposta de estado de goal | Novo auxiliar |
| **C-STORE-O** | Store de sessão de objectivos | Persistir activo/anterior no processo | Novo (sessão) |
| **C-CLS** | Classificador | Único decisor de classe | **Não** |
| **C-NUC** | `executiveEngine.executar` | Orquestra cadeia | Passagem de lastro |
| **C-MOT / C-NCS / C-JOB** | Motor / NCS / Fila | — | **Não** |

---

## 4. Ponto de integração

### 4.1 Cadeia obrigatória (V1)

Integração **após** Histórico (IMP-061), **após** Gestor de Tópicos (IMP-063) e **após** Resolvedor (IMP-062):

```text
executar({ texto: M, historico: H })
  │
  ├─ [1] Continuidade Gate                         ← inalterado
  │       (se interceptar decisão → fim;
  │        se clarificação + mudar/estabelecer goal → clarificação combinada
  │        sem alterar léxico/contrato do Gate)
  │
  ├─ [2] historicoRecente = C-PREP(H, M)           ← IMP-061
  │
  ├─ [3] gestorTopicos (IMP-063) + store tópicos   ← inalterado
  │
  ├─ [4] resolverReferencias (IMP-062)             ← inalterado
  │       pode receber objetivoActivo *já na sessão* (read-only)
  │
  ├─ [5] estadoObj = C-STORE-O.obter()
  │      resultadoObj = C-OBJ.gestorObjectivo({
  │        mensagem: M,
  │        historicoRecente,                       ← IMP-061
  │        objetivoActivo: estadoObj.activo,
  │        objetivoAnterior: estadoObj.anterior,
  │        topicoActivo: resultadoTop.topicoActivo,← IMP-063 read-only
  │        referente?: resultadoRef,               ← IMP-062 read-only opcional
  │        frenteActiva?, coa?,
  │        objetivoRealMre?: string,               ← read-only opcional
  │        gatePendente?: boolean                  ← read-only
  │      })
  │      C-STORE-O.aplicar(resultadoObj)           ← se commitEstado
  │
  ├─ [6] classificacao = primeiroPassoClassificar(...)  ← ÚNICO decisor de classe
  │
  ├─ [7] Prioridade de clarificação (uma pergunta):
  │        Gate×objectivo (ou Gate×shift já 063)
  │        > ambiguo_objetivo
  │        > ambiguo_topico
  │        > ambiguo referente
  │
  └─ [8] Destinos + lastro (objectivo + tópico + referente) se não houver pergunta bloqueante
```

### 4.2 O que o Gestor não faz

* Não escreve `classe`, `destino` de intenção, `permiteJob`.  
* Não publica Jobs; não chama Motor/NCS/SDK.  
* Não altera o store nem o léxico do Gate.  
* Não abandona automaticamente o objectivo activo nem o Gate.  
* Não funde estado com `topicoActivo` / `pausas` (só lê).  
* Não substitui `objetivoReal` do MRE nem `intencaoDoDia`.

---

## 5. Modelo de gestão de objectivos

### 5.1 Entidade `ObjectivoConversacional`

```text
ObjectivoConversacional = {
  id: string                         // estável na sessão
  enunciado: string                  // outcome curto auditável («priorizar outdoor»)
  ancora?: string                    // âncora léxica opcional (família IMP-062)
  topicoId?: string                  // referência opcional a topicoActivo.id (não ownership)
  origem: "usuario" | "ceo" | "coa" | "sistema" | "mre_sinal"
  actualizadoEm: string              // ISO
}
```

### 5.2 Estado de sessão

```text
EstadoObjectivoSessao = {
  objetivoActivo: ObjectivoConversacional | null     // 0..1
  objetivoAnterior: ObjectivoConversacional | null   // 0..1
}
```

### 5.3 Resultado do gestor (puro)

```text
EventoObjectivo =
  | "estabelecer"
  | "continuar"
  | "mudar"
  | "ambiguo_objetivo"
  | "neutro"

ResultadoGestaoObjectivo = {
  evento: EventoObjectivo
  objetivoActivo: ObjectivoConversacional | null
  objetivoAnterior: ObjectivoConversacional | null
  perguntaCurta?: string
  clarificacaoGateObjectivo?: string     // se gatePendente && (mudar|estabelecer novo)
  razaoObjectivo: string                 // sem secrets
  commitEstado: boolean                  // false se só pergunta sem transição
}
```

---

## 6. Estados do objectivo

| Estado lógico | Significado |
|---------------|-------------|
| **Ausente** | `objetivoActivo = null`, `objetivoAnterior = null` |
| **Activo** | Um outcome em foco na sessão |
| **Anterior** | Slot único do outcome deslocado por `mudar` |
| **Ambíguo (turno)** | Não é estado persistido; evento do turno até esclarecimento |

**Proibição:** abandono **automático** do activo (REQ-064 RF6).  
**Fora do V1:** inferência de «cumprido» sem acto explícito do utilizador.

---

## 7. Eventos de transição

### 7.1 Diagrama (resumo)

```text
            ┌──────────────┐
            │   Ausente    │
            └──────┬───────┘
     estabelecer   │
                   ▼
            ┌──────────────┐     mudar (novo enunciado)
            │    Activo    │────────────────────────┐
            └──────┬───────┘                        ▼
                   │ continuar              ┌──────────────┐
                   │◄───────────────────────│   Anterior   │ (≤1)
                   │                        └──────────────┘
                   │
            ambiguo_objetivo → pergunta (commitEstado = false)
            neutro → estado inalterado
```

### 7.2 Tabela de transições V1

| Evento | Condição principal | Efeito no estado |
|--------|--------------------|------------------|
| **estabelecer** | Marcador explícito de objectivo **e** `objetivoActivo = null` (ou primeiro enunciado claro) | Novo → activo; anterior inalterado (tipicamente null) |
| **continuar** | Deixis/«continua» **ou** mesma âncora/enunciado compatível com activo | Activo inalterado; anterior inalterado |
| **mudar** | Marcador explícito de mudança **ou** novo enunciado distinto com confiança ≥ limiar interno | Activo actual → `objetivoAnterior` (substitui slot); novo → activo |
| **ambiguo_objetivo** | ≥2 candidatos de outcome sem margem | `commitEstado = false`; `perguntaCurta`; estado **preservado** |
| **neutro** | Sem sinais de goal | Estado inalterado |

### 7.3 Limiares internos (propostos; fechar no IMP)

| Parâmetro | Valor V1 | Nota |
|-----------|----------|------|
| `LIMIAR_OBJECTIVO` | **0,65** | Independente de `LIMIAR_CONFIANCA` 0,55 |
| `MARGEM_OBJECTIVO` | **0,12** | Abaixo → `ambiguo_objetivo` |
| Marcadores estabelecer | Léxico DET | «o objectivo é», «quero alcançar», «o foco desta conversa é», «para que consigamos» |
| Marcadores mudar | Léxico DET | «agora o objectivo é», «mudando o objectivo», «em vez disso o objectivo» |
| Anti falso-mudar | Política | Sem marcador explícito ⇒ preferir `continuar` se activo existir |

### 7.4 Independência face ao tópico (IMP-063)

| Situação | Objectivo | Tópico |
|----------|-----------|--------|
| `shift` de tópico sem marcador de goal | **Preservar** activo | Actualiza conforme 063 |
| `mudar` objectivo com nova âncora | Actualiza goal | **Pode** sugerir shift na IMP (opcional); V1: **não** obrigar mutação de tópico |
| Mesmo tópico, novo outcome | `mudar` possível | Activo temático inalterado |

---

## 8. Tratamento de ambiguidades

| Caso | Resposta arquitectural |
|------|------------------------|
| Dois outcomes sem marcador | `ambiguo_objetivo` + pergunta («O objectivo é priorizar o outdoor ou decidir o pagamento?») |
| Gate pendente + `mudar`/`estabelecer` | `clarificacaoGateObjectivo` — Gate **não** auto-resolvido |
| Ambiguidade objectivo + tópico + referente | **Uma** pergunta: Gate×conflito > objectivo > tópico > referente |
| Dúvida fraca mudar vs continuar | Preferir **continuar** (anti falso-mudar) |
| Shift 063 sem sinal de goal | **Não** gerar `ambiguo_objetivo` só por shift |

Ambiguidade **não** cria Job, **não** força C3, **não** abandona o activo.

---

## 9. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-AUX** | Gestor = módulo **auxiliar** |
| **I-ONE** | Classificador = **único** decisor de classe |
| **I-ORD** | Integração **após** 061, **após** 063 e **após** 062 |
| **I-ACT** | **≤1** objectivo activo |
| **I-ANT** | **≤1** objectivo anterior |
| **I-TOP** | Objectivo **independente** de Tópico |
| **I-CLS** | Objectivo **independente** de Classe |
| **I-JOB** | Objectivo **independente** de Job; gestor não cria Jobs |
| **I-GATE** | **Nenhuma alteração** no Gate |
| **I-MOT** | **Nenhuma alteração** no Motor |
| **I-NCS** | **Nenhuma alteração** no NCS |
| **I-C3** | **Nenhuma influência** em C3 / `permiteJob` |
| **I-NOAUTO** | Sem abandono automático do activo |
| **I-BASE** | `neutro` / sem sinais ⇒ comportamento 061+062+063 |

---

## 10. Compatibilidade

| Artefacto | Compatibilidade |
|-----------|-----------------|
| **REQ-064** | Realização arquitectural |
| **ANL-009** | Alt. D |
| **ARQ-018 / 022 / 023 / 024** | Complemento; não substitui |
| **IMP-061 / 062 / 063** | Cadeia a preservar; ponto de encaixe §4 |
| **ARQ-019 / 017 / 014** | Gate / Motor / NCS intactos |
| **EIC** | CAP-07; 4ª frente CSC; G-EIC-D antes de IMP-064 |

---

## 11. Estratégia de rollback

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Omitir C-OBJ / store | Path IMP-061+062+063 imediato — **preferido** |
| **L2** | Flag IMP (`GESTOR_OBJECTIVO_ATIVO`) | Desligar = L1 |
| **L3** | Revert IMP-064 | Remove módulo; store sessão descartável |
| **L4** | Activar se | Falsas mudanças; colapso com tópico; violação I-C3/I-GATE; regressão 057/061/062/063 |

---

## 12. Critérios arquitecturais (Gate desta ARQ)

Pronta para **IMP-064** quando confirmados:

1. Visão auxiliar e divisão Classificador / Tópico / Referente / Objectivo.  
2. Integração §4 (após 061, 063 e 062).  
3. Modelo §5–§7 (1 activo, 1 anterior, eventos).  
4. Ambiguidades §8 e invariantes §9.  
5. Rollback §11.  
6. REQ-064 como CA/NA.

---

## 13. Fora do escopo

* LLM/embeddings no limiar.  
* DB multi-sessão; pilha profunda de objectivos.  
* Inferência de «cumprido» sem acto do utilizador.  
* Fundir com `intencaoDoDia` / substituir MRE `objetivoReal`.  
* Novas classes C1–C4; alterar limiar 0,55.  
* Redesign Motor/Gate/NCS/Fila.  
* Auto-despacho C3 «para cumprir o objectivo».

---

## 14. Ordem sugerida IMP-064 (informativa)

```text
E1 — Contrato ObjectivoConversacional + EstadoObjectivoSessao + store sessão
E2 — gestorObjectivo puro (eventos + transições + testes unidade CT-G)
E3 — Integração Núcleo (após 061→063→062 → gestor → classificar) + prioridade perguntas
E4 — Gate×objectivo; anti-C3; Objectivo≠Tópico; regressão 057/061/062/063 + Continuidade
E5 — Docs / VAL
```

---

## Referências

| Documento | Relação |
|-----------|---------|
| ANL-009 / REQ-064 | Análise / requisitos |
| ARQ-018 / 022 / 023 / 024 | Cadeia EIC CSC |
| IMP-061 / 062 / 063 | Runtime a preservar |
| ARQ-019 / 017 / 014 | Gate / Motor / NCS |

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação — arquitectura REQ-064 | Em análise; pronta para IMP-064 |

---

**Estado:** Arquitectura elaborada — pronta para revisão/homologação e abertura da **IMP-064**.  
**Sem implementação de código, prompts ou comportamento neste acto.**

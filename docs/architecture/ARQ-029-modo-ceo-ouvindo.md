# ARQ-029 — Arquitectura do Modo CEO Ouvindo

> **Status: Homologada** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-029.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; VIS-002 §3.5–3.6; ADR-006; ADR-015; **REQ-068** (homologada); ANL-012 (homologada); REQ-047; REQ-050; PX-001 E1; PX-002 E1; ARQ-017 (Motor — **não alterado**); ARQ-018 (Classificador — **não alterado**); ARQ-019 (Gate — **não alterado**); ARQ-022…028 / VCA / DIC / complexidade — **não alterados**; EIC — **não alterada**.  
> **Finalidade:** arquitectura técnica da camada de **entrada/saída por voz** («CEO Ouvindo») sobre o pipeline conversacional existente.  
> **Gate:** homologada. **IMP:** [`IMP-068-modo-ceo-ouvindo.md`](../implementation/IMP-068-modo-ceo-ouvindo.md).  
> **Nota IMP-068:** o MVP implementa **retorno automático a Ouvindo** após TTS (D3), em vez do Idle-por-gesto de §4.4.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do modo **CEO Ouvindo**: componentes, fluxo, estados, eventos, interfaces e falhas da camada de voz, desacoplada da EIC. |
| **Por que existe?** | REQ-068 / ANL-012: fechar o ciclo microfone → governação textual → áudio **sem** redesenhar Gate, Classificador, Motor ou DIC. |
| **Para quem existe?** | Patrocinador (uso oral diário); CTO (Gate); Engenheiro (IMP futura). |
| **Como medir sucesso?** | (1) EIC intacta; (2) voz = I/O textual; (3) componentes e interfaces definidos; (4) máquina de estados + eventos; (5) falhas visíveis; (6) desacoplamento demonstrável; (7) pronta para IMP **após** Gate. |

---

## 1. Visão arquitectural

### 1.1 Princípio

**CEO Ouvindo** é uma **camada de canal**.  
Não é Classificador, não é Motor, não é EIC, não é Speaker (áudio), não cria intenção «voz».

```text
Áudio (mic) ──STT──► Texto ──fronteira──► Pipeline EIC (inalterado) ──► Texto ──TTS──► Áudio (out)
```

### 1.2 Mapa de camadas

```text
┌──────────────────────────────────────────────────────────┐
│  UI Conversa (indicadores + gestos de voz)               │
└───────────────────────────┬──────────────────────────────┘
                            │ comandos / eventos UI
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Camada CEO Ouvindo (esta ARQ)                           │
│  Voice Controller · Voice State Manager                  │
│  Audio Device Manager · STT Adapter · TTS Adapter        │
└───────────────────────────┬──────────────────────────────┘
                            │ texto in / mensagem out
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Pipeline conversacional EIC (INALTERado)                │
│  Gate → VCA → [CSC] → Classificador → Complexidade       │
│  → [DIC se path meta] → Capacidade / Motor → Speaker*    │
│  * Speaker = prosa / guiãoVoz (REQ-050), nunca áudio     │
└──────────────────────────────────────────────────────────┘
```

### 1.3 Invariantes de garantia

| # | Garantia |
|---|----------|
| G1 | A **EIC permanece inalterada** (limiar, classes, VCA, CSC, DIC, complexidade). |
| G2 | Voz é **apenas** entrada/saída; o Núcleo só vê **texto**. |
| G3 | Componentes comunicam por **interfaces** (§6); sem acoplamento a internals do MRE/NCS. |
| G4 | **Ouvindo ⊕ Respondendo** — exclusão mútua no MVP (anti-feedback). |
| G5 | Interromper áudio **não** cancela Gate/Job já abertos pelo pipeline. |
| G6 | Opt-in / unlock de sessão (PX-002) obrigatórios antes de captura ou TTS automático. |
| G7 | Esta ARQ **não** autoriza código; IMP só após Gate. |

### 1.4 Harmonização com PX-002 / REQ-047 / REQ-050

| Artefacto | Papel nesta ARQ |
|-----------|-----------------|
| **PX-002** | Preferência (Desativada/Ativa), unlock de gesto, fila «Ouvir» — **pré-condições de sessão** consultadas pelo Voice Controller |
| **REQ-047** | Capacidades de síntese/stop consumidas via **TTS Adapter** (não reinventar motor) |
| **REQ-050** | Speaker continua a redigir; TTS Adapter consome `mensagem` / `textoVoz` |
| **Voice State Manager** | Fonte de verdade dos estados de **turno** REQ-068 (Idle…Erro); preferência PX-002 não duplica esses estados |

---

## 2. Componentes

| Componente | Responsabilidade | Explicitamente **não** faz |
|------------|------------------|----------------------------|
| **Voice Controller** | Orquestra o turno: gestos → estados → STT → Núcleo → TTS → reentrada; aplica G4–G6 | Classificar, deliberar, publicar Jobs, alterar DIC |
| **Speech-to-Text Adapter** | Contrato STT: start/stop reconhecimento; emite fala/silêncio/transcrição/erro | Interpretar intenção; chamar Núcleo |
| **Text-to-Speech Adapter** | Contrato TTS: speak/stop; emite início/fim/erro; usa Voice Engine (REQ-047) | Redigir comunicado; decidir governação |
| **Voice State Manager** | Estado canónico do modo; transições válidas; notificação à UI | Política de intenção; I/O de dispositivo |
| **Audio Device Manager** | Microfone: permissão, open/close, libertar dispositivo; (opcional) rota de saída | STT linguístico; TTS de conteúdo |

### 2.1 Diagrama de colaboração

```text
        UI
         │
         ▼
  Voice Controller ◄────► Voice State Manager
         │
         ├──► Audio Device Manager (mic)
         ├──► STT Adapter ──► texto
         ├──► executiveEngine.executar(texto)   ★ única fronteira EIC
         └──► TTS Adapter ◄── mensagem / textoVoz
```

---

## 3. Fluxo de execução

### 3.1 Fluxo canónico (REQ-068)

```text
Microfone
    │
    ▼
Audio Device Manager (captura autorizada)
    │
    ▼
STT Adapter
    │  texto
    ▼
Voice Controller
    │  executiveEngine.executar(texto)   ← mesmo contrato do path teclado
    ▼
Gate
    │
    ▼
Pipeline Conversacional (EIC)   ← VCA, CSC, Classificador, Complexidade, DIC…
    │
    ▼
Motor Executivo / Capacidade (conforme destino)
    │
    ▼
Resposta textual (+ textoVoz se deliberativo)
    │
    ▼
TTS Adapter (se sessão autorizar)
    │
    ▼
Áudio (saída)
```

### 3.2 Sequência de um turno feliz

1. Utilizador: gesto `iniciar_escuta` (preferência Ativa + unlock).  
2. Controller → State: **Ouvindo**; Device Manager abre mic; STT start.  
3. STT: `fala_detectada` / `silencio` → endpointing.  
4. STT: `transcricao_concluida(texto)` → State: **Processando**; mic/STT param (G4).  
5. Controller chama **o mesmo** `executiveEngine.executar(texto)` do path texto.  
6. Pipeline EIC corre sem conhecimento de «voz».  
7. Resposta chega → UI mostra texto; se TTS autorizado → State: **Respondendo**; TTS speak.  
8. `termino_fala_ceo` → política de reentrada §4.3 → **Idle** (MVP) ou novo ciclo.

### 3.3 O que não atravessa a fronteira

* Áudio bruto, buffers PCM, blobs de microfone.  
* Eventos internos STT/TTS para o Classificador.  
* Flags que alterem limiar, classe ou DIC.

---

## 4. Máquina de estados

### 4.1 Estados (RF10)

| Estado | Significado |
|--------|-------------|
| **Idle** | Modo elegível; sem captura nem TTS activos |
| **Ouvindo** | Mic + STT activos; à espera de turno de fala |
| **Processando** | Texto enviado; pipeline EIC em curso |
| **Respondendo** | TTS activo (ou warm-up autorizado); mic off |
| **Interrompido** | Cancelamento explícito de escuta ou fala; limpeza em curso |
| **Erro** | Falha de dispositivo/STT/TTS/permissão; mensagem visível |

### 4.2 Diagrama de transições

```text
                    iniciar_escuta
         Idle ─────────────────────► Ouvindo
          ▲                             │
          │                    silencio/endpoint
          │                    /enviar_turno
          │                             ▼
          │                        Processando
          │                             │
          │              resposta_pronta (+ TTS ok)
          │                             ▼
          │                        Respondendo
          │                             │
          │              termino_fala / skip_tts
          │                             │
          └─────────────────────────────┘
                (MVP: → Idle)

  Em Ouvindo:     parar_escuta → Interrompido → Idle
  Em Respondendo: stop_fala    → Interrompido → Idle
  Em qualquer*:   erro_voz     → Erro
  Em Erro:        recuperar    → Idle
  Em Processando: cancel_ui    → Interrompido → Idle
                  (pipeline já iniciado segue regras EIC; voz só limpa canal)

  * excepto Idle sem operação activa
```

### 4.3 Tabela de transições

| De | Evento | Para | Condições / efeitos |
|----|--------|------|---------------------|
| Idle | `iniciar_escuta` | Ouvindo | Preferência Ativa + unlock + permissão mic |
| Ouvindo | `fala_detectada` | Ouvindo | UI opcional |
| Ouvindo | `silencio` (endpoint) / política envio | Processando | STT finaliza; mic off; texto → Núcleo |
| Ouvindo | `parar_escuta` | Interrompido → Idle | **Não** envia texto por omissão |
| Processando | `resposta_pronta` + TTS autorizado | Respondendo | Texto já no ecrã |
| Processando | `resposta_pronta` + TTS não autorizado | Idle | Só texto (fila «Ouvir» PX-002 se aplicável) |
| Respondendo | `termino_fala_ceo` | **Idle** | MVP CU8 — ver §4.4 |
| Respondendo | `interrupcao_utilizador` | Interrompido → Idle | `stop` TTS |
| * | `erro_voz` | Erro | Mensagem curta |
| Erro | `recuperar_de_erro` | Idle | Gesto retry |
| Processando | `interrupcao_utilizador` | Interrompido → Idle | Não aborta Gate/Job já criados |

### 4.4 Política de reentrada (CU8) — MVP

**Decisão arquitectural MVP:** após `termino_fala_ceo` ou skip de TTS → **Idle**.  
Novo **Ouvindo** exige novo `iniciar_escuta` (gesto).

| Motivo | Benefício |
|--------|-----------|
| Anti-feedback | Evita reabrir mic sobre cauda acústica |
| Alinhamento PX-002 | Gesto/unlock explícito |
| Clareza de turno | Utilizador controla o próximo ciclo |

**Evolução (fora desta ARQ / REQ-068 §8):** auto-transição Respondendo → Ouvindo após *cooldown*; barge-in; conversa contínua.

### 4.5 Exclusões

* **Ouvindo** e **Respondendo** nunca simultâneos.  
* Preferência Desativada → transições para Ouvindo/Respondendo automático **rejeitadas** (permanece Idle ou Erro informativo).

---

## 5. Eventos

| Evento | Emissor | Consumidor | Efeito |
|--------|---------|------------|--------|
| `iniciar_escuta` | UI | Controller | Idle → Ouvindo |
| `parar_escuta` | UI | Controller | Cancela STT sem envio |
| `fala_detectada` | STT Adapter | Controller / UI | Feedback em Ouvindo |
| `silencio` | STT Adapter | Controller | Endpointing / fecho de turno |
| `transcricao_parcial` | STT Adapter | UI (opcional) | Pré-visualização |
| `transcricao_concluida` | STT Adapter | Controller | Texto final → Processando |
| `processamento_iniciado` | Controller | State / UI | Confirma Processando |
| `resposta_pronta` | Controller (após Núcleo) | State / TTS | Texto + decisão TTS |
| `inicio_fala_ceo` | TTS Adapter | State / UI | Respondendo activo |
| `termino_fala_ceo` | TTS Adapter | Controller | → Idle (MVP) |
| `interrupcao_utilizador` | UI | Controller | stop STT/TTS → Interrompido |
| `erro_voz` | Device / STT / TTS | Controller | → Erro |
| `recuperar_de_erro` | UI | Controller | Erro → Idle |
| `preferencia_voz_alterada` | Sessão PX-002 | Controller | Pode forçar Idle |

**Não-eventos da camada de voz:** aprovação Gate, veredicto VCA, publicação Job, injecção DIC — permanecem no domínio EIC/Motor.

---

## 6. Interfaces entre componentes

Contratos **lógicos** (sem assinaturas de código nesta ARQ).

### 6.1 Voice Controller ↔ Voice State Manager

| Operação | Direcção | Contrato |
|----------|----------|----------|
| `obterEstado()` | Ctrl → SM | Estado actual |
| `transitar(evento, contexto?)` | Ctrl → SM | Aceita/rejeita transição; emite mudança |
| `onMudancaEstado(cb)` | SM → UI/Ctrl | Notificação |

### 6.2 Voice Controller ↔ Audio Device Manager

| Operação | Contrato |
|----------|----------|
| `garantirPermissaoMic()` | ok \| negado \| erro |
| `abrirCaptura()` / `fecharCaptura()` | Recurso mic |
| `estaCapturando()` | boolean |

### 6.3 Voice Controller ↔ STT Adapter

| Operação / evento | Contrato |
|-------------------|----------|
| `iniciarReconhecimento()` / `pararReconhecimento()` | Controlo |
| `onFala` / `onSilencio` / `onParcial` / `onFinal(texto)` / `onErro` | Eventos |

### 6.4 Voice Controller ↔ Pipeline EIC (fronteira crítica)

| Operação | Contrato |
|----------|----------|
| `executarInstrucao(texto, contextoSessao?)` | **Idêntico** ao envio por teclado (`executiveEngine.executar` ou fachada UI já usada) |
| Retorno | Resposta executiva existente (`mensagem`, metadados, `textoVoz` se houver) |

**Proibido na interface:** passar stream de áudio; passar `classeForcada`; mutar opções de Classificador/DIC.

### 6.5 Voice Controller ↔ TTS Adapter

| Operação / evento | Contrato |
|-------------------|----------|
| `speak(texto)` / `stop()` | Controlo (REQ-047 por baixo) |
| `onInicio` / `onFim` / `onErro` | Eventos |
| Pré-condição | Sessão unlocked + preferência Ativa (ou fila «Ouvir» com gesto) |

### 6.6 UI ↔ Voice Controller

| Comando UI | Evento interno |
|------------|----------------|
| Botão escutar / hold | `iniciar_escuta` |
| Parar / cancelar | `parar_escuta` ou `interrupcao_utilizador` |
| Retry erro | `recuperar_de_erro` |
| Indicadores | leem State Manager |

---

## 7. Tratamento de falhas

| Falha | Detecção | Estado | Comportamento |
|-------|----------|--------|---------------|
| Permissão mic negada | Device Manager | Erro | Mensagem; sem captura; path texto intacto |
| Mic indisponível / em uso | Device Manager | Erro | Mensagem; libertar se parcial |
| STT indisponível (browser) | STT Adapter | Erro | Mensagem; sugerir teclado |
| STT timeout / vazio | STT Adapter | Idle ou Erro suave | Não chamar Núcleo com string vazia |
| Falha rede / LLM no pipeline | Resposta Núcleo | Processando → Idle | Erro **do pipeline** (já existente); camada voz não mascara |
| TTS `onerror` / autoplay | TTS Adapter | Erro ou Idle + fila «Ouvir» | Texto permanece; nunca engolir erro (PX-001) |
| Interrupção durante Processando | UI | Interrompido → Idle | Canal limpo; Gate/Job seguem regras EIC |
| Interrupção durante Respondendo | UI | Interrompido → Idle | `stop` TTS imediato |
| Estado ilegal | State Manager rejeita | permanece | Log/telemetria; UI não força atalho |

**Princípio:** falha de voz **não** altera contratos de governação; no máximo omite áudio.

---

## 8. Estratégia de desacoplamento

### 8.1 Fronteiras

| Fronteira | Mecanismo |
|-----------|-----------|
| Voz ↔ EIC | **Só texto** via interface §6.4 |
| STT ↔ Controller | Adapter substituível (Web Speech hoje; outro depois) |
| TTS ↔ Controller | Adapter sobre REQ-047 |
| Preferência sessão ↔ turno | PX-002 consulta; State Manager não embute storage |
| Speaker ↔ TTS | Speaker produz string; Adapter sintetiza |

### 8.2 Regras de desacoplamento

1. **Nenhum** módulo STT/TTS importa Classificador, VCA, DIC ou Motor.  
2. **Nenhum** módulo EIC importa Voice Controller (a UI/orquestração de canal chama ambos).  
3. Adapters isolam APIs de browser/fornecedor; Controller só conhece eventos §5.  
4. Testes da IMP futura: mock de §6.4 prova que a EIC não muda; mock de STT/TTS prova o modo.  
5. Feature flag / preferência Desativada = camada voz inerte; pipeline texto 100% operacional.

### 8.3 Demonstração de conformidade REQ-068

| Exigência | Como esta ARQ cumpre |
|-----------|----------------------|
| EIC inalterada | G1; §3; §6.4; §8.2 |
| Voz = I/O | §1.1; fluxo §3 |
| Interfaces definidas | §6 |
| Estados + transições | §4 |
| Eventos | §5 |
| Falhas visíveis | §7 |
| Sem IMP nesta etapa | Cabeçalho; §9 |

---

## 9. Fora do escopo desta ARQ

* Código, prompts, runtime, commits.  
* **IMP** (aguarda Gate desta ARQ).  
* Barge-in, wake word, streaming, conversa contínua, TTS servidor (REQ-068 §8).  
* Alteração de ARQ-017…028, limiar, NCS, Painel.  
* Unificação física de ficheiros `experienciaVoz/` — decisão de empacotamento na IMP, desde que respeite §8.

---

## 10. Critérios de prontidão para IMP

1. Gate desta ARQ homologado.  
2. IMP cobre CU1–CU8 e RF/CA da REQ-068 sem tocar no limiar EIC.  
3. Testes de regressão Classificador / VCA / Continuidade / DIC / Motor previstos.  
4. Rollback: preferência Desativada ou flag que desliga Controller (path texto só).

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma | REQ-068; ANL-012; CON-001 Art. 9º; ADR-015; ADR-006 |
| Peças preservadas | ARQ-017, 018, 019, 022–028; REQ-047, 050; PX-002 |
| Implementação | *(IMP — não nesta entrega)* |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | ARQ completa — visão, componentes, fluxo, estados, eventos, interfaces, falhas, desacoplamento | Em análise — aguarda homologação |

---

**Estado:** Em análise. **Sem código. Sem IMP.**  
**Próximo passo:** Homologação → IMP do Modo CEO Ouvindo.

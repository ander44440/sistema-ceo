# ANL-012 — Arquitectura do Modo «CEO Ouvindo»

> **Status:** Homologada / frente **ENCERRADA** (ENC-006).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 (Comunicação) — interface conversacional; eixo EIC (entrada/saída por voz).  
> **Nome da capacidade:** **CEO Ouvindo** (REQ-068).  
> **Normas consultadas (somente leitura):** CON-001; VIS-001; VIS-002; VIS-003; ADR-006; ADR-015; ADR-019; ARQ-016; ARQ-017; ARQ-018; ARQ-019; ARQ-026; ARQ-027; ARQ-028; REQ-046; REQ-047; REQ-050; REQ-057; REQ-061–068; IMP-057…IMP-068; PX-001 E1; PX-002 E1; PX-003; `docs/EIC/`; runtime `experienciaVoz/` (baseline TTS).  
> **Origem:** Comando do patrocinador — base arquitectural da frente de voz.  
> **Cadeia:** **esta ANL** → REQ-068 → ARQ-029 → IMP-068 → **VAL-010** → ENC-006.  
> **Efeito:** Não altera código por si; ciclo da frente encerrado em ENC-006.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise arquitectural do modo de interação por voz do Sistema CEO («CEO Ouvindo»), em que a voz é a **interface principal** de entrada e saída, sem alterar o pipeline conversacional interno. |
| **Por que existe?** | A EIC (Gate, VCA, Histórico, Referências, Objetivo, Classificador, Motor, DIC, complexidade) já governa o diálogo por texto. Falta formalizar a arquitectura da **camada de voz bidireccional** (ouvir + falar) como interface, sem redesenhar a governação. |
| **Para quem existe?** | Patrocinador (uso diário mãos-livres / MG2); CTO (Gate → REQ/ARQ futuros); Engenheiro (IMP futura). |
| **Como medir sucesso desta ANL?** | (1) Objectivo e relação com a EIC claros; (2) fluxo de alto nível; (3) estados e responsabilidades; (4) mapa de eventos; (5) prova de não-invasão do pipeline; (6) componentes candidatos; (7) riscos; (8) evoluções futuras **fora** do MVP; (9) zero código nesta etapa. |

---

## 1. Objectivo da capacidade

### 1.1 Problema resolvido

Hoje o CEO conversa de forma governada **por texto**. Já existem peças de voz:

| Peça | Papel actual | Lacuna face a «CEO Ouvindo» |
|------|--------------|-----------------------------|
| **REQ-046** Onboarding por voz | STT+TTS no *onboarding* | Não é o path principal da Conversa executiva |
| **REQ-047** Voice Engine | Síntese / stop / isSpeaking | Motor de áudio, sem política de modo «ouvindo» na Conversa |
| **REQ-050** Speaker | Texto / guiãoVoz | Não produz áudio |
| **PX-001 / PX-002** | Diagnóstico + experiência TTS | STT na Conversa marcado como **fase 2**; foco em *falar* |
| **`experienciaVoz/`** | Preferência, unlock, TTS, botão | Estado `Ouvindo` previsto; **não** fecha o ciclo fala→pipeline→resposta→TTS como modo principal |

O problema: o utilizador ainda **não** pode tratar a Conversa do CEO como posto de comando **falado** de ponta a ponta — microfone → mesma governação → resposta ouvida — sem digitar.

### 1.2 Benefícios para a experiência do utilizador

* **Mãos-livres / ritmo oral** no uso diário (ADR-015 / MG2): priorizar, reflectir e pedir decisão sem teclado.  
* **Continuidade** da personalidade institucional (VIS-002 §3.5) também no canal oral.  
* **Mesma confiança de governação** que no chat: Classificador, Gate, VCA, Jobs — a voz não «salta» regras.  
* **Transparência de estado** (a ouvir / a processar / a responder / erro), alinhada a CON-001 Art. 9º (tempo e clareza).

### 1.3 Relação com a EIC

A EIC governa **como** o CEO conversa (identidade, routing, qualidade, continuidade).  
«CEO Ouvindo» **não** é uma nova disciplina normativa da EIC nem um novo limiar: é uma **interface de canal** que:

1. Converte fala → texto (STT).  
2. Entrega esse texto ao **mesmo** ponto de entrada do Núcleo / pipeline EIC.  
3. Recebe a resposta textual já produzida pelo pipeline.  
4. Converte texto → fala (TTS), sob política de experiência (opt-in, gesto, estados).

```text
        ┌─────────────────────────────────────┐
        │  Camada «CEO Ouvindo» (I/O voz)     │  ← esta ANL
        │  STT · estados · eventos · TTS      │
        └──────────────┬──────────────────────┘
                       │ texto in / texto out
                       ▼
        ┌─────────────────────────────────────┐
        │  Pipeline conversacional EIC        │  ← intacto
        │  Gate · VCA · CSC · Classificador   │
        │  Complexidade · DIC · MRE · Motor   │
        │  Speaker (texto)                    │
        └─────────────────────────────────────┘
```

**Invariante desta ANL:** nenhuma capacidade da EIC é alterada para «ensinar» voz; a voz adapta-se ao pipeline, não o contrário.

---

## 2. Fluxo de alto nível

### 2.1 Fluxo canónico (alvo conceptual)

```text
Utilizador fala
        │
        ▼
Speech-to-Text (STT)
        │  texto normalizado (= instrução)
        ▼
Gate de Continuidade (se pendente)     ┐
        │                              │
        ▼                              │
VCA → [CSC se pertence]                │
        │                              │  Pipeline
        ▼                              │  conversacional
Classificador de Intenção              │  EIC
        │                              │  (inalterado)
        ▼                              │
Complexidade / DIC (se path meta)      │
        │                              │
        ▼                              │
Capacidade / Motor Executivo           ┘
        │
        ▼
Resposta textual (+ guiãoVoz do Speaker, se deliberativo)
        │
        ▼
Text-to-Speech (TTS)
        │
        ▼
Utilizador ouve
```

### 2.2 Equivalência com o path texto

| Etapa | Path texto (hoje) | Path «CEO Ouvindo» (alvo) |
|-------|-------------------|---------------------------|
| Entrada | Campo de texto / Enviar | Microfone → STT → **mesmo** `executiveEngine.executar(texto)` |
| Governação | Gate → VCA → … → destino | **Idêntica** |
| Saída | Mensagem no ecrã | Mensagem no ecrã **+** TTS (se preferência/estado o permitirem) |
| Speaker | Redige prosa | Redige prosa; **não** sintetiza (REQ-050 intacto) |

### 2.3 O que o fluxo **não** faz

* Não envia áudio bruto ao Classificador, Motor, MRE ou Railway deliberativo.  
* Não cria classe de intenção «voz».  
* Não altera limiar 0,55, E2.1–E2.3, DIC, NCS ou contratos de Job.  
* Não obriga TTS servidor no MVP conceptual (baseline continua cliente / Web Speech, salvo decisão futura em REQ/ARQ).

---

## 3. Estados da conversação por voz

Nomeação alinhada ao pedido desta ANL. Relação com PX-002: os estados abaixo descrevem o **modo conversacional por voz**; PX-002 cobre preferência TTS / unlock (Desativada, Aguardando autorização, Ativa, Falando, Ouvindo, Erro). A ARQ futura deve **harmonizar** os dois vocabulários sem duplicar máquinas contraditórias.

### 3.1 Diagrama

```text
                    ┌──────────┐
         ┌─────────►│  Idle    │◄──────────────────┐
         │          └────┬─────┘                   │
         │               │ iniciar escuta          │
         │               ▼                         │
         │          ┌──────────┐                   │
         │          │ Ouvindo  │── silêncio / stop ─┤
         │          └────┬─────┘                   │
         │               │ transcrição concluída   │
         │               ▼                         │
         │          ┌─────────────┐                │
         │          │ Processando │── cancelar ────┤
         │          └────┬────────┘                │
         │               │ resposta pronta         │
         │               ▼                         │
         │          ┌─────────────┐                │
         │          │ Respondendo │── fim TTS / stop┤
         │          └────┬────────┘                │
         │               │                         │
         │               └─────────────────────────┘
         │
         │   erro em qualquer etapa
         ▼
    ┌──────────┐
    │  Erro    │── retry / desligar → Idle
    └──────────┘

    Interrompido: estado transitório ou flag sobre Ouvindo/Respondendo
                  (barge-in / stop explícito) → Idle ou Ouvindo (política ARQ)
```

### 3.2 Responsabilidades por estado

| Estado | Responsabilidade | Microfone | Pipeline EIC | TTS |
|--------|------------------|-----------|--------------|-----|
| **Idle** | Aguarda gesto/comando; sessão de voz elegível mas sem captura activa | Off | Idle | Off |
| **Ouvindo** | Captura áudio; detecção de fala/silêncio; acumula hipótese STT; UI «a ouvir» | On | Não invocado ainda | Off (proibido feedback loop) |
| **Processando** | Texto final enviado ao Núcleo; corre Gate→…→destino; UI «a pensar» | Off | **Activo** | Off |
| **Respondendo** | Reproduz resposta (TTS); texto já visível; permite stop | Off | Concluído neste turno | On |
| **Interrompido** | Utilizador (ou política) cancelou escuta ou fala; limpa utterance/buffer; não deixa Job a meio por causa da voz | Off | Não reabre ciclo; Continuidade/Gate **intactos** | Stop |
| **Erro** | Falha STT/TTS/permissão/rede de voz; mensagem curta visível; sem silêncio opaco (PX-001) | Off | Não corrompido | Off |

### 3.3 Regras de exclusão mútua (MVP conceptual)

1. **Ouvindo ⊕ Respondendo** — nunca simultâneos (anti-eco / feedback).  
2. **Processando** não aceita nova transcrição como segundo turno paralelo (fila de um turno; evoluções §8).  
3. Interromper **Respondendo** não cancela Gate já pendente nem Job já publicado — só o áudio/UI.  
4. Preferência «voz desactivada» (PX-002) impede entrar em **Ouvindo** / **Respondendo** automáticos.

---

## 4. Eventos

### 4.1 Catálogo principal

| Evento | Origem típica | Efeito esperado no modo |
|--------|---------------|-------------------------|
| `iniciar_escuta` | Gesto (botão / hold-to-talk) | Idle → Ouvindo; pede permissão mic se necessário |
| `parar_escuta` | Gesto / timeout de política | Ouvindo → Idle (sem enviar) **ou** força fecho STT |
| `fala_detectada` | STT / VAD | Mantém Ouvindo; feedback UI (opcional) |
| `silencio` | STT / VAD | Pode disparar fim de turno de fala (política de endpointing) |
| `transcricao_concluida` | Speech Service | Ouvindo → Processando; emite `texto` ao Núcleo |
| `processamento_iniciado` | Voice Controller | Confirma entrada no pipeline |
| `resposta_pronta` | Núcleo / UI após `executar` | Processando → Respondendo (se TTS permitido) ou → Idle (só texto) |
| `inicio_fala_ceo` | TTS Service | Início de utterance |
| `termino_fala_ceo` | TTS `onend` | Respondendo → Idle |
| `interrupcao_utilizador` | Stop / barge-in (futuro) | → Interrompido → Idle (ou Ouvindo, se contínuo — §8) |
| `erro_voz` | Mic / STT / TTS / permissão | → Erro |
| `recuperar_de_erro` | Gesto retry | Erro → Idle |

### 4.2 Eventos que **não** pertencem à camada de voz

Qualquer evento de governação já existente permanece no domínio EIC/Motor:

* aprovação/rejeição de Gate;  
* publicação de Job;  
* veredictos VCA;  
* mudança de tópico / objectivo;  
* injecção DIC.

A voz **observa** resultados (ex.: «resposta_pronta») mas **não** redefine esses contratos.

---

## 5. Integração com a arquitectura existente

### 5.1 Demonstração de não-invasão

| Componente | Papel vigente | Impacto de «CEO Ouvindo» |
|------------|---------------|---------------------------|
| **Gate (ARQ-019)** | Continuidade / aprovação | Nenhum — recebe o mesmo texto |
| **VCA (ARQ-026 / IMP-065)** | Pertença / metaconversa | Nenhum — opera sobre texto |
| **Histórico (REQ-061)** | Janela conversacional | Nenhum — turnos são texto |
| **Referências (REQ-062)** | Deíxis | Nenhum |
| **Objectivo (REQ-064)** | Goal tracking | Nenhum |
| **Classificador (ARQ-018)** | C1–C4 | Nenhum — sem classe «voz» |
| **Complexidade (ARQ-027)** | instantaneo…completa | Nenhum |
| **DIC (ARQ-028 / IMP-067)** | Path meta | Nenhum — activação por texto |
| **Motor (ARQ-017)** | Jobs / Gate G2 | Nenhum |
| **Speaker (REQ-050)** | Comunicado texto | Nenhum — continua só prosa |
| **NCS / MRE** | Deliberação | Nenhum |
| **Painel (ARQ-016)** | Observabilidade | Opcional: reflectir estados de voz como telemetria de *canal*, sem mudar nós executivos |

### 5.2 Contrato de fronteira

```text
[CEO Ouvindo]  --texto-->  [executiveEngine.executar]
[CEO Ouvindo]  <--mensagem / textoVoz--  [resposta executiva]
```

* **Único payload** que atravessa a fronteira para o pipeline: **string de instrução** (+ metadados de sessão já existentes: histórico, deps).  
* Metadados de canal (`canalSpeaker: "voz"`) podem continuar a adaptar **forma** da prosa (REQ-050), sem alterar a **decisão**.

### 5.3 Relação com PX-002 / `experienciaVoz`

| Aspecto | PX-002 / runtime actual | «CEO Ouvindo» (esta ANL) |
|---------|-------------------------|---------------------------|
| Foco | TTS opt-in, unlock, Centro+Conversa | Ciclo completo **ouvir → processar → falar** |
| STT | Fase 2 / onboarding | Parte **central** do modo |
| Estados | Preferência + Falando/Ouvindo | Idle…Erro orientados ao turno conversacional |
| Conclusão | Harmonizar numa ARQ futura; **não** forçar duas máquinas divergentes em produção |

---

## 6. Componentes candidatos

Identificação conceptual — **sem** API, ficheiros nem stack fechada nesta ANL.

| Componente | Responsabilidade | Não faz |
|------------|------------------|---------|
| **Voice Controller** | Orquestra o modo: transições de estado, sequência STT→Núcleo→TTS, cancelamentos | Classificar, deliberar, publicar Jobs |
| **Speech State Manager** | Fonte de verdade dos estados §3; exposição à UI | Política de intenção |
| **Speech Service (STT)** | Microfone → texto; eventos fala/silêncio/transcrição | Interpretar significado executivo |
| **TTS Service** | Texto → áudio; início/fim/erro; stop | Redigir o comunicado (isso é Speaker) |
| **Microphone Controller** | Permissão, start/stop captura, libertar dispositivo | STT linguístico (delega ao Speech Service) |
| **Voice Session / Preferência** *(já esboçado em PX-002)* | Opt-in, unlock de gesto, persistência | Pipeline EIC |
| **UI de modo voz** | Indicadores Idle/Ouvindo/Processando/Respondendo/Erro; controlos iniciar/parar | Lógica de governação |

### 6.1 Dependências lógicas

```text
UI ⇄ Voice Controller ⇄ Speech State Manager
         │                      │
         ├─ Microphone Controller
         ├─ Speech Service (STT)
         ├─ executiveEngine (texto)     ★ fronteira EIC
         └─ TTS Service ← Speaker.text / mensagem
```

---

## 7. Riscos arquitecturais

| ID | Risco | Impacto | Mitigação conceptual (para ARQ/REQ) |
|----|-------|---------|-------------------------------------|
| R1 | **Feedback de áudio** (TTS → mic) | Transcrição ecoa a própria resposta; loops | Exclusão Ouvindo/Respondendo; ducking; endpointing após TTS |
| R2 | **Escuta durante resposta** | Contaminação STT / confusão de turno | Proibir mic em Respondendo no MVP |
| R3 | **Latência** (STT + rede LLM + TTS) | Sensação de «CEO lento»; viola tempo do utilizador | UI Processando honesta; timeouts; não fingir fala imediata |
| R4 | **Cancelamentos a meio** | Estado inconsistente; utterance órfã | Evento `interrupcao` → stop TTS + abort STT; pipeline já iniciado segue regras actuais (Gate/Job) |
| R5 | **Interrupção da fala do CEO** | Utilizador corta resposta | `stop` TTS → Idle; texto permanece no ecrã |
| R6 | **Sincronização de estados** | UI ≠ áudio ≠ pipeline | Um State Manager; eventos canónicos §4; proibir atalhos UI→TTS sem Controller |
| R7 | **Autoplay / gesto (mobile)** | TTS silencioso (PX-001) | Herdar estratégia PX-002 (opt-in, unlock, fila «Ouvir») |
| R8 | **Qualidade STT** (ruído, sotaque, termos MG2) | Classificador recebe texto errado → destino errado | Confirmação visual da transcrição no MVP; edição manual de emergência |
| R9 | **Confundir voz com nova capacidade normativa** | Pressão para alterar Classificador/Motor | Invariante §1.3 e §5 — Gate documental |
| R10 | **Duas máquinas de estado (PX-002 vs §3)** | Divergência de implementação | ARQ futura unifica vocabulário |

---

## 8. Evoluções futuras (fora desta implementação)

Explicitamente **não** fazem parte do MVP que esta ANL prepara:

| Evolução | Descrição | Por que fica de fora |
|----------|-----------|----------------------|
| **Conversa contínua** | Mic sempre aberto entre turnos | Multiplica R1–R3; exige VAD robusto |
| **Barge-in** | Utilizador interrompe o CEO a meio e é ouvido de imediato | Exige Respondendo∥parcial Ouvindo |
| **Wake word** | «Ei CEO» sem gesto | Complexidade OS/browser; privacidade |
| **Streaming de áudio** | Áudio server-side / chunked | Muda fronteira API; fora do baseline Web Speech |
| **Múltiplas vozes** | Timbre por papel / canal | Cosmético face à governação |
| **Resposta incremental** | TTS de tokens parciais | Acopla TTS ao stream LLM; risco de incoerência com Speaker/MRE |
| **TTS neural servidor** | Áudio na resposta HTTP | Evolução de plataforma, não do modo |

Estas linhas só voltam após Gate e REQ próprios, **depois** do modo base estável.

---

## 9. MVP conceptual sugerido (para a REQ futura — não aberto aqui)

Sem redigir REQ nesta etapa, a ANL recomenda que o primeiro ciclo normativo cubra apenas:

1. Gesto → **Ouvindo** → transcrição → **mesmo** `executar(texto)`.  
2. Resposta no ecrã + **Respondendo** (TTS) se preferência/unlock o permitirem.  
3. Stop / Erro visíveis.  
4. Zero alterações a Gate, VCA, Classificador, Motor, DIC.  
5. Harmonização documental com PX-002 / REQ-047 / REQ-050.

---

## 10. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Código, prompts, runtime, comportamento |
| X2 | Criar REQ, ARQ ou IMP nesta etapa |
| X3 | Escolher fornecedor STT/TTS definitivo ou schemas de API |
| X4 | Emendar CON/VIS/ARQ/EIC vigentes |
| X5 | Implementar barge-in, wake word, streaming (§8) |
| X6 | Redesenhar Speaker, Painel ou NCS |

---

## 11. Conclusão

A EIC já fornece o **cérebro conversacional** do CEO. O que falta para o modo «CEO Ouvindo» não é um novo Classificador nem um Motor paralelo: é uma **camada de interface** com estados, eventos e serviços de fala que conversem com o Núcleo **apenas em texto**.

Esta ANL estabelece:

* objectivo e encaixe na CAP-07 / EIC;  
* fluxo ponta a ponta voz → governação → voz;  
* estados e eventos;  
* prova de preservação do pipeline;  
* componentes candidatos;  
* riscos e evoluções adiadas.

**Próximo passo oficial (após Gate do CTO):** ciclo concluído — ver ENC-006.

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | ANL completa — objectivo, fluxo, estados, eventos, integração, componentes, riscos, evoluções | Aguarda revisão CTO |
| 0.2 | 03/08/2026 | Engenheiro (Cursor) | Marcação homologada; ligação a REQ-068 | Homologada — REQ aberta |
| 0.3 | 03/08/2026 | Engenheiro (Cursor) | Cadeia fechada VAL-010 + ENC-006 | Homologada / frente ENCERRADA |

---

**Estado:** Análise **homologada** / frente **ENCERRADA** (ENC-006).  
**Cadeia oficial:** ANL-012 → REQ-068 → ARQ-029 → IMP-068 → **VAL-010** → ENC-006.  
**REQ:** [`REQ-068-modo-ceo-ouvindo.md`](../requirements/REQ-068-modo-ceo-ouvindo.md).  
**VAL:** [`VAL-010-homologacao-modo-ceo-ouvindo.md`](../validation/VAL-010-homologacao-modo-ceo-ouvindo.md) (*não* VAL-006).  
**ENC:** [`ENC-006-encerramento-modo-ceo-ouvindo.md`](../learning/ENC-006-encerramento-modo-ceo-ouvindo.md).  
Nenhuma nova alteração nesta frente — aguardar abertura da próxima frente do Sistema CEO.

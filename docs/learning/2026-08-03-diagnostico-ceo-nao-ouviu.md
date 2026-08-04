# Diagnóstico — «O CEO não ouviu o usuário» (GATE-010 suspenso)

> **Data:** 03/08/2026  
> **Contexto:** VAL-011 / produção; teste manual do patrocinador.  
> **GATE-010:** **Cancelado** (defeito funcional em teste manual). Ver diagnóstico instrumental: [`2026-08-03-diagnostico-stt-instrumental-gate010-cancelado.md`](2026-08-03-diagnostico-stt-instrumental-gate010-cancelado.md).

---

## Sintoma

UI mostra escuta activa («CEO Ouvindo — fale agora»), mas a fala do utilizador **não** chega ao Gate / pipeline.

---

## Verificações

| # | Item | Achado |
|---|------|--------|
| 1 | Permissão microfone | `getUserMedia` OK (`mic_autorizado`); em seguida `mic_fechado` |
| 2 | SpeechRecognition | Arranca (`stt_start` / `onstart`) |
| 3 | Início da escuta | Controller transitava para `ouvindo` **antes** de garantir áudio STT |
| 4 | Captura de áudio | **Falha silenciosa:** após abrir/fechar `getUserMedia`, o SR fica sem pipeline de áudio (`onaudiostart` / `onsoundstart` / `onspeechstart` / `onresult` ausentes no probe) |
| 5 | Eventos SR | Ver código — não estavam instrumentados; probe isolado: só `onstart` |
| 6 | Voice Controller | Logs `[ceoOuvindo]` mostram `iniciar_escuta` + `stt_start` sem `onresult` |
| 7 | Speech Service | Web Speech no browser; conflito com stream GUM prévio |
| 8 | Gate | Nunca chamado — `enviarTexto` só após `transcricao_concluida` |
| 9 | Lab vs prod | Lab usa mocks STT (passa); prod usa Web Speech real + sequência GUM→stop→SR |

---

## Causa raiz

**Conflito de microfone:** `iniciarEscuta` fazia `getUserMedia` (probe de permissão), **parava as tracks** (`fecharCaptura`) e de imediato `SpeechRecognition.start()`.  
O reconhecimento reporta `onstart`, a UI fica em Ouvindo, mas **não recebe áudio** — sem `onresult`, nada é enviado ao Gate.

Causa secundária: `criarStt` usava `continuous: true` (herdado do onboarding), menos adequado ao turno MVP; erros de `start()` eram engolidos.

---

## Arquivos envolvidos

| Ficheiro | Papel |
|----------|--------|
| `app/src/ceoOuvindo/voiceController.js` | Orquestra mic → STT → Gate |
| `app/src/ceoOuvindo/audioDeviceManager.js` | Probe GUM que roubava o mic |
| `app/src/ceoOuvindo/sttAdapter.js` | Adapter + silenceMs |
| `app/src/onboarding/voice/stt.js` | Web Speech API |
| `app/src/modules/conversa/conversa.js` | UI Ouvindo (sem lógica STT) |

---

## Correção proposta (só a causa)

1. Permissão **sem segurar stream**: `permissions.query` quando `granted`; GUM só para prompt, libertar antes do STT + pausa curta.  
2. Modo turno: `continuous: false` no STT do CEO Ouvindo.  
3. Não engolir falhas de `recognition.start()` (exceto `InvalidStateError`).  
4. Instrumentar eventos SR (`onaudiostart`, `onsoundstart`, `onspeechstart`, `onresult`, `onerror`, `onend`) nos logs `[ceoOuvindo]` existentes.  
5. Flush de interim pendente ao parar a escuta.

## Correção aplicada (03/08/2026)

| Alteração | Ficheiro |
|-----------|----------|
| Permissão via `permissions` sem segurar stream; GUM só para prompt + release | `audioDeviceManager.js` |
| Pausa 200 ms após GUM antes do SR | `voiceController.js` |
| STT turno: `continuous: false` + logs `stt_audiostart`… | `sttAdapter.js` |
| Eventos SR + flush interim + `start()` sem engolir erros | `onboarding/voice/stt.js` |

**GATE-010:** **Cancelado**. Causa raiz refinada: `await` de mic antes de `recognition.start()` (gesto Chrome). Correção em produção (`dpl_5rb6yBVpgENn…`).

# Diagnóstico instrumental STT — «CEO não ouviu» (GATE-010 cancelado)

> **Data:** 03/08/2026  
> **GATE-010:** **Cancelado**.  
> **Evidência do defeito:** Ouvindo inicia → botão «Parar» → sem transcrição → sem Gate → sem resposta.

---

## Logs esperados (sequência `[DIAG-STT]`)

Após a correcção, no DevTools (Chrome/Edge) ao clicar **Ouvindo** e falar:

```text
1. SpeechRecognition criado { lang, continuous:false, interimResults:true }
2. start() executado (sync, gesto do utilizador)
3. onstart
4. onaudiostart
5. onsoundstart          (quando há som)
6. onspeechstart         (quando há fala)
7. onresult              { interim | finals }
8. onerror               (só se falhar — código + mensagem)
9. onend
10. Texto enviado ao Gate/Núcleo  "<transcrição>"
11. Resposta recebida do Gate/Núcleo { ok, mensagem }
```

**Sequência defeituosa (antes da correção):**

```text
[ceoOuvindo] mic_autorizado     ← await permissions/getUserMedia
[ceoOuvindo] mic_fechado
[ceoOuvindo] estado → ouvindo
[ceoOuvindo] iniciar_escuta
[ceoOuvindo] stt_start / onstart
(sem onaudiostart / onresult)
(sem texto ao Gate)
```

---

## Causa raiz

`iniciarEscuta()` fazia **`await garantirPermissaoMic()` antes de `recognition.start()`**.

No Chrome, `SpeechRecognition.start()` tem de correr no **mesmo turno síncrono do gesto** (click). O `await` quebra o user-activation token:

| Sintoma | Explicação |
|---------|------------|
| Botão «Parar» / estado Ouvindo | State machine OK |
| `onstart` pode disparar | SR «arrancou» |
| Sem `onaudiostart` / `onresult` | Captura de áudio não ligada ao gesto |
| Sem Gate / sem resposta | `enviarTexto` só após transcrição |

Causa anterior (GUM→stop→SR) agravava; a falha decisiva no clique manual é a **ordem await → start**.

---

## Correção (só a falha de reconhecimento)

1. **`recognition.start()` síncrono** no caminho do click — **zero `await` antes de start**.  
2. Permissão: delegada ao próprio SpeechRecognition (`not-allowed` → Erro); probe de mic só em background.  
3. `tts.stop()` ao iniciar escuta (evita conflito alto-falante/mic).  
4. Logs temporários `[DIAG-STT]` 1–11 para validação manual.  
5. Mantém `continuous: false` (modo turno) + flush interim.

**Arquivos:** `voiceController.js`, `stt.js` (+ logs), `sttAdapter.js` (já turno), `audioDeviceManager.js` (probe não bloqueante).

**Sem** novas funcionalidades.

---

## Re-teste manual

1. Hard refresh https://sistema-ceo.vercel.app/#/conversa  
2. Consola aberta → filtro `DIAG-STT`  
3. Clicar **Ouvindo** → falar → pausar  
4. Confirmar sequência 1→11 e resposta na UI

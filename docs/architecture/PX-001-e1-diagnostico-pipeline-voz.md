# PX-001 E1 — Diagnóstico do pipeline de voz do CEO

> **O que é?** Relatório técnico do fluxo Speaker → texto → síntese de voz no produto atual.  
> **Por que existe?** Explicar por que o CEO pode não falar no celular e onde está cada responsabilidade.  
> **Para quem?** Patrocinador / CTO (Gate PX-001).  
> **Sucesso:** Respostas às 7 perguntas do E1 sem ambiguidade de código.  
> **Status:** Diagnóstico — **sem alteração de código.**  
> **Data:** 31/07/2026 · **Autor:** Engenheiro (Cursor)

---

## Diagrama do pipeline (estado atual)

```text
Utilizador envia instrução (Conversa OU Centro)
        │
        ▼
Executive Engine / Núcleo → (se deliberativo) MRE
        │
        ▼
Speaker Executivo  →  ComunicadoExecutivo (texto / guiãoVoz)   ← NÃO é áudio
        │
        ▼
Resposta JSON ao browser  { mensagem, dados.textoVoz, ... }
        │
        ├── Centro de Situação: só pinta texto  →  NÃO chama TTS
        │
        └── Conversa: falarCeo(textoVoz || mensagem)
                        │
                        ▼
              VoiceFactory → provider "browser"
                        │
                        ▼
              speechSynthesis.speak(SpeechSynthesisUtterance)   ← síntese no cliente
```

**API Railway (`/api/ceo/deliberar`)** participa só da chamada LLM do MRE.  
**Não** devolve áudio nem flag `falar: true`. A decisão de falar é 100% no frontend.

---

## 1. Como o Speaker é acionado

| Camada | Papel | Onde |
|--------|--------|------|
| **Speaker Executivo** | Transforma `ParecerExecutivo` → `ComunicadoExecutivo` (texto) | `app/src/mre/speaker/speakerExecutivo.js` |
| Gatilho | Após MRE OK em `executarRotaDeliberativa` | `app/src/mre/integracaoNucleo.js` |
| Canal usado hoje | `ctx.canalSpeaker \|\| **"chat"**` | `app/src/executiveEngine/capacidades/ia.js` |

Fluxo:

1. Intenção deliberativa + LLM configurado → `executarRotaDeliberativa`.
2. Parecer válido → `gerarComunicadoExecutivo(parecer, canal)`.
3. Retorno inclui `mensagem` (= `comunicado.texto`) e `dados.textoVoz` (= `textoParaVoz(comunicado)`).

**Importante:** o Speaker **não** chama `speechSynthesis`. Só redige.  
Com canal default `"chat"`, `guiãoVoz` no comunicado fica `null`; `textoParaVoz` cai no `comunicado.texto` (prosa de chat).

---

## 2. Onde ocorre a síntese de voz

| Etapa | Local | Mecanismo |
|-------|--------|-----------|
| Formatação | `TextFormatter` via `VoiceFactory` | Cliente |
| Síntese | `app/src/onboarding/voice/providers/browser.js` | **Web Speech API** no browser |
| Acionamento UI | `falarCeo()` em `app/src/modules/conversa/conversa.js` | Após resposta OK |

Provedores neurais (OpenAI / ElevenLabs / Azure / Google) existem como **esqueletos** e, em falha, fazem fallback para `browser` (`VoiceFactory.js`). Config ativa: `provider: "browser"` em `app/src/onboarding/config/voice.json`.

**Não há** TTS no servidor Hono/Railway. **Não há** ficheiro de áudio na resposta HTTP.

---

## 3. Web Speech API ou outro?

**Sim — Web Speech API (`speechSynthesis` + `SpeechSynthesisUtterance`).**

- Único módulo autorizado a usar `speechSynthesis`: `providers/browser.js` (REQ-047).
- STT (microfone) é outro caminho (`webkitSpeechRecognition` / `SpeechRecognition`) — onboarding; **não** é o path principal da Conversa após deliberar.

---

## 4. Diferença desktop vs mobile

| Aspeto | Desktop (Chrome/Edge típico) | Mobile (Safari iOS / Chrome Android) |
|--------|------------------------------|--------------------------------------|
| `speechSynthesis` | Geralmente disponível; vozes pt-BR variam | Disponível com restrições fortes (esp. **iOS**) |
| Lista de vozes | Rica (Google/Microsoft) | Limitada / system voices; `voiceschanged` mais crítico |
| Após `await` de rede | Costuma falar | **iOS** frequentemente **silencia** (gesto expirado) |
| Superfície mais usada | Conversa **ou** Centro | Em produção o dashboard abre no **Centro** (`#/dashboard`) |
| TTS no Centro | **Não implementado** | Utilizador no Centro **nunca** ouve o CEO, mesmo em desktop |

Código **não** ramifica `mobile` / `iOS` / `userAgent`. O comportamento diferente vem do motor do browser + qual módulo UI está ativo.

---

## 5. Bloqueio por autoplay do navegador

**Sim — risco alto, especialmente mobile.**

Evidência no fluxo da Conversa:

1. Gesto do utilizador: `submit` / Enter → `enviarInstrucao`.
2. Imediatamente: `voiceOut.stop()` (ok).
3. Depois: `await executiveEngine.executar(...)` — **rede** (LLM via Railway), segundos.
4. Só então: `falarCeo` → `speechSynthesis.speak`.

Em Safari iOS (e por vezes Chrome Android), a **activação de utilizador** para áudio/TTS **não sobrevive** a um `await` longo. O `speak` pode ser ignorado ou falhar em silêncio.

No provider:

```text
u.onerror → resolve()   // não propaga erro para a UI
```

Ou seja: falha de autoplay/TTS **não aparece** na interface.

Não há unlock prévio (`speak` vazio no gesto), nem `AudioContext.resume`, nem botão “Ouvir”.

---

## 6. A resposta da API já traz instrução para falar?

**Não.**

| Campo | Origem | Significado |
|-------|--------|-------------|
| `mensagem` / `texto` | Speaker (cliente) ou fallback | Texto para ecrã |
| `dados.textoVoz` | `textoParaVoz(comunicado)` no **cliente** após MRE | Preferência de guião; **não** é comando “falar” |
| Corpo LLM Railway | Só completions | Sem campo de voz |

A API pública `POST /api/ceo/deliberar` devolve `{ ok, texto, modelo, uso, origem: "llm" }` — texto do modelo para o MRE, **sem** metadados de TTS.

Quem decide falar é só o módulo **Conversa** (`if (resposta.ok) falarCeo(...)`).

---

## 7. O que impede o CEO de falar no celular

Causas **ordenadas por impacto** (estado do código + comportamento típico dos browsers):

1. **Centro de Situação não chama TTS**  
   Dashboard de produção (`#/dashboard`) usa `centroSituacao.js`, que atualiza mensagens mas **nunca** `VoiceFactory` / `falarCeo`. No telemóvel o utilizador fica quase só neste ecrã → **silêncio por desenho**.

2. **Política de autoplay / user gesture (iOS sobretudo)**  
   Mesmo na Conversa, o `speak` ocorre **depois** do round-trip async. Sem re-gesto, Safari costuma bloquear.

3. **Erros de TTS engolidos**  
   `falarCeo` em `try/catch` vazio; `onerror` do utterance resolve sem feedback → parece “bug sem causa”.

4. **Síntese só no cliente via Web Speech**  
   Sem áudio servidor; se o browser mobile tiver TTS fraco/ausente/bloqueado, não há plano B ativo (esqueletos neurais não geram áudio real).

5. **Canal Speaker default = `chat`**  
   Não impede falar (usa `texto`), mas **não** usa o `guiãoVoz` otimizado; irrelevante vs. (1)–(3) no telemóvel.

6. **Não relacionado:** Railway/CORS/API — a deliberação pode estar OK e o ecrã mostrar texto; a fala é independente e local.

---

## Mapa rápido pergunta → resposta

| # | Pergunta | Resposta curta |
|---|----------|----------------|
| 1 | Como o Speaker é acionado? | Pós-parecer no MRE (`integracaoNucleo`); canal default `chat`. |
| 2 | Onde é a síntese? | Browser, `providers/browser.js` via `VoiceFactory`. |
| 3 | Web Speech ou outro? | **Web Speech API**; neurais = stubs. |
| 4 | Desktop vs mobile? | Sem branch no código; iOS mais restrito; Centro (mobile) sem TTS. |
| 5 | Autoplay? | **Sim**, risco após `await` de rede. |
| 6 | API manda falar? | **Não** — só texto; UI Conversa decide. |
| 7 | Por que não fala no celular? | Principalmente: **Centro sem TTS** + **bloqueio de gesto/autoplay** + erros silenciosos. |

---

## Implicações para PX-001 (sem implementar)

Hipóteses de correção futuras (só para o Gate; **não** são este E1):

- Acionar TTS também no Centro (ou unificar canal de saída).
- Unlock de áudio no gesto de envio, ou botão “Ouvir resposta”.
- Propagar falhas de `speechSynthesis` para a UI.
- (Opcional) TTS servidor / neural real — fora do browser autoplay.

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (diagnóstico) |
| Quando | 31/07/2026 |
| Por quê | PX-001 E1 — pipeline de voz |
| Baseado em quê | `conversa.js`, `centroSituacao.js`, `speakerExecutivo.js`, `integracaoNucleo.js`, `VoiceFactory` / `browser.js`, REQ-047/050, IMP-015/016 |
| Resultado | Relatório; **código intacto** |

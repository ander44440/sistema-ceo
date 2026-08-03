# REQ-047 — Camada profissional de voz (Voice Engine)

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá expor toda saída de voz através de uma camada única (`VoiceFactory` → `VoiceProvider`), configurável por `config/voice.json`, com Web Speech API apenas como provedor `browser` (fallback de desenvolvimento), e esqueletos para OpenAI, ElevenLabs, Azure e Google — sem que o restante do sistema aceda a APIs de TTS diretamente.

## Tipo

Funcional / arquitetural; detalhado.

## Justificativa

IMPLEMENTAÇÃO 001 (onboarding) usava `speechSynthesis` de forma acoplada. Preparar troca futura para vozes neurais sem refatorar conversação/UI (REQ-046).

## Critérios de aceitação

* Camada única sob `app/src/onboarding/voice/`.
* Interface `VoiceProvider`: `speak`, `stop`, `pause`, `resume`, `isSpeaking`.
* `VoiceFactory.create()` seleciona o provedor de `voice.json`.
* Browser provider: melhor voz pt-BR, speed/pitch, interrupção, cancela fala anterior.
* `TextFormatter` pré-processa texto antes do `speak`.
* Stubs OpenAI / ElevenLabs / Azure / Google sem chamadas reais.
* Nenhum módulo fora de `providers/browser` usa `speechSynthesis`.
* Troca de provedor só via `config/voice.json`.

## Fora do escopo

Chamadas reais a APIs neurais; billing; STT (permanece módulo à parte).

## Notas de implementação

O repositório `app/` é JavaScript (Vite). Os artefactos usam a estrutura e nomes do REQ (`.js` com contrato JSDoc equivalente a TypeScript).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Depende | REQ-046 |
| Origem | REQ-047 — 30/07/2026 |

## Histórico

| Versão | Data | Quem | Resultado |
|--------|------|------|-----------|
| 0.1 | 30/07/2026 | Patrocinador | Aprovado para implementação |

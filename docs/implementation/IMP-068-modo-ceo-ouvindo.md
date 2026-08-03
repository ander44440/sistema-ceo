# IMP-068 — Implementação do Modo CEO Ouvindo (MVP)

> **Status:** Implementada — 03/08/2026 (pronta para homologação).  
> Norma: **REQ-068**; **ARQ-029** (homologada). Capacidade: CAP-07.  
> Base: ANL-012; PX-001/PX-002; REQ-047; REQ-050; `experienciaVoz/`; `onboarding/voice/stt.js`.

## Escopo cumprido (MVP)

| Item | Estado |
|------|--------|
| Captura de áudio (permissão mic) | Feito — `Audio Device Manager` |
| Speech-to-Text | Feito — `STT Adapter` → Web Speech (`criarStt`) |
| Envio do texto ao Gate / Núcleo | Feito — `enviarAoNucleo` → `executiveEngine.executar` |
| Pipeline EIC integral | Feito — **sem alterações** a Gate/VCA/Classificador/DIC/Motor |
| Resposta textual na Conversa | Feito — store + UI |
| Text-to-Speech | Feito — `TTS Adapter` → `reproduzirRespostaCeo` |
| Reprodução da resposta | Feito |
| Retorno automático a **Ouvindo** | Feito — ver decisões técnicas |
| Adaptadores / interfaces | Feito |
| Eventos e erros básicos STT/TTS | Feito — `console` + callbacks |
| UI Conversa (botão Ouvindo) | Feito |
| CT-CO01…06 | Feito |

## Decisões técnicas

| ID | Decisão | Porquê |
|----|--------|--------|
| D1 | Módulo novo `app/src/ceoOuvindo/` | Separar canal de voz da EIC; ARQ-029 §8 |
| D2 | Extrair `enviarAoNucleo.js` | Uma fronteira texto para teclado e voz |
| D3 | **Retorno automático a Ouvindo** após TTS | Escopo IMP-068 (sobrepõe ARQ-029 §4.4 Idle-por-gesto no MVP documental) |
| D4 | STT = Web Speech + silence 900 ms | Reuso onboarding; sem APIs pagas |
| D5 | TTS = `experienciaVoz` / REQ-047 | Sem reinventar Voice Engine; Speaker continua só prosa |
| D6 | Preferência PX-002 não bloqueia STT | Ouvir funciona; TTS pode enfileirar se voz Desativada |
| D7 | Teclado interrompe ciclo de voz | Evita turnos concorrentes |

## Fora de escopo (preservado)

* Alterações a Gate, VCA, Histórico, Referências, Objectivo, Classificador, Motor, DIC, limiar  
* Barge-in, wake word, streaming, conversa contínua sem gesto inicial  
* TTS servidor / neural obrigatório  

## Fluxo runtime

```text
Botão «Ouvindo»
  → Voice Controller.iniciarEscuta
  → Audio Device Manager (permissão) + STT Adapter
  → transcrição
  → enviarAoNucleo(texto)  ★ executiveEngine.executar
  → UI texto
  → TTS Adapter
  → estado Ouvindo (auto)
```

## Validação

```text
cd app
npm run test:ceo-ouvindo
npm run test:voz
npm run test:dic
npm run test:classificador:e23
npm run build
```

## Artefactos

| Path | Papel |
|------|-------|
| `app/src/ceoOuvindo/*` | Controller, State, STT/TTS/Device adapters |
| `app/src/modules/conversa/enviarAoNucleo.js` | Fronteira texto partilhada |
| `app/src/modules/conversa/conversa.js` | UI mic + wiring |
| `docs/implementation/IMP-068-modo-ceo-ouvindo.md` | Este plano |

## Rollback

Desactivar uso do botão Ouvindo / não montar Controller — path teclado intacto. Preferência voz PX-002 Desativada continua a omitir TTS automático.

## Próximo

Homologação do patrocinador / CTO. Sem novas evoluções (§ fora de escopo) antes do Gate.

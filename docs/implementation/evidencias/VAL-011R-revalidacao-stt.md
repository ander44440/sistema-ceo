# Evidência VAL-011R — Revalidação pós-correção STT

> **Data:** 03/08/2026  
> **Relatório:** [`../../validation/VAL-011R-revalidacao-pos-correcao-stt.md`](../../validation/VAL-011R-revalidacao-pos-correcao-stt.md)

## Produção

| Campo | Valor |
|-------|--------|
| Hash / Deployment | `dpl_Bfm7V3pP5vaJAoGQ7RJHQ9zzBgUj` |
| Alias | https://sistema-ceo.vercel.app |
| Bundle | `assets/index-Zsv0iGFB.js` |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/Bfm7V3pP5vaJAoGQ7RJHQ9zzBgUj |

## Marcadores no bundle (Runtime.evaluate)

```json
{
  "syncStart": true,
  "delegadoStt": true,
  "ceoDebugStt": true,
  "diagStt": true,
  "awaitBeforeStart": false,
  "sr": true,
  "debugParam": "stt"
}
```

## Logs Ouvindo (`?debug=stt`)

```text
1. SpeechRecognition criado
2. start() executado (sync, gesto do utilizador)
3. onstart
8. onerror { error: "audio-capture" }  // automação sem mic
9. onend
```

UI: «CEO Ouvindo — fale agora»; botão «Parar» `pressed`.

## 10 conversas consecutivas (produção — texto)

```json
{ "pass": 10, "total": 10 }
```

Turnos `VAL-011R turno 1` … `10` — todos `ok` + `bodyHasPronto`.

## Laboratório

```text
npm run test:ceo-ouvindo  → 11/11 (CT-CO11 = 10 turnos)
npm run test:voz          → 33/33
npm run test:dic          → 8/8
npm run test:classificador:e23 → 8/8
```

## GATE-010

**Não reaberto.** Condicionado à aprovação da VAL-011R.

## Commit

`80260f2dff93f17bb5508c2e78048722d38a21c7` — `fix(voz): sync SpeechRecognition start + VAL-011R revalidation`

# VAL-011R — Revalidação Pós-Correção do STT

> **Status:** **Homologada** — Gate aprovado 06/08/2026 (Alçada do Patrocinador / mandato CTO Opção B — REG-A04).  
> **Tipo:** VAL (ADR-006) — revalidação em produção após correção da falha de activação do SpeechRecognition.  
> **Data:** 03/08/2026 (engenharia); Gate 06/08/2026.  
> **Capacidade:** CAP-07 — Comunicação.  
> **Frente:** F1 — Paridade Produção CEO Ouvindo (pós-defeito) — **ENCERRADA**.  
> **Lastro:** VAL-011 · diagnóstico STT homologado · correção sync `start()`.  
> **GATE-010:** permanece **cancelado** nesta regularização — reabertura exige mandato explícito separado (fora do pacote mínimo F1).  
> **Regularização:** REG-A04 / REG-A05 — 06/08/2026.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Revalidação de que a correção do STT eliminou a falha de activação em produção. |
| **Por que existe?** | Diagnóstico homologado; fechar o ciclo pós-defeito antes de reabrir GATE-010. |
| **Para quem existe?** | Patrocinador (aprovação); CTO; Engenheiro. |
| **Como medir sucesso?** | Logs de activação 1→3 (+8/9 se erro ambient); 10 conversas consecutivas; sem regressão; DEBUG nos logs; hash de produção. |

---

## 1. Âmbito

| Item | Valor |
|------|--------|
| Objectivo | Confirmar eliminação da falha `await` mic → `recognition.start()` |
| Ambiente | https://sistema-ceo.vercel.app (`?debug=stt` para logs) |
| Fora de âmbito | Novas funcionalidades; reabertura de GATE-010 sem aprovação |

---

## 2. Produção — hash e artefacto

| Item | Valor |
|------|--------|
| Alias | https://sistema-ceo.vercel.app |
| Deployment | `dpl_Bfm7V3pP5vaJAoGQ7RJHQ9zzBgUj` |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/Bfm7V3pP5vaJAoGQ7RJHQ9zzBgUj |
| Bundle | `assets/index-Zsv0iGFB.js` |
| Marcadores | `syncStart=true` · `delegado-stt` · `CEO_DEBUG_STT` · `[DIAG-STT]` (só DEBUG) |
| Ordem incorrecta | `awaitBeforeStart=false` (regex `garantirPermissaoMic`…`stt.iniciar` ausente) |

---

## 3. Hard refresh + CEO Ouvindo — sequência de logs

URL: `https://sistema-ceo.vercel.app/?debug=stt&v=val011r#/conversa`

| # | Evento | Resultado produção (automação) |
|---|--------|--------------------------------|
| 1 | SpeechRecognition criado | **Observado** — `pt-BR`, `continuous:false` |
| 2 | `start()` sync (gesto) | **Observado** |
| 3 | `onstart` | **Observado** + UI «CEO Ouvindo — fale agora» / botão «Parar» |
| 4 | `onaudiostart` | Não alcançado — ver nota |
| 5 | `onsoundstart` | Não alcançado — ver nota |
| 6 | `onspeechstart` | Não alcançado — ver nota |
| 7 | `onresult` | Não alcançado — ver nota |
| 8 | `onerror` | **Observado** — `audio-capture` (sem dispositivo de áudio no browser automatizado) |
| 9 | `onend` | **Observado** |
| 10 | Texto → Gate | N/A neste ambiente (sem captura) |
| 11 | Resposta Gate | N/A neste ambiente (sem captura) |

**Nota crítica:** o defeito original era UI Ouvindo **sem** `start()` efectivo no gesto. Aqui: **1→2→3** com `syncStart:true` e `micVia:delegado-stt`; o motor tenta capturar e falha com `audio-capture` **só** por limitação do ambiente de automação (sem mic real). Em Chrome/Edge do patrocinador com mic, a sequência esperada completa é 1→7→9→10→11 (`?debug=stt`).

### Evidência de consola (extracto)

```text
[ceoOuvindo] estado { de: "idle", para: "ouvindo", detalhe: "iniciar_escuta" }
[DIAG-STT] 1. SpeechRecognition criado { lang: "pt-BR", continuous: false, interimResults: true }
[DIAG-STT] 2. start() executado (sync, gesto do utilizador)
[ceoOuvindo] iniciar_escuta { syncStart: true, micVia: "delegado-stt" }
[ceoOuvindo] mic_autorizado { via: "permissions" }   ← após start (background)
[DIAG-STT] 3. onstart
[ceoOuvindo] stt_start
[DIAG-STT] 8. onerror { error: "audio-capture" }     ← ambiente sem mic
[DIAG-STT] 9. onend
```

---

## 4. Dez conversas consecutivas

| Camada | Método | Resultado |
|--------|--------|-----------|
| Laboratório | CT-CO11 — 10 turnos mock STT + auto-retorno | **10/10** · `starts ≥ 11` |
| Produção | 10 turnos texto Gate/EIC (`VAL-011R turno 1…10`) | **10/10** · todos `ok` + `bodyHasPronto` |

Pipeline voz (processamento + retorno Ouvindo): CT-CO11.  
Path Gate/EIC em produção: 10 turnos texto sem falha.

---

## 5. Regressões

| Suite | Resultado |
|-------|-----------|
| `test:ceo-ouvindo` | **11/11** pass (incl. CT-CO11) |
| `test:voz` | **33/33** |
| `test:dic` | **8/8** |
| `test:classificador:e23` | **8/8** |
| `npm run build` | OK |

Sem regressão detectada no perímetro voz/EIC/DIC.

---

## 6. Logs `[DIAG-STT]`

| Antes | Depois |
|-------|--------|
| Sempre activos em produção | Protegidos por modo DEBUG |

Activação: `?debug=stt` **ou** `localStorage.setItem('CEO_DEBUG_STT','1')`.  
Módulo: `app/src/onboarding/voice/debugStt.js`.

---

## 7. Conclusão engenharia

| Critério | Estado |
|----------|--------|
| Causa raiz corrigida em produção | **Sim** (`syncStart` + ordem start→mic background) |
| Activação SpeechRecognition (1→2→3) | **Confirmada** |
| 10 conversas consecutivas | **Confirmadas** (lab voz + prod Gate) |
| Sem regressões de suite | **Confirmado** |
| Logs temporários | **DEBUG only** |
| GATE-010 | **Não reaberto** — fora do pacote mínimo F1; requer mandato futuro explícito |

**Parecer engenharia (03/08/2026):** Apto para aprovação do patrocinador.  
**Gate (06/08/2026):** **APROVADO** — Alçada do Patrocinador via mandato CTO Opção B (REG-A04). NC-I1 = **CORRIGIDA** (patch STT + deploy `dpl_Bfm7V3pP…`).

---

## 8. Entregáveis / commits

| Item | Valor |
|------|--------|
| Commit | `80260f2dff93f17bb5508c2e78048722d38a21c7` |
| Mensagem | `fix(voz): sync SpeechRecognition start + VAL-011R revalidation` |
| Branch | `cursor/ipr-001-experiencia-f1-f2` |
| Evidência | [`../implementation/evidencias/VAL-011R-revalidacao-stt.md`](../implementation/evidencias/VAL-011R-revalidacao-stt.md) |
| Produção | `dpl_Bfm7V3pP5vaJAoGQ7RJHQ9zzBgUj` |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Revalidação STT pós-correção | Homologada engenharia — aguardava Gate |
| 0.2 | 06/08/2026 | Engenheiro (Cursor) | REG-A04/A05 — Gate + fecho NC-I1 | **Homologada** — Gate aprovado |

---

**Estado:** **Homologada** — Gate aprovado. F1 **encerrada**.
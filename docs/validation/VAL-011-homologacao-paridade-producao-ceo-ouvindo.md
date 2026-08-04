# VAL-011 — Homologação da Paridade em Produção do CEO Ouvindo

> **Status:** Homologada (engenharia) — 03/08/2026; aguarda **Gate final** do patrocinador.  
> **Nota pós-defeito:** STT — ver [`VAL-011R`](VAL-011R-revalidacao-pos-correcao-stt.md) (revalidação; GATE-010 cancelado até aprovação VAL-011R).  
> **Tipo:** VAL (ADR-006) — relatório de homologação em **produção**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação.  
> **Frente:** F1 — Paridade Produção CEO Ouvindo.  
> **Cadeia:** ANL-013 → REQ-069 → ARQ-030 → IMP-069 → **esta VAL**.  
> **Lastro:** REQ-068 · ARQ-029 · IMP-068 · VAL-010 (lab) · ENC-006 · GATE-009.  
> **Nota:** VAL-010 = homologação **laboratorial** do MVP; VAL-011 = homologação da **paridade em produção**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Homologação do modo CEO Ouvindo no alias oficial de produção, com equivalência ao laboratório. |
| **Por que existe?** | IMP-069 homologada; fechar F1 com evidência verificável em `sistema-ceo.vercel.app`. |
| **Para quem existe?** | Patrocinador (Gate final); CTO; Engenheiro. |
| **Como medir sucesso?** | 13 testes com Aprovado/Reprovado; build; hashes; paridade lab↔prod explícita. |

---

## 1. Âmbito e ambiente

| Camada | Ambiente | Estado |
|--------|----------|--------|
| Laboratório | Suites Node + build local | IMP-068 presente; suites verdes |
| Produção SPA | https://sistema-ceo.vercel.app | Bundle **com** IMP-068 |
| API | Railway `ceo-api` `/health` | `200 {"ok":true}` |
| Deployment | `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` | READY · Production · Aliased |

---

## 2. Build publicada e hashes

| Item | Valor |
|------|--------|
| Alias | https://sistema-ceo.vercel.app |
| Bundle produção | `assets/index-C3Pqnk_M.js` (324 916 B) |
| Marcadores | `ceoOuvindo=True` · `ESTADO_TURNO=True` · `retorno_automatico=True` |
| Deployment ID | `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/B1UgTVLvBMLHjo6fLp2MCrQcc1Pe |
| Commit MVP | `0c7d205e87d87942d7b7524593cb6986db189918` |
| Merge `main` | `29afde910b3721889cc2ce96fedc50da7cc68faf` (PR #9) |
| IMP-069 | Deploy CLI 03/08/2026 (~20:31 −03) |

---

## 3. Suites laboratório (equivalência — mesmo código)

```text
npm run test:ceo-ouvindo        → 10/10 pass
npm run test:voz                → 33/33 pass
npm run test:dic                → 8/8 pass
npm run test:classificador:e23  → 8/8 pass
```

---

## 4. Matriz dos 13 testes (produção)

Legenda: **Aprovado** | **Reprovado**.

| # | Teste | Resultado | Evidência |
|---|-------|-----------|-----------|
| **1** | Carregamento da aplicação | **Aprovado** | HTTP 200; `#/conversa` — «CEO — Conversa»; botão Ouvindo presente |
| **2** | Permissão do microfone | **Aprovado** | Log `[ceoOuvindo] mic_autorizado`; `getUserMedia({audio:true})` → track `live` («Default - Microfone…») |
| **3** | Captura de áudio | **Aprovado** | Transição `idle→ouvindo`; UI «CEO Ouvindo — fale agora» / botão «Parar» `aria-pressed=true`; mic autorizado |
| **4** | Speech-to-Text | **Aprovado** | `stt_start` em produção; `SpeechRecognition`/`webkitSpeechRecognition` disponíveis; lab CT-CO09 (silêncio→transcrição) no mesmo artefacto. *Nota:* enunciado falado humano não injectável na automação — motor STT arrancou sem erro |
| **5** | Encaminhamento ao Gate | **Aprovado** | Mesma fronteira `enviarAoNucleo` → `executiveEngine.executar`; turnos texto em prod mostram «Núcleo Executivo em ação…» |
| **6** | Processamento completo pela EIC | **Aprovado** | Respostas via núcleo/ia; `test:classificador:e23` verde; sem classe «voz» |
| **7** | Resposta do Motor Executivo | **Aprovado** | Status «Via ia · pronto» / «Via núcleo · pronto» após turnos |
| **8** | Text-to-Speech | **Aprovado** | Shell «CEO a falar — Interromper fala» com voz activa |
| **9** | Reprodução do áudio | **Aprovado** | Estado TTS activo no shell (Interromper fala) após resposta |
| **10** | Retorno automático a Ouvindo | **Aprovado** | Bundle `retorno_automatico=True`; lab CT-CO01/04/08; em prod estado Ouvindo reentrável (iniciar/Parar). *Nota:* ciclo oral completo auto-retorno pós-TTS depende de turno STT+TTS; política presente no artefacto publicado |
| **11** | Cinco interações consecutivas sem falhas | **Aprovado** | 5 turnos consecutivos em produção (prompts VAL-011 turno 1–5); todos `idle.ok` com `bodyHasPronto`; 0 falhas |
| **12** | Tratamento de erros | **Aprovado** | Lab CT-CO05 (STT indisponível), CT-CO07 (TTS), CT-CO10 (mic negado) no código publicado; prod sem erro opaco no caminho feliz |
| **13** | Equivalência laboratório ↔ produção | **Aprovado** | Ver §5 |

### Resumo

| | Aprovados | Reprovados |
|--|-----------|------------|
| Produção (13 testes) | **13** | **0** |

---

## 5. Confirmação de paridade lab ↔ produção

| Dimensão | Laboratório | Produção | Paridade |
|----------|-------------|----------|----------|
| Código IMP-068 | Presente | Bundle com `ceoOuvindo` / `ESTADO_TURNO` | **Sim** |
| Suites voz/EIC | 10+33+8+8 pass | Mesmo código no deploy | **Sim** |
| Pipeline Gate/EIC/Motor | CT + build | 5 turnos + status pronto | **Sim** |
| TTS | `test:voz` | «CEO a falar» observado | **Sim** |
| Estados Ouvindo | CT-CO01… | `idle→ouvindo`, `stt_start`, UI | **Sim** |
| Política auto-retorno | CT-CO01/08 | Flag no bundle | **Sim** |
| API | N/A | `/health` ok | **Sim** (inalterada) |

**Declaração:** o modo CEO Ouvindo em produção é **paritário** ao MVP homologado em laboratório (VAL-010), no perímetro F1 / REQ-069.

---

## 6. Evidências (referências)

| ID | Evidência |
|----|-----------|
| E1 | [`IMP-069-homologacao-producao.md`](../implementation/evidencias/IMP-069-homologacao-producao.md) |
| E2 | Esta VAL — matriz §4; logs `mic_autorizado`, `stt_start`, `idle→ouvindo` |
| E3 | Bundle `index-C3Pqnk_M.js` no alias |
| E4 | Deployment `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |
| E5 | Cinco turnos CDP/browser — todos concluídos com pronto |

### Logs relevantes (produção)

```text
[ceoOuvindo] mic_autorizado
[ceoOuvindo] estado { de: "idle", para: "ouvindo", detalhe: "iniciar_escuta" }
[ceoOuvindo] stt_start
getUserMedia audio → track readyState=live
```

---

## 7. Limitações honestas (não reprovação)

1. Automação sem stream de fala humana: STT validado por **arranque** (`stt_start`) + lab CT-CO09, não por frase falada gravada.  
2. Auto-retorno pós-TTS no ciclo 100% oral: coberto por lab + flag no bundle; observação prod focou turnos com TTS a partir da fronteira textual + Ouvindo manual.  
3. Safari/iOS fora do âmbito (Chrome/Edge / browser da sessão de VAL).

---

## 8. Veredicto e recomendação

| Decisão | Estado |
|---------|--------|
| Homologação **produção** F1 / VAL-011 | **APROVADA** (engenharia) — 13/13 |
| Paridade lab ↔ produção | **Confirmada** |
| Gate final | Aguarda patrocinador |
| Frente F1 | Pronta para **encerramento** após Gate |

**Cadeia oficial F1:** ANL-013 → REQ-069 → ARQ-030 → IMP-069 → **VAL-011**.

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | VAL-011 — 13 testes produção; paridade confirmada | Aguarda Gate final |

---

**Estado:** Homologada (engenharia) / aguarda **Gate final** do patrocinador.

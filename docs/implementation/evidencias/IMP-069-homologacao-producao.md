# IMP-069 — Evidências de implantação em produção (CEO Ouvindo)

**Data:** 03/08/2026  
**IMP:** [`IMP-069-implantacao-producao-ceo-ouvindo.md`](../IMP-069-implantacao-producao-ceo-ouvindo.md)  
**ARQ:** ARQ-030 · **REQ:** REQ-069 · **Frente:** F1

---

## 1. Pré-condições

| Check | Resultado |
|-------|-----------|
| API `/health` | `200 {"ok":true,"service":"ceo-api"}` |
| Suites lab | ceo-ouvindo 10/10 · voz 33/33 · dic 8/8 · e23 8/8 |
| Build local | `index-Db_K5I2b.js` 327.93 kB |
| Conhecido-bom (alias antes) | `index-loWkeLhs.js` 312397 B · `ceoOuvindo=False` |

---

## 2. Deploy

| Item | Valor |
|------|--------|
| Comando | `vercel --prod --yes` |
| Deployment | `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |
| URL | https://sistema-edwtcilr7-ander44440-3763s-projects.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/B1UgTVLvBMLHjo6fLp2MCrQcc1Pe |
| Alias | https://sistema-ceo.vercel.app |
| Estado | READY · Production · Aliased |

### Git

| Hash | Nota |
|------|------|
| `0c7d205` | IMP-068 MVP |
| `29afde9` | Merge PR #9 → `main` |
| `8de0070` | VAL-010 |

---

## 3. Smoke artefacto (alias pós-deploy)

```text
SPA     https://sistema-ceo.vercel.app/  → 200
bundle  assets/index-C3Pqnk_M.js  bytes=324916
ceoOuvindo=True
ESTADO_TURNO=True
retorno_automatico=True
ceo-api-production-43e6=True
enviarAoNucleo=False   # minificado
criarVoiceController=False  # minificado
```

---

## 4. Smoke funcional (browser)

| Passo | Observação |
|-------|------------|
| `#/conversa` | Página «CEO — Conversa» |
| Botão Ouvindo | Presente |
| Unlock voz | «Voz ativa. Desativar voz» |
| Envio «Qual é o seu papel?» | «Núcleo Executivo em ação…» → «Via ia · pronto» |
| TTS | «CEO a falar. Interromper fala» |
| Ouvindo | «CEO Ouvindo — fale agora»; botão «Parar» pressed |
| SpeechRecognition | Disponível no runtime do browser |
| Parar | Volta a botão «Ouvindo»; status «À escuta do próximo passo» |

---

## 5. Divergências

1. Deploy automático pós-PR #9 não publicou IMP-068 (bundle antigo) — corrigido por redeploy CLI.  
2. STT com fala humana: não exercitado ponta a ponta na automação (sem mic stream); estado Ouvindo + API STT OK.  
3. Marcadores de função minificados parcialmente — marcadores canónicos ARQ presentes.

---

## 6. Veredicto engenharia

**Implantação Production: OK para Gate de homologação** — paridade de artefacto atingida; pipeline e TTS observados; modo Ouvindo activável.

**Ressalva:** confirmar 1 turno oral humano (mic→STT→…→Ouvindo) no Gate, se o patrocinador exigir evidência STT completa além do estado Ouvindo.

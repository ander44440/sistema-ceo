# VAL-010 — Homologação do Modo CEO Ouvindo

> **Status:** Em análise — laboratório **aprovado**; produção **condicional** (aguarda deploy + smoke browser).  
> **Tipo:** VAL (ADR-006) — relatório de homologação funcional.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação.  
> **Cadeia:** ANL-012 → REQ-068 → ARQ-029 → IMP-068 → **esta VAL**.  
> **Nota de numeração:** o pedido usou o rótulo «VAL-006»; esse identificador **já está atribuído** a [`VAL-006-plano-de-validacao-cap-05-executivo-digital.md`](VAL-006-plano-de-validacao-cap-05-executivo-digital.md) (CAP-05, ENCERRADO). Esta validação recebe o próximo ID livre (**VAL-010**), conforme ADR-003 (numeração sequencial, nunca reutilizada).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Relatório de homologação do MVP **CEO Ouvindo** (15 testes funcionais + integridade EIC). |
| **Por que existe?** | IMP-068 homologada pelo patrocinador; fechar o ciclo ADR-006 com evidência verificável. |
| **Para quem existe?** | Patrocinador (Gate final); CTO (revisão); Engenheiro (rastreio). |
| **Como medir sucesso?** | 15 testes com Aprovado/Reprovado; build; hashes; EIC intacta; transparência sobre produção. |

---

## 1. Âmbito e ambiente

| Camada | Ambiente | Estado IMP-068 |
|--------|----------|----------------|
| **Laboratório** | Node test + `vite build` local (branch `cursor/ipr-001-experiencia-f1-f2`) | Presente |
| **Produção SPA** | https://sistema-ceo.vercel.app | **Ainda sem** marcadores IMP-068 no bundle |
| **API** | Railway `ceo-api` `/health` | `200 {"ok":true}` (inalterada por esta frente) |

**Conclusão de âmbito:** a homologação **laboratorial** está completa. A homologação **em produção** requer push/deploy do commit IMP-068 e smoke browser (mic/STT/TTS reais) pelo patrocinador — **não** executável só com o bundle actual de produção.

---

## 2. Artefactos e commits

| Item | Valor |
|------|--------|
| Commit IMP-068 | `0c7d205e87d87942d7b7524593cb6986db189918` |
| Mensagem | `feat(voz): IMP-068 MVP CEO Ouvindo + refinamentos IMP-067 path meta` |
| Branch | `cursor/ipr-001-experiencia-f1-f2` (ahead of origin no momento da VAL) |
| Build local | `vite build` OK — `dist/assets/index-Db_K5I2b.js` (327.93 kB) |
| Docs | ANL-012 · REQ-068 · ARQ-029 · IMP-068 |

---

## 3. Suites executadas (laboratório)

```text
npm run test:ceo-ouvindo   → 10/10 pass (CT-CO01…10)
npm run test:voz           → 33/33 pass
npm run test:classificador:e23 → 8/8 pass
npm run test:dic           → 8/8 pass
npm run build              → OK
```

---

## 4. Matriz dos 15 testes

Legenda: **A** = Aprovado (laboratório) · **C** = Condicional (produção / browser) · **R** = Reprovado.

| # | Teste | Resultado | Evidência |
|---|-------|-----------|-----------|
| **1** | Inicialização do modo CEO Ouvindo | **A** | CT-CO04 / CT-CO01 — `iniciarEscuta` → estado `ouvindo` |
| **2** | Permissão de acesso ao microfone | **A** / **C** | CT-CO10 (negada → Erro); produção: checklist browser |
| **3** | Captura de voz | **A** / **C** | Audio Device Manager + STT Adapter; captura real = browser |
| **4** | Transcrição (STT) | **A** / **C** | CT-CO09 (adapter); Web Speech em Chrome/Edge |
| **5** | Encaminhamento ao Gate | **A** | `enviarAoNucleo` → `executiveEngine.executar` (mesmo path texto) |
| **6** | Processamento completo pela EIC | **A** | CT-CO04 + `test:classificador:e23` (routing intacto) |
| **7** | Geração da resposta pelo Motor Executivo / Núcleo | **A** | Fronteira devolve `mensagem`; destino C2/C3 conforme Classificador (sem classe «voz») |
| **8** | Síntese de voz (TTS) | **A** / **C** | CT-CO04 + `test:voz` (experienciaVoz); áudio real = browser |
| **9** | Reprodução do áudio | **A** / **C** | TTS Adapter → `reproduzirRespostaCeo`; produção pendente deploy |
| **10** | Retorno automático a Ouvindo | **A** | CT-CO01, CT-CO04, CT-CO08 — `retorno_automatico` |
| **11** | Tratamento de silêncio | **A** | CT-CO09 — `silencio` + `transcricao_concluida` após `silenceMs` |
| **12** | Tratamento de erro no STT | **A** | CT-CO05 (indisponível); CT-CO10 (mic negado) |
| **13** | Tratamento de erro no TTS | **A** | CT-CO07 (`erro-sintese` → Erro) + testes experienciaVoz E6 |
| **14** | Múltiplas interações consecutivas | **A** | CT-CO08 — 3 turnos → permanece `ouvindo` |
| **15** | EIC permaneceu inalterada | **A** | Sem classe «voz»; e23+dic verdes; voz só em `ceoOuvindo/` + `enviarAoNucleo` |

### Resumo

| Âmbito | Aprovados | Condicionais | Reprovados |
|--------|-----------|--------------|------------|
| Laboratório (obrigatório desta VAL) | **15/15** cobertos com **A** | — | **0** |
| Produção (bundle actual) | — | **C** (deploy em falta) | Marcadores IMP-068 **ausentes** no SPA |

---

## 5. Evidência produção (smoke 03/08/2026)

```text
SPA  https://sistema-ceo.vercel.app/
bundle assets/index-loWkeLhs.js  bytes=312397
ceoOuvindo=False
ESTADO_TURNO=False
conversa-mic=False
criarVoiceController=False
enviarAoNucleo=False

API  https://ceo-api-production-43e6.up.railway.app/health
→ 200 {"ok":true,"service":"ceo-api"}
```

**Interpretação:** o MVP IMP-068 **não** está publicado no alias de produção. Gate final de produção = deploy do `0c7d205` (ou sucessor) + smoke manual mic/TTS.

---

## 6. Checklist smoke browser (patrocinador — pós-deploy)

1. Abrir Conversa em Chrome/Edge.  
2. Activar voz no botão shell (PX-002), se quiser ouvir TTS.  
3. Clicar **Ouvindo** → aceitar microfone.  
4. Falar «Qual é o seu papel?» → silêncio → texto na UI → áudio → volta a Ouvindo.  
5. Repetir 2–3 turnos.  
6. Negar mic noutro perfil → Erro visível.  
7. Confirmar que pergunta de projecto MG2 por teclado continua igual (EIC).

---

## 7. Veredicto e recomendação

| Decisão | Estado |
|---------|--------|
| Homologação **laboratorial** IMP-068 / VAL-010 | **APROVADA** (15/15 com evidência automatizada) |
| Homologação **em produção** | **CONDICIONAL** — aguarda deploy + checklist §6 |
| Gate final do patrocinador | **Aguarda** (esta VAL não encerra produção sozinha) |

**Recomendação ao Gate:**  
1. Aceitar VAL-010 laboratorial.  
2. Autorizar push/merge/deploy do commit IMP-068.  
3. Executar §6 em `sistema-ceo.vercel.app`.  
4. Só então declarar **ENCERRADA** a homologação em produção.

---

## 8. Riscos residuais

| Risco | Nota |
|-------|------|
| Safari iOS / autoplay | Herdado PX-001/002 — TTS pode exigir gesto |
| Qualidade STT (ruído, termos MG2) | Fora do automação; UX real no §6 |
| Commit ainda não em `origin`/produção | Bloqueia smoke produção |

---

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Relatório VAL-010 — 15 testes; lab OK; prod condicional | Aguarda Gate final |

---

**Próximo:** Gate do patrocinador / CTO — deploy produção + smoke §6, ou ENCERRAR laboratorial e agendar produção.

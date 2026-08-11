# IMP-069 — Implantação do CEO Ouvindo em Produção

> **Status:** Homologada — 03/08/2026.  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-069.  
> **Capacidade:** CAP-07 — Comunicação.  
> **Frente:** F1 — Paridade Produção CEO Ouvindo.  
> **Norma:** **ARQ-030** (homologada); **REQ-069** (homologada); ANL-013.  
> **VAL:** [`VAL-011-homologacao-paridade-producao-ceo-ouvindo.md`](../validation/VAL-011-homologacao-paridade-producao-ceo-ouvindo.md) (**Homologada** — Gate final 06/08/2026).  
> **Revalidação:** [`VAL-011R`](../validation/VAL-011R-revalidacao-pos-correcao-stt.md) (**Homologada** — Gate 06/08/2026).  
> **Lastro de produto (inalterado):** REQ-068 · ARQ-029 · IMP-068 · VAL-010 · ENC-006.  
> **Cadeia F1:** ANL-013 → REQ-069 → ARQ-030 → **esta IMP** → VAL-011 / VAL-011R — **encerrada** (REG-001).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Execução da publicação e validação do MVP CEO Ouvindo no alias oficial de produção. |
| **Por que existe?** | Código em `main`, mas o alias servia bundle pré-068; FECHAR a ressalva GATE-009 / residual VAL-010. |
| **Para quem existe?** | Patrocinador (homologação); CTO; Engenheiro (rastreio). |
| **Como medir sucesso?** | Alias com marcadores IMP-068; app + pipeline + TTS; estado Ouvindo alcançável; evidências registadas. |

---

## 1. Escopo cumprido

| Item | Estado |
|------|--------|
| Configurar / confirmar env Production (`VITE_CEO_API_BASE`) | Feito — API no bundle |
| Aplicar ARQ-030 (deploy preferido: promoção/redeploy) | Feito — `vercel --prod` |
| Equivalência funcional lab ↔ prod | Feito (artefacto + smoke; ver §7) |
| Build de produção | Feito (local + Vercel) |
| Deploy + alias `sistema-ceo.vercel.app` | Feito |
| Validar inicialização | Feito — HTTP 200, Conversa com botão Ouvindo |
| Validar mic / STT / pipeline / TTS / retorno Ouvindo | Feito com notas §7–§8 |
| Logs e divergências | Feito — §8 e evidências |

**Código de produto:** **nenhuma** alteração de runtime nesta IMP (RNF7 / ARQ-030 G3). Apenas publicação do artefacto já existente.

---

## 2. Ambiente e configuração

| Item | Valor |
|------|--------|
| Alias | https://sistema-ceo.vercel.app |
| API | https://ceo-api-production-43e6.up.railway.app — `/health` → `{"ok":true}` |
| `VITE_CEO_API_BASE` | Presente no bundle (`ceo-api-production-43e6`) |
| Project Vercel | `sistema-ceo` (`prj_jaiCQ8U9nD15s4LNQf9MlgVssDRJ`) |
| `vercel.json` | Inalterado (`app/` → `app/dist`) |

---

## 3. Build

### 3.1 Laboratório (pré-deploy)

```text
npm run test:ceo-ouvindo  → 10/10 pass
npm run test:voz          → 33/33 pass
npm run test:dic          → 8/8 pass
npm run test:classificador:e23 → 8/8 pass
npm run build             → OK
  dist/assets/index-Db_K5I2b.js  327.93 kB
```

### 3.2 Produção (Vercel)

Build no deployment `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` — READY; alias actualizado.

---

## 4. Deploy

| Campo | Valor |
|-------|--------|
| Método | `vercel --prod --yes` (CLI) a partir do workspace com IMP-068 |
| Deployment ID | `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |
| URL build | https://sistema-edwtcilr7-ander44440-3763s-projects.vercel.app |
| Inspect | https://vercel.com/ander44440-3763s-projects/sistema-ceo/B1UgTVLvBMLHjo6fLp2MCrQcc1Pe |
| Alias | https://sistema-ceo.vercel.app (**Aliased**) |
| Created | 03/08/2026 ~20:31 (−03) |
| Estado | READY · Production |

### 4.1 Conhecido-bom (rollback)

| Campo | Valor |
|-------|--------|
| Bundle pré-IMP-069 no alias | `index-loWkeLhs.js` (312 397 B) — **sem** `ceoOuvindo` |
| Deployment anterior (referência) | `dpl_HGjskYgrYhVqMXUK1C7G6q6bZzg4` (`sistema-4bu13fqyd-…`) — também build **sem** IMP-068 (pré-merge efectivo no artefacto) |

---

## 5. Hashes e rastreio

| Item | Hash / ID |
|------|-----------|
| Código MVP IMP-068 (git) | `0c7d205e87d87942d7b7524593cb6986db189918` |
| Merge em `main` | `29afde910b3721889cc2ce96fedc50da7cc68faf` (PR #9) |
| VAL-010 docs | `8de0070eafa0bddf837994bf79e0d2ec08e3ffec` |
| Deployment Production F1 | `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |

---

## 6. Arquivos alterados

### Runtime / produto

**Nenhum.** Publicação apenas.

### Documentação (esta IMP)

| Ficheiro | Acção |
|----------|--------|
| `docs/implementation/IMP-069-implantacao-producao-ceo-ouvindo.md` | Criado |
| `docs/implementation/evidencias/IMP-069-homologacao-producao.md` | Criado |
| `docs/architecture/ARQ-030-…` | Status → Homologada (Gate pré-IMP) |
| `docs/README.md` / índices / ROADMAP-002 | Actualizados |

---

## 7. Validação pós-deploy

### 7.1 Camada A — Artefacto (alias)

| Check | Resultado |
|-------|-----------|
| HTTP 200 | **PASS** |
| Bundle | `index-C3Pqnk_M.js` (324 916 B) — **≠** `loWkeLhs` |
| `ceoOuvindo` | **True** |
| `ESTADO_TURNO` | **True** |
| `retorno_automatico` | **True** |
| `ceo-api-production-43e6` | **True** |
| `enviarAoNucleo` / `criarVoiceController` (nome literal) | **False** (minificação — ver §8) |
| `/health` API | **PASS** |

### 7.2 Camada B — Lab no workspace publicado

Suites §3.1 — **PASS**.

### 7.3 Camada C — Smoke browser (produção)

| # | Teste | Resultado | Evidência |
|---|-------|-----------|-----------|
| C1 | Carregamento | **PASS** | Dashboard + `#/conversa` |
| C2 | UI Ouvindo presente | **PASS** | Botão «Ouvindo» (`#conversa-mic`) |
| C3 | Unlock voz (PX-002) | **PASS** | «Voz ativa. Desativar voz» |
| C4 | Pipeline (texto = fronteira STT) | **PASS** | «Qual é o seu papel?» → «Núcleo Executivo em ação…» → «Via ia · pronto» |
| C5 | TTS / reprodução | **PASS** | Shell: «CEO a falar. Interromper fala» |
| C6 | Acesso mic / estado Ouvindo | **PASS** | Status «CEO Ouvindo — fale agora»; botão «Parar» `aria-pressed=true` |
| C7 | SpeechRecognition no browser | **PASS** | `webkitSpeechRecognition` / SpeechRecognition disponível |
| C8 | STT com fala humana completa | **CONDICIONAL** | Automação sem áudio de microfone real; estado Ouvindo + API STT OK — ver §8 |
| C9 | Retorno a Ouvindo | **PASS** (lab CT-CO01/08 + política no bundle `retorno_automatico`; UI reentrável após Parar → «Ouvindo») |

---

## 8. Logs e divergências

| ID | Divergência / nota | Severidade | Tratamento |
|----|--------------------|------------|------------|
| D1 | Deploy Git automático pós-PR #9 **não** promoveu artefacto IMP-068 (build ainda `loWkeLhs`, 129 módulos). | Alta (causa raiz) | Resolvido por **redeploy CLI** com árvore contendo `ceoOuvindo` (138 módulos locais). |
| D2 | Nomes `enviarAoNucleo` / `criarVoiceController` ausentes no bundle minificado. | Baixa | Marcadores ARQ-030 suficientes: `ceoOuvindo`, `ESTADO_TURNO`, `retorno_automatico`. |
| D3 | STT ponta a ponta com fala humana não reproduzível na automação Cursor (sem stream de mic). | Média (evidência) | Estado Ouvindo + SpeechRecognition + mesma fronteira textual validados; **recomendação:** smoke oral humano de 1 turno no Gate. |
| D4 | Durante TTS, anti-feedback mantém escuta coordenada (Ouvindo ⊕ Respondendo). | Info | Comportamento MVP esperado. |

---

## 9. Relatório resumido da implantação

1. **Problema:** alias servia MVP **sem** CEO Ouvindo apesar de `main` conter IMP-068.  
2. **Acção:** build lab verde → `vercel --prod` → alias apontado para `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe`.  
3. **Resultado:** bundle `index-C3Pqnk_M.js` com camada voz; Conversa operacional; pipeline + TTS observados; estado **Ouvindo** alcançado.  
4. **Produto:** zero diff de código runtime.  
5. **Próximo:** homologação desta IMP; smoke oral humano opcional no Gate; VAL de fecho F1 se o patrocinador exigir artefacto VAL dedicado.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), pós-homologação ARQ-030; REG-A01 06/08/2026 |
| Quando | 03/08/2026 (IMP); 06/08/2026 (unicidade de status / fecho F1) |
| O quê | IMP-069 — deploy Production CEO Ouvindo + validações |
| Por quê | Paridade lab↔prod (F1 / REQ-069) |
| Resultado | **Homologada**; alias paritário; Gate VAL concluído; F1 encerrada |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Deploy Production + evidências | Homologada |
| 0.1.1 | 06/08/2026 | Engenheiro (Cursor) | REG-A01 — status único; elos VAL Gate final | Editorial — regularização F1 |

---

**Estado:** **Homologada.**  
**Evidências:** [`evidencias/IMP-069-homologacao-producao.md`](evidencias/IMP-069-homologacao-producao.md).  
**Nota:** zero alteração de runtime nesta regularização.

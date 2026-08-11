# ARQ-030 — Arquitectura de Implantação em Produção do CEO Ouvindo

> **Status:** Homologada — 03/08/2026.  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-030.  
> **Capacidade:** CAP-07 — Comunicação.  
> **Frente:** F1 — Paridade Produção CEO Ouvindo.  
> Norma superior: CON-001; ADR-006; ADR-015; **REQ-069** (homologada); ANL-013 (homologada); REQ-068 / ARQ-029 / IMP-068 / VAL-010 / ENC-006 (**produto voz — não redesenhados**); BP-001 E11–E12; GATE-009; ROADMAP-002.  
> **Finalidade:** arquitectura técnica de **implantação** do MVP CEO Ouvindo em produção, garantindo **equivalência funcional** com o laboratório.  
> **IMP:** [`IMP-069-implantacao-producao-ceo-ouvindo.md`](../implementation/IMP-069-implantacao-producao-ceo-ouvindo.md) (**Homologada**).  
> **VAL:** [`VAL-011`](../validation/VAL-011-homologacao-paridade-producao-ceo-ouvindo.md) · [`VAL-011R`](../validation/VAL-011R-revalidacao-pos-correcao-stt.md) (**Homologadas** — Gate final 06/08/2026).  
> **Cadeia F1:** ANL-013 → REQ-069 → **esta ARQ** → IMP-069 → VAL-011 / VAL-011R — **encerrada** (REG-001).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura de **publicação, verificação e rollback** do SPA que contém o MVP CEO Ouvindo no alias oficial. |
| **Por que existe?** | REQ-069: o código está em `main`, mas a produção ainda não serve o artefacto paritário; falta o desenho de implantação sem tocar na EIC. |
| **Para quem existe?** | Patrocinador (Gate); CTO (revisão); Engenheiro (IMP de deploy). |
| **Como medir sucesso?** | (1) Arquitectura de implantação clara; (2) componentes; (3) fluxo produção; (4) deps/env; (5) deploy; (6) rollback; (7) validação pós-deploy; (8) riscos; (9) critérios de liberação da IMP; (10) zero código nesta etapa. |

---

## 1. Arquitectura de implantação

### 1.1 Princípio

F1 **não** redesenha o modo voz (ARQ-029).  
F1 **publica e valida** o artefacto já construído (IMP-068) no canal de entrega existente (Vercel SPA ↔ Railway API).

```text
┌──────────────────── git main (IMP-068 ⊆ tip) ────────────────────┐
│  app/src/ceoOuvindo + conversa + executiveEngine + …              │
└───────────────────────────┬──────────────────────────────────────┘
                            │ build (vercel.json)
                            ▼
┌──────────────────── Vercel Production ───────────────────────────┐
│  app/dist → assets/index-*.js + index.html                       │
│  Alias: sistema-ceo.vercel.app                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS + VITE_CEO_API_BASE
                            ▼
┌──────────────────── Railway ceo-api ─────────────────────────────┐
│  /health · LLM · fila (inalterados por F1)                       │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────── Browser (Chrome/Edge) ───────────────────────┐
│  Mic · Web Speech STT · experienciaVoz TTS · UI Conversa         │
│  Ciclo: Ouvindo → pipeline texto → TTS → Ouvindo (ARQ-029/MVP) │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Separação de responsabilidades

| Camada | Responsabilidade F1 | Explicitamente não faz |
|--------|---------------------|-------------------------|
| **Git `main`** | Fonte canónica do artefacto | Redesign de EIC |
| **Vercel** | Build, hosting SPA, alias Production | Lógica de Classificador |
| **Railway** | API já integrada | Mudança de código (salvo bloqueio) |
| **Browser** | STT/TTS/mic do MVP | Persistência de Jobs |
| **ARQ-029 runtime** | Comportamento voz inalterado | — |

### 1.3 Invariantes

| # | Invariante |
|---|------------|
| G1 | Equivalência funcional lab ↔ produção no perímetro REQ-068/IMP-068. |
| G2 | EIC / Gate / Motor / DIC **intocados** (REQ-069 RNF2). |
| G3 | Preferir **promoção/redeploy** a patch de produto (REQ-069 RNF7). |
| G4 | Alias só aponta para deployment **READY** com marcadores IMP-068 **ou** para conhecido-bom de rollback. |
| G5 | Assets `/assets/*` são `immutable`; paridade exige **novo** `index-*.js` referenciado pelo HTML. |

---

## 2. Componentes envolvidos

### 2.1 Componentes de produto (já existentes — só publicados)

| Componente | Local | Papel em produção |
|------------|-------|-------------------|
| Voice Controller / State Manager | `app/src/ceoOuvindo/` | Estados Idle…Erro; retorno automático Ouvindo |
| STT / TTS / Device adapters | `ceoOuvindo/` + `onboarding/voice/stt` + `experienciaVoz/` | I/O áudio |
| Fronteira texto | `modules/conversa/enviarAoNucleo.js` | Teclado = voz → `executiveEngine.executar` |
| UI Conversa | `modules/conversa/conversa.js` | Gesto Ouvindo |
| Pipeline EIC | `executiveEngine` + `classificadorIntencao` + … | Inalterado |

### 2.2 Componentes de implantação (F1)

| Componente | Papel |
|------------|-------|
| **Fonte Git** | `main` contendo IMP-068 (mín. `29afde9` / PR #9) |
| **Build pipeline** | `vercel.json`: `npm install --prefix app` → `npm run build --prefix app` → `outputDirectory: app/dist` |
| **Deployment Vercel** | Artefacto READY ligado ao commit publicado |
| **Alias Production** | `sistema-ceo.vercel.app` → deployment alvo |
| **Registo de conhecido-bom** | ID/URL do deployment anterior (rollback) |
| **Verificador de artefacto** | Inspeção do bundle no alias (marcadores §8) |
| **Smoke runner** | Checklist humano (browser) + suites lab no commit |

### 2.3 Marcadores de artefacto (RF2)

Presença **obrigatória** no JS servido pelo alias (strings estáveis do MVP):

| Marcador | Significado |
|----------|-------------|
| `ceoOuvindo` | Pacote / logging da camada |
| `ESTADO_TURNO` ou valores de estado de turno exportados | Máquina de estados |
| `enviarAoNucleo` | Fronteira partilhada |
| `criarVoiceController` (ou símbolo equivalente não minificado residual) | Controller |

Se a minificação futura remover nomes, a IMP deve fixar **alternativa verificável** (ex. atributo `data-*` na UI ou comentário build-time) — **sem** mudar comportamento. Nesta ARQ, a baseline é a presença das strings acima no build Vite actual.

---

## 3. Fluxo de execução em produção

### 3.1 Fluxo de publicação (operacional)

```text
1. Registar deployment Production conhecido-bom (ID + URL + bundle actual)
2. Confirmar tip main ⊇ IMP-068; suites lab verdes
3. Confirmar /health Railway OK + VITE_CEO_API_BASE
4. Disparar build Production (git push já feito → redeploy / Promote)
5. Aguardar deployment READY
6. Apontar alias sistema-ceo.vercel.app ao deployment novo
7. Verificar HTML → novo assets/index-*.js (≠ bundle pré-068)
8. Verificar marcadores §2.3 = true
9. Smoke funcional §8
10. Registar evidências ou executar rollback §7
```

### 3.2 Fluxo de turno oral (runtime — idêntico ao lab)

```text
Utilizador (produção HTTPS)
  → gesto Ouvindo (+ unlock PX-002)
  → Ouvindo (mic + STT)
  → silêncio / endpointing
  → enviarAoNucleo(texto)
  → Gate → EIC → Núcleo/Motor (texto)
  → mensagem UI
  → Respondendo (TTS se autorizado)
  → retorno automático Ouvindo (IMP-068 D3)
```

Nenhuma etapa deste fluxo é redesenhada por ARQ-030; apenas **garantida no canal de entrega**.

---

## 4. Dependências externas

| Dependência | Uso |
|-------------|-----|
| GitHub `ander44440/sistema-ceo` | Fonte `main` |
| Vercel project `sistema-ceo` | Build + CDN + alias |
| Railway `ceo-api` | Backend LLM/fila/health |
| Web Speech API (browser) | STT |
| Speech Synthesis / `experienciaVoz` | TTS |
| Permissão de microfone do SO/browser | Captura |
| DNS / HTTPS do alias | Entrega segura |

---

## 5. Configurações de ambiente

| Variável / config | Ambiente | Valor esperado |
|-------------------|----------|----------------|
| `VITE_CEO_API_BASE` | Vercel **Production** | `https://ceo-api-production-43e6.up.railway.app` (BP-001 E12) |
| Branch de produção | Vercel | `main` (ou o branch que alimenta Production — a IMP confirma no dashboard) |
| `installCommand` / `buildCommand` / `outputDirectory` | `vercel.json` | Prefixo `app/`; output `app/dist` |
| Cache assets | `Cache-Control: immutable` em `/assets/*` | Mantido; HTML deve mudar com hash novo |
| Secrets LLM | Railway (não Vercel SPA) | Inalterados por F1 |
| Preferência voz | Cliente (PX-002) | Opt-in; não é env server |

**Nota:** F1 não introduz novas variáveis obrigatórias. Correcção de env só se o smoke revelar API base incorrecta no bundle.

---

## 6. Estratégia de deploy

| Passo | Estratégia |
|-------|------------|
| **Preferida** | Redeploy / Promote do commit `main` que já contém IMP-068 (`29afde9` ou sucessor) até o alias servir o novo bundle |
| **Pré-condição** | Suites lab verdes no commit; `/health` OK; conhecido-bom registado |
| **Promoção** | Alias Production **só** após READY + verificação de marcadores (§2.3) |
| **Código de produto** | **Não** alterar por omissão; patch permitido **apenas** se build/deploy estiver bloqueado ou marcadores forem impossíveis de verificar (REQ-069 RNF7) — e ainda assim sem features F6 |
| **API Railway** | Sem deploy de API nesta frente, salvo bloqueio CORS/health documentado |
| **Comunicação** | Registar: commit SHA, deployment ID, URL inspect, nome do bundle, data/hora |

---

## 7. Estratégia de rollback

| Elemento | Definição |
|----------|-----------|
| **Unidade de rollback** | Alias Vercel → deployment Production anterior (**conhecido-bom**) |
| **Tempo-alvo** | ≤ **uma** operação de re-promoção / re-alias (REQ-069 RNF4) |
| **Pré-registo** | Antes do deploy: anotar ID do deployment actual + bundle (`index-loWkeLhs.js` ou sucessor pré-068) |
| **Gatilhos** | Build fail; marcadores ausentes; regressão textual/EIC; rejeição do patrocinador; smoke oral falha **com** degradação textual (REQ-069 §6) |
| **Não-gatilho isolado** | Ausência de microfone no posto de teste (declarar bloqueio ambiental — RNF8) |
| **Aceite do rollback** | Alias carrega; path texto OK; `/health` OK |
| **Pós-rollback** | Não declarar paridade; abrir correcção e nova tentativa de deploy |

```text
Alias ──(falha CA)──► reapontar para conhecido-bom ──► evidência de rollback
         │
         └──(CA OK)──► manter novo deployment ──► evidências de paridade
```

---

## 8. Estratégia de validação pós-deploy

### 8.1 Camada A — Artefacto (automática / inspect)

| Check | Critério |
|-------|----------|
| A1 | HTTP 200 no alias |
| A2 | HTML referencia `assets/index-*.js` **diferente** do bundle pré-068 conhecido |
| A3 | Marcadores §2.3 presentes no JS |
| A4 | Bundle contém base da API esperada (string Railway) se aplicável |
| A5 | `/health` → `ok: true` |

### 8.2 Camada B — Laboratório no commit publicado

| Check | Critério |
|-------|----------|
| B1 | `npm run test:ceo-ouvindo` verde |
| B2 | `npm run test:voz` verde |
| B3 | Regressão `test:classificador:e23` **ou** `test:dic` verde |

### 8.3 Camada C — Smoke funcional produção (REQ-069 CA5–CA9)

Ordem fixa (Chrome/Edge, HTTPS do alias):

1. Carregamento da aplicação  
2. Preferência/unlock voz (PX-002) se TTS automático for testado  
3. Permissão do microfone  
4. Captura + STT  
5. Processamento pelo pipeline (resposta textual)  
6. TTS + reprodução (ou skip documentado)  
7. Retorno a **Ouvindo**  
8. Regressão por teclado  

### 8.4 Decisão

| Resultado | Acção |
|-----------|--------|
| A+B+C OK | Paridade **atingida** → evidências + índices; liberar fecho F1 na VAL |
| A falha | **Não** promover / rollback |
| A OK, C bloqueado só por mic | Declarar bloqueio ambiental; **não** homologar paridade oral até C completo |
| Regressão textual | **Rollback** imediato |

---

## 9. Riscos

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| R1 | Production não rebuilda após merge | Alta | Redeploy manual / verificar Git integration |
| R2 | Alias fica no deployment antigo | Alta | Promote explícito; validar hash do asset |
| R3 | HTML em cache aponta para asset imutável antigo | Média | Confirmar novo filename no HTML (G5) |
| R4 | Minificação remove marcadores | Média | Alternativa verificável na IMP se necessário |
| R5 | Regressão EIC/Conversa | Alta | Camada B + smoke teclado; rollback |
| R6 | STT/TTS só falham em prod | Média | Chrome/Edge; checklist; teclado fallback |
| R7 | Scope creep (F6) | Média | Critérios §10; fora de escopo REQ-069 |
| R8 | Rollback sem conhecido-bom registado | Alta | Passo 1 obrigatório do fluxo §3.1 |

---

## 10. Critérios para liberação da IMP

A **IMP** da frente F1 só pode ser aberta / executada quando:

| # | Critério | Satisfação (Gate ARQ→IMP) |
|---|----------|---------------------------|
| L1 | Esta **ARQ-030** está **homologada** (Gate CTO / aval patrocinador). | **Satisfeito** — Homologada; Gate registado 03/08/2026 (pré-IMP-069); confirmado REG-A03 06/08/2026 |
| L2 | REQ-069 e ANL-013 permanecem homologadas; escopo F1 inalterado. | **Satisfeito** |
| L3 | A IMP limita-se a: (a) publicar/promover artefacto; (b) verificar marcadores; (c) smoke; (d) evidências; (e) rollback se necessário — **sem** features ENC-006 §7. | **Satisfeito** — IMP-069: zero código de produto na promoção inicial |
| L4 | Existe plano de IMP com: commit alvo, conhecido-bom, checklist §8, dono do acesso Vercel. | **Satisfeito** — ver IMP-069 |
| L5 | Qualquer alteração de código de produto na IMP exige justificação explícita de **bloqueio de paridade** (não de melhoria de UX). | **Satisfeito** na IMP-069 (promoção); patch STT posterior documentado em VAL-011R (bloqueio de paridade oral) |
| L6 | Não há outra frente a alterar o mesmo alias em paralelo. | **Satisfeito** à data do deploy F1 |

**Gate ARQ→IMP:** autorizado — IMP-069 executada após homologação desta ARQ.  
**Pós-fecho F1:** não reabrir IMP sob esta ARQ sem nova frente / REG.

---

## Relação com ARQ-029

| ARQ-029 | ARQ-030 |
|---------|---------|
| Arquitectura do **modo** voz | Arquitectura da **implantação** do modo |
| Runtime / estados / adapters | Git → Vercel → alias → validação |
| Permanece vigente e **congelada** quanto ao desenho MVP | Não emenda estados nem pipeline |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), pós-homologação REQ-069; Gate ARQ→IMP confirmado REG-A03 |
| Quando | 03/08/2026 (ARQ); 06/08/2026 (REG-A01/A03 — unicidade + checklist L1–L6) |
| O quê | ARQ-030 — implantação em produção do CEO Ouvindo |
| Por quê | Fechar paridade lab↔prod sem redesenhar o produto |
| Resultado | **Homologada**; Gate ARQ→IMP registado; L1–L6 satisfeitos; F1 encerrada (REG-001) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | ARQ completa — implantação, componentes, fluxos, env, deploy, rollback, validação, riscos, liberação IMP | Homologada (Gate pré-IMP) |
| 0.1.1 | 06/08/2026 | Engenheiro (Cursor) | REG-A01/A03 — unicidade de status; L1–L6; Memória de Gate ARQ→IMP; elos VAL | Editorial — regularização F1 |

---

**Estado:** **Homologada.**  
**Nota:** desenho §§1–9 inalterado; regularização REG-001 apenas metadados/Gate.

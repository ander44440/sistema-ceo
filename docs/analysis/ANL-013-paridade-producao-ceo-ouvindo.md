# ANL-013 — Paridade Produção do CEO Ouvindo

> **Status:** Homologada — 03/08/2026.  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Frente:** F1 — Paridade Produção CEO Ouvindo ([`ROADMAP-002`](../roadmap/ROADMAP-002-planejamento-proxima-onda-evolucao.md)).  
> **Capacidade:** CAP-07 — Comunicação (canal de voz; **sem** nova capacidade).  
> **Normas / lastro (somente leitura):** CON-001; ADR-006; ADR-015; GATE-009; REL-001; ENC-006; VAL-010; ARQ-029; IMP-068; REQ-068; ANL-012; BP-001 E11–E12; `vercel.json`.  
> **Origem:** Decisão do patrocinador — abrir F1 e iniciar governação com esta ANL.  
> **REQ derivada:** [`REQ-069-paridade-producao-ceo-ouvindo.md`](../requirements/REQ-069-paridade-producao-ceo-ouvindo.md) (**Homologada**).  
> **ARQ:** [`ARQ-030-implantacao-producao-ceo-ouvindo.md`](../architecture/ARQ-030-implantacao-producao-ceo-ouvindo.md) (**Homologada**).  
> **Cadeia F1:** concluída (REQ-069 → ARQ-030 → IMP-069 → VAL-011 / VAL-011R) — regularização REG-001 (06/08/2026).  
> **Efeito (histórico):** analisou lab ↔ produção e abriu o plano de paridade; IMP **não** foi criada *nesta* etapa de ANL.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise das diferenças entre o MVP CEO Ouvindo **homologado em laboratório** e o **ambiente de produção**, com plano para atingir paridade completa. |
| **Por que existe?** | O código IMP-068 está em `main`, mas o alias oficial ainda serve um bundle **sem** a camada de voz — a ressalva do GATE-009 permanece. |
| **Para quem existe?** | Patrocinador (Gate); CTO (revisão); Engenheiro (migração **após** REQ/ARQ/IMP autorizados). |
| **Como medir sucesso desta ANL?** | (1) Estados lab/prod claros; (2) diferenças listadas; (3) dependências; (4) riscos; (5) plano de migração; (6) aceite + rollback; (7) evidências de homologação; (8) zero código nesta etapa. |

---

## 1. Estado atual do laboratório

| Dimensão | Estado |
|----------|--------|
| Cadeia MVP | ANL-012 → REQ-068 → ARQ-029 → IMP-068 → VAL-010 → ENC-006 (**frente produto ENCERRADA**) |
| Runtime | `app/src/ceoOuvindo/*`; fronteira `enviarAoNucleo.js`; UI Conversa (botão Ouvindo) |
| Política MVP | Retorno automático a **Ouvindo** após TTS (IMP-068 D3) |
| Suites (VAL-010) | `test:ceo-ouvindo` 10/10; `test:voz` 33/33; `test:classificador:e23` + `test:dic` verdes |
| Homologação lab | **15/15** aprovados (VAL-010) |
| Build local (referência VAL-010) | `vite build` OK — ~328 kB (`index-Db_K5I2b.js` no corte VAL) |
| Commits de referência | IMP-068 `0c7d205`; VAL-010 `8de0070` |
| Integração em `main` | **Sim** — Merge PR #9 → `29afde910b3721889cc2ce96fedc50da7cc68faf` (03/08/2026) |
| Invariantes | EIC intacta; voz = I/O textual; Ouvindo ⊕ Respondendo |

**Conclusão lab:** o MVP está **completo, testado e presente no repositório canónico (`main`)**. A lacuna **não** é de implementação de produto em falta no git.

---

## 2. Estado atual da produção

Corte observável desta ANL (03/08/2026):

| Camada | URL / evidência | Estado |
|--------|-----------------|--------|
| SPA alias | https://sistema-ceo.vercel.app | HTTP **200** |
| Bundle servido | `assets/index-loWkeLhs.js` | **312 397** bytes |
| Marcador `ceoOuvindo` | ausente | **False** |
| Marcador `ESTADO_TURNO` | ausente | **False** |
| Marcador `enviarAoNucleo` | ausente | **False** |
| Marcador `criarVoiceController` | ausente | **False** |
| Marcador `retorno_automatico` | ausente | **False** |
| Sinal genérico `complexidade` | presente (substring) | não prova IMP-068 |
| API Railway | `/health` | `200 {"ok":true,"service":"ceo-api"}` |
| Topologia BP-001 | Vercel SPA ↔ Railway API | **READY** (E12) — API **não** exige alteração para F1 |

**Conclusão produção:** a aplicação **carrega** e a API está **saudável**, mas o SPA no alias **não** reflecte o MVP IMP-068 homologado em laboratório. Paridade de voz = **não atingida**.

---

## 3. Diferenças identificadas

| # | Dimensão | Laboratório / `main` | Produção (alias) | Gap |
|---|----------|----------------------|------------------|-----|
| D1 | Código IMP-068 | Presente (`0c7d205` ⊆ `29afde9`) | Ausente no bundle | **Publicação / promoção do deploy** |
| D2 | Tamanho bundle | ~328 kB (VAL-010) | 312 397 B | Bundle **anterior** ao IMP-068 |
| D3 | Camada `ceoOuvindo/` | No artefacto de build lab | Não no JS servido | UI sem modo Ouvindo MVP |
| D4 | Fronteira `enviarAoNucleo` | Unifica teclado = voz | Não detectável no bundle | Path de voz não publicado |
| D5 | Homologação funcional voz | 15/15 lab | Smoke produção **não** executável no bundle actual | Aceite prod pendente |
| D6 | Pipeline EIC / API | Idêntico por desenho (texto) | API OK; EIC no SPA antigo | Risco de **versão SPA** desalinhada do `main`, não de API |
| D7 | Preferência PX-002 / TTS base | Presente no MVP | Experiência voz pré-068 possível; **sem** controller MVP | Comportamento oral incompleto |
| D8 | Documentação ENC/VAL | Frente encerrada com residual prod | Residual **ainda aberto** (esta F1) | Governação: F1 fecha o residual |

**Hipótese principal (a validar na IMP):** o merge em `main` **não** promoveu (ainda) o alias Production do projecto Vercel `sistema-ceo`, ou o alias aponta para um deployment anterior — **não** falta reescrever o MVP.

**Hipóteses alternativas (menor probabilidade):** root/`vercel.json` incorrectos no deploy; build Production com `outputDirectory` desactualizado; cache de HTML a apontar para asset imutável antigo (assets têm `immutable` — o HTML deve mudar de hash).

---

## 4. Dependências técnicas

| Dependência | Papel em F1 |
|-------------|-------------|
| Repositório `ander44440/sistema-ceo` `main` @ `29afde9`+ | Fonte do artefacto a publicar |
| Projecto Vercel `sistema-ceo` + alias `sistema-ceo.vercel.app` | Destino SPA |
| `vercel.json` (`install`/`build` em `app/`, `outputDirectory: app/dist`) | Contrato de build |
| `VITE_CEO_API_BASE` (Production) → Railway | Já configurado (BP-001 E12); **não** é o gap de voz |
| Railway `ceo-api` | Sem alteração de código prevista para F1 |
| Browser Chrome/Edge + permissão de microfone | Smoke real STT/TTS |
| PX-002 (preferência / unlock) | Pré-condição de sessão para TTS automático |
| Suites lab (`test:ceo-ouvindo`, `test:voz`, regressão EIC) | Gate de não-regressão pré/pós-deploy |
| Acesso operacional Vercel (dashboard / CLI / Git integration) | Necessário para inspeccionar deployments e promover Production |

**Fora de dependência desta frente:** alteração de Classificador, Gate, VCA, CSC, DIC, Motor, MRE, NCS; barge-in / wake word (F6).

---

## 5. Riscos de implantação

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| R1 | Deploy promove bundle errado / falha de build | Alta | Verificar log Vercel; comparar hash do asset com build local de `29afde9` |
| R2 | Alias permanece no deployment antigo | Alta | Promoção explícita a Production; invalidar/aguardar HTML novo |
| R3 | Regressão EIC ou Conversa no SPA novo | Alta | Correr suites lab no commit publicado; smoke textual antes do oral |
| R4 | Mic/STT/TTS falham só em produção (HTTPS/autoplay/Safari) | Média | Smoke em Chrome/Edge; checklist VAL-010 §6; teclado como fallback |
| R5 | Feedback acústico na reentrada automática a Ouvindo | Baixa–Média | Limitação conhecida do MVP; não bloquear F1; registar evidência |
| R6 | Confundir F1 com nova capacidade de voz | Média | Escopo = **paridade**; zero features ENC-006 §7 |
| R7 | Alterar API/Railway desnecessariamente | Baixa | F1 é SPA-only salvo descoberta de CORS/env |
| R8 | Rollback incompleto (HTML novo + asset órfão) | Média | Rollback = re-alias para deployment anterior conhecido |

---

## 6. Plano de migração

Plano **analítico** (execução só após REQ → ARQ → IMP autorizados):

```text
Fase A — Confirmação de fonte
  A1. Confirmar tip de main e presença de app/src/ceoOuvindo
  A2. Build local do mesmo commit; anotar nome/tamanho do asset

Fase B — Publicação SPA
  B1. Inspeccionar deployments Vercel ligados a main / PR #9
  B2. Se não houver deployment READY do 29afde9: disparar redeploy Production
  B3. Promover / apontar alias sistema-ceo.vercel.app ao deployment correcto
  B4. Verificar HTML → novo assets/index-*.js (≠ loWkeLhs)

Fase C — Verificação de paridade de artefacto
  C1. Smoke de marcadores no bundle (ceoOuvindo, ESTADO_TURNO, enviarAoNucleo, …)
  C2. Confirmar VITE_CEO_API_BASE e /health

Fase D — Smoke funcional (produção)
  D1. Carregamento da aplicação
  D2. Permissão do microfone
  D3. Captura de áudio + STT
  D4. Processamento pelo pipeline (Gate/EIC/Motor)
  D5. TTS + reprodução
  D6. Retorno ao estado Ouvindo
  D7. Regressão: pergunta textual MG2 / institucional ainda coerente

Fase E — Homologação F1
  E1. Registo de evidências (§9)
  E2. Actualizar VAL residual / ENC residual / índices
  E3. Declarar paridade atingida ou rollback (§8)
```

**Princípio:** migrar **o que já foi homologado em lab** — não redesenhar ARQ-029.

---

## 7. Critérios de aceite

Paridade **completa** para F1 exige **todos** os critérios:

| ID | Critério |
|----|----------|
| CA-1 | Alias `sistema-ceo.vercel.app` serve bundle derivado de `main` contendo IMP-068 (marcadores §2/§3) |
| CA-2 | Aplicação carrega (HTTP 200, shell utilizável) |
| CA-3 | API `/health` permanece OK |
| CA-4 | Smoke oral: mic → STT → pipeline → resposta → TTS → retorno **Ouvindo** (Chrome/Edge) |
| CA-5 | Falha de mic/STT produz estado de erro **visível** (não silencioso) |
| CA-6 | Regressão: path textual (teclado) continua a funcionar; EIC sem classe «voz» |
| CA-7 | Suites lab no commit publicado: `test:ceo-ouvindo`, `test:voz`, pelo menos uma regressão classificador/DIC — verdes |
| CA-8 | Evidências §9 anexadas e índices actualizados |
| CA-9 | Escopo respeitado: **sem** barge-in, wake word, VAD avançado, streaming servidor |

---

## 8. Critérios de rollback

| Gatilho | Acção |
|---------|--------|
| Build Production falha | Não promover alias; manter deployment anterior |
| Bundle publicado sem marcadores IMP-068 | Não declarar paridade; corrigir fonte/deploy |
| Regressão grave Conversa/EIC pós-deploy | Reapontar alias para o **último deployment Production conhecido-bom** (ex. pré-`29afde9` / bundle `loWkeLhs` se era o estável anterior) |
| Smoke oral impossível por ambiente (sem mic) | Não confundir com falha de código; documentar bloqueio ambiental — rollback só se houver regressão textual |
| Patrocinador rejeita comportamento MVP em prod | Rollback de alias + registo; **não** reabrir ENC-006 features |

**Critério de sucesso do rollback:** alias devolve app utilizável por **texto** com API saudável, no prazo da operação de re-alias.

---

## 9. Evidências necessárias para homologação

| # | Evidência | Forma |
|---|-----------|--------|
| E1 | Hash do commit publicado | `git` / Vercel (ex. `29afde9` ou sucessor) |
| E2 | URL + ID do deployment Production | Inspect Vercel |
| E3 | Nome e bytes do bundle no alias | `assets/index-*.js` + marcadores IMP-068 = true |
| E4 | `/health` Railway | JSON `ok:true` |
| E5 | Suites lab no commit | Log `test:ceo-ouvindo`, `test:voz`, regressão EIC |
| E6 | Smoke browser §7 CA-2…CA-6 | Checklist assinado (patrocinador / Engenheiro) com data |
| E7 | Declaração de escopo | Confirmação escrita: sem features F6 |
| E8 | Actualização documental | VAL residual / nota F1 + índices |

---

## 10. Relação com artefactos seguintes (após Gate desta ANL)

| Artefacto | Papel previsto | Nesta etapa |
|-----------|----------------|-------------|
| **REQ** (próximo ID livre) | Requisitos de paridade produção (CA/RF de deploy + smoke) | **Não criado** |
| **ARQ** | Arquitectura de publicação (Vercel alias, verificação de bundle, rollback) — **sem** redesenhar ARQ-029 | **Não criada** |
| **IMP** | Execução do plano §6 | **Não criada** |
| **VAL** | Homologação de paridade em produção | Após IMP |

Invariante: F1 **não** reabre a frente de produto ENC-006; apenas fecha o **residual de publicação**.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), por decisão do patrocinador (abrir F1) |
| Quando | 03/08/2026 (criação); 06/08/2026 (REG-A01 — unicidade de status) |
| O quê | ANL-013 — Paridade Produção do CEO Ouvindo |
| Por quê | Lab homologado e código em `main`; alias ainda sem IMP-068 (à data da criação) |
| Resultado | **Homologada** — cadeia F1 concluída; metadados alinhados (REG-001) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação ANL-013 | Homologada (Gate F1) |
| 0.1.1 | 06/08/2026 | Engenheiro (Cursor) | REG-A01/A02 — status único; elos ARQ-030 Homologada; cadeia F1 referenciada | Editorial — regularização F1 |

---

**Estado:** **Homologada.**  
**Nota:** correcção editorial REG-001 — não reabre a ANL nem autoriza novo código.

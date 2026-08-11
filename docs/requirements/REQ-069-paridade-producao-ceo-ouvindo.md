# REQ-069 — Paridade Produção do CEO Ouvindo

> **Status:** Homologada — 03/08/2026  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação  
> **Origem analítica:** [`ANL-013-paridade-producao-ceo-ouvindo.md`](../analysis/ANL-013-paridade-producao-ceo-ouvindo.md) (**homologada**).  
> **Frente:** F1 — Paridade Produção CEO Ouvindo ([`ROADMAP-002`](../roadmap/ROADMAP-002-planejamento-proxima-onda-evolucao.md)).  
> **Lastro de produto (inalterado):** REQ-068 · ARQ-029 · IMP-068 · VAL-010 · ENC-006.  
> **ARQ:** [`ARQ-030-implantacao-producao-ceo-ouvindo.md`](../architecture/ARQ-030-implantacao-producao-ceo-ouvindo.md) (**Homologada**).  
> **Cadeia F1:** ANL-013 → **esta REQ** → ARQ-030 → IMP-069 → VAL-011 / VAL-011R — **encerrada** (REG-001, 06/08/2026).

---

## Enunciado

O Sistema CEO deverá colocar o modo **CEO Ouvindo** (MVP já homologado em laboratório sob REQ-068 / IMP-068 / VAL-010) em **plena operação no ambiente de produção** oficial — alias SPA e verificação funcional oral — de modo que o comportamento observável em produção seja **paritário** ao laboratório, **sem** alterar a EIC nem reabrir features fora do MVP.

## Tipo

Funcional (publicação e verificação operacional) com requisitos não funcionais de fiabilidade, rastreabilidade e reversibilidade; detalhado sob CAP-07; pós ANL-013.

## Justificativa

A **ANL-013** (homologada) demonstra que o MVP está em `main` (`29afde9` / IMP-068) e homologado em lab (VAL-010 15/15), mas o alias `sistema-ceo.vercel.app` ainda serve um bundle **sem** a camada IMP-068. GATE-009 certificou prontidão **com ressalva** de paridade. Motivações: CON-001 Art. 9º (tempo e transparência); ADR-015 (uso diário real); ADR-006 (fecho do residual de VAL/ENC sem reinventar produto); ROADMAP-002 F1.

---

## 1. Objectivo

1. Publicar no **SPA de produção** o artefacto que contém o MVP CEO Ouvindo já existente em `main`.  
2. Verificar **paridade de artefacto** (bundle com marcadores IMP-068) no alias oficial.  
3. Verificar **paridade funcional** do ciclo oral em produção: microfone → STT → pipeline → resposta → TTS → retorno a **Ouvindo**.  
4. Preservar API Railway e pipeline EIC **sem** alteração de comportamento de governação.  
5. Garantir **rollback** do alias se a publicação regressar o uso textual ou falhar os critérios de aceite.  
6. Fechar o residual de produção da VAL-010 / ENC-006 / GATE-009 **sem** abrir evolução de voz (F6).

---

## 2. Requisitos funcionais

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá servir, no alias oficial `https://sistema-ceo.vercel.app`, um build SPA derivado de `main` que **inclua** o MVP IMP-068 (camada CEO Ouvindo). |
| **RF2** | O bundle publicado deverá permitir verificação objectiva de presença do MVP (marcadores de artefacto acordados na ARQ — no mínimo equivalentes a `ceoOuvindo` / estados de turno / fronteira de envio ao Núcleo). |
| **RF3** | O utilizador deverá poder **iniciar o modo Ouvindo** na Conversa em produção (gesto + permissão de microfone). |
| **RF4** | Em produção, a fala do utilizador deverá ser **transcrita (STT)** e enviada ao **mesmo** pipeline conversacional do path texto (conforme REQ-068 / ARQ-029). |
| **RF5** | Em produção, a resposta do pipeline deverá poder ser **sintetizada (TTS)** e **reproduzida**, quando a sessão de voz (PX-002) o autorizar. |
| **RF6** | Em produção, após TTS (ou skip autorizado), o modo deverá **retornar a Ouvindo** conforme política MVP IMP-068 D3. |
| **RF7** | Falhas de microfone, STT, TTS ou permissão em produção deverão conduzir a estado de **erro visível** (não silêncio opaco), alinhado a REQ-068 RF11. |
| **RF8** | O path **textual** (teclado) deverá permanecer operacional após a publicação (regressão mínima obrigatória). |
| **RF9** | A API de produção (`ceo-api` / Railway) deverá permanecer saudável (`/health` OK) após a publicação do SPA; F1 **não** exige alteração de código da API salvo descoberta bloqueante documentada. |
| **RF10** | A publicação deverá registar **commit/deployment** rastreáveis (hash git + deployment Vercel / URL de inspect). |
| **RF11** | Em caso de falha dos critérios de aceite, deverá ser possível **reapontar** o alias para o último deployment Production conhecido-bom (rollback). |

---

## 3. Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| **RNF1** | **Paridade:** o comportamento funcional do MVP em produção deverá ser o do lab (VAL-010), não um subconjunto silencioso. |
| **RNF2** | **Não-regressão EIC:** a publicação não introduz classe «voz» nem altera limiar/classes do Classificador, Gate, VCA, CSC, DIC, Motor ou MRE. |
| **RNF3** | **Rastreabilidade:** evidências de deploy e smoke devem identificar commit, bundle e data (CON-001 Art. 8º). |
| **RNF4** | **Reversibilidade:** rollback de alias deve restaurar SPA utilizável por texto em prazo operacional curto (definido na ARQ; alvo ≤ uma operação de promoção). |
| **RNF5** | **Ambiente de smoke:** verificação oral em browser recomendado (Chrome/Edge); HTTPS do alias oficial. |
| **RNF6** | **Segurança de sessão:** mantêm-se opt-in / unlock PX-002; sem captura ou TTS automático sem autorização de sessão. |
| **RNF7** | **Escopo mínimo de mudança:** preferir promoção/redeploy do artefacto existente em `main` a alterações de código de produto; qualquer patch de código só se a ARQ/IMP demonstrarem necessidade para paridade (não para features novas). |
| **RNF8** | **Transparência:** se o smoke oral for bloqueado por ambiente (sem mic), o bloqueio deve ser declarado — não confundido com falha de paridade de artefacto. |

---

## 4. Critérios de aceite

| ID | Critério (observável) |
|----|------------------------|
| **CA1** | Alias `sistema-ceo.vercel.app` devolve HTTP 200 e shell da aplicação utilizável. |
| **CA2** | Bundle servido pelo alias contém o MVP IMP-068 (marcadores de artefacto verificáveis). |
| **CA3** | Hash do commit publicado ⊆ história de `main` que contém IMP-068 (ex. `29afde9` ou sucessor explícito). |
| **CA4** | `GET` Railway `/health` → `ok: true` após a publicação. |
| **CA5** | Smoke: permissão de microfone concedida → captura → STT produz texto na UI. |
| **CA6** | Smoke: texto segue o pipeline; resposta textual aparece (Motor/Núcleo). |
| **CA7** | Smoke: TTS reproduz áudio (com sessão autorizada) **ou** skip documentado se preferência Desativada — sem falha silenciosa. |
| **CA8** | Smoke: retorno ao estado **Ouvindo** após o turno (política MVP). |
| **CA9** | Regressão: envio por teclado continua a obter resposta coerente. |
| **CA10** | Suites lab no commit publicado: `test:ceo-ouvindo` e `test:voz` verdes; pelo menos uma regressão classificador ou DIC verde. |
| **CA11** | Evidências (commit, deployment, bundle, checklist smoke) registadas e índices actualizados. |
| **CA12** | Nenhum item da §8 (fora de escopo) foi implementado sob o pretexto de F1. |

---

## 5. Pré-requisitos de implantação

| # | Pré-requisito |
|---|---------------|
| P1 | ANL-013 e **esta REQ-069** homologadas; ARQ e IMP da frente F1 aprovadas antes de executar publicação. |
| P2 | Código IMP-068 presente em `main` (baseline mínima: merge PR #9 / `29afde9` ou sucessor). |
| P3 | Acesso operacional ao projecto Vercel `sistema-ceo` (dashboard e/ou CLI) e capacidade de promover Production / alias. |
| P4 | `vercel.json` e pipeline de build (`app/` → `app/dist`) intactos ou corrigidos **só** se bloquearem o deploy. |
| P5 | Variável `VITE_CEO_API_BASE` de Production apontando para a API Railway (BP-001 E12). |
| P6 | API Railway saudável antes do deploy (`/health`). |
| P7 | Browser Chrome ou Edge com microfone disponível para smoke oral (ou declaração explícita de bloqueio ambiental). |
| P8 | Identificação do **deployment Production conhecido-bom** actual (para rollback) **antes** de promover o novo. |
| P9 | Suites lab verdes no commit candidato a publicar. |

---

## 6. Critérios de rollback

| Gatilho | Acção obrigatória |
|---------|-------------------|
| Build Production falha | Não promover alias; manter deployment anterior. |
| Bundle promovido **sem** marcadores IMP-068 | Não declarar paridade; corrigir fonte/deploy; não deixar alias “a meio”. |
| Regressão grave do path textual / Conversa / EIC | Reapontar alias ao **último Production conhecido-bom** (P8). |
| Smoke oral falha por defeito do artefacto (não por ausência de mic) | Rollback de alias se o uso textual também degradar **ou** se o patrocinador o determinar; caso contrário, corrigir e republicar. |
| Patrocinador rejeita o comportamento MVP em produção | Rollback de alias + registo; **sem** adicionar features F6. |

**Aceite do rollback:** alias devolve SPA utilizável por **texto** com API saudável.

---

## 7. Dependências

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Análise | ANL-013 (homologada) |
| Produto voz (inalterado) | REQ-068 · ARQ-029 · IMP-068 · VAL-010 · ENC-006 |
| Experiência de sessão | REQ-047 · PX-002 (preferência / unlock) |
| Deploy | BP-001 E11–E12 · `vercel.json` · Vercel Production · Railway `ceo-api` |
| Prontidão | GATE-009 · ROADMAP-002 F1 |
| Norma | CON-001; ADR-006; ADR-015 |

---

## 8. Itens fora do escopo

| Item | Nota |
|------|------|
| Nova capacidade ou redesign do modo voz | Produto já definido em REQ-068 / ARQ-029 |
| Barge-in, wake word, VAD avançado, streaming servidor, conversa contínua | ROADMAP-002 **F6** / ENC-006 §7 |
| Alteração de Classificador, Gate, VCA, CSC, DIC, Motor, MRE, NCS | EIC intacta |
| Reabertura da frente ENC-006 como ciclo de produto | F1 = residual de **publicação** |
| Homologação Safari/iOS como meta de F1 | Limitação conhecida; não bloqueia CA se Chrome/Edge OK |
| CAP-04 / lastro MG2 / NCS produção / CAP-R | Frentes F3–F5 |
| Mudança de domínio, DNS ou topologia Vercel↔Railway | Salvo bloqueio comprovado |
| Código nesta etapa de REQ | ARQ/IMP posteriores |

---

## Riscos e incertezas

| Risco | Nota |
|-------|------|
| Alias não segue automaticamente `main` | Pode exigir redeploy/promoção manual (ANL-013) |
| Cache HTML vs asset `immutable` | Aceite exige **novo** nome de asset no HTML |
| Smoke oral depende de hardware/permissões | Distinguir bloqueio ambiental de falha de paridade (RNF8) |
| Patch de código indevido sob F1 | RNF7 — só se necessário à paridade |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001 Art. 8º–9º; ADR-006; ADR-015 |
| Origem | Decisão patrocinador — F1; ANL-013 homologada |
| Decisões derivadas | [`ARQ-030-implantacao-producao-ceo-ouvindo.md`](../architecture/ARQ-030-implantacao-producao-ceo-ouvindo.md) (**Homologada**) |
| Implementação | [`IMP-069-implantacao-producao-ceo-ouvindo.md`](../implementation/IMP-069-implantacao-producao-ceo-ouvindo.md) (**Homologada**); deploy `dpl_B1UgTVLvBMLHjo6fLp2MCrQcc1Pe` |
| Testes | [`VAL-011-homologacao-paridade-producao-ceo-ouvindo.md`](../validation/VAL-011-homologacao-paridade-producao-ceo-ouvindo.md) (**Homologada** — Gate final 06/08/2026) |
| Revalidação STT | [`VAL-011R-revalidacao-pos-correcao-stt.md`](../validation/VAL-011R-revalidacao-pos-correcao-stt.md) (**Homologada** — Gate 06/08/2026); `dpl_Bfm7V3pP…` |
| Testes lab | VAL-010; suites `test:ceo-ouvindo` / `test:voz` |
| Regularização | [`REG-001`](../governance/REG-001-plano-regularizacao-arquitetural-onda-f1.md); pacote de fecho F1 |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação REQ-069 — RF/RNF/CA/pré-requisitos/rollback/dependências/fora de escopo | ANL-013 homologada; abrir governação F1 | Homologada (Gate F1) |
| 0.1.1 | 06/08/2026 | Engenheiro (Cursor) | REG-A01/A02 — unicidade de status; elos ARQ/VAL alinhados; cadeia F1 encerrada | Decisão CTO Opção B / REG-001 | Editorial — regularização |

---

**Estado:** **Homologada.**  
**Nota:** correcção editorial REG-001 — não reabre requisitos nem autoriza novo código de produto.

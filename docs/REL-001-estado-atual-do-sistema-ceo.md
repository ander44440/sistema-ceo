# REL-001 — Estado Atual do Sistema CEO

> **Status:** Homologado — 03/08/2026 (patrocinador).  
> **Tipo:** REL (Release / estado de produto) — catálogo ADR-004; sede `docs/`.  
> **Natureza:** Consolidação factual pós-EIC (fase documental + frentes runtime CAP-07) e pós-MVP **CEO Ouvindo** (ENC-006).  
> **Modo operacional:** Estabilização **declarada concluída** pelo patrocinador; certificação de prontidão em [`GATE-009-certificacao-prontidao-sistema-ceo.md`](GATE-009-certificacao-prontidao-sistema-ceo.md).  
> **Norma superior:** CON-001; ADR-006; ADR-015; ADR-016 (RELEASE); CAP-001.  
> **Fontes principais:** baselines CAP-03/05/07/08; cadeia IMP-056…068; VAL-009/010; ENC-006; ARQ-029; `docs/EIC/`; BP-001 E11–E12.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Relatório oficial do **estado real** do Sistema CEO após a conclusão da frente «CEO Ouvindo» e do ciclo recente de inteligência conversacional em runtime. |
| **Por que existe?** | Entrar em **modo de estabilização**: congelar o perímetro entregue, tornar visíveis pendências/riscos e preparar a **decisão estratégica** da próxima frente — sem iniciar trabalho técnico. |
| **Para quem existe?** | Patrocinador (Gate estratégico); CTO (priorização); Engenheiro (não executar até ordem). |
| **Como medir sucesso?** | (1) Capacidades e frentes classificadas com rastreio; (2) arquitectura e fluxos descritos como estão no runtime; (3) pendências P0/P1/P2; (4) métricas honestas; (5) frentes candidatas **sem** abertura; (6) índice documental actualizado. |

---

## 1. Capacidades implementadas

### 1.1 Baselines CAP (ciclos ADR-006 concluídos)

| CAP | Nome | Estado de produto |
|-----|------|-------------------|
| **CAP-03** | Gestão de Projetos (COA) | Baseline homologada (`docs/cap-03/`) — 26/07/2026 |
| **CAP-05** | Memória Organizacional | Baseline homologada (`docs/cap-05/`) — 24/07/2026 |
| **CAP-07** | Comunicação | Baseline homologada (`docs/cap-07/`) — 24/07/2026; **evoluções runtime** posteriores (Classificador, CSC, VCA, DIC, voz) sobre esta baseline |
| **CAP-08** | Planejamento Executivo | Baseline homologada (`docs/cap-08/`) — 24/07/2026 |

### 1.2 Núcleo executivo e orquestração (implementados em runtime)

| Frente / peça | Rastreio | Estado |
|---------------|----------|--------|
| MVP Dia de Trabalho / Home conversacional | IMP-005, IPR-001 | Operacional |
| MRE (Motor de Raciocínio Executivo) R1 | ADR-019… ARQ-013; IMP-010…019; VAL-009; P10 Go | Produção **autorizada** (30/07/2026) |
| NCS (Natureza Cognitiva) | IMP-020 B1–B4 | Código presente; **produção NCS não declarada** (`flagNcs` off no checkpoint) |
| Dispatcher V2 / Fila oficial | REQ-053; REQ-060 / ARQ-021 / IMP-060 | Homologada; ciclo Job MVP na fila local `executive/queue/` |
| Conector CTO | REQ-054 / ARQ-015 / IMP-054 | Homologada em produção |
| Painel de Orquestração | REQ-055 / ARQ-016 / IMP-055 | Homologada em produção |
| Motor de Execução | REQ-056 / ARQ-017 / IMP-056 | Homologada |
| Continuidade do Gate | REQ-058 / ARQ-019 / IMP-058 | Homologada |
| Consciência Operacional | REQ-059 / ARQ-020 / IMP-059 | Homologada |
| Experiência de voz (TTS / preferência) | REQ-047; PX-001/002 | Presente; base do TTS Adapter |

### 1.3 Cadeia conversacional EIC em runtime (CAP-07 — pós-baseline)

| Frente | ID | Estado implementação |
|--------|-----|----------------------|
| Classificação de Intenção (+ E2.2/E2.3/E5.1) | IMP-057 | Implementada |
| Histórico conversacional (CSC #1) | IMP-061 | Implementada |
| Resolução de referências (CSC #2) | IMP-062 | Implementada |
| Mudança de assunto (CSC #3) | IMP-063 | Implementada |
| Objetivo conversacional (CSC #4) | IMP-064 | Implementada |
| Validador de Contexto Ativo (VCA) | IMP-065 | Implementada |
| Tempo ∝ complexidade | IMP-066 | Implementada |
| Dossier Institucional Curado (DIC) | IMP-067 | Implementada (+ refinamento path meta) |
| Modo CEO Ouvindo (voz I/O) | IMP-068 | Implementada (lab); **frente ENCERRADA** |

### 1.4 EIC documental

Pasta `docs/EIC/` (00–15 + Índice): **Marco Zero** (Fase 1) formalizado 03/08/2026. Homologação geral documental (`14_HOMOLOGAÇÃO_GERAL.md`) **aguarda aprovação do patrocinador** — sem impacto de código.

---

## 2. Capacidades homologadas

### 2.1 Homologação plena (lab + produção, quando aplicável)

| Item | Evidência |
|------|-----------|
| CAP-03 / 05 / 07 / 08 (baselines) | VAL-003 / VAL-006 / VAL-007 / VAL-008 + sedes `docs/cap-*` |
| MRE R1 | VAL-009; P10 Go |
| IMP-054…060 | Homologação + evidências de produção onde documentadas |
| IMP-057 (incl. E2.2, E2.3, E5.1) | Homologação produção |
| IMP-061…065 | Homologadas (061–065); 064/065 com evidência produção |
| IMP-068 / VAL-010 | **Homologação laboratorial** 15/15; frente **ENCERRADA** (ENC-006) |

### 2.2 Implementadas — ainda sem homologação formal de produto

| Item | Nota |
|------|------|
| **IMP-066** Complexidade / tempo de resposta | Implementada; **sem** ficheiro de homologação produção |
| **IMP-067** DIC | Implementada; **pronta para homologação** |
| **IMP-068** em produção SPA | Lab OK; bundle de produção **sem** marcadores `ceoOuvindo` à data VAL-010 |

### 2.3 Desvio documental (índice vs runtime)

REQ/ARQ das frentes 061–067 constam em vários casos como **Em análise** no índice, enquanto as IMP correspondentes (061–065) já estão **Homologadas**. Débito de governação documental — ver §6–§7.

---

## 3. Arquitectura vigente

### 3.1 Princípio

O CEO é um **Sistema Executivo de Governança** (CON-001). A conversação é a interface principal; a voz (CEO Ouvindo) é **camada de canal** sobre governação textual (ARQ-029).

### 3.2 Topologia de deploy

| Camada | Destino | Estado |
|--------|---------|--------|
| SPA | Vercel — `https://sistema-ceo.vercel.app` | BP-001 E12 READY |
| API | Railway — `ceo-api` `/health` OK | BP-001 E11 publicado |
| Fila / Dispatcher | Local `executive/queue/` + `executive/dispatcher/` | MVP oficial (IMP-060) |

### 3.3 Pipeline conversacional (inalterado pela voz)

```text
UI Conversa (texto | voz→texto)
        │
        ▼
enviarAoNucleo → executiveEngine.executar
        │
        ├─ Continuidade do Gate (se pendente) ──► Motor / clarificação
        │
        ├─ VCA (pré-cadeia)
        ├─ Histórico recente → Referências → Tópicos → Objectivo (CSC)
        ├─ Classificador de Intenção (C1–C4)
        ├─ Complexidade (instantaneo / leve / moderado / completa)
        ├─ DIC (só path meta/institucional)
        ├─ Capacidade / Motor / MRE (conforme destino)
        ├─ Consciência Operacional (antes de C2/C3 quando aplicável)
        └─ Speaker (prosa / guiãoVoz) → mensagem na UI
                │
                └─ [opcional] TTS Adapter (ceoOuvindo) → áudio
```

### 3.4 Camada CEO Ouvindo (ARQ-029 / IMP-068)

| Componente | Runtime |
|------------|---------|
| Voice Controller + State Manager | `app/src/ceoOuvindo/` |
| STT / TTS / Device adapters | idem (Web Speech + `experienciaVoz`) |
| Fronteira partilhada teclado = voz | `modules/conversa/enviarAoNucleo.js` |
| UI | botão Ouvindo em `conversa.js` |

**Invariantes:** EIC sem classe «voz»; Gate/Jobs não cancelados por stop de áudio; Ouvindo ⊕ Respondendo (anti-feedback).

### 3.5 Peças satélite

Painel (só leitura operacional), Conector CTO, Consciência Operacional, COA de sessão, Briefing Curado MG2 (`docs/mvp/briefing-operacional-mg2.md`) como mitigação — não substitui CAP-04 plena.

---

## 4. Fluxo conversacional atual

1. Utilizador envia **texto** (teclado) ou texto proveniente de **STT**.  
2. Se existir **Gate pendente**, a Continuidade do Gate intercepta (aprovação / rejeição / adiamento / clarificação) **antes** de reclassificar o C3.  
3. **VCA** valida contexto activo (quando activo).  
4. Cadeia **CSC**: histórico → referências → tópicos → objectivo.  
5. **Classificador** atribui destino (C1 mundano / C2 deliberativo / C3 execução / C4 meta, com emendas E2.x/E5.1).  
6. **Complexidade** escolhe rota de custo/latência (IMP-066).  
7. Em path **meta/institucional**, **DIC** pode injectar dossier curado (IMP-067).  
8. Destino executa capacidade, Motor e/ou MRE; Consciência pode enriquecer C2/C3.  
9. Resposta naturalizada / Speaker → UI; Jobs na fila oficial quando aplicável.

Canal de entrada (voz vs teclado) **não** altera classes nem limiar EIC.

---

## 5. Fluxo de voz atual (MVP ENCERRADO)

```text
Idle → [gesto Ouvindo] → Ouvindo
  → STT (+ silêncio ~900 ms) → Processando
  → mesmo pipeline §4 → mensagem UI
  → Respondendo (TTS, se sessão autorizar)
  → retorno automático a Ouvindo   ← IMP-068 D3 (≠ Idle-por-gesto ARQ §4.4)
```

| Aspecto | Estado MVP |
|---------|------------|
| Permissão mic / STT / TTS | Browser (Chrome/Edge recomendados) |
| Preferência PX-002 | Consultada; Desativada pode limitar TTS automático |
| Barge-in / wake word / streaming | **Fora de escopo** (ENC-006 §7) |
| Produção SPA | Deploy residual (VAL-010 §5) |

---

## 6. Pendências técnicas

### P0 — Críticas (bloqueiam uso diário seguro do entregável recente)

| ID | Pendência | Impacto |
|----|-----------|---------|
| **P0-1** | Publicar IMP-068 (commit `0c7d205` ou sucessor) no SPA de produção + smoke mic/STT/TTS (VAL-010 §6) | Patrocinador não usa «CEO Ouvindo» no alias oficial |
| **P0-2** | Confirmar paridade lab↔prod das frentes EIC já homologadas após qualquer deploy acumulado (regressão Classificador/DIC/voz) | Risco de drift silencioso pós-push |

### P1 — Importantes (estabilização e governação)

| ID | Pendência | Impacto |
|----|-----------|---------|
| **P1-1** | Homologar **IMP-066** (complexidade) | Rota de latência sem Gate formal de produto |
| **P1-2** | Homologar **IMP-067** (DIC) | Identidade institucional em runtime sem fecho VAL |
| **P1-3** | Alinhar status REQ/ARQ 061–067 no índice ao estado real das IMP | Índice desalinhado da verdade operacional |
| **P1-4** | Gate do patrocinador em `docs/EIC/14_HOMOLOGAÇÃO_GERAL.md` | Fase documental EIC sem fecho executivo |
| **P1-5** | Commit/push da cadeia documental ENC-006 e resíduos locais (branch ahead; artefactos untracked) | Rastreabilidade e CI/CD |
| **P1-6** | Lacuna de conhecimento operacional MG2 (além do Briefing Curado) | Uso diário ADR-015 ainda frágil em lastro COA |

### P2 — Evoluções (só após decisão estratégica)

| ID | Pendência | Nota |
|----|-----------|------|
| **P2-1** | Conversação contínua / barge-in / wake word / VAD / TTS servidor | ENC-006 §7 — nova frente |
| **P2-2** | NCS em produção (flag + VAL) | IMP-020 materializado; não declarado prod |
| **P2-3** | CAP-04 IMP (acervo de conhecimento) | ARQ homologada; IMP histórica não reaberta neste relatório |
| **P2-4** | CAP-R de consolidação / próxima RELEASE formal | ADR-017 — nenhuma CAP-R aberta |
| **P2-5** | Safari/iOS e robustez STT (ruído, léxico MG2) | Limitação MVP voz |

**Este REL não autoriza iniciar nenhuma das linhas acima.**

---

## 7. Débitos técnicos

1. **Desalinhamento documental:** REQ/ARQ «Em análise» vs IMP «Homologada» (061–065; parcialmente 066–067).  
2. **Deploy residual** do MVP voz vs lab homologado.  
3. **D3 vs ARQ §4.4:** retorno automático a Ouvindo documentado, mas diverge do Idle-por-gesto original da ARQ — manter nota canónica em ARQ-029.  
4. **NCS** implementada com flag off — superfície morta em produção.  
5. **Dependência browser** STT/TTS (Web Speech) — qualidade e portabilidade limitadas.  
6. **Reentrada automática a Ouvindo** pode captar cauda acústica (ENC-006 §6).  
7. **Índice / CAP-001** legenda antiga («CAP-03 aberta») vs baseline já concluída — corrigir em estabilização documental.  
8. Artefactos locais untracked (BP-001 notes, scripts dispatcher, sandboxes `e6-t3-*`) fora do perímetro limpo de release.

---

## 8. Riscos conhecidos

| Risco | Severidade | Mitigação actual |
|-------|------------|------------------|
| Produção sem IMP-068 enquanto lab «ENCERRADA» | Alta (expectativa vs realidade) | Transparência VAL-010/ENC-006; P0-1 |
| Regressão EIC em deploy acumulado | Alta | Suites `test:classificador*`, `test:dic`, `test:ceo-ouvindo` antes/depois do push |
| STT/TTS frágil (ruído, Safari, autoplay) | Média | Chrome/Edge; PX-001/002; teclado como fallback |
| Identidade institucional inconsistente sem VAL do DIC | Média | Homologação P1-2 |
| Over-extension: abrir nova frente antes de estabilizar | Alta (ADR-015) | **Modo estabilização** deste REL |
| Conhecimento MG2 insuficiente no MRE | Média | Briefing Curado; lacuna registada (learning 30/07) |
| Feedback acústico na reentrada Ouvindo | Baixa–média | Limitação conhecida; evolução P2 |

---

## 9. Métricas atuais

Valores **observados / documentados** — não há dashboard único de telemetria de produto neste corte.

### 9.1 Latência

| Sinal | Estado |
|-------|--------|
| Política IMP-066 | `instantaneo` (local) → `leve` (LLM curto) → `moderado` (1× LLM) → `completa` (MRE) |
| SLA numérico oficial | **Não estabelecido** neste REL |
| Endpointing voz | ~900 ms de silêncio (MVP) |
| TTS | Assíncrono pós-resposta textual; depende do browser |

### 9.2 Cobertura funcional

| Domínio | Cobertura aproximada |
|---------|----------------------|
| Baselines CAP-03/05/07/08 | Homologadas |
| Orquestração (Motor, Gate, Fila, Painel, CTO) | Homologada |
| Cadeia EIC runtime 057 + 061–065 | Homologada (lab/prod conforme evidências) |
| Complexidade + DIC | Implementada; **sem** VAL formal |
| Voz I/O | Lab 15/15; prod **condicional** |
| CAP-01/02/04/06/09–12 (ciclo completo) | Parcial / não baselineadas como as quatro acima |
| CAP-R | Nenhuma aberta |

### 9.3 Cobertura institucional

| Camada | Estado |
|--------|--------|
| CON-001 / VIS-001 / VIS-002 | Vigentes |
| EIC documental 00–13 + Marco Zero | Estrutura completa; H14 aguarda patrocinador |
| DIC-001 + runtime | Implementado; aguarda homologação |
| Briefing MG2 | Activo como mitigação; não é CAP-04 |

### 9.4 Estabilidade

| Sinal | Evidência |
|-------|-----------|
| Suites lab voz | `test:ceo-ouvindo` 10/10; `test:voz` 33/33 (VAL-010) |
| Integridade EIC no fecho voz | `test:classificador:e23` + `test:dic` verdes |
| Build | `vite build` OK no commit IMP-068 |
| API saúde | Railway `/health` 200 |
| Fila | Sem Jobs pending no `PROXIMO.md` (corte operacional local) |
| Produção SPA vs lab | **Divergente** no eixo voz (P0-1) |

---

## 10. Próximas frentes candidatas

**Nenhuma iniciada.** Candidatas para deliberação do patrocinador / CTO:

| # | Candidata | Justificativa ADR-015 |
|---|-----------|------------------------|
| A | **Estabilização de produção** — deploy + smoke CEO Ouvindo + regressão EIC | Desbloqueia uso diário oral real |
| B | **Fecho homologação IMP-066 + IMP-067** | Consolida latência e identidade sem nova capacidade |
| C | **Alinhamento documental** (REQ/ARQ/índice/EIC-14) | Reduz risco de governação falsa |
| D | **Lastro operacional MG2** (evolução controlada do Briefing / CAP-04 seletiva) | Qualidade deliberativa no contexto de uso |
| E | **NCS produção** | Clareza cognitiva pré-MRE |
| F | **Evolução de voz** (contínua / barge-in / VAD) | Experiência; exige nova cadeia ANL→… |
| G | **CAP-R / RELEASE formal** | Consolidar baselines + frentes numa RELEASE nomeada |

A escolha é **estratégica** — fora do mandato deste REL.

---

## 11. Recomendações arquitecturais

1. **Manter o padrão canal ≠ governação** (ARQ-029): qualquer evolução de voz continua adaptadores + `enviarAoNucleo`; proibir classe «voz» no Classificador.  
2. **Estabilizar antes de expandir:** fechar P0-1 e homologações 066/067 antes de CAP-E ou P2 de voz.  
3. **Tratar o índice como espelho da verdade:** sincronizar REQ/ARQ com IMP homologadas numa passagem documental única (sem código).  
4. **Preservar EIC documental desacoplada** até Gate G-EIC-D explícito para mudanças de produto.  
5. **Um COA, uma conversa:** não importar arquitectura MG2; investir em lastro curado (ADR-015).  
6. **Flags de rollback** (DIC, NCS, gestores CSC) permanecem instrumentos de estabilização — não remover sem ADR.  
7. **RELEASE:** quando o patrocinador autorizar, materializar este REL como baseline de RELEASE (ADR-016) após P0/P1 críticos.

---

## 12. Estado executivo final do produto

| Dimensão | Veredicto |
|----------|-----------|
| **Fase estratégica** | Uso operacional (ADR-015) — prioridade: uso diário no desenvolvimento do MG2 |
| **Modo actual** | **Estabilização** |
| **Frente «CEO Ouvindo»** | **ENCERRADA** (ANL-012 → REQ-068 → ARQ-029 → IMP-068 → VAL-010 → ENC-006) |
| **EIC runtime (057, 061–065)** | Entregue e majoritariamente homologada |
| **DIC + Complexidade** | Código pronto; Gate de homologação pendente |
| **Produção voz** | Residual — produto lab ≠ alias Vercel no corte VAL-010 |
| **Fila / orquestração** | Operacionais no perímetro MVP |
| **Próxima acção do Engenheiro** | **Nenhuma implementação** até decisão estratégica da próxima frente |
| **Próxima acção do projecto** | Patrocinador / CTO escolhem entre candidatas §10 (recomendação engenharia: **A → B → C**) |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), por comando do patrocinador |
| Quando | 03/08/2026 |
| O quê | REL-001 — Estado Atual do Sistema CEO; índice actualizado |
| Por quê | Frente CEO Ouvindo encerrada; consolidar estado real e entrar em estabilização |
| Resultado | Documento Em análise; zero implementação iniciada; aguarda decisão estratégica |

---

**Fim do REL-001.**  
Aguardar decisão estratégica da próxima frente.

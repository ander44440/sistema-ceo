# Diagnóstico — Arquitectura de conhecimento MG2 disponível ao CEO

> **Tipo:** inventário / diagnóstico arquitectural (sem implementação).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — inventário completo do conhecimento Motoboy Game 2.  
> **Natureza:** leitura do estado actual; **nenhuma** alteração de código ou Baseline.

---

## 1. Veredicto

O conhecimento de produto MG2 que o CEO usa em tempo de execução é, na prática, um **Briefing Curado congelado (~30/07/2026)** espelhado em código (`briefingsProjeto.js`), mais memória de sessão e lastro operacional da fila (jobs/gates).

Não existe RAG, embeddings, leitura live de `docs/`, nem acesso ao repositório do jogo em runtime. A capacidade «Conhecimento» declara explicitamente ausência de acervo persistente. REL-001 regista a lacuna como **P1-6**; ROADMAP-002 aponta **F3** (lastro operacional MG2) como frente planeada — **não** aberta neste despacho.

---

## 2. Fontes que existem

### 2.1 Ligadas ao runtime (consultáveis na resposta)

| Fonte | Local | Conteúdo MG2 |
|-------|--------|--------------|
| Briefing Curado (espelho JS) | `app/src/executiveEngine/briefingsProjeto.js` | Identidade, estado técnico 30/07, decisões, dores, próximo passo, path do repo |
| Briefing canónico (docs) | `docs/mvp/briefing-operacional-mg2.md` | Mesmo conteúdo; fonte humana — **não** `fs.read` no motor |
| Factos discretos B1 | `FACTOS_BRIEFING_POR_ID` no mesmo JS | Subconjunto injectado em `factosOficiais` do MRE |
| Catálogo / seed COA | `app/src/catalogoProjetos/`, `bootstrap/seed.js` | Nome do projecto, linha ADR-015, estado demo |
| Memória executiva de sessão | `app/src/executiveMemory/index.js` | Decisões/pendências/próximo passo; reconhece tokens MG2 |
| Contexto de sessão | `app/src/executiveEngine/contextoSessao.js` | Painel dinâmico: COA + memória |
| Lastro consciência | `conscienciaOperacional/*` | Jobs, gates, dispatcher, agent — **ops do CEO**, não lore do jogo |
| Lexicon / regras classificador | `classificadorIntencao/lexicon.js`, `regras.js` | Tokens `mg2`, `motoboy`, `worldlab`, `outdoor` (routing) |
| Princípio MRE | `mre/pipeline/catalogoPrincipios.js` | Uma linha «Priorizar uso diário no MG2 (ADR-015)» |
| Persistência gabinete | `catalogoProjetos/persistencia.js` | Workspace de projecto em localStorage |
| TTS | `onboarding/voice/TextFormatter.js` | Expande «MG2» na fala |

### 2.2 No disco (acervo humano / Jobs) — mais rico que o runtime

| Fonte | Local |
|-------|--------|
| Acervo MVP | `docs/mvp/` — `contexto-mg2.md`, `decisoes.md`, `conhecimentos-uso-diario.md`, `estado-do-dia.md`, … |
| Aprendizado Jobs | `docs/learning/2026-07-30-job-000007-plano-arquitetura-mg2.md`, `2026-08-01-job-000011-viabilidade-projeto-mg2.md`, `2026-08-01-job-000014-prioridades-diarias-mg2.md` |
| Lacuna / Gate briefing | `docs/learning/2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md` + pareceres Gate Opção A |
| Visão / ADR / REQ | VIS-003, ADR-015, REQ-017, REQ-044 |
| CAP-03 fixtures | `docs/cap-03/inventario-mvp-mg2.js`, `migracao-mg2.js` |
| Planeamento | ROADMAP-002 §F3; ANL-017; REL-001 P1-6 |
| Templates CAP-04 | `docs/knowledge/TEMPLATE-ITEM-CONHECIMENTO.md` (vazio de itens MG2) |
| Repo externo do jogo | `E:\anderson\Projoto motoboy game` (referenciado; existe no host) |

### 2.3 Explicitamente ausentes como mecanismo

- Acervo CAP-04 ligado ao app (`capacidades/conhecimento.js` stub).  
- Vector store / embeddings / RAG.  
- Leitura automática de markdown em cada turno.  
- Importação da arquitectura/código do MG2 para dentro do CEO (proibida por fronteira).

---

## 3. O que é consultado em tempo de execução

Fluxo típico (Conversa → EE):

```
mensagem
  → Continuidade / interceptação / classificador
  → lastro consciência (fila ops)          [ops]
  → montarMensagensLlm  OU  montarEntradaMre
       ├─ Constituição / Governança
       ├─ construirContextoSessao (COA + memória)
       ├─ obterBriefingProjeto(coa)         [produto MG2 — string JS]
       └─ obterFactosBriefingProjeto(coa)   [MRE factosOficiais]
  → conversacaoNatural (molda prosa; não carrega docs/)
```

Pontos de injecção:

1. **`promptGovernanca.montarMensagensLlm`** — system message com briefing completo se COA MG2 e não for meta-DIC.  
2. **`mre/integracaoNucleo.montarEntradaMre`** — factos do briefing antes da memória volátil; enriquecimento de mensagem; hints de schema.  
3. **`consultarAntesDeResponder` / lastro** — estado executivo (jobs/gates), não dossier de jogo.  
4. **Classificador** — lexicon MG2 só para intenção/roteamento.  
5. **Capacidade `conhecimento`** — responde que **não há** acervo documental ligado; usa só memória de sessão.

---

## 4. O que existe e NÃO é consultado em runtime

| Fonte | Motivo |
|-------|--------|
| `docs/mvp/*.md` (excepto como espelho humano do JS) | Sem `fs.read` no motor |
| Learning Jobs 000007 / 000011 / 000014 e análises de lacuna | Entregas de engenheiro; fora do prompt |
| VIS-003, REQ-017/044, ANL-017, ANCORA-MESTRA | Normativo / continuidade humana |
| ADR-015 texto completo | Só eco mínimo no catálogo de princípios |
| `docs/cap-03/inventario-mvp-mg2.js` | Fixture de migração/testes |
| CAP-04 / `docs/knowledge/` | Não implementado no app |
| Repo `Projoto motoboy game` | Só string de path no briefing; sem sync live |
| Conteúdo fino de `conhecimentos-uso-diario.md` | Fora do espelho JS (só DEC-MVP-001 no briefing) |

Risco de deriva: canónico em markdown vs espelho JS — actualizar um sem o outro.

---

## 5. Como o conhecimento é recuperado

| Mecanismo | Descrição |
|-----------|-----------|
| **Hard-coded por COA** | `BRIEFINGS_POR_ID` / `FACTOS_BRIEFING_POR_ID` keyed por `prj-mg2` / nome |
| **Injecção system prompt** | Briefing inteiro na mensagem de sistema do LLM |
| **Factos MRE** | Lista curta em `factosOficiais` + hint «dossier já tem WorldLab2/perf/outdoors» |
| **Memória de sessão** | Decisões/pendências escritas durante o uso |
| **Lastro ops** | Agregação de fila/dispatcher/agent |
| **Lexicon** | Matching lexical para classificar — não recupera factos |
| **Curadoria manual** | Humano actualiza `briefing-operacional-mg2.md` → espelha JS |

Não há recuperação por similaridade, pesquisa full-text no acervo, nem consulta ao filesystem do jogo.

---

## 6. Informações estratégicas do MG2 ausentes do lastro runtime

Presente no briefing (snapshot 30/07): identidade Bombinhas/WorldLab2; Sprint 1 perf; outdoors; DEC-MVP-001; hitch; próximo passo «validar Sprint 1 → LOD»; path do repo; fronteira CEO vs oficina.

**Ausentes do inject runtime** (existem noutros artefactos ou são referências de missão sem dossier):

| Tema | Onde vive hoje | No briefing runtime? |
|------|----------------|----------------------|
| Visão de produto / uso diário narrativo | VIS-003 | Não |
| Plano de arquitectura (P0–P5, monólito, materiais, detached HEAD) | learning JOB-000007 | Não |
| Viabilidade (stack, ~14k LOC, bug moto vertical) | learning JOB-000011 | Não |
| Prioridades diárias / critérios de gate Sprint 1 | learning JOB-000014 | Parcial (próximo passo mais fino no learning) |
| Mapa de vias / nomenclatura da cidade | missões de teste / uso real | Não |
| Feature «Pausar» do jogo | missões de teste; UI CEO Pausar ≠ jogo | Não |
| Sistemas de jogo (pagamento avançado, multiplayer, lab) | briefing marca fora de escopo | Não (de propósito) |
| Estado live do repo do jogo pós-30/07 | disco externo | Não — briefing pode estar desactualizado |
| KNW-DIA / nuances de uso diário | `conhecimentos-uso-diario.md` | Quase não |
| Acervo pesquisável CAP-04 | planeado (F3 / CAP-04) | Não |

---

## 7. Modelo compacto

```
ON DISK (humano / Jobs / CAP)
  docs/mvp · docs/learning/*mg2* · VIS/ADR · repo jogo
            │
            │ curadoria manual (Opção A)
            ▼
RUNTIME
  briefingsProjeto.js ──► LLM system + MRE factos
  executiveMemory / contextoSessao / COA
  lastroConsciencia (ops CEO)
  lexicon (routing) · princípio ADR-015 (1 linha)

  ✗ RAG   ✗ leitura live docs/   ✗ FS do jogo   ✗ CAP-04
```

---

## 8. Implicações (diagnóstico apenas)

1. Perguntas do tipo «o que sabes do MG2?» dependem do Briefing Curado + sessão — não do acervo documental completo.  
2. Conhecimento estratégico gerado por Jobs (arquitectura, viabilidade, prioridades) **não** entra automaticamente nas deliberações.  
3. A mitigação Opção A cumpriu o Gate de 30/07; a lacuna estrutural (P1-6 / F3) permanece aberta a nível de planeamento, **sem** autorização neste inventário.  
4. Fronteira preservada: CEO não importa engenharia do MG2; lastro deve ser curado, não espelho do repo.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (pedido) + Engenheiro (inventário) |
| Quando | 07/08/2026 |
| O quê | Diagnóstico da arquitectura de conhecimento MG2 actual |
| Resultado | Inventário entregue; **sem** implementação |
| Próximo | Aguardar despacho CTO se houver ciclo F3 / calibração de lastro |

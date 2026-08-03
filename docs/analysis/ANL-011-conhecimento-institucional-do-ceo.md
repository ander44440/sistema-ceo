# ANL-011 — Conhecimento Institucional do CEO

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidades:** CAP-04 (Gestão do Conhecimento) — conteúdo e recuperação; CAP-07 (Comunicação) — metaconversa / autoexplicação; CAP-01 (Governança) — papéis e critérios; ADR-011 (Identidade Organizacional) — eixo de identidade.  
> **Normas consultadas (somente leitura):** CON-001; VIS-001; VIS-002; ADR-002; ADR-006; ADR-011; ADR-015; ADR-019; proposta-identidade-permanente-ceo (homologada); PX-001 E2; PX-011; REQ-001; REQ-004/005/014/015; REQ-049; REQ-057; ARQ-006/007; ARQ-018; ARQ-019; ARQ-020; ARQ-026/027; IMP-004; IMP-057 E2.3; IMP-059; IMP-065; IMP-066; `docs/EIC/`; `docs/knowledge/`; learning 2026-07-30 (briefing MG2).  
> **Origem:** Comando do patrocinador — diagnóstico completo do Conhecimento Institucional; motivação: testes executivos com inconsistências em identidade, funcionamento, critérios, arquitectura e papel.  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **ARQ / REQ** do Conhecimento Institucional.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Diagnóstico de tudo o que o CEO **deveria** conhecer sobre si, a organização e a arquitectura do Sistema CEO para responder naturalmente a perguntas institucionais e metaconversacionais — e do que **efectivamente** chega ao runtime hoje. |
| **Por que existe?** | O Classificador já encaminha bem muitas meta-perguntas (E2.3 → C2; VCA → `metaconversa`; complexidade moderada), mas o **conteúdo institucional** injectado é fino, fragmentado e desligado do acervo canónico em `/docs`. O modelo generaliza ou colide com pitch de identidade. |
| **Para quem existe?** | Patrocinador (uso diário / confiança na voz do cargo); CTO (REQ/ARQ); Engenheiro (IMP futuro). |
| **Como medir sucesso desta ANL?** | (1) Mapa arquitectura actual → runtime; (2) inventário existente vs ausente; (3) classificação clara dos tipos de conhecimento; (4) lacunas e compatibilidade EIC/MRE/Motor/Gate/Classificador/docs; (5) MVP e riscos **sem** implementação nesta etapa. |

---

## 1. Objetivo

Levantar, classificar e avaliar o Conhecimento Institucional do CEO de forma a permitir, na etapa seguinte, definir a **Arquitectura do Conhecimento Institucional** — sem alterar o produto agora.

Escopo desta ANL:

1. Como o CEO é apresentado hoje (runtime + documentação).  
2. Que informação institucional existe e como (não) chega ao LLM.  
3. O que o CEO “conhece” vs desconhece sobre si e a arquitectura.  
4. Como responde hoje a perguntas sobre si, arquitectura, processos e critérios.  
5. Lacunas, oportunidades, estratégia, riscos, compatibilidade e MVP.

**Fora de escopo:** código, prompts, runtime, comportamento (explicitamente).

---

## 2. Arquitectura actual

### 2.1 Duas “Constituições” (causa estrutural)

| Camada | Artefacto | Natureza | Chega ao LLM? |
|--------|-----------|----------|---------------|
| **Norma máxima** | `docs/CON-001-constituicao.md` | Organização, papéis (Usuário/CTO/Cursor/CEO), pilares, hierarquia, Art. 7º §4º (`/docs` canónico) | **Não** (não é lido em runtime) |
| **Contrato de cargo (runtime)** | `app/src/executiveEngine/constituicaoCeo.js` → `obterConstituicaoCeo()` | Mandato de Diretor Executivo / Executivo Digital; o que é / não é; iniciativa; continuidade PX-011 | **Sim** — system[0] em `montarMensagensLlm` |
| **Espelho UI / local** | `obterResumoIdentidadeCeo()` | ~3 frases fixas | **Sim** — só caminho `pergunta_identidade` sem LLM |

A proposta homologada (`docs/product/proposta-identidade-permanente-ceo.md`) separou bem **Constituição → Governança LLM → Contexto → Briefing**. Isso resolveu **quem é o cargo na prosa**. **Não** resolveu **conhecimento institucional estruturado** (papéis CON-001 Art. 6º, fluxo ADR-006, EIC, critérios do Classificador, mapa ARQ).

### 2.2 Composição canónica do prompt deliberativo

```text
Utilizador
  → Gate (ARQ-019)
  → VCA (IMP-065)          ← metaconversa / isolamento CSC
  → CSC 061→063→062→064    ← só se autorizaLastroCsc
  → Classificador (ARQ-018)
       ├─ E2.3 / meta-modo → C2 nucleo_mre
       ├─ pergunta_identidade → local (resumo)
       ├─ C1 conhecimento_geral → resposta_leve
       └─ C2 deliberação pesada → MRE 0–7
  → complexidadeDecisao (IMP-066)
       ├─ instantaneo → local
       ├─ leve → SYSTEM_RESPOSTA_LEVE
       ├─ moderado → 1× LLM + montarMensagensLlm   ★ path institucional típico
       └─ completa → MRE 0–7 (sem constituicaoCeo)
```

**Ordem exacta de `montarMensagensLlm`** (`promptGovernanca.js`):

1. `obterConstituicaoCeo()` — cargo  
2. `obterGovernancaLlm()` — anti-alucinação + prosa PX + «não expor orquestração interna»  
3. `construirContextoSessao()` — COA, memória, intenção  
4. `obterBriefingProjeto(coa)` — domínio MG2 (se houver)  
5. Histórico (−12) + `OBJETIVO ATUAL`

### 2.3 Caminhos de resposta a perguntas sobre o próprio CEO

| Pergunta típica | Rota actual | Fonte de conteúdo | Qualidade institucional |
|-----------------|-------------|-------------------|-------------------------|
| «Quem és tu?» / identidade curta | `pergunta_identidade` → local | `obterResumoIdentidadeCeo()` | Pitch estável; **raso** |
| «Qual é o teu papel?» | E2.3 → C2 → **moderado** → `montarMensagensLlm` | Constituição runtime + governação + sessão + briefing | Mandato sim; **papéis CON / fluxo / ARQ não** |
| Meta-modo (reflexão vs decisão, «vamos continuar», etc.) | E2.3 + VCA `metaconversa` → moderado | Idem | Modo conversacional; **sem protocolo canónico injectado** |
| «O que é um ADR?» | C1 `conhecimento_geral` → `resposta_leve` | `SYSTEM_RESPOSTA_LEVE` mínimo | Conhecimento **geral** do modelo; **não** o ADR deste repo |
| «Como funciona o Classificador / Gate / EIC?» | E2.3 se léxico bater; senão C1 ou C2 genérico | Sem manual interno | **Invenção / generalização**; governação **proíbe** expor orquestração |
| Deliberação de projecto pesada | MRE 0–7 | Factos + `CATALOGO_PRINCIPIOS` (11 strings) | Princípios parciais; **sem** Constituição runtime nem CON-001 |

### 2.4 O que o runtime “sabe” sobre componentes internos

| Componente | Sabe em runtime? | Forma | Explicável ao utilizador? |
|------------|------------------|-------|---------------------------|
| Identidade de cargo | Parcial | `constituicaoCeo` / resumo | Sim (pitch) |
| Prosa / tom | Sim | `governancaLlm` / PX | Implícito na voz |
| COA / briefing MG2 | Sim (domínio) | `briefingsProjeto` + contexto | Sim (projecto, não o Sistema CEO) |
| Estado Jobs / Gates / dispatcher | Sim (estado) | Consciência Operacional F1–F8 | Reflexo de **estado**, não manual de **como funciona** |
| Critérios Classificador C1–C4 | Código aplica; LLM não recebe tabela | `regras.js` / ARQ-018 | Só por generalização |
| Pipeline MRE / NCS | Interno | `app/src/mre` | Governação desencoraja exposição |
| Acervo CAP-04 | Não | Índice vazio (0 KNW) | Capacidade stub: «ainda não há acervo ligado» |
| `/docs` (CON, VIS, ADR, ARQ, EIC) | Não | Disco / Git | Não injectado |

### 2.5 Documentação institucional existente (canónica, offline do LLM)

| Documento | Propósito |
|-----------|-----------|
| CON-001 | Norma máxima: natureza, missão, pilares, papéis, hierarquia |
| VIS-001 | Visão de produto |
| VIS-002 | Identidade institucional (organiza **organizações**) |
| ADR-002 | Identidade estratégica + padrão documental |
| ADR-011 | Capacidade de Identidade Organizacional |
| proposta-identidade-permanente-ceo | Arquitectura de composição runtime (implementada) |
| PX-001 E2 / PX-011 / PX-003 | Personalidade e qualidade conversacional |
| `docs/EIC/*` | Engenharia da Inteligência Conversacional (pacote documental) |
| ARQ-018…027, REQ-057…066 | Classificador, Gate, VCA, complexidade, CSC |
| CAP-001 / CAP-04 + ARQ-006/007 | Mapa de capacidades; acervo (infra pronta, **vazio**) |
| Briefing MG2 | Conhecimento **operacional de COA**, não institucional do Sistema |

---

## 3. Limitações

| ID | Limitação | Impacto nos testes executivos |
|----|-----------|-------------------------------|
| L1 | CON-001 documental ≠ `constituicaoCeo.js` | Papéis Art. 6º, hierarquia, REQ-001 não entram na prosa institucional |
| L2 | Acervo CAP-04 operacionalmente vazio (0 KNW) | Sem retrieval; CAP-04 não alimenta conversa |
| L3 | Path institucional = mandato + governação, sem dossier | Respostas sobre arquitectura/processos/critérios são **inventadas** ou genéricas |
| L4 | `governancaLlm` proíbe expor orquestração | Tensão: utilizador pergunta «como decides?» / «como funciona» vs regra de não expor internals |
| L5 | Três vozes de identidade (local / leve / deliberativa) | «Quem és?» ≠ «Qual o teu papel?» em profundidade e tom |
| L6 | MRE completa **sem** Constituição runtime | Deliberação pesada e autoexplicação usam stacks diferentes |
| L7 | C1 leve trata ADR/REQ como conhecimento mundano | «O que é um ADR?» não ancora no padrão deste projecto |
| L8 | Consciência = estado, não epistemologia | Sabe que há Gate pendente; não explica o protocolo do Gate |
| L9 | E2.3 é **routing**, não **património** | Classifica bem; não ensina o modelo |
| L10 | Briefing MG2 no path meta (se COA activo) | Risco residual de puxar projecto mesmo após VCA (depende do isolamento e do path) |

---

## 4. Conhecimento existente vs ausente

### 4.1 Existente (utilizável hoje no runtime)

| Bloco | Onde | Cobre |
|-------|------|-------|
| Mandato de cargo | `constituicaoCeo.js` | Quem é / não é; priorizar; decidir; orientar execução |
| Resumo de identidade | `obterResumoIdentidadeCeo` | Pitch curto local |
| Conduta conversacional | `governancaLlm.js` | Não inventar; não fingir execução; prosa PX; Cursor como canal |
| Estado de sessão | `contextoSessao.js` | COA, pendências, intenção |
| Domínio COA MG2 | `briefingsProjeto.js` | Factos do jogo / sprint (não do Sistema CEO) |
| Princípios seleccionáveis MRE | `CATALOGO_PRINCIPIOS` | 11 enunciados (espelho parcial CON/ADR-015) |
| Estado operacional | Consciência F1–F8 | Jobs, Gates, frentes |
| Routing meta | E2.3 + VCA + complexidade moderada | Encaminha perguntas institucionais sem Clarificação/Job |

### 4.2 Ausente (deveria existir para respostas institucionais naturais)

| Bloco | Por que falta | Sintoma |
|-------|---------------|---------|
| Papéis canónicos (Usuário / CTO / Cursor / CEO) | Só em CON-001.md | «Diferença entre você e o CTO?» → generalização |
| Hierarquia normativa + ADR-006 | Só em docs | Não explica ANL→REQ→ARQ→IMP |
| Mapa de componentes (Gate, Classificador, Motor, Fila, MRE, NCS, EIC) | Só em ARQ/EIC | Arquitectura inconsistente ou evasiva |
| Critérios de decisão (quando Job, quando só responder, quando perguntar) | Código + ARQ-018; não no prompt | Meta-perguntas sem lastro normativo |
| Fronteira CAP-04 vs Memória vs Normas | Docs CAP-04 | Confunde «conhecimento» com chat |
| Protocolo reflexão vs decisão | Inexistente como artefacto | Testes 18:55 meta-modo |
| Autoconsciência operacional **explicativa** | Consciência só estado | «Como funciona a fila?» sem manual curto |
| Ligação CON-001 ↔ runtime | Art. 7º §4º: docs canónicos; espelho JS subordinado **desalinhado em conteúdo** | Duas verdades |

---

## 5. Classificação do conhecimento

Separação obrigatória para a futura ARQ (não misturar no mesmo artefacto):

| Tipo | Definição | Exemplos | Onde deveria viver | Runtime hoje |
|------|-----------|----------|--------------------|--------------|
| **Institucional** | Quem é o CEO / a organização / papéis / missão / pilares / hierarquia | CON-001 Art. 1–6; VIS-002 | Norma + **dossier institucional curado** para LLM | Parcial (`constituicaoCeo`) |
| **Técnico** | Como o Sistema CEO é construído (ARQ, EIC, MRE, Classificador) | ARQ-018, pacote EIC | Docs ARQ + **resumo técnico autorizado** (nível utilizador) | Ausente no prompt; governação restringe exposição |
| **Operacional** | Estado e lastro de trabalho **agora** | Jobs, Gates, briefing MG2, COA | Consciência + briefing + memória | Presente (estado + MG2) |
| **Conversacional** | Como falar / quando perguntar / continuidade / meta-modo | PX-001, PX-011, protocolo reflexão×decisão | Governança LLM + **protocolo meta** | Prosa sim; protocolo meta **não** |

**Regra de fronteira (proposta para ARQ):**  
- Institucional responde «quem somos / o que governamos».  
- Técnico responde «como o sistema está organizado» (versão **divulgável**, não dump de orquestração).  
- Operacional responde «o que é verdade neste momento».  
- Conversacional responde «como conduzo o diálogo».

---

## 6. Avaliação — como responde hoje (por família de pergunta)

| Família | Comportamento actual | Veredicto |
|---------|----------------------|-----------|
| Identidade curta | Pitch local estável | **OK raso** |
| Papel / mandato | LLM com Constituição runtime | **OK parcial** — falta Art. 6º e missão CON completa |
| Critérios de decisão | LLM sem tabela ARQ-018 / política Job | **Frágil** — soa plausível, sem lastro |
| Arquitectura interna | Sem mapa; anti-exposição | **Inconsistente / evasivo** |
| Processos (ADR-006, Gate, fila) | Estado via Consciência; processo ausente | **Lacuna** |
| Metaconversa / modo | Routing corrigido (IMP-065/066 + meta-modo); conteúdo ainda fino | **Routing OK · conteúdo insuficiente** |
| Conhecimento do acervo CEO | Stub CAP-04 | **Ausente** |

---

## 7. Lacunas (inventário)

### 7.1 Lacunas de conhecimento institucional

- Missão/pilares/hierarquia CON-001 não injectados.  
- Papéis permanentes não injectados.  
- VIS-002 (governa organizações) não chega à prosa.  
- Distinção Sistema CEO × COA MG2 não explícita no path meta.

### 7.2 Lacunas de identidade

- Três profundidades de “quem sou” (local / leve / deliberativa).  
- Runtime Constitution não é espelho fiel de CON-001 (são contratos de **âmbitos diferentes** sem ponte explícita).  
- Identidade Organizacional (ADR-011) sem materialização conversacional.

### 7.3 Lacunas de arquitectura

- Sem **mapa divulgável** Gate → Classificador → Motor → Fila → MRE.  
- EIC documental rico, runtime cego.  
- Proibição de «expor orquestração» sem política do que **pode** ser dito ao patrocinador.

### 7.4 Lacunas de governança

- Fluxo ADR-006 ausente do LLM.  
- Critério «nada sem REQ» ausente da autoexplicação.  
- Autoridade Usuário vs sugestão do CEO (CON) só parcialmente no mandato runtime.

### 7.5 Lacunas de autoconsciência operacional

- Consciência lê **estado**; não possui **manual curto** «o que é um Gate / Job / Dispatcher».  
- Não distingue «sei o estado» de «sei o protocolo».  
- Meta «quando pergunto vs quando decido» sem protocolo escrito.

---

## 8. Oportunidades

| ID | Oportunidade | Efeito esperado |
|----|--------------|-----------------|
| O1 | **Dossier Institucional Curado (DIC)** — texto curto, versionado, injectável só em path meta/E2.3 | Respostas alinhadas a CON/VIS sem retrieval completo |
| O2 | Política **«orquestração divulgável»** vs **«orquestração interna»** | Resolver tensão L4 sem violar governação |
| O3 | Unificar voz de identidade (local lê o mesmo resumo estruturado que o DIC) | Fim da dissonância «Quem és?» vs «Qual o papel?» |
| O4 | Primeiros `KNW-*` institucionais no acervo (CAP-04 E3) **depois** do DIC | Ponte para retrieval; não bloqueia MVP |
| O5 | Protocolo conversacional reflexão×decisão como secção do DIC | Fecha buraco dos testes meta-modo |
| O6 | Manter E2.3/VCA/moderado como **transporte**; DIC como **carga** | Reusa limiar já homologado |

---

## 9. Estratégia recomendada

### 9.1 Princípio

> **Routing já existe; falta património.**  
> Não abrir frente nova de classificação. Abrir frente de **conhecimento institucional injectável**, com fronteiras claras face a briefing de COA e a CAP-04 genérico.

### 9.2 Camadas (futura ARQ)

```text
Camada A — Identidade de cargo (já existe)
  constituicaoCeo + governancaLlm

Camada B — Dossier Institucional Curado (NOVO — MVP)
  papéis · missão · o que o CEO faz/não faz · mapa divulgável ·
  quando Job vs resposta · reflexão vs decisão · fronteira MG2

Camada C — Acervo CAP-04 (médio prazo)
  KNW institucionais + recuperação (REQ-005)

Camada D — Operacional (já existe)
  Consciência + briefing COA + memória
```

### 9.3 Ordem ADR-006 sugerida

```text
ANL-011 (este) → aprovação CTO
  → REQ-067 Dossier Institucional Curado (DIC)   ← elaborada (Em análise v0.1)
  → ARQ-028 Dossier Institucional Curado         ← elaborada (Em análise v0.1)
  → IMP-067 → VAL
```

**REQ derivada:** [`REQ-067-dossier-institucional-curado.md`](../requirements/REQ-067-dossier-institucional-curado.md).  
**ARQ derivada:** [`ARQ-028-dossier-institucional-curado.md`](../architecture/ARQ-028-dossier-institucional-curado.md).

### 9.4 O que **não** fazer nesta frente

- Importar `/docs` inteiro para o prompt.  
- Fazer o LLM dump de pipelines/NCS/API.  
- Misturar briefing MG2 com dossier institucional.  
- Substituir CON-001 por `constituicaoCeo.js`.  
- Usar CAP-04 vazio como se já houvesse retrieval.  
- Alterar limiar do Classificador / Gate / Motor para “ensinar” identidade.

---

## 10. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | DIC contradizer CON-001 | DIC é **espelho subordinado**; revisão CTO; citação de artigos |
| R2 | Prompt demasiado longo / latência | DIC curto (1–2 ecrãs); só path meta/E2.3/moderado |
| R3 | Expor internals demais | Política de exposição na ARQ; lista branca de conceitos divulgáveis |
| R4 | Contaminar deliberação de projecto com manual do sistema | Injectar DIC **só** em veredictos meta / E2.3; não no path MG2 pesado por omissão |
| R5 | Duplicar CAP-04 sem E3 | MVP = DIC embutido/versionado; KNW depois |
| R6 | Duas Constituições sem ponte | ARQ deve declarar âmbitos: Norma (CON-001) × Cargo (runtime) × DIC (conhecimento falado) |
| R7 | Regressão E2.3 / VCA / complexidade | Suites e23 + VCA + complexidade obrigatórias na IMP |

---

## 11. Compatibilidade

| Peça | Compatibilidade | Nota |
|------|-----------------|------|
| **EIC** | Alta | Consome routing E2.3/VCA/`metaconversa`; não cria classe nova |
| **MRE** | Média (consciente) | Meta institucional deve permanecer **moderado** (1 LLM + DIC); MRE completa continua para deliberações de projecto |
| **Motor Executivo** | Alta | Sem Jobs por autoexplicação (já garantido E2.3) |
| **Gate** | Alta | DIC não resolve Gates; Gate continua primeiro |
| **Classificador** | Alta | Continua único decisor de classe; DIC é **carga**, não score |
| **Documentação oficial** | Alta se subordinada | CON-001 / VIS / ADR permanecem canónicos; DIC e `constituicaoCeo` são espelhos |
| **CAP-04** | Preparatória | MVP não exige E3; alinha classificações futuras (Governança / Arquitectura / Operação) |
| **ADR-015** | Alta | Melhora confiança no uso diário sem importar engenharia MG2 |
| **Consciência (IMP-059)** | Complementar | Estado ≠ manual; DIC cobre o manual curto |

---

## 12. MVP recomendado (futura REQ/ARQ)

### 12.1 Dentro do MVP

1. **Definir** o Dossier Institucional Curado (estrutura de secções + política de exposição).  
2. **Conteúdo mínimo:**  
   - natureza e missão (espelho CON Art. 1–3);  
   - papéis Usuário / CTO / Cursor / CEO (Art. 6º);  
   - o que o CEO faz / não faz;  
   - mapa divulgável (Classificador → deliberação → Gate → Job/fila — **nível patrocinador**);  
   - critérios: quando só responder / quando deliberar / quando propor Job / quando perguntar;  
   - protocolo reflexão vs decisão;  
   - fronteira Sistema CEO × COA MG2.  
3. **Ponto de injecção único:** path E2.3 / `metaconversa` / complexidade moderada (junto a `montarMensagensLlm`), **sem** alterar Classificador.  
4. **Alinhar** `obterResumoIdentidadeCeo()` ao mesmo resumo estruturado (uma voz).  
5. **Testes de aceite conversacionais** (fixtures institucionais) + regressão E2.3/VCA/066.  
6. **Documentar** ponte Norma × Cargo × DIC.

### 12.2 Fora do MVP

- Retrieval CAP-04 / emissão KNW (pode ser fase 2).  
- Ingestão automática de todos os ADR/ARQ.  
- Exposição de NCS, schemas MRE, prompts internos.  
- Mudança de CON-001 / papéis.  
- Redesign do MRE 0–7 para carregar DIC por omissão.  
- LLM no limiar de classificação.

### 12.3 Critérios de aceite sugeridos (para a REQ)

1. «Qual é o teu papel?» / «Diferença CTO vs Cursor» → resposta alinhada a CON Art. 6º (sem pitch só de identidade local).  
2. «Quando crias um Job?» → critérios canónicos do limiar (sem inventar política).  
3. «Como funciona o Sistema CEO?» → mapa divulgável; sem dump de APIs.  
4. «Estou a refletir ou a pedir decisão?» → protocolo explícito.  
5. Pergunta de projecto MG2 **sem** meta → **não** injecta DIC (ou injecta de forma subordinada ao briefing — política ARQ).  
6. 0 Jobs / 0 Clarificações indevidas nas fixtures E2.3.  
7. Suites classificador + VCA + complexidade verdes.

---

## 13. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Implementação / prompts / runtime / comportamento |
| X2 | Redigir o texto final do DIC (cabe à ARQ/IMP após Gate) |
| X3 | Emitir `KNW-*` ou abrir IMP-004 E3 |
| X4 | Emendar CON-001 / VIS / ARQ vigentes nesta ANL |
| X5 | Fechar numeração oficial REQ/ARQ/IMP (sugestão §9.3) |

---

## 14. Conclusão

O CEO **já tem** identidade de cargo no runtime, governação de prosa, briefing de COA, consciência de **estado** operacional e um **limiar** maduro para reconhecer perguntas institucionais e metaconversacionais (E2.3, VCA, complexidade moderada).

O que **falta** não é mais um classificador: é um **património institucional falável** — curado, subordinado a `/docs`, separado do briefing de projecto, injectado só onde a autoexplicação acontece.

Sem esse património, o modelo continua a deliberar bem sobre **projectos** e a responder **conhecimento geral**, mas permanece inconsistente sobre **si próprio**, a **organização** e a **arquitectura do Sistema CEO**.

Esta ANL está **pronta para definir a Arquitectura do Conhecimento Institucional do CEO**.

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Diagnóstico completo — arquitectura, lacunas, classificação, MVP | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-067-dossier-institucional-curado.md`](../requirements/REQ-067-dossier-institucional-curado.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-028-dossier-institucional-curado.md`](../architecture/ARQ-028-dossier-institucional-curado.md) (Em análise v0.1 — 03/08/2026).  
**Próximo passo oficial:** Homologação CTO → **IMP-067**.

# ANL-014 — Mapa das Capacidades Executivas do Sistema CEO (Baseline EIC)

> **Status:** Em análise — 06/08/2026 (levantamento técnico; aguarda acolhimento).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Identificação:** ANL-014.  
> **Frente:** Capacidades Executivas do Sistema CEO (abertura de levantamento).  
> **Norma superior:** CON-001; CAP-001; ADR-006; ADR-015; ADR-016.  
> **Fontes:** CAP-001; REL-001; ROADMAP-002; GATE-009; `docs/EIC/` (02, 09); ENC-006; cadeia IMP-054…069.  
> **Proibições deste artefacto:** não implementa; **não** altera arquitectura; **não** altera governação; **não** cria CAP/REQ/ARQ; **não** abre frentes.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Mapa executivo das capacidades **existentes** e **previstas** que operam sobre (ou consomem) a Baseline da EIC como fundamento conversacional. |
| **Por que existe?** | Evitar sobreposição de responsabilidades e improvisar frentes; dar visão completa para evolução planeada. |
| **Para quem existe?** | Patrocinador (priorização); Coordenador Executivo; CTO; Engenheiro (aguarda mandato). |
| **Como medir sucesso?** | (1) Mapa por capacidade com objectivo/responsabilidade/estado/deps/EIC/prioridade; (2) maturidade explícita; (3) ordem recomendada sem colisão de papéis. |

---

## 1. Perímetro e definições

### 1.1 Baseline da EIC (fundamento — não reabrir neste mapa)

| Camada | Conteúdo | Estado |
|--------|----------|--------|
| **EIC documental** | `docs/EIC/` (Marco Zero / Blocos) | Formalizado; homologação geral documental pode aguardar patrocinador |
| **EIC runtime (CAP-07)** | Classificador C1–C4 · CSC · VCA · Complexidade · DIC · Speaker/CN · fronteira texto | Implementada (IMP-057…067); voz = I/O (IMP-068) |
| **Invariante** | Voz ≠ classe; NCS ≠ Intenção; EIC ↛ redesign sem Gate ADR-006 | Vigente (ARQ-018/029; EIC/02) |

**Capacidade executiva** neste mapa = peça ou CAP que **decide, encaminha, executa, observa ou governa efeitos** após (ou em paralelo controlado com) a cadeia conversacional EIC — sem confundir prosa (CAP-07) com execução (Motor/Jobs) nem com disciplina documental EIC.

### 1.2 Três eixos do mapa (anti-sobreposição)

| Eixo | Responsabilidade | Não faz |
|------|------------------|---------|
| **A — Conversação / EIC** | Compreender, classificar, contextualizar, prosa | Publicar Jobs; redesenhar Motor |
| **B — Execução / Orquestração** | Gate, Motor, Fila, MRE, destinos C3/C4 | Reclassificar intenção; ser chatbot |
| **C — Domínio CAP (produto)** | Projetos, memória, plano, conhecimento, agentes… | Substituir o Classificador |

---

## 2. Mapa das capacidades (CAP-001) — visão executiva

Escala de maturidade usada abaixo:

| Código | Significado |
|--------|-------------|
| **B** | Baseline CAP homologada (ciclo ADR-006 da capacidade) |
| **R** | Runtime relevante presente |
| **H** | Homologação de produto/lab documentada para a peça citada |
| **P** | Parcial / residual / Gate aberto |
| **V** | Prevista / candidata (ROADMAP) — sem ciclo aberto |
| **A** | Adiada nesta onda |

Para cada CAP: objectivo · responsabilidade · estado · dependências · integração EIC · prioridade estratégica (filtro ADR-015 + ROADMAP-002).

---

### CAP-01 — Governança

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Trabalho de humanos/agentes obedece às normas; hierarquia CON→… intacta. |
| **Responsabilidade** | Regras permanentes; independência de ferramenta; não executar o trabalho governado. |
| **Estado actual** | Norma viva (CON/ADR/REQ); Consciência Operacional (REQ-059) **R+H**; pacote GOV pareceres **P** (calibração). |
| **Dependências** | CON-001; catálogo documental. |
| **Integração EIC** | EIC subordinada a CON; Gates G-EIC-* não substituem ADR-006. |
| **Prioridade** | **P1 contínua** (higiene); não é “feature” isolada. |
| **Maturidade** | **B** (norma) · peças runtime **H** · governação de processo **P** |

---

### CAP-02 — Gestão de Agentes

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Transformar IAs numa equipa; o utilizador não escolhe a IA. |
| **Responsabilidade** | Coordenar agentes; não executar o trabalho especializado deles. |
| **Estado actual** | Sem ciclo baseline pleno; orquestração actual (CTO Connector, fila, Cursor) **parcial**. |
| **Dependências** | CAP-11; Dispatcher; ADR-002 D2. |
| **Integração EIC** | Destinos C4 / efeitos laterais; não altera limiar C1–C4. |
| **Prioridade** | **A** nesta onda (ROADMAP-002); E4 ROADMAP-001 mais tarde. |
| **Maturidade** | **V/A** |

---

### CAP-03 — Gestão de Projetos (COA)

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Conduzir projectos ponta a ponta com exactamente um COA activo. |
| **Responsabilidade** | Contexto operacional; isolamento; conversa como interface. |
| **Estado actual** | **Baseline homologada** (26/07/2026); COA em uso. |
| **Dependências** | VIS-007; não reabrir REQ/ARQ/IMP/VAL da baseline. |
| **Integração EIC** | Contexto activo alimenta VCA/CSC; destino deliberativo C2 usa frente/COA. |
| **Prioridade** | **Preservar**; evoluções só CAP-R ou frente estreita (ex. lastro MG2 ≠ reabrir CAP-03). |
| **Maturidade** | **B+R+H** |

---

### CAP-04 — Gestão do Conhecimento

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Património consultável; cada projecto mais rápido que o anterior. |
| **Responsabilidade** | Organizar/preservar/recuperar conhecimento (≠ CAP-05 decisório). |
| **Estado actual** | ARQ histórica; IMP plena **não** baselineada como CAP-03/05/07/08; Briefing MG2 = mitigação. |
| **Dependências** | ARQ-006/007; coordenação com F3. |
| **Integração EIC** | DIC (IMP-067) é path meta/institucional — **não** substitui acervo CAP-04. |
| **Prioridade** | **P1** via F3 (lastro MG2) ou **P3** via F7 (ciclo IMP selectivo). |
| **Maturidade** | **P** (ARQ) · **V** (IMP plena) · mitigação **R** |

---

### CAP-05 — Memória Organizacional

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Nenhuma decisão sem histórico (5 campos). |
| **Responsabilidade** | Registo decisório vivo; ≠ conhecimento de domínio (CAP-04). |
| **Estado actual** | **Baseline homologada** (24/07/2026). |
| **Dependências** | CON-001 Art. 8º. |
| **Integração EIC** | Indirecta (rastreio de Gates/decisões conversacionais); não classifica. |
| **Prioridade** | **Preservar**; reforço documental contínuo. |
| **Maturidade** | **B+R+H** |

---

### CAP-06 — Aprendizado

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Evoluir sem depender de agente específico; BCO candidato. |
| **Responsabilidade** | Competências observáveis + ciclo de maturação. |
| **Estado actual** | Sem baseline; depende de uso real acumulado. |
| **Dependências** | ADR-002 D3–D5; CAP-07 (adaptação de comunicação). |
| **Integração EIC** | Futuro: qualidade conversacional aprendida — **fora** do runtime actual. |
| **Prioridade** | **A** |
| **Maturidade** | **A/V** |

---

### CAP-07 — Comunicação *(sede da Baseline EIC)*

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Mínimo necessário para o utilizador avançar com segurança. |
| **Responsabilidade** | Canal, intenção, contexto, prosa, voz-I/O; **não** é Motor nem fila. |
| **Estado actual** | Baseline **B** (24/07/2026) + cadeia runtime IMP-057…068 **R**; fechos documentais 066/067 **P**; F1 paridade prod **P** (Gate). |
| **Dependências** | VIS-005; ARQ-018…029; PX-002/003; REQ-050. |
| **Integração EIC** | **Núcleo** — toda evolução conversacional parte daqui; EIC documental governa *como* evolui. |
| **Prioridade** | **P1** higiene (F2) + fecho F1; **P2** evolução voz (F6) só após F1. |
| **Maturidade** | **B+R+H** (lab) · produção voz/docs **P** |

**Sub-mapa runtime CAP-07 / EIC (peças — sem nova CAP):**

| Peça | Objectivo | Estado | Deps | Prioridade |
|------|-----------|--------|------|------------|
| Classificador C1–C4 | Destino antes de efeito | H (IMP-057+) | ARQ-018 | Preservar |
| CSC (061–064) | Histórico, refs, tópico, objectivo | H (IMP) / docs P | Classificador | F2 docs |
| VCA (065) | Validar contexto activo | H | COA | Preservar |
| Complexidade (066) | Tempo ∝ custo | R; homologação P | Classificador | F2 |
| DIC (067) | Dossier institucional path meta | R; homologação P | CAP-01/07 | F2 |
| CEO Ouvindo (068) | Mic→texto→pipeline→TTS | H lab; prod P | PX-002; EIC intacta | F1 → F6 |
| Speaker / CN | Prosa | H | REQ-050; PX-003 | Preservar |

---

### CAP-08 — Planejamento Executivo

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Nunca executar sem objectivo claro; planos e tarefas distribuíveis. |
| **Responsabilidade** | Transformar visão/prioridades em plano; ≠ definir prioridades (Usuário). |
| **Estado actual** | **Baseline homologada** (24/07/2026). |
| **Dependências** | VIS-006; CAP-03/09 para acompanhamento. |
| **Integração EIC** | Deliberação C2 / MRE consome planos; Classificador não planeia. |
| **Prioridade** | **Preservar**; evoluções sob CAP-R ou frentes estreitas. |
| **Maturidade** | **B+R+H** |

---

### CAP-09 — Observabilidade

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Visibilidade de progresso e cadeia requisito→deploy. |
| **Responsabilidade** | Observar; **não** intervir na execução. |
| **Estado actual** | Painel IMP-055 **H**; observabilidade plena **V** (F8). |
| **Dependências** | Painel; Consciência (complementar, não duplicar). |
| **Integração EIC** | Painel só leitura; não classifica nem despacha. |
| **Prioridade** | **P3** (F8). |
| **Maturidade** | **P** (painel) · plena **V** |

---

### CAP-10 — Segurança

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Agentes não ultrapassam limites; autoridade final do utilizador. |
| **Responsabilidade** | Limites e aprovações; ≠ definir regras (CAP-01). |
| **Estado actual** | Gate humano (Continuidade) **H**; ciclo CAP-10 pleno **A**. |
| **Dependências** | CON Art. 6º/11; ARQ-019. |
| **Integração EIC** | Gate interceta antes de reclassificar C3; voz não cancela Gate. |
| **Prioridade** | **Preservar Gate**; CAP-10 plena **A**. |
| **Maturidade** | Peça Gate **H** · CAP plena **A** |

---

### CAP-11 — Integrações

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Conectar agentes/ferramentas sem dependência permanente. |
| **Responsabilidade** | Conectores e canais; ≠ coordenar trabalho (CAP-02). |
| **Estado actual** | CTO Connector, Fila, Motor, Railway/Vercel **H/R**. |
| **Dependências** | REQ-001; BP-001. |
| **Integração EIC** | Destinos C3/C4 e efeitos; Dispatcher ≠ Classificador. |
| **Prioridade** | **Preservar**; Dispatcher V3 **A**/backlog. |
| **Maturidade** | Peças core **H** · V3 **V/A** |

---

### CAP-12 — Desenvolvimento do Usuário

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Ampliar capacidade intelectual/produtiva do utilizador. |
| **Responsabilidade** | Explicar engenharia no uso; ≠ CAP-06 do CEO. |
| **Estado actual** | Princípio CON; sem ciclo baseline. |
| **Dependências** | CAP-07 (comunicação educacional). |
| **Integração EIC** | Qualidade de prosa/explicação — evolução futura. |
| **Prioridade** | **A** (fora ADR-015 imediato). |
| **Maturidade** | **A/V** |

---

## 3. Capacidades / peças executivas de runtime (eixo B)

Não são CAP novas — são **responsabilidades executivas** que consomem a saída da EIC.

| ID | Peça | Objectivo | Responsabilidade | Estado | Deps | Integração EIC | Prioridade |
|----|------|-----------|------------------|--------|------|----------------|------------|
| EX-01 | MRE R1 | Raciocínio executivo deliberativo | Deliberar após C2; não classificar | H (VAL-009) | ADR-019; ARQ-013 | Consome texto pós-EIC | Preservar |
| EX-02 | NCS | Natureza cognitiva da solicitação | Pré-MRE; ≠ Intenção | R; prod off | IMP-020; ARQ-014 | Paralelo ao Classificador (fronteira clara) | F4 P2 |
| EX-03 | Motor de Execução | Efeitos C3 | Jobs/política; não prosa | H | ARQ-017 | Só após C3 | Preservar |
| EX-04 | Continuidade do Gate | Decisão humana pendente | Interceptar antes de reclassificar | H | ARQ-019 | Preserva EIC | Preservar |
| EX-05 | Fila oficial / Dispatcher | Ciclo Job local | Despacho Cursor; ≠ cloud V3 | H MVP | ARQ-021; REQ-053/060 | Efeito pós-C3 | Preservar; V3 A |
| EX-06 | Conector CTO | Canal consulta CTO | C4 / consulta ≠ Job Agent | H | ARQ-015 | Destino operacional | Preservar |
| EX-07 | Painel Orquestração | Visibilidade | Só leitura | H | ARQ-016 | Observa cadeia | Preservar; F8 evolui |
| EX-08 | Consciência Operacional | Lastros C2/C3 | Enriquecer antes de responder | H | ARQ-020 | Não salta Classificador | Preservar |
| EX-09 | Home / Dia de Trabalho | Posto conversacional | UI de entrada | R | IMP-005 | Superfície L0 EIC | Preservar |

---

## 4. Frentes previstas (ROADMAP-002) — ligação ao mapa

| Frente | Objectivo resumido | CAP / eixo principal | Usa Baseline EIC? | Estado | Prioridade |
|--------|--------------------|----------------------|-------------------|--------|------------|
| **F1** | Paridade prod CEO Ouvindo | CAP-07 canal | Sim (não altera EIC) | Em fecho / Gate | P1 |
| **F2** | Fecho docs 066/067 + índice 061–067 | CAP-07 governação | Sim (só verdade documental) | Candidata | P1 |
| **F3** | Lastro operacional MG2 | CAP-04 selectiva / COA | Consome EIC (melhor C2) | Candidata | P1 |
| **F4** | NCS em produção | EX-02 | Fronteira com EIC crítica | Candidata | P2 |
| **F5** | CAP-R / RELEASE | Multi-CAP | Congela baseline EIC+voz | Candidata | P2 |
| **F6** | Voz contínua / barge-in / VAD | CAP-07 canal | **Não** alterar EIC | Candidata | P2 (após F1) |
| **F7** | CAP-04 IMP selectivo | CAP-04 | Indirecta (DIC ≠ acervo) | Candidata | P3 |
| **F8** | Observabilidade executiva | CAP-09 / EX-07 | Observa EIC | Candidata | P3 |

**Regularização F1 (REG-001):** residual de governação — não é capacidade nova; bloqueia encerramento limpo de F1.

---

## 5. Estado de maturidade — síntese

| Capacidade / peça | Maturidade | Nota numa linha |
|-------------------|------------|-----------------|
| CAP-03, 05, 07*, 08 | Alta (baseline) | *07 com residual prod/docs |
| EX-01,03,04,05,06,07,08 | Alta (runtime H) | Núcleo executivo utilizável |
| Cadeia EIC 057–065 | Alta runtime / docs P | F2 limpa índice |
| IMP-066/067 | Média | Código sim; Gate produto fraco |
| IMP-068 / F1 | Média–Alta lab; P prod/Gate | Fechar antes de F6 |
| CAP-04 | Baixa–Média | Mitigação briefing; F3/F7 |
| CAP-02, 06, 09 plena, 10–12 | Baixa / adiada | Fora do filtro imediato ADR-015 |
| NCS prod | Baixa (flag off) | F4 |
| Dispatcher V3 | Backlog | Não misturar com EIC |

---

## 6. Ordem recomendada de evolução

Ordem **sugerida** para evitar sobreposição (alinhada a ROADMAP-002 + ADR-015 + REG-001):

```text
0.  Fechar regularização F1 (REG-001) + Gate VAL-011/011R
1.  F2  — Fecho documental EIC (066/067 + índice)     [sem código de produto]
2.  F3  — Lastro MG2 (CAP-04 selectiva / briefing)   [maior ROI uso diário]
3.  F5  — CAP-R / RELEASE (opcional cedo se quiser marco)
4.  F4  — NCS produção                                [fronteira EIC explícita]
5.  F6  — Evolução voz                                [só com F1 fechada]
6.  F7  — CAP-04 IMP mais ampla                       [se F3 não bastar]
7.  F8  — Observabilidade executiva
8.  Depois: CAP-02 / CAP-06 / CAP-10–12 / Dispatcher V3
```

### 6.1 Regras anti-sobreposição (obrigatórias no planeamento)

1. **Uma frente activa** no mesmo perímetro (ROADMAP-001/002).  
2. **F6 nunca** emenda Classificador/CSC/VCA/DIC (EIC congelada quanto a intenção).  
3. **F4** declara fronteira NCS ≠ Intenção com testes de regressão EIC.  
4. **F3/F7** não importam arquitectura do MG2 para dentro do CEO.  
5. **F2** não é evolução de produto — só verdade documental.  
6. **CAP-R (F5)** não substitui fecho de Gate F1 se voz for usada em produção.  
7. Peças EX-* não ganham “CAP nova” sem ADR; evoluem sob CAP-11/01/09 conforme tabela.

### 6.2 Variantes de decisão do patrocinador

| Se a prioridade for… | Abrir primeiro… |
|----------------------|-----------------|
| Falar com o CEO no alias | Concluir **F1** (REG) |
| Governação limpa sem feature | **F2** |
| Melhor deliberar MG2 | **F3** (após F1 se voz crítica) |
| Congelar versão | **F5** (após F1/F2 ou ressalva aceite) |

---

## 7. Critério de sucesso desta ANL

| Critério | Estado |
|----------|--------|
| Visão completa CAP-01…12 com campos pedidos | Cumprido §2 |
| Peças executivas runtime mapeadas sem nova CAP | Cumprido §3 |
| Frentes F1–F8 ligadas a CAP/EIC | Cumprido §4 |
| Maturidade sintetizada | Cumprido §5 |
| Ordem recomendada sem sobreposição | Cumprido §6 |
| Zero implementação / zero alteração ARQ-GOV | Cumprido |

---

## 8. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor) — abertura de frente de levantamento |
| Quando | 06/08/2026 |
| O quê | ANL-014 — Mapa das Capacidades Executivas (Baseline EIC) |
| Por quê | Planejar evolução sem sobreposição; lastro CAP-001 + REL-001 + ROADMAP-002 + EIC |
| Resultado | Em análise — mapa completo; aguarda decisão de qual frente abrir a seguir |

---

## 9. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 06/08/2026 | Engenheiro (Cursor) | Levantamento completo — CAP, EX, frentes, maturidade, ordem | Em análise |

---

**Estado:** Em análise — **não** autoriza IMP nem código.  
**Próximo passo:** Patrocinador / Coordenador escolhe frente (F2/F3/…) ou manda executar REG-001; Engenheiro aguarda mandato explícito.

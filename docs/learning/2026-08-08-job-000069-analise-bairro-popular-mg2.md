# Análise da Proposta de Criação do Bairro Popular — JOB-000069

> **Entrega do Job da fila CEO.** Análise fundamentada da proposta de criar, do outro lado da rodovia (BR-101), um bairro popular com casas e pequenos prédios residenciais.  
> **Origem:** parecer `parecer-ef7533a0-00db-46c9-b366-d6979487f4da` · projeto `prj-mg2`.  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045 — delegação a perspectivas especializadas.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **Aprovaria a proposta como está?** | **Não** — direcção válida, escopo e timing inadequados |
| **Recomendação** | **MODIFICAR** e **NÃO PRIORIZAR** nesta onda |
| **Confiança** | Média-alta no timing; média no desenho futuro (lacunas de acervo) |
| **Urgência tratada** | Decisão clara **agora** evita despacho prematuro à oficina; execução fica **condicionada** |

**Síntese:** A proposta está **alinhada ao Manifesto MG2** (§13 — mundo mostra realidades diferentes, incluindo «popular»). Porém o Acervo Oficial indica **gates M0/M1 abertos**, **oeste da BR-101 hoje é mata/silhueta** (não urbano), **F9/expansão mapa arquivada**, **embrete BR-101 não fechado** e **monólito WorldLab2 ~16k LOC**. Implementar agora **não passa** o filtro ADR-015 nem reduz risco de uso diário — aumenta-o. Recomenda-se **fatia MVP de fundo** (sem gameplay, sem atravessar rodovia), **só após** gate Patrocinador M0+M1 e especificação mínima.

---

## 2. Proposta (como inferida do acervo)

| Campo | Conteúdo |
|-------|----------|
| **O quê** | Bairro popular residencial (casas + pequenos prédios) **a oeste da BR-101** — «do outro lado da rodovia» em relação ao núcleo Bombinhas |
| **Onde no código** | Zona `x < brX` — hoje `addBombinhasBrAccess` + silhuetas OESTE / mata densa (`WorldLab2Canvas.jsx` ~9650–10136) |
| **Estado actual** | **Visual de fundo** (floresta/montanhas); **sem** malha urbana, **sem** acesso jogável através da BR |
| **Lacunas no acervo** | Densidade, área em m², número de edifícios, propósito gameplay (missões? decorativo?), regras de acesso à BR, referência visual «popular» vs «residencial» do núcleo |

*Nota:* O parecer origem (`parecer-ef7533a0…`) **não** está materializado como ficheiro no repo CEO; a análise usa Job, conversa registada nos testes P1-1 e inspecção do repo jogo + briefing.

---

## 3. Perspectivas especializadas

### 3.1 Especialista de produto / Manifesto MG2

| Princípio Manifesto | Influência na recomendação |
|---------------------|----------------------------|
| **§13 — O mundo conta a história** | **A favor** — bairro popular reforça diversidade urbana (residencial ≠ popular ≠ comércio) |
| **§14 — Não-moralização** | **A favor** — mostrar realidade popular sem sermão; coerente se for ambiente observável, não lição |
| **§6 / §16 — Progressão material** | **Neutro** — só relevante se houver missões ou compra de casa nessa zona (não especificado) |
| **§15 — Diversão primeiro** | **Contra agora** — sem gates F1/F2 fechados, mais geometria agrava frustração antes de reforçar diversão |
| **§16 — Checklist decisão CEO** | Perguntas 1–2 (**diversão / experiência**): **prejudicam** se feito antes de M0/M1; perguntas 7–8 (**universo / jornada**): **favorecem** versão futura curada |

**Veredito produto:** Direcção **estratégica correta**; **implementação integral agora** incorreta.

### 3.2 Especialista técnico / performance (WorldLab2)

| Factor | Evidência | Impacto |
|--------|-----------|---------|
| Monólito | ~16 066 LOC, bundle ~956 kB (JOB-000057) | Cada bloco novo aumenta risco regressão |
| Perf S1–S3 | Entregues; **gate Patrocinador pendente** | Adicionar dezenas de prédios oeste = draw calls + memória antes de validar LOD/chunks |
| Zona oeste actual | Silhuetas + mata **sem sólidos** | Urbanizar implica **novo sistema** (colisão? LOD? chunks?) ou artefacto só-decorativo |
| BR-101 | `EMBRETE-BR101-EXTENSAO.md` — extensão N/S **não fechada** com prova visual | Construir «outro lado» antes de estabilizar eixo rodoviário repete padrão «heliporto» |
| Briefing §7 | «Não reescrever cidade inteira de uma vez» | Bairro oeste = expansão territorial relevante |

**Veredito técnico:** **Bloquear execução** até M0+M1 + embrete BR; se avançar, **apenas fundo low-poly** sem física, com orçamento ≤15 edifícios visíveis da BR.

### 3.3 Especialista de roadmap / ADR-015

| Critério | Avaliação |
|----------|-----------|
| **ADR-015** — aproxima uso diário CEO↔MG2? | **Não agora** — não desbloqueia playtest, perf nem missões |
| **JOB-000042 ranking** | Expansão mapa = **F9**, impacto **baixo**, **adiado** |
| **JOB-000048 / 064** | Onda actual: M0→M1→silhuetas NPC→F6; **WIP ≤ 2** |
| **JOB-000057 P01** | Gates nunca fechados — **prioridade zero** para expansão territorial |
| **F8 Temporada 2** | Já cortada; bairro popular compete pelo mesmo orçamento visual |

**Veredito roadmap:** **Não priorizar**; encaixar **após** gate único M0+M1 (+ M3 se relevante) como **M6 opcional** — «identidade territorial oeste».

### 3.4 Especialista de narrativa / educação integrada

| Aspecto | Análise |
|---------|---------|
| Potencial educativo | Contraste visual popular vs orla/comércio pode sugerir **trajetórias diferentes** (Manifesto §2–§5) **sem texto** |
| Risco | Se bairro for só «fundo bonito» sem entregas/missões, **zero** aprendizado — só custo perf |
| Coerência cultural | Manifesto §12 — NPCs estilizados; prédios devem seguir mesma linguagem (não hiper-realismo) |
| Lacuna | Acervo **não define** se jogador **atravessa** a BR ou só **vê** o bairro — muda desenho e custo |

**Veredito narrativo:** **Aprovar conceito**; exigir **brief de intenção** (1 página): «decorativo» vs «zona jogável» vs «missões futuras».

### 3.5 Especialista de governança / acervo

| Lacuna | Consequência |
|--------|--------------|
| Parecer origem ausente no repo | Rastreio incompleto — decisão baseada em Job + Manifesto + código |
| Briefing desactualizado (JOB-000057 P02) | CEO pode supor perf/noite errados ao deliberar expansão |
| Sem mapa de vias oeste | Impossível especificar Job oficina concreto |
| F9 arquivado sem gate de reabertura | Proposta reabre frente **multi-hub/BR** implicitamente |

**Veredito governança:** Entregar **parecer analítico** (este doc) **sem** Job oficina até Patrocinador confirmar fatia MVP e timing.

---

## 4. Prós e contras consolidados

### Prós

1. Alinhamento directo com Manifesto §13 e §14.  
2. Enriquece horizonte oeste (hoje vazio/floresta) — credibilidade regional SC.  
3. Baixo risco **conceitual** se limitado a silhueta urbana low-poly.  
4. Diferencia «Bombinhas orla» de «interior popular» — storytelling sem cutscene.

### Contras

1. **Timing:** gates M0/M1/M3 abertos; oficina já entregou 5+ Jobs sem playtest Patrocinador.  
2. **Performance:** monólito + carga inicial já dor #1 (briefing §4).  
3. **Escopo indefinido:** proposta no acervo **não quantifica** edifícios, área, gameplay.  
4. **BR-101 instável:** embrete aberto — risco trabalho «invisível».  
5. **Governança:** contradiz F9 adiado e briefing §7 sem Gate explícito.  
6. **ADR-015:** não aproxima uso diário **agora**.

---

## 5. Recomendação executiva (MODIFICAR + NÃO PRIORIZAR)

| Decisão | Detalhe |
|---------|---------|
| **Não executar** | Bairro completo jogável atravessando BR-101 nesta onda |
| **Modificar para MVP futuro** | **Cluster decorativo** oeste: 8–15 volumes simples (casas + 2–3 prédios baixos), visíveis da BR, **sem colisão**, **sem missões** v1 |
| **Pré-condições** | (1) Gate M0+M1 Patrocinador **passou**; (2) embrete BR-101 **aceite visual** ou escopo limitado ao stub existente; (3) brief 1 página aprovado pelo Patrocinador |
| **Posição na fila** | **Depois** de silhuetas carros (JOB-000063 fatia 2) e F6 pagamento — **paralelo baixo risco** só se WIP ≤ 2 |
| **Gate próprio** | Reabrir linha F9-light: «identidade oeste BR» — **não** multi-hub SC |

### Resposta às três opções pedidas

| Opção | Veredito |
|-------|----------|
| **Aprovar como proposto** | ❌ |
| **Modificar** | ✅ — fatia decorativa MVP + gameplay depois |
| **Não priorizar** | ✅ — até gates e brief mínimo |

---

## 6. Urgência (como tratada nesta entrega)

A urgência **não** exige construir o bairro **hoje**; exige **decisão clara** para não dispersar a oficina nem violar WIP. Este parecer **fecha** a deliberação analítica **agora** e **desbloqueia** o Patrocinador a:

1. Confirmar se quer **só horizonte** ou **zona jogável** (muda esforço 3–10×).  
2. Fechar **gate M0+M1** (30 min playtest) — item mais urgente do MG2 inteiro (JOB-000057 P01).

---

## 7. Próximo passo sugerido ao CEO

| # | Acção | Responsável |
|---|-------|-------------|
| 1 | Registar decisão: **conceito sim, execução não agora** | CEO |
| 2 | Patrocinador: gate M0+M1 numa sessão `/mg2` | Patrocinador |
| 3 | Se confirmar interesse no bairro: Patrocinador escreve **1 frase de intenção** (decorativo vs jogável) | Patrocinador |
| 4 | Só então: Job oficina «MVP bairro popular oeste — fundo low-poly pós-gate» | CEO → fila |

---

## 8. Fontes consultadas

| Fonte | Uso |
|-------|-----|
| `docs/mvp/briefing-operacional-mg2.md` | Dores, fora de escopo, filtro ADR-015 |
| `Projoto motoboy game/docs/MANIFESTO-MG2.md` | Princípios §13–§16 |
| `Projoto motoboy game/docs/EMBRETE-BR101-EXTENSAO.md` | Risco BR-101 |
| `WorldLab2Canvas.jsx` (oeste / BR) | Estado actual do terreno |
| `docs/learning/2026-08-07-job-000042-*` | Ranking F9 adiado |
| `docs/learning/2026-08-08-job-000057-*` | Gates abertos, monólito |
| `docs/learning/2026-08-08-job-000064-*` | WIP e sequência expansões |

---

## Resultado da fila

`result` — Análise multi-especialista entregue; recomendação **MODIFICAR + NÃO PRIORIZAR**; execução condicionada a gates M0+M1 e brief mínimo. Evidência: este ficheiro.

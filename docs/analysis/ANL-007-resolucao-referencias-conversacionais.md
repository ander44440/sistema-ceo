# ANL-007 — Resolução de Referências Conversacionais

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação (Compreensão Semântica e Contextual — 2ª melhoria perceptível sob EIC).  
> **Normas consultadas (somente leitura):** CON-001; ADR-006; ADR-015; ARQ-018; ARQ-022 / REQ-061 / **IMP-061**; REQ-057 / IMP-057; ARQ-019; ARQ-017; ARQ-014 (NCS); PX-003; ANL-006; `docs/EIC/`.  
> **Origem:** Comando do patrocinador — Análise Técnica da capacidade «Resolução de Referências Conversacionais» (próxima frente EIC após histórico no Classificador).  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **REQ**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise da estratégia para o CEO **resolver referências implícitas** («isso», «aquele», «o anterior», «continua», etc.) ao objecto correcto do fio conversacional, sem redesenhar a arquitectura homologada (Classificador C1–C4, Gate, Motor, NCS). |
| **Por que existe?** | O IMP-061 activa histórico para **desambiguar a rota C1↔C2**, mas **não identifica o referente** (o *quê* a que «isso» aponta). Sem resolução, C2/MRE e prosa ainda operam sobre texto elíptico — risco de resposta genérica ou pedido de reexplicação (CON-001 Art. 9º.2; NA-EIC-11). |
| **Para quem existe?** | Patrocinador (uso diário MG2); CTO (REQ); Engenheiro (IMP futuro). |
| **Como medir sucesso desta ANL?** | (1) Diagnóstico fiel do estado pós-IMP-061; (2) estratégia escolhida; (3) MVP delimitado; (4) compatibilidade ARQ-018/022/IMP-061/EIC; (5) sem implementação nesta etapa. |

---

## 1. Objetivo

Diagnosticar o tratamento actual de referências implícitas e definir a **melhor estratégia arquitectural** para:

1. recuperar o **objecto/referente** correcto da conversa (ou declarar ambiguidade);  
2. **reutilizar** a janela de histórico do IMP-061 (4 / 200 / 800);  
3. evitar interpretações incorrectas e C3/Job indevidos;  
4. manter compatibilidade integral com **ARQ-018**, **ARQ-022**, **IMP-061** e a EIC;  
5. preparar REQ da capacidade «Resolução de Referências Conversacionais» (CAP-07 — **sem CAP nova**).

---

## 2. Arquitectura actual (pós-IMP-061)

### 2.1 Cadeia de limiar

```text
Utilizador → Conversa (historico[])
                │
                ▼
         Continuidade Gate          ← léxico Aprovado/Cancela (não resolve «isso»)
                │
                ▼
         seleccionarHistoricoRecente(H, M)   ← IMP-061 (janela 4)
                │
                ▼
         classificar(M, { frenteActiva, historicoRecente? })
                │  S1 atalhos E2.1–E2.3 (mensagem literal)
                │  S2 léxico + empates
                │  S3 se deixis + lastro projecto → preferir C2 (classe só)
                ▼
         Destinos C1|C2|C3|C4|CLAR
                │
         C2 → MRE (+ LLM com histórico completo da UI)
         C1 → resposta leve (histórico ~6 no prompt)
```

### 2.2 Como referências implícitas são tratadas hoje

| Camada | Tratamento de «isso» / «continua» / «o anterior» | Resolve o *referente*? |
|--------|--------------------------------------------------|-------------------------|
| **IMP-061** `mensagemEhDeixisOuFollowUp` | Detecta padrão DET → candidato a S3 | **Não** — só flag booleana |
| **IMP-061** `aplicarDesambiguacaoHistorico` | Se deixis + projecto no histórico/`frenteActiva` → classe **C2** | **Não** — não extrai «outdoor», «Job», etc. |
| **Léxico C3** (`resolve isso`, `faz isso`) | Pode pontuar C3 se casar imperativo+deixis | Risco controlado por limiar/empates; IMP-061 **proíbe** histórico de forçar C3 |
| **Gate** | «Aprovado» exact-match; «ok» **não** é decisão de Gate | N/A |
| **CN** `detectarPedidoAmbiguo` | Marca turno ambíguo para prosa | **Não** classifica nem resolve |
| **MRE / C1 LLM** | Recebe texto elíptico + histórico bruto | Resolução **implícita** pelo modelo — sem contrato, sem auditoria |

### 2.3 O que o IMP-061 já oferece (insumo obrigatório)

| Activo | Uso para esta capacidade |
|--------|--------------------------|
| Janela `historicoRecente` (4/200/800) | Fonte canónica curta de candidatos a referente |
| Detecção de deixis DET | Gatilho para activar o resolvedor |
| `historicoTemReferenciaProjeto` | Sinal fraco de domínio (não é o referente) |
| Invariantes I-C3 / limiar / um Classificador | Fronteiras a **não** violar |
| Pipeline Núcleo pós-Gate | Ponto de integração natural **antes ou junto** do Classificador |

**Conclusão:** IMP-061 resolve **rota**; esta capacidade deve resolver **conteúdo referencial**.

---

## 3. Limitações

| ID | Limitação | Impacto UX |
|----|-----------|------------|
| L1 | «Isso» → C2 sem saber *o quê* | MRE delibera no vazio ou inventa foco |
| L2 | Sem modelo de referentes (entidade / tópico / acto / Gate) | «O anterior» é ambíguo (mensagem? Job? outdoor?) |
| L3 | Deixis regex incompleta («aquele», «o de cima», «a mesma coisa») | Falhas silenciosas → clarificação ou C1 errado |
| L4 | «Continua» não distingue continuar *explicação* vs *execução* | Risco perceptivo de C3 se léxico futuro alargar; hoje S3 só sobe C2 |
| L5 | Histórico truncado a 200 chars | Referente pode estar cortado |
| L6 | Resolução só no LLM pós-rota | Sem `razaoCurta` auditável do referente; difícil testar |
| L7 | Sem política de ambiguidade de referente | Pode «adivinhar» o objecto errado (pior que perguntar) |
| L8 | ANL-006 Alt. C (reescrever mensagem) ainda não realizada | Dívida explícita da frente CSC |

---

## 4. Oportunidades

1. **MVP perceptível imediato:** «e isso?» com histórico do outdoor → Classificador C2 **e** MRE/prosa ancorados em «outdoor / painel lateral».  
2. **Reutilizar IMP-061** sem nova persistência nem alargar janela no V1.  
3. **Clarificação situacional** quando N>1 candidatos («refere-te ao outdoor ou ao Gate?») — alinha NA-EIC-11.  
4. **Contrato testável** de referente (tipo + texto âncora + confiança) — regressão SC/CT.  
5. **Desacoplar** resolução de referência da pontuação C3 (preserva CQ1 ARQ-018).  
6. Fechar a Alt. C da ANL-006 de forma **controlada** (enriquecimento opcional, não concat lexico cego).

---

## 5. Alternativas consideradas

| ID | Alternativa | Veredicto |
|----|-------------|-----------|
| **A** | Só melhorar regex de deixis no IMP-061 (mais S3) | **Insuficiente** — continua sem referente |
| **B** | Resolvedor DET puro: extrai candidatos da janela (NP/tópicos léxico MG2 + último objectivo CEO) → `ReferenteResolvido` | **Recomendada (núcleo V1)** |
| **C** | Reescrever `M` → `M'` («isso»→«o outdoor lateral») e classificar `M'` | **Complementar controlado** — só se referente único e alta confiança; risco de poluir C3 se mal feito |
| **D** | LLM no limiar para resolver anáfora | **Rejeitada** no limiar (ARQ-018 NO5; custo; não-DET) |
| **E** | Confiar só no MRE/LLM pós-C2 | **Status quo** — não entrega contrato EIC nem auditoria |
| **F** | Store de «foco conversacional» persistente separado do histórico | **Fase 2** — útil, mas fora do MVP mínimo |

**Escolha:** **B** como MVP; **C** opcional *após* resolução com confiança alta e **proibição** de gerar verbo de execução novo; **A** como melhoria auxiliar do gatilho; **D/E** fora do limiar / insuficientes.

---

## 6. Estratégia recomendada

### 6.1 Princípio arquitectural

Introduzir um módulo puro **Resolvedor de Referências** (CAP-07), **adjacente** ao Classificador:

* **Não** é um segundo classificador de intenção.  
* **Não** altera limiar 0,55 nem enum C1–C4.  
* **Consome** `historicoRecente` (IMP-061) + mensagem actual + `frenteActiva`/COA (read-only).  
* **Produz** um artefacto opcional `ReferenteResolvido` (ou ambiguidade).  
* O Classificador continua o **único** ponto de decisão de **classe**; o resolvedor decide **âncora semântica do turno**.

```text
Gate → seleccionarHistoricoRecente
         │
         ├─► resolverReferencias(M, historicoRecente, coa?)  ← NOVO (puro)
         │         └─► { ok, referente?, candidatos[], precisaClarificacaoRef }
         │
         └─► classificar(M, { frenteActiva, historicoRecente })  ← IMP-061 intacto na V1
                   │
                   └─► destinos; injectar referente no lastro C2/C1 (não na pontuação C3)
```

### 6.2 Como recuperar o objecto correcto (V1)

Prioridade determinística de candidatos (da mais recente para a mais antiga na janela):

| Prioridade | Fonte | Exemplo |
|------------|-------|---------|
| P1 | Último tópico/objectivo explícito na fala do **CEO** | «Frente outdoor: falta o painel lateral…» → outdoor / painel lateral |
| P2 | Última menção de entidade de projecto na fala do **utilizador** | «outdoor», «pagamento», «Job JOB-…» |
| P3 | Nome da **frente activa / COA** | Motoboy Game 2 |
| P4 | Acto pendente de **Gate** (se store expuser resumo — *read-only*, sem alterar Gate) | «bugs do projecto» |

**Tipos de referente V1 (fechados):** `topico_projeto` | `frente_coa` | `acto_gate` | `mensagem_anterior` | `desconhecido`.

### 6.3 Ambiguidades

| Situação | Política V1 |
|----------|-------------|
| 0 candidatos | Não inventar; clarificação mínima **ou** seguir só IMP-061 (rota) |
| 1 candidato com confiança ≥ limiar interno (ex. 0,6) | `ReferenteResolvido` preenchido |
| ≥2 candidatos competidores | `precisaClarificacaoRef` + pergunta ancorada (não C3) |
| Deixis + histórico sem projecto | Não forçar referente de COA só por default agressivo — preferir clarificar se deixis forte |

### 6.4 Evitar interpretações incorrectas (invariantes)

| ID | Invariante |
|----|------------|
| I-R1 | Resolução **nunca** define `classe = trabalho_executivo` nem `permiteJob`. |
| I-R2 | Reescrita `M→M'` (se existir) **não** introduz verbos E2.1 novos. |
| I-R3 | Classificador permanece único ponto de classe; resolvedor não publica Jobs. |
| I-R4 | Gate permanece anterior; resolvedor **não** corre no caminho Continuidade. |
| I-R5 | Motor / NCS / Jobs inalterados nos contratos. |
| I-R6 | Sem referente ⇒ comportamento actual (IMP-061 + IMP-057) preservado. |
| I-R7 | Janela e caps IMP-061 **não** aumentam no MVP (reutilizar 4/200/800). |

### 6.5 Impacto esperado na experiência

| Antes | Depois (MVP) |
|-------|----------------|
| «e isso?» → C2 genérico | C2 + lastro «outdoor / painel lateral» |
| Utilizador repete o tema | CEO retoma o fio (Art. 9º.2) |
| Ambiguidade silenciosa | Pergunta curta com opções de referente |
| Confiança só de rota | Auditoria `razaoReferente` testável |

---

## 7. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Referente errado pior que clarificação | Política ≥2 candidatos → clarificar; limiar interno |
| R2 | Reescrita activa E2.1 acidentalmente | I-R2; testes anti-C3; Alt. C só pós-validação B |
| R3 | Confusão com IMP-061 / dupla lógica | Documentar: IMP-061 = rota; esta ANL = referente |
| R4 | Alargar escopo a topic tracking completo | MVP fechado; fase 2 explícita |
| R5 | Tocar Gate/Motor «para ajudar» | I-R4/I-R5; fronteiras de teste |
| R6 | Expectativa de NLP profundo | Comunicar: V1 = DET + léxico projecto + âncoras |

---

## 8. Compatibilidade

| Artefacto | Relação |
|-----------|---------|
| **ARQ-018** | Não altera classes/limiar; resolvedor fora do «classificar intenção» como efeito; reforça tempo do utilizador |
| **ARQ-022 / REQ-061 / IMP-061** | **Consome** `historicoRecente`; não revoga S3; não obriga a mudar caps |
| **IMP-057 / REQ-057** | Regressão obrigatória; um Classificador |
| **ARQ-019** | Gate antes; sem competir com léxico de decisão |
| **ARQ-017 / NCS** | Destinos inalterados; referente só lastro pós-rota |
| **EIC** | CAP-07; 2ª frente CSC; G-EIC-D + ADR-006 antes de IMP; SC de anáfora no `05` |
| **ANL-006** | Realiza Alt. B estável + Alt. C controlada como evolução |

---

## 9. Escopo sugerido para um MVP (futura REQ)

### 9.1 Dentro

* Módulo puro `resolverReferencias` (ou nome IMP).  
* Entrada: mensagem + `historicoRecente` (IMP-061) + `frenteActiva`/COA opcional.  
* Saída: `ReferenteResolvido | ambiguidade | nenhum`.  
* Gatilho: deixis/follow-up (reutilizar/estender `mensagemEhDeixisOuFollowUp`).  
* Injectar referente no **lastro** C2 (e opcionalmente C1) — **não** na pontuação C3.  
* Clarificação ancorada se ambíguo.  
* Testes: regressão IMP-057/061; anti-C3; casos «isso/continua/o anterior»; Gate intacto.  
* Docs EIC SC-* de referência.

### 9.2 Fora do MVP

* LLM no limiar; coreference ML.  
* Aumentar janela >4 no Classificador.  
* Store persistente de foco.  
* Topic shift detector completo.  
* Alterar limiar / C1–C4 / Gate / Motor / NCS / Jobs.  
* Reescrita agressiva da mensagem para léxico C3.

### 9.3 Ordem ADR-006 sugerida

```text
ANL-007 (este) → aprovação CTO
  → REQ-0xx Resolução de Referências Conversacionais (CAP-07)
  → ARQ-0xx (complemento ARQ-018/022 — módulo resolvedor)
  → G-EIC-D + IMP → VAL
```

### 9.4 Critérios de aceite sugeridos (para a REQ)

1. Sem deixis / sem histórico ⇒ idêntico ao baseline IMP-061.  
2. «e isso?» + histórico outdoor ⇒ referente contém outdoor (ou âncora equivalente) **e** classe ≠ C3.  
3. Dois tópicos competidores ⇒ clarificação de referente, não Job.  
4. «Implementa X» na mensagem actual ⇒ C3 inalterado.  
5. Suite IMP-057 + IMP-061 + Continuidade verdes.

---

## 10. Limites desta análise

| ID | Fora |
|----|------|
| X1 | Implementação / prompts / comportamento |
| X2 | Criar CAP nova |
| X3 | Emendar ARQ-018 texto nesta ANL |
| X4 | Fechar números exactos do limiar interno de referente (cabem na REQ) |

---

## 11. Conclusão

O CEO **detecta** deixis para **escolher a rota C2** (IMP-061), mas **ainda não resolve** o objecto da referência. A próxima capacidade EIC sob CAP-07 deve introduzir um **resolvedor determinístico de referentes** que reutiliza a janela IMP-061, alimenta lastro C2/clarificação, e **nunca** compete com o Classificador em C3/Job.

Esta ANL está **pronta para abertura da REQ** «Resolução de Referências Conversacionais».

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Análise técnica inicial | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-062-resolucao-referencias-conversacionais.md`](../requirements/REQ-062-resolucao-referencias-conversacionais.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-023-resolucao-referencias-conversacionais.md`](../architecture/ARQ-023-resolucao-referencias-conversacionais.md) (Em análise v0.1 — 03/08/2026).  
**Próximo passo oficial:** Homologação REQ-062 + ARQ-023 → **IMP-062** (após Gates ADR-006 / EIC).

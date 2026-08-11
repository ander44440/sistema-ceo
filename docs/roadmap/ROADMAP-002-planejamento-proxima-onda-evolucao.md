# ROADMAP-002 — Planejamento da Próxima Onda de Evolução

> **Status:** Em análise — 03/08/2026; **actualizado 06/08/2026** (F1 encerrada — REG-001).  
> **Tipo:** ROADMAP (ADR-016). **Identificação:** ROADMAP-002.  
> **Natureza:** Plano da **próxima onda** de evolução do Sistema CEO — organiza e prioriza **frentes candidatas** após GATE-009.  
> **Norma superior:** CON-001; ADR-006; ADR-015; ADR-016; ADR-017; [`ROADMAP-001`](ROADMAP-001-plano-estrategico-do-sistema-ceo.md) (estratégia até CEO 1.0); [`REL-001`](../REL-001-estado-atual-do-sistema-ceo.md); [`GATE-009`](../GATE-009-certificacao-prontidao-sistema-ceo.md) (**homologado**).  
> **Frente F1:** **ENCERRADA** — 06/08/2026 ([`REG-001 pacote de fecho`](../governance/REG-001-pacote-fecho-f1.md); VAL-011 / VAL-011R Gate aprovado).  
> **Frente activa:** **nenhuma** — aguarda decisão do patrocinador / CTO sobre a próxima (referência: [`ANL-014`](../analysis/ANL-014-mapa-capacidades-executivas-baseline-eic.md)).  
> **Proibições deste artefacto:** não cria CAP; não abre frentes além da decidida; **não** cria REQ/ARQ/IMP/código por si.  
> **Autoridade:** o patrocinador decide **qual** frente abrir; este ROADMAP apenas **orienta**.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O plano da próxima onda de evolução — frentes candidatas, prioridade, ordem e critérios de abertura. |
| **Por que existe?** | GATE-009 certificou prontidão (**Apto com ressalvas**); falta escolher a próxima frente sem improviso. |
| **Para quem existe?** | Patrocinador (escolha); CTO (revisão de sequência); Engenheiro (espera mandato explícito). |
| **Como medir sucesso?** | Quando o patrocinador escolher uma frente e o Engenheiro só então abrir o ciclo ADR-006 correspondente — sem trabalho antecipado. |

---

## 1. Estado consolidado do produto

| Dimensão | Estado (pós GATE-009) |
|----------|------------------------|
| Fase | Uso operacional (ADR-015) — contexto MG2 |
| Baselines | CAP-03 / 05 / 07 / 08 homologadas |
| Núcleo | MRE R1 autorizado; Motor; Gate; Fila; Painel; CTO Connector |
| EIC runtime | Classificador + CSC + VCA + Complexidade + DIC + voz I/O (IMP-057…068) |
| Frente voz MVP | **ENCERRADA** (ENC-006); código em `main` (`29afde9`) |
| Prontidão | GATE-009 **homologado** — **Apto com ressalvas** |
| Ressalva vigente (GATE-009 B-voz) | **Fechada** quanto a F1 — alias com IMP-068 + VAL-011/011R Gate aprovado (06/08/2026) |
| Modo Engenheiro | **Aguarda decisão** da próxima frente (ANL-014); F1 não bloqueia |

Filtro obrigatório de priorização (ADR-015):

> *«Esta frente aproxima o usuário de utilizar o CEO diariamente no desenvolvimento do MG2?»*

---

## 2. Frentes candidatas

Cada frente, se escolhida, exigirá ciclo próprio (ANL quando couber → REQ → ARQ → IMP → VAL). **Nenhuma** está aberta.

### F1 — Paridade de produção do CEO Ouvindo

> **Estado:** **ENCERRADA** — 06/08/2026 (REG-001 pacote mínimo; Gates VAL-011 / VAL-011R).

| Campo | Conteúdo |
|-------|----------|
| **Objectivo** | Garantir que o alias `sistema-ceo.vercel.app` serve o bundle com IMP-068 e que o smoke oral (mic → STT → pipeline → TTS → Ouvindo) passa em produção. |
| **Benefício esperado** | Uso diário **por voz** no ambiente oficial; fecha a ressalva do GATE-009. |
| **Dependências** | `main` @ `29afde9` (já); acesso Vercel/redeploy se o alias estiver atrasado; Chrome/Edge. |
| **Complexidade** | Baixa |
| **Impacto** | Alto (se o uso oral for prioridade operacional) |
| **Prioridade** | **P1** — operacional de fecho (não é CAP nova) — **cumprida** |
| **Fecho** | [`REG-001-pacote-fecho-f1.md`](../governance/REG-001-pacote-fecho-f1.md) · VAL-011 · VAL-011R · IMP-069 |

### F2 — Fecho documental e espelhamento do índice (066/067 + REQ/ARQ)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Homologar formalmente IMP-066 e IMP-067 no catálogo; alinhar status REQ/ARQ 061–067 ao estado real; fechar EIC-14 se o patrocinador deliberar. |
| **Benefício esperado** | Índice = verdade operacional; reduz risco de governação falsa; barato. |
| **Dependências** | GATE-009; artefactos IMP já em código; sem necessidade de feature nova. |
| **Complexidade** | Baixa |
| **Impacto** | Médio (governação / auditoria) |
| **Prioridade** | **P1** |

### F3 — Lastro operacional MG2 (conhecimento curado no COA)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Elevar a qualidade deliberativa do CEO no contexto MG2 — briefing/lastro operacional além da mitigação actual (sem importar arquitectura do MG2). |
| **Benefício esperado** | Respostas e planos mais ancorados no projecto real do patrocinador (ADR-015). |
| **Dependências** | COA activo; Briefing Curado existente; eventual toque em CAP-04 **seletiva** (não reabrir CAP-03). |
| **Complexidade** | Média |
| **Impacto** | Alto |
| **Prioridade** | **P1** (recomendação estratégica principal se voz/docs não forem o foco) |

### F4 — NCS em produção

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Activar e validar a Natureza Cognitiva da Solicitação (IMP-020) em produção com Gate explícito. |
| **Benefício esperado** | Melhor encaminhamento pré-MRE; menos deliberação desnecessária. |
| **Dependências** | Código B1–B4 presente; `flagNcs`; VAL dedicada; não confundir com Classificador. |
| **Complexidade** | Média |
| **Impacto** | Médio–Alto |
| **Prioridade** | **P2** |

### F5 — CAP-R / RELEASE formal pós-onda EIC+voz

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Consolidar baselines + frentes 057–068 numa CAP-R e/ou RELEASE nomeada (ADR-016 / ADR-017). |
| **Benefício esperado** | Versão auditável do produto; ponto de partida limpo para a onda seguinte. |
| **Dependências** | Preferível após F1–F2 (ou aceitação explícita das ressalvas); REL-001 como insumo. |
| **Complexidade** | Média |
| **Impacto** | Médio |
| **Prioridade** | **P2** |

### F6 — Evolução do modo voz (contínua / barge-in / VAD)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Superar limitações do MVP ENC-006 §7 (conversa contínua, barge-in, wake word, VAD, TTS servidor). |
| **Benefício esperado** | Experiência oral fluida, proximidade a assistente hands-free. |
| **Dependências** | F1 (paridade produção) **fortemente recomendada**; nova cadeia ANL→REQ→ARQ; **não** alterar EIC. |
| **Complexidade** | Alta |
| **Impacto** | Médio (experiência); Alto se o uso for predominantemente oral |
| **Prioridade** | **P2** |

### F7 — CAP-04 Gestão do Conhecimento (ciclo IMP selectivo)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Materializar património consultável do acervo (além do briefing pontual), alinhado a ARQ-006/007 já existentes. |
| **Benefício esperado** | Conhecimento reutilizável entre sessões/projectos; reforço do pilar Conhecimento. |
| **Dependências** | Fase ARQ CAP-04 encerrada historicamente; novo Gate IMP; coordenação com F3 se lastro MG2 for o MVP desta CAP. |
| **Complexidade** | Alta |
| **Impacto** | Alto (longo prazo) |
| **Prioridade** | **P3** (pode fundir-se com F3 numa frente mais estreita) |

### F8 — Observabilidade executiva (CAP-09 / Painel avançado)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Tornar progresso, latência e falhas observáveis sem montagem manual. |
| **Benefício esperado** | Confiança operacional; métricas que o REL-001 ainda não tem dashboard. |
| **Dependências** | Painel IMP-055 como base; ROADMAP-001 E5. |
| **Complexidade** | Média–Alta |
| **Impacto** | Médio |
| **Prioridade** | **P3** |

---

## 3. Ordem recomendada de execução

Ordem **sugerida** (não imposta) sob ADR-015 e GATE-009:

```text
0º  F1  Paridade produção CEO Ouvindo     ENCERRADA 06/08/2026 (REG-001)
1º  F2  Fecho documental / índice         (próxima candidata típica)
2º  F3  Lastro operacional MG2            (maior ROI de uso diário)
3º  F4  NCS produção                      (qualidade cognitiva)
4º  F5  CAP-R / RELEASE                    (marco de versão)
5º  F6  Evolução de voz                   (F1 já fechada)
6º  F7 / F8                               (ondas seguintes)
```

**Variantes de decisão do patrocinador:**

| Se a prioridade for… | Abrir primeiro… |
|----------------------|-----------------|
| Falar com o CEO hoje no alias | **F1** |
| Governação limpa sem código | **F2** |
| Melhor deliberar sobre o MG2 | **F3** |
| Congelar uma versão | **F5** (após F1/F2 ou com ressalvas aceites) |

---

## 4. Critérios para abertura de cada frente

Critérios **comuns** (todas as frentes):

1. Mandato explícito do patrocinador nomeando a frente (ID F1…F8 ou equivalente).  
2. Confirmação de que **não** há Job/frente anterior em curso no mesmo perímetro.  
3. Abertura pelo fluxo ADR-006 (ANL se necessário → REQ → …) — **nunca** código primeiro.  
4. Filtro ADR-015 respondido por escrito no artefacto de abertura.  
5. GATE-009 vigente: se a frente depender de voz em produção, F1 deve estar **fechada** ou o risco **aceite** por escrito.

| Frente | Critérios específicos adicionais |
|--------|----------------------------------|
| **F1** | Acesso ao projecto Vercel / confirmação de deploy; checklist smoke VAL-010 §6 |
| **F2** | Lista de documentos a alinhar; sem alteração de comportamento de produto |
| **F3** | Âmbito do lastro (o que entra / o que fica fora); proibição de importar engenharia MG2 |
| **F4** | Plano de activação `flagNcs` + rollback; VAL de produção |
| **F5** | Escopo da RELEASE (quais baselines/frentes entram); ADR-017 se CAP-R |
| **F6** | F1 concluída ou risco aceite; escopo MVP2 da voz (1–2 evoluções, não todas) |
| **F7** | Decisão CAP-04 vs lastro mínimo (F3); não reabrir ARQ congelada sem emenda |
| **F8** | Métricas mínimas a observar; não duplicar Consciência Operacional |

---

## 5. Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Abrir F6 sem F1 | Alta | Critério de abertura; GATE-009 B-voz |
| Abrir CAP-E ampla sem lastro MG2 | Alta | Preferir F3 / CAP-R estreita |
| Trabalhar duas frentes em paralelo | Média | Uma frente activa por vez (P2 do ROADMAP-001) |
| Confundir F2 (docs) com evolução de produto | Baixa | Escopo documental explícito |
| NCS alterar limiar do Classificador | Alta | Fronteira clara; testes de regressão EIC |
| Adiar F3 indefinidamente | Média | ADR-015 — uso diário MG2 degrada |
| RELEASE prematura com alias desactualizado | Média | F5 após F1 ou ressalva na RELEASE |

---

## 6. Capacidades explicitamente adiadas

Não entram nesta onda como frentes activas (permanecem no horizonte ROADMAP-001):

| Capacidade / tema | Motivo do adiamento |
|-------------------|---------------------|
| **CAP-02** Gestão de Agentes (ciclo pleno) | Orquestração actual suficiente; E4 do ROADMAP-001 mais tarde |
| **CAP-06** Aprendizado / BCO | Sem lastro suficiente; depende de uso real acumulado |
| **CAP-09** Observabilidade plena | Coberto parcialmente por F8 como P3 |
| **CAP-10…12** (mapa CAP-001 restantes sem baseline) | Fora do filtro ADR-015 imediato |
| **CAP-E** novas capacidades estratégicas | Nenhuma CAP-E aberta; preferir CAP-R / frentes estreitas |
| **Importação de arquitectura MG2** | Proibida (produto CEO independente) |
| **Evoluções voz ENC-006 §7 em bloco** | Adiadas; só sob F6 com escopo reduzido |
| **Reabertura de baselines CAP-03/05/07/08** | Só via CAP-R deliberada |

---

## 7. Conclusão executiva

O Sistema CEO está **pronto para escolher** a próxima frente (GATE-009 homologado).  
Este ROADMAP-002 **não escolhe** — **organiza**.

**Recomendação de engenharia (sugerir sem impor):**

1. Se o alias ainda não reflectir IMP-068 → **F1** primeiro.  
2. Em paralelo documental (ou a seguir) → **F2**.  
3. Como primeira frente de **evolução de valor** → **F3** (lastro MG2).

Qualquer outra ordem é válida se o patrocinador a declarar com os critérios da §4.

**Próximo acto esperado:** decisão do patrocinador — *«Abrir frente Fx»* — após a qual o Engenheiro inicia **apenas** o primeiro artefacto ADR-006 dessa frente (tipicamente ANL ou REQ), sem antecipar as demais.

---

## Relação com ROADMAP-001

| ROADMAP-001 | Ligação |
|-------------|---------|
| E3 Inteligência Executiva | F3, F4, evoluções CAP-07 |
| E4 Autonomia Executiva | Adiada (CAP-02/08 plenas) |
| E5 Gestão Estratégica | F8 (P3) |
| E6 Inteligência Organizacional | CAP-06 adiada |
| RELEASE / CEO 1.0 | F5 como marco intermédio desta onda |

ROADMAP-002 é **onda táctica**; não substitui ROADMAP-001.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), por mandato do patrocinador; REG-001 06/08/2026 |
| Quando | 03/08/2026 (criação); 06/08/2026 (F1 encerrada) |
| O quê | ROADMAP-002 — planejamento da próxima onda |
| Por quê | GATE-009 homologado; organizar frentes sem iniciar desenvolvimento |
| Resultado | Em análise quanto a F2–F8; **F1 ENCERRADA**; aguarda escolha da próxima frente |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Frentes F1–F8 candidatas | Em análise |
| 0.1.1 | 06/08/2026 | Engenheiro (Cursor) | REG — F1 encerrada; ordem actualizada; ressalva B-voz F1 fechada | Editorial |

---

**Estado:** Em análise — aguarda **decisão do patrocinador** sobre qual frente abrir a seguir (F1 não bloqueia).  
**Engenheiro:** não cria ANL/REQ/ARQ/IMP/código da próxima frente até mandato explícito.  
**Referência de planeamento:** [`ANL-014`](../analysis/ANL-014-mapa-capacidades-executivas-baseline-eic.md) (**aprovada** CTO).

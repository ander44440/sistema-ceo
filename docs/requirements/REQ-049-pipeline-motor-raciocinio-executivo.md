# REQ-049 — Pipeline do Motor de Raciocínio Executivo (MRE)

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá executar toda deliberação aberta através de um **pipeline operacional fixo** do Motor de Raciocínio Executivo (MRE), que percorre os estágios definidos nesta REQ, produz **exatamente um** `ParecerExecutivo` válido conforme REQ-048, e só então autoriza o Speaker a comunicar com o utilizador.

## Tipo

Funcional; detalhado (fluxo operacional / orquestração).

## Objetivo

Especificar o **fluxo completo** do MRE — sequência, responsabilidades, entradas/saídas, pré/pós-condições, transições, falhas, pontos determinísticos vs LLM, validação do parecer e integração com Núcleo Executivo e Speaker — usando o contrato REQ-048 como única saída deliberativa.

## Escopo

### Inclui

* Sequência completa dos estágios 0–8 e fecho com `ParecerExecutivo`.
* Responsabilidade, entrada, saída, pré-condições e pós-condições de cada estágio.
* Regras de transição entre estágios.
* Tratamento de falhas e lacunas.
* Classificação de cada estágio: **determinístico** | **LLM** | **híbrido**.
* Produção e validação do `ParecerExecutivo` (REQ-048 V1–V6).
* Integração com Núcleo Executivo (admissão/roteamento) e Speaker (exposição).

### Fora do escopo

* Implementação em código, classes ou ficheiros.
* Schema do parecer (já coberto por **REQ-048**).
* Conteúdo literal de prompts.
* Persistência física de memória/precedentes (apenas **decisão** de aprendizado no estágio 8).
* Despacho real na Fila (REQ-045) — apenas a **produção** de `acao.job` quando aplicável.
* Voice Engine (REQ-047) — apenas como canal a jusante do Speaker.

## Justificativa

ADR-019 exige separação entre deliberação e comunicação. REQ-048 fixa o contrato do parecer. Sem pipeline normativo, o MRE volta a ser “um prompt grande”. Esta REQ torna o raciocínio **repetível, auditável e testável** estágio a estágio.

---

## Visão do fluxo

```text
Mensagem do utilizador
        ↓
Núcleo Executivo (admissão + classificação + roteamento)
        ↓
   [rota = deliberativo?]
    não → fluxo determinístico / local (sem MRE)
    sim ↓
Motor de Raciocínio Executivo
   0 → 1 → 2 → 3 → 4 → 5a ∥ 5b → 6 → 7 → 8
        ↓
Validação ParecerExecutivo (REQ-048)
        ↓
   [válido?]
    não → regeneração controlada ou falha deliberativa (ver falhas)
    sim ↓
Speaker (linguagem natural a partir do parecer)
        ↓
Voice / Conversa / UI
```

**Regra absoluta:** o Speaker **nunca** inicia sem parecer válido. O MRE **nunca** emite prosa de utilizador.

---

## Sequência completa dos estágios

| Ordem | Estágio | Nome |
|-------|---------|------|
| 0 | Diagnóstico Estratégico | Compreender objetivo real, problema e natureza |
| 1 | Enquadramento | Tipificar pedido, urgência e escopo |
| 2 | Memória Executiva | Recuperar dossier / factos dinâmicos |
| 3 | Princípios Permanentes | Aplicar mandato e regras invioláveis |
| 4 | Análise | Estruturar o julgamento |
| 5a | Avaliação de Riscos | Ameaças e mitigações |
| 5b | Avaliação de Oportunidades | Alavancas e condições |
| 6 | Decisão Executiva | Estado fechado + justificativa |
| 7 | Ação Operacional | Gesto concreto (+ job se despacho) |
| 8 | Aprendizado | Memória / precedente / proposta de princípios |
| — | **Montagem + Validação** | Produzir `ParecerExecutivo` e validar REQ-048 |

**Nota:** 5a e 5b são **paralelos lógicos** após o estágio 4; ambos devem concluir antes do estágio 6. A ordem de execução física pode ser sequencial ou paralela, desde que as pós-condições de ambos estejam satisfeitas antes de 6.

---

## Catálogo de estágios

Legenda **Modo:** `DET` = determinístico · `LLM` = modelo sob contrato · `HIB` = híbrido (regras + LLM).

---

### Estágio 0 — Diagnóstico Estratégico

| | |
|--|--|
| **Responsabilidade** | Identificar o objetivo real da interação, o problema de negócio e a natureza (`estrategica` \| `tatica` \| `operacional`). |
| **Modo** | `LLM` (com saneamento `DET` de campos vazios) |
| **Entrada** | Mensagem do utilizador; intenção classificada pelo Núcleo (metadado); COA ativo (se houver); histórico recente opcional (contexto conversacional, não factos inventados). |
| **Saída parcial** | `diagnostico` (REQ-048) |
| **Pré-condições** | Núcleo roteou a interação para o MRE; mensagem não vazia. |
| **Pós-condições** | `objetivoReal`, `problemaNegocio` e `natureza` preenchidos e não vazios; `natureza` ∈ enum. |
| **Lacunas** | Se natureza ou problema forem incertos → registar em acumulador de `lacunas` e continuar (não abortar só por incerteza). |

---

### Estágio 1 — Enquadramento

| | |
|--|--|
| **Responsabilidade** | Classificar o pedido (`tipoPedido`), `urgencia` e `escopo` à luz do diagnóstico. |
| **Modo** | `HIB` — heurísticas `DET` sobre intenção do Núcleo + refinamento `LLM` se ambíguo. |
| **Entrada** | Saída do estágio 0; intenção do Núcleo. |
| **Saída parcial** | `enquadramento` |
| **Pré-condições** | Pós-condições do estágio 0 satisfeitas. |
| **Pós-condições** | `tipoPedido` e `urgencia` ∈ enums; `escopo` não vazio. |
| **Transição** | Se `tipoPedido = ambiguo` → acrescentar lacuna; **não** saltar para Speaker. |

---

### Estágio 2 — Memória Executiva

| | |
|--|--|
| **Responsabilidade** | Montar o dossier de factos dinâmicos (Painel / memória / sessão) usados na deliberação. |
| **Modo** | `DET` |
| **Entrada** | COA ativo; snapshot de memória executiva / Painel; decisões, pendências, próximo passo, dia. |
| **Saída parcial** | `dossier` (`resumoPainel`, `factosUsados`, `fontes` opcional) |
| **Pré-condições** | Estágio 1 concluído. |
| **Pós-condições** | `resumoPainel` presente; `factosUsados` é lista (possivelmente vazia). |
| **Lacunas** | Se não houver COA ou Painel vazio material → lacuna explícita; `factosUsados` pode ficar vazio. |
| **Proibição** | Não inventar progresso, decisões ou estados ausentes das fontes oficiais. |

---

### Estágio 3 — Princípios Permanentes

| | |
|--|--|
| **Responsabilidade** | Selecionar e listar princípios/regras aplicáveis (Constituição, regras invioláveis, preferências homologadas). |
| **Modo** | `HIB` — catálogo `DET` + seleção/relevância `LLM` limitada ao catálogo. |
| **Entrada** | Constituição / princípios persistidos; diagnóstico; enquadramento. |
| **Saída parcial** | `principiosAplicados[]` |
| **Pré-condições** | Estágio 2 concluído. |
| **Pós-condições** | Lista presente; se vazia, deve existir lacuna que o justifique **ou** natureza puramente operacional sem princípio específico (registar nota em `lacunas` ou em metadados de auditoria futura). |
| **Proibição** | Não criar princípios novos neste estágio (isso é só proposta no estágio 8). |

---

### Estágio 4 — Análise

| | |
|--|--|
| **Responsabilidade** | Produzir análise estruturada do que está em jogo (não texto de UI). |
| **Modo** | `LLM` |
| **Entrada** | Diagnóstico, enquadramento, dossier, princípios. |
| **Saída parcial** | `analise` (string não vazia) |
| **Pré-condições** | Estágios 0–3 concluídos. |
| **Pós-condições** | `analise` trim ≠ `""`; não contém instruções de fala ao utilizador como objetivo primário. |

---

### Estágio 5a — Avaliação de Riscos

| | |
|--|--|
| **Responsabilidade** | Identificar riscos materiais e mitigações opcionais. |
| **Modo** | `HIB` — sinais `DET` do Painel (ex.: estado crítico) + `LLM` para elaborar lista tipada. |
| **Entrada** | Análise + dossier + princípios. |
| **Saída parcial** | `riscos[]` |
| **Pré-condições** | Estágio 4 concluído. |
| **Pós-condições** | Lista válida (itens conformes REQ-048); pode ser vazia se não houver riscos materiais. |

---

### Estágio 5b — Avaliação de Oportunidades

| | |
|--|--|
| **Responsabilidade** | Identificar oportunidades e condições de captura. |
| **Modo** | `LLM` (com opção de lista vazia explícita) |
| **Entrada** | Análise + dossier + princípios (independentemente da lista de riscos, sem copiar riscos como oportunidades). |
| **Saída parcial** | `oportunidades[]` |
| **Pré-condições** | Estágio 4 concluído (pode correr em paralelo com 5a). |
| **Pós-condições** | Lista válida REQ-048; pode ser vazia. |
| **Proibição** | Não fundir com `riscos`. |

---

### Estágio 6 — Decisão Executiva

| | |
|--|--|
| **Responsabilidade** | Emitir o ato de governo: `estado` fechado, recomendação, alternativas, justificativa. |
| **Modo** | `LLM` sob enum fechado + verificação `DET` do enum. |
| **Entrada** | Análise, riscos, oportunidades, princípios, lacunas acumuladas. |
| **Saída parcial** | `decisaoExecutiva` |
| **Pré-condições** | 5a e 5b concluídos. |
| **Pós-condições** | `estado` ∈ enum REQ-048; `recomendacao` e `justificativa` não vazias; `alternativas` é lista. |
| **Regra de lacunas** | Se `lacunas` materiais impedem decidir com segurança → preferir `solicitar_dados` (salvo urgência crítica documentada na justificativa). |

---

### Estágio 7 — Ação Operacional

| | |
|--|--|
| **Responsabilidade** | Traduzir a decisão em gesto operacional (`tipo`, `descricao`, `job`). |
| **Modo** | `DET` preferencial (tabela de mapeamento estado→tipo) + `LLM` só para redigir `descricao`/`job` dentro do tipo já fixado. |
| **Entrada** | `decisaoExecutiva` + lacunas. |
| **Saída parcial** | `acao` |
| **Pré-condições** | Estágio 6 concluído. |
| **Pós-condições** | Cumprir regras V3 da REQ-048 (consistência decisão↔ação). |
| **Mapeamento normativo mínimo** | Ver secção *Regras de transição* abaixo. |

---

### Estágio 8 — Aprendizado

| | |
|--|--|
| **Responsabilidade** | Decidir se regista memória, cria precedente e/ou **propõe** atualização de princípios. |
| **Modo** | `HIB` |
| **Entrada** | Parecer parcial completo até ação; natureza; se houve despacho ou lacunas. |
| **Saída parcial** | `aprendizado` |
| **Pré-condições** | Estágio 7 concluído. |
| **Pós-condições** | Três booleanos presentes; se `atualizarPrincipios = true` → `propostaPrincipio` não vazia. |
| **Proibição** | Não aplicar princípios automaticamente. |

---

## Montagem e validação do ParecerExecutivo

### Produção

Após o estágio 8, o MRE **monta** um único objeto `ParecerExecutivo` incluindo:

* campos de raiz (`id`, `criadoEm`, `versaoContrato`, `coaId`, `confianca`, `lacunas`);
* todos os blocos parciais dos estágios 0–8.

`confianca` é calculada de forma normativa mínima: deve refletir incerteza (ex.: reduzir quando `lacunas` ≠ ∅ ou `tipoPedido = ambiguo`). A fórmula exata é de implementação posterior, desde que ∈ [0, 1].

### Validação

1. Aplicar **todas** as regras V1–V6 da REQ-048.  
2. Se **válido** → emitir parecer ao Speaker (e, se `acao.tipo = despachar`, disponibilizar `acao.job` aos mecanismos de fila na IMP futura).  
3. Se **inválido** → ver *Tratamento de falhas*.

O MRE só se considera **concluído com sucesso** quando existe parecer **válido**.

---

## Regras de transição

### T1 — Ordem

* A transição `n → n+1` só ocorre se as pós-condições de `n` estiverem satisfeitas (exceto 5a∥5b, que exigem ambos antes de 6).

### T2 — Sem salto para Speaker

* É **proibido** transitar de qualquer estágio 0–8 diretamente para comunicação ao utilizador.

### T3 — Mapeamento Decisão → Ação (mínimo)

| `decisaoExecutiva.estado` | `acao.tipo` permitido | `acao.job` |
|---------------------------|------------------------|------------|
| `solicitar_dados` | `perguntar` | `null` |
| `delegar` | `despachar` | objeto obrigatório |
| `monitorar` | `aguardar` | `null` |
| `adiar` | `aguardar` | `null` |
| `rejeitar` | `orientar` \| `registar` \| `aguardar` | `null` |
| `aprovar` | `orientar` \| `registar` \| `despachar` | obrigatório se `despachar` |

### T4 — Short-circuit controlado

* Único short-circuit permitido **dentro** do MRE: se após estágio 2 (ou 1) ficar evidente que faltam dados essenciais e a natureza não é crítica com prazo imediato, o pipeline **pode** avançar rapidamente para estágio 6 com `estado = solicitar_dados`, desde que os estágios 3–5 produzam saídas mínimas válidas (listas vazias / análise curta declarando bloqueio por lacuna).  
* Short-circuit **não** dispensa montagem nem validação do parecer completo.

### T5 — Paralelismo 5a / 5b

* 5a e 5b iniciam somente após pós-condição do 4.  
* 6 inicia somente após pós-condições de 5a **e** 5b.

---

## Tratamento de falhas e lacunas

### Lacunas (`lacunas[]`)

* Acumuladas ao longo do pipeline.  
* Não invalidam o parecer por si; influenciam decisão (`solicitar_dados`) e `confianca`.  
* Se `estado = solicitar_dados`, `lacunas` deve ter ≥ 1 item (REQ-048 V3).

### Falha de estágio LLM

* Se um estágio `LLM`/`HIB` falhar (timeout, JSON inválido, enum ilegal):  
  1. **Uma** retentativa com o mesmo contrato de saída;  
  2. Se persistir → parecer de **falha deliberativa controlada**: `decisaoExecutiva.estado = adiar` ou `solicitar_dados`, `analise` declara a falha técnica do raciocínio, `acao.tipo = aguardar` ou `perguntar`, sem inventar factos.  
* É **proibido** cair para “resposta assistente” livre.

### Falha de validação REQ-048

* Regenerar apenas os blocos inconsistentes (preferência) ou o parecer completo **uma** vez.  
* Se ainda inválido → falha deliberativa controlada (acima) **ou** erro operacional exposto pelo Speaker como indisponibilidade temporária do raciocínio — nunca deliberação falsa.

### Falha do Núcleo / rota incorreta

* Se o MRE for invocado sem roteamento deliberativo → rejeitar execução do pipeline (não produzir parecer).

### Falha do Speaker

* Fora do MRE: o parecer válido permanece; a UI pode mostrar fallback textual derivado do parecer sem novo raciocínio.

---

## Pontos determinísticos vs LLM

| Estágio | Modo | Notas |
|---------|------|--------|
| 0 Diagnóstico | LLM (+ saneamento DET) | Enum `natureza` validado DET |
| 1 Enquadramento | HIB | Intenção do Núcleo é sinal DET |
| 2 Memória | **DET** | Só fontes oficiais |
| 3 Princípios | HIB | Catálogo DET; seleção LLM restrita |
| 4 Análise | LLM | |
| 5a Riscos | HIB | |
| 5b Oportunidades | LLM | |
| 6 Decisão | LLM + validação DET do enum | |
| 7 Ação | **DET** no tipo; LLM na redação | Tabela T3 |
| 8 Aprendizado | HIB | |
| Validação parecer | **DET** | REQ-048 V1–V6 |
| Speaker | LLM (ou template DET) | **Fora** do MRE; só consome parecer |

---

## Integração com o Núcleo Executivo

| Responsabilidade do Núcleo | Nesta REQ |
|----------------------------|-----------|
| Admitir evento / mensagem | Pré-condição do pipeline |
| Classificar intenção | Entrada de metadado aos estágios 0–1 |
| Rotear | Só invoca MRE se a rota for **deliberativa** |
| Fluxos determinísticos | `abrir_dia`, `registrar_*`, consultas estruturadas, etc. **não** passam pelo MRE |
| Pós-MRE | Não altera o parecer; pode executar efeitos laterais futuros (registos) com base em `aprendizado` / `acao` sob REQs próprios |

O Núcleo **não delibera** e **não** preenche `ParecerExecutivo`.

---

## Integração com o Speaker

| Regra | Descrição |
|-------|-----------|
| Entrada exclusiva | Um `ParecerExecutivo` **válido** |
| Proibição | Deliberar, alterar `decisaoExecutiva`, inventar factos fora de `dossier`/`analise` |
| Saída | Mensagem (e eventualmente guião de voz) **derivada** do parecer |
| Lacunas | Se `solicitar_dados`, a mensagem deve perguntar apenas o necessário |
| Voice/UI | Recebem a saída do Speaker; não chamam o MRE diretamente |

---

## Critérios de aceitação

* A sequência 0→1→2→3→4→5a∥5b→6→7→8→validação está especificada sem ambiguidade de ordem.
* Cada estágio tem responsabilidade, entrada, saída, pré e pós-condições.
* Regras T1–T5 e mapeamento decisão→ação estão testáveis.
* Falhas LLM/validação não autorizam resposta deliberativa sem parecer válido.
* Pontos DET / LLM / HIB estão identificados por estágio.
* Integração Núcleo (roteamento) e Speaker (consumo) está explícita.
* Conformidade obrigatória com REQ-048.
* Nenhum critério exige código, classes ou ficheiros.

## Dependências

| Dependência | Papel |
|-------------|--------|
| **ADR-019** | Institui o MRE |
| **REQ-048** | Contrato do `ParecerExecutivo` (aprovada) |
| **ADR-015** | Priorização operacional |
| Núcleo Executivo v0 | Admissão e roteamento |
| **REQ-045** | Consumo futuro de `acao.job` |
| **REQ-047** | Apresentação por voz a jusante do Speaker |

## Riscos e incertezas

* Latência de múltiplos passos LLM — aceitável na Fase 2; pode otimizar-se depois sem mudar esta REQ.
* Short-circuit T4 pode ser abusado — mitigar com pós-condições mínimas obrigatórias.
* Fronteira Núcleo vs MRE em intenções “quase estruturadas” — resolver em REQ/IMP de roteamento.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-019; ADR-015; ADR-006 |
| Origem | Gate Fase 2 — modelagem pós REQ-048 aprovada (30/07/2026) |
| Dependência direta | REQ-048 |
| Implementação | *Proibida até aprovação desta REQ + IMP* |
| Testes | *A criar (pareceres de cenário / falhas)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Especificação do pipeline MRE | REQ-048 aprovada | **Aprovado** |

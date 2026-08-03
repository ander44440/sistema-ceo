# REQ-050 — Speaker Executivo

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá transformar todo `ParecerExecutivo` válido num comunicado em linguagem natural através do componente **Speaker Executivo**, de modo que Conversa, Voice e demais interfaces apresentem fielmente a deliberação do MRE, sem o Speaker deliberar, consultar memória ou alterar o parecer.

## Tipo

Funcional; detalhado (componente de comunicação / exposição).

## Objetivo

Fixar o contrato operacional do Speaker: responsabilidades, entradas/saídas, regras de geração, adaptação por canal e limites absolutos face ao MRE e ao Núcleo — garantindo que a voz do CEO comunica a decisão já tomada, não a inventa.

## Escopo

### Inclui

* Responsabilidades e proibições do Speaker.
* Entradas e saídas lógicas.
* Contrato de consumo do `ParecerExecutivo` (REQ-048).
* Regras para geração da resposta.
* Tratamento de lacunas e estados de decisão.
* Adaptação por canal (chat, voz, centro de situação).
* Critérios de aceitação, dependências e impacto arquitetural.

### Fora do escopo

* Implementação em código, classes ou ficheiros.
* Pipeline do MRE (REQ-049) e schema do parecer (REQ-048).
* Persistência, memória executiva ou consulta ao Painel.
* Despacho na Fila (REQ-045) — o Speaker pode **mencionar** a ação; não executa jobs.
* Motor de voz (REQ-047) — apenas como consumidor a jusante do texto/guião do Speaker.
* Branding, tom de marca detalhado ou design system (F2–F5 de produto) — apenas regras mínimas de fidelidade deliberativa.

## Justificativa

ADR-019 separa deliberação (MRE) de comunicação (Speaker). Sem esta REQ, o Speaker tende a reabrir o raciocínio, “melhorar” a decisão ou inventar factos — regressão ao assistente conversacional. CON-001 (transparência, rastreabilidade); ADR-015 (comunicação clara no uso diário).

---

## Responsabilidades do Speaker

O Speaker **é** responsável por:

1. Receber um `ParecerExecutivo` **já validado** (REQ-048).
2. Produzir um **ComunicadoExecutivo** em linguagem natural adequado ao canal solicitado.
3. Expor, com fidelidade, a decisão, a recomendação, a ação e as lacunas relevantes.
4. Adaptar forma, extensão e ritmo ao canal (chat / voz / centro de situação), **sem** alterar o significado deliberativo.
5. Em falha de geração, emitir fallback fiel (template mínimo) ou sinalizar indisponibilidade — **nunca** uma nova deliberação.

O Speaker **não** é responsável por:

* Deliberar ou escolher `decisaoExecutiva.estado`.
* Consultar memória, Painel, COA, fila ou histórico além do que já está no parecer.
* Alterar, completar ou “corrigir” campos do `ParecerExecutivo`.
* Invocar o MRE, o Núcleo ou ferramentas externas.
* Validar o schema do parecer (isso é pré-condição: só recebe parecer válido).
* Executar `acao.job` ou efeitos laterais de aprendizado.

---

## Entradas e saídas

### Entrada

| Campo lógico | Obr. | Descrição |
|--------------|------|-----------|
| `parecer` | Obrig. | `ParecerExecutivo` válido conforme REQ-048 |
| `canal` | Obrig. | Enum: `chat` \| `voz` \| `centro_situacao` |
| `preferenciasApresentacao` | Opc. | Metadados não deliberativos (ex.: idioma já da sessão, brevidade). **Não** podem contradizer o parecer. |

**Pré-condição:** `parecer` passou validação V1–V6 da REQ-048. Se a pré-condição falhar, o Speaker **recusa** a geração (não “adinha”).

### Saída — ComunicadoExecutivo

Objeto lógico (não serialização física):

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `parecerId` | string | Obrig. | Cópia do `parecer.id` (rastreio) |
| `canal` | enum | Obrig. | Canal para o qual foi gerado |
| `texto` | string | Obrig. | Mensagem principal em linguagem natural |
| `perguntas` | lista de string | Obrig. | Perguntas a fazer (pode ser vazia); obrigatória não vazia se `estado = solicitar_dados` |
| `destaques` | lista de string | Opc. | Frases curtas para UI (centro de situação / cartões) |
| `guiãoVoz` | string \| null | Obrig. | Texto otimizado para TTS quando `canal = voz`; `null` nos outros canais (ou igual a `texto` se o canal voz não separar) |
| `referenciaDecisao` | string | Obrig. | Eco do `decisaoExecutiva.estado` (auditoria; não é nova decisão) |
| `metadados` | objeto | Opc. | Latência, modelo de redação, etc. — não deliberativos |

**Pós-condição:** `referenciaDecisao` = `parecer.decisaoExecutiva.estado`; `texto` (e `guiãoVoz` se aplicável) não vazios; fidelidade às regras abaixo.

---

## Contrato de consumo do ParecerExecutivo

O Speaker trata o parecer como **fonte exclusiva e imutável** da verdade deliberativa.

### Campos de leitura obrigatória (sempre considerados)

* `decisaoExecutiva` (`estado`, `recomendacao`, `justificativa`, `alternativas`)
* `acao` (`tipo`, `descricao`; e menção a despacho se `job` existir)
* `lacunas`
* `diagnostico.objetivoReal` (âncora do “sobre o quê”)
* `confianca` (pode modular tom de certeza; **não** altera a decisão)

### Campos de leitura condicional

| Situação | Campos |
|----------|--------|
| Explicar o porquê | `analise`, `principiosAplicados` |
| Alertar | `riscos` (priorizar severidade alta, se tipada) |
| Motivação / alavanca | `oportunidades` |
| Contexto factual | `dossier.resumoPainel` / `factosUsados` — **apenas citar**, nunca expandir com factos externos |
| Aprendizado visível ao utilizador | Só se o canal e a política de exposição o pedirem; por omissão, o Speaker **não** anuncia propostas de princípios |

### Proibições de consumo

* Não inferir decisão diferente da do parecer.
* Não omitir `estado` de forma que o utilizador entenda outra deliberação.
* Não inventar números, prazos, estados de projeto ou mitigações ausentes do parecer.
* Não “completar” `lacunas` com hipóteses apresentadas como facto.

---

## Regras para geração da resposta

### G1 — Fidelidade deliberativa

A mensagem deve deixar inequívoco o ato de governo (`aprovar` | `rejeitar` | `delegar` | `monitorar` | `solicitar_dados` | `adiar`) em linguagem natural, alinhado a `referenciaDecisao`.

### G2 — Ordem mínima do conteúdo (chat e voz)

1. Âncora: sobre o que se decide (`objetivoReal` / recomendação).  
2. Decisão (estado).  
3. Justificativa breve.  
4. Ação / próximo gesto (`acao.descricao`).  
5. Lacunas ou perguntas, se existirem.  
6. Riscos materiais só se relevantes ao gesto imediato (evitar monólogo).

O centro de situação pode condensar 1–4 em destaques; ver adaptação por canal.

### G3 — Proibição de criar novas decisões

* É **proibido** sugerir um estado diferente do parecer.
* É **proibido** acrescentar alternativas de decisão que não estejam em `decisaoExecutiva.alternativas` como se fossem a escolha do CEO.
* É **proibido** “revisar” a deliberação (“na verdade deveríamos…”).

### G4 — Tom e certeza

* `confianca` baixa ou `lacunas` não vazias → linguagem mais cautelosa; **sem** mudar o `estado`.
* Não usar certezas absolutas quando o parecer declara lacunas materiais.

### G5 — Ação e fila

* Se `acao.tipo = despachar` e existe `job`, o Speaker pode informar que a execução foi (ou será) encaminhada — **sem** inventar status de job além do parecer.
* Se `acao.tipo = perguntar`, as perguntas do comunicado devem cobrir as `lacunas` essenciais (sem interrogatório excessivo).

### G6 — Modo de geração

* Redação pode ser `LLM` ou template `DET`, desde que as regras G1–G5 e o contrato de consumo sejam cumpridos.
* Qualquer LLM do Speaker recebe **apenas** o parecer (e metadados de canal/preferências) — **não** memória viva nem histórico como fonte de factos novos.

### G7 — Imutabilidade

* O parecer de entrada não é modificado.
* A saída é um comunicado derivado; a auditoria preserva o parecer original a montante.

---

## Tratamento de lacunas

| Condição | Comportamento do Speaker |
|----------|---------------------------|
| `lacunas` não vazia | Mencionar o que falta, de forma concreta e breve |
| `estado = solicitar_dados` | `perguntas` ≥ 1; `texto` deve pedir os dados em falta; não inventar respostas |
| `estado` ≠ `solicitar_dados` mas há lacunas | Informar residualmente (“ainda falta X”) sem transformar a mensagem numa nova deliberação |
| Lacuna vs facto do dossier | Em conflito aparente, prevalece o parecer tal como está; o Speaker não “corrige” o MRE |

---

## Adaptação por canal

### `chat` (Conversa)

* Prosa clara, parágrafos curtos.
* Pode incluir bullets leves para riscos/perguntas.
* Extensão: preferir completo-mínimo (G2); evitar ensaio.

### `voz` (Voice Engine a jusante)

* Produzir `guiãoVoz` (e/ou `texto`) adequado a TTS: frases curtas, sem tabelas, sem markdown denso, sem longas listas.
* Uma decisão, uma ação, no máximo poucas perguntas.
* Não soletrar IDs técnicos salvo pedido explícito em preferências.

### `centro_situacao` (Painel / UI executiva)

* Priorizar `destaques[]`: decisão, ação, lacuna crítica (se houver).
* `texto` pode ser resumo de uma a três frases para detalhe expandido.
* Não substituir indicadores factuais do Painel — o Speaker **não** redesenha o Painel; só comunica o parecer da deliberação corrente.

### Regra comum aos canais

Mudar o canal **não** muda a decisão. Apenas forma, densidade e suporte (`destaques` / `guiãoVoz`).

---

## Critérios de aceitação

* Responsabilidades e proibições do Speaker estão explícitas e testáveis.
* Entrada exige parecer válido; saída define `ComunicadoExecutivo` lógico.
* Contrato de consumo lista campos obrigatórios/condicionais e proíbe factos externos.
* Regras G1–G7 impedem nova deliberação e alteração do parecer.
* Lacunas e `solicitar_dados` têm comportamento observável (`perguntas` não vazias).
* Adaptação `chat` / `voz` / `centro_situacao` está especificada sem alterar o significado.
* Dependências e impacto arquitetural estão documentados.
* Nenhum critério exige código, classes ou ficheiros.

## Dependências

| Dependência | Papel |
|-------------|--------|
| **ADR-019** | Separa MRE e Speaker |
| **REQ-048** | Contrato do `ParecerExecutivo` (aprovada) |
| **REQ-049** | Pipeline que produz o parecer (aprovada) |
| **REQ-047** | Consumo de `guiãoVoz` / texto por Voice |
| UI Conversa / Centro de situação | Consumidores de `texto` / `destaques` |
| Núcleo Executivo | Orquestra MRE → Speaker; não delibera no Speaker |

## Riscos e incertezas

* LLM do Speaker pode “embelezar” e distorcer — mitigar com G1–G3 e testes de fidelidade deliberativa.
* Sobreposição com tom de produto (branding) — resolver em REQs de experiência sem enfraquecer fidelidade.
* Multi-canal na mesma deliberação: gerar por canal ou derivar de um mestre — escolha de IMP, desde que o significado coincida.

## Impacto arquitetural

```text
Núcleo Executivo
      ↓
MRE → ParecerExecutivo (REQ-048/049)
      ↓
Speaker Executivo (esta REQ)
      ↓
ComunicadoExecutivo
      ↓
┌─────────┬──────────┬──────────────────┐
│  Chat   │   Voz    │ Centro situação  │
└─────────┴──────────┴──────────────────┘
```

| Componente | Impacto |
|------------|---------|
| **MRE** | Continua a não produzir prosa de utilizador |
| **Núcleo** | Após parecer válido, invoca Speaker com `canal`; não misturar deliberação e redação |
| **Conversa** | Passa a consumir `ComunicadoExecutivo`, não resposta livre do LLM deliberativo |
| **Voice** | Consome `guiãoVoz` ou `texto`; não chama MRE |
| **Centro de situação** | Pode exibir `destaques` ligados ao `parecerId` |
| **Fila (REQ-045)** | Independente do Speaker; despacho não depende da redação |
| **Memória / Painel** | Fora do Speaker; já materializados no parecer pelo MRE |

**Invariantes arquiteturais**

1. Speaker não delibera.  
2. Speaker não consulta memória.  
3. Speaker não altera o `ParecerExecutivo`.  
4. Única responsabilidade: comunicar fielmente a decisão do MRE.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-019; ADR-015; ADR-006 |
| Origem | Gate Fase 2 — modelagem pós REQ-049 aprovada (30/07/2026) |
| Dependências diretas | REQ-048; REQ-049 |
| Implementação | *Proibida até aprovação desta REQ + IMP* |
| Testes | *A criar (fidelidade deliberativa por canal / lacunas)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Especificação do Speaker Executivo | REQ-049 aprovada | **Aprovado** |

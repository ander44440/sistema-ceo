# Estudo Arquitetural — Núcleo Executivo do CEO

> **Status: Homologado v0 — Gate CTO (28/07/2026).**  
> Natureza: **estudo arquitetural curto** — referência conceitual; **não** é REQ, ADR, ARQ formal nem IMP.  
> **Tese aprovada:** o Núcleo Executivo é o modelo conceitual responsável pela administração **determinística** da evolução de qualquer projeto.  
> **Restrições vigentes:** sem LLM como decisão; sem APIs externas para decisão; **não altera** por si a arquitetura/código existente; **não autoriza** implementação adicional neste ato.  
> Base empírica: Ondas Operacionais 01–03 homologadas (`app/`).  
> Recomendação futura (não implementar agora): §11 — Diagnóstico Executivo.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Modelo universal pelo qual o CEO **administra a evolução de qualquer projeto**, centrado em *Eventos Executivos* e estado determinístico. |
| **Por que existe?** | As Ondas 01–03 entregaram gabinete, estado e fluxo do dia; o Núcleo **unifica** “como o projeto evolui” independente do domínio. |
| **Para quem?** | CTO (referência homologada); Patrocinador (clareza do que o CEO governa); Engenheiro (fronteira futura sem improvisar). |
| **Sucesso?** | Homologado como referência conceitual; pergunta central respondida operacionalmente, sem código novo neste gate. |

---

## 1. Pergunta central

> **Como o CEO administra a evolução de qualquer projeto?**

**Resposta homologada (tese):**

O CEO administra a evolução de um projeto como uma **máquina de estado executivo**:

1. Tudo o que importa entra como **Evento Executivo**.  
2. Cada evento passa por um **ciclo de processamento** determinístico.  
3. O processamento **atualiza o Estado Executivo do Projeto** (objetivos, decisões, ações, riscos, bloqueios, dia).  
4. A partir do estado, o CEO deriva o **Próximo Passo Executivo** por regras — nunca por LLM.  
5. O **Dia de Trabalho** é a *lente temporal* sobre esse estado; o **Projeto (COA)** é o *recipiente* permanente.

Domínio (software, jurídico, negócio, pessoal…) muda apenas o **vocabulário dos conteúdos**, não a máquina.

```text
  [Humano ou superfície]
           │
           ▼
    Evento Executivo
           │
           ▼
  Ciclo de Processamento  ──►  Estado do Projeto
           │                         │
           │                         ▼
           │              (futuro: Diagnóstico — §11)
           │                         │
           └──────────────►  Próximo Passo Executivo
```

---

## 2. Conceito — Evento Executivo

### 2.1 Definição

Um **Evento Executivo** é um fato **atômico, datado e tipado** que declara uma mudança de intenção ou de realidade operacional no contexto de um projeto.

Não é log técnico genérico.  
Não é mensagem de chat.  
Não é inferência de modelo.

É o **átomo de governança** da evolução do projeto.

### 2.2 Propriedades mínimas (conceituais)

| Campo | Significado |
|-------|-------------|
| `id` | Identidade do evento |
| `projetoId` | COA / projeto ao qual pertence |
| `tipo` | Classe do evento (ver taxonomia) |
| `ocorridoEm` | Instantâneo |
| `origem` | Superfície (Centro, Projetos, Engine, continuidade…) |
| `payload` | Conteúdo tipado (texto, referências, campos do tipo) |
| `efeito` | Declaração do que o ciclo deve aplicar ao estado |

### 2.3 Taxonomia mínima (universal)

| Tipo | O que representa | Exemplos de domínio (ilustrativos) |
|------|------------------|-------------------------------------|
| `objetivo_definido` / `objetivo_atualizado` | Direção do esforço | “Fechar MVP”; “Assinar contrato”; “Reduzir churn” |
| `decisao_registrada` | Escolha vinculante | “Usar Postgres”; “Aceitar cláusula X” |
| `acao_criada` / `acao_concluida` / `acao_cancelada` | Trabalho concreto | “Revisar PR”; “Enviar proposta” |
| `pendencia_aberta` / `pendencia_resolvida` | Débito operacional | “Falta parecer”; “Aguardar peça” |
| `risco_sinalizado` / `risco_mitigado` | Ameaça à condução | “Dependência externa”; “Prazo legal” |
| `bloqueio_declarado` / `bloqueio_removido` | Impedimento ativo | “Sem acesso”; “Aguardando terceiro” |
| `dia_aberto` / `dia_encerrado` | Ciclo temporal do trabalho | Intenção do dia; continuidade |
| `continuidade_registrada` | Ponte entre dias | oQueAndou / oQueFica / próximoAmanhã |
| `estado_consultado` | Leitura sem mutação (evento de observação) | “Qual é o estado atual?” |
| `contexto_ativado` | Troca de COA ativo | “Abrir projeto MG2” |

Novos tipos **só** nascem por deliberação — não por feature ad hoc.

### 2.4 O que não é Evento Executivo

* Prompt livre sem classificação.  
* Resposta de LLM.  
* Telemetria de UI.  
* Documento bruto de conhecimento (pode *originar* um evento depois de ato humano).

---

## 3. Ciclo de processamento de um evento

Ciclo **determinístico**, local, sem API externa e sem LLM.

```text
  1. ADMITIR
       │  evento bem-formado? projeto existe? tipo conhecido?
       ▼
  2. VALIDAR
       │  regras do tipo (ex.: encerrar dia exige continuidade)
       ▼
  3. APLICAR
       │  mutações no Estado do Projeto (funções de domínio)
       ▼
  4. DERIVAR
       │  recalcular vistas: estado executivo, resumo, próximo passo
       ▼
  5. REGISTRAR
       │  histórico / linha do tempo / memória de sessão
       ▼
  6. EXPOR
            resposta à superfície (Centro, chat stub, Projetos)
```

| Etapa | Papel | Não faz |
|-------|-------|---------|
| Admitir | Gate de forma e contexto | Inventar conteúdo |
| Validar | Gate de regra de negócio | Negociar com IA |
| Aplicar | Única escrita de estado | Duplicar lógica em UI |
| Derivar | Funções puras / regras | “Opinar” |
| Registrar | Rastreabilidade | Substituir o estado |
| Expor | Traduzir para a superfície | Mutar de novo |

**Regra:** UI e Engine **emitem** eventos (ou intenções que se traduzem em eventos); o Núcleo **processa**; o catálogo **persiste**.

---

## 4. Como um evento altera o estado do projeto

### 4.1 Estado Executivo do Projeto (modelo conceitual)

O projeto (COA) é o agregado. O estado executivo é a **projeção consolidada** usada para conduzir:

| Dimensão | Conteúdo | Já materializado (Ondas 01–03)? |
|----------|----------|--------------------------------|
| Identidade | id, nome, ativo | ✅ Onda 01 |
| Objetivos / direção | intenção do dia; próximo passo sugerido | ✅ parcial (dia + `proximoPasso`) |
| Decisões | lista de decisões | ✅ Onda 01/02 |
| Ações | próximas ações | ✅ Onda 01/02 |
| Pendências | débitos abertos | ✅ Onda 01/02 |
| Riscos | — | ❌ ainda não tipado |
| Bloqueios | — | ❌ ainda não tipado (pode estar embutido em pendência “crítica”) |
| Dia | `diaExecutivo` | ✅ Onda 03 |
| Continuidade | histórico de encerramentos | ✅ Onda 03 |
| Vistas | métricas, classificação Estável…Crítico, linha do tempo, resumo | ✅ Onda 02/03 |

### 4.2 Função de transição (conceitual)

```text
Estado' = Aplicar(Estado, Evento)
```

Exemplos:

| Evento | Efeito sobre o estado |
|--------|------------------------|
| `decisao_registrada` | Acrescenta decisão; pode afetar classificação |
| `acao_criada` | Entra na fila de próximas ações |
| `pendencia_aberta` | Incrementa débitos; pode elevar “Atenção/Crítico” |
| `dia_aberto` | `status=em_curso`; grava intenção; limpa `encerradoEm` |
| `dia_encerrado` + continuidade | `status=encerrado`; prepend continuidade; sugere próximo passo |
| `bloqueio_declarado` *(futuro)* | Marca impedimento ativo; próximo passo prioriza desbloqueio |
| `estado_consultado` | **Não** muta; só deriva exposição |

**Invariante:** nenhuma superfície escreve estado “por baixo” do ciclo. Hoje isso já é *quase* verdade (catálogo como API); o Núcleo **nomeia** essa regra.

---

## 5. Objetivos, decisões, ações, riscos e bloqueios

### 5.1 Papéis distintos (universal)

| Artefato | Natureza | Atualização típica por evento |
|----------|----------|-------------------------------|
| **Objetivo** | Direção (“para onde”) | definido / atualizado / cumprido |
| **Decisão** | Compromisso (“o que ficou escolhido”) | registrada (imutável no essencial; correção = novo evento) |
| **Ação** | Trabalho (“o que fazer”) | criada / concluída / cancelada |
| **Pendência** | Débito (“o que falta”) | aberta / resolvida |
| **Risco** | Ameaça (“o que pode prejudicar”) | sinalizado / mitigado / encerrado |
| **Bloqueio** | Impedimento (“o que impede agora”) | declarado / removido |

### 5.2 Relações

```text
Objetivo
   └── orienta ──► Ações e Pendências
Decisão
   └── constrange ──► Ações futuras
Risco
   └── pode gerar ──► Pendência ou Bloqueio
Bloqueio
   └── suspende / prioriza ──► Próximo Passo
Dia
   └── recorta ──► o que cabe “hoje” sob o mesmo estado
```

### 5.3 Estado atual vs. modelo completo

| Artefato | Hoje no `app/` | Proposta do Núcleo |
|----------|----------------|--------------------|
| Decisão / Ação / Pendência | Implementados | Mantidos; passam a ser *efeitos* de eventos tipados |
| Objetivo | Implícito (intenção do dia + próximo passo) | Explicitar como dimensão do estado (sem obrigar UI nova neste estudo) |
| Risco / Bloqueio | Não tipados | Dimensões **canónicas** do modelo; materialização só após homologação + onda futura |
| Classificação Estável…Crítico | Heurística sobre pendências/ações | Continua como **derivação**; no futuro pode consumir riscos/bloqueios |

---

## 6. Como o CEO determina o Próximo Passo Executivo

### 6.1 Definição

O **Próximo Passo Executivo** é a **única recomendação operacional vigente** para o projeto ativo: a próxima ação de condução que o patrocinador deve considerar.

Não é brainstorm.  
Não é lista infinita.  
Não é output de LLM.

### 6.2 Algoritmo proposto (determinístico — prioridade descendente)

Dado o Estado do Projeto ativo:

1. Se existe **bloqueio ativo** → próximo passo = *remover ou contornar o bloqueio* (texto do bloqueio ou ação ligada).  
2. Senão, se o **dia está encerrado / não iniciado** e há continuidade com `proximoPassoAmanha` → esse é o candidato de retomada (até abrir o dia).  
3. Senão, se o **dia está em curso** e há `intencaoDoDia` sem ação alinhada → sugerir ação que realize a intenção **ou** a primeira `proximaAcao` da fila.  
4. Senão, se há **próximas ações** abertas → a primeira da fila.  
5. Senão, se há **pendências** abertas → a mais antiga (ou a marcada crítica, quando existir).  
6. Senão, se há **risco** sem mitigação → sinalizar mitigação.  
7. Senão → “Definir o próximo objetivo ou registrar uma próxima ação.”

### 6.3 Relação com o que já existe

| Mecanismo atual | Papel no Núcleo |
|-----------------|-----------------|
| `proximoPasso` / `proximoPassoSugerido` no workspace | Campo de exposição do resultado da derivação |
| `gerarResumoDoDia` / painel Onda 02 | Já escolhem “próximo” por heurística simples — **embrião** deste algoritmo |
| Continuidade Onda 03 | Alimenta a regra 2 |
| Engine `consultar_estado` | Expõe o resultado; **não** decide por conta própria |

LLM, se existir no futuro, **só** pode redigir ou explicar o passo já determinado — nunca escolhê-lo (restrição desta deliberação reforçada).

---

## 7. Reuso das Ondas 01–03 (sem alterar arquitetura existente)

O Núcleo Executivo, nesta proposta, é uma **camada conceitual de unificação**. Não exige redesenho do Shell, nem novas rotas, nem troca do store.

| Onda | Capacidade já existente | Papel no Núcleo |
|------|-------------------------|-----------------|
| **01** | Catálogo de projetos, COA ativo, persistência `ceo.onda01.gabinete.v1`, decisões / pendências / ações / histórico | **Agregado Projeto** + persistência do estado |
| **02** | Painel executivo, métricas, classificação de estado, linha do tempo, resumo | **Derivações** (etapa DERIVAR) e exposição |
| **03** | `diaExecutivo`, abrir/encerrar, continuidade, D01–D07, intenções Engine | **Lente Dia** + eventos `dia_*` / `continuidade_*` + orquestração por intenção |

| Componente atual | Mapeamento |
|------------------|------------|
| `catalogoProjetos` APIs | Funções **Aplicar** (já são a fonte de verdade) |
| `estadoExecutivo.js` | Funções **Derivar** |
| `executiveEngine` + `classificar` | **Admissão** de intenções → tipos de evento (orquestração) |
| Centro / Projetos / chips | Superfícies que **emitem** eventos |
| `diaExecutivo` | Subestado temporal do agregado |

```text
  Superfícies (Centro, Projetos, Engine)
        │  emitem / traduzem
        ▼
  Núcleo Executivo (modelo deste estudo)
        │  ciclo Admitir→…→Expor
        ▼
  Catálogo + Dia + Derivações  (Ondas 01–03 — inalterados em estrutura)
```

**O que este estudo não faz:** mover código, criar módulo novo, invalidar D01–D07, ou exigir risco/bloqueio na UI agora.

---

## 8. Fronteiras explícitas

| Dentro do Núcleo (conceitual) | Fora |
|-------------------------------|------|
| Evento, ciclo, estado, próximo passo | Escolha de stack, LLM, APIs |
| Taxonomia universal de evolução | Especializações de domínio (jurídico, eng.…) como *vocabulário* |
| Regras determinísticas | Agentes autónomos |
| Reuso Ondas 01–03 | Nova onda de implementação |

---

## 9. Efeitos da homologação (não são autorização de build)

Com o Gate deste estudo:

1. O Núcleo Executivo torna-se **referência conceitual** para qualquer onda futura que toque evolução de projeto.  
2. OE1–OE5 e Onda 03.1 / 04 / F7 continuam **sob deliberação separada**.  
3. Materializar riscos/bloqueios, “bus de eventos” explícito ou **Diagnóstico Executivo** (§11) exigiria **autorização futura** — não é automático.  
4. Nenhuma alteração de arquitetura ou código em vigor ocorre só com esta homologação.  
5. Permanecem corretos e vinculantes para o modelo: Evento como entrada; máquina determinística; ciclo de 6 etapas; estado só via `Aplicar`; Próximo Passo; reuso Ondas 01–03; independência de domínio, LLM e APIs externas na decisão.

---

## 10. Gate — homologação

**Decisão do CTO (28/07/2026):** estudo **homologado**; tese **aprovada**.

Itens confirmados:

1. Definição e taxonomia de **Evento Executivo**;  
2. Ciclo Admitir → Validar → Aplicar → Derivar → Registrar → Expor;  
3. Estado do projeto atualizado exclusivamente pela aplicação de eventos;  
4. Distinção objetivo / decisão / ação / pendência / risco / bloqueio (modelo);  
5. Algoritmo determinístico do **Próximo Passo**;  
6. Mapeamento de reuso das Ondas 01–03;  
7. Independência de domínio;  
8. Independência de LLM e APIs externas para decisão.

---

## 11. Recomendação futura — Diagnóstico Executivo (não implementar agora)

> **Status:** recomendação registrada · **não** altera a homologação v0 · **não** autoriza implementação neste momento.

### 11.1 Ideia

Introduzir, em evolução futura, o conceito de **Diagnóstico Executivo**: artefato **derivado** do Estado do Projeto que **interpreta a situação** (leitura estruturada: o que está estável, em tensão, bloqueado, urgente) **antes** da determinação do Próximo Passo Executivo.

### 11.2 Posição no fluxo (conceitual futuro)

```text
Estado do Projeto
       │
       ▼
Diagnóstico Executivo   ←── derivação determinística (sem LLM)
       │
       ▼
Próximo Passo Executivo
```

O Diagnóstico **não** substitui o Estado nem o Evento; **não** decide sozinho o próximo passo — **informa** a regra de prioridade com uma interpretação explícita e auditável.

### 11.3 Relação com o v0 homologado

| v0 (homologado) | Futuro (recomendação) |
|-----------------|------------------------|
| Estado → Próximo Passo (direto) | Estado → Diagnóstico → Próximo Passo |
| Suficiente e aprovado | Refinamento opcional sob nova deliberação |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (Gate / homologação); Engenheiro (Cursor) registrou |
| Quando | 28/07/2026 |
| Por quê | Fixar o Núcleo Executivo como modelo conceitual da evolução de projetos |
| Baseado em quê | Estudo v0; Gate CTO; Ondas 01–03; restrições anti-LLM/API |
| Resultado | Homologado v0; Diagnóstico Executivo anotado como recomendação futura; sem implementação |

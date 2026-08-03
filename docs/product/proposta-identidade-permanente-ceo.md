# Proposta Arquitetural — Identidade Permanente do CEO

> **Status: Homologada — Gate CTO (29/07/2026) · implementada no `app/`.**  
> Emendas do Gate: módulo `governancaLlm.js` (não “conduta”); ordem com Objetivo atual após o enquadramento (último turno user); Histórico antes do objetivo na montagem da API.  
> Natureza: arquitetura de composição do mandato executivo no runtime LLM.  
> Relaciona-se a: Núcleo Executivo v0; `executiveEngine`.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Separação institucional de Constituição, Conduta, Contexto e Briefing, com um compositor único antes da chamada LLM. |
| **Por que existe?** | O CEO já tem API e briefing de projeto, mas a identidade ainda é “tom no prompt”, não contrato de cargo. |
| **Para quem?** | CTO (homologação); Engenheiro (mapa de módulos); Patrocinador (CEO como Diretor Executivo estável). |
| **Sucesso?** | Identidade independente de projeto; briefing nunca define quem o CEO é; `promptGovernanca` só compõe; comportamento executivo estável com novos COAs/agentes. |

---

## 1. Decisão já tomada (premissa)

A identidade do CEO passa a ser **componente da arquitetura**, não um bloco ad hoc dentro de `promptGovernanca.js`.

Fluxo canónico de composição:

```text
Constituição
    ↓
Regras de Conduta
    ↓
Contexto da sessão
    ↓
Briefing do projeto
    ↓
Prompt final → LLM
```

---

## 2. Estado atual (mapa)

| Hoje | Onde | Problema |
|------|------|----------|
| Identidade + tom + governança misturados | `promptGovernanca.construirSystemPrompt()` | Mandato = estilo |
| Contexto de sessão + briefing misturados | `promptGovernanca.construirBlocoContexto()` | Briefing “dentro” do mesmo bloco que estado |
| Briefing MG2 | `briefingsProjeto.js` | Correto como conhecimento; ok manter |
| Consumidor | `capacidades/ia.js` → `montarMensagensLlm` | Ok; deve continuar a chamar só o compositor |
| Identidade local (sem LLM) | `ia.js` `respostaLocal(pergunta_identidade)` | Dissonante se não ler a mesma Constituição |
| UI | `centroSituacao` / `conversa` saudações | Copy; alinhar depois (não bloqueia a arquitetura) |

Engine determinística (`classificar`, capacidades, catálogo, Núcleo) **não** muda. Esta proposta é a camada **semântica do LLM** acima dela.

---

## 3. Princípios de desenho

1. **Uma responsabilidade por módulo** — sem texto de mandato no briefing nem factos de projeto na Constituição.  
2. **Uma composição, um consumidor** — só `montarMensagensLlm` (ou renomeado) monta; `capacidadeIa` não monta à mão.  
3. **Constituição estável** — muda só por deliberação; briefings mudam por projeto.  
4. **CONTEXTO = única fonte de factos dinâmicos** — Constituição/Conduta não afirmam progresso.  
5. **Canais de execução abstratos** — Constituição fala em “execução técnica”; o binding “Cursor” fica na Conduta ou num mapa de canais, não no cargo.  
6. **Alinhamento à Engine** — módulos irmãos de `classificar`, `coaSessao`, `briefingsProjeto`, sob `executiveEngine/`.

---

## 4. Módulos propostos

Todos sob `app/src/executiveEngine/`.

### 4.1 `constituicaoCeo.js` — Constituição (quem é)

| | |
|--|--|
| **Responsabilidade** | Contrato permanente do cargo de Diretor Executivo |
| **Contém** | Mandato; o que o CEO é / não é; responsabilidades permanentes (coordenar, priorizar, preparar decisões, orientar implementação, revisar, continuidade) |
| **Não contém** | MG2, nomes de projetos, estado, tom “1–3 parágrafos”, regras anti-alucinação detalhadas, APIs |
| **API** | `obterConstituicaoCeo(): string` (texto estável) e, opcional, `obterConstituicaoCeoEstruturada()` para UI/identidade local |
| **Estabilidade** | Máxima — alteração = Gate / deliberação |

### 4.2 `condutaLlm.js` — Regras de conduta (como se comporta no LLM)

| | |
|--|--|
| **Responsabilidade** | Normas de comportamento na conversa com modelo |
| **Contém** | Trabalhar só com CONTEXTO; não inventar; perguntas mínimas; conduzir quando houver informação; não fingir execução; como formular delegação à execução técnica; binding atual do canal (ex.: Cursor); forma breve (parágrafos) se ainda fizer sentido aqui |
| **Não contém** | “Você é o Diretor Executivo…” (isso é Constituição); briefing de domínio |
| **API** | `obterRegrasCondutaLlm(): string` |
| **Estabilidade** | Alta — ajustes de engenharia sem reabrir o cargo |

### 4.3 `contextoSessao.js` — Contexto da sessão (factos dinâmicos)

| | |
|--|--|
| **Responsabilidade** | Empacotar o estado oficial da sessão para o LLM |
| **Contém** | COA ativo; projetos na memória; próximo passo; intenção classificada; pendências; decisões; últimas ações; `resumirEstado()` / dia / continuidade (o que hoje está em `construirBlocoContexto` **sem** briefing) |
| **Não contém** | Constituição; conduta; briefing de produto |
| **API** | `construirContextoSessao({ memoria, coa, intencao }): string` |
| **Estabilidade** | O formato é estável; o **conteúdo** muda a cada turno |
| **Origem de dados** | Já existentes: `executiveMemory`, `coaSessao`, catálogo via resumo — **sem** nova persistência |

### 4.4 `briefingsProjeto.js` — Briefing do projeto (já existe)

| | |
|--|--|
| **Responsabilidade** | Conhecimento fixo do COA (domínio) |
| **Contém** | Factos do MG2 (e futuros `prj-*`) |
| **Não contém** | Quem o CEO é; regras gerais de não inventar |
| **API** | `obterBriefingProjeto(coa): string \| null` — **manter** |
| **Ajuste fino** | Garantir que o texto do MG2 não repita mandato (“você é o diretor…”) — só conhecimento de produto |

### 4.5 `promptGovernanca.js` — Compositor (único)

| | |
|--|--|
| **Responsabilidade** | Orquestrar a ordem canónica e emitir `messages[]` |
| **Contém** | Imports + `montarMensagensLlm` (+ talvez `comporSystemMessages`) |
| **Não contém** | Texto da Constituição nem briefing |
| **API pública (proposta)** | `montarMensagensLlm({ instrucao, historico, memoria, coa, intencao })` — **contrato estável** para `ia.js` |

`construirSystemPrompt()` **deixa de definir identidade**; ou desaparece, ou vira fachada depreciada que chama Constituição+Conduta (preferência: remover da API pública após migração).

---

## 5. Como evitar duplicação

| Tema | Onde vive | Proibido noutros |
|------|-----------|------------------|
| Cargo / mandato | Constituição | Briefing, contexto |
| “Não invente / não fingir commit” | Conduta | Constituição (pode ter uma linha de princípio; detalhe na Conduta) |
| COA, dia, decisões, pendências | Contexto sessão | Briefing (salvo facto de domínio estático) |
| O que é o MG2 / payout / corrida | Briefing | Constituição |
| Tom “executivo de confiança” | Constituição (identidade) ou Conduta (forma) — **escolher um**; proposta: **identidade na Constituição**, **forma (parágrafos) na Conduta** |
| “Delegar ao Cursor” | Conduta (canal atual) + Constituição (papel: orientar implementação, não programar) | Briefing |

**Regra de revisão:** se uma frase responde “quem sou?”, vai à Constituição; se responde “como falo com o modelo?”, Conduta; se responde “o que é verdade agora?”, Contexto; se responde “o que é este produto?”, Briefing.

---

## 6. Composição antes da chamada ao LLM

### 6.1 Sequência obrigatória

```text
capacidadeIa.executar
    → montarMensagensLlm(...)          // único compositor
        → system[0] = obterConstituicaoCeo()
        → system[1] = obterRegrasCondutaLlm()
        → system[2] = construirContextoSessao(...)
        → system[3] = obterBriefingProjeto(coa)   // omitir se null
        → user/assistant = histórico (últimos N)
        → user = instrução atual
    → deliberarComLlm({ messages })
```

Quatro mensagens `system` (ou três se não houver briefing) preservam a ordem desejada e evitam um único blob onde o briefing “soterrá” a Constituição. Alternativa aceitável: um único `system` concatenado com cabeçalhos `##` na **mesma ordem** — desde que a ordem seja função única do compositor e testes fixem a sequência. **Recomendação:** 4 `system` separados (mais claro para o modelo e para testes).

### 6.2 Pseudocódigo do compositor

```text
function montarMensagensLlm(params):
  messages = []
  messages.push({ role: "system", content: obterConstituicaoCeo() })
  messages.push({ role: "system", content: obterRegrasCondutaLlm() })
  messages.push({ role: "system", content: construirContextoSessao(params) })
  briefing = obterBriefingProjeto(params.coa)
  if briefing:
    messages.push({ role: "system", content: briefing })
  appendHistorico(messages, params.historico)
  appendInstrucao(messages, params.instrucao)
  return messages
```

### 6.3 Fronteira com a Engine determinística

```text
[Utilizador]
    → executiveEngine.executar
        → classificarIntencao          // inalterado
        → capacidade (ex.: ia)
            → se ia: montarMensagensLlm → LLM
        → atualizarAposInstrucao       // inalterado
```

A Constituição **não** altera classificação nem `abrirDiaExecutivo`. Só a face LLM.

---

## 7. Diagrama de módulos

```text
executiveEngine/
  index.js                 # orquestração (inalterada na essência)
  classificar.js
  capacidades/ia.js        # chama apenas montarMensagensLlm
  llmCliente.js

  constituicaoCeo.js       # NOVO — mandato permanente
  condutaLlm.js            # NOVO — regras de comportamento LLM
  contextoSessao.js        # NOVO (extrair de promptGovernanca)
  briefingsProjeto.js      # EXISTENTE — só conhecimento por COA
  promptGovernanca.js      # COMPOSITOR apenas

  coaSessao.js
  resposta.js
  ...
```

---

## 8. Consumidores secundários (coerência)

| Consumidor | Uso da Constituição |
|------------|---------------------|
| `ia.js` `pergunta_identidade` | Resumo curto derivado da Constituição (não texto paralelo) |
| UI (fase 2, opcional) | Saudação alinhada — **não** bloqueia Gate desta proposta |
| Docs | Espelho homologado em `docs/product/` quando o texto for aprovado |

---

## 9. O que esta proposta não faz

- Não abre Onda 04 / F7 / 03.1.  
- Não altera Núcleo Evento→Estado→Próximo Passo.  
- Não cria despacho automático ao Cursor.  
- Não tipa riscos no catálogo.  
- Não move briefings para o servidor OpenAI fora do compositor.

---

## 10. Critérios de homologação (Gate)

1. Quatro responsabilidades reconhecidas como camadas distintas.  
2. `promptGovernanca.js` = compositor; identidade **não** definida ali.  
3. Constituição independente de MG2 e de qualquer briefing.  
4. Ordem Constituição → Conduta → Contexto → Briefing → histórico/instrução.  
5. Plano anti-duplicação aceite.  
6. Contrato de `montarMensagensLlm` preservado para `ia.js`.

---

## 11. Ordem de implementação sugerida (após Gate — não agora)

1. Extrair textos: criar `constituicaoCeo.js` + `condutaLlm.js` (conteúdo a homologar à parte).  
2. Extrair `contextoSessao.js` a partir do bloco atual (sem briefing).  
3. Reescrever `promptGovernanca.js` como compositor na ordem canónica.  
4. Limpar mandato duplicado do briefing MG2, se houver.  
5. Apontar `pergunta_identidade` para a Constituição.  
6. Teste manual: pergunta de identidade + pergunta MG2 + pedido “escreve o código”.

---

## 12. Pedido ao CTO

Homologar (ou emendar) esta **arquitetura de composição da identidade permanente**.

Em particular confirmar:

- os cinco módulos (4 conteúdos + 1 compositor);  
- a ordem de composição;  
- a regra anti-duplicação;  
- que a implementação posterior se limita a esta camada (sem nova onda de produto).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (decisão de institucionalizar); Engenheiro (Cursor) propôs |
| Quando | 29/07/2026 |
| Por quê | Identidade como arquitetura, não como tom de prompt |
| Baseado em quê | Deliberação do utilizador; Núcleo Executivo v0; Engine atual |
| Resultado | Proposta em análise — aguarda Gate; **sem implementação** |

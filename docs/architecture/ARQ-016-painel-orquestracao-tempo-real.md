# ARQ-016 — Painel de Orquestração em Tempo Real

> **Status: Homologada v0.2** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-016.  
> **Capacidade:** CAP-07 — Comunicação (superfície situacional) com apoio CAP-11 (sinais de agentes/integrações).  
> Norma superior: CON-001 (transparência, tempo do utilizador); ADR-015; ADR-019; F5 (SRF-T02 Atenção / SRF-T03 Conversa); ARQ-015; REQ-053; REQ-054.  
> **Finalidade:** arquitetura do **Painel de Orquestração em Tempo Real** — transparência operacional sem deslocar a Conversa do centro.  
> **Gate:** Homologada (patrocinador). Próximo artefacto: **REQ-055**.  
> **Decisão de UX:** **Princípio da Progressividade** — vista principal = Nome + Estado + descrição resumida; detalhe só sob interacção.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Superfície (e serviços de suporte) que exibe, em tempo quase real, o **estado operacional** dos componentes do ciclo CEO → CTO / Agent / Backend / Speaker. |
| **Por que existe?** | Após REQ-053/054 o ciclo é multi-processo (cloud + PC). O patrocinador precisa **ver** quem está disponível, a executar, à espera ou em erro — sem abrir vários terminais nem o ChatGPT. |
| **Para quem existe?** | Patrocinador (posto de comando); Orquestrador (fonte de eventos); operadores futuros (extensível). |
| **Como medir sucesso?** | (1) Estados dos 6 actores V1 visíveis numa só vista **progressiva**; (2) actualização sem F5 manual; (3) novos agentes por **registo**; (4) Conversa permanece central; (5) o painel **não** delibera nem executa. |

---

## 1. Objetivo do Painel de Orquestração

### 1.1 Objectivo

Transmitir **transparência operacional** do ciclo multi-processo: de relance, se o sistema pode correr e o que está a acontecer — **sem** rivalizar com a Conversa como canal de intenção.

### 1.2 Hierarquia de experiência (obrigatória)

| Camada | Papel |
|--------|--------|
| **Conversa (SRF-T03)** | **Elemento central** da interface — intenção, deliberação, resposta. |
| **Painel de Orquestração** | **Apoio** de transparência — estados dos actores; nunca o foco principal da composição. |

### 1.3 Compete

| # | Responsabilidade |
|---|------------------|
| O1 | Agregar **sinais de saúde e actividade** dos componentes monitorados. |
| O2 | Traduzir sinais brutos para o **vocabulário de estados** §3. |
| O3 | Actualizar a UI em **tempo real / quase real** (§4). |
| O4 | Vista principal sob **Progressividade** (§1.4): Nome, Estado, descrição resumida. |
| O5 | Detalhe técnico / histórico / avançado **só** sob interacção (§1.4, §7). |
| O6 | Permanecer **só leitura** face à deliberação e à execução. |

### 1.4 Princípio da Progressividade (homologado)

Na **visão principal** do Painel, cada componente exibe **apenas**:

1. **Nome**  
2. **Estado** (enum §3)  
3. **Descrição resumida** (uma linha humana, sem jargão de infra)

**Não** aparecem na vista principal: IDs de Job, latências, stack traces, heartbeats crus, histórico, modelos LLM, rotas HTTP, PIDs.

Esses detalhes (e quaisquer informações avançadas) aparecem **somente** mediante interacção do utilizador (clique, expansão, “Ver detalhe”).

**Objectivo do princípio:** manter a Conversa no centro; o Painel só comunica transparência operacional com o mínimo cognitivo.

### 1.5 Não compete

| # | Fora de escopo |
|---|----------------|
| N1 | Substituir ou ofuscar a Conversa como canal de intenção. |
| N2 | Disparar Jobs, consultar CTO ou deliberar no MRE. |
| N3 | Dashboard genérico de infra (CPU, facturação OpenAI, etc.) na V1. |
| N4 | Exigir IDE Cursor ou browser ChatGPT abertos. |
| N5 | Redesenhar REQ-053/054 — apenas **consome** os seus sinais. |
| N6 | Mostrar telemetria técnica na vista principal (viola Progressividade). |

---

## 2. Componentes monitorados (V1)

Cada actor é um **nó de orquestração** (`OrquestracaoNo`) com `id` estável.

| ID | Componente | O que representa | Fonte de sinal (proposta) |
|----|------------|------------------|---------------------------|
| `ceo` | **CEO** (Agente Executivo / Núcleo) | Capacidade de receber instrução e coordenar | Sessão activa no front; última `executiveEngine.executar`; health implícito se API+front OK |
| `cto` | **CTO** (Conector REQ-054) | Canal de consulta estruturada ao CTO | `POST /api/ceo/cto/*` em curso; último `ResultadoCto.estado`; `llm-status` (chave) |
| `agent` | **Agent** (Cursor SDK / Engenheiro) | Executor de Jobs | Job `running` na fila; lock/PID do dispatcher; ausência = ocioso/indisponível |
| `dispatcher` | **Dispatcher** (REQ-053) | Watcher que acorda o Agent | Heartbeat/ficheiro de estado do watcher; PID; “visto há Xs”; sem heartbeat → indisponível (PC off) |
| `backend` | **Backend** (API Railway / Hono) | Infra de APIs CEO | `GET /health`; opcional `llm-status` |
| `speaker` | **Speaker** (comunicado / voz) | Tradução parecer→prosa / canal voz | Ciclo Speaker activo; orquestrador de voz (TTS a falar / ocioso / erro) |

### 2.1 Notas de fronteira

* **CEO** ≠ **Backend**: o backend pode estar UP e o CEO “Aguardando” (à espera de input).  
* **CTO** ≠ ChatGPT UI: monitoriza o **Connector**, não a sessão web do ChatGPT.  
* **Agent** ≠ **Dispatcher**: dispatcher pode estar Disponível sem Job; Agent Executando só com Job `running`.  
* **Speaker** cobre prosa + voz na V1 (um nó); subdivisão Chat/Voz fica para extensão.

---

## 3. Estados padronizados

Vocabulário **fechado** na V1 (UI e API de snapshot):

| Estado | Significado canónico |
|--------|----------------------|
| **Disponível** | Componente saudável e pronto a aceitar trabalho. |
| **Executando** | Trabalho activo neste instante (deliberação, consulta CTO, Job, TTS, etc.). |
| **Aguardando** | Bloqueado à espera de input, Job, ou dependência (ex.: CEO à espera do utilizador; Agent à espera de despacho). |
| **Ocioso** | Saudável, sem trabalho e sem espera relevante (idle). |
| **Erro** | Falha detectada (transporte, schema, Job `failed`, health down, heartbeat expirado). |

### 3.1 Regras de mapeamento (resumo)

| Componente | Disponível | Executando | Aguardando | Ocioso | Erro |
|------------|------------|------------|------------|--------|------|
| Backend | `/health` OK | — (V1) | — | — | health fail |
| CEO | front+API OK, sem ciclo | `executar` / MRE a correr | à espera de utilizador após pergunta | sessão sem actividade | falha capacidade |
| CTO | Connector configurado | consulta em voo | — | sem consulta recente | `erro_*` / LLM não configurado |
| Dispatcher | heartbeat fresco | a despachar/acordar Agent | — | a observar fila vazia | sem heartbeat / crash |
| Agent | (raro) pronto sem Job | Job `running` | Job `pending` na fila | sem Jobs | Job `failed` |
| Speaker | pronto | a falar / a gerar comunicado | fila de fala | silêncio | TTS/`onerror` |

**Precedência se vários sinais:** `Erro` > `Executando` > `Aguardando` > `Disponível` > `Ocioso`.

---

## 4. Modelo de actualização em tempo real (recomendado)

### 4.1 Decisão V1

**Híbrido: Snapshot HTTP + Server-Sent Events (SSE).**

| Camada | Papel |
|--------|--------|
| **Snapshot** `GET /api/ceo/orquestracao/snapshot` | Estado completo dos nós (arranque, reconexão, fallback). |
| **SSE** `GET /api/ceo/orquestracao/stream` | Eventos incrementais `no.atualizado` / `pulse`. |
| **Polling de recurso** | Só se SSE indisponível (Vercel estático + API): cliente faz poll do snapshot a cada N s (ex. 3–5 s). |

### 4.2 Porquê não WebSocket na V1

* Menos infra e proxies; SSE é suficiente para estados de orquestração (baixa frequência).  
* Railway já serve HTTP; SSE encaixa no Hono/Vite plugin.  
* Front Vercel continua estático; o stream vem de `VITE_CEO_API_BASE`.

### 4.3 Evento canónico

```text
OrquestracaoEvento {
  tipo: "snapshot" | "no.atualizado" | "pulse"
  em: ISO-8601
  nos?: OrquestracaoNo[]      // snapshot
  no?: OrquestracaoNo         // actualização pontual
}
```

```text
OrquestracaoNo {
  id: string
  nome: string
  estado: Disponivel|Executando|Aguardando|Ocioso|Erro
  descricaoResumida: string   // vista principal (Progressividade)
  detalhe?: object | string   // só sob expansão — técnico/histórico
  atualizadoEm: ISO-8601
  origemSinal?: string        // não exibir na vista principal
}
```

### 4.4 Publicação de sinais

* **Backend / CTO / Speaker (servidor):** emitem no **barramento de orquestração** in-process (pub/sub leve) → alimenta SSE.  
* **Dispatcher / Agent (PC local):** o watcher escreve **heartbeat** (ficheiro ou `POST` leve autenticado ao backend, a definir no REQ) para o painel não depender do browser no PC do Engenheiro.  
* **CEO (front):** reporta “ciclo a correr” via o mesmo pedido que já faz ao Núcleo (o servidor observa início/fim de rotas relevantes).

---

## 5. Arquitetura de integração com o Orquestrador

```text
                    ┌──────────────────────────────────────┐
                    │     Orquestrador (Núcleo Executivo)    │
                    │  + efeitos: MRE, CTO, Fila, Speaker   │
                    └──────────────┬───────────────────────┘
                                   │ emite sinais (não bloqueia)
                                   ▼
                    ┌──────────────────────────────────────┐
                    │   Serviço de Orquestração (novo)      │
                    │   - registo de nós                    │
                    │   - redução → estados §3              │
                    │   - snapshot + SSE                    │
                    └──────────────┬───────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        Painel UI (V1)      (futuro) API externa    Âncora / logs
        Centro / módulo
```

### 5.1 Princípios

| Princípio | Detalhe |
|-----------|---------|
| **Não invasivo** | Orquestrador e conectores **publicam** eventos; o painel **subscreve**. Falha do painel não impede deliberação. |
| **Fonte da verdade operacional** | Snapshot do Serviço de Orquestração — não o DOM. |
| **Orquestrador continua a mandar** | O painel não escolhe Agent/CTO; só mostra. |
| **Separação MRE** | Sem meter estágios 0–7 na UI V1; no máximo “CEO Executando”. |

### 5.2 Relação com superfícies F5

* **SRF-T03 Conversa** permanece o **centro** da experiência.  
* O Painel reforça **SRF-T02 (Atenção)** como apoio de transparência — faixa/cartão compacto, **nunca** rival da Conversa.  
* Progressividade garante que o apoio não vira dashboard.

---

## 6. Modelo extensível (novos agentes)

### 6.1 Contrato de extensão

Qualquer novo actor (ex.: Validador, Agente MG2, CI) regista-se sem alterar o layout base:

```text
RegistoNoOrquestracao {
  id: string                 // estável, kebab ou snake
  nome: string
  papel: string              // CTO | Engenheiro | Infra | Voz | Outro
  coletor: () => SinalBruto | Promise<SinalBruto>
  // ou: canal de eventos "orquestracao.signal.<id>"
  mapeadorEstado: (sinal) => EstadoPadronizado
  prioridadeVisual?: number  // ordem no painel
}
```

### 6.2 Regras

1. **IDs novos** não reutilizam `ceo|cto|agent|dispatcher|backend|speaker` sem ADR.  
2. O Painel V1 renderiza uma **lista/grid de nós** a partir do registo — zero `switch` por agente na UI.  
3. Novos estados **fora** do enum §3 exigem emenda a esta ARQ (não inventar cores ad hoc).  
4. Agentes sem coletor → aparecem como **Erro** ou ocultos (flag `obrigatorioV1: false`).

### 6.3 Catálogo V1 vs futuro

| V1 (fixos) | Extensões possíveis |
|-------------|---------------------|
| 6 nós §2 | Validador, Fila (nó próprio), Onboarding, Voice Engine separado do Speaker |

---

## 7. Proposta de layout da V1

### 7.1 Princípios de UI

* **Conversa no centro** (SRF-T03) — o Painel é apoio, nunca o herói da composição.  
* **Progressividade (§1.4)** — vista principal = Nome + Estado + descrição resumida.  
* Uma composição no posto de comando — não um dashboard de métricas.  
* Estados por **rótulo + cor semântica** (acessível: não só cor).  
* Painel **abaixo ou ao lado** da conversa / faixa do dia — sem ofuscar a conversa.

### 7.2 Esboço (vista principal — Progressividade)

```text
┌─ Centro de Situação ─────────────────────────────────────────┐
│                                                               │
│  ★ Conversa (central)                                         │
│  … diálogo CEO ↔ utilizador …                                 │
│                                                               │
│  Orquestração                              (transparência)    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │ CEO        │ │ CTO        │ │ Backend    │                 │
│  │ Ocioso     │ │ Disponível │ │ Disponível │                 │
│  │ A aguardar │ │ Pronto a   │ │ API online │                 │
│  │  a sua voz │ │  consultar │ │            │                 │
│  └────────────┘ └────────────┘ └────────────┘                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │ Dispatcher │ │ Agent      │ │ Speaker    │                 │
│  │ Disponível │ │ Aguardando │ │ Ocioso     │                 │
│  │ A observar │ │ Há trabalho│ │ Em silêncio│                 │
│  │  a fila    │ │  na fila   │ │            │                 │
│  └────────────┘ └────────────┘ └────────────┘                 │
│                                                               │
│  (sem Job IDs, heartbeats, rotas ou modelos nesta vista)      │
└───────────────────────────────────────────────────────────────┘
```

### 7.3 Interacção (detalhe sob demanda)

| Acção | Comportamento |
|-------|----------------|
| Clique / expansão do nó | Revela `detalhe`: erro curto, Job id, “desde quando”, origem do sinal — **sem** navegar para fora. |
| Segunda acção / fechar | Recolhe ao trio Nome · Estado · descrição resumida. |
| Nó em Erro | Na vista principal: Estado=Erro + descrição humana (“Falha ao contactar a API”); detalhe técnico só na expansão. |
| Sem SSE | Indicador discreto “actualização periódica” — não dominar a conversa. |

### 7.4 Mobile

* Lista vertical ou grelha 2 colunas; mesmos três campos na vista principal; expansão em accordion.

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Falso “Dispatcher Disponível” com PC off | Heartbeat com TTL curto → **Erro** ou **Aguardando** com descrição humana |
| Ruído de estados a piscar | Debounce 300–500 ms; `pulse` sem mudar estado |
| Vazamento de segredos no `detalhe` | Allowlist; nunca API keys; detalhe só expandido |
| Painel a roubar foco à Conversa | Progressividade + hierarquia §1.2; painel compacto |
| Painel confundido com chat CTO | Copy: transparência de canal, não conversa |

---

## 9. Fora de escopo desta ARQ

* IMP / código (seguem o REQ-055).  
* Autenticação multi-utilizador do stream.  
* Histórico longo na vista principal (histórico só em detalhe expandido, se o REQ o permitir).  
* Controlo remoto (start/stop watcher a partir do browser) — ARQ/REQ futura.

---

## 10. Critérios de homologação (cumpridos em v0.2)

1. Objectivo §1 e hierarquia Conversa > Painel.  
2. **Princípio da Progressividade** §1.4.  
3. Seis componentes V1 §2.  
4. Cinco estados §3.  
5. SSE + snapshot (+ polling) §4.  
6. Integração não invasiva §5.  
7. Registo extensível §6.  
8. Layout progressivo §7.  
9. Autorização para abrir **REQ-055**.

---

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidades | CAP-07 (primária); CAP-11 (sinais) |
| Superfície | F5 SRF-T03 (Conversa, central); SRF-T02 (Atenção / painel) |
| Precedentes | ARQ-015; REQ-053; REQ-054; diagnóstico operacional 01/08/2026 |
| Requisitos | **REQ-055** |
| Âncora | `docs/learning/ANCORA-MESTRA.md` |

---

## 12. Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Proposta inicial | Em análise |
| 0.2 | 01/08/2026 | Patrocinador + Engenheiro | Progressividade; Conversa central | **Homologada** — abre REQ-055 |

---

*Fim da ARQ-016 v0.2 homologada. Implementação condicionada a REQ-055 + IMP.*

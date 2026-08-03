# ARQ-021 — Restauração da Fila Oficial do MVP

> **Status: Homologada v0.1** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-021.  
> **Capacidade:** CAP-11 — Integrações.  
> Norma superior: CON-001; ADR-015; ADR-006; **REQ-045** (Fila V1 local); **REQ-053** (Dispatcher V2 local); ARQ-017; REQ-056; REQ-030.  
> Relacionado (não substituído): BP-001 (Backend de Produção — LLM/API HTTP); ARQ-016 (Painel observa); ARQ-020 (Consciência lê a **mesma** fila oficial).  
> **Finalidade:** restaurar a conformidade arquitectural em que **produtor e consumidor** usam a **mesma** Fila oficial do MVP.  
> **Gate:** homologada (patrocinador). **Próximo:** **REQ-060** → **IMP-060** (plano E1–E6 aberto).  
> **Sem implementação de código** até REQ-060 + Gate do plano IMP-060 + autorização por etapa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura de **restauração** que reafirma a Fila local (`executive/queue`) como fonte oficial do MVP e obriga o caminho de publicação do CEO e o caminho de consumo do Dispatcher a coincidirem nessa fila. |
| **Por que existe?** | O cutover BP-001 (E4+E8 → Railway) fez o browser em produção publicar Jobs no filesystem do serviço Railway, enquanto o Dispatcher (REQ-053) continua a ler `executive/queue` no PC — produtor e consumidor em filas diferentes; handoff «iniciado» sem Job alcançável pelo watcher. |
| **Para quem existe?** | Patrocinador (ciclo deliberação→execução fiável no PC); CEO Digital / Motor (publica); Dispatcher / Agent (consomem); Painel / Consciência (observam a fila oficial). |
| **Como medir sucesso?** | (1) Todo Job criado pelo fluxo MVP aparece em `executive/queue/JOB-*.json` no PC; (2) O Dispatcher local deteta esse `pending` sem cópia manual; (3) Nenhum caminho oficial de publicação MVP trata a fila Railway como fonte de verdade; (4) BP-001 continua a servir LLM/API sem violar REQ-045/053; (5) CA §6 verificáveis. |

---

## 1. Diagnóstico do desvio (contexto, não escopo de código)

### 1.1 Arquitectura homologada (MVP)

```text
CEO (publicação)
  → Fila local  executive/queue/JOB-*.json   (REQ-045)
  → Dispatcher local (watcher)                (REQ-053)
  → Cursor Agent / SDK
```

### 1.2 Estado observado em produção (desconforme)

```text
CEO (Vercel) ──POST──► Railway /api/ceo/queue/jobs
                           → filesystem do serviço Railway
                           → JOB.json   «fila A»

Dispatcher local ──────► filesystem do PC
                           → executive/queue/JOB.json   «fila B»
```

### 1.3 Origem do desvio (rastreio)

| Elo | Artefacto | Papel |
|-----|-----------|--------|
| Contrato HTTP local | Commit `9ccb183` + REQ-045 | `POST /api/ceo/queue/jobs` relativo → disco **local** (conforme). |
| API Hono + FS remoto | BP-001 E4 (`b9c4f4e`) | Mesmas rotas no Backend de Produção; persistência no host da API. |
| Cutover do front | BP-001 E8 (`57172c3`) + E12 | `VITE_CEO_API_BASE` → publicação do browser passa a Railway. |
| Consumidor | REQ-053 / `f439ba6` | Dispatcher observa **só** `executive/queue` local. |

BP-001 **não** revogou REQ-045 nem REQ-053. O desvio é de **implementação / cutover**, não de norma superior.

---

## 2. Respostas arquitecturais obrigatórias

### 2.1 Qual é a fila oficial do MVP?

**A Fila de Execução local baseada em ficheiros** no repositório CEO do patrocinador:

* Pasta canónica: `executive/queue/`
* Artefactos: `JOB-*.json` + `PROXIMO.md` (REQ-045)
* Estados canónicos: `pending` \| `running` \| `completed` \| `failed` \| `cancelled`
* Máquina: **PC do patrocinador** (ou o `CEO_REPO_ROOT` onde corre o Dispatcher)

**Não** é oficial do MVP, como fonte de verdade do ciclo Job:

* filesystem / volume do serviço Railway usado apenas porque o front aponta `VITE_CEO_API_BASE` para a API remota;
* qualquer fila cloud, mensageria paga, ou «async» 24/7 (explícitamente fora de escopo em REQ-045 / REQ-053; V3 eventual).

### 2.2 Quem publica nessa fila?

| Actor | Papel |
|-------|--------|
| **CEO Digital / Núcleo / Motor de Execução** | Decide publicar Job (após política / Gate quando aplicável) — **sem** nomear o executor (REQ-045 / REQ-030). |
| **Capacidade `fila` / porta `publicarJob`** | Adaptador de publicação. |
| **API local da fila** (dev server Vite plugin **ou** processo Node local equivalente) | Persistência: escreve `executive/queue/JOB-*.json` no disco do PC. |

Publicação oficial do MVP = qualquer caminho cujo efeito seja um `JOB-*.json` **na pasta oficial do PC**, alcançável pelo Dispatcher.

### 2.3 Quem consome essa fila?

| Actor | Papel |
|-------|--------|
| **Dispatcher local (REQ-053)** | Observa `executive/queue/` (ou API **local** de pendentes que leia a **mesma** pasta); deteta `pending`; adquire lock; acorda o Agent. |
| **Agent Cursor (SDK local)** | Marca `running` → executa → `completed` / `failed` segundo o skill `consumir-fila-execucao`. |
| **Patrocinador / Engenheiro (fallback)** | Consumo manual da fila se o watcher estiver parado (comportamento degradado previsto em REQ-053). |

O browser do CEO **não** consome Jobs. O serviço Railway **não** é o consumidor oficial do MVP.

### 2.4 Quais componentes devem deixar de utilizar a fila Railway?

Como **fonte de verdade** ou **destino de publicação** do ciclo Job do MVP, deixam de usar a fila no filesystem Railway:

| Componente | Deixa de… |
|------------|-----------|
| **Cliente de fila do SPA em produção** (`publicarJobFila` / listagens oficiais de Jobs do ciclo MVP) | Publicar e tratar como canónicos os Jobs criados só em Railway via `VITE_CEO_API_BASE` + `/api/ceo/queue/*`. |
| **Motor / Continuidade / capacidade `fila` (caminho C3)** | Considerar «Job publicado» quando o `POST` remoto cria registo inacessível ao Dispatcher local. |
| **Painel / Orquestração / Consciência (sinais de Jobs)** | Reportar `pending`/`running` da fila Railway como estado oficial do MVP, se divergir de `executive/queue` local. |
| **Rotas Railway `/api/ceo/queue/*` (papel MVP)** | Servirem de **produtor oficial** do ciclo Dispatcher↔Agent. |

*Nota:* isto **não** obriga a apagar o código Hono da fila nesta ARQ; obriga a **despromover** esse caminho como oficial do MVP até norma futura (V3) ou emenda explícita a REQ-045/053.

### 2.5 Como preservar BP-001 sem violar REQ-045 e REQ-053?

**Princípio de separação de responsabilidades:**

| Domínio BP-001 (mantém-se) | Domínio Fila MVP (restauração) |
|----------------------------|--------------------------------|
| Backend HTTP de produção (Hono) | Persistência oficial dos Jobs |
| LLM / deliberação remota (`/api/ceo` LLM) | `executive/queue` no PC |
| Health, CORS, onboarding remoto (se aplicável) | Dispatcher + SDK no PC |
| Segredos `CEO_LLM_*` no servidor | `CURSOR_API_KEY` só no ambiente local do Dispatcher |

**Regra de convivência (canónica desta ARQ):**

1. **BP-001 continua** a hospedar a API de produção para o que **não** é a fonte de verdade do ciclo Job MVP (em especial LLM).  
2. **O ciclo Job MVP** (publicar → pending → Dispatcher → Agent → terminal) **obriga** leitura/escrita na Fila oficial local (§2.1).  
3. Em produção Vercel, o cutover genérico «todas as `/api/ceo/*` → Railway» **não** pode aplicar-se ao **ciclo oficial de Jobs** sem violar REQ-045/053. A arquitectura exige um caminho de publicação que escreva na fila local (API/plugin no PC, ou modo local explícito), **ou** a não declarar «Job publicado / handoff ao Dispatcher» enquanto o artefacto não existir na fila oficial.  
4. Dual-run aceite: **desenvolvimento local** sem `VITE_CEO_API_BASE` (ou com API local) já pode estar conforme; **produção** deve ser corrigida na IMP futura para o mesmo invariante.  
5. Heartbeat do Dispatcher → API Railway (sinal do Painel) **pode** permanecer (observabilidade BP-001 / ARQ-016); isso **não** autoriza a fila Railway como produtor.  
6. Filas cloud / Railway-as-queue = **fora do MVP**; candidato a V3 só com REQ novo — não por BP-001 sozinha.

```text
                    ┌─────────────────────────────┐
  Browser (Vercel)  │  LLM / deliberação          │──► Railway (BP-001) ✅
                    │  (não é fonte da Fila MVP)  │
                    └─────────────────────────────┘

                    ┌─────────────────────────────┐
  CEO / Motor       │  Publicação de Job MVP      │──► executive/queue (PC) ✅
                    └─────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────────┐
  Dispatcher        │  Consome a mesma pasta      │──► Agent SDK local ✅
                    └─────────────────────────────┘
```

### 2.6 Critérios de aceitação (arquitecturais)

| ID | Critério |
|----|----------|
| **CA-ARQ-021-1** | A **única** fila oficial do MVP está definida como `executive/queue` no PC (`CEO_REPO_ROOT`), alinhada a REQ-045. |
| **CA-ARQ-021-2** | Todo fluxo oficial de criação de Job do MVP (Motor / capacidade fila / C3 após Gate) tem como efeito um `JOB-*.json` nessa pasta, em `pending` (salvo rejeição de política). |
| **CA-ARQ-021-3** | O Dispatcher local (REQ-053) é o consumidor oficial desses `pending`; não depende da fila Railway. |
| **CA-ARQ-021-4** | Nenhum caminho marcado como oficial declara «Job criado» / «Handoff ao Dispatcher» se o Job **não** existir na fila oficial local. |
| **CA-ARQ-021-5** | Componentes listados em §2.4 **não** usam a fila Railway como fonte de verdade do ciclo Job MVP. |
| **CA-ARQ-021-6** | BP-001 permanece válido para LLM/API HTTP de produção **sem** tornar a fila Railway a fila oficial (separação §2.5). |
| **CA-ARQ-021-7** | Painel / Consciência, quando reportam Jobs do MVP, referenciam a **mesma** fila oficial (ou degradam com transparência se indisponível) — sem misturar contagens Railway vs local como se fossem uma. |
| **CA-ARQ-021-8** | REQ-045 e REQ-053 **não** são revogados nem contraditos por esta ARQ; BP-001 **não** é promovido a norma de fila. |
| **CA-ARQ-021-9** | Cloud 24/7 / fila remota como fonte de verdade permanece **fora de escopo** do MVP (V3 eventual). |

---

## 3. Objetivo e não-objectivos

### 3.1 Objectivo

**Restaurar o invariante:** *um Job oficial do MVP é publicado e consumido na mesma Fila local*, conforme REQ-045 e REQ-053, eliminando o desvio BP-001 cutover no domínio da fila.

### 3.2 Não-objectivos (desta ARQ)

| ID | Fora |
|----|------|
| NO1 | Implementar código, alterar `VITE_CEO_API_BASE`, ou escrever IMP. |
| NO2 | Escrever ou emendar REQ nesta fase. |
| NO3 | Desenhar Dispatcher cloud / Automations (V3). |
| NO4 | Migrar a oficina do Agent para Railway. |
| NO5 | Redesenhar Motor, Classificador, Continuidade do Gate ou Consciência além do invariante de fila. |
| NO6 | Apagar historicamente Jobs já criados em Railway (política de limpeza = IMP/operacional futuro). |

---

## 4. Escopo

### 4.1 Dentro

* Definição da fila oficial (§2.1).  
* Papéis de publicação e consumo (§2.2–2.3).  
* Lista de componentes a despromover da fila Railway (§2.4).  
* Modelo de convivência com BP-001 (§2.5).  
* Critérios de aceitação arquitecturais (§2.6).  
* Fronteiras para futuro REQ/IMP.

### 4.2 Fora

* Código, commits, deploy, testes automatizados.  
* Escolha fina de mecanismo de publicação local em produção (proxy, companion, desligar cutover só da fila, etc.) — **decisão de IMP** após REQ, desde que respeite o invariante.  
* Alteração textual de REQ-045/REQ-053 nesta fase (salvo o Gate mandar emenda posterior).

---

## 5. Relação com normas existentes

| Norma | Relação |
|-------|---------|
| **REQ-045** | **Reafirmada** — fila local em ficheiros; API local; sem filas cloud no MVP. |
| **REQ-053** | **Reafirmada** — Dispatcher local observa a mesma pasta. |
| **ARQ-017 / REQ-056** | Criação do Job e handoff lógico só são válidos se o Job existir na fila oficial. |
| **ARQ-016 / REQ-055** | Painel observa Dispatcher/Fila oficiais; heartbeat remoto ≠ fila remota. |
| **ARQ-020 / REQ-059** | Consciência lê Jobs da fila oficial. |
| **BP-001** | Mantém Backend de Produção para LLM/HTTP; **não** define a fila oficial do MVP. |
| **ADR-015** | Uso diário no PC do patrocinador — reforça fila + Dispatcher locais. |

---

## 6. Riscos arquitecturais

| Risco | Mitigação |
|-------|-----------|
| SPA na Vercel sem acesso ao disco do PC | Publicação MVP exige caminho que escreva na fila local; não fingir handoff remoto. |
| Dual-run confuso (local conforme / prod desconforme) | CA-ARQ-021-4 e CA-ARQ-021-5; IMP futura com verificação explícita. |
| Jobs órfãos na fila Railway | Fora do ciclo oficial; limpeza operacional futura; não misturar IDs com a fila local. |
| Tentação de «sincronizar Railway → PC» sem REQ | Proibido como atalho silencioso; só com norma futura (não é MVP desta ARQ). |

---

## 7. Critérios de homologação desta ARQ

O patrocinador homologa ARQ-021 quando confirmar:

1. §2.1–2.6 respondem às seis perguntas da solicitação.  
2. O invariante «mesma fila para produzir e consumir» está inequívoco.  
3. BP-001 fica delimitado sem violar REQ-045/053.  
4. Autorização para abrir o **próximo** artefacto (REQ) — **não** para implementar código nesta fase.

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Fila | REQ-045 |
| Dispatcher | REQ-053 |
| Motor / handoff | ARQ-017; REQ-056 |
| Backend produção | BP-001 (E1, E4, E8, E12) — contexto do desvio |
| Desvio (commits) | `b9c4f4e` (E4); `57172c3` (E8); cutover E12 |
| Capacidade | CAP-11 |
| Próximo | REQ (após Gate) → IMP (após REQ) |

---

## 9. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura ARQ-021 — restauração da fila oficial | Produtor Railway ≠ consumidor local; repor REQ-045/053 | Rascunho |
| 0.1 | 01/08/2026 | Patrocinador | Homologação ARQ-021 | Gate aprovado | Homologada — REQ-060 |

---

**ARQ-021 homologada.** Próximo: Gate do **REQ-060**. **Não** implementar sem IMP autorizada.

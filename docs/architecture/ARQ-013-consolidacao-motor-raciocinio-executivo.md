# ARQ-013 — Consolidação Arquitetural do Motor de Raciocínio Executivo (MRE)

> **Status: Homologada / aprovada — referência oficial para IMP — v1.0 (30/07/2026).**  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-013.  
> **Capacidade:** CAP-01 — Governança (recorte deliberação executiva / Fase 2).  
> Norma superior: CON-001; ADR-015; ADR-006; **ADR-019**; **REQ-048…051 (aprovadas)**.  
> **Finalidade:** encerrar a fase de **modelagem** do MRE e servir de mapa único para a fase de **implementação**.  
> **Gate:** Aprovado (patrocinador, 30/07/2026). Próximo artefato: **IMP-010**.  
> **Proibições:** não cria novas REQs; não altera ADRs; não produz código; não antecipa stack tecnológica além do necessário à orquestração lógica.

---

## 1. Visão geral da arquitetura

O Motor de Raciocínio Executivo (MRE) separa **deliberação** de **comunicação** e de **retenção de conhecimento**.

| Camada | Papel |
|--------|--------|
| **Núcleo Executivo** | Admite a mensagem, classifica intenção e roteia. Fluxos determinísticos não passam pelo MRE. |
| **MRE** | Delibera em estágios fixos e produz exatamente um `ParecerExecutivo` válido. |
| **Aprendizado Executivo** | Avalia o que preservar (memória, precedente, proposta de princípios); não delibera. |
| **Speaker Executivo** | Traduz o parecer em linguagem natural por canal; não delibera nem consulta memória. |
| **Canais** | Chat, Voice, Centro de situação — consomem o comunicado, não o raciocínio bruto. |
| **Fila / Memória / Princípios** | Efeitos laterais pós-parecer (despacho, persistência, Gate de princípios). |

```text
Mensagem
   ↓
Núcleo Executivo ──[não deliberativo]──→ fluxo determinístico / local
   ↓ [rota deliberativa]
MRE (estágios 0–7)
   ↓
Aprendizado Executivo (estágio 8 + critérios de retenção)
   ↓
ParecerExecutivo válido
   ├──→ Speaker → ComunicadoExecutivo → Chat / Voz / Centro de situação
   └──→ Plano de Retenção → memória / precedente / proposta de princípio (Gate)
```

**Invariantes**

1. Nenhuma resposta deliberativa ao utilizador sem `ParecerExecutivo` válido.  
2. O MRE não produz prosa de utilizador.  
3. O Speaker não delibera, não consulta memória e não altera o parecer.  
4. Princípios nunca são atualizados automaticamente.

---

## 2. Estado de aprovação dos artefatos

| Artefato | Título | Status | Papel na consolidação |
|----------|--------|--------|------------------------|
| [ADR-019](../adr/ADR-019-motor-de-raciocinio-executivo.md) | Motor de Raciocínio Executivo | **Aceita para modelagem** v0.1 | Decisão arquitetural que institui o MRE e autorizou a modelagem |
| [REQ-048](../requirements/REQ-048-parecer-executivo-schema.md) | ParecerExecutivo (Schema) | **Aprovado** v0.1 | Contrato formal da saída deliberativa |
| [REQ-049](../requirements/REQ-049-pipeline-motor-raciocinio-executivo.md) | Pipeline do MRE | **Aprovado** v0.1 | Fluxo operacional completo dos estágios |
| [REQ-050](../requirements/REQ-050-speaker-executivo.md) | Speaker Executivo | **Aprovado** v0.1 | Comunicação fiel do parecer |
| [REQ-051](../requirements/REQ-051-aprendizado-executivo.md) | Aprendizado Executivo | **Aprovado** v0.1 | Critérios de retenção e homologação |
| **ARQ-013** (este documento) | Consolidação MRE | **Consolidação aprovada** v1.0 | Referência oficial para IMP |

**Encerramento da modelagem:** com REQ-048…051 aprovadas e esta ARQ publicada, a fase de modelagem do MRE está **encerrada**. A implementação permanece sujeita ao fluxo ADR-006 (IMP → VAL) e **não** está autorizada por este documento isoladamente além de orientar o plano de IMP.

---

## 3. Relação entre os artefatos

```text
ADR-019 (institui MRE + separação Reasoner / Speaker / Aprendizado)
    │
    ├── REQ-048  contrato ──────── ParecerExecutivo
    │       ▲
    │       │ produz / valida
    ├── REQ-049  pipeline ──────── estágios 0–8 + validação
    │       │
    │       ├── aplica critérios de ── REQ-051 (estágio 8 / retenção)
    │       └── emite parecer válido ──→ REQ-050 (Speaker)
    │
    ├── REQ-050  comunica ──────── ComunicadoExecutivo (chat / voz / centro)
    │
    └── REQ-051  retém ─────────── memória / precedente / proposta → Gate

ARQ-013  consolida o mapa acima para a fase IMP
```

| De | Para | Relação |
|----|------|---------|
| ADR-019 | REQ-048…051 | Autorizou e delimita a modelagem |
| REQ-048 | REQ-049 / 050 / 051 | Schema obrigatório compartilhado |
| REQ-049 | REQ-048 | Produz e valida o parecer |
| REQ-049 | REQ-051 | Estágio 8 aplica critérios de aprendizado |
| REQ-049 | REQ-050 | Só após parecer válido |
| REQ-050 | REQ-048 | Consome parecer imutável |
| REQ-051 | REQ-048 | Preenche / confirma bloco `aprendizado` (V4) |
| ARQ-013 | Todos | Índice e ordem de IMP; não substitui os textos canónicos |

Os documentos REQ/ADR permanecem a **fonte normativa** dos detalhes; ARQ-013 não reabre nem emenda o seu conteúdo.

---

## 4. Componentes envolvidos

| Componente | Norma principal | Delibera? | Saída lógica |
|------------|-----------------|-----------|--------------|
| Núcleo Executivo | Existente (v0) + ADR-019 | Não | Rota / eventos estruturados |
| MRE (Reasoner) | REQ-049 + REQ-048 | Sim | `ParecerExecutivo` |
| Aprendizado Executivo | REQ-051 | Não | Bloco `aprendizado` + Plano de Retenção |
| Speaker Executivo | REQ-050 | Não | `ComunicadoExecutivo` |
| Voice Engine | REQ-047 | Não | Áudio a partir do guião/texto |
| Conversa / UI | — | Não | Apresentação do comunicado |
| Centro de situação / Painel | — | Não | Factos + destaques do comunicado |
| Fila de Execução | REQ-045 | Não | Jobs quando `acao.tipo = despachar` |
| Gate humano (princípios) | REQ-051 / ADR-019 | Sim (humano) | Aceite/rejeição de propostas |

---

## 5. Fluxo completo do MRE

### 5.1 Admissão

1. Utilizador envia mensagem (ou evento equivalente).  
2. Núcleo admite, classifica intenção e roteia.  
3. Se não deliberativo → fluxo determinístico (sem MRE).  
4. Se deliberativo → entra no MRE.

### 5.2 Pipeline (REQ-049)

| Ordem | Estágio | Modo típico | Saída parcial |
|-------|---------|-------------|---------------|
| 0 | Diagnóstico Estratégico | LLM + saneamento DET | `diagnostico` |
| 1 | Enquadramento | HIB | `enquadramento` |
| 2 | Memória Executiva | **DET** | `dossier` |
| 3 | Princípios Permanentes | HIB | `principiosAplicados` |
| 4 | Análise | LLM | `analise` |
| 5a ∥ 5b | Riscos / Oportunidades | HIB / LLM | `riscos` / `oportunidades` |
| 6 | Decisão Executiva | LLM + enum DET | `decisaoExecutiva` |
| 7 | Ação Operacional | DET no tipo + redação | `acao` |
| 8 | Aprendizado | HIB (REQ-051) | `aprendizado` |

Estados de decisão fechados: `aprovar` \| `rejeitar` \| `delegar` \| `monitorar` \| `solicitar_dados` \| `adiar`.

### 5.3 Fecho

1. Montagem do `ParecerExecutivo` (REQ-048).  
2. Validação V1–V6; se inválido → retentativa / falha deliberativa controlada (sem “assistente” livre).  
3. Parecer válido → Speaker (REQ-050) **e** efeitos de retenção autorizados (REQ-051).  
4. Se `acao.tipo = despachar` → disponibilizar `acao.job` à Fila (REQ-045).  
5. Canais apresentam apenas o `ComunicadoExecutivo`.

---

## 6. Dependências

### 6.1 Entre artefatos da modelagem

| Artefato | Depende de |
|----------|------------|
| REQ-048 | ADR-019 |
| REQ-049 | ADR-019, REQ-048 |
| REQ-050 | ADR-019, REQ-048, REQ-049 |
| REQ-051 | ADR-019, REQ-048, REQ-049 |
| ARQ-013 | ADR-019, REQ-048…051 |

### 6.2 Dependências de sistema (contexto de IMP)

| Dependência | Uso |
|-------------|-----|
| Núcleo Executivo v0 | Admissão e roteamento |
| Painel / memória executiva | Dossier (estágio 2); destino de `registrarMemoria` |
| Constituição / princípios | Estágio 3; Gate de propostas (REQ-051) |
| REQ-045 Fila | Consumo de `acao.job` |
| REQ-047 Voice | TTS a jusante do Speaker |
| ADR-015 | Priorização operacional (uso diário / MG2) |
| ADR-006 | Gates ANL → ADR → REQ → ARQ → IMP → VAL |

---

## 7. Ordem de implementação

Ordem normativa sugerida para o plano IMP (detalhe em IMP futuro; sem código nesta ARQ):

| Passo | Entrega | Base normativa | Critério de pronto lógico |
|-------|---------|----------------|---------------------------|
| 1 | Contrato / validação do `ParecerExecutivo` | REQ-048 | Validador V1–V6; parecer inválido rejeitado |
| 2 | Pipeline MRE (estágios 0–7 + montagem) | REQ-049 | Uma deliberação → um parecer candidato |
| 3 | Aprendizado (estágio 8 + plano de retenção) | REQ-051 | Booleanos + H1 (sem auto-aplicar princípios) |
| 4 | Integração Núcleo → MRE (rota deliberativa) | ADR-019, REQ-049 | Determinístico sem MRE; deliberativo só com parecer |
| 5 | Speaker + adaptação por canal | REQ-050 | Comunicado fiel; sem nova decisão |
| 6 | Ligação Voice / Conversa / Centro | REQ-050, REQ-047 | Canais consomem comunicado |
| 7 | Despacho Fila a partir de `acao.job` | REQ-045, REQ-048 V3 | Só com parecer válido e tipo coerente |
| 8 | Persistência memória/precedente + fila de Gate | REQ-051 | Rastreio a `parecerId`; princípios `pendente_gate` |
| 9 | VAL / testes de fidelidade e falhas | REQ-048…051 | Cenários: lacunas, enums, Speaker, H1 |

**Restrições de ordem**

* Não implementar Speaker deliberativo “antes” do parecer (passo 5 depois de 1–2).  
* Não persistir princípios no passo 8 sem Gate.  
* Não misturar redação de utilizador dentro do Reasoner.

---

## 8. Fronteira com o que não faz parte desta consolidação

* Stack, pastas, classes e serialização concreta → IMP.  
* Alteração do status formal do ADR-019 → decisão de Gate/ADR (este documento **não** altera ADRs).  
* Novas REQs de roteamento fino do Núcleo, UX de marca ou CAP-R → ciclos próprios.  
* Onboarding (REQ-046) e Voice (REQ-047) — infraestrutura adjacente, não redesenhados aqui.

---

## 9. Critérios de sucesso desta consolidação

* Modelagem MRE encerrada com ADR-019 + REQ-048…051 mapeados e aprovados (REQs).  
* Fluxo ponta a ponta e ordem de IMP compreensíveis sem reler todos os artefatos.  
* Invariantes de separação deliberação / comunicação / retenção preservados.  
* Documento utilizável como entrada do próximo IMP sem criar novas REQs.

---

## 10. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-019; ADR-015; ADR-006; ADR-010 |
| Origem | Encerramento da modelagem MRE — REQ-051 aprovada (30/07/2026) |
| Artefatos consolidados | ADR-019; REQ-048; REQ-049; REQ-050; REQ-051 |
| Próximo passo | [IMP-010](../implementation/IMP-010-plano-de-implementacao-mre.md) — Em análise |
| Testes | *A criar na fase VAL* |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 1.0 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Consolidação arquitetural do MRE | Encerrar modelagem; referência para IMP | Consolidação aprovada |

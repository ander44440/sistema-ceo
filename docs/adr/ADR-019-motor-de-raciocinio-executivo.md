# ADR-019 — Motor de Raciocínio Executivo (MRE)

> **Status: Aceita para modelagem — v0.1 (30/07/2026).**  
> Autoriza a especificação do contrato `ParecerExecutivo` (REQ-048), do pipeline do MRE (REQ-049), do Speaker Executivo (REQ-050) e do Aprendizado Executivo (REQ-051). **Não** autoriza implementação de código do MRE/Speaker/Aprendizado até REQs/IMP do fluxo ADR-006.  
> Relacionado: ADR-015; Núcleo Executivo v0; CON-001; REQ-045; REQ-046; REQ-047; REQ-048; REQ-049; REQ-050; REQ-051.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | *Proposto* — CTO e Patrocinador (decisores nomeados); Engenheiro (Cursor) registrou o ADR |
| Quando | 30/07/2026 |
| Por quê | Separar deliberação executiva da geração de texto; tornar decisões auditáveis e reutilizáveis; preparar multi-agente |
| Baseado em quê | Proposta de Arquitetura de Raciocínio Executivo (Fase 2); ajustes Diagnóstico / Riscos×Oportunidades / Decisão Executiva / Aprendizado; CON-001; ADR-015; ADR-006 |
| Resultado | ADR-019 **Aceita para modelagem**; REQ-048–050 aprovadas; REQ-051 (Aprendizado) em análise |

---

## Status

**Aceita para modelagem** — v0.1 (30/07/2026). Autoriza REQ-048 a REQ-051. Não autoriza implementação do MRE/Speaker/Aprendizado.

---

## Contexto

O CEO Digital possui atualmente:

- Constituição Executiva;
- Governança LLM;
- Painel Executivo;
- Briefing de projeto;
- Núcleo Executivo determinístico (roteamento / intenções estruturadas);
- Fila de Execução (REQ-045);
- Voice Engine como infraestrutura (REQ-047).

Entretanto, o fluxo deliberativo permanece concentrado em **uma única chamada ao modelo**, onde raciocínio e geração da resposta ocorrem simultaneamente.

Esse desenho dificulta:

- auditoria da decisão;
- reutilização do raciocínio;
- memória organizacional;
- evolução para múltiplos agentes;
- separação entre **decisão** e **comunicação**.

---

## Decisão

### D1 — Instituição do MRE

Introduzir o componente **Motor de Raciocínio Executivo (MRE)**.

O MRE é responsável **exclusivamente** pela deliberação executiva.

A comunicação com o utilizador **não** faz parte do processo de decisão.

### D2 — ParecerExecutivo como contrato

Toda resposta deliberativa ao utilizador deverá ser **derivada** de um artefacto intermediário **`ParecerExecutivo`**.

Nenhum canal (Conversa, Voice, UI) poderá responder deliberativamente sem um `ParecerExecutivo` **válido**.

### D3 — Separação de máquinas

| Componente | Faz | Não faz |
|------------|-----|---------|
| **Núcleo Executivo** | Admitir eventos; classificar intenção; rotear; fluxos determinísticos | Deliberar |
| **MRE** | Deliberar; decidir; decidir aprendizado | Comunicar com o utilizador |
| **Speaker** | Transformar `ParecerExecutivo` em linguagem natural | Deliberar |
| **Voice / UI** | Apresentar | Deliberar ou decidir |

---

## Arquitetura

```text
Mensagem
      ↓
Núcleo Executivo
      ↓
Motor de Raciocínio Executivo
      ↓
ParecerExecutivo
      ↓
Speaker
      ↓
Voice / Conversa / UI
```

Fluxos determinísticos do Núcleo (ex.: abrir dia, registar decisão estruturada) **continuam** sem MRE, salvo deliberação futura em contrário.

---

## Pipeline do MRE

O MRE executa, em ordem:

```text
0  Diagnóstico Estratégico
      ↓
1  Enquadramento
      ↓
2  Memória Executiva
      ↓
3  Princípios Permanentes
      ↓
4  Análise
      ↓
5a Avaliação de Riscos
5b Avaliação de Oportunidades
      ↓
6  Decisão Executiva
      ↓
7  Ação Operacional
      ↓
8  Aprendizado
      ↓
ParecerExecutivo
```

### Estágio 0 — Diagnóstico Estratégico

Identificar antes do enquadramento:

- objetivo real da interação;
- problema de negócio;
- natureza: `estrategica` | `tatica` | `operacional`.

### Estágios 5a / 5b

**Riscos** e **Oportunidades** são avaliações **separadas** (não um único campo misto).

### Estágio 6 — Decisão Executiva

Estados **exclusivos** (estados livres proibidos):

| Estado | Significado |
|--------|-------------|
| `aprovar` | Autorizar / seguir o caminho recomendado |
| `rejeitar` | Recusar o caminho |
| `delegar` | Transferir execução (ex.: Fila de Execução) |
| `monitorar` | Não agir agora; acompanhar |
| `solicitar_dados` | Informação essencial em falta |
| `adiar` | Adiar deliberação com motivo |

### Estágio 8 — Aprendizado

Após a deliberação, o MRE decide se:

- regista memória;
- cria precedente;
- **propõe** atualização de princípios.

Atualizações de princípios **nunca** são aplicadas automaticamente (exigem Gate humano).

O MRE **não** produz texto para o utilizador; isso é exclusividade do Speaker.

---

## Contrato — ParecerExecutivo (mínimo normativo)

Toda execução do MRE produz **exatamente um** objeto `ParecerExecutivo`, incluindo pelo menos:

```text
diagnostico: { objetivoReal, problemaNegocio, natureza }
enquadramento
dossierRef / factos usados
principiosAplicados[]
analise
riscos[]
oportunidades[]
decisaoExecutiva: { estado, recomendacao, alternativas[], justificativa }
acao: { tipo, descricao, job? }
aprendizado: {
  registrarMemoria,
  criarPrecedente,
  atualizarPrincipios,   // proposta apenas
  notas?,
  propostaPrincipio?
}
confianca
lacunas[]
```

O schema detalhado (JSON Schema / módulo) será fixado no **primeiro passo de implementação** após Aceite desta ADR, sem alterar o significado normativo acima.

---

## Ondas de implementação (após Aceite)

1. Definição formal do schema `ParecerExecutivo`.
2. Construção do pipeline do MRE.
3. Integração com o Speaker.
4. Integração com a Fila de Execução (`delegar`).
5. Evolução para múltiplos agentes (fragmentos tipados → um parecer).

**Proibição:** nenhuma implementação poderá permitir que um LLM gere respostas deliberativas diretamente ao utilizador sem a produção prévia de um `ParecerExecutivo` válido.

---

## Consequências

### Positivas

- Separação entre raciocínio e comunicação;
- Decisões auditáveis e reutilizáveis;
- Arquitetura extensível (multi-agente);
- Maior previsibilidade do comportamento “CEO”;
- Reutilização do parecer em Voice, UI e Execução.

### Negativas

- Maior complexidade do fluxo;
- Possível aumento de latência (Reasoner + Speaker);
- Necessidade de manter o contrato do `ParecerExecutivo` estável.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 |
| Priorização | ADR-015 |
| Fluxo de capacidades | ADR-006 |
| Fila | REQ-045 |
| Onboarding / preferências | REQ-046 |
| Voice (infra) | REQ-047 |
| REQs derivados | *A criar após Aceite* (CAP-01 / CAP-05 / CAP-08 conforme Gate) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Patrocinador + CTO (proposta); Engenheiro registrou | Criação ADR-019 | **Proposto** |

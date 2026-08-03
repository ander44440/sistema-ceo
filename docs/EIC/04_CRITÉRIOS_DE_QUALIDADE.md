# 04 — Critérios de Qualidade

> **Status:** BLOCO 3 — Qualidade consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Quadro de avaliação — **só** critérios já homologados (CON / VIS / ARQ-018 / PX-003 E4). Sem critérios técnicos novos.  
> **Fontes:** CON-001; VIS-002; ARQ-018; PX-003 E4; [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md); [`02_ARQUITETURA.md`](02_ARQUITETURA.md).

## Objetivo

Definir o quadro oficial de avaliação da qualidade conversacional do CEO, consolidando normas já aprovadas para uso nos testes ([`05_TESTES_CONVERSACIONAIS.md`](05_TESTES_CONVERSACIONAIS.md)) e na homologação ([`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md)).

## Finalidade

Fonte única de **CA / NA** da EIC. O detalhe normativo completo permanece nos documentos de origem (PX-003 E4, ARQ-018, CON-001); aqui há o **mapa de avaliação**.

---

## 1. Relação com Testes e Homologação

```text
04 Critérios (o que é bom / falha)
        │
        ▼
05 Testes (como observar / registar)
        │
        ▼
11 Homologação (aceitar / rejeitar com evidência)
```

| Documento | Pergunta que responde |
|-----------|----------------------|
| **04** | O que deve ser verdade? |
| **05** | Como verificamos? |
| **11** | Quem aceita e com que evidência? |

---

## 2. Princípios de Avaliação

1. Avaliar só o que já é norma (não improvisar “bom gosto”).  
2. Separar **encaminhamento** (ARQ-018) de **prosa/turno** (PX-003 E4).  
3. CN **não** delibera — fidelidade ao parecer (PX-003 E4).  
4. Tempo do utilizador prevalece (CON-001 Art. 9º.1).  
5. Severidade: o que cria Job indevido ou viola identidade é mais grave que variação de estilo.

---

## 3. Indicadores de Qualidade (dimensões já homologadas)

| ID | Indicador | Norma de origem |
|----|-----------|-----------------|
| IQ-ID | Identidade (CEO ≠ chatbot; personalidade institucional) | CON-001 Art. 2º; VIS-002 §3.5–3.6 |
| IQ-CL | Classificação antes de efeito; C1–C4 correctos | ARQ-018 |
| IQ-RI | Ritmo (curto / médio / profundo) conforme critérios ordenados | PX-003 E4 §1 |
| IQ-IN | Iniciativa (responder / sugerir / silêncio útil) | PX-003 E4 §2 |
| IQ-CO | Continuidade estrutural do fio | PX-003 E4 §3 |
| IQ-DE | Densidade adaptativa (canal, pedido, painel ≠ prosa) | PX-003 E4 §4 |
| IQ-VA | Variação sem quebrar invariantes de identidade | PX-003 E4 §5 |
| IQ-TE | Respeito ao tempo (mínimo para avançar) | CON-001 Art. 9º.1; CAP-07 |

---

## 4. Critérios de Aprovação (CA)

Cada CA é **restatement** de norma existente — não é critério novo.

| ID | Critério de aprovação | Indicador | Fonte |
|----|----------------------|-----------|-------|
| **CA-EIC-01** | A mensagem foi classificada **antes** de qualquer efeito substantive | IQ-CL | ARQ-018 §4 |
| **CA-EIC-02** | A classe C1–C4 respeita a tabela canónica (Job só via política de C3/Motor) | IQ-CL | ARQ-018 §3 |
| **CA-EIC-03** | Em ambiguidade, não se inventa C3/Job; prefere-se classe mais restritiva em efeitos | IQ-CL | ARQ-018 §3.5 |
| **CA-EIC-04** | O ritmo do turno obedece à ordem de escolha PX-003 E4 §1.4 | IQ-RI | PX-003 E4 |
| **CA-EIC-05** | Não há resposta profunda por default nem “encher” para parecer inteligente | IQ-RI / IQ-TE | PX-003 E4 §1.4 |
| **CA-EIC-06** | Iniciativa: no máximo **um** próximo gesto; sugerir sem impor | IQ-IN | PX-003 E4 §2; CON Art. 9º.9 |
| **CA-EIC-07** | Sem fecho muleta / “Mais alguma coisa?” / small talk | IQ-IN | PX-003 E4 §2.3 |
| **CA-EIC-08** | Continuidade: o turno liga-se ao fio (frente, callback, decisão preservada) | IQ-CO | PX-003 E4 §3 |
| **CA-EIC-09** | Densidade ajustada ao canal; painel não é ecoado em prosa longa | IQ-DE | PX-003 E4 §4 |
| **CA-EIC-10** | Invariantes de identidade preservados (sem bajulação, sem assistente genérico) | IQ-ID / IQ-VA | PX-003 E4 §5.2; VIS-002 |
| **CA-EIC-11** | CN/prosa não altera deliberação do MRE nem inventa decisão | IQ-CL | PX-003 E4; ARQ-018 |
| **CA-EIC-12** | Transparência de limites quando aplicável | IQ-TE | CON-001 Art. 9º.8 |

---

## 5. Critérios de Reprovação (NA)

| ID | Critério de reprovação | Severidade | Fonte |
|----|------------------------|------------|-------|
| **NA-EIC-01** | Efeito (Job, handoff, deliberação) **antes** da classificação | Crítica | ARQ-018 |
| **NA-EIC-02** | Job / C3 inventado por default ou por ambiguidade | Crítica | ARQ-018 §3.5 |
| **NA-EIC-03** | CEO tratado/operado como chatbot (diálogo sem governação) | Crítica | CON-001 Art. 2º |
| **NA-EIC-04** | Prosa deliberativa em template rígido tipo formulário ao utilizador (já diagnosticado) | Alta | PX-003 E1/E4 |
| **NA-EIC-05** | Resposta profunda por default / empilhar camadas sem gatilho | Alta | PX-003 E4 §1.4 |
| **NA-EIC-06** | Menu de opções A/B/C/D/E ou múltiplas sugestões no mesmo turno | Alta | PX-003 E4 §2.2 |
| **NA-EIC-07** | “Mais alguma coisa?”, fecho muleta, small talk | Média | PX-003 E4 §2.3 |
| **NA-EIC-08** | Re-deliberar o mesmo ponto sem facto novo | Alta | PX-003 E4 §3.1 |
| **NA-EIC-09** | Eco longo do Painel na bolha de chat | Média | PX-003 E4 §4.2; Âncora (painel só leitura) |
| **NA-EIC-10** | CN decide / altera parecer | Crítica | PX-003 E4 |
| **NA-EIC-11** | Pedir ao utilizador reexplicar contexto já no lastro | Alta | CON-001 Art. 9º.2 |
| **NA-EIC-12** | Impor decisão no lugar do Usuário | Crítica | CON-001 Art. 6º / 9º.9 |

---

## 6. Níveis de severidade

| Severidade | Efeito na homologação EIC |
|------------|---------------------------|
| **Crítica** | Reprova automaticamente (NA-EIC-01, 02, 03, 10, 12) |
| **Alta** | Reprova até correcção; bloqueia Gate de produto |
| **Média** | Regista melhoria; pode homologar doc com ressalva se patrocinador aceitar |

---

## 7. Métricas futuras

Espaço **reservado** — sem métricas quantitativas novas nesta fase.

Quando existirem, derivarão apenas de CA/NA acima e de evidências de [`05`](05_TESTES_CONVERSACIONAIS.md) (contagens de pass/fail por IQ-*), sem inventar KPIs comerciais.

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`05_TESTES_CONVERSACIONAIS.md`](05_TESTES_CONVERSACIONAIS.md) | Execução e registo |
| [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Decisão de aceite |
| [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios de origem |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Módulo M4 / Onda C |
| PX-003 E4 | Norma canónica de qualidade percebida |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 3 — CA/NA consolidados | Pronto para homologação |

---

**Estado:** BLOCO 3 — critérios consolidados. Sem critérios novos. Sem impacto no produto.

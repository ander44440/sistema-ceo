# F3-01 — Mapa de Capacidades do CEO

> **Status: Homologada — Gate F3-01 APROVADO (CTO, 26/07/2026).**  
> Pré-condição: **Fase F2 concluída** — Fundação Conceitual vigente ([`fundacao-conceitual-experiencia.md`](fundacao-conceitual-experiencia.md)).  
> Natureza: **mapa funcional** — capacidades CX-01…CX-18 homologadas.  
> Próxima capacidade: **F3-02** — Modelo de Dependências entre Capacidades.  
> **Proibições neste registro:** sem requisitos detalhados; sem arquitetura técnica; sem wireframes; sem commit.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O inventário das **capacidades funcionais** que o produto CEO precisa oferecer para realizar, na experiência, a Fundação Conceitual homologada na F2. |
| **Por que existe?** | Sem um mapa de capacidades, a F3/F4 e futuros REQs arriscam materializar telas sem cobrir domínios, ou cobrir tecnologia sem cobrir governança/atenção/continuidade. |
| **Para quem?** | CTO (homologação e priorização); Engenheiro (insumo de ondas futuras de REQ); Usuário (transparência do que o produto *precisa ser capaz*). |
| **Sucesso?** | Cada capacidade tem ID, propósito, domínio(s), vínculos DA/PX/IX e fronteira clara do que *não* é; nenhuma capacidade viola o invisível (orquestração como superfície). |

---

## 1. O que é uma “capacidade” neste mapa

| É | Não é |
|---|-------|
| Habilidade **funcional** do produto na experiência (o que o CEO *permite fazer / perceber / governar*) | Módulo de software, serviço, API, modelo de IA |
| Recorte estável o bastante para virar, *depois*, um ou mais REQs | O texto do REQ já escrito |
| Mapeável a D1–D5 e à governança de objetivos | Feature de UI nomeada por componente |
| Independente de *como* se implementa | ADR técnica ou stack |

**Identificadores:** `CX-nn` (Capacidade de eXperiência) — família documental da IPR-001/F3; **não** substitui CAP-01…12 do CAP-001 (catálogo estratégico de produto). Onde houver afinidade, registra-se *relação*, sem fundir IDs.

---

## 2. Princípios de cobertura do mapa

1. **Cobertura da Fundação** — toda peça da linha de base (DA, D1–D5, ciclo, governança, PX/IX) deve ser sustentada por ao menos uma CX.  
2. **Sem violar o invisível** — não existe CX cujo *job* seja “o usuário escolhe o meio” ou “o usuário opera a orquestração”.  
3. **COA como premissa** — capacidades operam sob um COA ativo; troca de COA é capacidade explícita.  
4. **Ciclo contínuo** — capacidades de execução e aprendizado fecham em Nova Atenção / permanente, não em “tarefa ok”.  
5. **Granularidade** — preferir capacidades que um executivo reconheça; evitar átomos técnicos.

---

## 3. Mapa de capacidades (inventário)

### 3.1 Quadro-resumo

| ID | Capacidade | Domínios | Primário |
|----|------------|----------|----------|
| **CX-01** | Estabelecer e exibir o COA ativo | D1, D3 | Lente |
| **CX-02** | Trocar o COA ativo com isolamento | D1, D3 | Lente |
| **CX-03** | Apresentar o quadro de Atenção (D1) | D1 ← D3 | D1 |
| **CX-04** | Declarar e conduzir Objetivo / Intenção | D2 | D2 |
| **CX-05** | Conversar como interface principal | D2 (+ D1/D3) | D2 |
| **CX-06** | Navegar níveis de abstração no COA | D1 ↔ D3 | DA-003 |
| **CX-07** | Consultar e ancorar Contexto / Conhecimento | D3 | D3 |
| **CX-08** | Governar ciclo de vida de Objetivos | D1, D2, D3 | F2-03 |
| **CX-09** | Ordenar prioridade e Foco entre objetivos | D1, D3 | F2-03 |
| **CX-10** | Solicitar meios sem expor orquestração | D2 → D4 | DA-001 |
| **CX-11** | Obter autorização humana (gates) | D1/D2 ↔ D4 | P1 |
| **CX-12** | Acompanhar Execução e Efeito | D5 → D1/D2 | D5 |
| **CX-13** | Aprender e promover ao Permanente | D5 → D3 | DA-002 |
| **CX-14** | Renovar Nova Atenção após atualização | D3 → D1 | Ciclo |
| **CX-15** | Preservar continuidade entre sessões | D3 → D1 | DA-002 |
| **CX-16** | Explicitar limites e estados transitórios | D1, D2 | PX-08 / IX-09 |
| **CX-17** | Registrar decisão e justificativa no COA | D2, D3 | HP-006 obs. |
| **CX-18** | Distinguir progresso de comando vs. checklist | D1, D3 | PX-10 |

---

### 3.2 Fichas funcionais

#### CX-01 — Estabelecer e exibir o COA ativo

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Garantir que a experiência sempre opere e *mostre* exatamente um Contexto Operacional Ativo. |
| **Domínios** | D1 (identidade situacional), D3 (recorte) |
| **Vínculos** | VIS-007; IX-01; PX-03 |
| **Inclui** | Identidade do COA na experiência; recorte de patrimônio e objetivos daquele COA |
| **Exclui** | Multi-COA operável na mesma superfície; escolha de meios |

#### CX-02 — Trocar o COA ativo com isolamento

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Permitir mudança explícita de contexto sem misturar patrimônios nem objetivos. |
| **Domínios** | D1, D3 (lente) |
| **Vínculos** | IX-05; F2-02 F-Coa; F2-03 §3 |
| **Inclui** | Ato explícito de troca; restauração do quadro do COA destino; preservação do COA origem |
| **Exclui** | Troca silenciosa via navegação de nível (IX-10) |

#### CX-03 — Apresentar o quadro de Atenção

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Materializar D1: o que exige atenção agora no COA (Foco, alertas, eco de mudanças). |
| **Domínios** | D1 ← D3 |
| **Vínculos** | PX-05; PX-07; F2-03 §5 |
| **Inclui** | Foco; Ativados relevantes; sinais de risco/prazo; identidade do COA |
| **Exclui** | Arquivo morto completo; telemetria de execução como centro; seletor de meios |

#### CX-04 — Declarar e conduzir Objetivo / Intenção

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Permitir que o usuário formule e mantenha o norte do trabalho antes de qualquer meio (DA-001). |
| **Domínios** | D2 (com âncora em D3) |
| **Vínculos** | DA-001; PX-02; F2-03 ciclo de vida (criação/ativação) |
| **Inclui** | Criação/ativação conceitual de objetivo; intenção em curso |
| **Exclui** | Escolha de ferramenta; execução direta |

#### CX-05 — Conversar como interface principal

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Realizar VIS-007 / PX-04: o diálogo como centro da experiência de comando. |
| **Domínios** | D2; satélites D1/D3 |
| **Vínculos** | IX-11; PX-04 |
| **Inclui** | Condução por linguagem; continuidade conversacional *na sessão* |
| **Exclui** | Chat genérico sem COA (antimodelo); conversa como único armazém permanente |

#### CX-06 — Navegar níveis de abstração no COA

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Subir/descer empresa→…→evidências preservando o mesmo COA (DA-003). |
| **Domínios** | D1 ↔ D3 |
| **Vínculos** | DA-003; IX-10; PX-05 |
| **Inclui** | Mudança de recorte/nível; continuidade de raciocínio |
| **Exclui** | Troca de COA disfarçada; novo domínio |

#### CX-07 — Consultar e ancorar Contexto / Conhecimento

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Dar acesso ao recorte permanente do COA que ancora conversa, atenção e meios. |
| **Domínios** | D3 |
| **Vínculos** | DA-002; D3 F2-01 |
| **Inclui** | Consulta ao permanente; ancoragem da intenção ao COA |
| **Exclui** | Federação “tudo de todos os contextos”; wiki desligado do comando |

#### CX-08 — Governar ciclo de vida de Objetivos

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Criar, ativar, suspender, retomar, concluir e cancelar objetivos conforme F2-03. |
| **Domínios** | D2 (ato), D3 (permanente), D1 (espelho) |
| **Vínculos** | F2-03 §1; G-01…G-04 |
| **Inclui** | Transições de estado de objetivo; registro permanente das mudanças relevantes |
| **Exclui** | Suspender/apagar por mero fim de sessão; confundir objetivo com tarefa/meio |

#### CX-09 — Ordenar prioridade e Foco entre objetivos

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Permitir concorrência de Ativados com um Foco privilegiado e critérios de prioridade. |
| **Domínios** | D1, D3 |
| **Vínculos** | F2-03 §2 e §4; PX-07 |
| **Inclui** | Declaração de Foco pelo usuário; sinalização de prioridade; mudança de foco |
| **Exclui** | Cancelar concorrentes ao focar; usar prioridade para escolher meios |

#### CX-10 — Solicitar meios sem expor orquestração

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Da intenção, obter encaminhamento de meios **invisível** como superfície (D2→D4). |
| **Domínios** | D2 → D4 (D4 invisível) |
| **Vínculos** | DA-001; F2-04 §3; IX-07; F2-02 O-01…O-04 |
| **Inclui** | Pedido de cumprimento da intenção; desfechos compreensíveis |
| **Exclui** | UI de escolha de meios; home de orquestração; D4 executando |

#### CX-11 — Obter autorização humana (gates)

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Pausar encaminhamento/execução sob risco e devolver o controle ao usuário (P1). |
| **Domínios** | D1/D2 ↔ D4/D5 |
| **Vínculos** | IX-06; F2-02 O-03 / E-IN-05 |
| **Inclui** | Pedido de autorização; aceitar/recusar; continuidade após decisão |
| **Exclui** | Autonomia irreversível surpresa; gate escondido em telemetria |

#### CX-12 — Acompanhar Execução e Efeito

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Tornar perceptível, na medida do comando, que algo foi executado e o que mudou. |
| **Domínios** | D5 → D1/D2 |
| **Vínculos** | PX-01; IX-08; F2-02 D5 |
| **Inclui** | Estado “em curso” / efeito relevante / bloqueio |
| **Exclui** | Substituir D1 por log de execução; misturar COAs |

#### CX-13 — Aprender e promover ao Permanente

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Realizar Aprendizado → Atualização do Conhecimento (F2-02): efeito vira patrimônio do COA quando devido. |
| **Domínios** | D5 → D3 |
| **Vínculos** | DA-002; IX-09; F2-02 F-Ret |
| **Inclui** | Promoção Transitório→Permanente; registro de cancelamentos relevantes |
| **Exclui** | Promover plano bruto de orquestração como memória institucional |

#### CX-14 — Renovar Nova Atenção após atualização

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Fechar o ciclo contínuo: após permanente atualizado, D1 reflete o novo quadro. |
| **Domínios** | D3 → D1 |
| **Vínculos** | F2-02 ciclo; PX-06; F2-03 §5.3 |
| **Inclui** | Atualização do quadro situacional; eco de conclusão/cancelamento recente |
| **Exclui** | Fim do ciclo do COA; tela “todas as tarefas concluídas” como sucesso único |

#### CX-15 — Preservar continuidade entre sessões

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Ao reabrir o mesmo COA, restaurar estado governado permanente (objetivos, foco, atenção derivada). |
| **Domínios** | D3 → D1 |
| **Vínculos** | DA-002; F2-03 §6; IX-04 |
| **Inclui** | Sobrevivência pós-sessão; pendências transitórias honestas na retomada |
| **Exclui** | Logout = suspender/concluir objetivos; reexecução automática sem intenção |

#### CX-16 — Explicitar limites e estados transitórios

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Tornar visível incerteza, “ainda não consolidado” e limites do sistema quando afetam o comando. |
| **Domínios** | D1, D2 |
| **Vínculos** | PX-08; IX-09; CON-001 p.8 |
| **Inclui** | Sinais de pendência de promoção; “não sei / não posso” honestos |
| **Exclui** | Fingir conclusão; esconder gate necessário |

#### CX-17 — Registrar decisão e justificativa no COA

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Permitir que decisões relevantes e seus fundamentos integrem o permanente do COA. |
| **Domínios** | D2, D3 |
| **Vínculos** | HP-006 (observação avançada); P2; Memória Organizacional |
| **Inclui** | Ato de registrar decisão+porquê+base no COA |
| **Exclui** | Obrigar promoção normativa de HP-006 neste gate; rastro técnico de orquestração como substituto |

#### CX-18 — Distinguir progresso de comando vs. checklist

| Campo | Conteúdo |
|-------|----------|
| **Propósito** | Orientar a experiência a comunicar avanço por decisão/efeito/nova atenção — não só por % de tarefas. |
| **Domínios** | D1, D3 |
| **Vínculos** | PX-10; antimodelo Tableau/checklist; HP-005 em observação |
| **Inclui** | Representações situacionais de “o que mudou / o que foi decidido” |
| **Exclui** | Definir métricas de produto; promover HP-005 |

---

## 4. Matriz de cobertura — Fundação → Capacidades

| Elemento da Fundação | CX que materializam |
|----------------------|---------------------|
| DA-001 | CX-04, CX-10 |
| DA-002 | CX-07, CX-13, CX-15 |
| DA-003 | CX-06 |
| D1 | CX-03, CX-09, CX-14 |
| D2 | CX-04, CX-05, CX-17 |
| D3 | CX-01, CX-07, CX-13, CX-15 |
| D4 (invisível) | CX-10, CX-11 (sem superfície de orquestração) |
| D5 | CX-12, CX-13 |
| Ciclo contínuo | CX-04→10→12→13→14 |
| Transitório / Permanente | CX-13, CX-16 |
| Governança de objetivos | CX-08, CX-09 |
| COA | CX-01, CX-02 |
| Continuidade entre sessões | CX-15 |
| PX / IX (amostra) | CX-03…CX-16 conforme fichas |
| Invisível (meios/orquestração) | Garantido pela *ausência* de CX de “escolher meio” + CX-10 |

### Lacunas internas (L1–L6) — encaixe sem resolução técnica

| Lacuna | Capacidades relacionadas | Nota |
|--------|--------------------------|------|
| L1 Home / COA | CX-01, CX-03, CX-05 | Forma da Home virá em UX futura; capacidades já as exigem |
| L2 Aprendizado maturável | CX-13, CX-17 | Ciclo Observação→Aprovação ainda é decisão interna |
| L3 Orquestração | CX-10 | Coberta conceitualmente; permanece invisível |
| L4 Loop decisão→efeito | CX-12, CX-13, CX-14, CX-18 | Sem promover HP-005 |
| L5 Tom / identidade | — | Branding / F2 visual futura; fora deste mapa funcional |
| L6 Multi-papel | — | Fora deste mapa; ADR futura |

---

## 5. O que este mapa deliberadamente não contém

* Priorização de implementação / roadmap de releases.  
* REQs numerados, critérios de aceitação testáveis de software.  
* Arquitetura técnica, APIs, dados, modelos de IA.  
* Wireframes ou jornadas pixel-level.  
* Novos domínios D6+.  
* Fusão com CAP-01…12 (apenas relação futura possível).

---

## 6. Relação com o catálogo CAP-001 (informativa)

| CX (experiência) | Afinidade possível com CAP estratégico | Observação |
|------------------|------------------------------------------|------------|
| CX-01…02, 07, 15 | CAP-03 (COA / projetos) | Já há baseline; este mapa não a reabre |
| CX-08…09, 04 | CAP-08 / planejamento | Afinidade temática — sem fundir |
| CX-13, 17 | CAP-05 Memória | Afinidade — sem fundir |
| CX-10…12 | CAP-02 Agentes (futura) | Orquestração invisível — não antecipar IMP |

Qualquer amarra formal CAP↔CX exige deliberação CTO / ADR-006 — **fora** deste gate.

---

## 7. Deliberação do CTO (Gate F3-01 — homologado)

| Item | Registro |
|------|----------|
| Mapa CX-01…CX-18 | ✅ Homologado |
| Cobertura da Fundação Conceitual | ✅ Confirmada |
| CX ≠ CAP-001 | ✅ Confirmada |
| Próxima capacidade | **F3-02** — Modelo de Dependências entre Capacidades |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gate F3-01 homologado) |
| Quando | 26/07/2026 |
| Por quê | Gate F3-01 — Mapa de Capacidades |
| Baseado em quê | Fundação Conceitual; deliberação CTO |
| Resultado | Homologada; F3-02 aberta; sem commit |

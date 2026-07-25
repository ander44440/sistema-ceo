# REQ-033 — Requisitos Funcionais da CAP-05 (Executivo Digital)

> **Status:** Homologado — v1.0 (CTO, 24/07/2026). **CAP-05 concluída; baseline congelada.**  
> **Versão:** 1.0 — 24/07/2026  
> **Capacidade:** CAP-05 — Memória Organizacional  
> **Identificação:** REQ-033 (o identificador REQ-016 e a faixa REQ-016…032 já estão ocupados pelo pacote MVP VIS-003).  
> **Natureza:** especificação de requisitos funcionais e não funcionais derivados **exclusivamente** da VIS-004 Homologada v1.0.  
> **Ciclo CAP-05:** VIS → REQ → ARQ → IMP → VAL **encerrado** (Deliberação Final CTO, 24/07/2026).  
> **Proibição:** **não reabrir** este REQ; enunciado dos RF/RNF permanece congelado na baseline.

---

## 0. Propósito deste artefato

Especificar, de forma rastreável e verificável, os requisitos necessários para transformar o CEO de um sistema que **registra e organiza** informações em um **Executivo Digital** capaz de **conduzir ativamente** o patrocinador — conforme VIS-004.

Cada requisito abaixo (RF / RNF) possui enunciado testável, critérios de aceitação e regras de negócio. Todos rastreiam à VIS-004.

---

## RF-01 — Memória organizacional viva a serviço da condução

### Enunciado

O CEO deverá manter a **Memória Organizacional** (registros históricos de decisões e respectivos contextos, com os cinco campos: quem, quando, por quê, baseado em quê, resultado) de forma **viva e consultável**, de modo que essa memória alimente a compreensão contínua do contexto ativo (ex.: MG2) e a condução do patrocinador — e não apenas o arquivamento passivo.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-004 §1–§2 (objetivos 1–2); CAP-001 CAP-05; CON-001 Art. 8º.

### Critérios de aceitação

* Decisões importantes do contexto ativo são registráveis com os cinco campos da Memória Organizacional.
* O histórico permanece recuperável em sessões posteriores sem reentrada narrativa completa do projeto.
* A memória é utilizável como insumo observável para contexto, recomendações e prioridades (RF-02 a RF-04).
* Ausência de registro pertinente é declarada de forma explícita (não por silêncio nem invenção).

### Regras de negócio

* **RN-01.1** Registrado ≠ inventado: o CEO só usa o que está na memória/estado; se não houver, declara ausência.  
* **RN-01.2** Todo registro decisório relevante carrega, no mínimo, os cinco campos (CON-001 Art. 8º).  
* **RN-01.3** Conhecimento reutilizável independente de decisão permanece na CAP-04 — não é tratado como decisão da CAP-05.

### Fora do escopo

* Curadoria avançada do acervo CAP-04; UI/identidade visual (E-02/E-03).

### Dependências

VIS-004; CON-001 Art. 8º; relação com registro diário já existente no MVP (REQ-022) — evolução, não substituição silenciosa.

---

## RF-02 — Apresentar contexto antes de solicitar decisão

### Enunciado

O CEO deverá, **antes** de solicitar ao patrocinador uma decisão de autoridade, **apresentar o contexto pertinente já conhecido** (memória, estado do dia e registros do contexto ativo), de modo que o patrocinador não decida “no vazio”.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-004 §2 objetivo 3; §5 critério 2; evidência VAL-005 E-01.

### Critérios de aceitação

* Em todo ponto em que o CEO pede confirmação ou escolha de autoridade, há apresentação prévia de contexto pertinente.
* O contexto exibido restringe-se ao registrado/estado conhecido do contexto ativo.
* Se não houver contexto aplicável, a ausência é explícita antes do pedido de decisão.
* O patrocinador consegue identificar *por que* aquela decisão está sendo pedida agora.

### Regras de negócio

* **RN-02.1** Ordem obrigatória: contexto → pedido de decisão (nunca o inverso como fluxo padrão).  
* **RN-02.2** Contexto apresentado deve ser rastreável à memória/estado (não a hipótese não registrada).

### Fora do escopo

* Formato visual específico do destaque (E-02); conteúdo inventado para “preencher” contexto.

### Dependências

RF-01; VIS-004 §2.3; alinhamento com REQ-027 (confirmação) na evolução.

---

## RF-03 — Justificar recomendações

### Enunciado

O CEO deverá acompanhar cada **recomendação** de próximo passo ou de prioridade com uma **justificativa fundamentada**, ligada de forma rastreável à Memória Organizacional e/ou ao estado do contexto ativo (“baseado em quê”).

### Tipo

Funcional; alto nível.

### Justificativa

VIS-004 §2 objetivo 4; §5 critério 3; CON-001 Art. 8º (baseado em quê).

### Critérios de aceitação

* Toda proposta de próximo passo ou prioridade exibe justificativa legível.
* A justificativa referencia memória e/ou estado (ou declara ausência de base registrada).
* O patrocinador consegue rejeitar ou ajustar a recomendação sem perder o registro da base apresentada.
* Recomendação sem justificativa **não** é oferecida como padrão de condução.

### Regras de negócio

* **RN-03.1** Justificativa é obrigatória para recomendações de condução (próximo passo / prioridade).  
* **RN-03.2** Se a base for fraca ou ausente, o CEO declara a limitação — não inventa fundamento.

### Fora do escopo

* Modelos de ML / aprendizado automático de agentes (CAP-06).

### Dependências

RF-01; VIS-004 §2.4; relação com REQ-020 (próximo passo) na evolução.

---

## RF-04 — Propor prioridades de forma fundamentada

### Enunciado

O CEO deverá **propor prioridades** para o contexto ativo de forma fundamentada (com justificativa — RF-03), **sugerindo sem impor**, de modo que a autoridade final de aceitar, ajustar ou rejeitar permaneça com o patrocinador.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-004 §2 objetivo 5; §5 critérios 3 e 5; CON-001 Art. 6º / princípio 9 (sugerir sem impor).

### Critérios de aceitação

* Existe ato observável de proposta de prioridade (ou conjunto mínimo ordenado) para o contexto ativo.
* Cada prioridade proposta traz justificativa (RF-03).
* Nenhuma prioridade vigora sem confirmação do patrocinador.
* O patrocinador pode rejeitar ou reordenar antes de confirmar.

### Regras de negócio

* **RN-04.1** Proposta ≠ vigência: só após confirmação.  
* **RN-04.2** No máximo um “próximo passo” vigente por vez permanece coerente com a disciplina do MVP (evolução, não contradição).  
* **RN-04.3** Prioridades propostas devem referir o contexto ativo único em uso (ex.: MG2 no MVP).

### Fora do escopo

* Planejamento multi-projeto / portfólio; filas longas de tarefas.

### Dependências

RF-02; RF-03; VIS-004 §2.5; REQ-027 (espírito).

---

## RF-05 — Coordenar o fluxo entre Patrocinador, CTO e Engenheiro

### Enunciado

O CEO deverá **apoiar a coordenação do fluxo** entre Patrocinador, CTO e Engenheiro, tornando observável — com base na memória e no estado — **o que exige atenção de qual papel**, reduzindo a coordenação manual entre eles.

### Tipo

Funcional; alto nível.

### Justificativa

VIS-004 §2 objetivo 6; §5 critério 4; VIS-001 (coordenação humanos + IAs).

### Critérios de aceitação

* O CEO identifica e apresenta itens que pedem atenção do Patrocinador, do CTO ou do Engenheiro (conforme o tipo do item).
* A atribuição de atenção é rastreável a estado/memória (não arbitrária).
* O patrocinador vê com clareza o que é decisão dele versus o que é encaminhamento a outro papel.
* A coordenação **não** substitui a deliberação do CTO nem a implementação do Engenheiro.

### Regras de negócio

* **RN-05.1** Papéis: Patrocinador = autoridade de produto; CTO = requisitos/arquitetura/QA; Engenheiro = implementação — o CEO coordena o fluxo, não os substitui.  
* **RN-05.2** Itens sem papel claro permanecem com o Patrocinador até classificação.  
* **RN-05.3** Multi-usuário / IAM fora do escopo deste ciclo (patrocinador único do MVP permanece como premissa operacional até deliberação contrária).

### Fora do escopo

* Chat multiagente autônomo; aprovação em cadeia multi-usuário; orquestração avançada de várias IAs.

### Dependências

RF-01; VIS-004 §2.6; CON-001 papéis.

---

## RNF-01 — Condução com baixa carga cognitiva

### Enunciado

O CEO deverá exercer a condução executiva (RF-02 a RF-05) de modo a **não aumentar** a carga cognitiva do patrocinador além do mínimo necessário para decidir com segurança.

### Tipo

Não funcional; alto nível.

### Justificativa

VIS-004 §4 (benefício); CON-001 Art. 9º princípio 1; alinhamento REQ-028 / REQ-032.

### Critérios de aceitação

* Contexto e justificativas são curtos e acionáveis (sem relatórios longos como padrão).
* Pedidos de decisão são poucos e de alto valor.
* O patrocinador consegue avançar sem preencher formulários além do necessário aos RF.

### Regras de negócio

* **RN-N1.1** Preferir o mínimo necessário para conduzir; detalhe sob demanda.

### Fora do escopo

* Redesign visual completo (E-02/E-03).

---

## RNF-02 — Fronteira de execução preservada

### Enunciado

O CEO, ao conduzir o patrocinador, **não** deverá substituir as ferramentas de execução do contexto ativo (ex.: oficina do MG2).

### Tipo

Não funcional / restrição; alto nível.

### Justificativa

VIS-004 §6 exclusões; REQ-030; ADR-015.

### Critérios de aceitação

* A condução orienta o *quê* e o *porquê*; a execução técnica permanece fora do CEO.
* Alternância CEO → ferramentas de execução → CEO permanece válida e esperada.

### Regras de negócio

* **RN-N2.1** Proibir embutir pipeline de build/deploy/execução do MG2 como função do CEO neste ciclo.

---

## Matriz de rastreabilidade VIS-004 → Requisitos

| VIS-004 | Requisito |
|---------|-----------|
| §1 Problema (registrar ≠ conduzir) | RF-01…RF-05 (conjunto) |
| §2.1 Executivo Digital | RF-01…RF-05 |
| §2.2 Memória viva | RF-01 |
| §2.3 Contexto antes da decisão | RF-02 |
| §2.4 Justificar recomendações | RF-03 |
| §2.5 Prioridades fundamentadas | RF-04 |
| §2.6 Coordenar papéis | RF-05 |
| §5 Critérios de sucesso 1–5 | RF-01…RF-05; RNF-01 |
| §6 Exclusões (execução MG2) | RNF-02 |
| §6 Exclusões (CAP-04, UX E-02/E-03, CAP-06) | Fora do escopo dos RF |

---

## Fora do escopo deste artefato (fase REQ)

* Arquitetura (ARQ), implementação (IMP), validação da CAP-05.  
* Alteração do MVP sob VAL-005.  
* Requisitos de identidade visual / feedback visual (E-02, E-03) como RF desta CAP.  
* Reabertura da CAP-04.

---

## Riscos e incertezas

* **Escopo expansivo (“coordenar tudo”):** mitiga-se pelos RF focados e exclusões.  
* **Sobreposição com CAP-07 (Comunicação):** fronteira fina na ARQ; neste REQ a coordenação é *apoiada pela memória/estado* (CAP-05).  
* **Confusão com REQ-022 (registrar decisão):** RF-01 evolui o *uso* da memória para condução; não revoga o registro.

---

## Rastreabilidade (documento)

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-05 — Memória Organizacional |
| Norma superior | CON-001 Art. 6º, 8º, 9º; VIS-001; VIS-004 Homologada v1.0; CAP-001 CAP-05; ADR-015 |
| Origem | Deliberação CTO — abertura fase REQ CAP-05 após VIS-004 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — RF-01…05, RNF-01…02, regras, rastreabilidade VIS-004 | Deliberação CTO — fase REQ CAP-05 | Em análise |
| 1.0 | 24/07/2026 | CTO homologou; Engenheiro registrou | Homologação; fase REQ encerrada; fase ARQ aberta | Deliberação CTO — APROVAÇÃO REQ-033 | **Homologado** |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO homologou |
| Quando | 24/07/2026 |
| Por quê | Abrir a fase REQ da CAP-05 com requisitos rastreáveis à VIS-004 |
| Baseado em quê | VIS-004 Homologada; Deliberação CTO — APROVAÇÃO REQ-033 |
| Resultado | REQ-033 **Homologado v1.0**; fase REQ encerrada; fase ARQ aberta |

# ARQ-006 — Arquitetura do Acervo de Conhecimento Organizacional

> **Status: Homologada — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; CAP-001 (CAP-04); ANL-001 v1.1; REQ-004, REQ-005, REQ-014, REQ-015 v1.0; deliberação Grupo E Opção 2c; ADR-006; ADR-010; ADR-011; ARQ-001/002/004 (precedentes de forma).
> Este documento define **arquitetura lógica** do acervo de conhecimento da CAP-04. Não cria nem altera requisitos; não inicia IMP.
> **Abertura:** deliberação da Governança — Fase de Arquitetura da CAP-04 (23/07/2026).
> **Gate de Arquitetura (ARQ-006):** encerrado com esta homologação técnica. IMP e Validação não iniciadas.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organiza logicamente o acervo de conhecimento organizacional de modo a satisfazer, sem absorvê-los uns aos outros, os REQ-004 (estruturação), REQ-005 (recuperação), REQ-014 (curadoria) e REQ-015 (preservação)?**

---

## 1. Princípios arquiteturais

Estes princípios **precedem** qualquer decisão de estrutura. Nenhuma decisão desta arquitetura pode violá-los.

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **K1** | Fonte canônica única do acervo | Existe exatamente um acervo oficial de itens de conhecimento. Espelhos e derivados são subordinados; em divergência, prevalece o acervo (REQ-004; precedente de forma ARQ-004). |
| **K2** | Identidade permanente do item | Todo item possui identificador único e permanente — nunca renumerado, reutilizado ou substituído por versionamento de conteúdo (REQ-004; REQ-015). |
| **K3** | Separação aptidão × identidade | A **aptidão operacional** (apto / não apto a ser tratado como válido — REQ-014) não se confunde com a **identidade institucional** nem com a existência histórica do item (REQ-014; REQ-015). |
| **K4** | Separação conteúdo versionado × identidade | O **conteúdo** versiona-se; a identidade e o identificador permanecem. Nova versão **não** constitui novo item (REQ-015). |
| **K5** | Recuperação sobre o registrado | Só se entrega como conhecimento organizacional o que consta do acervo; a determinação de aplicabilidade usa propriedades registradas (REQ-005; REQ-004). |
| **K6** | Independência tecnológica | A arquitetura é lógica. Nenhuma obrigação do acervo depende de fornecedor, ferramenta ou protocolo específico (REQ-015). |
| **K7** | Fronteira de capacidade | O acervo administra **itens de conhecimento** (CNC-002). Não é Memória Organizacional (CAP-05), não é autoridade semântica (conceitos), não é norma de governança (CAP-01) — Opção 2c. |
| **K8** | Reutilizar antes de criar | Padrões de índice, entrada por unidade, histórico append-oriented e espaços de ID já consolidados são reutilizados antes de inventar modelos paralelos. |

---

## 2. Diretriz de reutilização

| Padrão consolidado | Onde | Reutilização nesta ARQ |
|--------------------|------|------------------------|
| Índice = fonte de estado; entrada por unidade | ARQ-001; ARQ-004 | Índice do acervo + uma entrada por item |
| Append-only / cadeia evolutiva | ARQ-001; REQ-015 | Cadeia lógica de versões de conteúdo; eventos de curadoria |
| Independência de espaços de ID | ADR-008; ARQ-002 | Reserva de espaço próprio do acervo (distinto de PREFIXO-nnn e CNC-nnn) — sem definir a convenção do espaço |
| Categoria lógica vs rótulos concretos | REQ-014 | Apto / não apto na arquitetura lógica; taxonomia fina extensível |

---

## 3. Mapa de responsabilidades (integração sem absorção)

| Componente | Fundamento | Responsabilidade (inalterada) | Papel nesta ARQ |
|------------|------------|-------------------------------|-----------------|
| Estruturação | REQ-004 | O que é o item; ID; classificação; origem; relacionamentos; existência do estado de validade | Forma lógica do registro e campos mínimos da entrada |
| Recuperação | REQ-005 | Determinar e entregar o aplicável ao contexto (CNC-003); sob demanda e proativamente | Modelo lógico de determinação e entrega |
| Curadoria | REQ-014 | Governar aptidão; obsolescência; deduplicação; depuração | Modelo de estado apto/não apto e atos de curadoria |
| Preservação | REQ-015 | Sobrevivência; integridade; versionamento do conteúdo; recuperabilidade histórica | Cadeia lógica de versões e permanência do acervo |
| Grupo E | Opção 2c | Sem REQ próprio; essenciais nos REQs acima; integrações CAP-05/06/12 nos ciclos delas | Fronteiras explícitas; sem contratos entre capacidades |

---

## 4. Decisões arquiteturais

### A1 — Forma do acervo

O acervo de conhecimento organizacional organiza-se logicamente, no plano documental, como estrutura sob:

**`docs/knowledge/`**

Composta, no mínimo, por:

1. **Índice oficial do acervo** (`docs/knowledge/README.md`) — porta de entrada e **fonte de estado** do acervo: relação dos itens registrados com identificador, designação/resumo curto, classificação(ões), origem referenciada, categoria lógica de aptidão (apto / não apto) e referência à entrada. Um item existe oficialmente no acervo se, e somente se, consta deste índice.
2. **Uma entrada por item** — unidade documental própria e permanente sob `docs/knowledge/`, contendo o núcleo de informações do item (A2) e a cadeia lógica de versões de conteúdo (A5).

O índice **não** substitui o conteúdo da entrada; em divergência de **estado** (pertença, aptidão refletida), prevalece o índice após correção rastreável (K1).

### A2 — Organização das informações do item (REQ-004)

Cada entrada de item contém, obrigatoriamente:

| Seção | Conteúdo | Satisfaz |
|-------|----------|----------|
| Identificação | Identificador permanente do espaço reservado ao acervo; termo ou título designativo | REQ-004; K2 |
| Conteúdo vigente | Representação do conhecimento reutilizável na versão corrente | REQ-004; REQ-015 |
| Classificação | Ao menos uma categoria do conjunto mantido pelo acervo | REQ-004 |
| Origem | Projeto, agente e/ou decisão — por identificadores rastreáveis | REQ-004 |
| Relacionamentos | Referências por identificador a normas, conceitos, outros itens e, quando existirem, a decisões | REQ-004; Opção 2c |
| Aptidão | Categoria lógica **apto** ou **não apto** (projeção do estado de validade governado pelo REQ-014) | REQ-004; REQ-014; K3 |
| Cadeia de versões de conteúdo | Histórico append-oriented das versões do conteúdo (A5) | REQ-015; K4 |
| Eventos de curadoria | Registro das decisões que alteraram aptidão, resolveram duplicidade ou depuraram (MO) | REQ-014 |

Rótulos específicos dentro de “não apto” (obsoleto, inválido, substituído, etc.) são **extensíveis** e não bloqueiam esta arquitetura (REQ-014).

### A3 — Espaço de identificação (reserva arquitetural)

* Itens de conhecimento **não** reutilizam o espaço documental `PREFIXO-nnn` nem o espaço `CNC-nnn` (K7).
* A ARQ-006 **apenas reserva o espaço arquitetural** de identificação do acervo, sob responsabilidade do mecanismo de Gestão do Conhecimento (fundamento ARQ-002).
* Esta arquitetura **não define**:
  * sintaxe dos identificadores;
  * prefixos;
  * algoritmo de geração;
  * regras de numeração.
* Essas definições serão tratadas **exclusivamente** em uma **ARQ específica subsequente** de identificação do acervo (precedente de forma: ARQ-001 → ARQ-003).
* Até essa ARQ específica, permanecem válidas a forma do registro e os modelos lógicos de recuperação, curadoria e preservação aqui definidos; **não** se emitem identificadores novos do acervo sem essa ARQ.

### A4 — Recuperação contextual (REQ-005)

* **Entrada lógica:** um Contexto de Trabalho identificado (CNC-003).
* **Determinação:** o conjunto aplicável deriva das propriedades registradas dos itens (classificação, origem, relacionamentos) — nunca de conhecimento não registrado (REQ-005; K5).
* **Filtro de aptidão:** nenhum item na categoria lógica **não apto** é entregue ou fundamentado como conhecimento **válido**; o estado pode ser informado, mas não autoriza uso como válido (REQ-014; REQ-005).
* **Modos:** sob demanda e proativo, limitando a entrega ao necessário para avançar com segurança (alinhado ao REQ-005 e à CON-001 Art. 9º princípio 1).
* **Ausência:** quando não houver aplicável, a resposta declara ausência explicitamente.
* Esta decisão define o **modelo lógico** de recuperação; não define mecanismos de determinação além das propriedades já exigidas pelos requisitos.

### A5 — Preservação e versionamento (REQ-015)

* O acervo sob a organização lógica de A1 é a sede da **permanência** do patrimônio no plano documental.
* Alterações **autorizadas** do conteúdo geram **nova versão** na cadeia da mesma entrada; o identificador permanece (K4).
* A cadeia de versões é **append-oriented**: versões anteriores não são apagadas; são recuperáveis pelo identificador.
* Recuperar versão histórica **não** a torna automaticamente válida para uso — validade/aptidão = REQ-014 (K3).
* Integridade: proíbe-se alteração silenciosa; alterações rastreáveis são permitidas (REQ-015).
* Sobrevivência a sessão/agente/ferramenta: a sede canônica do patrimônio é o acervo organizado em A1, não a sessão de origem (K6; REQ-015).

### A6 — Curadoria (REQ-014)

* Toda mudança de aptidão, resolução de duplicidade ou depuração é **decisão sob governança** (CNC-001) com Memória Organizacional, registrada na entrada e refletida no índice.
* Depuração remove o item do conjunto **utilizável como válido**; não apaga identidade nem cadeia de versões (K3; A5).
* Deduplicação: resolução registrada (qual permanece apto, quais não aptos, ou equivalência explícita).

### A7 — Fronteiras (Grupo E — Opção 2c)

| Fronteira | Tratamento nesta ARQ |
|-----------|----------------------|
| CAP-05 | Itens ≠ registros históricos (CNC-002). Relacionamentos a decisões usam identificadores quando existirem; **sem** contrato de integração. |
| CAP-06 / CAP-12 | Fora do escopo estrutural desta ARQ; ciclos próprios. |
| Conceitos (CNC) | Vocabulário normativo ≠ item de conhecimento. Referência por identificador de conceito quando necessário. |
| Normas | Referência por identificador normativo; acervo não é registro canônico de normas. |

### A8 — Extensibilidade

Novas classificações, metadados ou rótulos sob “não apto” podem ser acrescentados sem invalidar entradas existentes nem alterar K1–K8. Não define migração estrutural do acervo.

### A9 — Rastreabilidade arquitetural

Toda decisão desta ARQ rastreia **exclusivamente** aos fundamentos abaixo — sem introduzir novos requisitos:

| Elemento | Fundamento exclusivo |
|----------|----------------------|
| Forma lógica do acervo (índice + entrada) | REQ-004 |
| Campos mínimos da entrada | REQ-004 |
| Reserva do espaço de ID (sem convenção) | REQ-004; Opção 2c (fronteira vs outros espaços) |
| Determinação e entrega contextual + filtro apto | REQ-005; REQ-014 |
| Apto / não apto; atos de curadoria | REQ-014 |
| Cadeia de versões; permanência; integridade | REQ-015 |
| Fronteiras sem REQ próprio do Grupo E | Deliberação Grupo E — Opção 2c |

---

## 5. Limites desta Arquitetura

A ARQ-006 **não define**:

* persistência física;
* formato definitivo dos arquivos;
* APIs;
* mecanismos automáticos;
* interface de usuário;
* implementação;
* integrações com CAP-05;
* integrações com CAP-06;
* integrações com CAP-12;
* contratos entre capacidades (capítulos);
* sintaxe, prefixos, algoritmo de geração ou regras de numeração de identificadores (A3);
* planos IMP, tecnologia, armazenamento físico ou comportamento operacional de runtime;
* alteração dos REQ-004, REQ-005, REQ-014 ou REQ-015.

---

## 6. Dependência arquitetural de identificação

A emissão de identificadores novos do acervo permanece **arquiteturalmente condicionada** à ARQ específica do espaço de identificação (A3). Essa condição é de **completude da arquitetura de identificação**, não autorização de Implementação nem definição de tecnologia.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Fundamentos desta ARQ | REQ-004; REQ-005; REQ-014; REQ-015; deliberação Grupo E Opção 2c |
| Norma de tipo / fluxo | ADR-010; ADR-006 |
| Origem | Deliberação da Governança — abertura Fase ARQ CAP-04 (23/07/2026) |
| Satisfaz (organização lógica) | REQ-004, REQ-005, REQ-014, REQ-015 |
| Não executa | IMP não iniciado; Validação não iniciada |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Princípios K1–K8; acervo `docs/knowledge/`; decisões A1–A9; espaço de ID deferido; Opção 2c | Autorização da Governança — abertura ARQ CAP-04 | Em revisão técnica do CTO |
| 1.0 | 23/07/2026 | Engenheiro (Cursor) | Ajustes A1: reserva de espaço sem sintaxe/prefixo/algoritmo/numeração; seção Limites; rastreabilidade só REQ-004/005/014/015 + Opção 2c; linguagem estritamente arquitetural | Solicitação de ajustes do CTO (parecer favorável condicionado) | Em revisão técnica do CTO — v1.0 |
| 1.0 | 23/07/2026 | CTO homologou | Homologação técnica; commit institucional autorizado; IMP/Validação não iniciadas | Consistência com REQ-004/005/014/015; Opção 2c; ADR-006 | **Homologada — revisão técnica encerrada** |

# ARQ-007 — Arquitetura do Espaço de Identificação do Acervo de Conhecimento

> **Status: Homologada — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; ADR-011 v1.0; ARQ-002 v1.0; ARQ-006 v1.0 (decisão A3 — reserva do espaço).
> Este documento **materializa** a decisão A3 da ARQ-006: define a arquitetura específica do espaço de identificação do acervo de conhecimento. Não altera a ARQ-006; não altera requisitos; não inicia IMP; não define tecnologia nem persistência física.
> **Gate:** com esta homologação, a dependência de identificação da ARQ-006 (§6) fica satisfeita quanto à convenção do espaço. **Fase de Arquitetura da CAP-04: encerrada.** IMP não iniciada.

---

## Finalidade

Definir a arquitetura específica do **espaço de identificação dos itens de conhecimento** do acervo organizacional (CAP-04; CNC-002; ARQ-006), de modo que a reserva feita pela ARQ-006 (A3) torne-se **espaço emitível**: convenção do identificador, regras de emissão, unicidade, permanência, não reutilização, relação com o índice do acervo e rastreabilidade da emissão.

Com a homologação desta ARQ, extingue-se a dependência arquitetural de identificação registrada na ARQ-006 (§6), no que tange à convenção do espaço — permanecendo a Implementação sujeita a deliberação própria da Governança.

---

## Decisões arquiteturais

### A1 — Criação e organização do espaço

* Fica criado o **espaço de identificação do acervo de conhecimento**, nos termos da ARQ-002 (A1): domínio delimitado, com responsável único — **o acervo oficial de conhecimento** (ARQ-006 A1), que emite os identificadores e garante suas propriedades.
* O espaço é **único e plano**: não possui hierarquias, partições, categorias ou subespaços. Classificação, aptidão e demais atributos do item pertencem ao **conteúdo/estado da entrada** (ARQ-006 A2), nunca ao identificador (opacidade — ARQ-002 A2.5).
* O **índice oficial do acervo** (`docs/knowledge/README.md` — ARQ-006 A1) é a relação oficial dos identificadores emitidos: um identificador existe no espaço se, e somente se, consta deste índice com a respectiva entrada.

### A2 — Convenção dos identificadores

O identificador de item de conhecimento tem a forma:

**`KNW-nnn`**

* **`KNW`** — marcador fixo do espaço, invariável para todos os identificadores. Favorece a legibilidade humana (evoca *knowledge* / conhecimento) **sem significado arquitetural**: nenhuma decisão organizacional pode depender da leitura do marcador; ele existe para qualificar a referência (A5) e facilitar o reconhecimento por humanos (ARQ-002 A2.3).
* **`nnn`** — número sequencial natural, iniciado em `001`, com no mínimo três dígitos e sem limite superior (após `KNW-999`, segue `KNW-1000`). O número expressa exclusivamente a ordem de emissão — não expressa importância, classificação, aptidão, hierarquia ou qualquer característica do item (opacidade).
* O identificador é **atômico**: consumidores o tratam como símbolo indivisível; decompô-lo em marcador e número não produz nenhuma informação organizacional legítima (ARQ-002 A2.3 e A2.5).

### A3 — Regras arquiteturais de emissão

1. **Um item, um identificador**: cada item de conhecimento possui exatamente um identificador permanente, atribuído no ato de registro no acervo (REQ-004; ARQ-006 A1/A2) e jamais alterado.
2. **Imutabilidade do identificador:** uma vez emitido, um identificador `KNW-nnn`:
   * **nunca** é alterado;
   * **nunca** é renumerado;
   * **permanece o mesmo** mesmo após: alteração de conteúdo; nova versão; reclassificação; mudança de aptidão; curadoria; deduplicação.
3. **Nunca reutilizado, nunca reatribuído**: um identificador emitido pertence para sempre ao seu item (ADR-011 princípio 5; ARQ-002 A2.1; REQ-014; REQ-015).
4. **Emissão determinística**: o próximo identificador é sempre o sucessor numérico do último emitido no espaço. Dado o estado do índice do acervo, o identificador seguinte é univocamente determinável — sem escolha, sem aleatoriedade.
5. **Emissão rastreável**: todo identificador nasce no ato de registro do item no acervo, que carrega os cinco campos da Memória Organizacional (CON-001 Art. 8º); a emissão **não** gera rastro próprio separado — é parte do ato de registro e herda seu rastro integral.
6. **Emissão exclusiva pelo acervo**: nenhum identificador do espaço nasce fora do ato de registro de um item no acervo oficial (ARQ-006). Itens rejeitados, rascunhos não registrados ou propostas não admitidas **não** consomem identificadores — números são atribuídos apenas a itens efetivamente registrados no índice, sem lacunas na sequência.
7. **Neutralidade da ordem de emissão**: a ordem de emissão **não** representa prioridade, relevância, classificação, aptidão ou qualquer atributo organizacional do item. A sequência numérica existe exclusivamente para garantir unicidade e rastreabilidade da emissão (precedente ARQ-003 A3.6).

### A4 — Preservação da identidade sob não aptidão

* Itens classificados na categoria lógica **não apto** (REQ-014; ARQ-006 A6) **continuam preservando** o respectivo `KNW-nnn` e a sua **identidade institucional**.
* A perda de aptidão operacional **não implica** perda de identidade nem emissão de novo identificador.
* Depuração, curadoria e deduplicação alteram aptidão ou resolução de redundância — **nunca** o `KNW-nnn` já emitido.

### A5 — Relação com o índice do acervo

* O índice (ARQ-006 A1) é a **fonte de estado** da existência do identificador no espaço: pertença ao acervo ⇔ entrada no índice com identificador `KNW-nnn` e referência à entrada.
* A emissão de um `KNW-nnn` e a inclusão da correspondente linha no índice / criação da entrada são **o mesmo ato lógico de registro** — não há identificador órfão nem entrada sem identificador do espaço.
* Versionamento de conteúdo e eventos de curadoria (ARQ-006 A5/A6) **não** emitem novo `KNW-nnn`.

### A6 — Utilização pelos consumidores

* A referência a um item é a **referência qualificada** da ARQ-002 (A5): o marcador `KNW` determina o espaço; o número determina o elemento.
* Consumidores referenciam o item pelo identificador `KNW-nnn`; quando a precisão temporal do **conteúdo** importar, acrescentam a identificação da versão na cadeia da entrada (ARQ-006 A5) — não um novo identificador de espaço.
* **Opacidade na prática**: nenhum consumidor infere classificação, aptidão, origem ou conteúdo a partir do identificador — essas informações obtêm-se exclusivamente pelo acervo (índice + entrada).
* **Estabilidade das referências** (ARQ-002 A7): toda referência `KNW-nnn` estabelecida permanece válida pela vida da organização.

### A7 — Independência e fechamento do espaço

* Este espaço não depende da estrutura interna de `PREFIXO-nnn`, `CNC-nnn` ou de qualquer outro espaço, e nenhum outro espaço depende dele (ADR-008; ARQ-002 A3).
* Referências cruzadas (item → norma/conceito/decisão; e o inverso) são referências **qualificadas entre espaços autônomos**.
* **Fechamento:** toda regra específica desta ARQ — convenção `KNW-nnn`, emissão, organização — aplica-se **exclusivamente** aos itens de conhecimento do acervo. Nenhuma convenção aqui definida pode ser implicitamente estendida a outro espaço sem arquitetura própria que o autorize (precedente ARQ-003 A6).

### A8 — Rastreabilidade arquitetural

Toda decisão desta ARQ deriva **exclusivamente** dos fundamentos abaixo — sem introduzir novos requisitos:

| Elemento | Fundamento exclusivo |
|----------|----------------------|
| Espaço com responsável único (acervo ARQ-006) | ARQ-006 A3 |
| Espaço único e plano; índice = relação dos IDs | ARQ-006 A3; ARQ-006 A1 (via A3) |
| Convenção `KNW-nnn` | ARQ-006 A3 |
| Um item, um ID permanente; imutabilidade; não reutilização | REQ-004; REQ-015; REQ-014 |
| Identidade preservada sob não aptidão | REQ-014; REQ-015 |
| Emissão determinística e rastreável no registro | REQ-004 |
| Relação índice ⇔ identificador; versão/curadoria sem novo ID | ARQ-006 A3; REQ-004; REQ-015; REQ-014 |

---

## Limites desta Arquitetura

A ARQ-007 **não define**:

* mecanismo técnico de geração;
* persistência física;
* APIs;
* tecnologia;
* implementação;
* sincronização distribuída;
* detalhes operacionais da emissão;
* alteração da ARQ-006;
* alteração dos REQ-004, REQ-005, REQ-014 ou REQ-015;
* planos IMP ou autorização de Implementação;
* regras para qualquer outro espaço de identificação;
* taxonomia de classificação ou rótulos de aptidão (ARQ-006 A2/A8).

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Fundamentos desta ARQ | ARQ-006 A3; REQ-004; REQ-014; REQ-015 |
| Completa | ARQ-006 (reserva do espaço → convenção emitível) |
| Serve a | REQ-004 (ID permanente); REQ-015 (mesma identidade sob versão); REQ-014 (aptidão ≠ novo ID / identidade preservada) |
| Origem | Plano de Decomposição aprovado pelo CTO; autorização ARQ-007 (23/07/2026) |
| Não autoriza | IMP — Fase ARQ da CAP-04 encerrada com esta homologação |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Espaço do acervo; convenção `KNW-nnn`; emissão, índice, opacidade, fechamento | Autorização do CTO — ARQ-007; materializar ARQ-006 A3 | Em revisão técnica do CTO |
| 1.0 | 23/07/2026 | Engenheiro (Cursor) | Ajustes A1: imutabilidade explícita do KNW-nnn; identidade sob não aptidão; seção Limites; rastreabilidade só ARQ-006 A3 + REQ-004/014/015 | Parecer CTO — aprovada com ajustes menores | Em revisão técnica do CTO — v1.0 |
| 1.0 | 23/07/2026 | CTO homologou | Homologação final; commit autorizado; Fase ARQ CAP-04 encerrada; IMP não iniciada | Completude do espaço após ARQ-006 A3 | **Homologada — publicada** |

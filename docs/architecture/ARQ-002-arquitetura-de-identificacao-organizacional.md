# ARQ-002 — Arquitetura de Identificação Organizacional

> **Status: Aprovado — v1.0.**
> Versão 1.0 — 21/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; ADR-008 v1.0 (independência dos espaços); ADR-011 v1.0 (capacidade de Identidade Organizacional).
> Este documento define arquitetura geral. Não define prefixos específicos, formatos concretos de identificadores, algoritmos de geração, implementação técnica, nem regras particulares para qualquer mecanismo específico.

---

## Finalidade

Esta é a arquitetura específica da capacidade de Identidade Organizacional (ADR-011): define **como a organização estrutura a identificação de seus elementos**, servindo de base para todas as arquiteturas de identificação futuras — inclusive a dos conceitos organizacionais, cuja ausência constitui a Lacuna Arquitetural Bloqueante registrada na ANL-003.

## Diretriz de reutilização

Em conformidade com a diretriz arquitetural obrigatória (21/07/2026), esta arquitetura deriva de padrões já consolidados:

| Padrão consolidado | Onde já está aprovado | Reutilização nesta arquitetura |
|--------------------|----------------------|--------------------------------|
| Independência entre espaços de identificação | ADR-008 (princípio arquitetural) | Núcleo da organização dos espaços (A1, A3) |
| Permanência da identidade | ADR-011, princípio 5 | Princípio dos identificadores (A2) |
| Identidade independente de estrutura, conteúdo e estado | ADR-011, princípio 2 | Princípio dos identificadores (A2) |
| Extensibilidade sem invalidar o existente | ARQ-001, decisão A5 | Criação de novos espaços (A6) |
| Neutralidade tecnológica | ADR-011, Decisão 7 | Toda a arquitetura |

## Decisões arquiteturais

### A1 — Organização dos espaços de identificação

A identificação organizacional é estruturada em **espaços de identificação**:

* **Espaço de identificação** é o domínio delimitado dentro do qual identificadores organizacionais são emitidos e mantêm unicidade.
* **Todo identificador organizacional pertence a exatamente um espaço.** Não existem identificadores fora de um espaço, nem identificadores compartilhados entre espaços.
* **Cada espaço possui exatamente um responsável**: o mecanismo organizacional (ou a governança documental) que o mantém. É o responsável quem emite os identificadores do espaço e garante suas propriedades (A4).
* **Todo espaço nasce por decisão de governança rastreável** — tipicamente a arquitetura específica de identificação do mecanismo que o utilizará (tipo ARQ, pelo gate próprio da ADR-006).

### A2 — Princípios arquiteturais dos identificadores organizacionais

Todo identificador organizacional, em qualquer espaço, obedece a:

1. **Permanência** (ADR-011, princípio 5): uma vez atribuído a um elemento, jamais é reutilizado, renumerado ou reatribuído — ainda que o elemento deixe de existir ou seja descontinuado.
2. **Unicidade no espaço**: dentro do seu espaço, um identificador individualiza exatamente um elemento, em qualquer instante e para sempre.
3. **Ausência de significado arquitetural** (princípio obrigatório 2 — CTO, 21/07/2026): nenhum identificador possui significado arquitetural além de individualizar permanentemente um elemento. Convenções que embutam elementos mnemônicos são admissíveis como escolha do espaço, mas nenhuma decisão organizacional pode depender da interpretação da estrutura interna de um identificador — o significado dos elementos reside nos registros dos mecanismos, nunca nos identificadores.
4. **Independência do elemento** (ADR-011, princípio 2): o identificador não varia quando o elemento evolui, muda de estado, de conteúdo ou de forma.
5. **Opacidade** (princípio arquitetural — revisão do CTO, 21/07/2026): **a identidade organizacional é opaca.** Nenhum consumidor pode inferir características do elemento identificado a partir da estrutura do identificador; toda informação organizacional é obtida exclusivamente pelos mecanismos responsáveis pelo respectivo espaço de identificação. Este princípio complementa a ausência de significado arquitetural (A2.3) e protege a evolução futura das convenções de identificação.

### A3 — Autonomia e coexistência de múltiplos espaços

* **Cada espaço de identificação possui autonomia arquitetural** (princípio obrigatório 1): a convenção do espaço — formato, prefixo, numeração, geração — é definida pela sua arquitetura específica, sem subordinação à convenção de qualquer outro espaço.
* **Convenções diferentes coexistem sem perda de consistência organizacional** (princípio obrigatório 3): a consistência global não decorre de uniformidade de formato, e sim da soma de duas garantias — as propriedades de A2 dentro de cada espaço e a referência qualificada entre espaços (A5).
* **Nenhum espaço depende da estrutura interna dos identificadores de outro** (ADR-008): alterações na convenção futura de um espaço nunca exigem alteração em outro.

### A4 — Responsabilidades arquiteturais da identificação

| Responsável | Responsabilidade |
|-------------|------------------|
| Esta arquitetura (geral) | Definir as regras válidas para todos os espaços: princípios dos identificadores (A2), autonomia e coexistência (A3), interoperabilidade (A5) e extensão (A6) |
| Arquitetura específica de cada espaço (futuras ARQs) | Definir a convenção do espaço — formato, prefixo, numeração e geração — em conformidade com esta arquitetura e com a ADR-011 |
| Responsável pelo espaço (mecanismo ou governança documental) | Emitir identificadores e garantir, no seu espaço, permanência e unicidade |
| Mecanismos consumidores | Usar identidades sem assumir nem transferir responsabilidades: identificar não é registrar, resolver, evoluir nem admitir (ADR-011, princípio 3) |

### A5 — Interoperabilidade entre espaços de identificação

* Toda referência entre espaços é **referência qualificada**: indica inequivocamente o espaço de destino e o identificador dentro dele. A forma de qualificação é matéria das arquiteturas específicas; a regra geral é que a dupla espaço + identificador seja sempre determinável.
* **A interoperabilidade nunca depende da igualdade de formatos ou convenções** (princípio obrigatório 4): dois espaços interoperam por referência qualificada mesmo com convenções completamente distintas.
* Quem referencia **nunca interpreta a estrutura interna** do identificador referenciado (A2.3; ADR-008); a determinação do elemento correspondente cabe exclusivamente ao responsável pelo espaço de destino.
* Correspondências entre elementos de espaços diferentes, quando necessárias, são conteúdo dos registros dos mecanismos — nunca propriedade embutida nos identificadores.

### A6 — Extensão da identificação organizacional

**Novos espaços de identificação são criados sem alteração da arquitetura existente** (reuso do padrão de extensibilidade — ARQ-001, A5):

* A criação de um espaço ocorre pela arquitetura específica que o define (A1), herdando integralmente as regras gerais desta arquitetura.
* A criação de um espaço não altera espaços existentes, não invalida identificadores emitidos e não exige revisão desta arquitetura.
* Identificações vigentes anteriores a esta arquitetura (como o espaço documental PREFIXO-nnn) permanecem válidas como estão, sem efeito retroativo (ADR-011, Decisão 4).

### A7 — Estabilidade das referências

**A arquitetura de identificação deverá preservar a estabilidade das referências** (decisão arquitetural — revisão do CTO, 21/07/2026).

Mudanças futuras nas convenções internas de um espaço de identificação não poderão invalidar referências organizacionais previamente estabelecidas. Uma referência qualificada (A5), uma vez estabelecida, permanece resolúvel ao seu elemento pela vida da organização — consequência conjunta da permanência (A2.1) e desta decisão. Esta decisão protege a continuidade arquitetural da organização; não define mecanismos de resolução, estratégias de compatibilidade nem migração.

### A8 — Rastreabilidade arquitetural

| Elemento arquitetural | Satisfaz |
|-----------------------|----------|
| Espaços como unidade de organização, com responsável único (A1) | ADR-008 (independência); ADR-011 D2 (disciplina dos espaços) |
| Permanência e unicidade (A2.1, A2.2) | ADR-011, princípios 1 e 5 |
| Ausência de significado arquitetural (A2.3) | Princípio obrigatório 2 desta autorização (CTO, 21/07/2026) |
| Independência do elemento (A2.4) | ADR-011, princípio 2 |
| Autonomia dos espaços (A3) | Princípio obrigatório 1; ADR-008 |
| Coexistência de convenções (A3) | Princípio obrigatório 3 |
| Divisão de responsabilidades (A4) | ADR-011, princípios 3 e 4; D2 |
| Opacidade da identidade (A2.5) | Revisão do CTO da ARQ-002 (21/07/2026) |
| Referência qualificada e interoperabilidade sem igualdade de formatos (A5) | Princípio obrigatório 4; ADR-008 |
| Estabilidade das referências (A7) | Revisão do CTO da ARQ-002 (21/07/2026) |
| Extensão sem alteração do existente (A6) | Diretriz desta autorização; ADR-011 princípio 4; padrão ARQ-001 A5 |
| Neutralidade tecnológica (toda a arquitetura) | ADR-011, Decisão 7 |

## O que esta arquitetura não define

* Prefixos específicos, formatos concretos de identificadores, políticas de numeração e algoritmos de geração — matéria das arquiteturas específicas de cada espaço.
* Regras particulares para qualquer mecanismo específico — inclusive a identificação dos conceitos organizacionais, que será objeto de arquitetura própria fundada nesta (o documento que extinguirá a Lacuna Arquitetural Bloqueante da ANL-003).
* Implementação técnica, persistência, distribuição ou resolução técnica de identificadores — neutralidade tecnológica (ADR-011, Decisão 7).
* Mecanismos de resolução, estratégias de compatibilidade e migração relativos à estabilidade das referências (A7).
* Revisão de identificadores já emitidos — sem efeito retroativo (A6).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; ADR-008 v1.0; ADR-011 v1.0 |
| Deriva de | ADR-011 (capacidade de Identidade Organizacional — primeira arquitetura específica da capacidade) |
| Origem | Deliberação arquitetural do CTO (21/07/2026), com quatro princípios obrigatórios; ANL-003 v1.0 (Lacuna Arquitetural Bloqueante) |
| Gera | Arquiteturas específicas de identificação por espaço (futuras ARQs), inclusive a dos conceitos organizacionais |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação, incorporando os quatro princípios obrigatórios do CTO | Deliberação do CTO após a ADR-011 — arquitetura geral de identificação | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionados o princípio de opacidade da identidade (A2.5 — nenhum consumidor infere características do elemento pela estrutura do identificador) e a decisão A7 — estabilidade das referências (mudanças de convenção não invalidam referências estabelecidas) | Revisão do CTO — proteger a evolução das convenções e a continuidade arquitetural | **Aprovado — arquitetura geral de identificação em vigor** |

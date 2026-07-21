# REQ-005 — Recuperação contextual do conhecimento organizacional

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-04 — Gestão do Conhecimento

## Enunciado

O CEO deverá determinar e entregar, para qualquer contexto de trabalho sob sua coordenação, o conjunto de itens de conhecimento registrados aplicáveis a esse contexto — sob demanda e proativamente — referenciando cada item por seu identificador permanente e informando seu estado de validade.

**Definição** (CTO, 21/07/2026): ***Contexto de Trabalho*: unidade identificável de execução ou decisão sob governança do CEO, dentro da qual conhecimentos organizacionais podem ser registrados, recuperados ou utilizados.**

*Nota explicativa (sem força normativa):* exemplos de contexto de trabalho incluem um projeto, uma tarefa, uma decisão em elaboração e interações com o usuário ou entre agentes.

*Nota de governança:* esta definição reside provisoriamente neste requisito. Não existe ainda mecanismo oficial para conceitos organizacionais; a necessidade está registrada como oportunidade de evolução da governança em `docs/learning/2026-07-21-conceitos-organizacionais.md`.

## Tipo

Funcional; alto nível.

## Justificativa

Conhecimento que não é reencontrado no momento certo tem valor zero (ANL-001 §1): a promessa da CAP-04 — cada projeto mais rápido que o anterior (VIS-001 §4) — realiza-se na recuperação, não no acúmulo. A ordem oficial da ANL-001 (v1.1) coloca este requisito imediatamente após o registro estruturado exatamente por isso: a utilidade do conhecimento depende primeiro da capacidade de recuperá-lo corretamente. Responsabilidade única: **determinar e entregar o conhecimento aplicável a um contexto**; o que é um item (REQ-004), quanto ele ainda vale (Grupo D) e como sobrevive (Grupo B) são de outros requisitos.

## Critérios de aceitação

* Dado um contexto de trabalho identificado, o conjunto de itens de conhecimento aplicáveis é determinável a partir das propriedades registradas dos itens (classificação, origem e relacionamentos — REQ-004); a determinação não depende de conhecimento não registrado.
* Qualquer participante (usuário ou agente) pode solicitar o conhecimento aplicável a um contexto de trabalho e recebe o conjunto determinado (recuperação sob demanda).
* Ao iniciar ou coordenar um contexto de trabalho, o CEO determina se existe conhecimento aplicável e o disponibiliza sem necessidade de solicitação (recuperação proativa), limitando a entrega ao necessário para o participante avançar com segurança (CON-001, Art. 9º, princípio 1).
* Toda entrega referencia os itens exclusivamente por seus identificadores permanentes (REQ-004) e informa o estado de validade registrado de cada item entregue.
* Nenhum conteúdo sem registro no acervo estruturado (REQ-004) é entregue como conhecimento organizacional.
* Quando não existe conhecimento aplicável ao contexto, a resposta declara isso explicitamente — ausência nunca é silêncio nem substituída por itens não aplicáveis (CON-001, Art. 9º, princípio 8).

## Fora do escopo

* Regras de exclusão ou despriorização por invalidez, obsolescência ou deduplicação — Grupo D (Curadoria); este requisito apenas **informa** o estado de validade registrado.
* Preservação, integridade e versionamento do acervo — Grupo B (Preservação).
* Estrutura dos itens, identificação e classificação — REQ-004 (Grupo A).
* Recuperação de registros históricos de fatos, decisões e eventos — CAP-05 (Memória Organizacional).
* Uso pedagógico do conhecimento recuperado — CAP-12 (Desenvolvimento do Usuário), consumidora deste requisito.
* Métodos, algoritmos de busca, ranqueamento, indexação ou qualquer mecanismo de determinação de aplicabilidade — decisões de arquitetura (ADRs futuros).

## Dependências

* **REQ-004** — a recuperação opera exclusivamente sobre itens registrados, seus identificadores permanentes, classificação, origem, relacionamentos e estado de validade.

## Riscos e incertezas

* **Ruído proativo:** entrega proativa excessiva vira interrupção e fere o princípio 1. Mitigação: o critério proativo limita a entrega ao necessário para avançar com segurança; a depuração fina do acervo virá com o Grupo D.
* **Qualidade dependente da alimentação:** a recuperação determinada por classificação, origem e relacionamentos herda a qualidade do registro — acervo mal classificado recupera mal. Mitigação: risco estrutural aceito e monitorado; reforça a importância do Grupo D na ordem oficial.
* **Janela sem curadoria:** até o Grupo D, itens obsoletos podem ser recuperados; o estado de validade informado em cada entrega permite ao consumidor ponderar o uso — limitação declarada (princípio 8).
* **Definições conceituais distribuídas:** "decisão sob governança" (REQ-003), "item de conhecimento" (ANL-001/REQ-004) e "Contexto de Trabalho" (este REQ) vivem em documentos distintos; sem um mecanismo central de conceitos, há risco de divergência futura. Mitigação provisória: definição oficial do CTO registrada aqui; evolução da governança registrada em `docs/learning/2026-07-21-conceitos-organizacionais.md`.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 — Gestão do Conhecimento |
| Norma superior | CON-001 Art. 3º, 4º (pilar Conhecimento), 9º (princípios 1 e 8); VIS-001 §4 |
| Origem | ANL-001 v1.1 (Grupo C; ordem oficial redefinida pelo CTO em 21/07/2026); autorização do CTO com gate aberto (ADR-006) |
| Dependências | REQ-004 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Nova ordem da CAP-04 (A → C → D → B) e autorização do CTO para o Grupo C | Aprovado com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Definição de "Contexto de Trabalho" substituída pela oficial do CTO; exemplos rebaixados a nota explicativa sem força normativa; análise metodológica registrou a ausência de mecanismo para conceitos organizacionais | Revisão do CTO | **Aprovado — segundo requisito da CAP-04** |

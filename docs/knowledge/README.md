# Índice Oficial do Acervo de Conhecimento

> **Status: Operacional (estrutura + modelo) — Gates E1 e E2 do IMP-004 Homologados (CTO, 23/07/2026). E3 não iniciada.**
> Norma superior: CON-001 v1.0; REQ-004, REQ-005, REQ-014, REQ-015 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; IMP-004 v1.0; VAL-004 v1.0.
> Este índice é a **porta de entrada** e a **fonte de estado** do acervo de conhecimento organizacional (ARQ-006 A1; K1).
> **Um item de conhecimento existe oficialmente no acervo se, e somente se, consta deste índice** com a respectiva entrada.
> O índice **não** substitui o conteúdo da entrada; em divergência de **estado** (pertença, aptidão refletida), prevalece o índice após correção rastreável (K1).
> **Estado pós-E2:** infraestrutura documental completa para registro futuro; acervo **operacionalmente vazio** — **zero** itens `KNW-*`; **zero** identificadores emitidos. O acervo está **apto a emitir** `KNW-nnn` no ato de registro futuro — emissão **não** iniciada neste IMP (Critérios de Sucesso / Limites do IMP-004).

---

## 1. O que é

A relação oficial dos **itens de conhecimento** (CNC-002) do Acervo de Conhecimento da CAP-04. Sede documental: `docs/knowledge/`.

Este acervo administra conhecimento **reutilizável e independente de decisão específica**. Não é Memória Organizacional (CAP-05), não é autoridade semântica de conceitos, não é registro canônico de normas (Opção 2c; K7).

---

## 2. Princípios observáveis (ARQ-006 K1–K8)

| ID | Princípio | Enunciado operacional neste índice |
|----|-----------|-------------------------------------|
| **K1** | Fonte canônica única do acervo | Este índice + as entradas sob `docs/knowledge/` constituem o acervo oficial; espelhos são subordinados |
| **K2** | Identidade permanente do item | Todo item registrado possui identificador `KNW-nnn` permanente (ARQ-007) — nunca renumerado nem reutilizado |
| **K3** | Separação aptidão × identidade | Aptidão (apto / não apto) não se confunde com identidade nem com existência histórica |
| **K4** | Separação conteúdo versionado × identidade | Nova versão de conteúdo **não** constitui novo item nem novo identificador |
| **K5** | Recuperação sobre o registrado | Só se entrega como conhecimento organizacional o que consta deste acervo |
| **K6** | Independência tecnológica | Obrigações do acervo não dependem de fornecedor, ferramenta ou protocolo específico |
| **K7** | Fronteira de capacidade | Itens de conhecimento ≠ registros históricos CAP-05; ≠ conceitos CNC; ≠ normas CAP-01 |
| **K8** | Reutilizar antes de criar | Forma índice + entrada por unidade, alinhada aos padrões já consolidados (ARQ-001/004) |

---

## 3. Regras mínimas do acervo

* **Sede:** `docs/knowledge/`.
* **Índice:** este `README.md` — fonte de estado (pertença e aptidão refletida).
* **Entrada:** cada item possui documento próprio permanente sob esta pasta, conforme [`TEMPLATE-ITEM-CONHECIMENTO.md`](TEMPLATE-ITEM-CONHECIMENTO.md) (ARQ-006 A2).
* **Identificação:** espaço `KNW-nnn` (ARQ-007); ver §5.
* **Classificação:** obrigatória para todo item `KNW`, a partir do conjunto da §4 (sem hierarquia entre categorias).
* **Aptidão:** categoria lógica **apto** ou **não apto** (REQ-014); detalhe operacional na entrada e no índice quando houver itens.
* **Pertença:** ausência neste índice = item **não** existe oficialmente no acervo.
* **Artefato deliberativo:** a decisão do conjunto de classificações permanece em [`decisao-conjunto-inicial-de-classificacoes.md`](decisao-conjunto-inicial-de-classificacoes.md); este índice **materializa** o conjunto, **não** o delibera.

---

## 4. Conjunto inicial de classificações (materializado)

Fonte deliberativa: [`decisao-conjunto-inicial-de-classificacoes.md`](decisao-conjunto-inicial-de-classificacoes.md).

Diretrizes materializadas (sem reabrir mérito):

* conjunto inicial mínimo viável;
* expansão futura conforme ARQ-006 A8;
* **nenhuma** categoria possui hierarquia sobre outra;
* classificação obrigatória para todo item `KNW`;
* principal / secundárias = regras futuras (reserva no template; **não** inventadas neste IMP).

| # | Classificação |
|---|---------------|
| 1 | Arquitetura |
| 2 | Requisitos |
| 3 | Análises |
| 4 | Decisões Arquiteturais (ADR) |
| 5 | Implementação |
| 6 | Validação |
| 7 | Governança |
| 8 | Operação |
| 9 | Referências Externas |
| 10 | Conhecimento Geral |

Este elenco é o **único** autorizado para classificação de itens até nova deliberação (A8). Campos de classificação no template ⊆ este conjunto.

---

## 5. Regras de emissão e vínculo índice ⇔ identificador (ARQ-007)

Convenção: **`KNW-nnn`** (`nnn` sequencial a partir de `001`).

| Regra | Enunciado |
|-------|-----------|
| Um item, um ID | Cada item possui exatamente um identificador permanente, atribuído no ato de registro |
| Imutabilidade | Uma vez emitido, o ID nunca é alterado, renumerado ou reatribuído |
| Não reutilização | Identificador emitido pertence para sempre ao seu item |
| Emissão no registro | ID nasce somente no ato de registro de item no acervo oficial; rascunhos/propostas não registrados **não** consomem número |
| Determinismo | Próximo ID = sucessor do último emitido no índice |
| Índice ⇔ espaço | Um identificador existe no espaço se, e somente se, consta deste índice com a respectiva entrada |
| Opacidade | Classificação, aptidão e atributos **não** fazem parte do identificador |
| Aptidão ≠ identidade | Mudança para **não apto** preserva o mesmo `KNW-nnn` (K3; ARQ-007 A4) |
| Versão ≠ novo ID | Nova versão de conteúdo **não** gera novo identificador (K4) |
| Recuperação | Determinação de aplicabilidade usa apenas propriedades registradas; item **não apto** não é entregue como válido (REQ-005; REQ-014) |

**Declaração E2:** o acervo está **apto a emitir** identificadores no registro futuro. **Identificadores emitidos nesta etapa: 0.**

---

## 6. Itens registrados

> **Nenhuma entrada.** Acervo operacionalmente vazio após a E2 (conforme IMP-004 — zero `KNW` no ciclo de infraestrutura).

| Identificador | Designação / resumo | Classificação(ões) | Origem | Aptidão | Entrada |
|---------------|---------------------|--------------------|--------|---------|---------|
| — | — | — | — | — | — |

*Contagem de itens `KNW` no índice: **0**.*  
*Contagem de arquivos `KNW-*.md` sob `docs/knowledge/`: **0**.*

---

## 7. Artefatos da sede (não são itens KNW)

| Artefato | Natureza | Nota |
|----------|----------|------|
| [`README.md`](README.md) | Índice oficial (este documento) | Fonte de estado |
| [`decisao-conjunto-inicial-de-classificacoes.md`](decisao-conjunto-inicial-de-classificacoes.md) | Decisão deliberativa (pré-condição) | Não é item de conhecimento |
| [`TEMPLATE-ITEM-CONHECIMENTO.md`](TEMPLATE-ITEM-CONHECIMENTO.md) | Modelo institucional de entrada (E2) | Não consome `KNW-nnn` |

---

## 8. Memória Organizacional — Gate E1 (homologado)

| Campo | Registro |
|-------|----------|
| Quem | CTO autorizou a abertura da E1; Engenheiro (Cursor) executou |
| Quando | 23/07/2026 |
| Por quê | Materializar a estrutura documental do Acervo de Conhecimento (IMP-004 E1; ARQ-006 A1) |
| Baseado em quê | Autorização oficial do CTO — abertura E1; IMP-004 v1.0; ARQ-006/007; VAL-004 |
| Resultado | Índice oficial criado; classificações materializadas; zero `KNW`; Gate E1 homologado e publicado (`be02970`) |

---

## 9. Memória Organizacional — Gate E2 (execução)

| Campo | Registro |
|-------|----------|
| Quem | CTO autorizou a abertura da E2; Engenheiro (Cursor) executou |
| Quando | 23/07/2026 |
| Por quê | Materializar o template institucional (ARQ-006 A2) e documentar regras de emissão/`KNW-nnn` (ARQ-007), sem emitir itens |
| Baseado em quê | Autorização pós-E1; IMP-004 E2; VAL-004 V-E2-*; ARQ-006 A2; ARQ-007 |
| Resultado | Template criado; regras documentadas no índice; acervo apto a emitir no futuro; **zero** `KNW` emitidos; Gate E2 **homologado** na Deliberação Extraordinária (MILESTONE 01); E3 não iniciada |

---

## 10. Rastreabilidade

- Capacidade: CAP-04 — Gestão do Conhecimento.
- Arquitetura: ARQ-006 (A1, A2, K1–K8); ARQ-007 (A1–A8 aplicáveis às regras).
- Implementação: IMP-004 — Etapas E1 (homologada) e E2 (em homologação).
- Validação (plano): VAL-004 — V-E1-* (homologados na E1); V-E2-01…07 (esta etapa).
- Classificações: decisão em `decisao-conjunto-inicial-de-classificacoes.md`.

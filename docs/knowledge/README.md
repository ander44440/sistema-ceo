# Índice Oficial do Acervo de Conhecimento

> **Status: Operacional (estrutura) — Gate E1 do IMP-004 Homologado (CTO, 23/07/2026).**
> Norma superior: CON-001 v1.0; REQ-004, REQ-005, REQ-014, REQ-015 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; IMP-004 v1.0; VAL-004 v1.0.
> Este índice é a **porta de entrada** e a **fonte de estado** do acervo de conhecimento organizacional (ARQ-006 A1; K1).
> **Um item de conhecimento existe oficialmente no acervo se, e somente se, consta deste índice** com a respectiva entrada.
> O índice **não** substitui o conteúdo da entrada; em divergência de **estado** (pertença, aptidão refletida), prevalece o índice após correção rastreável (K1).
> **Estado E1:** acervo **operacionalmente vazio** — zero itens `KNW-*` registrados; zero identificadores emitidos. Conteúdo de conhecimento **não** produzido nesta etapa.
> Regras detalhadas de emissão `KNW-nnn` e o template institucional de entrada são objeto da **E2** (IMP-004) — não antecipados aqui além do necessário à estrutura.

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

## 3. Regras mínimas do acervo (E1)

* **Sede:** `docs/knowledge/`.
* **Índice:** este `README.md` — fonte de estado (pertença e aptidão refletida).
* **Entrada:** cada item futuro terá documento próprio permanente sob esta pasta (ARQ-006 A1/A2); modelo institucional = E2.
* **Identificação:** espaço `KNW-nnn` (ARQ-007); emissão **somente** no ato de registro de item — **não** iniciada na E1.
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
* principal / secundárias = regras futuras (não definidas na E1).

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

Este elenco é o **único** autorizado para classificação de itens até nova deliberação (A8).

---

## 5. Itens registrados

> **Nenhuma entrada.** Acervo operacionalmente vazio após a E1.

| Identificador | Designação / resumo | Classificação(ões) | Origem | Aptidão | Entrada |
|---------------|---------------------|--------------------|--------|---------|---------|
| — | — | — | — | — | — |

*Contagem de itens `KNW` no índice: **0**.*  
*Contagem de arquivos `KNW-*.md` sob `docs/knowledge/`: **0** (verificação E1).*

---

## 6. Artefatos da sede (não são itens KNW)

| Artefato | Natureza | Nota |
|----------|----------|------|
| [`README.md`](README.md) | Índice oficial (este documento) | Fonte de estado |
| [`decisao-conjunto-inicial-de-classificacoes.md`](decisao-conjunto-inicial-de-classificacoes.md) | Decisão deliberativa (pré-condição) | Não é item de conhecimento |

---

## 7. Memória Organizacional — Gate E1 (execução)

| Campo | Registro |
|-------|----------|
| Quem | CTO autorizou a abertura da E1; Engenheiro (Cursor) executou |
| Quando | 23/07/2026 |
| Por quê | Materializar a estrutura documental do Acervo de Conhecimento (IMP-004 E1; ARQ-006 A1), com classificações refletidas e acervo vazio de itens |
| Baseado em quê | Autorização oficial do CTO — abertura E1; IMP-004 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; decisão de classificações; VAL-004 v1.0 (checklist E1) |
| Resultado | Índice oficial criado; classificações materializadas; zero `KNW` emitidos; Gate E1 **homologado**; publicado na branch principal |

---

## 8. Rastreabilidade

- Capacidade: CAP-04 — Gestão do Conhecimento.
- Arquitetura: ARQ-006 (A1, K1–K8); ARQ-007 (espaço reservado; emissão na E2+).
- Implementação: IMP-004 — Etapa E1.
- Validação (plano): VAL-004 — itens V-E1-01…07.
- Classificações: decisão em `decisao-conjunto-inicial-de-classificacoes.md`.

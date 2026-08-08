# REQ-070 — Fonte oficial única do conhecimento organizacional

> **Status:** Aprovado · **congelado (Baseline CAP-04)** — IMP-070 Homologada 07/08/2026  
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento
> **Implementação:** IMP-070-B1 **Homologado / Encerrado** — Baseline.

## Enunciado

O CEO deverá tratar como fonte oficial de conhecimento organizacional exclusivamente o Acervo Oficial (índice + itens identificados), de modo que projecções de leitura — incluindo briefings derivados — sejam subordinadas ao acervo e que a ausência de item apto aplicável seja declarada como lacuna, sem inventar factos.

## Tipo

Funcional; alto nível.

## Justificativa

A ARQ-031 (D1) e a ARQ-006 (K1) estabelecem um único acervo canónico. O inventário de 07/08/2026 mostrou que o runtime depende de Briefing Curado estático — anti-padrão face à Capacidade. Este requisito decompõe a **Fonte Oficial** da CAP-04 / Camada sem alterar arquitectura.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-070-1** | Um conhecimento só conta como património oficial se constar do índice do Acervo com identificador permanente do espaço do acervo. | Inspecção: dado um enunciado apresentado como oficial, existe linha no índice com ID permanente e referência à entrada? Sim = pass; Não = fail. |
| **CA-070-2** | Se uma projecção de leitura (briefing, resumo, espelho) divergir do Acervo, a verdade vigente é a do Acervo. | Cenário: projecção afirma F; Acervo apto afirma ¬F ou omite F. A decisão/consumo trata o Acervo como vigente? Sim = pass. |
| **CA-070-3** | Conhecimento estratégico de COA admitido como património existe como item(ns) com âmbito de contexto e ID — não como texto órfão sem item. | Inspecção: para cada facto de COA tratado como oficial, existe item com ID e âmbito? Sim = pass. |
| **CA-070-4** | Sem item **apto** aplicável, a resposta declara lacuna explícita e não apresenta facto inventado como conhecimento organizacional válido. | Cenário de pedido sem item apto: a saída contém declaração de lacuna e zero factos novos sem ID? Sim = pass. |

## Fora do escopo

* Forma lógica do índice/entrada e emissão de identificadores — ARQ-006, ARQ-007; REQ-004.
* Recuperação contextual e porta de entrega à EIC — REQ-005; **REQ-072**.
* Curadoria de aptidão e cadeia de promoção — REQ-014; **REQ-071**; **REQ-074**.
* Limites do que pode ser admitido — **REQ-073**.
* Substituição técnica do Briefing no código — IMP futura.

## Dependências

* REQ-004 (registo estruturado); ARQ-006; ARQ-007; ARQ-031 D1; CNC-002.

## Riscos e incertezas

* Coexistência temporária do Briefing estático até IMP pode confundir operadores — mitigação: este REQ define a hierarquia de verdade; migração é IMP.
* Ambiguidade entre facto de conversa e item oficial — mitigação: só o índice define pertença (CA-070-1).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-04** — Gestão do Conhecimento |
| Bloco ARQ-031 | **D1 — Fonte Oficial** |
| Norma superior | CON-001 Art. 4º (pilar Conhecimento); VIS-001 §4; ADR-002 Decisão 5 |
| Origem | Despacho CTO 07/08/2026 — redacção REQs CAP-04 Camada; ARQ-031 Homologada |
| Decisões derivadas | — |
| Implementação | **IMP-070** (ABERTA) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Criação — D1 | Autorização CTO — decomposição CAP-04 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CA-070-1…4 verificáveis | Despacho CTO — pacote aprovado; pré-condição pré-IMP | **Aprovado** |

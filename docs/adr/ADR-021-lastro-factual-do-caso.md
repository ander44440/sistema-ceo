# ADR-021 — Lastro Factual do Caso como fonte canónica de factos assertados

> **Status:** Em análise (CTO) — v0.2  
> **Versão:** 0.2 — 13/09/2026  
> **Não homologa** implementação. **Não** abre IMP. **Não** altera código.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | Direção e hierarquia do contrato aprovadas pelo Usuário; Engenheiro (Cursor) formaliza; CTO revisa |
| Quando | 13/09/2026 |
| Por quê | A bateria ValeVerde provou que «registar» confirma o turno sem lastro estruturado reutilizável; HFC/transcript/MO/CSC/MRE não são autoridade de factos de caso; é preciso hierarquia normativa e writer único |
| Baseado em quê | Mapeamento arquitetural do lastro factual; auditoria ValeVerde (T01–T09); hierarquia LFC N1–N3 + autoridade única de escrita (despacho Usuário); CON-001 Art. 9º; ADR-015; REQ-037/039; REQ-087; domínio MO = decisão |
| Resultado | ADR-021 v0.2 + REQ-092 v0.2 (Em análise). Zero código. Zero commit neste acto |

---

## 1. Contexto

O CEO captura factos de um caso (ex.: ValeVerde) como **texto de mensagem**. A resposta restrita pode **ecoar** “N facto(s) guardado(s)” a partir do turno actual sem escrever um objecto recuperável. Turnos seguintes re-parseiam o fio; a recuperação do **conjunto** falha de forma recorrente.

HFC = prova conversacional. Memória Confiável = **decisões** Art. 8º. CSC = lastro operacional. MRE consome lastro do turno / LFC sob **ADR-022** — **não escreve**. Nenhum destes é a fonte canónica de **factos assertados e vigentes do caso**.

---

## 2. Problema

| # | Problema |
|---|----------|
| P1 | «Guardado» na prosa ≠ escrita em autoridade factual |
| P2 | Recuperação multi-facto depende de re-parse frágil do histórico de turno |
| P3 | Sobreposição semântica de «lastro» (CSC ≠ MRE ≠ HFC ≠ MO) |
| P4 | Sem contrato hierárquico, IMP cria stores/writers ad hoc com regras próprias |
| P5 | Superfícies paralelas (Conversa, Centro, futuros módulos) podem divergir na escrita |

---

## 3. Decisão

### 3.1 Fonte canónica (preservada)

1. Institui-se o **Lastro Factual do Caso (LFC)** como **única fonte canónica** dos factos **assertados pelo utilizador** e **vigentes** do caso (inclui correcções explícitas).
2. O LFC **não** substitui HFC, transcript UI, MO, CSC nem o pipeline MRE.
3. **«Guardado»** (e equivalentes) **só** após escrita bem-sucedida no LFC (REQ-092).
4. Inferências / recomendações / urgências / conclusões do CEO **nunca** viram facto activo no LFC.
5. Meio de persistência e módulos → ARQ/IMP futuras; esta ADR fixa **contrato, hierarquia e precedência**.

### 3.2 Hierarquia normativa do contrato LFC

Aplica-se por ordem de precedência interna (nível superior vence conflito):

**NÍVEL 1 — AUTORIDADE**

1. Escopo e identidade do caso: **`coaId` + `casoId`**.
2. Autoridade de escrita: criação/correção **somente** pelo utilizador ou por correção **explicitamente solicitada**.
3. Verdade factual: inferência do CEO **nunca** vira facto activo.

**NÍVEL 2 — INTEGRIDADE**

4. Contradição/correção: **sem** correção explícita, **não** auto-resolver; **solicitar esclarecimento**.
5. Reinício do mesmo nome: **novo `casoId`**; **nunca** sobrescrever silenciosamente.

**NÍVEL 3 — OPERAÇÃO**

6. Múltiplos casos **podem coexistir** no mesmo COA.
7. Conversa e Centro de Situação **acedem ao mesmo LFC** via `coaId` + `casoId`.
8. Retenção: **arquivamento por padrão**; exclusão **somente** por ação explícita e governada.

### 3.3 Autoridade única de escrita (obrigatória)

9. Todas as superfícies que escrevem no mesmo LFC **devem** usar o **mesmo contrato / writer canónico**.
10. **Proibido** existir escritores paralelos com regras próprias de autoridade (Conversa, Centro, MRE, CSC, resposta restrita, jobs, etc.).
11. MRE **consome** LFC; **não escreve**. CSC e MO **não escrevem** LFC.
12. **Gatilho, precedência e limites do consumo MRE** → [ADR-022](ADR-022-consumo-lfc-pelo-mre.md) (não reabrir nesta ADR).
13. **Deliberação com base factual restrita (LFC × HFC)** → [ADR-023](ADR-023-deliberacao-base-factual-restrita.md) (não reabrir nesta ADR).

---

## 4. Alternativas rejeitadas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Usar HFC como DB de factos | Prova imutável ≠ estado vigente corrigível |
| Usar Memória Confiável | Só `decisao` (Art. 8º) |
| Usar CSC | Lastro operacional do sistema |
| Re-parse do fio como autoridade | Falhou nas baterias |
| Writers por superfície | Viola §3.3 — divergência de autoridade |
| Auto-resolver contraditórios | Viola Nível 2 / regra 4 |
| Sobrescrever caso pelo mesmo nome | Viola Nível 2 / regra 5 |

---

## 5. Consequências

- REQ-092 materializa a hierarquia e o writer único em regras verificáveis.
- **ADR-022** fecha o consumo LFC→MRE (gatilho / não-consumo / ambiguidade / `solicitar_dados`).
- **ADR-023** fecha deliberação com base factual restrita (HFC = prova residual ≠ objecto deliberativo sob restrição explícita).
- IMP: writer canónico + reader(s); wiring restrito (IMP-092.3); consumo MRE (IMP-092.4); **RFR = IMP futura** (não aberta por ADR-021).
- Resposta restrita = gate de saída, não autoridade de memória nem writer paralelo.
- Aceitação ValeVerde (T01–T09) refere LFC, não eco do turno.

---

## 6. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 Art. 9º; ADR-015; ADR-006 |
| Capacidade | CAP-03 — Gestão de Projetos (âmbito COA); CAP-05 consome |
| REQ | REQ-092 |
| Consumo MRE | ADR-022; REQ-092 §11; ARQ-092 §13.1 |
| Base factual restrita | **ADR-023**; REQ-092 §12; ARQ-092 §13.2 |
| Vizinhos | REQ-087 (HFC); REQ-037/039 (COA); REQ-059 (CSC); MO Art. 8º |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 13/09/2026 | Engenheiro (Cursor) | Criação — contrato LFC | Direção aprovada pelo Usuário | Em análise CTO |
| 0.2 | 13/09/2026 | Engenheiro (Cursor) | Hierarquia N1–N3 + writer único | Despacho Usuário — fechar ambiguidades de integridade/operação | Em análise CTO |
| 0.2.1 | 13/09/2026 | Engenheiro (Cursor) | Ponteiro normativo §3.3#12 → ADR-022 | Fecho consumo MRE sem reabrir hierarquia | Cross-ref apenas |
| 0.2.2 | 13/09/2026 | Engenheiro (Cursor) | Ponteiro → ADR-023 (RFR) | Formalização LFC×HFC sem reabrir hierarquia | Cross-ref apenas |

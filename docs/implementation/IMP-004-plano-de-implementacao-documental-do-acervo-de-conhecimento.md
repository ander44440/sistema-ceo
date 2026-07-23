# IMP-004 — Plano de Implementação Documental do Acervo de Conhecimento (CAP-04)

> **Status: Homologado — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo IMP (ADR-012).
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; CAP-001 (CAP-04); REQ-004, REQ-005, REQ-014, REQ-015 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; Opção 2c; ANL-005 (Batch Gates — recomendação operacional).
> Referência de planejamento: [`docs/analysis/plano-pre-imp-cap-04-gestao-do-conhecimento.md`](../analysis/plano-pre-imp-cap-04-gestao-do-conhecimento.md) (pré-IMP homologado).
> Pré-condição de classificações: [`docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md`](../knowledge/decisao-conjunto-inicial-de-classificacoes.md) (decisão técnica do CTO — aguarda homologação institucional).
> Este documento **planeja**; **não** executa. Não cria requisitos, não altera arquiteturas, não define código, tecnologia ou linguagem. **Implementação fechada até autorização explícita do CTO para abertura da E1.**

---

## 1. Objeto e premissas

Materializar documentalmente o Acervo de Conhecimento da CAP-04 sob `docs/knowledge/`, conforme ARQ-006 e ARQ-007 homologadas, preservando a fronteira documental da Fase 1 e a Opção 2c (sem integrações profundas CAP-05/06/12 neste ciclo).

Premissas:

1. REQ-004/005/014/015 e ARQ-006/007 homologados; fase ARQ da CAP-04 encerrada.
2. Implementação **exclusivamente documental**.
3. Acervo pode iniciar **operacionalmente vazio** (sem itens `KNW-nnn`) — estrutura ≠ conteúdo.
4. Emissão de `KNW-nnn` somente no ato de registro de item (ARQ-007); este IMP **não** inventa itens.
5. **Nenhuma etapa produz efeitos organizacionais permanentes antes do respectivo gate.**
6. Idempotência documental: reexecução de etapa homologada sem mudança deliberada = sem alterações adicionais.
7. O conjunto inicial de classificações é deliberação **fora** das etapas Ei; a Implementação apenas **materializa** o conjunto já definido.
8. O IMP só executa E1 após: (a) homologação institucional das classificações; (b) homologação deste IMP; (c) autorização expressa de abertura da E1.

---

## 2. Objetivo Institucional

O IMP-004 materializa **apenas a infraestrutura documental** do Acervo de Conhecimento (estrutura, índice, template institucional e regras documentadas), conforme ARQ-006 e ARQ-007.

Durante a execução deste IMP:

* **não** se produz conhecimento operacional;
* **não** se emite registro `KNW` algum.

A aptidão futura do acervo a receber e identificar itens permanece preparada pelas regras documentadas; a emissão e a operação efetivas ficam fora deste plano.

---

## 3. Critérios de Sucesso do IMP

O IMP-004 somente se considera **encerrado com sucesso** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | Estrutura documental criada (`docs/knowledge/` + índice oficial) |
| 2 | Template institucional criado (modelo de entrada do item) |
| 3 | Regras documentadas (índice / emissão `KNW-nnn` / vínculo índice ⇔ identificador / aptidão) |
| 4 | Verificação aprovada (E3 homologada) |
| 5 | **Zero** registros `KNW` emitidos |

O não cumprimento de qualquer um destes critérios impede o encerramento institucional (E4).

---

## 4. Limites do IMP-004

Este IMP **não**:

* cria conhecimento;
* popula o acervo;
* inicia operação do acervo;
* altera REQs;
* altera ARQs;
* altera ADRs.

---

## 5. Princípios de execução (obrigatórios)

| ID | Princípio |
|----|-----------|
| X1 | Não reinterpretar ARQ-006/007 nem alterar REQ-004/005/014/015 |
| X2 | Não deliberar classificações nas Ei — apenas refletir o conjunto homologado |
| X3 | Zero itens `KNW-*` neste ciclo de IMP (mecanismo, não população) |
| X4 | Índice oficial = fonte de estado do acervo (ARQ-006 A1); autoridade do conteúdo = entrada do item |
| X5 | Identificadores `KNW-nnn` conforme ARQ-007; aptidão ≠ identidade (K3) |
| X6 | Opção 2c: sem contratos profundos CAP-05/06/12 neste IMP |
| X7 | Idempotência documental (acima) |

---

## 6. Pré-condição (fora das Ei)

| Campo | Conteúdo |
|-------|----------|
| Artefato | [`decisao-conjunto-inicial-de-classificacoes.md`](../knowledge/decisao-conjunto-inicial-de-classificacoes.md) |
| Conteúdo | 10 classificações: Arquitetura; Requisitos; Análises; Decisões Arquiteturais (ADR); Implementação; Validação; Governança; Operação; Referências Externas; Conhecimento Geral |
| Diretrizes | Mínimo viável; A8 extensível; sem hierarquia entre categorias; classificação obrigatória por item `KNW`; principal/secundárias = regras futuras |
| Critério de prontidão para E1 | Homologação institucional deste conjunto + homologação deste IMP + autorização de abertura da E1 |

---

## 7. Etapas

### E1 — Materialização da estrutura do acervo

Criar (ou completar) a sede operacional `docs/knowledge/` e o **índice oficial** `docs/knowledge/README.md` (ARQ-006 A1), com princípios K1–K8 observáveis, regras mínimas do acervo e o conjunto de classificações **refletido** (materialização da decisão prévia — sem reabrir mérito). **Zero** entradas `KNW-*`. Fontes canônicas (REQs, ARQs, normas) intocadas.

A existência isolada do artefato deliberativo de classificações sob `docs/knowledge/` **não** satisfaz esta etapa: exige-se o índice oficial e a declaração estrutural de acervo operacionalmente vazio.

**Critérios de conclusão:** pasta e índice existem; classificações no índice = conjunto homologado; conformidade A1; nenhum item `KNW`; nenhum REQ/ARQ alterado.

**Gate:** homologação antes de E2.

### E2 — Modelo de entrada do item + regras do índice

Produzir o template/modelo documental da entrada (seções A2 da ARQ-006) e documentar no índice as regras de emissão/`KNW-nnn` (ARQ-007), vínculo índice ⇔ identificador, apto/não apto, versionamento ≠ novo ID, e campos de classificação **amarrados** ao conjunto homologado (principal/secundárias apenas como reserva para regras futuras, sem inventá-las).

Declarar o acervo **apto a emitir** identificadores no registro futuro, ainda **sem** itens emitidos.

**Critérios de conclusão:** template cobre A2; classificação no modelo ⊆ conjunto homologado; README declara regras ARQ-007; zero `KNW` emitidos.

**Gate:** homologação antes de E3.

### E3 — Verificação de conformidade e estabilidade

Verificar aderência a K1–K8, A1–A8 da ARQ-006, A1–A8 da ARQ-007 e aos REQs da CAP-04 no que couber ao *mecanismo vazio*; coerência índice ↔ classificações homologadas; diferença índice × artefatos = 0 no domínio `docs/knowledge/`; idempotência documental.

**Critérios de conclusão:** relatório de verificação com evidências; zero inconsistências abertas no domínio; escopo restrito à CAP-04/acervo.

**Gate:** homologação antes de E4.

### E4 — Encerramento institucional da Implementação documental

Registrar Memória Organizacional do encerramento; declarar a **infraestrutura documental** do acervo concluída nos termos dos Critérios de Sucesso (§3); atualizar o catálogo; **não** abrir por este ato população de itens, operação do acervo, IMP técnico nem a Validação ADR-006 do ciclo completo (esta exige autorização própria).

**Critérios de conclusão:** aprovação da alçada; catálogo atualizado; declaração formal de conclusão do IMP-004 neste ciclo; Critérios de Sucesso (§3) integralmente atendidos.

**Gate:** homologação encerra o IMP.

---

## 8. Ordem e dependências

```
[Classificações homologadas] → [IMP-004 homologado] → [Autorização E1]
        ↓
 E1 → E2 → E3 → E4
```

| Dependência | Motivo |
|-------------|--------|
| E1 após pré-condição + IMP homologado | Materializa decisões; não delibera |
| E2 após E1 | Modelo e regras no acervo estruturado |
| E3 após E2 | Verifica estrutura + modelo + índice + classificações + ARQ-006/007 |
| E4 após E3 | Encerramento só com conformidade |

**Fora deste IMP:** registro de itens reais (`KNW-001`…); expansão de classificações (nova deliberação / A8); Validação ADR-006 plena dos REQs com evidências de operação.

---

## 9. Artefatos por etapa

| Etapa | Artefatos |
|-------|-----------|
| Pré-condição | `docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md` (já elaborado; fora das Ei) |
| E1 | `docs/knowledge/README.md` (índice estrutural, estado vazio, classificações materializadas) |
| E2 | Template de entrada (ex.: `TEMPLATE-ITEM-CONHECIMENTO.md`); regras de emissão/índice no README |
| E3 | Relatório de verificação de conformidade |
| E4 | Encerramento institucional; apontamento cadastral |

---

## 10. Riscos técnicos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Executar E1 sem homologação do IMP / classificações | Critérios de entrada da E1 (X e §6) |
| Deliberar categorias na E1/E2 | X2; apenas reflexão do conjunto homologado |
| Popular itens neste IMP | X3; Critérios de Sucesso (§3); Limites (§4) |
| Antecipar geração técnica de ID | ARQ-007 lógica; IMP só documenta regras |
| Deslizamento CAP-05/06/12 | X6; Opção 2c |
| Confundir E3 com Validação ADR-006 | E3 = conformidade do mecanismo; Validação = etapa própria |
| Tomar o arquivo de decisão como E1 concluída | §7 E1 — exige índice oficial |
| Confundir infraestrutura com operação do acervo | Objetivo Institucional (§2); Limites (§4) |

---

## 11. Estratégia de validação por etapa

| Etapa | Validação |
|-------|-----------|
| Pré-condição | Conjunto nomeado; MO; status de homologação institucional |
| E1 | Checklist A1; classificações no índice = decisão; sem `KNW`; REQs/ARQs intactos |
| E2 | Template A2; classificação ⊆ conjunto; regras ARQ-007; apto/não apto; versão ≠ novo ID |
| E3 | Matriz K1–K8 + A1–A8 (006/007); índice × artefatos = 0; idempotência |
| E4 | Declaração formal; catálogo; Critérios de Sucesso (§3); Limites (§4) preservados |

---

## 12. Batch Gates recomendados (ADR-006 intacta)

| Lote / Gate | Conteúdo |
|-------------|----------|
| Gate individual | Homologação institucional das **classificações** (pré-condição) |
| Gate individual | Homologação deste **IMP-004** + autorização de abertura |
| Gate / Lote B1 | **E1** |
| Gate / Lote B2 | **E2** |
| Lote B3 | **E3 + E4** (verificação + encerramento) |

Recomendação preferencial alinhada ao pré-IMP: classificações → IMP → E1 → E2 → (E3+E4).

---

## 13. Rastreabilidade

| REQ / ARQ | Materialização |
|-----------|----------------|
| REQ-004 (classificações) | Pré-condição + E1/E2 |
| REQ-004 / ARQ-006 A1–A2 | E1, E2 |
| REQ-005 / ARQ-006 A4 | E2 (regras); evidência plena na Validação/operação futuras |
| REQ-014 / ARQ-006 A6 | E2 (aptidão no modelo) |
| REQ-015 / ARQ-006 A5 | E2 (cadeia de versões no modelo) |
| ARQ-007 | E2 (regras `KNW-nnn` + índice) |
| Opção 2c | Todas as etapas |

---

## 14. Fora do escopo

* Código, tecnologia, protocolos, sync automática.
* Alteração de REQs, ARQs, ADRs ou normas (reafirmado em §4).
* População de itens de conhecimento neste ciclo.
* Definição normativa completa de classificação principal × secundárias.
* Integrações profundas CAP-05, CAP-06, CAP-12.
* Operação do acervo (além da infraestrutura documental).

---

## 15. Estado processual (v1.0)

| Ato | Status |
|-----|--------|
| Pré-IMP CAP-04 | Homologado |
| Classificações iniciais | Decisão técnica CTO registrada (v0.1) — aguarda homologação institucional |
| IMP-004 | **Homologado — v1.0** |
| Execução E1–E4 | **Fechada** até autorização explícita do CTO para abertura da E1 |

---

## 16. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO homologou; Engenheiro (Cursor) publicou |
| Quando | 23/07/2026 |
| Por quê | Publicar o plano oficial de Implementação documental do acervo CAP-04, mantendo a execução fechada até autorização da E1 |
| Baseado em quê | Parecer técnico final do CTO — HOMOLOGADO (IMP-004 v1.0); ajustes A1 incorporados; ADR-012; pré-IMP CAP-04; ARQ-006/007; REQ-004/005/014/015; Opção 2c; ADR-006 |
| Resultado | IMP-004 v1.0 homologado e publicado; Implementação permanece formalmente fechada |

---

## 17. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — E1–E4 alinhadas ao pré-IMP; pré-condição de classificações referenciada | Instrução CTO — redigir IMP-004; ADR-012; pré-IMP homologado | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | Engenheiro (Cursor) | Incorporação A1: Objetivo Institucional; Critérios de Sucesso do IMP; Limites do IMP-004 | Parecer CTO — APROVADO COM AJUSTES MENORES (A1) | Em análise — homologação final do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro publicou | Homologação final e publicação institucional | Parecer técnico final do CTO — HOMOLOGADO | **Homologado — publicado** |

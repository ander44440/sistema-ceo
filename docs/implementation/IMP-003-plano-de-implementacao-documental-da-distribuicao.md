# IMP-003 — Plano de Implementação Documental da Distribuição de Governança

> **Status: Homologado — v1.0 (Governança, 22/07/2026).**
> Versão 1.0 — 22/07/2026. Tipo IMP (ADR-012).
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; ADR-013 v1.0 (D4); ARQ-005 v1.0; REQ-010 a REQ-013 v1.0; CNC-005; ARQ-004 / IMP-002 (fontes operacionais).
> Este documento **planeja**; não executa por si. Não reinterpreta a ARQ-005; não cria requisitos; não altera fontes canônicas; não introduz implementação técnica.
> **Vinculação:** o IMP-003 implementa **exclusivamente a ARQ-005** — não constitui mecanismo genérico de implementação para futuros domínios.
> **Gate de Implementação Documental da ARQ-005:** plano homologado; execução incremental E1–E6 condicionada aos respectivos Gates.

---

## 1. Objeto e premissas

Materializar documentalmente o canal de Distribuição de Governança sob `docs/distribution/`, conforme a ARQ-005 homologada, preservando D1–D6, a autoridade das fontes e a fronteira documental × técnica (ADR-013 D4).

O IMP-003 implementa **exclusivamente a ARQ-005**. Não constitui plano-modelo nem mecanismo genérico de implementação para outros domínios; cada domínio futuro exigirá o próprio ciclo ADR-006 e o próprio IMP.

Premissas:

* REQ-010…013 e ARQ-005 homologados; fontes operacionais (Registro Canônico de Normas; conceitos; CON-001).
* Implementação **exclusivamente documental**.
* Princípio reafirmado (IMP-001/002): **nenhuma etapa produz efeitos organizacionais permanentes antes do respectivo gate**.
* **Idempotência documental:** a reexecução de uma etapa homologada não deve produzir alterações adicionais quando não houver mudança deliberada no estado organizacional.

---

## 2. Princípios de execução (obrigatórios)

| ID | Princípio |
|----|-----------|
| X1 | Não reinterpretar ARQ-005 nem alterar REQ-010…013 / CNC-005 |
| X2 | Interfaces **exclusivamente de leitura** com as fontes (ARQ-005 A2) — dependências lógicas, não ordem de procedimento |
| X3 | D1–D3: canal não é fonte; transporta sem transformar; fontes não dependem do canal |
| X4 | Vedação absoluta a protocolos, tecnologias, sync automática, ferramentas externas (ADR-013 D4) |
| X5 | Identificadores: reutilizar PREFIXO-nnn / CNC-nnn; IDs locais de rastro só como convenção interna (ARQ-005 A7) |
| X6 | Idempotência documental (acima) |
| X7 | Pacote = **snapshot arquitetural** das fontes no instante da composição — não acompanha automaticamente mudanças posteriores |
| X8 | Estrutura de rastro pode existir **vazia** e operacional — modelo ≠ eventos registrados |

---

## 3. Produtos esperados (ARQ-005 A1)

| Produto | Localização / forma |
|---------|---------------------|
| Estrutura do domínio | `docs/distribution/` |
| Índice do canal | `docs/distribution/README.md` — estado do *mecanismo* (não das normas) |
| Composição do pacote | Artefato de snapshot (IDs, fontes, versões no instante) |
| Registro de alcance | Vínculos vigentes para distribuição (CNC-005 + decisões sob governança) — pode iniciar vazio |
| Rastro | Modelo append-oriented (REQ-013) — pode iniciar sem eventos |
| Atualização cadastral | Catálogo aponta para o domínio, quando E1/E6 autorizarem |

---

## 4. Etapas

### E1 — Materialização da estrutura documental

Criar `docs/distribution/` e o índice oficial do canal (`README.md`), com princípios D1–D6 / regras do canal, **sem** popular pacote, vínculos operacionais nem eventos de rastro.

**Produtos:** pasta; índice estrutural.  
**Critérios de conclusão:** conformidade A1; zero alteração em fontes; nenhum efeito de distribuição operacional até gates posteriores.  
**Gate:** homologação antes de E2.

### E2 — Estado inicial dos vínculos de distribuição

Etapa **deliberativa**: decidir formalmente o estado inicial do registro de alcance — incluir vínculos existentes (se houver decisões sob governança que os constituam) ou registrar **alcance inicial vazio**, sem inventar vínculos nem redefinir o CNC-005.

**Produtos:** decisão formal do estado inicial de alcance + (se aplicável) estrutura do registro de vínculos ainda sem popular além do deliberado.  
**Critérios de conclusão:** decisão homologada; CNC-005 intacto; fontes intactas.  
**Gate:** deliberativo; homologação antes de E3.

### E3 — Composição do pacote documental (snapshot arquitetural)

Produzir o artefato de composição do pacote como **instantâneo arquitetural (snapshot)** das fontes no momento da composição: Constituição; normas vigentes (Registro Canônico); conceitos vigentes — cada elemento com identificador, fonte e versão vigente naquele instante (REQ-010).

O snapshot **não** acompanha automaticamente alterações posteriores das fontes; recomposição ou propagação exige ato deliberado conforme REQ-012 / gates futuros.

**Produtos:** artefato de composição (snapshot) referenciado pelo índice do canal.  
**Critérios de conclusão:** proveniência e versões determináveis; apenas leitura das fontes; D1/D2/X7 observados.  
**Gate:** homologação antes de E4.

### E4 — Estruturação do rastro documental

Materializar a estrutura/modelo de rastro (conteúdo mínimo REQ-013; Memória Organizacional; append-oriented; imutabilidade lógica).

A existência da estrutura **não implica** a existência de eventos: o modelo pode ser entregue **operacionalmente vazio**, apto a receber registros futuros mediante deliberação (X8).

**Produtos:** artefato/seção de rastro pronta; zero ou N eventos conforme deliberação explícita (default: zero).  
**Critérios de conclusão:** modelo conforme REQ-013/A6; sem protocolo técnico.  
**Gate:** homologação antes de E5.

### E5 — Verificação de conformidade e estabilidade

Verificar aderência a D1–D6, princípios X, decisões A1–A10 da ARQ-005 e estabilidade entre índice do canal, artefatos de pacote/vínculo/rastro e fontes (sem inconsistências abertas). A verificação de conformidade considera **apenas os artefatos pertencentes ao domínio de Distribuição** (`docs/distribution/` e apontamentos cadastrais dele decorrentes) — não amplia o escopo de validação a outros domínios ou fontes, salvo a leitura necessária para constatar consistência com as interfaces de leitura. Não alterar arquitetura nem fontes.

**Produtos:** relatório de verificação.  
**Critérios de conclusão:** checklist OK; diferença/ inconsistências = 0; idempotência observada; escopo restrito ao domínio de Distribuição.  
**Gate:** homologação antes de E6.

### E6 — Encerramento institucional

Registrar conclusão do Gate de Implementação Documental da ARQ-005; atualizar catálogo; declarar canal documental operacional nos limites da Fase 1; encaminhar fase técnica à deliberação futura (não aberta por este plano).

Eventual evolução futura do domínio de Distribuição (documental ou técnica) dependerá da **abertura de novo ciclo da ADR-006**; o encerramento do IMP-003 é **imutável** quanto ao ciclo que encerra — não se reabre nem se estende por aditamento informal.

**Produtos:** encerramento formal; catálogo atualizado.  
**Critérios de conclusão:** aprovação da alçada; sem novos requisitos; imutabilidade do encerramento registrada.  
**Gate:** homologação encerra o IMP-003.

---

## 5. Ordem e dependências

```
E1 → E2 (gate) → E3 → E4 → E5 → E6
```

Nenhuma etapa posterior inicia sem homologação da anterior. E3 só após E2 (estado de alcance definido, ainda que vazio).

---

## 6. Rastreabilidade REQ → ARQ → IMP

| REQ | ARQ-005 | Etapa IMP-003 |
|-----|---------|---------------|
| REQ-010 | A3 — pacote como projeção | E3 (snapshot) |
| REQ-011 | A4 — alcance / vínculo | E2 |
| REQ-012 | A5 — entrega / propagação (documental) | E3–E4 (atos só se deliberados; modelo em E4) |
| REQ-013 | A6 — rastro | E4 |
| — | A1 estrutura; A2 interfaces | E1; leitura em E3 |

---

## 7. Fora do escopo (vedações)

* Protocolos, tecnologias, sync automática, ferramentas externas  
* Alterar Registro Canônico, conceitos, CON, ARQ-005, REQ-010…013  
* Redefinir CNC-005 ou inventar vínculos  
* Implementação técnica de distribuição  
* Auditoria ativa (CAP-09)

---

## 8. Riscos

| Risco | Mitigação |
|-------|-----------|
| Vínculos formais ainda inexistentes | E2 permite alcance inicial vazio (REQ-011 já declarou a limitação) |
| Confundir snapshot com espelho vivo | X7 + E3: recomposição só por ato deliberado |
| Popular rastro sem ato real | X8 + E4 default vazio |
| Deslizamento técnico | §7 e ADR-013 D4 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | ADR-006; ADR-012; ADR-013 D4; ARQ-005; REQ-010…013 |
| Origem | Deliberação da Governança — autorização IMP-003 (22/07/2026); Recomendação Técnica com ajustes do CTO |
| Planeja | Materialização documental de `docs/distribution/` |
| Estado | Homologado v1.0 — execução E1–E6 por Gates sucessivos |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Plano E1–E6; snapshot; rastro vazio permitido; idempotência; só leitura das fontes | Autorização da Governança — redação IMP-003 | Em revisão técnica do CTO |
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Ajustes editoriais A–C do CTO: vinculação exclusiva à ARQ-005; E5 só domínio Distribuição; E6 imutável + novo ciclo ADR-006 | Parecer CTO — aprovado com ajustes editoriais | Aguarda deliberação da Governança |
| 1.0 | 22/07/2026 | Governança homologou | Plano oficial de implementação documental da Distribuição; E1–E6 e diretrizes homologadas | Conformidade ADR-006/012/013; ARQ-005; REQ-010…013; CNC-005 | **Homologado — publicação autorizada; E1 autorizada após publicação** |

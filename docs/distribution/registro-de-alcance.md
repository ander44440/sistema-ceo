# Registro de Alcance — Canal de Distribuição de Governança

> **Status: Operacional — alcance inicial vazio (Gate E2 homologado, Governança, 22/07/2026).**
> Norma superior: REQ-011; CNC-005; ARQ-005 A4; IMP-003 E2.
> Este registro lista os agentes sob obrigação vigente de receber o pacote de governança integral. **Não** redefine o conceito de agente conectado (CNC-005).
> Decisão de estado inicial: [`decisao-estado-inicial-dos-vinculos.md`](decisao-estado-inicial-dos-vinculos.md) v1.0.

---

## O que é

Relação oficial do **alcance** da distribuição (ARQ-005 A4): quem está vinculado, nos termos do CNC-005, e portanto alcançado pela obrigação do REQ-011. Cada entrada corresponde a exatamente um objeto organizacional válido (P7 aplicado ao canal).

## Regras

* Entrada somente mediante decisão sob governança que **estabeleça** o vínculo (CNC-005 / CNC-001).
* Remoção lógica (cessação) somente mediante decisão sob governança que **encerre** o vínculo — sem apagar o histórico da decisão; o registro de alcance reflete apenas vínculos **vigentes**.
* Identificador do destinatário: o identificador permanente do agente conforme a decisão de vínculo (sem novo espaço de ID — ARQ-005 A7).
* Interfaces: leitura das decisões; o canal não constitui vínculo.

## Alcance vigente

| Identificador | Designação / referência | Decisão de estabelecimento | Início da vigência | Status |
|---------------|-------------------------|----------------------------|--------------------|--------|
| — | *(nenhuma entrada)* | — | — | **Alcance inicial vazio** (E2 homologada) |

Estado homologado: **zero agentes alcançados** até deliberação futura que constitua vínculos formais.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Conceito | CNC-005 |
| Requisito | REQ-011 |
| Arquitetura | ARQ-005 A4 |
| Decisão E2 | [decisao-estado-inicial-dos-vinculos.md](decisao-estado-inicial-dos-vinculos.md) v1.0 |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Estrutura do registro; tabela vazia alinhada à decisão proposta E2 | IMP-003 E2 | Aguarda Gate E2 |
| 0.1 | 22/07/2026 | CTO | Revisão técnica — estrutura vazia aprovada com a decisão | Conformidade ARQ-005 A4 | Aprovada — encaminhada à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Registro operacionalmente vazio como infraestrutura permanente | Homologação E2 | **Operacional — alcance vazio** |

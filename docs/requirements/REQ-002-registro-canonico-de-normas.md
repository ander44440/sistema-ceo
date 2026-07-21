# REQ-002 — Registro canônico e versionado das normas de governança

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá manter um registro canônico, único e versionado de todas as suas normas de governança, no qual cada norma possua identificador permanente, status, versão vigente e histórico completo de alterações e aprovações.

## Tipo

Funcional; alto nível.

## Justificativa

A Constituição determina que a fonte canônica das normas é única e que qualquer espelho operacional é subordinado (CON-001, Art. 7º §4º). A CAP-01 exige "estabelecer, distribuir e manter regras permanentes": este requisito cobre o estabelecer e o manter — sem um registro canônico não há o que o mecanismo de distribuição do REQ-001 distribua, nem como um agente verificar se a regra que recebeu é a vigente. A experiência da própria Fase 0 evidenciou o risco: as normas nasceram com espelhos (README, regra de ferramenta) que só não divergiram por disciplina manual.

## Critérios de aceitação

* Todo documento classificado como normativo no catálogo oficial da documentação (`docs/README.md`) e vigente consta do registro canônico com identificador único e permanente (nunca renumerado nem reutilizado).
* Cada norma registrada possui status do vocabulário oficial (Rascunho, Em análise, Aprovado, Substituído ou Emendado) e número de versão.
* Toda alteração de conteúdo ou de status de uma norma gera uma entrada de histórico com os cinco campos da Memória Organizacional: quem, quando, por quê, baseado em quê e resultado (CON-001, Art. 8º).
* Dado o identificador de uma norma, é possível recuperar sua versão vigente e todas as versões anteriores.
* Toda norma com status Aprovado registra quem aprovou e quando (a alçada de aprovação é a já definida pela CON-001 e pelo catálogo oficial — não é redefinida aqui).
* Em caso de divergência entre o registro canônico e qualquer espelho operacional, o registro canônico prevalece.

## Fora do escopo

* Distribuição das normas aos agentes conectados e sua atualização remota — coberto pelo REQ-001.
* Verificação de conformidade das ações dos agentes com as normas — futuro requisito (CAP-01/CAP-10).
* Formato de armazenamento, tecnologia ou estrutura de dados do registro — decisão de arquitetura (ADRs futuros).
* Detecção de divergência entre o registro canônico e espelhos operacionais — propriedade de auditabilidade, candidata a requisito próprio da CAP-09 (Observabilidade).
* Normas que não sejam de governança (ex.: conhecimento de projetos) — coberto pela CAP-04.

## Dependências

Nenhuma — este requisito não depende de nenhum requisito existente ou inexistente. A dependência é inversa: o **REQ-001 depende deste requisito** (distribuição pressupõe registro canônico); essa dependência está registrada explicitamente no REQ-001.

## Riscos e incertezas

* **Burocratização:** um registro com campos demais viola o princípio 1 (respeito ao tempo do usuário). Mitigação: os campos exigidos são exatamente os mínimos da Memória Organizacional já constitucionalizados.
* **Duplicidade com espelhos:** enquanto existirem espelhos operacionais (ex.: regras de ferramenta), há risco de divergência silenciosa. Mitigação: a precedência do canônico é critério de aceitação; a detecção de divergência será tratada em requisito próprio (CAP-09).
* **Incerteza de escopo:** a fronteira entre "norma de governança" e "conhecimento organizacional" precisará ser refinada quando a CAP-04 for detalhada.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º (em especial §4º), 8º e 11; VIS-001 §5 (escopo: governar) |
| Origem | Diretriz do CTO de início da Fase 1 (21/07/2026); ADR-004 (abertura da Onda 1); CAP-001 v1.0 (CAP-01) |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Diretriz do CTO — primeiro requisito oficial da Fase 1 | Revisado em autoavaliação |
| 0.2 | 21/07/2026 | Engenheiro (Cursor) | Autoavaliação técnica: removido método ("por comparação") de critério; "norma de governança" ancorada no catálogo oficial; critério de aprovação reduzido a propriedade do registro; detecção de divergência remetida à CAP-09; dependência inversa do REQ-001 explicitada | Checklist de autoavaliação do CTO (5 pontos) | Aprovado |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Promoção a versão aprovada, sem alteração de conteúdo | Revisão do CTO: aderência aos princípios de Engenharia de Requisitos | **Primeiro requisito aprovado da Fase 1** |

# REQ-003 — Resolução da norma vigente e aplicável

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá determinar, para toda decisão sob sua governança, o conjunto de normas vigentes e aplicáveis que a fundamenta, resolvendo conflitos entre níveis pela hierarquia normativa da CON-001 e nunca utilizando normas não vigentes como referência operacional.

**Conceito referenciado:** *decisão sob governança* — **[CNC-001](../concepts/CNC-001-decisao-sob-governanca.md)**.

> **Anotação de migração (21/07/2026):** a definição originalmente estabelecida neste documento migrou para a autoridade semântica oficial no corte único (ADR-009). A transcrição abaixo é informativa e não vinculante; a definição normativa vigente é a do CNC-001.
> *Decisão sob governança* é toda decisão produzida, validada ou executada pelo CEO, independentemente de seu registro posterior na Memória Organizacional.

## Tipo

Funcional; alto nível.

## Justificativa

A hierarquia normativa (CON-001, Art. 5º) e a rastreabilidade decisória (Art. 8º §3º) só têm efeito prático se, no momento de cada decisão, o CEO souber objetivamente qual norma vale e qual prevalece. O REQ-002 estabelece o registro canônico (o estado das normas); este requisito estabelece a leitura operacional desse estado: sem resolução de vigência e aplicabilidade, qualquer decisão pode se apoiar em norma substituída ou contrariar norma superior sem que ninguém detecte. É o elo usado por toda decisão do CEO, o que o torna prioritário na Onda 1 (CAP-002).

## Critérios de aceitação

* Para cada norma do registro canônico, em qualquer instante, existe no máximo uma versão vigente — nunca duas versões vigentes simultâneas da mesma norma.
* Para toda decisão sob governança, o conjunto de normas vigentes aplicáveis é determinado antes da conclusão da decisão, e esse conjunto contém apenas normas com vigência ativa no registro canônico (REQ-002).
* Quando duas normas aplicáveis de níveis diferentes conflitam, a decisão é fundamentada na norma de nível superior, conforme a hierarquia da CON-001 (Art. 5º).
* Quando duas normas aplicáveis do mesmo nível conflitam, o CEO: (a) não decide automaticamente e suspende a decisão; (b) comunica o conflito ao Usuário; (c) registra o evento na Memória Organizacional com os cinco campos do Art. 8º. Não existe decisão concluída com fundamento em norma horizontalmente conflitante sem resolução prévia do Usuário.
* Nenhuma decisão sob governança referencia como fundamento operacional documento com status Substituído; consultas operacionais a normas retornam exclusivamente versões vigentes.
* Toda decisão sob governança rastreia a norma e a versão que a fundamentou no momento da decisão; a substituição posterior da norma não altera esse rastro, e a versão referenciada permanece recuperável (REQ-002).

## Fora do escopo

* Ciclo de vida das normas (criação, emenda, aprovação, substituição) — segue o processo da CON-001 (Art. 11) e do catálogo oficial; candidato a requisito futuro da CAP-01.
* Resolução de mérito de conflitos horizontais — decidir qual norma prevalece é do Usuário (CON-001, Art. 6º); este requisito cobre apenas detecção, suspensão, comunicação e registro.
* Distribuição das normas aos agentes conectados — coberto pelo REQ-001.
* Verificação de conformidade das ações dos agentes com as normas vigentes — candidato a requisito futuro (CAP-01/CAP-10).
* Detecção de divergência entre registro canônico e espelhos operacionais — candidata a requisito da CAP-09 (registrada no REQ-002).
* Formato, armazenamento, algoritmo de resolução ou qualquer implementação — decisões de arquitetura (ADRs futuros).

## Dependências

* **REQ-002** — a vigência, o versionamento e a recuperabilidade histórica das normas são providos pelo registro canônico.

## Riscos e incertezas

* **Custo de resolução por decisão:** se toda microdecisão exigir resolução formal completa, o requisito pode ferir o princípio 1 (respeito ao tempo). Incerteza: a granularidade prática de "decisão produzida, validada ou executada" será calibrada em requisitos detalhados e na arquitetura, sem reduzir a definição do CTO.
* **Limitações na detecção automática de conflitos normativos:** a detecção de conflitos entre normas pode ser incompleta, qualquer que seja a forma de representação das normas. O requisito exige o comportamento correto quando o conflito é detectado; os limites de detecção são declarados com transparência (CON-001, Art. 9º, princípio 8).
* **Dependência da integridade do REQ-002:** o rastro temporal só é confiável se o histórico de versões do registro canônico for íntegro; degradação lá invalida a rastreabilidade daqui.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º (hierarquia), 6º (autoridade do Usuário), 8º (memória e rastreabilidade), 9º princípios 2 e 3; VIS-001 §5 (escopo: governar) |
| Origem | Redefinição de escopo pelo CTO e três decisões de refinamento (conflito horizontal, vocabulário de status, definição de decisão sob governança) — 21/07/2026 |
| Dependências | REQ-002 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, incorporando as três decisões do CTO sobre o escopo refinado | Autorização do CTO para redação do REQ-003 | Aprovado com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Risco de detecção de conflitos generalizado — removida referência a forma de representação das normas | Revisão final do CTO: requisito deve permanecer válido independentemente da representação futura das normas | **Aprovado** |
| 1.0 (anotação) | 21/07/2026 | Engenheiro (Cursor), ato de execução autorizado pela ADR-009 (D5) | Anotação de migração: a definição de "decisão sob governança" tornou-se informativa e subordinada ao mecanismo de conceitos (CNC-001) | Corte único de migração (IMP-001, E4) | Documento passa a consumidor por referência; sem reabertura nem novo ciclo de aprovação |

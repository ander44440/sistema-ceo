# ANL-001 — Análise da CAP-04 — Gestão do Conhecimento

> **Status: APROVADA.**
> Versão 1.1 — 21/07/2026, aprovada pelo CTO: ordem oficial dos grupos A → C → D → B. Tipo criado pela ADR-005 (aprovada).
> Norma superior: CON-001 v1.0; VIS-001 v1.0; CAP-001 v1.0 (CAP-04).
> Documento preparatório: não é requisito nem arquitetura; organiza a estratégia antes da escrita dos REQs da CAP-04.

---

## 1. Objetivo da capacidade

Transformar o conhecimento produzido pelos projetos em **patrimônio organizacional organizado, preservado e recuperável**, de modo que cada novo projeto seja mais rápido que o anterior (CAP-001; VIS-001 §4).

O objetivo é sustentado por dois mandatos superiores:

* **O conhecimento pertence ao CEO, não às ferramentas** (ADR-002, Decisão 5): o que se aprende num projeto não pode ficar preso à sessão, ao agente ou à plataforma onde surgiu.
* **Progresso por unidade de tempo** (CON-001, Art. 3º): conhecimento que não é reencontrado no momento certo tem valor zero; a capacidade só cumpre sua missão quando reduz o tempo até a próxima decisão correta.

## 2. Limites da capacidade

O que **é** da CAP-04: organização, preservação e recuperação de conhecimento não decisório — contexto de projetos, padrões, glossários, lições aprendidas, documentação técnica, referências validadas.

O que **não é** da CAP-04:

| Fronteira | Pertence a | Critério de separação |
|-----------|-----------|----------------------|
| Decisões e seus cinco campos (quem, quando, por quê, baseado em quê, resultado) | CAP-05 — Memória Organizacional | Definição oficial (CTO, 21/07/2026): **CAP-04 administra conhecimentos reutilizáveis, independentes de uma decisão específica; CAP-05 administra registros históricos de fatos, decisões, eventos e seus respectivos contextos** |
| Competências observadas em agentes e seu ciclo de maturação (BCO) | CAP-06 — Aprendizado | CAP-06 decide *o que* vira patrimônio validado; CAP-04 organiza e preserva o patrimônio |
| Normas de governança e sua vigência | CAP-01 (REQ-002, REQ-003) | Norma obriga; conhecimento informa |
| Andamento e rastreabilidade de trabalhos | CAP-09 — Observabilidade | Estado de execução não é conhecimento acumulável |
| Uso do conhecimento para ensinar o usuário | CAP-12 — Desenvolvimento do Usuário | CAP-12 é consumidora da CAP-04 |

A fronteira mais sensível é com a CAP-05 — já sinalizada como incerteza no REQ-002 ("norma × conhecimento organizacional"). A definição oficial estabelecida pelo CTO em 21/07/2026 é a referência para todos os próximos requisitos da CAP-04:

* **CAP-04 — Gestão do Conhecimento:** administra conhecimentos **reutilizáveis, independentes de uma decisão específica**.
* **CAP-05 — Memória Organizacional:** administra **registros históricos de fatos, decisões, eventos e seus respectivos contextos**.

## 3. Dependências com outras capacidades

**A CAP-04 depende de:**

* **CAP-01 (REQ-002/REQ-003)** — dependência conceitual: o padrão registro canônico + resolução do vigente estabelecido para normas antecipa problemas idênticos do conhecimento (identificação permanente, versionamento, vigência). Os REQs da CAP-04 devem reusar os *conceitos*, sem herdar arquitetura.
* **CAP-05** — decisões referenciam conhecimento ("baseado em quê") e conhecimento nasce de decisões; a integração bidirecional precisa de fronteira clara.

**Dependem da CAP-04:**

* **CAP-06 — Aprendizado** — razão do ajuste do CTO na ADR-004: aprendizado exige conhecimento estruturado; competências validadas precisam de onde viver.
* **CAP-12 — Desenvolvimento do Usuário** — o ensino consome o patrimônio de conhecimento.
* **CAP-02 / CAP-03** — como produtoras (projetos e agentes geram conhecimento a capturar) e consumidoras (coordenação usa conhecimento acumulado).

## 4. Possíveis agrupamentos de requisitos

| Grupo | Tema | Pergunta que responde |
|-------|------|----------------------|
| A — Estruturação | O que é um item de conhecimento: identificação permanente, classificação, origem (projeto/agente/decisão), relacionamentos | "O que sabemos e de onde veio?" |
| B — Preservação | Sobrevivência do conhecimento a sessões, agentes e ferramentas; integridade; versionamento | "Como garantimos que não se perde?" |
| C — Recuperação | Encontrar e entregar o conhecimento certo no contexto certo (por projeto, tema, decisão relacionada), sob demanda e proativamente | "Como reencontramos no momento certo?" |
| D — Curadoria | Atualidade e obsolescência: conhecimento desatualizado nunca entregue como válido; deduplicação; validação | "Como sabemos que ainda vale?" |
| E — Fronteiras | Vínculos formais com CAP-05 (decisão ↔ conhecimento) e insumos para CAP-06/CAP-12 | "Como conversa com o resto?" |

## 5. Riscos de engenharia

* **Fronteira difusa com a CAP-05:** sem critério objetivo de classificação, cada registro vira debate. Mitigação: aplicada — a definição oficial do CTO (§2) é a referência de classificação para todos os REQs da CAP-04.
* **Acumulação sem curadoria:** conhecimento cresce monotonicamente e a recuperação degrada — volume vira ruído e fere o princípio 1 (tempo do usuário). Mitigação: Grupo D como requisito de primeira classe, não como "melhoria futura".
* **Conhecimento obsoleto tratado como válido:** análogo direto do problema que o REQ-003 resolve para normas; decisões baseadas em conhecimento vencido são piores que decisões sem conhecimento. Mitigação: conceito de atualidade/validade desde o Grupo A (estrutura), aplicado no Grupo D.
* **Captura dependente de ferramenta:** conhecimento que nasce em conversas e sessões de agentes específicos morre lá se a captura pressupuser a ferramenta (viola ADR-002 D5 e o padrão do REQ-001). Mitigação: requisitos de preservação formulados de forma independente de representação — mesma lição do ajuste final do REQ-003.
* **Overengineering ontológico:** taxonomias e metadados demais transformam registro em burocracia e ninguém alimenta o acervo. Mitigação: campos mínimos obrigatórios (como na Memória Organizacional), extensão só com evidência de necessidade.
* **Medibilidade da promessa:** "cada projeto mais rápido que o anterior" é difícil de verificar objetivamente. Os critérios de aceitação deverão medir propriedades observáveis do acervo e da recuperação, não o efeito macro.

## 6. Ordem para elaboração dos futuros REQs

**Ordem oficial (redefinida pelo CTO em 21/07/2026):** a utilidade do conhecimento depende primeiro da capacidade de recuperá-lo corretamente; a preservação protege um patrimônio cujo modelo de uso já está definido.

1. **REQ (Grupo A) — Registro estruturado do conhecimento** *(concluído — REQ-004 v1.0)*: o que é um item de conhecimento, identificação permanente, classificação (aplicando a definição oficial de fronteira com a CAP-05, §2), origem e relacionamentos. Análogo do REQ-002.
2. **REQ (Grupo C) — Recuperação contextual:** dado um contexto de trabalho, o conhecimento aplicável é determinável e entregue. Análogo do REQ-003 e núcleo de valor da capacidade.
3. **REQ (Grupo D) — Atualidade e curadoria:** validade, obsolescência e depuração do acervo.
4. **REQ (Grupo B) — Preservação independente de ferramenta:** o conhecimento sobrevive a sessões, agentes e plataformas, com integridade e versões.
5. **Grupo E — Fronteiras:** avaliar com o CTO se vira requisito próprio ou se dilui nos anteriores (a integração com CAP-05 provavelmente cabe no Grupo A; os insumos para CAP-06/CAP-12 podem esperar as respectivas capacidades).

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 (Art. 3º, 4º, 8º); VIS-001 v1.0 (§4) |
| Origem | Ordem do CTO (21/07/2026); CAP-001 v1.0 (CAP-04); CAP-002 v1.0 (Onda 1); ADR-002 (D5); ADR-005 (tipo ANL) |
| Gera | Futuros REQs da CAP-04 (após aprovação desta análise) |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Ordem do CTO — preparar estratégia da CAP-04 antes dos REQs | Aprovada com um ajuste |
| 1.0 | 21/07/2026 | CTO decidiu; Engenheiro aplicou | Fronteira CAP-04 × CAP-05 substituída pela definição oficial do CTO (conhecimento reutilizável × registro histórico) | Revisão da ANL-001 | **Aprovada — referência para os REQs da CAP-04** |
| 1.1 | 21/07/2026 | CTO decidiu; Engenheiro aplicou; CTO aprovou | Ordem dos grupos redefinida: A (concluído) → C → D → B | A utilidade do conhecimento depende primeiro da recuperação; a preservação protege um patrimônio cujo modelo de uso já está definido | **Aprovada — ordem oficial vigente** |

# ADR-015 — Priorização pelo Uso Operacional Diário (Contexto MG2)

> **Status: Aceita — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026.
> Esta ADR registra a **diretriz estratégica de priorização** do Projeto CEO. **Não** altera REQs, ARQs, IMPs nem VALs existentes. **Não** substitui o CAP-002 (ondas); **sobreponha-se** a ele como filtro de prioridade operacional. **Não** importa arquitetura nem padrões do Motoboy Game 2 — o CEO permanece produto independente; o MG2 é o **primeiro contexto de uso real** do patrocinador.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (diretriz estratégica); Engenheiro (Cursor) registrou |
| Quando | 23/07/2026 |
| Por quê | Transitar da fase de fundação metodológica para uma fase em que o CEO evolui como ferramenta de uso diário do patrocinador, com o desenvolvimento do Motoboy Game 2 (MG2) como primeiro contexto operacional |
| Baseado em quê | Diretriz estratégica do CTO — Atualização da Filosofia do Projeto CEO (23/07/2026); CON-001 Art. 3º (progresso por unidade de tempo); VIS-001 (propósito); CAP-002 (ondas — preservadas); ADR-006 (rigor do fluxo) |
| Resultado | Critério oficial de priorização operacional instituído; rigor metodológico reafirmado; MVP mínimo para uso diário no MG2 como objetivo institucional desta fase |

---

## Status

Aceita — v1.0 (CTO, 23/07/2026).

---

## Contexto

Na primeira fase do projeto, a prioridade foi construir uma **fundação metodológica sólida** (CON, VIS, CAP, fluxo ADR-006, tipos documentais, CAP-01 e CAP-04 em curso). Essa fundação **permanece válida** e continua sendo preservada.

O projeto entra em **nova fase estratégica**: colocar o CEO em **operação real o mais cedo possível** como ferramenta de trabalho para o desenvolvimento do **Motoboy Game 2 (MG2)** pelo patrocinador.

---

## Decisão

### D1 — Pergunta prioritária obrigatória

Para toda proposta de capacidade, melhoria ou evolução, considerar **primeiro**:

> **Esta entrega aproxima o usuário de utilizar o CEO diariamente no desenvolvimento do MG2?**

| Resposta | Efeito |
|----------|--------|
| **SIM** | A capacidade/entrega torna-se **candidata de alta prioridade** |
| **NÃO** | Pode ser **postergada**, salvo quando representar **infraestrutura indispensável** à operação ou à integridade do sistema |

### D2 — O que não muda (rigor)

| Preservado | Enunciado |
|------------|-----------|
| Fluxo ADR-006 | ANL → ADR (se necessário) → REQ → ARQ → IMP → VAL |
| Artefatos | REQ, ARQ, ADR, IMP, VAL e homologações **continuam obrigatórios** |
| Hierarquia normativa | CON → VIS → REQ → ADR → … intacta |
| Fundação metodológica | Continua válida e preservada |
| Independência de produto | O CEO **não** herda arquitetura, código ou padrões do MG2 / projetos anteriores; o MG2 é **contexto de uso**, não fonte normativa do CEO |

### D3 — O que muda (estratégia)

| Muda | Enunciado |
|------|-----------|
| Critério de priorização | Além dos critérios do CAP-002, aplica-se o filtro D1 |
| Postura do produto | De “plataforma futura” para **ferramenta em uso diário** pelo patrocinador |
| Fonte de evolução | A **experiência prática de uso** passa a ser uma das principais fontes de evolução da arquitetura |
| Objetivo institucional desta fase | Entregar o **menor MVP possível** que permita uso diário do CEO no desenvolvimento do MG2 |
| Evoluções posteriores | Partem da experiência obtida nesse uso real |

### D4 — Dever do Engenheiro (sugestão técnica)

Sempre que identificar solução capaz de **antecipar a utilização prática** do CEO **sem comprometer a qualidade arquitetural**, apresentar ao CTO como **sugestão técnica** (sugerir sem impor — CON-001 Art. 9º).

### D5 — Relação com o CAP-002

* As **ondas** do CAP-002 permanecem a referência de dependência estrutural e risco de governança.
* O filtro D1 **não apaga** as ondas: ordena e acelera, dentro do rigor, o que mais aproxima o uso diário no MG2.
* Infraestrutura indispensável (ex.: fechos documentais já em curso sob ADR-006) pode prosseguir mesmo quando o benefício MG2 for indireto — desde que justificada como indispensável (D1).

---

## Implicações imediatas (informativas)

* O ciclo em andamento da **CAP-04** (IMP-004 / VAL-004) permanece sob o rigor vigente; sua conclusão documental fortalece o patrimônio de conhecimento utilizável no uso diário.
* Novas CAPs e melhorias passam pelo teste D1 antes de competir por atenção.
* Propostas de MVP operacional (interfaces, rotinas diárias, captura de decisões/conhecimento do MG2) devem nascer por REQ/ARQ quando forem além de operação documental já autorizada.

---

## Alternativas consideradas

* **Manter apenas priorização por ondas do CAP-002:** rejeitado como critério exclusivo — atrasa o uso real sem necessidade, após a fundação já existir.
* **Abandonar rigor metodológico para “ir mais rápido”:** rejeitado — a diretriz afirma explicitamente que o rigor não se reduz.
* **Fundir o CEO ao repositório/arquitetura do MG2:** rejeitado — viola independência de produto; MG2 é contexto de uso, não norma do CEO.

---

## Rastreabilidade

- Norma superior: CON-001 Art. 1º, 3º, 5º, 9º; VIS-001.
- Estratégia de capacidades: CAP-001; CAP-002 (ondas preservadas; filtro sobreposto).
- Fluxo: ADR-006.
- Origem: Diretriz estratégica do CTO — Atualização da Filosofia do Projeto CEO (23/07/2026).

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 1.0 | 23/07/2026 | CTO estabeleceu; Engenheiro registrou | Criação — filtro D1 (uso diário MG2); rigor preservado; MVP mínimo; dever de sugestão técnica | Diretriz estratégica do CTO | **Aceita** |

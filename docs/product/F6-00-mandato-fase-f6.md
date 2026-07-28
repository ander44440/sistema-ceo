# F6-00 — Mandato da Fase F6 (Ecossistema Executivo)

> **Status: Homologada — Gate F6-00 APROVADO (CTO, 28/07/2026). Fase F6 ENCERRADA (Gate F6-05).**  
> **Versão:** v0.1 — 28/07/2026 (homologada)  
> Natureza: **mandato de abertura** da Fase F6 — Ecossistema Executivo.  
> Sede: **IPR-001** — Experiência e Desejabilidade do CEO (continuidade; **sem** IPR-002).  
> Pré-condições: F0–F5 **encerradas**; Onda Operacional 02 **homologada**; Gabinete Executivo estabilizado.  
> Base da estrutura: proposta F6 revisada e **aprovada com ajustes** pelo CTO (28/07/2026).  
> Encerramento: [`marco-encerramento-f6.md`](marco-encerramento-f6.md).  
> Pacote: F6-00…F6-05 ✅ · F6-06 dispensado.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O mandato que abre a Fase F6 e define **como** a evolução do CEO de **produto** para **ecossistema executivo** deve ser elaborada — em visão, arquitetura, organização e documentação. |
| **Por que existe?** | Sem mandato explícito, a F6 arriscaria reabrir F1–F5, tratar Marketplace como fundação, confundir fase documental com implementação, ou fragmentar o programa em um IPR paralelo. |
| **Para quem?** | CTO (gate de abertura); Engenheiro (elaboração documental sob este mandato); Usuário (transparência e homologação estratégica). |
| **Sucesso?** | CTO homologa: (a) F6 aberta sob este mandato na IPR-001; (b) domínios estruturantes fixados; (c) escopo / fora de escopo / princípios claros; (d) critérios de abertura e encerramento explícitos; (e) nenhum outro F6-nn iniciado antes deste gate. |

---

## 1. Declaração de abertura

Fica proposta a abertura oficial da **Fase F6 — Ecossistema Executivo** da **IPR-001**.

**Objeto:** definir a evolução do CEO de produto (Gabinete / experiência / arquiteturas F1–F5) para **ecossistema executivo**, organizando visão, arquitetura de ecossistema, modelo evolutivo, plataforma e estratégia de expansão — **sem** contradizer F1–F5 e **sem** iniciar implementações da própria F6 sem deliberação específica.

**Vigência da abertura:** a Fase F6 considera-se **oficialmente iniciada** somente após a **homologação formal deste F6-00 (Gate F6-00)** pelo CTO.

### 1.1 Nota de nomenclatura (vinculante neste mandato)

| Antes (referências em F5) | Neste mandato |
|---------------------------|---------------|
| “F6” citada como sede futura de IMP / ADR-006 | **F6 = Ecossistema Executivo** (fase documental da IPR-001) |
| Implementação de capacidades | Continua sob **ADR-006** e **Ondas Operacionais**, quando autorizadas — **não** usa o rótulo F6 como fase de código |

Documentos F1–F5 **não são alterados** por este mandato; a nomenclatura acima prevalece para a condução da F6 e artefatos F6-nn posteriores.

### 1.2 Continuidade do programa (IPR)

| Decisão CTO | Norma |
|-------------|-------|
| Manter F6 na **IPR-001** | Obrigatória |
| **Não** abrir IPR-002 neste momento | Obrigatória |
| Ecossistema = continuação natural do mesmo programa estratégico | Obrigatória |

---

## 2. Objetivo da fase

Transformar o entendimento oficial do CEO de **produto executivo navegável** (herdado de F1–F5 + Ondas 01–02) em **ecossistema executivo** coerente, no qual:

1. O **Core / Gabinete** permanece protegido e utilizável.  
2. Quatro **domínios estruturantes** organizam a evolução.  
3. A expansão (incl. Business) não compete com o Core nem reabre arquiteturas homologadas.  
4. A documentação da F6 prepara deliberações futuras (REQ/ADR/Ondas) **sem** antecipar implementação da própria F6.

---

## 3. Domínios estruturantes do Ecossistema

São **domínios estruturantes** permanentes da F6 (não opcionais):

| Domínio | Papel resumido |
|---------|----------------|
| **CEO Product** | Produto executivo, Gabinete, experiência e capacidades de uso |
| **CEO Business** | Frente empresarial / demonstração / expansão comercial do ecossistema |
| **CEO Governance** | Governança normativa, gates, autoridade e rastreabilidade |
| **CEO Intelligence** | Inteligência do ecossistema (aprendizado, mercado como fonte estruturada, orquestração sob governança) |

**Relação com CON-001 Art. 4º:** os pilares do produto (Governança, Conhecimento, Execução, Aprendizado) **permanecem**; os quatro domínios acima são camada de **condução do ecossistema**, **complementar**, não substitutiva.

### 3.1 Marketplace

**Marketplace não é pilar estrutural da F6.**

Quando pertinente, poderá surgir como **consequência natural** do ecossistema definido — nunca como elemento fundacional de F6-01…F6-05.

---

## 4. Escopo

| Inclui (documental / organizacional) | Detalhe |
|--------------------------------------|---------|
| Visão do Ecossistema Executivo | F6-01 |
| Arquitetura do Ecossistema | F6-02 — contratos e fronteiras entre os quatro domínios |
| Modelo Evolutivo | F6-03 — fases × ondas × ADR-006; evolução sem confundir com backlog fechado |
| Plataforma Executiva | F6-04 — Core protegido; especializações; Gabinete como evidência |
| Estratégia de Expansão | F6-05 — expansão do ecossistema; Business; sem IMP |
| Gate documental opcional | F6-06 — **somente se** deliberado ao final da fase |
| Marcos de início/encerramento | Após Gate F6-00 / ao encerrar a fase |
| Citação de F1–F5, CON, VIS, ADR, Ondas 01–02 | Herança normativa — sem reescrita |

---

## 5. Fora de escopo

| Exclui | Motivo |
|--------|--------|
| Alterar documentos **homologados** F1–F5 | Preservar governança |
| Abrir **IPR-002** | Decisão CTO — continuidade IPR-001 |
| Tratar **Marketplace** como fundação | Consequência eventual, não pilar |
| Iniciar **F6-01…F6-05** antes do Gate F6-00 | Este mandato |
| Implementações **pertencentes à própria F6** sem deliberação específica | §6 / D-F6-04 |
| Reabrir CX / PUX / AX / F4 / MVX | Herança; só por deliberação formal fora deste pacote |
| Onda Operacional 03 (ou equivalente) como default da F6 | Não aberta; só se autorizada à parte |
| LLM / voz / agentes / automações como entregáveis da F6 | Fora da fase documental |
| Design system / layouts finais como substituto da F6 | F5 permanece sede UX/UI |

---

## 6. Princípios da fase (diretrizes permanentes D-F6)

| # | Diretriz | Força |
|---|----------|-------|
| **D-F6-01** | A F6 é continuidade da **IPR-001**; não fragmenta o programa em novo IPR neste momento. | Normativa |
| **D-F6-02** | F1–F5 (e CON/VIS/ADR aplicáveis) são **referência obrigatória**; a F6 **cita**, não contradiz nem reescreve homologados. | Normativa |
| **D-F6-03** | Os domínios **Product · Business · Governance · Intelligence** são estruturantes; Intelligence **não** é opcional. | Normativa |
| **D-F6-04** | Durante a F6 **não serão iniciadas implementações pertencentes à própria F6** sem deliberação específica. Esta diretriz **não impede** pequenas **Ondas Operacionais** de manutenção ou evolução do **produto existente**, quando **formalmente autorizadas**. | Normativa |
| **D-F6-05** | Marketplace **não** é pilar fundacional da F6. | Normativa |
| **D-F6-06** | Um artefato F6-nn por vez; próximo só após homologação (ou deliberação explícita do CTO). | Normativa |
| **D-F6-07** | F6-06 permanece **opcional**; a necessidade de gate documental de encerramento será avaliada **ao final** da fase. | Normativa |

### 6.1 Cascata normativa (herança)

| Camada | Força na F6 |
|--------|-------------|
| **CON-001**, ADRs (esp. 002, 006, 015, 016) | Obrigatória |
| **F1–F2** — diretrizes e princípios de experiência | Obrigatória |
| **F3** — capacidades / CX | Obrigatória (não reabrir) |
| **F4** — arquitetura técnica | Obrigatória (não reabrir) |
| **F5** — arquitetura UX/UI + MVX | Obrigatória (não reabrir) |
| **Ondas 01–02** + app do Gabinete | Evidência operacional do Product (insumo) |

---

## 7. Relação com F1–F5

| Fase | Relação com a F6 |
|------|------------------|
| **F1** | Diretrizes de experiência — inalteradas; ecossistema não as substitui |
| **F2** | Conceito / princípios (PX/IX) — base; eventuais princípios novos (ex. PX-11) só por deliberação posterior, não neste mandato |
| **F3** | Capacidades e CX — Core funcional; F6 não redesenha o mapa CX |
| **F4** | Arquitetura técnica do produto — distinta da **arquitetura do ecossistema** (F6-02) |
| **F5** | Arquitetura UX/UI — permanece sede de superfície; F6 não a reabre |
| **Ondas 01–02** | Consolidam o Gabinete no produto; alimentam F6-04 como evidência, não como nova F-fase de código |

**Regra de ouro:** a F6 **organiza o ecossistema em cima** do que F1–F5 e as Ondas já homologaram; não compete com elas.

---

## 8. Entregáveis previstos da F6 (após Gate F6-00)

| ID | Entrega | Estado sob este mandato |
|----|---------|-------------------------|
| **F6-00** | Mandato de abertura | Este documento — aguarda Gate |
| **F6-01** | Visão do Ecossistema Executivo | Bloqueado até Gate F6-00 |
| **F6-02** | Arquitetura do Ecossistema | Bloqueado até F6-01 (ordem proposta) |
| **F6-03** | Modelo Evolutivo | Após F6-02 |
| **F6-04** | Plataforma Executiva | Após F6-02 (pode paralelizar com F6-03 sob deliberação) |
| **F6-05** | Estratégia de Expansão | Após F6-01 + F6-02 + F6-04 |
| **F6-06** | Matriz / gate documental de encerramento | **Opcional** — decisão ao final da fase |
| Marcos | Início / encerramento F6 | Após Gate F6-00 / ao encerrar |

Ordem detalhada e dependências: conforme proposta F6 aprovada com ajustes (CTO, 28/07/2026).

---

## 9. Critérios de abertura (Gate F6-00)

A Fase F6 abre oficialmente quando **todos** forem verdadeiros:

1. Onda Operacional 02 **homologada** (pré-condição já satisfeita na deliberação de abertura).  
2. Este **F6-00** homologado pelo CTO (Gate F6-00).  
3. Confirmação explícita de: continuidade **IPR-001**; quatro domínios estruturantes; D-F6-01…07.  
4. Nenhum F6-01…F6-05 iniciado antes deste gate.  
5. Compromisso de **não alterar** homologados F1–F5 neste ato de abertura.

---

## 10. Critérios de encerramento da F6

A Fase F6 poderá ser **encerrada** quando:

1. **F6-01 a F6-05** estiverem elaborados e **homologados** (ou formalmente dispensados por deliberação do CTO, com registro).  
2. A decisão sobre **F6-06** estiver tomada: elaborar e homologar **ou** dispensar explicitamente (D-F6-07).  
3. Nenhum artefato F6 contradisser F1–F5 / CON / ADRs aplicáveis.  
4. Existir **marco de encerramento** da F6 com Memória Organizacional.  
5. Estiver claro o que segue **depois** da F6 (ex.: Ondas Operacionais, emendas CON/VIS, ou nova fase) — **sem** iniciar essa frente dentro do ato de encerramento, salvo deliberação própria.

---

## 11. Restrições operacionais

* Não iniciar F6-01…F6-05 (nem F6-06) antes do Gate F6-00.  
* Não alterar documentos homologados F1–F5.  
* Não tratar Marketplace como fundação.  
* Não iniciar implementações da **própria F6** sem deliberação específica (D-F6-04).  
* Ondas Operacionais de manutenção/evolução do produto existente: **somente** com autorização formal — fora do “default” da F6.  
* Sem commit deste mandato até autorização do Usuário/CTO, se exigido pela condução do repositório.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO definiu ajustes e solicitou F6-00 |
| Quando | 28/07/2026 |
| Por quê | Abrir F6 sob proposta aprovada com ajustes; fixar mandato antes de F6-01…05 |
| Baseado em quê | Proposta F6; revisão CTO (IPR-001; quatro domínios; Marketplace; D-F6-04; F6-06 opcional); F0–F5; Onda 02 homologada; ADR-002/006/015 |
| Resultado | F6-00 **homologada** (Gate F6-00); F6 oficialmente aberta; F6-01 elaborado e aguarda Gate F6-01 |

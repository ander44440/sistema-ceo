# Proposta de atualização documental — Marco Estratégico: Transição para o CEO Business

> **Status: RASCUNHO — aguarda homologação do Usuário (com revisão do CTO).**  
> **Natureza:** proposta de governança. **Não altera** documentos homologados.  
> **Data:** 28/07/2026.  
> **Origem:** deliberação do Usuário — Registro de Marco Estratégico (transição para o CEO Business).  
> **Sede do projeto:** `E:\anderson\CEO` (este arquivo).  
> **Regra:** nenhuma modificação em CON/VIS/PX/ADR/ROADMAP/CAP homologados até aprovação explícita desta proposta (ou de versão emendada).

---

## Memória Organizacional (proposta)

| Campo | Registro |
|-------|----------|
| Quem propôs | Engenheiro (Cursor), a partir da deliberação do Usuário |
| Quando | 28/07/2026 |
| Por quê | Registrar oficialmente a bifurcação permanente Product × Business e o regime pós-ciclo F7 |
| Baseado em quê | CON-001 v1.2; VIS-001/002; F2-04 (PX-01…10); ROADMAP-001; ADR-002/004/015/016; docs/README (taxonomia); estado IPR-001 (F0–F5 ✅; F6+ pendente) |
| Resultado esperado | Homologação desta proposta → abertura ordenada dos artefatos listados abaixo |

---

## 1. As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O registro oficial do marco que institui duas frentes permanentes (CEO Product e CEO Business), quatro pilares de ecossistema, PX-11, disciplina SEC e o regime de evolução orientada pelo uso/contexto após o ciclo F7. |
| **Por que existe?** | Sem este marco, Product e Business competem no mesmo backlog; o Core pode ser alterado por especializações ad hoc; e o mercado não entra como fonte estruturada de conhecimento sob Governança. |
| **Para quem existe?** | Usuário (homologação), CTO (revisão normativa), Engenheiro (execução documental pós-aprovação), futuros agentes conectados. |
| **Como o sucesso será medido?** | Quando (a) a taxonomia e os artefatos novos existirem com status oficial; (b) nenhum documento homologado tiver sido alterado sem emenda rastreável; (c) PX-11, SEC e Business tiverem sede canônica; (d) a distinção Core × especialização × Business estiver inequívoca. |

---

## 2. Síntese das decisões a registrar (14 pontos)

| # | Decisão | Classificação |
|---|---------|---------------|
| 1 | F7 encerra o 1º grande ciclo evolutivo do CEO | Marco de ciclo (Product) |
| 2 | Após F7 não há roadmap fechado de funcionalidades | Regime de evolução (Product + Governance) |
| 3 | Crescimento orientado pela utilização real | Regime + PX-11 |
| 4 | Core Executivo único e protegido pela governança | Invariante constitucional / arquitetural |
| 5 | Princípio **PX-11 — Evolução Orientada pelo Contexto** | Princípio permanente de experiência |
| 6 | Identificar domínio, adaptar, aprender, padrões, propor, homologar; nunca alterar arquitetura sozinho | Comportamento do Agente Executivo + Intelligence subordinada |
| 7 | Especializações (Legal, Health, …) derivam do mesmo Core | Identidade + arquitetura de produto |
| 8 | Usuário nunca escolhe especialização manualmente | Invariante de experiência (PX-11 / IX) |
| 9 | “A primeira reunião é com o próprio CEO” | Posicionamento Business + demonstração Product |
| 10 | Lançamento Silencioso (Site → demo CEO → material → WP → lista → contato → reunião humana) | Estratégia comercial (Business) |
| 11 | Família **SEC-001…007** | Nova disciplina documental |
| 12 | Quatro pilares permanentes: Product, Business, Governance, Intelligence | Pilares de **ecossistema** (distintos dos pilares CON-001 Art. 4º) |
| 13 | Mercado como fonte estruturada de conhecimento, sem comprometer o Core | Intelligence + Governance |
| 14 | Projeto como ecossistema empresarial (produto + empresa + governança + inteligência) | Identidade institucional / Constituição |

---

## 3. Tensão normativa a resolver na homologação

### 3.1 Pilares CON-001 × pilares de ecossistema

| Camada | Pilares | Sede atual |
|--------|---------|------------|
| **Produto (CON-001 Art. 4º)** | Governança · Conhecimento · Execução · Aprendizado | Homologado — **não substituir** |
| **Ecossistema (novo)** | CEO Product · CEO Business · CEO Governance · CEO Intelligence | Ainda inexistente |

**Recomendação:** tratar os quatro novos como **pilares de condução do ecossistema empresarial**, **complementares** aos pilares do Art. 4º — não como substituição. A Constituição deve ser emendada apenas para *reconhecer* a camada de ecossistema e subordinar Intelligence à Governance, preservando Art. 4º.

### 3.2 Estado real do ciclo F × declaração F7

| Fato documental atual | Implicação |
|----------------------|------------|
| IPR-001: F0–F5 ✅; F6+ pausada à deliberação do CTO | F7 **ainda não existe** como fase encerrada |
| Learning `2026-07-26-inicio-construcao-ceo.md` | Foco atual = construção navegável |

**Recomendação:** homologar F7 como **marco de fechamento do 1º ciclo** *planejado/declarado*, com definição explícita do que F6 e F7 cobrem, **sem** reescrever marcos F5 já homologados. Até F7 fechar de fato, o regime “sem roadmap fechado” permanece **prospectivo**.

### 3.3 ROADMAP-001 × “sem roadmap fechado de funcionalidades”

ROADMAP-001 (homologado) organiza épicos até CEO 1.0. A decisão #2 não apaga o tipo ROADMAP nem o histórico: muda o **regime pós-F7** de “lista fechada de features” para **evolução orientada por uso + propostas homologadas**.

**Recomendação:** emendar ROADMAP-001 (ou emitir ROADMAP-002) *após* F7, declarando o novo regime; até lá, ROADMAP-001 permanece a orientação estratégica vigente.

---

## 4. Documentos impactados (existentes) — sem alteração agora

| Documento | Impacto proposto (após homologação) | Justificativa |
|-----------|-------------------------------------|---------------|
| **CON-001** | Emenda: (a) reconhecer ecossistema Product/Business/Governance/Intelligence; (b) subordinar Intelligence à Governance; (c) proteger Core Executivo; (d) reforçar que o Agente não altera arquitetura sozinho | Única sede para natureza do projeto e hierarquia de autoridade (Art. 11) |
| **VIS-001** | Emenda futura *opcional* ou VIS complementar: ecossistema + especializações + demonstrador | VIS-001 é fundacional; preferir complemento ao estilo VIS-002 |
| **VIS-002** | Emenda ou nova VIS-00x de identidade comercial/institucional: “primeira reunião é com o CEO”; Lançamento Silencioso como horizonte de GTM | Identidade institucional já é o eixo certo para marca/posição sem misturar REQ |
| **F2-04** (`PX-01…10`) | Incluir **PX-11** + eventual IX derivado (não escolher especialização) | Sede canônica dos princípios permanentes de experiência |
| **ROADMAP-001** | Emenda pós-F7 ou **ROADMAP-002** “regime pós-ciclo-1” | Evita contradizer o plano até 1.0 ainda vigente |
| **ADR-002** | Referência cruzada (aprendizado organizacional / BCO ↔ Intelligence) | Já descreve aprendizado contínuo; alinhar nomenclatura ao pilar Intelligence |
| **ADR-015** | Alinhar linguagem: uso operacional → uso real + contexto de domínio | Já prioriza uso diário; estender ao regime pós-F7 |
| **docs/README.md** | Incluir tipos **SEC** e **BUS** (ou nome homologado) na taxonomia | Exigência ADR-004: novo tipo só via ADR + catálogo |
| **CAP-001** | Entrada futura (CAP-E) para “adaptação contextual / especialização derivada do Core” — **não agora** | Só após VIS + ADR do Core; evitar CAP prematura |
| **IPR-001 / marcos F5** | Apenas *referência* no marco de ciclo; sem reabrir F5 | F5 homologada permanece intacta |
| **learning/** | Este arquivo + marco oficial pós-aprovação | Rastreabilidade (Art. 8º) |

---

## 5. Novos artefatos necessários

### 5.1 Obrigatórios (nessa ordem lógica)

| ID proposto | Tipo | Conteúdo | Justificativa |
|-------------|------|----------|---------------|
| **ADR-019** (nº sugerido) | ADR | Institui tipos documentais **BUS** (Business) e **SEC** (Segurança); define sedes `docs/business/` e `docs/security/`; regra de criação | ADR-004: tipos novos exigem ADR |
| **ADR-020** (nº sugerido) | ADR | Proteção do **Core Executivo**; especializações derivadas; proibição de autoalteração arquitetural; Intelligence propõe → Governance homologa | Decisões estruturais #4, #6, #7, #12–13 |
| **ADR-021** (nº sugerido) | ADR | Regime pós-F7: evolução orientada por uso/contexto; fim do roadmap fechado de features; relação com ROADMAP-001/002 | Decisões #1–3 |
| **Marco de ciclo** | learning ou product marco | “Encerramento do 1º ciclo (até F7)” — quando F7 fechar de fato | Decisão #1 com evidência |
| **VIS-008** (nº sugerido) | VIS | Visão do ecossistema CEO (Product ∥ Business) + conceito demonstrador | Decisões #9, #14 sem sobrecarregar VIS-001 |
| **VIS-009** (nº sugerido) | VIS | Visão GTM — Lançamento Silencioso e funil Site→…→reunião humana | Decisão #10 |
| **Emenda F2-04** | product (PX) | Texto normativo **PX-11 — Evolução Orientada pelo Contexto** + IX associado | Decisões #5, #6, #8 |
| **Emenda CON-001** | CON | Artigos/parágrafos: ecossistema; Core; Intelligence⊂Governance | Decisões #4, #12, #14 |
| **BUS-001** | BUS | Carta estratégica CEO Business (marca, posicionamento, crescimento) | Frente #2 |
| **BUS-002** | BUS | Playbook Lançamento Silencioso (fluxo oficial) | Decisão #10 |
| **SEC-001…007** | SEC | Família de Segurança (ver §5.3) | Decisão #11 |

### 5.2 Recomendados (segunda onda)

| ID | Tipo | Conteúdo |
|----|------|----------|
| **CNC-00x** | concepts | Conceitos: Core Executivo; Especialização contextual; Proposta de evolução; Homologação de evolução |
| **ROADMAP-002** | ROADMAP | Plano de *condução* pós-F7 (não lista fechada de features) — hipóteses de uso, ondas de validação, gates de Intelligence |
| **CAP-E-xxx** | CAP-E | Capacidade de observação de uso / propostas de evolução (só após ADR-020/021 + VIS) |
| **IX-xx** em F2-04 | invariante | “Especialização não é escolha manual do usuário” |

### 5.3 Família SEC — escopo sugerido (para homologação de nomes)

| Doc | Tema sugerido (proposta — ajustável pelo CTO) |
|-----|-----------------------------------------------|
| **SEC-001** | Política de segurança e escopo da disciplina |
| **SEC-002** | Classificação de dados e ativos |
| **SEC-003** | Identidade, autenticação e sessão |
| **SEC-004** | Autorização, papéis e isolamento de contexto (COA) |
| **SEC-005** | Segredos, chaves e configuração |
| **SEC-006** | Auditoria, rastreabilidade e resposta a incidente |
| **SEC-007** | Segurança do Core e das especializações (não contaminação de fronteiras) |

> Numeração e títulos finais ficam sujeitos à ADR-019 + revisão CTO. Não criar os sete arquivos até a ADR ser Aceita.

---

## 6. Ordem recomendada de atualização (após homologação desta proposta)

```text
0. Homologar ESTA proposta (Usuário + revisão CTO)
1. ADR-019 — tipos BUS e SEC + sedes + entrada no docs/README
2. ADR-020 — Core Executivo + Intelligence subordinada + especializações
3. Emenda CON-001 — reconhecimento do ecossistema (mínima, Art. 11)
4. Emenda F2-04 — PX-11 (+ IX se deliberado)
5. VIS-008 — ecossistema / demonstrador
6. VIS-009 — Lançamento Silencioso
7. BUS-001 / BUS-002 — sede Business operacional
8. SEC-001 (política) → SEC-002…007 em sequência com gates
9. ADR-021 — regime pós-F7 (pode ser paralelo a 5–6 se F7 ainda prospectivo)
10. Definição explícita do escopo F6 e F7 → execução → marco de encerramento do 1º ciclo
11. ROADMAP-002 (ou emenda ROADMAP-001) só após marco F7 real
12. CAP-E de Intelligence / observação de uso — último entre os estruturais
```

**Proibições até o passo 0:** editar CON, VIS, F2-04, ROADMAP-001, CAP-001 ou criar SEC/BUS como se já fossem oficiais.

---

## 7. Mapeamento decisão → artefato canônico

| Decisão # | Artefato canônico (após fluxo) | Artefato de suporte |
|-----------|--------------------------------|---------------------|
| 1 | Marco de ciclo + ADR-021 | learning |
| 2–3 | ADR-021 + ROADMAP-002 | ADR-015 (alinhamento) |
| 4 | ADR-020 + emenda CON-001 | ARQ futuro do Core |
| 5, 8 | F2-04 PX-11 (+ IX) | CX futuras (não agora) |
| 6 | ADR-020 + PX-11; CAP-E depois | BCO / ADR-002 |
| 7 | ADR-020 + VIS-008 | CNC especialização |
| 9–10 | VIS-008/009 + BUS-001/002 | site/materiais (fora de `/docs` até existir) |
| 11 | ADR-019 + SEC-001…007 | norms (vínculo se aplicável) |
| 12–14 | Emenda CON-001 + VIS-008 | docs/README pilares de ecossistema |

---

## 8. O que deliberadamente NÃO se faz nesta proposta

* Não altera código em `app/`.
* Não reabre F0–F5 nem CAP-03 baseline.
* Não cria especializações (CEO Legal, etc.) como produtos separados.
* Não substitui os pilares do Art. 4º da CON-001.
* Não declara F7 encerrada sem definição e evidência de F6/F7.
* Não publica Lançamento Silencioso operacional sem BUS + VIS homologados.

---

## 9. Pedido de homologação

Solicita-se ao **Usuário** (com revisão do **CTO**):

1. **Aceitar / Aceitar com ajustes / Rejeitar** esta proposta.  
2. Confirmar nomenclatura dos tipos (**BUS**, **SEC**) e numeração ADR-019…021.  
3. Confirmar o tratamento dos pilares de ecossistema como **camada complementar** ao Art. 4º.  
4. Confirmar que F6/F7 ainda serão definidos antes do “encerramento do 1º ciclo”.  
5. Autorizar, só após (1), a execução da ordem do §6.

---

## 10. Histórico

| Versão | Data | Evento |
|--------|------|--------|
| 0.1 | 28/07/2026 | Rascunho inicial para homologação — Engenheiro (Cursor) |

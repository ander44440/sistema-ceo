# F5-02 — Modelo Canônico da Arquitetura UX/UI

> **Status: Homologada — Gate F5-02 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **padrão metodológico normativo** — template e regras para todos os artefatos de UX/UI da F5.  
> **Força:** **obrigatório** para todos os artefatos `F5-nn` (n ≥ 03) e para emendas sob a F5.  
> Pré-condições: F5-01 **homologada**; F4 **encerrada**; F5 **iniciada**.  
> Diretrizes vinculantes: **D-F5-01**, **D-F5-02**, **D-F5-03**.  
> Normas de uso: **N-F5-01**, **N-F5-02**, **N-F5-03** (abaixo).  
> **Marco:** [`marco-fundacao-normativa-arquitetura-ux-ui.md`](marco-fundacao-normativa-arquitetura-ux-ui.md)  
> **Proibições neste registro:** sem layouts; sem wireframes; sem design visual; sem protótipos; sem código; sem stack; sem implementação; sem commit neste registro.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O modelo canônico (estrutura + regras) para produzir qualquer especificação de UX/UI da Fase F5 de forma homogênea, rastreável e subordinada a F3 e F4. |
| **Por que existe?** | Sem canônico, artefatos F5 divergem, perdem rastreio funcional/técnico ou saltam para layout/código cedo demais. |
| **Para quem?** | CTO (revisão homogênea); Engenheiro (produção F5-03+); Usuário (transparência do método). |
| **Sucesso?** | Todo artefato F5-nn posterior usa este modelo; campos obrigatórios preenchidos; zero layout/wireframe/protótipo/código neste nível metodológico. |

---

## Normas de uso (registradas no Gate F5-02)

| ID | Norma | Força |
|----|-------|-------|
| **N-F5-01** | Todo artefato de UX/UI deverá seguir a **estrutura definida neste F5-02**. | Normativa — obrigatória |
| **N-F5-02** | Toda decisão de UX/UI deverá apresentar **rastreabilidade explícita** para **F3** e **F4**. | Normativa — obrigatória |
| **N-F5-03** | **Exceções** ao modelo canônico exigem **deliberação arquitetural formal** (CTO; ADR quando exigido). | Normativa — obrigatória |

O Modelo Canônico da Arquitetura UX/UI (**este documento**) passa a ser **obrigatório** para todos os artefatos `F5-nn`.

---

## 1. Objetivo dos artefatos da F5 (definição normativa)

Todo **artefato de experiência** da F5 (exceto o próprio mandato F5-01 e este canônico) existe para:

> Traduzir **uma fatia** da Arquitetura Funcional (CX, ciclo, estados) e da Arquitetura Técnica (CMP, FLX, IFA, obrigações MVA) em **organização da experiência** — papéis de superfície, atos de uso, precedências de atenção, obrigações de interação e critérios de desejabilidade arquitetural — **sem** escolher layout, wireframe, design visual, protótipo, stack ou implementação.

| Este modelo **é** | Este modelo **não é** |
|-------------------|------------------------|
| Método e template reutilizável | Um wireframe ou mapa de pixels |
| Contrato de qualidade documental da F5 | Um REQ (REQ-xxx) |
| Ponte entre F3/F4 e futuros ARQ/REQ/IMP | Autorização de código |
| Normativo para F5-03+ | Design system visual preenchido |

**Fluxo documental previsto:**

```text
F5-01 Mandato (por quê / escopo da fase)
  → F5-02 Canônico (como especificar UX/UI)
    → F5-03+ Artefatos de experiência (o quê, sob este canônico)
      → (quando deliberado) fundações/padrões visuais documentais
        → ARQ/REQ → IMP → VAL (ADR-006 / F6)
```

---

## 2. Estrutura obrigatória de cada especificação de UX/UI

Todo artefato F5-nn (n ≥ 03), ou seção de experiência canônica equivalente, **deve** conter as seções abaixo, **nesta ordem**.

### 2.1 Cabeçalho e metadados

| Campo | Obrigatório | Conteúdo permitido | Proibido |
|-------|-------------|--------------------|----------|
| **ID** | Sim | `F5-nn` (sede IPR) e/ou `ARQ-nnn` se emitido | ID inventado fora da sequência |
| **Título** | Sim | Nome de experiência / interação curto | Nome de componente React / tela implementada |
| **Versão** | Sim | `vX.Y` + data (ver §7) | — |
| **Status** | Sim | Em elaboração / Em revisão / Homologada / Obsoleta / Emendada | — |
| **Escopo MVP-A** | Sim | Lista de CX / CMP / FLX cobertos | Absorver evolutivas sem deliberação |
| **Padrão metodológico** | Sim | Referência a este F5-02 | — |
| **Diretrizes D-F5** | Sim | Confirmação de D-F5-01…03 | — |

### 2.2 Corpo canônico (sete eixos obrigatórios)

#### (1) Objetivo do artefato

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Declara *qual problema de experiência* resolve e *qual fatia* F3/F4 cobre. |
| **Deve** | Citar CX e/ou CMP/FLX e/ou mecanismo F2 (ciclo, COA, Foco…). |
| **Não deve** | Justificar tipografia, cor, grid, ferramenta de prototipagem ou stack. |

#### (2) Responsabilidades de experiência

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Listas *Compete a este artefato* / *Não compete*. |
| **Deve** | Fronteiras alinhadas a CX (D-F5-01) e a CMP/FLX (D-F5-02). |
| **Não deve** | Inventar capacidade; expor seletor de meios; fundir D4 e D5 na superfície. |

#### (3) Papéis de superfície e atos de uso

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Descrever **papéis** (ex.: posto de comando, conversa, atenção, gate) e **atos** (perceber, decidir, autorizar, retomar) em linguagem de experiência. |
| **Classificar** | Permanente / Transitório / Ato (F2-02), quando aplicável. |
| **Não deve** | Coordenadas de layout, wireframes, mocks, tokens CSS, protótipos navegáveis. |

#### (4) Dependências e responsabilidades cruzadas

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Tabela de vínculos a CX (F3), CMP/FLX/IFA (F4) e outros artefatos F5. |
| **Tipos** | Estrutural → / ciclo ⇒ / governança ⇢ / transversal ↔ (espelho F3-02). |
| **Não deve** | Inverter O0…O5 do MVP-A ou contradizer FLX sem deliberação formal. |

#### (5) Critérios de validação da experiência arquitetural

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Critérios inspecionáveis por revisão arquitetural de experiência (não testes de UI nem pixel). |
| **Deve** | Verificar rastreio F3/F4; conversa como centro; COA; objetivo antes de meios; alinhamento a FLX; honestidade quando couber. |
| **Não deve** | Casos de teste de código; checklists de componente visual; Lighthouse/a11y de implementação. |

#### (6) Restrições arquiteturais

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Lista explícita do que o artefato **proíbe** (além das D-F5). |
| **Deve** | Incluir: não alterar CX/CMP/FLX; não introduzir código/stack; não layout/wireframe neste estágio metodológico salvo deliberação. |

#### (7) Rastreabilidade

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Tabela completa — ver §3. |
| **Forma** | Matriz com eixos F3, F4, e complementar F1/F2/DA/PX/IX. |

### 2.3 Memória Organizacional

Obrigatória em todo artefato F5 (cinco campos CON-001 Art. 8º): Quem, Quando, Por quê, Baseado em quê, Resultado.

### 2.4 Template canônico (cópia integral)

```markdown
# F5-nn — [Título de experiência / interação]

> **Status:** …  
> **Versão:** v0.1 — AAAA-MM-DD  
> **Escopo MVP-A:** CX-… · CMP-… · FLX-…  
> **Padrão:** F5-02  
> **Diretrizes:** D-F5-01, D-F5-02, D-F5-03  

## 1. Objetivo do artefato
…

## 2. Responsabilidades de experiência
### Compete
### Não compete

## 3. Papéis de superfície e atos de uso
| Papel / Ato | Classe (P/T/Ato) | CX / CMP / FLX |
|-------------|------------------|----------------|
| … | … | … |

## 4. Dependências e responsabilidades cruzadas
| Relação | Alvo (CX/CMP/FLX/F5) | Tipo (→ / ⇒ / ⇢ / ↔) |
|---------|----------------------|----------------------|
| … | … | … |

## 5. Critérios de validação da experiência arquitetural
1. …
2. …

## 6. Restrições arquiteturais
- …

## 7. Rastreabilidade
| Eixo | Referências | Papel |
|------|-------------|-------|
| F3 | CX-… / F3-… | … |
| F4 | CMP-… / FLX-… / MVA | … |
| F1 / F2 | DA-… / D… | … |
| F5 | F5-01, F5-02 | … |
| PX / IX | … | … |

## Memória Organizacional
| Campo | Registro |
|-------|----------|
| Quem | … |
| Quando | … |
| Por quê | … |
| Baseado em quê | … |
| Resultado | … |
```

---

## 3. Critérios de rastreabilidade para F3 e F4

Toda especificação de UX/UI **deve** preencher a matriz abaixo. Células genuinamente N/A usam `—` com nota.

| Eixo | Obrigatório | Conteúdo mínimo | Falha (rejeição de gate) |
|------|-------------|-----------------|--------------------------|
| **F3** | Sim | Uma ou mais **CX** do MVP-A + alinhamento a F3-02/F3-04 | CX inventada; alterar responsabilidade CX; UX órfã de capacidade |
| **F4** | Sim | **CMP** e/ou **FLX** e/ou **IFA** aplicáveis; respeito à **MVA** quando a fatia for validável | Contradizer FLX; fundir D4/D5; seletor de meios; ignorar MVA |
| **F1** | Sim | Ao menos uma **DA** aplicável **ou** N/A justificada | Decisão de UX/UI órfã quando a fatia implica DA-001…003 |
| **F2** | Sim | Domínios **D1–D5** e/ou mecanismo F2 (ciclo, Foco, T/P, COA) | Contradizer F2-01…F2-04 |
| **DA / PX / IX / P1–P6** | Sim | IDs citados com papel | Princípios só decorativos |
| **F5-01 / F5-02** | Sim | Confirma mandato e este canônico | Artefato fora do modelo |
| **D-F5-01…03** | Sim | Conformidade explícita | Viola F3 (UX), F4 (UI/interação) ou introduz código/stack/IMP |

**Regra de ouro (D-F5-01 + D-F5-02):** se a rastreabilidade F3 **ou** F4 estiver incompleta ou contraditória, o artefato **não** é homologável.

---

## 4. Regras de responsabilidades e dependências

1. **F3 manda o quê; F4 manda a organização; F5 traduz a experiência** — não substitui CX nem CMP/FLX.  
2. **Precedência F3-02** — a experiência respeita O0…O5; inversão exige deliberação formal.  
3. **FLX obrigatório** — fluxos de uso **alinhados** a FLX-01…06; não reinventar o ciclo.  
4. **MVA** — decisões de UI/interação que toquem comportamento integrado devem permanecer **validáveis** pela MVA (sem virar teste de software).  
5. **Conversa como centro** — papéis auxiliares não usurpam a Porta de Conversa (CMP-003 / CX-05).  
6. **D4 ≠ D5** — orquestração permanece invisível; execução/efeito perceptível sem seletor de meios.  
7. **COA** — isolamento e lente ativa (CX-01) em toda superfície que toque permanente/sessão.  
8. **Evolutivas** — CX-02/06/17/18 só por deliberação.  
9. **Conflito** — se dois artefatos F5 se contradisserem, prevalece alinhamento a F3+F4; o CTO arbitra.

---

## 5. Critérios de validação da experiência arquitetural (gate)

Um artefato F5-nn (n ≥ 03) só é **homologável** se:

| # | Critério |
|---|----------|
| V1 | Estrutura §2 completa (metadados + sete eixos + memória). |
| V2 | Matriz de rastreabilidade F3/F4 (§3) completa e coerente. |
| V3 | Conformidade D-F5-01 (F3 como referência de UX). |
| V4 | Conformidade D-F5-02 (F4/FLX/MVA como referência de UI e interação). |
| V5 | Conformidade D-F5-03 (ausência de código, stack e implementação). |
| V6 | Ausência de layouts, wireframes, design visual, protótipos neste estágio metodológico (salvo deliberação N-F5-03). |
| V7 | Dependências não invertidas vs F3-02 / FLX sem deliberação. |
| V8 | Critérios do eixo 5 inspecionáveis sem executar UI nem código. |
| V9 | Nomenclatura e versionamento conforme §7. |

**Validação deste F5-02 (Gate F5-02):** o CTO homologa quando reconhece o modelo como normativo e reutilizável por todos os artefatos F5 subsequentes.

---

## 6. Restrições arquiteturais da F5 (do modelo e dos artefatos sob ele)

| ID | Restrição |
|----|-----------|
| R1 | Proibido contradizer F3-01…F3-04 ou specs CX homologadas. |
| R2 | Proibido contradizer F4-01…F4-13 — em especial FLX e MVA. |
| R3 | Proibido alterar capacidades, precedências ou responsabilidades sem deliberação arquitetural formal. |
| R4 | Proibido, neste estágio metodológico e nos artefatos sob F5-02 *até deliberação*: layouts, wireframes, design visual (tokens/paletas fechadas), protótipos navegáveis. |
| R5 | Proibido código, stack, vendor, APIs concretas, schemas finais, infra e IMP (D-F5-03 / ADR-006). |
| R6 | Proibido transformar orquestração (D4) em superfície ou seletor de meios. |
| R7 | Proibido absorver evolutivas no MVP-A sem deliberação. |
| R8 | Artefato fora deste canônico = **não oficial** na F5. |
| R9 | Sem commit até autorização explícita. |

---

## 7. Convenções de nomenclatura e versionamento

### 7.1 Nomenclatura

| Elemento | Convenção |
|----------|-----------|
| Artefato de fase (IPR) | `F5-nn-<slug>.md` sob `docs/product/` |
| ID no documento | `F5-nn` — título em português de experiência/interação |
| Diretrizes da fase | `D-F5-nn` (D-F5-01…03) |
| Normas deste modelo | `N-F5-nn` (N-F5-01…03) |
| Restrições deste modelo | `R1…Rn` (locais ao F5-02; não confundir com REQ) |
| Specs em sedes | `docs/product/ux/` · `docs/product/ui/` — só quando um F5-nn as autorizar |
| Documento ARQ oficial | `ARQ-nnn-…` em `docs/architecture/` **somente** com emissão ADR-010 / autorização CTO |
| Referência a capacidade | Sempre `CX-nn` conforme F3-04 |
| Referência técnica | `CMP-nnn`, `FLX-nn`, `IFA-nn`, `CAT-nnn` conforme F4 |
| Arquivos | kebab-case; português sem acento no *slug* do ficheiro |

### 7.2 Versionamento

| Regra | Detalhe |
|-------|---------|
| Formato | `vMAJOR.MINOR` + data `AAAA-MM-DD` |
| **MINOR** | Esclarecimento, correção documental, expansão sem mudar obrigações |
| **MAJOR** | Mudança de obrigações, estrutura canônica ou fronteiras de experiência |
| Status | Rascunho → Em revisão → Homologada → Emendada / Obsoleta |
| Emenda | Nova versão; linha na Memória Organizacional; não apagar histórico normativo |
| Obsoleta | Mantida para rastreio; não citar como vigente |
| Relação ARQ | Se um F5-nn gerar ARQ-nnn, o ARQ registra a versão F5 de origem |

### 7.3 Localização

| Tipo | Local |
|------|-------|
| F5-nn (mandato, canônico, mapas de experiência da IPR) | `docs/product/` |
| Specs UX/UI derivadas | `docs/product/ux/` · `docs/product/ui/` |
| ARQ-nnn (quando autorizado) | `docs/architecture/` |
| REQ / IMP / VAL | Conforme ADR-006 — fora do canônico F5-02 (F6) |

---

## 8. Relação com F5-01 e próximos passos

| Artefato | Papel |
|----------|--------|
| F5-01 | Mandato e diretrizes D-F5 — **homologado** |
| **F5-02** | Este canônico + N-F5-01…03 — **homologado** (obrigatório) |
| F5-03 | Princípios Canônicos da Arquitetura UX/UI — em revisão |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-02 — canônico obrigatório; N-F5-01…03; abertura F5-03 |
| Baseado em quê | F5-01; D-F5-01…03; F4-02 (espelho metodológico); F3; F4 |
| Resultado | F5-02 **homologada**; Modelo Canônico obrigatório para toda a F5; Fundação Normativa consolidada; F5-03 submetido |

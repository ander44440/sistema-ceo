# F4-02 — Modelo Canônico da Arquitetura Técnica

> **Status: Homologada — Gate F4-02 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **padrão metodológico normativo** — template e regras para todos os artefatos técnicos da F4.  
> **Força:** **obrigatório** para todos os artefatos `F4-nn` (n ≥ 03) e para emendas técnicas sob a F4.  
> Pré-condições: F4-01 **homologada**; F3 **encerrada**; F4 **iniciada**.  
> Diretrizes vinculantes: **D-F4-01**, **D-F4-02**, **D-F4-03**.  
> Normas de uso: **N-F4-01**, **N-F4-02**, **N-F4-03** (abaixo).  
> Próximo artefato: [`F4-03-principios-arquiteturais-tecnicos.md`](F4-03-principios-arquiteturais-tecnicos.md).  
> **Proibições neste registro:** sem componentes; sem tecnologias; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O modelo canônico (estrutura + regras) para produzir qualquer especificação técnica da Fase F4 de forma homogênea, rastreável e subordinada à Arquitetura Funcional. |
| **Por que existe?** | Sem canônico, artefatos F4 divergem, perdem rastreio F1–F3 ou introduzem stack/UI cedo demais. |
| **Para quem?** | CTO (revisão homogênea); Engenheiro (produção F4-03+); Usuário (transparência do método). |
| **Sucesso?** | Todo artefato técnico F4-nn posterior usa este modelo; campos obrigatórios preenchidos; zero tech/UI indevida neste nível metodológico. |

---

## Normas de uso (registradas no Gate F4-02)

| ID | Norma | Força |
|----|-------|-------|
| **N-F4-01** | Todo artefato técnico deverá seguir a **estrutura definida neste F4-02**. | Normativa — obrigatória |
| **N-F4-02** | Toda decisão técnica deverá apresentar **rastreabilidade explícita** para **F1, F2 e F3**. | Normativa — obrigatória |
| **N-F4-03** | **Exceções** ao modelo canônico exigem **deliberação arquitetural formal** (CTO; ADR quando exigido). | Normativa — obrigatória |

O Modelo Canônico da Arquitetura Técnica (**este documento**) passa a ser **obrigatório** para todos os artefatos `F4-nn`.

---

## 1. Objetivo do artefato técnico (definição normativa)

Todo **artefato técnico** da F4 (exceto o próprio mandato F4-01 e este canônico) existe para:

> Traduzir **uma fatia** da Arquitetura Funcional (CX, ciclo, estados, fronteiras) em **organização técnico-lógica** do sistema — módulos/contextos, responsabilidades, dependências e obrigações verificáveis — **sem** escolher implementação, stack, API concreta ou superfície visual.

| Este modelo **é** | Este modelo **não é** |
|-------------------|------------------------|
| Método e template reutilizável | Um mapa CX→módulos preenchido |
| Contrato de qualidade documental da F4 | Um REQ (REQ-xxx) |
| Ponte entre F3 e futuros ARQ/REQ/IMP | Autorização de código |
| Normativo para F4-03+ | Documento de UX/UI (F5) |

**Fluxo documental previsto:**

```text
F4-01 Mandato (por quê / escopo da fase)
  → F4-02 Canônico (como especificar tecnicamente)
    → F4-03+ Artefatos técnicos (o quê, sob este canônico)
      → ARQ-nnn (quando CTO exigir tipo oficial ADR-010)
        → REQ → IMP → VAL (ADR-006)
```

---

## 2. Estrutura obrigatória de cada especificação técnica

Todo artefato técnico F4-nn (n ≥ 03), ou seção técnica canônica equivalente, **deve** conter as seções abaixo, **nesta ordem**.

### 2.1 Cabeçalho e metadados

| Campo | Obrigatório | Conteúdo permitido | Proibido |
|-------|-------------|--------------------|----------|
| **ID** | Sim | `F4-nn` (sede IPR) e/ou `ARQ-nnn` se emitido | ID inventado fora da sequência |
| **Título** | Sim | Nome técnico-lógico curto | Nome de tela/componente visual |
| **Versão** | Sim | `vX.Y` + data (ver §7) | — |
| **Status** | Sim | Em elaboração / Em revisão / Homologada / Obsoleta / Emendada | — |
| **Escopo MVP-A** | Sim | Lista de CX / fatias cobertas | Absorver evolutivas sem deliberação |
| **Padrão metodológico** | Sim | Referência a este F4-02 | — |
| **Diretrizes D-F4** | Sim | Confirmação de D-F4-01…03 | — |

### 2.2 Corpo canônico (sete eixos obrigatórios)

#### (1) Objetivo do artefato

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Declara *qual problema técnico-lógico* resolve e *qual fatia* da Arquitetura Funcional cobre. |
| **Deve** | Citar CX e/ou mecanismo F2 (ciclo, permanente/transitório, COA…). |
| **Não deve** | Justificar escolha de vendor, framework ou layout. |

#### (2) Responsabilidades técnico-lógicas

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Listas *Compete a este artefato* / *Não compete*. |
| **Deve** | Fronteiras alinhadas às specs CX (sem alterar responsabilidades — D-F4-02). |
| **Não deve** | Atribuir a um módulo a escolha de meios pelo usuário; execução a D4; UX/UI. |

#### (3) Entradas e saídas lógico-técnicas

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Entradas/saídas em linguagem de **estado, ato ou obrigação** — não payload de rede. |
| **Classificar** | Permanente / Transitório / Ato (F2-02), quando aplicável. |
| **Não deve** | JSON schemas, tópicos de fila, endpoints. |

#### (4) Dependências e responsabilidades cruzadas

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Tabela de dependências entre módulos/contextos **e** vínculo às CX (F3-02). |
| **Tipos** | Estrutural → / ciclo ⇒ / governança ⇢ / transversal ↔ (espelho F3-02, sem reinventar precedências). |
| **Não deve** | Inverter O0…O5 do MVP-A sem deliberação formal. |

#### (5) Critérios de validação técnica

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Critérios inspecionáveis por revisão arquitetural (não testes de software neste nível). |
| **Deve** | Verificar rastreio F1–F3; fronteiras; invisibilidade de orquestração; isolamento de COA. |
| **Não deve** | Casos de teste de código; critérios de pixel/UI. |

#### (6) Restrições arquiteturais

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Lista explícita do que o artefato **proíbe** (além das D-F4). |
| **Deve** | Incluir: não alterar CX; não introduzir F5; independência tecnológica neste estágio. |

#### (7) Rastreabilidade

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Tabela completa — ver §3. |
| **Forma** | Matriz com eixos F1, F2, F3, F4, DA/PX/IX/D1–D5/CX. |

### 2.3 Memória Organizacional

Obrigatória em todo artefato F4 (cinco campos CON-001 Art. 8º): Quem, Quando, Por quê, Baseado em quê, Resultado.

### 2.4 Template canônico (cópia integral)

```markdown
# F4-nn — [Título técnico-lógico]

> **Status:** …  
> **Versão:** v0.1 — AAAA-MM-DD  
> **Escopo MVP-A:** CX-…  
> **Padrão:** F4-02  
> **Diretrizes:** D-F4-01, D-F4-02, D-F4-03  

## 1. Objetivo do artefato
…

## 2. Responsabilidades técnico-lógicas
### Compete
### Não compete

## 3. Entradas e saídas lógico-técnicas
| Item | Direção | Classe (P/T/Ato) | Origem/destino |
|------|---------|------------------|----------------|
| … | … | … | … |

## 4. Dependências e responsabilidades cruzadas
| Relação | Alvo (módulo/CX) | Tipo (→ / ⇒ / ⇢ / ↔) |
|---------|------------------|----------------------|
| … | … | … |

## 5. Critérios de validação técnica
1. …
2. …

## 6. Restrições arquiteturais
- …

## 7. Rastreabilidade
| Eixo | Referências | Papel |
|------|-------------|-------|
| F1 | DA-… | … |
| F2 | D… / F2-… | … |
| F3 | CX-… / F3-… | … |
| F4 | F4-01, F4-02 | … |
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

## 3. Critérios de rastreabilidade para F1, F2 e F3

Toda especificação técnica **deve** preencher a matriz abaixo. Células genuinamente N/A usam `—` com nota.

| Eixo | Obrigatório | Conteúdo mínimo | Falha (rejeição de gate) |
|------|-------------|-----------------|--------------------------|
| **F1** | Sim | Ao menos uma **DA** aplicável **ou** nota explícita de N/A justificada | Decisão técnica órfã de diretriz quando a fatia implica DA-001…003 |
| **F2** | Sim | Domínios **D1–D5** e/ou mecanismo F2 (ciclo, Foco, Transitório/Permanente, COA) | Contradizer F2-01…F2-04 |
| **F3** | Sim | Uma ou mais **CX** do MVP-A + referência F3-02 (precedência) e/ou F3-04 | CX inventada; alterar responsabilidade CX; ignorar precedência |
| **DA / PX / IX** | Sim | IDs citados com papel | Princípios só “decorativos” sem vínculo |
| **F4-01 / F4-02** | Sim | Confirma mandato e este canônico | Artefato fora do modelo |
| **D-F4-01…03** | Sim | Conformidade explícita | Viola referência funcional, altera CX ou introduz UX/UI |

**Regra de ouro (D-F4-01):** se a rastreabilidade F3 estiver incompleta ou contraditória, o artefato **não** é homologável.

---

## 4. Regras de responsabilidades e dependências

1. **F3 manda, F4 traduz** — responsabilidades técnico-lógicas **refinam** CX; **não as substituem** (D-F4-02).  
2. **Precedência F3-02** — dependências técnicas **respeitam** O0…O5 do MVP-A; inversão exige deliberação formal.  
3. **Tipos de dependência** — usar o vocabulário F3-02 (→ estrutural, ⇒ ciclo, ⇢ governança, ↔ transversal).  
4. **Um dono por obrigação** — cada responsabilidade técnico-lógica tem um módulo/contexto responsável; evitar “todo mundo executa”.  
5. **D4 ≠ D5** — nenhum artefato atribui execução à orquestração nem expõe escolha de meios.  
6. **COA** — isolamento e lente ativa (CX-01/15) são obrigações transversais quando o escopo tocar permanente/sessão.  
7. **Evolutivas** — CX-02/06/17/18 só entram por deliberação; default = fora do artefato MVP-A.  
8. **Conflito** — se dois artefatos F4 se contradisserem, prevalece o alinhamento a F3; o CTO arbitra.

---

## 5. Critérios de validação técnica (gate)

Um artefato F4-nn (n ≥ 03) só é **homologável** se:

| # | Critério |
|---|----------|
| V1 | Estrutura §2 completa (metadados + sete eixos + memória). |
| V2 | Matriz de rastreabilidade F1/F2/F3 (§3) completa e coerente. |
| V3 | Conformidade D-F4-01 (funcional como referência). |
| V4 | Conformidade D-F4-02 (não altera CX/precedências/responsabilidades). |
| V5 | Conformidade D-F4-03 (ausência de UX/UI / F5). |
| V6 | Ausência de componentes, tecnologias, APIs, infraestrutura e implementação. |
| V7 | Dependências não invertidas vs F3-02 sem deliberação. |
| V8 | Critérios de validação do próprio artefato (§2.2 eixo 5) são inspecionáveis sem código. |
| V9 | Nomenclatura e versionamento conforme §7. |

**Validação deste F4-02 (Gate F4-02):** o CTO homologa quando reconhece o modelo como normativo e reutilizável por todos os artefatos F4 subsequentes.

---

## 6. Restrições arquiteturais (do modelo e dos artefatos sob ele)

| ID | Restrição |
|----|-----------|
| R1 | Proibido contradizer F3-01…F3-04 ou specs CX homologadas. |
| R2 | Proibido alterar capacidades, precedências ou responsabilidades sem deliberação arquitetural formal. |
| R3 | Proibido conteúdo de UX/UI, wireframe, token visual ou design system (F5). |
| R4 | Proibido, neste estágio metodológico e nos artefatos sob F4-02 *até deliberação*: stack, vendor, APIs concretas, schemas finais, infra, código. |
| R5 | Proibido transformar orquestração (D4) em superfície ou seletor de meios. |
| R6 | Proibido absorver evolutivas no MVP-A sem deliberação. |
| R7 | Artefato fora deste canônico = **não oficial** na F4. |
| R8 | Sem commit até autorização explícita. |

---

## 7. Convenções de nomenclatura e versionamento

### 7.1 Nomenclatura

| Elemento | Convenção |
|----------|-----------|
| Artefato de fase (IPR) | `F4-nn-<slug>.md` sob `docs/product/` |
| ID no documento | `F4-nn` — título em português técnico-lógico |
| Diretrizes da fase | `D-F4-nn` (já emitidos: D-F4-01…03) |
| Restrições deste modelo | `R1…Rn` (locais ao F4-02; não confundir com REQ) |
| Documento ARQ oficial | `ARQ-nnn-…` em `docs/architecture/` **somente** com emissão ADR-010 / autorização CTO |
| Referência a capacidade | Sempre `CX-nn` conforme F3-04 (nome canônico do catálogo) |
| Arquivos | kebab-case; português sem acento no *slug* do ficheiro |

### 7.2 Versionamento

| Regra | Detalhe |
|-------|---------|
| Formato | `vMAJOR.MINOR` + data `AAAA-MM-DD` |
| **MINOR** | Esclarecimento, correção documental, expansão sem mudar obrigações |
| **MAJOR** | Mudança de obrigações, estrutura canônica ou fronteiras de responsabilidade |
| Status | Rascunho → Em revisão → Homologada → Emendada / Obsoleta |
| Emenda | Nova versão; linha na Memória Organizacional; não apagar histórico normativo |
| Obsoleta | Mantida para rastreio; não citar como vigente |
| Relação ARQ | Se um F4-nn gerar ARQ-nnn, o ARQ registra a versão F4 de origem |

### 7.3 Localização

| Tipo | Local |
|------|-------|
| F4-nn (mandato, canônico, mapas lógico-técnicos da IPR) | `docs/product/` |
| ARQ-nnn (quando autorizado) | `docs/architecture/` |
| REQ / IMP / VAL | Conforme ADR-006 — fora do canônico F4-02 |

---

## 8. Relação com F4-01 e próximos passos

| Artefato | Papel |
|----------|--------|
| F4-01 | Mandato e diretrizes D-F4 — **homologado** |
| **F4-02** | Este canônico + N-F4-01…03 — **homologado** (obrigatório) |
| F4-03 | Princípios Arquiteturais da Arquitetura Técnica — em revisão |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F4-02 — canônico obrigatório; N-F4-01…03; abertura F4-03 |
| Baseado em quê | F4-01; D-F4-01…03; F3-03; F3-02/04 |
| Resultado | F4-02 **homologada**; N-F4 vigentes; F4-03 submetido |

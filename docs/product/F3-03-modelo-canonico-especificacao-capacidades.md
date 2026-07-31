# F3-03 — Modelo Canônico de Especificação de Capacidades do CEO

> **Status: Homologada — Gate F3-03 APROVADO (CTO, 26/07/2026).**  
> Pré-condições: F3-01 e F3-02 **homologados**.  
> Natureza: **padrão metodológico** — template e regras de especificação CX homologados.  
> Próxima capacidade: **F3-04** — Catálogo Oficial de Capacidades.  
> **Proibições neste registro:** sem REQ detalhado; sem ARQ técnica; sem wireframes; sem commit.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O modelo canônico (template + regras de preenchimento) para especificar cada CX do CEO em nível funcional e conceitual. |
| **Por que existe?** | Sem padrão único, fichas de capacidade divergem (umas só com propósito, outras com tech implícita), quebram rastreabilidade DA/PX/IX e dificultam gates do CTO. |
| **Para quem?** | CTO (revisão homogênea); Engenheiro (produção de especificações CX futuras); Usuário (transparência do método). |
| **Sucesso?** | Toda especificação CX posterior usa este canônico; campos obrigatórios preenchidos; rastreabilidade completa; zero conteúdo técnico/wireframe. |

---

## 1. Papel deste artefato na F3

| Este documento **é** | Este documento **não é** |
|----------------------|--------------------------|
| Método e template para especificar CX | A especificação preenchida de CX-01…18 |
| Contrato de qualidade documental | Um REQ (REQ-xxx) |
| Ponte entre mapa/dependências e futuros REQs | Autorização de implementação |

**Fluxo documental previsto (conceitual):**

```text
F3-01 Mapa (o quê existe)
  → F3-02 Dependências (em que ordem / o quê é MVP)
    → F3-03 Canônico (como especificar)
      → Especificações CX individuais (futuras, uma por capacidade ou pacote)
        → REQs via ADR-006 (fora deste gate)
```

---

## 2. Princípios do modelo canônico

1. **Uma capacidade, uma especificação** — cada CX-nn tem no máximo um documento canônico vigente (ou uma seção canônica inequívoca num pacote versionado).  
2. **Funcional, não técnico** — descreve responsabilidade na experiência; proíbe stack, APIs, schemas, agentes nomeados, layouts.  
3. **Rastreável** — toda CX cita DA, PX, IX e o próprio ID CX; quando couber, domínio D1–D5 e ordem F3-02.  
4. **Testável em linguagem de produto** — critérios de conclusão verificáveis por inspeção conceitual / narrativa (UXC), não por teste de software.  
5. **Respeita o invisível** — nenhuma especificação transforma D4/escolha de meios em superfície.  
6. **Compatível com MVP/evolutivo** — o campo de classificação espelha F3-02 sem reinventá-lo.  
7. **Estável sob evolução** — mudar implementação futura não exige reescrever o canônico; só a especificação CX se enriquece em REQs posteriores.

---

## 3. Estrutura canônica obrigatória (campos)

Toda especificação de capacidade **deve** conter as seções abaixo, nesta ordem. Campos marcados **obrigatório** não podem ficar vazios; **condicional** aplica-se quando a regra indicada for verdadeira.

### 3.1 Cabeçalho e metadados

| Campo | Obrigatório | Conteúdo permitido | Proibido |
|-------|-------------|--------------------|----------|
| **ID** | Sim | `CX-nn` conforme F3-01 | Novo ID sem deliberação F3-01 |
| **Nome** | Sim | Nome funcional curto | Nome de componente/tela |
| **Versão** | Sim | `vX.Y` + data | — |
| **Status** | Sim | Em elaboração / Em revisão / Homologada / Obsoleta | — |
| **Classificação F3-02** | Sim | Fundamental / Derivada / Transversal / Evolutiva; e se integra MVP-A | Classificação conflituosa com F3-02 sem ADR/deliberação |
| **Ordem de precedência** | Condicional | O0…O7 (F3-02) | Ordem inventada |
| **Domínios D1–D5** | Sim | Um ou mais; papel em cada | Domínio D6+ |

### 3.2 Corpo canônico (os oito eixos do Gate)

#### (1) Propósito

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Uma declaração: *por que esta capacidade existe na experiência do CEO*. |
| **Forma** | 1–3 frases; linguagem executiva. |
| **Deve** | Ligar-se a um problema de comando, COA, ciclo ou governança. |
| **Não deve** | Descrever *como* implementar; listar features de UI. |

#### (2) Responsabilidade

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | O que a capacidade **assume** e o que **recusa** (fronteira). |
| **Forma** | Duas listas: *Compete a esta CX* / *Não compete a esta CX*. |
| **Deve** | Alinhar-se às exclusões F3-01 e às fronteiras F2. |
| **Não deve** | Atribuir a CX-10 a “escolha de meios pelo usuário”; atribuir execução a D4. |

#### (3) Entradas conceituais

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | O que precisa **estar presente** (conceitualmente) para a capacidade atuar. |
| **Forma** | Lista de entradas: estado de COA, objetivo/intenção, recorte de conhecimento, autorização, efeito, etc. |
| **Classificar** | Cada entrada como **Permanente**, **Transitório** ou **Ato do usuário** (F2-02 / F2-03). |
| **Não deve** | Payload JSON, eventos de sistema, tópicos de fila. |

#### (4) Saídas conceituais

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | O que a capacidade **produz** na experiência ou no patrimônio. |
| **Forma** | Lista de saídas + destino (D1…D5 / usuário). |
| **Classificar** | Permanente vs Transitório; se promove (CX-13) ou apenas espelha (CX-03). |
| **Não deve** | Arquivos, records, status codes. |

#### (5) Dependências e capacidades relacionadas

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Espelhar F3-02: *Depende de* / *É dependência de* / *Relacionadas*. |
| **Forma** | Tabelas com tipo: estrutural → / ciclo ⇒ / governança ⇢ / transversal ↔. |
| **Deve** | Respeitar anti-precedências F3-02. |
| **Condicional** | Se gate: documentar dependência condicional CX-11 ⇒ CX-12. |

#### (6) Critérios de conclusão

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Condições sob as quais a capacidade se considera **realizada** no plano da experiência (não “código pronto”). |
| **Forma** | Lista numerada verificável por narrativa ou inspeção de produto. |
| **Deve** | Ser compatível com UXC/UXR (F2-04) quando a CX afetar percepção. |
| **Não deve** | Cobertura de testes automatizados; Definition of Done de sprint. |

#### (7) Restrições e invariantes aplicáveis

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | IX explícitos; restrições F2-02/F2-03/F2-04; o que é invisível. |
| **Forma** | Lista de IDs (IX-nn, G-nn, B-nn) + restrições em prosa curta. |
| **Deve** | Incluir proibição de violar COA único, DA-001, etc., quando pertinente. |
| **Não deve** | Restrições de performance/infra. |

#### (8) Rastreabilidade com DA, PX, IX e CX

| Regra | Detalhe |
|-------|---------|
| **Obrigatório** | Matriz de rastreio. |
| **Forma mínima** | Ver §4. |
| **Deve** | Ao menos um vínculo DA **ou** PX **ou** IX (preferencialmente os aplicáveis); auto-referência CX; domínios. |
| **Não deve** | Links para código ou tickets como substituto do rastreio normativo. |

---

## 4. Matriz de rastreabilidade (formato obrigatório)

Toda especificação CX inclui esta tabela (células podem ser `—` se genuinamente N/A, com nota).

| Eixo | IDs / referências | Papel nesta CX |
|------|-------------------|----------------|
| **CX** | CX-nn (esta) | — |
| **CX relacionadas** | CX-… | Depende / alimenta / transversal |
| **Domínios** | D1…D5 | Primário / secundário |
| **DA** | DA-001…003 | Como a diretriz se manifesta |
| **PX** | PX-01…10 | Princípio permanente sustentado |
| **IX** | IX-01…12 | Invariante preservado |
| **F3-02** | Fundamental/Derivada/…; O0–O7; MVP-A sim/não | Classificação |
| **F2 apoio** | F2-01/02/03 seções | Quando a CX opera um mecanismo nomeado (ciclo, Foco, F-Ret…) |
| **HP (se houver)** | HP-004/005/006 | Apenas *informativo* — não promove hipótese |

---

## 5. Template canônico (cópia integral)

Especificações futuras **copiam** este bloco e preenchem. Nada fora das seções sem deliberação que estenda o canônico.

```markdown
# CX-nn — [Nome da capacidade]

> **Status:** …  
> **Versão:** v0.1 — AAAA-MM-DD  
> **Classificação (F3-02):** Fundamental | Derivada | Transversal | Evolutiva  
> **MVP arquitetural:** Sim | Não  
> **Precedência:** O0…O7  
> **Domínios:** …

## 1. Propósito
…

## 2. Responsabilidade
### Compete a esta CX
- …
### Não compete a esta CX
- …

## 3. Entradas conceituais
| Entrada | Classe (Permanente / Transitório / Ato do usuário) | Origem típica |
|---------|------------------------------------------------------|---------------|
| … | … | … |

## 4. Saídas conceituais
| Saída | Classe | Destino (domínio / usuário) |
|-------|--------|-----------------------------|
| … | … | … |

## 5. Dependências e capacidades relacionadas
| Relação | CX | Tipo (→ / ⇒ / ⇢ / ↔) |
|---------|----|----------------------|
| Depende de | … | … |
| É pré-requisito de | … | … |
| Relacionada | … | … |

## 6. Critérios de conclusão
1. …
2. …

## 7. Restrições e invariantes aplicáveis
- IX-… — …
- …

## 8. Rastreabilidade
| Eixo | Referências | Papel |
|------|-------------|-------|
| CX | CX-nn | … |
| Domínios | … | … |
| DA | … | … |
| PX | … | … |
| IX | … | … |
| F3-02 | … | … |
| F2 apoio | … | … |
| HP | … | … |

## Memória Organizacional
| Campo | Registro |
|-------|----------|
| Quem | … |
| Quando | … |
| Por quê | … |
| Baseado em quê | F3-03 canônico; F3-01; F3-02; Fundação Conceitual |
| Resultado | … |
```

---

## 6. Regras de preenchimento e qualidade

### 6.1 Completude (gate documental)

Uma especificação CX só pode ir a “Em revisão do CTO” se:

1. Todos os campos **obrigatórios** §3 estiverem preenchidos.  
2. A matriz §4 não tiver eixos CX/Domínios/F3-02 vazios.  
3. Houver ao menos um DA **ou** PX **e** ao menos um IX aplicável (exceto se CTO autorizar N/A motivado).  
4. Dependências forem **subconjunto consistente** com F3-02 (sem anti-precedência).  
5. Nenhuma seção introduzir tecnologia, API, componente, wireframe ou REQ numerado.

### 6.2 Consistência entre artefatos

| Se divergir de… | Ação |
|-----------------|------|
| F3-01 (nome/propósito) | Corrigir especificação **ou** propor emenda ao mapa (deliberação) |
| F3-02 (classe/MVP/ordem) | Prevalece F3-02 até nova deliberação |
| DA / PX / IX | Prevalece Fundação Conceitual; especificação se adapta |
| P1–P6 / CON / VIS | Prevalece norma superior |

### 6.3 Granularidade

* Não fatiar uma CX em microespecificações técnicas.  
* Não fundir duas CX-nn num único canônico sem deliberação que altere F3-01.  
* Pacotes (várias CX num release documental) são permitidos **somente** se cada CX preservar seções 1–8 intactas e identificáveis.

### 6.4 Critérios de conclusão — guia

Bom critério: *“O usuário consegue identificar o COA ativo sem ambiguidade.”*  
Mau critério: *“Endpoint /coa retorna 200.”*

Bom critério: *“Pedido de meios não apresenta seletor de ferramenta.”*  
Mau critério: *“OrchestratorService escolhe o modelo.”*

### 6.5 Entradas/saídas — guia

* Preferir substantivos da Fundação: COA, Foco, Objetivo Ativado, Intenção, Recorte permanente, Encaminhamento (invisível), Gate, Efeito, Nova Atenção.  
* Evitar sinônimos soltos que driblem o vocabulário F2/F3.

---

## 7. Exemplo ilustrativo mínimo (não-normativo de conteúdo CX)

> Apenas demonstra o **formato**. Não homologa CX-01 nem substitui especificação futura.

**CX-01 — Estabelecer e exibir o COA ativo** *(exemplo de preenchimento parcial)*

| Campo | Exemplo |
|-------|---------|
| Propósito | Garantir um único contexto operacional ativo perceptível. |
| Responsabilidade | Compete: identidade e recorte do COA. Não compete: multi-COA operável; escolha de meios. |
| Entradas | Ato de entrar no posto / COA já permanente do usuário. |
| Saídas | Identidade do COA ativo (perceptível); recorte aplicável a D1–D5. |
| Dependências | Pré-requisito de quase todas (F3-02); fundamental; MVP-A; O0. |
| Conclusão | “Em que contexto estou?” tem resposta imediata e única (IX-01). |
| Restrições | IX-01, IX-05; PX-03. |
| Rastreio | DA —; PX-03; IX-01; D1+D3; Fundamental; MVP-A. |

---

## 8. Relação com requisitos futuros (fronteira)

| Agora (F3-03 + specs CX) | Depois (ADR-006) |
|--------------------------|------------------|
| Capacidade funcional e critérios de conclusão experiencial | REQ com aceite testável de software |
| Entradas/saídas conceituais | Contratos técnicos |
| Rastreio DA/PX/IX/CX | Rastreio REQ→ARQ→IMP→VAL |

Nenhuma especificação canônica **autoriza** implementação por si.

---

## 9. Fora de escopo

* Preencher as 18 especificações CX neste gate.  
* Requisitos detalhados, arquitetura técnica, componentes, APIs.  
* Wireframes, protótipos, tokens.  
* Alterar F3-01/F3-02 (salvo apontar inconsistência).  
* Promoção de HP.

---

## 10. Deliberação do CTO (Gate F3-03 — homologado)

| Item | Registro |
|------|----------|
| Modelo canônico (campos 1–8 + matriz) | ✅ Homologado |
| Template §5 | ✅ Homologado |
| Regras de completude §6 | ✅ Homologadas |
| Próxima capacidade | **F3-04** — Catálogo Oficial de Capacidades |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gate F3-03 homologado) |
| Quando | 26/07/2026 |
| Por quê | Gate F3-03 — Modelo Canônico de Especificação |
| Baseado em quê | F3-01; F3-02; deliberação CTO |
| Resultado | Homologada; F3-04 aberta; sem commit |

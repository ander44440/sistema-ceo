# Arquitectura conceptual — Camada de Conhecimento (futura)

> **Tipo:** arquitectura conceptual (diagnóstico / desenho lógico).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — investigação pós-inventário MG2.  
> **Conclusão prévia (oficial):** o CEO não possui Conhecimento Estratégico do MG2; possui apenas Briefing Curado estático.  
> **Natureza:** responde às quatro perguntas do CTO. **Não** implementa. **Não** propõe tecnologia. **Não** abre IMP nem altera Baseline.  
> **Alinhamento:** CON-001; CAP-04; REQ-004/005/014/015; ARQ-006/007 (já homologadas); ADR-015; fronteira REQ-030 (sem importar engenharia do MG2).  
> **Estado da frente (07/08/2026):** investigação e fase ARQ **encerradas**. ARQ-031 Homologada (congelada). Ciclo CAP **ABERTO**: [`CAP-04-abertura`](../cap-04/CAP-04-abertura-ciclo-camada-conhecimento.md). Próxima etapa: **REQs**.

---

## Premissa

A Camada de Conhecimento é o **património consultável** do CEO — distinto de:

| O que não é | Porquê |
|-------------|--------|
| Briefing Curado estático | Mitigação pontual; espelho de código; não versiona nem governa como acervo |
| Memória de sessão | Volátil; não é património institucional |
| Lastro operacional de fila | Estado de execução (jobs/gates), não conhecimento estratégico |
| Repositório do jogo MG2 | Oficina externa; verdade de engenharia, não acervo do CEO |
| Norma (CAP-01) / Memória Organizacional (CAP-05) | Espaços distintos (ARQ-006 K7) |

O Briefing actual, se subsistente, torna-se **derivado subordinado** (projecção de leitura) — nunca a fonte oficial.

---

## 1. Qual deve ser a fonte oficial do conhecimento?

**O Acervo Oficial de Conhecimento do CEO** — único, canónico, por itens identificados e indexados (princípio K1 / ARQ-006).

### Forma lógica

1. **Índice oficial** — fonte de estado: o que existe, aptidão, referência à entrada.  
2. **Uma entrada por item** — identidade permanente (`KNW-nnn`, ARQ-007); conteúdo versionado; classificação; origem; relacionamentos; âmbito de contexto (ex.: COA MG2).  
3. **Contexto de Trabalho / COA** — o conhecimento estratégico do MG2 vive como itens **do acervo** com âmbito COA MG2, não como ficheiro paralelo no motor nem como prompt embutido.

### Hierarquia de verdade

```
Acervo (índice + entradas)     ← fonte oficial
        │
        ├── Projecções de leitura (briefing, lastro, resumos)  ← subordinadas
        └── Memória de sessão / fila ops                       ← não substituem o acervo
```

Em divergência, prevalece o acervo. Nenhuma projecção pode inventar factos ausentes do índice apto.

### Âmbito MG2 (estratégico)

Itens curados do tipo: identidade do COA, objectivo da janela, decisões vigentes, dores activas, próximo passo, fora de escopo, fronteiras CEO↔oficina — **registados como conhecimento**, não como string no Executive Engine.

---

## 2. Como esse conhecimento será atualizado?

**Por actos de curadoria governados** — não por sincronização automática com a oficina MG2, nem por inferência do modelo.

### Ciclo de actualização

```
Evidência de uso / decisão do Patrocinador / entrega de Job
        → proposta de registo ou nova versão de conteúdo
        → curadoria (apto / não apto; deduplicação; obsolescência)
        → índice + entrada actualizados (mesmo KNW; nova versão de conteúdo)
        → projecções regeneráveis a partir do acervo (se existirem)
```

### Regras

| Regra | Enunciado |
|-------|-----------|
| Quem actualiza | Autoridade humana (Patrocinador / acto autorizado); o CEO **propõe** lacunas, **não** promove sozinho a património |
| O que versiona | O **conteúdo** do item — a identidade `KNW-nnn` permanece (K2, K4) |
| Obsolescência | Item passa a **não apto** sem apagar identidade nem histórico (K3, REQ-014/015) |
| Proibições | Importar o repo do jogo; “aprender” silenciosamente do chat para o acervo sem curadoria; actualizar só o espelho de prompt sem o acervo |
| Frequência | Orientada a decisões relevantes do dia / evidência — não a polling técnico |

O Briefing Curado deixa de ser editado como fonte: ou deixa de existir como canónico, ou é **gerado/derivado** do subconjunto apto do acervo para o COA.

---

## 3. Como será consultado pela EIC sem aumentar acoplamento?

**Via um contrato único de recuperação contextual** — a EIC (e o restante do runtime) **consomem lastro entregue**, não conhecem a estrutura interna do acervo.

### Separação de responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| **Acervo** | Estruturar, preservar, curar (CAP-04) |
| **Porta de recuperação** | Dado um Contexto de Trabalho + pergunta de necessidade, **determinar e entregar** só o aplicável e apto (REQ-005) |
| **EIC / EE / MRE / CN** | Recebem um **lastro de conhecimento** (factos/itens aplicáveis + declaração de lacuna); não leem índice, não escolhem itens por caminho, não embutem curadoria |

### Fluxo conceptual

```
Turno / deliberação
  → EIC pede lastro ao contrato: { COA, natureza da solicitação, necessidade }
  → Porta de recuperação consulta o acervo (só aptos; só âmbito aplicável)
  → Entrega: { itens/factos oficiais, versões referenciadas, lacunas explícitas }
  → EIC / MRE usam o lastro como contexto — sem acoplamento ao armazenamento
```

### Anti-acoplamento (obrigatório)

1. **Nenhum** módulo EIC importa paths, formatos ou regras de curadoria do acervo.  
2. A porta é a **única** superfície de leitura em runtime.  
3. Entrega **sob demanda** (e, quando política o permitir, proactiva mínima) — sempre limitada ao necessário para avançar com segurança (REQ-005).  
4. Se o acervo não tiver o aplicável: a porta devolve **lacuna explícita**; a EIC declara ignorância — não inventa.  
5. Classificador / interceptação operacional **não** substituem a porta; no máximo sinalizam contexto (COA, missão) para a recuperação.

O Briefing injectado hoje no prompt é o anti-padrão a eliminar: conhecimento acoplado ao motor.

---

## 4. Como preservar versão, governança e confiabilidade?

### Versão

- Identidade permanente do item (`KNW-nnn`).  
- Cadeia de **versões de conteúdo** na entrada (append-oriented).  
- Consumidores que precisem de precisão temporal referenciam `KNW-nnn` + versão — nunca um ID novo por edição.  
- Projecções (se houver) citam a versão de origem; deriva desactualizada é defeito de projecção, não “nova verdade”.

### Governança

- Índice = fonte de estado de pertença e aptidão.  
- Só item **apto** é entregue como conhecimento organizacional válido.  
- Todo registo/curadoria carrega Memória Organizacional (quem, quando, porquê, baseado em quê, resultado).  
- Fronteiras: acervo ≠ norma; ≠ memória organizacional de decisões de governação; ≠ código do MG2.  
- Abertura de IMP desta camada exige ciclo ADR-006 (REQ/ARQ já existem para CAP-04; F3/F7 são planeamento, não autorização implícita).

### Confiabilidade

| Garantia | Mecanismo lógico |
|----------|------------------|
| Não inventar | Entrega só o registado e apto (K5) |
| Não ocultar lacuna | Lacuna explícita na resposta da porta |
| Não misturar ops com estratégia | Fila/jobs fora do acervo estratégico |
| Não degradar com espelhos | Espelhos subordinados; auditoria pela divergência acervo↔projecção |
| Independência tecnológica | Arquitectura lógica (K6) — nenhuma obrigação depende de fornecedor |
| Confiança do Patrocinador | Actualização curada + rastreio; briefing estático deixa de fingir lastro vivo |

---

## Síntese das quatro respostas

| # | Pergunta | Resposta conceptual |
|---|----------|---------------------|
| 1 | Fonte oficial | Acervo único (índice + itens `KNW`), âmbito COA; Briefing deixa de ser canónico |
| 2 | Actualização | Actos de curadoria governados; versiona conteúdo; não sync com repo do jogo |
| 3 | Consulta EIC | Contrato/porta de recuperação → lastro; EIC sem acoplamento ao acervo |
| 4 | Versão / governação / fiabilidade | ID permanente; versões de conteúdo; aptidão; MO; só aptos; lacuna explícita |

---

## Fora de escopo deste documento

- Escolha de tecnologia, armazenamento físico ou protocolo.  
- Implementação, migração do Briefing, abertura de F3/F7.  
- Importação da arquitectura do MG2 para o CEO.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (perguntas) + Engenheiro (arquitectura conceptual) |
| Quando | 07/08/2026 |
| O quê | Camada de Conhecimento — respostas conceptuais 1–4 |
| Baseado em | Inventário 07/08; ARQ-006/007; REQ-004/005/014/015; conclusão «só Briefing estático» |
| Resultado | Desenho lógico entregue; **sem** implementação |

# ARQ-014 — Arquitetura da Natureza Cognitiva da Solicitação (NCS) no MRE

> **Status: Rascunho — v0.1 (30/07/2026).** Aguarda revisão conjunta (Patrocinador + CTO).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-014 (ARQ-013 = consolidação MRE).  
> **Capacidade:** CAP-01 — Governança (recorte deliberação / qualidade cognitiva).  
> Norma superior: CON-001; ADR-010; ADR-015; **ADR-019**; **REQ-052** (origem exclusiva); REQ-048…051; ARQ-013 (mapa MRE preservado).  
> **Finalidade:** definir a arquitetura lógica necessária para a NCS — onde nasce, como percorre o pipeline, quem consome, quem não altera, contratos e fluxos.  
> **Proibições:** não define implementação; não cria classes concretas; não produz código; não emenda ADR-019 nem REQ-048…051; não reabre ARQ-013 como substituto.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os componentes e contratos do MRE para que a Natureza Cognitiva da Solicitação (REQ-052) nasça no limiar deliberativo, percorra o pipeline de forma imutável, condicione dossier/análise/decisão/ação e seja registada no ParecerExecutivo — sem violar a separação Reasoner / Speaker / Aprendizado (ADR-019)?**

---

## 1. Onde a NCS nasce

### 1.1 Decisão arquitetural de colocação

A NCS **nasce no limiar de admissão do MRE**, **depois** de o Núcleo Executivo confirmar a **rota deliberativa**, e **antes** dos estágios 0–8 do pipeline (REQ-049).

| Opção | Adotada? | Motivo |
|-------|----------|--------|
| Classificar no Núcleo (junto da intenção de roteamento) | **Não** | O Núcleo decide *se* entra no MRE; a NCS decide *como* deliberar — pertence à fronteira deliberativa (ADR-019) |
| Classificar no Speaker ou Aprendizado | **Não** | Proibido por REQ-052 R10 / ADR-019 |
| Classificar só no estágio 6 | **Não** | Viola limiar REQ-052 (§3): demasiado tarde |
| **Classificador NCS no limiar de admissão do MRE** | **Sim** | Cumpre «após rota deliberativa» e «antes do estágio 4»; disponível no mais tardar para condicionar o estágio 2 |

### 1.2 Componente lógico: Classificador NCS

| Aspeto | Definição |
|--------|-----------|
| **Nome lógico** | Classificador de Natureza Cognitiva da Solicitação (Classificador NCS) |
| **Fronteira** | Interior à **fronteira do MRE**; exterior aos estágios 0–8 |
| **Entrada** | Mensagem admitida + intenção de roteamento (somente leitura) + sinais opcionais de contexto já disponíveis na admissão (sem consultar Speaker) |
| **Saída** | **Pacote NCS** (contrato §5) — **imutável** no restante da corrida |
| **Momento** | Uma vez por corrida deliberativa, antes do estágio 0 (ou imediatamente antes do estágio 0, como passo 0−) |

O Classificador NCS **não** é o classificador de intenção do Núcleo. São preocupações distintas:

```text
Núcleo:  intenção → rota (deliberativo? sim/não)
MRE:     Classificador NCS → natureza cognitiva (método | operacional | planejamento | explicação)
```

### 1.3 Relação com ARQ-013

ARQ-013 permanece o mapa oficial do MRE. ARQ-014 **estende** esse mapa com um componente no limiar deliberativo; **não** substitui ARQ-013.

```text
Mensagem
   ↓
Núcleo Executivo ──[não deliberativo]──→ fluxo determinístico / local
   ↓ [rota deliberativa]
★ Classificador NCS ──→ Pacote NCS (imutável na corrida)
   ↓
MRE estágios 0–7 (consomem Pacote NCS)
   ↓
Aprendizado (estágio 8) — lê; não altera NCS
   ↓
ParecerExecutivo (metadados / extensão NCS)
   ├──→ Speaker → Comunicado (não altera NCS)
   └──→ Plano de Retenção / Fila (efeitos; não alteram NCS)
```

---

## 2. Como a NCS percorre o pipeline

### 2.1 Ciclo de vida na corrida

| Fase | Estado da NCS |
|------|----------------|
| Admissão MRE | Classificador NCS produz Pacote NCS |
| Estágios 0–1 | Pacote disponível; enquadramento **não** redefine a natureza |
| Estágios 2–7 | Estágios **leem** o Pacote; adaptam dossier/análise/riscos/decisão/ação |
| Estágio 8 | Aprendizado **pode ler** a natureza no parecer/contexto; **não** reclassifica |
| Montagem do parecer | Pacote NCS (ou subconjunto) **persistido** no parecer de forma recuperável |
| Speaker / canais | Consomem parecer; NCS já congelada |
| Falha controlada | Se a NCS já existia → registar no parecer de falha; se falha **antes** do Classificador → marcador `indeterminada_por_falha` (REQ-052); nova corrida reclassifica |

### 2.2 Imutabilidade

Após emitido o Pacote NCS na corrida:

1. Nenhum estágio 0–8 pode **substituir** `naturezaCognitiva`.  
2. Regeneração controlada do parecer (REQ-049 / validação) **não** autoriza reclassificação silenciosa; só nova admissão deliberativa (nova corrida) ou política explícita de reavaliação em falha pré-NCS.  
3. `tipoPedido`, `estado` e `acao.tipo` **evoluem** nos estágios; a NCS **não**.

### 2.3 Condicionamento (sem reescrever o pipeline)

A sequência 0→1→2→3→4→5a∥5b→6→7→8 **mantém-se**. A NCS altera **políticas de interpretação** dentro dos estágios (REQ-052 §4–5), não a topologia do grafo.

---

## 3. Quais componentes a consomem

| Componente | Consome NCS? | Como |
|------------|--------------|------|
| **Classificador NCS** | Produz | Emite Pacote NCS |
| **Estágio 0 — Diagnóstico** | Sim (leitura) | Objetivo/problema no modo da natureza |
| **Estágio 1 — Enquadramento** | Sim (leitura) | `tipoPedido` independente; não sobrescreve NCS |
| **Estágio 2 — Dossier** | Sim (leitura) | `exigeItensConcretos` / `politicaLacunas` |
| **Estágio 3 — Princípios** | Sim (leitura) | Seleção alinhada ao modo |
| **Estágio 4 — Análise** | Sim (leitura) | Análise no modo; evita narrativa indevida de inventário |
| **Estágios 5a / 5b** | Sim (leitura) | Riscos/oportunidades no modo |
| **Estágio 6 — Decisão** | Sim (leitura) | `modoEsperadoEstagio6` + regras R4–R7; enum REQ-048 intacto |
| **Estágio 7 — Ação** | Sim (leitura) | Gesto coerente com a natureza |
| **Estágio 8 — Aprendizado** | Sim (leitura opcional) | Critérios de retenção; sem mutar decisão |
| **Montagem / Validação Parecer** | Sim | Garante registo recuperável da NCS sem quebrar V1–V6 |
| **Speaker Executivo** | Indireto | Via parecer (texto fiel); não lê Classificador |
| **Auditoria / learning** | Sim (pós-facto) | Via parecer persistido |

---

## 4. Quais componentes NÃO podem alterá-la

| Componente | Proibição |
|------------|-----------|
| Núcleo Executivo | Não redefine NCS após emitir rota; não é dono do Pacote NCS |
| Estágios 0–7 | Não reclassificam; não apagam o Pacote |
| Estágio 8 / Aprendizado | Não altera `naturezaCognitiva` nem o Pacote |
| Speaker | Não classifica; não altera parecer (REQ-050 / ADR-019) |
| Canais (Chat, Voz, Centro) | Não alteram NCS |
| Fila de Execução | Não altera NCS |
| Gate humano de princípios | Não altera NCS da corrida já fechada |
| UI / cliente | Não escreve NCS no pipeline |

**Única origem autorizada da NCS numa corrida:** Classificador NCS no limiar de admissão do MRE.

---

## 5. Interfaces e contratos

### 5.1 Contrato lógico — Pacote NCS

Artefacto lógico **obrigatório** na entrada dos estágios 0–8 (após classificação bem-sucedida):

| Campo | Tipo lógico | Obr. | Notas |
|-------|-------------|------|-------|
| `naturezaCognitiva` | enum fechado REQ-052 §2 | Sim | `metodo_de_decisao` \| `decisao_operacional` \| `planejamento` \| `explicacao` |
| `confiancaNatureza` | número `0..1` | Sim | |
| `fundamentoNatureza` | string | Sim | Não é prosa de UI |
| `exigeItensConcretos` | boolean | Sim | `true` iff `decisao_operacional` |
| `politicaLacunas` | enum lógico | Sim | Ex.: `inventario_nao_obrigatorio` \| `inventario_material_obrigatorio` \| `nao_aplica_escolha` |
| `modoEsperadoEstagio6` | string / enum lógico | Sim | Orientação; **não** é `EstadoDecisaoExecutiva` |

Validação de fronteira: valores fora do catálogo REQ-052 → Pacote **inválido** → a corrida não avança aos estágios 4+ sem correção/falha controlada conforme política MRE existente.

### 5.2 Contrato com o Núcleo

| Direção | Contrato |
|---------|----------|
| Núcleo → MRE | Mensagem + intenção + contexto de admissão; flag de rota deliberativa |
| MRE ↛ Núcleo | O Classificador NCS **não** devolve natureza ao Núcleo para rerrotear intenções determinísticas nesta ARQ |

### 5.3 Contrato com o ParecerExecutivo (REQ-048)

| Aspeto | Regra arquitetural |
|--------|-------------------|
| Campos V1–V6 | **Preservados**; NCS não remove obrigatórios |
| Registo da NCS | Em `metadados` (extensão não normativa) **ou** campo dedicado futuro — sem invalidar pareceres atuais |
| Mínimo recuperável | `naturezaCognitiva` + `fundamentoNatureza` (+ `confiancaNatureza` recomendado) |
| Enums de decisão/ação | **Intocados** |

### 5.4 Contrato com o Speaker (REQ-050)

Entrada: apenas `ParecerExecutivo` válido. O Speaker **não** recebe o Pacote NCS como canal paralelo. Se a NCS importar para o utilizador, isso já estará refletido em `analise` / `decisaoExecutiva` / `acao` / metadados do parecer.

### 5.5 Contrato com o Aprendizado (REQ-051)

Entrada: parecer (e contexto de estágio 8). Pode **ler** NCS registada. Saída: bloco `aprendizado` / plano de retenção. **Proibido** escrever de volta no Pacote NCS ou em `decisaoExecutiva` / `acao`.

---

## 6. Fluxo de dados

```text
[Utilizador] mensagem
       │
       ▼
[Núcleo] intenção + rota
       │
       ├── rota ≠ deliberativa ──→ (fora desta ARQ)
       │
       ▼ rota deliberativa
[Classificador NCS]
       │
       │  produz
       ▼
  Pacote NCS ─────────────────────────────────────────┐
       │                                              │
       ▼                                              │
[Estágios 0–1] leem NCS                               │
       │                                              │
       ▼                                              │
[Estágio 2] dossier sob politicaLacunas / exigeItens  │
       │                                              │
       ▼                                              │
[Estágios 3–5b] análise/riscos/oportunidades no modo  │
       │                                              │
       ▼                                              │
[Estágio 6–7] decisão/ação coerentes (enum REQ-048)   │
       │                                              │
       ▼                                              │
[Estágio 8] lê NCS (opcional) → aprendizado           │
       │                                              │
       ▼                                              │
[Montagem Parecer] ←─ copia NCS para metadados/campo ─┘
       │
       ├── válido → [Speaker] → Comunicado → Canais
       └── efeitos → Fila / Retenção / Gate (sem mutar NCS)
```

**Dados que fluem com a NCS:** apenas o Pacote NCS + derivados já existentes do pipeline (diagnóstico, dossier, etc.).  
**Dados que não fluem da NCS para o utilizador diretamente:** o Pacote bruto; só o parecer/comunicado.

---

## 7. Compatibilidade com ADR-019

| Princípio ADR-019 | Cumprimento nesta ARQ |
|-------------------|------------------------|
| Separação deliberação / comunicação | NCS vive no MRE; Speaker só consome parecer |
| MRE produz ParecerExecutivo | NCS condiciona a deliberação; saída continua um parecer válido |
| Speaker não delibera | Speaker não classifica nem altera NCS |
| Aprendizado pós-deliberação; sem auto-aplicação de princípios | Aprendizado lê NCS; não reabre deliberação |
| Conhecimento no CEO, não nas ferramentas | NCS é classificação da solicitação na corrida; retenção segue REQ-051 |
| Pipeline / Reasoner como lugar do raciocínio | Classificador NCS na fronteira MRE, não no Núcleo de roteamento |

**ADR-019 não é reaberta.** ARQ-014 é especialização de qualidade deliberativa sob o mesmo mandato.

---

## 8. Impactos arquiteturais

| Área | Impacto |
|------|---------|
| **ARQ-013** | Extensão do mapa: novo componente no limiar; estágios passam a ter dependência de leitura do Pacote NCS |
| **Núcleo** | Sem mudança de responsabilidade de roteamento; continua a não deliberar |
| **Pipeline REQ-049** | Topologia 0–8 preservada; políticas internas condicionadas |
| **Parecer REQ-048** | Extensão retrocompatível via metadados (estratégia §9) |
| **Speaker / Aprendizado** | Contratos de não-mutação reforçados |
| **Fila / UI / Voice** | Impacto nulo direto; veem só comunicado/parecer |
| **Testabilidade** | Novo contrato Pacote NCS e invariante de imutabilidade auditáveis |
| **Produção R1 atual** | Comportamento vigente permanece até IMP/VAL futuros; esta ARQ **não** ativa NCS sozinha |

---

## 9. Estratégia de retrocompatibilidade

1. **Pareceres existentes (pré-NCS):** continuam válidos sob REQ-048 V1–V6; ausência de metadados NCS **não** invalida pareceres históricos.  
2. **Corridas novas (após IMP da NCS):** Pacote NCS obrigatório; parecer **deve** carregar NCS recuperável.  
3. **Schema:** preferir `metadados.naturezaCognitiva` (e campos associados) até eventual emenda REQ-048 — **não** exigir emenda nesta ARQ.  
4. **Validação V1–V6:** inalterada; validação NCS é **camada adicional** no limiar MRE / montagem, não substituição das regras existentes.  
5. **Feature / rollout (lógica):** a arquitetura admite operação em que o Classificador NCS esteja desligado apenas sob mandato explícito de Gate/IMP — fora do detalhe desta ARQ; com NCS ligada, o limiar é obrigatório (REQ-052).  
6. **Speaker antigo:** continua a funcionar se o parecer for válido; benefícios de método/explicação aparecem quando o parecer os materializa.

---

## 10. Riscos arquiteturais

| ID | Risco | Mitigação arquitetural |
|----|-------|------------------------|
| RA-01 | Classificar NCS no Núcleo e confundir com intenção de rota | Colocação exclusiva no limiar MRE (§1) |
| RA-02 | Estágios 4–6 ignorarem o Pacote e reincidirem no viés de inventário | Contrato de consumo obrigatório (§3); imutabilidade (§2) |
| RA-03 | Speaker «corrigir» natureza na prosa | Speaker só vê parecer; proibição de alteração (§4) |
| RA-04 | Emenda prematura do schema REQ-048 quebrar produção | Extensão via metadados (§5.3, §9) |
| RA-05 | Dupla fonte de verdade (Pacote vs parecer) divergente | Montagem do parecer **copia** o Pacote; Pacote não muda depois |
| RA-06 | Fronteira método/planejamento instável | Política de desempate na REQ-052 (R3); VAL futura — fora desta ARQ |
| RA-07 | Falha antes do Classificador sem marcador | REQ-052: `indeterminada_por_falha`; nova corrida reclassifica |
| RA-08 | Percepção de que ARQ-014 reabre ADR-019 | Secção 7: extensão compatível; ADR intocado |

---

## Fora de escopo desta ARQ

* Código, classes concretas, ficheiros, prompts, stack.  
* Novo ADR (não criado aqui).  
* Emenda textual a REQ-048…051 ou ADR-019.  
* Plano IMP / VAL / toggles de produção.  
* Alteração da topologia 0–8 além do limiar NCS.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Origem exclusiva | REQ-052 |
| Visão | VIS-008 |
| Mapa MRE | ARQ-013 (preservado; estendido) |
| Decisão quadro | ADR-019 (compatível; não reaberto) |
| Contrato parecer / pipeline / speaker / aprendizado | REQ-048…051 |
| Implementação | *(não iniciada)* |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Engenheiro (Cursor) | Rascunho ARQ-014 derivado exclusivamente do REQ-052 | Rascunho — revisão conjunta |

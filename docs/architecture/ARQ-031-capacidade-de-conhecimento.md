# ARQ-031 — Especificação Arquitectural da Capacidade de Conhecimento

> **Status:** Homologada v1.0 — 07/08/2026 (CTO). **Congelada na Baseline CAP-04** (Despacho CTO 07/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-031.  
> **Capacidade:** CAP-04 — Gestão do Conhecimento (Camada de Conhecimento / lastro consultável) — **Baseline**.  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-015; CAP-001 (CAP-04); CNC-001; CNC-002; REQ-004; REQ-005; REQ-014; REQ-015; REQ-030; **ARQ-006**; **ARQ-007**.  
> **Investigação prévia (ENCERRADA):** inventário MG2; arquitectura conceptual; limites; governação (07/08/2026).  
> **Finalidade:** especificar a Capacidade de Conhecimento **preservando integralmente** as decisões homologadas.  
> **Escopo aprovado:** Fonte Oficial · Actualização · Porta de Recuperação (EIC) · Limites · Governação do Acervo.  
> **Não é:** IMP; tecnologia; alteração de ARQ-006/007; reabertura de investigação; redesign da EIC.  
> **Implementação:** IMP-070 **HOMOLOGADA / ENCERRADA**. Evolução futura só com evidência de uso real + deliberação CTO.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Especificação arquitectural da Capacidade de Conhecimento: como o património consultável se organiza logicamente em relação à EIC, ao COA e às alçadas de governação. |
| **Por que existe?** | O CEO possui apenas Briefing Curado estático; a investigação fechou fonte, actualização, consulta, limites e governação — falta a especificação de capacidade que as preserve sem as alterar. |
| **Para quem existe?** | Usuário (homologação de património); CTO (validação/homologação desta ARQ); Engenheiro (IMP futura, se autorizada). |
| **Como medir sucesso?** | (1) Cinco blocos homologados intactos; (2) relação clara com ARQ-006/007; (3) superfície de consulta à EIC sem acoplamento; (4) zero tecnologia; (5) zero IMP nesta etapa. |

---

## 1. Decisões congeladas (não alterar sem nova evidência + deliberação CTO)

Esta ARQ **incorpora por referência** e **não emenda** as decisões abaixo. Qualquer desvio exige nova evidência e nova deliberação do CTO.

| Bloco | Decisão homologada (síntese) | Fonte |
|-------|------------------------------|--------|
| **D1 — Fonte Oficial** | Acervo Oficial único (índice + itens); Briefing = projecção subordinada, nunca canónico | Conceptual 07/08; ARQ-006 K1 |
| **D2 — Actualização** | Actos de curadoria governados; versiona conteúdo; sem sync com repo do jogo; CEO não promove sozinho | Conceptual 07/08 |
| **D3 — Consulta** | Porta única de recuperação → lastro; EIC não lê o acervo por dentro | Conceptual 07/08; REQ-005 |
| **D4 — Limites** | Pertence / não pertence / tipos admitidos / proibições absolutas | Limites 07/08 |
| **D5 — Governação** | Propor → validar → homologar (Usuário) → publicar; aptidão só por decisão sob governança | Governação 07/08; REQ-014 |

Documentos de investigação (memória; não reabrir ciclo):

- `docs/learning/2026-08-07-inventario-conhecimento-mg2.md`
- `docs/learning/2026-08-07-arquitectura-conceptual-camada-conhecimento.md`
- `docs/learning/2026-08-07-limites-camada-conhecimento.md`
- `docs/learning/2026-08-07-governanca-acervo-conhecimento.md`

---

## 2. Posicionamento da capacidade

### 2.1 Nome lógico

**Capacidade de Conhecimento** (CAP-04) — materializada operacionalmente como **Camada de Conhecimento**: património consultável do CEO.

### 2.2 Relação com ARQ já homologadas

| Artefacto | Papel |
|-----------|--------|
| **ARQ-006** | Forma lógica do acervo (índice + entrada); princípios K1–K8; recuperação/curadoria/preservação lógicas |
| **ARQ-007** | Espaço `KNW-nnn` |
| **ARQ-031 (esta)** | Especifica a **capacidade em uso**: fonte, ciclo de vida governado, consulta pela EIC, limites e alçadas — **sem** redefinir A1–A8 da ARQ-006 nem a convenção ARQ-007 |

Em conflito aparente: prevalecem ARQ-006/007 no que já decidem; esta ARQ só **aplica** as decisões D1–D5 no perímetro da capacidade.

### 2.3 O que a capacidade **é**

```
┌─────────────────────────────────────────────────────────────┐
│ Capacidade de Conhecimento (Camada)                         │
│  · Acervo Oficial (fonte)                                   │
│  · Curadoria / governação (ciclo de vida)                   │
│  · Porta de recuperação (consulta)                          │
│  · Limites de admissão                                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ lastro { factos aptos, versões, lacunas }
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Consumidores (não conhecem o interior do acervo)            │
│  EIC · Executive Engine · MRE · Conversação Natural         │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 O que a capacidade **não é**

- Memória Organizacional (CAP-05)  
- Normas / Constituição (CAP-01)  
- Conceitos (`CNC`)  
- Aprendizado / BCO (CAP-06)  
- Consciência operacional de fila (jobs/gates)  
- Oficina / repositório do MG2  
- Briefing Curado estático como fonte  

---

## 3. Especificação — Fonte Oficial (D1)

1. Existe **exactamente um** Acervo Oficial de Conhecimento.  
2. Pertença oficial ⇔ entrada no **índice** com identificador `KNW-nnn` e referência à entrada (ARQ-006/007).  
3. Conhecimento estratégico de COA (ex.: MG2) vive como **itens** com âmbito de contexto — não como string no motor.  
4. Projecções de leitura (incl. eventual briefing derivado) são **subordinadas**; em divergência, prevalece o acervo.  
5. Ausência no acervo apto ⇒ **lacuna explícita**; nunca invenção. **LACUNA EXPLÍCITA** ≠ lacuna material de decisão (REQ-048/049): declara-se e não inventa património; **não** bloqueia, por si só, deliberação sobre factos suficientes do contexto corrente (REQ-070 CA-070-5/6).

---

## 4. Especificação — Actualização (D2)

1. Actualização = acto de **curadoria / registo** sob governação — não sincronização automática com a oficina.  
2. Ciclo lógico: evidência ou proposta → validação → homologação → publicação → (quando couber) nova versão de conteúdo.  
3. Versiona-se o **conteúdo**; a identidade `KNW-nnn` permanece.  
4. O Sistema CEO pode **propor candidatos**; não eleva a património.  
5. Proibido: actualizar só espelho de prompt; importar engenharia do MG2; “aprender” do chat sem cadeia D5.

---

## 5. Especificação — Consulta (D3)

1. Única superfície de leitura em runtime: **Porta de recuperação contextual**.  
2. Entrada lógica: Contexto de Trabalho / COA + necessidade da solicitação.  
3. Saída lógica: lastro `{ itens/factos oficiais aptos, referências de versão, lacunas }`.  
4. EIC / EE / MRE / CN **consomem lastro**; não importam estrutura do acervo, paths, nem regras de curadoria.  
5. Classificador e interceptação operacional **não** substituem a porta; no máximo fornecem sinais de contexto.  
6. Entrega limitada ao necessário para avançar com segurança (REQ-005; CON-001 Art. 9º).  
7. Anti-padrão explícito a eliminar em IMP futura: briefing hard-coded no Executive Engine como fonte.

---

## 6. Especificação — Limites (D4)

### 6.1 Pertence (admissível)

Item CNC-002 + património do CEO + admissão curada + identidade/classificação/origem/relacionamentos.

Tipos lógicos admitidos (taxonomia fina extensível, sem alterar este elenco de géneros):

- Identidade de contexto  
- Objectivo / foco de janela  
- Regra de domínio  
- Padrão / prática  
- Restrição / dor activa  
- Fronteira  
- Fora de escopo  
- Lacuna declarada  
- Lastro de estado **curado** (não dump live)

### 6.2 Não pertence

CAP-05; CAP-01; CNC; CAP-06; fila/ops; sessão volátil; código MG2; prompts/espelhos; parecer de um turno; docs de engenharia do CEO como se fossem lastro de produto.

### 6.3 Nunca entram (proibição absoluta)

Engenharia/sync do repo do jogo; segredos; normas como KNW; actos brutos sem elevação; hipóteses do modelo; estado live de execução; conteúdo sem origem; contrato de personalidade/prompt do cargo.

---

## 7. Especificação — Governação (D5)

### 7.1 Cadeia de promoção

| Acto | Autoridade |
|------|------------|
| Propor | Usuário · CTO · Engenheiro · (CEO só candidato) |
| Validar | CTO (conformidade) + Usuário (verdade de domínio COA) |
| Homologar | **Usuário** (exclusivo) |
| Publicar | Engenheiro **após** homologação |

**Quem promove:** o Usuário, via esta cadeia — nenhuma outra via.

### 7.2 Aptidão

- Distinção lógica: **apto** / **não apto** (REQ-014).  
- Só **apto** é entregue como conhecimento válido.  
- Deixa de ser apto **somente** por decisão sob governança: obsolescência, invalidade, substituição, deduplicação, depuração — com Memória Organizacional.  
- Proibido alterar aptidão por uso, silêncio do modelo, fila ou edição informal de prompt.  
- Revogação de aptidão: Usuário homologa; CTO pode propor. Identidade permanece.  
- Restituição a apto: mesma cadeia §7.1.

---

## 8. Integração lógica com a EIC (sem acoplamento)

| Momento | Comportamento arquitectural |
|---------|----------------------------|
| Antes de deliberar / responder com lastro de domínio | Pedido à Porta de recuperação |
| Com operação aberta (ops) | Lastro de **fila** permanece na consciência operacional; **não** substitui o Acervo |
| Meta-conversa institucional | Fora do perímetro de lastro de COA de produto (DIC / outras frentes — não misturar) |
| Job / oficina | Pode **originar proposta** de item; não publica no acervo |

Nenhum desenho desta secção autoriza IMP nem escolha de mecanismo físico.

---

## 9. Fronteiras e não-objectivos

| Dentro | Fora |
|--------|------|
| Especificação D1–D5 | Tecnologia, storage, API, UI |
| Relação com ARQ-006/007 | Emenda a ARQ-006/007 |
| Contrato lógico Porta ↔ EIC | Alterar pipeline CTO-003 / Baseline EIC |
| Preparar F3/F7 se o patrocinador abrir | Abrir F3/F7 por esta ARQ |

---

## 10. Critérios para Gate ARQ → IMP (futuro)

Só após homologação desta ARQ **e** deliberação explícita de abertura de IMP:

1. D1–D5 intactos no plano IMP.  
2. Nenhum bypass da Porta de recuperação.  
3. Nenhum item sem cadeia D5.  
4. Briefing deixa de ser fonte (migração ou derivação subordinada — plano IMP, não aqui).  
5. Fronteira REQ-030 preservada.

---

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 |
| REQs | REQ-004, REQ-005, REQ-014, REQ-015; REQ-030 (fronteira) |
| ARQ base | ARQ-006, ARQ-007 |
| Conceitos | CNC-001, CNC-002 |
| Investigação | Learning 07/08 (inventário → conceptual → limites → governação) |
| Planeamento (não autorização) | ROADMAP-002 F3 / F7; REL-001 P1-6 |

---

## 12. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Especificação da Capacidade preservando D1–D5 | Despacho CTO — etapa autorizada pós-investigação completa | Em análise — aguarda homologação CTO |
| 1.0 | 07/08/2026 | CTO homologou; Engenheiro registrou | Homologação; Capacidade integra a arquitectura conceptual oficial | Despacho CTO — ARQ-031 HOMOLOGADA; escopo D1–D5 aprovado | **Homologada** — investigação encerrada; sem IMP |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (homologou) + Engenheiro (registou) |
| Quando | 07/08/2026 |
| O quê | ARQ-031 v1.0 — Capacidade de Conhecimento homologada |
| Baseado em | Decisões D1–D5; ARQ-006/007; REQ-004/005/014/015; despacho de homologação |
| Resultado | Capacidade oficial na arquitectura conceptual; frente de investigação **encerrada**; próximas actividades só em especificação / planeamento de IMP |

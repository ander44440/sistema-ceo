# GOV-002 — Processo de Revisão Arquitetural

> **Status:** Em análise — aguarda homologação.  
> **Versão:** 1.0 — 04/08/2026.  
> **Tipo:** GOV — Norma de governança técnica (processo).  
> **Identificação:** GOV-002.  
> **Elaboração:** Alçada de Arquitetura (DESP-C-003).  
> **Origem do despacho:** Coordenador Executivo / Alçada Executiva.  
> **Norma superior:** CON-001; ADR-002; ADR-006.  
> **Norma irmã (conteúdo do parecer):** [`GOV-001`](GOV-001-norma-emissao-pareceres-arquiteturais.md) — **compatibilidade integral obrigatória**.  
> **Efeito:** define o **ciclo de vida** da revisão arquitectural — do despacho à homologação.  
> **Não faz:** alterar GOV-001; alterar documentos homologados; criar tipos documentais; redesenhar produto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Norma que padroniza o processo oficial de revisão arquitectural: estados, etapas, elegibilidade, suspensão, NCs, reanálise, homologação e encerramento. |
| **Por que existe?** | GOV-001 define *o que* é um parecer; falta normatizar *como* corre o ciclo desde o despacho até o Gate. |
| **Para quem existe?** | Alçada Executiva (despachos); Alçada de Arquitetura (análise); Alçada de Governança (homologação); Alçada do Patrocinador (Gate final quando aplicável); Engenheiro (correcções). |
| **Como medir sucesso?** | (1) Todo despacho de revisão usa estados oficiais; (2) nenhum parecer completo sem elegibilidade; (3) NCs tratadas com reanálise quando exigido; (4) homologação só com critérios desta norma + GOV-001; (5) encerramento rastreável. |

---

## 1. Objecto, âmbito e relação com GOV-001

### 1.1 Objecto

Regular o **processo** de revisão arquitectural no Sistema CEO.

### 1.2 Divisão de responsabilidades normativas

| Norma | Regula |
|-------|--------|
| **GOV-001** | Estrutura do parecer, preenchimento, NCs, alçadas, decisões (APROVADO / …), rastreabilidade de elos, ressalvas |
| **GOV-002** | Ciclo de vida do despacho e do parecer, elegibilidade, suspensão, reanálise, versionamento, evidências mínimas, encerramento |

Em caso de tensão interpretativa sobre **conteúdo do parecer**, prevalece **GOV-001**.  
Em caso de tensão sobre **sequência processual**, prevalece **GOV-002**, desde que não contradiga GOV-001.

### 1.3 Fora de âmbito

- Emissão do template interno do parecer (GOV-001).  
- Ciclo ADR-006 de capacidades (esta norma **reforça** gates; não os substitui).  
- Fila de execução `executive/queue` (ponte CEO→Cursor) — distinta deste processo.  
- Criação de tipo documental GOV no catálogo oficial.

---

## 2. Princípios do processo

1. **Despacho antes de análise** — não há parecer oficioso sem despacho (ou equivalente registado pela Alçada Executiva).  
2. **Elegibilidade antes de mérito** — não se analisa fundo sem P1–P4 (GOV-001 §11) e checks desta norma.  
3. **Um despacho, um objecto principal** — um artefato (ID+versão) por ciclo de análise; anexos só como lastro.  
4. **Parecer não corrige** — diagnostica e recomenda; execução é posterior e alheia ao revisor (GOV-001).  
5. **Reanálise quando material** — correcções que alteram objecto ou fecham NC Alta/§8 exigem novo ciclo ou parecer delta.  
6. **Unicidade de estado** — despacho e parecer têm exactamente um estado vigente cada.  
7. **Mínimo necessário** — evidências suficientes para a decisão; sem burocracia ornamental (CON-001 Art. 9º).

---

## 3. Estados do despacho

Identificação sugerida: `DESP-C-nnn` (revisão pela Alçada de Arquitetura).

| Estado | Significado | Transições típicas |
|--------|-------------|-------------------|
| **RASCUNHO** | Despacho em preparação pela Alçada Executiva | → ABERTO |
| **ABERTO** | Emitido; aguarda recebimento pela Alçada de Arquitetura | → EM_TRIAGEM · CANCELADO |
| **EM_TRIAGEM** | Verificação de elegibilidade / completude | → ELEGÍVEL · SUSPENSO · DEVOLVIDO · CANCELADO |
| **ELEGÍVEL** | Pronto para análise de mérito | → EM_ANÁLISE · SUSPENSO |
| **EM_ANÁLISE** | Parecer em elaboração | → PARECER_EMITIDO · SUSPENSO · DEVOLVIDO |
| **PARECER_EMITIDO** | Parecer disponível; aguarda tratamento de NCs / Gate | → EM_CORREÇÃO · EM_REANÁLISE · EM_HOMOLOGAÇÃO · ENCERRADO |
| **EM_CORREÇÃO** | Correcções em curso pelo responsável de execução | → EM_REANÁLISE · SUSPENSO · ENCERRADO* |
| **EM_REANÁLISE** | Novo ciclo de análise pós-correcção | → PARECER_EMITIDO · SUSPENSO |
| **EM_HOMOLOGAÇÃO** | Alçada de Governança (e Patrocinador se aplicável) decide Gate | → ENCERRADO · EM_CORREÇÃO |
| **SUSPENSO** | Análise pausada por critério oficial (§6) | → EM_TRIAGEM · ELEGÍVEL · EM_ANÁLISE · CANCELADO |
| **DEVOLVIDO** | Devolvido à origem por inelegibilidade ou REVISÃO NECESSÁRIA sem objecto | → ABERTO (reabertura) · CANCELADO · ENCERRADO |
| **ENCERRADO** | Ciclo concluído com decisão de fecho registada | (terminal) |
| **CANCELADO** | Despacho anulado sem fecho de mérito | (terminal) |

\*Encerramento directo a partir de EM_CORREÇÃO só se a Alçada de Governança aceitar risco residual formalmente e dispensar reanálise (registo obrigatório).

### 3.1 Regras de estado do despacho

1. Proibido saltar de ABERTO para PARECER_EMITIDO sem EM_TRIAGEM + (ELEGÍVEL|DEVOLVIDO).  
2. SUSPENSO preserva o ponto de retoma (registar estado anterior).  
3. CANCELADO exige motivo e alçada (Executiva ou Governança).  
4. ENCERRADO exige pacote de fecho (§12).

---

## 4. Estados do parecer

Identificação: `PARC-nnn` ou âncora ao despacho (`DESP-C-nnn` + versão do parecer).

| Estado | Significado |
|--------|-------------|
| **NÃO_INICIADO** | Despacho existe; parecer ainda não aberto |
| **EM_ELABORAÇÃO** | Secções GOV-001 em preenchimento |
| **EMITIDO** | Parecer completo entregue com decisão GOV-001 §6 |
| **SUPERADO** | Substituído por versão posterior (reanálise / delta) |
| **HOMOLOGADO** | Aceite pela Alçada de Governança como base do Gate do artefato (quando o Gate depende deste parecer) |
| **ARQUIVADO** | Ciclo encerrado; parecer histórico |

### 4.1 Relação despacho ↔ parecer

| Evento | Estado despacho | Estado parecer |
|--------|-----------------|----------------|
| Início da redação | EM_ANÁLISE | EM_ELABORAÇÃO |
| Entrega do parecer | PARECER_EMITIDO | EMITIDO |
| Nova versão pós-correcção | EM_REANÁLISE → PARECER_EMITIDO | versão N → SUPERADO; N+1 → EMITIDO |
| Gate do parecer / artefato | EM_HOMOLOGAÇÃO → ENCERRADO | HOMOLOGADO (se aplicável) → ARQUIVADO no fecho |

---

## 5. Fluxo completo de revisão

```text
[Alçada Executiva]
   │
   ▼
1. Abertura do despacho ──────────────────────────► ABERTO
   │
   ▼
2. Recebimento do artefato ───────────────────────► EM_TRIAGEM
   │
   ├─ Inelegível ─────────────────────────────────► DEVOLVIDO / SUSPENSO
   │
   ▼
3. Elegibilidade OK ──────────────────────────────► ELEGÍVEL → EM_ANÁLISE
   │
   ▼
4. Emissão do parecer (GOV-001) ──────────────────► PARECER_EMITIDO
   │
   ├─ REVISÃO NECESSÁRIA (objecto inválido) ───────► DEVOLVIDO / EM_CORREÇÃO
   ├─ APROVADO COM RESSALVAS / NCs ───────────────► EM_CORREÇÃO
   ├─ APROVADO ───────────────────────────────────► EM_HOMOLOGAÇÃO
   │
   ▼
5. Tratamento das NCs (decisão + execução) ───────► EM_CORREÇÃO
   │
   ▼
6. Reanálise (se exigida) ────────────────────────► EM_REANÁLISE → parecer vN+1
   │
   ▼
7. Homologação ───────────────────────────────────► EM_HOMOLOGAÇÃO
   │
   ▼
8. Encerramento do despacho ──────────────────────► ENCERRADO
```

---

## 6. Etapas detalhadas

### 6.1 Abertura do despacho

**Quem:** Alçada Executiva.  
**Mínimo obrigatório no despacho:**

| Campo | Regra |
|-------|--------|
| ID | `DESP-C-nnn` (ou série oficial vigente) |
| Destino | Alçada de Arquitetura |
| Artefato | ID canónico |
| Tipo | ANL, REQ, ADR, ARQ, IMP, VAL, CAP, ROADMAP, GOV, … |
| Versão | Versão constante no documento **ou** instrução para a ler do artefato |
| Objectivo | Frase de propósito da revisão |
| Escopo | O que analisar / o que não analisar |
| Prioridade | Opcional |
| Restrições | Opcional (ex. não alterar homologados) |

Estado após emissão válida: **ABERTO**.

### 6.2 Recebimento do artefato

**Quem:** Alçada de Arquitetura.  
Acções:

1. Confirmar acesso ao texto do artefato (caminho / ID).  
2. Registar data/hora de recebimento.  
3. Passar a **EM_TRIAGEM**.

Não iniciar mérito nesta etapa.

### 6.3 Verificação de elegibilidade para análise

Checklist de elegibilidade (todos devem ser ✔ para **ELEGÍVEL**):

| # | Critério | Falha → |
|---|----------|---------|
| E1 | Artefato nomeado (ID + tipo) | DEVOLVIDO |
| E2 | Versão identificável no documento ou no despacho | DEVOLVIDO (GOV-001 P2) |
| E3 | Objectivo do despacho claro | DEVOLVIDO |
| E4 | Acesso ao texto completo relevante | SUSPENSO ou DEVOLVIDO |
| E5 | Objecto no âmbito da Alçada de Arquitetura (não UX puro / não só conversação) | DEVOLVIDO |
| E6 | Despacho não pede alteração de homologados **como acto do parecer** (pode pedir *análise*) | clarificar / DEVOLVIDO |
| E7 | Compatibilidade processual com GOV-001 (parecer será o entregável) | SUSPENSO se GOV-001 indisponível e obrigatória |

**Elegível** → estado **ELEGÍVEL** → pode abrir **EM_ANÁLISE**.

### 6.4 Critérios para suspensão da análise

Passar a **SUSPENSO** quando **qualquer** for verdadeiro:

| ID | Critério |
|----|----------|
| S1 | Artefato em edição concorrente sem baseline estável |
| S2 | Dependência normativa crítica indisponível (ex. REQ pai em falta) |
| S3 | Conflito de Gate ADR-006 não resolvido pela Alçada de Governança |
| S4 | Solicitação explícita da Alçada Executiva ou do Patrocinador |
| S5 | Impedimento de acesso temporário ao artefato |
| S6 | Descoberta de que o objecto real ≠ objecto despachado (requer reabertura) |

**Obrigatório no SUSPENSO:** motivo, estado de retoma, alçada que pode retomar.

Proibido usar SUSPENSO para evitar emitir REVISÃO NECESSÁRIA quando o objecto é simplesmente inadequado — nesse caso **DEVOLVIDO** ou parecer com decisão GOV-001.

### 6.5 Emissão do parecer

**Quem:** Alçada de Arquitetura.  
**Norma de conteúdo:** GOV-001 (estrutura §§1–10, decisão §6, NCs §5).  

Evidências mínimas: ver §11 desta norma.  
Ao emitir: despacho → **PARECER_EMITIDO**; parecer → **EMITIDO**.

Tipos de entrega:

| Tipo | Quando |
|------|--------|
| **Parecer completo** | Elegibilidade OK; análise de mérito |
| **Parecer de devolução** | Inelegibilidade ou objecto ausente; decisão tipicamente REVISÃO NECESSÁRIA; secções N/A permitidas com motivo |

### 6.6 Tratamento das Não Conformidades

Após parecer EMITIDO:

1. **Alçada de decisão** de cada NC (GOV-001 §7) aprova, rejeita, prioriza ou aceita risco.  
2. **Responsável pela execução** (GOV-001 §8) materializa correcções autorizadas.  
3. Despacho → **EM_CORREÇÃO** enquanto houver NC aberta material ou condição §8 pendente.  
4. Registo mínimo por NC: ID · estado (`ABERTA` \| `EM_EXECUÇÃO` \| `CORRIGIDA` \| `ACEITE_RISCO` \| `REJEITADA`) · evidência de fecho.

| Fecho da NC | Exige reanálise? |
|-------------|------------------|
| Correcção editorial de metadados (NC-D baixa) com checklist §8 | Delta opcional; Alçada de Arquitetura pode dispensar por escrito |
| NC-A / NC-G severidade Alta | **Sim** — obrigatória |
| Cumprimento de condições §8 do parecer | **Sim**, salvo aceite formal de risco |
| ACEITE_RISCO pela alçada competente | Não (registar no pacote de fecho) |
| REJEITADA (não será corrigida) | Reavaliar decisão do parecer / Gate |

### 6.7 Reanálise após correcções

**Quando obrigatória:** ver tabela §6.6 + qualquer alteração **material** do objecto (conteúdo §§ técnicos do artefato, não só status).

**Modos:**

| Modo | Uso |
|------|-----|
| **Parecer delta (vN.x)** | Mesmo objecto; foca NCs/§8; referencia parecer-base |
| **Parecer completo (vN+1)** | Mudança estrutural do artefato ou REVISÃO NECESSÁRIA sanada com reescrita ampla |

Regras:

1. Parecer anterior → **SUPERADO**.  
2. Despacho → **EM_REANÁLISE** → **PARECER_EMITIDO**.  
3. Versionamento: §10.  
4. Não reabrir âmbito fora do despacho original sem aditamento da Alçada Executiva.

### 6.8 Critérios para homologação

Homologação aqui cobre: (a) **parecer** como base do Gate; e/ou (b) **artefato** analisado, conforme o objectivo do despacho.

| Decisão do parecer vigente | Homologação do artefato |
|----------------------------|-------------------------|
| APROVADO | Permitida pela Alçada de Governança sem condições extra GOV-001 |
| APROVADO COM RESSALVAS | Permitida só após §8 cumprido **ou** ACEITE_RISCO formal |
| REVISÃO NECESSÁRIA | **Proibida** até parecer posterior sem essa decisão |

Checklist de homologação (Gate):

| # | Critério |
|---|----------|
| H1 | Despacho em EM_HOMOLOGAÇÃO ou equivalente autorizado |
| H2 | Parecer no estado EMITIDO (versão vigente, não SUPERADO) |
| H3 | Evidências mínimas §11 presentes |
| H4 | NCs Alta fechadas (CORRIGIDA ou ACEITE_RISCO) |
| H5 | Unicidade de status do artefato (GOV-001 princípio 3) |
| H6 | Alçada de Governança regista decisão de Gate |
| H7 | Alçada do Patrocinador quando o objecto exigir Gate final de produto/produção |

### 6.9 Encerramento do despacho

**Quem:** Alçada Executiva, após Gate da Alçada de Governança (e Patrocinador se H7).  

Pacote de fecho (§12) completo → estado **ENCERRADO**.  
Parecer vigente → **HOMOLOGADO** (se aplicável) e/ou **ARQUIVADO**.

---

## 7. Critérios para reapresentação de artefatos

O artefato deve ser **reapresentado** (novo recebimento / aditamento ao despacho) quando:

| ID | Critério |
|----|----------|
| R1 | Decisão REVISÃO NECESSÁRIA por objecto inadequado ou incompleto |
| R2 | Versão do artefato mudou materialmente após o parecer-base |
| R3 | Correcções de NC-A / NC-G Alta alteraram desenho ou governação do texto |
| R4 | Despacho DEVOLVIDO e reaberto |
| R5 | Suspensão S6 (objecto real ≠ despachado) sanada com novo ID/versão |

**Não exige** reapresentação formal (basta evidência de correcção):

- NC-D cosmética com diff mínimo e checklist §8;  
- ACEITE_RISCO sem alteração de texto.

Na reapresentação, o despacho deve citar: versão anterior analisada · versão nova · lista de NCs endereçadas.

---

## 8. Versionamento de pareceres

| Elemento | Regra |
|----------|--------|
| Versão inicial | `1.0` no primeiro parecer completo do despacho |
| Parecer delta | `1.1`, `1.2`, … (mesmo objecto; âmbito restrito a NCs/§8) |
| Parecer completo sucessor | `2.0`, `3.0`, … quando o artefato foi reescrito ou o âmbito reabriu |
| Parecer de devolução | `0.x` permitido; se depois houver mérito, o completo inicia em `1.0` |
| Imutabilidade | Parecer EMITIDO não se edita em silêncio — emite-se nova versão |
| Superação | Versão antiga → SUPERADO; manter ficheiro/histórico |

Cabeçalho de cada versão deve citar: `Despacho`, `Artefato`, `Versão do artefato analisada`, `Versão do parecer`, `Parecer-base` (se delta).

---

## 9. Evidências mínimas para emissão de decisão

Sem estas evidências, a Alçada de Arquitetura **não** emite decisão de mérito (APROVADO / APROVADO COM RESSALVAS). Pode emitir apenas parecer de devolução (REVISÃO NECESSÁRIA).

| # | Evidência | Obrigatória para |
|---|-----------|------------------|
| V1 | Texto do artefato na versão citada | Toda decisão de mérito |
| V2 | Despacho com objectivo e escopo | Toda decisão |
| V3 | Leitura dos elos CON/VIS/REQ/ADR/CAP exigidos por GOV-001 §9 | Conformidade |
| V4 | Verificação de status aparente do artefato e elos cruzados | NC-G / NC-D |
| V5 | Referências a secções/IDs do artefato nas afirmações de impacto | Análise §2 |
| V6 | Lista de NCs (ou «Nenhuma») conforme GOV-001 §5 | Secção 10 |
| V7 | Exactamente uma decisão GOV-001 §6 | Secção 7 |
| V8 | Condições §8 se APROVADO COM RESSALVAS | Secção 8 |
| V9 | Data do parecer + ID | Cabeçalho |

Evidências **recomendadas** (não bloqueiam se impossíveis com declaração):

- Diff entre versões em reanálise;  
- Índice / README só como lastro de status aparente;  
- Evidências de IMP/VAL se o despacho cobrir cadeia pós-ARQ.

---

## 10. Matriz RACI processual (resumo)

| Etapa | Arquitetura | Governança | Executiva | Patrocinador | Engenheiro |
|-------|-------------|------------|-----------|--------------|------------|
| Abrir despacho | I | C | **R/A** | I | I |
| Triagem / elegibilidade | **R/A** | C | I | — | I |
| Emitir parecer | **R/A** | I | I | — | — |
| Decidir NC | C / **A** (NC-A) | **A** (NC-G/D) | **A** (prioridade) | **A** (Gate/risco) | I |
| Executar correcção | I | I | C | — | **R** |
| Reanálise | **R/A** | I | C | — | C |
| Homologar | C | **R/A** | C | **A** se H7 | I |
| Encerrar despacho | I | C | **R/A** | I | I |

R = Responsible · A = Accountable · C = Consulted · I = Informed  
Alçadas conforme GOV-001 §§7–8 (não nomes pessoais).

---

## 11. Pacote de fecho do despacho

Obrigatório para estado **ENCERRADO**:

1. ID do despacho + data de encerramento.  
2. ID e versão do parecer vigente.  
3. Decisão final do parecer vigente.  
4. Estado de cada NC (fechada / aceite risco / rejeitada).  
5. Decisão de Gate da Alçada de Governança (e Patrocinador se H7).  
6. Versão final do artefato reconhecida no Gate.  
7. Declaração de restrições cumpridas (se o despacho as impôs).

---

## 12. Compatibilidade com GOV-001 (cláusula de conformidade)

GOV-002 **não** redefine:

- estrutura do parecer;  
- classes NC-A/G/I/D;  
- vocabulário de decisão;  
- alçadas decisórias;  
- regras de severidade.

Qualquer emenda futura a GOV-001 que altere numeração de secções exige revisão de referências cruzadas em GOV-002 (emenda editorial), **sem** alterar o fluxo processual salvo necessidade.

---

## 13. Dependências normativas identificadas

| Dependência | Tipo | Nota |
|-------------|------|------|
| **GOV-001** | Norma irmã | Conteúdo do parecer; deve permanecer alinhada |
| **CON-001** | Superior | Papéis, rastreabilidade, tempo |
| **ADR-002** | Superior | Quatro perguntas; padrão documental |
| **ADR-006** | Superior | Gates de capacidade; parecer não substitui |
| **ADR-004 / catálogo** | Lateral | Tipo GOV no índice oficial ainda depende de ADR (não criado por este despacho) |
| Homologação GOV-001 | Processual | Uso pleno do binómio GOV-001+002 recomenda Gate de ambos; uso interno possível sob Alçada de Governança |

---

## 14. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Alçada de Arquitetura (DESP-C-003) |
| Quando | 04/08/2026 |
| O quê | GOV-002 v1.0 — Processo de Revisão Arquitetural |
| Por quê | Padronizar o ciclo de vida despacho→homologação após GOV-001 |
| Resultado | Em análise — pronto para homologação; GOV-001 intocado; sem novo tipo documental |

---

## 15. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 04/08/2026 | Alçada de Arquitetura (DESP-C-003) | Processo completo — estados, fluxo, elegibilidade, suspensão, NCs, reanálise, homologação, encerramento, versionamento, evidências | Em análise — aguarda homologação |

---

**Estado:** Em análise — aguarda **homologação** pela Alçada de Governança.  
**Próximo passo oficial:** Gate de GOV-002 (preferencialmente coordenado com Gate de GOV-001).

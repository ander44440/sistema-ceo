# F4-13 — Matriz de Validação Arquitetural

> **Status: Homologada — Gate F4-13 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **matriz de validação arquitetural** (consistência / completude / verificabilidade documental) — não plano de testes de software.  
> **Força:** a MVA = **mecanismo normativo oficial** de validação da Arquitetura Técnica.  
> **Escopo MVP-A:** DA-001…003 · PAT-01…12 · RTB-01…08 · CMP-001…014 · IFA-01…09 · CAT-001…018 · REL/ACI · FLX-01…06 · CX MVP-A · D1–D5  
> **Padrão:** F4-02 · D-F4-01…03 · N-F4-01…03  
> **Fluxos:** [`F4-12-fluxos-arquiteturais-canonicos.md`](F4-12-fluxos-arquiteturais-canonicos.md) — **obrigatórios** p/ comportamento integrado  
> **Marco:** [`marco-arquitetura-tecnica-normativa-concluida.md`](marco-arquitetura-tecnica-normativa-concluida.md)  
> **Proibições neste registro:** sem casos de teste executáveis; sem tecnologias; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Produzir a **Matriz de Validação Arquitetural (MVA)**: validar rastreabilidade entre DA, PAT, RTB, CMP, IFA, CAT, REL, FLX e CX; demonstrar cobertura D1–D5 e MVP-A; definir critérios de consistência, completude e verificabilidade — **sem** testes, tecnologias ou implementação.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Matrizes de rastreio cruzado dos IDs canônicos F1–F4.  
* Cobertura de domínios D1–D5 e CX do MVP-A.  
* Critérios CCV (consistência, completude, verificabilidade).  
* Checklist de gate para a Arquitetura Técnica integrada.  
* Identificar lacunas documentais (se houver) sem propor implementação.

### Não compete a este artefato

* Planos de teste, suítes automatizadas ou VAL de software.  
* Tech, infra, código.  
* Alterar DA/PAT/CX/CMP/FLX — apenas validar.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| F4-03…F4-12 (PAT…FLX) | Entrada | Permanente | Artefatos F4 |
| F3-04 / specs CX; F2-01; DA | Entrada | Permanente | F3; F2; F1 |
| Matrizes MVA + checklist CCV | Saída | Permanente | Gate F4; F4-14+ |
| Lacunas (se houver) | Saída | Situacional | Deliberação CTO |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-01…F4-12 (Integração consolidada) | → estrutural |
| Depende de | F1 DA; F2 D1–D5; F3 CX MVP-A | → estrutural |
| É pré-requisito de | Encerramento/deliberação F4; ARQ/REQ futuros | → |
| Relacionada | FLX (comportamento integrado) | ↔ — MVA valida o que FLX afirma |

---

## 5. Critérios de validação técnica (deste gate)

1. Matrizes cobrem DA↔PAT↔CX↔CMP↔FLX e D1–D5↔camadas.  
2. Toda CX MVP-A aparece em CMP e em ≥1 FLX (direto ou pré-condição).  
3. Critérios CCV inspecionáveis sem executar software.  
4. Zero testes/tech/infra; conformidade F4-02 / D-F4 / N-F4.

---

## 6. Restrições arquiteturais

* “Validação” ≠ teste de implementação.  
* Lacuna documental exige deliberação — não “corrigir” CX/PAT neste artefato.  
* Exceções: N-F4-03.

---

## 7. Matrizes de rastreabilidade

### 7.1 DA → PAT → CX → CMP → FLX

| DA | PAT | CX | CMP | FLX |
|----|-----|----|----|----|
| **DA-001** | PAT-01, PAT-02 | CX-04, CX-10, CX-11, CX-12 | 004, 009, 010, 011, 012 | FLX-02, FLX-03 |
| **DA-002** | PAT-03, PAT-04 | CX-07, CX-13, CX-14, CX-15 | 007, 008, 013 | FLX-04, FLX-05 |
| **DA-003** | PAT-05, PAT-07 | CX-01 | 001 | FLX-01 |

**Resultado:** DA-001…003 **cobertas** — sem órfãos.

### 7.2 PAT → evidência arquitetural

| PAT | Evidência principal |
|-----|---------------------|
| PAT-01 | CMP-004/009/010; IFA-06/07; FLX-03; CAT-008…011 |
| PAT-02 | CMP-010≠012; ACI-03; FLX-03; CAT-011 |
| PAT-03 | CMP-007/008/013; FLX-04/05 |
| PAT-04 | CMP-008; CAT-013; FLX-04 |
| PAT-05 | CMP-001; FLX-01 |
| PAT-06 | D-F4-01; specs F4-11 ⊂ F3 |
| PAT-07 | CMP-001; ACI-04; FLX-01/05 |
| PAT-08 | FLX-02/04/05; CMP-002/013 |
| PAT-09 | CMP-005/006; FLX-02 |
| PAT-10 | CMP-011; CAT-010/018; FLX-03 |
| PAT-11 | CMP-014; FLX-06 |
| PAT-12 | Ausência de tech em F4-01…13 |

**Resultado:** PAT-01…12 **evidenciados**.

### 7.3 CX MVP-A → RTB → CMP → IFA → FLX

| CX | RTB | CMP | IFA (típica) | FLX |
|----|-----|-----|--------------|-----|
| CX-01 | RTB-01 | 001 | IFA-01 | FLX-01, FLX-05 |
| CX-03 | RTB-02 | 002 | IFA-02 | FLX-02, FLX-03, FLX-04 |
| CX-04 | RTB-03 | 004 | IFA-03 | FLX-02, FLX-03 |
| CX-05 | RTB-02 | 003 | IFA-03 | FLX-02, FLX-03 |
| CX-07 | RTB-04 | 007 | IFA-05 | FLX-02, FLX-03, FLX-05 |
| CX-08 | RTB-03 | 005 | IFA-04 | FLX-02, FLX-05 |
| CX-09 | RTB-03 | 006 | IFA-04 | FLX-02, FLX-03 |
| CX-10 | RTB-05 | 009, 010 | IFA-06, IFA-07 | FLX-03 |
| CX-11 | RTB-05 | 011 | IFA-07 | FLX-03 |
| CX-12 | RTB-06 | 012 | IFA-08 | FLX-03, FLX-04 |
| CX-13 | RTB-04 | 008 | IFA-05 | FLX-04 |
| CX-14 | RTB-07 | 013 | IFA-09 | FLX-04 |
| CX-15 | RTB-07 | 013 | IFA-09 | FLX-05 |
| CX-16 | RTB-08 | 014 | IFA-09 | FLX-06 (+ overlay) |

**Resultado:** 14/14 CX MVP-A **cobertas**. Evolutivas (02, 06, 17, 18) **fora** do escopo — conforme F3-02.

### 7.4 Domínios D1–D5 → camadas → CMP

| Domínio | Camada | CMP |
|---------|--------|-----|
| **D1** Comando e Atenção | L1 | 002 |
| **D2** Conversa e Intenção | L1 (+ L2 intenção) | 003, 004 |
| **D3** Contexto e Conhecimento | L3 | 007, 008 |
| **D4** Orquestração (invisível) | L4 | 009, 010, 011 |
| **D5** Execução e Efeito | L5 | 012 |
| **Lente COA** (transversal) | L0 | 001 |
| **Continuidade / Honestidade** | Tx | 013, 014 |

**Resultado:** D1–D5 + lente + Tx **cobertos**; D4≠D5 preservado.

### 7.5 CAT → FLX (cobertura de contratos)

| CAT | FLX que o exercita |
|-----|-------------------|
| CAT-001 | FLX-01, FLX-05 |
| CAT-002…007 | FLX-02 |
| CAT-008…012, CAT-018 | FLX-03 |
| CAT-013…015 | FLX-04 |
| CAT-016 | FLX-05 |
| CAT-017 | FLX-06 (overlay) |

**Resultado:** CAT-001…018 **exercitados** por ≥1 FLX.

### 7.6 REL / ACI — checagens de consistência

| Regra | Verificação |
|-------|-------------|
| REL-E L4→L5 | FLX-03 passos 3–5; sem CMP-012→CMP-010 |
| REL-C promoção | FLX-04; candidato ≠ permanente automático |
| ACI-03 | Nenhum FLX inverte execução→encaminhamento |
| ACI-06 | FLX-03 passo 4 condicional; rejeição bloqueia execução |
| ACI-04 | FLX-01/05; todos sob CMP-001 |

**Resultado:** consistência **OK** nas regras críticas.

---

## 8. Critérios CCV (consistência, completude, verificabilidade)

### 8.1 Consistência (CON)

| ID | Critério | Status |
|----|----------|--------|
| CON-01 | Nenhum CMP viola seu RTB/camada (F4-08/11) | ✅ |
| CON-02 | Nenhum CAT viola deps de camada (F4-05 §7.3) | ✅ |
| CON-03 | FLX usam apenas CMP/CAT/IFA homologados | ✅ |
| CON-04 | D4≠D5 / PAT-02 preservados nos FLX | ✅ |
| CON-05 | DA não contraditas por fluxo | ✅ |

### 8.2 Completude (COM)

| ID | Critério | Status |
|----|----------|--------|
| COM-01 | 14 CX MVP-A rastreadas | ✅ |
| COM-02 | D1–D5 + L0 + Tx cobertos | ✅ |
| COM-03 | PAT-01…12 evidenciados | ✅ |
| COM-04 | DA-001…003 cobertas | ✅ |
| COM-05 | Ciclo F2-02 coberto (FLX-02…04) + sessão (FLX-05) + honestidade (FLX-06) | ✅ |
| COM-06 | CAT-001…018 exercitados | ✅ |
| COM-07 | Evolutivas explicitamente fora | ✅ |

### 8.3 Verificabilidade (VER)

| ID | Critério | Status |
|----|----------|--------|
| VER-01 | Cada vínculo cita IDs canônicos inspecionáveis em artefato F4 | ✅ |
| VER-02 | Checklist §9 aplicável por revisão documental (sem executar código) | ✅ |
| VER-03 | Falha = ID órfão, contradição de fronteira ou CX MVP-A sem FLX/CMP | ✅ |
| VER-04 | Não depende de ambiente, stack ou dados de runtime | ✅ |

---

## 9. Checklist de gate (comportamento integrado)

Usar F4-12 como referência obrigatória. Para cada item: **Sim / Não / N/A**.

| # | Pergunta |
|---|----------|
| 1 | FLX-01 estabelece lente antes dos demais fluxos? |
| 2 | FLX-02 coloca intenção antes de meios (DA-001)? |
| 3 | FLX-03 mantém encaminhamento invisível e gate condicional? |
| 4 | FLX-03 rejeição impede execução? |
| 5 | FLX-04 distingue efeito, promoção seletiva e Nova Atenção? |
| 6 | FLX-05 restaura sem suspender por logout? |
| 7 | FLX-06 cobre pontos críticos sem substituir donos? |
| 8 | Todas as CX MVP-A aparecem na matriz §7.3? |
| 9 | D1–D5 mapeados sem fundir D4 e D5? |
| 10 | Nenhum seletor de meios/IA aparece em CMP/IFA/FLX? |

**Homologação arquitetural integrada:** 1–10 = Sim (ou N/A justificado).

---

## 10. Lacunas

| Item | Avaliação |
|------|-----------|
| CX evolutivas sem FLX | **Esperado** — fora do MVP-A |
| HP-004/005/006 | **Fora** — não normativas; não bloqueiam MVA |
| Detalhe de cenários por CMP | Opcional F4-14+; não bloqueia MVA |
| Lacunas bloqueantes no MVP-A | **Nenhuma identificada** neste gate |

---

## 11. Rastreabilidade deste artefato

| Eixo | Referências |
|------|-------------|
| F1 | DA §7.1 |
| F2 | D1–D5 §7.4; ciclo §8.2 COM-05 |
| F3 | CX §7.3 |
| F4 | F4-03…13; Arquitetura Técnica Normativa concluída |
| PAT | §7.2 |
| Este | MVA = **mecanismo normativo oficial** de validação + CCV + checklist |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F4-13); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F4-13 — Matriz de Validação Arquitetural |
| Baseado em quê | F4-01…12; DA; D1–D5; CX MVP-A; PAT |
| Resultado | F4-13 **homologada**; MVA = mecanismo normativo oficial de validação; Arquitetura Técnica Normativa concluída; F4 encerrada; F5 autorizada |

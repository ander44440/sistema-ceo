# REG-001 — Plano de Regularização Arquitetural da Onda F1

> **Status:** **Executado** — pacote mínimo concluído 06/08/2026 ([`REG-001-pacote-fecho-f1.md`](REG-001-pacote-fecho-f1.md)).  
> **Versão:** 1.0 — 04/08/2026 (plano); execução 06/08/2026.  
> **Tipo:** REG — Plano de regularização (processo).  
> **Identificação:** REG-001.  
> **Despacho:** DESP-C-005 (plano); mandato CTO Opção B (execução).  
> **Fonte exclusiva:** [`AUD-001`](AUD-001-auditoria-arquitetural-onda-f1.md) v1.0.  
> **Normas de referência:** GOV-001 · GOV-002.  
> **Natureza do plano (04/08):** somente plano. **Natureza da execução (06/08):** editorial + governação — **sem** código de produto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano oficial que consolida as NCs da AUD-001, elimina duplicidades e define ordem, dependências e critérios de fecho da Onda F1. |
| **Por que existe?** | AUD-001 diagnosticou; falta o plano accionável sem iniciar execução. |
| **Para quem existe?** | Alçada de Governança (autoriza); Alçada Executiva (despacha); Alçada do Patrocinador (Gate); Engenheiro (executa quando autorizado); Alçada de Arquitetura (reauditoria). |
| **Como medir sucesso?** | (1) Inventário sem duplicatas; (2) dependências explícitas; (3) sequência ordenada; (4) critérios de conclusão por acção; (5) critérios de encerramento F1 verificáveis. |

---

## 1. Inventário consolidado das NCs

### 1.1 NCs brutas (AUD-001)

| ID AUD | Classe | Severidade | Bloqueia encerramento F1? (AUD §9) |
|--------|--------|------------|-------------------------------------|
| NC-G1 | Governança | Alta | **Sim** |
| NC-G2 | Governança | Alta | **Sim** |
| NC-G3 | Governança | Alta | **Sim** |
| NC-G4 | Governança | Média | Indireto (apoia G2) |
| NC-D1 | Documentação | Alta | **Sim** (com G1) |
| NC-D2 | Documentação | Alta | **Sim** |
| NC-D3 | Documentação | Média | Indireto (subconjunto G1/D1) |
| NC-D4 | Documentação | Baixa–Média | **Não** (recomendado) |
| NC-I1 | Implementação | Média | Indireto (fecho via G3 + registo) |
| NC-I2 | Implementação | Baixa–Média | Indireto (evidência do Gate G3) |
| NC-A1 | Arquitetura | Média | **Não** (pós-F1) |
| NC-A2 | Arquitetura | Baixa/Média | **Não** (pós-F1) |

**Total bruto:** 12 NCs.

### 1.2 Eliminação de duplicidades / agrupamento

| Grupo REG | NCs absorvidas | Motivo da fusão |
|-----------|----------------|-----------------|
| **RG-01** Unicidade de status | NC-G1 + NC-D1 + NC-D3 | Mesma causa-raiz: cabeçalho ≠ Memória/Histórico/rodapé (D3 = caso ARQ-030 do mesmo defeito) |
| **RG-02** Elos cruzados e índices | NC-D2 | Distinto: afirmações entre documentos / README |
| **RG-03** Gate ARQ→IMP + L1–L6 | NC-G2 + NC-G4 | G4 é evidência mínima do Gate retrospectivo exigido por G2 |
| **RG-04** Gate final F1 | NC-G3 + NC-I2 (+ fecho narrativo NC-I1) | Gate patrocinador; smoke humano é evidência; I1 já corrigido em código — falta fecho documental/Gate |
| **RG-05** Narrativa ENC-006 | NC-D4 | Residual pré-F1; não bloqueia índice D4/D6 se RG-01…04 fechados |
| **RG-06** Marcadores de build | NC-A1 | Dívida de plataforma; fora do mínimo AUD §9 |
| **RG-07** Promoção automatizada | NC-A2 | Dívida de plataforma; fora do mínimo AUD §9 |

**Total consolidado:** **7 grupos de regularização** (4 bloqueantes + 1 recomendado + 2 pós-F1).

### 1.3 Acções oficiais do plano

| ID Acção | Grupo | Título | Tipo | Bloqueante F1? | Decisão | Execução |
|----------|-------|--------|------|----------------|---------|----------|
| **REG-A01** | RG-01 | Unificar status + Memória/Histórico/rodapé (ANL-013, REQ-069, ARQ-030, IMP-069) | **Editorial** + **Governança** | **Sim** | Alçada de Governança | Engenheiro |
| **REG-A02** | RG-02 | Sincronizar referências cruzadas e entradas de índice (`README`, headers ANL/REQ, rastreabilidade) | **Editorial** + **Governança** | **Sim** | Alçada de Governança | Engenheiro |
| **REG-A03** | RG-03 | Registar Gate ARQ→IMP (retrospectivo) + checklist L1–L6 satisfeitos | **Governança** | **Sim** | Alçada de Governança | Engenheiro |
| **REG-A04** | RG-04 | Gate final VAL-011 + VAL-011R (com evidência oral humana se exigida pela alçada) | **Governança** (+ **Implementação** só se nova falha) | **Sim** | Alçada do Patrocinador | Coordenador Executivo · Engenheiro (suporte) |
| **REG-A05** | RG-04 | Registar no pacote de fecho o ciclo STT / VAL-011R (NC-I1 como CORRIGIDA) | **Editorial** + **Governança** | **Sim** (pacote de fecho) | Alçada de Governança | Engenheiro |
| **REG-A06** | RG-05 | Actualizar ENC-006 quanto ao residual de produção pós-F1 | **Editorial** | **Não** | Alçada de Governança | Engenheiro |
| **REG-A07** | RG-06 | Definir marcador de build estável (pós-F1; ciclo próprio) | **Arquitetura** | **Não** | Alçada de Arquitetura | Engenheiro |
| **REG-A08** | RG-07 | Gate automatizado main→alias (pós-F1; ciclo próprio) | **Arquitetura** + **Implementação** | **Não** | Alçada de Arquitetura | Engenheiro |

**Nota de tipo misto:** A01/A02 são *Editorial* na materialização e *Governança* na autorização do status canónico — a alçada de decisão permanece Governança.

---

## 2. Dependências entre acções

```text
                    ┌─────────┐
                    │ REG-A01 │  Unicidade de status
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │ REG-A02 │  Elos / índices (requer status canónico)
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │ REG-A03 │  Gate ARQ→IMP + L1–L6
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            ▼                         ▼
       ┌─────────┐              ┌─────────┐
       │ REG-A05 │              │ REG-A04 │  Gate patrocinador
       │ fecho   │─────────────►│ VAL-011 │  (pode correr após A03;
       │ STT doc │  evidência   │ + 011R  │   A05 deve estar no pacote)
       └─────────┘              └────┬────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │ Fecho F1 arch  │
                            │ (+ AUD delta)  │
                            └────────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             ┌─────────┐                       ┌─────────┐
             │ REG-A06 │  ENC-006 (opcional    │ REG-A07 │
             │         │   ao caminho crítico) │ REG-A08 │  pós-F1
             └─────────┘                       └─────────┘
```

| Acção | Depende de | Bloqueia |
|-------|------------|----------|
| A01 | — (início do caminho crítico) | A02, A03 |
| A02 | A01 | A03 (recomendado forte); fecho limpo |
| A03 | A01; A02 (recomendado) | A04 (governação limpa); fecho F1 |
| A05 | A03 (contexto de Gate); pode redigir em paralelo a A04 | Pacote de fecho de A04 |
| A04 | A03; A05 no pacote | Encerramento arquitectural F1 |
| A06 | A04 (preferível após fecho) | — |
| A07 | Encerramento F1 **ou** aceite explícito de abrir ciclo paralelo | — |
| A08 | Idem A07; preferível após A07 | — |

**Proibição:** executar A07/A08 como “correcção F1” — AUD-001 coloca-os fora do mínimo de encerramento.

---

## 3. Sequência recomendada de execução

| Ordem | Acção | Tipo | Fase |
|-------|-------|------|------|
| 1 | **REG-A01** | Editorial + Governança | Regularização documental |
| 2 | **REG-A02** | Editorial + Governança | Regularização documental |
| 3 | **REG-A03** | Governança | Regularização de Gate intermédio |
| 4 | **REG-A05** | Editorial + Governança | Pacote de fecho |
| 5 | **REG-A04** | Governança | Gate final |
| 6 | Reauditoria delta (AUD-001R ou despacho equivalente) | Governança + Arquitetura (diagnóstico) | Verificação |
| 7 | Actualizar ROADMAP-002 estado F1 | Editorial + Governança | Encerramento de onda |
| 8 | **REG-A06** (opcional imediato) | Editorial | Higiene narrativa |
| 9+ | **REG-A07** → **REG-A08** | Arquitetura / Implementação | Novo ciclo (pós-F1) |

Passos 6–7 não são NCs da AUD, mas são **obrigatórios ao critério de encerramento** deste plano (§5).

---

## 4. Critérios de conclusão de cada acção

### REG-A01 — Unicidade de status

| Critério | Verificável |
|----------|-------------|
| C1 | Em ANL-013, REQ-069, ARQ-030, IMP-069: cabeçalho, Memória, Histórico e rodapé declaram **o mesmo** status canónico |
| C2 | Nenhuma frase «aguarda homologação» coexistindo com «Homologada» no mesmo documento, salvo dual status **explícito e coerente** (modelo VAL-011: engenharia vs Gate) |
| C3 | Histórico regista linha editorial da regularização (data + alçada) |
| NCs fechadas | NC-G1, NC-D1, NC-D3 → CORRIGIDA |

### REG-A02 — Elos e índices

| Critério | Verificável |
|----------|-------------|
| C1 | ANL-013 e REQ-069 citam ARQ-030 com o **mesmo** status que o cabeçalho de ARQ-030 |
| C2 | Rastreabilidade interna de REQ-069 alinhada ao header |
| C3 | `docs/README.md` reflecte os status pós-A01 sem contradição entre linhas F1 |
| NCs fechadas | NC-D2 → CORRIGIDA |

### REG-A03 — Gate ARQ→IMP + L1–L6

| Critério | Verificável |
|----------|-------------|
| C1 | Memória Organizacional (ARQ-030 e/ou IMP-069) regista Gate ARQ→IMP: quem, quando, resultado |
| C2 | Checklist L1–L6 de ARQ-030 §10 marcado como satisfeito **ou** desvio justificado com ACEITE_RISCO |
| C3 | Rodapé ARQ-030 deixa de proibir IMP de forma anacrónica |
| NCs fechadas | NC-G2, NC-G4 → CORRIGIDA |

### REG-A05 — Fecho documental STT / VAL-011R

| Critério | Verificável |
|----------|-------------|
| C1 | Pacote de fecho F1 cita VAL-011R, deployment pós-correcção e estado NC-I1 = CORRIGIDA |
| C2 | Distinção clara: promoção IMP-069 ≠ patch STT (transparência CON-001) |
| NCs fechadas | NC-I1 → CORRIGIDA (registo) |

### REG-A04 — Gate final patrocinador

| Critério | Verificável |
|----------|-------------|
| C1 | VAL-011 com decisão explícita da Alçada do Patrocinador (aprovado / rejeitado / ressalvas) |
| C2 | VAL-011R com decisão explícita da Alçada do Patrocinador |
| C3 | Se a alçada exigir smoke oral humano: evidência mínima de 1 turno (AUD NC-I2) anexada ou aceite de risco escrito |
| C4 | GATE-010 permanece cancelado **ou** é reaberto só após C1–C2 (conforme regra já escrita em VAL-011R) — sem reabertura prematura |
| NCs fechadas | NC-G3 → CORRIGIDA; NC-I2 → CORRIGIDA ou ACEITE_RISCO |

### REG-A06 — ENC-006

| Critério | Verificável |
|----------|-------------|
| C1 | ENC-006 referencia fecho do residual de produção via F1 / VAL-011(R) **ou** aponta explicitamente supersessão |
| NCs fechadas | NC-D4 → CORRIGIDA |

### REG-A07 / REG-A08 — Pós-F1

| Critério | Verificável |
|----------|-------------|
| A07 | Existe decisão da Alçada de Arquitetura + artefato de ciclo próprio (não improvisar sob F1) |
| A08 | Idem; preferencialmente após contrato de marcadores (A07) |
| NCs | NC-A1 / NC-A2 → abertas até ciclo próprio; **não** impedem §5 |

---

## 5. Critérios para considerar a Onda F1 arquitecturalmente encerrada

A Onda F1 considera-se **arquitecturalmente encerrada** somente quando **todos** forem verdadeiros:

| # | Critério |
|---|----------|
| F1 | REG-A01 concluída |
| F2 | REG-A02 concluída |
| F3 | REG-A03 concluída |
| F4 | REG-A05 concluída |
| F5 | REG-A04 concluída (Gates VAL-011 e VAL-011R) |
| F6 | Nenhuma NC-G/D **Alta** da AUD-001 permanece ABERTA (CORRIGIDA ou ACEITE_RISCO formal) |
| F7 | Reauditoria delta confirma D4 ≥ 3 e D6 ≥ 3 (escala AUD-001 §7) **ou** Alçada do Patrocinador aceita risco residual por escrito |
| F8 | ROADMAP-002 actualizado: F1 **encerrada** (ou equivalente inequívoco) |
| F9 | Pacote de fecho GOV-002 §11 (adaptado à onda) registado |

**Explicitamente não exigido para encerramento F1:** REG-A06, REG-A07, REG-A08.

---

## 6. Caminho crítico e métricas do plano

### 6.1 Caminho crítico para o fechamento da F1

```text
REG-A01 → REG-A02 → REG-A03 → REG-A05 → REG-A04 → Reauditoria delta → ROADMAP-002 (F1 encerrada)
```

Qualquer atraso em **A01** ou **A04** atrasa o fecho; **A04** é o único passo que exige a Alçada do Patrocinador de forma insubstituível.

### 6.2 Número mínimo de acções necessárias

| Contagem | Conjunto |
|----------|----------|
| **Mínimo bloqueante** | **5 acções:** REG-A01, A02, A03, A05, A04 |
| + verificação de encerramento | **2 passos de fecho:** reauditoria delta + actualização ROADMAP-002 |
| **Mínimo operacional para declarar F1 encerrada** | **7 passos** (5 REG + 2 fecho) |
| Opcional higiene | + REG-A06 |
| Pós-evolução plataforma | + REG-A07, REG-A08 (novo ciclo; não contam para F1) |

### 6.3 Quando a arquitectura estará apta a novo ciclo de evolução

| Condição | Aptitude |
|----------|----------|
| Antes de concluir caminho crítico | **Não apta** a encerrar F1; F6 e frentes dependentes de voz em produção permanecem bloqueadas ou sob aceite explícito de risco (ROADMAP-002 / GATE-009) |
| Após F1…F9 (§5) satisfeitos | **Apta** a deliberar novo ciclo de evolução **no perímetro F1 fechado** (ex. F2, ou outras frentes não condicionadas a F1) |
| Frentes que exigem F1 fechada (ex. F6) | Somente após §5 **ou** ACEITE_RISCO escrito da Alçada do Patrocinador |
| REG-A07/A08 | Não condicionam a aptidão a *abrir* novo ciclo; condicionam a *qualidade* de implantações futuras |

**Resposta directa:** a arquitectura / governação da onda estará **apta para novo ciclo de evolução sem ressalva de F1** quando o **caminho crítico (§6.1)** e os **critérios §5** estiverem cumpridos — estimativa processual: **5 acções REG bloqueantes + 2 passos de fecho**, após autorização de execução pela Alçada de Governança / Patrocinador.

---

## 7. Fora deste plano

- Execução das correcções (exige despacho posterior).  
- Criação de REQ/ADR/ARQ de produto.  
- Revisão do desenho ARQ-029 / ARQ-030 §§ técnicos.  
- Homologação de GOV-001/GOV-002 (paralela recomendada; não listada como NC AUD-001).

---

## 8. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Alçada de Arquitetura (DESP-C-005) |
| Quando | 04/08/2026 (plano); 06/08/2026 (execução pacote mínimo) |
| O quê | REG-001 v1.0 — Plano de Regularização Arquitectural da Onda F1 |
| Por quê | Converter AUD-001 em plano accionável sem executar |
| Resultado | Plano emitido 04/08; **pacote mínimo executado 06/08** — F1 encerrada |

---

## 9. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 04/08/2026 | Alçada de Arquitetura (DESP-C-005) | Plano completo — inventário, dependências, sequência, critérios, encerramento F1 | Emitido |
| 1.0-exec | 06/08/2026 | Engenheiro (Cursor) | Execução A01→A02→A03→A05→A04 + ROADMAP; ver pacote de fecho | **Executado** — F1 encerrada |

---

**Estado do plano:** **Executado** (pacote mínimo).  
**Pacote de fecho:** [`REG-001-pacote-fecho-f1.md`](REG-001-pacote-fecho-f1.md).  
**A07/A08:** permanecem pós-F1 (não executados).

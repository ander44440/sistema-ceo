# Verificação pré-IMP — Critérios de aceitação REQ-075…084

> **Tipo:** verificação de pré-condição (Gate documental).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — pacote REQ-075…084 **APROVADO**; CAs objectivos binários obrigatórios antes da IMP.  
> **Resultado:** **PRÉ-CONDIÇÃO SATISFEITA.**  
> **Efeito:** fica **autorizada a preparação** da fase de implementação da CAP-01 (Autoridade Delegada).  
> **Este documento não abre a IMP.**

---

## 1. Critério da pré-condição

> Cada REQ deverá possuir critérios de aceitação **objectivos, binários e verificáveis**.  
> A implementação somente poderá responder **PASS** ou **FAIL** — sem interpretação subjectiva.

Método de verificação deste Gate:

1. Condição observável enunciada.  
2. Método de verificação com resultado **pass** ou **fail** explícito.  
3. Ausência de tecnologia/IMP embutida no critério.  
4. Sem juízo subjectivo («adequado», «razoável», «suficiente» sem métrica).

---

## 2. Matriz de verificação

| REQ | R | CAs | Binário PASS/FAIL? | Verificável? | Sem tecnologia? | Resultado |
|-----|---|-----|--------------------|--------------|-----------------|-----------|
| REQ-075 v1.0 | R1 | CA-075-1…4 | Sim | Sim (cenário / matriz) | Sim | **OK** |
| REQ-076 v1.0 | R2 | CA-076-1…4 | Sim | Sim (estado / inspecção) | Sim | **OK** |
| REQ-077 v1.0 | R3 | CA-077-1…4 | Sim | Sim (fecho / checklist) | Sim | **OK** |
| REQ-078 v1.0 | R4 | CA-078-1…4 | Sim | Sim (matrizes de recusa) | Sim | **OK** |
| REQ-079 v1.0 | R5 | CA-079-1…4 | Sim | Sim (termo / estado) | Sim | **OK** |
| REQ-080 v1.0 | R6 | CA-080-1…4 | Sim | Sim (estado inactivo / residual) | Sim | **OK** |
| REQ-081 v1.0 | R7 | CA-081-1…4 | Sim | Sim (prevalência / revogação) | Sim | **OK** |
| REQ-082 v1.0 | R8 | CA-082-1…4 | Sim | Sim (modelo / cenários / CTO-003) | Sim | **OK** |
| REQ-083 v1.0 | R9 | CA-083-1…4 | Sim | Sim (MO completa / marcação) | Sim | **OK** |
| REQ-084 v1.0 | R10 | CA-084-1…4 | Sim | Sim (matriz de três conceitos) | Sim | **OK** |

**Total:** 40 critérios nomeados · 10/10 REQs conformes · cobertura R1–R10 = 10/10.

---

## 3. Conformidade adicional (pacote aprovado)

| Constatação CTO | Estado |
|-----------------|--------|
| Cobertura integral R1–R10 | Mantida |
| Responsabilidade única por REQ | Mantida |
| Sem sobreposição funcional | Mantida |
| Sem deriva ARQ-032 | Mantida |
| Sem conflito CTO-003 / ARQ-031 / CAP-04 / CAP-01 | Mantida |
| Escopo estritamente arquitectural nos REQs | Mantida |

---

## 4. Regra de verificação na IMP (futura)

Cada CA, na IMP/VAL correspondente, responde **apenas**:

| Resultado | Significado |
|-----------|-------------|
| **PASS** | Critério satisfeito de forma observável |
| **FAIL** | Critério não satisfeito |

Proibido: «parcialmente», «em espírito», «aceitável com ressalvas» como veredicto de CA.

---

## 5. Autorizações

| Acto | Estado |
|------|--------|
| Pacote REQ-075…084 | **Aprovado** |
| Pré-condição CAs binários | **Verificada — OK** |
| Preparação da fase IMP | **Autorizada** |
| Abertura do ciclo IMP CAP-01 | **Ainda não** — exige despacho/IMP dedicado após esta confirmação formal |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (verificou) sob despacho CTO |
| Quando | 07/08/2026 |
| O quê | Verificação formal CAs REQ-075…084 (PASS/FAIL) |
| Resultado | Pré-condição satisfeita; preparação IMP autorizada; IMP **não** aberta |

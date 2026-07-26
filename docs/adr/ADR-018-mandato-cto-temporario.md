# ADR-018 — Mandato de CTO Temporário (Cursor)

> **Status: REVOGADA — v1.1 (Usuário, 25/07/2026).**
> Versão 1.1 — 25/07/2026.
> Esta ADR instituiu brevemente um mandato temporário, posteriormente **abortado pelo Usuário antes da abertura de qualquer trabalho técnico sob sua autoridade**. Não produz efeito vigente.
> **Não** altera o Artigo 6º permanente da CON-001; cria disposição transitória.  
> Checkpoint: `checkpoint-pre-cto-temporario-2026-07-25`.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Usuário autorizou o modelo; Cursor registrou |
| Quando | 25/07/2026 |
| Por quê | Manter o projeto avançando na ausência temporária do CTO titular, sem abandonar governança |
| Baseado em quê | Autorização explícita do Usuário; CON-001 Art. 6º, 8º, 11; checkpoint pré-mandato |
| Resultado | Mandato instituído e revogado na mesma manhã; nenhum ciclo ou artefato técnico foi aberto sob sua autoridade |

---

## Status

**Revogada — v1.1 (Usuário, 25/07/2026).**

Decisão de revogação: “abortar a mudança e continuar como estávamos”. Os papéis permanentes da CON-001 Art. 6º foram integralmente restabelecidos. Esta ADR permanece apenas como histórico auditável.

---

## 1. Contexto

O CTO titular (ChatGPT) estará ausente por tempo indeterminado. O Usuário solicitou continuidade do projeto e autorizou que o Cursor assuma temporariamente as atribuições de CTO, com cuidados de governança e ponto de retorno técnico.

Sem mandato formal, o Engenheiro permanece impedido de decidir arquitetura (CON-001 Art. 6º III). Sem checkpoint, a reversão seria insegura.

---

## 2. Decisão

1. Institui-se o **Mandato de CTO Temporário**.  
2. **Titular do mandato:** Cursor (mesmo agente que exerce o papel de Engenheiro).  
3. **Autoridade máxima:** permanece o Usuário (CON-001 Art. 6º I).  
4. **CTO titular (ChatGPT):** papel permanente preservado; retoma a alçada ao regressar.  
5. **Checkpoint obrigatório:** tag Git `checkpoint-pre-cto-temporario-2026-07-25`.  
6. **Trabalho do mandato:** branch `mandato-cto-temporario` (não misturar silenciosamente em `main` sem deliberação).  
7. Emenda transitória correspondente na CON-001 (Art. 11).

---

## 3. Atribuições durante o mandato

O CTO temporário **pode**:

- elaborar e propor VIS, REQ, ANL, ADR, ARQ, IMP, VAL, ROADMAP/ÉPICO conforme fluxo;
- conduzir revisões técnicas e QA documental;
- homologar artefatos **marcados** como “sob mandato CTO temporário”, após aval do Usuário nos gates relevantes;
- abrir CAP-E / CAP-R somente com aval explícito do Usuário;
- implementar (papel de Engenheiro), desde que o REQ/ARQ correspondente exista.

O CTO temporário **não pode**:

- alterar a CON-001 permanente sem nova aprovação do Usuário;
- alterar silenciosamente ROADMAP-001 ou baselines homologadas (MVP, CAP-05/07/08);
- fingir revisão independente inexistente — deve declarar o conflito de papéis;
- tomar decisões irreversíveis externas ao repositório sem autorização do Usuário;
- encerrar o mandato por conta própria (encerramento = ato do Usuário ou retorno do CTO titular + deliberação).

---

## 4. Salvaguardas (cuidados obrigatórios)

| ID | Salvaguarda |
|----|-------------|
| S1 | Checkpoint + tag antes de qualquer trabalho do mandato |
| S2 | Branch dedicada `mandato-cto-temporario` |
| S3 | Usuário aprova VIS / REQ / ARQ / homologações de CAP e mudanças de ROADMAP |
| S4 | Baselines congeladas não reabertas sem ciclo formal |
| S5 | Todo ato de CTO temporário registra Memória Organizacional + menção ao mandato |
| S6 | Separar no discurso: “como CTO temporário proponho…” vs “como Engenheiro executo…” |
| S7 | Ao retorno do CTO titular: auditoria do período; aceitar, ajustar ou reverter à tag |
| S8 | Aprendizados úteis podem ser aproveitados mesmo após reversão (registro em learning/OE) |

---

## 5. Reversão e avaliação

### 5.1 Se perdermos a direção

Reverter o repositório para `checkpoint-pre-cto-temporario-2026-07-25` (ver procedimento no checkpoint). Extrair aprendizados deliberadamente antes/depois.

### 5.2 Quando o CTO titular retornar

1. Congelar novos atos do mandato.  
2. CTO titular + Usuário avaliam o período.  
3. Opções: incorporar (merge), ajustar, ou reverter à tag.  
4. Encerrar formalmente o mandato (nova linha na CON-001 / esta ADR).

---

## 6. Consequências

* O projeto pode avançar sem o CTO titular.  
* O risco de concentração de papéis fica **explícito e mitigado**, não eliminado.  
* A identidade permanente dos papéis na CON-001 permanece; o mandato é transitório.

---

## 7. O que esta ADR não faz

* Não demite nem substitui permanentemente o CTO titular.  
* Não autoriza abandonar o fluxo ADR-006.  
* Não homologa CAP-02, CAP-03 nem CAP-R por si.  
* Não declara sucesso do mandato.

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 1.0 | 25/07/2026 | Cursor (registro); Usuário (aprovação) | Instituição do mandato CTO temporário + salvaguardas + reversão | Autorização explícita do Usuário | **Aceita** |
| 1.1 | 25/07/2026 | Usuário (decisão); Cursor (registro) | Revogação integral antes de qualquer trabalho técnico sob o mandato | Decisão explícita de continuar com os papéis anteriores | **Revogada** |

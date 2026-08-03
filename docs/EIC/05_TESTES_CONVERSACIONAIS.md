# 05 — Testes Conversacionais

> **Status:** BLOCO 3 — Qualidade consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Quadro de testes — valida **apenas** CA/NA de [`04`](04_CRITÉRIOS_DE_QUALIDADE.md) / normas citadas. Sem cenários inventados fora do lastro.  
> **Fontes:** [`04_CRITÉRIOS_DE_QUALIDADE.md`](04_CRITÉRIOS_DE_QUALIDADE.md); ARQ-018; PX-003 E4; CON-001; [`03_ROADMAP.md`](03_ROADMAP.md).

## Objetivo

Estabelecer o quadro oficial para registar e padronizar testes conversacionais da EIC, alinhados aos critérios de [`04`](04_CRITÉRIOS_DE_QUALIDADE.md).

## Finalidade

Responder *como verificamos* a qualidade. A decisão de aceite → [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md).

---

## 1. Relação com Critérios e Homologação

| Etapa | Artefacto |
|-------|-----------|
| Definir o que é bom/falha | [`04`](04_CRITÉRIOS_DE_QUALIDADE.md) CA-EIC-* / NA-EIC-* |
| Executar e registar | **Este documento** |
| Aceitar / rejeitar | [`11`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) |

Nenhum teste EIC avalia “estilo livre”: só IQ-* e CA/NA oficiais.

---

## 2. Tipos de Testes

| Tipo | Objectivo | Quando |
|------|-----------|--------|
| **T-CL** Classificação | Verificar CA-EIC-01…03 / NA-01…02 | Mensagem → classe esperada (ARQ-018) |
| **T-PR** Prosa / turno | Verificar CA-EIC-04…10 / NA-04…09 | Saída ao utilizador vs PX-003 E4 |
| **T-ID** Identidade | Verificar CA-EIC-10 / NA-03 | CEO ≠ chatbot; invariantes |
| **T-FX** Fronteira | Verificar CA-EIC-11 / NA-10 | CN não delibera; Classificador não publica Job |
| **T-RG** Regressão | Reexecutar cenários após mudança autorizada | Pós G-EIC-D / IMP |
| **T-MN** Manual guiado | Patrocinador/CTO no Centro/Conversa | Homologação humana |

Execução automatizada em CI: **fora** do roadmap EIC nesta fase ([`03_ROADMAP.md`](03_ROADMAP.md) §7).

---

## 3. Cenários de Conversação (catálogo)

Cenários abaixo **reutilizam exemplos já normativos** (ARQ-018 §3; PX-003 E4). Não são casos de produto novos.

| ID | Tipo | Entrada (síntese) | Esperado | CA / NA |
|----|------|-------------------|----------|---------|
| **SC-01** | T-CL | Pergunta genérica («o que é um ADR?») sem acção MG2 | C1; sem Job | CA-01, CA-02 |
| **SC-02** | T-CL | «onde estamos no outdoor?» com frente activa | C2; sem Job automático | CA-02 |
| **SC-03** | T-CL | «implementa o outdoor lateral» | C3 → Motor (política); não Job directo do Classificador | CA-01, CA-02; NA-01 |
| **SC-04** | T-CL | «lista os jobs» / status do sistema | C4 | CA-02 |
| **SC-05** | T-CL | Mensagem ambígua | Não inventar C3; classe restritiva ou clarificação mínima | CA-03; NA-02 |
| **SC-06** | T-PR | Canal voz ou «em uma frase» | Ritmo **curto** | CA-04, CA-05 |
| **SC-07** | T-PR | Deliberação estável, confiança alta | Ritmo **médio**; um gesto | CA-04, CA-06 |
| **SC-08** | T-PR | Utilizador pediu porquê / trade-offs | Ritmo profundo ou médio encurtado em voz | CA-04 |
| **SC-09** | T-PR | Após decisão já enunciada, utilizador «ok» | Mínimo / silêncio útil; sem novo plano | CA-07; NA-07 |
| **SC-10** | T-PR | UI do Painel já mostra estado | Chat não ecoa o painel em prosa longa | CA-09; NA-09 |
| **SC-11** | T-CO | Retoma com gesto pendente autorizado | Callback + gesto; não re-delibera | CA-08; NA-08 |
| **SC-12** | T-ID | Prosa de saída | Sem «Como posso ajudar?», bajulação, emoji | CA-10; NA-03 |
| **SC-13** | T-FX | Camada de prosa | Não altera parecer / não decide | CA-11; NA-10 |

Novos cenários só por emenda a este catálogo **citando** norma de origem.

---

## 4. Critérios de Validação

Para cada execução:

1. Identificar cenário SC-* e tipo T-*.  
2. Mapear CA-EIC-* / NA-EIC-* aplicáveis ([`04`](04_CRITÉRIOS_DE_QUALIDADE.md)).  
3. Resultado: **PASS** | **FAIL** | **BLOQUEADO** (ambiente / sem Gate).  
4. FAIL com NA **crítica** ⇒ reprovação automática na homologação.  
5. Não “compensar” FAIL crítico com PASS estéticos.

---

## 5. Registo de Resultados

Formato mínimo por execução:

| Campo | Conteúdo |
|-------|----------|
| ID execução | `EXE-YYYYMMDD-NN` |
| Cenário | SC-* |
| Data / quem | — |
| Ambiente | Doc review / Centro local / produção (só observação) |
| Resultado | PASS / FAIL / BLOQUEADO |
| CA/NA tocados | lista |
| Evidência | citação / print / log (sem dados sensíveis) |
| Melhoria | ID em §6 se houver |

---

## 6. Melhorias Identificadas

| ID | Origem | Descrição | Destino |
|----|--------|-----------|---------|
| — | — | *Sem itens neste ciclo documental* | — |

Melhorias que exijam código → só via [`07`](07_METODOLOGIA_DE_EVOLUÇÃO.md) + G-EIC-D + ADR-006.

---

## 7. Histórico de Execução

| EXE | Data | Cenário | Resultado | Observação |
|-----|------|---------|-----------|------------|
| — | — | — | — | Nenhuma execução de produto neste ciclo (só consolidação documental) |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`04_CRITÉRIOS_DE_QUALIDADE.md`](04_CRITÉRIOS_DE_QUALIDADE.md) | CA/NA |
| [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Aceite |
| [`03_ROADMAP.md`](03_ROADMAP.md) | M5 / M9 |
| [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md) | Peças sob teste |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 3 — quadro de testes | Pronto para homologação |

---

**Estado:** BLOCO 3 — testes consolidados (catálogo documental). Sem execução de produto. Sem impacto no runtime.

# IMP-057 Emenda E2.2 — Abertura (Cobertura de Classificação)

> **Data:** 01/08/2026  
> **Emenda:** E2.2 — Cobertura de Classificação  
> **Status:** Superada pela implementação — ver `IMP-057-E22-relatorio.md`  
> **Norma:** IMP-057 § Emenda E2.2; REQ-057; ARQ-018 (não alteradas)  
> **Código:** implementado em fase seguinte (v1.4)

---

## 1. Objectivo

Eliminar clarificações indevidas quando a intenção puder ser classificada com segurança:

* **C1** — conhecimento geral / definições / explicações (domínios listados).  
* **C2** — perguntas deliberativas de projecto (padrões «Como devemos…», etc.) com contexto de projecto.

## 2. Artefacto

Texto normativo da emenda em:

`docs/implementation/IMP-057-classificacao-de-intencao.md` → secção **Emenda E2.2**.

## 3. Cobertura documentada

### C1 (obrigatório)

Domínios: Receita, Culinária, História, Ciência, Matemática, Programação, Tecnologia, Pessoas, Lugares, Definições, Explicações.

Exemplos obrigatórios (nunca Clarificação):

1. Me dê uma receita de bolo.  
2. Quem foi Albert Einstein?  
3. O que é Docker?  
4. Explique REST.

### C2 (obrigatório com contexto de projecto)

Padrões: Como devemos… · Você concorda… · O que você acha… · Quais capacidades… · Qual prioridade… · Como organizar… · O que falta…

Critério: estes exemplos/padrões **nunca** devem cair em Clarificação.

## 4. Fora de escopo (confirmado)

* Sem alteração de código / lexicon / regras  
* Sem commit  
* Sem reabrir Motor / Continuidade / Consciência Operacional  
* Sem alteração a ARQ-018 / REQ-057

## 5. Pedido de Gate

Homologar o **texto da Emenda E2.2** para autorizar (numa fase seguinte) a implementação e a suite de testes CA-E2.2-1…4?

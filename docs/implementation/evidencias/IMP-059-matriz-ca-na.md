# IMP-059 — Matriz CA / NA (REQ-059)

**Data:** 01/08/2026  
**Normas:** REQ-059 · ARQ-020 (**não alteradas** no conteúdo normativo por esta IMP)  
**Implementação:** IMP-059 E1–E7

Legenda: teste automatizado (`npm run test:consciencia-operacional`) e/ou artefacto documental.

---

## Critérios de Aceite (CA1–CA10)

| ID | Critério (resumo) | Evidência | Status |
|----|-------------------|-----------|--------|
| CA1 | Job em execução influencia a resposta | E5 Demo 1; E4-CA1; `e5.test.js` | **OK** |
| CA2 | Gate pendente tem prioridade | E5 Demo 2; E4-CA2; prioridade P1 | **OK** |
| CA3 | Sem contexto → resposta normal | E5 Demo 3; E3 cenário 1; E4-CA3 | **OK** |
| CA4 | Nenhum Job novo na consulta | E6-CA1; E3-CA4; agregador RO | **OK** |
| CA5 | Consciência somente leitura | E6-CA1/CA3/CA5; leitoresPadrao | **OK** |
| CA6 | Consulta antes da resposta C2/C3 | E3-CA1; `executiveEngine` | **OK** |
| CA7 | Oito fontes F1–F8 no modelo | E1-CA1; `dominio.js` | **OK** |
| CA8 | Léxico Gate ≠ deliberação Consciência | E6-CA2; Continuidade precede | **OK** |
| CA9 | Sem `@cursor/sdk` / publish Fila | E6-CA3; scan módulos | **OK** |
| CA10 | Docs ARQ-020, REQ-059, Classificador, Continuidade, Motor, Fila/Dispatcher | E7-CA1; `README.md` | **OK** |

---

## Critérios negativos (NA1–NA4)

| ID | Critério | Evidência | Status |
|----|----------|-----------|--------|
| NA1 | Consciência ≠ Motor/Fila/Dispatcher | E6-CA5; isolamento imports | **OK** |
| NA2 | Não decide Gates automaticamente | E6-CA5; sem `consumirDecisao` | **OK** |
| NA3 | Não obrigatória em C1/C4 | E3-CA2; E6-CA5 | **OK** |
| NA4 | Falha de fonte não inventa estado | E2-CA2; E6-CA5 | **OK** |

---

## Critérios por etapa (IMP)

| Etapa | CAs internos | Suite |
|-------|--------------|-------|
| E1 | E1-CA1…CA4 | `dominio.test.js` |
| E2 | E2-CA1…CA4 | `agregarEstado.test.js` |
| E3 | E3-CA1…CA4 | `consultarAntesDeResponder.test.js` |
| E4 | E4-CA1…CA5 | `e4.test.js` |
| E5 | E5-CA1…CA5 + demos | `e5.test.js` |
| E6 | E6-CA1…CA5 | `fronteiras.test.js` |
| E7 | E7-CA1…CA4 | `e7.test.js` + docs |

---

## Comando de verificação

```bash
cd app && npm run test:consciencia-operacional
```

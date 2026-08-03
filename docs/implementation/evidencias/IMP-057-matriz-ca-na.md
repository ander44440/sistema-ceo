# IMP-057 — Matriz CA / NA (REQ-057)

**Data:** 01/08/2026  
**Normas:** REQ-057 · ARQ-018 (não alteradas nesta IMP)  
**Implementação:** IMP-057 E1–E7

Legenda de evidência: teste automatizado (`npm run test:classificador`) e/ou artefacto documental.

---

## Critérios de Aceite (CA1–CA11)

| ID | Critério (resumo) | Evidência | Status |
|----|-------------------|-----------|--------|
| CA1 | Nenhum efeito Fila/Motor sem classificação prévia | `integracaoNucleo.test.js` E4-CA1; `dados.classificacao` em `executar` | OK |
| CA2 | Quatro classes V1 produzíveis e exclusivas | `dominio.test.js` E1-CA1; `fronteiras.test.js` enum smoke | OK |
| CA3 | C1 sem Job; sem COA obrigatório | E2-CA1; E4-CA2; E5/E6 demo C1 | OK |
| CA4 | C2 com frente; zero Jobs automáticos | E5-CA1; E6-CA1 C2 | OK |
| CA5 | C3 → Motor; Job só se política permitir | E4-CA5/CA7; E5-CA2 (Gate G2 / Job) | OK |
| CA6 | C4 operacional ≠ C3 implementação | E2-CA2; E5-CA3; E6-CA3 | OK |
| CA7 | Empate C2/C3 sem verbo → C2 | `regras.test.js` E2-CA3 | OK |
| CA8 | Baixa confiança: clarificação; sem C3+Job | E2-CA4; E3-CA3; E6-CA1 ambiguidade | OK |
| CA9 | Sem `@cursor/sdk` / sem publish directo no Classificador | E1-CA4; E4-CA4; E6-CA1 módulos puros | OK |
| CA10 | Docs mínimas: ARQ-018, REQ-057, Motor ARQ-017 | `classificadorIntencao/README.md`; E7-CA2 | OK |
| CA11 | Um só ponto de classificação Conversa→Núcleo | Adapter canónico; E4-CA3; E6 entrypoint / E6-CA2 | OK |

---

## Critérios negativos (NA1–NA3)

| ID | Critério | Evidência | Status |
|----|----------|-----------|--------|
| NA1 | Classificador não substitui a Conversa | Conversa UI em `modules/conversa`; Classificador é módulo de domínio/Núcleo | OK |
| NA2 | Ambiguidade não derruba Conversa | Destino `clarificacao`; E4-CA8; E6 ambiguidade | OK |
| NA3 | Sem segunda API key / ChatGPT só para C1/C4 | Regras/lexicon puros (RES8); E2-CA5; E6-CA1 sem fetch | OK |

---

## Critérios por etapa (IMP)

| Etapa | CAs internos | Suite |
|-------|--------------|-------|
| E1 | E1-CA1…CA4 | `dominio.test.js` |
| E2 | E2-CA1…CA5 | `regras.test.js` |
| E3 | E3-CA1…CA3 | `encaminhador.test.js` |
| E4 | E4-CA1…CA8 | `integracaoNucleo.test.js` |
| E5 | E5-CA1…CA5 | `destinos.test.js` |
| E6 | E6-CA1…CA4 | `fronteiras.test.js` |
| E7 | E7-CA1…CA3 | `e7.test.js` + docs |

---

## Comando de verificação

```bash
cd app && npm run test:classificador
```

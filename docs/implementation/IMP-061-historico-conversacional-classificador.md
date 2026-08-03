# IMP-061 — Histórico Conversacional no Classificador

> **Status:** **Homologada** (03/08/2026) — Gate do patrocinador (cadeia EIC CSC).  
> Norma: **REQ-061** (Em análise → implementação autorizada pelo patrocinador); **ARQ-022** v0.1; **ARQ-018** §5.1 (norma-mãe, não alterada).  
> Baseline: **IMP-057** / REQ-057.  
> Capacidade: **CAP-07** — Comunicação (EIC — 1ª melhoria perceptível CSC no limiar).  
> Base analítica: **ANL-006**.

---

## 1. Objetivo

Realizar o sinal opcional de **histórico conversacional recente** no Classificador de Intenção (ARQ-018 §5.1 / REQ-061 / ARQ-022): janela V1 (4 / 200 / 800), só desambiguação **C1↔C2**, sem alterar limiar 0,55, C1–C4, Gate, Motor, NCS nem Jobs.

## 2. Escopo realizado

| Item | Estado |
|------|--------|
| `historicoRecente.js` (C-PREP) | Feito |
| Extensão `ContextoClassificacao` | Feito |
| `aplicarDesambiguacaoHistorico` (S3) | Feito |
| Integração Núcleo pós-Gate | Feito |
| Ponto único de classificação | Preservado (EIC V1) |
| CT-01…12 | Feito (`historicoRecente.test.js`) |
| Gate / Motor / NCS / Jobs | Intocados |

## 3. Ficheiros

| Path | Papel |
|------|--------|
| `app/src/classificadorIntencao/historicoRecente.js` | Janela 4/200/800; deixis; refs projecto |
| `app/src/classificadorIntencao/historicoRecente.test.js` | CT-01…12 |
| `app/src/classificadorIntencao/regras.js` | S3 + typedef contexto |
| `app/src/classificadorIntencao/index.js` | Exports |
| `app/src/classificadorIntencao/integracaoNucleo.js` | Typedef contexto |
| `app/src/executiveEngine/index.js` | Monta contexto + `seleccionarHistoricoRecente` |
| `app/package.json` | `test:classificador` + `test:classificador:e61` |

## 4. Invariantes (verificados)

- Histórico **opcional**; ausência ⇒ path IMP-057 (CT-01).  
- Limiar **0,55** (CT-06).  
- Histórico **nunca** → C3 (CT-04, CT-05).  
- Gate **antes** do Classificador (CT-09).  
- Um `primeiroPassoClassificar` + adapter com `saidaPrevia` (CT-11).

## 5. Validação

| Suite | Resultado |
|-------|-----------|
| `npm run test:classificador` (IMP-057 + IMP-061 / SC-01…05) | **92/92 PASS** |
| `npm run test:classificador:e61` (CT-01…12) | **13/13 PASS** |
| `npm run test:continuidade-gate` | **51/51 PASS** |
| `npm run test:consciencia-operacional` | **46/46 PASS** |
| `npm run test:motor` | **38/38 PASS** |
| `npm run test:cn` | **15/15 PASS** |
| `npm run test:mre:ncs` | **37/37 PASS** |

**Regressão:** 100% verde nos eixos obrigatórios do comando.

## 6. Rollback

Omitir `historicoRecente` no Núcleo (ou array vazio) ⇒ comportamento IMP-057 imediato (ARQ-022 L1).

## 7. Próximo passo

Homologação patrocinador/CTO (CA REQ-061) → deploy se autorizado → evidência de produção.

---

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Implementação E1–E4 + testes CT |

# IMP-067 — Dossier Institucional Curado (DIC)

> **Status:** Implementada — 03/08/2026 (pronta para homologação).  
> Norma: **REQ-067**; **ARQ-028**. Capacidade: CAP-07.  
> Base: ANL-011; CON-001; VIS; ADR; EIC; `constituicaoCeo.js`; `governancaLlm.js`.

## Escopo cumprido

| Item | Estado |
|------|--------|
| DIC-001 documental (`docs/institution/DIC-001.md`) | Feito |
| Runtime `dicInstitucional.js` (`obterDicVigente`, `deveInjectarDic`) | Feito |
| Injecção só no path meta/institucional | Feito |
| Ordem mandato → governação → DIC → contexto | Feito |
| Sem briefing COA no path meta | Feito |
| Flag `DIC_INJECAO_ATIVA` (rollback L1) | Feito |
| Resumo identidade alinhado a S1/S3 | Feito |
| Política de exposição (mapa divulgável; sem APIs/NCS/prompts) | Feito |
| CT-DIC01…08 | Feito |

## Fora de escopo (preservado)

* C1–C4 / limiar 0,55 / Classificador / EIC / Gate / Motor / NCS / Jobs  
* Retrieval / RAG  
* Prompts de deliberação operacional / MRE 0–7  

## Fluxo

```text
Path meta (E2.3 | meta-modo | VCA metaconversa) + DIC_INJECAO_ATIVA
  → montarMensagensLlm
      system: constituicaoCeo
      system: governancaLlm
      system: DIC-001          ★
      system: contexto
      (briefing COA omitido)
  → LLM

Demais paths: composição pré-IMP-067 (sem DIC; briefing se COA)
```

## Rollback

`definirDicInjacaoAtiva(false)` → omite DIC; path meta volta a mandato+governação+contexto (+ briefing se aplicável pela regra antiga — na prática com flag off, `deveInjectarDic` é false, logo briefing **volta** a poder ser injectado).

## Validação

```text
npm run test:dic
npm run test:classificador
npm run test:complexidade
npm run test:continuidade-gate
npm run test:consciencia-operacional
npm run test:motor
npm run test:mre:ncs
```

## Artefactos

| Path | Papel |
|------|-------|
| `docs/institution/DIC-001.md` | Curadoria canónica de consumo |
| `app/src/executiveEngine/dicInstitucional.js` | Runtime |
| `app/src/executiveEngine/promptGovernanca.js` | Injecção |
| `app/src/executiveEngine/constituicaoCeo.js` | Resumo via DIC |
| `app/src/executiveEngine/capacidades/ia.js` | Metadado `dicInjecao` |
| `app/src/executiveEngine/index.js` | `validacaoContexto` no ctx da capacidade |

## Próximo

Homologação do patrocinador / CTO (Gate).

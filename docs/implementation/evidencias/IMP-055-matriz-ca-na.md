# IMP-055 — Matriz CA / NA (REQ-055) e evidências

> **Status:** pacote de evidências para homologação E7 / fecho de implementação.  
> **Data:** 01/08/2026  
> **Norma:** REQ-055 (não alterada). ARQ-016 / IMP-055 não editados neste pacote.

## Matriz — Critérios de Aceitação (REQ-055)

| ID | Critério | Evidência | Etapa |
|----|----------|-----------|-------|
| CA1 | Seis nós V1 com Nome + Estado + descrição resumida | `ui.test.js` E3-CA1; `htmlGrelhaNos` + Centro | E3 |
| CA2 | Nenhum campo técnico na vista principal | `checklistProgressividadeHtml`; E3-CA2 / E4-CA2 | E3–E4 |
| CA3 | Clique/expansão revela detalhe; recolher restaura | `e4.test.js` E4-CA1 | E4 |
| CA4 | Snapshot HTTP com 6 nós e enum válido | `agregador.test.js`; server `orquestracao.test.js` | E2 |
| CA5 | SSE ou polling actualiza sem reload | `e5.test.js` E5-CA1 / E5-CA2 | E5 |
| CA6 | Conversa dominante; painel secundário | Layout Centro (`.cs-chat` > `.cs-orq`); E3-CA3 | E3 |
| CA7 | Painel não invoca Fila / CTO / MRE | Cliente só GET snapshot/stream; E3-CA4; coletores só leitura E6-CA2 | E3–E6 |
| CA8 | Documentação mínima (estados, nós, Progressividade) | `app/src/orquestracao/README.md` | E7 |

## Matriz — Critérios Negativos (REQ-055)

| ID | Critério | Evidência | Etapa |
|----|----------|-----------|-------|
| NA1 | Painel não é a home conversacional | Painel abaixo de `.cs-chat`; sem rota própria como home | E3 |
| NA2 | Erro de SSE não derruba o chat | `e5.test.js` E5-CA2; fallback polling; hint degradado | E5 |
| NA3 | Sem segunda API key / browser ChatGPT | Reutiliza config LLM existente (Opção B CTO); heartbeat sem key nova | E5–E6 |

## Checklist Progressividade (fecho)

- [x] Vista principal: apenas Nome · Estado · descrição resumida  
- [x] `detalhe` / `origemSinal` / `atualizadoEm` fora da vista principal  
- [x] Expansão opcional (E4); colapso restaura trio  
- [x] Sem secrets no HTML público (`sanitizar*`)  
- [x] Conversa SRF-T03 intacta como região dominante  

## Hierarquia Conversa > Painel

- Integração: `centroSituacao.js` injeta `htmlPainelOrquestracao()` **após** a secção `.cs-chat`.  
- CSS: `.cs-chat` com glow/borda de destaque; `.cs-orq` compacto e secundário.  
- Falha de snapshot/SSE actualiza só `#cs-orq-grid` / hint — não desmonta o composer.

## Extensibilidade (E7-CA1)

- API: `criarRegistoOrquestracao` / `registrar` / `registrarNosV1`.  
- Prova: `e7.test.js` — nó dummy registado; `htmlGrelhaNos` mostra N+1 cartões **sem** alterar `ui.js`.

## Suíte automatizada

```bash
cd app && npm run test:orquestracao
cd server && npm run test:orquestracao:e5
```

Cobertura por etapa: E1 domínio · E2 agregador · E3 UI · E4 detalhe · E5 SSE · E6 coletores/heartbeat · E7 registo.

## Critérios de commit (referência — não executados nesta E7)

Conforme IMP-055 §11: commit só após Gate técnico de código + autorização explícita do patrocinador. Esta E7 **não** realiza commit.

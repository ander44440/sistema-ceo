# Relatório consolidado — Bloco 2 (MRE)

> **Data:** 30/07/2026  
> **Escopo:** IMP-014 + IMP-015 + IMP-016 (IMP-010 F4–F6)  
> **Estado:** Implementação concluída — aguarda validação conjunta  
> **Normas:** ADR-019; ARQ-013; REQ-048…051; REQ-047 (consumo); IMP-010  
> **Proibições cumpridas:** Bloco 3 não iniciado; Fila (F7) e persistência F8 não implementadas

---

## 1. Resumo por IMP

### IMP-014 — Integração Núcleo → MRE

* Roteamento deliberativo vs determinístico (`ehRotaDeliberativa`, `flagMre`).
* Fachada `executarRotaDeliberativa` / `montarEntradaMre`.
* Adapter LLM CEO (`criarChamarLlmCeo`).
* Capacidade `ia`: locais (data/hora/saudação/identidade) **sem** MRE; deliberativas **com** MRE+Speaker.

### IMP-015 — Speaker Executivo

* `gerarComunicadoExecutivo(parecer, canal)` — template DET fiel (G1–G7).
* Recusa parecer inválido (validador IMP-011).
* `referenciaDecisao` = estado; `solicitar_dados` ⇒ perguntas.

### IMP-016 — Canais Chat / Voice / Centro

* `gerarComunicadosPorCanal` — mesma decisão, formas distintas.
* Conversa: TTS usa `textoVoz` do comunicado.
* Centro de situação: bloco “Última deliberação” via destaques em sessionStorage.

---

## 2. Arquivos criados ou alterados

### Criados

| Ficheiro |
|----------|
| `docs/implementation/IMP-014-integracao-nucleo-mre.md` |
| `docs/implementation/IMP-015-speaker-executivo.md` |
| `docs/implementation/IMP-016-canais-chat-voice-centro.md` |
| `app/src/mre/roteamentoDeliberativo.js` |
| `app/src/mre/adaptadorLlmCeo.js` |
| `app/src/mre/integracaoNucleo.js` |
| `app/src/mre/speaker/speakerExecutivo.js` |
| `app/src/mre/canais/adaptarCanal.js` |
| `app/src/mre/canais/centroSituacaoDeliberacao.js` |
| `app/src/mre/bloco2.test.js` |
| `docs/implementation/evidencias/BLOCO-2-relatorio-consolidado.md` |

### Alterados

| Ficheiro | Alteração |
|----------|-----------|
| `app/src/executiveEngine/capacidades/ia.js` | Rota MRE deliberativa |
| `app/src/modules/conversa/conversa.js` | Voice via `textoVoz` |
| `app/src/modules/centroSituacao/centroSituacao.js` | Bloco última deliberação |
| `app/src/mre/index.js` | Exports Bloco 2 |
| `app/package.json` | `test:mre:bloco2`, `test:mre` |
| `docs/README.md` | Catálogo Bloco 2 |

---

## 3. Testes executados e resultado

```text
npm run test:mre:bloco2
→ 12 pass / 0 fail (T14×5 + T15×4 + T16×3)

npm run test:mre
→ Bloco 1 + Bloco 2 (45 testes esperados)
```

| Pacote | Resultado |
|--------|-----------|
| IMP-014 | T14-01…05 pass |
| IMP-015 | T15-01…04 pass |
| IMP-016 | T16-01…03 pass |

---

## 4. Pendências

1. Validação conjunta do Bloco 2 pelo Gate.  
2. Latência real multi-LLM no caminho deliberativo (medir em uso).  
3. F7 — despacho Fila a partir de `acao.job` (Bloco 3).  
4. F8 — persistência memória/precedente/Gate princípios (Bloco 3).  
5. Speaker ainda DET (sem LLM de redação) — suficiente para fidelidade; opcional evoluir.

---

## 5. Riscos

| Risco | Mitigação |
|-------|-----------|
| Custo/latência de N chamadas LLM no MRE | Flag `flagMre`; rollback para legado |
| Painel/COA ausente em Node nos testes | Mock/entrada injetada na fachada |
| Centro só mostra deliberação se sessionStorage | Aceitável no browser; sem efeito em SSR |
| Regressão fluxos determinísticos | Testes T14-01; caminhos locais preservados |

---

## 6. Pedido ao Gate

Validar o Bloco 2 na íntegra. **Não iniciar Bloco 3** até aprovação.

# IMP-057 — Relatório consolidado (E6 + E7 + fecho)

**Data:** 01/08/2026  
**Escopo:** Classificação de Intenção — etapas E1–E7  
**Normas:** ARQ-018 · REQ-057 · ARQ-017/REQ-056 (Motor, destino C3)  
**Restrições cumpridas:** ARQ-018 e REQ-057 **não** alterados; sem novas frentes; **sem commit**.

---

## 1. Veredicto

A implementação da **IMP-057** está **completa** para homologação técnica:

- Classificador canónico V1 (C1–C4) com limiar **0,55**.
- Encaminhamento determinístico e despacho estrito no Núcleo.
- C3 → Motor exclusivo (anti-«Sugiro»).
- Fronteiras e isolamento verificados (E6).
- Documentação e matriz CA/NA fechadas (E7).

**Pedido de Gate:** ~~homologar IMP-057~~ → **Homologada** (01/08/2026). Commit/push/deploy no encerramento.

---

## 2. E6 — Fronteiras e regressão

| ID | Resultado |
|----|-----------|
| E6-CA1 | Suite negativa (Job/SDK/bypass/ambiguidade) a verde |
| E6-CA2 | Stub → adapter `classificador_canonico` |
| E6-CA3 | Regressão C4 memória + fila a verde |
| E6-CA4 | `razaoCurta` sem segredos (amostra + validador) |

Isolamento confirmado:

- Módulos puros sem Motor / Fila / SDK / Dispatcher.
- Conversa e Centro de Situação → `executiveEngine.executar` (não saltam Classificador).
- Um entrypoint canónico (`regras.classificar` + adapter + `executarPorDestino`).

---

## 3. E7 — Documentação e matriz

| ID | Resultado |
|----|-----------|
| E7-CA1 | CA1–CA11 e NA1–NA3 mapeados em `IMP-057-matriz-ca-na.md` |
| E7-CA2 | `app/src/classificadorIntencao/README.md` referencia ARQ-018, REQ-057, ARQ-017/REQ-056 |
| E7-CA3 | Lista de ficheiros abaixo |

Artefactos:

- `app/src/classificadorIntencao/README.md`
- `docs/implementation/evidencias/IMP-057-matriz-ca-na.md`
- `docs/implementation/evidencias/IMP-057-E4-relatorio.md`
- `docs/implementation/evidencias/IMP-057-E5-relatorio.md`
- Este relatório

---

## 4. Demo C1–C4 (fecho)

| | Entrada | Classe | Destino | Observação |
|--|---------|--------|---------|------------|
| C1 | Bom dia | `conhecimento_geral` | `resposta_leve` | Resposta imediata |
| C2 | Como priorizar o pagamento no MG2? | `conversa_projeto` | `nucleo_mre` | Zero Job |
| C3 | Quero que você resolva os bugs do projeto. | `trabalho_executivo` | `motor_execucao` | Motor + Gate G2; sem «Sugiro» |
| C4 | listar jobs | `comando_operacional` | `capacidade_operacional` | Capacidade `fila` |

---

## 5. Suite de testes

```text
cd app && npm run test:classificador
```

Esperado: **48/48** testes a verde (`npm run test:classificador`, 01/08/2026).

Scripts: `test:classificador:e1` … `e7`, `test:classificador:e6`, `test:classificador`.

---

## 6. Ficheiros tocados (lista para commit futuro)

### Código — Classificador

- `app/src/classificadorIntencao/dominio.js`
- `app/src/classificadorIntencao/dominio.test.js`
- `app/src/classificadorIntencao/lexicon.js`
- `app/src/classificadorIntencao/regras.js`
- `app/src/classificadorIntencao/regras.test.js`
- `app/src/classificadorIntencao/encaminhador.js`
- `app/src/classificadorIntencao/encaminhador.test.js`
- `app/src/classificadorIntencao/integracaoNucleo.js`
- `app/src/classificadorIntencao/integracaoNucleo.test.js`
- `app/src/classificadorIntencao/destinos.js`
- `app/src/classificadorIntencao/destinos.test.js`
- `app/src/classificadorIntencao/fronteiras.test.js`
- `app/src/classificadorIntencao/e7.test.js`
- `app/src/classificadorIntencao/index.js`
- `app/src/classificadorIntencao/README.md`

### Código — Núcleo / superfícies

- `app/src/executiveEngine/classificar.js` (adapter)
- `app/src/executiveEngine/index.js` (hook Classificador → destinos)
- `app/src/modules/conversa/conversa.js` (`publicarJob` em C3)

### Build / plano / evidências

- `app/package.json` (scripts `test:classificador*`)
- `docs/implementation/IMP-057-classificacao-de-intencao.md`
- `docs/implementation/evidencias/IMP-057-matriz-ca-na.md`
- `docs/implementation/evidencias/IMP-057-E4-relatorio.md`
- `docs/implementation/evidencias/IMP-057-E5-relatorio.md`
- `docs/implementation/evidencias/IMP-057-relatorio-consolidado.md`

**Fora de escopo / não incluir no commit desta IMP:** artefactos BP/PX laterais, alterações a ARQ-018/REQ-057 (nenhuma).

---

## 7. Critérios para commit (ainda não executado)

Conforme IMP-057 §11: Gate do plano + REQ-057 + Gate técnico de código + autorização explícita do patrocinador. **Este relatório não autoriza commit.**

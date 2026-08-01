# IMP-057 E4 — Relatório para homologação

**Data:** 01/08/2026  
**Etapa:** E4 — Integração Núcleo (Classificador primeiro + C3→Motor)  
**Norma:** IMP-057 v0.2 / v0.3 · REQ-057 · ARQ-018 (não alteradas)  
**Commit:** *não realizado* (pedido explícito)

---

## 1. Objectivo cumprido

- Classificador canónico é o **primeiro passo** de `executiveEngine.executar`.
- **C3** (`trabalho_executivo`) transfere **obrigatoriamente** o controlo ao Motor (`conduzirMotorExecucao`).
- O Núcleo **não** finaliza C3 só com Parecer Executivo / prosa «Sugiro…».
- A resposta reflecte **início de execução**: Job `pending`, handoff Dispatcher, ou **Gate do Motor**.

---

## 2. Entregáveis

| Item | Local |
|------|--------|
| Integração C3→Motor + anti-Sugiro | `app/src/classificadorIntencao/integracaoNucleo.js` |
| API pública | `app/src/classificadorIntencao/index.js` |
| Adapter stub → canónico | `app/src/executiveEngine/classificar.js` |
| Hook Núcleo | `app/src/executiveEngine/index.js` (`executar`) |
| Lexicon C3 (resolva bugs) + C4 operacional | `app/src/classificadorIntencao/lexicon.js` |
| Conversa passa `publicarJob` | `app/src/modules/conversa/conversa.js` |
| Testes E4 | `app/src/classificadorIntencao/integracaoNucleo.test.js` |
| Script | `npm run test:classificador:e4` |

---

## 3. Critérios de aceite

| ID | Resultado |
|----|-----------|
| E4-CA1 | OK — classificação em `dados` antes do efeito (C4) |
| E4-CA2 | OK — C1 sem MRE (`mreInvocado: false`) |
| E4-CA3 | OK — origem `classificador_canonico` |
| E4-CA4 | OK — sem `@cursor/sdk` |
| E4-CA5 | OK — Implementa…+despacha → Motor + Job; sem Sugiro |
| E4-CA6 | OK — `parecerPonte.respostaFinal === false` |
| E4-CA7 | OK — Gate G2 na resposta via Motor |
| E4-CA8 | OK — clarificação sem Motor; C2 → `nucleo_mre` |

---

## 4. Suite de testes

```text
npm run test:classificador
→ 25 pass / 0 fail
```

Inclui E1–E4.

---

## 5. Demonstração obrigatória

**Usuário:** `Quero que você resolva os bugs do projeto.`

| Passo | Resultado observado |
|-------|---------------------|
| Classificação | `trabalho_executivo` (C3) → `motor_execucao` |
| Motor | `aguardandoGate: true`, motivo `aguardando_gate`, gatilho **G2** |
| Job | Ainda não criado (aguarda Gate) — conforme política V1 |
| Resposta | `Iniciei o Motor de Execução para «…». Aguardando aprovação (Gate do Motor; G2) antes de criar o Job na fila.` |
| Anti-Sugiro | Sem «Sugiro…» na resposta final |

---

## 6. Pedido de Gate

Homologar a **E4** da IMP-057. E5 (ligação real C2/C4 refinada) permanece por autorizar.

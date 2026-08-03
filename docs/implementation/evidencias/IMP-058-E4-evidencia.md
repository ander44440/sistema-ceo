# IMP-058 E4 — Evidência (Integração Conversa → Motor)

> **Data:** 01/08/2026  
> **Etapa:** E4 — Integração Conversa → Motor  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-019 §3; REQ-058 RF1–RF4 / RF12; IMP-058 §6 E4  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

No `executiveEngine.executar`: verificar Gate pendente **antes** do Classificador; se a mensagem for decisão E2, recuperar contexto E3 e continuar o Motor (`conduzirAposDecisaoGate`); caso contrário, fluxo IMP-057 normal. Utilizador **não** repete o C3.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Integração | `app/src/continuidadeGate/integracaoConversa.js` |
| Núcleo | `app/src/executiveEngine/index.js` (interceptação + wrap Motor) |
| Testes | `app/src/continuidadeGate/integracaoConversa.test.js` |
| Script | `npm run test:continuidade-gate:e4` |

### Fluxo

```text
mensagem
  → Gate pendente?
       ├─ sim + léxico E2 → Continuidade → Motor (decisão) → Job se aprovado
       ├─ sim + fora do léxico → clarificação RF12 (sem Classificador)
       └─ não → Classificador IMP-057 → … → se aguardando_gate → abrirGate (E3)
```

### Restrições respeitadas

* ARQ-019 / REQ-058 **não** alterados  
* Classificador **produção** (`classificadorIntencao/*.js` excepto `*.test.js`) **não** alterado  
* Motor produção **não** alterado — só chamada a `conduzirAposDecisaoGate`  
* Isolamento de testes: `resetStoreContinuidadePadrao()` em `beforeEach` / demos C1–C4 dos testes IMP-057 (evitar Gate residual entre cenários)  
* Sem commit

## 3. Critérios de aceite E4

| ID | Critério | Resultado |
|----|----------|-----------|
| E4-CA1 | Gate + «Aprovado.» sem «Sugiro…» | **OK** |
| E4-CA2 | Sem Gate → Classificador inalterado | **OK** |
| E4-CA3 | Pedido novo com Gate → clarificação | **OK** |
| E4-CA4 | Sem `@cursor/sdk` | **OK** |
| E4-CA5 | Abertura de contexto em `aguardando_gate` | **OK** |

## 4. Demonstração (teste automatizado)

```text
Usuário: "Resolva os bugs."
CEO: "Aguardando aprovação (Gate G2)."

Usuário: "Aprovado."
CEO: "Gate aprovado. Job JOB-TEST-000001 criado em pending. Handoff ao Dispatcher iniciado. …"
→ Job pending · handoff dispatcher_req053 · sem repetir a tarefa
```

## 5. Testes

```text
npm run test:continuidade-gate:e4  → 7/7 pass
npm run test:continuidade-gate     → (E1–E4)
```

## 6. Pedido de Gate E4

Homologar a **E4** para autorizar a **E5** (aprovação/rejeição/adiamento completos + P10)?

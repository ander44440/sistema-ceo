# Continuidade do Gate de Execução

**IMP-058** · **REQ-058** · **ARQ-019**  
Integração com Motor (**ARQ-017** / **REQ-056**), Fila (**REQ-045**) e Dispatcher (**REQ-053**).  
Classificador (**ARQ-018** / **REQ-057**) permanece limiar geral — Continuidade tem prioridade **só** com Gate pendente + léxico.

## O que é

Camada que permite ao CEO **retomar automaticamente** o ciclo do Motor após a decisão humana no Gate, sem o utilizador repetir a solicitação C3 original.

## Fluxo

```text
C3 → Motor → aguardando_gate → abrirGate (contexto)
mensagem seguinte:
  · léxico E2 → Continuidade → conduzirAposDecisaoGate
  · fora do léxico + Gate pendente → clarificação RF12
  · sem Gate → Classificador IMP-057
```

| Decisão | Efeito |
|---------|--------|
| `aprovado` | Job `pending` → handoff Dispatcher |
| `rejeitado` | Encerramento sem Job |
| `adiado` | Gate permanece pendente (P10); retoma depois |

## Léxico V1 (fechado)

| Decisão | Enunciados |
|---------|------------|
| aprovado | Aprovado · Pode executar · Autorizado · Pode prosseguir |
| rejeitado | Cancela · Rejeitado |
| adiado | Depois · Adiar |

## Módulos

| Ficheiro | Etapa | Papel |
|----------|-------|-------|
| `dominio.js` | E1 | Estados, decisões, `GatePendente` |
| `reconhecerDecisao.js` | E2 | Léxico determinístico |
| `contexto.js` | E3 | Store + `registroJobs` (idempotência) |
| `integracaoConversa.js` | E4–E5 | Interceptação Núcleo ↔ Motor |
| `index.js` | — | API pública |

**Entrypoint:** `executiveEngine.executar` → Continuidade (se aplicável) → Classificador → destinos.

## Fronteiras (E6)

- Continuidade **não** substitui Motor, Fila nem Dispatcher.
- **Não** decide Gate sem mensagem do utilizador.
- **Não** importa `@cursor/sdk` / não executa oficina.
- CTO / Painel **não** decidem Gate.
- Domínio/léxico/contexto: sem I/O de Fila/Motor/UI.

## Checklist operacional

1. `npm run test:continuidade-gate` a verde.  
2. Smoke: «Resolva os bugs.» → `Aguardando aprovação (Gate G2).`  
3. «Aprovado.» → Job pending + Dispatcher.  
4. «Rejeitado.» / «Cancela.» → zero Jobs.  
5. «Adiar.» → pendente → «Pode executar.» → Job (sem repetir C3).  
6. Sem Gate + «Aprovado.» → sem Job inventado.

## Testes

```bash
npm run test:continuidade-gate      # E1–E7
npm run test:continuidade-gate:e6   # fronteiras
npm run test:continuidade-gate:e7   # docs
```

## Referências

- `docs/architecture/ARQ-019-continuidade-do-gate-de-execucao.md`
- `docs/requirements/REQ-058-continuidade-do-gate-de-execucao.md`
- `docs/implementation/IMP-058-continuidade-do-gate-de-execucao.md`
- `docs/architecture/ARQ-017-*.md` / `docs/requirements/REQ-056-*.md` (Motor)
- `docs/requirements/REQ-045-*.md` / `REQ-053-*.md` (Fila / Dispatcher)
- `docs/implementation/evidencias/IMP-058-matriz-ca-na.md`

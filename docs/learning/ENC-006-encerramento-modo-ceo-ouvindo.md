# ENC-006 — Encerramento da Implementação do Modo CEO Ouvindo

> **Status:** Encerrado — 03/08/2026 (**ENC-006 homologada**).  
> **Natureza:** Marco de encerramento da frente (registo em `docs/learning/` — aprendizado / Memória Organizacional).  
> **Rótulo:** ENC-006 (rastreio da frente; **não** cria novo tipo documental no catálogo ADR-004 sem ADR próprio).  
> **Capacidade:** CAP-07 — Comunicação (eixo EIC / canal de voz).  
> **Cadeia oficial:** ANL-012 → REQ-068 → ARQ-029 → IMP-068 → **VAL-010** → **este ENC**.  
> **Proibição pós-ENC:** nenhuma nova implementação nesta frente; aguardar definição da próxima frente do projecto.  
> **Nota de numeração VAL:** a validação oficial desta frente é **VAL-010**. O identificador VAL-006 permanece exclusivo da CAP-05 ([`VAL-006-plano-de-validacao-cap-05-executivo-digital.md`](../validation/VAL-006-plano-de-validacao-cap-05-executivo-digital.md)).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Relatório oficial de **encerramento** da frente de implementação do modo **CEO Ouvindo** (MVP). |
| **Por que existe?** | Fechar o ciclo ADR-006 da frente após homologação da VAL; congelar o perímetro; registar limitações e evoluções futuras **fora** de escopo. |
| **Para quem existe?** | Patrocinador, CTO, Engenheiro e auditores futuros. |
| **Como medir sucesso?** | Cadeia documental completa; estado final explícito; índice actualizado; **zero** novas capacidades iniciadas após este acto. |

---

## 1. Objectivo da frente

Permitir ao utilizador conversar com o CEO por **voz** na Conversa executiva — microfone → Speech-to-Text → **mesmo** pipeline conversacional (Gate → EIC → Núcleo/Motor) → Text-to-Speech → retorno a **Ouvindo** — **sem** alterar a lógica da EIC nem Gate, VCA, Histórico, Referências, Objectivo, Classificador, Motor Executivo ou DIC.

Em síntese: voz como **camada de entrada/saída**; governação permanece textual.

---

## 2. Artefactos produzidos

| ID | Artefacto | Papel | Estado ao encerrar |
|----|-----------|-------|-------------------|
| **ANL-012** | [`ANL-012-arquitetura-modo-ceo-ouvindo.md`](../analysis/ANL-012-arquitetura-modo-ceo-ouvindo.md) | Análise / base arquitectural | Homologada |
| **REQ-068** | [`REQ-068-modo-ceo-ouvindo.md`](../requirements/REQ-068-modo-ceo-ouvindo.md) | Requisitos (CU, RF, RNF, CA) | Homologada |
| **ARQ-029** | [`ARQ-029-modo-ceo-ouvindo.md`](../architecture/ARQ-029-modo-ceo-ouvindo.md) | Arquitectura (componentes, estados, interfaces) | Homologada |
| **IMP-068** | [`IMP-068-modo-ceo-ouvindo.md`](../implementation/IMP-068-modo-ceo-ouvindo.md) | Implementação MVP | Homologada (lab) |
| **VAL-010** | [`VAL-010-homologacao-modo-ceo-ouvindo.md`](../validation/VAL-010-homologacao-modo-ceo-ouvindo.md) | Homologação funcional (15 testes) | Homologada (lab); produção residual §6 |
| **ENC-006** | Este documento | Encerramento da frente | **Encerrado** |

Evidências: [`IMP-068-homologacao-val010.md`](../implementation/evidencias/IMP-068-homologacao-val010.md).

---

## 3. Resumo técnico da implementação

### 3.1 Runtime

| Peça | Local |
|------|--------|
| Voice Controller / State Manager / STT·TTS·Device adapters | `app/src/ceoOuvindo/` |
| Fronteira texto partilhada (teclado = voz) | `app/src/modules/conversa/enviarAoNucleo.js` → `executiveEngine.executar` |
| UI Conversa (botão Ouvindo) | `app/src/modules/conversa/conversa.js` |
| STT | Web Speech via `onboarding/voice/stt.js` (adapter) |
| TTS | `experienciaVoz` / REQ-047 (adapter) — Speaker continua só prosa (REQ-050) |

### 3.2 Fluxo MVP

```text
Ouvindo → STT (+ silêncio ~900 ms) → enviarAoNucleo(texto)
  → Gate + EIC + Núcleo → mensagem na UI
  → TTS → retorno automático a Ouvindo
```

### 3.3 Commits de referência

| Hash | Conteúdo |
|------|----------|
| `0c7d205e87d87942d7b7524593cb6986db189918` | IMP-068 MVP + cadeia documental ANL/REQ/ARQ |
| `8de0070eafa0bddf837994bf79e0d2ec08e3ffec` | VAL-010 + CT-CO07…10 |

---

## 4. Decisões arquitecturais relevantes

| ID | Decisão |
|----|---------|
| D1 | EIC **inalterada** — sem classe «voz»; só texto na fronteira |
| D2 | Cinco componentes ARQ-029 via adaptadores (`ceoOuvindo/`) |
| D3 | **Retorno automático a Ouvindo** após TTS (IMP-068 D3; sobrescreve Idle-por-gesto da ARQ §4.4 no MVP) |
| D4 | Exclusão mútua Ouvindo ⊕ Respondendo (anti-feedback) |
| D5 | Harmonização com PX-002 (preferência/unlock) sem duplicar limiar EIC |
| D6 | Falhas STT/TTS → estado Erro visível; Gate/Jobs não cancelados por stop de áudio |

---

## 5. Evidências de homologação

| Evidência | Resultado |
|-----------|-----------|
| CT-CO01…10 (`test:ceo-ouvindo`) | 10 pass / 0 fail |
| `test:voz` | 33 pass / 0 fail |
| `test:classificador:e23` + `test:dic` | Verdes (EIC/DIC intactos) |
| `npm run build` | OK |
| VAL-010 — 15 testes laboratoriais | **15/15 Aprovados** |
| Smoke produção (`sistema-ceo.vercel.app`) | Bundle **sem** IMP-068 à data da VAL (deploy residual) |

---

## 6. Limitações conhecidas do MVP

1. **Deploy produção** do IMP-068 pode ainda estar pendente (branch ahead of origin à data do ENC).  
2. STT/TTS dependem do **browser** (Chrome/Edge recomendados; Safari/iOS com restrições PX-001).  
3. Qualidade de transcrição (ruído, termos MG2) sem correcção automática avançada.  
4. Preferência voz Desativada: STT pode correr; TTS pode enfileirar («Ouvir»).  
5. Sem barge-in: não se escuta durante **Respondendo**.  
6. Reentrada automática a Ouvindo pode reabrir mic sobre cauda acústica em ambientes ruidosos (mitigação futura: cooldown / VAD).

---

## 7. Evoluções futuras (fora do escopo)

Explicitamente **não** iniciadas após este ENC:

| Evolução | Descrição |
|----------|-----------|
| Conversação contínua | Microfone permanente entre turnos |
| Barge-in | Interromper a fala do CEO e ser ouvido de imediato |
| Wake word | Activação por palavra-chave sem gesto |
| Streaming de áudio | Áudio server-side / chunked |
| VAD avançado | Detecção de actividade vocal robusta |
| Múltiplas vozes | Timbres / papéis distintos |

Qualquer destas exige **nova** frente (ANL/REQ/ARQ…) sob deliberação do patrocinador.

---

## 8. Estado final da capacidade

| Dimensão | Estado |
|----------|--------|
| Frente «CEO Ouvindo» (MVP) | **ENCERRADA** |
| Capacidade CAP-07 (global) | Continua vigente; este ENC encerra **só** a frente de canal de voz MVP |
| Código MVP | Estável em laboratório; produção conforme deploy autorizado |
| Próxima acção do Engenheiro | **Nenhuma** implementação nova nesta frente |
| Próxima acção do projecto | Aguardar definição da **próxima frente** pelo patrocinador / CTO |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (Cursor), por comando do patrocinador |
| Quando | 03/08/2026 |
| O quê | Encerramento formal ENC-006 da frente CEO Ouvindo |
| Por quê | VAL homologada (VAL-010); ciclo ADR-006 da frente concluído |
| Resultado | Frente encerrada; evoluções §7 congeladas; índice actualizado |

---

**Fim da frente CEO Ouvindo (MVP).**  
Aguardar definição da próxima frente do projeto.

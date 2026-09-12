# ARQ-090 — TurnEnvelope Fatia 0: contrato e nascimento

> **Status: Rascunho — v0.2 (12/09/2026).** Aguarda nova homologação CTO.  
> **Versão:** 0.2 — 12/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-090.  
> **Capacidade:** CAP-01 — Governança.  
> **Lastro adjacente (não altera contratos):** CAP-07 — Comunicação; [ARQ-018](ARQ-018-classificacao-de-intencao.md).  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-015; CAP-001; **REQ-090 v0.2**.  
> Base: Lente de Engenharia TurnEnvelope; REQ-090; ajustes da homologação técnica.  
> **Finalidade:** arquitectura mínima da Fatia 0 — contrato, criação, transporte paralelo em **sombra**, invariantes de envelope, **sem** mudança comportamental e **sem** migração de autoridade.  
> **Gate ARQ:** aberto.  
> **Proibições:** não implementar TurnEnvelope neste acto; não criar IMP-090 aqui; não emendar ARQ-088; não alterar contratos Speaker/CN/disciplina/reflexo/NCS/classificador/VCA.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do nascimento e transporte do `TurnEnvelope` como unidade central de execução do turno no Núcleo, em paralelo ao `ctx` legado, como **sombra** na Fatia 0. |
| **Por que existe?** | REQ-090 exige formalizar a unidade antes de migrar autoridade; o pipeline actual reconstrói o turno em várias camadas. |
| **Para quem existe?** | CTO (homologação); Engenheiro (IMP-090 futura); Núcleo/MRE/CN (consumidores **futuros** — não nesta fatia). |
| **Como medir sucesso?** | CA-090-1…10 do REQ-090; invariantes I1–I11; comportamento legado intacto. |

---

## 1. Princípio central (declaração; aplicação plena nas fatias seguintes)

> A pergunta actual governa a resposta. Histórico = contexto. Memória = evidência. Estado operacional = restrições. Nenhuma camada substitui a pergunta actual **no envelope** sem regra explícita de autoridade.

Na Fatia 0 este princípio fica **declarado e protegido nos campos selados do envelope**. O pipeline legado **mantém comportamento próprio** até fatias de migração. A Fatia 0 **não** migra autoridade.

---

## 2. Onde o envelope nasce

```text
UI / Centro / voz
    → enviarAoNucleo (textoBruto → texto)
        → executiveEngine.executar(entrada)
            → normalizarInstrucao(entrada) → { texto, historico, coaId: coaIdEntrada }
            → [FATIA 0] criarTurnEnvelope({
                 mensagemAtual: texto,          // âncora única
                 perguntaAtual: texto,          // = mensagemAtual
                 coaId: coaIdEntrada || obterCoaAtivo()?.id || "__sem_coa__",
                 canal, ...
               })  // sela mensagemAtual, perguntaAtual, coaId (+ idTurno, timestamp, canal)
            → anexar referência (ex. variável de turno / ctx futuro) SEM ramos comportamentais
            → pipeline LEGADO inalterado
                → early-returns Gate / AD / VCA / CSC / …  (envelope já existe)
                → … → C2 / capacidadeIa / integracaoNucleo (ctx.envelope disponível; sombra)
```

**Ponto canónico:** imediatamente após `normalizarInstrucao`, **antes** de `decidirInterceptacaoContinuidade` e de qualquer early-return — garante CA-090-1.

**Factory:** módulo dedicado proposto `app/src/turnEnvelope/` (nome exacto na IMP), exportando `criarTurnEnvelope` + helpers de inspeção para testes; **sem** efeitos laterais; **sem** decisores.

---

## 3. Visão arquitectural (Fatia 0)

```text
┌──────────────────────────────────────────────┐
│ TurnEnvelope (nasce uma vez / turno)         │
│  mensagemAtual (selada) = texto normalizado  │
│  perguntaAtual (selada) = mensagemAtual      │
│  coaId (selado) = regra de create            │
│  restantes: null / [] / reservados           │
│  rastreio: [ { fase: "create", ... } ]       │
└───────────────────┬──────────────────────────┘
                    │ referência sombra
                    ▼
┌──────────────────────────────────────────────┐
│ Pipeline LEGADO (autoridade operacional)     │
│ flags, classificador, VCA, MRE, Speaker,     │
│ disciplina, reflexo, CN                      │
│ — NÃO consulta envelope para decidir —       │
│ — comportamento = baseline —                 │
└──────────────────────────────────────────────┘
```

---

## 4. Contrato e selagem

Semântica dos campos: ver REQ-090 (tabela de contrato).

**Selagem (estratégia documental):** tornar non-writable `mensagemAtual`, `perguntaAtual`, `coaId`, `idTurno`, `timestamp`, `canal` (ex. `Object.freeze` do objecto ou descritores).  
Tentativa de alteração → **TypeError** (ou falha equivalente) **ou** no-op sem mudar o valor; a IMP fixa uma estratégia; CA-090-8 verifica preservação do valor.

**COA — regra de create (única medida por CA-090-3):**

```text
coaId = coaIdEntrada || obterCoaAtivo()?.id || "__sem_coa__"
```

Após VCA, `ctx.coaAtivo` pode ser `null` (isolamento) enquanto `envelope.coaId` permanece o valor selado. **Esperado na Fatia 0.** Não reconciliar. Não ler `envelope.coaId` para comportamento.

**Mensagem — âncora única:**

```text
mensagemAtual = texto  // de normalizarInstrucao
perguntaAtual = mensagemAtual
```

---

## 5. Matriz de autoridade (Fatia 0)

| Campo | Cria | Escreve | Lê (produção) | Sela | Pode alterar |
|-------|------|---------|---------------|------|--------------|
| `idTurno`, `timestamp`, `canal` | Factory | Só na create | Proibido para decidir | Create | **Ninguém** |
| `coaId` | Factory (regra create) | Só na create | Proibido para decidir | Create | **Ninguém** neste turno |
| `mensagemAtual`, `perguntaAtual` | Factory | Só na create | Proibido para decidir | Create | **Ninguém** |
| `objecto`, `modo`, `intençãoAtual` | — | **Proibido** (permanecem default) | — | N/A | N/A |
| Contexto / evidências / memória / estado / restrições / sinais / autoridade | — | **Proibido** como preenchimento de autoridade | — | N/A | N/A |
| `rastreio` | Factory | Append `create` | Testes / debug | Append-only | Só append create |
| Campos de saída | — | **Proibido** | — | N/A | N/A |

**Lê (testes):** asserts de presença, igualdade, selagem — permitidos.

---

## 6. Invariantes (alinhadas ao REQ-090)

| ID | Invariante | Âmbito |
|----|------------|--------|
| **I1** | `mensagemAtual` imutável após create | Envelope |
| **I2** | `perguntaAtual` no envelope não é substituída; = `mensagemAtual` selada | **TurnEnvelope apenas** — legado pode enriquecer/substituir prosa fora do envelope |
| **I3** | Contexto não entra em `mensagemAtual`/`perguntaAtual` | Envelope |
| **I4** | Memória não redefine `modo`/`intençãoAtual` do envelope | **TurnEnvelope apenas** |
| **I5** | Estado operacional não escreve `intençãoAtual` do envelope | **TurnEnvelope apenas** |
| **I6** | `coaId` selado no create; sem fusão de outro COA nesse campo | Envelope |
| **I7** | Zero mudança comportamental observável | Sistema |
| **I8** | Envelope ≠ Parecer ≠ Comunicado ≠ HFC ≠ Trilha V1 | Sistema |
| **I9** | Fail-soft se envelope ausente em callers de teste; via oficial sempre cria | Sistema |
| **I10** | Sem escrita Trilha V1 | Sistema |
| **I11** | Shadow: sem ramos comportamentais sobre `ctx.envelope` | Sistema |

---

## 7. Compatibilidade (convivência temporária)

| Camada | Fatia 0 |
|--------|---------|
| Flags (`pedidoInfoGathering`, etc.) | Autoridade operacional; envelope **não** as substitui |
| Classificador / Precedência | Intactos; **não** escrevem `modo`/`objecto` no envelope como autoridade |
| `fioConversacional` | Obtido como hoje; campo do envelope fica `[]` |
| VCA / CSC | Intactos; divergência COA pós-VCA **não** reconciliada |
| MRE / orquestrador | Continuam `instrucao` / `entrada.mensagem`; podem **carregar** referência sombra sem a consultar |
| Speaker / CN / disciplina / reflexo | Intactos |
| Trilha V1 | Intocada |

---

## 8. Observabilidade (Fatia 0)

* `envelope.rastreio` em memória: evento `create` com `{ idTurno, coaId, canal, … }` (sem prosa obrigatória).
* Testes: dump / asserts.
* **Não** criar tipo Trilha; **não** escrever `executive/audit/eventos.jsonl`; **não** emendar ARQ-088.

---

## 9. Critérios de teste arquitectural (espelho REQ)

| ID | Foco |
|----|------|
| CA-090-1 / CA-090-10 | Nascimento em Gate, AD, VCA/CSC e demais early-returns + path completo |
| CA-090-2 | Âncora `mensagemAtual` = `texto` de `normalizarInstrucao` |
| CA-090-3 | `coaId` **só** no create, regra documentada |
| CA-090-4 | `ctx.envelope` no C2 |
| CA-090-5 | Baseline comportamental intacta |
| CA-090-6 | Trilha V1 intacta |
| CA-090-7 | Reservados / sem autoridade de `modo`/`objecto` |
| CA-090-8 | Selagem: mutate `mensagemAtual` / `perguntaAtual` / `coaId` |
| CA-090-9 | Critério negativo sombra |

**Consistência:** testes da Fatia 0 **não** exigem mudança de prosa/rota; apenas presença, selagem e ausência de dependência comportamental — alinhado a “zero mudança comportamental”.

---

## 10. Não escopo (registo explícito)

Fatia 0 **não** implementa: sinais canónicos; migração de detectores; fio único no envelope; packaging seccionado MRE; `políticaSubstituição`; mudanças Speaker/CN/NCS/disciplina/reflexo; encerramento; extensão da Precedência V1; novos eventos de Trilha; reconciliação COA pós-VCA; **migração de autoridade**.

---

## 11. Dependências para Fatia 1

1. REQ-090 / ARQ-090 homologados + IMP-090 / VAL-090 verdes.  
2. Envelope sombra presente na via oficial, early-returns e C2.  
3. Contrato de `sinais` / `modo` já reservado.  
4. Novo REQ/ARQ de Fatia 1 para mapa sinal→modo e fim do critério negativo de sombra parcial.  
5. **Não** iniciar Fatia 1 enquanto a Fatia 0 permitir escrita ad hoc de `modo`/`objecto` ou mutação de `mensagemAtual`.

---

## 12. Rastreabilidade ARQ

REQ-090 → ARQ-090 → IMP-090 (**ainda não criado**; só após homologação) → VAL-090.  
Preserva: ARQ-013, ARQ-018, ARQ-020, ARQ-026, ARQ-088.

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | Proposta (chat) | Arquitectura Fatia 0 | Não persistida; NÃO APROVADO |
| 0.2 | 12/09/2026 | Engenheiro | Persistência + ajustes homologação | Âmbito I2/I4/I5, coaId, sombra, early-returns, selagem | **Rascunho** — aguarda CTO |

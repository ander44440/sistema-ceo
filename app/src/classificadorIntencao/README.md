# Classificador de Intenção

**IMP-057** · **IMP-061** · **REQ-057** · **REQ-061** · **ARQ-018** · **ARQ-022**  
Destino C3 → Motor de Execução (**ARQ-017** / **REQ-056** / IMP-056).

## O que é

Primeiro passo obrigatório do Núcleo Executivo: classifica **toda** mensagem do utilizador numa de quatro classes antes de qualquer resposta ou efeito.

| ID | Classe | Destino |
|----|--------|---------|
| C1 | `conhecimento_geral` | `resposta_leve` — resposta imediata |
| C2 | `conversa_projeto` | `nucleo_mre` — Núcleo / MRE |
| C3 | `trabalho_executivo` | `motor_execucao` — Motor (Job / Gate / handoff) |
| C4 | `comando_operacional` | `capacidade_operacional` — fila, memória, dashboard, CTO, … |

**Limiar de confiança V1:** `0,55` (`LIMIAR_CONFIANCA`). Abaixo → clarificação; nunca C3+Job.

**Histórico recente (IMP-061):** opcional no contexto (`historicoRecente`, janela 4 / 200 / 800). Só desambigua **C1↔C2**; **nunca** força C3. Ausência = comportamento IMP-057.

**Referências (IMP-062):** módulo auxiliar `resolverReferencias` — resolve deixis para `ReferenteResolvido` ou ambiguidade (pergunta curta); **não** decide classe; Classificador permanece único decisor.

## Portas / módulos

| Módulo | Responsabilidade |
|--------|------------------|
| `dominio.js` | Enum, contrato RF7, limiar, flags |
| `lexicon.js` / `regras.js` | Classificação pura (sem I/O); S3 histórico |
| `historicoRecente.js` | Preparador de janela (IMP-061) |
| `encaminhador.js` | Classe → destino lógico |
| `integracaoNucleo.js` | Ponte C3 → Motor (anti-«Sugiro») |
| `destinos.js` | Despacho estrito C1–C4 (IMP-057 E5) |
| `executiveEngine/classificar.js` | Adapter legado → canónico (**um** limiar) |

Entrypoint de runtime: `executiveEngine.executar` → Continuidade Gate → `seleccionarHistoricoRecente` → `primeiroPassoClassificar` → `executarPorDestino`.

## Isolamento (fronteiras)

- Classificador puro **não** publica Job, **não** usa `@cursor/sdk`, **não** chama Dispatcher.
- C3 **não** fecha com Parecer textual / «Sugiro…» — só Motor.
- C2 **não** cria Job automático nesta via.
- Conversa e Centro de Situação passam pelo Núcleo (não classificam à margem).

## Checklist operacional (E6)

1. `npm run test:classificador` a verde.  
2. Smoke C1 «Bom dia» → `resposta_leve`.  
3. Smoke C4 «listar jobs» → capacidade `fila`.  
4. Smoke C3 «resolva os bugs…» → Motor / Gate (sem «Sugiro»).  
5. Confirmar um só `origem: classificador_canonico` no caminho Conversa→Núcleo.

## Testes

```bash
npm run test:classificador        # E1–E7
npm run test:classificador:e6     # fronteiras
npm run test:classificador:e1…e5
```

## Referências

- `docs/architecture/ARQ-018-classificacao-de-intencao.md`
- `docs/requirements/REQ-057-classificacao-de-intencao.md`
- `docs/architecture/ARQ-017-*.md` / `docs/requirements/REQ-056-*.md` (Motor)
- `docs/implementation/IMP-057-classificacao-de-intencao.md`
- Matriz CA/NA: `docs/implementation/evidencias/IMP-057-matriz-ca-na.md`

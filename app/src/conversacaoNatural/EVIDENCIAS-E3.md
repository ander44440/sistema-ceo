# PX-003 E3 — Evidências de integração às superfícies

## Gate

Toda resposta do `executiveEngine.executar` passa por `naturalizarRespostaNucleo` (idempotente se a IA já naturalizou).

## Fluxos validados (`npm run test:cn`)

| Fluxo | Antes | Depois |
|-------|--------|--------|
| Saudação | “Sou o CEO — o Executivo Digital…” | Abertura CN (`Boa tarde` + pergunta variável) |
| Continuidade | Template `Sobre:` | Deliberação + âncora de frente, sem estrutura interna |
| Deliberação | `Sobre:` / `Aprovo:` / `Porquê:` | Camadas A–B; sanitização; `gerador: conversacao-natural-v1` |
| Bloqueio | `Lacunas residuais` | Pergunta de bloqueio limpa |
| Encerramento | — | Tipo `fecho` (“Encerro o ponto…” / contexto preservado) |

## Superfícies

- Conversa: boas-vindas via `textoBoasVindasNatural`; estado “À escuta do próximo passo”
- Centro: boas-vindas CN; bloco “Último avanço” sem `Decisão: enum`

## Rastreio interno

`dados.conversacaoNatural` + `comunicado.metadados.textoSpeakerAntes` preservam o template Speaker.

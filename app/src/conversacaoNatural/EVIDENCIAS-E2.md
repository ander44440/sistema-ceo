# PX-003 E2 — Evidências Conversação Natural

> MRE inalterado. Speaker continua a produzir template; a prosa ao utilizador passa por `conversacaoNatural` (`gerador: conversacao-natural-v1`).

## Antes × Depois (5)

### 1 — Deliberação (aprovar)

**Antes (Speaker):**
```
Sobre: Decidir se avança o outdoor…
Aprovo: Aprovar o adiamento…
Porquê: …
Próximo gesto: …
Quando quiser, seguimos.
```

**Depois (CN):** camadas A+B(+E); sem `Sobre:` / sem `Porquê:` default / sem fecho muleta se há gesto.

### 2 — Bloqueio (`solicitar_dados`)

**Antes:** bloco com `Lacunas residuais` + `Sobre:`.

**Depois:** tipo `bloqueio`; pergunta de avanço; sem lacunas residuais em prosa.

### 3 — Sistema / fallback

**Antes:** texto com `CEO_LLM_API_KEY` / `.env.example`.

**Depois:** tipo `sistema`; vazamentos técnicos removidos.

### 4 — Abertura (saudação)

**Antes:** sempre a mesma pergunta.

**Depois:** tipo `abertura`; variação controlada do catálogo PX-011.

### 5 — Evidência de passagem pela camada

`dados.conversacaoNatural.gerador === "conversacao-natural-v1"`  
`comunicado.metadados.textoSpeakerAntes` preserva o template Speaker  
`mensagem` ≠ template (`Sobre:` ausente)

## Testes

`npm run test:cn` — 9/9 PASS  
`npm run test:mre:bloco2` — 12/12 PASS (MRE intacto)  
`npm run build` — PASS

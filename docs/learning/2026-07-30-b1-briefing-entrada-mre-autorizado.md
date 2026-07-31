# Autorização e validação B1 — Briefing na entrada factual do MRE

> **Status:** B1 **implementado e validado** (30/07/2026).  
> **Autorização:** Patrocinador — «AUTORIZADO: B1».  
> **Origem evidência:** [`2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md`](./2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md)

---

## Escopo cumprido

| Regra | Cumprimento |
|-------|-------------|
| Injetar Briefing Curado na entrada factual (`factosOficiais`) | Sim — `obterFactosBriefingProjeto` + `montarEntradaMre` |
| Não modificar motor MRE (pipeline/estágios/enums) | Sim — alterações no Núcleo / `briefingsProjeto.js` / adaptador |
| Não alterar regras de decisão do MRE | Sim — só reforço de schema no adaptador do Núcleo no estágio 6 quando há lastro |
| Validar citação de factos concretos | Sim — ver § Validação |

---

## Alterações

| Ficheiro | Papel |
|----------|-------|
| `app/src/executiveEngine/briefingsProjeto.js` | `obterFactosBriefingProjeto()` — factos discretos MG2 |
| `app/src/mre/integracaoNucleo.js` | Injeta factos + enquadra mensagem; wrap `chamarLlm` no Núcleo se houver lastro |
| `app/src/mre/b1.briefingEntrada.test.js` | Testes unitários B1 |

---

## Validação (E2E com LLM real, 30/07/2026)

Perguntas com COA `prj-mg2`:

1. «O QUE VOCÊ SABE SOBRE ESTE PROJETO?» → `estado=aprovar`, `acao=orientar`, **sem** `solicitar_dados` genérico; dossier/texto com WorldLab2, outdoors, performance/Sprint 1.  
2. «DÊ UM DIAGNÓSTICO DESTE PROJETO.» → mesmo padrão (aprovar/orientar com factos).

Unitários: `node --test src/mre/b1.briefingEntrada.test.js` — 3/3 pass.

---

## Memória

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (autorizou B1); Engenheiro (implementou e validou) |
| Quando | 30/07/2026 |
| Por quê | MRE deliberava sem factos do Briefing (OE-01 em uso real) |
| Resultado | Entrada factual alimentada; respostas deixam de ser só «pedir dados» genérico |

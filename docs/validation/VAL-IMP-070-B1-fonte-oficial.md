# VAL-IMP-070-B1 — Validação exclusiva do Bloco B1 (REQ-070)

> **Status:** Homologada — 07/08/2026 (CTO).  
> **IMP:** IMP-070-B1 · REQ-070 · **ENCERRADO / HOMOLOGADO**.  
> **Nota:** escopo REQ-070 congelado; sem refinamentos salvo regressão comprovada.

---

## 1. Escopo validado

| Incluído | Excluído (conforme despacho) |
|----------|------------------------------|
| Fonte Oficial única (Acervo) | Porta de recuperação EIC (REQ-072) |
| Projecções subordinadas (briefing) | Governação (REQ-074) |
| Lacuna explícita sem item apto | Actualização/curadoria (REQ-071) |
| Hierarquia Acervo > projecção | Limites de admissão (REQ-073 / B2) |

---

## 2. Entregáveis

| Artefacto | Papel |
|-----------|--------|
| `app/src/camadaConhecimento/fonteOficial.js` | Fonte Oficial / lacuna / subordinar projecção |
| `app/src/camadaConhecimento/fonteOficial.test.js` | CA-070-1…4 + integração |
| `app/src/executiveEngine/briefingsProjeto.js` | Briefing = `obterProjecaoBriefing` (subordinada) |
| `app/src/mre/integracaoNucleo.js` | `factosOficiais` ← Acervo+lacuna; projecção à parte |
| `app/src/executiveEngine/promptGovernanca.js` | System: Fonte Oficial + projecção rotulada |

---

## 3. Matriz CA-070

| CA | Resultado | Evidência |
|----|-----------|-----------|
| CA-070-1 | **PASS** | `fonteOficial.test.js` — item só após carga no Acervo |
| CA-070-2 | **PASS** | Projecção `naoEFonteOficial`; factos oficiais sem WorldLab2 do briefing |
| CA-070-3 | **PASS** | Item com `KNW-002` + âmbito |
| CA-070-4 | **PASS** | Lacuna explícita; não apto não conta |

---

## 4. Suite executada

```text
node --test src/camadaConhecimento/fonteOficial.test.js src/mre/b1.briefingEntrada.test.js
→ 14/14 pass (07/08/2026)
```

---

## 5. Observações

- Acervo runtime inicia **vazio** (alinhado a `docs/knowledge/` sem KNW) → lacuna esperada até curadoria (B3/B4).  
- Briefing permanece disponível como **projecção subordinada** — não canónica.  
- Não foi implementada Porta EIC, governação nem curadoria neste bloco.

---

## 6. Homologação

| Campo | Valor |
|-------|--------|
| CTO | Homologou B1 (07/08/2026) |
| Efeito | B1 encerrado; REQ-070 congelado; B2 autorizado |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (VAL) + CTO (homologou) |
| Quando | 07/08/2026 |
| O quê | VAL + homologação IMP-070 B1 / REQ-070 |
| Resultado | **Homologado** · cadeia ARQ-031→CAP-04→REQ-070→IMP-070-B1→VAL preservada |

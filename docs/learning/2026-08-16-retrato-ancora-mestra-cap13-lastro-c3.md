# Retrato — Âncora Mestra CAP-13 / primeiro lastro C3

> **Status:** Retrato operacional **congelado neste instante** — 16/08/2026.  
> **Tipo:** aprendizado / continuidade (sem efeito normativo).  
> **Âncora viva (actualizar depois):** [`ANCORA-MESTRA.md`](./ANCORA-MESTRA.md)  
> **Pedido:** patrocinador — «deixe uma âncora mestra com o estado atual… como um retrato deste momento».

---

## Instantâneo

| Dimensão | Valor neste momento |
|----------|---------------------|
| Data | 16/08/2026 |
| Fase estratégica | ADR-015 — uso operacional / MVP diário MG2 |
| Capacidade em evidência | **CAP-13** — Memória de Evolução do Produto |
| `origin/main` | `a0c677e94144b252eebaec986ea49a28deab0396` |
| Railway | SUCCESS · SHA `a0c677e…` · deploy `9c72ccbe…` |
| Vercel | https://sistema-ceo.vercel.app · Centro com lastro |
| Health | 200 · `ceo-api` |
| Lastro C3 | **`MCP-001`** · único · `CONCEBIDO` |

---

## Circuito comprovado

```text
proporEvolucaoDesidentificada (via executarActoC3)
        ↓
store /data/mep-ceo/store  (Railway volume)
        ↓
GET /api/ceo/mep/c3/propostas  →  [ 1 × 4 campos ]
        ↓
Centro · «Propostas de evolução do produto» · MCP-001
```

---

## Entregas que fecharam este retrato (hoje)

1. Packaging Docker / sede Railway (pré-condição).  
2. ARQ-033 v1.2 + IMP-075 + VAL-077 — transporte runtime.  
3. ARQ-034 (Opção A) + IMP-076 + VAL-078 — invocador Node.  
4. Deploy `main` no Railway.  
5. Dry-run + **uma** criação real controlada → `MCP-001`.  
6. Verificação GET + visual no CEO.

---

## Conteúdo da proposta (sintético / teste)

- **papel:** engenheiro  
- **objectoCandidato:** MCP (visível no `id`)  
- **tipoLacunaProduto:** coerencia de acompanhamento executivo  
- **enunciado:** TESTE-CAP13: hipotese sintetica…  
- **evidencia:** VAL-078  
- **origemCanal:** C3 (no store; **não** na vista HTTP)

---

## Fronteiras intactas neste retrato

Sem POST C3 · sem formulário · sem promoção · sem segundo store · C1/C2/`c3.js`/adapter não reabertos neste acto de lastro.

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador pediu o retrato; Engenheiro (Cursor) registou |
| Quando | 16/08/2026 |
| Por quê | Não perder o estado após o primeiro lastro C3 real |
| Baseado em quê | Produção viva (health, GET, Centro) + `main`/`Railway` alinhados |
| Resultado | Este ficheiro + `ANCORA-MESTRA.md` actualizada |

---

*Não editar este retrato — criar novo datado se o estado mudar de forma material.*

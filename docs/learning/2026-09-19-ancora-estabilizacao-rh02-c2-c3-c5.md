# Âncora — Estabilização R-H02 / C2 / C3 / C5 (rodada homologada)

> Registro de continuidade da rodada de estabilização homologada 15/15.  
> **Natureza:** aprendizado / âncora operacional. Sem efeito normativo.  
> **Não altera** código, testes nem frentes ainda não consolidadas.

---

## Commit oficial

| Campo | Valor |
|-------|--------|
| SHA | `d37096c` |
| Mensagem | `fix: consolida estabilização R-H02/C2/C3/C5` |
| Âmbito | 16 ficheiros — somente C\*/R-H02 (staging seletivo; leakage zero) |

## Homologação

| Item | Resultado |
|------|-----------|
| Protocolo Runs A–G (15 critérios) | **15/15 PASSOU** — HOMOLOGADO |
| Build (`npm run build`) | **PASSOU** |

## Frentes consolidadas neste commit

* **R-H02** — fail-closed painel/job sem lastro institucional  
* **C2** — novo contexto + objecto explícito  
* **C3** — factos do turno vs lacunas COA/Painel  
* **C5** — reorientação handoff + critério de pronto (recovery ENUM)  
* **Fronteira C2×C5** — `reoriente` solo não dispara `novo_contexto`

## Proteções preservadas (baseline / não regressão nesta rodada)

* **R-H01**, **R-H03**, **R-H04**  
* **C3-H02**, **C3-H03**  
* **C5-H03**, **C5-H04**

## Frentes ainda fora desta rodada (working tree / não misturar)

Permanecem **fora** do commit `d37096c` e devem ser tratadas em commits/separações próprias:

* LFC (IMP-092 / ADR-021–023 e código associado)  
* IMP-093 (Context Governor e integrações)  
* IMP-094 (funil / porta canónica e afins)  
* UI  
* queue / histórico local  
* diags e demais alterações não consolidadas  

### Regra de retomada

**Não misturar** essas frentes com o commit `d37096c`. Qualquer retomada deve partir desta âncora e isolar LFC / IMP-093 / IMP-094 / UI / queue / diags em trabalho separado.

---

**PRÓXIMO PASSO: AUDITORIA DE FECHAMENTO DO CEO-A.**

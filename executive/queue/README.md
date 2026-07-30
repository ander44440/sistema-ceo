# Fila de Execução (REQ-045)

Queue local em ficheiros JSON. O CEO **publica** Jobs; não conhece executores.

## Pasta

Cada Job: `JOB-NNNNNN.json`

## Estados

`pending` → `running` → `completed` | `failed` | `cancelled`

## Protocolo Cursor (sem custo)

1. Listar Jobs `pending` (mais antigo primeiro).
2. Marcar `running` (`iniciadoEm`).
3. Executar conforme `descricao` / `titulo` / `projeto`.
4. Marcar `completed` ou `failed` com `resultado` e `concluidoEm`.

Ver skill do projeto: `.cursor/skills/consumir-fila-execucao/SKILL.md`

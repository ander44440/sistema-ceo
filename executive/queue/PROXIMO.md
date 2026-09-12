# Próximo Job (pending)

- **id:** `JOB-000120`
- **projeto:** prj-sistema-ceo (Sistema CEO)
- **tipo:** execucao_tecnica
- **prioridade:** alta
- **titulo:** Faça um diagnostico geral do atual estado do projeto CEO e aponte onde …

## Descrição

Faça um diagnostico geral do atual estado do projeto CEO e aponte onde você considera que ha deficiências que precisem ser melhoradas ok..

## Protocolo (P0-2)

1. Marcar Job como `dispatched` (handoff) e depois `running`.
2. Executar o trabalho pedido.
3. Registar resultado em estado `result` (nunca `completed` directo).
4. CEO verifica → `completed` | `needs_correction` | `failed`.

Ficheiro: `executive/queue/JOB-000120.json`

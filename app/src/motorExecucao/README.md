# Motor de Execução — implementação (IMP-056)

> Documentação técnica mínima do código em `app/src/motorExecucao/`.  
> Normas: **ARQ-017** · **REQ-056** · **IMP-056**.  
> Peças reutilizadas: **REQ-045** (Fila) · **REQ-053** (Dispatcher V2) · **REQ-048** (`acao.job`).  
> Este README **não** substitui ARQ/REQ/IMP.

## O que é

Camada que conduz o ciclo canónico:

`Intenção → Plano → Aprovação (se necessária) → Criação do Job → Dispatcher → Execução → Monitoramento → Resultado → Encerramento`

O Motor **orquestra**; não substitui a oficina (REQ-030), não é um segundo Dispatcher e não nomeia o Cursor no acto de publicar.

## Módulos

| Ficheiro | Etapa | Função |
|----------|-------|--------|
| `dominio.js` | E1 | Etapas do ciclo, estados Job, validações |
| `politicaAprovacao.js` | E2 | Gatilhos G1–G3 · Gate `aprovado`/`rejeitado`/`adiado` |
| `ponteParecerJob.js` | E3 | Parecer/`acao` → payload Job via porta `publicarJob` |
| `integracaoOrquestrador.js` | E4 | Pós-parecer no Núcleo · handoff `dispatcher_req053` |
| `resultadoEncerramento.js` | E5 | Job terminal → mensagem + Encerramento |
| `fronteiras.test.js` | E6 | Isolamento CTO/Painel/UI · pending sem watcher |

## Política de aprovação (V1 / RES8)

| ID | Gatilho | Gate |
|----|---------|------|
| G1 | Despacho + efeito externo | sim |
| G2 | Despacho + altera código | sim |
| G3 | Despacho + altera docs de produto | sim |
| — | Sem despacho | não |
| — | Despacho sem G1–G3 | não (mínima V1) |

## Portas reutilizadas (não redesenhadas)

| Porta | Uso |
|-------|-----|
| `publicarJob` (injectável → `POST /api/ceo/queue/jobs`) | Criação REQ-045 |
| Dispatcher V2 (REQ-053) | Único acordador do Agent |
| Painel (REQ-055) | Só observação |
| CTO (REQ-054) | Sem Job automático |

## Fronteiras

* Motor **não** importa `@cursor/sdk`, não faz `fetch` HTTP próprio da fila, não spawna watcher.  
* CTO Connector e Painel **não** publicam Jobs.  
* Prosa MRE («feito») **não** equivale a Job `completed` (E5).  
* Sem PC/Dispatcher: Job fica `pending` (CU5 / RNF3) — **não** vira `failed`.

## Checklist operacional (PC off)

1. Publicar Job via Motor → estado `pending`.  
2. Confirmar no Painel (se activo) sinal do Dispatcher em indisponibilidade / aguardar.  
3. **Não** esperar `failed` só por ausência de watcher.  
4. Ligar Dispatcher V2 no PC (`executive/dispatcher`) para consumo.  
5. Após Job terminal, chamar `processarResultadoEEncerrar` / `processarResultadoMotor`.

## Integração Núcleo

* `aplicarEfeitosPosDeliberacao` → `conduzirAposParecer`  
* `executiveEngine.conduzirMotorExecucao(parecer, deps)`  
* `executiveEngine.processarResultadoMotor(ciclo, job)`

## Testes

```bash
cd app
npm run test:motor        # E1–E7 (domínio … fronteiras)
npm run test:motor:e1     # … e2 e3 e4 e5 e6
```

## Ficheiros da implementação (commit futuro)

Ver lista em `docs/implementation/evidencias/IMP-056-matriz-ca-na.md` §E7-CA3.

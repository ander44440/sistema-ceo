# Dispatcher local da Fila (REQ-053)

Observa `executive/queue/` e, quando há Job `pending`, acorda um **Cursor Agent local** para consumir a fila (REQ-045). O CEO continua a só publicar Jobs.

## Pré-requisitos

* Node.js **≥ 22.13**
* Chave em [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations)
* PC ligado (V2 — não é 24/7 com máquina off)

## Setup

```powershell
cd E:\anderson\CEO\executive\dispatcher
npm install
copy .env.example .env
# Editar .env e colar CURSOR_API_KEY=...
```

## Uso

```powershell
# Ver o que seria despachado (sem chamar o Agent)
npm run dry-run

# Um ciclo: se houver pending, despacha e sai
npm run once

# Watcher contínuo (intervalo default 15s)
npm start
```

Variáveis úteis:

| Variável | Default | Significado |
|----------|---------|-------------|
| `CURSOR_API_KEY` | — | Obrigatória (exceto `--dry-run`) |
| `CEO_REPO_ROOT` | raiz do repo (pai de `executive/`) | Checkout onde o Agent corre |
| `DISPATCHER_POLL_MS` | `15000` | Intervalo do watcher |
| `CURSOR_MODEL` | `composer-2.5` | Modelo do Agent |
| `CEO_API_BASE` | — | Base HTTP para **heartbeat** do Painel (`POST …/orquestracao/heartbeat`). **Não** lista nem publica Jobs. Sem isto, o Painel remoto mostra Dispatcher Erro / `heartbeat_expirado`. |

## Fila oficial (IMP-060 / REQ-053)

* Fonte **única** de Jobs: `executive/queue/` no PC (`CEO_REPO_ROOT`).
* O Dispatcher **não** chama `/api/ceo/queue/*` (Railway ou outro).
* Heartbeat remoto é só sinal de «watcher vivo» para o Painel (BP-001); a contagem Agent «há trabalho na fila» no Painel remoto pode ainda reflectir a loja da API até IMP-060 E5.

## Lock

Enquanto um Agent corre, cria-se `executive/queue/.dispatcher.lock` para evitar dois despachos em paralelo. Removido no fim (ou se stale > 2h).

## Parar

`Ctrl+C` no terminal do watcher (se correste `npm start` à mão).

## Autostart no login (Windows)

Para o watcher subir **sozinho** ao iniciares sessão:

```powershell
cd E:\anderson\CEO\executive\dispatcher
powershell -ExecutionPolicy Bypass -File .\install-autostart.ps1
```

Isto cria a tarefa agendada `CEO-fila-dispatcher` (AtLogOn).

| Comando | Efeito |
|---------|--------|
| `.\start-watcher.ps1` | Sobe em background + logs em `logs/` |
| `.\stop-watcher.ps1` | Para o processo do watcher |
| `.\uninstall-autostart.ps1` | Remove a tarefa do Windows |

Ver estado:

```powershell
Get-ScheduledTask -TaskName CEO-fila-dispatcher
Get-Content .\logs\watcher.log -Tail 20
Get-Content .\logs\dispatcher.out.log -Tail 40
```

**Nota:** se já tiveres `npm start` num terminal, para-o (`Ctrl+C`) antes do autostart, para não haver dois watchers.

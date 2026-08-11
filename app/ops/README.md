# Autostart do Vite (lab local CEO)

> **Operacional apenas** — não altera EIC, EE, CAP nem código do produto.  
> Espelho do padrão `executive/dispatcher/*-autostart.ps1` / `start-watcher.ps1`.

## Autorização Windows

| Momento | Admin / UAC? |
|---------|----------------|
| **Instalar** (`install-autostart.ps1`) | **Não** — tarefa do utilizador actual com `RunLevel Limited` |
| **Cada login** | **Não** — sem prompt; PowerShell Hidden + Vite Hidden |
| Instalar como Administrador por engano | A tarefa continua `Limited` (sem UAC no login) |

## Critério PASS

Após reinício / login: `http://localhost:5173/` responde sem Cursor, sem terminal manual.

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-autostart.ps1
```

## Instalar

```powershell
cd E:\anderson\CEO\app\ops
powershell -ExecutionPolicy Bypass -File .\install-autostart.ps1
```

Cria a tarefa agendada `CEO-vite-dev` (AtLogOn + atraso 20s).

## Uso manual

| Comando | Efeito |
|---------|--------|
| `.\start-vite.ps1` | Sobe Vite em background + logs em `logs/` |
| `.\stop-vite.ps1` | Para o Vite gerido por estes scripts |
| `.\verify-autostart.ps1` | Confirma PASS/FAIL (:5173 + HTTP) |
| `.\uninstall-autostart.ps1` | Remove a tarefa do Windows |

## Ver estado

```powershell
Get-ScheduledTask -TaskName CEO-vite-dev
Get-Content .\logs\vite-watcher.log -Tail 20
Get-Content .\logs\last-boot-pass.txt
Test-NetConnection 127.0.0.1 -Port 5173
```

## Desinstalar

```powershell
cd E:\anderson\CEO\app\ops
powershell -ExecutionPolicy Bypass -File .\uninstall-autostart.ps1
powershell -ExecutionPolicy Bypass -File .\stop-vite.ps1
```

## Pré-requisitos

* Node.js instalado (PATH ou `C:\Program Files\nodejs\node.exe`)
* `npm install` já feito em `app/` (existe `node_modules/vite`)

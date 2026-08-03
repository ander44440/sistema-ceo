# Regista tarefa agendada: ao iniciar sessão, sobe o dispatcher (REQ-053).
# Uso (PowerShell):
#   cd E:\anderson\CEO\executive\dispatcher
#   powershell -ExecutionPolicy Bypass -File .\install-autostart.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$StartScript = Join-Path $Root "start-watcher.ps1"
$TaskName = "CEO-fila-dispatcher"

if (-not (Test-Path $StartScript)) {
  throw "Falta start-watcher.ps1 em $Root"
}

$ps = (Get-Command powershell.exe).Source
$arg = "-NoProfile -ExecutionPolicy Bypass -File `"$StartScript`""

$action = New-ScheduledTaskAction -Execute $ps -Argument $arg -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "CEO REQ-053: dispatcher local da Fila de Execução (watcher + Cursor SDK) ao iniciar sessão." | Out-Null

Write-Host "OK: tarefa '$TaskName' registada para o utilizador $env:USERNAME (AtLogOn)."
Write-Host "Teste agora (sem reiniciar):"
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Ou:"
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$StartScript`""
Write-Host "Parar:"
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$(Join-Path $Root 'stop-watcher.ps1')`""
Write-Host "Remover autostart:"
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"

# Regista tarefa agendada: ao iniciar sessao, sobe o Vite do CEO (:5173).
# Padrao espelhado do dispatcher (executive/dispatcher/install-autostart.ps1).
#
# Autorizacao:
#   - Instalar para o UTILIZADOR ACTUAL NAO exige admin (RunLevel Limited).
#   - Apos instalado: SEM UAC a cada login; SEM Cursor; SEM terminal aberto.
#
# Uso (PowerShell do utilizador, sem "Executar como administrador"):
#   cd E:\anderson\CEO\app\ops
#   powershell -ExecutionPolicy Bypass -File .\install-autostart.ps1

$ErrorActionPreference = "Stop"
$OpsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$StartScript = Join-Path $OpsRoot "start-vite.ps1"
$TaskName = "CEO-vite-dev"

if (-not (Test-Path $StartScript)) {
  throw "Falta start-vite.ps1 em $OpsRoot"
}

# Recusar instalacao elevada acidental (Highest pediria UAC no arranque da tarefa).
$isAdmin = $false
try {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $p = New-Object Security.Principal.WindowsPrincipal($id)
  $isAdmin = $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
} catch { }

if ($isAdmin) {
  Write-Host "AVISO: esta janela esta elevada (Administrador)."
  Write-Host "A tarefa sera mesmo assim registada como RunLevel Limited (sem UAC a cada login)."
}

$ps = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
if (-not (Test-Path $ps)) {
  $ps = (Get-Command powershell.exe).Source
}
$arg = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$StartScript`""

$action = New-ScheduledTaskAction -Execute $ps -Argument $arg -WorkingDirectory $OpsRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
# Pequeno atraso: sessao/perfil PATH prontos apos login (sem prompt)
$trigger.Delay = "PT20S"

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -MultipleInstances IgnoreNew

# Limited = sem elevacao / sem UAC em cada login
$principal = New-ScheduledTaskPrincipal `
  -UserId $env:USERNAME `
  -LogonType Interactive `
  -RunLevel Limited

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "CEO lab local: Vite :5173 ao login. Limited (sem UAC). Sem browser. Sem :8787." | Out-Null

$t = Get-ScheduledTask -TaskName $TaskName
$runLevel = $t.Principal.RunLevel
Write-Host "OK: tarefa '$TaskName' registada para $env:USERNAME (AtLogOn + Delay 20s)."
Write-Host "RunLevel=$runLevel (deve ser Limited = sem autorizacao a cada login)."
Write-Host "Admin so seria necessario para tarefas de maquina/outro utilizador - nao e o caso."
Write-Host ""
Write-Host "Criterio PASS apos reinicio:"
Write-Host "  Login Windows -> (20s) -> http://localhost:5173/ responde"
Write-Host "  Ou: powershell -ExecutionPolicy Bypass -File `"$(Join-Path $OpsRoot 'verify-autostart.ps1')`""
Write-Host ""
Write-Host "Parar Vite:  .\stop-vite.ps1"
Write-Host "Desinstalar: .\uninstall-autostart.ps1"

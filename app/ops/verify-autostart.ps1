# Verifica criterio PASS do autostart Vite (apos login / reinicio).
# PASS: :5173 em escuta e HTTP 200 em http://127.0.0.1:5173/
# Uso: powershell -ExecutionPolicy Bypass -File .\verify-autostart.ps1

$ErrorActionPreference = "Continue"
$OpsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $OpsRoot "logs"
$PassFile = Join-Path $LogDir "last-boot-pass.txt"
$Port = 5173
$ok = $true

Write-Host "=== CEO Vite autostart verify ==="

$task = Get-ScheduledTask -TaskName CEO-vite-dev -ErrorAction SilentlyContinue
if (-not $task) {
  Write-Host "FAIL: tarefa CEO-vite-dev nao registada"
  $ok = $false
} else {
  Write-Host ("TASK: State={0} RunLevel={1} LogonType={2}" -f $task.State, $task.Principal.RunLevel, $task.Principal.LogonType)
  if ($task.Principal.RunLevel -ne "Limited") {
    Write-Host "WARN: RunLevel nao e Limited (pode pedir UAC)"
  }
}

$listening = $false
try {
  $listening = $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
} catch { }

Write-Host ("PORT {0} Listen: {1}" -f $Port, $listening)
if (-not $listening) { $ok = $false }

$httpOk = $false
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 8
  $httpOk = ($r.StatusCode -eq 200)
  Write-Host ("HTTP 127.0.0.1:{0}/ -> {1}" -f $Port, $r.StatusCode)
} catch {
  Write-Host ("HTTP FAIL: {0}" -f $_.Exception.Message)
  $ok = $false
}

if (Test-Path $PassFile) {
  Write-Host "--- last-boot-pass.txt ---"
  Get-Content $PassFile
} else {
  Write-Host "WARN: ainda sem last-boot-pass.txt (start-vite ainda nao confirmou escuta)"
}

if ($ok -and $listening -and $httpOk) {
  Write-Host "RESULT: PASS"
  exit 0
}

Write-Host "RESULT: FAIL"
exit 1

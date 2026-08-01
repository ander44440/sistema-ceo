# Para o dispatcher REQ-053 iniciado por start-watcher.ps1
# Uso: .\stop-watcher.ps1

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $Root "logs\dispatcher.pid"
$OutLog = Join-Path $Root "logs\watcher.log"

function Write-Stamp([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  $dir = Split-Path $OutLog
  if (Test-Path $dir) {
    Add-Content -Path $OutLog -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
  }
  Write-Host $line
}

if (-not (Test-Path $PidFile)) {
  Write-Stamp "Nenhum PID guardado - dispatcher nao parece estar gerido pelo start-watcher"
  exit 0
}

$oldId = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
Remove-Item $PidFile -Force -ErrorAction SilentlyContinue

if ($null -ne $oldId) {
  $oldId = $oldId.ToString().Trim()
}

if ($oldId -match '^\d+$') {
  $proc = Get-Process -Id ([int]$oldId) -ErrorAction SilentlyContinue
  if ($proc) {
    Stop-Process -Id ([int]$oldId) -Force -ErrorAction SilentlyContinue
    Write-Stamp ("Dispatcher parado (PID {0})" -f $oldId)
  } else {
    Write-Stamp ("Processo {0} ja nao existia" -f $oldId)
  }
} else {
  Write-Stamp "PID invalido no ficheiro"
}
exit 0

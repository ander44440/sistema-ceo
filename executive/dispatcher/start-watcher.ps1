# Arranca o dispatcher REQ-053 em background (log em logs/).
# Uso: .\start-watcher.ps1
# Autostart: install-autostart.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$PidFile = Join-Path $LogDir "dispatcher.pid"
$WatcherLog = Join-Path $LogDir "watcher.log"
$OutLog = Join-Path $LogDir "dispatcher.out.log"
$ErrLog = Join-Path $LogDir "dispatcher.err.log"
$EnvFile = Join-Path $Root ".env"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Stamp([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Add-Content -Path $WatcherLog -Value $line -Encoding UTF8
  Write-Host $line
}

if (-not (Test-Path $EnvFile)) {
  Write-Stamp "ERRO: falta .env - copia .env.example e define CURSOR_API_KEY"
  exit 1
}

$envText = Get-Content $EnvFile -Raw -ErrorAction SilentlyContinue
if ($envText -notmatch '(?m)^CURSOR_API_KEY=\s*\S+') {
  Write-Stamp "ERRO: CURSOR_API_KEY vazia no .env"
  exit 1
}

if (Test-Path $PidFile) {
  $oldId = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($null -ne $oldId) {
    $oldId = $oldId.ToString().Trim()
  }
  if ($oldId -match '^\d+$') {
    $proc = Get-Process -Id ([int]$oldId) -ErrorAction SilentlyContinue
    if ($proc) {
      Write-Stamp "Ja a correr (PID $oldId) - nada a fazer"
      exit 0
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Stamp "ERRO: node nao encontrado no PATH"
  exit 1
}
$node = $nodeCmd.Source

Write-Stamp "A iniciar dispatcher com $node"
$p = Start-Process -FilePath $node `
  -ArgumentList "src/index.js" `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog `
  -PassThru

Set-Content -Path $PidFile -Value $p.Id -Encoding ASCII
Write-Stamp ("Dispatcher iniciado PID {0} - logs em {1}" -f $p.Id, $LogDir)
exit 0

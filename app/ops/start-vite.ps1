# Arranca o Vite do CEO (app/) em background - lab local :5173.
# Padrao espelhado do dispatcher (executive/dispatcher/start-watcher.ps1).
# Uso: .\start-vite.ps1
# Autostart: install-autostart.ps1
# NAO abre o navegador. NAO inicia :8787.
# Sem UAC: corre em sessao do utilizador (tarefa Limited).

$ErrorActionPreference = "Stop"
$OpsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppRoot = Split-Path -Parent $OpsRoot
$LogDir = Join-Path $OpsRoot "logs"
$PidFile = Join-Path $LogDir "vite.pid"
$WatcherLog = Join-Path $LogDir "vite-watcher.log"
$OutLog = Join-Path $LogDir "vite.out.log"
$ErrLog = Join-Path $LogDir "vite.err.log"
$PassFile = Join-Path $LogDir "last-boot-pass.txt"
$ViteJs = Join-Path $AppRoot "node_modules\vite\bin\vite.js"
$Port = 5173

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Stamp([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Add-Content -Path $WatcherLog -Value $line -Encoding UTF8
  Write-Host $line
}

function Resolve-NodeExe {
  $fromPath = Get-Command node -ErrorAction SilentlyContinue
  if ($fromPath -and $fromPath.Source -and (Test-Path $fromPath.Source)) {
    return $fromPath.Source
  }
  $candidates = @(
    (Join-Path $env:ProgramFiles "nodejs\node.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\node\node.exe")
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) { return $c }
  }
  return $null
}

function Test-PortListen([int]$p) {
  try {
    $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
      Select-Object -First 1
    return $null -ne $c
  } catch {
    return $false
  }
}

function Wait-PortListen([int]$p, [int]$timeoutSec = 45) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListen $p) { return $true }
    Start-Sleep -Milliseconds 500
  }
  return (Test-PortListen $p)
}

function Write-PassMarker([string]$detail) {
  $body = @(
    "PASS",
    ("when={0}" -f (Get-Date -Format "o")),
    ("port={0}" -f $Port),
    ("url=http://127.0.0.1:{0}/" -f $Port),
    ("detail={0}" -f $detail)
  ) -join "`n"
  Set-Content -Path $PassFile -Value $body -Encoding UTF8
}

if (-not (Test-Path $ViteJs)) {
  Write-Stamp "ERRO: Vite nao encontrado em $ViteJs - corre 'npm install' em $AppRoot"
  exit 1
}

$node = Resolve-NodeExe
if (-not $node) {
  Write-Stamp "ERRO: node.exe nao encontrado (PATH nem pastas padrao) - instale Node.js"
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
      if (Test-PortListen $Port) {
        Write-Stamp "Ja a correr (PID $oldId) - nada a fazer"
        Write-PassMarker "already-running pid=$oldId"
        exit 0
      }
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

if (Test-PortListen $Port) {
  Write-Stamp "Porta $Port ja em escuta - Vite (ou outro) ja activo; nada a fazer"
  Write-PassMarker "port-already-listening"
  exit 0
}

Write-Stamp "A iniciar Vite com $node ($ViteJs) em $AppRoot - porta $Port"
# --host 127.0.0.1: escuta IPv4 loopback (localhost / 127.0.0.1)
# --open false: config tem open:true; autostart NAO deve abrir o browser
$p = Start-Process -FilePath $node `
  -ArgumentList @($ViteJs, "--host", "127.0.0.1", "--port", "$Port", "--open", "false") `
  -WorkingDirectory $AppRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog `
  -PassThru

Set-Content -Path $PidFile -Value $p.Id -Encoding ASCII
Write-Stamp ("Vite processo PID {0} - a aguardar escuta :{1}" -f $p.Id, $Port)

if (Wait-PortListen $Port 45) {
  Write-Stamp ("Vite ativo em http://127.0.0.1:{0}/ (PID {1})" -f $Port, $p.Id)
  Write-PassMarker ("started pid={0}" -f $p.Id)
  exit 0
}

Write-Stamp "ERRO: processo iniciado mas porta $Port nao entrou em escuta a tempo - ver vite.err.log"
exit 1

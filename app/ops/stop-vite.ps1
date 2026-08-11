# Para o Vite do CEO iniciado por start-vite.ps1
# Uso: .\stop-vite.ps1

$ErrorActionPreference = "Continue"
$OpsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $OpsRoot "logs"
$PidFile = Join-Path $LogDir "vite.pid"
$WatcherLog = Join-Path $LogDir "vite-watcher.log"
$Port = 5173

function Write-Stamp([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  if (Test-Path $LogDir) {
    Add-Content -Path $WatcherLog -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
  }
  Write-Host $line
}

function Stop-Tree([int]$processId) {
  Get-CimInstance Win32_Process -Filter "ParentProcessId=$processId" -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Tree ([int]$_.ProcessId)
    }
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

$stopped = $false

if (Test-Path $PidFile) {
  $oldId = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  if ($null -ne $oldId) {
    $oldId = $oldId.ToString().Trim()
  }
  if ($oldId -match '^\d+$') {
    $proc = Get-Process -Id ([int]$oldId) -ErrorAction SilentlyContinue
    if ($proc) {
      Stop-Tree ([int]$oldId)
      Write-Stamp ("Vite parado (PID {0} + filhos)" -f $oldId)
      $stopped = $true
    } else {
      Write-Stamp ("Processo {0} ja nao existia" -f $oldId)
    }
  } else {
    Write-Stamp "PID invalido no ficheiro"
  }
} else {
  Write-Stamp "Nenhum PID guardado - Vite nao parece estar gerido pelo start-vite"
}

# Fallback: libertar :5173 se ainda estiver ocupada por node residual
try {
  $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($opid in $listeners) {
    if ($opid -and $opid -gt 0) {
      $p = Get-Process -Id $opid -ErrorAction SilentlyContinue
      if ($p -and $p.ProcessName -match '^(node|nodejs)$') {
        Stop-Tree ([int]$opid)
        Write-Stamp ("Libertou porta {0} (PID {1})" -f $Port, $opid)
        $stopped = $true
      }
    }
  }
} catch {
  # ignore
}

if (-not $stopped) {
  Write-Stamp "Nada a parar"
}
exit 0

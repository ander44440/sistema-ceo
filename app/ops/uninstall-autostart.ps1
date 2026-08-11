# Remove a tarefa de autostart do Vite (não para o processo já a correr).
# Para o Vite: .\stop-vite.ps1

$TaskName = "CEO-vite-dev"
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "Tarefa '$TaskName' removida (se existia)."
Write-Host "Se o Vite ainda estiver a correr: powershell -ExecutionPolicy Bypass -File .\stop-vite.ps1"

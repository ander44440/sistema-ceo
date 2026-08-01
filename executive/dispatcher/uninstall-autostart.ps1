# Remove a tarefa de autostart (não para o processo já a correr).
$TaskName = "CEO-fila-dispatcher"
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "Tarefa '$TaskName' removida (se existia)."

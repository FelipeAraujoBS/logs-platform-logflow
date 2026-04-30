$services = @("payment-service", "auth-service", "order-service", "notification-service")
$severities = @("DEBUG", "INFO", "INFO", "INFO", "WARN", "ERROR", "FATAL")
$messages = @(
  "Requisição processada com sucesso",
  "Conexão com banco estabelecida",
  "Timeout na resposta da API externa",
  "Falha ao processar pagamento",
  "Usuário não autenticado",
  "Erro interno do servidor",
  "Cache miss detectado"
)

for ($i = 1; $i -le 100; $i++) {
  $service  = $services  | Get-Random
  $severity = $severities | Get-Random
  $message  = $messages   | Get-Random

  $body = @{
    severity = $severity
    service  = @{
      name        = $service
      version     = "1.0.0"
      environment = "production"
    }
    message = "$message (#$i)"
  } | ConvertTo-Json

  Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/v1/logs" -ContentType "application/json" -Body $body | Out-Null
  Write-Host "[$i/100] $severity - $service - $message"
  Start-Sleep -Milliseconds 200
}
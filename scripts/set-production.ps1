# Script para configurar ambiente de produção
Write-Host "🚀 Configurando ambiente de PRODUÇÃO..." -ForegroundColor Cyan

# Definir variável de ambiente
$env:NODE_ENV = "production"
[System.Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Process")

Write-Host "✅ NODE_ENV = production" -ForegroundColor Green

# Verificar arquivos de configuração
$configFiles = @(
    "src\public\js\env.config.js",
    "src\public\js\logger.js",
    "src\config\production.config.js"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file não encontrado" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 Configurações de Produção Ativas:" -ForegroundColor Cyan
Write-Host "  • API URL: https://manager-api.onrender.com/api"
Write-Host "  • Console Logs: DESABILITADOS"
Write-Host "  • Cache: HABILITADO"
Write-Host "  • Service Worker: HABILITADO"
Write-Host "  • Analytics: DESABILITADO (configurar GA_ID para ativar)"
Write-Host "  • Debug: DESABILITADO"

Write-Host "`n🎯 Para iniciar servidor em produção:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor White

Write-Host "`n💡 Para voltar ao desenvolvimento:" -ForegroundColor Cyan
Write-Host "  Remove-Item Env:\NODE_ENV" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

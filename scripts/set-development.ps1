# Script para configurar ambiente de desenvolvimento
Write-Host "🔧 Configurando ambiente de DESENVOLVIMENTO..." -ForegroundColor Cyan

# Remover variável de produção se existir
Remove-Item Env:\NODE_ENV -ErrorAction SilentlyContinue

Write-Host "✅ NODE_ENV removido (modo desenvolvimento)" -ForegroundColor Green

Write-Host "`n📝 Configurações de Desenvolvimento Ativas:" -ForegroundColor Cyan
Write-Host "  • API URL: http://localhost:3000/api"
Write-Host "  • Console Logs: HABILITADOS"
Write-Host "  • Cache: DESABILITADO"
Write-Host "  • Debug: HABILITADO"
Write-Host "  • Hot Reload: HABILITADO"

Write-Host "`n🎯 Para iniciar servidor:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White

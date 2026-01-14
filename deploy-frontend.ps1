# Script de Deploy do Frontend para GitHub Pages
# PowerShell version

Write-Host "🚀 Iniciando deploy do frontend para GitHub Pages..." -ForegroundColor Cyan

# Criar diretório dist se não existir
if (!(Test-Path -Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Limpar dist
Write-Host "🧹 Limpando diretório dist..." -ForegroundColor Yellow
Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue

# Copiar arquivos públicos
Write-Host "📦 Copiando assets..." -ForegroundColor Green
Copy-Item -Path "src\public\*" -Destination "dist\" -Recurse -Force

# Copiar páginas HTML
Write-Host "📄 Copiando páginas..." -ForegroundColor Green
Copy-Item -Path "src\views\dashboard.html" -Destination "dist\index.html" -Force
Copy-Item -Path "src\views\login.html" -Destination "dist\login.html" -Force
Copy-Item -Path "src\views\cadastro.html" -Destination "dist\cadastro.html" -Force

# Copiar CNAME
Write-Host "🌐 Configurando CNAME..." -ForegroundColor Green
Copy-Item -Path "CNAME" -Destination "dist\CNAME" -Force

# Criar arquivo .nojekyll
New-Item -Path "dist\.nojekyll" -ItemType File -Force | Out-Null

# Verificar se ferramentas de minificação estão instaladas
$hasCleanCss = Get-Command cleancss -ErrorAction SilentlyContinue
$hasTerser = Get-Command terser -ErrorAction SilentlyContinue

if ($hasCleanCss -and $hasTerser) {
    Write-Host "⚡ Minificando assets..." -ForegroundColor Magenta
    
    # Minificar CSS
    Get-ChildItem -Path "dist\css\*.css" -Exclude "*.min.css" | ForEach-Object {
        $outputFile = $_.FullName -replace '\.css$', '.min.css'
        cleancss -o $outputFile $_.FullName
        Write-Host "✅ Minificado: $($_.Name)" -ForegroundColor Green
    }
    
    # Minificar JS
    Get-ChildItem -Path "dist\js\*.js" -Exclude "*.min.js" | ForEach-Object {
        $outputFile = $_.FullName -replace '\.js$', '.min.js'
        terser $_.FullName -o $outputFile -c -m
        Write-Host "✅ Minificado: $($_.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ clean-css-cli ou terser não instalados. Pulando minificação." -ForegroundColor Yellow
    Write-Host "   Instale com: npm install -g clean-css-cli terser" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Build concluído! Arquivos em .\dist" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Para fazer deploy:" -ForegroundColor Cyan
Write-Host "   1. Commit e push para main:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "      git commit -m 'Deploy frontend'" -ForegroundColor Gray
Write-Host "      git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Ou use GitHub CLI:" -ForegroundColor White
Write-Host "      gh workflow run deploy-pages.yml" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Seu site estará disponível em: https://admin.avila.inc" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: Configure o DNS A/CNAME no seu provedor:" -ForegroundColor Yellow
Write-Host "   CNAME: admin -> avilaops.github.io" -ForegroundColor Gray

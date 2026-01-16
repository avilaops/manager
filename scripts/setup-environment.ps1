# Script de Configuração Rápida - GitHub e Render
# Para Windows PowerShell

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║    Configuração Automática - Avila Dashboard v2.1.0     ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Função para exibir mensagens coloridas
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n$Message`n" -ForegroundColor Cyan -BackgroundColor Black
}

# Verificar Node.js
Write-Header "🔍 Verificando Pré-requisitos"

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Success "Node.js instalado: $nodeVersion"
} else {
    Write-Error "Node.js não encontrado!"
    Write-Info "Baixe em: https://nodejs.org"
    exit 1
}

$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Success "NPM instalado: v$npmVersion"
} else {
    Write-Error "NPM não encontrado!"
    exit 1
}

$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Success "Git instalado: $gitVersion"
} else {
    Write-Warning "Git não encontrado! Recomendado para deploy."
}

# Verificar arquivo .env
Write-Header "📁 Verificando Arquivos de Configuração"

if (Test-Path ".env") {
    Write-Success "Arquivo .env encontrado"
    $createNew = Read-Host "`nDeseja criar um novo .env a partir do .env.example? (s/n)"
    
    if ($createNew -eq 's' -or $createNew -eq 'S') {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env" -Force
            Write-Success "Novo arquivo .env criado!"
        } else {
            Write-Error ".env.example não encontrado!"
        }
    }
} else {
    Write-Warning "Arquivo .env não encontrado!"
    
    if (Test-Path ".env.example") {
        $create = Read-Host "Deseja criar a partir do .env.example? (s/n)"
        
        if ($create -eq 's' -or $create -eq 'S') {
            Copy-Item ".env.example" ".env"
            Write-Success "Arquivo .env criado!"
        } else {
            Write-Error "Não é possível continuar sem o arquivo .env"
            exit 1
        }
    } else {
        Write-Error ".env.example não encontrado!"
        exit 1
    }
}

# Configurar GitHub
Write-Header "🔧 Configuração do GitHub"

$setupGithub = Read-Host "Deseja configurar o GitHub agora? (s/n)"

if ($setupGithub -eq 's' -or $setupGithub -eq 'S') {
    Write-Info "`nPara obter seu token:"
    Write-Host "1. Acesse: https://github.com/settings/tokens"
    Write-Host "2. Clique em 'Generate new token (classic)'"
    Write-Host "3. Selecione scopes: repo, workflow, user, gist"
    Write-Host "4. Copie o token`n"
    
    $githubUsername = Read-Host "Digite seu username do GitHub"
    $githubToken = Read-Host "Cole seu token do GitHub (ghp_...)"
    
    if ($githubUsername -and $githubToken) {
        # Atualizar .env
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace 'GITHUB_USERNAME=.*', "GITHUB_USERNAME=$githubUsername"
        $envContent = $envContent -replace 'GITHUB_TOKEN=.*', "GITHUB_TOKEN=$githubToken"
        Set-Content ".env" $envContent -NoNewline
        
        Write-Success "Configuração do GitHub salva!"
    } else {
        Write-Warning "Username ou token não fornecidos. Pulando..."
    }
}

# Configurar MongoDB
Write-Header "🗄️  Configuração do MongoDB Atlas"

$setupMongo = Read-Host "Deseja configurar o MongoDB agora? (s/n)"

if ($setupMongo -eq 's' -or $setupMongo -eq 'S') {
    Write-Info "`nPara obter sua connection string:"
    Write-Host "1. Acesse: https://cloud.mongodb.com"
    Write-Host "2. Vá em Database → Connect → Drivers"
    Write-Host "3. Copie a connection string`n"
    
    $mongoUri = Read-Host "Cole sua MongoDB URI"
    
    if ($mongoUri) {
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace 'MONGO_ATLAS_URI=.*', "MONGO_ATLAS_URI=$mongoUri"
        Set-Content ".env" $envContent -NoNewline
        
        Write-Success "Configuração do MongoDB salva!"
    } else {
        Write-Warning "URI não fornecida. Pulando..."
    }
}

# Gerar secrets
Write-Header "🔐 Gerando Secrets de Segurança"

function New-Secret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [BitConverter]::ToString($bytes) -replace '-', ''
}

$jwtSecret = New-Secret
$sessionSecret = New-Secret

$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
$envContent = $envContent -replace 'SESSION_SECRET=.*', "SESSION_SECRET=$sessionSecret"
Set-Content ".env" $envContent -NoNewline

Write-Success "Secrets gerados e salvos!"
Write-Info "JWT_SECRET: $($jwtSecret.Substring(0, 16))..."
Write-Info "SESSION_SECRET: $($sessionSecret.Substring(0, 16))..."

# Instalar dependências
Write-Header "📦 Dependências do Projeto"

if (Test-Path "node_modules") {
    Write-Success "Dependências já instaladas"
    $reinstall = Read-Host "Deseja reinstalar? (s/n)"
    
    if ($reinstall -eq 's' -or $reinstall -eq 'S') {
        Write-Info "Removendo node_modules..."
        Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
        
        Write-Info "Instalando dependências... (isso pode demorar)"
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependências instaladas com sucesso!"
        } else {
            Write-Error "Erro ao instalar dependências!"
        }
    }
} else {
    Write-Warning "Dependências não instaladas"
    $install = Read-Host "Deseja instalar agora? (s/n)"
    
    if ($install -eq 's' -or $install -eq 'S') {
        Write-Info "Instalando dependências... (isso pode demorar)"
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependências instaladas com sucesso!"
        } else {
            Write-Error "Erro ao instalar dependências!"
        }
    }
}

# Resumo
Write-Header "📋 Status das Configurações"

function Test-EnvVariable {
    param([string]$Key)
    $envContent = Get-Content ".env" -Raw
    $match = [regex]::Match($envContent, "$Key=(.+)")
    if ($match.Success) {
        $value = $match.Groups[1].Value.Trim()
        return ($value -and $value -notlike '*seu_*' -and $value -notlike '*your_*')
    }
    return $false
}

Write-Host "`n╔════════════════════════════════════════╗"
Write-Host "║      Status das Configurações         ║"
Write-Host "╚════════════════════════════════════════╝`n"

$configs = @(
    @{Name="GitHub"; Key="GITHUB_TOKEN"},
    @{Name="MongoDB"; Key="MONGO_ATLAS_URI"},
    @{Name="OpenAI"; Key="OPENAI_API_KEY"},
    @{Name="JWT Secret"; Key="JWT_SECRET"},
    @{Name="Stripe"; Key="STRIPE_API_TOKEN"},
    @{Name="LinkedIn"; Key="LINKEDIN_ACCESS_TOKEN"}
)

foreach ($config in $configs) {
    $name = $config.Name.PadRight(15)
    $status = if (Test-EnvVariable $config.Key) {
        Write-Host "$name " -NoNewline
        Write-Host "✓ Configurado" -ForegroundColor Green
    } else {
        Write-Host "$name " -NoNewline
        Write-Host "✗ Não configurado" -ForegroundColor Red
    }
}

# Próximos passos
Write-Header "🚀 Próximos Passos"

Write-Host "1. Revisar o arquivo .env e preencher variáveis faltantes"
Write-Host "2. Ler a documentação:"
Write-Host "   - docs\SETUP-GITHUB.md"
Write-Host "   - docs\SETUP-RENDER.md"
Write-Host "   - docs\QUICKSTART.md"
Write-Host "3. Iniciar o servidor em desenvolvimento:"
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "4. Testar health check:"
Write-Host "   curl http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "5. Fazer deploy no Render:"
Write-Host "   - Criar conta em https://render.com"
Write-Host "   - Conectar repositório GitHub"
Write-Host "   - Adicionar variáveis de ambiente"
Write-Host "   - Deploy automático!"
Write-Host "`n"

Write-Success "Configuração concluída! 🎉`n"

# Perguntar se quer iniciar o servidor
$startServer = Read-Host "Deseja iniciar o servidor agora? (s/n)"

if ($startServer -eq 's' -or $startServer -eq 'S') {
    Write-Info "Iniciando servidor em modo desenvolvimento...`n"
    npm run dev
}

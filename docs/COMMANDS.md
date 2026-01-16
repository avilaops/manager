# 📋 Comandos Prontos - Copy & Paste

Este arquivo contém todos os comandos necessários, prontos para copiar e colar!

---

## 🚀 SETUP INICIAL

### Windows (PowerShell)
```powershell
# 1. Setup automatizado
npm run setup:win

# 2. Iniciar servidor
npm run dev

# 3. Testar (em outro terminal)
curl http://localhost:3000/health
```

### Linux/Mac/Cross-platform
```bash
# 1. Setup automatizado
npm run setup

# 2. Iniciar servidor
npm run dev

# 3. Testar (em outro terminal)
curl http://localhost:3000/health
```

---

## 🔑 OBTER CREDENCIAIS

### GitHub Token

```bash
# Abrir página de tokens
# Windows:
start https://github.com/settings/tokens

# Linux:
xdg-open https://github.com/settings/tokens

# Mac:
open https://github.com/settings/tokens
```

Depois:
1. Generate new token (classic)
2. Selecione: `repo`, `workflow`, `user`, `gist`
3. Copie o token: `ghp_...`

### MongoDB Atlas

```bash
# Abrir MongoDB Atlas
# Windows:
start https://cloud.mongodb.com

# Linux:
xdg-open https://cloud.mongodb.com

# Mac:
open https://cloud.mongodb.com
```

Depois:
1. Database → Connect → Drivers
2. Copie a connection string: `mongodb+srv://...`

---

## 📁 GIT - CONFIGURAÇÃO

### Primeiro Repositório

```bash
# Inicializar Git
git init

# Adicionar remote (substitua SEU_USUARIO e REPO)
git remote add origin https://github.com/SEU_USUARIO/REPO.git

# Verificar remote
git remote -v

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit - v2.1.0"

# Definir branch principal
git branch -M main

# Push
git push -u origin main
```

### Commits Subsequentes

```bash
# Ver status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: sua mensagem aqui"

# Push (trigger deploy automático no Render)
git push origin main
```

### Criar Repositório no GitHub (via CLI)

```bash
# Instalar GitHub CLI (se não tiver)
# Windows (Chocolatey):
choco install gh

# Windows (Scoop):
scoop install gh

# Mac:
brew install gh

# Linux:
# Ver: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Fazer login
gh auth login

# Criar repositório
gh repo create avila-dashboard-backend --public --source=. --remote=origin --push
```

---

## 🧪 TESTES

### Health Checks

```bash
# Health simples
curl http://localhost:3000/health

# Health detalhado
curl http://localhost:3000/api/health

# Readiness
curl http://localhost:3000/ready

# Liveness
curl http://localhost:3000/alive

# Ping
curl http://localhost:3000/ping
```

### Com jq (formatado)

```bash
# Instalar jq (formatador JSON)
# Windows (Chocolatey):
choco install jq

# Mac:
brew install jq

# Linux:
sudo apt install jq

# Usar:
curl http://localhost:3000/api/health | jq
```

### Status das Configurações

```bash
curl http://localhost:3000/api/config/status | jq
```

### GitHub API

```bash
# Listar repos
curl http://localhost:3000/api/github/repos | jq

# Atividades
curl http://localhost:3000/api/github/activity | jq
```

---

## 🌐 RENDER

### Criar Web Service (Manual)

1. Acesse: https://dashboard.render.com
2. New + → Web Service
3. Conecte GitHub
4. Configurações:
   - **Name:** avila-dashboard-backend
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### Variáveis de Ambiente no Render

Copie e cole (ajuste os valores):

```plaintext
NODE_VERSION=22.22.0
NODE_ENV=production
PORT=10000
RENDER=true

MONGO_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/
GITHUB_USERNAME=seu_usuario
GITHUB_TOKEN=ghp_seu_token
OPENAI_API_KEY=sk-proj-...
STRIPE_API_TOKEN=sk_test_...
JWT_SECRET=gere_com_script_de_setup
SESSION_SECRET=gere_com_script_de_setup
```

### Render CLI

```bash
# Instalar
npm install -g @render/cli

# Login
render login

# Ver serviços
render services

# Ver logs em tempo real
render logs -s avila-dashboard-backend --tail

# Deploy manual
render deploy -s avila-dashboard-backend

# Status
render status -s avila-dashboard-backend
```

---

## 🔐 GERAR SECRETS

### Via Node.js

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Via PowerShell

```powershell
# Função para gerar secret
function New-Secret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [BitConverter]::ToString($bytes) -replace '-', ''
}

# Gerar
New-Secret
```

### Via OpenSSL

```bash
# JWT Secret
openssl rand -hex 32

# Session Secret
openssl rand -hex 32
```

---

## 📦 NPM

### Instalar Dependências

```bash
# Instalar tudo
npm install

# Instalar específica
npm install nome-do-pacote

# Instalar dev dependency
npm install -D nome-do-pacote

# Reinstalar tudo (limpo)
rm -rf node_modules package-lock.json
npm install
```

### Scripts Disponíveis

```bash
# Setup
npm run setup              # Setup Node.js
npm run setup:win          # Setup PowerShell

# Desenvolvimento
npm run dev                # Hot reload
npm run start:dev          # Sem hot reload

# Produção
npm start                  # Modo produção
npm run prod               # Alias

# Build
npm run build              # Compila TS
npm run build:watch        # Compila + watch
npm run build:prod         # Build + minify

# Limpeza
npm run clean              # Limpa dist/
```

---

## 🐛 DEBUG

### Verificar Ambiente

```bash
# Node version
node --version

# NPM version
npm --version

# Git version
git --version

# Verificar .env
cat .env | grep -v "^#" | grep -v "^$"

# Windows:
Get-Content .env | Where-Object {$_ -notmatch "^#" -and $_ -ne ""}
```

### Processos e Portas

```bash
# Ver processo na porta 3000 (Windows)
netstat -ano | findstr :3000

# Matar processo (Windows)
taskkill /PID [PID] /F

# Ver processo na porta 3000 (Linux/Mac)
lsof -i :3000

# Matar processo (Linux/Mac)
kill -9 [PID]
```

### Logs

```bash
# Logs do Node.js
# (aparecem automaticamente no terminal onde rodou npm run dev)

# Logs do MongoDB
# Ver no Atlas: https://cloud.mongodb.com → Logs

# Logs do Render
render logs -s avila-dashboard-backend --tail
# Ou: https://dashboard.render.com → Seu App → Logs
```

### Testar MongoDB

```bash
# Testar conexão (instale mongosh)
mongosh "sua_connection_string_aqui"

# Ver databases
show dbs

# Usar database
use avila-dashboard

# Ver collections
show collections

# Ver documentos
db.sua_collection.find().limit(5)
```

---

## 🌍 DOMÍNIO CUSTOMIZADO

### DNS (Porkbun/Cloudflare)

#### Opção A: CNAME (Subdomínio)

```dns
Type: CNAME
Name: dashboard (ou www, api, etc)
Value: avila-dashboard-backend.onrender.com
TTL: 300
```

#### Opção B: A Record (Domínio raiz)

```dns
Type: A
Name: @
Value: [IP fornecido pelo Render]
TTL: 300
```

### Verificar DNS

```bash
# Windows:
nslookup seu-dominio.com

# Linux/Mac:
dig seu-dominio.com

# Online:
# https://dnschecker.org
```

---

## 🔍 VERIFICAÇÃO DE STATUS

### Local

```bash
# Servidor rodando?
curl http://localhost:3000/health

# Status completo
curl http://localhost:3000/api/health | jq

# MongoDB conectado?
curl http://localhost:3000/api/config/status | jq '.mongodb'

# GitHub configurado?
curl http://localhost:3000/api/config/status | jq '.github'
```

### Produção

```bash
# Substituir pelo seu domínio
curl https://seu-app.onrender.com/health

# Status completo
curl https://seu-app.onrender.com/api/health | jq

# SSL válido?
# Abrir no navegador: https://seu-app.onrender.com
# Deve mostrar cadeado verde
```

### GitHub API

```bash
# Testar token
curl -H "Authorization: token ghp_seu_token" \
     https://api.github.com/user

# Rate limit
curl -H "Authorization: token ghp_seu_token" \
     https://api.github.com/rate_limit
```

---

## 📚 ABRIR DOCUMENTAÇÃO

### VS Code

```bash
# Índice
code docs/README.md

# Quick Start
code docs/QUICKSTART.md

# GitHub
code docs/SETUP-GITHUB.md

# Render
code docs/SETUP-RENDER.md

# Validação
code docs/SETUP-COMPLETE.md

# Resumo
code docs/SUMMARY.md

# Comandos (este arquivo)
code docs/COMMANDS.md
```

### Terminal

```bash
# Linux/Mac
cat docs/QUICKSTART.md | less

# Windows
Get-Content docs\QUICKSTART.md | more
```

### Navegador (Markdown)

```bash
# Instalar grip (GitHub Markdown viewer)
pip install grip

# Ver no navegador
grip docs/QUICKSTART.md
# Abre em: http://localhost:6419
```

---

## 🔄 UPDATES

### Atualizar Dependências

```bash
# Ver outdated
npm outdated

# Atualizar específico
npm update nome-do-pacote

# Atualizar tudo (cuidado!)
npm update

# Instalar versão específica
npm install nome-do-pacote@versao
```

### Pull do Repositório

```bash
# Baixar últimas alterações
git pull origin main

# Resolver conflitos (se houver)
git status
# Edite os arquivos com conflitos
git add .
git commit -m "fix: resolve conflicts"
git push origin main
```

---

## 🧹 LIMPEZA

### Node.js

```bash
# Limpar node_modules
rm -rf node_modules

# Limpar cache do npm
npm cache clean --force

# Reinstalar
npm install
```

### Git

```bash
# Limpar arquivos não rastreados
git clean -fd

# Resetar alterações
git reset --hard HEAD

# Limpar branches locais mescladas
git branch --merged | grep -v "\*" | xargs git branch -d
```

### Build

```bash
# Limpar dist/
npm run clean

# Ou manualmente
rm -rf dist
```

---

## 🚨 EMERGÊNCIA

### Servidor Não Inicia

```bash
# 1. Verificar porta ocupada
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# 2. Matar processo
taskkill /PID [PID] /F        # Windows
kill -9 [PID]                 # Linux/Mac

# 3. Mudar porta
# No .env:
PORT=3001

# 4. Tentar novamente
npm run dev
```

### Deploy Falhou

```bash
# 1. Ver logs
render logs -s avila-dashboard-backend --tail

# 2. Verificar variáveis no Render
# Dashboard → Environment

# 3. Rebuild manual
render deploy -s avila-dashboard-backend --clear

# 4. Verificar render.yaml
cat render.yaml
```

### MongoDB Não Conecta

```bash
# 1. Testar URI
node -e "console.log(process.env.MONGO_ATLAS_URI)"

# 2. Verificar IP whitelist no Atlas
# Cloud.mongodb.com → Network Access
# Adicionar: 0.0.0.0/0 (todos)

# 3. Testar com mongosh
mongosh "sua_uri_aqui"

# 4. Verificar usuário e senha
```

### GitHub API 401

```bash
# 1. Verificar token
echo $env:GITHUB_TOKEN        # Windows
echo $GITHUB_TOKEN            # Linux/Mac

# 2. Testar token
curl -H "Authorization: token ghp_seu_token" \
     https://api.github.com/user

# 3. Se inválido, gerar novo
start https://github.com/settings/tokens

# 4. Atualizar .env
# GITHUB_TOKEN=novo_token_aqui

# 5. Reiniciar servidor
```

---

## ✅ CHECKLIST FINAL

Copie e marque conforme completa:

```
[ ] Node.js 22+ instalado: node --version
[ ] Git instalado: git --version
[ ] npm run setup executado
[ ] .env criado e configurado
[ ] npm run dev funciona
[ ] http://localhost:3000/health → OK
[ ] Repositório GitHub criado
[ ] git push origin main → sucesso
[ ] Conta Render criada
[ ] Web Service configurado
[ ] Deploy bem-sucedido
[ ] https://seu-app.onrender.com/health → OK
```

---

## 🎉 PRONTO!

Agora você tem todos os comandos prontos para usar!

**Próximo passo:**
```bash
npm run setup:win
# ou
npm run setup
```

---

**Autor:** Nicolas Ávila  
**Versão:** 2.1.0  
**Data:** 2024

---

## 📎 Arquivos Relacionados

- [README.md](./README.md) - Índice
- [QUICKSTART.md](./QUICKSTART.md) - Quick Start
- [SETUP-GITHUB.md](./SETUP-GITHUB.md) - GitHub
- [SETUP-RENDER.md](./SETUP-RENDER.md) - Render
- [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) - Validação
- [SUMMARY.md](./SUMMARY.md) - Resumo

# 🔧 Configuração do GitHub - Guia Completo

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado localmente
- Node.js 22+ instalado

## 🔑 1. Gerar Token de Acesso Pessoal (PAT)

### Passo a Passo:

1. **Acesse o GitHub:**
   - Vá para: https://github.com/settings/tokens

2. **Criar Novo Token:**
   - Clique em **"Generate new token"** → **"Generate new token (classic)"**
   
3. **Configurar Permissões:**
   ```
   Nome: Avila Dashboard Token
   Expiração: No expiration (ou escolha um período)
   
   Selecione os seguintes scopes:
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
   ✅ workflow (Update GitHub Action workflows)
   ✅ write:packages
   ✅ delete:packages
   ✅ admin:repo_hook
   ✅ notifications
   ✅ user
      ✅ read:user
      ✅ user:email
   ✅ project
   ✅ gist
   ```

4. **Gerar e Copiar:**
   - Clique em **"Generate token"**
   - **⚠️ IMPORTANTE:** Copie o token imediatamente (não será mostrado novamente!)
   - Token começa com: `ghp_...`

## 🔧 2. Configurar Variáveis de Ambiente

### No seu arquivo `.env` local:

```env
# GitHub Configuration
GITHUB_USERNAME=seu_usuario_github
GITHUB_TOKEN=ghp_seu_token_aqui
```

### Exemplo:
```env
GITHUB_USERNAME=nicolasavila
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

## 🚀 3. Configurar Repositório

### 3.1. Criar Repositório no GitHub

```bash
# Opção 1: Via linha de comando (gh CLI)
gh repo create avila-dashboard-backend --public --source=. --remote=origin

# Opção 2: Via web
# Acesse: https://github.com/new
# Nome: avila-dashboard-backend
# Visibilidade: Public ou Private
# Não inicializar com README (você já tem)
```

### 3.2. Conectar Repositório Local

```bash
# Se ainda não tem git inicializado
git init

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/avila-dashboard-backend.git

# Verificar remote
git remote -v

# Primeiro commit
git add .
git commit -m "Initial commit - v2.1.0"

# Push para GitHub
git branch -M main
git push -u origin main
```

## 🔐 4. Configurar Secrets no GitHub (para CI/CD)

### Para GitHub Actions:

1. Vá para o seu repositório no GitHub
2. Acesse: **Settings → Secrets and variables → Actions**
3. Clique em **"New repository secret"**

### Secrets Necessários:

```plaintext
MONGO_ATLAS_URI
mongodb+srv://usuario:senha@cluster.mongodb.net/

GITHUB_TOKEN
(já configurado automaticamente pelo GitHub)

OPENAI_API_KEY
sk-proj-...

STRIPE_API_TOKEN
sk_test_...

RAILWAY_TOKEN
(se usar Railway)

RENDER_API_KEY
(se usar Render - veja SETUP-RENDER.md)
```

## 🤖 5. Configurar Webhooks (Opcional)

### Para receber notificações de eventos:

1. Vá para: **Settings → Webhooks → Add webhook**

2. Configure:
   ```
   Payload URL: https://seu-dominio.com/api/webhooks/github
   Content type: application/json
   Secret: gere_um_secret_forte_aqui
   
   Eventos:
   ✅ Push
   ✅ Pull request
   ✅ Issues
   ✅ Releases
   ```

3. Adicione o secret no seu `.env`:
   ```env
   GITHUB_WEBHOOK_SECRET=seu_secret_aqui
   ```

## 📊 6. Verificar Integração

### Teste a API do GitHub:

```bash
# Via curl
curl -H "Authorization: token ghp_seu_token" \
     https://api.github.com/user

# Via seu dashboard
# Acesse: http://localhost:3000/api/github/repos
```

### Teste via código:

```javascript
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Listar repos
const { data: repos } = await octokit.repos.listForAuthenticatedUser();
console.log(repos);

// Info do usuário
const { data: user } = await octokit.users.getAuthenticated();
console.log(user);
```

## 🔄 7. Manter Token Seguro

### Boas Práticas:

✅ **NUNCA** commitar o arquivo `.env`
✅ Sempre usar `.env.example` como template
✅ Adicionar `.env` no `.gitignore`
✅ Rotacionar tokens periodicamente
✅ Usar tokens com permissões mínimas necessárias

### Verificar .gitignore:

```gitignore
# Environment
.env
.env.local
.env.*.local

# Secrets
secrets/
*.secret
*.key
*.pem
```

## 🎯 8. Recursos Úteis

### Documentação:
- GitHub API: https://docs.github.com/en/rest
- Octokit.js: https://github.com/octokit/rest.js
- GitHub Actions: https://docs.github.com/en/actions

### Seu Dashboard já tem:
✅ Listagem de repositórios
✅ Atividades recentes
✅ Gerenciamento de issues
✅ Pull requests
✅ Integração com MongoDB para cache

## 🐛 Troubleshooting

### Token não funciona:
```bash
# Verificar token
curl -H "Authorization: token ghp_seu_token" https://api.github.com/user

# Se retornar 401: token inválido ou expirado
# Gere um novo token
```

### Erro de permissão:
- Verifique se os scopes estão corretos
- Reautorize o token se necessário

### Rate limit:
```javascript
// Verificar rate limit
const { data: rateLimit } = await octokit.rateLimit.get();
console.log(rateLimit.rate);
```

## ✅ Checklist Final

- [ ] Token do GitHub gerado com permissões corretas
- [ ] Variáveis no `.env` configuradas
- [ ] Repositório criado no GitHub
- [ ] Remote configurado e primeiro push realizado
- [ ] `.gitignore` protegendo arquivos sensíveis
- [ ] Secrets configurados no GitHub (se usar Actions)
- [ ] API do GitHub testada e funcionando
- [ ] Dashboard acessando dados corretamente

---

## 🚀 Próximos Passos

Agora que o GitHub está configurado, veja:
- [SETUP-RENDER.md](./SETUP-RENDER.md) - Deploy no Render
- [DEPLOY-INSTRUCTIONS.md](./DEPLOY-INSTRUCTIONS.md) - Deploy completo

---

**Autor:** Nicolas Ávila  
**Versão:** 2.1.0  
**Data:** 2024

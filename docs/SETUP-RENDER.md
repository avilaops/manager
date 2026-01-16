# 🚀 Configuração do Render - Guia Completo

## 📋 O que é o Render?

Render é uma plataforma de cloud hosting moderna que oferece:
- Deploy automático via Git
- SSL gratuito
- Escalabilidade automática
- Plano gratuito disponível

## 🎯 Pré-requisitos

- Conta no GitHub (já configurada - veja [SETUP-GITHUB.md](./SETUP-GITHUB.md))
- Repositório no GitHub
- Conta no Render: https://render.com

## 🔧 1. Criar Conta no Render

1. **Acesse:** https://render.com
2. **Cadastre-se:** Clique em "Get Started"
3. **Conecte o GitHub:**
   - Escolha "Sign up with GitHub"
   - Autorize o Render a acessar seus repositórios

## 📦 2. Criar Web Service

### 2.1. Novo Serviço:

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório:
   - Se não aparecer, clique em **"Configure account"**
   - Autorize o repositório `avila-dashboard-backend`

### 2.2. Configurar Serviço:

```yaml
Name: avila-dashboard-backend
Region: Oregon (US West)
Branch: main
Runtime: Node

Build Command: npm install
Start Command: node server.js

Plan: Free (ou escolha um plano pago)
```

## 🔐 3. Configurar Variáveis de Ambiente

### 3.1. Adicionar Environment Variables:

No painel do Render, vá em **"Environment"** e adicione:

```plaintext
# Node Configuration
NODE_VERSION=22.22.0
NODE_ENV=production
PORT=10000

# Render Flag
RENDER=true

# MongoDB
MONGO_ATLAS_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/avila-dashboard

# GitHub
GITHUB_USERNAME=seu_usuario
GITHUB_TOKEN=ghp_seu_token_aqui

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Stripe
STRIPE_API_TOKEN=sk_test_...
STRIPE_API=pk_test_...

# LinkedIn
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_ACCESS_TOKEN=seu_access_token

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app

# Gmail API
GMAIL_USER_1=seu_email@gmail.com
GMAIL_PASS_1=sua_senha_app

# Google Cloud
GCLOUD_API_TOKEN=AIzaSy...
GCLOUD_CLIENT=...apps.googleusercontent.com

# Security
JWT_SECRET=gere_uma_chave_secreta_forte
SESSION_SECRET=outra_chave_secreta_forte

# Railway (se necessário)
RAILWAY_TOKEN=seu_token_railway

# Azure DevOps (se necessário)
AZURE_DEVOPS_API=seu_token_azure

# Sentry (se necessário)
SENTRY_TOKEN_API=sntrys_...
```

### 3.2. Como gerar secrets fortes:

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou use: https://generate-secret.vercel.app/
```

## 📝 4. Configurar render.yaml (já existe!)

Seu arquivo `render.yaml` já está configurado. Vamos atualizá-lo para incluir todas as configurações:

**O arquivo já existe, mas vamos garantir que está completo:**

```yaml
services:
  - type: web
    name: avila-dashboard-backend
    runtime: node
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_VERSION
        value: 22.22.0
      - key: NODE_ENV
        value: production
      - key: RENDER
        value: true
    # Health check
    healthCheckPath: /health
```

## 🌐 5. Configurar Domínio Customizado (Opcional)

### 5.1. Domínio Render Grátis:

Automaticamente: `avila-dashboard-backend.onrender.com`

### 5.2. Domínio Próprio:

1. **No Render:**
   - Vá em **Settings → Custom Domain**
   - Clique em **"Add Custom Domain"**
   - Digite seu domínio: `dashboard.seudominio.com`

2. **No seu provedor DNS (Porkbun/Cloudflare):**

   **Opção A: CNAME (Recomendado para subdomínios)**
   ```
   Type: CNAME
   Name: dashboard
   Value: avila-dashboard-backend.onrender.com
   TTL: 300
   ```

   **Opção B: A Record (Para domínio raiz)**
   ```
   Type: A
   Name: @
   Value: [IP fornecido pelo Render]
   TTL: 300
   ```

3. **SSL/TLS:**
   - O Render gera certificado SSL automaticamente via Let's Encrypt
   - Aguarde alguns minutos para propagação

## 🔄 6. Deploy Automático

### 6.1. Configurar Auto-Deploy:

1. No Render, vá em **Settings → Build & Deploy**
2. Ative **"Auto-Deploy"** para a branch `main`
3. Configurar:
   ```
   Auto-Deploy: Yes
   Branch: main
   ```

### 6.2. Agora sempre que você der push:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

O Render vai:
1. Detectar o push
2. Fazer build automático
3. Fazer deploy
4. Notificar você

## 📊 7. Monitoramento e Logs

### 7.1. Ver Logs em Tempo Real:

```bash
# Via Dashboard Render: Logs tab
# Ou via Render CLI:
npm install -g @render/cli
render logs -s avila-dashboard-backend --tail
```

### 7.2. Métricas:

No dashboard do Render você vê:
- CPU Usage
- Memory Usage
- Request Rate
- Response Time
- Build History

## 🔌 8. Health Check

Adicione uma rota de health check no seu `server.js`:

```javascript
// Health check endpoint para Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '2.1.0'
    });
});
```

## 🎯 9. Otimizações para Render

### 9.1. Adicionar scripts no package.json:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install",
    "render-postbuild": "echo 'Build completed on Render'"
  }
}
```

### 9.2. Configurar Keep-Alive (Free Plan):

No plano gratuito, o serviço "dorme" após 15 minutos de inatividade.

**Solução: Ping automático**

Crie um serviço externo que faz ping a cada 14 minutos:
- Use: https://cron-job.org
- URL: `https://avila-dashboard-backend.onrender.com/health`
- Interval: Every 14 minutes

## 📡 10. Render API (Avançado)

### 10.1. Obter API Key:

1. Acesse: https://dashboard.render.com/account/api-keys
2. Clique em **"Generate New Key"**
3. Copie a key: `rnd_...`

### 10.2. Adicionar ao .env:

```env
RENDER_API_KEY=rnd_seu_key_aqui
```

### 10.3. Usar a API:

```javascript
const axios = require('axios');

const renderApiKey = process.env.RENDER_API_KEY;

// Listar serviços
const response = await axios.get('https://api.render.com/v1/services', {
    headers: {
        'Authorization': `Bearer ${renderApiKey}`
    }
});

// Deploy manual
await axios.post(
    'https://api.render.com/v1/services/srv_xxx/deploys',
    {},
    {
        headers: { 'Authorization': `Bearer ${renderApiKey}` }
    }
);
```

## 🐛 11. Troubleshooting

### Build falhou:

```bash
# Verificar logs
render logs -s avila-dashboard-backend

# Problemas comuns:
# 1. Node version incompatível
#    Solução: Definir NODE_VERSION=22.22.0

# 2. Dependências faltando
#    Solução: npm install localmente e testar

# 3. Variáveis de ambiente faltando
#    Solução: Verificar Environment no dashboard
```

### Serviço não responde:

1. Verifique se o PORT está correto (Render usa 10000)
2. Verifique health check: `/health`
3. Veja logs para erros

### SSL não funciona:

- Aguarde até 24h para propagação DNS
- Verifique se CNAME está correto
- Use: https://dnschecker.org

## 🔒 12. Segurança

### Boas Práticas:

✅ Use HTTPS sempre (Render fornece grátis)
✅ Não exponha informações sensíveis nos logs
✅ Use variáveis de ambiente para secrets
✅ Ative rate limiting (já tem no código)
✅ Use Helmet.js (já configurado)

### Adicionar no código:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requests
});
app.use('/api/', limiter);
```

## ✅ Checklist Final

- [ ] Conta no Render criada e GitHub conectado
- [ ] Web Service criado e configurado
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] `render.yaml` no repositório
- [ ] Auto-Deploy ativado
- [ ] Health check funcionando
- [ ] Domínio customizado configurado (se aplicável)
- [ ] SSL ativo e funcionando
- [ ] Logs acessíveis e sem erros
- [ ] Monitoramento ativo
- [ ] Ping keep-alive configurado (plano free)

## 🚀 Comandos Úteis

```bash
# Instalar Render CLI
npm install -g @render/cli

# Login
render login

# Ver serviços
render services

# Ver logs
render logs -s avila-dashboard-backend --tail

# Deploy manual
render deploy -s avila-dashboard-backend

# Ver status
render status -s avila-dashboard-backend
```

## 📚 Recursos

- Documentação: https://render.com/docs
- Dashboard: https://dashboard.render.com
- Status: https://status.render.com
- Community: https://community.render.com

## 🎉 Próximos Passos

Após configurar o Render:
1. ✅ GitHub configurado → [SETUP-GITHUB.md](./SETUP-GITHUB.md)
2. ✅ Render configurado → Este arquivo
3. ➡️ CI/CD completo → [DEPLOY-INSTRUCTIONS.md](./DEPLOY-INSTRUCTIONS.md)
4. ➡️ Monitoramento → Configure Sentry, Datadog, etc.

---

**Autor:** Nicolas Ávila  
**Versão:** 2.1.0  
**Data:** 2024

## 💡 Dica Final

Para deploy em segundos após cada commit:

```bash
# 1. Faça suas alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 2. Render detecta automaticamente e faz deploy
# 3. Acompanhe em: https://dashboard.render.com

# 4. Teste em produção
curl https://avila-dashboard-backend.onrender.com/health
```

🎯 **Pronto! Seu ambiente Render está configurado!**

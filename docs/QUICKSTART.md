# 🚀 Guia de Início Rápido - Configuração Completa

Este guia vai te ajudar a configurar todo o ambiente GitHub e Render em **menos de 15 minutos**!

## 📋 Checklist Rápida

- [ ] Node.js 22+ instalado
- [ ] Git instalado
- [ ] Conta no GitHub
- [ ] Conta no Render (criar em https://render.com)
- [ ] Conta no MongoDB Atlas (criar em https://cloud.mongodb.com)

---

## ⚡ Setup Rápido (3 passos)

### 1️⃣ Configuração Automática

Execute o script de setup:

```bash
node scripts/setup-environment.mjs
```

Ele vai configurar:
- ✅ Arquivo `.env`
- ✅ Tokens do GitHub
- ✅ MongoDB URI
- ✅ Secrets de segurança
- ✅ Instalar dependências

### 2️⃣ Testar Localmente

```bash
# Iniciar servidor
npm run dev

# Em outro terminal, testar health check
curl http://localhost:3000/health

# Ou abrir no navegador
# http://localhost:3000
```

### 3️⃣ Deploy no Render

```bash
# 1. Commit e push
git add .
git commit -m "Setup complete"
git push origin main

# 2. No Render (https://dashboard.render.com):
#    - New + → Web Service
#    - Conectar repositório
#    - Adicionar variáveis de ambiente do .env
#    - Deploy!
```

---

## 🔑 Obter Credenciais Rápido

### GitHub Token (2 minutos)

```bash
# Abrir no navegador
https://github.com/settings/tokens

# Clique: Generate new token (classic)
# Selecione: repo, workflow, user, gist
# Copie o token: ghp_...
```

### MongoDB Atlas (3 minutos)

```bash
# 1. Criar conta gratuita
https://cloud.mongodb.com/

# 2. Criar cluster (Free tier)
# 3. Database → Connect → Drivers
# 4. Copiar connection string
mongodb+srv://usuario:senha@cluster.mongodb.net/
```

### OpenAI (opcional, 2 minutos)

```bash
https://platform.openai.com/api-keys

# Create new secret key
# Copiar: sk-proj-...
```

---

## 📂 Estrutura do .env

Seu arquivo `.env` deve ter no mínimo:

```env
# ===== ESSENCIAIS =====

# MongoDB (OBRIGATÓRIO)
MONGO_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# GitHub (OBRIGATÓRIO)
GITHUB_USERNAME=seu_usuario
GITHUB_TOKEN=ghp_seu_token

# Security (OBRIGATÓRIO - gerado automaticamente)
JWT_SECRET=secret_gerado_automaticamente
SESSION_SECRET=secret_gerado_automaticamente

# ===== OPCIONAIS =====

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Stripe
STRIPE_API_TOKEN=sk_test_...

# LinkedIn
LINKEDIN_ACCESS_TOKEN=seu_token
```

---

## 🧪 Testar Configuração

### Teste Local Completo:

```bash
# 1. Health Check
curl http://localhost:3000/health

# Resposta esperada:
# {
#   "status": "OK",
#   "message": "Avila Dashboard Backend is running",
#   "version": "2.1.0"
# }

# 2. GitHub API
curl http://localhost:3000/api/github/repos

# 3. Config Status
curl http://localhost:3000/api/config/status
```

### Teste em Produção (Render):

```bash
# Substituir YOUR_APP_NAME pelo nome do seu app
curl https://YOUR_APP_NAME.onrender.com/health
```

---

## 🐛 Problemas Comuns

### ❌ "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### ❌ "MongoDB connection failed"

```bash
# Verificar:
# 1. IP whitelist no MongoDB Atlas (0.0.0.0/0 para permitir todos)
# 2. Usuário e senha corretos na URI
# 3. Nome do banco de dados na URI
```

### ❌ "GitHub API rate limit"

```bash
# Verificar se o token está correto
# Token deve ter o scope "repo"
# Verificar rate limit:
curl -H "Authorization: token ghp_seu_token" https://api.github.com/rate_limit
```

### ❌ Render não inicia

```bash
# Verificar logs no Render:
# Dashboard → Logs

# Problemas comuns:
# 1. Variável PORT não definida (Render usa 10000)
# 2. MONGO_ATLAS_URI não configurada
# 3. Build command incorreto
```

---

## 📚 Documentação Completa

Para configuração detalhada, consulte:

| Documento | Descrição |
|-----------|-----------|
| [SETUP-GITHUB.md](./SETUP-GITHUB.md) | Configuração completa do GitHub |
| [SETUP-RENDER.md](./SETUP-RENDER.md) | Deploy e configuração do Render |
| [DEPLOY-INSTRUCTIONS.md](./DEPLOY-INSTRUCTIONS.md) | Instruções gerais de deploy |

---

## 🎯 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar com nodemon
npm run start:dev        # Iniciar sem nodemon

# Produção
npm start                # Iniciar em produção
npm run prod             # Alias para npm start

# Git
git status               # Ver alterações
git add .                # Adicionar tudo
git commit -m "msg"      # Commit
git push origin main     # Push para GitHub (trigger deploy)

# Health Checks
curl http://localhost:3000/health        # Health simples
curl http://localhost:3000/api/health    # Health detalhado
curl http://localhost:3000/ready         # Readiness check
curl http://localhost:3000/alive         # Liveness check
curl http://localhost:3000/ping          # Ping

# Logs (Render)
render logs -s avila-dashboard-backend --tail
```

---

## 🔄 Workflow de Desenvolvimento

```mermaid
graph LR
    A[Desenvolver] --> B[Testar Local]
    B --> C[Commit]
    C --> D[Push GitHub]
    D --> E[Render Deploy]
    E --> F[Testar Produção]
```

### Passo a passo:

1. **Desenvolver** - Fazer alterações no código
   ```bash
   npm run dev
   # Testar em http://localhost:3000
   ```

2. **Testar** - Verificar se funciona
   ```bash
   curl http://localhost:3000/health
   ```

3. **Commit** - Salvar alterações
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   ```

4. **Push** - Enviar para GitHub
   ```bash
   git push origin main
   ```

5. **Deploy** - Render detecta e faz deploy automático
   - Acompanhe em: https://dashboard.render.com

6. **Verificar** - Testar em produção
   ```bash
   curl https://seu-app.onrender.com/health
   ```

---

## ✅ Validação Final

Antes de considerar concluído, verifique:

### Local:
- [ ] `npm run dev` inicia sem erros
- [ ] `/health` retorna status OK
- [ ] `/api/github/repos` lista repositórios
- [ ] Dashboard acessível em http://localhost:3000

### GitHub:
- [ ] Repositório criado
- [ ] Código commitado
- [ ] `.gitignore` protegendo `.env`
- [ ] README.md atualizado

### Render:
- [ ] Web Service criado
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] URL pública funcionando
- [ ] SSL ativo (https://)

---

## 🆘 Precisa de Ajuda?

1. **Documentação Completa:**
   - `docs/SETUP-GITHUB.md`
   - `docs/SETUP-RENDER.md`

2. **Logs:**
   ```bash
   # Local
   npm run dev
   
   # Render
   render logs -s seu-app --tail
   ```

3. **Health Check Debug:**
   ```bash
   curl http://localhost:3000/api/health | json_pp
   ```

4. **Verificar .env:**
   ```bash
   cat .env | grep -v "^#" | grep -v "^$"
   ```

---

## 🎉 Próximos Passos

Após configurar tudo:

1. ✅ **Personalizar** - Adicionar suas features
2. ✅ **Monitorar** - Configurar Sentry, Datadog, etc.
3. ✅ **Escalar** - Upgrade no Render quando necessário
4. ✅ **Automatizar** - Adicionar GitHub Actions para CI/CD
5. ✅ **Documentar** - Manter README.md atualizado

---

## 🚀 Está Pronto!

Se todos os checks acima passaram, seu ambiente está **100% configurado**!

```bash
# Teste final
curl https://seu-app.onrender.com/health

# Resposta esperada:
# {
#   "status": "OK",
#   "message": "Avila Dashboard Backend is running",
#   "version": "2.1.0",
#   "environment": "production"
# }
```

**Parabéns! 🎊 Agora é só desenvolver!**

---

**Autor:** Nicolas Ávila  
**Versão:** 2.1.0  
**Última Atualização:** 2024

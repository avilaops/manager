# 🚀 Modo de Produção - Guia de Uso

## 📋 O que foi configurado

O projeto agora possui sistema completo de configuração de ambiente que detecta automaticamente se está em produção ou desenvolvimento.

### ✅ Arquivos Criados

- `src/config/production.config.js` - Configurações do backend
- `src/public/js/env.config.js` - Configurações do frontend
- `src/public/js/logger.js` - Sistema de logging condicional
- `scripts/set-production.ps1` - Script para ativar modo produção
- `scripts/set-development.ps1` - Script para ativar modo desenvolvimento

### 🔧 Configurações Aplicadas

#### Em Produção (admin.avila.inc):
- ✅ API URL: `https://manager-api.onrender.com/api`
- ✅ Console logs: **DESABILITADOS** (apenas erros críticos)
- ✅ Cache: **HABILITADO** (1 ano)
- ✅ Service Worker: **HABILITADO**
- ✅ Compressão: **HABILITADA**
- ✅ Rate Limiting: **HABILITADO** (100 req/15min)
- ✅ Security Headers: **HABILITADOS**
- ✅ Versão de cache: **v5**
- ❌ Debug mode: **DESABILITADO**
- ❌ Analytics: **DESABILITADO** (até configurar GA_ID)

#### Em Desenvolvimento (localhost):
- ✅ API URL: `http://localhost:3000/api`
- ✅ Console logs: **TODOS HABILITADOS**
- ✅ Cache: **DESABILITADO**
- ✅ Debug mode: **HABILITADO**
- ✅ Hot reload: **HABILITADO**
- ✅ Rate Limiting: **RELAXADO** (1000 req/15min)

## 🎯 Como Usar

### Opção 1: Configuração Manual (Recomendado)

```powershell
# Ativar modo PRODUÇÃO
npm run prod:config
npm start

# Ativar modo DESENVOLVIMENTO
npm run dev:config
npm run dev
```

### Opção 2: Variável de Ambiente

```powershell
# Windows PowerShell
$env:NODE_ENV = "production"
npm start

# Remover
Remove-Item Env:\NODE_ENV
```

### Opção 3: NPM Script Direto

```bash
# Produção
npm run prod

# Desenvolvimento
npm run dev
```

## 🌐 Detecção Automática

O sistema detecta automaticamente o ambiente:

**Frontend:**
- `localhost` ou `127.0.0.1` = Desenvolvimento
- Qualquer outro domínio = Produção

**Backend:**
- `NODE_ENV=production` = Produção
- `RENDER=true` (Render.com) = Produção
- Sem variável = Desenvolvimento

## 📝 Logging em Produção

O sistema de logging está otimizado:

```javascript
// Desenvolvimento: mostra tudo
log.log('Info message');        // ✅ Visível
log.debug('Debug info');        // ✅ Visível
log.warn('Warning');            // ✅ Visível
log.error('Error');             // ✅ Visível

// Produção: apenas erros críticos
log.log('Info message');        // ❌ Silenciado
log.debug('Debug info');        // ❌ Silenciado
log.warn('Warning');            // ❌ Silenciado
log.error('Error');             // ✅ Visível (sanitizado)
```

## 🔐 Segurança em Produção

Quando em produção:
- ✅ CORS restrito aos domínios permitidos
- ✅ Helmet headers de segurança
- ✅ Rate limiting ativo
- ✅ Timeouts reduzidos (30s)
- ✅ Logs sanitizados
- ✅ Console logs desabilitados

## 📊 Analytics

Para ativar Google Analytics:

1. Obtenha seu ID do Google Analytics (formato: `G-XXXXXXXXX`)
2. Edite `src/views/dashboard.html`:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-SEU-ID-AQUI';
   ```
3. Edite `src/public/js/env.config.js`:
   ```javascript
   ENABLE_ANALYTICS: true,
   ```

## 🚀 Deploy

### Render.com (Atual)

O Render.com já define `RENDER=true`, então o modo produção é **automático**.

### Outras Plataformas

Certifique-se de definir:
```bash
NODE_ENV=production
```

## ✅ Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Testar localmente com `npm run prod`
- [ ] Verificar se todas URLs estão corretas
- [ ] Confirmar que console.logs não aparecem
- [ ] Testar autenticação
- [ ] Verificar Service Worker
- [ ] Testar em mobile
- [ ] Validar CORS
- [ ] Confirmar rate limiting

## 🔄 Versão de Cache

Sempre que fizer alterações nos arquivos estáticos:

1. Incrementar versão em `env.config.js`:
   ```javascript
   CACHE_VERSION: 'v6', // Era v5
   ```

2. Atualizar referências no HTML:
   ```html
   <script src="/js/dashboard.js?v=6"></script>
   ```

## 🐛 Troubleshooting

### Console logs ainda aparecem
- Verificar se `NODE_ENV=production`
- Limpar cache do navegador
- Verificar se está usando os arquivos de `src/`

### API não conecta
- Verificar URL em `env.config.js`
- Conferir CORS no backend
- Testar endpoint diretamente

### Service Worker não atualiza
- Incrementar versão de cache
- Forçar atualização: `Ctrl+Shift+R`
- Limpar Service Workers no DevTools

## 📚 Mais Informações

- Logs de produção: Apenas erros críticos são exibidos
- Performance: Cache agressivo em produção
- Segurança: Headers e CORS configurados
- Monitoramento: Logs de erro podem ser enviados para Sentry (futuro)

---

**Status Atual:** ✅ Configurado e pronto para produção
**Versão:** 2.1.0
**Última atualização:** 15/01/2026

# 🚀 Deploy do Frontend - GitHub Pages

## ✅ Deploy Configurado com Sucesso!

### 📦 O que foi criado:

1. **CNAME** → `admin.avila.inc`
2. **GitHub Actions Workflow** → `.github/workflows/deploy-pages.yml`
3. **Scripts de Deploy:**
   - `deploy-frontend.ps1` (Windows PowerShell)
   - `deploy-frontend.sh` (Linux/Mac Bash)

### 🌐 URLs:
- **Produção:** https://admin.avila.inc
- **GitHub Pages:** https://avilaops.github.io/manager

---

## 📋 Próximos Passos

### 1. Configurar GitHub Pages no Repositório

Acesse: https://github.com/avilaops/manager/settings/pages

Configure:
- ✅ **Source:** GitHub Actions
- ✅ **Branch:** main (será feito automaticamente pelo workflow)

### 2. Configurar DNS no Provedor (Cloudflare, GoDaddy, etc.)

Adicione registro CNAME:
```
Type: CNAME
Name: admin
Value: avilaops.github.io
TTL: Auto ou 3600
```

**OU** configure A records (se preferir):
```
Type: A
Name: admin
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 3. Aguardar Propagação DNS (10-60 minutos)

Verifique se propagou:
```bash
nslookup admin.avila.inc
# Deve retornar o IP do GitHub Pages
```

---

## 🔄 Como Funciona o Deploy Automático

Toda vez que você der **push na branch main**, o GitHub Actions:

1. ✅ Faz checkout do código
2. ✅ Instala dependências
3. ✅ Copia arquivos do frontend para `dist/`
4. ✅ Adiciona CNAME
5. ✅ Faz deploy no GitHub Pages

**Tempo estimado:** 1-2 minutos

---

## 🛠️ Deploy Manual (Se Necessário)

### Opção 1: Executar Script Local
```powershell
# Windows
.\deploy-frontend.ps1

# Depois:
git add dist/
git commit -m "Deploy frontend"
git push origin main
```

### Opção 2: Disparar Workflow Manualmente
```bash
gh workflow run deploy-pages.yml
```

Ou acesse: https://github.com/avilaops/manager/actions

---

## 📊 Status do Deploy

### ✅ Arquivos Incluídos no Deploy:
- `dist/index.html` ← dashboard.html
- `dist/login.html`
- `dist/cadastro.html`
- `dist/css/*` ← Todos os estilos
- `dist/js/*` ← Todo o JavaScript
- `dist/service-worker.js` ← PWA
- `dist/manifest.json` ← PWA Config
- `dist/CNAME` ← admin.avila.inc

### 🎨 Features Incluídas:
- ✅ Dark Mode
- ✅ PWA (funciona offline)
- ✅ Service Worker
- ✅ Lazy Loading
- ✅ Cache otimizado
- ✅ Links seguros (noopener noreferrer)
- ✅ Google Analytics pronto

---

## 🔍 Verificar Deploy

Após configurar DNS e aguardar propagação:

```bash
# Testar conectividade
curl -I https://admin.avila.inc

# Verificar CNAME
curl https://admin.avila.inc/CNAME
# Deve retornar: admin.avila.inc
```

---

## 🐛 Troubleshooting

### Erro: 404 Not Found
**Solução:** Aguarde 2-3 minutos após o workflow terminar

### Erro: DNS_PROBE_FINISHED_NXDOMAIN
**Solução:** 
1. Verifique se configurou o CNAME no DNS
2. Aguarde propagação (pode levar até 24h, mas geralmente 10-60min)
3. Limpe cache DNS: `ipconfig /flushdns`

### Erro: HTTPS não funciona
**Solução:**
1. GitHub Pages ativa HTTPS automaticamente
2. Aguarde até 24h após configurar custom domain
3. Force HTTPS nas configurações do Pages

### Workflow falha
**Solução:**
1. Verifique se permissões estão corretas em Settings → Actions → General
2. Habilite: "Read and write permissions"
3. Re-execute o workflow

---

## 📞 Próximos Comandos Úteis

```bash
# Ver status do workflow
gh workflow view deploy-pages.yml

# Ver runs recentes
gh run list --workflow=deploy-pages.yml

# Ver logs do último run
gh run view

# Disparar manualmente
gh workflow run deploy-pages.yml
```

---

## 🎉 Pronto!

Seu frontend está configurado para deploy automático em:
**https://admin.avila.inc**

Toda alteração em `main` dispara deploy automático! 🚀

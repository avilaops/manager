# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.1.0] - 2025-01-27

### ♻️ Refatoração
- **Reestruturação completa do repositório** - Organização melhorada da estrutura de pastas
  - Criada pasta `public/` na raiz para arquivos estáticos servidos
  - Criada pasta `public/css/` para estilos
  - Criada pasta `public/js/` para scripts do cliente
  - Criada pasta `public/html/` para páginas HTML
  - Consolidada documentação em `docs/`

### 📦 Movimentação de Arquivos
- `dashboard.css` → `public/css/dashboard.css`
- `dashboard.js` → `public/js/dashboard.js`
- `index.html` → `public/html/index.html`
- `mongo-explorer.html` → `public/html/mongo-explorer.html`
- `DEPLOY-INSTRUCTIONS.md` → `docs/DEPLOY-INSTRUCTIONS.md`
- `IMPROVEMENTS.md` → `docs/IMPROVEMENTS.md`
- `MELHORIAS.md` → `docs/MELHORIAS.md`
- `README.mdgit` → `docs/README.mdgit`

### 🗑️ Removido
- Executáveis temporários (`ngrok.exe`, `ngrok.zip`)
- Scripts de teste obsoletos (`test-campanhas.js`, `playground-1.mongodb.js`)
- Scripts de manutenção não utilizados (`delete_databases.cjs`, `deploy-frontend.sh`)
- Arquivos duplicados e temporários

### 🔧 Alterado
- Atualizado `src/server.ts` para servir arquivos da nova estrutura `public/`
- Atualizado rotas para servir `cadastro.html` e `dashboard.html` do root
- Atualizado `.gitignore` com novos padrões de exclusão
- Atualizada documentação no `README.md` para refletir nova estrutura

### 📝 Documentação
- Adicionado seção "Novidades da Versão 2.1.0" no README
- Documentada nova estrutura de diretórios
- Criado CHANGELOG.md

## [2.0.0] - 2025-01-26

### 🚀 Adicionado
- Configuração Render.com (`render.yaml`)
- Suporte a TypeScript completo
- Build automatizado com compilação TypeScript
- Script de cópia de arquivos `.js` e `.cjs` para dist

### 🐛 Corrigido
- Erros de compilação TypeScript em `campanhas.service.ts`
- Conflitos ESM/CommonJS (renomeado `tokens.routes.js` → `tokens.routes.cjs`)
- IDs HTML duplicados no dashboard
- Problemas de acessibilidade (aria-labels, alt text)
- Redirecionamento de botões "Adicionar Cliente" para `cadastro.html`

### 🔒 Segurança
- Configuração adequada de variáveis de ambiente (`.env`)
- Adicionado carregamento de `dotenv` no servidor

## [1.0.0] - 2025-01-25

### 🎉 Lançamento Inicial
- Sistema de gerenciamento pessoal integrado
- Dashboard com CRM, Gmail, LinkedIn
- Integração com MongoDB
- Sistema de autenticação
- Suporte a múltiplos serviços (Calendar, Campanhas, E-Reader, etc.)

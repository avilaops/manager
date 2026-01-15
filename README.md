# Gerenciador Pessoal - Avila Dashboard v2.1.0

Sistema unificado de gerenciamento pessoal com integração completa de dados, CRM, Gmail, LinkedIn e muito mais.

## 📁 Estrutura do Projeto (v2.1.0 - Reorganizada)

```
manager/
├── src/                          # Código fonte TypeScript
│   ├── server.ts                # Servidor principal
│   ├── views/                   # Templates HTML
│   ├── routes/                  # Rotas da API
│   ├── services/                # Serviços de integração
│   ├── middleware/              # Middlewares Express
│   ├── config/                  # Configurações
│   ├── utils/                   # Utilitários
│   ├── types/                   # Definições TypeScript
│   ├── components/              # Componentes reutilizáveis
│   └── public/                  # Assets do frontend
│       ├── css/                 # Estilos
│       ├── js/                  # Scripts cliente
│       └── assets/              # Imagens, ícones
├── public/                      # Arquivos estáticos servidos
│   ├── html/                    # Páginas HTML públicas
│   ├── css/                     # CSS compilados
│   └── js/                      # JavaScript compilados
├── dist/                        # Build TypeScript (gitignored)
├── docs/                        # Documentação
│   ├── DEPLOY-INSTRUCTIONS.md
│   ├── IMPROVEMENTS.md
│   └── WHITE_LABEL_SYSTEM.md
├── tests/                       # Testes
├── data/                        # Dados e uploads
│   └── uploads/
├── contacts/                    # Scripts de contatos
├── package.json                 # Dependências
├── tsconfig.json                # Config TypeScript
├── render.yaml                  # Config Render.com
└── README.md                    # Este arquivo
```

## ✨ Novidades da Versão 2.1.0

### 🔄 Reestruturação Completa do Repositório
- **Reorganização de arquivos estáticos**: Criação da pasta `public/` na raiz para melhor separação de assets
- **Consolidação de documentação**: Toda documentação movida para `docs/`
- **Limpeza de arquivos temporários**: Remoção de executáveis, testes obsoletos e arquivos não necessários
- **Estrutura mais clara**: Separação lógica entre código fonte (`src/`) e arquivos servidos (`public/`)

### 📦 Arquivos Movidos
- `dashboard.css` → `public/css/`
- `dashboard.js` → `public/js/`
- `index.html` → `public/html/`
- `mongo-explorer.html` → `public/html/`
- Documentação → `docs/`

### 🗑️ Limpeza Realizada
- Remoção de executáveis (ngrok.exe, ngrok.zip)
- Remoção de scripts de teste obsoletos
- Remoção de arquivos temporários e duplicados

## 🚀 Funcionalidades

### Core Features
- **Dashboard Unificado**: Interface centralizada para todos os módulos
- **CRM Completo**: Gestão de 8000+ contatos consolidados
- **Integração Gmail**: Sincronização automática de emails e contatos
- **Sistema de Backup**: Salvamento automático e exportação de dados
- **Calendário Integrado**: Agendamento com Windows Task Scheduler
- **📚 E-Reader & Biblioteca**: Sistema completo de leitura com meta diária
- **📔 Diário Pessoal**: Espaço privado para reflexões e desabafos

### Módulos Especializados
- **Biblioteca Digital**: 2 livros disponíveis com leitor PDF integrado
- **Sistema de Leitura**: Meta de 10 páginas/dia com progresso visual
- **Perguntas Reflexivas**: 18 perguntas estratégicas sobre os livros
- **Diário Pessoal**: Registro de pensamentos com seleção de humor
- **LinkedIn Automation**: Automação de networking e engajamento
- **GitHub Integration**: Gerenciamento de repositórios e issues
- **MongoDB Atlas**: Banco de dados na nuvem com alta disponibilidade
- **Google APIs**: Integração com Gmail, People API, OAuth2

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- MongoDB Atlas account
- Google Cloud Console (para Gmail API)
- Git

### Instalação Rápida

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd gerenciador-pessoal
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

4. **Inicie o servidor:**
   ```bash
   npm start
   ```

5. **Acesse o dashboard:**
   - Dashboard Principal: http://localhost:3000
   - Calendário: http://localhost:3000/index.html
   - Cadastro: http://localhost:3000/cadastro.html

## 📊 API Endpoints

### Backup e Exportação
- `POST /api/backup/completo` - Backup completo de todos os dados
- `GET /api/export/contatos/csv` - Exportar contatos para CSV
- `GET /api/export/emails/json` - Exportar emails para JSON
- `GET /api/health/data` - Verificar integridade dos dados

### E-Reader e Diário
- `POST /api/ereader/salvar` - Salvar progresso de leitura e diário
- `GET /api/ereader/carregar` - Carregar dados salvos
- `GET /api/ereader/estatisticas` - Estatísticas de leitura
- `GET /api/ereader/exportar-diario` - Exportar diário em TXT

### CRM
- `GET /api/crm/contacts` - Listar todos os contatos (8098 registros)
- `POST /api/crm/contacts` - Adicionar novo contato
- `PUT /api/crm/contacts/:id` - Atualizar contato
- `DELETE /api/crm/contacts/:id` - Remover contato

### Gmail Integration
- `GET /api/gmail/auth` - Iniciar autenticação OAuth2
- `GET /api/gmail/auth/callback` - Callback de autenticação
- `POST /api/gmail/sync-emails` - Sincronizar emails
- `GET /api/gmail/contacts` - Buscar contatos do Gmail

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# Gmail API
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/auth/callback

# CRM Database
CRM_DB_NAME=avila_crm
GMAIL_DB_NAME=avila_gmail

# GitHub (opcional)
GITHUB_TOKEN=github_pat_...
GITHUB_USERNAME=your_username

# LinkedIn (opcional)
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_CLIENT_ID=...
```

### Google Cloud Console Setup

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative as APIs: Gmail API, People API
4. Crie credenciais OAuth2
5. Configure os URIs autorizados

## 📈 Dados e Estatísticas

- **Contatos**: 8,098 registros consolidados
- **Emails**: Sincronização automática de múltiplas contas
- **Backups**: Sistema automático com armazenamento local
- **Integrações**: Gmail, MongoDB, GitHub, LinkedIn
- **Biblioteca**: 2 livros digitais (656 páginas totais)
- **Meta de Leitura**: 10 páginas por dia
- **Perguntas Reflexivas**: 18 perguntas estratégicas distribuídas
- **Diário**: Entradas ilimitadas com histórico completo

## 🔄 Scripts de Automação

### Windows (.bat)
- `Abrir_Dashboard.bat` - Inicia o dashboard completo
- `Iniciar_Dashboard_Completo.bat` - Setup completo com MongoDB
- `LinkedIn_Daily_Routine.bat` - Rotina diária do LinkedIn

### PowerShell (.ps1)
- Scripts de configuração DNS, Gmail, diagnóstico SMTP

## 🧪 Testes

```bash
# Executar testes básicos
node tests/test-mongo.js
node tests/testar_integracoes.js

# Verificar saúde dos dados
curl http://localhost:3000/api/health/data
```

## 📚 Documentação Adicional

- [INSTRUCOES_COMPLETAS.md](docs/INSTRUCOES_COMPLETAS.md) - Guia completo de instalação
- [README_DASHBOARD.md](docs/README_DASHBOARD.md) - Documentação do dashboard
- [README_EREADER.md](docs/README_EREADER.md) - 📚 Sistema de E-Reader e Diário
- [LINKEDIN_AUTOMATION_GUIDE.md](docs/LINKEDIN_AUTOMATION_GUIDE.md) - Guia de automação LinkedIn
- [CORRECAO_PROBLEMAS.md](docs/CORRECAO_PROBLEMAS.md) - Solução de problemas comuns

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e confidencial.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
1. Verifique a [documentação](docs/)
2. Execute os [scripts de diagnóstico](scripts/)
3. Verifique os [logs do servidor](#)

---

**Última atualização:** Janeiro 2026
**Versão:** 2.0.0
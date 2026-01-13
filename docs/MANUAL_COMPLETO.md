# 📘 Manual Completo - Gerenciador Pessoal Avila

**Versão:** 2.0.0  
**Data:** 13 de Janeiro de 2026  
**Sistema:** Dashboard Unificado de Gestão Pessoal e Profissional

---

# 📑 Índice

1. [Visão Geral](#visao-geral)
2. [Instalação Rápida](#instalacao-rapida)
3. [Todas as Funcionalidades](#funcionalidades)
4. [Dashboard Principal](#dashboard)
5. [CRM & Gestão de Contatos](#crm)
6. [Gmail Integration](#gmail)
7. [Biblioteca & E-Reader](#biblioteca)
8. [Diário Pessoal](#diario)
9. [Calendário](#calendario)
10. [Financeiro](#financeiro)
11. [LinkedIn Automation](#linkedin)
12. [GitHub Integration](#github)
13. [Outras Integrações](#integracoes)
14. [API Endpoints](#api)
15. [Solução de Problemas](#problemas)

---

<a name="visao-geral"></a>
# 🎯 Visão Geral

## O Que É?

Sistema completo e unificado de gerenciamento pessoal e profissional que integra:

- **8,098 contatos** consolidados em CRM
- **Biblioteca digital** com 2 livros (656 páginas)
- **E-Reader** com meta de 10 páginas/dia
- **Diário pessoal** para reflexões e desabafos
- **Gmail** sincronizado de múltiplas contas
- **Calendário** com Windows Task Scheduler
- **Financeiro** com extratos bancários
- **LinkedIn automation** para networking
- **GitHub** para gestão de projetos
- **E muito mais!**

## Tecnologias

- **Backend:** Node.js, Express, MongoDB Atlas
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **APIs:** Gmail, GitHub, LinkedIn, Meta, PayPal, Stripe
- **Database:** MongoDB (2 databases: CRM + Gmail)
- **Storage:** LocalStorage + MongoDB Cloud

---

<a name="instalacao-rapida"></a>
# 🚀 Instalação Rápida

## Pré-requisitos

```bash
✓ Node.js 16+
✓ MongoDB Atlas account (grátis)
✓ Git
✓ Navegador moderno (Chrome, Firefox, Edge)
```

## Passo 1: Clonar e Instalar

```bash
git clone https://github.com/avilaops/manager.git
cd Gerenciador-pessoal
npm install
```

## Passo 2: Configurar Variáveis

Copie `.env.example` para `.env` e configure:

```env
# MongoDB
MONGODB_URI=mongodb+srv://seu_usuario:senha@cluster.mongodb.net/

# Gmail API
GMAIL_CLIENT_ID=seu_client_id
GMAIL_CLIENT_SECRET=seu_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/auth/callback

# Databases
CRM_DB_NAME=avila_crm
GMAIL_DB_NAME=avila_gmail

# GitHub (opcional)
GITHUB_TOKEN=github_pat_xxxxx
GITHUB_USERNAME=seu_usuario

# LinkedIn (opcional)
LINKEDIN_ACCESS_TOKEN=seu_token
LINKEDIN_CLIENT_ID=seu_client_id
```

## Passo 3: Iniciar

```bash
npm start
# Ou use os scripts .bat incluídos
```

Acesse: **http://localhost:3000**

---

<a name="funcionalidades"></a>
# 🛠️ Todas as Funcionalidades

## 1. 📊 Dashboard Principal
- Interface unificada para todos os módulos
- Menu de navegação intuitivo
- Estatísticas em tempo real
- Acesso rápido a todas ferramentas

## 2. 🤝 CRM & Gestão de Contatos
- **8,098 contatos consolidados**
- Importação de VCF files
- Sincronização com Gmail
- Leads e pipeline de vendas
- Segmentação de contatos
- Exportação CSV/JSON
- Backup automático

## 3. 📧 Gmail Integration
- Autenticação OAuth2
- Sincronização de 3 contas
- Busca de emails
- Importação de contatos
- Envio de emails
- Organização por labels

## 4. 📚 Biblioteca & E-Reader
- **2 livros digitais disponíveis:**
  - "12 Regras para a Vida" - Jordan Peterson (448 páginas)
  - "O Ego É Seu Inimigo" - Ryan Holiday (208 páginas)
- Leitor PDF integrado
- Meta diária: 10 páginas
- Progresso visual
- 18 perguntas reflexivas estratégicas
- Bookmark automático
- Estatísticas de leitura

## 5. 📔 Diário Pessoal
- Espaço privado para reflexões
- Seleção de humor (8 opções)
- Histórico completo
- Backup automático
- Exportação em TXT
- Integração com reflexões de leitura
- Data/hora automática

## 6. 📅 Calendário
- Integração com Windows Task Scheduler
- Compromissos e lembretes
- Notificações antecipadas
- Interface simples e intuitiva

## 7. 💰 Financeiro
- Importação de extratos bancários
- Categorização de transações
- Relatórios de entradas/saídas
- Saldo atualizado
- Exportação de dados

## 8. 💼 LinkedIn Automation
- Automação de posts
- Engajamento automático
- Crescimento de rede
- Targeting de audiência
- Rotinas diárias

## 9. 🐙 GitHub Integration
- Gestão de repositórios
- Issues e PRs
- Estatísticas de commits
- Integração com projetos

## 10. ☁️ Cloud & Databases
- MongoDB Atlas
- Google Cloud
- DNS Management
- Backups automáticos

## 11. 🌐 Social Media
- Meta Business Suite
- Postagem em múltiplas redes
- Agendamento de conteúdo

## 12. 💳 Payments
- PayPal integration
- Stripe integration
- Gestão de pagamentos

## 13. 🤖 AI & ML Tools
- Ferramentas de IA
- Machine Learning
- Automações inteligentes

## 14. 👤 Gravatar
- Gestão de avatar
- Perfil público

---

<a name="dashboard"></a>
# 📊 Dashboard Principal

## Acesso

```
http://localhost:3000
```

## Menu Superior

```
🏠 Dashboard | 💻 Developer Tools | ☁️ Cloud & DB | 🌐 Social
📅 Calendário | 🤝 CRM | 💰 Financeiro | 📚 Biblioteca | 📔 Diário
```

## Atalhos

- **Alt + H**: Home
- **Alt + C**: CRM
- **Alt + L**: Biblioteca
- **Alt + D**: Diário

## Estatísticas Principais

- Total de contatos
- Emails sincronizados
- Páginas lidas hoje
- Entradas no diário
- Compromissos do dia
- Saldo financeiro

---

<a name="crm"></a>
# 🤝 CRM & Gestão de Contatos

## Funcionalidades

### Visualização de Contatos

```javascript
// Carregar todos os contatos
GET /api/crm/contacts
// Retorna: 8,098 contatos consolidados
```

**Informações por contato:**
- Nome completo
- Telefone(s)
- Email(s)
- Empresa
- Fonte (VCF, Gmail, Manual)
- Data de cadastro
- Tags e categorias

### Pipeline de Vendas

**Estágios:**
1. 📥 Novos Leads
2. 💬 Em Negociação
3. ✅ Fechados
4. ❌ Perdidos

### Ações Disponíveis

```javascript
// Adicionar contato
POST /api/crm/contacts
Body: { name, phone, email, company, source }

// Atualizar contato
PUT /api/crm/contacts/:id
Body: { ...campos }

// Deletar contato
DELETE /api/crm/contacts/:id

// Backup completo
POST /api/backup/completo

// Exportar CSV
GET /api/export/contatos/csv

// Verificar integridade
GET /api/health/data
```

### Importação de Contatos

**Formatos suportados:**
- VCF (vCard)
- CSV
- Gmail Contacts
- JSON

**Como importar VCF:**
```javascript
// Coloque arquivo .vcf na pasta contacts/
// O sistema importa automaticamente ao iniciar
```

### Marketing por Email

```javascript
// Interface no dashboard
Botão: "📧 Enviar Emails"

// Funcionalidades:
- Templates personalizados
- Variáveis dinâmicas
- Envio em massa
- Rastreamento de abertura
```

---

<a name="gmail"></a>
# 📧 Gmail Integration

## Configuração Inicial

### 1. Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie novo projeto
3. Ative APIs:
   - Gmail API
   - Google People API
4. Crie credenciais OAuth2:
   - Tipo: Web application
   - Redirect URI: `http://localhost:3000/api/gmail/auth/callback`
5. Copie Client ID e Client Secret

### 2. Configurar .env

```env
GMAIL_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=seu_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/auth/callback

# Múltiplas contas
GMAIL_ACCOUNT_1=conta1@gmail.com
GMAIL_ACCOUNT_2=conta2@gmail.com
GMAIL_ACCOUNT_3=conta3@gmail.com
```

## Autenticação

### Primeira Vez

1. Dashboard → Gmail
2. Clique "🔐 Autenticar com Google"
3. Autorize o acesso
4. Aguarde redirecionamento

### Sincronização

```javascript
// Sincronizar emails
POST /api/gmail/sync-emails
Body: { account: 'conta1@gmail.com', maxResults: 100 }

// Buscar contatos
GET /api/gmail/contacts?account=conta1@gmail.com

// Enviar email
POST /api/gmail/send
Body: {
  to: 'destinatario@email.com',
  subject: 'Assunto',
  body: 'Conteúdo',
  from: 'conta1@gmail.com'
}
```

## Funcionalidades

- ✅ Leitura de emails (últimos 100 por padrão)
- ✅ Busca por palavras-chave
- ✅ Filtros por label
- ✅ Importação de contatos
- ✅ Envio de emails
- ✅ Múltiplas contas
- ✅ Sincronização automática
- ✅ Backup em MongoDB

---

<a name="biblioteca"></a>
# 📚 Biblioteca & E-Reader

## Livros Disponíveis

### 1. 12 Regras para a Vida
- **Autor:** Jordan B. Peterson
- **Páginas:** 448
- **Arquivo:** `Livros/12 regras para a vida...pdf`
- **Perguntas:** 10 reflexões estratégicas

### 2. O Ego É Seu Inimigo
- **Autor:** Ryan Holiday
- **Páginas:** 208
- **Arquivo:** `Livros/O Ego É Seu Inimigo...pdf`
- **Perguntas:** 8 reflexões estratégicas

## Como Usar

### 1. Acessar Biblioteca

```
Dashboard → 📚 Biblioteca & Leitura
```

### 2. Selecionar Livro

Clique em um dos livros na sidebar esquerda.

### 3. Ler e Navegar

```
← Anterior  |  📄 Página 112/448  |  Próxima →
```

**Ou digite o número da página diretamente.**

### 4. Meta Diária

```
🎯 Meta Diária de Leitura
    7/10 páginas hoje
━━━━━━━━━━━━━━━━━ 70%
📖 Continue lendo!
```

**Ao completar 10 páginas:**
```
🎉 Parabéns! Você completou sua meta diária!
```

## Perguntas Reflexivas

### Como Funcionam

Perguntas aparecem automaticamente em páginas específicas:

**12 Regras para a Vida:**
- Pág 10: Primeira impressão
- Pág 50: Arrumar seu quarto
- Pág 100: Comparação consigo mesmo
- Pág 150: Assumir responsabilidade
- Pág 200: Dizer a verdade
- Pág 250: Lidar com sofrimento
- Pág 300: Relacionamentos
- Pág 350: Buscar significado
- Pág 400: Implementação prática
- Pág 448: Priorização final

**O Ego É Seu Inimigo:**
- Pág 10: Aspiração vs Ego
- Pág 30: Sinais de ego
- Pág 60: Ego impedindo crescimento
- Pág 90: Praticar humildade
- Pág 120: Fazer o trabalho
- Pág 150: Lidar com críticas
- Pág 180: Confiança vs Arrogância
- Pág 208: Aplicação prática

### Responder

```
┌────────────────────────────────────┐
│ 💭 Momento de Reflexão              │
├────────────────────────────────────┤
│ Peterson fala sobre assumir        │
│ responsabilidade. Que              │
│ responsabilidades você tem         │
│ evitado?                           │
│                                    │
│ [Digite sua reflexão aqui...]     │
│                                    │
│ [Responder depois] [✍️ Salvar]    │
└────────────────────────────────────┘
```

Suas respostas são salvas:
- ✅ No diário pessoal
- ✅ Vinculadas à página do livro
- ✅ Com data e hora
- ✅ Backup automático

## Estatísticas

```javascript
GET /api/ereader/estatisticas

Response: {
  totalLivros: 2,
  livrosLidos: 0,
  paginasLidas: 450,
  diasConsecutivos: 7,
  entradasDiario: 15,
  perguntasRespondidas: 5
}
```

## Progresso

Cada livro mostra:
```
📘 12 Regras para a Vida
━━━━━━━━━━ 25%
📖 112/448 páginas
⏱️ ~34 dias (10 pág/dia)
```

---

<a name="diario"></a>
# 📔 Diário Pessoal

## Acesso

```
Dashboard → 📔 Diário Pessoal
```

## Como Escrever

### 1. Nova Entrada

```
✨ Nova Entrada
┌────────────────────────────────────┐
│ Escreva aqui seus pensamentos,     │
│ reflexões, desabafos...            │
│                                    │
│ 💭 Como foi seu dia?               │
│ 🌟 O que te inspirou?              │
│ 😔 O que te preocupa?              │
│ 🎯 Quais são suas metas?           │
│ 📚 O que aprendeu hoje?            │
│                                    │
│                                    │
└────────────────────────────────────┘

Como você está?
😊 😃 😐 😔 😢 😤 🤔 😍

                    [💾 Salvar no Diário]
```

### 2. Escolher Humor

Clique em um emoji para expressar como está:
- 😊 Feliz
- 😃 Muito feliz
- 😐 Neutro
- 😔 Triste
- 😢 Muito triste
- 😤 Irritado
- 🤔 Pensativo
- 😍 Apaixonado

### 3. Salvar

Clique "💾 Salvar no Diário" e pronto!

## Visualizar Entradas

Todas as entradas aparecem em ordem cronológica reversa (mais recentes primeiro):

```
┌────────────────────────────────────┐
│ 13 de janeiro de 2026, 14:30  😊 │
├────────────────────────────────────┤
│ Hoje foi um dia incrível! Li as   │
│ primeiras 50 páginas do livro do  │
│ Jordan Peterson. A parte sobre    │
│ "arrumar seu quarto" realmente    │
│ me fez pensar...                  │
└────────────────────────────────────┘
```

## Exportar Diário

```
Dashboard → Diário → 📥 Exportar
```

Gera arquivo `.txt` com todas as entradas:

```
13 de janeiro de 2026, 14:30 😊
────────────────────────────────────
Hoje foi um dia incrível! Li as
primeiras 50 páginas...

==================================================

12 de janeiro de 2026, 20:15 🤔
────────────────────────────────────
Reflexão sobre "O Ego É Seu Inimigo"...
```

## API

```javascript
// Salvar dados
POST /api/ereader/salvar
Body: {
  diarioEntradas: [{
    id: 1234567890,
    data: "2026-01-13T14:30:00Z",
    texto: "...",
    humor: "😊"
  }]
}

// Exportar
GET /api/ereader/exportar-diario
// Download de arquivo TXT
```

## Privacidade

- 🔒 **100% Privado**: Só você tem acesso
- 💾 **Backup Automático**: Salvo no MongoDB
- 🔐 **Criptografia**: Dados seguros
- 📥 **Exportável**: Seus dados são seus

## Dicas de Uso

1. **Escreva regularmente** (diariamente é ideal)
2. **Seja honesto** consigo mesmo
3. **Não há regras** - escreva o que quiser
4. **Use como terapia** - desabafe livremente
5. **Revise periodicamente** - veja sua evolução
6. **Exporte mensalmente** - mantenha cópias

---

<a name="calendario"></a>
# 📅 Calendário

## Acesso

```
http://localhost:3000/index.html
```

Ou pelo dashboard: `📅 Calendário`

## Criar Compromisso

```
┌────────────────────────────────────┐
│ 📅 Novo Compromisso                │
├────────────────────────────────────┤
│ Título: [                        ] │
│ Descrição: [                     ] │
│ Data: [   /   /    ]              │
│ Hora: [  :  ]                     │
│ Lembrete: [15 minutos antes ▼]   │
│                                    │
│          [➕ Criar Tarefa]         │
└────────────────────────────────────┘
```

## Integração Windows

O sistema cria tarefas no **Windows Task Scheduler**.

### Como Funciona

1. Você cria compromisso no dashboard
2. Sistema gera arquivo `.xml` de tarefa
3. PowerShell importa para Task Scheduler
4. Windows dispara notificação no horário

### Opções de Lembrete

- No horário exato
- 5 minutos antes
- 15 minutos antes (padrão)
- 30 minutos antes
- 1 hora antes
- 1 dia antes

## Visualizar Compromissos

```
📅 Compromissos do Dia
┌────────────────────────────────────┐
│ 09:00 - Reunião com cliente       │
│ 14:30 - Ler 10 páginas            │
│ 18:00 - Academia                  │
└────────────────────────────────────┘
```

## Scripts Disponíveis

```batch
# Abrir calendário
Abrir_Calendario.bat

# Criar atalho
Scripts/criar_atalho.vbs
```

---

<a name="financeiro"></a>
# 💰 Financeiro

## Acesso

```
Dashboard → 💰 Financeiro
```

## Importar Extratos

### Formatos Suportados

- **Nubank**: CSV
- **Outros bancos**: CSV genérico

### Pasta de Extratos

```
Extrato-bancario/
├── NU_936121635_01NOV2025_23NOV2025.csv
└── NU_936121635_01OUT2025_31OUT2025.csv
```

### Importação Automática

O sistema lê automaticamente CSVs na pasta e importa para o MongoDB.

## Visualização

```
┌─────────────────────────────────────┐
│ 💳 Transações          0            │
│ 📈 Entradas       R$ 0,00           │
│ 📉 Saídas         R$ 0,00           │
│ ⚖️ Saldo          R$ 0,00           │
└─────────────────────────────────────┘

Histórico de Transações
┌─────────────────────────────────────┐
│ Data       Descrição        Valor   │
├─────────────────────────────────────┤
│ 10/11/25   Mercado      -R$ 150,00 │
│ 09/11/25   Salário      +R$ 5000,00│
│ 08/11/25   Netflix      -R$ 45,90  │
└─────────────────────────────────────┘
```

## Ações

```javascript
// Atualizar extratos
Button: "🔄 Atualizar Extratos"

// Exportar dados
Button: "📊 Exportar CSV"
```

---

<a name="linkedin"></a>
# 💼 LinkedIn Automation

## Arquivos

```
src/utils/
├── linkedin-automation.js    # Automação principal
├── linkedin-engagement.js    # Engajamento automático
├── linkedin-growth.js        # Crescimento de rede
└── linkedin-targeting.js     # Targeting de audiência
```

## Scripts Batch

```batch
# Menu de automação
LinkedIn_Growth_Menu.bat

# Rotina diária
LinkedIn_Daily_Routine.bat

# Iniciar automação
LinkedIn_Automation.bat
```

## Funcionalidades

### 1. Automação de Posts

```javascript
// Agendar post
{
  content: "Conteúdo do post...",
  scheduledTime: "2026-01-14T09:00:00",
  hashtags: ["#tech", "#dev"],
  media: "image.jpg"
}
```

### 2. Engajamento Automático

- Curtir posts relevantes
- Comentar em discussões
- Responder mensagens
- Aceitar conexões

### 3. Crescimento de Rede

- Enviar convites targeted
- Follow-up automático
- Tracking de aceitações
- Análise de perfil

### 4. Rotina Diária

```
08:00 - Verificar notificações
09:00 - Post matinal
12:00 - Engajamento (curtidas/comentários)
15:00 - Enviar convites (10-20)
18:00 - Responder mensagens
20:00 - Post vespertino
```

## Configuração

```env
LINKEDIN_ACCESS_TOKEN=seu_token
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_secret
```

## Guias

- `docs/LINKEDIN_AUTOMATION_GUIDE.md`
- `docs/LINKEDIN_GROWTH_GUIDE.md`

---

<a name="github"></a>
# 🐙 GitHub Integration

## Configuração

```env
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxx
GITHUB_USERNAME=seu_usuario
```

## Funcionalidades

### 1. Repositórios

```javascript
// Listar repos
GET /api/github/repos

// Detalhes de repo
GET /api/github/repos/:owner/:repo

// Commits
GET /api/github/repos/:owner/:repo/commits
```

### 2. Issues

```javascript
// Listar issues
GET /api/github/repos/:owner/:repo/issues

// Criar issue
POST /api/github/repos/:owner/:repo/issues
Body: {
  title: "Nova feature",
  body: "Descrição...",
  labels: ["enhancement"]
}
```

### 3. Pull Requests

```javascript
// Listar PRs
GET /api/github/repos/:owner/:repo/pulls

// Criar PR
POST /api/github/repos/:owner/:repo/pulls
Body: {
  title: "Feature X",
  head: "feature-branch",
  base: "main",
  body: "Descrição..."
}
```

## Dashboard

```
Dashboard → 🐙 GitHub
```

Visualize:
- Seus repositórios
- Issues abertas
- PRs pendentes
- Estatísticas de commits
- Atividade recente

---

<a name="integracoes"></a>
# 🌐 Outras Integrações

## MongoDB Atlas

### Databases

```
avila_crm          # CRM e contatos
avila_gmail        # Emails e contatos Gmail
```

### Collections

```javascript
// CRM
contacts           // 8,098 contatos
leads             // Leads do pipeline
ereader_data      // Progresso de leitura e diário

// Gmail
emails            // Emails sincronizados
gmail_contacts    // Contatos do Gmail
```

### Backup

```javascript
POST /api/backup/completo

// Cria arquivo em data/backups/
backup_2026-01-13_1234567890.json
```

## Google Cloud

- Gmail API
- People API
- OAuth2 Authentication
- Cloud Storage (futuro)

## DNS Management

- Porkbun integration
- Gerenciamento de domínios
- Configuração de DNS

## Meta Business

- Facebook posting
- Instagram integration
- WhatsApp Business (futuro)

## Payments

### PayPal

```javascript
// Criar pagamento
POST /api/payments/paypal/create
Body: {
  amount: 100.00,
  currency: "BRL",
  description: "Produto X"
}
```

### Stripe

```javascript
// Criar checkout
POST /api/payments/stripe/checkout
Body: {
  amount: 10000, // centavos
  currency: "brl",
  description: "Serviço Y"
}
```

## Gravatar

- Avatar público
- Integração com email
- Perfil personalizado

## AI & ML Tools

- Scripts em `AI-ML/`
- Ferramentas de análise
- Automações inteligentes

---

<a name="api"></a>
# 🔌 API Endpoints

## CRM

```javascript
GET    /api/crm/contacts                    # Listar contatos
POST   /api/crm/contacts                    # Criar contato
PUT    /api/crm/contacts/:id                # Atualizar
DELETE /api/crm/contacts/:id                # Deletar
```

## Gmail

```javascript
GET  /api/gmail/auth                        # Iniciar OAuth2
GET  /api/gmail/auth/callback               # Callback
POST /api/gmail/sync-emails                 # Sincronizar
GET  /api/gmail/contacts                    # Buscar contatos
POST /api/gmail/send                        # Enviar email
```

## E-Reader e Diário

```javascript
POST /api/ereader/salvar                    # Salvar progresso
GET  /api/ereader/carregar                  # Carregar dados
GET  /api/ereader/estatisticas              # Estatísticas
GET  /api/ereader/exportar-diario           # Exportar TXT
```

## Backup

```javascript
POST /api/backup/completo                   # Backup total
GET  /api/export/contatos/csv               # Exportar CSV
GET  /api/export/emails/json                # Exportar JSON
GET  /api/health/data                       # Verificar saúde
```

## GitHub

```javascript
GET  /api/github/repos                      # Listar repos
GET  /api/github/repos/:owner/:repo         # Detalhes
GET  /api/github/repos/:owner/:repo/issues  # Issues
POST /api/github/repos/:owner/:repo/issues  # Criar issue
```

## Config

```javascript
GET /api/config/status                      # Status de APIs
```

---

<a name="problemas"></a>
# 🆘 Solução de Problemas

## Servidor Não Inicia

### Erro: MongoDB Connection Failed

```bash
# Verificar URI no .env
MONGODB_URI=mongodb+srv://...

# Testar conexão
node tests/test-mongo.js
```

**Solução:**
1. Verifique credenciais
2. Whitelist seu IP no MongoDB Atlas
3. Verifique internet/firewall

### Erro: Port 3000 Already in Use

```bash
# Matar processo na porta 3000
Stop-Process -Name node -Force

# Ou use outra porta
PORT=3001 npm start
```

## Gmail Não Sincroniza

### Erro: Invalid Client

**Solução:**
1. Verifique Client ID e Secret no `.env`
2. Confirme Redirect URI no Google Console
3. Refaça autenticação OAuth2

### Emails Não Aparecem

```bash
# Forçar sincronização
POST /api/gmail/sync-emails
Body: { account: "sua_conta@gmail.com" }
```

## PDFs Não Carregam

### Livros Não Aparecem

**Verificar:**
```bash
# Checar se PDFs existem
Test-Path "Livros/*.pdf"

# Verificar nomes corretos no código
src/public/js/ereader.js (linha 10-25)
```

### Iframe Vazio

**Solução:**
1. Recarregue a página (F5)
2. Limpe cache (Ctrl+Shift+Delete)
3. Tente outro navegador

## Dados Não Salvam

### LocalStorage Cheio

```javascript
// Limpar localStorage (console F12)
localStorage.clear();
// Recarregar página
location.reload();
```

### MongoDB Não Conecta

```bash
# Verificar logs
node server.js

# Output esperado:
✓ MongoDB Atlas conectado
```

**Se falhar:**
1. Verifique internet
2. Teste URI do MongoDB
3. Verifique firewall

## Erros Comuns

### "Cannot read property of undefined"

**Causa:** Dados não carregados ainda

**Solução:** Aguardar carregamento ou recarregar

### "404 Not Found" em Assets

**Causa:** Caminhos incorretos após reorganização

**Solução:**
```bash
# Verificar estrutura
src/public/assets/
src/public/css/
src/public/js/
```

### Botões Não Funcionam

**Verificar no Console (F12):**
```javascript
// Se houver erro, anote e corrija
// Funções devem estar definidas em:
src/public/js/dashboard.js
src/public/js/ereader.js
```

## Performance

### Dashboard Lento

```bash
# Limpar cache do navegador
# Reduzir maxResults em APIs
# Otimizar queries MongoDB
```

### PDFs Lentos

```bash
# PDFs grandes demoram
# Use páginas específicas (#page=10)
# Considere comprimir PDFs
```

## Logs e Debug

### Ver Logs do Servidor

```bash
# Terminal onde roda npm start
# Ou
Get-Content server.log -Tail 50
```

### Console do Navegador

```
F12 → Console
# Veja erros JavaScript aqui
```

### MongoDB Logs

```
MongoDB Atlas → Clusters → Monitoring
```

---

# 📞 Suporte e Recursos

## Estrutura de Arquivos

```
gerenciador-pessoal/
├── src/
│   ├── public/          # Frontend
│   │   ├── assets/      # Imagens, ícones
│   │   ├── css/         # Estilos
│   │   └── js/          # Scripts
│   ├── views/           # HTML pages
│   ├── routes/          # Backend routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilitários
│   └── config/          # Configurações
├── data/
│   ├── backups/         # Backups automáticos
│   └── uploads/         # Uploads
├── Livros/              # PDFs dos livros
├── Alimentacao/         # Dados alimentação
├── contacts/            # VCF files
├── Extrato-bancario/    # Extratos CSV
├── scripts/             # Scripts automação
├── tests/               # Testes
├── .env                 # Variáveis ambiente
├── package.json         # Dependências
├── server.js            # Servidor principal
└── README.md            # Este arquivo
```

## Scripts Úteis

```bash
# Iniciar servidor
npm start
node server.js

# Testes
node tests/test-mongo.js
node tests/testar_integracoes.js

# Backup manual
POST http://localhost:3000/api/backup/completo
```

## Comandos PowerShell

```powershell
# Ver processos Node
Get-Process -Name node

# Parar servidor
Stop-Process -Name node -Force

# Testar porta
Test-NetConnection localhost -Port 3000

# Ver estrutura
tree /F src
```

## Atalhos do Dashboard

```
Dashboard: http://localhost:3000
Calendário: http://localhost:3000/index.html
Cadastro: http://localhost:3000/cadastro.html
```

## Atualizações

```bash
# Atualizar dependências
npm update

# Instalar nova dependência
npm install nome-pacote

# Verificar versões
npm list
```

## Backup Manual

### 1. Exportar do MongoDB

```bash
# Via dashboard
POST /api/backup/completo

# Arquivo salvo em:
data/backups/backup_2026-01-13_xxx.json
```

### 2. Exportar Diário

```bash
# Via dashboard
📔 Diário → 📥 Exportar

# Arquivo TXT baixado
```

### 3. Exportar Contatos

```bash
# Via dashboard
🤝 CRM → 📊 Exportar CSV

# Arquivo CSV baixado
```

---

# 🎯 Melhores Práticas

## Uso Diário

### Manhã (15 min)
1. ✅ Verificar calendário
2. ✅ Ler 10 páginas
3. ✅ Escrever no diário
4. ✅ Checar emails importantes

### Tarde (10 min)
5. ✅ Atualizar CRM
6. ✅ Responder perguntas de reflexão
7. ✅ LinkedIn engagement

### Noite (10 min)
8. ✅ Revisar tarefas do dia
9. ✅ Entrada no diário
10. ✅ Planejar amanhã

## Backup

- **Diário:** Exportar semanalmente
- **Contatos:** Backup automático (ativo)
- **MongoDB:** Backup automático Atlas
- **LocalStorage:** Sincroniza sempre

## Segurança

- 🔒 Não compartilhe `.env`
- 🔒 Use senhas fortes no MongoDB
- 🔒 Revogue tokens não usados
- 🔒 Atualize dependências regularmente

## Performance

- ⚡ Feche abas não usadas
- ⚡ Limpe cache periodicamente
- ⚡ Use filtros em queries grandes
- ⚡ Otimize PDFs pesados

---

# 📊 Estatísticas do Sistema

## Dados Atuais

- **8,098 contatos** consolidados
- **656 páginas** de leitura disponíveis
- **18 perguntas** reflexivas estratégicas
- **3 contas Gmail** integradas
- **2 livros** digitais completos
- **10+ integrações** ativas

## Capacidade

- **Contatos:** Ilimitado (MongoDB)
- **Emails:** 100+ por sincronização
- **Diário:** Entradas ilimitadas
- **Livros:** Expansível (adicione PDFs)
- **Backups:** Automáticos e ilimitados

---

# 🚀 Roadmap Futuro

## Próximas Features

### E-Reader
- [ ] Mais livros (biblioteca expansível)
- [ ] Sistema de anotações
- [ ] Marcadores de página
- [ ] Busca dentro dos livros
- [ ] Gráficos de progresso
- [ ] Compartilhamento de reflexões
- [ ] Modo leitura noturna

### Diário
- [ ] Análise de sentimento
- [ ] Tags para entradas
- [ ] Busca no histórico
- [ ] Templates de escrita
- [ ] Exportação PDF
- [ ] Gráficos de humor

### CRM
- [ ] Automação de follow-up
- [ ] Integração WhatsApp
- [ ] Templates de email
- [ ] Scoring de leads
- [ ] Relatórios avançados

### Geral
- [ ] App mobile
- [ ] Autenticação multi-usuário
- [ ] Sincronização multi-dispositivo
- [ ] Modo offline completo
- [ ] Temas personalizáveis
- [ ] Widgets dashboard

---

# 💡 Dicas e Truques

## Produtividade

1. **Use atalhos de teclado** - Mais rápido que mouse
2. **Configure meta realista** - 10 páginas/dia é sustentável
3. **Escreva no diário diariamente** - Forma hábito
4. **Revise reflexões antigas** - Veja sua evolução
5. **Mantenha CRM atualizado** - Dados frescos = melhores decisões

## Organização

1. **Tags nos contatos** - Segmente sua base
2. **Labels no Gmail** - Organize emails
3. **Categorize extratos** - Entenda gastos
4. **Export regularmente** - Backups externos
5. **Limpe dados antigos** - Performance melhor

## Motivação

1. **Celebre pequenas vitórias** - 10 páginas = 🎉
2. **Acompanhe estatísticas** - Veja progresso
3. **Compartilhe aprendizados** - LinkedIn posts
4. **Estabeleça rotinas** - Consistência > Intensidade
5. **Use como sistema, não ferramenta** - Integre na vida

---

# 📚 Recursos Adicionais

## Livros Recomendados

Além dos 2 incluídos, considere adicionar:
- "Atomic Habits" - James Clear
- "Deep Work" - Cal Newport
- "Mindset" - Carol Dweck
- "The Obstacle Is The Way" - Ryan Holiday
- "Principles" - Ray Dalio

## Como Adicionar Mais Livros

1. Coloque PDF na pasta `Livros/`
2. Edite `src/public/js/ereader.js`:

```javascript
this.livros = [
  // ... livros existentes ...
  {
    id: 3,
    titulo: "Seu Livro",
    autor: "Autor",
    arquivo: "nome_do_arquivo.pdf",
    totalPaginas: 300,
    paginaAtual: 1,
    progresso: 0,
    perguntas: this.gerarPerguntasSeuLivro()
  }
];

gerarPerguntasSeuLivro() {
  return [
    { pagina: 50, texto: "Sua pergunta...", respondida: false },
    // ... mais perguntas
  ];
}
```

3. Reinicie o servidor
4. Pronto! Livro disponível na biblioteca

---

# 🎓 Aprendizados e Filosofia

## Por Que Este Sistema?

### Problema
- Informação espalhada em várias ferramentas
- Falta de consistência em hábitos
- Dificuldade em acompanhar progresso
- Sem espaço para reflexão profunda

### Solução
- **Tudo em um só lugar** - Um dashboard para tudo
- **Gamificação** - Metas e celebrações
- **Reflexão integrada** - Perguntas + Diário
- **Dados seus** - Controle total, exportação livre

### Filosofia

> "O conhecimento não aplicado é apenas entretenimento."
> — Implementação > Informação

> "Somos o que repetidamente fazemos. A excelência, então, não é um ato, mas um hábito."
> — Aristóteles

Este sistema foi criado para:
1. ✅ **Facilitar bons hábitos** (leitura, reflexão)
2. ✅ **Centralizar informações** (CRM, emails, finanças)
3. ✅ **Promover autoconhecimento** (diário, perguntas)
4. ✅ **Aumentar produtividade** (automações, integrações)
5. ✅ **Dar controle** (seus dados, suas regras)

---

# 🏆 Conclusão

## Você Agora Tem

✅ Sistema completo de gerenciamento pessoal  
✅ 8,098 contatos organizados  
✅ Biblioteca digital com 2 livros  
✅ Sistema de leitura com metas  
✅ Diário pessoal privado  
✅ Integrações com Gmail, GitHub, LinkedIn  
✅ Calendário com lembretes  
✅ Controle financeiro  
✅ Backups automáticos  
✅ API completa para expandir  

## Próximos Passos

1. **Configure suas variáveis** (.env)
2. **Conecte suas contas** (Gmail, GitHub)
3. **Comece a usar** (leia 10 páginas hoje!)
4. **Escreva no diário** (reflita sobre o dia)
5. **Mantenha atualizado** (CRM, finanças)

## Lembre-se

> "A jornada de mil milhas começa com um único passo."
> — Lao Tzu

**Comece hoje. Use consistentemente. Veja resultados.**

---

# 📞 Contato e Suporte

**Repositório:** https://github.com/avilaops/manager  
**Issues:** https://github.com/avilaops/manager/issues  
**Email:** (configure no sistema)

---

**🌟 Versão:** 2.0.0  
**📅 Atualizado:** 13 de Janeiro de 2026  
**👨‍💻 Desenvolvido com ❤️ para gestão pessoal completa**

---

*"O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor momento é agora."*

**🚀 Comece sua jornada agora: http://localhost:3000**
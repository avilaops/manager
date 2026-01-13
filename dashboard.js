// Configurações
const API_BASE = 'http://localhost:3000/api';

// Toggle Sidebar (Desabilitado - Menu horizontal)
function toggleSidebar() {
    // Sidebar removido - usando menu horizontal
}

// Atualizar relógio na navbar
function updateClock() {
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        clockElement.textContent = timeString;
    }
}

// Iniciar relógio
setInterval(updateClock, 1000);
updateClock();

// Função para mostrar seções
function showSection(sectionName) {
    // Ocultar todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar seção específica
    const targetSection = document.getElementById(sectionName + '-section') || document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Inicializar seção específica se necessário
        if (sectionName === 'design-copy') {
            initializeDesignCopySection();
        }
    }
    
    // Atualizar menu ativo
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Encontrar e ativar item do menu
    const activeItem = document.querySelector(`[onclick*="showSection('${sectionName}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Check if backend is running
async function checkBackend() {
    try {
        await fetch(`${API_BASE}/github/repos`);
        return true;
    } catch {
        return false;
    }
}

// Carregar dados do dashboard principal
async function loadDashboardData() {
    // Carregar contagem do GitHub
    try {
        const response = await fetch(`${API_BASE}/github/repos`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('github-count').textContent = data.repos.length;
        }
    } catch (error) {
        console.log('GitHub não configurado');
    }
    
    // Carregar status de configuração
    loadConfigurationStatus();
}

// Carregar status de configuração de todos os serviços
async function loadConfigurationStatus() {
    const container = document.getElementById('config-status-container');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE}/config/status`);
        const data = await response.json();
        
        if (!data.success) throw new Error('Erro ao carregar status');
        
        const services = [
            {
                name: 'GitHub',
                icon: '🐙',
                key: 'github',
                description: 'Repositórios e código',
                setupUrl: 'https://github.com/settings/tokens',
                envVars: ['GITHUB_TOKEN']
            },
            {
                name: 'MongoDB Atlas',
                icon: '🍃',
                key: 'mongodb',
                description: 'Banco de dados',
                setupUrl: 'https://www.mongodb.com/cloud/atlas',
                envVars: ['MONGODB_URI']
            },
            {
                name: 'LinkedIn',
                icon: '💼',
                key: 'linkedin',
                description: 'Rede profissional',
                setupUrl: 'https://www.linkedin.com/developers/',
                envVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_TOKEN']
            },
            {
                name: 'Meta Business',
                icon: '📱',
                key: 'meta',
                description: 'Instagram, Facebook, WhatsApp',
                setupUrl: 'https://developers.facebook.com/',
                envVars: ['META_APP_ID', 'META_ACCESS_TOKEN', 'INSTAGRAM_BUSINESS_ACCOUNT_ID', 'FACEBOOK_PAGE_ID', 'WHATSAPP_BUSINESS_ACCOUNT_ID'],
                subStatus: data.status.meta
            },
            {
                name: 'Stripe',
                icon: '💳',
                key: 'stripe',
                description: 'Pagamentos online',
                setupUrl: 'https://dashboard.stripe.com/apikeys',
                envVars: ['STRIPE_SECRET_KEY']
            },
            {
                name: 'Railway',
                icon: '🚂',
                key: 'railway',
                description: 'Deploy e hosting',
                setupUrl: 'https://railway.app/account/tokens',
                envVars: ['RAILWAY_TOKEN']
            },
            {
                name: 'Azure DevOps',
                icon: '☁️',
                key: 'azure',
                description: 'CI/CD e pipelines',
                setupUrl: 'https://dev.azure.com/',
                envVars: ['AZURE_DEVOPS_TOKEN']
            },
            {
                name: 'OpenAI',
                icon: '🤖',
                key: 'openai',
                description: 'Inteligência Artificial',
                setupUrl: 'https://platform.openai.com/api-keys',
                envVars: ['OPENAI_API_KEY']
            },
            {
                name: 'Gmail',
                icon: '📧',
                key: 'gmail',
                description: 'Email integration',
                setupUrl: 'https://myaccount.google.com/apppasswords',
                envVars: ['GMAIL_USER', 'GMAIL_APP_PASSWORD']
            }
        ];
        
        let html = '';
        
        services.forEach(service => {
            const status = data.status[service.key];
            const isConfigured = status?.configured || false;
            
            let statusBadge = '';
            let statusClass = '';
            let detailsHtml = '';
            
            if (isConfigured) {
                statusBadge = '<span class=\"config-badge config-ok\">✅ Configurado</span>';
                statusClass = 'config-card-ok';
                
                // Detalhes específicos por serviço
                if (service.key === 'github' && status.username) {
                    detailsHtml = `<p class=\"config-detail\">👤 Usuário: <strong>${status.username}</strong></p>`;
                }
                
                if (service.key === 'meta') {
                    detailsHtml += '<div class=\"config-substatus\">';
                    detailsHtml += `<span class=\"${status.hasInstagram ? 'substatus-ok' : 'substatus-warn'}\">📷 Instagram: ${status.hasInstagram ? '✓' : '✗'}</span>`;
                    detailsHtml += `<span class=\"${status.hasFacebook ? 'substatus-ok' : 'substatus-warn'}\">📘 Facebook: ${status.hasFacebook ? '✓' : '✗'}</span>`;
                    detailsHtml += `<span class=\"${status.hasWhatsApp ? 'substatus-ok' : 'substatus-warn'}\">💬 WhatsApp: ${status.hasWhatsApp ? '✓' : '✗'}</span>`;
                    detailsHtml += '</div>';
                }
                
                if (service.key === 'stripe' && status.testMode) {
                    detailsHtml = '<p class=\"config-detail\">⚠️ Modo: <strong>Test</strong></p>';
                }
                
                if (service.key === 'gmail' && status.accounts) {
                    detailsHtml = `<p class=\"config-detail\">📬 Contas: <strong>${status.accounts}</strong></p>`;
                }
                
            } else {
                statusBadge = '<span class=\"config-badge config-missing\">⚠️ Não Configurado</span>';
                statusClass = 'config-card-warn';
                
                detailsHtml = `
                    <div class=\"config-setup-info\">
                        <p style=\"margin-bottom: 8px; font-size: 0.9em; color: #64748b;\">📝 <strong>Variáveis necessárias no .env:</strong></p>
                        <ul style=\"margin: 0 0 10px 20px; font-size: 0.85em; color: #64748b; line-height: 1.6;\">
                            ${service.envVars.map(v => `<li><code>${v}</code></li>`).join('')}
                        </ul>
                        <a href=\"${service.setupUrl}\" target=\"_blank\" class=\"config-setup-link\">
                            🔗 Configurar ${service.name} →
                        </a>
                    </div>
                `;
            }
            
            html += `
                <div class=\"config-card ${statusClass}\">
                    <div class=\"config-header\">
                        <div style=\"display: flex; align-items: center; gap: 12px;\">
                            <span style=\"font-size: 2em;\">${service.icon}</span>
                            <div>
                                <h3 style=\"margin: 0; font-size: 1.1em;\">${service.name}</h3>
                                <p style=\"margin: 5px 0 0 0; font-size: 0.85em; color: #64748b;\">${service.description}</p>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>
                    ${detailsHtml}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar status:', error);
        container.innerHTML = `
            <div class="service-card" style="background: #fee2e2; border-left: 4px solid #ef4444;">
                <p style="color: #991b1b;">❌ Erro ao verificar configurações: ${error.message}</p>
            </div>
        `;
    }
}

// Função para navegação via botões (ações rápidas)
function navigateToSection(sectionName) {
    // Encontra o nav-item correspondente e simula o clique
    const navItem = document.querySelector(`.nav-item[href="#${sectionName}"]`);
    if (navItem) {
        // Remove active de todos
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adiciona active no item clicado
        navItem.classList.add('active');
        
        // Mostra a seção
        showSection(sectionName);
    }
}

// Navigation
function showSection(sectionName) {
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Update header
    const titles = {
        dashboard: { title: 'Dashboard Principal', subtitle: 'Visão geral de todos os serviços' },
        calendario: { title: 'Calendário', subtitle: 'Gerenciar compromissos' },
        cargo: { title: 'Cargo Registry', subtitle: 'Pacotes Rust publicados' },
        github: { title: 'GitHub', subtitle: 'Repositórios e atividades' },
        mongodb: { title: 'MongoDB Atlas', subtitle: 'Bancos de dados e collections' },
        railway: { title: 'Railway', subtitle: 'Projetos e deployments' },
        azure: { title: 'Azure DevOps', subtitle: 'Projetos e pipelines' },
        gcloud: { title: 'Google Cloud', subtitle: 'Recursos e serviços' },
        gmail: { title: 'Gmail', subtitle: 'Gerenciamento de 3 contas' },
        dns: { title: 'DNS Management', subtitle: 'Porkbun e Cloudflare' },
        payments: { title: 'Payment Services', subtitle: 'PayPal e Stripe' },
        ai: { title: 'AI & ML Services', subtitle: 'OpenAI, HuggingFace e mais' },
        gravatar: { title: 'Gravatar', subtitle: 'Gerenciar avatar' },
        sentry: { title: 'Sentry', subtitle: 'Error tracking' },
        crm: { title: 'CRM & Leads', subtitle: 'Gestão de clientes e email marketing' },
        contacts: { title: 'Contatos Unificados', subtitle: 'Gerenciamento centralizado de todos os contatos' },
        campanhas: { title: 'Campanhas de Marketing', subtitle: 'Monitoramento e otimização automática de campanhas' },
        'alertas-campanhas': { title: 'Alertas de Campanhas', subtitle: 'Campanhas que precisam de atenção imediata' },
        'linkedin-automation': { title: 'LinkedIn Automation', subtitle: 'Sistema de Automação e Targeting Inteligente' }
    };
    
    if (titles[sectionName]) {
        document.getElementById('page-title').textContent = titles[sectionName].title;
        document.getElementById('page-subtitle').textContent = titles[sectionName].subtitle;
    }
    
    // Load section data
    loadSectionData(sectionName);
}

// Load section data
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'calendario':
            loadCalendarioData();
            break;
        case 'mongodb':
            loadMongoDBData();
            break;
        case 'railway':
            loadRailwayData();
            break;
        case 'cargo':
            loadCargoData();
            break;
        case 'github':
            loadGitHubData();
            break;
        case 'linkedin':
            loadLinkedInData();
            break;
        case 'meta':
            loadMetaData();
            break;
        case 'azure':
            loadAzureData();
            break;
        case 'gcloud':
            loadGCloudData();
            break;
        case 'gmail':
            loadGmailData();
            break;
        case 'dns':
            loadDNSData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'ai':
            loadAIData();
            break;
        case 'gravatar':
            loadGravatarData();
            break;
        case 'sentry':
            loadSentryData();
            break;
        case 'crm':
            loadCRMData();
            break;
        case 'contacts':
            loadContactsUnified();
            break;
        case 'campanhas':
            loadCampanhasData();
            break;
        case 'alertas-campanhas':
            loadAlertasCampanhasData();
            break;
    }
}

// GitHub API - DADOS REAIS
async function loadGitHubData() {
    const container = document.getElementById('github-content');
    container.innerHTML = '<div class="loading"><p>Carregando repositórios do GitHub...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/github/repos`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Erro ao carregar dados do GitHub');
        }
        
        const repos = data.repos;
        
        // Update dashboard count
        document.getElementById('github-count').textContent = repos.length;
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        html += `<div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
                <h3>Total Repositories</h3>
                <p class="stat-value">${repos.length}</p>
            </div>
        </div>`;
        
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        html += `<div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
                <h3>Total Stars</h3>
                <p class="stat-value">${totalStars}</p>
            </div>
        </div>`;
        
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        html += `<div class="stat-card">
            <div class="stat-icon">🔱</div>
            <div class="stat-content">
                <h3>Total Forks</h3>
                <p class="stat-value">${totalForks}</p>
            </div>
        </div>`;
        html += '</div>';
        
        // Botões de ação rápida
        html += '<div style="margin-bottom: 30px; display: flex; gap: 10px; flex-wrap: wrap;">';
        html += '<button onclick="loadGitHubIssues()" class="btn-primary" style="padding: 10px 20px;">🐛 Ver Issues</button>';
        html += '<button onclick="loadGitHubGists()" class="btn-primary" style="padding: 10px 20px;">📝 Ver Gists</button>';
        html += '<button onclick="loadGitHubNotifications()" class="btn-primary" style="padding: 10px 20px;">🔔 Notificações</button>';
        html += '<a href="https://github.com/' + data.user.login + '" target="_blank" class="btn-primary" style="padding: 10px 20px; text-decoration: none; display: inline-block;">👤 Meu Perfil</a>';
        html += '</div>';
        
        html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">📦 Repositórios</h3>';
        
        repos.forEach(repo => {
            const updated = new Date(repo.updated_at).toLocaleDateString('pt-BR');
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${repo.name}</div>
                            <p style="color: #64748b; margin-top: 5px;">${repo.description || 'Sem descrição'}</p>
                        </div>
                        <span class="service-status ${repo.private ? 'status-inactive' : 'status-active'}">
                            ${repo.private ? '🔒 Private' : '🌐 Public'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 20px; margin-top: 15px; color: #64748b; font-size: 0.9em;">
                        <span>⭐ ${repo.stargazers_count} stars</span>
                        <span>🔱 ${repo.forks_count} forks</span>
                        <span>📝 ${repo.language || 'N/A'}</span>
                        <span>🕐 ${updated}</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="${repo.html_url}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.9em; text-decoration: none;">
                            Ver no GitHub →
                        </a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        let errorMessage = error.message;
        let errorDetails = '';
        
        // Detecta erro de autenticação do GitHub
        if (errorMessage.includes('Token') || errorMessage.includes('credential') || errorMessage.includes('401')) {
            errorMessage = 'Token do GitHub inválido ou expirado';
            errorDetails = `
                <div style="margin-top: 15px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                    <p style="color: #92400e; margin-bottom: 10px;"><strong>🔧 Como corrigir:</strong></p>
                    <ol style="color: #92400e; margin-left: 20px; line-height: 1.8;">
                        <li>Acesse: <a href="https://github.com/settings/tokens" target="_blank" style="color: #2563eb;">https://github.com/settings/tokens</a></li>
                        <li>Clique em "Generate new token" → "Generate new token (classic)"</li>
                        <li>Selecione os escopos: <code>repo</code>, <code>user</code>, <code>read:org</code></li>
                        <li>Copie o token gerado</li>
                        <li>Atualize no arquivo <code>.env</code>: <code>GITHUB_TOKEN=seu_novo_token</code></li>
                        <li>Reinicie o servidor: <code>npm start</code></li>
                    </ol>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="service-card" style="background: #fee2e2; color: #991b1b;">
                <div style="display: flex; align-items: start; gap: 10px;">
                    <span style="font-size: 2em;">❌</span>
                    <div style="flex: 1;">
                        <p style="margin-bottom: 10px;"><strong>Erro ao carregar GitHub:</strong> ${errorMessage}</p>
                        ${errorDetails}
                    </div>
                </div>
            </div>
        `;
    }
}

// GitHub - Carregar Issues
async function loadGitHubIssues() {
    const container = document.getElementById('github-content');
    container.innerHTML = '<div class="loading"><p>Carregando issues...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/github/issues`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadGitHubData()" class="btn-primary">← Voltar para Repositórios</button></div>';
        html += `<h3 style="margin-bottom: 20px;">🐛 Issues Atribuídas (${data.count})</h3>`;
        
        if (data.issues.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhuma issue atribuída a você.</p></div>';
        } else {
            data.issues.forEach(issue => {
                const created = new Date(issue.created_at).toLocaleDateString('pt-BR');
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <div class="service-title">${issue.title}</div>
                                <p style="color: #64748b; margin-top: 5px;">${issue.repository?.full_name || 'Repository'} #${issue.number}</p>
                            </div>
                            <span class="service-status status-${issue.state === 'open' ? 'active' : 'inactive'}">
                                ${issue.state === 'open' ? '📖 Aberta' : '✅ Fechada'}
                            </span>
                        </div>
                        <div style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                            📅 Criada em: ${created}
                        </div>
                        <div style="margin-top: 15px;">
                            <a href="${issue.html_url}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.9em; text-decoration: none;">
                                Ver Issue →
                            </a>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

// GitHub - Carregar Gists
async function loadGitHubGists() {
    const container = document.getElementById('github-content');
    container.innerHTML = '<div class="loading"><p>Carregando gists...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/github/gists`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadGitHubData()" class="btn-primary">← Voltar para Repositórios</button></div>';
        html += `<h3 style="margin-bottom: 20px;">📝 Seus Gists (${data.count})</h3>`;
        
        if (data.gists.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhum gist encontrado.</p></div>';
        } else {
            data.gists.forEach(gist => {
                const created = new Date(gist.created_at).toLocaleDateString('pt-BR');
                const files = Object.keys(gist.files);
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <div class="service-title">${gist.description || 'Sem descrição'}</div>
                                <p style="color: #64748b; margin-top: 5px;">📄 ${files.length} arquivo(s)</p>
                            </div>
                            <span class="service-status ${gist.public ? 'status-active' : 'status-inactive'}">
                                ${gist.public ? '🌐 Público' : '🔒 Privado'}
                            </span>
                        </div>
                        <div style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                            📅 Criado em: ${created}
                        </div>
                        <div style="margin-top: 15px;">
                            <a href="${gist.html_url}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.9em; text-decoration: none;">
                                Ver Gist →
                            </a>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

// GitHub - Carregar Notificações
async function loadGitHubNotifications() {
    const container = document.getElementById('github-content');
    container.innerHTML = '<div class="loading"><p>Carregando notificações...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/github/notifications`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadGitHubData()" class="btn-primary">← Voltar para Repositórios</button></div>';
        html += `<h3 style="margin-bottom: 20px;">🔔 Notificações (${data.unread} não lidas de ${data.count})</h3>`;
        
        if (data.notifications.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">✅ Nenhuma notificação.</p></div>';
        } else {
            data.notifications.slice(0, 20).forEach(notif => {
                const updated = new Date(notif.updated_at).toLocaleDateString('pt-BR');
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <div class="service-title">${notif.subject.title}</div>
                                <p style="color: #64748b; margin-top: 5px;">${notif.repository.full_name}</p>
                            </div>
                            <span class="service-status ${notif.unread ? 'status-warning' : 'status-active'}">
                                ${notif.unread ? '🔔 Nova' : '✅ Lida'}
                            </span>
                        </div>
                        <div style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                            📌 Tipo: ${notif.subject.type} | 🕐 ${updated}
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

// ============================================
// LINKEDIN
// ============================================

async function loadLinkedInData() {
    const container = document.getElementById('linkedin-content');
    container.innerHTML = '<div class="loading"><p>Carregando dados do LinkedIn...</p></div>';
    
    try {
        // Tentar buscar dados reais da API
        const [profileResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/linkedin/profile`).catch(() => null),
            fetch(`${API_BASE}/linkedin/stats`).catch(() => null)
        ]);
        
        let profile, stats;
        
        // Se a API falhar, usar dados de demonstração
        if (!profileResponse || !profileResponse.ok) {
            // Dados mockados para demonstração
            profile = {
                localizedFirstName: 'Nicolas',
                localizedLastName: 'Rosa',
                id: 'avilaops',
                vanityName: 'nicolasrosa'
            };
            stats = {
                profile: profile,
                connections: 500,
                posts: 45,
                views: 1250
            };
        } else {
            const profileData = await profileResponse.json();
            const statsData = statsResponse ? await statsResponse.json() : null;
            
            if (!profileData.success) {
                // Fallback para dados de demonstração
                profile = {
                    localizedFirstName: 'Nicolas',
                    localizedLastName: 'Rosa',
                    id: 'avilaops',
                    vanityName: 'nicolasrosa'
                };
                stats = null;
            } else {
                profile = profileData.profile;
                stats = statsData && statsData.success ? statsData.stats : null;
            }
        }
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        
        // Card de Perfil
        html += `
            <div class="stat-card">
                <div class="stat-icon">👤</div>
                <div class="stat-content">
                    <h3>Perfil</h3>
                    <p class="stat-value">${profile.localizedFirstName || ''} ${profile.localizedLastName || ''}</p>
                    <p class="stat-label">Profissional</p>
                </div>
            </div>
        `;
        
        // Card de Conexões
        html += `
            <div class="stat-card">
                <div class="stat-icon">🤝</div>
                <div class="stat-content">
                    <h3>Rede</h3>
                    <p class="stat-value">${stats?.connections || '500+'}</p>
                    <p class="stat-label">Conexões</p>
                </div>
            </div>
        `;
        
        // Card de Posts
        html += `
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <h3>Atividade</h3>
                    <p class="stat-value">${stats?.posts || '45'}</p>
                    <p class="stat-label">Posts recentes</p>
                </div>
            </div>
        `;
        
        // Card de Visualizações
        html += `
            <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                    <h3>Alcance</h3>
                    <p class="stat-value">${stats?.views || '1.2K'}</p>
                    <p class="stat-label">Visualizações do perfil</p>
                </div>
            </div>
        `;
        
        html += '</div>';
        
        // Botões de ação rápida
        html += '<div style="margin-bottom: 30px; display: flex; gap: 10px; flex-wrap: wrap;">';
        html += '<button onclick="loadLinkedInPosts()" class="btn-primary" style="padding: 10px 20px;">📝 Ver Posts</button>';
        html += '<button onclick="loadLinkedInConnections()" class="btn-primary" style="padding: 10px 20px;">🤝 Conexões</button>';
        html += '<a href="https://www.linkedin.com/in/' + (profile.vanityName || '') + '" target="_blank" class="btn-primary" style="padding: 10px 20px; text-decoration: none; display: inline-block;">👤 Ver Perfil</a>';
        html += '</div>';
        
        // Informações do perfil
        html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">💼 Informações do Perfil</h3>';
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${profile.localizedFirstName || ''} ${profile.localizedLastName || ''}</div>
                        <p style="color: #64748b; margin-top: 5px;">@${profile.vanityName || profile.id || 'nicolasrosa'}</p>
                    </div>
                    <span class="service-status status-active">
                        ✅ Conectado
                    </span>
                </div>
                <div style="margin-top: 15px;">
                    <p style="color: #64748b;"><strong>Perfil:</strong> linkedin.com/in/${profile.vanityName || profile.id || 'nicolasrosa'}</p>
                    <p style="color: #64748b; margin-top: 5px;"><strong>Última atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                    <p style="color: #94a3b8; margin-top: 10px; font-size: 0.9em; font-style: italic;">
                        💡 Dica: Configure seu token do LinkedIn em <code>.env</code> para ver dados reais da API
                    </p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        // Em caso de erro, mostrar dados básicos mesmo assim
        console.warn('LinkedIn API error:', error);
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        
        html += `
            <div class="stat-card">
                <div class="stat-icon">👤</div>
                <div class="stat-content">
                    <h3>Perfil</h3>
                    <p class="stat-value">Nicolas Rosa</p>
                    <p class="stat-label">Profissional</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🤝</div>
                <div class="stat-content">
                    <h3>Rede</h3>
                    <p class="stat-value">500+</p>
                    <p class="stat-label">Conexões</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <h3>Atividade</h3>
                    <p class="stat-value">45</p>
                    <p class="stat-label">Posts</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                    <h3>Alcance</h3>
                    <p class="stat-value">1.2K</p>
                    <p class="stat-label">Visualizações</p>
                </div>
            </div>
        `;
        html += '</div>';
        
        html += '<div style="margin-bottom: 30px; display: flex; gap: 10px; flex-wrap: wrap;">';
        html += '<a href="https://www.linkedin.com/in/nicolasrosa" target="_blank" class="btn-primary" style="padding: 10px 20px; text-decoration: none; display: inline-block;">👤 Meu Perfil</a>';
        html += '<a href="https://www.linkedin.com/company/avila-devops" target="_blank" class="btn-primary" style="padding: 10px 20px; text-decoration: none; display: inline-block;">🏢 Empresa</a>';
        html += '</div>';
        
        html += '<div class="service-card" style="background: #f0f9ff; border-left: 4px solid #0ea5e9;">';
        html += '<p style="color: #0c4a6e; margin-bottom: 10px;"><strong>ℹ️ Modo de Demonstração</strong></p>';
        html += '<p style="color: #0c4a6e; font-size: 0.9em; line-height: 1.6;">Os dados exibidos são estimativas. Para ver dados reais do LinkedIn:</p>';
        html += '<ol style="color: #0c4a6e; margin: 10px 0 10px 20px; line-height: 1.8; font-size: 0.9em;">';
        html += '<li>Acesse <a href="https://www.linkedin.com/developers/apps" target="_blank" style="color: #0284c7;">LinkedIn Developers</a></li>';
        html += '<li>Crie um aplicativo e gere um Access Token</li>';
        html += '<li>Atualize no arquivo <code>.env</code>: <code>LINKEDIN_CLIENT_TOKEN=seu_token</code></li>';
        html += '<li>Reinicie o servidor</li>';
        html += '</ol>';
        html += '</div>';
        
        container.innerHTML = html;
    }
}

async function loadLinkedInPosts() {
    const container = document.getElementById('linkedin-content');
    container.innerHTML = '<div class="loading"><p>Carregando posts...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/linkedin/posts`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadLinkedInData()" class="btn-primary">← Voltar para Dashboard</button></div>';
        html += `<h3 style="margin-bottom: 20px;">📝 Seus Posts no LinkedIn (${data.posts.length})</h3>`;
        
        if (data.posts.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhum post encontrado recentemente.</p></div>';
        } else {
            data.posts.forEach(post => {
                const created = new Date(post.created?.time || Date.now()).toLocaleDateString('pt-BR');
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <div class="service-title">Post do LinkedIn</div>
                                <p style="color: #64748b; margin-top: 5px;">📅 ${created}</p>
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <p style="color: #64748b;">ID: ${post.id || 'N/A'}</p>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

async function loadLinkedInConnections() {
    const container = document.getElementById('linkedin-content');
    container.innerHTML = '<div class="loading"><p>Carregando conexões...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/linkedin/connections`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadLinkedInData()" class="btn-primary">← Voltar para Dashboard</button></div>';
        html += `<h3 style="margin-bottom: 20px;">🤝 Suas Conexões no LinkedIn</h3>`;
        
        const connections = data.connections.elements || [];
        
        if (connections.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhuma conexão encontrada.</p></div>';
        } else {
            html += `<div class="service-card"><p style="color: #64748b;">Total de conexões: ${connections.length}</p></div>`;
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

function refreshLinkedIn() {
    loadLinkedInData();
}

// LinkedIn Tabs
function showLinkedInTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`linkedin-${tabName}`).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
}

// Growth Tools Functions
function runDailyRoutine() {
    if (confirm('Isso vai executar a rotina diária do LinkedIn. Continuar?')) {
        // Run the batch file
        alert('Execute o arquivo LinkedIn_Daily_Routine.bat no diretório do projeto para iniciar a rotina automatizada.');
    }
}

function showEngagementTemplates() {
    if (confirm('Isso vai mostrar os templates de comentários. Continuar?')) {
        // Run the node script
        alert('Execute: node linkedin-engagement.js templates');
    }
}

function showTodayTasks() {
    if (confirm('Isso vai mostrar as tarefas de hoje. Continuar?')) {
        // Run the node script
        alert('Execute: node linkedin-engagement.js today');
    }
}

function openGrowthMenu() {
    if (confirm('Isso vai abrir o menu de crescimento. Continuar?')) {
        // Run the batch file
        alert('Execute o arquivo LinkedIn_Growth_Menu.bat no diretório do projeto.');
    }
}

function openDailyChecklist() {
    if (confirm('Isso vai abrir o checklist diário. Continuar?')) {
        // Open the markdown file
        alert('Abra o arquivo DAILY_CHECKLIST.md no diretório do projeto para ver o checklist.');
    }
}

// ============================================
// META BUSINESS (FACEBOOK, INSTAGRAM, WHATSAPP)
// ============================================

async function loadMetaData() {
    const container = document.getElementById('meta-content');
    container.innerHTML = '<div class="loading"><p>Carregando dados do Meta Business...</p></div>';
    
    try {
        // Buscar dados do Instagram, Facebook e estatísticas
        const [instagramProfileResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/meta/instagram/profile`).catch(() => null),
            fetch(`${API_BASE}/meta/stats`).catch(() => null)
        ]);
        
        let instagram, stats;
        
        // Se a API falhar, usar dados de demonstração
        if (!instagramProfileResponse || !instagramProfileResponse.ok) {
            // Dados mockados
            instagram = {
                username: 'avilaops',
                name: 'Avila Development',
                followers_count: 1523,
                media_count: 89,
                follows_count: 234,
                profile_picture_url: '',
                biography: 'Desenvolvimento e Soluções Tecnológicas',
                id: 'demo_account'
            };
            stats = {
                instagram: { followers_count: 1523, media_count: 89 },
                facebook: { fan_count: 842, name: 'Avila Inc' }
            };
        } else {
            const instagramData = await instagramProfileResponse.json();
            const statsData = statsResponse ? await statsResponse.json() : null;
            
            if (!instagramData.success) {
                // Fallback
                instagram = {
                    username: 'avilaops',
                    name: 'Avila Development',
                    followers_count: 1523,
                    media_count: 89,
                    follows_count: 234,
                    profile_picture_url: '',
                    biography: 'Desenvolvimento e Soluções Tecnológicas',
                    id: 'demo_account'
                };
                stats = null;
            } else {
                instagram = instagramData.profile;
                stats = statsData && statsData.success ? statsData.stats : null;
            }
        }
        
        let html = '<div class="meta-platforms-grid" style="margin-bottom: 30px;">';
        
        // Instagram Card
        html += `
            <div class="platform-card instagram-card">
                <div class="platform-header">
                    <div class="platform-icon">📷</div>
                    <h3>Instagram</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">${instagram.followers_count?.toLocaleString() || '0'}</span>
                        <span class="stat-label">Seguidores</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${instagram.media_count || '0'}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${instagram.follows_count || '0'}</span>
                        <span class="stat-label">Seguindo</span>
                    </div>
                </div>
                <button onclick="loadInstagramDetails()" class="platform-btn instagram-btn">Ver Detalhes</button>
            </div>
        `;
        
        // Facebook Card
        html += `
            <div class="platform-card facebook-card">
                <div class="platform-header">
                    <div class="platform-icon">👥</div>
                    <h3>Facebook</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">${stats?.facebook?.fan_count?.toLocaleString() || '0'}</span>
                        <span class="stat-label">Curtidas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Alcance</span>
                    </div>
                </div>
                <button onclick="loadFacebookDetails()" class="platform-btn facebook-btn">Ver Detalhes</button>
            </div>
        `;
        
        // WhatsApp Card
        html += `
            <div class="platform-card whatsapp-card">
                <div class="platform-header">
                    <div class="platform-icon">💬</div>
                    <h3>WhatsApp Business</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Mensagens</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Templates</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">✅</span>
                        <span class="stat-label">Status</span>
                    </div>
                </div>
                <button onclick="loadWhatsAppDetails()" class="platform-btn whatsapp-btn">Ver Detalhes</button>
            </div>
        `;
        
        html += '</div>';
        
        // Informações da conta Instagram
        html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">📷 Conta Instagram</h3>';
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${instagram.profile_picture_url ? `<img src="${instagram.profile_picture_url}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%;" onerror="this.style.display='none'">` : '<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #E1306C 0%, #C13584 100%); display: flex; align-items: center; justify-content: center; font-size: 1.8em;">📷</div>'}
                        <div>
                            <div class="service-title">@${instagram.username || 'username'}</div>
                            <p style="color: #64748b; margin-top: 5px;">${instagram.name || 'Nome da conta'}</p>
                        </div>
                    </div>
                    <span class="service-status status-active">✅ Conectado</span>
                </div>
                <div style="margin-top: 15px;">
                    <p style="color: #64748b;"><strong>Bio:</strong> ${instagram.biography || 'Sem biografia'}</p>
                    <p style="color: #64748b; margin-top: 5px;"><strong>ID:</strong> ${instagram.id}</p>
                    <p style="color: #94a3b8; margin-top: 10px; font-size: 0.9em; font-style: italic;">
                        💡 Configure seu Access Token do Meta em <code>.env</code> para dados reais
                    </p>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <a href="https://instagram.com/${instagram.username}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.9em; text-decoration: none;">
                        Ver Perfil →
                    </a>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        // Em caso de erro, mostrar dados de demonstração
        console.warn('Meta API error:', error);
        
        let html = '<div class="meta-platforms-grid" style="margin-bottom: 30px;">';
        
        html += `
            <div class="platform-card instagram-card">
                <div class="platform-header">
                    <div class="platform-icon">📷</div>
                    <h3>Instagram</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">1.5K</span>
                        <span class="stat-label">Seguidores</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">89</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">234</span>
                        <span class="stat-label">Seguindo</span>
                    </div>
                </div>
                <a href="https://instagram.com/avilaops" target="_blank" class="platform-btn instagram-btn">Ver Perfil</a>
            </div>
            
            <div class="platform-card facebook-card">
                <div class="platform-header">
                    <div class="platform-icon">👥</div>
                    <h3>Facebook</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">842</span>
                        <span class="stat-label">Curtidas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Alcance</span>
                    </div>
                </div>
                <a href="https://facebook.com" target="_blank" class="platform-btn facebook-btn">Ver Página</a>
            </div>
            
            <div class="platform-card whatsapp-card">
                <div class="platform-header">
                    <div class="platform-icon">💬</div>
                    <h3>WhatsApp Business</h3>
                </div>
                <div class="platform-stats">
                    <div class="stat-item">
                        <span class="stat-number">✅</span>
                        <span class="stat-label">Ativo</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Templates</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">-</span>
                        <span class="stat-label">Mensagens</span>
                    </div>
                </div>
                <button class="platform-btn whatsapp-btn" disabled style="opacity: 0.6; cursor: not-allowed;">Em Breve</button>
            </div>
        `;
        html += '</div>';
        
        html += '<div class="service-card" style="background: #f0f9ff; border-left: 4px solid #0ea5e9;">';
        html += '<p style="color: #0c4a6e; margin-bottom: 10px;"><strong>ℹ️ Modo de Demonstração</strong></p>';
        html += '<p style="color: #0c4a6e; font-size: 0.9em; line-height: 1.6;">Dados de exemplo. Configure suas credenciais do Meta:</p>';
        html += '<ol style="color: #0c4a6e; margin: 10px 0 10px 20px; line-height: 1.8; font-size: 0.9em;">';
        html += '<li>Acesse <a href="https://developers.facebook.com/" target="_blank" style="color: #0284c7;">Meta for Developers</a></li>';
        html += '<li>Crie um App e obtenha o Access Token</li>';
        html += '<li>Configure permissões: <code>instagram_basic</code>, <code>pages_read_engagement</code></li>';
        html += '<li>Atualize <code>.env</code>: <code>META_ACCESS_TOKEN=seu_token</code></li>';
        html += '<li>Reinicie o servidor</li>';
        html += '</ol>';
        html += '</div>';
        
        container.innerHTML = html;
    }
}

async function loadInstagramDetails() {
    const container = document.getElementById('meta-content');
    container.innerHTML = '<div class="loading"><p>Carregando posts do Instagram...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/meta/instagram/media`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadMetaData()" class="btn-primary">← Voltar para Meta Business</button></div>';
        html += `<h3 style="margin-bottom: 20px;">📷 Posts do Instagram (${data.count})</h3>`;
        
        if (data.media.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhum post encontrado.</p></div>';
        } else {
            html += '<div class="instagram-grid">';
            data.media.forEach(post => {
                const date = new Date(post.timestamp).toLocaleDateString('pt-BR');
                html += `
                    <div class="instagram-post-card">
                        <img src="${post.media_url || post.thumbnail_url}" alt="Post" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;">
                        <div style="padding: 12px;">
                            <p style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">${date}</p>
                            <p style="color: #1e293b; font-size: 0.9em; line-height: 1.4;">${(post.caption || '').substring(0, 100)}...</p>
                            <div style="display: flex; gap: 15px; margin-top: 10px; color: #64748b; font-size: 0.85em;">
                                <span>❤️ ${post.like_count || 0}</span>
                                <span>💬 ${post.comments_count || 0}</span>
                            </div>
                        </div>
                        <a href="${post.permalink}" target="_blank" class="btn-primary" style="display: block; margin: 10px; padding: 8px; text-align: center; text-decoration: none; font-size: 0.85em;">
                            Ver Post →
                        </a>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

async function loadFacebookDetails() {
    const container = document.getElementById('meta-content');
    container.innerHTML = '<div class="loading"><p>Carregando posts do Facebook...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/meta/facebook/posts`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadMetaData()" class="btn-primary">← Voltar para Meta Business</button></div>';
        html += `<h3 style="margin-bottom: 20px;">👥 Posts do Facebook (${data.count})</h3>`;
        
        if (data.posts.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhum post encontrado.</p></div>';
        } else {
            data.posts.forEach(post => {
                const date = new Date(post.created_time).toLocaleDateString('pt-BR');
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <p style="color: #64748b; font-size: 0.85em;">${date}</p>
                                <p style="color: #1e293b; margin-top: 8px; line-height: 1.5;">${post.message || 'Post sem texto'}</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 20px; margin-top: 15px; color: #64748b; font-size: 0.9em;">
                            <span>👍 ${post.likes?.summary?.total_count || 0} likes</span>
                            <span>💬 ${post.comments?.summary?.total_count || 0} comentários</span>
                            <span>🔄 ${post.shares?.count || 0} compartilhamentos</span>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

async function loadWhatsAppDetails() {
    const container = document.getElementById('meta-content');
    container.innerHTML = '<div class="loading"><p>Carregando informações do WhatsApp...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/meta/whatsapp/info`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div style="margin-bottom: 20px;"><button onclick="loadMetaData()" class="btn-primary">← Voltar para Meta Business</button></div>';
        html += `<h3 style="margin-bottom: 20px;">💬 WhatsApp Business</h3>`;
        
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${data.info.name || 'WhatsApp Business'}</div>
                        <p style="color: #64748b; margin-top: 5px;">ID: ${data.info.id}</p>
                    </div>
                    <span class="service-status status-active">✅ Ativo</span>
                </div>
                <div style="margin-top: 15px;">
                    <p style="color: #64748b;"><strong>Timezone:</strong> ${data.info.timezone_id || 'N/A'}</p>
                    <p style="color: #64748b; margin-top: 5px;"><strong>Namespace:</strong> ${data.info.message_template_namespace || 'N/A'}</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;"><p><strong>Erro:</strong> ${error.message}</p></div>`;
    }
}

function refreshMeta() {
    loadMetaData();
}

// Calendário de Compromissos
function loadCalendarioData() {
    carregarCompromissos();
    
    // Setup do formulário
    const form = document.getElementById('calendar-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        agendarCompromisso();
    };
}

function carregarCompromissos() {
    const compromissos = JSON.parse(localStorage.getItem('compromissos') || '[]');
    const container = document.getElementById('lista-compromissos');
    
    if (compromissos.length === 0) {
        container.innerHTML = '<div class="service-card"><p style="color: #64748b;">Nenhum compromisso agendado ainda.</p></div>';
        return;
    }
    
    let html = '';
    compromissos.forEach((comp, index) => {
        const dataFormatada = new Date(comp.data + 'T' + comp.hora).toLocaleString('pt-BR');
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${comp.titulo}</div>
                        <p style="color: #64748b; margin-top: 5px;">${comp.descricao || 'Sem descrição'}</p>
                    </div>
                    <span class="service-status status-active">⏰ ${dataFormatada}</span>
                </div>
                <button onclick="removerCompromisso(${index})" style="margin-top: 10px; background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                    🗑️ Remover
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function agendarCompromisso() {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const lembrete = document.getElementById('lembrete').value;
    
    // Salvar no localStorage
    const compromissos = JSON.parse(localStorage.getItem('compromissos') || '[]');
    compromissos.push({ titulo, descricao, data, hora, lembrete });
    localStorage.setItem('compromissos', JSON.stringify(compromissos));
    
    // Criar script PowerShell para Windows Task Scheduler
    const dataHora = new Date(data + 'T' + hora);
    const dataNotificacao = new Date(dataHora.getTime() - lembrete * 60000);
    
    const script = `
# Script de agendamento de compromisso
$taskName = "Compromisso_${titulo.replace(/[^a-zA-Z0-9]/g, '_')}"
$action = New-ScheduledTaskAction -Execute "msg" -Argument "* /TIME:0 'COMPROMISSO: ${titulo} - ${descricao}'"
$trigger = New-ScheduledTaskTrigger -Once -At "${dataNotificacao.toISOString()}"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Compromisso agendado com sucesso no Windows Task Scheduler!"
Write-Host "Nome da tarefa: $taskName"
Write-Host "Data/Hora: ${dataHora.toLocaleString('pt-BR')}"
`;
    
    // Download do script
    const blob = new Blob([script], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendar_${titulo.replace(/[^a-zA-Z0-9]/g, '_')}.ps1`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Limpar formulário
    document.getElementById('calendar-form').reset();
    
    // Recarregar lista
    carregarCompromissos();
    
    alert('✅ Compromisso salvo! Execute o arquivo .ps1 baixado para agendar no Windows Task Scheduler.');
}

function removerCompromisso(index) {
    if (confirm('Deseja realmente remover este compromisso?')) {
        const compromissos = JSON.parse(localStorage.getItem('compromissos') || '[]');
        compromissos.splice(index, 1);
        localStorage.setItem('compromissos', JSON.stringify(compromissos));
        carregarCompromissos();
    }
}

async function enviarEmailCompromisso() {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    
    if (!titulo || !data || !hora) {
        alert('❌ Preencha pelo menos o título, data e hora!');
        return;
    }
    
    const dataFormatada = new Date(data + 'T' + hora).toLocaleString('pt-BR');
    
    const assunto = `Compromisso Agendado: ${titulo}`;
    const mensagem = `
Compromisso Agendado com Sucesso!

📅 Título: ${titulo}
📝 Descrição: ${descricao || 'Sem descrição'}
⏰ Data e Hora: ${dataFormatada}

Este é um lembrete automático do seu compromisso.

---
Avila Dashboard - Sistema de Gerenciamento
`;
    
    try {
        const response = await fetch(`${API_BASE}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'nicolasrosaab@gmail.com',
                to: 'nicolasrosaab@gmail.com',
                subject: assunto,
                text: mensagem
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Email enviado com sucesso!');
        } else {
            alert('❌ Erro ao enviar email: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erro ao enviar email: ' + error.message);
    }
}

// MongoDB Atlas - DADOS REAIS
async function loadMongoDBData() {
    const container = document.getElementById('mongodb-content');
    container.innerHTML = '<div class="loading"><p>Conectando ao MongoDB Atlas...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/mongodb/databases`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        html += `<div class="stat-card">
            <div class="stat-icon">🍃</div>
            <div class="stat-content">
                <h3>Total Databases</h3>
                <p class="stat-value">${data.databases.length}</p>
            </div>
        </div>`;
        
        const totalCollections = data.databases.reduce((sum, db) => sum + db.collections.length, 0);
        html += `<div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
                <h3>Total Collections</h3>
                <p class="stat-value">${totalCollections}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">🗄️ Databases</h3>';
        
        data.databases.forEach(db => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${db.name}</div>
                            <p style="color: #64748b; margin-top: 5px;">
                                ${db.collections.length} collections • 
                                ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <span class="service-status status-active">✅ Ativo</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <h4 style="margin-bottom: 10px; color: #64748b;">Collections:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${db.collections.map(coll => `
                                <button onclick="viewCollection('${db.name}', '${coll.name}')" 
                                    class="btn-primary" style="padding: 8px 16px; font-size: 0.9em;">
                                    📄 ${coll.name} (${coll.documentCount} docs)
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
            <p style="margin-top: 10px;">Certifique-se de que o servidor backend está rodando!</p>
        </div>`;
    }
}

async function viewCollection(dbName, collName) {
    try {
        const response = await fetch(`${API_BASE}/mongodb/collection/${dbName}/${collName}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 900px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>📄 ${collName}</h2>
                    <button onclick="this.closest('[style*=fixed]').remove()" 
                        style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        ✕ Fechar
                    </button>
                </div>
                <p style="color: #64748b; margin-bottom: 20px;">Total de documentos: ${data.totalCount}</p>
                <pre style="background: #f1f5f9; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 0.9em;">${JSON.stringify(data.documents, null, 2)}</pre>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    } catch (error) {
        alert('Erro ao carregar collection: ' + error.message);
    }
}

// Railway - DADOS REAIS
async function loadRailwayData() {
    const container = document.getElementById('railway-content');
    container.innerHTML = '<div class="loading"><p>Carregando projetos do Railway...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/railway/projects`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        html += `<div class="stat-card">
            <div class="stat-icon">🚂</div>
            <div class="stat-content">
                <h3>Total Projetos</h3>
                <p class="stat-value">${data.projects.length}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">🚂 Projetos Railway</h3>';
        
        if (data.projects.length === 0) {
            html += '<div class="service-card"><p style="color: #64748b;">Nenhum projeto encontrado no Railway.</p></div>';
        }
        
        data.projects.forEach(project => {
            const proj = project.node;
            const created = new Date(proj.createdAt).toLocaleDateString('pt-BR');
            const updated = proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString('pt-BR') : 'N/A';
            
            // Verifica status do deployment
            const deploymentStatus = proj.deploymentStatus || proj.status || 'unknown';
            let statusClass = 'status-inactive';
            let statusText = '⚠️ Status Desconhecido';
            
            if (deploymentStatus === 'SUCCESS' || deploymentStatus === 'ACTIVE') {
                statusClass = 'status-active';
                statusText = '✅ Ativo';
            } else if (deploymentStatus === 'FAILED' || deploymentStatus === 'CRASHED') {
                statusClass = 'status-inactive';
                statusText = '❌ Falhou';
            } else if (deploymentStatus === 'BUILDING' || deploymentStatus === 'DEPLOYING') {
                statusClass = 'status-warning';
                statusText = '🔄 Implantando';
            } else if (deploymentStatus === 'REMOVED' || deploymentStatus === 'INACTIVE') {
                statusClass = 'status-inactive';
                statusText = '🔴 Inativo';
            }
            
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${proj.name}</div>
                            <p style="color: #64748b; margin-top: 5px;">${proj.description || 'Sem descrição'}</p>
                        </div>
                        <span class="service-status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="margin-top: 15px; color: #64748b; font-size: 0.9em;">
                        <p>📅 Criado: ${created}</p>
                        <p>🔄 Atualizado: ${updated}</p>
                        <p style="font-size: 0.85em; margin-top: 5px; color: #94a3b8;">ID: ${proj.id}</p>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="https://railway.app/project/${proj.id}" target="_blank" 
                           class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.9em; text-decoration: none;">
                            Ver no Railway →
                        </a>
                    </div>
                </div>
            `;
        });
        
        html += '<div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">';
        html += '<p style="color: #92400e; margin: 0;"><strong>⚠️ Aviso:</strong> Para ver o status real dos deployments, é necessário incluir dados de deployment na query GraphQL do Railway.</p>';
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>❌ Erro ao carregar Railway:</strong> ${error.message}</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Verifique se o token do Railway está válido e se tem permissões adequadas.</p>
        </div>`;
    }
}

// Payments - DADOS REAIS do Stripe
async function loadPaymentsData() {
    const container = document.getElementById('payments-content');
    container.innerHTML = '<div class="loading"><p>Carregando dados do Stripe...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/stripe/balance`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        const available = data.balance.available[0] || { amount: 0, currency: 'usd' };
        const pending = data.balance.pending[0] || { amount: 0, currency: 'usd' };
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <h3>Saldo Disponível</h3>
                <p class="stat-value">$${(available.amount / 100).toFixed(2)}</p>
                <p class="stat-label">${available.currency.toUpperCase()}</p>
            </div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
                <h3>Saldo Pendente</h3>
                <p class="stat-value">$${(pending.amount / 100).toFixed(2)}</p>
                <p class="stat-label">${pending.currency.toUpperCase()}</p>
            </div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
                <h3>Clientes</h3>
                <p class="stat-value">${data.customers.length}</p>
                <p class="stat-label">Total</p>
            </div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-icon">💳</div>
            <div class="stat-content">
                <h3>Transações</h3>
                <p class="stat-value">${data.charges.length}</p>
                <p class="stat-label">Últimas</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0; font-size: 1.3em;">💳 Últimas Transações</h3>';
        
        data.charges.forEach(charge => {
            const date = new Date(charge.created * 1000).toLocaleDateString('pt-BR');
            const status = charge.paid ? 'status-active' : 'status-inactive';
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">$${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}</div>
                            <p style="color: #64748b; margin-top: 5px;">${charge.description || 'Sem descrição'}</p>
                        </div>
                        <span class="service-status ${status}">
                            ${charge.paid ? '✅ Pago' : '❌ Falhou'}
                        </span>
                    </div>
                    <div style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                        ${date}
                    </div>
                </div>
            `;
        });
        
        html += '<div style="margin-top: 30px;">';
        html += '<a href="https://dashboard.stripe.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; margin-right: 10px;">Abrir Stripe Dashboard →</a>';
        html += '<a href="https://www.paypal.com/businessmanage/account/overview" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">Abrir PayPal →</a>';
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}

// Cargo Registry
function loadCargoData() {
    const container = document.getElementById('cargo-content');
    
    let html = '<div class="stats-grid">';
    html += `<div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
            <h3>Cargo Token</h3>
            <p class="stat-value">Configurado</p>
            <p class="stat-label">Token ativo</p>
        </div>
    </div>`;
    html += '</div>';
    
    html += '<div class="service-card">';
    html += '<h3 style="margin-bottom: 15px;">🦀 Cargo Registry</h3>';
    html += '<p style="color: #64748b; line-height: 1.6;">Token de autenticação configurado para publicar pacotes no Cargo Registry (crates.io).</p>';
    html += '<div style="margin-top: 20px;">';
    html += '<a href="https://crates.io/me" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">Abrir Cargo.io →</a>';
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
}

// Azure DevOps - DADOS REAIS
async function loadAzureData() {
    const container = document.getElementById('azure-content');
    container.innerHTML = '<div class="loading"><p>Carregando dados do Azure DevOps...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/azure/organizations`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">☁️</div>
            <div class="stat-content">
                <h3>Organizations</h3>
                <p class="stat-value">${data.organizations.length}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0;">☁️ Organizações Azure DevOps</h3>';
        
        data.organizations.forEach(org => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${org.accountName}</div>
                            <p style="color: #64748b; margin-top: 5px;">ID: ${org.accountId}</p>
                        </div>
                        <span class="service-status status-active">✅ Ativo</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="https://dev.azure.com/${org.accountName}" target="_blank" 
                           class="btn-primary" style="display: inline-block; text-decoration: none;">
                            Abrir Organização →
                        </a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}

// Google Cloud
async function loadGCloudData() {
    const container = document.getElementById('gcloud-content');
    container.innerHTML = '<div class="loading"><p>Carregando projetos do Google Cloud...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/gcloud/projects`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-content">
                <h3>Projetos</h3>
                <p class="stat-value">${data.projects.length}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0;">🌐 Projetos Google Cloud</h3>';
        
        data.projects.forEach(project => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${project.name}</div>
                            <p style="color: #64748b; margin-top: 5px;">${project.projectId}</p>
                        </div>
                        <span class="service-status status-${project.lifecycleState === 'ACTIVE' ? 'active' : 'inactive'}">
                            ${project.lifecycleState === 'ACTIVE' ? '✅ Ativo' : '⏸️ Inativo'}
                        </span>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="https://console.cloud.google.com/home/dashboard?project=${project.projectId}" target="_blank" 
                           class="btn-primary" style="display: inline-block; text-decoration: none;">
                            Abrir Console →
                        </a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}

// Gmail - 3 CONTAS
function loadGmailData() {
    const container = document.getElementById('gmail-content');
    
    const accounts = [
        { email: 'nicolasrosaab@gmail.com', password: 'bssohqfhkggqtgfk', name: 'Nicolas Rosa (Principal)' },
        { email: 'nicolas@avila.inc', password: 'ioqb tkaw vssc whbs', name: 'Nicolas Avila Inc' },
        { email: 'rodrigo.silvapereira87@gmail.com', password: 'xckl llqp izsz zveg', name: 'Rodrigo Silva' }
    ];
    
    let html = '<div class="stats-grid">';
    html += `<div class="stat-card">
        <div class="stat-icon">📧</div>
        <div class="stat-content">
            <h3>Contas Gmail</h3>
            <p class="stat-value">${accounts.length}</p>
            <p class="stat-label">Configuradas</p>
        </div>
    </div>`;
    html += '</div>';
    
    html += '<h3 style="margin: 30px 0 20px 0;">📧 Enviar Email</h3>';
    
    html += `
        <div class="service-card">
            <div style="display: grid; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #64748b;">De (Conta):</label>
                    <select id="email-from" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1em;">
                        ${accounts.map(acc => `<option value="${acc.email}">${acc.name} (${acc.email})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #64748b;">Para:</label>
                    <input type="email" id="email-to" placeholder="destinatario@example.com" 
                        style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1em;" required>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #64748b;">Assunto:</label>
                    <input type="text" id="email-subject" placeholder="Assunto do email" 
                        style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1em;" required>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #64748b;">Mensagem:</label>
                    <textarea id="email-message" rows="6" placeholder="Digite sua mensagem aqui..." 
                        style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1em; resize: vertical;" required></textarea>
                </div>
                <button onclick="sendEmailIntegrated()" class="btn-primary" style="padding: 14px; font-size: 1.1em;">
                    ✉️ Enviar Email Agora
                </button>
                <div id="email-status" style="margin-top: 10px;"></div>
            </div>
        </div>
    `;
    
    html += '<h3 style="margin: 30px 0 20px 0;">📧 Contas Configuradas</h3>';
    
    accounts.forEach((acc, index) => {
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${acc.name}</div>
                        <p style="color: #64748b; margin-top: 5px;">${acc.email}</p>
                    </div>
                    <span class="service-status status-active">✅ App Password Ativa</span>
                </div>
                <div style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                    <p>App Password: ${acc.password.substring(0, 4)}...${acc.password.substring(acc.password.length - 4)}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function sendEmailIntegrated() {
    const from = document.getElementById('email-from').value;
    const to = document.getElementById('email-to').value;
    const subject = document.getElementById('email-subject').value;
    const message = document.getElementById('email-message').value;
    const status = document.getElementById('email-status');
    
    if (!to || !subject || !message) {
        status.innerHTML = '<p style="color: #ef4444;">❌ Preencha todos os campos!</p>';
        return;
    }
    
    status.innerHTML = '<p style="color: #3b82f6;">📤 Enviando email...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, subject, text: message })
        });
        
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        status.innerHTML = '<p style="color: #10b981;">✅ Email enviado com sucesso!</p>';
        
        // Limpar campos
        document.getElementById('email-to').value = '';
        document.getElementById('email-subject').value = '';
        document.getElementById('email-message').value = '';
        
    } catch (error) {
        status.innerHTML = `<p style="color: #ef4444;">❌ Erro: ${error.message}</p>`;
    }
}

// DNS - Porkbun
async function loadDNSData() {
    const container = document.getElementById('dns-content');
    container.innerHTML = '<div class="loading"><p>Carregando domínios...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/dns/domains`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-content">
                <h3>Domínios</h3>
                <p class="stat-value">${data.domains.length}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0;">🌐 Domínios Porkbun</h3>';
        
        data.domains.forEach(domain => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${domain.domain}</div>
                            <p style="color: #64748b; margin-top: 5px;">
                                Expira: ${new Date(domain.expire).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <span class="service-status status-${domain.status === 'active' ? 'active' : 'inactive'}">
                            ${domain.status === 'active' ? '✅ Ativo' : '⏸️ Inativo'}
                        </span>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="https://porkbun.com/account/domains/${domain.domain}" target="_blank" 
                           class="btn-primary" style="display: inline-block; text-decoration: none; margin-right: 10px;">
                            Gerenciar DNS →
                        </a>
                        <a href="https://dash.cloudflare.com" target="_blank" 
                           class="btn-primary" style="display: inline-block; text-decoration: none;">
                            Cloudflare →
                        </a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}

// AI Services - OpenAI, DeepSeek, HuggingFace, Ollama
async function loadAIData() {
    const container = document.getElementById('ai-content');
    container.innerHTML = '<div class="loading"><p>Carregando dados de AI...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/openai/usage`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">🤖</div>
            <div class="stat-content">
                <h3>OpenAI</h3>
                <p class="stat-value">${data.models.length}</p>
                <p class="stat-label">Modelos Disponíveis</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0;">🤖 Modelos OpenAI</h3>';
        
        data.models.slice(0, 10).forEach(model => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <div>
                            <div class="service-title">${model.id}</div>
                            <p style="color: #64748b; margin-top: 5px;">Por: ${model.owned_by}</p>
                        </div>
                        <span class="service-status status-active">✅ Disponível</span>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div style="margin-top: 30px;">
                <h3 style="margin-bottom: 15px;">🔑 Outros Serviços de AI</h3>
                <div class="service-card">
                    <p><strong>🌊 DeepSeek:</strong> Token configurado</p>
                    <p style="margin-top: 10px;"><strong>🤗 HuggingFace:</strong> Token configurado</p>
                    <p style="margin-top: 10px;"><strong>🦙 Ollama:</strong> Endpoint disponível</p>
                    <p style="margin-top: 10px;"><strong>🔗 LangSmith:</strong> API Key configurada</p>
                </div>
                <div style="margin-top: 15px;">
                    <a href="https://platform.openai.com/usage" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; margin-right: 10px;">OpenAI Dashboard →</a>
                    <a href="https://huggingface.co/settings/tokens" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">HuggingFace →</a>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}

// Gravatar
function loadGravatarData() {
    const container = document.getElementById('gravatar-content');
    
    const gravatarEmail = 'nicolasrosaab@gmail.com';
    const hash = 'MD5_HASH_HERE'; // Seria calculado no backend
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
    
    let html = '<div class="service-card">';
    html += '<h3 style="margin-bottom: 20px;">👤 Gravatar Profile</h3>';
    html += `<div style="display: flex; align-items: center; gap: 20px;">`;
    html += `<img src="${gravatarUrl}" alt="Gravatar" style="width: 100px; height: 100px; border-radius: 50%;">`;
    html += `<div>
        <p><strong>Email:</strong> ${gravatarEmail}</p>
        <p style="margin-top: 10px;"><strong>Token:</strong> Configurado</p>
        <div style="margin-top: 15px;">
            <a href="https://gravatar.com" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                Gerenciar Gravatar →
            </a>
        </div>
    </div>`;
    html += `</div>`;
    html += '</div>';
    
    container.innerHTML = html;
}

// Sentry - DADOS REAIS
async function loadSentryData() {
    const container = document.getElementById('sentry-content');
    container.innerHTML = '<div class="loading"><p>Carregando issues do Sentry...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/sentry/issues`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        let html = '<div class="stats-grid">';
        html += `<div class="stat-card">
            <div class="stat-icon">🐛</div>
            <div class="stat-content">
                <h3>Issues Abertas</h3>
                <p class="stat-value">${data.issues.length}</p>
            </div>
        </div>`;
        html += '</div>';
        
        html += '<h3 style="margin: 30px 0 20px 0;">🐛 Issues do Sentry</h3>';
        
        if (data.issues.length === 0) {
            html += '<div class="service-card"><p style="color: #10b981;">✅ Nenhuma issue aberta! Tudo funcionando bem.</p></div>';
        } else {
            data.issues.forEach(issue => {
                html += `
                    <div class="service-card">
                        <div class="service-header">
                            <div>
                                <div class="service-title">${issue.title}</div>
                                <p style="color: #64748b; margin-top: 5px;">${issue.culprit}</p>
                            </div>
                            <span class="service-status status-warning">⚠️ ${issue.count} eventos</span>
                        </div>
                        <div style="margin-top: 15px;">
                            <a href="${issue.permalink}" target="_blank" 
                               class="btn-primary" style="display: inline-block; text-decoration: none;">
                                Ver Detalhes →
                            </a>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="service-card" style="background: #fee2e2; color: #991b1b;">
            <p><strong>Erro:</strong> ${error.message}</p>
        </div>`;
    }
}
async function loadCargoData() {
    const container = document.getElementById('cargo-content');
    container.innerHTML = `
        <div class="service-card">
            <div class="service-header">
                <div>
                    <div class="service-title">📦 Cargo Registry</div>
                    <p style="color: #64748b; margin-top: 10px;">
                        Usuário: <strong>avilaops</strong><br>
                        Token configurado: ✅
                    </p>
                </div>
                <span class="service-status status-active">Ativo</span>
            </div>
            <div style="margin-top: 20px;">
                <p style="margin-bottom: 15px;">Acesse crates.io para ver seus pacotes publicados:</p>
                <a href="https://crates.io/users/avilaops" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Ver Pacotes no Crates.io →
                </a>
            </div>
        </div>
        
        <div class="service-card" style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px;">🔑 Token Configurado</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.9em;">
                ${CONFIG.cargo.token.substring(0, 20)}...
            </div>
            <p style="margin-top: 10px; color: #64748b; font-size: 0.9em;">
                Use este token para publicar pacotes via cargo publish
            </p>
        </div>
    `;
    
    document.getElementById('cargo-count').textContent = '---';
}

// Gmail
function loadGmailData() {
    const container = document.getElementById('gmail-content');
    
    let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
    html += `<div class="stat-card">
        <div class="stat-icon">📧</div>
        <div class="stat-content">
            <h3>Contas Gmail</h3>
            <p class="stat-value">3</p>
            <p class="stat-label">Configuradas e ativas</p>
        </div>
    </div>`;
    html += '</div>';
    
    html += '<h3 style="margin-bottom: 20px; font-size: 1.3em;">📬 Suas Contas Gmail</h3>';
    
    CONFIG.gmail.forEach((account, index) => {
        const password = account.password.replace(/ /g, '');
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${account.name}</div>
                        <p style="color: #64748b; margin-top: 5px;">${account.email}</p>
                    </div>
                    <span class="service-status status-active">✅ Configurado</span>
                </div>
                <div style="margin-top: 20px;">
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin-bottom: 8px;"><strong>App Password:</strong></p>
                        <code style="background: white; padding: 8px 12px; border-radius: 4px; display: inline-block; font-family: monospace;">
                            ${password}
                        </code>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="https://mail.google.com/mail/u/${index}" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 10px 20px;">
                            📧 Abrir Gmail
                        </a>
                        <button onclick="copiarSenha('${password}')" class="btn-primary" style="background: #10b981;">
                            📋 Copiar Senha
                        </button>
                        <button onclick="testarSMTP('${account.email}', '${password}')" class="btn-primary" style="background: #f59e0b;">
                            ✉️ Testar SMTP
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Continue com as outras funções...
function loadAzureData() {
    const container = document.getElementById('azure-content');
    container.innerHTML = `
        <div class="service-card">
            <div class="service-header">
                <div>
                    <div class="service-title">☁️ Azure DevOps</div>
                    <p style="color: #64748b; margin-top: 10px;">Token configurado e ativo</p>
                </div>
                <span class="service-status status-active">Ativo</span>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://dev.azure.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Azure DevOps →
                </a>
            </div>
        </div>
    `;
}

function loadGCloudData() {
    const container = document.getElementById('gcloud-content');
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🌐</div>
                <div class="stat-content">
                    <h3>Google Cloud</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">API Key configurada</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🗺️</div>
                <div class="stat-content">
                    <h3>Maps API</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">ID configurado</p>
                </div>
            </div>
        </div>
        
        <div class="service-card" style="margin-top: 20px;">
            <div class="service-header">
                <div class="service-title">🔑 Credenciais</div>
            </div>
            <div style="margin-top: 15px;">
                <p><strong>Client ID:</strong></p>
                <code style="background: #f1f5f9; padding: 10px; display: block; margin: 10px 0; border-radius: 4px; overflow-x: auto;">
                    ${CONFIG.gcloud.clientId}
                </code>
                <p style="margin-top: 15px;"><strong>Maps ID:</strong></p>
                <code style="background: #f1f5f9; padding: 10px; display: block; margin: 10px 0; border-radius: 4px;">
                    10bcdd0ea82db0dc1d5d55eb
                </code>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://console.cloud.google.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Console GCloud →
                </a>
            </div>
        </div>
    `;
}

function loadDNSData() {
    const container = document.getElementById('dns-content');
    container.innerHTML = `
        <div class="service-card">
            <div class="service-header">
                <div>
                    <div class="service-title">🌍 Porkbun DNS</div>
                    <p style="color: #64748b; margin-top: 5px;">Gerenciamento de domínios</p>
                </div>
                <span class="service-status status-active">Ativo</span>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://porkbun.com/account/domainsSpeedy" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Gerenciar DNS →
                </a>
            </div>
        </div>
        
        <div class="service-card" style="margin-top: 20px;">
            <div class="service-header">
                <div>
                    <div class="service-title">☁️ Cloudflare</div>
                    <p style="color: #64748b; margin-top: 5px;">CDN e segurança</p>
                </div>
                <span class="service-status status-active">Ativo</span>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://dash.cloudflare.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Cloudflare →
                </a>
            </div>
        </div>
    `;
}

function loadPaymentsData() {
    const container = document.getElementById('payments-content');
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">💳</div>
                <div class="stat-content">
                    <h3>PayPal</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">Configurado</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💎</div>
                <div class="stat-content">
                    <h3>Stripe</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">Teste + Produção</p>
                </div>
            </div>
        </div>
        
        <div class="service-card" style="margin-top: 20px;">
            <div class="service-title">💳 PayPal</div>
            <div style="margin-top: 15px;">
                <a href="https://www.paypal.com/businessmanage/account/overview" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Dashboard PayPal →
                </a>
            </div>
        </div>
        
        <div class="service-card" style="margin-top: 20px;">
            <div class="service-title">💎 Stripe</div>
            <div style="margin-top: 15px;">
                <a href="https://dashboard.stripe.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Dashboard Stripe →
                </a>
            </div>
        </div>
    `;
}

function loadAIData() {
    const container = document.getElementById('ai-content');
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🤖</div>
                <div class="stat-content">
                    <h3>OpenAI</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">GPT-4 Turbo</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🦜</div>
                <div class="stat-content">
                    <h3>LangSmith</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">Configurado</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🤗</div>
                <div class="stat-content">
                    <h3>HuggingFace</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">Token ativo</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🦙</div>
                <div class="stat-content">
                    <h3>DeepSeek</h3>
                    <p class="stat-value">✓</p>
                    <p class="stat-label">API ativa</p>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <a href="https://platform.openai.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; margin-right: 10px;">
                OpenAI Dashboard →
            </a>
            <a href="https://huggingface.co/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                HuggingFace →
            </a>
        </div>
    `;
}

function loadGravatarData() {
    const container = document.getElementById('gravatar-content');
    container.innerHTML = `
        <div class="service-card">
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="https://www.gravatar.com/avatar/6711" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary-color);">
                <div>
                    <div class="service-title">👤 Seu Gravatar</div>
                    <p style="color: #64748b; margin-top: 5px;">Imagem de perfil global</p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://gravatar.com/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Gerenciar Gravatar →
                </a>
            </div>
        </div>
    `;
}

function loadSentryData() {
    const container = document.getElementById('sentry-content');
    container.innerHTML = `
        <div class="service-card">
            <div class="service-header">
                <div>
                    <div class="service-title">🐛 Sentry</div>
                    <p style="color: #64748b; margin-top: 5px;">Error tracking e monitoring</p>
                </div>
                <span class="service-status status-active">Ativo</span>
            </div>
            <div style="margin-top: 20px;">
                <a href="https://sentry.io/organizations/avila-0l/" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
                    Abrir Sentry Dashboard →
                </a>
            </div>
        </div>
    `;
}

// Helper functions
function copiarSenha(senha) {
    navigator.clipboard.writeText(senha).then(() => {
        alert('✓ Senha copiada para a área de transferência!');
    });
}

function testarSMTP(email, senha) {
    alert(`Testando SMTP para ${email}...\n\nPara testar, use o script PowerShell em C:\\calendario-tarefas\\teste_completo_email.ps1`);
}

function refreshGitHub() {
    loadGitHubData();
}

function refreshCargo() {
    loadCargoData();
}

function refreshAzure() {
    loadAzureData();
}

// CRM & Leads Management
async function loadCRMData() {
    const container = document.getElementById('crm-content');
    container.innerHTML = '<div class="loading">⏳ Carregando dados do CRM...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        const leads = data.leads || [];
        
        // Estatísticas
        const stats = {
            total: leads.length,
            novos: leads.filter(l => l.status === 'novo').length,
            negociacao: leads.filter(l => l.status === 'negociacao').length,
            proposta: leads.filter(l => l.status === 'proposta').length,
            fechado: leads.filter(l => l.status === 'fechado').length,
            perdido: leads.filter(l => l.status === 'perdido').length
        };
        
        let html = '<div class="stats-grid" style="margin-bottom: 30px;">';
        
        html += `
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <h3>Total de Leads</h3>
                    <p class="stat-value">${stats.total}</p>
                    <p class="stat-label">Cadastrados</p>
                </div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #f59e0b;">
                <div class="stat-icon">🟡</div>
                <div class="stat-content">
                    <h3>Novos</h3>
                    <p class="stat-value">${stats.novos}</p>
                    <p class="stat-label">Aguardando contato</p>
                </div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #3b82f6;">
                <div class="stat-icon">💬</div>
                <div class="stat-content">
                    <h3>Em Negociação</h3>
                    <p class="stat-value">${stats.negociacao}</p>
                    <p class="stat-label">Em andamento</p>
                </div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #10b981;">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <h3>Vendas Fechadas</h3>
                    <p class="stat-value">${stats.fechado}</p>
                    <p class="stat-label">Clientes ativos</p>
                </div>
            </div>
        `;
        html += '</div>';
        
        // Botão para adicionar lead manualmente
        html += '<div style="margin-bottom: 20px;">';
        html += '<button onclick="showAddLeadForm()" class="btn-primary" style="padding: 12px 24px;">➕ Adicionar Lead Manualmente</button>';
        html += '</div>';
        
        // Funil de vendas visual
        html += '<h3 style="margin: 30px 0 20px 0;">🎯 Pipeline de Vendas</h3>';
        html += '<div class="crm-pipeline">';
        
        const pipeline = [
            { status: 'novo', label: '🟡 Novos', count: stats.novos, color: '#f59e0b' },
            { status: 'negociacao', label: '🔵 Negociação', count: stats.negociacao, color: '#3b82f6' },
            { status: 'proposta', label: '🟣 Proposta Enviada', count: stats.proposta, color: '#8b5cf6' },
            { status: 'fechado', label: '🟢 Fechado', count: stats.fechado, color: '#10b981' }
        ];
        
        pipeline.forEach(stage => {
            const percentage = stats.total > 0 ? Math.round((stage.count / stats.total) * 100) : 0;
            html += `
                <div class="pipeline-stage" style="border-left: 4px solid ${stage.color};">
                    <div class="pipeline-header">
                        <span>${stage.label}</span>
                        <span class="pipeline-count">${stage.count}</span>
                    </div>
                    <div class="pipeline-bar">
                        <div class="pipeline-fill" style="width: ${percentage}%; background: ${stage.color};"></div>
                    </div>
                    <p style="font-size: 0.85em; color: #64748b; margin-top: 5px;">${percentage}% do total</p>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Lista de leads
        html += '<h3 style="margin: 30px 0 20px 0;">📋 Lista de Leads</h3>';
        
        if (leads.length === 0) {
            html += '<div class="service-card" style="text-align: center; padding: 40px;">';
            html += '<p style="font-size: 1.2em; color: #64748b;">Nenhum lead cadastrado ainda</p>';
            html += '<p style="color: #94a3b8; margin-top: 10px;">Aguardando formulários de cadastro ou adicione manualmente</p>';
            html += '</div>';
        } else {
            leads.forEach(lead => {
                const statusConfig = {
                    novo: { color: '#f59e0b', icon: '🟡', label: 'Novo Lead' },
                    negociacao: { color: '#3b82f6', icon: '🔵', label: 'Em Negociação' },
                    proposta: { color: '#8b5cf6', icon: '🟣', label: 'Proposta Enviada' },
                    fechado: { color: '#10b981', icon: '🟢', label: 'Venda Fechada' },
                    perdido: { color: '#ef4444', icon: '🔴', label: 'Perdido' }
                };
                
                const config = statusConfig[lead.status] || statusConfig.novo;
                const createdDate = new Date(lead.createdAt).toLocaleDateString('pt-BR');
                
                html += `
                    <div class="service-card lead-card" style="border-left: 4px solid ${config.color};">
                        <div class="lead-header">
                            <div>
                                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                    ${config.icon} ${lead.nome || lead.empresa || 'Sem nome'}
                                </h3>
                                <p style="color: #64748b; margin: 5px 0 0 0;">${lead.email}</p>
                            </div>
                            <span class="lead-status-badge" style="background: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color};">
                                ${config.label}
                            </span>
                        </div>
                        <div class="lead-details">
                            <p><strong>📱 Telefone:</strong> ${lead.telefone || 'Não informado'}</p>
                            <p><strong>💼 Tipo:</strong> ${lead.tipoProjeto || 'Não especificado'}</p>
                            <p><strong>💰 Orçamento:</strong> ${lead.orcamento || 'Não informado'}</p>
                            <p><strong>📅 Cadastrado em:</strong> ${createdDate}</p>
                            ${lead.descricao ? `<p><strong>📝 Descrição:</strong> ${lead.descricao}</p>` : ''}
                            ${lead.emailsSent ? `<p style="color: #10b981;"><strong>📧 Emails enviados:</strong> ${lead.emailsSent}/5</p>` : ''}
                            ${lead.patent ? `
                                <div style="margin-top: 15px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 6px;">
                                    <p style="color: #10b981; font-weight: 600; margin-bottom: 8px;">
                                        ${lead.patent.hasPatent ? '✓ Patente Verificada' : '⊘ Sem Patente'}
                                    </p>
                                    ${lead.patent.hasPatent && lead.patent.number ? `
                                        <p style="margin: 4px 0; color: #334155;">
                                            <strong>Número:</strong> ${lead.patent.number}
                                        </p>
                                    ` : ''}
                                </div>
                            ` : ''}
                            ${lead.extras && lead.extras.length > 0 ? `
                                <div style="margin-top: 15px; padding: 12px; background: rgba(251, 191, 36, 0.1); border-left: 3px solid #f59e0b; border-radius: 6px;">
                                    <p style="color: #f59e0b; font-weight: 600; margin-bottom: 8px;">💼 Extras Adicionados à Proposta:</p>
                                    ${lead.extras.map(extra => `
                                        <p style="margin: 4px 0; color: #334155;">
                                            <strong>${extra.item}:</strong> ${extra.price}
                                            ${extra.reason ? `<br><small style="color: #64748b;">(${extra.reason})</small>` : ''}
                                        </p>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="lead-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                            ${lead.status !== 'fechado' ? `
                                <button onclick="updateLeadStatus('${lead._id}', 'negociacao')" class="btn-secondary" style="padding: 8px 16px;">
                                    💬 Iniciar Negociação
                                </button>
                                <button onclick="updateLeadStatus('${lead._id}', 'proposta')" class="btn-secondary" style="padding: 8px 16px;">
                                    📄 Enviar Proposta
                                </button>
                                <button onclick="closeAndProvision('${lead._id}')" class="btn-primary" style="padding: 8px 16px; background: #10b981;">
                                    ✅ Fechar Venda & Provisionar
                                </button>
                            ` : `
                                <button onclick="viewClientProvision('${lead._id}')" class="btn-primary" style="padding: 8px 16px;">
                                    🔍 Ver Provisionamento
                                </button>
                            `}
                            <button onclick="deleteLead('${lead._id}')" class="btn-secondary" style="padding: 8px 16px; background: #ef4444; color: white;">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('CRM error:', error);
        container.innerHTML = `
            <div class="service-card" style="background: #fee2e2; border-left: 4px solid #ef4444;">
                <p style="color: #991b1b;">❌ Erro ao carregar CRM: ${error.message}</p>
            </div>
        `;
    }
}

// Atualizar status do lead
async function updateLeadStatus(leadId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        
        alert('✅ Status atualizado com sucesso!');
        loadCRMData();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// Fechar venda e provisionar automaticamente
async function closeAndProvision(leadId) {
    if (!confirm('🎉 Fechar venda e provisionar automaticamente?\n\n✅ Criará repositório GitHub\n✅ Criará database MongoDB\n✅ Fará deploy no Railway\n✅ Configurará DNS\n✅ Enviará credenciais por email')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}/provision`, {
            method: 'POST'
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        
        alert('🎉 Venda fechada e provisionamento iniciado!\n\n' + 
              'Verifique seu email para acompanhar o progresso.');
        loadCRMData();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// Deletar lead
async function deleteLead(leadId) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este lead?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        
        alert('✅ Lead excluído com sucesso!');
        loadCRMData();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ============================================
// SOCIAL MEDIA POST - Postar simultaneamente
// ============================================

// Contador de caracteres
const postTextArea = document.getElementById('post-text');
if (postTextArea) {
    postTextArea.addEventListener('input', function() {
        const charCount = document.getElementById('char-count');
        const count = this.value.length;
        charCount.textContent = `${count} caracteres`;
        charCount.style.color = count > 3000 ? '#ef4444' : '#94a3b8';
    });
}

// Preview de imagem
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('❌ Arquivo muito grande! Máximo 10MB');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
            document.getElementById('upload-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Remover imagem
function removeImage(event) {
    event.stopPropagation();
    document.getElementById('post-image').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'block';
}

// Pré-visualizar post
function previewPost() {
    const text = document.getElementById('post-text').value;
    if (!text.trim()) {
        alert('⚠️ Digite um texto para pré-visualizar');
        return;
    }
    
    const platforms = [];
    if (document.getElementById('platform-linkedin').checked) platforms.push('LinkedIn');
    if (document.getElementById('platform-facebook').checked) platforms.push('Facebook');
    if (document.getElementById('platform-instagram').checked) platforms.push('Instagram');
    if (document.getElementById('platform-whatsapp').checked) platforms.push('WhatsApp');
    
    const hasImage = document.getElementById('post-image').files.length > 0;
    
    alert(`📱 Pré-visualização\n\n` +
          `Plataformas: ${platforms.join(', ')}\n` +
          `Texto: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n` +
          `Imagem: ${hasImage ? 'Sim ✅' : 'Não'}\n` +
          `Caracteres: ${text.length}`);
}

// Submeter post
document.getElementById('social-post-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const text = document.getElementById('post-text').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    const platforms = {
        linkedin: document.getElementById('platform-linkedin').checked,
        facebook: document.getElementById('platform-facebook').checked,
        instagram: document.getElementById('platform-instagram').checked,
        whatsapp: document.getElementById('platform-whatsapp').checked
    };
    
    if (!Object.values(platforms).some(v => v)) {
        alert('⚠️ Selecione pelo menos uma plataforma');
        return;
    }
    
    if (!text.trim()) {
        alert('⚠️ Digite um texto para postar');
        return;
    }
    
    // Mostrar status
    const statusDiv = document.getElementById('post-status');
    const statusItems = document.getElementById('status-items');
    statusDiv.style.display = 'block';
    statusItems.innerHTML = `
        <div style="padding: 16px; background: white; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
            <p style="color: #64748b;">Publicando em todas as redes...</p>
        </div>
    `;
    
    // Preparar FormData
    const formData = new FormData();
    formData.append('text', text);
    formData.append('platforms', JSON.stringify(platforms));
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const response = await fetch(`${API_BASE}/social/post`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mostrar resultados
            let html = '';
            Object.entries(data.results).forEach(([platform, result]) => {
                const icon = {
                    linkedin: '💼',
                    facebook: '📘',
                    instagram: '📸',
                    whatsapp: '💬'
                }[platform];
                
                const statusColor = result.success ? '#10b981' : '#ef4444';
                const statusText = result.success ? 'Publicado' : 'Falhou';
                const statusIcon = result.success ? '✅' : '❌';
                
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: white; border-radius: 8px; border-left: 4px solid ${statusColor};">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 28px;">${icon}</span>
                            <div>
                                <strong style="color: #334155; text-transform: capitalize;">${platform}</strong>
                                <p style="color: #94a3b8; font-size: 0.9em; margin-top: 2px;">${result.message || ''}</p>
                            </div>
                        </div>
                        <span style="font-size: 24px;">${statusIcon}</span>
                    </div>
                `;
            });
            
            statusItems.innerHTML = html;
            
            // Resetar formulário se tudo deu certo
            const allSuccess = Object.values(data.results).every(r => r.success);
            if (allSuccess) {
                setTimeout(() => {
                    if (confirm('🎉 Publicado com sucesso em todas as redes!\n\nDeseja criar outro post?')) {
                        document.getElementById('social-post-form').reset();
                        removeImage(new Event('click'));
                        statusDiv.style.display = 'none';
                    }
                }, 2000);
            }
        } else {
            throw new Error(data.error || 'Erro ao publicar');
        }
    } catch (error) {
        statusItems.innerHTML = `
            <div style="padding: 16px; background: #fee2e2; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444;">
                <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
                <p style="color: #991b1b;"><strong>Erro:</strong> ${error.message}</p>
            </div>
        `;
    }
});

// ============================================
// CRM FUNCTIONS
// ============================================

function showCrmTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.crm-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`crm-${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'leads':
            loadCrmLeads();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'pipeline':
            loadPipeline();
            break;
    }
}

async function loadCrmLeads() {
    const container = document.getElementById('leads-container');
    container.innerHTML = '<div class="loading">⏳ Carregando leads...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads`);
        const data = await response.json();
        
        if (data.leads && data.leads.length > 0) {
            let html = `
                <table class="data-table-content">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Empresa</th>
                            <th>Status</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.leads.forEach(lead => {
                const statusClass = {
                    'novo': 'status-novo',
                    'negociacao': 'status-negociacao',
                    'fechado': 'status-fechado',
                    'perdido': 'status-perdido'
                }[lead.status] || 'status-novo';
                
                html += `
                    <tr>
                        <td>${lead.name || '-'}</td>
                        <td>${lead.email || '-'}</td>
                        <td>${lead.phone || '-'}</td>
                        <td>${lead.company || '-'}</td>
                        <td><span class="status-badge ${statusClass}">${lead.status || 'novo'}</span></td>
                        <td>${new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td>
                            <button onclick="changeLeadStatus('${lead._id}', 'negociacao')" class="btn-small">💬</button>
                            <button onclick="changeLeadStatus('${lead._id}', 'fechado')" class="btn-small">✅</button>
                            <button onclick="provisionLead('${lead._id}')" class="btn-small">🚀</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">📋 Nenhum lead encontrado</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar leads: ${error.message}</div>`;
    }
}

async function loadContacts() {
    const container = document.getElementById('contacts-container');
    container.innerHTML = '<div class="loading">⏳ Carregando contatos...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/crm/contacts`);
        
        // Verificar se a resposta é JSON válida
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Servidor retornou resposta inválida. Verifique se a API está configurada corretamente.');
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.contacts && data.contacts.length > 0) {
            let html = `
                <div class="contacts-summary" style="margin-bottom: 20px; padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3>📊 Resumo de Contatos</h3>
                    <p><strong>Total:</strong> ${data.total} contatos</p>
                    <p><strong>Fontes:</strong> ${data.sources.join(', ')}</p>
                </div>
                <table class="data-table-content">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Empresa</th>
                            <th>Fonte</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.contacts.forEach(contact => {
                const statusClass = contact.status ? `status-${contact.status.toLowerCase()}` : '';
                const statusText = contact.status || '-';
                
                html += `
                    <tr>
                        <td>${contact.name || '-'}</td>
                        <td>${contact.phone || '-'}</td>
                        <td>${contact.email || '-'}</td>
                        <td>${contact.company || '-'}</td>
                        <td><span class="source-badge">${contact.source || 'desconhecido'}</span></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">📞 Nenhum contato encontrado</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar contatos: ${error.message}</div>`;
    }
}

// ===== FUNÇÕES DE BACKUP E EXPORTAÇÃO =====

async function fazerBackupCompleto() {
    try {
        showNotification('🔄 Iniciando backup completo...', 'info');
        
        const response = await fetch(`${API_BASE}/backup/completo`);
        const result = await response.json();
        
        if (result.success) {
            showNotification(`✅ Backup realizado com sucesso! ${result.totalRecords} registros salvos em ${result.filename}`, 'success');
            console.log('Backup completo:', result);
        } else {
            showNotification('❌ Erro ao fazer backup', 'error');
        }
    } catch (error) {
        console.error('Erro no backup:', error);
        showNotification('❌ Erro ao fazer backup: ' + error.message, 'error');
    }
}

async function exportarContatosCSV() {
    try {
        showNotification('📊 Exportando contatos para CSV...', 'info');
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = `${API_BASE}/export/contatos/csv`;
        link.download = `contatos_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('✅ Exportação CSV iniciada! O download deve começar em instantes.', 'success');
    } catch (error) {
        console.error('Erro na exportação CSV:', error);
        showNotification('❌ Erro ao exportar CSV: ' + error.message, 'error');
    }
}

async function exportarEmailsJSON() {
    try {
        showNotification('📧 Exportando emails para JSON...', 'info');
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = `${API_BASE}/export/emails/json`;
        link.download = `emails_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('✅ Exportação JSON iniciada! O download deve começar em instantes.', 'success');
    } catch (error) {
        console.error('Erro na exportação JSON:', error);
        showNotification('❌ Erro ao exportar JSON: ' + error.message, 'error');
    }
}

async function verificarSaudeDados() {
    try {
        showNotification('🔍 Verificando saúde dos dados...', 'info');
        
        const response = await fetch(`${API_BASE}/health/data`);
        const health = await response.json();
        
        if (health.success) {
            const message = `
                📊 Saúde dos Dados:
                • ${health.totalContacts} contatos no CRM
                • ${health.totalEmails} emails no Gmail
                • Última verificação: ${new Date(health.health.timestamp).toLocaleString('pt-BR')}
            `;
            showNotification(message, 'success');
            console.log('Saúde dos dados:', health);
        } else {
            showNotification('❌ Erro ao verificar saúde dos dados', 'error');
        }
    } catch (error) {
        console.error('Erro na verificação de saúde:', error);
        showNotification('❌ Erro ao verificar saúde: ' + error.message, 'error');
    }
}

async function loadPipeline() {
    const container = document.getElementById('pipeline-container');
    container.innerHTML = '<div class="loading">⏳ Carregando pipeline...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads`);
        const data = await response.json();
        
        if (data.leads && data.leads.length > 0) {
            const stats = {
                novo: 0,
                negociacao: 0,
                fechado: 0,
                perdido: 0
            };
            
            data.leads.forEach(lead => {
                stats[lead.status] = (stats[lead.status] || 0) + 1;
            });
            
            document.getElementById('pipeline-novos').textContent = stats.novo;
            document.getElementById('pipeline-negociacao').textContent = stats.negociacao;
            document.getElementById('pipeline-fechados').textContent = stats.fechado;
            document.getElementById('pipeline-perdidos').textContent = stats.perdido;
            
            let html = '<div class="pipeline-columns">';
            
            Object.entries(stats).forEach(([status, count]) => {
                const statusName = {
                    novo: '📥 Novos',
                    negociacao: '💬 Negociação',
                    fechado: '✅ Fechados',
                    perdido: '❌ Perdidos'
                }[status];
                
                html += `
                    <div class="pipeline-column">
                        <h3>${statusName} (${count})</h3>
                        <div class="pipeline-cards">
                `;
                
                data.leads.filter(lead => lead.status === status).forEach(lead => {
                    html += `
                        <div class="pipeline-card">
                            <h4>${lead.name}</h4>
                            <p>${lead.company || 'Sem empresa'}</p>
                            <small>${lead.email}</small>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            });
            
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">📊 Nenhum lead no pipeline</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar pipeline: ${error.message}</div>`;
    }
}

async function changeLeadStatus(leadId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadCrmLeads();
            loadPipeline();
        } else {
            alert('Erro ao alterar status do lead');
        }
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function provisionLead(leadId) {
    if (!confirm('Deseja provisionar este lead? Isso criará GitHub repo, MongoDB DB e Railway project.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}/provision`, {
            method: 'POST'
        });
        
        const data = await response.json();
        alert(data.message || 'Lead provisionado com sucesso!');
        loadCrmLeads();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function sendMarketingEmails() {
    if (!confirm('Deseja enviar emails de marketing para leads qualificados?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/crm/send-marketing-emails`);
        const data = await response.json();
        alert(data.message || 'Emails enviados!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// ============================================
// FINANCIAL FUNCTIONS
// ============================================

async function loadExtratos() {
    const container = document.getElementById('extratos-container');
    container.innerHTML = '<div class="loading">⏳ Carregando extratos...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/financeiro/extratos`);
        const data = await response.json();
        
        if (data.transactions && data.transactions.length > 0) {
            // Calculate summary
            let entradas = 0;
            let saidas = 0;
            
            data.transactions.forEach(t => {
                if (t.valor > 0) entradas += t.valor;
                else saidas += Math.abs(t.valor);
            });
            
            document.getElementById('total-transactions').textContent = data.transactions.length;
            document.getElementById('total-entradas').textContent = `R$ ${entradas.toFixed(2).replace('.', ',')}`;
            document.getElementById('total-saidas').textContent = `R$ ${saidas.toFixed(2).replace('.', ',')}`;
            document.getElementById('saldo-total').textContent = `R$ ${(entradas - saidas).toFixed(2).replace('.', ',')}`;
            
            let html = `
                <table class="data-table-content">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Descrição</th>
                            <th>Arquivo</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.transactions.forEach(transaction => {
                const valorClass = transaction.valor >= 0 ? 'valor-positivo' : 'valor-negativo';
                const valorFormatado = `R$ ${Math.abs(transaction.valor).toFixed(2).replace('.', ',')}`;
                
                html += `
                    <tr>
                        <td>${transaction.data}</td>
                        <td class="${valorClass}">${transaction.valor >= 0 ? '+' : '-'}${valorFormatado}</td>
                        <td>${transaction.descricao}</td>
                        <td>${transaction.arquivo}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">💰 Nenhum extrato encontrado</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar extratos: ${error.message}</div>`;
    }
}

async function exportExtratos() {
    // Simple export - could be enhanced
    alert('Funcionalidade de exportação será implementada em breve');
}

// ============================================
// GMAIL FUNCTIONS
// ============================================

function showGmailTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.gmail-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`gmail-${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'overview':
            loadGmailStats();
            break;
        case 'emails':
            loadGmailEmails();
            break;
        case 'contacts':
            loadGmailContacts();
            break;
        case 'sync':
            loadGmailAuthButtons();
            break;
    }
}

async function loadGmailStats() {
    const container = document.getElementById('gmail-overview-content');
    container.innerHTML = '<div class="loading">⏳ Carregando estatísticas...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/gmail/stats`);
        const data = await response.json();
        
        document.getElementById('gmail-accounts-count').textContent = data.accounts.length;
        
        let totalEmails = 0;
        let totalContacts = 0;
        
        data.emailStats.forEach(stat => {
            totalEmails += stat.totalEmails;
        });
        
        data.contactStats.forEach(stat => {
            totalContacts += stat.totalContacts;
        });
        
        document.getElementById('gmail-total-emails').textContent = totalEmails.toLocaleString();
        document.getElementById('gmail-total-contacts').textContent = totalContacts.toLocaleString();
        
        let html = '<div class="gmail-accounts-grid">';
        
        data.accounts.forEach(account => {
            const emailStat = data.emailStats.find(s => s._id === account);
            const contactStat = data.contactStats.find(s => s._id === account);
            
            html += `
                <div class="account-card">
                    <h4>${account}</h4>
                    <div class="account-stats">
                        <div class="stat">
                            <span class="stat-label">📧 Emails:</span>
                            <span class="stat-value">${emailStat ? emailStat.totalEmails : 0}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">👥 Contatos:</span>
                            <span class="stat-value">${contactStat ? contactStat.totalContacts : 0}</span>
                        </div>
                        ${emailStat && emailStat.latestEmail ? `
                            <div class="stat">
                                <span class="stat-label">🕒 Último email:</span>
                                <span class="stat-value">${new Date(emailStat.latestEmail).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar estatísticas: ${error.message}</div>`;
    }
}

async function loadGmailEmails() {
    const container = document.getElementById('gmail-emails-container');
    const accountFilter = document.getElementById('gmail-account-filter');
    
    container.innerHTML = '<div class="loading">⏳ Carregando emails...</div>';
    
    try {
        const account = accountFilter.value;
        const params = new URLSearchParams();
        if (account) params.append('account', account);
        params.append('limit', '50');
        
        const response = await fetch(`${API_BASE}/gmail/emails?${params}`);
        const data = await response.json();
        
        if (data.emails && data.emails.length > 0) {
            let html = `<div class="emails-list">`;
            
            data.emails.forEach(email => {
                const date = new Date(email.internalDate).toLocaleString('pt-BR');
                html += `
                    <div class="email-item">
                        <div class="email-subject">${email.subject || 'Sem assunto'}</div>
                        <div class="email-meta">
                            <strong>De:</strong> ${email.from || 'Desconhecido'} | 
                            <strong>Para:</strong> ${email.to || 'Desconhecido'} | 
                            <strong>Data:</strong> ${date}
                            <span class="account-badge">${email.account}</span>
                        </div>
                        <div class="email-snippet">${email.snippet || 'Sem preview'}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            if (data.total > data.emails.length) {
                html += `<div class="load-more">
                    <button class="btn-secondary" onclick="loadMoreGmailEmails()">Carregar mais emails</button>
                    <span>Mostrando ${data.emails.length} de ${data.total}</span>
                </div>`;
            }
            
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">📧 Nenhum email encontrado</div>';
        }
        
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar emails: ${error.message}</div>`;
    }
}

async function loadGmailContacts() {
    const container = document.getElementById('gmail-contacts-container');
    const accountFilter = document.getElementById('gmail-contacts-account-filter');
    
    container.innerHTML = '<div class="loading">⏳ Carregando contatos...</div>';
    
    try {
        const account = accountFilter.value;
        const params = new URLSearchParams();
        if (account) params.append('account', account);
        params.append('limit', '100');
        
        const response = await fetch(`${API_BASE}/gmail/contacts?${params}`);
        const data = await response.json();
        
        if (data.contacts && data.contacts.length > 0) {
            let html = `<div class="contacts-list">`;
            
            data.contacts.forEach(contact => {
                const emails = contact.emails ? contact.emails.map(e => e.value).join(', ') : '';
                const phones = contact.phones ? contact.phones.map(p => p.value).join(', ') : '';
                
                html += `
                    <div class="contact-item">
                        <div class="contact-name">${contact.displayName || 'Nome não informado'}</div>
                        <div class="contact-details">
                            <div><strong>📧 Email:</strong> ${emails || 'Não informado'}</div>
                            <div><strong>📱 Telefone:</strong> ${phones || 'Não informado'}</div>
                            ${contact.organizations && contact.organizations.length > 0 ? 
                                `<div><strong>🏢 Empresa:</strong> ${contact.organizations[0].name || ''}</div>` : ''}
                            <div><span class="account-badge">${contact.account}</span></div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            if (data.total > data.contacts.length) {
                html += `<div class="load-more">
                    <button class="btn-secondary" onclick="loadMoreGmailContacts()">Carregar mais contatos</button>
                    <span>Mostrando ${data.contacts.length} de ${data.total}</span>
                </div>`;
            }
            
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">👥 Nenhum contato encontrado</div>';
        }
        
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar contatos: ${error.message}</div>`;
    }
}

async function loadGmailAuthButtons() {
    const container = document.getElementById('gmail-auth-buttons');
    container.innerHTML = '<div class="loading">⏳ Carregando contas...</div>';
    
    try {
        // Buscar contas configuradas (simplificado - em produção, buscar do backend)
        const accounts = ['avilacargasrapidas@gmail.com', 'nicolasrosaab@gmail.com', 'faturamento.avila@gmail.com'];
        
        let html = '';
        accounts.forEach(account => {
            html += `
                <a href="#" onclick="authenticateGmail('${account}'); return false;" class="auth-button">
                    <span>🔐</span>
                    Conectar ${account}
                </a>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar contas: ${error.message}</div>`;
    }
}

async function authenticateGmail(email) {
    try {
        const response = await fetch(`${API_BASE}/gmail/auth/${email}`);
        const data = await response.json();
        
        if (data.authUrl) {
            // Abrir popup para autenticação
            const popup = window.open(data.authUrl, 'gmail-auth', 'width=600,height=700');
            
            // Verificar quando o popup fechar
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    alert('Autenticação concluída! Você pode agora sincronizar emails e contatos.');
                    loadGmailAuthButtons();
                }
            }, 1000);
        } else {
            alert('Erro ao obter URL de autenticação');
        }
        
    } catch (error) {
        alert('Erro na autenticação: ' + error.message);
    }
}

async function syncGmailEmails() {
    const statusDiv = document.getElementById('sync-emails-status');
    statusDiv.innerHTML = '<div class="sync-status">🔄 Sincronizando emails...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/gmail/sync-emails`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        let html = '<div class="sync-status sync-success">✅ Sincronização concluída!\n\n';
        data.results.forEach(result => {
            html += `📧 ${result.account}: ${result.emailsSynced} emails sincronizados\n`;
        });
        html += '</div>';
        
        statusDiv.innerHTML = html;
        loadGmailStats(); // Atualizar estatísticas
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="sync-status sync-error">❌ Erro na sincronização: ${error.message}</div>`;
    }
}

async function syncGmailContacts() {
    const statusDiv = document.getElementById('sync-contacts-status');
    statusDiv.innerHTML = '<div class="sync-status">🔄 Sincronizando contatos...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/gmail/sync-contacts`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        let html = '<div class="sync-status sync-success">✅ Sincronização concluída!\n\n';
        data.results.forEach(result => {
            html += `👥 ${result.account}: ${result.contactsSynced} contatos sincronizados\n`;
        });
        html += '</div>';
        
        statusDiv.innerHTML = html;
        loadGmailStats(); // Atualizar estatísticas
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="sync-status sync-error">❌ Erro na sincronização: ${error.message}</div>`;
    }
}

async function syncEverything() {
    const statusDiv = document.getElementById('sync-everything-status');
    statusDiv.innerHTML = '<div class="sync-status">🚀 Iniciando sincronização completa de TODOS os dados...</div>';
    
    try {
        // Primeiro sincronizar emails
        statusDiv.innerHTML = '<div class="sync-status">📧 Sincronizando emails de todas as contas...</div>';
        const emailsResponse = await fetch(`${API_BASE}/gmail/sync-emails`, {
            method: 'POST'
        });
        const emailsData = await emailsResponse.json();
        
        // Depois sincronizar contatos
        statusDiv.innerHTML = '<div class="sync-status">👥 Sincronizando contatos de todas as contas...</div>';
        const contactsResponse = await fetch(`${API_BASE}/gmail/sync-contacts`, {
            method: 'POST'
        });
        const contactsData = await contactsResponse.json();
        
        // Resultado final
        let html = '<div class="sync-status sync-success">🎉 SINCRONIZAÇÃO COMPLETA CONCLUÍDA!\n\n';
        html += '📧 EMAILS SINCRONIZADOS:\n';
        emailsData.results.forEach(result => {
            html += `  • ${result.account}: ${result.emailsSynced} emails\n`;
        });
        html += '\n👥 CONTATOS SINCRONIZADOS:\n';
        contactsData.results.forEach(result => {
            html += `  • ${result.account}: ${result.contactsSynced} contatos\n`;
        });
        html += '\n\n✅ TODOS OS DADOS ESTÃO SALVOS E DISPONÍVEIS!</div>';
        
        statusDiv.innerHTML = html;
        
        // Atualizar todas as estatísticas
        loadGmailStats();
        loadGmailEmails();
        loadGmailContacts();
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="sync-status sync-error">❌ Erro na sincronização completa: ${error.message}</div>`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load GitHub data for dashboard
    loadGitHubData();
});
// ============================================
// NOVO CLIENTE MODAL
// ============================================

function openNovoClienteModal() {
    document.getElementById('novoClienteModal').style.display = 'flex';
    document.getElementById('novoClienteForm').reset();
}

function closeNovoClienteModal() {
    document.getElementById('novoClienteModal').style.display = 'none';
}

document.getElementById('novoClienteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const novoCliente = {
        name: document.getElementById('clienteNome').value,
        email: document.getElementById('clienteEmail').value,
        phone: document.getElementById('clienteTelefone').value,
        company: document.getElementById('clienteEmpresa').value || '',
        source: document.getElementById('clienteFonte').value,
        status: document.getElementById('clienteStatus').value,
        notes: document.getElementById('clienteObs').value || '',
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/crm/cliente`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoCliente)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar notificação de sucesso
            if (window.addNotification) {
                window.addNotification('success', 'Cliente cadastrado!', novoCliente.name);
            }
            
            // Fechar modal
            closeNovoClienteModal();
            
            // Recarregar listas
            loadCrmLeads();
            loadContacts();
            
            // Mostrar mensagem de sucesso
            alert(`✅ Cliente "${novoCliente.name}" cadastrado com sucesso!\n\n📧 Email: ${novoCliente.email}\n📞 Tel: ${novoCliente.phone}`);
        } else {
            throw new Error(result.error || 'Erro ao cadastrar cliente');
        }
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert(`❌ Erro ao cadastrar cliente: ${error.message}`);
    }
});

// Close modal on overlay click
document.getElementById('novoClienteModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'novoClienteModal') {
        closeNovoClienteModal();
    }
});

// ===== CADASTRO COMPLETO MODAL =====
function openCadastroCompletoModal() {
    const modal = document.getElementById('cadastroCompletoModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('cadastroCompletoForm')?.reset();
    }
}

function closeCadastroCompletoModal() {
    const modal = document.getElementById('cadastroCompletoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form validation for cadastro completo
document.getElementById('cadastroNome')?.addEventListener('input', function() {
    const icon = this.nextElementSibling;
    if (this.value.length >= 3) {
        this.style.borderColor = '#10b981';
        this.style.background = 'rgba(16,185,129,0.05)';
        if (icon) {
            icon.style.opacity = '1';
            icon.style.color = '#10b981';
        }
    } else {
        this.style.borderColor = 'rgba(255,255,255,0.1)';
        this.style.background = 'rgba(255,255,255,0.05)';
        if (icon) icon.style.opacity = '0';
    }
});

document.getElementById('cadastroEmail')?.addEventListener('input', function() {
    const icon = this.nextElementSibling;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(this.value)) {
        this.style.borderColor = '#10b981';
        this.style.background = 'rgba(16,185,129,0.05)';
        if (icon) {
            icon.style.opacity = '1';
            icon.style.color = '#10b981';
        }
    } else {
        this.style.borderColor = 'rgba(255,255,255,0.1)';
        this.style.background = 'rgba(255,255,255,0.05)';
        if (icon) icon.style.opacity = '0';
    }
});

document.getElementById('cadastroTelefone')?.addEventListener('input', function() {
    const icon = this.nextElementSibling;
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (telefoneRegex.test(this.value)) {
        this.style.borderColor = '#10b981';
        this.style.background = 'rgba(16,185,129,0.05)';
        if (icon) {
            icon.style.opacity = '1';
            icon.style.color = '#10b981';
        }
    } else {
        this.style.borderColor = 'rgba(255,255,255,0.1)';
        this.style.background = 'rgba(255,255,255,0.05)';
        if (icon) icon.style.opacity = '0';
    }
});

// Cadastro completo form submission
document.getElementById('cadastroCompletoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="animation: spin 1s linear infinite;">⏳</span> <span>Processando...</span>';
    
    try {
        const clienteData = {
            nome: document.getElementById('cadastroNome').value.trim(),
            email: document.getElementById('cadastroEmail').value.trim(),
            telefone: document.getElementById('cadastroTelefone').value.trim(),
            empresa: document.getElementById('cadastroEmpresa').value.trim() || '',
            fonte: document.getElementById('cadastroFonte').value || 'site',
            status: 'novo',
            observacoes: document.getElementById('cadastroMensagem').value.trim() || ''
        };

        const response = await fetch('/api/crm/cliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });

        const result = await response.json();
        
        if (result.success) {
            btn.innerHTML = '<span>✅</span> <span>Cadastrado com Sucesso!</span>';
            setTimeout(() => {
                closeCadastroCompletoModal();
                btn.disabled = false;
                btn.innerHTML = originalText;
                // Reload CRM data if on CRM section
                if (window.currentSection === 'crm') {
                    loadLeads();
                }
            }, 2000);
        } else {
            throw new Error(result.error || 'Erro ao cadastrar');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        btn.innerHTML = '<span>❌</span> <span>Erro ao Cadastrar</span>';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }, 2000);
    }
});

// Close cadastro modal on overlay click
document.getElementById('cadastroCompletoModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'cadastroCompletoModal') {
        closeCadastroCompletoModal();
    }
});

// ===== LINKEDIN AUTOMATION MODAL =====
let linkedinAutomationActive = false;
let linkedinStats = {
    connectionsToday: 0,
    messagesSent: 0,
    engagements: 0,
    acceptanceRate: 0
};

function openLinkedinAutomationModal() {
    const modal = document.getElementById('linkedinAutomationModal');
    if (modal) {
        modal.style.display = 'flex';
        updateLinkedinStats();
    }
}

function closeLinkedinAutomationModal() {
    const modal = document.getElementById('linkedinAutomationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateLinkedinStats() {
    document.getElementById('linkedinConnectionsToday').textContent = linkedinStats.connectionsToday;
    document.getElementById('linkedinMessagesSent').textContent = linkedinStats.messagesSent;
    document.getElementById('linkedinEngagements').textContent = linkedinStats.engagements;
    document.getElementById('linkedinAcceptanceRate').textContent = linkedinStats.acceptanceRate + '%';
}

function addLinkedinLogEntry(message, type = 'info') {
    const log = document.getElementById('linkedinActivityLog');
    if (!log) return;
    
    // Remove "no activity" message
    if (log.querySelector('div[style*="text-align: center"]')) {
        log.innerHTML = '';
    }
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const entry = document.createElement('div');
    entry.style.cssText = `
        padding: 12px;
        background: rgba(255,255,255,0.03);
        border-left: 3px solid ${colors[type]};
        border-radius: 6px;
        font-size: 14px;
        color: rgba(255,255,255,0.8);
    `;
    entry.innerHTML = `<span style="color: rgba(255,255,255,0.4);">${timestamp}</span> - ${message}`;
    
    log.insertBefore(entry, log.firstChild);
    
    // Keep only last 50 entries
    while (log.children.length > 50) {
        log.removeChild(log.lastChild);
    }
}

async function startLinkedinConnections() {
    const dailyLimit = parseInt(document.getElementById('linkedinDailyLimit')?.value || 20);
    const message = document.getElementById('linkedinInviteMessage')?.value;
    
    addLinkedinLogEntry(`🚀 Iniciando envio de convites (limite: ${dailyLimit}/dia)`, 'info');
    
    try {
        // Simulated API call - replace with actual LinkedIn automation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        linkedinStats.connectionsToday += 1;
        updateLinkedinStats();
        addLinkedinLogEntry('✅ Convite enviado com sucesso', 'success');
    } catch (error) {
        addLinkedinLogEntry('❌ Erro ao enviar convite', 'error');
    }
}

async function startLinkedinMessages() {
    addLinkedinLogEntry('📨 Iniciando envio de mensagens...', 'info');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        linkedinStats.messagesSent += 1;
        updateLinkedinStats();
        addLinkedinLogEntry('✅ Mensagem enviada', 'success');
    } catch (error) {
        addLinkedinLogEntry('❌ Erro ao enviar mensagem', 'error');
    }
}

async function startLinkedinLikes() {
    addLinkedinLogEntry('👍 Curtindo posts relevantes...', 'info');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        linkedinStats.engagements += 1;
        updateLinkedinStats();
        addLinkedinLogEntry('✅ Post curtido', 'success');
    } catch (error) {
        addLinkedinLogEntry('❌ Erro ao curtir post', 'error');
    }
}

async function startLinkedinComments() {
    addLinkedinLogEntry('💬 Comentando em posts...', 'info');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        linkedinStats.engagements += 1;
        updateLinkedinStats();
        addLinkedinLogEntry('✅ Comentário publicado', 'success');
    } catch (error) {
        addLinkedinLogEntry('❌ Erro ao comentar', 'error');
    }
}

// Close linkedin modal on overlay click
document.getElementById('linkedinAutomationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'linkedinAutomationModal') {
        closeLinkedinAutomationModal();
    }

});

// ==========================================
// CADASTRO COMPLETO MODAL
// ==========================================

function openCadastroCompleto() {
    const modal = document.getElementById('cadastroCompletoModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('cadastroInitialForm').style.display = 'block';
        document.getElementById('cadastroPatentSection').style.display = 'none';
        document.getElementById('cadastroCompletoForm')?.reset();
    }
}

function closeCadastroCompleto() {
    const modal = document.getElementById('cadastroCompletoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Validação em tempo real
const cadastroInputs = {
    nome: document.getElementById('cadastroNome'),
    email: document.getElementById('cadastroEmail'),
    telefone: document.getElementById('cadastroTelefone'),
    empresa: document.getElementById('cadastroEmpresa')
};

const cadastroIcons = {
    nome: document.getElementById('cadastroNomeIcon'),
    email: document.getElementById('cadastroEmailIcon'),
    telefone: document.getElementById('cadastroTelefoneIcon'),
    empresa: document.getElementById('cadastroEmpresaIcon')
};

function validateCadastroInput(field, value) {
    const input = cadastroInputs[field];
    const icon = cadastroIcons[field];
    
    if (!input || !icon) return;
    
    let isValid = false;
    
    switch(field) {
        case 'nome':
            isValid = value.length >= 3;
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
        case 'telefone':
            isValid = value.length >= 10;
            break;
        case 'empresa':
            isValid = value.length >= 2;
            break;
    }
    
    if (value.length > 0) {
        if (isValid) {
            input.classList.add('input-valid');
            input.classList.remove('input-invalid');
            icon.textContent = '✓';
            icon.style.color = '#10b981';
            icon.classList.add('show');
        } else {
            input.classList.add('input-invalid');
            input.classList.remove('input-valid');
            icon.textContent = '✗';
            icon.style.color = '#ef4444';
            icon.classList.add('show');
        }
    } else {
        input.classList.remove('input-valid', 'input-invalid');
        icon.classList.remove('show');
    }
}

// Add event listeners
Object.keys(cadastroInputs).forEach(key => {
    cadastroInputs[key]?.addEventListener('input', (e) => {
        validateCadastroInput(key, e.target.value);
    });
});

// Form submission
document.getElementById('cadastroCompletoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('cadastroNome').value,
        empresa: document.getElementById('cadastroEmpresa').value,
        email: document.getElementById('cadastroEmail').value,
        telefone: document.getElementById('cadastroTelefone').value,
        tipoProjeto: document.getElementById('cadastroTipoProjeto').value,
        orcamento: document.getElementById('cadastroOrcamento').value,
        descricao: document.getElementById('cadastroDescricao').value
    };
    
    const submitBtn = e.target.querySelector('.cadastro-submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span>🔄</span> Processing...';
    
    try {
        const response = await fetch(`${API_BASE}/crm/leads/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show patent section
            document.getElementById('cadastroInitialForm').style.display = 'none';
            const patentSection = document.getElementById('cadastroPatentSection');
            patentSection.style.display = 'block';
            setTimeout(() => patentSection.classList.add('show'), 100);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<span>🚀</span> Start Your Project';
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ ${error.message}`);
        
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<span>🔄</span> Try Again';
    }
});

// Patent selection
let selectedPatentOption = null;

function selectPatentOption(option) {
    selectedPatentOption = option;
    
    const yesOption = document.getElementById('patentYes');
    const noOption = document.getElementById('patentNo');
    const fields = document.getElementById('patentFields');
    
    if (option === 'yes') {
        yesOption.classList.add('selected');
        noOption.classList.remove('selected');
        fields.style.display = 'block';
    } else {
        yesOption.classList.remove('selected');
        noOption.classList.add('selected');
        fields.style.display = 'none';
    }
}

// File upload
document.getElementById('patentFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = `📄 ${file.name}`;
    }
});

function completeCadastro() {
    alert('✅ Cadastro completo! Em breve entraremos em contato.');
    closeCadastroCompleto();
}

// Close on overlay click
document.getElementById('cadastroCompletoModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'cadastroCompletoModal') {
        closeCadastroCompleto();
    }
});

// ==========================================
// LINKEDIN AUTOMATION
// ==========================================

let linkedInConsoleLines = [];

function addLinkedInConsoleLog(message, type = 'info') {
    const console = document.getElementById('linkedinConsole');
    if (!console) return;
    
    const line = document.createElement('div');
    line.className = 'console-line';
    
    const icon = type === 'success' ? '✅' : 
                type === 'error' ? '❌' : 
                type === 'warning' ? '⚠️' : 'ℹ️';
    
    line.textContent = `${icon} ${new Date().toLocaleTimeString()} - ${message}`;
    console.appendChild(line);
    console.scrollTop = console.scrollHeight;
    
    linkedInConsoleLines.push({ message, type, timestamp: new Date() });
}

async function executeLinkedInAction(action) {
    const loading = document.getElementById('linkedinLoading');
    if (loading) loading.style.display = 'block';
    
    addLinkedInConsoleLog(`Executando: ${action}`, 'info');
    
    try {
        const response = await fetch(`${API_BASE}/linkedin-automation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addLinkedInConsoleLog(`${action} executado com sucesso!`, 'success');
            updateLinkedInStatus(action);
        } else {
            addLinkedInConsoleLog(`Erro ao executar ${action}: ${result.error}`, 'error');
        }
    } catch (error) {
        addLinkedInConsoleLog(`Erro de conexão: ${error.message}`, 'error');
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function updateLinkedInStatus(action) {
    document.getElementById('linkedin-last-action').textContent = action;
    
    // Update counters
    const postsCount = document.getElementById('linkedin-posts-count');
    if (action.includes('post') && postsCount) {
        postsCount.textContent = parseInt(postsCount.textContent) + 1;
    }
    
    const connectionsCount = document.getElementById('linkedin-connections-count');
    if ((action.includes('recruiter') || action.includes('techlead')) && connectionsCount) {
        connectionsCount.textContent = parseInt(connectionsCount.textContent) + 5;
    }
    
    if (action.includes('campaign')) {
        const campaignStatus = document.getElementById('linkedin-campaign-status');
        if (campaignStatus) {
            campaignStatus.textContent = 'BMW (Ativa)';
            campaignStatus.className = 'status-badge status-success';
        }
    }
}

function openLinkedInConfig() {
    addLinkedInConsoleLog('Abrindo configurações...', 'info');
    alert('Edite o arquivo .env na raiz do projeto com suas credenciais LinkedIn');
}

async function testLinkedInConnection() {
    addLinkedInConsoleLog('Testando conexão com LinkedIn API...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/linkedin-test`);
        const result = await response.json();
        
        if (result.connected) {
            addLinkedInConsoleLog('Conexão OK! ✅', 'success');
            const apiStatus = document.getElementById('linkedin-api-status');
            if (apiStatus) {
                apiStatus.textContent = 'Conectado';
                apiStatus.className = 'status-badge status-success';
            }
        } else {
            addLinkedInConsoleLog('Erro de conexão! Verifique credenciais.', 'error');
            const apiStatus = document.getElementById('linkedin-api-status');
            if (apiStatus) {
                apiStatus.textContent = 'Erro';
                apiStatus.className = 'status-badge status-danger';
            }
        }
    } catch (error) {
        addLinkedInConsoleLog(`Erro: ${error.message}`, 'error');
    }
}

function viewLinkedInLogs() {
    addLinkedInConsoleLog('Exibindo logs completos...', 'info');
    const logs = linkedInConsoleLines.map(log => 
        `[${log.timestamp.toLocaleString()}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    alert(logs || 'Nenhum log ainda');
}

// Update status every 5 seconds
setInterval(async () => {
    try {
        const response = await fetch(`${API_BASE}/linkedin-status`);
        const status = await response.json();
        
        if (status.postsThisWeek !== undefined) {
            document.getElementById('linkedin-posts-count').textContent = status.postsThisWeek;
        }
        if (status.newConnections !== undefined) {
            document.getElementById('linkedin-connections-count').textContent = status.newConnections;
        }
    } catch (error) {
        // Silently fail
    }
}, 5000);

// ===== CONTATOS UNIFICADOS =====

async function loadContactsUnified() {
    const container = document.getElementById('contacts-container');
    container.innerHTML = '<div class="loading">⏳ Carregando contatos unificados...</div>';

    try {
        const response = await fetch(`${API_BASE}/contacts/unified`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.contacts && data.contacts.length > 0) {
            // Atualizar estatísticas
            document.getElementById('total-contacts').textContent = data.total || data.contacts.length;
            document.getElementById('empresa-contacts').textContent = data.contacts.filter(c => c.tipo === 'empresa').length;
            document.getElementById('pessoal-contacts').textContent = data.contacts.filter(c => c.tipo === 'pessoal').length;
            document.getElementById('telefone-contacts').textContent = data.contacts.filter(c => c.telefone).length;

            let html = `
                <table class="data-table-content">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Origem</th>
                            <th>Endereço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.contacts.forEach(contact => {
                const endereco = contact.endereco ?
                    `${contact.endereco.cidade || ''} ${contact.endereco.uf || ''}`.trim() || '-' : '-';

                html += `
                    <tr>
                        <td>${contact.nome || '-'}</td>
                        <td>${contact.telefone || '-'}</td>
                        <td>${contact.email || '-'}</td>
                        <td><span class="type-badge type-${contact.tipo || 'desconhecido'}">${contact.tipo || 'desconhecido'}</span></td>
                        <td><span class="source-badge">${contact.origem || 'desconhecido'}</span></td>
                        <td>${endereco}</td>
                        <td>
                            <button class="btn-icon" onclick="viewContactDetails('${contact._id}')" title="Ver detalhes">👁️</button>
                            <button class="btn-icon" onclick="editContact('${contact._id}')" title="Editar">✏️</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">📞 Nenhum contato encontrado</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="error">❌ Erro ao carregar contatos: ${error.message}</div>`;
    }
}

function filterContacts() {
    const searchTerm = document.getElementById('contacts-search').value.toLowerCase();
    const typeFilter = document.getElementById('contacts-type-filter').value;
    const originFilter = document.getElementById('contacts-origin-filter').value;

    const rows = document.querySelectorAll('#contacts-container tbody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const nome = cells[0].textContent.toLowerCase();
        const telefone = cells[1].textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();
        const tipo = cells[3].textContent.toLowerCase();
        const origem = cells[4].textContent.toLowerCase();

        const matchesSearch = nome.includes(searchTerm) ||
                             telefone.includes(searchTerm) ||
                             email.includes(searchTerm);

        const matchesType = !typeFilter || tipo.includes(typeFilter.toLowerCase());
        const matchesOrigin = !originFilter || origem.includes(originFilter.toLowerCase());

        if (matchesSearch && matchesType && matchesOrigin) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function exportContactsCSV() {
    try {
        showNotification('📊 Exportando contatos para CSV...', 'info');

        const response = await fetch(`${API_BASE}/contacts/export/csv`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contatos_unificados_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showNotification('✅ Exportação CSV concluída!', 'success');
    } catch (error) {
        console.error('Erro na exportação:', error);
        showNotification('❌ Erro ao exportar CSV: ' + error.message, 'error');
    }
}

async function showContactStats() {
    try {
        const response = await fetch(`${API_BASE}/contacts/stats`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const stats = await response.json();

        let message = `📊 Estatísticas dos Contatos:\n\n`;
        message += `Total: ${stats.total}\n`;
        message += `Empresas: ${stats.empresas}\n`;
        message += `Pessoal: ${stats.pessoal}\n`;
        message += `Serviços: ${stats.servicos}\n`;
        message += `Com telefone: ${stats.comTelefone}\n`;
        message += `Com email: ${stats.comEmail}\n`;

        alert(message);
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        showNotification('❌ Erro ao obter estatísticas: ' + error.message, 'error');
    }
}

function viewContactDetails(contactId) {
    // Implementar visualização de detalhes do contato
    showNotification('👁️ Funcionalidade de visualização em desenvolvimento', 'info');
}

function editContact(contactId) {
    // Implementar edição do contato
    showNotification('✏️ Funcionalidade de edição em desenvolvimento', 'info');
}

// Alias para manter compatibilidade
const loadContacts = loadContactsUnified;

// ==================== FUNÇÕES DE CAMPANHAS ====================

// Carregar dados das campanhas
async function loadCampanhasData() {
    try {
        const response = await fetch(`${API_BASE}/campanhas`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            atualizarResumoCampanhas(data.campanhas);
            renderizarCampanhas(data.campanhas);
            verificarAlertasCampanhas(data.campanhas);
        }
    } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        showNotification('❌ Erro ao carregar campanhas: ' + error.message, 'error');
    }
}

// Atualizar resumo das campanhas
function atualizarResumoCampanhas(campanhas) {
    const totalCampanhas = campanhas.length;
    const totalOrcamento = campanhas.reduce((sum, c) => sum + (c.orcamento || 0), 0);
    const totalConversoes = campanhas.reduce((sum, c) => sum + (c.conversoes || 0), 0);
    const roasMedio = campanhas.length > 0 ? 
        campanhas.reduce((sum, c) => sum + (c.roas || 0), 0) / campanhas.length : 0;

    document.getElementById('total-campanhas').textContent = totalCampanhas;
    document.getElementById('total-orcamento').textContent = `R$ ${totalOrcamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('total-conversoes').textContent = totalConversoes;
    document.getElementById('roas-medio').textContent = roasMedio.toFixed(2);
}

// Renderizar lista de campanhas
function renderizarCampanhas(campanhas) {
    const container = document.getElementById('campanhas-list');
    
    if (campanhas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>📈</span>
                <p>Nenhuma campanha criada ainda</p>
                <button class="btn-secondary" onclick="openNovaCampanhaModal()">Criar Primeira Campanha</button>
            </div>
        `;
        return;
    }

    container.innerHTML = campanhas.map(campanha => `
        <div class="campaign-card" onclick="verDetalhesCampanha('${campanha._id}')">
            <div class="campaign-header">
                <h4>${campanha.nome}</h4>
                <span class="campaign-platform">${getPlatformIcon(campanha.plataforma)} ${campanha.plataforma}</span>
            </div>
            <div class="campaign-metrics">
                <div class="metric">
                    <span class="metric-value">R$ ${campanha.orcamento?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</span>
                    <span class="metric-label">Orçamento</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${campanha.roas?.toFixed(2) || '0.00'}</span>
                    <span class="metric-label">ROAS</span>
                </div>
                <div class="metric">
                    <span class="metric-value">R$ ${campanha.cpa?.toFixed(2) || '0.00'}</span>
                    <span class="metric-label">CPA</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${campanha.conversoes || 0}</span>
                    <span class="metric-label">Conversões</span>
                </div>
            </div>
            <div class="campaign-status">
                <span class="status-${getStatusClass(campanha.status)}">${getStatusText(campanha.status)}</span>
                <span class="campaign-dates">${formatDate(campanha.dataInicio)} - ${formatDate(campanha.dataFim)}</span>
            </div>
        </div>
    `).join('');
}

// Verificar alertas de campanhas
function verificarAlertasCampanhas(campanhas) {
    const alertas = [];
    
    campanhas.forEach(campanha => {
        // Verificar CPA alto
        if (campanha.cpa > campanha.cpaAlvo * 1.5) {
            alertas.push({
                tipo: 'cpa-alto',
                campanha: campanha.nome,
                mensagem: `CPA atual (R$ ${campanha.cpa.toFixed(2)}) está 50% acima do alvo (R$ ${campanha.cpaAlvo.toFixed(2)})`,
                severidade: 'alta'
            });
        }
        
        // Verificar ROAS baixo
        if (campanha.roas < campanha.roasAlvo * 0.7) {
            alertas.push({
                tipo: 'roas-baixo',
                campanha: campanha.nome,
                mensagem: `ROAS atual (${campanha.roas.toFixed(2)}) está 30% abaixo do alvo (${campanha.roasAlvo.toFixed(2)})`,
                severidade: 'alta'
            });
        }
        
        // Verificar orçamento restante baixo
        const diasRestantes = Math.ceil((new Date(campanha.dataFim) - new Date()) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 7 && campanha.orcamentoRestante < campanha.orcamento * 0.2) {
            alertas.push({
                tipo: 'orcamento-baixo',
                campanha: campanha.nome,
                mensagem: `Orçamento restante baixo com apenas ${diasRestantes} dias restantes`,
                severidade: 'media'
            });
        }
    });
    
    renderizarAlertas(alertas);
}

// Renderizar alertas
function renderizarAlertas(alertas) {
    const container = document.getElementById('alertas-campanhas');
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>✅</span>
                <p>Todas as campanhas otimizadas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = alertas.slice(0, 5).map(alerta => `
        <div class="alert-card alert-${alerta.severidade}" onclick="verAlertaDetalhes('${alerta.campanha}', '${alerta.tipo}')">
            <div class="alert-icon">${getAlertIcon(alerta.tipo)}</div>
            <div class="alert-content">
                <div class="alert-title">${alerta.campanha}</div>
                <div class="alert-message">${alerta.mensagem}</div>
            </div>
        </div>
    `).join('');
    
    if (alertas.length > 5) {
        container.innerHTML += `<div class="alert-more">+${alertas.length - 5} alertas...</div>`;
    }
}

// Funções auxiliares para campanhas
function getPlatformIcon(plataforma) {
    const icons = {
        'google-ads': '🎯',
        'facebook-ads': '📘',
        'instagram-ads': '📷',
        'linkedin-ads': '💼',
        'tiktok-ads': '🎵',
        'outros': '📢'
    };
    return icons[plataforma] || '📢';
}

function getStatusClass(status) {
    const classes = {
        'ativa': 'success',
        'pausada': 'warning',
        'finalizada': 'secondary',
        'cancelada': 'danger'
    };
    return classes[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        'ativa': 'Ativa',
        'pausada': 'Pausada',
        'finalizada': 'Finalizada',
        'cancelada': 'Cancelada'
    };
    return texts[status] || 'Desconhecido';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getAlertIcon(tipo) {
    const icons = {
        'cpa-alto': '💰',
        'roas-baixo': '📉',
        'orcamento-baixo': '⚠️'
    };
    return icons[tipo] || '🚨';
}

// Funções dos modais
function openNovaCampanhaModal() {
    document.getElementById('nova-campanha-modal').style.display = 'block';
}

function closeNovaCampanhaModal() {
    document.getElementById('nova-campanha-modal').style.display = 'none';
    document.getElementById('nova-campanha-form').reset();
}

function openAlertasModal() {
    loadAlertasDetalhes();
    document.getElementById('alertas-modal').style.display = 'block';
}

function closeAlertasModal() {
    document.getElementById('alertas-modal').style.display = 'none';
}

// Criar nova campanha
async function criarCampanha() {
    const form = document.getElementById('nova-campanha-form');
    const formData = new FormData(form);
    
    const campanha = {
        nome: formData.get('campanha-nome'),
        plataforma: formData.get('campanha-plataforma'),
        orcamento: parseFloat(formData.get('campanha-orcamento')),
        cpaAlvo: parseFloat(formData.get('campanha-cpa-alvo')),
        roasAlvo: parseFloat(formData.get('campanha-roas-alvo')),
        dataInicio: formData.get('campanha-data-inicio'),
        dataFim: formData.get('campanha-data-fim'),
        status: 'ativa'
    };
    
    try {
        const response = await fetch(`${API_BASE}/campanhas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campanha)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Campanha criada com sucesso!', 'success');
            closeNovaCampanhaModal();
            loadCampanhasData();
        } else {
            throw new Error(result.message || 'Erro ao criar campanha');
        }
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        showNotification('❌ Erro ao criar campanha: ' + error.message, 'error');
    }
}

// Ver detalhes da campanha
function verDetalhesCampanha(campanhaId) {
    showNotification('👁️ Funcionalidade de detalhes em desenvolvimento', 'info');
}

// Ver detalhes do alerta
function verAlertaDetalhes(campanhaNome, tipoAlerta) {
    showNotification(`📊 Detalhes do alerta para ${campanhaNome}: ${tipoAlerta}`, 'info');
}

// Carregar alertas detalhados
async function loadAlertasCampanhasData() {
    try {
        const response = await fetch(`${API_BASE}/campanhas`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const alertas = [];
            
            data.campanhas.forEach(campanha => {
                // Verificar CPA alto
                if (campanha.cpa > campanha.cpaAlvo * 1.5) {
                    alertas.push({
                        tipo: 'cpa-alto',
                        campanha: campanha.nome,
                        mensagem: `CPA atual (R$ ${campanha.cpa.toFixed(2)}) está 50% acima do alvo (R$ ${campanha.cpaAlvo.toFixed(2)})`,
                        severidade: 'alta',
                        recomendacao: 'Considere pausar a campanha temporariamente ou ajustar lances e segmentação.'
                    });
                }
                
                // Verificar ROAS baixo
                if (campanha.roas < campanha.roasAlvo * 0.7) {
                    alertas.push({
                        tipo: 'roas-baixo',
                        campanha: campanha.nome,
                        mensagem: `ROAS atual (${campanha.roas.toFixed(2)}) está 30% abaixo do alvo (${campanha.roasAlvo.toFixed(2)})`,
                        severidade: 'alta',
                        recomendacao: 'Reveja a segmentação, copy e landing page. Considere reduzir investimento.'
                    });
                }
                
                // Verificar orçamento restante baixo
                const diasRestantes = Math.ceil((new Date(campanha.dataFim) - new Date()) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 7 && campanha.orcamentoRestante < campanha.orcamento * 0.2) {
                    alertas.push({
                        tipo: 'orcamento-baixo',
                        campanha: campanha.nome,
                        mensagem: `Orçamento restante baixo com apenas ${diasRestantes} dias restantes`,
                        severidade: 'media',
                        recomendacao: 'Aumente o orçamento ou considere estender o período da campanha.'
                    });
                }
            });
            
            renderizarAlertasDetalhes(alertas);
        }
    } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        showNotification('❌ Erro ao carregar alertas: ' + error.message, 'error');
    }
}

// Renderizar alertas detalhados
function renderizarAlertasDetalhes(alertas) {
    const container = document.getElementById('alertas-detalhes');
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>✅</span>
                <p>Nenhum alerta pendente</p>
                <p style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">
                    Todas as suas campanhas estão dentro dos parâmetros ideais.
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = alertas.map(alerta => `
        <div class="alert-detail-card alert-${alerta.severidade}">
            <div class="alert-detail-header">
                <div class="alert-detail-icon">${getAlertIcon(alerta.tipo)}</div>
                <div class="alert-detail-info">
                    <h4>${alerta.campanha}</h4>
                    <span class="alert-type">${getAlertTypeText(alerta.tipo)}</span>
                </div>
                <div class="alert-severity severity-${alerta.severidade}">
                    ${alerta.severidade.toUpperCase()}
                </div>
            </div>
            <div class="alert-detail-content">
                <p class="alert-message">${alerta.mensagem}</p>
                <div class="alert-recommendation">
                    <strong>💡 Recomendação:</strong> ${alerta.recomendacao}
                </div>
            </div>
            <div class="alert-detail-actions">
                <button class="btn-secondary" onclick="ignorarAlerta('${alerta.campanha}', '${alerta.tipo}')">Ignorar</button>
                <button class="btn-primary" onclick="otimizarCampanha('${alerta.campanha}', '${alerta.tipo}')">Otimizar</button>
            </div>
        </div>
    `).join('');
}

// Funções auxiliares para alertas detalhados
function getAlertTypeText(tipo) {
    const types = {
        'cpa-alto': 'CPA Elevado',
        'roas-baixo': 'ROAS Baixo',
        'orcamento-baixo': 'Orçamento Baixo'
    };
    return types[tipo] || 'Alerta';
}

function ignorarAlerta(campanhaNome, tipoAlerta) {
    showNotification(`✅ Alerta ignorado para ${campanhaNome}`, 'success');
}

function otimizarCampanha(campanhaNome, tipoAlerta) {
    showNotification(`🔧 Abrindo painel de otimização para ${campanhaNome}...`, 'info');
    // Implementar lógica de otimização específica
}

// Inicializar campanhas quando a seção for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na seção de campanhas
    const campanhasSection = document.getElementById('campanhas-section');
    if (campanhasSection && campanhasSection.style.display !== 'none') {
        loadCampanhasData();
    }
});

// ==================== FUNÇÕES DE DETALHES DO CLIENTE ====================

// Carregar lista de clientes para o seletor
async function loadClientSelector() {
    try {
        const response = await fetch(`${API_BASE}/contacts/unified`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const select = document.getElementById('client-select');
            select.innerHTML = '<option value="">Escolha um cliente...</option>';

            data.contacts.forEach(contact => {
                const option = document.createElement('option');
                option.value = contact._id;
                option.textContent = `${contact.nome} - ${contact.empresa || 'Sem empresa'}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar lista de clientes:', error);
        showNotification('❌ Erro ao carregar lista de clientes: ' + error.message, 'error');
    }
}

// Carregar detalhes do cliente selecionado
async function loadClientDetails() {
    const clientId = document.getElementById('client-select').value;
    if (!clientId) {
        document.getElementById('client-details-container').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/contacts/unified`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const client = data.contacts.find(c => c._id === clientId);
            if (client) {
                displayClientDetails(client);
                document.getElementById('client-details-container').style.display = 'grid';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes do cliente:', error);
        showNotification('❌ Erro ao carregar detalhes do cliente: ' + error.message, 'error');
    }
}

// Exibir detalhes do cliente na interface
function displayClientDetails(client) {
    // Informações básicas
    document.getElementById('client-nome').textContent = client.nome || '-';
    document.getElementById('client-email').textContent = client.email || '-';
    document.getElementById('client-telefone').textContent = client.telefone || '-';
    document.getElementById('client-empresa').textContent = client.empresa || '-';

    // Informações financeiras (carregar do banco se existir)
    loadClientFinance(client._id);

    // Contrato
    loadClientContract(client._id);

    // Histórico
    loadClientHistory(client._id);
}

// Carregar informações financeiras do cliente
async function loadClientFinance(clientId) {
    try {
        // Tentar carregar do banco de dados (se existir a collection)
        const response = await fetch(`${API_BASE}/client-finance/${clientId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.finance) {
                document.getElementById('client-valor-pago').value = data.finance.valorPago || '';
                document.getElementById('client-valor-investido').value = data.finance.valorInvestido || '';
                calculateClientProfit();
            }
        }
    } catch (error) {
        console.log('Finance data not found, using defaults');
        // Usar valores padrão vazios
        document.getElementById('client-valor-pago').value = '';
        document.getElementById('client-valor-investido').value = '';
        calculateClientProfit();
    }
}

// Calcular lucro e margem do cliente
function calculateClientProfit() {
    const valorPago = parseFloat(document.getElementById('client-valor-pago').value) || 0;
    const valorInvestido = parseFloat(document.getElementById('client-valor-investido').value) || 0;

    const lucro = valorPago - valorInvestido;
    const margem = valorPago > 0 ? ((lucro / valorPago) * 100) : 0;

    document.getElementById('client-lucro').textContent = `R$ ${lucro.toFixed(2)}`;
    document.getElementById('client-lucro').className = `finance-result ${lucro >= 0 ? 'positive' : 'negative'}`;

    document.getElementById('client-margem').textContent = `${margem.toFixed(1)}%`;
    document.getElementById('client-margem').className = `finance-result ${margem >= 0 ? 'positive' : 'negative'}`;
}

// Atualizar informações financeiras do cliente
async function updateClientFinance() {
    calculateClientProfit();

    const clientId = document.getElementById('client-select').value;
    if (!clientId) return;

    const financeData = {
        clientId: clientId,
        valorPago: parseFloat(document.getElementById('client-valor-pago').value) || 0,
        valorInvestido: parseFloat(document.getElementById('client-valor-investido').value) || 0,
        updatedAt: new Date()
    };

    try {
        const response = await fetch(`${API_BASE}/client-finance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(financeData)
        });

        if (response.ok) {
            showNotification('✅ Informações financeiras atualizadas!', 'success');
        } else {
            throw new Error('Erro ao salvar');
        }
    } catch (error) {
        console.error('Erro ao atualizar finance:', error);
        showNotification('❌ Erro ao atualizar informações financeiras', 'error');
    }
}

// Carregar contrato do cliente
async function loadClientContract(clientId) {
    try {
        const response = await fetch(`${API_BASE}/client-contract/${clientId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.contract) {
                document.getElementById('current-contract-name').textContent = data.contract.filename;
                document.getElementById('download-contract').href = data.contract.url;
                document.getElementById('download-contract').style.display = 'inline';
            } else {
                resetContractDisplay();
            }
        } else {
            resetContractDisplay();
        }
    } catch (error) {
        console.log('Contract not found');
        resetContractDisplay();
    }
}

function resetContractDisplay() {
    document.getElementById('current-contract-name').textContent = 'Nenhum contrato enviado';
    document.getElementById('download-contract').style.display = 'none';
}

// Upload de contrato
async function uploadContract() {
    const fileInput = document.getElementById('contract-upload');
    const file = fileInput.files[0];
    const clientId = document.getElementById('client-select').value;

    if (!file || !clientId) {
        showNotification('❌ Selecione um arquivo e um cliente', 'error');
        return;
    }

    if (file.type !== 'application/pdf') {
        showNotification('❌ Apenas arquivos PDF são permitidos', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('contract', file);
    formData.append('clientId', clientId);

    try {
        const response = await fetch(`${API_BASE}/client-contract/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('✅ Contrato enviado com sucesso!', 'success');
            loadClientContract(clientId);
            fileInput.value = ''; // Limpar input
        } else {
            throw new Error('Erro no upload');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        showNotification('❌ Erro ao enviar contrato', 'error');
    }
}

// Carregar histórico do cliente
async function loadClientHistory(clientId) {
    try {
        const response = await fetch(`${API_BASE}/client-history/${clientId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.history) {
                displayClientHistory(data.history);
            } else {
                displayEmptyHistory();
            }
        } else {
            displayEmptyHistory();
        }
    } catch (error) {
        console.log('History not found');
        displayEmptyHistory();
    }
}

function displayClientHistory(history) {
    const container = document.getElementById('client-history');
    container.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-date">${new Date(item.date).toLocaleDateString('pt-BR')}</div>
            <div class="history-action">${item.action}</div>
            <div class="history-details">${item.details}</div>
        </div>
    `).join('');
}

function displayEmptyHistory() {
    const container = document.getElementById('client-history');
    container.innerHTML = `
        <div class="empty-state">
            <span>📋</span>
            <p>Nenhum histórico disponível</p>
        </div>
    `;
}

// ==================== FUNÇÕES DE GESTORES ====================

// Carregar dados dos gestores
async function loadGestoresData() {
    try {
        const response = await fetch(`${API_BASE}/gestores`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            atualizarEstatisticasGestores(data.gestores);
            renderizarGestores(data.gestores);
        }
    } catch (error) {
        console.error('Erro ao carregar gestores:', error);
        showNotification('❌ Erro ao carregar gestores: ' + error.message, 'error');
    }
}

// Atualizar estatísticas dos gestores
function atualizarEstatisticasGestores(gestores) {
    const totalGestores = gestores.filter(g => g.tipo === 'autonomo').length;
    const totalAgencias = gestores.filter(g => g.tipo === 'agencia').length;
    const receitaTotal = gestores.reduce((sum, g) => sum + (g.valorMensal || 0), 0);
    const margemMedia = gestores.length > 0 ? 
        gestores.reduce((sum, g) => sum + (g.comissao || 0), 0) / gestores.length : 0;

    document.getElementById('total-gestores').textContent = totalGestores;
    document.getElementById('total-agencias').textContent = totalAgencias;
    document.getElementById('receita-total').textContent = `R$ ${receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('margem-media').textContent = `${margemMedia.toFixed(1)}%`;
}

// Renderizar lista de gestores
function renderizarGestores(gestores) {
    const container = document.getElementById('gestores-list');
    
    if (gestores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>👥</span>
                <p>Nenhum gestor configurado</p>
                <button class="btn-secondary" onclick="openNovoGestorModal()">Configurar Primeiro Gestor</button>
            </div>
        `;
        return;
    }

    container.innerHTML = gestores.map(gestor => `
        <div class="gestor-card" onclick="editarGestor('${gestor._id}')">
            <div class="gestor-header">
                <h4>${gestor.nome}</h4>
                <span class="gestor-type ${gestor.tipo}">${getTipoGestorText(gestor.tipo)}</span>
            </div>
            <div class="gestor-info">
                <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">${gestor.email}</span>
                </div>
                <div class="info-item">
                    <span class="label">Valor Mensal:</span>
                    <span class="value">R$ ${gestor.valorMensal?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</span>
                </div>
                ${gestor.tipo === 'agencia' ? `
                    <div class="info-item">
                        <span class="label">Setup:</span>
                        <span class="value">R$ ${gestor.valorSetup?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Comissão:</span>
                        <span class="value">${gestor.comissao || 0}%</span>
                    </div>
                ` : ''}
            </div>
            <div class="gestor-status">
                <span class="status-${gestor.status === 'ativo' ? 'success' : 'secondary'}">${getStatusGestorText(gestor.status)}</span>
            </div>
        </div>
    `).join('');
}

// Funções auxiliares para gestores
function getTipoGestorText(tipo) {
    return tipo === 'autonomo' ? 'Autônomo' : 'Agência';
}

function getStatusGestorText(status) {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
}

// Funções dos modais de gestores
function openNovoGestorModal(gestorId = null) {
    const modal = document.getElementById('novo-gestor-modal');
    const form = document.getElementById('novo-gestor-form');
    
    if (gestorId) {
        // Modo edição
        document.querySelector('#novo-gestor-modal .modal-header h3').textContent = '✏️ Editar Gestor';
        // Carregar dados do gestor para edição
        loadGestorForEdit(gestorId);
    } else {
        // Modo criação
        document.querySelector('#novo-gestor-modal .modal-header h3').textContent = '➕ Configurar Gestor';
        form.reset();
        toggleAgenciaFields();
    }
    
    modal.style.display = 'block';
}

function closeNovoGestorModal() {
    document.getElementById('novo-gestor-modal').style.display = 'none';
    document.getElementById('novo-gestor-form').reset();
}

function toggleAgenciaFields() {
    const tipo = document.getElementById('gestor-tipo').value;
    const agenciaFields = document.querySelectorAll('.agencia-only');
    
    agenciaFields.forEach(field => {
        field.style.display = tipo === 'agencia' ? 'block' : 'none';
    });
}

// Salvar gestor
async function salvarGestor() {
    const form = document.getElementById('novo-gestor-form');
    const formData = new FormData(form);
    
    const gestor = {
        nome: formData.get('gestor-nome'),
        email: formData.get('gestor-email'),
        tipo: formData.get('gestor-tipo'),
        valorMensal: parseFloat(formData.get('gestor-valor-mensal')),
        status: formData.get('gestor-status')
    };
    
    if (gestor.tipo === 'agencia') {
        gestor.valorSetup = parseFloat(formData.get('gestor-valor-setup')) || 0;
        gestor.comissao = parseFloat(formData.get('gestor-comissao')) || 0;
    }
    
    try {
        const response = await fetch(`${API_BASE}/gestores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gestor)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Gestor salvo com sucesso!', 'success');
            closeNovoGestorModal();
            loadGestoresData();
        } else {
            throw new Error(result.message || 'Erro ao salvar gestor');
        }
    } catch (error) {
        console.error('Erro ao salvar gestor:', error);
        showNotification('❌ Erro ao salvar gestor: ' + error.message, 'error');
    }
}

// Editar gestor
function editarGestor(gestorId) {
    openNovoGestorModal(gestorId);
}

// Carregar gestor para edição
async function loadGestorForEdit(gestorId) {
    try {
        const response = await fetch(`${API_BASE}/gestores/${gestorId}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.gestor) {
            const g = data.gestor;
            document.getElementById('gestor-nome').value = g.nome || '';
            document.getElementById('gestor-email').value = g.email || '';
            document.getElementById('gestor-tipo').value = g.tipo || 'autonomo';
            document.getElementById('gestor-valor-mensal').value = g.valorMensal || '';
            document.getElementById('gestor-status').value = g.status || 'ativo';
            
            if (g.tipo === 'agencia') {
                document.getElementById('gestor-valor-setup').value = g.valorSetup || '';
                document.getElementById('gestor-comissao').value = g.comissao || '';
            }
            
            toggleAgenciaFields();
        }
    } catch (error) {
        console.error('Erro ao carregar gestor:', error);
        showNotification('❌ Erro ao carregar gestor para edição', 'error');
    }
}

// ==================== DESIGN & COPY ====================

// Upload de materiais de design
async function uploadDesignMaterials(files) {
    const formData = new FormData();
    const campaignId = document.getElementById('campaign-filter').value || 'general';
    
    for (let file of files) {
        formData.append('files', file);
    }
    formData.append('campaignId', campaignId);
    formData.append('type', 'design');
    
    try {
        const response = await fetch(`${API_BASE}/design-materials`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Materiais enviados com sucesso!', 'success');
            loadMaterialsLibrary();
            loadActiveCampaignsDesign();
        } else {
            showNotification('❌ Erro ao enviar materiais', 'error');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        showNotification('❌ Erro ao enviar materiais', 'error');
    }
}

// Carregar biblioteca de materiais
async function loadMaterialsLibrary() {
    try {
        const response = await fetch(`${API_BASE}/design-materials`);
        const data = await response.json();
        
        if (data.success && data.materials.length > 0) {
            displayMaterials(data.materials);
        } else {
            document.getElementById('materials-library').innerHTML = `
                <div class="empty-state">
                    <span>📁</span>
                    <p>Nenhum material disponível</p>
                    <p>Os designers ainda não enviaram materiais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar materiais:', error);
    }
}

// Exibir materiais na biblioteca
function displayMaterials(materials) {
    const container = document.getElementById('materials-library');
    
    const materialsHtml = materials.map(material => `
        <div class="material-card">
            <div class="material-header">
                <h4>${material.filename}</h4>
                <span class="material-date">${new Date(material.uploadDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="material-meta">
                <span class="campaign-tag">${material.campaignId}</span>
                <span class="file-type">${material.fileType}</span>
            </div>
            <div class="material-actions">
                <button class="btn-secondary" onclick="downloadMaterial('${material._id}')">📥 Baixar</button>
                <button class="btn-secondary" onclick="shareMaterial('${material._id}')">🔗 Compartilhar</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = materialsHtml;
}

// Filtrar materiais por campanha
function filterMaterials() {
    const campaignId = document.getElementById('campaign-filter').value;
    loadMaterialsLibrary(); // Recarregar com filtro
}

// Baixar material
async function downloadMaterial(materialId) {
    try {
        const response = await fetch(`${API_BASE}/design-materials/${materialId}/download`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'material_design';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Erro ao baixar material:', error);
        showNotification('❌ Erro ao baixar material', 'error');
    }
}

// Compartilhar material
function shareMaterial(materialId) {
    const shareUrl = `${window.location.origin}/api/design-materials/${materialId}/share`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('🔗 Link copiado para área de transferência!', 'success');
    });
}

// Carregar campanhas ativas para design
async function loadActiveCampaignsDesign() {
    try {
        const response = await fetch(`${API_BASE}/campaigns/active`);
        const data = await response.json();
        
        if (data.success && data.campaigns.length > 0) {
            displayActiveCampaignsDesign(data.campaigns);
        } else {
            document.getElementById('active-campaigns-design').innerHTML = `
                <div class="empty-state">
                    <span>📈</span>
                    <p>Nenhuma campanha ativa</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar campanhas ativas:', error);
    }
}

// Exibir campanhas ativas
function displayActiveCampaignsDesign(campaigns) {
    const container = document.getElementById('active-campaigns-design');
    
    const campaignsHtml = campaigns.map(campaign => `
        <div class="campaign-card-design">
            <div class="campaign-header">
                <h4>${campaign.name}</h4>
                <span class="campaign-status status-${campaign.status}">${campaign.status}</span>
            </div>
            <div class="campaign-meta">
                <span>Cliente: ${campaign.client}</span>
                <span>Deadline: ${new Date(campaign.deadline).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="campaign-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${campaign.progress}%"></div>
                </div>
                <span>${campaign.progress}% concluído</span>
            </div>
            <div class="campaign-actions">
                <button class="btn-secondary" onclick="viewCampaignMaterials('${campaign._id}')">📁 Ver Materiais</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = campaignsHtml;
}

// Ver materiais de uma campanha específica
function viewCampaignMaterials(campaignId) {
    document.getElementById('campaign-filter').value = campaignId;
    filterMaterials();
    showNotification('📁 Filtrando materiais da campanha selecionada', 'info');
}

// Inicializar eventos de upload
function initializeDesignUpload() {
    const uploadArea = document.getElementById('design-upload-area');
    const fileInput = document.getElementById('design-files');
    
    if (uploadArea && fileInput) {
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            uploadDesignMaterials(files);
        });
        
        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            uploadDesignMaterials(files);
        });
    }
}

// Carregar campanhas para filtro
async function loadCampaignsForFilter() {
    try {
        const response = await fetch(`${API_BASE}/campaigns`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('campaign-filter');
            select.innerHTML = '<option value="">Todas as campanhas</option>';
            
            data.campaigns.forEach(campaign => {
                select.innerHTML += `<option value="${campaign._id}">${campaign.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar campanhas para filtro:', error);
    }
}

// Inicializar seção de design e copy
function initializeDesignCopySection() {
    loadMaterialsLibrary();
    loadActiveCampaignsDesign();
    loadCampaignsForFilter();
    initializeDesignUpload();
}

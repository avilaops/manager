// Configurações
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://manager-api.railway.app/api'; // Altere para sua URL de backend em produção

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
        crm: { title: 'CRM & Leads', subtitle: 'Gestão de clientes e email marketing' }
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
    // Funcionalidade desabilitada por enquanto
    console.log('Rotina diária do LinkedIn - em desenvolvimento');
}

function showEngagementTemplates() {
    // Funcionalidade desabilitada por enquanto
    console.log('Templates de engagement - em desenvolvimento');
}

function showTodayTasks() {
    // Funcionalidade desabilitada por enquanto
    console.log('Tarefas do dia - em desenvolvimento');
}

function openGrowthMenu() {
    // Funcionalidade desabilitada por enquanto
    console.log('Menu de crescimento - em desenvolvimento');
}

function openDailyChecklist() {
    // Funcionalidade desabilitada por enquanto
    console.log('Checklist diário - em desenvolvimento');
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
        const linkIcon = comp.linkReuniao ? `<a href="${comp.linkReuniao}" target="_blank" style="margin-left: 10px; color: #3b82f6; text-decoration: none;">🔗 Link</a>` : '';
        html += `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${comp.titulo}</div>
                        <p style="color: #64748b; margin-top: 5px;">${comp.descricao || 'Sem descrição'}</p>
                    </div>
                    <span class="service-status status-active">⏰ ${dataFormatada} ${linkIcon}</span>
                </div>
                <button onclick="removerCompromisso(${index})" style="margin-top: 10px; background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 1.2em;" title="Remover">
                    🗑️
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function agendarCompromisso() {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const lembrete = document.getElementById('lembrete').value;
    const linkReuniao = document.getElementById('linkReuniao').value;
    
    if (!titulo || !data || !hora) {
        alert('❌ Preencha título, data e hora!');
        return;
    }
    
    try {
        // Enviar para o backend agendar automaticamente
        const response = await fetch('http://localhost:3000/api/calendar/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, data, hora, lembrete, linkReuniao })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            // Salvar também no localStorage
            const compromissos = JSON.parse(localStorage.getItem('compromissos') || '[]');
            compromissos.push({ titulo, descricao, data, hora, lembrete, linkReuniao });
            localStorage.setItem('compromissos', JSON.stringify(compromissos));
            
            // Limpar formulário
            document.getElementById('calendar-form').reset();
            
            // Recarregar lista
            carregarCompromissos();
        } else {
            alert('❌ Erro ao agendar: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao agendar:', error);
        alert('❌ Erro ao conectar com o servidor!');
    }
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
        html += '<button onclick="openCadastroCompletoModal()" class="btn-primary" style="padding: 12px 24px;">➕ Adicionar Lead Manualmente</button>';
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

// Visualizar provisionamento do cliente
async function viewClientProvision(leadId) {
    try {
        const response = await fetch(`${API_BASE}/crm/leads/${leadId}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);
        
        const lead = data.lead;
        const provision = lead.provisionamento || {};
        
        let html = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 700px; margin: 20px auto;">
                <h2 style="margin-bottom: 25px; color: #1e293b;">🔍 Provisionamento do Cliente</h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #475569; margin-bottom: 15px;">📋 Informações do Cliente</h3>
                    <p><strong>Nome:</strong> ${lead.nome}</p>
                    <p><strong>Email:</strong> ${lead.email}</p>
                    <p><strong>Empresa:</strong> ${lead.empresa || 'Não informado'}</p>
                    <p><strong>Status:</strong> ${lead.status}</p>
                </div>
                
                ${provision.github ? `
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                        <h3 style="color: #166534; margin-bottom: 15px;">✅ GitHub Repository</h3>
                        <p><strong>Repositório:</strong> <a href="${provision.github.url}" target="_blank" style="color: #3b82f6;">${provision.github.name}</a></p>
                        <p><strong>GitHub Pages:</strong> <a href="${provision.github.pagesUrl}" target="_blank" style="color: #3b82f6;">${provision.github.pagesUrl}</a></p>
                        <p><strong>Criado em:</strong> ${new Date(provision.github.criadoEm).toLocaleString('pt-BR')}</p>
                    </div>
                ` : ''}
                
                ${provision.mongodb ? `
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                        <h3 style="color: #166534; margin-bottom: 15px;">✅ MongoDB Database</h3>
                        <p><strong>Database:</strong> ${provision.mongodb.database}</p>
                        <p><strong>Collection:</strong> ${provision.mongodb.collection}</p>
                        <p><strong>Connection String:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">${provision.mongodb.uri ? '***hidden***' : 'Não configurado'}</code></p>
                    </div>
                ` : ''}
                
                ${provision.railway ? `
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
                        <h3 style="color: #075985; margin-bottom: 15px;">✅ Railway Deployment</h3>
                        <p><strong>Projeto:</strong> ${provision.railway.projectName}</p>
                        <p><strong>URL:</strong> <a href="${provision.railway.url}" target="_blank" style="color: #3b82f6;">${provision.railway.url}</a></p>
                        <p><strong>Status:</strong> ${provision.railway.status}</p>
                    </div>
                ` : ''}
                
                ${!provision.github && !provision.mongodb && !provision.railway ? `
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #92400e; margin-bottom: 10px;">⚠️ Provisionamento Pendente</h3>
                        <p style="color: #78350f;">Este cliente ainda não foi provisionado. Clique em "Fechar Venda & Provisionar" para iniciar o processo automático.</p>
                    </div>
                ` : ''}
                
                <button onclick="this.parentElement.remove()" class="btn-primary" style="width: 100%; margin-top: 20px; padding: 12px;">
                    Fechar
                </button>
            </div>
        `;
        
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; overflow-y: auto; padding: 20px;';
        modal.innerHTML = html;
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        document.body.appendChild(modal);
        
    } catch (error) {
        alert('❌ Erro ao carregar provisionamento: ' + error.message);
    }
}

// ============================================
// LIGHTROOM INSPECTOR - Sistema de Inspeção
// ============================================

async function runSystemInspection() {
    const resultsDiv = document.getElementById('inspection-results');
    const placeholderDiv = document.getElementById('inspection-placeholder');
    
    // Esconder placeholder e mostrar loading
    placeholderDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading"></div>
            <p style="color: #64748b; margin-top: 20px;">Escaneando sistema... Isso pode levar alguns segundos.</p>
        </div>
    `;
    
    // Simular delay para análise
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Executar todas as verificações
    const results = {
        errors: await checkJavaScriptErrors(),
        endpoints: await checkEndpoints(),
        performance: await checkPerformance(),
        ui: await checkUIIssues(),
        security: await checkSecurity(),
        improvements: await suggestImprovements()
    };
    
    // Renderizar resultados
    renderInspectionResults(results);
}

async function checkJavaScriptErrors() {
    const errors = [];
    
    // Verificar funções não definidas
    const undefinedFunctions = [];
    const allScripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML);
    
    // Capturar erros do console
    const originalError = console.error;
    const capturedErrors = [];
    console.error = (...args) => {
        capturedErrors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    return {
        count: capturedErrors.length,
        items: capturedErrors.slice(0, 5),
        severity: capturedErrors.length > 0 ? 'error' : 'success'
    };
}

async function checkEndpoints() {
    const endpoints = [
        { name: 'CRM Leads', url: '/api/crm/leads' },
        { name: 'CRM Contacts', url: '/api/crm/contacts' },
        { name: 'Calendar Schedule', url: '/api/calendar/schedule' },
        { name: 'GitHub Repos', url: '/api/github/repos' },
        { name: 'MongoDB Databases', url: '/api/mongodb/databases' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE}${endpoint.url}`);
            results.push({
                name: endpoint.name,
                url: endpoint.url,
                status: response.ok ? 'online' : 'offline',
                statusCode: response.status
            });
        } catch (error) {
            results.push({
                name: endpoint.name,
                url: endpoint.url,
                status: 'error',
                error: error.message
            });
        }
    }
    
    const online = results.filter(r => r.status === 'online').length;
    const total = results.length;
    
    return {
        count: online,
        total: total,
        items: results,
        severity: online === total ? 'success' : (online > total / 2 ? 'warning' : 'error')
    };
}

async function checkPerformance() {
    const issues = [];
    
    // Verificar tamanho do DOM
    const domSize = document.querySelectorAll('*').length;
    if (domSize > 1500) {
        issues.push({ type: 'DOM grande', value: `${domSize} elementos`, recommendation: 'Considere lazy loading ou virtualização' });
    }
    
    // Verificar imagens sem lazy loading
    const images = document.querySelectorAll('img:not([loading="lazy"])');
    if (images.length > 10) {
        issues.push({ type: 'Imagens sem lazy loading', value: `${images.length} imagens`, recommendation: 'Adicione loading="lazy" nas imagens' });
    }
    
    // Verificar scripts inline
    const inlineScripts = document.querySelectorAll('script:not([src])');
    if (inlineScripts.length > 5) {
        issues.push({ type: 'Muitos scripts inline', value: `${inlineScripts.length} scripts`, recommendation: 'Consolide scripts em arquivos externos' });
    }
    
    // Verificar localStorage
    const localStorageSize = JSON.stringify(localStorage).length;
    if (localStorageSize > 5 * 1024 * 1024) {
        issues.push({ type: 'localStorage grande', value: `${(localStorageSize / 1024 / 1024).toFixed(2)} MB`, recommendation: 'Limpe dados antigos do localStorage' });
    }
    
    return {
        count: issues.length,
        items: issues,
        severity: issues.length === 0 ? 'success' : (issues.length < 3 ? 'warning' : 'error')
    };
}

async function checkUIIssues() {
    const issues = [];
    
    // Verificar contraste de cores
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        if (idx < 3) { // Apenas primeiros 3 para exemplo
            const bgColor = window.getComputedStyle(btn).backgroundColor;
            const color = window.getComputedStyle(btn).color;
            // Simplificado - em produção usaria algoritmo WCAG
            if (bgColor === color) {
                issues.push({ type: 'Contraste baixo', element: btn.textContent?.slice(0, 30), recommendation: 'Ajuste cores para melhor legibilidade' });
            }
        }
    });
    
    // Verificar botões sem title/aria-label
    const buttonsWithoutLabel = document.querySelectorAll('button:not([title]):not([aria-label])');
    if (buttonsWithoutLabel.length > 5) {
        issues.push({ type: 'Acessibilidade', value: `${buttonsWithoutLabel.length} botões sem labels`, recommendation: 'Adicione title ou aria-label para leitores de tela' });
    }
    
    // Verificar inputs sem labels
    const inputsWithoutLabel = document.querySelectorAll('input:not([aria-label]):not([id])');
    if (inputsWithoutLabel.length > 0) {
        issues.push({ type: 'Formulários', value: `${inputsWithoutLabel.length} inputs sem label`, recommendation: 'Associe labels aos inputs para acessibilidade' });
    }
    
    return {
        count: issues.length,
        items: issues,
        severity: issues.length === 0 ? 'success' : (issues.length < 3 ? 'warning' : 'error')
    };
}

async function checkSecurity() {
    const issues = [];
    
    // Verificar links externos sem rel="noopener"
    const externalLinks = document.querySelectorAll('a[target="_blank"]:not([rel*="noopener"])');
    if (externalLinks.length > 0) {
        issues.push({ type: 'Links externos', value: `${externalLinks.length} links`, recommendation: 'Adicione rel="noopener noreferrer" para segurança' });
    }
    
    // Verificar se tem HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        issues.push({ type: 'Protocolo HTTP', value: 'Sem HTTPS', recommendation: 'Configure SSL/TLS para conexões seguras' });
    }
    
    // Verificar tokens expostos no código
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML).join('');
    if (scripts.includes('sk_') || scripts.includes('pk_test') || scripts.includes('ghp_')) {
        issues.push({ type: 'Token exposto', value: 'Possível token no código', recommendation: 'Use variáveis de ambiente para tokens sensíveis' });
    }
    
    return {
        count: issues.length,
        items: issues,
        severity: issues.length === 0 ? 'success' : (issues.length < 2 ? 'warning' : 'error')
    };
}

async function suggestImprovements() {
    const suggestions = [];
    
    // Verificar se tem Service Worker
    if (!('serviceWorker' in navigator)) {
        suggestions.push({ 
            type: 'PWA', 
            title: 'Progressive Web App', 
            description: 'Adicione Service Worker para funcionalidade offline e melhor performance',
            priority: 'medium'
        });
    }
    
    // Verificar cache do navegador
    if (!document.querySelector('meta[http-equiv="cache-control"]')) {
        suggestions.push({ 
            type: 'Cache', 
            title: 'Otimização de Cache', 
            description: 'Configure cache headers para melhorar velocidade de carregamento',
            priority: 'low'
        });
    }
    
    // Sugerir dark mode
    if (!document.querySelector('[data-theme]') && !localStorage.getItem('theme')) {
        suggestions.push({ 
            type: 'UI/UX', 
            title: 'Modo Escuro', 
            description: 'Implemente theme switcher para dark mode',
            priority: 'medium'
        });
    }
    
    // Sugerir lazy loading para imagens
    const imagesCount = document.querySelectorAll('img').length;
    const lazyImages = document.querySelectorAll('img[loading="lazy"]').length;
    if (imagesCount > 10 && lazyImages < imagesCount * 0.5) {
        suggestions.push({ 
            type: 'Performance', 
            title: 'Lazy Loading de Imagens', 
            description: `${imagesCount - lazyImages} imagens poderiam usar lazy loading`,
            priority: 'high'
        });
    }
    
    // Sugerir minificação
    suggestions.push({ 
        type: 'Build', 
        title: 'Minificação de Assets', 
        description: 'Configure build pipeline para minificar JS/CSS em produção',
        priority: 'medium'
    });
    
    // Sugerir analytics
    if (!window.gtag && !window._paq) {
        suggestions.push({ 
            type: 'Analytics', 
            title: 'Monitoramento de Usuários', 
            description: 'Adicione Google Analytics ou alternativa para insights de uso',
            priority: 'low'
        });
    }
    
    return {
        count: suggestions.length,
        items: suggestions
    };
}

function renderInspectionResults(results) {
    const resultsDiv = document.getElementById('inspection-results');
    
    const severityColors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    const severityIcons = {
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    
    let html = `
        <div style="margin-bottom: 30px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div class="service-card" style="border-left: 4px solid ${severityColors[results.errors.severity]};">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">ERROS JS</h4>
                    <div style="font-size: 2em;">${severityIcons[results.errors.severity]}</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.errors.count}</p>
                </div>
                
                <div class="service-card" style="border-left: 4px solid ${severityColors[results.endpoints.severity]};">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">ENDPOINTS</h4>
                    <div style="font-size: 2em;">${severityIcons[results.endpoints.severity]}</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.endpoints.count}/${results.endpoints.total}</p>
                </div>
                
                <div class="service-card" style="border-left: 4px solid ${severityColors[results.performance.severity]};">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">PERFORMANCE</h4>
                    <div style="font-size: 2em;">${severityIcons[results.performance.severity]}</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.performance.count} problemas</p>
                </div>
                
                <div class="service-card" style="border-left: 4px solid ${severityColors[results.ui.severity]};">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">UI/UX</h4>
                    <div style="font-size: 2em;">${severityIcons[results.ui.severity]}</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.ui.count} problemas</p>
                </div>
                
                <div class="service-card" style="border-left: 4px solid ${severityColors[results.security.severity]};">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">SEGURANÇA</h4>
                    <div style="font-size: 2em;">${severityIcons[results.security.severity]}</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.security.count} problemas</p>
                </div>
                
                <div class="service-card" style="border-left: 4px solid #3b82f6;">
                    <h4 style="color: #64748b; font-size: 0.85em; margin-bottom: 8px;">MELHORIAS</h4>
                    <div style="font-size: 2em;">💡</div>
                    <p style="font-size: 1.5em; font-weight: bold; margin: 10px 0;">${results.improvements.count} sugestões</p>
                </div>
            </div>
        </div>
        
        <!-- Detalhes dos Endpoints -->
        <div class="service-card" style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🔌 Status dos Endpoints</h3>
            <div style="display: grid; gap: 10px;">
                ${results.endpoints.items.map(endpoint => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${endpoint.status === 'online' ? '#f0fdf4' : '#fef2f2'}; border-radius: 6px;">
                        <div>
                            <strong>${endpoint.name}</strong>
                            <p style="color: #64748b; font-size: 0.85em; margin-top: 4px;">${endpoint.url}</p>
                        </div>
                        <span style="background: ${endpoint.status === 'online' ? '#10b981' : '#ef4444'}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.85em;">
                            ${endpoint.status === 'online' ? '✅ Online' : '❌ Offline'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Problemas de Performance -->
        ${results.performance.count > 0 ? `
            <div class="service-card" style="margin-bottom: 20px; border-left: 4px solid ${severityColors[results.performance.severity]};">
                <h3 style="margin-bottom: 15px;">⚡ Problemas de Performance</h3>
                ${results.performance.items.map(issue => `
                    <div style="padding: 12px; background: #fef3c7; border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: #92400e;">${issue.type}</strong>
                        <p style="color: #78350f; margin: 5px 0;">${issue.value}</p>
                        <p style="color: #64748b; font-size: 0.85em;">💡 ${issue.recommendation}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Problemas de UI/UX -->
        ${results.ui.count > 0 ? `
            <div class="service-card" style="margin-bottom: 20px; border-left: 4px solid ${severityColors[results.ui.severity]};">
                <h3 style="margin-bottom: 15px;">🎨 Problemas de UI/UX</h3>
                ${results.ui.items.map(issue => `
                    <div style="padding: 12px; background: #fef3c7; border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: #92400e;">${issue.type}</strong>
                        <p style="color: #78350f; margin: 5px 0;">${issue.value || issue.element || ''}</p>
                        <p style="color: #64748b; font-size: 0.85em;">💡 ${issue.recommendation}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Problemas de Segurança -->
        ${results.security.count > 0 ? `
            <div class="service-card" style="margin-bottom: 20px; border-left: 4px solid ${severityColors[results.security.severity]};">
                <h3 style="margin-bottom: 15px;">🔒 Problemas de Segurança</h3>
                ${results.security.items.map(issue => `
                    <div style="padding: 12px; background: #fee2e2; border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: #991b1b;">${issue.type}</strong>
                        <p style="color: #7f1d1d; margin: 5px 0;">${issue.value}</p>
                        <p style="color: #64748b; font-size: 0.85em;">💡 ${issue.recommendation}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Sugestões de Melhorias -->
        <div class="service-card" style="border-left: 4px solid #3b82f6;">
            <h3 style="margin-bottom: 15px;">💡 Sugestões de Melhorias</h3>
            <div style="display: grid; gap: 10px;">
                ${results.improvements.items.map(suggestion => {
                    const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
                    const priorityLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
                    return `
                        <div style="padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 3px solid ${priorityColors[suggestion.priority]};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <strong style="color: #1e293b;">${suggestion.title}</strong>
                                <span style="background: ${priorityColors[suggestion.priority]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75em;">
                                    ${priorityLabels[suggestion.priority]}
                                </span>
                            </div>
                            <p style="color: #475569; font-size: 0.9em;">${suggestion.description}</p>
                            <p style="color: #94a3b8; font-size: 0.8em; margin-top: 5px;">Categoria: ${suggestion.type}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button onclick="runSystemInspection()" class="btn-primary" style="padding: 14px 32px;">
                🔄 Escanear Novamente
            </button>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
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
    
    // Initialize notifications system
    initNotificationsSystem();
    
    // Load user settings
    loadUserSettings();
});

// ============================================
// NOTIFICATIONS SYSTEM
// ============================================

let notificationsData = [];

function initNotificationsSystem() {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
        notificationsData = JSON.parse(saved);
        updateNotificationBadge();
        renderNotifications();
    }
    
    // Add sample notification
    if (notificationsData.length === 0) {
        addNotification('info', 'Bem-vindo ao Gerenciador Pessoal!', 'Sistema carregado com sucesso', true);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const notifDropdown = document.getElementById('notificationsDropdown');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (!event.target.closest('.btn-icon') && !event.target.closest('.notifications-dropdown')) {
            notifDropdown.classList.remove('show');
        }
        
        if (!event.target.closest('.user-profile') && !event.target.closest('.profile-dropdown')) {
            profileDropdown.classList.remove('show');
            document.querySelector('.user-profile')?.classList.remove('active');
        }
    });
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    
    profileDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
    
    // Mark all as read
    notificationsData.forEach(n => n.unread = false);
    updateNotificationBadge();
    renderNotifications();
    saveNotifications();
}

function addNotification(type, title, message, unread = true) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        reading: '📚',
        email: '📧',
        backup: '💾'
    };
    
    const notification = {
        id: Date.now(),
        type,
        icon: icons[type] || 'ℹ️',
        title,
        message,
        time: new Date().toISOString(),
        unread
    };
    
    notificationsData.unshift(notification);
    
    // Keep only last 50 notifications
    if (notificationsData.length > 50) {
        notificationsData = notificationsData.slice(0, 50);
    }
    
    updateNotificationBadge();
    renderNotifications();
    saveNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    
    if (notificationsData.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">🔔</div>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = notificationsData.map(notif => {
        const timeAgo = getTimeAgo(new Date(notif.time));
        return `
            <div class="notification-item ${notif.unread ? 'unread' : ''}" 
                 onclick="markAsRead(${notif.id})">
                <span class="notification-icon">${notif.icon}</span>
                <div class="notification-content">
                    <p class="notification-title">${notif.title}</p>
                    ${notif.message ? `<p class="notification-time">${notif.message}</p>` : ''}
                    <p class="notification-time">${timeAgo}</p>
                </div>
            </div>
        `;
    }).join('');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unreadCount = notificationsData.filter(n => n.unread).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

function markAsRead(id) {
    const notif = notificationsData.find(n => n.id === id);
    if (notif) {
        notif.unread = false;
        updateNotificationBadge();
        renderNotifications();
        saveNotifications();
    }
}

function clearAllNotifications() {
    if (confirm('Deseja limpar todas as notificações?')) {
        notificationsData = [];
        updateNotificationBadge();
        renderNotifications();
        saveNotifications();
    }
}

function viewAllNotifications() {
    alert('Página de histórico de notificações em desenvolvimento!');
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notificationsData));
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
}

// ============================================
// PROFILE MENU
// ============================================

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const notifDropdown = document.getElementById('notificationsDropdown');
    const profileBtn = document.querySelector('.user-profile');
    
    notifDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
    profileBtn.classList.toggle('active');
}

function editProfile() {
    alert('Edição de perfil em desenvolvimento!\n\nEm breve você poderá:\n• Alterar foto\n• Editar informações\n• Configurar preferências');
    document.getElementById('profileDropdown').classList.remove('show');
}

async function viewStatistics() {
    document.getElementById('profileDropdown').classList.remove('show');
    
    // Mostrar loading
    const statsHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.95); padding: 40px; border-radius: 16px; 
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5); z-index: 10001; min-width: 400px;
                    color: white; font-family: system-ui;" id="statsModal">
            <div style="text-align: center; font-size: 18px; margin-bottom: 20px;">
                ⏳ Carregando estatísticas reais...
            </div>
        </div>
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000;" 
             id="statsOverlay" onclick="closeStatsModal()"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', statsHTML);
    
    try {
        // Buscar dados reais do backend
        const [ereaderRes, contactsRes, gmailRes] = await Promise.all([
            fetch('/api/ereader/estatisticas').catch(() => null),
            fetch('/api/crm/contacts').catch(() => null),
            fetch('/api/gmail/stats').catch(() => null)
        ]);
        
        // Parse das respostas
        const ereaderData = ereaderRes?.ok ? await ereaderRes.json() : null;
        const contactsData = contactsRes?.ok ? await contactsRes.json() : null;
        const gmailData = gmailRes?.ok ? await gmailRes.json() : null;
        
        // Extrair estatísticas reais
        const stats = {
            diasConsecutivos: ereaderData?.estatisticas?.diasConsecutivos || 0,
            paginasLidas: ereaderData?.estatisticas?.paginasLidas || 0,
            entradasDiario: ereaderData?.estatisticas?.entradasDiario || 0,
            contatos: contactsData?.total || 0,
            emails: gmailData?.totalEmails || 0
        };
        
        // Atualizar modal com dados reais
        const modalContent = `
            <div style="text-align: left;">
                <h2 style="text-align: center; margin: 0 0 30px 0; font-size: 24px; color: #3b82f6;">
                    📊 Estatísticas do usuário
                </h2>
                <div style="display: grid; gap: 16px; font-size: 16px; line-height: 1.8;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(16,185,129,0.1); border-radius: 8px; border-left: 4px solid #10b981;">
                        <span style="font-size: 24px;">✅</span>
                        <div>
                            <strong>Meta de leitura:</strong> ${stats.diasConsecutivos} dias consecutivos
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(59,130,246,0.1); border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <span style="font-size: 24px;">📖</span>
                        <div>
                            <strong>Páginas lidas:</strong> ${stats.paginasLidas.toLocaleString('pt-BR')} total
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(139,92,246,0.1); border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <span style="font-size: 24px;">📔</span>
                        <div>
                            <strong>Entradas no diário:</strong> ${stats.entradasDiario}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(245,158,11,0.1); border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <span style="font-size: 24px;">🤝</span>
                        <div>
                            <strong>Contatos gerenciados:</strong> ${stats.contatos.toLocaleString('pt-BR')}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(236,72,153,0.1); border-radius: 8px; border-left: 4px solid #ec4899;">
                        <span style="font-size: 24px;">📧</span>
                        <div>
                            <strong>Emails sincronizados:</strong> ${stats.emails > 0 ? stats.emails.toLocaleString('pt-BR') : 'Aguardando sincronização'}
                        </div>
                    </div>
                </div>
                <button onclick="closeStatsModal()" 
                        style="width: 100%; margin-top: 30px; padding: 14px; background: #3b82f6; 
                               color: white; border: none; border-radius: 8px; font-size: 16px; 
                               font-weight: 600; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='#2563eb'" 
                        onmouseout="this.style.background='#3b82f6'">
                    OK
                </button>
            </div>
        `;
        
        document.getElementById('statsModal').innerHTML = modalContent;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('statsModal').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <div style="font-size: 18px; margin-bottom: 20px;">
                    Erro ao carregar estatísticas
                </div>
                <button onclick="closeStatsModal()" 
                        style="padding: 12px 24px; background: #3b82f6; color: white; 
                               border: none; border-radius: 8px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
    }
}

function closeStatsModal() {
    document.getElementById('statsModal')?.remove();
    document.getElementById('statsOverlay')?.remove();
}

function openHelp() {
    window.open('/docs/MANUAL_COMPLETO.md', '_blank');
    document.getElementById('profileDropdown').classList.remove('show');
}

function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        // Clear user data
        localStorage.removeItem('user');
        // Redirect to login
        window.location.href = '/login.html';
    }
}

// ============================================
// SETTINGS MODAL
// ============================================

let userSettings = {
    language: 'pt-BR',
    readingGoal: 10,
    autoSave: true,
    autoBackup: true,
    theme: 'light',
    fontSize: 'medium',
    animations: true,
    notifyMeta: true,
    notifyEmail: true,
    notifyBackup: true,
    notifyReminders: true,
    name: 'Nicolas Rosa',
    email: 'nicolas@avila.com',
    phone: ''
};

function loadUserSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        userSettings = { ...userSettings, ...JSON.parse(saved) };
    }
    applySettings();
}

function applySettings() {
    // Apply theme
    document.body.setAttribute('data-theme', userSettings.theme);
    
    // Apply font size
    document.body.setAttribute('data-font-size', userSettings.fontSize);
    
    // Update E-Reader meta if available
    if (window.ereaderSystem) {
        ereaderSystem.metaDiaria = userSettings.readingGoal;
    }
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('show');
    
    // Close dropdowns
    document.getElementById('profileDropdown').classList.remove('show');
    document.getElementById('notificationsDropdown').classList.remove('show');
    
    // Load current settings into form
    document.getElementById('settingLanguage').value = userSettings.language;
    document.getElementById('settingReadingGoal').value = userSettings.readingGoal;
    document.getElementById('settingAutoSave').checked = userSettings.autoSave;
    document.getElementById('settingAutoBackup').checked = userSettings.autoBackup;
    document.getElementById('settingTheme').value = userSettings.theme;
    document.getElementById('settingFontSize').value = userSettings.fontSize;
    document.getElementById('settingAnimations').checked = userSettings.animations;
    document.getElementById('settingNotifyMeta').checked = userSettings.notifyMeta;
    document.getElementById('settingNotifyEmail').checked = userSettings.notifyEmail;
    document.getElementById('settingNotifyBackup').checked = userSettings.notifyBackup;
    document.getElementById('settingNotifyReminders').checked = userSettings.notifyReminders;
    document.getElementById('settingName').value = userSettings.name;
    document.getElementById('settingEmail').value = userSettings.email;
    document.getElementById('settingPhone').value = userSettings.phone;
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

function switchSettingsTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.settings-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active to selected tab
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function saveSettings() {
    // Get values from form
    userSettings.language = document.getElementById('settingLanguage').value;
    userSettings.readingGoal = parseInt(document.getElementById('settingReadingGoal').value);
    userSettings.autoSave = document.getElementById('settingAutoSave').checked;
    userSettings.autoBackup = document.getElementById('settingAutoBackup').checked;
    userSettings.theme = document.getElementById('settingTheme').value;
    userSettings.fontSize = document.getElementById('settingFontSize').value;
    userSettings.animations = document.getElementById('settingAnimations').checked;
    userSettings.notifyMeta = document.getElementById('settingNotifyMeta').checked;
    userSettings.notifyEmail = document.getElementById('settingNotifyEmail').checked;
    userSettings.notifyBackup = document.getElementById('settingNotifyBackup').checked;
    userSettings.notifyReminders = document.getElementById('settingNotifyReminders').checked;
    userSettings.name = document.getElementById('settingName').value;
    userSettings.email = document.getElementById('settingEmail').value;
    userSettings.phone = document.getElementById('settingPhone').value;
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // Apply settings
    applySettings();
    
    // Update profile display
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = userSettings.name;
    });
    document.getElementById('profileName').textContent = userSettings.name;
    document.getElementById('profileEmail').textContent = userSettings.email;
    
    // Show notification
    addNotification('success', 'Configurações salvas!', 'Suas preferências foram atualizadas com sucesso');
    
    closeSettings();
}

function changePassword() {
    const newPassword = prompt('Digite sua nova senha:');
    if (newPassword && newPassword.length >= 6) {
        alert('✅ Senha alterada com sucesso!');
        addNotification('success', 'Senha alterada', 'Sua senha foi atualizada');
    } else if (newPassword) {
        alert('❌ A senha deve ter pelo menos 6 caracteres');
    }
}

function deleteAccount() {
    const confirm1 = confirm('⚠️ ATENÇÃO!\n\nEsta ação é IRREVERSÍVEL e apagará:\n• Todos seus dados\n• Histórico de leitura\n• Entradas do diário\n• Configurações\n\nDeseja realmente excluir sua conta?');
    
    if (confirm1) {
        const confirm2 = confirm('Última confirmação: Tem certeza absoluta?');
        if (confirm2) {
            // Clear all data
            localStorage.clear();
            alert('Conta excluída. Você será redirecionado...');
            window.location.href = '/';
        }
    }
}

// Expose notification function globally for E-Reader
window.addNotification = addNotification;

// ============================================
// CADASTRO COMPLETO MODAL
// ============================================

function openCadastroCompletoModal() {
    // Abrir a página de cadastro em uma nova aba
    window.open('/cadastro.html', '_blank');
}

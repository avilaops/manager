const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const nodemailer = require('nodemailer');
const stripe = require('stripe');
const { Octokit } = require('@octokit/rest');
const dns = require('dns');

// Configurar DNS para usar servidores do Google (resolver problemas de DNS)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 3000;

// Opções de conexão MongoDB com tratamento de DNS
const mongoOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Força IPv4
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 2
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Servir arquivos estáticos (HTML, CSS, JS)

// Endpoint para verificar status de configuração
app.get('/api/config/status', (req, res) => {
    const status = {
        github: {
            configured: !!(CONFIG.github.token && CONFIG.github.token !== 'seu_token_aqui'),
            username: CONFIG.github.username || 'Não configurado',
            hasToken: !!(CONFIG.github.token && CONFIG.github.token.startsWith('github_pat_'))
        },
        mongodb: {
            configured: !!(CONFIG.mongodb.uri && CONFIG.mongodb.uri.includes('mongodb')),
            hasConnection: CONFIG.mongodb.uri.includes('cluster0.npuhras')
        },
        linkedin: {
            configured: !!(CONFIG.linkedin.accessToken && CONFIG.linkedin.accessToken !== 'seu_token_aqui'),
            hasClientId: !!(CONFIG.linkedin.clientId),
            clientId: CONFIG.linkedin.clientId ? CONFIG.linkedin.clientId.substring(0, 8) + '...' : 'Não configurado'
        },
        meta: {
            configured: !!(CONFIG.meta.accessToken && CONFIG.meta.accessToken !== 'your_meta_access_token_here'),
            appId: CONFIG.meta.appId,
            hasInstagram: !!(CONFIG.meta.instagramAccountId && CONFIG.meta.instagramAccountId !== 'seu_id_aqui'),
            hasFacebook: !!(CONFIG.meta.facebookPageId && CONFIG.meta.facebookPageId !== 'your_facebook_page_id_here'),
            hasWhatsApp: !!(CONFIG.meta.whatsappAccountId && CONFIG.meta.whatsappAccountId !== 'your_whatsapp_account_id_here')
        },
        stripe: {
            configured: !!(CONFIG.stripe.secret && CONFIG.stripe.secret.startsWith('sk_')),
            testMode: CONFIG.stripe.secret?.includes('test') || false
        },
        railway: {
            configured: !!(CONFIG.railway.token && CONFIG.railway.token.length > 20)
        },
        azure: {
            configured: !!(CONFIG.azure.token && CONFIG.azure.token.length > 20)
        },
        openai: {
            configured: !!(CONFIG.openai.key && CONFIG.openai.key.startsWith('sk-')),
            hasKey: !!(CONFIG.openai.key)
        },
        sentry: {
            configured: !!(CONFIG.sentry && CONFIG.sentry.dsn)
        },
        gmail: {
            configured: true, // Assumindo que está configurado
            accounts: 3
        },
        gcloud: {
            configured: !!(CONFIG.gcloud && CONFIG.gcloud.projectId)
        },
        dns: {
            configured: !!(CONFIG.dns && (CONFIG.dns.porkbun || CONFIG.dns.cloudflare))
        }
    };
    
    res.json({ success: true, status });
});

// Configurações das APIs
const CONFIG = {
    mongodb: {
        // Local MongoDB (após instalação)
        uri: 'mongodb://localhost:27017/',
        // Fallback para Atlas (caso precise voltar)
        uriAtlas: 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    },
    github: {
        username: process.env.GITHUB_USERNAME || 'avilaops',
        token: process.env.GITHUB_TOKEN || 'your_github_token_here'
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || 'your_linkedin_client_id',
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || 'your_linkedin_token_here'
    },
    meta: {
        appId: process.env.META_APP_ID || 'your_meta_app_id',
        appSecret: process.env.META_APP_SECRET || 'your_meta_app_secret_here',
        accessToken: process.env.META_ACCESS_TOKEN || 'your_meta_access_token_here',
        instagramAccountId: process.env.INSTAGRAM_ACCOUNT_ID || 'your_instagram_id',
        facebookPageId: process.env.FACEBOOK_PAGE_ID || 'your_facebook_page_id_here',
        whatsappAccountId: process.env.WHATSAPP_ACCOUNT_ID || 'your_whatsapp_account_id_here'
    },
    stripe: {
        secret: process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here'
    },
    openai: {
        key: process.env.OPENAI_API_KEY || 'your_openai_key_here'
    },
    railway: {
        token: process.env.RAILWAY_TOKEN || 'your_railway_token_here'
    },
    azure: {
        token: process.env.AZURE_DEVOPS_TOKEN || 'your_azure_token_here'
    },
    sentry: {
        token: process.env.SENTRY_TOKEN || 'your_sentry_token_here'
    },
    gmail: [
        { email: process.env.GMAIL_1_EMAIL || 'your_email@gmail.com', password: process.env.GMAIL_1_PASSWORD || 'your_app_password' },
        { email: process.env.GMAIL_2_EMAIL || 'your_email@gmail.com', password: process.env.GMAIL_2_PASSWORD || 'your_app_password' },
        { email: process.env.GMAIL_3_EMAIL || 'your_email@gmail.com', password: process.env.GMAIL_3_PASSWORD || 'your_app_password' }
    ],
    porkbun: {
        apiKey: process.env.PORKBUN_API_KEY || 'your_porkbun_api_key',
        secret: process.env.PORKBUN_SECRET || 'your_porkbun_secret'
    }
};

// ============================================
// MONGODB ATLAS
// ============================================
app.get('/api/mongodb/databases', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri);
        await client.connect();
        
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        
        const dbDetails = await Promise.all(databases.databases.map(async (db) => {
            const database = client.db(db.name);
            const collections = await database.listCollections().toArray();
            
            const collectionStats = await Promise.all(collections.map(async (coll) => {
                const stats = await database.collection(coll.name).countDocuments();
                return {
                    name: coll.name,
                    documentCount: stats
                };
            }));
            
            return {
                name: db.name,
                sizeOnDisk: db.sizeOnDisk,
                collections: collectionStats
            };
        }));
        
        await client.close();
        res.json({ success: true, databases: dbDetails });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/mongodb/collection/:db/:collection', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri);
        await client.connect();
        
        const database = client.db(req.params.db);
        const collection = database.collection(req.params.collection);
        
        const documents = await collection.find({}).limit(100).toArray();
        const count = await collection.countDocuments();
        
        await client.close();
        res.json({ success: true, documents, totalCount: count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// GITHUB - FUNCIONALIDADES COMPLETAS
// ============================================
app.get('/api/github/repos', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50
        });
        
        const { data: user } = await octokit.users.getAuthenticated();
        
        res.json({ success: true, repos, user });
    } catch (error) {
        console.error('GitHub API Error:', error.message);
        
        // Erro de autenticação
        if (error.status === 401) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token do GitHub inválido ou expirado',
                details: 'Gere um novo token em: https://github.com/settings/tokens'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Erro ao conectar com GitHub',
            details: error.status ? `HTTP ${error.status}` : 'Verifique suas credenciais'
        });
    }
});

// GitHub - Estatísticas completas
app.get('/api/github/stats', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        
        const [
            { data: user },
            { data: repos },
            { data: issues },
            { data: gists },
            { data: starred }
        ] = await Promise.all([
            octokit.users.getAuthenticated(),
            octokit.repos.listForAuthenticatedUser({ per_page: 100 }),
            octokit.issues.listForAuthenticatedUser({ state: 'open', per_page: 100 }),
            octokit.gists.list({ per_page: 100 }),
            octokit.activity.listReposStarredByAuthenticatedUser({ per_page: 100 })
        ]);
        
        const stats = {
            user: {
                login: user.login,
                name: user.name,
                avatar: user.avatar_url,
                followers: user.followers,
                following: user.following
            },
            repos: {
                total: repos.length,
                public: repos.filter(r => !r.private).length,
                private: repos.filter(r => r.private).length,
                total_stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
                total_forks: repos.reduce((sum, r) => sum + r.forks_count, 0)
            },
            issues: { open: issues.length },
            gists: { total: gists.length },
            starred: { total: starred.length }
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GitHub - Issues
app.get('/api/github/issues', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        const { data: issues } = await octokit.issues.listForAuthenticatedUser({
            filter: 'assigned',
            state: 'open',
            per_page: 50
        });
        res.json({ success: true, issues, count: issues.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GitHub - Gists
app.get('/api/github/gists', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        const { data: gists } = await octokit.gists.list({ per_page: 50 });
        res.json({ success: true, gists, count: gists.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GitHub - Notificações
app.get('/api/github/notifications', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        const { data: notifications } = await octokit.activity.listNotificationsForAuthenticatedUser({
            per_page: 50
        });
        res.json({ 
            success: true, 
            notifications, 
            count: notifications.length,
            unread: notifications.filter(n => n.unread).length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/github/activity', async (req, res) => {
    try {
        const octokit = new Octokit({ auth: CONFIG.github.token });
        
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
            username: CONFIG.github.username,
            per_page: 30
        });
        
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// LINKEDIN API
// ============================================

app.get('/api/linkedin/profile', async (req, res) => {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${CONFIG.linkedin.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        res.json({ success: true, profile: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/linkedin/posts', async (req, res) => {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:' + CONFIG.linkedin.clientId + ')', {
            headers: {
                'Authorization': `Bearer ${CONFIG.linkedin.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        res.json({ success: true, posts: response.data.elements || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/linkedin/connections', async (req, res) => {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/connections?q=viewer&count=100', {
            headers: {
                'Authorization': `Bearer ${CONFIG.linkedin.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        res.json({ success: true, connections: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/linkedin/stats', async (req, res) => {
    try {
        // Buscar estatísticas básicas do perfil
        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${CONFIG.linkedin.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        res.json({ 
            success: true, 
            stats: {
                profile: profileResponse.data,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// META / FACEBOOK / INSTAGRAM API
// ============================================

// Instagram Insights
app.get('/api/meta/instagram/insights', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.instagramAccountId}/insights`, {
            params: {
                metric: 'impressions,reach,follower_count,profile_views',
                period: 'day',
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, insights: response.data.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Instagram Media (Posts)
app.get('/api/meta/instagram/media', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.instagramAccountId}/media`, {
            params: {
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                limit: 20,
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, media: response.data.data || [], count: response.data.data?.length || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Instagram Profile
app.get('/api/meta/instagram/profile', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.instagramAccountId}`, {
            params: {
                fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography',
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, profile: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Facebook Page Insights
app.get('/api/meta/facebook/insights', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.facebookPageId}/insights`, {
            params: {
                metric: 'page_impressions,page_engaged_users,page_fans',
                period: 'day',
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, insights: response.data.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Facebook Page Posts
app.get('/api/meta/facebook/posts', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.facebookPageId}/posts`, {
            params: {
                fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
                limit: 20,
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, posts: response.data.data || [], count: response.data.data?.length || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// WhatsApp Business Account Info
app.get('/api/meta/whatsapp/info', async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.whatsappAccountId}`, {
            params: {
                fields: 'id,name,timezone_id,message_template_namespace',
                access_token: CONFIG.meta.accessToken
            }
        });
        
        res.json({ success: true, info: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Meta Business Stats (Consolidated)
app.get('/api/meta/stats', async (req, res) => {
    try {
        // Buscar estatísticas do Instagram e Facebook em paralelo
        const [instagramProfile, facebookPage] = await Promise.all([
            axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.instagramAccountId}`, {
                params: {
                    fields: 'followers_count,media_count',
                    access_token: CONFIG.meta.accessToken
                }
            }).catch(() => ({ data: { followers_count: 0, media_count: 0 } })),
            
            axios.get(`https://graph.facebook.com/v18.0/${CONFIG.meta.facebookPageId}`, {
                params: {
                    fields: 'fan_count,name',
                    access_token: CONFIG.meta.accessToken
                }
            }).catch(() => ({ data: { fan_count: 0, name: 'N/A' } }))
        ]);
        
        res.json({ 
            success: true, 
            stats: {
                instagram: instagramProfile.data,
                facebook: facebookPage.data,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// STRIPE
// ============================================
app.get('/api/stripe/balance', async (req, res) => {
    try {
        const stripeClient = stripe(CONFIG.stripe.secret);
        
        const balance = await stripeClient.balance.retrieve();
        const charges = await stripeClient.charges.list({ limit: 10 });
        const customers = await stripeClient.customers.list({ limit: 10 });
        
        res.json({ success: true, balance, charges: charges.data, customers: customers.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// OPENAI
// ============================================
app.get('/api/openai/usage', async (req, res) => {
    try {
        // Get account info and usage
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${CONFIG.openai.key}`
            }
        });
        
        res.json({ success: true, models: response.data.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// RAILWAY
// ============================================
app.get('/api/railway/projects', async (req, res) => {
    try {
        const response = await axios.post('https://backboard.railway.app/graphql/v2', {
            query: `
                query {
                    projects {
                        edges {
                            node {
                                id
                                name
                                description
                                createdAt
                                updatedAt
                                services {
                                    edges {
                                        node {
                                            id
                                            name
                                            deployments(first: 1) {
                                                edges {
                                                    node {
                                                        id
                                                        status
                                                        createdAt
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.railway.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Processa os dados para incluir status de deployment
        const projects = response.data.data.projects.edges.map(edge => {
            const project = edge.node;
            
            // Verifica status dos serviços/deployments
            let deploymentStatus = 'UNKNOWN';
            if (project.services && project.services.edges.length > 0) {
                const service = project.services.edges[0].node;
                if (service.deployments && service.deployments.edges.length > 0) {
                    deploymentStatus = service.deployments.edges[0].node.status || 'UNKNOWN';
                }
            }
            
            return {
                node: {
                    ...project,
                    deploymentStatus
                }
            };
        });
        
        res.json({ success: true, projects });
    } catch (error) {
        console.error('Railway API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response?.data?.errors || 'Verifique se o token do Railway é válido'
        });
    }
});

// ============================================
// AZURE DEVOPS
// ============================================
app.get('/api/azure/organizations', async (req, res) => {
    try {
        const accountsResponse = await axios.get('https://app.vssps.visualstudio.com/_apis/accounts?api-version=6.0', {
            headers: {
                'Authorization': `Basic ${Buffer.from(':' + CONFIG.azureDevOps.token).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({
            success: true,
            organizations: accountsResponse.data.value || []
        });
    } catch (error) {
        console.error('Azure DevOps Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// GOOGLE CLOUD
// ============================================
app.get('/api/gcloud/projects', async (req, res) => {
    try {
        const response = await axios.get('https://cloudresourcemanager.googleapis.com/v1/projects', {
            headers: {
                'Authorization': `Bearer ${CONFIG.gcloud.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({
            success: true,
            projects: response.data.projects || []
        });
    } catch (error) {
        console.error('Google Cloud Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// OPENAI
// ============================================
app.get('/api/openai/usage', async (req, res) => {
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${CONFIG.openai.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({
            success: true,
            models: response.data.data || []
        });
    } catch (error) {
        console.error('OpenAI Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SENTRY
// ============================================
app.get('/api/sentry/issues', async (req, res) => {
    try {
        const response = await axios.get('https://sentry.io/api/0/organizations/avila-0l/issues/', {
            headers: {
                'Authorization': `Bearer ${CONFIG.sentry.token}`
            },
            params: {
                statsPeriod: '14d',
                query: 'is:unresolved'
            }
        });
        
        res.json({ success: true, issues: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PORKBUN DNS
// ============================================
app.get('/api/dns/domains', async (req, res) => {
    try {
        const response = await axios.post('https://api.porkbun.com/api/json/v3/domain/listAll', {
            apikey: CONFIG.porkbun.apiKey,
            secretapikey: CONFIG.porkbun.secret
        });
        
        res.json({ success: true, domains: response.data.domains });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// EMAIL - ENVIAR INTEGRADO
// ============================================
app.post('/api/email/send', async (req, res) => {
    try {
        const { from, to, subject, text, html } = req.body;
        
        const account = CONFIG.gmail.find(g => g.email === from);
        if (!account) {
            return res.status(400).json({ success: false, error: 'Conta de email não encontrada' });
        }
        
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: account.email,
                pass: account.password.replace(/ /g, '')
            }
        });
        
        const mailOptions = {
            from: account.email,
            to,
            subject
        };
        
        if (html) {
            mailOptions.html = html;
        } else {
            mailOptions.text = text;
        }
        
        const info = await transporter.sendMail(mailOptions);
        
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Email Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CRON/AUTOMATION - Enviar compromissos
// ============================================
app.post('/api/calendar/schedule', async (req, res) => {
    try {
        const { titulo, descricao, data, hora, email } = req.body;
        
        // Salvar no MongoDB
        const client = new MongoClient(CONFIG.mongodb.uri);
        await client.connect();
        const db = client.db('avila_dashboard');
        const collection = db.collection('compromissos');
        
        const compromisso = {
            titulo,
            descricao,
            data,
            hora,
            emailNotificacao: email,
            criadoEm: new Date(),
            status: 'agendado'
        };
        
        const result = await collection.insertOne(compromisso);
        await client.close();
        
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CRM & LEADS - Sistema completo com email marketing
// ============================================

// Webhook para receber leads do formulário de cadastro
app.post('/api/crm/leads/webhook', async (req, res) => {
    try {
        const { nome, empresa, email, telefone, tipoProjeto, orcamento, descricao } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email é obrigatório' });
        }
        
        // Detectar emails pessoais e adicionar Email Corporativo à proposta
        const emailDomain = email.split('@')[1]?.toLowerCase();
        const personalEmailDomains = [
            'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 
            'live.com', 'icloud.com', 'aol.com', 'protonmail.com',
            'mail.com', 'gmx.com', 'yandex.com', 'zoho.com'
        ];
        
        const isPersonalEmail = personalEmailDomains.includes(emailDomain);
        const hasCompany = empresa && empresa.trim().length > 0;
        const needsCorporateEmail = isPersonalEmail && hasCompany;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const lead = {
            nome: nome || '',
            empresa: empresa || '',
            email,
            telefone: telefone || '',
            tipoProjeto: tipoProjeto || 'Não especificado',
            orcamento: orcamento || 'Não informado',
            descricao: descricao || '',
            status: 'novo',
            emailsSent: 0,
            nextEmailDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Primeiro email em 24h
            extras: needsCorporateEmail ? [
                { 
                    item: 'Email Corporativo', 
                    price: 'EUR 20,00',
                    reason: 'Empresa cadastrada com email pessoal'
                }
            ] : [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(lead);
        const leadId = result.insertedId.toString();
        await client.close();
        
        // Enviar email de confirmação para o lead
        await sendLeadConfirmationEmail(email, nome || empresa);
        
        // Notificar você sobre o novo lead
        await sendLeadNotification(lead);
        
        res.json({ 
            success: true, 
            leadId: leadId,
            message: 'Lead cadastrado com sucesso! Iniciando sequência de email marketing.' 
        });
        
    } catch (error) {
        console.error('Erro ao cadastrar lead:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verificar patente do lead
app.post('/api/crm/leads/patent/verify', async (req, res) => {
    try {
        const { leadId, patentNumber } = req.body;
        
        if (!leadId) {
            return res.status(400).json({ success: false, error: 'Lead ID é obrigatório' });
        }
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const { ObjectId } = require('mongodb');
        
        // Atualizar lead com informações de patente
        await collection.updateOne(
            { _id: new ObjectId(leadId) },
            { 
                $set: { 
                    patent: {
                        hasPatent: true,
                        number: patentNumber || 'Documento enviado',
                        verifiedAt: new Date()
                    },
                    updatedAt: new Date() 
                } 
            }
        );
        
        await client.close();
        
        res.json({ 
            success: true, 
            message: 'Patente verificada com sucesso!' 
        });
        
    } catch (error) {
        console.error('Erro ao verificar patente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Pular verificação de patente
app.post('/api/crm/leads/:id/patent/skip', async (req, res) => {
    try {
        const { id } = req.params;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const { ObjectId } = require('mongodb');
        
        // Atualizar lead indicando que não tem patente
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    patent: {
                        hasPatent: false,
                        skipped: true,
                        skippedAt: new Date()
                    },
                    updatedAt: new Date() 
                } 
            }
        );
        
        await client.close();
        
        res.json({ 
            success: true, 
            message: 'Verificação de patente pulada' 
        });
        
    } catch (error) {
        console.error('Erro ao pular patente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Listar todos os leads
app.get('/api/crm/leads', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
        await client.close();
        
        res.json({ success: true, leads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Atualizar status do lead
app.put('/api/crm/leads/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const { ObjectId } = require('mongodb');
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status, 
                    updatedAt: new Date() 
                } 
            }
        );
        
        await client.close();
        res.json({ success: true, message: 'Status atualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fechar venda e provisionar automaticamente
app.post('/api/crm/leads/:id/provision', async (req, res) => {
    try {
        const { id } = req.params;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const { ObjectId } = require('mongodb');
        const lead = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!lead) {
            await client.close();
            return res.status(404).json({ success: false, error: 'Lead não encontrado' });
        }
        
        // Provisionar automaticamente
        const provision = await provisionClient(lead);
        
        // Atualizar lead com status fechado e dados de provisionamento
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'fechado',
                    provision: provision,
                    closedAt: new Date(),
                    updatedAt: new Date() 
                } 
            }
        );
        
        await client.close();
        
        // Enviar email com credenciais
        await sendProvisionEmail(lead, provision);
        
        res.json({ 
            success: true, 
            message: 'Venda fechada e provisionamento concluído!',
            provision 
        });
        
    } catch (error) {
        console.error('Erro no provisionamento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Deletar lead
app.delete('/api/crm/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        const { ObjectId } = require('mongodb');
        await collection.deleteOne({ _id: new ObjectId(id) });
        
        await client.close();
        res.json({ success: true, message: 'Lead excluído' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SOCIAL MEDIA POST - Publicar simultaneamente
// ============================================

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configurar upload de imagens
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas'));
        }
    }
});

// Endpoint para postar em todas as redes
app.post('/api/social/post', upload.single('image'), async (req, res) => {
    try {
        const { text, platforms } = req.body;
        const platformsObj = JSON.parse(platforms);
        const imageFile = req.file;
        
        const results = {};
        
        // LinkedIn
        if (platformsObj.linkedin) {
            try {
                const linkedinResult = await postToLinkedIn(text, imageFile);
                results.linkedin = { success: true, message: 'Publicado com sucesso', ...linkedinResult };
            } catch (error) {
                results.linkedin = { success: false, message: error.message };
            }
        }
        
        // Facebook
        if (platformsObj.facebook) {
            try {
                const facebookResult = await postToFacebook(text, imageFile);
                results.facebook = { success: true, message: 'Publicado com sucesso', ...facebookResult };
            } catch (error) {
                results.facebook = { success: false, message: error.message };
            }
        }
        
        // Instagram
        if (platformsObj.instagram) {
            try {
                const instagramResult = await postToInstagram(text, imageFile);
                results.instagram = { success: true, message: 'Publicado com sucesso', ...instagramResult };
            } catch (error) {
                results.instagram = { success: false, message: error.message };
            }
        }
        
        // WhatsApp Status
        if (platformsObj.whatsapp) {
            try {
                const whatsappResult = await postToWhatsAppStatus(text, imageFile);
                results.whatsapp = { success: true, message: 'Publicado com sucesso', ...whatsappResult };
            } catch (error) {
                results.whatsapp = { success: false, message: error.message };
            }
        }
        
        // Limpar arquivo temporário
        if (imageFile) {
            fs.unlinkSync(imageFile.path);
        }
        
        res.json({ success: true, results });
        
    } catch (error) {
        console.error('Erro ao postar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Função para postar no LinkedIn
async function postToLinkedIn(text, imageFile) {
    // Verificar se tem credenciais
    if (!CONFIG.linkedin.accessToken || CONFIG.linkedin.accessToken === 'seu_token_aqui') {
        return { demo: true, message: 'Configure o token do LinkedIn no .env' };
    }
    
    try {
        // Endpoint da API do LinkedIn para criar post
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            author: `urn:li:person:${CONFIG.linkedin.clientId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: imageFile ? 'IMAGE' : 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.linkedin.accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        return { postId: response.data.id };
    } catch (error) {
        throw new Error(`LinkedIn: ${error.response?.data?.message || error.message}`);
    }
}

// Função para postar no Facebook
async function postToFacebook(text, imageFile) {
    if (!CONFIG.meta.accessToken || CONFIG.meta.accessToken === 'your_meta_access_token_here') {
        return { demo: true, message: 'Configure o token Meta no .env' };
    }
    
    try {
        const endpoint = imageFile
            ? `https://graph.facebook.com/v18.0/${CONFIG.meta.facebookPageId}/photos`
            : `https://graph.facebook.com/v18.0/${CONFIG.meta.facebookPageId}/feed`;
        
        const formData = new FormData();
        formData.append('message', text);
        formData.append('access_token', CONFIG.meta.accessToken);
        
        if (imageFile) {
            formData.append('source', fs.createReadStream(imageFile.path));
        }
        
        const response = await axios.post(endpoint, formData);
        return { postId: response.data.id || response.data.post_id };
    } catch (error) {
        throw new Error(`Facebook: ${error.response?.data?.error?.message || error.message}`);
    }
}

// Função para postar no Instagram
async function postToInstagram(text, imageFile) {
    if (!CONFIG.meta.accessToken || !CONFIG.meta.instagramAccountId) {
        return { demo: true, message: 'Configure credenciais Instagram no .env' };
    }
    
    if (!imageFile) {
        throw new Error('Instagram requer uma imagem');
    }
    
    try {
        // Instagram API requer URL pública da imagem
        // Por simplicidade, retornando sucesso simulado
        // Em produção, você precisaria hospedar a imagem em um servidor público
        return { 
            demo: true, 
            message: 'Instagram requer URL pública da imagem. Configure hospedagem de imagens.' 
        };
    } catch (error) {
        throw new Error(`Instagram: ${error.message}`);
    }
}

// Função para postar no WhatsApp Status
async function postToWhatsAppStatus(text, imageFile) {
    if (!CONFIG.meta.whatsappAccountId || CONFIG.meta.whatsappAccountId === 'your_whatsapp_account_id_here') {
        return { demo: true, message: 'Configure WhatsApp Business API no .env' };
    }
    
    try {
        // WhatsApp Status via Business API
        // Requer configuração específica de WhatsApp Business API
        return { 
            demo: true, 
            message: 'WhatsApp Status requer WhatsApp Business API configurado' 
        };
    } catch (error) {
        throw new Error(`WhatsApp: ${error.message}`);
    }
}

// Função para provisionar cliente automaticamente
async function provisionClient(lead) {
    const octokit = new Octokit({ auth: CONFIG.github.token });
    const provision = {
        github: null,
        mongodb: null,
        railway: null,
        dns: null,
        createdAt: new Date()
    };
    
    try {
        // 1. Criar repositório GitHub
        const repoName = (lead.empresa || lead.nome).toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        
        const repo = await octokit.repos.createForAuthenticatedUser({
            name: repoName,
            description: `Projeto para ${lead.empresa || lead.nome}`,
            private: true,
            auto_init: true
        });
        
        provision.github = {
            repoName: repo.data.name,
            repoUrl: repo.data.html_url,
            cloneUrl: repo.data.clone_url
        };
        
        // 2. Criar database MongoDB
        const dbName = `client_${repoName}`;
        provision.mongodb = {
            database: dbName,
            uri: `${CONFIG.mongodb.uri}${dbName}`
        };
        
        // 3. Deploy no Railway (simulated - você precisará integrar com a API do Railway)
        provision.railway = {
            projectName: repoName,
            status: 'pending',
            url: `https://${repoName}.railway.app`
        };
        
        // 4. Configurar DNS (simulated)
        provision.dns = {
            subdomain: repoName,
            url: `https://${repoName}.avila.inc`
        };
        
    } catch (error) {
        console.error('Erro no provisionamento:', error);
        provision.error = error.message;
    }
    
    return provision;
}

// Email de confirmação para o lead
async function sendLeadConfirmationEmail(email, nome) {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'avila.nico@gmail.com',
                pass: 'lbeb hwqn tmau zotx'
            }
        });
        
        await transporter.sendMail({
            from: '"Avila Development" <avila.nico@gmail.com>',
            to: email,
            subject: '🚀 Recebemos seu cadastro!',
            html: `
                <h2>Olá ${nome}!</h2>
                <p>Recebemos seu cadastro e já estamos analisando suas necessidades.</p>
                <p>Em breve entraremos em contato para discutir seu projeto!</p>
                <br>
                <p><strong>Avila Development Team</strong></p>
            `
        });
    } catch (error) {
        console.error('Erro ao enviar email de confirmação:', error);
    }
}

// Notificar você sobre novo lead
async function sendLeadNotification(lead) {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'avila.nico@gmail.com',
                pass: 'lbeb hwqn tmau zotx'
            }
        });
        
        await transporter.sendMail({
            from: '"CRM Alert" <avila.nico@gmail.com>',
            to: 'avila.nico@gmail.com',
            subject: '🎯 Novo Lead Cadastrado!',
            html: `
                <h2>Novo Lead no Sistema!</h2>
                <p><strong>Nome:</strong> ${lead.nome || lead.empresa}</p>
                <p><strong>Email:</strong> ${lead.email}</p>
                <p><strong>Telefone:</strong> ${lead.telefone}</p>
                <p><strong>Tipo de Projeto:</strong> ${lead.tipoProjeto}</p>
                <p><strong>Orçamento:</strong> ${lead.orcamento}</p>
                <p><strong>Descrição:</strong> ${lead.descricao}</p>
                <br>
                <a href="http://localhost:3000/dashboard.html#crm" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Ver no CRM →
                </a>
            `
        });
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
}

// Email com credenciais do provisionamento
async function sendProvisionEmail(lead, provision) {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'avila.nico@gmail.com',
                pass: 'lbeb hwqn tmau zotx'
            }
        });
        
        await transporter.sendMail({
            from: '"Avila Development" <avila.nico@gmail.com>',
            to: lead.email,
            subject: '🎉 Bem-vindo! Seu projeto foi criado',
            html: `
                <h2>Parabéns ${lead.nome || lead.empresa}!</h2>
                <p>Seu projeto foi provisionado com sucesso! Aqui estão suas credenciais:</p>
                
                <h3>🐙 GitHub Repository</h3>
                <p><strong>URL:</strong> <a href="${provision.github?.repoUrl}">${provision.github?.repoUrl}</a></p>
                
                <h3>🍃 MongoDB Database</h3>
                <p><strong>Database:</strong> ${provision.mongodb?.database}</p>
                <p><strong>URI:</strong> ${provision.mongodb?.uri}</p>
                
                <h3>🚂 Railway Deploy</h3>
                <p><strong>URL:</strong> <a href="${provision.railway?.url}">${provision.railway?.url}</a></p>
                
                <h3>🌐 Domínio</h3>
                <p><strong>URL:</strong> <a href="${provision.dns?.url}">${provision.dns?.url}</a></p>
                
                <br>
                <p>Em breve enviaremos mais detalhes!</p>
                <p><strong>Avila Development Team</strong></p>
            `
        });
    } catch (error) {
        console.error('Erro ao enviar email de provisionamento:', error);
    }
}

// Cron job para enviar emails de marketing (executar periodicamente)
app.get('/api/crm/send-marketing-emails', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        // Buscar leads que precisam receber email
        const leadsToEmail = await collection.find({
            status: { $in: ['novo', 'negociacao'] },
            emailsSent: { $lt: 5 },
            nextEmailDate: { $lte: new Date() }
        }).toArray();
        
        const emailSequence = [
            {
                subject: '📊 Como podemos ajudar seu negócio?',
                body: 'Email 1: Apresentação dos serviços'
            },
            {
                subject: '💡 Cases de sucesso',
                body: 'Email 2: Portfólio e cases'
            },
            {
                subject: '🎯 Proposta personalizada',
                body: 'Email 3: Oferta especial'
            },
            {
                subject: '⏰ Última chance!',
                body: 'Email 4: Urgência'
            },
            {
                subject: '👋 Ainda tem interesse?',
                body: 'Email 5: Follow-up final'
            }
        ];
        
        for (const lead of leadsToEmail) {
            const emailIndex = lead.emailsSent;
            const template = emailSequence[emailIndex];
            
            if (template) {
                await sendMarketingEmail(lead, template);
                
                // Atualizar lead
                const { ObjectId } = require('mongodb');
                await collection.updateOne(
                    { _id: lead._id },
                    { 
                        $inc: { emailsSent: 1 },
                        $set: { 
                            nextEmailDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Próximo em 3 dias
                            updatedAt: new Date()
                        }
                    }
                );
            }
        }
        
        await client.close();
        res.json({ 
            success: true, 
            message: `${leadsToEmail.length} emails de marketing enviados` 
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enviar email de marketing
async function sendMarketingEmail(lead, template) {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'avila.nico@gmail.com',
                pass: 'lbeb hwqn tmau zotx'
            }
        });
        
        await transporter.sendMail({
            from: '"Avila Development" <avila.nico@gmail.com>',
            to: lead.email,
            subject: template.subject,
            html: `
                <h2>Olá ${lead.nome || lead.empresa}!</h2>
                <p>${template.body}</p>
                <br>
                <a href="https://avila.inc/contato" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Fale Conosco →
                </a>
                <br><br>
                <p><strong>Avila Development Team</strong></p>
            `
        });
    } catch (error) {
        console.error('Erro ao enviar email de marketing:', error);
    }
}

// ============================================
// CRM - CONTATOS (MongoDB + vCard)
// ============================================

app.get('/api/crm/contacts', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        
        const allContacts = [];
        
        // Primeiro, tenta ler o arquivo vcf
        try {
            const fs = require('fs');
            const path = require('path');
            
            const vcfPath = path.join(__dirname, 'contacts', 'contacts.vcf');
            
            if (fs.existsSync(vcfPath)) {
                const vcfContent = fs.readFileSync(vcfPath, 'utf8');
                
                // Parse vCard (simples)
                const cards = vcfContent.split('BEGIN:VCARD');
                
                for (const card of cards.slice(1)) { // Skip first empty
                    const lines = card.split('\n').filter(line => line.trim());
                    const contact = { source: 'vcf' };
                    
                    for (const line of lines) {
                        if (line.startsWith('FN:')) {
                            contact.name = line.substring(3);
                        } else if (line.startsWith('TEL;')) {
                            const telMatch = line.match(/TEL;.*?:(.+)/);
                            if (telMatch) {
                                contact.phone = telMatch[1];
                            }
                        } else if (line.startsWith('EMAIL:')) {
                            contact.email = line.substring(6);
                        } else if (line.startsWith('ORG:')) {
                            contact.company = line.substring(4);
                        }
                    }
                    
                    if (contact.name || contact.phone) {
                        allContacts.push(contact);
                    }
                }
            }
        } catch (vcfError) {
            console.log('Aviso: Erro ao ler arquivo vcf:', vcfError.message);
        }
        
        // Busca contatos em todos os bancos de dados MongoDB
        const adminDb = client.db('admin');
        const databases = await adminDb.admin().listDatabases();
        
        for (const dbInfo of databases.databases) {
            try {
                const db = client.db(dbInfo.name);
                const collections = await db.listCollections().toArray();
                
                // Procura por coleções que podem conter contatos
                const contactCollections = collections.filter(col => 
                    ['leads', 'contacts', 'clientes', 'customers', 'users'].includes(col.name.toLowerCase())
                );
                
                for (const colInfo of contactCollections) {
                    try {
                        const collection = db.collection(colInfo.name);
                        const documents = await collection.find({}).toArray();
                        
                        for (const doc of documents) {
                            const contact = {
                                source: `${dbInfo.name}.${colInfo.name}`,
                                _id: doc._id,
                                name: doc.name || doc.nome || doc.fullName || doc.firstName + ' ' + (doc.lastName || ''),
                                email: doc.email || doc.emailAddress,
                                phone: doc.phone || doc.telephone || doc.mobile,
                                company: doc.company || doc.organization || doc.empresa,
                                status: doc.status,
                                createdAt: doc.createdAt,
                                updatedAt: doc.updatedAt
                            };
                            
                            // Remove campos undefined
                            Object.keys(contact).forEach(key => {
                                if (contact[key] === undefined) {
                                    delete contact[key];
                                }
                            });
                            
                            if (contact.name || contact.email || contact.phone) {
                                allContacts.push(contact);
                            }
                        }
                    } catch (colError) {
                        console.log(`Aviso: Erro ao ler coleção ${dbInfo.name}.${colInfo.name}:`, colError.message);
                    }
                }
            } catch (dbError) {
                console.log(`Aviso: Erro ao acessar banco ${dbInfo.name}:`, dbError.message);
            }
        }
        
        await client.close();
        
        // Remove duplicatas baseadas em email ou telefone
        const uniqueContacts = [];
        const seen = new Set();
        
        for (const contact of allContacts) {
            const key = contact.email || contact.phone || contact.name;
            if (key && !seen.has(key)) {
                seen.add(key);
                uniqueContacts.push(contact);
            }
        }
        
        res.json({ 
            contacts: uniqueContacts, 
            total: uniqueContacts.length,
            sources: [...new Set(allContacts.map(c => c.source))]
        });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// FINANCEIRO - EXTRATOS BANCÁRIOS
// ============================================

app.get('/api/financeiro/extratos', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const extratoDir = path.join(__dirname, 'Extrato-bancario');
        
        if (!fs.existsSync(extratoDir)) {
            return res.status(404).json({ error: 'Diretório Extrato-bancario não encontrado' });
        }
        
        const files = fs.readdirSync(extratoDir).filter(file => file.endsWith('.csv'));
        const allTransactions = [];
        
        for (const file of files) {
            const filePath = path.join(extratoDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length >= 4) {
                    const transaction = {
                        data: cols[0],
                        valor: parseFloat(cols[1]),
                        identificador: cols[2],
                        descricao: cols[3],
                        arquivo: file
                    };
                    allTransactions.push(transaction);
                }
            }
        }
        
        // Ordenar por data (mais recente primeiro)
        allTransactions.sort((a, b) => {
            const dateA = new Date(a.data.split('/').reverse().join('-'));
            const dateB = new Date(b.data.split('/').reverse().join('-'));
            return dateB - dateA;
        });
        
        res.json({ 
            transactions: allTransactions, 
            total: allTransactions.length,
            files: files.length
        });
    } catch (error) {
        console.error('Erro ao ler extratos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// GMAIL API - EMAILS E CONTATOS
// ============================================

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Configuração OAuth2 para Gmail
const oauth2Clients = {};
const gmailConfigs = CONFIG.gmail || [];

gmailConfigs.forEach((config, index) => {
    if (config.email) {
        oauth2Clients[config.email] = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        
        // Carregar tokens salvos se existirem
        const accessToken = process.env[`GMAIL_ACCESS_TOKEN_${index + 1}`];
        const refreshToken = process.env[`GMAIL_REFRESH_TOKEN_${index + 1}`];
        
        if (accessToken && refreshToken) {
            oauth2Clients[config.email].setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }
    }
});

// Endpoint para iniciar OAuth2
app.get('/api/gmail/auth/:email', (req, res) => {
    const { email } = req.params;
    
    if (!oauth2Clients[email]) {
        return res.status(404).json({ error: 'Conta Gmail não configurada' });
    }
    
    const authUrl = oauth2Clients[email].generateAuthUrl({
        access_type: 'offline',
        scope: process.env.GMAIL_SCOPES.split(','),
        state: email
    });
    
    res.json({ authUrl });
});

// Callback OAuth2
app.get('/api/gmail/oauth2callback', async (req, res) => {
    const { code, state: email } = req.query;
    
    try {
        const { tokens } = await oauth2Clients[email].getToken(code);
        oauth2Clients[email].setCredentials(tokens);
        
        // Salvar tokens (em produção, salve no banco de dados)
        console.log(`Tokens recebidos para ${email}:`, tokens);
        
        res.send(`
            <h1>Autenticação Gmail Concluída!</h1>
            <p>Conta: ${email}</p>
            <p>Tokens salvos. Você pode fechar esta janela.</p>
            <script>window.close();</script>
        `);
    } catch (error) {
        console.error('Erro OAuth2:', error);
        res.status(500).send('Erro na autenticação');
    }
});

// Sincronizar emails de todas as contas
app.post('/api/gmail/sync-emails', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        
        const results = [];
        
        for (const config of gmailConfigs) {
            if (!config.email || !oauth2Clients[config.email]) continue;
            
            try {
                const gmail = google.gmail({ version: 'v1', auth: oauth2Clients[config.email] });
                
                // Buscar mensagens (últimas X dias conforme configuração)
                const daysBack = parseInt(process.env.GMAIL_SYNC_EMAILS_DAYS) || 30;
                const messagesResponse = await gmail.users.messages.list({
                    userId: 'me',
                    maxResults: 100,
                    q: `newer_than:${daysBack}d`
                });
                
                const messages = messagesResponse.data.messages || [];
                const emails = [];
                
                for (const message of messages) {
                    try {
                        const messageData = await gmail.users.messages.get({
                            userId: 'me',
                            id: message.id,
                            format: 'full'
                        });
                        
                        const email = {
                            id: message.id,
                            threadId: message.threadId,
                            account: config.email,
                            labelIds: messageData.data.labelIds || [],
                            snippet: messageData.data.snippet,
                            sizeEstimate: messageData.data.sizeEstimate,
                            historyId: messageData.data.historyId,
                            internalDate: new Date(parseInt(messageData.data.internalDate)),
                            payload: messageData.data.payload,
                            syncedAt: new Date()
                        };
                        
                        // Extrair headers importantes
                        const headers = {};
                        if (email.payload && email.payload.headers) {
                            email.payload.headers.forEach(header => {
                                headers[header.name.toLowerCase()] = header.value;
                            });
                        }
                        
                        email.subject = headers.subject;
                        email.from = headers.from;
                        email.to = headers.to;
                        email.date = headers.date;
                        
                        emails.push(email);
                    } catch (msgError) {
                        console.log(`Erro ao buscar mensagem ${message.id}:`, msgError.message);
                    }
                }
                
                // Salvar no MongoDB
                if (emails.length > 0) {
                    const collection = db.collection('emails');
                    await collection.insertMany(emails, { ordered: false });
                }
                
                results.push({
                    account: config.email,
                    emailsSynced: emails.length,
                    status: 'success'
                });
                
            } catch (accountError) {
                console.log(`Erro ao sincronizar ${config.email}:`, accountError.message);
                results.push({
                    account: config.email,
                    emailsSynced: 0,
                    status: 'error',
                    error: accountError.message
                });
            }
        }
        
        await client.close();
        res.json({ results, totalAccounts: gmailConfigs.length });
        
    } catch (error) {
        console.error('Erro ao sincronizar emails:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Sincronizar contatos de todas as contas
app.post('/api/gmail/sync-contacts', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        
        const results = [];
        
        for (const config of gmailConfigs) {
            if (!config.email || !oauth2Clients[config.email]) continue;
            
            try {
                const people = google.people({ version: 'v1', auth: oauth2Clients[config.email] });
                
                // Buscar contatos
                const contactsLimit = parseInt(process.env.GMAIL_SYNC_CONTACTS_LIMIT) || 1000;
                const contactsResponse = await people.people.connections.list({
                    resourceName: 'people/me',
                    pageSize: contactsLimit,
                    personFields: 'names,emailAddresses,phoneNumbers,organizations,biographies,urls'
                });
                
                const contacts = contactsResponse.data.connections || [];
                const processedContacts = [];
                
                for (const contact of contacts) {
                    const processedContact = {
                        resourceName: contact.resourceName,
                        account: config.email,
                        etag: contact.etag,
                        syncedAt: new Date()
                    };
                    
                    // Extrair informações
                    if (contact.names && contact.names.length > 0) {
                        processedContact.displayName = contact.names[0].displayName;
                        processedContact.familyName = contact.names[0].familyName;
                        processedContact.givenName = contact.names[0].givenName;
                    }
                    
                    if (contact.emailAddresses && contact.emailAddresses.length > 0) {
                        processedContact.emails = contact.emailAddresses.map(e => ({
                            value: e.value,
                            type: e.type,
                            primary: e.metadata?.primary || false
                        }));
                    }
                    
                    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                        processedContact.phones = contact.phoneNumbers.map(p => ({
                            value: p.value,
                            type: p.type,
                            primary: p.metadata?.primary || false
                        }));
                    }
                    
                    if (contact.organizations && contact.organizations.length > 0) {
                        processedContact.organizations = contact.organizations.map(o => ({
                            name: o.name,
                            title: o.title,
                            primary: o.metadata?.primary || false
                        }));
                    }
                    
                    if (contact.biographies && contact.biographies.length > 0) {
                        processedContact.biography = contact.biographies[0].value;
                    }
                    
                    if (contact.urls && contact.urls.length > 0) {
                        processedContact.urls = contact.urls.map(u => ({
                            value: u.value,
                            type: u.type
                        }));
                    }
                    
                    processedContacts.push(processedContact);
                }
                
                // Salvar no MongoDB
                if (processedContacts.length > 0) {
                    const collection = db.collection('contacts');
                    await collection.insertMany(processedContacts, { ordered: false });
                }
                
                results.push({
                    account: config.email,
                    contactsSynced: processedContacts.length,
                    status: 'success'
                });
                
            } catch (accountError) {
                console.log(`Erro ao sincronizar contatos ${config.email}:`, accountError.message);
                results.push({
                    account: config.email,
                    contactsSynced: 0,
                    status: 'error',
                    error: accountError.message
                });
            }
        }
        
        await client.close();
        res.json({ results, totalAccounts: gmailConfigs.length });
        
    } catch (error) {
        console.error('Erro ao sincronizar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar emails sincronizados
app.get('/api/gmail/emails', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        const collection = db.collection('emails');
        
        const { account, limit = 50, skip = 0 } = req.query;
        
        const query = account ? { account } : {};
        const emails = await collection
            .find(query)
            .sort({ internalDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .toArray();
        
        const total = await collection.countDocuments(query);
        
        await client.close();
        res.json({ emails, total, limit: parseInt(limit), skip: parseInt(skip) });
        
    } catch (error) {
        console.error('Erro ao buscar emails:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar contatos sincronizados
app.get('/api/gmail/contacts', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        const collection = db.collection('contacts');
        
        const { account, limit = 100, skip = 0 } = req.query;
        
        const query = account ? { account } : {};
        const contacts = await collection
            .find(query)
            .sort({ displayName: 1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .toArray();
        
        const total = await collection.countDocuments(query);
        
        await client.close();
        res.json({ contacts, total, limit: parseInt(limit), skip: parseInt(skip) });
        
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Estatísticas do Gmail
app.get('/api/gmail/stats', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        
        const emailStats = await db.collection('emails').aggregate([
            {
                $group: {
                    _id: '$account',
                    totalEmails: { $sum: 1 },
                    latestEmail: { $max: '$internalDate' }
                }
            }
        ]).toArray();
        
        const contactStats = await db.collection('contacts').aggregate([
            {
                $group: {
                    _id: '$account',
                    totalContacts: { $sum: 1 }
                }
            }
        ]).toArray();
        
        await client.close();
        
        res.json({
            emailStats,
            contactStats,
            accounts: gmailConfigs.map(c => c.email).filter(Boolean)
        });
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// START SERVER
// ============================================

// Testar conexão MongoDB na inicialização
async function testMongoConnection() {
    try {
        console.log('🔄 Tentando conectar ao MongoDB Atlas...');
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('✓ MongoDB Atlas conectado');
        await client.close();
    } catch (error) {
        console.error('⚠️  MongoDB Error:', error.message);
        console.log('💡 Dica: Verifique sua conexão de internet e firewall');
    }
}

app.listen(PORT, async () => {
    console.log(`✓ Avila Dashboard Backend rodando em http://localhost:${PORT}`);
    await testMongoConnection();
    console.log('✓ Todas as APIs integradas');

// ===== ENDPOINTS DE BACKUP E EXPORTAÇÃO =====

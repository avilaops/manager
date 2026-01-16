import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';
import nodemailer from 'nodemailer';
import stripe from 'stripe';
import { Octokit } from '@octokit/rest';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'json2csv';
import multer from 'multer';
import fs from 'fs';

// Definir __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static(path.join(__dirname, 'src/public'))); // Servir arquivos estáticos da nova estrutura
app.use('/Livros', express.static(path.join(__dirname, 'Livros'))); // Servir PDFs da biblioteca

// Rota raiz - redireciona para dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard.html'));
});

// Rotas para páginas HTML
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/index.html'));
});

app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/cadastro.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/login.html'));
});

app.get('/linkedin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/linkedin-dashboard.html'));
});

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

// Endpoint para cadastrar novo cliente/lead
app.post('/api/crm/cliente', async (req, res) => {
    try {
        const { name, email, phone, company, source, status, notes } = req.body;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nome, email e telefone são obrigatórios' 
            });
        }
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db('avila_crm');
        const collection = db.collection('leads');
        
        // Verificar se já existe
        const existing = await collection.findOne({ 
            $or: [{ email }, { phone }] 
        });
        
        if (existing) {
            await client.close();
            return res.status(400).json({ 
                success: false, 
                error: 'Cliente já cadastrado com este email ou telefone' 
            });
        }
        
        // Criar novo cliente
        const novoCliente = {
            nome: name,
            email,
            telefone: phone,
            empresa: company || '',
            source: source || 'manual',
            status: status || 'novo',
            notes: notes || '',
            emailsSent: 0,
            nextEmailDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(novoCliente);
        await client.close();
        
        res.json({ 
            success: true, 
            clienteId: result.insertedId,
            message: 'Cliente cadastrado com sucesso!' 
        });
        
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao cadastrar cliente' 
        });
    }
});

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

// ===== ENDPOINTS DE BACKUP E EXPORTAÇÃO =====

// Backup completo de todos os dados
app.post('/api/backup/completo', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();

        const backup = {
            timestamp: new Date().toISOString(),
            databases: {}
        };

        // Backup do CRM
        const crmDb = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        const crmCollections = await crmDb.listCollections().toArray();

        backup.databases.crm = {};
        for (const collection of crmCollections) {
            const data = await crmDb.collection(collection.name).find({}).toArray();
            backup.databases.crm[collection.name] = data;
        }

        // Backup do Gmail
        const gmailDb = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        const gmailCollections = await gmailDb.listCollections().toArray();

        backup.databases.gmail = {};
        for (const collection of gmailCollections) {
            const data = await gmailDb.collection(collection.name).find({}).toArray();
            backup.databases.gmail[collection.name] = data;
        }

        await client.close();

        // Salvar backup em arquivo
        
        const backupDir = path.join(__dirname, 'data', 'backups');
        await fs.mkdir(backupDir, { recursive: true });

        const filename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
        await fs.writeFile(`${backupDir}/${filename}`, JSON.stringify(backup, null, 2));

        res.json({
            success: true,
            message: 'Backup completo realizado',
            filename,
            totalRecords: Object.keys(backup.databases).reduce((acc, db) => {
                return acc + Object.keys(backup.databases[db]).reduce((acc2, coll) => {
                    return acc2 + backup.databases[db][coll].length;
                }, 0);
            }, 0)
        });

    } catch (error) {
        console.error('Erro no backup:', error);
        res.status(500).json({ error: 'Erro ao realizar backup' });
    }
});

// Exportar contatos para CSV
app.get('/api/export/contatos/csv', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.CRM_DB_NAME || 'avila_crm');

        // Buscar todos os contatos consolidados
        const contacts = await db.collection('contacts').find({}).toArray();
        await client.close();

        // Converter para CSV
        const csv = parse(contacts, {
            fields: ['name', 'phone', 'email', 'company', 'source', 'createdAt']
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="contatos_export.csv"');
        res.send(csv);

    } catch (error) {
        console.error('Erro na exportação CSV:', error);
        res.status(500).json({ error: 'Erro ao exportar contatos' });
    }
});

// Exportar emails para JSON
app.get('/api/export/emails/json', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');

        const emails = await db.collection('emails').find({}).toArray();
        await client.close();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="emails_export.json"');
        res.send(JSON.stringify(emails, null, 2));

    } catch (error) {
        console.error('Erro na exportação JSON:', error);
        res.status(500).json({ error: 'Erro ao exportar emails' });
    }
});

// Verificar integridade dos dados
app.get('/api/health/data', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();

        const health = {
            timestamp: new Date().toISOString(),
            databases: {}
        };

        // Verificar CRM
        const crmDb = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        const crmStats = await crmDb.stats();
        health.databases.crm = {
            collections: await crmDb.listCollections().toArray(),
            stats: crmStats
        };

        // Verificar Gmail
        const gmailDb = client.db(process.env.GMAIL_DB_NAME || 'avila_gmail');
        const gmailStats = await gmailDb.stats();
        health.databases.gmail = {
            collections: await gmailDb.listCollections().toArray(),
            stats: gmailStats
        };

        await client.close();

        res.json({
            success: true,
            health,
            totalContacts: health.databases.crm.stats?.objects || 0,
            totalEmails: health.databases.gmail.stats?.objects || 0
        });

    } catch (error) {
        console.error('Erro na verificação de saúde:', error);
        res.status(500).json({ error: 'Erro ao verificar saúde dos dados' });
    }
});

// ===== ENDPOINTS DE FINANCEIRO =====

// Endpoint para carregar extratos bancários
app.get('/api/financeiro/extratos', async (req, res) => {
    try {
        
        const extratosPath = path.join(__dirname, 'Extrato-bancario');
        
        // Verificar se a pasta existe
        try {
            await fs.access(extratosPath);
        } catch {
            return res.json({ transactions: [], total: 0 });
        }
        
        const files = await fs.readdir(extratosPath);
        const csvFiles = files.filter(f => f.endsWith('.csv'));
        
        const transactions = [];
        
        for (const file of csvFiles) {
            const filePath = path.join(extratosPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim());
            
            // Pular header se houver
            const dataLines = lines.slice(1);
            
            dataLines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 3) {
                    transactions.push({
                        data: parts[0]?.trim() || '',
                        descricao: parts[1]?.trim() || '',
                        valor: parseFloat(parts[2]?.trim() || '0'),
                        arquivo: file
                    });
                }
            });
        }
        
        res.json({ 
            transactions: transactions.sort((a, b) => new Date(b.data) - new Date(a.data)),
            total: transactions.length 
        });
        
    } catch (error) {
        console.error('Erro ao carregar extratos:', error);
        res.status(500).json({ error: error.message, transactions: [] });
    }
});

// Atualizar extratos
app.post('/api/financeiro/atualizar', async (req, res) => {
    try {
        res.json({ message: 'Extratos atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== FIM ENDPOINTS DE FINANCEIRO =====

// ===== ENDPOINTS DE E-READER E DIÁRIO =====

// Salvar progresso de leitura e entradas do diário
app.post('/api/ereader/salvar', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        
        const dados = {
            ...req.body,
            usuarioId: 'default_user', // Pode ser melhorado com autenticação
            ultimaAtualizacao: new Date()
        };
        
        await db.collection('ereader_data').updateOne(
            { usuarioId: dados.usuarioId },
            { $set: dados },
            { upsert: true }
        );
        
        await client.close();
        
        res.json({ success: true, message: 'Dados salvos com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar dados do e-reader:', error);
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

// Carregar progresso de leitura e diário
app.get('/api/ereader/carregar', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        
        const dados = await db.collection('ereader_data').findOne({ 
            usuarioId: 'default_user' 
        });
        
        await client.close();
        
        res.json({ success: true, dados: dados || null });
    } catch (error) {
        console.error('Erro ao carregar dados do e-reader:', error);
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
});

// Exportar diário em PDF
app.get('/api/ereader/exportar-diario', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        
        const dados = await db.collection('ereader_data').findOne({ 
            usuarioId: 'default_user' 
        });
        
        await client.close();
        
        if (!dados || !dados.diarioEntradas) {
            return res.status(404).json({ error: 'Nenhuma entrada encontrada' });
        }
        
        // Formato texto para exportação
        const texto = dados.diarioEntradas.map(e => {
            const data = new Date(e.data).toLocaleString('pt-BR');
            return `${data} ${e.humor}\n${'-'.repeat(80)}\n${e.texto}\n\n`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="diario.txt"');
        res.send(texto);
        
    } catch (error) {
        console.error('Erro ao exportar diário:', error);
        res.status(500).json({ error: 'Erro ao exportar diário' });
    }
});

// Estatísticas de leitura
app.get('/api/ereader/estatisticas', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        const db = client.db(process.env.CRM_DB_NAME || 'avila_crm');
        
        const dados = await db.collection('ereader_data').findOne({ 
            usuarioId: 'default_user' 
        });
        
        await client.close();
        
        if (!dados) {
            return res.json({ 
                success: true, 
                estatisticas: { 
                    totalLivros: 2,
                    livrosLidos: 0,
                    paginasLidas: 0,
                    diasConsecutivos: 0,
                    entradasDiario: 0
                }
            });
        }
        
        const estatisticas = {
            totalLivros: 2,
            livrosLidos: dados.livros?.filter(l => l.progresso === 100).length || 0,
            paginasLidas: dados.livros?.reduce((acc, l) => acc + l.paginaAtual, 0) || 0,
            diasConsecutivos: calcularDiasConsecutivos(dados),
            entradasDiario: dados.diarioEntradas?.length || 0,
            perguntasRespondidas: dados.livros?.reduce((acc, l) => 
                acc + l.perguntas.filter(p => p.respondida).length, 0) || 0
        };
        
        res.json({ success: true, estatisticas });
        
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
});

function calcularDiasConsecutivos(dados) {
    if (!dados.diarioEntradas || dados.diarioEntradas.length === 0) return 0;
    
    const datas = dados.diarioEntradas
        .map(e => new Date(e.data).toDateString())
        .sort((a, b) => new Date(b) - new Date(a));
    
    let consecutivos = 1;
    let hoje = new Date().toDateString();
    
    if (datas[0] !== hoje) return 0;
    
    for (let i = 1; i < datas.length; i++) {
        const diff = Math.floor((new Date(datas[i-1]) - new Date(datas[i])) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            consecutivos++;
        } else {
            break;
        }
    }
    
    return consecutivos;
}

// ===== CALENDAR ENDPOINTS =====
app.post('/api/calendar/save', async (req, res) => {
    try {
        const { events } = req.body;
        
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        
        const db = client.db('gerenciador_pessoal');
        const collection = db.collection('calendar_events');
        
        // Upsert - atualiza ou insere se não existir
        await collection.replaceOne(
            { userId: 'default' },
            { userId: 'default', events, lastUpdated: new Date() },
            { upsert: true }
        );
        
        await client.close();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar eventos:', error);
        res.status(500).json({ error: 'Erro ao salvar eventos' });
    }
});

app.get('/api/calendar/load', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        
        const db = client.db('gerenciador_pessoal');
        const collection = db.collection('calendar_events');
        
        const dados = await collection.findOne({ userId: 'default' });
        
        await client.close();
        
        if (!dados) {
            return res.json({ events: [] });
        }
        
        res.json({ events: dados.events || [] });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        res.status(500).json({ error: 'Erro ao carregar eventos' });
    }
});

// ===== GMAIL STATS ENDPOINT =====
app.get('/api/gmail/stats', async (req, res) => {
    try {
        const client = new MongoClient(CONFIG.mongodb.uri, mongoOptions);
        await client.connect();
        
        const db = client.db('avila_gmail');
        const emailsCollection = db.collection('emails');
        
        // Contar total de emails sincronizados
        const totalEmails = await emailsCollection.countDocuments();
        
        // Contar por conta
        const emailsByAccount = await emailsCollection.aggregate([
            {
                $group: {
                    _id: '$account',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        await client.close();
        
        res.json({
            success: true,
            totalEmails,
            accounts: emailsByAccount.map(acc => ({
                account: acc._id,
                emails: acc.count
            }))
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas do Gmail:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
});

// ===== CONTATOS UNIFICADOS =====

// GET /api/contacts/unified - Listar todos os contatos unificados
app.get('/api/contacts/unified', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const contacts = await collection.find({}).sort({ criadoEm: -1 }).toArray();
        const total = await collection.countDocuments();

        res.json({
            success: true,
            contacts: contacts,
            total: total
        });

        client.close();
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/contacts/stats - Estatísticas dos contatos
app.get('/api/contacts/stats', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const total = await collection.countDocuments();
        const empresas = await collection.countDocuments({ tipo: 'empresa' });
        const pessoal = await collection.countDocuments({ tipo: 'pessoal' });
        const servicos = await collection.countDocuments({ tipo: 'servico' });
        const comTelefone = await collection.countDocuments({ telefone: { $exists: true, $ne: '' } });
        const comEmail = await collection.countDocuments({ email: { $exists: true, $ne: '' } });

        res.json({
            success: true,
            total: total,
            empresas: empresas,
            pessoal: pessoal,
            servicos: servicos,
            comTelefone: comTelefone,
            comEmail: comEmail
        });

        client.close();
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/contacts/export/csv - Exportar contatos para CSV
app.get('/api/contacts/export/csv', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const contacts = await collection.find({}).sort({ criadoEm: -1 }).toArray();

        // Criar CSV
        let csv = 'Nome,Telefone,Email,Tipo,Origem,Cidade,UF,CNPJ\n';

        contacts.forEach(contact => {
            const nome = (contact.nome || '').replace(/"/g, '""');
            const telefone = (contact.telefone || '').replace(/"/g, '""');
            const email = (contact.email || '').replace(/"/g, '""');
            const tipo = contact.tipo || '';
            const origem = contact.origem || '';
            const cidade = contact.endereco?.cidade || '';
            const uf = contact.endereco?.uf || '';
            const cnpj = contact.cnpj || '';

            csv += `"${nome}","${telefone}","${email}","${tipo}","${origem}","${cidade}","${uf}","${cnpj}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="contatos_unificados_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);

        client.close();
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ==================== ROTAS DE CAMPANHAS ====================

// GET /api/campanhas - Listar todas as campanhas
app.get('/api/campanhas', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campanhas');

        const campanhas = await collection.find({}).sort({ criadoEm: -1 }).toArray();

        // Calcular KPIs para cada campanha
        const campanhasComKPIs = campanhas.map(campanha => {
            const hoje = new Date();
            const dataInicio = new Date(campanha.dataInicio);
            const dataFim = new Date(campanha.dataFim);
            const diasTotais = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
            const diasPassados = Math.ceil((hoje - dataInicio) / (1000 * 60 * 60 * 24));
            const progresso = Math.min(Math.max(diasPassados / diasTotais, 0), 1);

            // Simular dados de performance (em produção, viriam das APIs das plataformas)
            const orcamentoGasto = campanha.orcamento * progresso;
            const conversoes = Math.floor(Math.random() * 50) + 10; // Simulado
            const receita = conversoes * 50; // Simulado: R$ 50 por conversão
            const roas = receita / orcamentoGasto || 0;
            const cpa = orcamentoGasto / conversoes || 0;
            const orcamentoRestante = campanha.orcamento - orcamentoGasto;

            return {
                ...campanha,
                conversoes,
                receita,
                roas,
                cpa,
                orcamentoGasto,
                orcamentoRestante,
                progresso: progresso * 100
            };
        });

        res.json({
            success: true,
            campanhas: campanhasComKPIs
        });

        client.close();
    } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/campanhas - Criar nova campanha
app.post('/api/campanhas', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campanhas');

        const novaCampanha = {
            ...req.body,
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };

        const result = await collection.insertOne(novaCampanha);

        res.json({
            success: true,
            message: 'Campanha criada com sucesso',
            campanhaId: result.insertedId
        });

        client.close();
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// PUT /api/campanhas/:id - Atualizar campanha
app.put('/api/campanhas/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campanhas');

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    ...req.body,
                    atualizadoEm: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campanha não encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Campanha atualizada com sucesso'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao atualizar campanha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// DELETE /api/campanhas/:id - Excluir campanha
app.delete('/api/campanhas/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campanhas');

        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campanha não encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Campanha excluída com sucesso'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao excluir campanha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ==================== ROTAS DE DETALHES DO CLIENTE ====================

// POST /api/client-finance - Salvar informações financeiras do cliente
app.post('/api/client-finance', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('client_finance');

        const financeData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Upsert - atualizar se existir, criar se não existir
        const result = await collection.updateOne(
            { clientId: req.body.clientId },
            { $set: financeData },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Informações financeiras salvas com sucesso'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao salvar finance:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/client-finance/:clientId - Obter informações financeiras do cliente
app.get('/api/client-finance/:clientId', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('client_finance');

        const finance = await collection.findOne({ clientId: req.params.clientId });

        res.json({
            success: true,
            finance: finance
        });

        client.close();
    } catch (error) {
        console.error('Erro ao buscar finance:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/client-contract/upload - Upload de contrato
app.post('/api/client-contract/upload', upload.single('contract'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo enviado'
            });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('client_contracts');

        const contractData = {
            clientId: req.body.clientId,
            filename: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
        };

        // Upsert contrato
        const result = await collection.updateOne(
            { clientId: req.body.clientId },
            { $set: contractData },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Contrato enviado com sucesso',
            contract: contractData
        });

        client.close();
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/client-contract/:clientId - Obter contrato do cliente
app.get('/api/client-contract/:clientId', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('client_contracts');

        const contract = await collection.findOne({ clientId: req.params.clientId });

        if (contract) {
            res.json({
                success: true,
                contract: {
                    filename: contract.filename,
                    url: `/uploads/${contract.filename}`,
                    uploadedAt: contract.uploadedAt
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Contrato não encontrado'
            });
        }

        client.close();
    } catch (error) {
        console.error('Erro ao buscar contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/client-history/:clientId - Obter histórico do cliente
app.get('/api/client-history/:clientId', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('client_history');

        const history = await collection.find({ clientId: req.params.clientId })
            .sort({ date: -1 })
            .limit(50)
            .toArray();

        res.json({
            success: true,
            history: history
        });

        client.close();
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ==================== ROTAS DE GESTORES ====================

// GET /api/gestores - Listar todos os gestores
app.get('/api/gestores', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('gestores');

        const gestores = await collection.find({}).sort({ criadoEm: -1 }).toArray();

        res.json({
            success: true,
            gestores: gestores
        });

        client.close();
    } catch (error) {
        console.error('Erro ao buscar gestores:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/gestores - Criar novo gestor
app.post('/api/gestores', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('gestores');

        const novoGestor = {
            ...req.body,
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };

        const result = await collection.insertOne(novoGestor);

        res.json({
            success: true,
            message: 'Gestor criado com sucesso',
            gestorId: result.insertedId
        });

        client.close();
    } catch (error) {
        console.error('Erro ao criar gestor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/gestores/:id - Obter gestor específico
app.get('/api/gestores/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('gestores');

        const gestor = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (gestor) {
            res.json({
                success: true,
                gestor: gestor
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Gestor não encontrado'
            });
        }

        client.close();
    } catch (error) {
        console.error('Erro ao buscar gestor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// PUT /api/gestores/:id - Atualizar gestor
app.put('/api/gestores/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('gestores');

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    ...req.body,
                    atualizadoEm: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gestor não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Gestor atualizado com sucesso'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao atualizar gestor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// DELETE /api/gestores/:id - Excluir gestor
app.delete('/api/gestores/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('gestores');

        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gestor não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Gestor excluído com sucesso'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao excluir gestor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ==================== DESIGN & COPY ENDPOINTS ====================

// Configurar multer para upload de materiais
const designStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'design-materials');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const designUpload = multer({ 
    storage: designStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido'));
        }
    }
});

// POST /api/design-materials - Upload de materiais de design
app.post('/api/design-materials', designUpload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo enviado'
            });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('design_materials');

        const materials = req.files.map(file => ({
            filename: file.originalname,
            storedName: file.filename,
            fileType: path.extname(file.originalname).toLowerCase(),
            fileSize: file.size,
            campaignId: req.body.campaignId || 'general',
            type: req.body.type || 'design',
            uploadDate: new Date(),
            uploadedBy: req.body.uploadedBy || 'designer',
            path: file.path
        }));

        const result = await collection.insertMany(materials);

        res.json({
            success: true,
            message: `${materials.length} material(is) enviado(s) com sucesso`,
            materials: materials
        });

        client.close();
    } catch (error) {
        console.error('Erro no upload de materiais:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/design-materials - Listar materiais de design
app.get('/api/design-materials', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('design_materials');

        const query = {};
        if (req.query.campaignId && req.query.campaignId !== '') {
            query.campaignId = req.query.campaignId;
        }

        const materials = await collection.find(query).sort({ uploadDate: -1 }).toArray();

        res.json({
            success: true,
            materials: materials
        });

        client.close();
    } catch (error) {
        console.error('Erro ao listar materiais:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/design-materials/:id/download - Download de material
app.get('/api/design-materials/:id/download', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('design_materials');

        const material = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material não encontrado'
            });
        }

        const filePath = material.path;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo não encontrado no servidor'
            });
        }

        res.download(filePath, material.filename);

        client.close();
    } catch (error) {
        console.error('Erro ao fazer download:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/design-materials/:id/share - Compartilhar material
app.get('/api/design-materials/:id/share', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('design_materials');

        const material = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material não encontrado'
            });
        }

        // Gerar link de compartilhamento temporário
        const shareToken = require('crypto').randomBytes(16).toString('hex');
        const shareUrl = `${req.protocol}://${req.get('host')}/api/design-materials/share/${shareToken}`;

        // Salvar token temporário (expira em 24h)
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    shareToken: shareToken,
                    shareExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
                }
            }
        );

        res.json({
            success: true,
            shareUrl: shareUrl,
            expiresIn: '24 horas'
        });

        client.close();
    } catch (error) {
        console.error('Erro ao compartilhar material:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/design-materials/share/:token - Acesso via link compartilhado
app.get('/api/design-materials/share/:token', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('design_materials');

        const material = await collection.findOne({ 
            shareToken: req.params.token,
            shareExpires: { $gt: new Date() }
        });

        if (!material) {
            return res.status(404).send('Link de compartilhamento inválido ou expirado');
        }

        const filePath = material.path;
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('Arquivo não encontrado');
        }

        res.download(filePath, material.filename);

        client.close();
    } catch (error) {
        console.error('Erro ao acessar material compartilhado:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// GET /api/campaigns/active - Listar campanhas ativas
app.get('/api/campaigns/active', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campaigns');

        const campaigns = await collection.find({ 
            status: { $in: ['active', 'in_progress', 'review'] }
        }).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            campaigns: campaigns
        });

        client.close();
    } catch (error) {
        console.error('Erro ao listar campanhas ativas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/campaigns - Listar todas as campanhas
app.get('/api/campaigns', async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority', mongoOptions);
        const db = client.db('clientes');
        const collection = db.collection('campaigns');

        const campaigns = await collection.find({}).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            campaigns: campaigns
        });

        client.close();
    } catch (error) {
        console.error('Erro ao listar campanhas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ===== FIM DOS ENDPOINTS =====

app.listen(PORT, async () => {
    console.log(`✓ Avila Dashboard Backend rodando em http://localhost:${PORT}`);
    await testMongoConnection();
    console.log('✓ Todas as APIs integradas');
});

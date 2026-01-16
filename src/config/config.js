// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

/**
 * Configurações centralizadas do sistema
 * Todas as credenciais vêm de variáveis de ambiente
 */
const config = {
    // Servidor
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || '*'
    },

    // MongoDB Atlas
    mongodb: {
        uri: process.env.MONGO_ATLAS_URI
    },

    // GitHub
    github: {
        username: process.env.GITHUB_USERNAME,
        token: process.env.GITHUB_TOKEN
    },

    // Stripe
    stripe: {
        secret: process.env.STRIPE_API_TOKEN
    },

    // OpenAI
    openai: {
        key: process.env.OPENAI_API_KEY
    },

    // Railway
    railway: {
        token: process.env.RAILWAY_TOKEN
    },

    // Azure DevOps
    azure: {
        token: process.env.AZURE_DEVOPS_API
    },

    // Sentry
    sentry: {
        token: process.env.SENTRY_TOKEN_API
    },

    // Gmail (múltiplas contas)
    gmail: [
        {
            email: process.env.GMAIL_USER_1,
            password: process.env.GMAIL_PASS_1
        },
        {
            email: process.env.GMAIL_USER_2,
            password: process.env.GMAIL_PASS_2
        },
        {
            email: process.env.GMAIL_USER_3,
            password: process.env.GMAIL_PASS_3
        }
    ].filter(account => account.email && account.password), // Remove contas não configuradas

    // Porkbun DNS
    porkbun: {
        apiKey: process.env.PORKBUN_API_KEY,
        secret: process.env.PORKBUN_SECRET_KEY
    },

    // Cloudflare
    cloudflare: {
        apiKey: process.env.CLOUDFLARE_API_KEY
    },

    // PayPal
    paypal: {
        clientId: process.env.PAYPAL_ID,
        token: process.env.PAYPAL_TOKEN_API
    },

    // Google Cloud
    gcloud: {
        token: process.env.GCLOUD_API_TOKEN,
        clientId: process.env.GCLOUD_CLIENT,
        secret: process.env.GCLOUD_SECRET_KEY
    },

    // Security
    security: {
        jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
        sessionSecret: process.env.SESSION_SECRET || 'change-this-in-production'
    }
};

/**
 * Valida se as configurações obrigatórias estão presentes
 */
function validateConfig() {
    const required = [
        'MONGO_ATLAS_URI',
        'GITHUB_TOKEN',
        'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Variáveis de ambiente obrigatórias faltando:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\n💡 Copie .env.example para .env e preencha as credenciais');
        process.exit(1);
    }
}

// Valida na inicialização
if (process.env.NODE_ENV !== 'test') {
    validateConfig();
}

module.exports = config;

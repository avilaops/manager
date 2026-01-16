import express from 'express';

/**
 * Health Check Middleware
 * Adiciona endpoints de monitoramento para o Render e outros serviços
 */

// Armazenar tempo de início
const startTime = Date.now();

// Contador de requests
let requestCount = 0;

// Middleware para contar requests
export const requestCounter = (req, res, next) => {
    requestCount++;
    next();
};

// Health check simples
export const healthCheck = (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    res.status(200).json({
        status: 'OK',
        message: 'Avila Dashboard Backend is running',
        timestamp: new Date().toISOString(),
        uptime: `${uptime}s`,
        version: '2.1.0',
        environment: process.env.NODE_ENV || 'development',
        render: process.env.RENDER === 'true',
        requests: requestCount
    });
};

// Health check detalhado
export const healthCheckDetailed = async (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${uptime}s`,
        version: '2.1.0',
        environment: process.env.NODE_ENV || 'development',
        
        // Sistema
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            },
            cpu: process.cpuUsage()
        },
        
        // Serviços
        services: {
            github: {
                configured: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'seu_token_aqui'),
                username: process.env.GITHUB_USERNAME || 'Not configured'
            },
            mongodb: {
                configured: !!(process.env.MONGO_ATLAS_URI && process.env.MONGO_ATLAS_URI.includes('mongodb'))
            },
            openai: {
                configured: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'))
            },
            stripe: {
                configured: !!(process.env.STRIPE_API_TOKEN && process.env.STRIPE_API_TOKEN.startsWith('sk_'))
            },
            linkedin: {
                configured: !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ACCESS_TOKEN !== 'seu_token_aqui')
            }
        },
        
        // Estatísticas
        stats: {
            requests: requestCount,
            requestsPerMinute: Math.round(requestCount / (uptime / 60))
        }
    };
    
    res.status(200).json(health);
};

// Readiness check (para Kubernetes/Render)
export const readinessCheck = (req, res) => {
    // Verificar se serviços essenciais estão configurados
    const isReady = 
        process.env.MONGO_ATLAS_URI && 
        process.env.MONGO_ATLAS_URI.includes('mongodb');
    
    if (isReady) {
        res.status(200).json({ 
            status: 'ready',
            message: 'Service is ready to accept traffic' 
        });
    } else {
        res.status(503).json({ 
            status: 'not ready',
            message: 'Service is not ready - missing configuration' 
        });
    }
};

// Liveness check (para Kubernetes/Render)
export const livenessCheck = (req, res) => {
    res.status(200).json({ 
        status: 'alive',
        message: 'Service is alive' 
    });
};

// Registrar todas as rotas de health check
export const registerHealthRoutes = (app) => {
    // Health check simples - para Render
    app.get('/health', healthCheck);
    
    // Health check detalhado
    app.get('/api/health', healthCheckDetailed);
    
    // Readiness check
    app.get('/ready', readinessCheck);
    
    // Liveness check
    app.get('/alive', livenessCheck);
    
    // Ping simples
    app.get('/ping', (req, res) => {
        res.send('pong');
    });
    
    console.log('✓ Health check routes registered:');
    console.log('  GET /health - Simple health check');
    console.log('  GET /api/health - Detailed health check');
    console.log('  GET /ready - Readiness probe');
    console.log('  GET /alive - Liveness probe');
    console.log('  GET /ping - Simple ping');
};

export default {
    requestCounter,
    healthCheck,
    healthCheckDetailed,
    readinessCheck,
    livenessCheck,
    registerHealthRoutes
};

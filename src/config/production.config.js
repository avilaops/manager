/**
 * Configuração de Produção
 * Define se o ambiente está em modo de produção
 */

const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.RENDER === 'true' ||
                     !process.env.NODE_ENV;

export const config = {
    // Ambiente
    isProduction,
    isDevelopment: !isProduction,
    
    // Logging
    enableConsoleLog: !isProduction,
    enableDebugLog: !isProduction,
    
    // API
    apiUrl: isProduction 
        ? 'https://manager-api.onrender.com/api'
        : 'http://localhost:3000/api',
    
    // Cache
    enableCache: isProduction,
    cacheMaxAge: isProduction ? 31536000 : 0, // 1 ano em produção, 0 em dev
    
    // Segurança
    enableCORS: true,
    corsOrigins: isProduction 
        ? ['https://admin.avila.inc', 'https://avila.inc']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    
    // Rate Limiting
    enableRateLimit: isProduction,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutos
    rateLimitMaxRequests: isProduction ? 100 : 1000,
    
    // Compressão
    enableCompression: isProduction,
    
    // Headers de Segurança
    enableSecurityHeaders: isProduction,
    
    // Service Worker
    enableServiceWorker: isProduction,
    
    // Analytics
    enableAnalytics: isProduction,
    
    // Timeouts
    requestTimeout: isProduction ? 30000 : 60000, // 30s prod, 60s dev
    
    // Versão
    version: '2.1.0'
};

export default config;

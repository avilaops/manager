/**
 * Configuração de Ambiente - Frontend
 * Detecta automaticamente o ambiente e ajusta configurações
 */

const ENV = {
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // API Base URL
    get API_BASE() {
        return this.isProduction 
            ? 'https://manager-api.onrender.com/api'
            : 'http://localhost:3000/api';
    },
    
    // Cache versão (incrementar ao fazer deploy)
    CACHE_VERSION: 'v5',
    
    // Features flags
    ENABLE_ANALYTICS: false, // Ativar quando tiver GA_ID real
    ENABLE_SERVICE_WORKER: true,
    ENABLE_DEBUG_LOGS: false, // Sempre false em produção
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 segundos
    
    // Rate limiting local
    MAX_REQUESTS_PER_MINUTE: 60,
    
    // Cache TTL
    CACHE_TTL: {
        short: 5 * 60 * 1000,    // 5 minutos
        medium: 30 * 60 * 1000,  // 30 minutos
        long: 24 * 60 * 60 * 1000 // 24 horas
    }
};

// Congelar objeto para evitar modificações acidentais
Object.freeze(ENV);
Object.freeze(ENV.CACHE_TTL);

window.ENV = ENV;

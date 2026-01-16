/**
 * Logger Utilities - Production Ready
 * Sistema de logging condicional baseado em ambiente
 */

const isProduction = typeof process !== 'undefined' 
    ? (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true')
    : window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const logger = {
    /**
     * Log informativo (apenas em desenvolvimento)
     */
    log: (...args) => {
        if (!isProduction) {
            console.log('[INFO]', ...args);
        }
    },

    /**
     * Log de erro (sempre ativo, mas sanitizado em produção)
     */
    error: (...args) => {
        if (isProduction) {
            // Em produção, enviar para serviço de monitoramento
            console.error('[ERROR]', args[0]); // Apenas primeira mensagem
        } else {
            console.error('[ERROR]', ...args);
        }
    },

    /**
     * Log de aviso (sempre ativo)
     */
    warn: (...args) => {
        if (!isProduction) {
            console.warn('[WARN]', ...args);
        }
    },

    /**
     * Log de debug (apenas desenvolvimento)
     */
    debug: (...args) => {
        if (!isProduction) {
            console.debug('[DEBUG]', ...args);
        }
    },

    /**
     * Log de performance
     */
    performance: (label, startTime) => {
        if (!isProduction) {
            const duration = performance.now() - startTime;
            console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
        }
    }
};

// Exportar para uso no Node.js e Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
} else {
    window.logger = logger;
}

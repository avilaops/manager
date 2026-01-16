import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral
 * 100 requisições por 15 minutos por IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: {
        success: false,
        error: 'Muitas requisições deste IP, tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter para login
 * 5 tentativas por 15 minutos
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Muitas tentativas de login, tente novamente em 15 minutos'
    }
});

/**
 * Rate limiter para APIs externas
 * 30 requisições por minuto
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30,
    message: {
        success: false,
        error: 'Limite de requisições atingido, aguarde 1 minuto'
    }
});

export {
    generalLimiter,
    loginLimiter,
    apiLimiter
};

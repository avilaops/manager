/**
 * Middleware centralizado de tratamento de erros
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handler para erros não capturados
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Erro padrão
    if (!statusCode) {
        statusCode = 500;
        message = 'Erro interno do servidor';
    }

    // Log do erro (em produção, use um logger como Winston)
    console.error('❌ Erro:', {
        statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method
    });

    // Resposta ao cliente
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Wrapper para async handlers (evita try-catch em cada rota)
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
};

export {
    AppError,
    errorHandler,
    asyncHandler,
    notFoundHandler
};

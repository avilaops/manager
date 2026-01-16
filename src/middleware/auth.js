import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_aqui_muito_seguro_123';

/**
 * Middleware de autenticação JWT
 * Protege rotas que requerem login
 */
const authenticate = (req, res, next) => {
    try {
        // Busca token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token não fornecido', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verifica o token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adiciona dados do usuário na requisição
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AppError('Token inválido', 401));
        } else if (error.name === 'TokenExpiredError') {
            next(new AppError('Token expirado', 401));
        } else {
            next(error);
        }
    }
};

/**
 * Gera um token JWT
 */
const generateToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export {
    authenticate,
    generateToken
};

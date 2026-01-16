import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Middleware para processar resultados de validação
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        throw new AppError(errorMessages.join(', '), 400);
    }
    next();
};

/**
 * Validações comuns
 */
const validators = {
    // Email
    email: body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),

    // MongoDB Collection
    mongoCollection: [
        param('db').notEmpty().withMessage('Nome do database é obrigatório'),
        param('collection').notEmpty().withMessage('Nome da collection é obrigatório')
    ],

    // Compromisso/Calendário
    compromisso: [
        body('titulo').notEmpty().withMessage('Título é obrigatório'),
        body('data').isISO8601().withMessage('Data inválida'),
        body('hora').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida (HH:MM)'),
        body('email').optional().isEmail().withMessage('Email inválido')
    ],

    // Envio de email
    sendEmail: [
        body('from').isEmail().withMessage('Email de origem inválido'),
        body('to').isEmail().withMessage('Email de destino inválido'),
        body('subject').notEmpty().withMessage('Assunto é obrigatório'),
        body('text').optional().isString(),
        body('html').optional().isString()
    ],

    // Login
    login: [
        body('username').notEmpty().withMessage('Usuário é obrigatório'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Senha deve ter no mínimo 6 caracteres')
    ],

    // Paginação
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Página deve ser um número inteiro positivo'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limite deve ser entre 1 e 100')
    ]
};

export {
    validate,
    validators
};


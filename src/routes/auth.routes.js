const express = require('express');
const router = express.Router();
const { authenticate, generateToken } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validator');
const { loginLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e retornar token JWT
 * @access  Public
 */
router.post('/login', 
    loginLimiter,
    validators.login,
    validate,
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        // TODO: Implementar verificação real com banco de dados
        // Por enquanto, apenas um exemplo
        if (username === 'admin' && password === 'admin123') {
            const token = generateToken({ 
                username,
                role: 'admin' 
            });

            res.json({
                success: true,
                token,
                user: {
                    username,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }
    })
);

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private
 */
router.get('/me', 
    authenticate,
    asyncHandler(async (req, res) => {
        res.json({
            success: true,
            user: req.user
        });
    })
);

module.exports = router;

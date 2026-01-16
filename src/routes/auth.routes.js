import express from 'express';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { authenticate, generateToken } from '../middleware/auth.js';
import { validators, validate } from '../middleware/validator.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Configuração MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'avilaManager';

let db = null;

// Conectar ao MongoDB
async function getDb() {
    if (db) return db;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    return db;
}

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário (apenas para setup inicial)
 * @access  Private (apenas admin)
 */
router.post('/register',
    asyncHandler(async (req, res) => {
        const { email, password, name } = req.body;

        const database = await getDb();
        const users = database.collection('users');

        // Verificar se usuário já existe
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Usuário já existe'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const newUser = {
            email,
            password: hashedPassword,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await users.insertOne(newUser);

        res.json({
            success: true,
            message: 'Usuário criado com sucesso'
        });
    })
);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e retornar token JWT
 * @access  Public
 */
router.post('/login', 
    loginLimiter,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        const database = await getDb();
        const users = database.collection('users');

        // Buscar usuário
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Gerar token
        const token = generateToken({ 
            userId: user._id,
            email: user.email,
            name: user.name
        });

        // Atualizar último login
        await users.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        res.json({
            success: true,
            token,
            user: {
                email: user.email,
                name: user.name
            }
        });
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
        const database = await getDb();
        const users = database.collection('users');
        
        const user = await users.findOne(
            { _id: req.user.userId },
            { projection: { password: 0 } }
        );

        res.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.post('/change-password',
    authenticate,
    asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }

        const database = await getDb();
        const users = database.collection('users');

        const user = await users.findOne({ _id: req.user.userId });

        // Verificar senha atual
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha
        await users.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                } 
            }
        );

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });
    })
);

export default router;

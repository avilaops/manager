require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const { logger, requestLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const mongodbRoutes = require('./routes/mongodb.routes');
const githubRoutes = require('./routes/github.routes');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();

// ============================================
// Middlewares de Segurança
// ============================================
app.use(helmet()); // Headers de segurança
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições
app.use(requestLogger);

// Rate limiting global
app.use(generalLimiter);

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Avila Dashboard API está online',
        timestamp: new Date().toISOString(),
        environment: config.server.env
    });
});

// ============================================
// Rotas da API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/mongodb', mongodbRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/payments', paymentsRoutes);

// TODO: Adicionar mais rotas conforme necessário
// app.use('/api/railway', railwayRoutes);
// app.use('/api/sentry', sentryRoutes);
// app.use('/api/dns', dnsRoutes);
// app.use('/api/email', emailRoutes);
// app.use('/api/calendar', calendarRoutes);

// ============================================
// Tratamento de Erros
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Inicialização do Servidor
// ============================================
const PORT = config.server.port;

app.listen(PORT, () => {
    logger.info('='.repeat(50));
    logger.info(`🚀 Avila Dashboard Backend`);
    logger.info(`📡 Servidor rodando em http://localhost:${PORT}`);
    logger.info(`🌍 Ambiente: ${config.server.env}`);
    logger.info(`✅ MongoDB Atlas: Configurado`);
    logger.info(`✅ APIs: Integradas`);
    logger.info('='.repeat(50));
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    logger.error('❌ UNHANDLED REJECTION! Encerrando...');
    logger.error(err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error('❌ UNCAUGHT EXCEPTION! Encerrando...');
    logger.error(err);
    process.exit(1);
});

module.exports = app;

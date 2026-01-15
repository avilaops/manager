import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mongoDBService } from './services/mongodb.service.js';
import { crmService } from './services/crm.service.js';
import { calendarService } from './services/calendar.service.js';
import { gmailService } from './services/gmail.service.js';
import { ereaderService } from './services/ereader.service.js';
import { universalService } from './services/universal.service.js';
// @ts-ignore
import authRoutes from './routes/auth.routes.js';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(path.join(__dirname, '../src/public/css')));
app.use('/js', express.static(path.join(__dirname, '../src/public/js')));

// ===== Rotas de Autenticação =====
app.use('/api/auth', authRoutes);

// ===== Rotas para páginas HTML =====
app.get('/cadastro.html', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../src/views/cadastro.html'));
});

app.get('/dashboard.html', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../src/views/dashboard.html'));
});

app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

app.get('/mongo-explorer', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/html/mongo-explorer.html'));
});

// ===== MongoDB Connection =====
mongoDBService.connect().catch(console.error);

// ===== API Routes =====

// MongoDB Routes
app.get('/api/mongodb/databases', async (_req: Request, res: Response) => {
    try {
        const databases = await mongoDBService.listDatabases();
        res.json({ success: true, databases });
    } catch (error) {
        console.error('Erro ao listar databases:', error);
        res.status(500).json({ success: false, error: 'Erro ao listar databases' });
    }
});

// CRM Routes
app.post('/api/crm/cliente', async (req: Request, res: Response) => {
    try {
        const result = await crmService.createLead(req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar cliente' });
    }
});

app.get('/api/crm/leads', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const leads = await crmService.getLeads(limit);
        res.json({ success: true, leads });
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar leads' });
    }
});

app.get('/api/crm/contacts', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const contacts = await crmService.getContacts(limit);
        res.json({ success: true, contacts });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar contatos' });
    }
});

app.get('/api/crm/contacts/count', async (_req: Request, res: Response) => {
    try {
        const count = await crmService.getContactsCount();
        res.json({ success: true, count });
    } catch (error) {
        console.error('Erro ao contar contatos:', error);
        res.status(500).json({ success: false, error: 'Erro ao contar contatos' });
    }
});

// Calendar Routes
app.post('/api/calendar/save', async (req: Request, res: Response) => {
    try {
        const result = await calendarService.saveEvent(req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar evento' });
    }
});

app.get('/api/calendar/load', async (req: Request, res: Response) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
        
        const events = await calendarService.getEvents(startDate, endDate);
        res.json({ success: true, events });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        res.status(500).json({ success: false, error: 'Erro ao carregar eventos' });
    }
});

app.delete('/api/calendar/event/:id', async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await calendarService.deleteEvent(id);
        res.json(result);
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(500).json({ success: false, error: 'Erro ao deletar evento' });
    }
});

// Gmail Routes
app.get('/api/gmail/stats', async (_req: Request, res: Response) => {
    try {
        const stats = await gmailService.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do Gmail:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas' });
    }
});

app.get('/api/gmail/emails/:account', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const account = Array.isArray(req.params.account) ? req.params.account[0] : req.params.account;
        const emails = await gmailService.getEmailsByAccount(account, limit);
        res.json({ success: true, emails });
    } catch (error) {
        console.error('Erro ao buscar emails:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar emails' });
    }
});

// E-Reader Routes
app.get('/api/ereader/estatisticas', async (_req: Request, res: Response) => {
    try {
        const stats = await ereaderService.getStatistics();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do e-reader:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas' });
    }
});

app.get('/api/ereader/diary', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const entries = await ereaderService.getDiaryEntries(limit);
        res.json({ success: true, entries });
    } catch (error) {
        console.error('Erro ao buscar entradas do diário:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar entradas' });
    }
});

app.post('/api/ereader/diary', async (req: Request, res: Response) => {
    try {
        const result = await ereaderService.saveDiaryEntry(req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao salvar entrada do diário:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar entrada' });
    }
});
// ===== UNIVERSAL DATABASE ACCESS ROUTES =====

// Listar TODOS os bancos de dados com detalhes completos
app.get('/api/universal/databases', async (_req: Request, res: Response) => {
    try {
        const databases = await universalService.getAllDatabases();
        res.json({ success: true, databases, count: databases.length });
    } catch (error) {
        console.error('Erro ao listar todos os databases:', error);
        res.status(500).json({ success: false, error: 'Erro ao listar databases' });
    }
});

// Listar todas as coleções de um banco específico
app.get('/api/universal/databases/:database/collections', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collections = await universalService.getCollections(database);
        res.json({ success: true, database, collections, count: collections.length });
    } catch (error) {
        console.error('Erro ao listar coleções:', error);
        res.status(500).json({ success: false, error: 'Erro ao listar coleções' });
    }
});

// Buscar documentos em uma coleção específica
app.get('/api/universal/databases/:database/collections/:collection', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = parseInt(req.query.skip as string) || 0;
        const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
        
        const result = await universalService.getDocuments(database, collection, filter, { limit, skip });
        res.json({ success: true, database, collection, ...result });
    } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar documentos' });
    }
});

// Buscar um documento específico por ID
app.get('/api/universal/databases/:database/collections/:collection/:id', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        
        const document = await universalService.getDocumentById(database, collection, id);
        
        if (document) {
            res.json({ success: true, document });
        } else {
            res.status(404).json({ success: false, error: 'Documento não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar documento:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar documento' });
    }
});

// Criar novo documento
app.post('/api/universal/databases/:database/collections/:collection', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        
        const result = await universalService.insertDocument(database, collection, req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao criar documento:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar documento' });
    }
});

// Atualizar documento
app.put('/api/universal/databases/:database/collections/:collection/:id', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        
        const result = await universalService.updateDocument(database, collection, id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao atualizar documento:', error);
        res.status(500).json({ success: false, error: 'Erro ao atualizar documento' });
    }
});

// Deletar documento
app.delete('/api/universal/databases/:database/collections/:collection/:id', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        
        const result = await universalService.deleteDocument(database, collection, id);
        res.json(result);
    } catch (error) {
        console.error('Erro ao deletar documento:', error);
        res.status(500).json({ success: false, error: 'Erro ao deletar documento' });
    }
});

// Buscar em múltiplas coleções
app.post('/api/universal/search/:database', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const { searchTerm, collections } = req.body;
        
        const results = await universalService.searchAcrossCollections(database, searchTerm, collections);
        res.json({ success: true, database, searchTerm, results });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar' });
    }
});

// Estatísticas de um banco de dados
app.get('/api/universal/databases/:database/stats', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const stats = await universalService.getDatabaseStats(database);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ success: false, error: 'Erro ao obter estatísticas' });
    }
});

// Agregação personalizada
app.post('/api/universal/databases/:database/collections/:collection/aggregate', async (req: Request, res: Response) => {
    try {
        const database = Array.isArray(req.params.database) ? req.params.database[0] : req.params.database;
        const collection = Array.isArray(req.params.collection) ? req.params.collection[0] : req.params.collection;
        const { pipeline } = req.body;
        
        const result = await universalService.aggregate(database, collection, pipeline);
        res.json({ success: true, database, collection, ...result });
    } catch (error) {
        console.error('Erro ao executar agregação:', error);
        res.status(500).json({ success: false, error: 'Erro ao executar agregação' });
    }
});
// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve dashboard
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 Gerenciador Pessoal - TypeScript     ║
║                                            ║
║   Server running on port ${PORT}            ║
║   http://localhost:${PORT}                  ║
║                                            ║
║   📊 Dashboard integrado e unificado      ║
║   ✅ MongoDB conectado                     ║
║   🔧 TypeScript + Express                 ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Fechando servidor...');
    await mongoDBService.close();
    process.exit(0);
});

// Rotas para gerenciamento de contatos unificados
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// String de conexão do MongoDB
const uri = process.env.MONGODB_URI || 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority';

// Middleware para conectar ao MongoDB
async function connectToMongo() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        return client;
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        throw error;
    }
}

// GET /api/contacts/unified - Listar todos os contatos unificados
router.get('/unified', async (req, res) => {
    let client;
    try {
        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const contacts = await collection.find({}).sort({ criadoEm: -1 }).toArray();
        const total = await collection.countDocuments();

        res.json({
            success: true,
            contacts: contacts,
            total: total
        });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

// GET /api/contacts/stats - Estatísticas dos contatos
router.get('/stats', async (req, res) => {
    let client;
    try {
        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const total = await collection.countDocuments();
        const empresas = await collection.countDocuments({ tipo: 'empresa' });
        const pessoal = await collection.countDocuments({ tipo: 'pessoal' });
        const servicos = await collection.countDocuments({ tipo: 'servico' });
        const comTelefone = await collection.countDocuments({ telefone: { $exists: true, $ne: '' } });
        const comEmail = await collection.countDocuments({ email: { $exists: true, $ne: '' } });

        res.json({
            success: true,
            total: total,
            empresas: empresas,
            pessoal: pessoal,
            servicos: servicos,
            comTelefone: comTelefone,
            comEmail: comEmail
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

// GET /api/contacts/export/csv - Exportar contatos para CSV
router.get('/export/csv', async (req, res) => {
    let client;
    try {
        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const contacts = await collection.find({}).sort({ criadoEm: -1 }).toArray();

        // Criar CSV
        let csv = 'Nome,Telefone,Email,Tipo,Origem,Cidade,UF,CNPJ\n';

        contacts.forEach(contact => {
            const nome = (contact.nome || '').replace(/"/g, '""');
            const telefone = (contact.telefone || '').replace(/"/g, '""');
            const email = (contact.email || '').replace(/"/g, '""');
            const tipo = contact.tipo || '';
            const origem = contact.origem || '';
            const cidade = contact.endereco?.cidade || '';
            const uf = contact.endereco?.uf || '';
            const cnpj = contact.cnpj || '';

            csv += `"${nome}","${telefone}","${email}","${tipo}","${origem}","${cidade}","${uf}","${cnpj}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="contatos_unificados_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

// POST /api/contacts/unified - Adicionar novo contato
router.post('/unified', async (req, res) => {
    let client;
    try {
        const { nome, telefone, email, tipo, origem, endereco, cnpj } = req.body;

        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const newContact = {
            nome: nome || '',
            telefone: telefone || '',
            email: email || '',
            tipo: tipo || 'pessoal',
            origem: origem || 'manual',
            endereco: endereco || {},
            cnpj: cnpj || '',
            criadoEm: new Date()
        };

        const result = await collection.insertOne(newContact);

        res.json({
            success: true,
            contact: { ...newContact, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Erro ao adicionar contato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

// PUT /api/contacts/unified/:id - Atualizar contato
router.put('/unified/:id', async (req, res) => {
    let client;
    try {
        const { id } = req.params;
        const updates = req.body;

        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const result = await collection.updateOne(
            { _id: require('mongodb').ObjectId(id) },
            { $set: { ...updates, atualizadoEm: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Contato não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contato atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar contato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

// DELETE /api/contacts/unified/:id - Excluir contato
router.delete('/unified/:id', async (req, res) => {
    let client;
    try {
        const { id } = req.params;

        client = await connectToMongo();
        const db = client.db('clientes');
        const collection = db.collection('contacts_unified');

        const result = await collection.deleteOne({ _id: require('mongodb').ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Contato não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contato excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir contato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    } finally {
        if (client) await client.close();
    }
});

module.exports = router;
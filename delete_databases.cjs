// Script para excluir bancos de dados MongoDB especificados
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority';

const databasesToDelete = [
    'avila_erp',
    'aviladevops_clinica',
    'aviladevops_crm',
    'aviladevops_erp',
    'aviladevops_fiscal',
    'aviladevops_landing',
    'aviladevops_main',
    'aviladevops_sistema',
    'aviladevops_transport',
    'barbara',
    'marketplace',
    'sample_mflix',
    'mongodbVSCodePlaygroundDB'
];

async function deleteDatabases() {
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: true
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB');

        for (const dbName of databasesToDelete) {
            try {
                const db = client.db(dbName);
                await db.dropDatabase();
                console.log(`✅ Banco de dados '${dbName}' excluído com sucesso`);
            } catch (error) {
                console.log(`❌ Erro ao excluir '${dbName}': ${error.message}`);
            }
        }

        console.log('🎉 Processo de exclusão concluído');
    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);
        console.log('🔄 Tentando com opções alternativas...');

        // Tentar sem TLS
        try {
            const clientNoTLS = new MongoClient(uri.replace('mongodb+srv://', 'mongodb://'), {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                tls: false
            });
            await clientNoTLS.connect();
            console.log('✅ Conectado sem TLS');

            for (const dbName of databasesToDelete) {
                try {
                    const db = clientNoTLS.db(dbName);
                    await db.dropDatabase();
                    console.log(`✅ Banco de dados '${dbName}' excluído com sucesso`);
                } catch (error) {
                    console.log(`❌ Erro ao excluir '${dbName}': ${error.message}`);
                }
            }

            console.log('🎉 Processo de exclusão concluído');
            await clientNoTLS.close();
        } catch (error2) {
            console.error('❌ Falhou também sem TLS:', error2.message);
        }
    } finally {
        try {
            await client.close();
        } catch (e) {}
    }
}

deleteDatabases();
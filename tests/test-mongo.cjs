// Script para testar conectividade MongoDB
const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '208.67.222.222']);

// Strings de conexão para testar
const uris = [
    // Com SRV (original)
    'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority',
    
    // Sem SRV (fallback direto)
    'mongodb://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0-shard-00-00.npuhras.mongodb.net:27017,cluster0-shard-00-01.npuhras.mongodb.net:27017,cluster0-shard-00-02.npuhras.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqj4ey-shard-0&authSource=admin&retryWrites=true&w=majority'
];

async function testConnections() {
    console.log('🔍 Testando conexões MongoDB...\n');
    
    for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        const type = i === 0 ? 'SRV' : 'Direto';
        
        console.log(`\n[${i + 1}] Tentando conexão ${type}...`);
        console.log(`URI: ${uri.substring(0, 50)}...`);
        
        try {
            const client = new MongoClient(uri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4,
                retryWrites: true,
                retryReads: true
            });
            
            await client.connect();
            await client.db('admin').command({ ping: 1 });
            console.log(`✅ Conexão ${type} funcionou!`);
            
            // Testar criação de dados
            const db = client.db('avila_crm');
            const collection = db.collection('test');
            await collection.insertOne({ test: true, timestamp: new Date() });
            console.log(`✅ Teste de escrita funcionou!`);
            
            await client.close();
            
            console.log(`\n🎉 Use esta string de conexão no server.js:`);
            console.log(`'${uri}'`);
            process.exit(0);
            
        } catch (error) {
            console.log(`❌ Conexão ${type} falhou: ${error.message}`);
        }
    }
    
    console.log('\n❌ Todas as conexões falharam');
    console.log('\n📋 Diagnóstico:');
    console.log('1. Verifique sua conexão com internet');
    console.log('2. Verifique se o firewall está bloqueando');
    console.log('3. Teste ping para google.com');
    console.log('4. Verifique se está em uma rede corporativa com proxy');
}

testConnections();

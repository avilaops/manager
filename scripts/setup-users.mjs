import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'avilaManager';

const users = [
    {
        email: 'nicolas@avila.inc',
        password: '7Aciqgr7@',
        name: 'Nicolas Avila'
    },
    {
        email: 'adm@grdcompany',
        password: 'Grd@123',
        name: 'Administrador GRD'
    }
];

async function setupUsers() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB');
        
        const db = client.db(DB_NAME);
        const usersCollection = db.collection('users');
        
        // Criar índice único no email
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Índice criado no campo email');
        
        for (const userData of users) {
            // Verificar se usuário já existe
            const existingUser = await usersCollection.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`⚠️  Usuário ${userData.email} já existe. Atualizando...`);
                
                // Atualizar senha
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await usersCollection.updateOne(
                    { email: userData.email },
                    {
                        $set: {
                            password: hashedPassword,
                            name: userData.name,
                            updatedAt: new Date()
                        }
                    }
                );
                console.log(`✅ Usuário ${userData.email} atualizado`);
            } else {
                // Criar novo usuário
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                
                await usersCollection.insertOne({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                console.log(`✅ Usuário ${userData.email} criado com sucesso`);
            }
        }
        
        console.log('\n🎉 Setup de usuários concluído!');
        console.log('\n📋 Credenciais configuradas:');
        console.log('1. Nicolas Avila');
        console.log('   Email: nicolas@avila.inc');
        console.log('   Senha: 7Aciqgr7@');
        console.log('\n2. Administrador GRD');
        console.log('   Email: adm@grdcompany');
        console.log('   Senha: Grd@123');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

setupUsers();

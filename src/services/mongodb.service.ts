import { MongoClient, Db } from 'mongodb';
import { DatabaseInfo, CollectionInfo } from '../types/index.js';

class MongoDBService {
    private client: MongoClient | null = null;

    async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI;
            
            if (!mongoUri) {
                throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
            }
            
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            console.log('✅ MongoDB conectado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    }

    getDatabase(dbName: string): Db {
        if (!this.client) {
            throw new Error('MongoDB não está conectado');
        }
        return this.client.db(dbName);
    }

    async listDatabases(): Promise<DatabaseInfo[]> {
        if (!this.client) {
            throw new Error('MongoDB não está conectado');
        }

        const adminDb = this.client.db().admin();
        const dbList = await adminDb.listDatabases();
        
        const databases: DatabaseInfo[] = [];

        for (const dbInfo of dbList.databases) {
            const db = this.client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            
            const collectionDetails: CollectionInfo[] = [];
            for (const coll of collections) {
                const collectionName = coll.name;
                const count = await db.collection(collectionName).countDocuments();
                collectionDetails.push({
                    name: collectionName,
                    count: count
                });
            }

            databases.push({
                name: dbInfo.name,
                sizeOnDisk: dbInfo.sizeOnDisk || 0,
                collections: collectionDetails
            });
        }

        return databases;
    }

    async close(): Promise<void> {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB connection closed');
        }
    }
}

export const mongoDBService = new MongoDBService();

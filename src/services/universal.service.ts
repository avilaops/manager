import { mongoDBService } from './mongodb.service.js';
import { Collection, Document, Filter, FindOptions } from 'mongodb';

/**
 * 🌐 SERVIÇO UNIVERSAL - ACESSO COMPLETO AO MONGODB
 * Permite consultar qualquer banco de dados e coleção dinamicamente
 */

class UniversalService {
    /**
     * Lista todos os bancos de dados disponíveis
     */
    async getAllDatabases() {
        return await mongoDBService.listDatabases();
    }

    /**
     * Lista todas as coleções de um banco específico
     */
    async getCollections(databaseName: string) {
        const db = mongoDBService.getDatabase(databaseName);
        const collections = await db.listCollections().toArray();
        
        const collectionDetails = [];
        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            collectionDetails.push({
                name: coll.name,
                count: count,
                type: coll.type || 'collection'
            });
        }
        
        return collectionDetails;
    }

    /**
     * Busca documentos em qualquer coleção de qualquer banco
     */
    async getDocuments(
        databaseName: string,
        collectionName: string,
        filter: Filter<Document> = {},
        options: FindOptions = {}
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection: Collection = db.collection(collectionName);
        
        // Aplicar limite padrão de 100 documentos se não especificado
        const limit = options.limit || 100;
        const skip = options.skip || 0;
        
        const documents = await collection
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort(options.sort || { _id: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filter);
        
        return {
            documents,
            total,
            limit,
            skip,
            hasMore: skip + documents.length < total
        };
    }

    /**
     * Busca um único documento por ID
     */
    async getDocumentById(
        databaseName: string,
        collectionName: string,
        documentId: string
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        
        // Tentar como ObjectId ou string
        const { ObjectId } = await import('mongodb');
        let filter: any;
        
        try {
            filter = { _id: new ObjectId(documentId) };
        } catch {
            filter = { _id: documentId };
        }
        
        return await collection.findOne(filter);
    }

    /**
     * Insere um novo documento
     */
    async insertDocument(
        databaseName: string,
        collectionName: string,
        document: Document
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        
        const result = await collection.insertOne({
            ...document,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return {
            success: true,
            insertedId: result.insertedId,
            document: { _id: result.insertedId, ...document }
        };
    }

    /**
     * Atualiza um documento existente
     */
    async updateDocument(
        databaseName: string,
        collectionName: string,
        documentId: string,
        update: Partial<Document>
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        
        const { ObjectId } = await import('mongodb');
        let filter: any;
        
        try {
            filter = { _id: new ObjectId(documentId) };
        } catch {
            filter = { _id: documentId };
        }
        
        const result = await collection.updateOne(filter, {
            $set: {
                ...update,
                updatedAt: new Date()
            }
        });
        
        return {
            success: result.modifiedCount > 0,
            modifiedCount: result.modifiedCount
        };
    }

    /**
     * Deleta um documento
     */
    async deleteDocument(
        databaseName: string,
        collectionName: string,
        documentId: string
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        
        const { ObjectId } = await import('mongodb');
        let filter: any;
        
        try {
            filter = { _id: new ObjectId(documentId) };
        } catch {
            filter = { _id: documentId };
        }
        
        const result = await collection.deleteOne(filter);
        
        return {
            success: result.deletedCount > 0,
            deletedCount: result.deletedCount
        };
    }

    /**
     * Executa uma agregação personalizada
     */
    async aggregate(
        databaseName: string,
        collectionName: string,
        pipeline: Document[]
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        
        const results = await collection.aggregate(pipeline).toArray();
        
        return {
            results,
            count: results.length
        };
    }

    /**
     * Busca em múltiplas coleções simultaneamente
     */
    async searchAcrossCollections(
        databaseName: string,
        searchTerm: string,
        collections?: string[]
    ) {
        const db = mongoDBService.getDatabase(databaseName);
        
        // Se não especificadas, buscar em todas as coleções
        if (!collections || collections.length === 0) {
            const allCollections = await db.listCollections().toArray();
            collections = allCollections.map(c => c.name);
        }
        
        const results: any = {};
        
        for (const collName of collections) {
            try {
                const collection = db.collection(collName);
                
                // Busca textual básica - tenta encontrar em qualquer campo string
                const docs = await collection
                    .find({
                        $or: [
                            { name: { $regex: searchTerm, $options: 'i' } },
                            { title: { $regex: searchTerm, $options: 'i' } },
                            { description: { $regex: searchTerm, $options: 'i' } },
                            { email: { $regex: searchTerm, $options: 'i' } }
                        ]
                    })
                    .limit(10)
                    .toArray();
                
                if (docs.length > 0) {
                    results[collName] = docs;
                }
            } catch (error) {
                // Se a busca falhar nessa coleção, continuar para a próxima
                console.log(`Aviso: não foi possível buscar em ${collName}`);
            }
        }
        
        return results;
    }

    /**
     * Obtém estatísticas gerais de um banco de dados
     */
    async getDatabaseStats(databaseName: string) {
        const db = mongoDBService.getDatabase(databaseName);
        const stats = await db.stats();
        
        const collections = await db.listCollections().toArray();
        const collectionStats = [];
        
        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            const collectionData = db.collection(coll.name);
            
            // Estimar tamanho baseado em amostra de documentos
            const sample = await collectionData.find().limit(10).toArray();
            const avgSize = sample.length > 0 
                ? JSON.stringify(sample).length / sample.length 
                : 0;
            
            collectionStats.push({
                name: coll.name,
                count,
                estimatedSize: Math.round(count * avgSize),
                avgObjSize: Math.round(avgSize),
                sampleDocs: sample.length
            });
        }
        
        return {
            database: databaseName,
            collections: stats.collections || 0,
            dataSize: stats.dataSize || 0,
            storageSize: stats.storageSize || 0,
            indexes: stats.indexes || 0,
            indexSize: stats.indexSize || 0,
            collectionDetails: collectionStats
        };
    }
}

export const universalService = new UniversalService();

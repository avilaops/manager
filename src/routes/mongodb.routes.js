const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const config = require('../config/config');
const { authenticate } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @route   GET /api/mongodb/databases
 * @desc    Listar todos os databases com detalhes
 * @access  Private
 */
router.get('/databases',
    authenticate,
    asyncHandler(async (req, res) => {
        const client = new MongoClient(config.mongodb.uri);
        await client.connect();
        
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        
        const dbDetails = await Promise.all(databases.databases.map(async (db) => {
            const database = client.db(db.name);
            const collections = await database.listCollections().toArray();
            
            const collectionStats = await Promise.all(collections.map(async (coll) => {
                const stats = await database.collection(coll.name).countDocuments();
                return {
                    name: coll.name,
                    documentCount: stats
                };
            }));
            
            return {
                name: db.name,
                sizeOnDisk: db.sizeOnDisk,
                collections: collectionStats
            };
        }));
        
        await client.close();
        
        res.json({ 
            success: true, 
            databases: dbDetails 
        });
    })
);

/**
 * @route   GET /api/mongodb/collection/:db/:collection
 * @desc    Obter documentos de uma collection
 * @access  Private
 */
router.get('/collection/:db/:collection',
    authenticate,
    validators.mongoCollection,
    validate,
    asyncHandler(async (req, res) => {
        const { db, collection } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const skip = parseInt(req.query.skip) || 0;

        const client = new MongoClient(config.mongodb.uri);
        await client.connect();
        
        const database = client.db(db);
        const coll = database.collection(collection);
        
        const documents = await coll.find({})
            .skip(skip)
            .limit(limit)
            .toArray();
        const count = await coll.countDocuments();
        
        await client.close();
        
        res.json({ 
            success: true, 
            documents, 
            totalCount: count,
            returnedCount: documents.length
        });
    })
);

module.exports = router;

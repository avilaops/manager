#!/usr/bin/env node

/**
 * Database Seeder
 * Seeds initial data for development/testing
 */

import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Configuration
const MONGO_URI = process.env.MONGO_ATLAS_URI || 'mongodb://localhost:27017';

// Colors
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
};

// Sample data
const sampleData = {
    // CRM Leads
    leads: [
        {
            nome: 'João Silva',
            email: 'joao.silva@example.com',
            telefone: '+55 11 98765-4321',
            empresa: 'Tech Solutions',
            fonte: 'website',
            status: 'novo',
            observacoes: 'Interessado em consultoria',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            nome: 'Maria Santos',
            email: 'maria.santos@example.com',
            telefone: '+55 11 98765-1234',
            empresa: 'Digital Corp',
            fonte: 'linkedin',
            status: 'contato',
            observacoes: 'Potencial cliente VIP',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            nome: 'Pedro Oliveira',
            email: 'pedro.oliveira@example.com',
            telefone: '+55 11 98765-5678',
            empresa: 'StartupXYZ',
            fonte: 'indicacao',
            status: 'qualificado',
            observacoes: 'Reunião agendada',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],
    
    // Sample contacts
    contacts: [
        {
            nome: 'Ana Costa',
            email: 'ana.costa@example.com',
            telefone: '+55 11 91234-5678',
            tipo: 'cliente',
            tags: ['vip', 'tech'],
            createdAt: new Date()
        },
        {
            nome: 'Carlos Mendes',
            email: 'carlos.mendes@example.com',
            telefone: '+55 11 91234-9876',
            tipo: 'parceiro',
            tags: ['marketing', 'design'],
            createdAt: new Date()
        }
    ],
    
    // Sample users (for testing auth)
    users: [
        {
            username: 'admin',
            email: 'admin@avila.inc',
            role: 'admin',
            active: true,
            createdAt: new Date()
        },
        {
            username: 'manager',
            email: 'manager@avila.inc',
            role: 'manager',
            active: true,
            createdAt: new Date()
        }
    ],
    
    // Sample config
    config: [
        {
            key: 'app_name',
            value: 'Avila Dashboard',
            description: 'Application name',
            updatedAt: new Date()
        },
        {
            key: 'maintenance_mode',
            value: false,
            description: 'Maintenance mode flag',
            updatedAt: new Date()
        },
        {
            key: 'max_upload_size',
            value: 10485760, // 10MB
            description: 'Maximum file upload size in bytes',
            updatedAt: new Date()
        }
    ]
};

// Seed function
async function seedDatabase() {
    console.log('\n🌱 Starting Database Seeding...\n');
    
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        log.success('Connected to MongoDB');
        
        // Get databases
        const crmDb = client.db('avila_crm');
        const dashboardDb = client.db('avila_dashboard');
        
        // Seed CRM database
        log.info('Seeding CRM database...');
        
        // Leads
        const leadsCollection = crmDb.collection('leads');
        await leadsCollection.deleteMany({}); // Clear existing
        await leadsCollection.insertMany(sampleData.leads);
        log.success(`Inserted ${sampleData.leads.length} leads`);
        
        // Contacts
        const contactsCollection = crmDb.collection('contacts');
        await contactsCollection.deleteMany({});
        await contactsCollection.insertMany(sampleData.contacts);
        log.success(`Inserted ${sampleData.contacts.length} contacts`);
        
        // Seed Dashboard database
        log.info('Seeding Dashboard database...');
        
        // Users
        const usersCollection = dashboardDb.collection('users');
        await usersCollection.deleteMany({});
        await usersCollection.insertMany(sampleData.users);
        log.success(`Inserted ${sampleData.users.length} users`);
        
        // Config
        const configCollection = dashboardDb.collection('config');
        await configCollection.deleteMany({});
        await configCollection.insertMany(sampleData.config);
        log.success(`Inserted ${sampleData.config.length} config items`);
        
        // Create indexes
        log.info('Creating indexes...');
        
        await leadsCollection.createIndex({ email: 1 }, { unique: true });
        await leadsCollection.createIndex({ status: 1 });
        await contactsCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        
        log.success('Indexes created');
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('  SEEDING SUMMARY');
        console.log('='.repeat(50));
        console.log(`  Leads: ${sampleData.leads.length}`);
        console.log(`  Contacts: ${sampleData.contacts.length}`);
        console.log(`  Users: ${sampleData.users.length}`);
        console.log(`  Config: ${sampleData.config.length}`);
        console.log('='.repeat(50) + '\n');
        
        log.success('Database seeding completed!');
        
    } catch (error) {
        log.error(`Seeding failed: ${error.message}`);
        throw error;
    } finally {
        await client.close();
    }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDatabase().catch(error => {
        log.error(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

export default seedDatabase;

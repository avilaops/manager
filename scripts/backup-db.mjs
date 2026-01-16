#!/usr/bin/env node

/**
 * MongoDB Backup Script
 * Automated backup of all MongoDB databases
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MONGO_URI = process.env.MONGO_ATLAS_URI || 'mongodb://localhost:27017';
const BACKUP_DIR = path.join(__dirname, '../backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Colors for console
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

// Create backup directory if not exists
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        log.success(`Created backup directory: ${BACKUP_DIR}`);
    }
}

// Get database list
async function getDatabases() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        log.success('Connected to MongoDB');
        
        const adminDb = client.db().admin();
        const { databases } = await adminDb.listDatabases();
        
        // Filter out system databases
        const userDatabases = databases
            .filter(db => !['admin', 'local', 'config'].includes(db.name))
            .map(db => db.name);
        
        return userDatabases;
    } finally {
        await client.close();
    }
}

// Backup single database
async function backupDatabase(dbName) {
    const backupPath = path.join(BACKUP_DIR, `${dbName}_${TIMESTAMP}`);
    
    log.info(`Backing up database: ${dbName}...`);
    
    try {
        // Using mongodump
        const command = `mongodump --uri="${MONGO_URI}" --db=${dbName} --out="${backupPath}"`;
        
        await execAsync(command);
        
        log.success(`Backed up ${dbName} to ${backupPath}`);
        
        // Compress backup
        await compressBackup(backupPath);
        
        return true;
    } catch (error) {
        log.error(`Failed to backup ${dbName}: ${error.message}`);
        return false;
    }
}

// Compress backup directory
async function compressBackup(backupPath) {
    try {
        const zipPath = `${backupPath}.zip`;
        
        // Using tar on Unix/Linux or zip on Windows
        const isWindows = process.platform === 'win32';
        const command = isWindows
            ? `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${zipPath}"`
            : `tar -czf ${zipPath} -C ${BACKUP_DIR} ${path.basename(backupPath)}`;
        
        await execAsync(command);
        
        // Remove uncompressed directory
        fs.rmSync(backupPath, { recursive: true, force: true });
        
        log.success(`Compressed backup to ${zipPath}`);
    } catch (error) {
        log.warn(`Failed to compress backup: ${error.message}`);
    }
}

// Clean old backups (keep last N backups)
async function cleanOldBackups(keepLast = 7) {
    log.info('Cleaning old backups...');
    
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.zip'))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);
        
        if (files.length > keepLast) {
            const toDelete = files.slice(keepLast);
            
            for (const file of toDelete) {
                fs.unlinkSync(file.path);
                log.info(`Deleted old backup: ${file.name}`);
            }
            
            log.success(`Cleaned ${toDelete.length} old backups`);
        } else {
            log.info('No old backups to clean');
        }
    } catch (error) {
        log.error(`Failed to clean old backups: ${error.message}`);
    }
}

// Generate backup report
function generateReport(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    
    console.log('\n' + '='.repeat(50));
    console.log('  BACKUP REPORT');
    console.log('='.repeat(50));
    console.log(`  Date: ${new Date().toLocaleString()}`);
    console.log(`  Total databases: ${total}`);
    log.success(`  Successful: ${successful}`);
    if (failed > 0) log.error(`  Failed: ${failed}`);
    console.log('='.repeat(50) + '\n');
}

// Main backup function
async function runBackup() {
    console.log('\n🚀 Starting MongoDB Backup...\n');
    
    try {
        // Ensure backup directory exists
        ensureBackupDir();
        
        // Get list of databases
        const databases = await getDatabases();
        log.info(`Found ${databases.length} databases to backup`);
        
        if (databases.length === 0) {
            log.warn('No databases found to backup');
            return;
        }
        
        // Backup each database
        const results = [];
        for (const dbName of databases) {
            const success = await backupDatabase(dbName);
            results.push({ dbName, success });
        }
        
        // Clean old backups
        await cleanOldBackups(7);
        
        // Generate report
        generateReport(results);
        
        log.success('Backup completed!');
        
    } catch (error) {
        log.error(`Backup failed: ${error.message}`);
        process.exit(1);
    }
}

// Run backup if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runBackup().catch(error => {
        log.error(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

export default runBackup;

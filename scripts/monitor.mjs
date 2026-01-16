#!/usr/bin/env node

/**
 * System Monitoring Script
 * Monitors application health and sends alerts
 */

import axios from 'axios';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGO_ATLAS_URI || 'mongodb://localhost:27017';
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'admin@avila.inc';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 60000; // 1 minute

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

// Email transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Store state
const state = {
    lastStatus: {
        app: 'unknown',
        mongodb: 'unknown'
    },
    failureCount: {
        app: 0,
        mongodb: 0
    }
};

// Check application health
async function checkAppHealth() {
    try {
        const response = await axios.get(`${APP_URL}/health`, {
            timeout: 5000,
            validateStatus: () => true
        });
        
        if (response.status === 200 && response.data.status === 'OK') {
            return { healthy: true, status: response.data };
        } else {
            return { healthy: false, error: `Status: ${response.status}` };
        }
    } catch (error) {
        return { healthy: false, error: error.message };
    }
}

// Check MongoDB health
async function checkMongoDBHealth() {
    const client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    });
    
    try {
        await client.connect();
        await client.db().admin().ping();
        return { healthy: true };
    } catch (error) {
        return { healthy: false, error: error.message };
    } finally {
        await client.close();
    }
}

// Send alert email
async function sendAlert(subject, message) {
    if (!process.env.EMAIL_USER) {
        log.warn('Email not configured, skipping alert');
        return;
    }
    
    try {
        await emailTransporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: ALERT_EMAIL,
            subject: `🚨 ALERT: ${subject}`,
            html: `
                <h2>System Alert</h2>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Application:</strong> Avila Dashboard</p>
                <hr>
                <p>${message}</p>
                <hr>
                <p><em>This is an automated alert from the monitoring system.</em></p>
            `
        });
        
        log.success('Alert email sent');
    } catch (error) {
        log.error(`Failed to send alert: ${error.message}`);
    }
}

// Handle status change
async function handleStatusChange(service, oldStatus, newStatus, error = null) {
    log.warn(`${service} status changed: ${oldStatus} → ${newStatus}`);
    
    if (newStatus === 'down') {
        state.failureCount[service]++;
        
        // Send alert after 3 consecutive failures
        if (state.failureCount[service] >= 3) {
            const subject = `${service} is DOWN`;
            const message = `
                <p><strong>${service}</strong> has been down for ${state.failureCount[service]} consecutive checks.</p>
                ${error ? `<p><strong>Error:</strong> ${error}</p>` : ''}
                <p>Please investigate immediately.</p>
            `;
            
            await sendAlert(subject, message);
            
            // Reset counter after sending alert to avoid spam
            state.failureCount[service] = 0;
        }
    } else if (newStatus === 'up' && oldStatus === 'down') {
        // Service recovered
        state.failureCount[service] = 0;
        
        const subject = `${service} is UP (Recovered)`;
        const message = `
            <p><strong>${service}</strong> has recovered and is now operational.</p>
        `;
        
        await sendAlert(subject, message);
    }
}

// Run health checks
async function runHealthChecks() {
    const timestamp = new Date().toLocaleString();
    
    log.info(`Running health checks... [${timestamp}]`);
    
    // Check application
    const appHealth = await checkAppHealth();
    const appStatus = appHealth.healthy ? 'up' : 'down';
    
    if (appHealth.healthy) {
        log.success('Application: HEALTHY');
    } else {
        log.error(`Application: UNHEALTHY - ${appHealth.error}`);
    }
    
    // Check MongoDB
    const mongoHealth = await checkMongoDBHealth();
    const mongoStatus = mongoHealth.healthy ? 'up' : 'down';
    
    if (mongoHealth.healthy) {
        log.success('MongoDB: HEALTHY');
    } else {
        log.error(`MongoDB: UNHEALTHY - ${mongoHealth.error}`);
    }
    
    // Handle status changes
    if (state.lastStatus.app !== appStatus) {
        await handleStatusChange('Application', state.lastStatus.app, appStatus, appHealth.error);
        state.lastStatus.app = appStatus;
    }
    
    if (state.lastStatus.mongodb !== mongoStatus) {
        await handleStatusChange('MongoDB', state.lastStatus.mongodb, mongoStatus, mongoHealth.error);
        state.lastStatus.mongodb = mongoStatus;
    }
    
    console.log(''); // Empty line for readability
}

// Start monitoring
async function startMonitoring() {
    console.log('\n🔍 Starting System Monitoring...\n');
    log.info(`Application URL: ${APP_URL}`);
    log.info(`Check interval: ${CHECK_INTERVAL / 1000}s`);
    log.info(`Alert email: ${ALERT_EMAIL}`);
    console.log('');
    
    // Initial check
    await runHealthChecks();
    
    // Periodic checks
    setInterval(async () => {
        await runHealthChecks();
    }, CHECK_INTERVAL);
    
    log.success('Monitoring started!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log.info('\nShutting down monitoring...');
    process.exit(0);
});

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startMonitoring().catch(error => {
        log.error(`Monitoring failed: ${error.message}`);
        process.exit(1);
    });
}

export default startMonitoring;

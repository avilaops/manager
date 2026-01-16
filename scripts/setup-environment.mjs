#!/usr/bin/env node

/**
 * Script de Configuração Automática - GitHub e Render
 * 
 * Este script ajuda a configurar todo o ambiente de desenvolvimento
 * e produção para o Avila Dashboard.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para perguntar e aguardar resposta
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Cores para o terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Verificar se arquivo .env existe
const checkEnvFile = () => {
    const envPath = path.join(process.cwd(), '.env');
    return fs.existsSync(envPath);
};

// Criar arquivo .env a partir do .env.example
const createEnvFile = () => {
    const examplePath = path.join(process.cwd(), '.env.example');
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(examplePath)) {
        log.error('Arquivo .env.example não encontrado!');
        return false;
    }
    
    fs.copyFileSync(examplePath, envPath);
    log.success('Arquivo .env criado com sucesso!');
    return true;
};

// Atualizar variável no .env
const updateEnvVariable = (key, value) => {
    const envPath = path.join(process.cwd(), '.env');
    let content = fs.readFileSync(envPath, 'utf8');
    
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
    } else {
        content += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, content);
};

// Configurar GitHub
const setupGitHub = async () => {
    log.header('🔧 Configuração do GitHub');
    
    log.info('Para obter seu token do GitHub:');
    console.log('1. Acesse: https://github.com/settings/tokens');
    console.log('2. Clique em "Generate new token (classic)"');
    console.log('3. Selecione os scopes: repo, workflow, user, gist');
    console.log('4. Gere e copie o token\n');
    
    const username = await question('Digite seu username do GitHub: ');
    const token = await question('Cole seu token do GitHub (ghp_...): ');
    
    if (!username || !token) {
        log.error('Username ou token não fornecidos!');
        return false;
    }
    
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        log.warning('O token não parece estar no formato correto. Continuar mesmo assim? (s/n)');
        const confirm = await question('> ');
        if (confirm.toLowerCase() !== 's') return false;
    }
    
    updateEnvVariable('GITHUB_USERNAME', username);
    updateEnvVariable('GITHUB_TOKEN', token);
    
    log.success('Configuração do GitHub salva!');
    return true;
};

// Configurar MongoDB
const setupMongoDB = async () => {
    log.header('🗄️  Configuração do MongoDB Atlas');
    
    log.info('Para obter sua connection string:');
    console.log('1. Acesse: https://cloud.mongodb.com');
    console.log('2. Vá em Database → Connect → Drivers');
    console.log('3. Copie a connection string\n');
    
    const mongoUri = await question('Cole sua MongoDB URI: ');
    
    if (!mongoUri || !mongoUri.includes('mongodb')) {
        log.error('URI do MongoDB inválida!');
        return false;
    }
    
    updateEnvVariable('MONGO_ATLAS_URI', mongoUri);
    log.success('Configuração do MongoDB salva!');
    return true;
};

// Configurar OpenAI
const setupOpenAI = async () => {
    log.header('🤖 Configuração do OpenAI');
    
    const hasKey = await question('Você tem uma API key da OpenAI? (s/n): ');
    
    if (hasKey.toLowerCase() === 's') {
        log.info('Para obter sua API key:');
        console.log('1. Acesse: https://platform.openai.com/api-keys');
        console.log('2. Clique em "Create new secret key"');
        console.log('3. Copie a key\n');
        
        const apiKey = await question('Cole sua OpenAI API Key: ');
        
        if (apiKey && apiKey.startsWith('sk-')) {
            updateEnvVariable('OPENAI_API_KEY', apiKey);
            log.success('Configuração do OpenAI salva!');
            return true;
        } else {
            log.warning('API key não parece estar no formato correto. Pulando...');
        }
    } else {
        log.info('Pulando configuração do OpenAI.');
    }
    
    return false;
};

// Gerar secrets fortes
const generateSecrets = () => {
    log.header('🔐 Gerando Secrets');
    
    const generateSecret = () => {
        return Array.from({ length: 32 }, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    };
    
    const jwtSecret = generateSecret();
    const sessionSecret = generateSecret();
    
    updateEnvVariable('JWT_SECRET', jwtSecret);
    updateEnvVariable('SESSION_SECRET', sessionSecret);
    
    log.success('Secrets gerados e salvos!');
    log.info(`JWT_SECRET: ${jwtSecret.substring(0, 16)}...`);
    log.info(`SESSION_SECRET: ${sessionSecret.substring(0, 16)}...`);
};

// Verificar instalação de dependências
const checkDependencies = async () => {
    log.header('📦 Verificando Dependências');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        log.error('package.json não encontrado!');
        return false;
    }
    
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
        log.warning('Dependências não instaladas!');
        const install = await question('Deseja instalar agora? (s/n): ');
        
        if (install.toLowerCase() === 's') {
            log.info('Instalando dependências... (isso pode demorar)');
            
            const { exec } = await import('child_process');
            return new Promise((resolve) => {
                exec('npm install', (error, stdout, stderr) => {
                    if (error) {
                        log.error('Erro ao instalar dependências!');
                        console.error(stderr);
                        resolve(false);
                    } else {
                        log.success('Dependências instaladas com sucesso!');
                        resolve(true);
                    }
                });
            });
        }
    } else {
        log.success('Dependências já instaladas!');
        return true;
    }
    
    return false;
};

// Exibir resumo
const showSummary = () => {
    log.header('📋 Resumo da Configuração');
    
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    
    const checkVar = (key) => {
        const regex = new RegExp(`^${key}=(.+)$`, 'm');
        const match = content.match(regex);
        return match && match[1] && !match[1].includes('seu_') && !match[1].includes('your_');
    };
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      Status das Configurações         ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    const configs = [
        { name: 'GitHub', key: 'GITHUB_TOKEN' },
        { name: 'MongoDB', key: 'MONGO_ATLAS_URI' },
        { name: 'OpenAI', key: 'OPENAI_API_KEY' },
        { name: 'JWT Secret', key: 'JWT_SECRET' },
        { name: 'Stripe', key: 'STRIPE_API_TOKEN' },
        { name: 'LinkedIn', key: 'LINKEDIN_ACCESS_TOKEN' }
    ];
    
    configs.forEach(({ name, key }) => {
        const status = checkVar(key) ? 
            `${colors.green}✓ Configurado${colors.reset}` : 
            `${colors.red}✗ Não configurado${colors.reset}`;
        console.log(`${name.padEnd(15)} ${status}`);
    });
    
    console.log('\n');
};

// Próximos passos
const showNextSteps = () => {
    log.header('🚀 Próximos Passos');
    
    console.log('1. Revisar o arquivo .env e preencher variáveis faltantes');
    console.log('2. Ler a documentação:');
    console.log('   - docs/SETUP-GITHUB.md');
    console.log('   - docs/SETUP-RENDER.md');
    console.log('3. Iniciar o servidor em desenvolvimento:');
    console.log(`   ${colors.cyan}npm run dev${colors.reset}`);
    console.log('4. Fazer deploy no Render:');
    console.log('   - Criar conta em https://render.com');
    console.log('   - Conectar repositório GitHub');
    console.log('   - Adicionar variáveis de ambiente');
    console.log('5. Testar health check:');
    console.log(`   ${colors.cyan}curl http://localhost:3000/health${colors.reset}`);
    console.log('\n');
};

// Função principal
const main = async () => {
    console.clear();
    
    console.log(`
${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         Configuração Automática - Avila Dashboard        ║
║                      Versão 2.1.0                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}
    `);
    
    try {
        // Verificar .env
        if (!checkEnvFile()) {
            log.warning('Arquivo .env não encontrado!');
            const create = await question('Deseja criar a partir do .env.example? (s/n): ');
            
            if (create.toLowerCase() === 's') {
                createEnvFile();
            } else {
                log.error('Não é possível continuar sem o arquivo .env');
                rl.close();
                return;
            }
        } else {
            log.success('Arquivo .env encontrado!');
        }
        
        // Menu de configuração
        const setupGit = await question('\nConfigurar GitHub? (s/n): ');
        if (setupGit.toLowerCase() === 's') {
            await setupGitHub();
        }
        
        const setupMongo = await question('\nConfigurar MongoDB? (s/n): ');
        if (setupMongo.toLowerCase() === 's') {
            await setupMongoDB();
        }
        
        const setupAI = await question('\nConfigurar OpenAI? (s/n): ');
        if (setupAI.toLowerCase() === 's') {
            await setupOpenAI();
        }
        
        // Gerar secrets
        log.info('\nGerando secrets de segurança...');
        generateSecrets();
        
        // Verificar dependências
        await checkDependencies();
        
        // Mostrar resumo
        showSummary();
        
        // Próximos passos
        showNextSteps();
        
        log.success('Configuração concluída! 🎉');
        
    } catch (error) {
        log.error('Erro durante a configuração:');
        console.error(error);
    } finally {
        rl.close();
    }
};

// Executar
main();

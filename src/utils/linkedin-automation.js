/**
 * 🚀 LINKEDIN AUTOMATION SYSTEM
 * Sistema completo de automação para LinkedIn
 * 
 * Features:
 * - Auto-posting de conquistas
 * - Engagement automático
 * - Follow-up inteligente
 * - Análise de perfil
 * - Networking estratégico
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class LinkedInAutomation {
    constructor() {
        this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
        this.clientId = process.env.LINKEDIN_CLIENT_ID;
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        this.profileUrn = process.env.LINKEDIN_PROFILE_URN;
        
        this.baseUrl = 'https://api.linkedin.com/v2';
        this.baseHeaders = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        };
    }

    /**
     * 1️⃣ AUTO-POSTING ESTRATÉGICO
     */
    
    async createPost(content, options = {}) {
        const {
            visibility = 'PUBLIC', // PUBLIC, CONNECTIONS, LOGGED_IN
            media = null,
            articleLink = null,
            hashtags = []
        } = options;
        
        // Adicionar hashtags ao conteúdo
        const fullContent = hashtags.length > 0 
            ? `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
            : content;
        
        const payload = {
            author: this.profileUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: fullContent
                    },
                    shareMediaCategory: articleLink ? 'ARTICLE' : (media ? 'IMAGE' : 'NONE')
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': visibility
            }
        };
        
        // Adicionar link de artigo se fornecido
        if (articleLink) {
            payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
                status: 'READY',
                originalUrl: articleLink
            }];
        }
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/ugcPosts`,
                payload,
                { headers: this.baseHeaders }
            );
            
            console.log('✅ Post criado com sucesso!');
            console.log('ID:', response.data.id);
            
            // Salvar histórico
            await this.savePostHistory(response.data.id, fullContent);
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao criar post:', error.response?.data || error.message);
            throw error;
        }
    }
    
    /**
     * Templates de posts pré-configurados
     */
    
    async postProjectShowcase(projectData) {
        const { name, description, tech, metrics, githubUrl } = projectData;
        
        const content = `🚀 Acabei de finalizar: ${name}!

${description}

🛠️ Stack Técnico:
${tech.map(t => `• ${t}`).join('\n')}

📊 Resultados:
${metrics.map(m => `• ${m}`).join('\n')}

${githubUrl ? `\n🔗 Código: ${githubUrl}` : ''}

Feedback e sugestões são sempre bem-vindos! 💬`;
        
        return await this.createPost(content, {
            articleLink: githubUrl,
            hashtags: ['Rust', 'SoftwareEngineering', 'OpenSource', 'Dev', 'Tech']
        });
    }
    
    async postBenchmarkResults(benchmarkData) {
        const { project, metric, improvement, comparison } = benchmarkData;
        
        const content = `⚡ Performance Update: ${project}

${metric}: ${improvement}x mais rápido!

${comparison ? `vs ${comparison}` : ''}

Otimizações implementadas com Rust demonstram o poder de código nativo otimizado.

Interessado nos detalhes técnicos? DM aberta! 📬`;
        
        return await this.createPost(content, {
            hashtags: ['Performance', 'Rust', 'Optimization', 'Engineering']
        });
    }
    
    async postLearning(learningData) {
        const { topic, insight, application } = learningData;
        
        const content = `💡 TIL (Today I Learned): ${topic}

${insight}

Aplicação prática:
${application}

Sempre aprendendo, sempre evoluindo! 🚀`;
        
        return await this.createPost(content, {
            hashtags: ['Learning', 'Development', 'Tech', 'Growth']
        });
    }
    
    async postJobApplication() {
        const content = `🎯 Procurando por novos desafios!

Desenvolvedor Rust especializado em:
• Sistemas de alta performance
• Automotive/Embedded Systems
• AI/ML Integration
• Zero-dependency architectures

Recentemente criei sistema de diagnóstico automotivo:
• 20M+ mensagens/segundo
• IA preditiva (85% precisão)
• 7x mais rápido que soluções atuais

Disponível para oportunidades remotas ou híbridas.

📧 DM aberta para conversas!`;
        
        return await this.createPost(content, {
            hashtags: ['OpenToWork', 'Rust', 'Automotive', 'Engineering', 'BMW']
        });
    }
    
    /**
     * 2️⃣ ENGAGEMENT AUTOMÁTICO
     */
    
    async likePost(postUrn) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/socialActions/${postUrn}/likes`,
                {
                    actor: this.profileUrn
                },
                { headers: this.baseHeaders }
            );
            
            console.log('✅ Post curtido!');
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao curtir post:', error.response?.data || error.message);
            throw error;
        }
    }
    
    async commentOnPost(postUrn, comment) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/socialActions/${postUrn}/comments`,
                {
                    actor: this.profileUrn,
                    message: {
                        text: comment
                    }
                },
                { headers: this.baseHeaders }
            );
            
            console.log('✅ Comentário publicado!');
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao comentar:', error.response?.data || error.message);
            throw error;
        }
    }
    
    /**
     * 3️⃣ NETWORKING ESTRATÉGICO
     */
    
    async sendConnectionRequest(personUrn, message = '') {
        const payload = {
            invitee: {
                'com.linkedin.voyager.growth.invitation.InviteeProfile': {
                    profileId: personUrn
                }
            },
            message: message || 'Olá! Adoraria conectar com você e trocar experiências sobre tecnologia.'
        };
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/invitations`,
                payload,
                { headers: this.baseHeaders }
            );
            
            console.log('✅ Convite enviado!');
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar convite:', error.response?.data || error.message);
            throw error;
        }
    }
    
    async sendMessage(conversationId, message) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/messaging/conversations/${conversationId}/messages`,
                {
                    body: message
                },
                { headers: this.baseHeaders }
            );
            
            console.log('✅ Mensagem enviada!');
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
            throw error;
        }
    }
    
    /**
     * 4️⃣ ANALYTICS & INSIGHTS
     */
    
    async getProfileViews() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${this.profileUrn}`,
                { headers: this.baseHeaders }
            );
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter visualizações:', error.response?.data || error.message);
            return null;
        }
    }
    
    async getPostAnalytics(postUrn) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/socialMetadata/${postUrn}`,
                { headers: this.baseHeaders }
            );
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter analytics:', error.response?.data || error.message);
            return null;
        }
    }
    
    /**
     * 5️⃣ CAMPANHAS AUTOMATIZADAS
     */
    
    async runWeeklyCampaign() {
        console.log('🚀 Iniciando campanha semanal...\n');
        
        const campaigns = [
            {
                day: 1, // Segunda
                action: async () => {
                    console.log('📅 Segunda: Post de projeto');
                    return await this.postProjectShowcase({
                        name: 'Arxis Automotive Solutions',
                        description: 'Sistema de diagnóstico BMW com IA preditiva',
                        tech: ['Rust', 'Electron', 'React', 'TypeScript'],
                        metrics: ['20M+ msgs/s', '85% precisão', '7x mais rápido'],
                        githubUrl: 'https://github.com/avilaops/arxis-core'
                    });
                }
            },
            {
                day: 3, // Quarta
                action: async () => {
                    console.log('📅 Quarta: Post de aprendizado');
                    return await this.postLearning({
                        topic: 'Performance em Rust',
                        insight: 'SIMD e paralelização podem melhorar throughput em 400x',
                        application: 'Parser CAN processando 20M msgs/segundo'
                    });
                }
            },
            {
                day: 5, // Sexta
                action: async () => {
                    console.log('📅 Sexta: Analytics e engajamento');
                    const views = await this.getProfileViews();
                    console.log('Visualizações esta semana:', views);
                    return views;
                }
            }
        ];
        
        const today = new Date().getDay();
        const todayCampaign = campaigns.find(c => c.day === today);
        
        if (todayCampaign) {
            return await todayCampaign.action();
        } else {
            console.log('ℹ️ Nenhuma campanha programada para hoje');
            return null;
        }
    }
    
    /**
     * 6️⃣ TEMPLATES DE MENSAGENS
     */
    
    getRecruitersTemplate(recruiterName, company) {
        return `Olá ${recruiterName}!

Vi que você está recrutando para ${company} e fiquei muito interessado!

Recentemente desenvolvi um sistema de diagnóstico automotivo que demonstra minhas capacidades:
• 20M+ mensagens/segundo (Rust nativo)
• IA preditiva com 85% de precisão
• 7x mais rápido que soluções atuais

Tenho 163 pacotes Rust proprietários e experiência comprovada em sistemas de alta performance.

Teria 15 minutos para uma conversa rápida? Posso mostrar uma demo funcional!

Melhor horário para você?

Abraços,
Nicolas Ávila`;
    }
    
    getTechLeadTemplate(techLeadName, topic) {
        return `Olá ${techLeadName}!

Notei seu trabalho em ${topic} e achei muito interessante.

Estou trabalhando em algo similar: sistema de diagnóstico com parsers CAN otimizados.

Gostaria muito de trocar ideias sobre:
• Otimizações de performance
• Arquitetura de sistemas críticos
• Best practices em Rust

Você teria interesse em uma conversa técnica?

Abraços,
Nicolas`;
    }
    
    getNetworkingTemplate(personName, commonInterest) {
        return `Olá ${personName}!

Vi que você também tem interesse em ${commonInterest}.

Estou sempre buscando conectar com pessoas da área para trocar experiências e aprender.

Vamos nos conectar?

Abraços,
Nicolas Ávila`;
    }
    
    /**
     * 7️⃣ UTILITÁRIOS
     */
    
    async savePostHistory(postId, content) {
        const historyDir = path.join(__dirname, 'linkedin-history');
        await fs.mkdir(historyDir, { recursive: true });
        
        const historyFile = path.join(historyDir, 'posts.json');
        
        let history = [];
        try {
            const data = await fs.readFile(historyFile, 'utf-8');
            history = JSON.parse(data);
        } catch (error) {
            // Arquivo não existe ainda
        }
        
        history.push({
            id: postId,
            content,
            timestamp: new Date().toISOString(),
            analytics: {
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0
            }
        });
        
        await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    }
    
    async generateWeeklyReport() {
        const historyFile = path.join(__dirname, 'linkedin-history', 'posts.json');
        
        try {
            const data = await fs.readFile(historyFile, 'utf-8');
            const history = JSON.parse(data);
            
            const lastWeek = history.filter(post => {
                const postDate = new Date(post.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return postDate > weekAgo;
            });
            
            console.log('\n📊 RELATÓRIO SEMANAL LINKEDIN\n');
            console.log(`Posts publicados: ${lastWeek.length}`);
            console.log(`Total de views: ${lastWeek.reduce((sum, p) => sum + p.analytics.views, 0)}`);
            console.log(`Total de likes: ${lastWeek.reduce((sum, p) => sum + p.analytics.likes, 0)}`);
            console.log(`Total de comentários: ${lastWeek.reduce((sum, p) => sum + p.analytics.comments, 0)}`);
            
            return lastWeek;
        } catch (error) {
            console.log('ℹ️ Nenhum histórico encontrado ainda');
            return [];
        }
    }
}

module.exports = LinkedInAutomation;

// CLI para testes rápidos
if (require.main === module) {
    const linkedin = new LinkedInAutomation();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'post-project':
            linkedin.postProjectShowcase({
                name: 'Arxis Automotive',
                description: 'Sistema de diagnóstico BMW revolucionário',
                tech: ['Rust', 'AI', 'Performance'],
                metrics: ['20M msgs/s', '85% precisão'],
                githubUrl: 'https://github.com/avilaops/arxis-core'
            });
            break;
            
        case 'post-job':
            linkedin.postJobApplication();
            break;
            
        case 'campaign':
            linkedin.runWeeklyCampaign();
            break;
            
        case 'report':
            linkedin.generateWeeklyReport();
            break;
            
        default:
            console.log(`
🚀 LinkedIn Automation System

Comandos disponíveis:
  node linkedin-automation.js post-project  - Postar projeto
  node linkedin-automation.js post-job      - Postar procura de emprego
  node linkedin-automation.js campaign      - Executar campanha do dia
  node linkedin-automation.js report        - Gerar relatório semanal
            `);
    }
}

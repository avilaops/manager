// Teste rápido de conexão com MongoDB e APIs
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

console.log('🧪 TESTANDO INTEGRACOES DO DASHBOARD\n');

async function testarIntegracoes() {
    const testes = [
        { nome: 'MongoDB Atlas', url: `${API_BASE}/mongodb/databases` },
        { nome: 'GitHub', url: `${API_BASE}/github/repos` },
        { nome: 'Railway', url: `${API_BASE}/railway/projects` },
        { nome: 'Stripe', url: `${API_BASE}/stripe/balance` },
        { nome: 'Sentry', url: `${API_BASE}/sentry/issues` },
        { nome: 'Porkbun DNS', url: `${API_BASE}/dns/domains` },
        { nome: 'OpenAI', url: `${API_BASE}/openai/usage` }
    ];

    let sucesso = 0;
    let falhas = 0;

    for (const teste of testes) {
        try {
            console.log(`Testando ${teste.nome}...`);
            const response = await axios.get(teste.url, { timeout: 10000 });
            
            if (response.data.success) {
                console.log(`✅ ${teste.nome} - OK`);
                sucesso++;
            } else {
                console.log(`❌ ${teste.nome} - Erro: ${response.data.error}`);
                falhas++;
            }
        } catch (error) {
            console.log(`❌ ${teste.nome} - Erro: ${error.message}`);
            falhas++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`RESULTADOS: ${sucesso} sucessos, ${falhas} falhas`);
    console.log('='.repeat(50));

    if (sucesso === testes.length) {
        console.log('\n🎉 TODAS AS INTEGRACOES ESTAO FUNCIONANDO!');
    } else if (sucesso > 0) {
        console.log('\n⚠️  Algumas integracoes falharam, mas o sistema esta parcialmente funcional');
    } else {
        console.log('\n❌ Nenhuma integracao funcionou. Verifique se o servidor esta rodando!');
    }
}

// Aguarda 2 segundos para garantir que o servidor esteja pronto
setTimeout(async () => {
    try {
        await testarIntegracoes();
    } catch (error) {
        console.error('Erro ao executar testes:', error.message);
    }
    process.exit(0);
}, 2000);

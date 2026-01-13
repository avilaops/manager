import fetch from 'node-fetch';

async function testCampanhasAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/campanhas');
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testCampanhasAPI();
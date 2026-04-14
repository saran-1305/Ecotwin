
import axios from 'axios';

async function testAnalysis() {
    try {
        console.log('Testing Analysis API...');

        // Test with a description
        const payload = {
            description: "A 100% organic cotton t-shirt made in a fair trade factory. The company uses renewable energy for production.",
            company: "EcoBrand"
        };

        console.log('Sending payload:', payload);

        const response = await axios.post('http://localhost:5000/api/analyze', payload);

        console.log('Response status:', response.status);
        console.log('Analysis Result:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error('Error testing analysis API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testAnalysis();

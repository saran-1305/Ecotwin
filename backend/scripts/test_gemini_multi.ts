
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp"
];

async function testModels() {
    console.log('Testing Multiple Gemini Models...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} responded: ${response.text().substring(0, 20)}...`);
            return; // Exit on first success
        } catch (error: any) {
            console.log(`FAILED: ${modelName} - ${error.message}`);
            if (error.response) console.log(JSON.stringify(error.response, null, 2));
        }
    }
    console.log('All models failed.');
}

testModels();

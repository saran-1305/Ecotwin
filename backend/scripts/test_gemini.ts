
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key present:', !!process.env.GEMINI_API_KEY);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Explain how AI works in one sentence.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini Response:', text);

    } catch (error: any) {
        console.error('Error testing Gemini:', error);
    }
}

testGemini();

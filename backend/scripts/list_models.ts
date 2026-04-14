
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('No API Key found');
            return;
        }

        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (response.data && response.data.models) {
            response.data.models.forEach((m: any) => console.log(m.name));
        } else {
            console.log("No models found or unexpected structure:", response.data);
        }

    } catch (error: any) {
        console.error('Error listing models:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

listModels();

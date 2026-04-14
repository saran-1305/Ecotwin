
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
    private model: any;

    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async analyzeProduct(description: string, companyInfo?: string): Promise<any> {
        try {
            const prompt = `
                Analyze the following product description and company information (if provided) for sustainability.
                
                Product Description: "${description}"
                Company Information: "${companyInfo || 'Not provided'}"

                Please provide a JSON response with the following fields:
                1. "overallScore": A score from 0 to 100 based on environmental impact.
                2. "breakdown": An object with "carbonImpact", "circularity", "ethics" (each 0-100).
                3. "sdgs": Array of objects { "id": number, "title": string, "why": string } mapping relevant UN SDGs.
                4. "reasons": Array of 3 key reasons for the score.
                5. "improvements": Array of 3 areas for improvement.
                6. "greenwashingAttempts": Array of strings flagging any potential greenwashing.
                7. "confidence": A number between 0 and 1 indicating confidence in the analysis.

                Do not include markdown code blocks in your response, just the raw JSON string.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potentially wrapped JSON (e.g. ```json ... ```)
            const jsonStr = text.replace(/```json|```/g, '').trim();

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Error analyzing product with AI:', error);
            // Return valid mock data on error so frontend doesn't break
            return {
                overallScore: 50,
                breakdown: { carbonImpact: 50, circularity: 50, ethics: 50 },
                sdgs: [{ id: 12, title: "Responsible Consumption", why: "Default mapping due to analysis error." }],
                reasons: ["Analysis service unavailable.", "Using default estimation.", "Please retry later."],
                improvements: ["Retry analysis.", "Check product URL."],
                greenwashingAttempts: [],
                confidence: 0
            };
        }
    }
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    analyzeProduct(description, companyInfo) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                // Clean up potentially wrapped JSON (e.g. ```json ... ```)
                const jsonStr = text.replace(/```json|```/g, '').trim();
                return JSON.parse(jsonStr);
            }
            catch (error) {
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
        });
    }
}
exports.AIService = AIService;

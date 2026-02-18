
import { GoogleGenAI, Type } from "@google/genai";
import { ProductAnalysis, UserPreferences } from "../types";


let genAIInstance: any = null;

const getGenAI = () => {
  if (!genAIInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key is missing. AI features will not work.");
      // Initialize with dummy key to prevent crash, calls will fail later if used
      genAIInstance = new GoogleGenAI({ apiKey: "missing-key" });
    } else {
      genAIInstance = new GoogleGenAI({ apiKey });
    }
  }
  return genAIInstance;
};


export const analyzeProduct = async (url: string, preferences: UserPreferences): Promise<ProductAnalysis> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Analyze this product URL for sustainability: ${url}.
    If you cannot access the exact real-time data, simulate a realistic assessment based on common features of products from that domain/brand.
    Calculate:
    1. General Sustainability Score (0-100) based on material, brand, lifecycle, and carbon footprint.
    2. Specific scores for: Material Sustainability, Packaging, Brand Sustainability, Lifecycle Impact.
    3. Estimated Carbon Impact (kg CO2 equivalent).
    4. Mapping to SDG 9, 12, and 13.
    5. A list of pros and cons regarding its eco-friendliness.
    6. Three sustainable alternatives.

    User Preferences weights (1-5):
    Plastic avoidance: ${preferences.avoidPlastic}
    Local sourcing: ${preferences.preferLocal}
    Ethical brands: ${preferences.ethicalBrands}
    Low carbon: ${preferences.lowCarbon}
    Recyclability: ${preferences.recyclable}

    Provide a "Personalized Score" by adjusting the weight of the breakdown categories based on these preferences.
  `;

  const response = await getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          category: { type: Type.STRING },
          generalScore: { type: Type.NUMBER },
          personalizedScore: { type: Type.NUMBER },
          carbonEstimateKg: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          sdgMapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sdg: { type: Type.NUMBER },
                score: { type: Type.NUMBER },
                description: { type: Type.STRING }
              }
            }
          },
          breakdown: {
            type: Type.OBJECT,
            properties: {
              material: { type: Type.NUMBER },
              packaging: { type: Type.NUMBER },
              brandRecord: { type: Type.NUMBER },
              lifecycle: { type: Type.NUMBER }
            }
          },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
                priceHint: { type: Type.STRING }
              }
            }
          }
        },
        required: ["productName", "generalScore", "personalizedScore", "carbonEstimateKg", "sdgMapping"]
      }
    }
  });

  // Extracting text output from GenerateContentResponse
  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    url,
    date: new Date().toISOString(),
  };
};

export const getSustainableRecommendations = async (history: ProductAnalysis[]): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const categories = history.map(h => h.category).join(', ');
  const prompt = `Based on a user's recent purchase searches in categories: ${categories}, give 3-5 concise, high-level sustainable shopping tips and brand recommendations. Keep it encouraging and expert. Use markdown.`;

  const response = await getGenAI().models.generateContent({
    model,
    contents: prompt
  });

  // Extracting text output from GenerateContentResponse
  return response.text || "No recommendations at this time.";
};

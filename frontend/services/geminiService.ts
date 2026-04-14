
import axios from 'axios';
import { ProductAnalysis, UserPreferences } from "../types";

const API_URL = 'http://localhost:8000/analyze';

export const analyzeProduct = async (url: string, preferences: UserPreferences): Promise<ProductAnalysis> => {
  try {
    // Send to FastAPI backend
    const response = await axios.post(API_URL, {
      url: url,
      source: "web-analyzer",
      extracted: null // Let backend scrape
    });

    const data = response.data;

    // Handle graceful errors returning from strict mode
    if (data.status === "error") {
      throw new Error(data.error_message || "Analysis failed on the server.");
    }

    // Strict Mode: Return the backend schema exactly as-is without any placeholder manipulation
    return data as ProductAnalysis;

  } catch (error) {
    console.error("Analysis Error (Strict Mode):", error);
    throw error; // Re-throw to let UI handle displaying the error explicitly
  }
};

export const getSustainableRecommendations = async (history: ProductAnalysis[]): Promise<string> => {
  return "Sustainable recommendations feature coming soon connected to backend.";
};

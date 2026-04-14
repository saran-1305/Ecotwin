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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisController = void 0;
const AIService_1 = require("../services/AIService");
const ScraperService_1 = require("../services/ScraperService");
const aiService = new AIService_1.AIService();
const scraperService = new ScraperService_1.ScraperService();
class AnalysisController {
    analyzeProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url, description, company } = req.body;
                if (!url && !description) {
                    res.status(400).json({ error: 'Please provide either a product URL or a description.' });
                    return;
                }
                let productDescription = description;
                let productTitle = '';
                let scrapedData = {};
                // If URL is provided, scrape the page first
                if (url) {
                    try {
                        scrapedData = yield scraperService.scrapeProductPage(url);
                        productTitle = scrapedData.title;
                        if (scrapedData.description) {
                            productDescription = scrapedData.description;
                        }
                    }
                    catch (scrapeError) {
                        console.error('Scraping failed:', scrapeError);
                        // Continue if description is provided, otherwise fail
                        if (!description) {
                            // Don't fail hard, let AI try without description if possible, or just return error
                            // But for now, let's allow it to proceed with empty description if AI can handle it, 
                            // or just return a generic error if we really have nothing.
                            // Actually, let's just make sure productDescription is at least an empty string if undefined.
                        }
                    }
                }
                if (!productDescription)
                    productDescription = "No description available.";
                // Analyze with AI
                const analysisResult = yield aiService.analyzeProduct(productDescription, company);
                // Construct response matching the frontend's expected format (ProductAnalysis type)
                const response = {
                    id: Math.random().toString(36).substring(7),
                    title: productTitle || 'Unknown Product',
                    brand: 'Detected Brand', // AI could extract this too, but keeping simple for now
                    imageUrl: (scrapedData === null || scrapedData === void 0 ? void 0 : scrapedData.image) || '',
                    overallScore: analysisResult.overallScore || 0,
                    breakdown: analysisResult.breakdown || { carbonImpact: 0, circularity: 0, ethics: 0 },
                    confidence: analysisResult.confidence || 0,
                    sdgs: analysisResult.sdgs || [],
                    reasons: analysisResult.reasons || [],
                    improvements: analysisResult.improvements || [],
                    greenwashingFlags: analysisResult.greenwashingAttempts || [],
                    createdAt: new Date().toISOString(),
                    url: url
                };
                res.json(response);
            }
            catch (error) {
                console.error('Analysis error:', error);
                res.status(500).json({ error: 'Internal server error during analysis.' });
            }
        });
    }
}
exports.AnalysisController = AnalysisController;

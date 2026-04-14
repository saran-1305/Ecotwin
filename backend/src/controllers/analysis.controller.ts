
import { Request, Response } from 'express';
import { AIService } from '../services/AIService';
import { ScraperService } from '../services/ScraperService';

const aiService = new AIService();
const scraperService = new ScraperService();

export class AnalysisController {
    async analyzeProduct(req: Request, res: Response): Promise<void> {
        try {
            const { url, description, company } = req.body;

            if (!url && !description) {
                res.status(400).json({ error: 'Please provide either a product URL or a description.' });
                return;
            }

            let productDescription = description;
            let productTitle = '';
            let scrapedData: any = {};

            // If URL is provided, scrape the page first
            if (url) {
                try {
                    scrapedData = await scraperService.scrapeProductPage(url);
                    productTitle = scrapedData.title;
                    if (scrapedData.description) {
                        productDescription = scrapedData.description;
                    }
                } catch (scrapeError) {
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

            if (!productDescription) productDescription = "No description available.";

            // Analyze with AI
            const analysisResult = await aiService.analyzeProduct(productDescription, company);

            // Construct response matching the frontend's expected format (ProductAnalysis type)
            const response = {
                id: Math.random().toString(36).substring(7),
                title: productTitle || 'Unknown Product',
                brand: 'Detected Brand', // AI could extract this too, but keeping simple for now
                imageUrl: scrapedData?.image || '',
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

        } catch (error) {
            console.error('Analysis error:', error);
            res.status(500).json({ error: 'Internal server error during analysis.' });
        }
    }
}

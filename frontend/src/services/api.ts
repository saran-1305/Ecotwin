import { Preferences, ScanResult, Score, Product, SDG } from '@/lib/types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const MOCK_DELAY = 2000; // ms

export const api = {
    analyzeProduct: async (url: string, prefs: Preferences): Promise<ScanResult> => {
        const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

        if (useMock) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(generateMockResponse(url, prefs));
                }, MOCK_DELAY);
            });
        } else {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            if (!baseUrl) throw new Error("API URL not configured");

            const response = await fetch(`${baseUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, prefs }),
            });

            if (!response.ok) throw new Error("Analysis failed");
            return response.json();
        }
    }
};

function generateMockResponse(url: string, prefs: Preferences): ScanResult {
    const urlLower = url.toLowerCase();

    let baseScores: Omit<Score, 'personalized' | 'confidence'>;
    let productInfo: Product;
    let explain: ScanResult['explain'];
    let sdg: SDG[];

    // Logic based on keywords
    if (urlLower.includes('steel') || urlLower.includes('bottle') || urlLower.includes('metal')) {
        productInfo = {
            title: 'Premium Stainless Steel Water Bottle',
            brand: 'EcoVessel',
            category: 'Kitchen',
            image: 'https://images.unsplash.com/photo-1602143407151-0111d25649e8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        };
        baseScores = { impact: 75, circularity: 90, ethics: 60 };
        explain = {
            topReasons: [
                'Highly durable material (Stainless Steel)',
                'Completely plastic-free construction',
                'Infinitely recyclable at end of life'
            ],
            improvements: [
                'Supply chain transparency could be improved',
                'Could be lighter to transport'
            ]
        };
        sdg = [
            { id: 12, why: 'Responsible Consumption' },
            { id: 14, why: 'Life Below Water' }
        ];
    } else if (urlLower.includes('plastic') || urlLower.includes('toy') || urlLower.includes('disposable')) {
        productInfo = {
            title: 'Generic Plastic Item',
            brand: 'FastPlast',
            category: 'General',
            image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        };
        baseScores = { impact: 30, circularity: 10, ethics: 40 };
        explain = {
            topReasons: [
                'Single-use plastic likely',
                'Low durability estimated',
                'Hard to recycle mixed materials'
            ],
            improvements: [
                'Switch to biodegradable materials',
                'Improve durability for reuse',
                'Establish a take-back program'
            ]
        };
        sdg = [{ id: 12, why: 'Waste Generation Concern' }];
    } else {
        // Default / Unknown
        productInfo = {
            title: 'Unknown Product',
            category: 'Uncategorized',
        };
        baseScores = { impact: 50, circularity: 50, ethics: 50 };
        explain = {
            topReasons: ['Insufficient data to be specific', 'Average sustainability profile inferred'],
            improvements: ['Check for certifications', 'Look for transparency reports']
        };
        sdg = [];
    }

    // Calculate Personalized Score
    const totalWeight = Object.values(prefs).reduce((a, b) => a + b, 0) || 1;

    const wCarbon = prefs.carbon / totalWeight;
    const wPlastic = prefs.plastic_free / totalWeight;
    const wEthics = prefs.ethics / totalWeight;
    const wDurability = prefs.durability / totalWeight;
    const wLocal = prefs.local / totalWeight;

    const rawScore = (
        (wCarbon * baseScores.impact) +
        (wPlastic * (baseScores.circularity * 0.5 + baseScores.impact * 0.5)) +
        (wEthics * baseScores.ethics) +
        (wDurability * baseScores.circularity) +
        (wLocal * baseScores.impact)
    );

    const personalized = Math.min(100, Math.max(0, Math.round(rawScore)));
    const confidence = (urlLower.includes('steel') || urlLower.includes('plastic')) ? 0.85 : 0.45;

    return {
        id: generateId(),
        createdAt: new Date().toISOString(),
        url,
        product: productInfo,
        scores: { ...baseScores, personalized, confidence },
        explain,
        sdg
    };
}

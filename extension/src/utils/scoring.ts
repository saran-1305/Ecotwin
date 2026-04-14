export interface ProductScore {
    analysis_id: str
    canonical_url: str
    product_title: string | null
    brand: string | null
    product_image: string | null
    eco_score: number | null
    confidence: number | null
    score_band: string | null
    breakdown: {
        material: number | null
        packaging: number | null
        brand_record: number | null
        lifecycle: number | null
    }
    carbon_estimate: {
        kg_co2e: number | null
        source: string | null
    }
    recyclability: {
        percent: number | null
        label: string | null
    }
    labor_risk: {
        grade: string | null
        score: number | null
    }
    sdg_mapping: any[]
    key_findings: string[]
    signals: string[]
    live_signals?: string[]
    partial_analysis: boolean
    unavailable_modules: string[]
    created_at: string
}

export const analyzeProduct = async (title: string, url: string = "", extracted: any = null): Promise<ProductScore> => {
    try {
        // If extracted data is missing basic fields, make them null to avoid backend validation errors
        let safeExtracted = null;
        if (extracted && extracted.title) {
            safeExtracted = {
                title: extracted.title,
                brand: extracted.brand || null,
                priceText: extracted.priceText || null,
                currency: null,
                imageUrl: extracted.imageUrl || null,
                bullets: extracted.bullets || [],
                description: extracted.description || null,
                materials: extracted.materials || null,
                categories: null,
                certifications: null
            };
        }

        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url || `ext-search://${title}`,
                source: "extension",
                extracted: safeExtracted
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Backend error ${response.status}: ${errBody}`);
        }

        const data = await response.json();

        // Handle the new strict backend fallback error payload
        if (data.status === "error") {
            throw new Error(data.error_message || "Analysis failed on server.");
        }

        console.log(`EcoImpactAI Debug: URL=${url}`);
        console.log(`EcoImpactAI Debug: Extracted Fingerprint=${JSON.stringify(safeExtracted, null, 2)}`);
        console.log(`EcoImpactAI Debug: Response Score=${data.eco_score}, Breakdown=${JSON.stringify(data.breakdown)}`);

        return data as ProductScore;

    } catch (err) {
        console.error("Strict Mode API Request Failed:", err);
        throw err; // In strict mode, we literally throw the error so the UI handles it cleanly without fakes.
    }
};

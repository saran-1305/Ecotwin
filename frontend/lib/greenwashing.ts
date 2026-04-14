import { ProductAnalysis } from "../types";

export interface GreenwashingRisk {
    level: 'Low' | 'Medium' | 'High';
    score: number; // 0-100 risk score
    flags: string[];
}

export const detectGreenwashing = (analysis: ProductAnalysis): GreenwashingRisk => {
    const flags: string[] = [];
    let riskScore = 0;

    const text = ((analysis.key_findings || []).join(" ") + " " + (analysis.brand || "") + " " + (analysis.product_title || "")).toLowerCase();

    // Rule 1: Vague buzzwords without visible certifications (mock logic since certifications aren't fully parsed yet)
    const buzzwords = ["eco-friendly", "green", "natural", "sustainable", "clean"];
    const hasBuzzwords = buzzwords.some(w => text.includes(w));

    // We assume analysis.sdg_mapping or specific certification fields would be populated if valid.
    // For now, if "eco_score" is low (<50) but has buzzwords -> Flag it.
    if (hasBuzzwords && (analysis.eco_score || 0) < 50) {
        flags.push("Sustainability keywords detected without strong scoring proof.");
        riskScore += 40;
    }

    // Rule 2: Plastic packaging but "eco" claims
    if ((analysis.breakdown?.packaging || 0) < 40 && hasBuzzwords) {
        flags.push("Eco claims made despite likely non-sustainable packaging.");
        riskScore += 30;
    }

    // Rule 3: Missing materials
    // If we had a materials list, we'd check it. For now, check if breakdown.material is low.
    if ((analysis.breakdown?.material || 0) < 30) {
        flags.push("Material composition breakdown is poor or non-transparent.");
        riskScore += 20;
    }

    // Determine Level
    let level: 'Low' | 'Medium' | 'High' = 'Low';
    if (riskScore > 60) level = 'High';
    else if (riskScore > 30) level = 'Medium';

    return { level, score: riskScore, flags };
};

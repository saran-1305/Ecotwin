import { ProductAnalysis } from '../types';

export interface EcoSignal {
    label: string;
    type?: 'material' | 'packaging' | 'brand' | 'cert' | 'general';
    confidence?: number;
}

export const extractLiveSignals = (analysis: Partial<ProductAnalysis> | null | undefined): EcoSignal[] => {
    if (!analysis) return [];

    const signalsMap = new Map<string, EcoSignal>();

    const addSignal = (label: string, type: EcoSignal['type'] = 'general', confidence?: number) => {
        if (!label) return;
        const cleanLabel = label.trim();
        if (cleanLabel.length < 2) return;

        const key = cleanLabel.toLowerCase();
        if (!signalsMap.has(key)) {
            signalsMap.set(key, { label: cleanLabel, type, confidence });
        }
    };

    // 1. Primary: backend explicitly provided signals array
    if (Array.isArray(analysis.signals) && analysis.signals.length > 0) {
        analysis.signals.forEach(s => {
            if (typeof s === 'string') {
                addSignal(s);
            } else if (typeof s === 'object' && s !== null && s.label) {
                // If it's an object with a label, extract it
                let type: any = 'general';
                if (['material', 'packaging', 'brand', 'cert'].includes(s.type)) {
                    type = s.type;
                } else if (s.category && ['material', 'packaging', 'brand', 'cert'].includes(s.category)) {
                    type = s.category;
                }

                addSignal(s.label, type, s.confidence);
            }
        });
    }

    // 2. Fallbacks
    if (Array.isArray(analysis.materials_detected)) {
        analysis.materials_detected.forEach(m => addSignal(m, 'material'));
    }

    if (Array.isArray(analysis.packaging_findings)) {
        analysis.packaging_findings.forEach(p => addSignal(p, 'packaging'));
    }

    if (Array.isArray(analysis.certifications)) {
        analysis.certifications.forEach(c => addSignal(c, 'cert'));
    }

    if (Array.isArray(analysis.brand_findings)) {
        analysis.brand_findings.forEach(b => addSignal(b, 'brand'));
    }

    // Return early if we found high-quality signals
    if (signalsMap.size > 0) return Array.from(signalsMap.values()).slice(0, 8);

    // 3. Last Resort Fallbacks (Reasons / Summary)
    if (Array.isArray(analysis.reasons) && analysis.reasons.length > 0) {
        analysis.reasons.slice(0, 3).forEach(r => {
            const words = r.split(' ');
            if (words.length > 0) {
                const snippet = words.slice(0, 4).join(' ').replace(/[,.]$/, '');
                addSignal(snippet + (words.length > 4 ? '...' : ''));
            }
        });
    } else if (Array.isArray(analysis.explanations) && analysis.explanations.length > 0) {
        analysis.explanations.slice(0, 3).forEach(e => {
            const words = e.split(' ');
            if (words.length > 0) {
                const snippet = words.slice(0, 4).join(' ').replace(/[,.]$/, '');
                addSignal(snippet + (words.length > 4 ? '...' : ''));
            }
        });
    } else if (analysis.summary) {
        const keywords = [
            "Recycled", "Plastic", "Organic", "Vegan", "Fair Trade",
            "Biodegradable", "Energy Star", "Locally Sourced", "Sustainable"
        ];
        const lowerSummary = analysis.summary.toLowerCase();
        keywords.forEach(kw => {
            if (lowerSummary.includes(kw.toLowerCase())) {
                addSignal(kw);
            }
        });
    }

    return Array.from(signalsMap.values()).slice(0, 8);
};

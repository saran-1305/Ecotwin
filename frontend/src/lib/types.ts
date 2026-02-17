export interface User {
    email: string;
    name?: string;
}

export interface Preferences {
    carbon: number;
    plastic_free: number;
    ethics: number;
    durability: number;
    local: number;
}

export interface Score {
    impact: number;
    circularity: number;
    ethics: number;
    personalized: number;
    confidence: number;
}

export interface Product {
    title: string;
    brand?: string;
    category: string;
    image?: string;
}

export interface SDG {
    id: number;
    why: string;
}

export interface ScanResult {
    id: string;
    createdAt: string;
    url: string;
    product: Product;
    scores: Score;
    explain: {
        topReasons: string[];
        improvements: string[];
    };
    sdg: SDG[];
}


export interface UserPreferences {
  avoidPlastic: number; // 1-5
  preferLocal: number; // 1-5
  ethicalBrands: number; // 1-5
  lowCarbon: number; // 1-5
  recyclable: number; // 1-5
}

export interface SDGImpact {
  sdg: number;
  score: number;
  description: string;
}

export interface ProductAnalysis {
  id: string;
  url: string;
  productName: string;
  brand: string;
  category: string;
  generalScore: number;
  personalizedScore: number;
  carbonEstimateKg: number;
  sdgMapping: SDGImpact[];
  summary: string;
  pros: string[];
  cons: string[];
  alternatives: { name: string; url: string; priceHint: string }[];
  date: string;
  breakdown: {
    material: number;
    packaging: number;
    brandRecord: number;
    lifecycle: number;
  };
}

export interface UserStats {
  ecoLevel: string;
  carbonSavedTotal: number;
  sustainablePurchaseRate: number;
  badges: string[];
}

export enum EcoLevel {
  BEGINNER = 'Beginner',
  CONSCIOUS = 'Conscious Shopper',
  ADVOCATE = 'Eco Advocate',
  HERO = 'Climate Hero'
}

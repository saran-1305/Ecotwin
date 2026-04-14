
export interface UserPreferences {
  avoidPlastic: number; // 1-5
  preferLocal: number; // 1-5
  ethicalBrands: number; // 1-5
  lowCarbon: number; // 1-5
  recyclable: number; // 1-5
}

export interface SDGMapping {
  goal: number;
  score: number;
  label: string;
}

export interface ProductAnalysis {
  analysis_id: string;
  canonical_url: string;
  product_title: string | null;
  brand: string | null;
  product_image: string | null;
  eco_score: number | null;
  confidence: number | null;
  score_band: string | null;
  breakdown: {
    material: number | null;
    packaging: number | null;
    brand_record: number | null;
    lifecycle: number | null;
  };
  carbon_estimate: {
    kg_co2e: number | null;
    source: string | null;
  };
  recyclability: {
    percent: number | null;
    label: string | null;
  };
  labor_risk: {
    grade: string | null;
    score: number | null;
  };
  sdg_mapping: SDGMapping[];
  key_findings: string[];
  signals: string[];
  live_signals?: string[];
  signals_status?: string;
  partial_analysis: boolean;
  unavailable_modules: string[];
  created_at: string;
  score_version: string;
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

export interface LedgerEvent {
  ledger_id: string;
  user_id: string;
  source: string; // "extension_quick_scan" or "deep_analysis"
  platform: string;
  event_type: string;
  canonical_url: string;
  product_title: string | null;
  brand: string | null;
  product_image: string | null;
  analysis_id: string;
  eco_score: number | null;
  confidence: number | null;
  score_band: string | null;
  breakdown: {
    material: number | null;
    packaging: number | null;
    brand_record: number | null;
    lifecycle: number | null;
  };
  carbon_estimate: {
    kg_co2e: number | null;
    source: string | null;
  };
  sdg_mapping: SDGMapping[];
  key_findings: string[];
  created_at_client: string;
  scanType: string;
  status: string;
  created_at: string;
}

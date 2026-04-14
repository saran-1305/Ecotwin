import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserPreferences, ProductAnalysis, UserStats, EcoLevel, LedgerEvent } from '../types';
import { getCurrentUser } from '../services/authService';

interface User {
  username: string;
  email: string;
  _id: string;
}

interface AppContextType {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  history: LedgerEvent[];
  addToHistory: (a: ProductAnalysis) => void;
  stats: UserStats;
  loading: boolean;
  setLoading: (l: boolean) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  scanCount: number;
  incrementScanCount: () => void;
  refreshHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    avoidPlastic: 3,
    preferLocal: 3,
    ethicalBrands: 3,
    lowCarbon: 3,
    recyclable: 3,
  });

  const [history, setHistory] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({
    ecoLevel: EcoLevel.BEGINNER,
    carbonSavedTotal: 0,
    sustainablePurchaseRate: 0,
    badges: ['First Analysis'],
  });

  useEffect(() => {
    const loadedUser = getCurrentUser();
    if (loadedUser) {
      setUser(loadedUser);
    }
  }, []);

  const [scanCount, setScanCount] = useState<number>(() => {
    const saved = localStorage.getItem('eco_scan_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('eco_scan_count', scanCount.toString());
  }, [scanCount]);

  const incrementScanCount = useCallback(() => {
    setScanCount(prev => prev + 1);
  }, []);

  // Use a ref to prevent overlapping fetches if one takes too long
  const isFetchingRef = useRef(false);

  const refreshHistory = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await fetch('http://localhost:8000/ledger/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error("Failed to fetch ledger history:", e);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Poll for live ledger updates every 5 seconds
  useEffect(() => {
    refreshHistory();
    const interval = setInterval(() => {
      refreshHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshHistory]);

  const addToHistory = useCallback(async (analysis: ProductAnalysis) => {
    let userId = localStorage.getItem("ecoimpact_user_id");
    if (!userId) {
      if (user) {
        userId = user._id;
      } else {
        userId = "web-user-" + Date.now().toString();
        localStorage.setItem("ecoimpact_user_id", userId);
      }
    }

    try {
      let platform = "unknown";
      if (analysis.canonical_url.includes("amazon")) platform = "amazon";
      if (analysis.canonical_url.includes("flipkart")) platform = "flipkart";

      const payload = {
        user_id: userId,
        source: "deep_analysis",
        platform: platform,
        event_type: "product_scan",
        canonical_url: analysis.canonical_url,
        product_title: analysis.product_title || "Unknown Product",
        brand: analysis.brand,
        product_image: analysis.product_image,
        analysis_id: analysis.analysis_id,
        eco_score: analysis.eco_score || 0,
        confidence: analysis.confidence,
        score_band: analysis.score_band,
        breakdown: analysis.breakdown,
        carbon_estimate: analysis.carbon_estimate,
        sdg_mapping: analysis.sdg_mapping || [],
        key_findings: analysis.key_findings || [],
        created_at_client: new Date().toISOString()
      };

      await fetch('http://localhost:8000/ledger/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      refreshHistory();
    } catch (err) {
      console.error("Failed to save ledger event:", err);
    }
  }, [user, refreshHistory]);

  useEffect(() => {
    if (history.length === 0) return;

    const totalCarbon = history.reduce((acc, curr) => acc + (10 - (curr.carbon_estimate?.kg_co2e || 0)), 0);
    const avgScore = history.reduce((acc, curr) => acc + (curr.eco_score || 0), 0) / (history.length || 1);

    let level = EcoLevel.BEGINNER;
    if (history.length > 20 || totalCarbon > 100) level = EcoLevel.HERO;
    else if (history.length > 10 || totalCarbon > 50) level = EcoLevel.ADVOCATE;
    else if (history.length > 3 || totalCarbon > 10) level = EcoLevel.CONSCIOUS;

    setStats({
      ecoLevel: level,
      carbonSavedTotal: Math.max(0, parseFloat(totalCarbon.toFixed(1))),
      sustainablePurchaseRate: Math.round(avgScore),
      badges: history.length > 5 ? ['First Analysis', 'Eco Voyager', 'Impact Maker'] : ['First Analysis'],
    });
  }, [history]);

  return (
    <AppContext.Provider value={{ preferences, setPreferences, history, addToHistory, stats, loading, setLoading, user, setUser, scanCount, incrementScanCount, refreshHistory }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

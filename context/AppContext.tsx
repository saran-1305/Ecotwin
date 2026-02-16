
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPreferences, ProductAnalysis, UserStats, EcoLevel } from '../types';

interface AppContextType {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  history: ProductAnalysis[];
  addToHistory: (a: ProductAnalysis) => void;
  stats: UserStats;
  loading: boolean;
  setLoading: (l: boolean) => void;
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

  const [history, setHistory] = useState<ProductAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    ecoLevel: EcoLevel.BEGINNER,
    carbonSavedTotal: 0,
    sustainablePurchaseRate: 0,
    badges: ['First Analysis'],
  });

  const addToHistory = useCallback((analysis: ProductAnalysis) => {
    setHistory(prev => [analysis, ...prev]);
  }, []);

  useEffect(() => {
    // Logic for calculating levels and stats
    if (history.length === 0) return;

    const totalCarbon = history.reduce((acc, curr) => acc + (10 - curr.carbonEstimateKg), 0); // Simulated "saving" vs average
    const avgScore = history.reduce((acc, curr) => acc + curr.generalScore, 0) / history.length;
    
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
    <AppContext.Provider value={{ preferences, setPreferences, history, addToHistory, stats, loading, setLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

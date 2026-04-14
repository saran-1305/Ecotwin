import { ProductAnalysis } from "../types";

const STORAGE_KEY_HISTORY = 'ecotwin.scanHistory';
const STORAGE_KEY_ECO_MODE = 'ecotwin.ecoMode';

export const saveScanToHistory = (scan: ProductAnalysis) => {
    try {
        const history = getScanHistory();
        // distinct by id or url to avoid duplicates
        const filtered = history.filter(h => h.url !== scan.url);

        // Add new scan to beginning
        const newHistory = [scan, ...filtered].slice(0, 5); // Keep last 5

        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

export const getScanHistory = (): ProductAnalysis[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

export const saveEcoMode = (mode: 'balanced' | 'strict') => {
    localStorage.setItem(STORAGE_KEY_ECO_MODE, mode);
};

export const getEcoMode = (): 'balanced' | 'strict' => {
    return (localStorage.getItem(STORAGE_KEY_ECO_MODE) as 'balanced' | 'strict') || 'balanced';
};

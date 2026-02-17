import { User, Preferences, ScanResult } from './types';

const KEYS = {
    USER: 'ecotwin_user',
    PREFS: 'ecotwin_prefs',
    SCANS: 'ecotwin_scans',
    THEME: 'ecotwin_theme',
};

export const storage = {
    getUser: (): User | null => {
        const item = localStorage.getItem(KEYS.USER);
        return item ? JSON.parse(item) : null;
    },
    setUser: (user: User | null) => {
        if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));
        else localStorage.removeItem(KEYS.USER);
    },

    getPrefs: (): Preferences | null => {
        const item = localStorage.getItem(KEYS.PREFS);
        return item ? JSON.parse(item) : null;
    },
    setPrefs: (prefs: Preferences) => {
        localStorage.setItem(KEYS.PREFS, JSON.stringify(prefs));
    },

    getScans: (): ScanResult[] => {
        const item = localStorage.getItem(KEYS.SCANS);
        return item ? JSON.parse(item) : [];
    },
    addScan: (scan: ScanResult) => {
        const scans = storage.getScans();
        localStorage.setItem(KEYS.SCANS, JSON.stringify([scan, ...scans]));
    },

    getTheme: (): 'light' | 'dark' | 'system' => {
        const item = localStorage.getItem(KEYS.THEME);
        return (item as 'light' | 'dark' | 'system') || 'system';
    },
    setTheme: (theme: 'light' | 'dark' | 'system') => {
        localStorage.setItem(KEYS.THEME, theme);
    }
};

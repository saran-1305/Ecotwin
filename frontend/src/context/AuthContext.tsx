import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Preferences, ScanResult } from '@/lib/types';
import { storage } from '@/lib/storage';

interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    preferences: Preferences | null;
    savePreferences: (prefs: Preferences) => void;
    scans: ScanResult[];
    addScan: (scan: ScanResult) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [scans, setScans] = useState<ScanResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            const loadedUser = storage.getUser();
            const loadedPrefs = storage.getPrefs();
            const loadedScans = storage.getScans();

            setUser(loadedUser);
            setPreferences(loadedPrefs);
            setScans(loadedScans);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const login = (email: string) => {
        const newUser = { email };
        setUser(newUser);
        storage.setUser(newUser);
    };

    const logout = () => {
        setUser(null);
        setPreferences(null);
        // keep scans? yes usually.
        storage.setUser(null);
    };

    const savePreferences = (prefs: Preferences) => {
        setPreferences(prefs);
        storage.setPrefs(prefs);
    };

    const addScan = (scan: ScanResult) => {
        setScans(prev => [scan, ...prev]);
        storage.addScan(scan);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            preferences,
            savePreferences,
            scans,
            addScan,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

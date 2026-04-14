import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, Flower, TreePine } from 'lucide-react';

const SeedIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 2C12 2 12 10 12 10C12 10 4 10 4 10C4 5 8 2 12 2Z" transform="rotate(-45 12 12) translate(4 4)" opacity="0.9" />
        <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" />
    </svg>
);

const EcoGrowthWidget = () => {
    const { scanCount } = useApp();

    const stageData = useMemo(() => {
        if (scanCount >= 200) {
            return {
                stageName: 'Tree',
                icon: TreePine,
                nextTarget: null,
                progressToNext: 100,
                color: 'text-[#CFE5DA]',
                stageIndex: 3
            };
        } else if (scanCount >= 100) {
            return {
                stageName: 'Plant',
                icon: Flower,
                nextTarget: 200,
                progressToNext: Math.min(100, ((scanCount - 100) / (200 - 100)) * 100),
                color: 'text-emerald-600',
                stageIndex: 2
            };
        } else if (scanCount >= 50) {
            return {
                stageName: 'Seedling',
                icon: Sprout,
                nextTarget: 100,
                progressToNext: Math.min(100, ((scanCount - 50) / (100 - 50)) * 100),
                color: 'text-[#CFE5DA]0',
                stageIndex: 1
            };
        } else {
            return {
                stageName: 'Seed',
                icon: SeedIcon,
                nextTarget: 50,
                progressToNext: Math.min(100, (scanCount / 50) * 100),
                color: 'text-emerald-400',
                stageIndex: 0
            };
        }
    }, [scanCount]);

    const { stageName, icon: Icon, nextTarget, progressToNext, color, stageIndex } = stageData;

    const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('eco_widget_theme') as 'dark' | 'light') || 'dark';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('eco_widget_theme', newTheme);
    };

    const isDark = theme === 'dark';

    return (
        <div className={`relative border p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[360px] overflow-hidden group hover:scale-[1.02] transition-all duration-500
            ${isDark
                ? 'bg-gradient-to-br from-emerald-950 to-emerald-900 border-emerald-800/50 shadow-emerald-900/40 ring-1 ring-white/10'
                : 'bg-[#0B5A47] border-emerald-500/20 shadow-emerald-900/20'
            }`}>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all ${isDark ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800' : 'bg-[#0B5A47] text-emerald-600 hover:bg-emerald-100'}`}
                title="Toggle Theme"
            >
                {isDark ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
            </button>

            {/* Ambient Background Glow (Dark Mode Only) */}
            {isDark && (
                <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-800/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                </>
            )}

            {/* Icon Container */}
            <div className={`relative w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm z-10 
                ${isDark ? 'bg-emerald-900/40 border border-emerald-700/50' : 'bg-[#0B5A47] border border-emerald-500/20'}`}>
                {isDark && <div className="absolute inset-0 bg-emerald-400/5 rounded-[1.5rem]"></div>}
                <Icon className={`w-10 h-10 ${color} ${isDark ? 'drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]' : ''} transition-all duration-300 group-hover:scale-110`} />
            </div>

            <div className="flex-grow space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-emerald-400/80' : 'text-emerald-400'}`}>Current Stage</span>
                        </div>
                        <div className={`text-3xl font-black tracking-tight leading-none drop-shadow-md ${isDark ? 'text-[#F8F9FA]' : 'text-[#F8F9FA]'}`}>{stageName}</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-black leading-none tabular-nums tracking-tight ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>{scanCount}</div>
                        <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-[#CFE5DA]0/80' : 'text-emerald-400'}`}>Total Scans</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={`relative h-3.5 w-full rounded-full overflow-hidden border ${isDark ? 'bg-[#054231]/50 border-emerald-800/30' : 'bg-[#0B5A47] border-emerald-500/20'}`}>
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isDark ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
                        style={{ width: `${progressToNext}%` }}
                    >
                        <div className="absolute inset-0 bg-[#0B5A47]/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>

                {nextTarget ? (
                    <div className="flex justify-between items-center px-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400/60' : 'text-[#CFE5DA]/60'}`}>
                            Next: <span className={isDark ? 'text-emerald-300' : 'text-[#9FC7B7]'}>{stageArray[stageIndex + 1]?.name}</span>
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isDark ? 'text-[#F8F9FA] bg-emerald-800/50 border-emerald-700/50' : 'text-[#9FC7B7] bg-[#0B5A47] border-emerald-500/20'}`}>
                            {nextTarget - scanCount} needed
                        </span>
                    </div>
                ) : (
                    <div className={`text-[10px] font-black text-center py-1 rounded-full border uppercase tracking-wider ${isDark ? 'text-emerald-300 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-[#0B5A47] border-emerald-500/20'}`}>
                        Maximum Impact Achieved
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for next stage name
const stageArray = [
    { name: 'Seed', threshold: 0 },
    { name: 'Seedling', threshold: 50 },
    { name: 'Plant', threshold: 100 },
    { name: 'Tree', threshold: 200 }
];

const getStageIndex = (count: number) => {
    if (count >= 200) return 3;
    if (count >= 100) return 2;
    if (count >= 50) return 1;
    return 0;
};

export default EcoGrowthWidget;

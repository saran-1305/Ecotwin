import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';

interface LiveEcoSignalsProps {
    signals?: string[];
    isLoading?: boolean;
    error?: string;
}

const LiveEcoSignals: React.FC<LiveEcoSignalsProps> = ({ signals = [], isLoading, error }) => {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (!isLoading && !error && signals.length > 0) {
            // Trigger animation after slightly delaying to ensure DOM mount
            const timer = setTimeout(() => setAnimateIn(true), 50);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
        }
    }, [signals, isLoading, error]);

    return (
        <div className="bg-[#0B5A47] border border-emerald-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
            <div className="flex flex-col gap-1 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#F8F9FA]">
                        LIVE ECO SIGNALS
                    </h4>
                </div>
                {/* Subtext hidden on very small width, visible otherwise */}
                <p className="hidden sm:block text-[11px] font-medium text-[#9FC7B7]">
                    Detected sustainability cues from product content
                </p>
            </div>

            <div className="relative z-10">
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/10 animate-pulse`} style={{ width: `${Math.random() * 40 + 60}px` }}></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-xs text-red-300/80 font-medium italic flex items-center gap-2">
                        <ICONS.AlertTriangle className="w-4 h-4" />
                        Signal scan unavailable.
                    </div>
                ) : signals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {signals.map((signal, i) => (
                            <span
                                key={i}
                                className={`inline-flex flex-row items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out transform text-[#CFE5DA] bg-[#0A5A45] border border-emerald-500/20 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                {signal}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <p className="text-xs text-[#CFE5DA] font-bold">
                            No sustainability cues detected yet.
                        </p>
                        <p className="text-[10px] text-[#9FC7B7]">
                            Try a product page with detailed materials and packaging information.
                        </p>
                    </div>
                )}
            </div>
            {/* Subtle background glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>
    );
};

export default LiveEcoSignals;

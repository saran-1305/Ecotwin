import React from 'react';
import { motion } from 'framer-motion';

interface EcoModeToggleProps {
    mode: 'balanced' | 'strict';
    setMode: (mode: 'balanced' | 'strict') => void;
}

const EcoModeToggle: React.FC<EcoModeToggleProps> = ({ mode, setMode }) => {
    return (
        <div className="flex items-center gap-3 bg-[#0B5A47] rounded-full p-1 pl-4 border border-emerald-500/20 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CFE5DA]">
                Eco Mode:
            </span>
            <div className="relative flex bg-[#0B5A47] rounded-full p-1 shadow-sm">
                <motion.div
                    layout
                    className="absolute top-1 bottom-1 w-[45%] bg-emerald-500 rounded-full shadow-md z-0"
                    initial={false}
                    animate={{
                        left: mode === 'balanced' ? '4px' : '52%' // Simple positioning
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
                <button
                    onClick={() => setMode('balanced')}
                    className={`relative z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${mode === 'balanced' ? 'text-[#F8F9FA]' : 'text-emerald-400 hover:text-emerald-600'
                        }`}
                >
                    Balanced
                </button>
                <button
                    onClick={() => setMode('strict')}
                    className={`relative z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${mode === 'strict' ? 'text-[#F8F9FA]' : 'text-emerald-400 hover:text-emerald-600'
                        }`}
                >
                    Strict
                </button>
            </div>
        </div>
    );
};

export default EcoModeToggle;

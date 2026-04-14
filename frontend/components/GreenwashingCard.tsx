import React from 'react';
import { ICONS } from '../constants';
import { GreenwashingRisk } from '../lib/greenwashing';

interface GreenwashingCardProps {
    risk: GreenwashingRisk;
}

const GreenwashingCard: React.FC<GreenwashingCardProps> = ({ risk }) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        }
    };

    const colorClass = getRiskColor(risk.level);

    return (
        <div className="glass p-8 rounded-[2.5rem] bg-[#0B5A47] border border-emerald-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <ICONS.AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg serif italic text-[#F8F9FA]">
                        Greenwashing Risk
                    </h3>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
                    {risk.level}
                </span>
            </div>

            <div className="space-y-4">
                {risk.flags.length > 0 ? (
                    risk.flags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-3 bg-[#054231]/30 p-4 rounded-2xl border border-emerald-500/10">
                            <ICONS.AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${risk.level === 'High' ? 'text-red-400' : 'text-orange-400'}`} />
                            <p className="text-xs font-bold text-[#CFE5DA] leading-relaxed">
                                {flag}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center gap-3 bg-[#054231]/30 p-4 rounded-2xl border border-emerald-500/10 text-emerald-400">
                        <ICONS.CheckCircle className="w-5 h-5" />
                        <p className="text-xs font-bold text-[#CFE5DA]">No major flags detected. AI confidence is high.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GreenwashingCard;

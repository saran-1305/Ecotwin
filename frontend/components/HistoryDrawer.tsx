import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ChevronRight } from 'lucide-react';
import { ProductAnalysis } from '../types';

interface HistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProductAnalysis[];
    onSelect: (scan: ProductAnalysis) => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-[#0B5A47] shadow-2xl z-50 p-6 flex flex-col border-l border-emerald-50"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-lg font-serif italic text-[#F8F9FA]">Recent Scans</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[#0B5A47] rounded-full transition-colors">
                                <X className="w-5 h-5 text-emerald-400" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-3">
                            {history.length === 0 ? (
                                <p className="text-sm text-center text-[#CFE5DA]/40 italic mt-10">No recent scans found.</p>
                            ) : (
                                history.map((scan) => (
                                    <div
                                        key={scan.analysis_id}
                                        onClick={() => { onSelect(scan); onClose(); }}
                                        className="group p-4 rounded-xl border border-emerald-50 bg-[#0B5A47]/30 hover:bg-[#0B5A47] cursor-pointer transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-[#0B5A47] text-[10px] font-black uppercase text-emerald-600 border border-emerald-500/20 shadow-sm">
                                                {scan.eco_score !== null && scan.eco_score !== undefined ? `${scan.eco_score}/100` : "--"}
                                            </span>
                                            <span className="text-[10px] text-emerald-400 font-medium">
                                                {new Date(scan.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-[#CFE5DA] group-hover:text-[#9FC7B7] line-clamp-2 leading-tight mb-2">
                                            {scan.product_title || "Unknown Product"}
                                        </h4>
                                        <div className="flex items-center text-[10px] text-[#CFE5DA]0 uppercase tracking-wider font-bold group-hover:gap-1 transition-all">
                                            Load Result <ChevronRight className="w-3 h-3 ml-1" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t border-emerald-50 text-center">
                            <p className="text-[10px] text-emerald-300 font-medium">EcoImpact AI History • Local Storage</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistoryDrawer;

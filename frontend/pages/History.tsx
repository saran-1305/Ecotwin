
import React from 'react';
import { useApp } from '../context/AppContext';

const getGrade = (score: number): { label: string; color: string; bg: string } => {
   if (score >= 90) return { label: 'A+', color: '#ffffff', bg: '#15803d' };        // dark green
   if (score >= 80) return { label: 'A', color: '#ffffff', bg: '#4ade80' };        // light green
   if (score >= 70) return { label: 'B+', color: '#1a1a1a', bg: '#facc15' };       // yellow
   if (score >= 60) return { label: 'B', color: '#1a1a1a', bg: '#fde047' };       // yellow
   if (score >= 50) return { label: 'C', color: '#1a1a1a', bg: '#fb923c' };       // orange
   return { label: 'F', color: '#ffffff', bg: '#b91c1c' };            // dark red
};

const History = () => {
   const { history } = useApp();

   return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 pb-32">
         <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-emerald-500/20 pb-12">
            <div className="space-y-2">
               <div className="text-emerald-600 font-black text-[10px] tracking-[0.4em] uppercase">Chronological Records</div>
               <h1 className="text-6xl font-black text-[#F8F9FA] tracking-tight leading-none serif italic">Audit Ledger</h1>
               <p className="text-[#9FC7B7] text-sm font-bold">A permanent record of verified environmental impact instances.</p>
            </div>
            <div className="text-[#CFE5DA] font-black text-[10px] uppercase tracking-widest bg-[#054231] px-6 py-2 rounded-full border border-emerald-500/20">
               {history.length} Logs Documented
            </div>
         </header>

         {history.length === 0 ? (
            <div className="py-40 glass rounded-[3rem] text-center space-y-8 border-dashed border-emerald-500/40 bg-[#0B5A47] shadow-sm">
               <div className="text-6xl text-[#F8F9FA] font-black italic serif">Ø</div>
               <p className="text-[#CFE5DA] font-bold italic serif text-2xl uppercase tracking-widest">Ledger is currently empty</p>
               <a href="#/analyzer" className="inline-block text-emerald-600 font-black uppercase tracking-widest text-[10px] border-b-2 border-emerald-500/20 pb-1 hover:border-emerald-500 transition-all">
                  Run Initial Scan →
               </a>
            </div>
         ) : (
            <div className="space-y-4">
               <div className="grid grid-cols-12 px-8 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#CFE5DA]">
                  <div className="col-span-6 md:col-span-5">Audit Instance</div>
                  <div className="col-span-3 md:col-span-2 text-center">Eco Score</div>
                  <div className="hidden md:block col-span-2 text-center">Carbon</div>
                  <div className="col-span-3 text-right">Verification Date</div>
               </div>
               {history.map((item, index) => (
                  <div key={item.ledger_id} className="grid grid-cols-12 items-center px-8 py-6 glass rounded-[2rem] border border-black/5 hover:border-emerald-500/30 transition-all group cursor-pointer text-[#F8F9FA] bg-[#0B5A47] shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 mt-3">
                     <div className="col-span-6 md:col-span-5 flex items-center gap-6">
                        {(() => {
                           const g = getGrade(item.eco_score || 0); return (
                              <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm shadow-inner transition-all" style={{ background: g.bg, color: g.color }}>
                                 {g.label}
                              </div>
                           );
                        })()}
                        <div className="truncate pr-4 flex-1">
                           <div className="flex gap-2 mb-1.5 flex-wrap">
                              {index === 0 && (
                                 <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-sm border border-emerald-500/30 uppercase tracking-widest font-black animate-pulse">New</span>
                              )}
                              {item.source === "extension_quick_scan" ? (
                                 <span className="text-[8px] bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded-sm border border-cyan-700/30 uppercase tracking-widest font-black">Quick Scan</span>
                              ) : (
                                 <span className="text-[8px] bg-[#043628] text-[#CFE5DA] px-2 py-0.5 rounded-sm border border-emerald-500/30 uppercase tracking-widest font-black">Deep Analysis</span>
                              )}
                              {item.platform === "amazon" && (
                                 <span className="text-[8px] bg-orange-900/40 text-orange-300 px-2 py-0.5 rounded-sm border border-orange-700/30 uppercase tracking-widest font-black">Amazon</span>
                              )}
                              {item.platform === "flipkart" && (
                                 <span className="text-[8px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-sm border border-blue-700/30 uppercase tracking-widest font-black">Flipkart</span>
                              )}
                           </div>
                           <div className="text-base font-black truncate group-hover:text-[#9FC7B7] transition-colors tracking-tight leading-tight">{item.product_title || "Unknown Product"}</div>
                           <div className="text-[10px] text-[#CFE5DA] font-black uppercase mt-1 tracking-widest">{item.brand || "Unknown Brand"}</div>
                        </div>
                     </div>
                     <div className="col-span-3 md:col-span-2 text-center">
                        <span className={`text-2xl font-black tabular-nums ${(item.eco_score || 0) > 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                           {item.eco_score !== null && item.eco_score !== undefined ? item.eco_score : '--'}
                        </span>
                     </div>
                     <div className="hidden md:block col-span-2 text-center font-black text-xs text-[#CFE5DA]">
                        {item.carbon_estimate?.kg_co2e !== null && item.carbon_estimate?.kg_co2e !== undefined ? `${item.carbon_estimate.kg_co2e.toFixed(1)}kg` : '--'}
                     </div>
                     <div className="col-span-3 text-right text-[10px] font-black text-[#CFE5DA] uppercase tracking-tighter">
                        {new Date(item.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {history.length > 0 && (
            <div className="flex justify-center pt-10">
               <button className="text-[#CFE5DA] hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-3">
                  Clear Physical Ledger Records <span>&times;</span>
               </button>
            </div>
         )}
      </div>
   );
};

export default History;

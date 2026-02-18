
import React from 'react';
import { useApp } from '../context/AppContext';

const History = () => {
  const { history } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-2">
          <div className="text-emerald-600 font-black text-[10px] tracking-[0.4em] uppercase">Chronological Records</div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none serif italic">Audit Ledger</h1>
          <p className="text-slate-500 text-sm font-bold">A permanent record of verified environmental impact instances.</p>
        </div>
        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
          {history.length} Logs Documented
        </div>
      </header>

      {history.length === 0 ? (
        <div className="py-40 glass rounded-[3rem] text-center space-y-8 border-dashed border-slate-200 bg-white shadow-sm">
           <div className="text-6xl text-slate-100 font-black italic serif">Ø</div>
           <p className="text-slate-400 font-bold italic serif text-2xl uppercase tracking-widest">Ledger is currently empty</p>
           <a href="#/analyzer" className="inline-block text-emerald-600 font-black uppercase tracking-widest text-[10px] border-b-2 border-emerald-500/20 pb-1 hover:border-emerald-500 transition-all">
              Run Initial Scan →
           </a>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="grid grid-cols-12 px-8 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <div className="col-span-6 md:col-span-5">Audit Instance</div>
              <div className="col-span-3 md:col-span-2 text-center">Eco Score</div>
              <div className="hidden md:block col-span-2 text-center">Carbon</div>
              <div className="col-span-3 text-right">Verification Date</div>
           </div>
          {history.map((item) => (
            <div key={item.id} className="grid grid-cols-12 items-center px-8 py-6 glass rounded-[2rem] border border-black/5 hover:border-emerald-500/30 transition-all group cursor-pointer text-slate-900 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-500/5">
               <div className="col-span-6 md:col-span-5 flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                    {item.productName[0]}
                  </div>
                  <div className="truncate pr-4">
                     <div className="text-base font-black truncate group-hover:text-emerald-700 transition-colors tracking-tight">{item.productName}</div>
                     <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{item.brand}</div>
                  </div>
               </div>
               <div className="col-span-3 md:col-span-2 text-center">
                  <span className={`text-2xl font-black tabular-nums ${item.generalScore > 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {item.generalScore}
                  </span>
               </div>
               <div className="hidden md:block col-span-2 text-center font-black text-xs text-slate-400">
                  {item.carbonEstimateKg}kg
               </div>
               <div className="col-span-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
               </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
         <div className="flex justify-center pt-10">
            <button className="text-slate-300 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-3">
               Clear Physical Ledger Records <span>&times;</span>
            </button>
         </div>
      )}
    </div>
  );
};

export default History;

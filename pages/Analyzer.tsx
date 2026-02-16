
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeProduct } from '../services/geminiService';
import { ProductAnalysis } from '../types';
import { ICONS } from '../constants';

const Analyzer = () => {
  const { preferences, addToHistory, loading, setLoading } = useApp();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const analysis = await analyzeProduct(url, preferences);
      setResult(analysis);
      addToHistory(analysis);
    } catch (err) {
      setError('ANALYSIS_FAILURE: PRODUCT_DATA_NOT_REACHABLE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
      <div className="text-center space-y-6">
        <h1 className="text-6xl md:text-7xl serif italic text-emerald-950">Product Scan</h1>
        <p className="text-emerald-800/60 font-medium text-lg max-w-xl mx-auto">
          Supply chain intelligence powered by professional Generative AI. 
          Provide a URL to begin the environmental audit.
        </p>
      </div>

      <div className="max-w-3xl mx-auto glass p-3 rounded-[2.5rem] border border-emerald-100 shadow-2xl bg-white">
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
          <input
            type="url"
            required
            placeholder="PASTE PRODUCT URL HERE..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-grow bg-emerald-50/30 border border-emerald-100 rounded-[2rem] px-8 py-5 text-sm font-semibold text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs disabled:opacity-30 hover:scale-105 transition-all shadow-lg shadow-emerald-100"
          >
            {loading ? "SCANNING..." : "START AUDIT"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 font-black text-[10px] tracking-widest text-center uppercase">{error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
          <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Decoding Supply Chain...</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Massive Result Card */}
            <div className="lg:col-span-3 glass rounded-[3.5rem] p-12 flex flex-col justify-between border border-emerald-100 relative overflow-hidden shadow-sm bg-white">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px]"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest">Analysis Report</div>
                        <h2 className="text-4xl serif italic text-emerald-950">{result.productName}</h2>
                        <div className="text-emerald-600 font-black text-sm mt-1 uppercase tracking-tighter">{result.brand}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-7xl font-black tracking-tighter text-emerald-950">{result.generalScore}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Eco System Score</div>
                     </div>
                  </div>
                  <p className="text-emerald-800/80 font-medium leading-relaxed text-lg mb-10 border-l-4 border-emerald-500 pl-8">{result.summary}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-emerald-50 text-emerald-950">
                     {Object.entries(result.breakdown).map(([key, val]) => (
                        <div key={key}>
                           <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{key}</div>
                           <div className="text-xl font-black">{val}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Impact sidebar */}
            <div className="lg:col-span-2 space-y-8">
               <div className="glass p-10 rounded-[3rem] space-y-8 bg-white border border-emerald-100 shadow-sm">
                  <h3 className="text-xl serif italic text-emerald-950">SDG Calibration</h3>
                  <div className="space-y-6">
                     {result.sdgMapping.map((sdg) => (
                        <div key={sdg.sdg} className="space-y-3">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-emerald-950 font-bold">Goal {sdg.sdg}</span>
                              <span className="text-emerald-600">{sdg.score}%</span>
                           </div>
                           <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${sdg.score}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="glass p-10 rounded-[3rem] bg-emerald-600 border border-emerald-400 text-white shadow-lg shadow-emerald-100">
                  <div className="flex items-center gap-4 mb-4">
                     <ICONS.Leaf className="w-6 h-6 text-emerald-100" />
                     <h4 className="font-black text-xs uppercase tracking-widest">Carbon Impact</h4>
                  </div>
                  <div className="text-4xl font-black mb-2 tracking-tighter">{result.carbonEstimateKg}kg CO2e</div>
                  <p className="text-xs text-emerald-50 font-medium leading-relaxed opacity-80">This product's estimated lifecycle emissions from production to final distribution.</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="glass p-8 rounded-[2.5rem] border border-emerald-100 text-emerald-950 bg-white shadow-sm">
                <h4 className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-6">Sustainable Swaps</h4>
                <div className="space-y-6">
                   {result.alternatives.map((alt, i) => (
                      <div key={i} className="group cursor-pointer border-b border-emerald-50/50 pb-4">
                         <div className="text-sm font-bold group-hover:text-emerald-600 transition-colors">{alt.name}</div>
                         <div className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">{alt.priceHint}</div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 text-emerald-950">
                <div className="glass p-8 rounded-[2.5rem] border border-emerald-100 bg-emerald-50/30">
                   <h4 className="text-emerald-700 font-black text-xs uppercase tracking-widest mb-6">Efficiency Pros</h4>
                   <ul className="space-y-4">
                      {result.pros.map((p, i) => (
                         <li key={i} className="text-sm text-emerald-900 font-medium leading-relaxed flex items-start gap-3">
                            <span className="text-emerald-600 font-black">✓</span> {p}
                         </li>
                      ))}
                   </ul>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border border-emerald-100 bg-white/50">
                   <h4 className="text-emerald-600/50 font-black text-xs uppercase tracking-widest mb-6">Impact Cons</h4>
                   <ul className="space-y-4">
                      {result.cons.map((c, i) => (
                         <li key={i} className="text-sm text-emerald-800/60 font-medium leading-relaxed flex items-start gap-3">
                            <span className="text-emerald-400 font-black">!</span> {c}
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;

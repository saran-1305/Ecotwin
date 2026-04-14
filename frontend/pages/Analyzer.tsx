import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { analyzeProduct } from '../services/geminiService';
import { ProductAnalysis } from '../types';
import { ICONS } from '../constants';
import { calculateSDGValues, formatDate } from '../lib/utils';
import { saveScanToHistory, getScanHistory } from '../lib/storage';
import { detectGreenwashing } from '../lib/greenwashing';
import { generatePDF } from '../lib/pdf';
import GreenwashingCard from '../components/GreenwashingCard';
import LiveEcoSignals from '../components/LiveEcoSignals';
import HistoryDrawer from '../components/HistoryDrawer';
import PipelineSteps from '../components/PipelineSteps';
import ReportActions from '../components/ReportActions';
import { Clock } from 'lucide-react';

const Analyzer = () => {
   const { preferences, addToHistory, loading, setLoading, incrementScanCount } = useApp();
   const [url, setUrl] = useState('');
   const [result, setResult] = useState<ProductAnalysis | null>(null);
   const [error, setError] = useState('');
   const [completedTime, setCompletedTime] = useState<string | null>(null);
   const [searchParams] = useSearchParams();

   // New Features State
   const [historyOpen, setHistoryOpen] = useState(false);
   const [scanHistory, setScanHistory] = useState<ProductAnalysis[]>([]);
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      setScanHistory(getScanHistory());
   }, []);

   useEffect(() => {
      const urlParam = searchParams.get('url');
      if (urlParam) {
         setUrl(urlParam);
         performAnalysis(urlParam);
      }
   }, [searchParams]);



   const performAnalysis = async (productUrl: string) => {
      if (!productUrl || !isValidUrl(productUrl)) {
         setError('Please enter a valid URL');
         return;
      }

      setLoading(true);
      setError('');
      setResult(null);
      setCompletedTime(null);

      try {
         const analysis = await analyzeProduct(productUrl, preferences);
         setResult(analysis);
         addToHistory(analysis);
         incrementScanCount();
         setCompletedTime(formatDate(new Date()));

         // Save to local storage history
         saveScanToHistory(analysis);
         setScanHistory(getScanHistory());

      } catch (err) {
         setError('Unable to analyze product. Please check the URL and try again.');
      } finally {
         setLoading(false);
      }
   };

   const isValidUrl = (string: string) => {
      try {
         new URL(string);
         return true;
      } catch (_) {
         return false;
      }
   };

   const handleAnalyze = async (e: React.FormEvent) => {
      e.preventDefault();
      await performAnalysis(url);
   };

   const handleDownloadPDF = () => {
      if (result) generatePDF('audit-report', result.product_title || 'Unknown Product');
   };

   const handleCopySummary = () => {
      if (!result) return;
      const summary = `
EcoImpact Audit: ${result.product_title || 'Product'}
Score: ${result.eco_score ?? 'Unavailable'}/100
Top Finding: ${result.key_findings?.[0] || 'Detailed report attached'}
Check full report on EcoTwin.
      `.trim();
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const displayedScore = result?.eco_score !== null && result?.eco_score !== undefined ? result.eco_score : "--";

   return (
      <div className="max-w-[1100px] mx-auto px-6 py-12 space-y-12 relative">
         {/* History Drawer */}
         <HistoryDrawer
            isOpen={historyOpen}
            onClose={() => setHistoryOpen(false)}
            history={scanHistory}
            onSelect={(scan) => {
               setResult(scan);
               setUrl(scan.canonical_url);
               setCompletedTime(new Date(scan.created_at || Date.now()).toLocaleString());
            }}
         />

         {/* Header */}
         <div className="text-center space-y-4 relative">
            <button
               onClick={() => setHistoryOpen(true)}
               className="absolute right-0 top-0 p-2 sm:p-3 rounded-full bg-[#0B5A47] text-emerald-600 hover:bg-emerald-100 transition-colors"
               title="View Scan History"
            >
               <Clock className="w-5 h-5" />
            </button>
            <h1 className="text-5xl md:text-6xl serif italic text-[#F8F9FA]">Product Scan</h1>
            <p className="text-[#CFE5DA] font-medium text-lg max-w-xl mx-auto">
               Supply chain intelligence powered by professional Generative AI.
            </p>
         </div>

         {/* Search Input */}
         <div className="max-w-2xl mx-auto w-full">
            <div className="glass p-8 rounded-[2rem] border border-emerald-500/20 shadow-xl bg-[#0B5A47] space-y-4">
               <label className="block text-xs font-black uppercase tracking-widest text-[#CFE5DA] ml-4">
                  Product URL
               </label>
               <form onSubmit={handleAnalyze} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                     <ICONS.Search className="h-5 w-5 text-emerald-300" />
                  </div>
                  <input
                     type="url"
                     placeholder="Paste an Amazon/Flipkart product link..."
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     className="w-full bg-[#0B5A47]/80 border border-emerald-500/20 rounded-full py-4 pl-14 pr-36 text-[#CFE5DA] placeholder:text-[#CFE5DA]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                  <button
                     type="submit"
                     disabled={loading || !url}
                     className="absolute right-2 top-2 bottom-2 bg-[#CFE5DA] text-[#054231] px-6 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#A7F3D0] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-400/20"
                  >
                     {loading ? 'Scanning...' : 'Start Audit'}
                  </button>
               </form>
               <div className="flex justify-between px-4">
                  <p className="text-[10px] text-[#9FC7B7] font-medium uppercase tracking-wider">
                     We analyze title, description & materials signals
                  </p>
                  {error && (
                     <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <ICONS.AlertTriangle className="w-3 h-3" />
                        {error}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Loading State */}
         {loading && (
            <div className="flex justify-center py-12">
               <PipelineSteps />
            </div>
         )}

         {/* Results */}
         {result && !loading && (
            <div id="audit-report" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               {/* Success Banner & Actions */}
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {completedTime && (
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 text-[#CFE5DA] text-xs font-bold uppercase tracking-wider border border-emerald-500/40/50">
                        <ICONS.Clock className="w-4 h-4" />
                        Audit completed at {completedTime}
                     </div>
                  )}
                  <ReportActions onDownload={handleDownloadPDF} onCopy={handleCopySummary} copied={copied} />
               </div>

               {/* Grid layout for main report and insights */}
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Column: Main Report (3/5) */}
                  <div className="lg:col-span-3 space-y-6">
                     <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl bg-[#0B5A47] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B5A47] rounded-full blur-[80px] -z-10 opacity-60"></div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                           {/* Image */}
                           <div className="w-full md:w-48 flex-shrink-0">
                              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border-4 border-white relative">
                                 <img
                                    src={result.product_image || "https://images.unsplash.com/photo-1610419886367-5aed6c12d59b?q=80&w=2000&auto=format&fit=crop"}
                                    alt={result.product_title || "Product Image"}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                       (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1610419886367-5aed6c12d59b?q=80&w=2000&auto=format&fit=crop";
                                    }}
                                 />
                              </div>
                           </div>

                           {/* Details */}
                           <div className="flex-grow space-y-6 w-full">
                              <div className="flex justify-between items-start">
                                 <div className="flex-1 min-w-0 pr-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B5A47] text-[#CFE5DA] text-[10px] font-black uppercase tracking-widest mb-3">
                                       <ICONS.Zap className="w-3 h-3" />
                                       {result.brand || "Unknown Brand"}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl serif italic text-[#F8F9FA] leading-tight mb-2 break-words">
                                       {result.product_title || "Unknown Product"}
                                    </h2>
                                 </div>

                                 {/* Score Gauge with Confidence */}
                                 <div className="relative flex flex-col items-center flex-shrink-0 group">
                                    <div className="relative w-28 h-28">
                                       {/* Background Circle */}
                                       <svg className="w-full h-full transform -rotate-90">
                                          <circle
                                             cx="56"
                                             cy="56"
                                             r="50"
                                             stroke="currentColor"
                                             strokeWidth="8"
                                             fill="transparent"
                                             className="text-[#CFE5DA] opacity-10"
                                          />
                                          {/* Score Progress */}
                                          <circle
                                             cx="56"
                                             cy="56"
                                             r="50"
                                             stroke="currentColor"
                                             strokeWidth="8"
                                             fill="transparent"
                                             strokeDasharray={2 * Math.PI * 50}
                                             strokeDashoffset={2 * Math.PI * 50 * (1 - (result.eco_score || 0) / 100)}
                                             strokeLinecap="round"
                                             className="text-emerald-400 transition-all duration-1000 ease-out drop-shadow-md"
                                          />
                                          {/* Confidence Indicator (Inner Ring) */}
                                          <circle
                                             cx="56"
                                             cy="56"
                                             r="40"
                                             stroke="currentColor"
                                             strokeWidth="4"
                                             fill="transparent"
                                             strokeDasharray={2 * Math.PI * 40}
                                             strokeDashoffset={2 * Math.PI * 40 * (1 - (result.confidence || 0.0))}
                                             strokeLinecap="round"
                                             className="text-emerald-300 opacity-30 transition-all duration-1000"
                                          />
                                       </svg>
                                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                                          <span className="text-4xl font-black text-[#F8F9FA] tracking-tighter">
                                             {displayedScore}
                                          </span>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                                             Eco Score
                                          </span>
                                       </div>
                                    </div>

                                    {/* Confidence Tooltip */}
                                    <div className="mt-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                       <div className="h-1 w-16 bg-emerald-100 rounded-full overflow-hidden">
                                          <div
                                             className="h-full bg-emerald-400"
                                             style={{ width: `${(result.confidence || 0) * 100}%` }}
                                          />
                                       </div>
                                       <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-1">
                                          {Math.round((result.confidence || 0) * 100)}% Confidence
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <h4 className="text-xs font-black uppercase tracking-widest text-[#CFE5DA] border-b border-emerald-500/20 pb-2">
                                    Key Findings
                                 </h4>
                                 <ul className="space-y-2">
                                    {result.key_findings?.length > 0 ? result.key_findings.map((finding, i) => (
                                       <li key={i} className="flex items-start gap-2 text-sm text-[#CFE5DA] leading-relaxed font-medium">
                                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                          {finding.replace(/\.$/, '')}.
                                       </li>
                                    )) : (
                                       <li className="text-sm text-[#CFE5DA]/50 italic">No detailed findings available.</li>
                                    )}
                                 </ul>
                              </div>
                           </div>
                        </div>

                        {/* Mini Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-emerald-50">
                           {Object.entries(result.breakdown).map(([key, val]) => (
                              <div key={key} className="bg-[#0B5A47]/80 p-4 rounded-2xl border border-emerald-50/50">
                                 <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 truncate">
                                    {key.replace('_', ' ')}
                                 </div>
                                 <div className="text-lg font-black text-[#F8F9FA]">
                                    {val !== null && val !== undefined ? `${val}/100` : "Unavail"}
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Live Eco Signals */}
                        <div className="mt-6 pt-6 border-t border-emerald-500/20">
                           <LiveEcoSignals signals={result.live_signals || result.signals || []} isLoading={loading} />
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Insights (2/5) */}
                  <div className="lg:col-span-2 space-y-6">
                     {/* SDG Card */}
                     <div className="glass p-8 rounded-[2.5rem] bg-[#0B5A47] border border-emerald-500/20 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-2 bg-emerald-100 rounded-full">
                              <ICONS.Globe className="w-5 h-5 text-[#9FC7B7]" />
                           </div>
                           <h3 className="text-lg serif italic text-[#F8F9FA]">SDG Alignment</h3>
                        </div>
                        <div className="space-y-6">
                           {/* Extract SDG data dynamically based on common shapes */}
                           {(() => {
                              // Safely extract from result variations
                              const rawSdgs = result?.sdg_mapping || (result as any)?.sdgs || (result as any)?.sdgAlignment || (result as any)?.sdg;

                              // Development debug log requested by user
                              console.log("SDG Payload Debug:", { rawSdgs, result });

                              // Ensure we have an array
                              let sdgList: any[] = [];
                              if (Array.isArray(rawSdgs)) {
                                 sdgList = rawSdgs;
                              } else if (rawSdgs && typeof rawSdgs === 'object') {
                                 // Convert basic map to array if necessary, or just skip if it's purely a dict without clear values
                                 sdgList = Object.values(rawSdgs).filter(v => v !== null && typeof v === 'object');
                              }

                              if (sdgList && sdgList.length > 0) {
                                 return sdgList.map((sdg: any, index: number) => {
                                    // Handle cases where the ID is named 'id' instead of 'goal', or 'title' vs 'label'
                                    const goalId = sdg.goal || sdg.id || "?";
                                    const scoreMatch = sdg.score !== undefined ? sdg.score : (sdg.match || 0.5); // Fallback to 50% if score is truly missing but present
                                    const label = sdg.label || sdg.title || sdg.why || "Goal aligned";

                                    return (
                                       <div key={index} className="space-y-2">
                                          <div className="flex justify-between items-end">
                                             <span className="text-[10px] font-black uppercase tracking-widest text-[#CFE5DA]">
                                                Goal {goalId}
                                             </span>
                                             <span className="text-sm font-bold text-emerald-600">
                                                {Math.round((scoreMatch || 0) * 100)}% Match
                                             </span>
                                          </div>
                                          <div className="h-2 bg-[#0B5A47] rounded-full overflow-hidden">
                                             <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                                style={{ width: `${Math.round((scoreMatch || 0) * 100)}%` }}
                                             ></div>
                                          </div>
                                          <p className="text-[10px] text-[#9FC7B7] font-medium leading-relaxed">
                                             {label}
                                          </p>
                                       </div>
                                    );
                                 });
                              } else {
                                 return (
                                    <div className="text-xs text-[#CFE5DA]/50 uppercase font-black tracking-widest">
                                       SDG data not available for this product
                                    </div>
                                 );
                              }
                           })()}
                        </div>
                     </div>

                     {/* Greenwashing Detector */}
                     <GreenwashingCard risk={detectGreenwashing(result)} />

                     {/* Certifications Card (Restyled) */}
                     <div className="glass p-8 rounded-[2.5rem] bg-[#0B5A47] border border-emerald-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]"></div>
                        <div className="relative z-10">
                           <h3 className="text-lg serif italic text-[#F8F9FA] mb-1">Certifications</h3>
                           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-6">Verified Claims</p>

                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <ICONS.CheckCircle className="w-5 h-5 text-[#CFE5DA]0" />
                                 <span className="text-sm font-medium text-[#CFE5DA]">Data-driven analysis</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <ICONS.CheckCircle className="w-5 h-5 text-[#CFE5DA]0" />
                                 <span className="text-sm font-medium text-[#CFE5DA]">AI-verified description</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bottom Actions */}
               <div className="grid grid-cols-1 gap-6">
                  {/* Findings Details */}
                  <div className="glass p-8 rounded-[2rem] border border-emerald-500/20 bg-[#0B5A47] shadow-sm flex flex-col">
                     <div className="flex items-center gap-3 mb-6">
                        <ICONS.Zap className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-[#F8F9FA] font-black text-xs uppercase tracking-widest">Detailed Analysis Notes</h4>
                     </div>
                     <ul className="space-y-3 flex-grow max-h-[300px] overflow-y-auto pr-2">
                        {result.key_findings && result.key_findings.length > 0 ? result.key_findings.map((finding, i) => (
                           <li key={i} className="flex items-start gap-2.5 bg-[#054231]/30 p-3 rounded-xl border border-emerald-500/10">
                              <ICONS.CheckCircle className="w-4 h-4 text-[#CFE5DA]0 mt-0.5 flex-shrink-0" />
                              <span className="text-xs font-bold text-[#CFE5DA] leading-relaxed">{finding}</span>
                           </li>
                        )) : (
                           <li className="text-sm text-[#CFE5DA]/50 uppercase font-black tracking-widest">Notes Unavailable</li>
                        )}
                     </ul>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Analyzer;

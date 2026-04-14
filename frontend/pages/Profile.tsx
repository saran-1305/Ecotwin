import React from 'react';
import { useApp } from '../context/AppContext';
import { ICONS } from '../constants';
import EcoGrowthWidget from '../components/EcoGrowthWidget';

const PriorityGridItem = ({ label, value, onChange, icon: Icon }: any) => (
   <div className={`p-8 rounded-[2.5rem] bg-[#0B5A47] transition-all border-2 shadow-sm ${value > 3 ? 'border-emerald-600/20 bg-[#0B5A47]/30' : 'border-emerald-50'}`}>
      <div className="flex justify-between items-start mb-6">
         <div className={`p-3 rounded-2xl ${value > 3 ? 'bg-[#CFE5DA] text-[#054231] shadow-md' : 'bg-[#0B5A47] text-emerald-300 shadow-inner'}`}>
            <Icon className="w-6 h-6" />
         </div>
         <div className="text-3xl font-black text-emerald-600 tabular-nums">{value}</div>
      </div>
      <h4 className="text-lg font-bold mb-2 serif italic text-[#F8F9FA]">{label}</h4>
      <input
         type="range"
         min="1"
         max="5"
         step="1"
         value={value}
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="w-full h-1.5 bg-[#0B5A47] rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
      <div className="flex justify-between text-[9px] uppercase font-black text-emerald-300 mt-4 tracking-widest">
         <span>Standard</span>
         <span>Critical</span>
      </div>
   </div>
);

const Profile = () => {
   const { preferences, setPreferences } = useApp();

   const handleChange = (key: keyof typeof preferences, value: number) => {
      setPreferences({ ...preferences, [key]: value });
   };

   return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 pb-32">
         <header className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4">
               <div className="text-emerald-600 font-black text-[10px] tracking-[0.4em] uppercase">User Identity Config</div>
               <h1 className="text-6xl md:text-7xl serif italic text-[#F8F9FA] tracking-tight">Audit Identity</h1>
            </div>
            <EcoGrowthWidget />
         </header>

         <section className="space-y-10">
            <div className="flex items-center gap-4">
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#9FC7B7]">Priority Matrix</h2>
               <div className="h-px flex-grow bg-[#0B5A47]"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <PriorityGridItem
                  label="Plastic Avoidance"
                  icon={ICONS.Leaf}
                  value={preferences.avoidPlastic}
                  onChange={(v: number) => handleChange('avoidPlastic', v)}
               />
               <PriorityGridItem
                  label="Ethical Branding"
                  icon={ICONS.User}
                  value={preferences.ethicalBrands}
                  onChange={(v: number) => handleChange('ethicalBrands', v)}
               />
               <PriorityGridItem
                  label="Local Proximity"
                  icon={ICONS.Globe}
                  value={preferences.preferLocal}
                  onChange={(v: number) => handleChange('preferLocal', v)}
               />
               <PriorityGridItem
                  label="Carbon Density"
                  icon={ICONS.Chart}
                  value={preferences.lowCarbon}
                  onChange={(v: number) => handleChange('lowCarbon', v)}
               />
               <PriorityGridItem
                  label="Lifecycle Cycle"
                  icon={ICONS.Globe}
                  value={preferences.recyclable}
                  onChange={(v: number) => handleChange('recyclable', v)}
               />

               <div className="p-8 rounded-[2.5rem] bg-[#0B5A47]/50 border-4 border-dashed border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-4 opacity-50 group hover:opacity-100 transition-opacity">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-300">New Dimensions</div>
                  <p className="text-xs font-bold text-emerald-400">Custom matrix in v2.0</p>
                  <button className="w-12 h-12 rounded-full bg-[#0B5A47] text-emerald-300 flex items-center justify-center text-2xl font-black group-hover:bg-emerald-400 group-hover:text-[#054231] transition-all shadow-sm">+</button>
               </div>
            </div>
         </section>

         <section className="bg-[#0B5A47] rounded-[3rem] p-12 border border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 gap-12 shadow-sm relative overflow-hidden">
            <div className="space-y-6 relative z-10">
               <h3 className="text-4xl serif italic text-[#F8F9FA]">Data & Privacy</h3>
               <p className="text-[#CFE5DA] text-sm font-medium leading-relaxed max-w-sm">
                  Your audit history is strictly localized. We prioritize green transparency without compromising your consumption privacy.
               </p>
               <div className="space-y-4 pt-4">
                  <button className="w-full bg-[#0B5A47] border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black text-[#9FC7B7] uppercase tracking-widest hover:bg-emerald-400 hover:text-[#054231] transition-all shadow-sm">
                     Export Audit Ledger (JSON)
                  </button>
                  <button className="w-full bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-[#F8F9FA] transition-all">
                     Wipe Data Identity
                  </button>
               </div>
            </div>
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 border border-emerald-400 flex flex-col justify-center text-center space-y-6 relative z-10 shadow-lg shadow-black/20">
               <h4 className="text-xl serif italic text-[#F8F9FA]">Impact Digest</h4>
               <p className="text-xs text-[#CFE5DA] font-medium leading-relaxed">Weekly encrypted summaries of your sustainable progress and carbon offsets.</p>
               <div className="flex items-center justify-center gap-6">
                  <span className="text-[9px] font-black text-[#CFE5DA] tracking-widest uppercase opacity-50">Inactive</span>
                  <div className="w-14 h-7 bg-[#0B5A47] rounded-full flex items-center px-1 shadow-inner">
                     <div className="w-5 h-5 bg-emerald-600 rounded-full ml-auto shadow-md"></div>
                  </div>
                  <span className="text-[9px] font-black text-[#F8F9FA] tracking-widest uppercase">Active</span>
               </div>
            </div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
         </section>
      </div>
   );
};

export default Profile;

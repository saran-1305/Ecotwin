
import React from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../constants';

const Dashboard = () => {
  const { stats, history } = useApp();

  const chartData = [
    { name: 'W1', impact: 65 },
    { name: 'W2', impact: 78 },
    { name: 'W3', impact: 82 },
    { name: 'W4', impact: stats.sustainablePurchaseRate || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 text-[#F8F9FA]">
        <div className="space-y-2">
          <div className="text-emerald-600 font-bold text-xs tracking-widest uppercase">Console v1.0.4</div>
          <h1 className="text-5xl serif italic">Impact Ledger</h1>
        </div>
        <div className="flex items-center gap-4 glass p-4 rounded-2xl shadow-sm border border-emerald-500/20">
          <div className="w-12 h-12 bg-[#CFE5DA] text-[#054231] flex items-center justify-center rounded-xl font-black text-xl">
            {stats.ecoLevel[0]}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Rank Level</div>
            <div className="font-black text-[#F8F9FA] tracking-tight">{stats.ecoLevel}</div>
          </div>
        </div>
      </header>

      {/* Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-[#F8F9FA]">
        <div className="col-span-1 md:col-span-2 glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-emerald-500/20 shadow-sm">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <ICONS.Chart className="w-8 h-8 text-emerald-600 mb-8" />
            <div>
              <div className="text-6xl font-black tracking-tighter mb-2">{stats.sustainablePurchaseRate}%</div>
              <div className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Sustainability Index</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]"></div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-emerald-300 transition-all cursor-pointer border border-emerald-500/20 shadow-sm">
          <ICONS.Leaf className="w-8 h-8 text-[#CFE5DA]0" />
          <div>
            <div className="text-4xl font-black mb-1">{stats.carbonSavedTotal}kg</div>
            <div className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">CO2 Avoided</div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between border border-emerald-500/40 bg-[#0B5A47] shadow-sm">
          <ICONS.Globe className="w-8 h-8 text-emerald-600" />
          <div>
            <div className="text-4xl font-black mb-1">{Math.round(stats.carbonSavedTotal / 20)}</div>
            <div className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Forest Credits</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Graph */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] h-[450px] border border-emerald-500/20 shadow-sm">
          <h3 className="text-xl font-bold mb-8 serif italic text-[#F8F9FA]">Performance Index</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,185,129,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#059669', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#059669', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '16px', color: '#064e3b', fontWeight: 700 }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="impact" stroke="#10b981" strokeWidth={4} fill="url(#glow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List Matrix */}
        <div className="glass p-8 rounded-[2.5rem] flex flex-col text-[#F8F9FA] border border-emerald-500/20 shadow-sm">
          <h3 className="text-xl font-bold mb-8 serif italic">Recent Audits</h3>
          <div className="space-y-6 flex-grow">
            {history.length > 0 ? history.slice(0, 5).map((item) => (
              <div key={item.ledger_id} className="flex items-center justify-between group cursor-pointer border-b border-emerald-500/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 glass border border-emerald-500/20 flex items-center justify-center rounded-xl text-xs font-black group-hover:bg-emerald-400 group-hover:text-[#054231] transition-all shadow-sm">
                    {item.eco_score !== null && item.eco_score !== undefined ? item.eco_score : '--'}
                  </div>
                  <div>
                    <div className="text-sm font-bold truncate max-w-[120px] text-[#F8F9FA]">{item.product_title || "Unknown"}</div>
                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">{item.brand || "---"}</div>
                  </div>
                </div>
                <div className="text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                  {new Date(item.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <ICONS.Leaf className="w-12 h-12 text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Establishing Ledger</p>
              </div>
            )}
          </div>
          {history.length > 0 && (
            <button className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-[#9FC7B7] transition-colors">
              View All History →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

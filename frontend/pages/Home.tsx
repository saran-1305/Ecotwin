
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const FeatureBlock = ({ icon: Icon, title, desc, step }: any) => (
  <div className="group relative p-6 bg-[#0B5A47] rounded-[2rem] hover:bg-[#0B5A47] transition-all shadow-sm border border-emerald-500/20 hover:border-emerald-500/20 overflow-hidden">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-400 group-hover:text-[#054231]/10 transition-all"></div>
    <div className="absolute top-5 right-6 text-3xl font-black text-[#CFE5DA]/5 group-hover:text-[#CFE5DA]/10 transition-colors uppercase italic">{step}</div>
    <div className="w-10 h-10 bg-emerald-600/5 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-600/10 group-hover:scale-110 transition-transform duration-500">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-bold mb-2 text-[#F8F9FA]">{title}</h3>
    <p className="text-[#CFE5DA] text-xs leading-relaxed font-medium group-hover:text-[#CFE5DA] transition-colors">{desc}</p>
  </div>
);

const Home = () => {
  return (
    <div className="space-y-40">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2000"
            alt="Sustainability Background"
            className="w-full h-full object-cover opacity-[0.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#054231]/0 via-[#043628]/80 to-[#054231]"></div>
        </div>

        <div className="max-w-7xl mx-auto py-20 text-center space-y-12 relative z-10">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-[#0B5A47] rounded-full text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase border border-emerald-500/20 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Real-time SDG Monitoring</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl md:text-9xl serif italic text-[#F8F9FA] leading-[0.9] tracking-tighter">
              SDG Aligned <br /> <span className="text-emerald-600">by design.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#CFE5DA] max-w-2xl mx-auto font-medium leading-relaxed">
              Monitor environmental metrics instantly. Map global SDG impact. Own your carbon ledger with real-time planetary telemetry.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
            <Link to="/analyzer" className="bg-[#CFE5DA] text-[#054231] px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#A7F3D0] transition-all  shadow-lg shadow-emerald-400/20 flex items-center gap-2">
              Launch Analyzer <span className="text-xl">→</span>
            </Link>
            <Link to="/dashboard" className="bg-[#0B5A47] text-[#CFE5DA] px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#A7F3D0]/50 transition-all border border-emerald-500/40 shadow-sm">
              View Insights
            </Link>
          </div>

        </div>
      </section>

      {/* Grid Features */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureBlock
          step="01"
          icon={ICONS.Leaf}
          title="Instant Auditing"
          desc="Paste any data stream and our models parse real-time environmental metrics, supply chain footprints, and SDG alignment."
        />
        <FeatureBlock
          step="02"
          icon={ICONS.Globe}
          title="SDG Mapping"
          desc="Visualize your personal contribution to UN Sustainable Development Goals with programmatic accuracy."
        />
        <FeatureBlock
          step="03"
          icon={ICONS.Chart}
          title="Carbon Ledger"
          desc="Quantify every kg of CO2 mitigated. Our telemetry-driven system awards badges for direct SDG goal achievement."
        />
      </section>

      {/* Visual Impact Section */}
      <section className="bg-[#0B5A47]/80 mx-6 py-32 rounded-[4rem] border border-emerald-500/20 relative overflow-hidden shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="md:w-1/2 space-y-8">
            <h2 className="text-5xl md:text-6xl serif italic leading-tight text-[#F8F9FA]">Environmental <br /> Monitoring, redefined.</h2>
            <p className="text-[#CFE5DA]/70 font-medium text-lg leading-relaxed">
              We translate advanced telemetry into direct SDG progress. Whether it's biodiversity, water, or carbon — we map raw data to global sustainability targets.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="text-4xl font-black text-emerald-600 tracking-tight">4.2M+</div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mt-2">SDG Datapoints</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[#CFE5DA] tracking-tight">12t</div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mt-2">Carbon Mitigated</div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative group">
            <div className="relative z-10 p-4 bg-[#0B5A47] rounded-[3rem] border border-emerald-500/20 group-hover:-translate-y-4 transition-transform duration-700 shadow-xl">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-700" alt="UI Dashboard Preview" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Final CTA - Reorganized for a more streamlined, "small" layout */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative group p-8 bg-[#0B5A47]/80 backdrop-blur-xl rounded-[3rem] text-center border border-emerald-500/20 shadow-xl overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-200/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-200/20 rounded-full blur-[80px]"></div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl serif italic text-[#F8F9FA] leading-tight">
                Join the <span className="text-emerald-600">movement.</span>
              </h2>
              <p className="text-[#CFE5DA] max-w-xl mx-auto font-medium text-sm leading-relaxed">
                Early access to the Carbon Ledger is now open. <br className="hidden md:block" />
                Start auditing your lifestyle with precision and purpose.
              </p>
            </div>

            {/* Redesigned Insight Grid */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#0B5A47]/60 rounded-2xl border border-emerald-500/20/50 text-left space-y-2 hover:bg-[#0B5A47] transition-colors duration-500 shadow-sm group/card">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600/10 rounded-lg flex items-center justify-center text-emerald-600 group-hover/card:scale-110 transition-transform">
                    <ICONS.Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Advanced Telemetry</span>
                </div>
                <h4 className="text-sm font-bold text-[#F8F9FA]">Environment Monitoring</h4>
                <p className="text-[11px] text-[#CFE5DA] leading-relaxed font-medium">
                  Real-time tracking of product lifecycles and material ethics through deep neural parsing.
                </p>
              </div>

              <div className="p-5 bg-[#0B5A47]/60 rounded-2xl border border-emerald-500/20/50 text-left space-y-2 hover:bg-[#0B5A47] transition-colors duration-500 shadow-sm group/card">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600/10 rounded-lg flex items-center justify-center text-emerald-600 group-hover/card:scale-110 transition-transform">
                    <ICONS.Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Global Standards</span>
                </div>
                <h4 className="text-sm font-bold text-[#F8F9FA]">SDG Alignment</h4>
                <p className="text-[11px] text-[#CFE5DA] leading-relaxed font-medium">
                  Programmatic mapping to UN Sustainable Development Goals for measurable planetary impact.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button className="group/btn relative px-10 py-4 bg-emerald-400 rounded-xl font-bold text-base text-[#054231] hover:bg-[#A7F3D0] transition-all duration-300 shadow-xl hover:shadow-emerald-400/30 overflow-hidden">
                <span className="relative z-10">Create Account</span>
              </button>
              <div className="flex items-center gap-2 text-emerald-300 text-[9px] font-bold uppercase tracking-[0.2em]">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Instant Auditing Enabled
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

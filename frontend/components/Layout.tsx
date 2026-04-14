import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ICONS } from '../constants';
import { useApp } from '../context/AppContext';
import { ProfilePopover } from './ProfilePopover';

const Navbar = () => {
  const { user } = useApp();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const navItems = [
    { name: 'Console', path: '/dashboard' },
    { name: 'Scan', path: '/analyzer' },
    { name: 'Ledger', path: '/history' },
    { name: 'Identity', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-emerald-500/20 mx-4 mt-4 rounded-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
            <ICONS.Leaf className="h-5 w-5 text-[#F8F9FA]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#F8F9FA]">EcoImpact <span className="text-emerald-600">AI</span></span>
        </Link>
        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                ? 'bg-[#CFE5DA] text-[#054231] shadow-md shadow-emerald-400/20'
                : 'text-[#CFE5DA] hover:text-[#F8F9FA] hover:bg-[#0B5A47]'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 bg-[#0B5A47] rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-900 transition-colors border border-emerald-500/40 shadow-sm"
              title="Profile"
            >
              <ICONS.User className="w-5 h-5" />
            </button>
            {showProfile && <ProfilePopover onClose={() => setShowProfile(false)} />}
          </div>
        ) : (
          <Link to="/login" className="bg-[#CFE5DA] text-[#054231] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#A7F3D0] transition-all shadow-sm">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-emerald-500/20 py-16 px-6 mt-20 bg-[#0B5A47]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <ICONS.Leaf className="h-6 w-6 text-emerald-600" />
              <span className="text-2xl font-bold italic serif text-[#F8F9FA]">EcoImpact AI</span>
            </div>
            <p className="text-[#CFE5DA] max-w-sm leading-relaxed text-sm">
              The intelligence layer for high-conscious living. Advanced carbon auditing through professional green-tech intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
            <div>
              <h4 className="text-[#F8F9FA] font-bold mb-4 uppercase tracking-widest text-[10px]">Navigation</h4>
              <ul className="space-y-3 text-sm text-[#9FC7B7] font-medium">
                <li><Link to="/analyzer" className="hover:text-emerald-600 transition-colors">Analyzer</Link></li>
                <li><Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/history" className="hover:text-emerald-600 transition-colors">History</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#F8F9FA] font-bold mb-4 uppercase tracking-widest text-[10px]">Methodology</h4>
              <ul className="space-y-3 text-sm text-[#9FC7B7] font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Carbon Audit</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">SDG Guide</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-emerald-500/20 flex justify-between items-center text-[10px] text-emerald-400 font-bold tracking-widest">
          <span>&copy; {new Date().getFullYear()} ECOIMPACT AI SYSTEM</span>
          <span>EST. 2025 // GREEN TECH VERIFIED</span>
        </div>
      </footer>
    </div>
  );
};

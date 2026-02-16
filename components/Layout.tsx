
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ICONS } from '../constants';

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Console', path: '/dashboard' },
    { name: 'Scan', path: '/analyzer' },
    { name: 'Ledger', path: '/history' },
    { name: 'Identity', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-emerald-100 mx-4 mt-4 rounded-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-emerald-600 rounded-lg shadow-emerald-100 shadow-lg group-hover:scale-110 transition-transform">
            <ICONS.Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-emerald-950">EcoImpact <span className="text-emerald-600">AI</span></span>
        </Link>
        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === item.path 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <button className="bg-emerald-100 text-emerald-800 px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
          Sign In
        </button>
      </div>
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-emerald-100 py-16 px-6 mt-20 bg-emerald-50/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <ICONS.Leaf className="h-6 w-6 text-emerald-600" />
              <span className="text-2xl font-bold italic serif text-emerald-950">EcoImpact AI</span>
            </div>
            <p className="text-emerald-800/60 max-w-sm leading-relaxed text-sm">
              The intelligence layer for high-conscious living. Advanced carbon auditing through professional green-tech intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
            <div>
              <h4 className="text-emerald-950 font-bold mb-4 uppercase tracking-widest text-[10px]">Navigation</h4>
              <ul className="space-y-3 text-sm text-emerald-700 font-medium">
                <li><Link to="/analyzer" className="hover:text-emerald-600 transition-colors">Analyzer</Link></li>
                <li><Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/history" className="hover:text-emerald-600 transition-colors">History</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-950 font-bold mb-4 uppercase tracking-widest text-[10px]">Methodology</h4>
              <ul className="space-y-3 text-sm text-emerald-700 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Carbon Audit</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">SDG Guide</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-emerald-100 flex justify-between items-center text-[10px] text-emerald-400 font-bold tracking-widest">
          <span>&copy; {new Date().getFullYear()} ECOIMPACT AI SYSTEM</span>
          <span>EST. 2025 // GREEN TECH VERIFIED</span>
        </div>
      </footer>
    </div>
  );
};

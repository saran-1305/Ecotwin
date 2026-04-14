
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { ICONS } from '../constants';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ username, email, password });
            navigate('/dashboard');
            window.location.reload();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-24 px-6 bg-[#054231] relative z-10">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-emerald-900/[0.02]"></div>
            </div>
            <div className="bg-[#054231] rounded-[2.5rem] shadow-2xl border border-emerald-800/30 w-full max-w-5xl flex flex-col md:flex-row-reverse overflow-hidden relative z-10">
                {/* Visual Side */}
                <div className="md:w-1/2 bg-emerald-900 relative hidden md:block overflow-hidden p-12 flex flex-col justify-end">
                    <img
                        src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1200"
                        alt="Nature"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent"></div>

                    <div className="relative z-10 space-y-4 text-[#F8F9FA] text-right flex flex-col items-end">
                        <div className="inline-flex items-center gap-2 p-2 bg-[#106B53]/30 rounded-xl backdrop-blur-md border border-emerald-500/40 mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#CFE5DA] pl-2">Join the Movement</span>
                            <ICONS.Globe className="w-5 h-5 text-emerald-300" />
                        </div>
                        <h2 className="text-4xl serif italic leading-tight">Quantify <br />your impact.</h2>
                        <p className="text-[#CFE5DA]/80 font-medium max-w-sm">Join thousands mapping their consumption to UN Sustainability Goals.</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-[#054231] relative">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-[#106B53]/20 rounded-2xl mb-6 text-emerald-400 border border-emerald-500/20 shadow-inner">
                            <ICONS.User className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl serif italic text-[#F8F9FA]">Create Account</h2>
                        <p className="text-[#CFE5DA] text-sm mt-2 font-medium">Set up your sustainability profile</p>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-900/40 border border-red-500/30 text-red-200 text-xs font-bold rounded-xl text-center animate-in fade-in slide-in-from-top-2">{error}</div>}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CFE5DA] ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#0B5A47] border border-emerald-500/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#CFE5DA] focus:ring-2 focus:ring-[#CFE5DA]/20 transition-all text-[#F8F9FA] font-medium placeholder:text-[#CFE5DA]/60"
                                placeholder="johndoe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CFE5DA] ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0B5A47] border border-emerald-500/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#CFE5DA] focus:ring-2 focus:ring-[#CFE5DA]/20 transition-all text-[#F8F9FA] font-medium placeholder:text-[#CFE5DA]/60"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CFE5DA] ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0B5A47] border border-emerald-500/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#CFE5DA] focus:ring-2 focus:ring-[#CFE5DA]/20 transition-all text-[#F8F9FA] font-medium placeholder:text-[#CFE5DA]/60"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#CFE5DA] text-[#054231] py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-[#A7F3D0] transition-all shadow-lg hover:shadow-emerald-400/30 active:scale-[0.98]"
                            >
                                Register Now
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-[#9FC7B7] pt-6 border-t border-emerald-500/20">
                        Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline underline-offset-4 transition-colors">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

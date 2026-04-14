import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { updateProfile, logout } from '../services/authService';
import { ICONS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const ProfilePopover = ({ onClose }: { onClose: () => void }) => {
    const { user, setUser } = useApp();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await updateProfile({ username, email });
            setUser(updatedUser);
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to update profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate('/login');
        onClose();
    };

    return (
        <div ref={popoverRef} className="absolute top-16 right-0 w-72 bg-[#0B5A47] rounded-2xl shadow-xl border border-emerald-500/20 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#0B5A47] rounded-full flex items-center justify-center text-emerald-600">
                    <ICONS.User className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-black text-[#F8F9FA] uppercase tracking-widest">Profile</div>
                    <div className="text-[10px] font-bold text-emerald-400">Manage Account</div>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full text-sm font-bold text-[#F8F9FA] border-b border-emerald-500/40 focus:outline-none focus:border-emerald-500 bg-transparent py-1"
                        placeholder="Username"
                    />
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full text-xs font-medium text-emerald-600 border-b border-emerald-500/40 focus:outline-none focus:border-emerald-500 bg-transparent py-1"
                        placeholder="Email"
                    />
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleSave} disabled={loading} className="flex-1 text-[10px] bg-[#CFE5DA] text-[#054231] py-2 rounded-xl uppercase font-black hover:bg-[#A7F3D0] transition-colors">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 text-[10px] bg-[#0B5A47] text-[#CFE5DA] py-2 rounded-xl uppercase font-black hover:bg-[#106B53] transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-1">
                    <div className="text-lg font-bold text-[#F8F9FA]">{user?.username || 'Guest'}</div>
                    <div className="text-sm text-emerald-600/80 font-medium truncate mb-4">{user?.email || 'No email'}</div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full text-left text-xs font-bold text-emerald-600 hover:text-[#CFE5DA] py-2 transition-colors flex items-center gap-2"
                    >
                        <span>Edit Profile</span>
                    </button>

                    <div className="h-px bg-[#0B5A47] my-2"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-bold text-red-500 hover:text-red-700 py-2 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

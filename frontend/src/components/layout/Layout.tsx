import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Search,
    Settings,
    LogOut,
    ScanLine,
    Menu,
    X,
    Sun,
    Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { pathname } = useLocation();
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/analyze", label: "New Scan", icon: Search },
        { href: "/onboarding/preferences", label: "Preferences", icon: Settings }, // Re-using onboarding for settings
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-4 space-y-6">
            <div className="flex items-center gap-2 px-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <ScanLine className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    EcoTwin
                </span>
            </div>

            <div className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} to={item.href} onClick={() => setIsMobileOpen(false)}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3",
                                    isActive && "bg-secondary/50 font-semibold"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-xs text-muted-foreground">Theme</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    Log Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden subtle-noise">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden md:flex w-64 border-r bg-card/50 backdrop-blur-xl flex-col z-20"
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <ScanLine className="w-6 h-6 text-primary" />
                    <span className="font-bold">EcoTwin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-background md:hidden pt-16"
                    >
                        <SidebarContent />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
                {/* Demo Mode Chip */}
                {import.meta.env.VITE_USE_MOCK !== 'false' && (
                    <div className="fixed top-4 right-4 z-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800 font-mono opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
                        DEMO MODE
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-5xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

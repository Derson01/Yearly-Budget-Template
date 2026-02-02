'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import NavLink from "@/components/NavLink";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-sm">Loading YearlyBudget...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation - Only show if user is logged in and not on auth pages */}
            {user && !isAuthPage && (
                <nav className="glass-header">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center space-x-8">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/" className="flex items-center">
                                        <span className="text-xl font-bold tracking-tight text-slate-900 border-l-4 border-accent pl-3">
                                            Yearly<span className="text-accent">Budget</span>
                                        </span>
                                    </Link>
                                </div>

                                <div className="hidden sm:flex sm:space-x-1">
                                    <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                                    <NavLink href="/budget" icon={<Wallet size={18} />} label="Budget" />
                                    <NavLink href="/transactions" icon={<CreditCard size={18} />} label="Transactions" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-slate-500 font-medium mr-2">{user.email}</div>
                                <Link
                                    href="/settings"
                                    className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <SettingsIcon size={20} />
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-sm text-slate-400 hover:text-accent transition-colors font-medium border-l border-slate-200 pl-4"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className={user && !isAuthPage ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" : "max-w-7xl mx-auto"}>
                {children}
            </main>
        </div>
    );
}

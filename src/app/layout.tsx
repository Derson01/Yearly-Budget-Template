import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Wallet, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import NavLink from "@/components/NavLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YearlyBudget | Premium Finance Tracker",
  description: "High-end annual budget management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          {/* Navigation */}
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

                <div className="flex items-center">
                  <Link
                    href="/settings"
                    className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <SettingsIcon size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2 } from 'lucide-react';
import { settingsApi } from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState({ year: new Date().getFullYear(), currency: 'EUR' });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await settingsApi.get();
                if (res.data.length > 0) setSettings(res.data[0]);
            } catch (err) {
                console.error('Settings load failed');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await settingsApi.create(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Error updating settings');
        }
    };

    if (loading) return <div className="p-10 text-slate-400">Syncing preferences...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center">
                <div className="inline-flex p-3 bg-accent/10 rounded-2xl mb-4 group transition-all duration-300">
                    <SettingsIcon size={32} className="text-accent group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuration</h1>
                <p className="text-slate-500 mt-1">Set the context for your annual financial tracking.</p>
            </div>

            <div className="card-premium">
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fiscal Year</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none font-medium transition-all"
                                value={settings.year}
                                onChange={e => setSettings({ ...settings, year: parseInt(e.target.value) })}
                            />
                            <p className="text-[10px] text-slate-400">All calculations will be scoped to this year.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Currency</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none font-medium transition-all"
                                value={settings.currency}
                                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="GBP">British Pound (£)</option>
                                <option value="CHF">Swiss Franc (Fr)</option>
                            </select>
                            <p className="text-[10px] text-slate-400">Used for symbol formatting across the app.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className={`transition-opacity duration-300 flex items-center gap-2 text-emerald-500 font-medium text-sm ${saved ? 'opacity-100' : 'opacity-0'}`}>
                            <CheckCircle2 size={16} />
                            Settings updated
                        </div>
                        <button type="submit" className="btn-primary min-w-[140px] flex items-center justify-center gap-2">
                            <Save size={18} />
                            Apply Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center text-[10px] text-slate-300">
                Yearly Budget Application — v1.0 Next.js Edition
            </div>
        </div>
    );
}

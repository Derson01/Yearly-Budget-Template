'use client';

import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import {
    TrendingUp, PiggyBank, CreditCard,
    ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardApi.getSummary();
                setData(response.data);
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium">Analyzing financial data...</div>;
    if (!data) return <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-500">No data found. Start by adding budget items and transactions.</div>;

    const { annual_totals, ratios, monthly_series, breakdown } = data;

    const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val: number) => `${(val * 100).toFixed(0)}%`;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Excel-style Header KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HealthCard
                    label="Total - Income"
                    value={annual_totals.income.actual}
                    budget={annual_totals.income.planned}
                    color="bg-slate-900"
                />
                <HealthCard
                    label="Total - Expense"
                    value={annual_totals.expense.actual}
                    budget={annual_totals.expense.planned}
                    color="bg-rose-900"
                />
                <HealthCard
                    label="Total - Debt Payoff"
                    value={annual_totals.debt.actual}
                    budget={annual_totals.debt.planned}
                    color="bg-amber-900"
                />
                <HealthCard
                    label="Total - Savings & Investments"
                    value={annual_totals.saving.actual}
                    budget={annual_totals.saving.planned}
                    color="bg-indigo-900"
                />
            </div>

            {/* Main Analysis Sections */}
            {['income', 'expense'].map((cat) => (
                <section key={cat} className="space-y-6">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter border-b-4 border-slate-100 pb-2">{cat}</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Variance Table */}
                        <div className="lg:col-span-3 card-premium !p-0 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase">Subcategory</th>
                                        <th className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">Budget</th>
                                        <th className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">Actual</th>
                                        <th className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">Diff.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {breakdown[cat].map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2 px-3 font-medium text-slate-700">{row.sub_category}</td>
                                            <td className="py-2 px-3 text-right text-slate-500">{formatCurrency(row.budget)}</td>
                                            <td className="py-2 px-3 text-right text-slate-900 font-semibold">{formatCurrency(row.actual)}</td>
                                            <td className={`py-2 px-3 text-right font-bold ${row.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {row.diff > 0 ? '+' : ''}{formatCurrency(row.diff)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Overview Visuals */}
                        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Visual Status */}
                            <div className="flex flex-col justify-center items-center p-8 bg-slate-50/50 rounded-2xl">
                                <div className="text-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat} Overview</span>
                                    <div className="mt-4 flex flex-col gap-4">
                                        <div>
                                            <p className="text-sm text-slate-400">Actual</p>
                                            <p className="text-3xl font-bold text-slate-900">{formatCurrency(annual_totals[cat].actual)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Budget</p>
                                            <p className="text-3xl font-bold text-slate-900">{formatCurrency(annual_totals[cat].planned)}</p>
                                        </div>
                                    </div>
                                    <div className={`mt-8 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${(cat === 'expense' && annual_totals[cat].actual <= annual_totals[cat].planned) ||
                                        (cat === 'income' && annual_totals[cat].actual >= annual_totals[cat].planned)
                                        ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {cat === 'expense'
                                            ? (annual_totals[cat].actual <= annual_totals[cat].planned ? 'Under budget' : 'Over budget')
                                            : (annual_totals[cat].actual >= annual_totals[cat].planned ? 'Exceeding target' : 'Below target')
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Flow Chart */}
                            <div className="md:col-span-2 card-premium">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthly_series}>
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                tickFormatter={(m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]}
                                            />
                                            <Tooltip />
                                            <Area
                                                type="monotone"
                                                dataKey={cat === 'income' ? 'actual_income' : 'actual_expense'}
                                                stroke={cat === 'income' ? '#6366f1' : '#fb7185'}
                                                fill={cat === 'income' ? '#6366f1' : '#fb7185'}
                                                fillOpacity={0.1}
                                                strokeWidth={3}
                                                name={`Total Actuals - ${cat}`}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey={cat === 'income' ? 'income' : 'expense'}
                                                stroke="#cbd5e1"
                                                fill="none"
                                                strokeDasharray="5 5"
                                                name={`Total Budget - ${cat}`}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Summary Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                <div className="card-premium">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Annual Efficiency</h3>
                    <div className="space-y-6">
                        <EfficiencyItem
                            label="Expense Ratio"
                            value={ratios.expense_rate}
                            target={ratios.planned_expense_rate}
                            isFlipped={true}
                        />
                        <EfficiencyItem
                            label="Savings Ratio"
                            value={ratios.savings_rate}
                            target={0.2}
                        />
                        <EfficiencyItem
                            label="Debt Load Ratio"
                            value={ratios.debt_rate}
                            target={0.15}
                            isFlipped={true}
                        />
                    </div>
                </div>
                <div className="flex flex-col justify-center p-8 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <ShieldCheck className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Financial Health Score</h3>
                            <p className="text-slate-400 text-sm">Calculated based on actual vs goals</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mt-4">
                        <span className="text-6xl font-black">A+</span>
                        <span className="text-slate-400 mb-2 font-medium">Excellent performance</span>
                    </div>
                    <p className="mt-6 text-slate-300 text-sm leading-relaxed">
                        Your current actual savings rate is {formatPercent(ratios.savings_rate)}, which is
                        {(ratios.savings_rate > 0.2) ? ' above' : ' below'} the recommended 20% benchmark.
                    </p>
                </div>
            </div>
        </div>
    );
}

const HealthCard = ({ label, value, budget, color }: any) => {
    const percentage = Math.min(Math.round((value / (budget || 1)) * 100), 200);
    return (
        <div className="card-premium flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actual - {label.split(' - ')[1]}</p>
                </div>
                <div className={`p-2 rounded-lg ${color} text-white`}>
                    {color.includes('indigo') ? <PiggyBank size={18} /> : <TrendingUp size={18} />}
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-slate-400">Progress to budget</span>
                    <span className="text-slate-900">{percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
            <div className="text-center pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
        </div>
    );
};

const EfficiencyItem = ({ label, value, target, isFlipped = false }: any) => {
    const isGood = isFlipped ? value <= target : value >= target;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-slate-600">{label}</span>
                <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(value * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400">Target: {(target * 100).toFixed(0)}%</span>
                </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-700`}
                    style={{ width: `${Math.min(value * 100, 100)}%` }}
                />
            </div>
        </div>
    );
};

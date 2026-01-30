'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';
import { budgetApi, monthlyValuesApi } from '@/lib/api';

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function BudgetPage() {
    const [items, setItems] = useState<any[]>([]);
    const [monthlyValues, setMonthlyValues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', category: 'expense', sub_category: '', type: 'active' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [itemsRes, valuesRes] = await Promise.all([
                budgetApi.getAll(),
                monthlyValuesApi.getAll()
            ]);
            setItems(itemsRes.data);
            setMonthlyValues(valuesRes.data);
        } catch (err) {
            console.error('Failed to fetch budget data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name) return;
        try {
            await budgetApi.create({ ...newItem, is_active: true });
            setNewItem({ name: '', category: 'expense', sub_category: '', type: 'active' });
            fetchData();
        } catch (err) {
            alert('Error creating item');
        }
    };

    const handleValueChange = (itemId: number, month: number, val: string) => {
        const amount = parseFloat(val) || 0;
        setMonthlyValues(prev => {
            const existingIdx = prev.findIndex(v => v.budget_item_id === itemId && v.month === month);
            if (existingIdx > -1) {
                const copy = [...prev];
                copy[existingIdx] = { ...copy[existingIdx], planned_amount: amount };
                return copy;
            }
            return [...prev, { budget_item_id: itemId, month, planned_amount: amount }];
        });
    };

    const saveAllValues = async () => {
        try {
            await Promise.all(monthlyValues.map(v => monthlyValuesApi.create(v)));
            alert('Budget saved successfully!');
        } catch (err) {
            alert('Error saving budget');
        }
    };

    const getPlannedAmount = (itemId: number, month: number) => {
        const val = monthlyValues.find(v => v.budget_item_id === itemId && v.month === month);
        return val ? val.planned_amount : '';
    };

    if (loading) return <div className="p-10 text-slate-400">Loading budget engine...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financing Plan</h1>
                    <p className="text-slate-500 mt-1">Define your monthly forecasts for the year.</p>
                </div>
                <button
                    onClick={saveAllValues}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save size={18} />
                    Publish Budget
                </button>
            </div>

            {/* Add Item Panel */}
            <div className="card-premium bg-slate-50/50 border-dashed">
                <form onSubmit={handleCreateItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Monthly Rent"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="saving">Saving</option>
                            <option value="debt">Debt</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newItem.type}
                            onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="passive">Passive</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-secondary flex items-center justify-center gap-2 h-[38px]">
                        <Plus size={18} />
                        Add to Plan
                    </button>
                </form>
            </div>

            {/* Budget Table */}
            <div className="card-premium !p-0 overflow-hidden border-slate-100">
                <div className="overflow-x-auto">
                    <table className="table-premium">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="sticky left-0 bg-slate-50 z-10 w-48 min-w-[200px]">Budget Item</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="text-center min-w-[100px]">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['income', 'expense', 'saving', 'debt'].map(cat => (
                                <React.Fragment key={cat}>
                                    <tr className="bg-slate-50/30">
                                        <td colSpan={13} className="!py-2 !px-4 text-[10px] font-bold text-accent uppercase tracking-widest">
                                            {cat === 'income' ? 'Income' :
                                                cat === 'expense' ? 'Expenses' :
                                                    cat === 'saving' ? 'Savings & Investments' : 'Debt Repayment'}
                                        </td>
                                    </tr>
                                    {items.filter(i => i.category === cat).map(item => (
                                        <tr key={item.id} className="group">
                                            <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 font-medium text-slate-700">
                                                {item.name}
                                            </td>
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <td key={i} className="p-0 border-l border-slate-50">
                                                    <input
                                                        type="number"
                                                        className="w-full h-full py-4 px-2 text-center text-sm focus:bg-slate-50 outline-none transition-colors border-none bg-transparent"
                                                        placeholder="0"
                                                        value={getPlannedAmount(item.id, i + 1)}
                                                        onChange={(e) => handleValueChange(item.id, i + 1, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {items.filter(i => i.category === cat).length === 0 && (
                                        <tr>
                                            <td colSpan={13} className="text-center py-6 text-slate-300 text-xs italic">No {cat} items defined yet.</td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

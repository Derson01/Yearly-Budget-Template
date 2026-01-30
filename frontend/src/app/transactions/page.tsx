'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Filter, Download } from 'lucide-react';
import { transactionsApi, budgetApi } from '@/lib/api';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [budgetItems, setBudgetItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTx, setNewTx] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        budget_item_id: '',
        comment: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [txRes, itemsRes] = await Promise.all([
                transactionsApi.getAll(),
                budgetApi.getAll()
            ]);
            setTransactions(txRes.data);
            setBudgetItems(itemsRes.data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTx.amount || !newTx.budget_item_id) return;
        try {
            await transactionsApi.create(newTx);
            setNewTx({ date: new Date().toISOString().split('T')[0], amount: '', budget_item_id: '', comment: '' });
            fetchData();
        } catch (err) {
            alert('Error creating transaction');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this transaction?')) {
            await transactionsApi.delete(id);
            fetchData();
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

    if (loading) return <div className="p-10 text-slate-400">Loading ledger...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ledger</h1>
                    <p className="text-slate-500 mt-1">Detailed history of all actual movements.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Quick Add Form */}
            <div className="card-premium">
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newTx.date}
                            onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newTx.budget_item_id}
                            onChange={e => setNewTx({ ...newTx, budget_item_id: e.target.value })}
                        >
                            <option value="">Select Item...</option>
                            {budgetItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newTx.amount}
                            onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comment</label>
                        <input
                            type="text"
                            placeholder="Note..."
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={newTx.comment}
                            onChange={e => setNewTx({ ...newTx, comment: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-[38px]">
                        <Plus size={18} />
                        Capture
                    </button>
                </form>
            </div>

            {/* Transactions Table */}
            <div className="card-premium !p-0 overflow-hidden">
                <table className="table-premium">
                    <thead className="bg-slate-50/80">
                        <tr>
                            <th>Date</th>
                            <th>Reference Item</th>
                            <th>Comment</th>
                            <th className="text-right">Amount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-20 text-slate-400 italic">No transactions recorded yet.</td>
                            </tr>
                        ) : (
                            transactions.map(tx => {
                                const item = budgetItems.find(i => i.id === tx.budget_item_id);
                                const isExpense = item?.category === 'expense';
                                return (
                                    <tr key={tx.id}>
                                        <td className="w-1/6 font-medium text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(tx.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="w-1/4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                {item?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="text-slate-400 italic text-xs">{tx.comment || '-'}</td>
                                        <td className={`text-right font-bold ${isExpense ? 'text-slate-900' : 'text-emerald-600'}`}>
                                            {isExpense ? '-' : '+'}{formatCurrency(tx.amount)}
                                        </td>
                                        <td className="text-right pr-6">
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="p-1 hover:text-rose-500 text-slate-300 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

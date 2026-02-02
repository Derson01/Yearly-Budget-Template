from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from decimal import Decimal
from models.budget_item import BudgetItem
from models.monthly_value import MonthlyValue
from models.transaction import Transaction
from models.settings import Settings
from typing import Dict, List, Any

class FinanceEngine:
    def __init__(self, db: AsyncSession, user_id: int):
        self.db = db
        self.user_id = user_id

    async def get_dashboard_summary(self) -> Dict[str, Any]:
        items_res = await self.db.execute(
            select(BudgetItem)
            .options(selectinload(BudgetItem.monthly_values))
            .where(BudgetItem.user_id == self.user_id)
        )
        items = items_res.scalars().all()
        
        tx_res = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == self.user_id)
        )
        transactions = tx_res.scalars().all()
        
        settings_res = await self.db.execute(
            select(Settings)
            .where(Settings.user_id == self.user_id)
            .limit(1)
        )
        db_settings = settings_res.scalar_one_or_none()

        categories = ["income", "expense", "saving", "debt"]
        totals = {cat: {"planned": 0.0, "actual": 0.0} for cat in categories}
        monthly_series = [{"month": i, "income": 0.0, "expense": 0.0, "actual_income": 0.0, "actual_expense": 0.0} for i in range(1, 13)]
        type_breakdown = {"active": {"planned": 0.0, "actual": 0.0}, "passive": {"planned": 0.0, "actual": 0.0}}

        for item in items:
            cat = item.category.lower()
            if cat not in totals: continue
            for mv in item.monthly_values:
                amt = float(mv.planned_amount)
                totals[cat]["planned"] += amt
                if cat == "income": monthly_series[mv.month-1]["income"] += amt
                elif cat == "expense": monthly_series[mv.month-1]["expense"] += amt
                type_breakdown[item.type]["planned"] += amt

        item_map = {item.id: item for item in items}
        for tx in transactions:
            item = item_map.get(tx.budget_item_id)
            if not item: continue
            cat = item.category.lower()
            amt = float(tx.amount)
            totals[cat]["actual"] += amt
            m_idx = tx.date.month - 1
            if cat == "income": monthly_series[m_idx]["actual_income"] += amt
            elif cat == "expense": monthly_series[m_idx]["actual_expense"] += amt
            type_breakdown[item.type]["actual"] += amt

        final_totals = {}
        for cat in categories:
            p, a = totals[cat]["planned"], totals[cat]["actual"]
            diff = (a - p) if cat in ["income", "saving", "debt"] else (p - a)
            final_totals[cat] = {"planned": p, "actual": a, "diff": diff}

        breakdown = {cat: [] for cat in categories}
        for item in items:
            p_ann = sum(float(mv.planned_amount) for mv in item.monthly_values)
            a_ann = sum(float(tx.amount) for tx in transactions if tx.budget_item_id == item.id)
            cat = item.category.lower()
            breakdown[cat].append({
                "sub_category": item.name, "budget": p_ann, "actual": a_ann, 
                "diff": (a_ann - p_ann) if cat in ["income", "saving", "debt"] else (p_ann - a_ann),
                "type": item.type
            })

        inc_p, inc_a = totals["income"]["planned"] or 1.0, totals["income"]["actual"] or 1.0
        ratios = {
            "expense_rate": totals["expense"]["actual"] / inc_a,
            "savings_rate": totals["saving"]["actual"] / inc_a,
            "debt_rate": totals["debt"]["actual"] / inc_a,
            "planned_expense_rate": totals["expense"]["planned"] / inc_p
        }

        return {
            "annual_totals": final_totals,
            "ratios": ratios,
            "monthly_series": monthly_series,
            "breakdown": breakdown,
            "type_breakdown": type_breakdown,
            "settings": {"year": db_settings.year if db_settings else 2025, "currency": db_settings.currency if db_settings else "EUR"}
        }

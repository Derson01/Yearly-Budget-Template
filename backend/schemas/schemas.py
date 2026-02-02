from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date, datetime
from decimal import Decimal

# Settings
class SettingsBase(BaseModel):
    year: int
    currency: str = "EUR"

class SettingsCreate(SettingsBase):
    pass

class Settings(SettingsBase):
    id: int
    class Config:
        from_attributes = True

# Monthly Values
class MonthlyValueBase(BaseModel):
    budget_item_id: int
    month: int
    planned_amount: Decimal = Decimal("0.00")

class MonthlyValueCreate(MonthlyValueBase):
    pass

class MonthlyValue(MonthlyValueBase):
    id: int
    class Config:
        from_attributes = True

# Budget Items
class BudgetItemBase(BaseModel):
    name: str
    category: str
    sub_category: Optional[str] = None
    type: str = "active"
    is_active: bool = True

class BudgetItemCreate(BudgetItemBase):
    pass

class BudgetItem(BudgetItemBase):
    id: int
    monthly_values: List[MonthlyValue] = []
    class Config:
        from_attributes = True

# Transactions
class TransactionBase(BaseModel):
    date: date
    amount: Decimal
    budget_item_id: int
    comment: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    budget_item_id: int
    budget_item: Optional[BudgetItem] = None

    class Config:
        from_attributes = True

# --- Authentication ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Dashboard Analytics ---
class CategorySummary(BaseModel):
    planned: float
    actual: float
    diff: float

class CategoryBreakdown(BaseModel):
    sub_category: str
    budget: float
    actual: float
    diff: float
    type: str

class MonthlyData(BaseModel):
    month: int
    income: float
    expense: float
    actual_income: float
    actual_expense: float

class DashboardRatios(BaseModel):
    expense_rate: float
    savings_rate: float
    debt_rate: float
    planned_expense_rate: float

class TypeSummary(BaseModel):
    planned: float
    actual: float

class DashboardSettings(BaseModel):
    year: int
    currency: str

class DashboardSummary(BaseModel):
    annual_totals: Dict[str, CategorySummary]
    ratios: DashboardRatios
    monthly_series: List[MonthlyData]
    breakdown: Dict[str, List[CategoryBreakdown]]
    type_breakdown: Dict[str, TypeSummary]
    settings: DashboardSettings

from sqlalchemy import Column, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from database import Base

class MonthlyValue(Base):
    __tablename__ = "monthly_values"

    id = Column(Integer, primary_key=True, index=True)
    budget_item_id = Column(Integer, ForeignKey("budget_items.id"), nullable=False)
    month = Column(Integer, nullable=False) # 1 to 12
    planned_amount = Column(Numeric, default=0.00)

    budget_item = relationship("BudgetItem", back_populates="monthly_values")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    # Categories: income, expense, saving, debt
    category = Column(String, nullable=False)
    
    # Sub-category or grouping
    sub_category = Column(String, nullable=True)
    
    # Active / Passive type (important for some ratio calculations)
    type = Column(String, default="active") 
    
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="budget_items")
    monthly_values = relationship("MonthlyValue", back_populates="budget_item", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="budget_item")

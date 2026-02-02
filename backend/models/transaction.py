from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)
    budget_item_id = Column(Integer, ForeignKey("budget_items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    budget_item = relationship("BudgetItem", back_populates="transactions")

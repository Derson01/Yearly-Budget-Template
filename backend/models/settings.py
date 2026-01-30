from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    currency = Column(String, default="EUR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import monthly_value as models
from schemas import schemas

router = APIRouter(prefix="/monthly-values", tags=["monthly-values"])

@router.get("/", response_model=List[schemas.MonthlyValue])
async def read_monthly_values(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MonthlyValue))
    return result.scalars().all()

@router.post("/", response_model=schemas.MonthlyValue)
async def create_monthly_value(value: schemas.MonthlyValueCreate, db: AsyncSession = Depends(get_db)):
    # Upsert logic: Check if exists for this item and month
    query = select(models.MonthlyValue).where(
        models.MonthlyValue.budget_item_id == value.budget_item_id,
        models.MonthlyValue.month == value.month
    )
    result = await db.execute(query)
    db_val = result.scalar_one_or_none()

    if db_val:
        # Update existing
        db_val.planned_amount = value.planned_amount
    else:
        # Create new
        db_val = models.MonthlyValue(**value.dict())
        db.add(db_val)
    
    await db.commit()
    await db.refresh(db_val)
    return db_val

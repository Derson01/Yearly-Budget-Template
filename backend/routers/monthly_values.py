from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import monthly_value as models
from models.user import User
from schemas import schemas
from services import auth_utils

router = APIRouter(prefix="/monthly-values", tags=["monthly-values"])

@router.get("/", response_model=List[schemas.MonthlyValue])
async def read_monthly_values(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    result = await db.execute(
        select(models.MonthlyValue)
        .where(models.MonthlyValue.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.MonthlyValue)
async def create_monthly_value(
    value: schemas.MonthlyValueCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    # Upsert logic: Check if exists for this item, month AND user
    query = select(models.MonthlyValue).where(
        models.MonthlyValue.budget_item_id == value.budget_item_id,
        models.MonthlyValue.month == value.month,
        models.MonthlyValue.user_id == current_user.id
    )
    result = await db.execute(query)
    db_val = result.scalar_one_or_none()

    if db_val:
        # Update existing
        db_val.planned_amount = value.planned_amount
    else:
        # Create new
        db_val = models.MonthlyValue(**value.dict(), user_id=current_user.id)
        db.add(db_val)
    
    await db.commit()
    await db.refresh(db_val)
    return db_val

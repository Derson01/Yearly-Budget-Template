from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
from models import budget_item as models
from schemas import schemas

router = APIRouter(prefix="/budget-items", tags=["budget-items"])

@router.get("/", response_model=List[schemas.BudgetItem])
async def read_budget_items(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    # Eager load monthly_values
    result = await db.execute(
        select(models.BudgetItem)
        .options(selectinload(models.BudgetItem.monthly_values))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.BudgetItem)
async def create_budget_item(item: schemas.BudgetItemCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.BudgetItem(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    
    # Reload with relationships to avoid lazy load error during serialization
    result = await db.execute(
        select(models.BudgetItem)
        .options(selectinload(models.BudgetItem.monthly_values))
        .where(models.BudgetItem.id == db_item.id)
    )
    return result.scalar_one()

@router.delete("/{item_id}")
async def delete_budget_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.BudgetItem).where(models.BudgetItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"ok": True}

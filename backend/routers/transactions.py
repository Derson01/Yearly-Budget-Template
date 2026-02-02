from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
from models.transaction import Transaction
from models.budget_item import BudgetItem
from models.user import User
from schemas import schemas
from services import auth_utils

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=List[schemas.Transaction])
async def read_transactions(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    result = await db.execute(
        select(Transaction)
        .options(
            selectinload(Transaction.budget_item)
            .selectinload(BudgetItem.monthly_values)
        )
        .where(Transaction.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.Transaction)
async def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    db_transaction = Transaction(**transaction.dict(), user_id=current_user.id)
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    
    # Reload with relationships
    result = await db.execute(
        select(Transaction)
        .options(
            selectinload(Transaction.budget_item)
            .selectinload(BudgetItem.monthly_values)
        )
        .where(Transaction.id == db_transaction.id)
    )
    return result.scalar_one()

@router.delete("/{tx_id}")
async def delete_transaction(
    tx_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == tx_id, Transaction.user_id == current_user.id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.delete(tx)
    await db.commit()
    return {"ok": True}
        

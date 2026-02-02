from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import settings as models
from models.user import User
from schemas import schemas
from services import auth_utils

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=List[schemas.Settings])
async def read_settings(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    result = await db.execute(
        select(models.Settings)
        .where(models.Settings.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.Settings)
async def create_settings(
    settings: schemas.SettingsCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    # Check if settings already exist for this user
    result = await db.execute(select(models.Settings).where(models.Settings.user_id == current_user.id))
    db_settings = result.scalars().first()
    
    if db_settings:
        # Update existing
        db_settings.year = settings.year
        db_settings.currency = settings.currency
    else:
        # Create new
        db_settings = models.Settings(**settings.dict(), user_id=current_user.id)
        db.add(db_settings)
        
    await db.commit()
    await db.refresh(db_settings)
    return db_settings

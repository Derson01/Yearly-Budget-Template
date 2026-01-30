from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import settings as models
from schemas import schemas

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=List[schemas.Settings])
async def read_settings(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Settings).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=schemas.Settings)
async def create_settings(settings: schemas.SettingsCreate, db: AsyncSession = Depends(get_db)):
    db_settings = models.Settings(**settings.dict())
    db.add(db_settings)
    await db.commit()
    await db.refresh(db_settings)
    return db_settings

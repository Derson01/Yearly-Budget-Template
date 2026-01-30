from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Default to a local postgres container or service
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/yearly_budget_db")

# Render and other platforms might provide 'postgres://', but asyncpg needs 'postgresql+asyncpg://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Check if we should use SSL (typical for cloud managed databases)
# If the URL contains 'render.com' or the user explicitly asks for it
connect_args = {}
if "render.com" in DATABASE_URL or os.getenv("DB_SSL", "false").lower() == "true":
    connect_args["ssl"] = "require"

engine = create_async_engine(DATABASE_URL, echo=True, connect_args=connect_args)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Default to a local postgres container or service
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/yearly_budget_db")

# Render and other platforms might provide 'postgres://', but asyncpg needs 'postgresql+asyncpg://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Log the database host we are connecting to (masked for safety)
from urllib.parse import urlparse
parsed = urlparse(DATABASE_URL)
print(f"Connecting to Database Host: {parsed.hostname}:{parsed.port or 5432}")

# Check if we should use SSL
# Internal Render URLs typically don't need SSL, while External ones do.
connect_args = {}

# If URL contains 'sslmode=require', strip it and handle in connect_args
if "sslmode=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")
    connect_args["ssl"] = "require"
elif "render.com" in DATABASE_URL or os.getenv("DB_SSL", "false").lower() == "true":
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

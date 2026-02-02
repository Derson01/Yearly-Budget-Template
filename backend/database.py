from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import os
import ssl

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/yearly_budget_db")

# Fix for cloud providers (Render, Railway, etc.)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Render/Production usually requires SSL but often uses self-signed certificates
ssl_context = None
# Only use SSL if we are NOT on localhost/local network and NOT in docker-compose (host 'db' or 'postgres')
is_local = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL or "@db:" in DATABASE_URL or "@postgres:" in DATABASE_URL

if not is_local or os.getenv("RENDER"):
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"ssl": ssl_context} if ssl_context else {}
)


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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

app = FastAPI(
    title="Yearly Budget App Backend",
    description="Backend reproducing Excel Yearly Budget Template logic",
    version="1.0.0"
)

# CORS (Allowing frontend origins)
# For production, allow all origins. You can restrict this later to specific domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Yearly Budget Backend is running"}

# Include Routers
from routers import settings, budget_items, monthly_values, transactions, dashboard, auth
# Import models to ensure they are registered with Base.metadata
from models import user, settings as settings_model, budget_item, monthly_value, transaction

app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(budget_items.router)
app.include_router(monthly_values.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)


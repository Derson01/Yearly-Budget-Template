import pytest
import asyncio
from httpx import AsyncClient
from .main import app
from .database import engine, Base

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.mark.asyncio
async def test_dashboard_logic():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # 1. Check Root
        response = await ac.get("/")
        assert response.status_code == 200
        
        # 2. Add Setting
        response = await ac.post("/settings/", json={"year": 2024, "currency": "EUR"})
        assert response.status_code == 200
        
        # 3. Add Budget Item
        item_data = {
            "name": "Rent",
            "category": "expense",
            "sub_category": "Housing",
            "type": "active",
            "is_active": True
        }
        response = await ac.post("/budget-items/", json=item_data)
        assert response.status_code == 200
        item_id = response.json()["id"]
        
        # 4. Set Planned Value (Jan: 1000)
        mv_data = {
            "budget_item_id": item_id,
            "month": 1,
            "planned_amount": 1000.0
        }
        response = await ac.post("/monthly-values/", json=mv_data)
        assert response.status_code == 200

        # 5. Get Dashboard Summary
        response = await ac.get("/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        
        # Verify annual planned expense is 1000
        assert data["annual_totals"]["expense"]["planned"] == 1000.0
        # Ratios should be 0 because no income transactions yet
        assert data["ratios"]["expense_rate"] == 0

from models.user import User
from schemas import schemas
from services.finance_engine import FinanceEngine
from services import auth_utils

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    engine = FinanceEngine(db, current_user.id)
    return await engine.get_dashboard_summary()

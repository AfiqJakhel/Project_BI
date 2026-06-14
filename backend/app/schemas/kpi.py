from pydantic import BaseModel
from typing import Optional

class KPIComparison(BaseModel):
    previous_period_net_profit: float
    change_percent: float

class KPISummaryResponse(BaseModel):
    year: Optional[int]
    gross_revenue: float
    expenses: float
    net_profit: float
    active_customers: int = 0
    total_purchases: float = 0
    comparison: Optional[KPIComparison] = None

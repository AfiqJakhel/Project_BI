from pydantic import BaseModel
from typing import List, Optional

class CustomerSummaryResponse(BaseModel):
    total_customers: int
    new_customers_this_month: int
    repeat_purchase_rate: float

class CustomerData(BaseModel):
    id: str
    nama: str
    no_hp: str
    total_order: int
    total_spend: float
    last_purchase: str
    segment: str

class CustomerSegmentsResponse(BaseModel):
    data: List[CustomerData]

from pydantic import BaseModel
from typing import List

class MonthlySalesData(BaseModel):
    month: int
    month_name: str
    gross_revenue: float
    net_profit: float

class MonthlySalesResponse(BaseModel):
    data: List[MonthlySalesData]

class YearlySalesData(BaseModel):
    year: int
    gross_revenue: float
    net_profit: float

class YearlySalesResponse(BaseModel):
    data: List[YearlySalesData]

class CashRatioData(BaseModel):
    period: str  # e.g., "Jan", "2022", or "Jan 2022"
    tunai: float
    non_tunai: float

class CashRatioResponse(BaseModel):
    data: List[CashRatioData]

class OperationalRatioData(BaseModel):
    period: str
    bruto: float
    operational_cost: float
    ratio: float  # (operational_cost / bruto) * 100

class OperationalRatioResponse(BaseModel):
    data: List[OperationalRatioData]

class HeatmapData(BaseModel):
    date: str
    value: int
    revenue: float

class HeatmapResponse(BaseModel):
    data: List[HeatmapData]

class RecentTransactionData(BaseModel):
    id: str
    date: str
    customer: str
    items: str
    total: float
    status: str

class RecentTransactionsResponse(BaseModel):
    data: List[RecentTransactionData]

class TopProductData(BaseModel):
    id: str
    name: str
    category: str
    qty: int
    revenue: float

class TopProductsResponse(BaseModel):
    data: List[TopProductData]

from pydantic import BaseModel
from typing import List

class CategoryData(BaseModel):
    category_name: str
    total_amount: float
    percentage: float

class ExpensesCategoriesResponse(BaseModel):
    data: List[CategoryData]

class LainLainDetail(BaseModel):
    keterangan: str
    total_amount: float

class ExpensesLainLainResponse(BaseModel):
    data: List[LainLainDetail]

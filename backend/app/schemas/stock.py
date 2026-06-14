from pydantic import BaseModel
from typing import List

class LowStockItem(BaseModel):
    nama_barang: str
    supplier_name: str
    qty_sisa: int

class LowStockResponse(BaseModel):
    threshold_used: int
    data: List[LowStockItem]

class StockSummaryResponse(BaseModel):
    total_qty_sisa: int
    total_nilai_modal_sisa: float

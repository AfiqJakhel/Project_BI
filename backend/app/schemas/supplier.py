from pydantic import BaseModel
from typing import List

class TopSupplierItem(BaseModel):
    nama_supplier: str
    jumlah_transaksi: int
    total_qty: float
    total_nilai_pembelian: float

class TopSuppliersResponse(BaseModel):
    data: List[TopSupplierItem]

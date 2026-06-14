from pydantic import BaseModel
from typing import List

class InventoryKPIResponse(BaseModel):
    total_sku_aktif: int
    total_nilai_inventori: float
    produk_hampir_habis: int
    produk_out_of_stock: int

class KategoriItem(BaseModel):
    kategori: str
    jumlah_sku: int
    nilai_inventori: float

class InventoryKategoriResponse(BaseModel):
    data: List[KategoriItem]

class AlertItem(BaseModel):
    id: str
    nama_produk: str
    kategori: str
    stok_tersedia: int
    stok_minimum: int
    status: str

class InventoryAlertResponse(BaseModel):
    data: List[AlertItem]

class ScatterItem(BaseModel):
    nama: str
    stok: int
    laju_jual: float
    kategori: str

class MutasiItem(BaseModel):
    bulan: str
    stok_masuk: float
    stok_keluar: float
    nilai_masuk: float

class InventoryAnalysisResponse(BaseModel):
    scatter_data: List[ScatterItem]
    mutasi_data: List[MutasiItem]

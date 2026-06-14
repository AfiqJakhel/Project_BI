import pandas as pd
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/metadata")
def get_report_metadata(db: Session = Depends(get_db)):
    sales_rows = db.execute(text("SELECT COUNT(*) FROM Fakta_PenjualanHarian")).scalar() or 0
    stock_rows = db.execute(text("SELECT COUNT(*) FROM Fakta_StokBarang")).scalar() or 0
    
    # Estimate size (very rough: ~100 bytes per row)
    sales_size_kb = max(1, (sales_rows * 100) // 1024)
    stock_size_kb = max(1, (stock_rows * 100) // 1024)
    
    return {
        "sales": {"rows": sales_rows, "size_kb": sales_size_kb},
        "stock": {"rows": stock_rows, "size_kb": stock_size_kb}
    }

@router.get("/sales/csv")
def export_sales_csv(db: Session = Depends(get_db)):
    sql = """
        SELECT 
            w.tanggal as Tanggal,
            w.nama_hari as Hari,
            p.bruto as Omzet_Kotor,
            p.pemasukan_tunai as Pendapatan_Tunai,
            p.pemasukan_non_tunai as Pendapatan_Non_Tunai,
            p.biaya_keluar_harian as Pengeluaran_Harian,
            p.nett as Pendapatan_Bersih
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        ORDER BY w.tanggal DESC
    """
    df = pd.read_sql(sql, db.bind)
    
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=laporan_penjualan.csv"
    return response

@router.get("/stock/csv")
def export_stock_csv(db: Session = Depends(get_db)):
    sql = """
        SELECT 
            b.nama_barang as Nama_Barang,
            b.kategori_barang as Kategori,
            s.qty_masuk as Total_Masuk,
            s.qty_keluar as Total_Keluar,
            s.qty_sisa as Stok_Tersedia,
            s.nilai_modal_sisa as Nilai_Aset
        FROM Fakta_StokBarang s
        JOIN Dim_Barang b ON s.barang_id = b.barang_id
        ORDER BY s.qty_sisa DESC
    """
    df = pd.read_sql(sql, db.bind) 
    
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=laporan_stok.csv"
    return response

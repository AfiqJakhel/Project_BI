from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.stock import StockSummaryResponse, LowStockResponse, LowStockItem

router = APIRouter(prefix="/api/stock", tags=["Stock"])

@router.get("/summary", response_model=StockSummaryResponse)
def get_stock_summary(db: Session = Depends(get_db)):
    sql = """
        SELECT 
            SUM(qty_sisa) as total_qty_sisa,
            SUM(nilai_modal_sisa) as total_nilai_modal_sisa
        FROM Fakta_StokBarang
    """
    result = db.execute(text(sql)).mappings().fetchone()
    
    return StockSummaryResponse(
        total_qty_sisa=int(result["total_qty_sisa"] or 0),
        total_nilai_modal_sisa=float(result["total_nilai_modal_sisa"] or 0)
    )

@router.get("/low-stock", response_model=LowStockResponse)
def get_low_stock(
    threshold: int = Query(10, description="Threshold for low stock items"),
    db: Session = Depends(get_db)
):
    sql = """
        SELECT 
            b.nama_barang,
            s.nama_supplier,
            fs.qty_sisa
        FROM Fakta_StokBarang fs
        JOIN Dim_Barang b ON fs.barang_id = b.barang_id
        LEFT JOIN (
            # Getting latest supplier for each item based on barang masuk
            # Simplified for now by joining the first match, or we can use string aggregation
            # Let's just use string agg since an item might have multiple suppliers
            SELECT barang_id, MAX(supplier_id) as supp_id
            FROM Fakta_BarangMasuk
            GROUP BY barang_id
        ) latest_supp ON b.barang_id = latest_supp.barang_id
        LEFT JOIN Dim_Supplier s ON latest_supp.supp_id = s.supplier_id
        WHERE fs.qty_sisa < :threshold
        ORDER BY fs.qty_sisa ASC
    """
    
    result = db.execute(text(sql), {"threshold": threshold}).mappings().fetchall()
    
    data = []
    for row in result:
        data.append(LowStockItem(
            nama_barang=row["nama_barang"],
            supplier_name=row["nama_supplier"] or "Unknown",
            qty_sisa=int(row["qty_sisa"])
        ))
        
    return LowStockResponse(
        threshold_used=threshold,
        data=data
    )

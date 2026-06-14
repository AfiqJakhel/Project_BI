from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.supplier import TopSuppliersResponse, TopSupplierItem
from app.dependencies import get_time_filter, TimeFilter, apply_time_filter_sql
from app.routers.sales import get_latest_sales_year

router = APIRouter(prefix="/api/supplier", tags=["Supplier"])

@router.get("/top", response_model=TopSuppliersResponse)
def get_top_suppliers(
    period: str = "bulanan",
    db: Session = Depends(get_db),
    time_filter: TimeFilter = Depends(get_time_filter)
):
    if period == "tahunan":
        time_filter.year = None
        time_filter.month = None
        where_clause, params = apply_time_filter_sql(time_filter, date_col="w.tanggal", table_alias="w")
    else:
        where_clause, params = apply_time_filter_sql(time_filter, date_col="w.tanggal", table_alias="w")
        if not where_clause:
            latest_year = get_latest_sales_year(db)
            where_clause = " AND w.tahun = :fallback_year "
            params["fallback_year"] = latest_year
    
    sql = f"""
        SELECT 
            s.nama_supplier,
            COUNT(bm.barang_masuk_id) AS jumlah_transaksi,
            SUM(bm.qty) AS total_qty,
            SUM(bm.jumlah) AS total_nilai_pembelian
        FROM Fakta_BarangMasuk bm
        JOIN Dim_Supplier s ON bm.supplier_id = s.supplier_id
        JOIN Dim_Waktu w ON bm.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY s.supplier_id, s.nama_supplier
        ORDER BY total_nilai_pembelian DESC
        LIMIT 10
    """
    
    result = db.execute(text(sql), params).mappings().fetchall()
    
    data = []
    for row in result:
        data.append(TopSupplierItem(
            nama_supplier=row["nama_supplier"] or "Unknown",
            jumlah_transaksi=int(row["jumlah_transaksi"] or 0),
            total_qty=float(row["total_qty"] or 0),
            total_nilai_pembelian=float(row["total_nilai_pembelian"] or 0)
        ))
        
    return TopSuppliersResponse(data=data)

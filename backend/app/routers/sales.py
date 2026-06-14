from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.sales import (
    MonthlySalesResponse, MonthlySalesData,
    YearlySalesResponse, YearlySalesData,
    CashRatioResponse, CashRatioData,
    OperationalRatioResponse, OperationalRatioData,
    HeatmapResponse, HeatmapData,
    RecentTransactionsResponse, RecentTransactionData,
    TopProductsResponse, TopProductData
)
from app.dependencies import get_time_filter, TimeFilter, apply_time_filter_sql

router = APIRouter(prefix="/api/sales", tags=["Sales"])

def get_latest_sales_year(db: Session) -> int:
    query = text("""
        SELECT MAX(w.tahun)
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
    """)
    res = db.execute(query).fetchone()
    return res[0] if res and res[0] else 2024

@router.get("/monthly", response_model=MonthlySalesResponse)
def get_monthly_sales(
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

    if period == "mingguan":
        group_by = "YEARWEEK(w.tanggal, 3)"
        month_name = "CONCAT('Mg ', WEEK(w.tanggal, 3))"
        sort_by = "YEARWEEK(w.tanggal, 3)"
    elif period == "tahunan":
        group_by = "w.tahun"
        month_name = "CAST(w.tahun AS CHAR)"
        sort_by = "w.tahun"
    else: # bulanan
        group_by = "w.bulan"
        month_name = "MAX(w.nama_bulan)"
        sort_by = "w.bulan"

    sql = f"""
        SELECT 
            {group_by} as month,
            {month_name} as month_name,
            SUM(p.bruto) as gross_revenue,
            SUM(p.nett) as net_profit
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY {group_by}
        ORDER BY {sort_by} ASC
    """
    
    result = db.execute(text(sql), params).mappings().fetchall()
    
    data = []
    for i, row in enumerate(result):
        data.append(MonthlySalesData(
            month=i+1,
            month_name=str(row["month_name"]),
            gross_revenue=float(row["gross_revenue"] or 0),
            net_profit=float(row["net_profit"] or 0)
        ))
        
    return MonthlySalesResponse(data=data)

@router.get("/yearly", response_model=YearlySalesResponse)
def get_yearly_sales(db: Session = Depends(get_db)):
    sql = """
        SELECT 
            w.tahun as year,
            SUM(p.bruto) as gross_revenue,
            SUM(p.nett) as net_profit
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        GROUP BY w.tahun
        ORDER BY w.tahun ASC
    """
    result = db.execute(text(sql)).mappings().fetchall()
    
    data = []
    for row in result:
        data.append(YearlySalesData(
            year=row["year"],
            gross_revenue=float(row["gross_revenue"] or 0),
            net_profit=float(row["net_profit"] or 0)
        ))
    return YearlySalesResponse(data=data)

@router.get("/cash-ratio", response_model=CashRatioResponse)
def get_cash_ratio(
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
    
    if period == "mingguan":
        group_by = "YEARWEEK(w.tanggal, 3)"
        month_name = "CONCAT('Mg ', WEEK(w.tanggal, 3))"
        sort_by = "YEARWEEK(w.tanggal, 3)"
    elif period == "tahunan":
        group_by = "w.tahun"
        month_name = "CAST(w.tahun AS CHAR)"
        sort_by = "w.tahun"
    else:
        group_by = "w.bulan"
        month_name = "MAX(w.nama_bulan)"
        sort_by = "w.bulan"

    sql = f"""
        SELECT 
            {month_name} as month_name,
            SUM(p.pemasukan_tunai) as tunai,
            SUM(p.pemasukan_non_tunai) as non_tunai
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY {group_by}
        ORDER BY {sort_by} ASC
    """
    result = db.execute(text(sql), params).mappings().fetchall()
    
    data = []
    for row in result:
        m_name = str(row["month_name"])
        data.append(CashRatioData(
            period=m_name[:3] if period == "bulanan" else m_name,
            tunai=float(row["tunai"] or 0),
            non_tunai=float(row["non_tunai"] or 0)
        ))
    return CashRatioResponse(data=data)

@router.get("/operational-ratio", response_model=OperationalRatioResponse)
def get_operational_ratio(
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
        
    if period == "mingguan":
        group_by = "YEARWEEK(w.tanggal, 3)"
        month_name = "CONCAT('Mg ', WEEK(w.tanggal, 3))"
        sort_by = "YEARWEEK(w.tanggal, 3)"
    elif period == "tahunan":
        group_by = "w.tahun"
        month_name = "CAST(w.tahun AS CHAR)"
        sort_by = "w.tahun"
    else:
        group_by = "w.bulan"
        month_name = "MAX(w.nama_bulan)"
        sort_by = "w.bulan"

    sql = f"""
        SELECT 
            {month_name} as month_name,
            SUM(p.bruto) as bruto,
            SUM(p.biaya_keluar_harian) as operational_cost
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY {group_by}
        ORDER BY {sort_by} ASC
    """
    result = db.execute(text(sql), params).mappings().fetchall()
    
    data = []
    for row in result:
        bruto = float(row["bruto"] or 0)
        operational_cost = float(row["operational_cost"] or 0)
        ratio = (operational_cost / bruto * 100) if bruto > 0 else 0
        
        m_name = str(row["month_name"])
        data.append(OperationalRatioData(
            period=m_name[:3] if period == "bulanan" else m_name,
            bruto=bruto,
            operational_cost=operational_cost,
            ratio=round(ratio, 2)
        ))
    return OperationalRatioResponse(data=data)

@router.get("/activity")
def get_sales_activity(
    year: int,
    db: Session = Depends(get_db)
):
    sql = """
        SELECT 
            w.bulan as month,
            SUM(p.bruto) as total
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        WHERE w.tahun = :year
        GROUP BY w.bulan
        ORDER BY w.bulan ASC
    """
    result = db.execute(text(sql), {"year": year}).mappings().fetchall()
    
    data = []
    for row in result:
        data.append({
            "month": row["month"],
            "total": float(row["total"] or 0)
        })
    return {"data": data}

@router.get("/heatmap", response_model=HeatmapResponse)
def get_sales_heatmap(
    db: Session = Depends(get_db),
    time_filter: TimeFilter = Depends(get_time_filter)
):
    where_clause, params = apply_time_filter_sql(time_filter, date_col="w.tanggal", table_alias="w")
    if not where_clause:
        latest_year = get_latest_sales_year(db)
        where_clause = " AND w.tahun = :fallback_year "
        params["fallback_year"] = latest_year
        
    sql = f"""
        SELECT 
            w.tanggal,
            SUM(p.bruto) as revenue
        FROM Fakta_PenjualanHarian p
        JOIN Dim_Waktu w ON p.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY w.tanggal
        ORDER BY w.tanggal ASC
    """
    result = db.execute(text(sql), params).mappings().fetchall()
    
    sql_tx = f"""
        SELECT 
            w.tanggal,
            COUNT(t.transaksi_id) as tx_count
        FROM Fakta_Transaksi t
        JOIN Dim_Waktu w ON t.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY w.tanggal
    """
    tx_result = db.execute(text(sql_tx), params).mappings().fetchall()
    tx_map = {row["tanggal"].isoformat() if hasattr(row["tanggal"], "isoformat") else str(row["tanggal"]): row["tx_count"] for row in tx_result}
    
    data = []
    for row in result:
        date_str = row["tanggal"].isoformat() if hasattr(row["tanggal"], "isoformat") else str(row["tanggal"])
        # If tx_count is 0 but there is revenue, we just set value to 1 to show activity, or use the actual count
        count = tx_map.get(date_str, 0)
        if count == 0 and float(row["revenue"] or 0) > 0:
            count = 1
            
        data.append(HeatmapData(
            date=date_str,
            revenue=float(row["revenue"] or 0),
            value=count
        ))
        
    return HeatmapResponse(data=data)

@router.get("/recent", response_model=RecentTransactionsResponse)
def get_recent_transactions(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    sql = """
        SELECT 
            t.transaksi_id as id,
            t.waktu,
            COALESCE(p.nama, 'Pelanggan Umum') as customer,
            'Lihat Detail' as items,
            t.total_nilai as total,
            t.status
        FROM Fakta_Transaksi t
        LEFT JOIN Dim_Pelanggan p ON t.pelanggan_id = p.pelanggan_id
        ORDER BY t.waktu DESC
        LIMIT :limit
    """
    result = db.execute(text(sql), {"limit": limit}).mappings().fetchall()
    
    data = []
    for row in result:
        date_str = row["waktu"].strftime('%Y-%m-%d %H:%M') if hasattr(row["waktu"], "strftime") else str(row["waktu"])
        data.append(RecentTransactionData(
            id=str(row["id"]),
            date=date_str,
            customer=str(row["customer"]),
            items=str(row["items"]),
            total=float(row["total"] or 0),
            status=str(row["status"]).lower()
        ))
    return RecentTransactionsResponse(data=data)

@router.get("/top-products", response_model=TopProductsResponse)
def get_top_products(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    sql = """
        SELECT 
            b.barang_id as id,
            b.nama_barang as name,
            COALESCE(b.kategori_barang, SUBSTRING_INDEX(b.nama_barang, ' ', 1)) as category,
            COALESCE(fs.qty_keluar, 0) as qty,
            COALESCE(fs.qty_keluar * fs.modal, 0) as revenue
        FROM Dim_Barang b
        JOIN Fakta_StokBarang fs ON b.barang_id = fs.barang_id
        WHERE fs.qty_keluar > 0
        ORDER BY fs.qty_keluar DESC
        LIMIT :limit
    """
    result = db.execute(text(sql), {"limit": limit}).mappings().fetchall()
    
    data = []
    for row in result:
        data.append(TopProductData(
            id=str(row["id"]),
            name=str(row["name"]),
            category=str(row["category"]),
            qty=int(row["qty"] or 0),
            revenue=float(row["revenue"] or 0)
        ))
    return TopProductsResponse(data=data)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.expenses import ExpensesCategoriesResponse, CategoryData, ExpensesLainLainResponse, LainLainDetail
from app.dependencies import get_time_filter, TimeFilter, apply_time_filter_sql
from app.routers.sales import get_latest_sales_year

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("/categories", response_model=ExpensesCategoriesResponse)
def get_expenses_categories(
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
            kb.nama_kategori as category_name,
            SUM(e.jumlah_pengeluaran) as total_amount
        FROM Fakta_Pengeluaran e
        JOIN Dim_KategoriBiaya kb ON e.kategori_biaya_id = kb.kategori_biaya_id
        JOIN Dim_Waktu w ON e.date_id = w.date_id
        WHERE 1=1 {where_clause}
        GROUP BY kb.kategori_biaya_id, kb.nama_kategori
        ORDER BY total_amount DESC
    """
    
    result = db.execute(text(sql), params).mappings().fetchall()
    
    total_all = sum([float(r["total_amount"]) for r in result])
    
    data = []
    for row in result:
        amount = float(row["total_amount"] or 0)
        percentage = (amount / total_all * 100) if total_all > 0 else 0
        data.append(CategoryData(
            category_name=row["category_name"],
            total_amount=amount,
            percentage=round(percentage, 2)
        ))
        
    return ExpensesCategoriesResponse(data=data)

@router.get("/lain-lain", response_model=ExpensesLainLainResponse)
def get_lain_lain_details(
    limit: int = 10,
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
            
    params["limit"] = limit
    
    sql = f"""
        SELECT 
            e.keterangan as keterangan,
            SUM(e.jumlah_pengeluaran) as total_amount
        FROM Fakta_Pengeluaran e
        JOIN Dim_KategoriBiaya kb ON e.kategori_biaya_id = kb.kategori_biaya_id
        JOIN Dim_Waktu w ON e.date_id = w.date_id
        WHERE kb.nama_kategori = 'LAIN-LAIN' {where_clause}
        GROUP BY e.keterangan
        ORDER BY total_amount DESC
        LIMIT :limit
    """
    
    result = db.execute(text(sql), params).mappings().fetchall()
    
    data = []
    for row in result:
        data.append(LainLainDetail(
            keterangan=row["keterangan"],
            total_amount=float(row["total_amount"] or 0)
        ))
        
    return ExpensesLainLainResponse(data=data)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.kpi import KPISummaryResponse, KPIComparison
from app.dependencies import get_time_filter, TimeFilter

router = APIRouter(prefix="/api/kpi", tags=["KPI"])

@router.get("/summary", response_model=KPISummaryResponse)
def get_kpi_summary(
    db: Session = Depends(get_db),
    time_filter: TimeFilter = Depends(get_time_filter)
):
    # Fetch data from Materialized View
    query = text("SELECT * FROM mv_cashflow_yearly ORDER BY tahun DESC")
    result = db.execute(query).mappings().fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail="No KPI data found")
        
    # If year is requested, find it. Otherwise use the latest year
    target_year = time_filter.year if time_filter.year else result[0]['tahun']
    
    current_data = next((r for r in result if r['tahun'] == target_year), None)
    if not current_data:
        # If requested year is not found, return empty data structure or 404
        return KPISummaryResponse(
            year=target_year,
            gross_revenue=0,
            expenses=0,
            net_profit=0
        )
        
    previous_data = next((r for r in result if r['tahun'] == target_year - 1), None)
    
    # Calculation
    # Expenses is total_pengeluaran + total_biaya_harian (based on view)
    # Actually, total_nett is already total_bruto - total_biaya_harian.
    # Total business expenses is total_pengeluaran. So overall net profit = total_nett - total_pengeluaran
    
    gross_revenue = float(current_data['total_bruto'])
    expenses = float(current_data['total_biaya_harian']) + float(current_data['total_pengeluaran'])
    net_profit = float(current_data['total_nett']) - float(current_data['total_pengeluaran'])
    
    comparison = None
    if previous_data:
        prev_net_profit = float(previous_data['total_nett']) - float(previous_data['total_pengeluaran'])
        change = 0.0
        if prev_net_profit != 0:
            change = ((net_profit - prev_net_profit) / abs(prev_net_profit)) * 100
            
        comparison = KPIComparison(
            previous_period_net_profit=prev_net_profit,
            change_percent=round(change, 2)
        )
        
    active_customers = db.execute(text("SELECT COUNT(*) FROM dim_pelanggan")).scalar() or 0
    total_purchases = float(current_data['total_pembelian_barang']) if 'total_pembelian_barang' in current_data else 0.0
        
    return KPISummaryResponse(
        year=target_year,
        gross_revenue=gross_revenue,
        expenses=expenses,
        net_profit=net_profit,
        active_customers=active_customers,
        total_purchases=total_purchases,
        comparison=comparison
    )

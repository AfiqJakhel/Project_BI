from fastapi import Query
from typing import Optional
from datetime import date
from pydantic import BaseModel

class TimeFilter(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

def get_time_filter(
    year: Optional[int] = Query(None, description="Filter by year (e.g., 2024)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    start_date: Optional[date] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter by end date (YYYY-MM-DD)")
) -> TimeFilter:
    return TimeFilter(
        year=year,
        month=month,
        start_date=start_date,
        end_date=end_date
    )

def apply_time_filter_sql(time_filter: TimeFilter, date_col: str = "w.tanggal", table_alias: str = "w") -> tuple[str, dict]:
    """
    Returns (sql_where_clause, params_dict)
    """
    conditions = []
    params = {}
    
    if time_filter.start_date:
        conditions.append(f"{date_col} >= :start_date")
        params["start_date"] = time_filter.start_date
    if time_filter.end_date:
        conditions.append(f"{date_col} <= :end_date")
        params["end_date"] = time_filter.end_date
    if time_filter.year:
        conditions.append(f"{table_alias}.tahun = :year")
        params["year"] = time_filter.year
    if time_filter.month:
        conditions.append(f"{table_alias}.bulan = :month")
        params["month"] = time_filter.month
        
    where_clause = " AND ".join(conditions)
    if where_clause:
        where_clause = f" AND {where_clause} "
        
    return where_clause, params

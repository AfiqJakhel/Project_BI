from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings

# Jalankan dengan python -m uvicorn app.main:app --reload
# Initialize FastAPI App
app = FastAPI(
    title="ARAW Film BI API",
    description="Backend API for Business Intelligence Dashboard",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Database query failed",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

from app.routers import (
    kpi, 
    sales, 
    stock, 
    inventory,
    expenses,
    reports,
    health,
    supplier
)

app.include_router(kpi.router)
app.include_router(sales.router)
app.include_router(stock.router)
app.include_router(inventory.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(health.router)
app.include_router(supplier.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ARAW Film BI API. Go to /docs for API documentation."}

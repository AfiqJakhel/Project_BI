from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "disconnected"
    try:
        # Check DB connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        pass
        
    return {
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

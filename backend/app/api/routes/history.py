from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import HistoryItem
from app.database import db

router = APIRouter()

@router.get("/history", response_model=List[HistoryItem])
def get_analysis_history(limit: int = Query(50, ge=1, le=100)):
    """
    Fetch history of previous procurement requirement analyses.
    """
    history_records = db.get_history(limit=limit)
    return [HistoryItem(**r) for r in history_records]

@router.get("/history/{analysis_id}")
def get_history_detail(analysis_id: str):
    """
    Fetch full detail of a previously saved analysis.
    """
    item = db.get_analysis_by_id(analysis_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found."
        )
    return item

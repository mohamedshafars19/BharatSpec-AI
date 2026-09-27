import logging
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.schemas import ReportGenerateRequest
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/reports")
def list_reports():
    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"
    return db.get_reports(user_id)

@router.post("/reports/generate")
def generate_report(payload: ReportGenerateRequest):
    analysis = db.get_analysis_by_id(payload.analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Referenced analysis not found.")

    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"

    report_title = f"Standards Compliance Review: {analysis['structured_requirement'].get('product', 'Procurement Item')}"
    
    content = {
        "analysis_id": analysis["id"],
        "project_id": payload.project_id or analysis.get("project_id"),
        "title": report_title,
        "format": payload.format,
        "user_requirement": analysis["user_requirement"],
        "structured_requirement": analysis["structured_requirement"],
        "readiness_score": analysis.get("readiness_score", 72),
        "status": analysis.get("status", "Needs Review"),
        "gaps": analysis.get("gaps", []),
        "recommendations": analysis.get("recommendations", []),
        "improved_spec": analysis.get("improved_spec", ""),
        "disclaimer": "Source: Prototype Knowledge Base (Catalogued demo records for procurement review)"
    }

    rep_id = db.save_report(
        user_id=user_id,
        project_id=payload.project_id or analysis.get("project_id"),
        analysis_id=payload.analysis_id,
        title=report_title,
        format_type=payload.format,
        content=content
    )

    return {
        "status": "ok",
        "report_id": rep_id,
        "title": report_title,
        "format": payload.format,
        "content": content
    }

import logging
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.models.schemas import (
    StructuredRequirement,
    SpecificationAuditResult,
    ImprovedSpecification
)
from app.services.gap_detection_service import gap_detection_service
from app.services.spec_improvement_service import spec_improvement_service
from app.services.standards_service import standards_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/specification/audit", response_model=SpecificationAuditResult)
def audit_specification(payload: Dict[str, Any]):
    requirement_text = payload.get("requirement", "").strip()
    if not requirement_text:
        raise HTTPException(status_code=400, detail="Requirement text is required.")

    structured_data = payload.get("structured_requirement", {})
    try:
        structured_req = StructuredRequirement(**structured_data)
    except Exception:
        structured_req = StructuredRequirement(
            product="Procured Item",
            category="General",
            application="General",
            environment="Standard",
            requirements=[]
        )

    return gap_detection_service.audit_specification(
        raw_text=requirement_text,
        structured_req=structured_req
    )

@router.post("/specification/improve", response_model=ImprovedSpecification)
def improve_specification(payload: Dict[str, Any]):
    requirement_text = payload.get("requirement", "").strip()
    structured_data = payload.get("structured_requirement", {})
    primary_std_id = payload.get("primary_standard_id")

    try:
        structured_req = StructuredRequirement(**structured_data)
    except Exception:
        structured_req = StructuredRequirement(
            product="Procured Item",
            category="General",
            application="General",
            environment="Standard",
            requirements=[]
        )

    primary_std = standards_service.get_by_id(primary_std_id) if primary_std_id else None
    audit = gap_detection_service.audit_specification(requirement_text, structured_req)

    return spec_improvement_service.generate_improved_specification(
        original_text=requirement_text,
        structured_req=structured_req,
        audit=audit,
        primary_standard=primary_std
    )

import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ClarifyRequest
from app.services.requirement_service import requirement_service
from app.services.recommendation_service import recommendation_service
from app.services.clarification_service import clarification_service
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_procurement_requirement(request: AnalyzeRequest):
    """
    Analyzes natural-language procurement requirements, extracts structured parameters,
    audits specification completeness, generates clarifying questions, and maps standards.
    """
    req_text = request.requirement.strip()
    if len(req_text) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Procurement requirement must be at least 5 characters long."
        )

    try:
        # Step 1: Requirement Understanding
        structured_req = await requirement_service.parse_requirement(
            raw_text=req_text,
            hint_category=request.category,
            hint_application=request.application,
            hint_specs=request.technical_specs,
            hint_quantity=request.quantity
        )

        # Apply clarifications if provided in the initial payload
        if request.clarifications:
            structured_req = clarification_service.apply_answers(structured_req, request.clarifications)

        # Step 2: Semantic Retrieval, Gap Audit, Readiness Score, Graph & Spec Improvement
        response = await recommendation_service.generate_recommendations(
            user_requirement=req_text,
            structured_req=structured_req,
            project_id=request.project_id
        )

        return response
    except Exception as e:
        logger.error(f"Error during requirement analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete analysis right now. Please try again."
        )

@router.post("/analyze/clarify", response_model=AnalyzeResponse)
async def clarify_analysis(request: ClarifyRequest):
    """
    Applies user clarifying answers to an existing analysis, updates the requirement context,
    re-audits specification gaps, and recalculates readiness score.
    """
    existing = db.get_analysis_by_id(request.analysis_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    from app.models.schemas import StructuredRequirement
    structured_req = StructuredRequirement(**existing["structured_requirement"])

    # Apply clarification answers
    updated_structured_req = clarification_service.apply_answers(structured_req, request.answers)

    # Re-run recommendation and audit
    response = await recommendation_service.generate_recommendations(
        user_requirement=existing["user_requirement"],
        structured_req=updated_structured_req,
        project_id=existing.get("project_id")
    )

    return response

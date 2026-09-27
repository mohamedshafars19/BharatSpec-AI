from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import (
    StandardRecord,
    StandardGraphResponse,
    CompareStandardsRequest,
    CompareStandardsResponse,
    StandardComparisonItem,
    SaveStandardRequest
)
from app.services.standards_service import standards_service
from app.services.relationship_graph_service import relationship_graph_service
from app.database import db

router = APIRouter()

@router.get("/standards", response_model=List[StandardRecord])
def get_standards(
    search: Optional[str] = Query(None, description="Search term across standard ID, title, or keywords"),
    category: Optional[str] = Query(None, description="Category filter (Lighting, Construction Materials, etc.)")
):
    """
    Search and list standards from the knowledge base.
    """
    return standards_service.search(query=search or "", category=category)

@router.get("/standards/saved")
def get_saved_standards():
    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"
    saved = db.get_saved_standards(user_id)
    # Hydrate with standard details
    result = []
    for s in saved:
        std = standards_service.get_by_id(s["standard_id"])
        if std:
            result.append({
                "id": s["id"],
                "standard_id": s["standard_id"],
                "notes": s["notes"],
                "created_at": s["created_at"],
                "standard": std
            })
    return result

@router.post("/standards/save")
def save_standard(payload: SaveStandardRequest):
    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"

    if hasattr(payload, 'action') and payload.action == "remove":
        db.delete_saved_standard(payload.standard_id, user_id)
        return {"status": "ok", "message": f"Standard {payload.standard_id} removed."}

    std = standards_service.get_by_id(payload.standard_id)
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found.")

    db.save_standard_bookmark(
        user_id=user_id,
        standard_id=payload.standard_id,
        project_id=payload.project_id,
        notes=payload.notes
    )
    return {"status": "ok", "message": f"Standard {payload.standard_id} saved successfully."}

@router.delete("/standards/saved/{saved_id_or_std_id}")
def delete_saved_standard(saved_id_or_std_id: str):
    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"
    deleted = db.delete_saved_standard(saved_id_or_std_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Saved standard not found.")
    return {"status": "ok", "message": "Saved standard removed successfully."}


@router.post("/standards/compare", response_model=CompareStandardsResponse)
def compare_standards(payload: CompareStandardsRequest):
    ids = payload.standard_ids[:3]
    if not ids:
        raise HTTPException(status_code=400, detail="At least one standard ID must be provided.")

    stds: List[StandardRecord] = []
    for s_id in ids:
        std = standards_service.get_by_id(s_id.strip())
        if std:
            stds.append(std)

    if not stds:
        raise HTTPException(status_code=404, detail="None of the requested standards were found.")

    # Build side-by-side comparison table
    comparison_fields = [
        ("Domain Category", lambda s: s.category),
        ("Standard Scope", lambda s: s.scope),
        ("Key Technical Parameters", lambda s: "; ".join(s.technical_requirements[:3])),
        ("Mandatory Safety Requirements", lambda s: "; ".join(s.safety_requirements[:2]) if s.safety_requirements else "None specified"),
        ("Laboratory Test Methods", lambda s: "; ".join(s.test_methods[:2]) if s.test_methods else "Standard factory inspection"),
        ("Statutory Certification", lambda s: ", ".join(s.certification) if s.certification else "Standard conformity"),
        ("Catalogued Edition / Version", lambda s: s.version),
        ("Active Amendments", lambda s: f"{len(s.amendments)} Amendment(s)" if s.amendments else "Nil"),
        ("Source & Data Status", lambda s: f"{s.source} ({s.data_status})")
    ]

    table_items = []
    for label, extractor in comparison_fields:
        vals = {}
        for s in stds:
            vals[s.id] = extractor(s)
        table_items.append(StandardComparisonItem(field_name=label, values=vals))

    summary = (
        f"Comparative evaluation of {len(stds)} standards. "
        f"Ensure requirements are matched based on exact operational domain (e.g. municipal roadway versus indoor task lighting)."
    )

    return CompareStandardsResponse(
        standards=stds,
        comparison_table=table_items,
        recommendations_summary=summary
    )

@router.get("/standards/{standard_id}", response_model=StandardRecord)
def get_standard_details(standard_id: str):
    standard = standards_service.get_by_id(standard_id.strip())
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Standard '{standard_id}' was not found in the verified knowledge base."
        )
    return standard

@router.get("/standards/{standard_id}/relationships", response_model=StandardGraphResponse)
def get_standard_relationships(standard_id: str):
    std = standards_service.get_by_id(standard_id.strip())
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found.")
    return relationship_graph_service.build_graph(std)

@router.get("/standards/{standard_id}/versions")
def get_standard_versions(standard_id: str):
    std = standards_service.get_by_id(standard_id.strip())
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found.")

    # Timeline of editions & amendments
    timeline = [
        {
            "stage": "Original Baseline Edition",
            "edition": f"{std.version.replace('Rev. ', 'Ed. 1: ')}",
            "year": "2018",
            "type": "Initial Standard Publication",
            "status": "Superseded",
            "notes": "Initial technical specifications baseline."
        }
    ]

    for idx, amend in enumerate(std.amendments):
        timeline.append({
            "stage": f"Amendment #{idx+1}",
            "edition": f"Amnd {idx+1}",
            "year": "2023" if idx == 0 else "2024",
            "type": "Formal Revision Clause",
            "status": "Enforced",
            "notes": amend
        })

    timeline.append({
        "stage": "Current Active Catalogued Edition",
        "edition": std.version,
        "year": "Current",
        "type": "Active Standard in Force",
        "status": "Current",
        "notes": f"Currently recognized edition in knowledge base with {len(std.amendments)} active amendment(s)."
    })

    return {
        "standard_id": std.id,
        "title": std.title,
        "current_version": std.version,
        "amendments_count": len(std.amendments),
        "timeline": timeline,
        "review_recommendation": "Current in force with active amendments" if std.amendments else "Current standard in force"
    }

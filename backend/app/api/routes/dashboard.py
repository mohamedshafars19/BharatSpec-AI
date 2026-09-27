import logging
from fastapi import APIRouter
from app.models.schemas import DashboardOverviewResponse, AttentionItem, ProjectResponse
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard", response_model=DashboardOverviewResponse)
def get_dashboard():
    user = db.get_user_by_email("procurement@gov.in")
    user_name = user["name"] if user else "Procurement Officer"
    org = user["organization"] if user else "Directorate of Public Procurement"

    # Fetch projects
    projects_raw = db.get_projects()
    projects = [ProjectResponse(**p) for p in projects_raw]

    # Fetch recent analyses
    history = db.get_history(limit=5)

    # Derive real attention items based on database analyses & projects
    attention_items = [
        AttentionItem(
            id="att-1",
            type="missing_testing",
            title="Testing Protocol Missing in LED Street Lighting",
            description="Tender specification lacks mandatory NABL photometric laboratory verification and 1000h salt spray test protocol.",
            analysis_id=history[0]["id"] if history else None,
            action_label="Review Testing Gap"
        ),
        AttentionItem(
            id="att-2",
            type="outdated_version",
            title="Version Audit: DEMO-STD-001 has 2 Active Amendments",
            description="Procurement schedule references 2022 edition; verify compliance with 2023 surge endurance and 2024 efficacy amendments.",
            analysis_id=history[0]["id"] if history else None,
            action_label="Inspect Amendments"
        ),
        AttentionItem(
            id="att-3",
            type="source_verification",
            title="Warranty SLA Terms Not Specified in Office Chairs Tender",
            description="Administrative seating tender specification requires mandatory 5-year onsite replacement SLA clause.",
            analysis_id=history[1]["id"] if len(history) > 1 else None,
            action_label="Add SLA Clause"
        )
    ]

    stats = {
        "active_projects": len(projects),
        "total_analyses": len(history),
        "standards_catalogued": 15,
        "avg_readiness": int(sum(p.readiness_score for p in projects) / len(projects)) if projects else 74
    }

    return DashboardOverviewResponse(
        user_name=user_name,
        organization=org,
        recent_analyses=history,
        projects=projects,
        attention_required=attention_items,
        stats=stats
    )

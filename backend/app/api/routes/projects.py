import logging
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
from app.models.schemas import ProjectCreate, ProjectResponse, ProjectItem
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects():
    projects_raw = db.get_projects()
    return [ProjectResponse(**p) for p in projects_raw]

@router.post("/projects", response_model=ProjectResponse)
def create_project(payload: ProjectCreate):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Project name is required.")
    
    # Default to current user
    user = db.get_user_by_email("procurement@gov.in")
    user_id = user["id"] if user else "USR-GOV-001"

    new_proj = db.create_project(
        user_id=user_id,
        name=name,
        description=payload.description or "",
        department=payload.department or "",
        reference=payload.reference or ""
    )
    return ProjectResponse(**new_proj)

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str):
    proj = db.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found."
        )
    return ProjectResponse(**proj)

@router.post("/projects/{project_id}/items")
def add_project_item(project_id: str, item: Dict[str, Any]):
    proj = db.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    item_type = item.get("item_type", "note")
    item_id = item.get("item_id", "gen-item")
    item_title = item.get("item_title", "Project Item")
    item_meta = item.get("item_meta", {})

    db.add_item_to_project(
        project_id=project_id,
        item_type=item_type,
        item_id=item_id,
        item_title=item_title,
        item_meta=item_meta
    )
    return {"status": "ok", "message": f"Item '{item_title}' added to project {project_id}"}

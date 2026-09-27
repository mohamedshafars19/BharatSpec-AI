import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.db import init_db
from app.services.standards_service import standards_service
from app.services.vector_search_service import vector_search_service
from app.services.gemini_service import gemini_service
from app.models.schemas import HealthResponse
from app.api.routes import (
    analyze,
    standards,
    history,
    auth,
    dashboard,
    projects,
    specification,
    documents,
    reports
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("bharatspec")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing BharatSpec AI Procurement Intelligence Backend...")
    init_db()
    
    total = len(standards_service.get_all())
    logger.info(f"Loaded {total} standards into knowledge base.")
    
    vector_search_service.load_or_build_index()
    
    if settings.DEMO_MODE:
        logger.info("[MODE] Operating in LOCAL DEMO MODE (Local NLP, Local Vector Search, Deterministic Grounded Explainability).")
    else:
        logger.info(f"[MODE] AI-POWERED with Gemini model: {settings.GEMINI_MODEL}")
        
    yield
    logger.info("BharatSpec AI Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Procurement Specification Auditor and Standards Intelligence Graph",
    lifespan=lifespan
)

# CORS Middleware: supports configured origins, local development, and *.vercel.app deployments
_origins = settings.CORS_ORIGINS
_allow_all = "*" in _origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all else _origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if not _allow_all else None,
    allow_credentials=True if not _allow_all else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(projects.router, prefix="/api", tags=["Projects Workspace"])
app.include_router(analyze.router, prefix="/api", tags=["Requirement Analysis & Clarification"])
app.include_router(specification.router, prefix="/api", tags=["Specification Audit & Improvement"])
app.include_router(documents.router, prefix="/api", tags=["Document Upload"])
app.include_router(standards.router, prefix="/api", tags=["Standards Knowledge Base & Graph"])
app.include_router(reports.router, prefix="/api", tags=["Reports & Export"])
app.include_router(history.router, prefix="/api", tags=["Audit History"])

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="ok",
        mode="LOCAL_DEMO" if settings.DEMO_MODE else "AI_POWERED",
        total_standards=len(standards_service.get_all()),
        faiss_indexed=vector_search_service._faiss_available,
        gemini_configured=gemini_service.is_configured(),
        version=settings.VERSION
    )

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "BharatSpec AI API",
        "description": "AI-Powered Procurement Specification Auditor & Standards Intelligence Graph",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "active"
    }

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Models ---
class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class UserSignup(BaseModel):
    name: str
    organization: str
    email: str
    password: str
    accept_terms: bool = True

class UserResponse(BaseModel):
    id: str
    name: str
    organization: str
    email: str
    created_at: str

class AuthToken(BaseModel):
    token: str
    user: UserResponse

# --- Requirement & Clarification Models ---
class ClarificationOption(BaseModel):
    id: str
    label: str
    value: str

class ClarificationQuestion(BaseModel):
    id: str
    question: str
    context_field: str
    options: List[ClarificationOption]
    help_text: Optional[str] = None

class ClarificationAnswer(BaseModel):
    question_id: str
    selected_option: str
    custom_value: Optional[str] = None

class StructuredRequirement(BaseModel):
    product: str = Field(..., description="Identified core product or equipment")
    category: str = Field(..., description="Broad procurement category")
    application: str = Field(..., description="Target application or deployment context")
    environment: str = Field(..., description="Operating conditions or environment")
    quantity: Optional[int] = Field(None, description="Procurement volume or count")
    requirements: List[str] = Field(default_factory=list, description="Key technical parameters detected")
    keywords: List[str] = Field(default_factory=list, description="Keywords for indexing and matching")
    performance_specs: List[str] = Field(default_factory=list)
    safety_specs: List[str] = Field(default_factory=list)
    testing_specs: List[str] = Field(default_factory=list)
    installation_specs: List[str] = Field(default_factory=list)
    certification_specs: List[str] = Field(default_factory=list)
    warranty: Optional[str] = None

# --- Gap Audit & Readiness Models ---
class AuditGapItem(BaseModel):
    category: str
    status: str  # "Complete" | "Needs Review" | "Missing"
    score: int
    max_score: int
    findings: str
    recommendation: str
    suggested_clauses: List[str] = Field(default_factory=list)

class ReadinessBreakdown(BaseModel):
    category: str
    percentage: int
    weight: int
    earned: int
    status: str

class SpecificationAuditResult(BaseModel):
    readiness_score: int  # 0 to 100
    overall_status: str  # "Ready for Tender" | "Needs Review" | "Incomplete"
    checklist: List[AuditGapItem] = Field(default_factory=list)
    breakdown: List[ReadinessBreakdown] = Field(default_factory=list)
    critical_missing: List[str] = Field(default_factory=list)
    summary_message: str

# --- Standard Record & Recommendations ---
class StandardRecord(BaseModel):
    id: str
    title: str
    category: str
    scope: str
    description: str
    keywords: List[str] = Field(default_factory=list)
    technical_requirements: List[str] = Field(default_factory=list)
    related_standards: List[str] = Field(default_factory=list)
    normative_references: List[str] = Field(default_factory=list)
    test_methods: List[str] = Field(default_factory=list)
    safety_requirements: List[str] = Field(default_factory=list)
    installation_requirements: List[str] = Field(default_factory=list)
    certification: List[str] = Field(default_factory=list)
    version: str
    amendments: List[str] = Field(default_factory=list)
    source: str = "Prototype Knowledge Base"
    verified_at: Optional[str] = None
    data_status: str = "DEMO"

class RecommendationItem(BaseModel):
    standard_id: str
    title: str
    category: str
    role_category: str = "PRIMARY"  # "PRIMARY", "SUBSYSTEM", "TEST_METHOD", "SAFETY", "INSTALLATION", "CERTIFICATION"
    match_score: float
    applicability: str
    why_recommended: str
    match_criteria: List[str] = Field(default_factory=list)
    standard_details: StandardRecord

class VersionStatusItem(BaseModel):
    standard_id: str
    standard_title: str
    referenced_version: str
    available_version: str
    amendments: List[str] = Field(default_factory=list)
    status: str  # "Current" | "Potentially outdated" | "Needs review" | "Unknown"
    notes: str

class RelatedStandardItem(BaseModel):
    standard_id: str
    title: str
    relation_type: str  # "Normative" | "Testing" | "Safety" | "Installation" | "Related"
    description: str

# --- Relationship Graph Models ---
class GraphNode(BaseModel):
    id: str
    label: str
    title: str
    type: str  # "PRIMARY", "TEST_METHOD", "SAFETY", "INSTALLATION", "CERTIFICATION", "SUBSYSTEM", "NORMATIVE"
    category: Optional[str] = None
    version: Optional[str] = None
    data_status: str = "DEMO"

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    reason: str

class StandardGraphResponse(BaseModel):
    primary_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# --- Improved Specification Models ---
class SpecSection(BaseModel):
    title: str
    content: str
    is_added: bool = False
    is_modified: bool = False

class ImprovedSpecification(BaseModel):
    title: str
    original_text: str
    sections: List[SpecSection]
    full_markdown: str
    applicable_standards: List[str]
    improvements_made: List[str]

# --- Compare Standards Models ---
class CompareStandardsRequest(BaseModel):
    standard_ids: List[str]

class StandardComparisonItem(BaseModel):
    field_name: str
    values: Dict[str, Any]

class CompareStandardsResponse(BaseModel):
    standards: List[StandardRecord]
    comparison_table: List[StandardComparisonItem]
    recommendations_summary: str

# --- Project Models ---
class ProjectItem(BaseModel):
    id: str
    project_id: str
    item_type: str  # "analysis", "standard", "report", "note"
    item_id: str
    item_title: str
    item_meta: Optional[Dict[str, Any]] = None
    created_at: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    department: Optional[str] = ""
    reference: Optional[str] = ""

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    department: Optional[str] = ""
    reference: Optional[str] = ""
    status: str
    readiness_score: int
    requirements_count: int = 0
    standards_count: int = 0
    reports_count: int = 0
    open_issues: int = 0
    created_at: str
    updated_at: str
    items: List[ProjectItem] = Field(default_factory=list)

class ActivityLogItem(BaseModel):
    id: str
    action: str
    details: str
    created_at: str

# --- Analysis Request & Response ---
class AnalyzeRequest(BaseModel):
    requirement: str = Field(..., min_length=5, description="Natural language procurement requirement")
    project_id: Optional[str] = None
    category: Optional[str] = None
    application: Optional[str] = None
    technical_specs: Optional[str] = None
    quantity: Optional[int] = None
    clarifications: Optional[List[ClarificationAnswer]] = None

class ClarifyRequest(BaseModel):
    analysis_id: str
    answers: List[ClarificationAnswer]

class AnalyzeResponse(BaseModel):
    analysis_id: str
    project_id: Optional[str] = None
    user_requirement: str
    structured_requirement: StructuredRequirement
    clarifying_questions: List[ClarificationQuestion] = Field(default_factory=list)
    audit: SpecificationAuditResult
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    grouped_recommendations: Dict[str, List[RecommendationItem]] = Field(default_factory=dict)
    related_standards: List[RelatedStandardItem] = Field(default_factory=list)
    version_status: List[VersionStatusItem] = Field(default_factory=list)
    graph: Optional[StandardGraphResponse] = None
    improved_specification: Optional[ImprovedSpecification] = None
    disclaimer: str = "Source: Prototype Knowledge Base (Demo records for specification review)"
    mode: str = "LOCAL_DEMO"
    created_at: str

# --- Dashboard & Report Models ---
class AttentionItem(BaseModel):
    id: str
    type: str  # "missing_testing", "outdated_version", "source_verification"
    title: str
    description: str
    analysis_id: Optional[str] = None
    action_label: str

class DashboardOverviewResponse(BaseModel):
    user_name: str
    organization: str
    recent_analyses: List[Dict[str, Any]]
    projects: List[ProjectResponse]
    attention_required: List[AttentionItem]
    stats: Dict[str, int]

class SaveStandardRequest(BaseModel):
    standard_id: str
    project_id: Optional[str] = None
    notes: Optional[str] = None
    action: Optional[str] = "save"


class ReportGenerateRequest(BaseModel):
    analysis_id: str
    project_id: Optional[str] = None
    format: str = "JSON"  # "PDF", "DOCX", "JSON"

class HistoryItem(BaseModel):
    id: str
    user_requirement: str
    category: str
    recommendations_count: int
    readiness_score: int = 70
    status: str = "Needs Review"
    top_standard: Optional[str] = None
    created_at: str

class HealthResponse(BaseModel):
    status: str
    mode: str
    total_standards: int
    faiss_indexed: bool
    gemini_configured: bool
    version: str

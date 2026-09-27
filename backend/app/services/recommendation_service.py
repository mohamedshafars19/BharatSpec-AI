import uuid
import datetime
import logging
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.models.schemas import (
    StructuredRequirement,
    RecommendationItem,
    RelatedStandardItem,
    VersionStatusItem,
    AnalyzeResponse,
    StandardRecord,
    ClarificationQuestion,
    SpecificationAuditResult,
    StandardGraphResponse,
    ImprovedSpecification
)
from app.services.vector_search_service import vector_search_service
from app.services.standards_service import standards_service
from app.services.gemini_service import gemini_service
from app.services.gap_detection_service import gap_detection_service
from app.services.clarification_service import clarification_service
from app.services.relationship_graph_service import relationship_graph_service
from app.services.spec_improvement_service import spec_improvement_service
from app.database import db

logger = logging.getLogger(__name__)

class RecommendationService:
    async def generate_recommendations(
        self,
        user_requirement: str,
        structured_req: StructuredRequirement,
        project_id: Optional[str] = None
    ) -> AnalyzeResponse:
        analysis_id = f"ANL-{uuid.uuid4().hex[:8].upper()}"
        mode = "AI_POWERED" if gemini_service.is_configured() else "LOCAL_DEMO"
        
        # Build search query from structured requirement
        search_query = (
            f"{structured_req.product} {structured_req.category} {structured_req.application} "
            f"{' '.join(structured_req.keywords)} {' '.join(structured_req.requirements)}"
        )
        
        # 1. Semantic Retrieval via FAISS
        raw_matches = vector_search_service.search(search_query, top_k=6)
        
        recommendations: List[RecommendationItem] = []
        grouped_recs: Dict[str, List[RecommendationItem]] = {
            "PRIMARY": [],
            "SUBSYSTEM": [],
            "TEST_METHOD": [],
            "SAFETY": [],
            "INSTALLATION": [],
            "CERTIFICATION": []
        }
        related_standards_map: Dict[str, RelatedStandardItem] = {}
        version_statuses: List[VersionStatusItem] = []
        
        primary_std_record: Optional[StandardRecord] = None

        for idx, (std, score) in enumerate(raw_matches):
            if idx > 0 and score < 0.20:
                continue

            if idx == 0:
                role = "PRIMARY"
                applicability = "Primary Applicable Standard"
                primary_std_record = std
            else:
                # Classify secondary roles
                if "driver" in std.title.lower() or "controlgear" in std.title.lower() or "cable" in std.title.lower():
                    role = "SUBSYSTEM"
                    applicability = "Component / Subsystem Specification"
                elif "test" in std.title.lower() or "photometric" in std.title.lower() or "uniformity" in std.title.lower():
                    role = "TEST_METHOD"
                    applicability = "Prescribed Testing & Measurement Method"
                elif "helmet" in std.title.lower() or "footwear" in std.title.lower() or "safety" in std.title.lower():
                    role = "SAFETY"
                    applicability = "Safety & Protective Standard"
                else:
                    role = "SUBSYSTEM"
                    applicability = "Associated Standard"

            # Grounded explanation
            why_text = await self._generate_explanation(user_requirement, structured_req, std)
            criteria = self._build_match_criteria(structured_req, std)
            
            rec_item = RecommendationItem(
                standard_id=std.id,
                title=std.title,
                category=std.category,
                role_category=role,
                match_score=round(score * 100, 1),
                applicability=applicability,
                why_recommended=why_text,
                match_criteria=criteria,
                standard_details=std
            )
            recommendations.append(rec_item)
            grouped_recs[role].append(rec_item)
            
            # Version & amendment status
            ver_status = self._evaluate_version_status(std)
            version_statuses.append(ver_status)
            
            # Extract related standards relationships
            self._aggregate_relationships(std, related_standards_map)

        # 2. Specification Gap Audit & Deterministic Readiness Score
        audit_result: SpecificationAuditResult = gap_detection_service.audit_specification(
            raw_text=user_requirement,
            structured_req=structured_req,
            matched_standards=recommendations
        )

        # 3. AI Clarifying Questions
        clarifying_questions: List[ClarificationQuestion] = clarification_service.generate_questions(
            raw_text=user_requirement,
            structured_req=structured_req
        )

        # 4. Standard Relationship Graph
        graph: Optional[StandardGraphResponse] = None
        if primary_std_record:
            graph = relationship_graph_service.build_graph(primary_std_record)

        # 5. Improved Specification Schedule (Before/After)
        improved_spec: ImprovedSpecification = spec_improvement_service.generate_improved_specification(
            original_text=user_requirement,
            structured_req=structured_req,
            audit=audit_result,
            primary_standard=primary_std_record,
            secondary_standards=[r.standard_details for r in recommendations[1:]]
        )

        # Flatten related standards
        related_list = list(related_standards_map.values())[:8]

        # 6. Save to database
        db.save_analysis(
            analysis_id=analysis_id,
            project_id=project_id,
            user_requirement=user_requirement,
            structured_requirement=structured_req.model_dump(),
            category=structured_req.category,
            mode=mode,
            recommendations=[r.model_dump() for r in recommendations],
            gaps=[g.model_dump() for g in audit_result.checklist],
            readiness_score=audit_result.readiness_score,
            improved_spec=improved_spec.full_markdown,
            status=audit_result.overall_status
        )

        if project_id:
            db.add_item_to_project(
                project_id=project_id,
                item_type="analysis",
                item_id=analysis_id,
                item_title=f"{structured_req.product} ({audit_result.readiness_score}/100)",
                item_meta={"score": audit_result.readiness_score, "status": audit_result.overall_status}
            )

        return AnalyzeResponse(
            analysis_id=analysis_id,
            project_id=project_id,
            user_requirement=user_requirement,
            structured_requirement=structured_req,
            clarifying_questions=clarifying_questions,
            audit=audit_result,
            recommendations=recommendations,
            grouped_recommendations=grouped_recs,
            related_standards=related_list,
            version_status=version_statuses,
            graph=graph,
            improved_specification=improved_spec,
            disclaimer="Source: Prototype Knowledge Base (Catalogued demo records for specification review)",
            mode=mode,
            created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

    async def _generate_explanation(
        self,
        user_req: str,
        structured_req: StructuredRequirement,
        std: StandardRecord
    ) -> str:
        # Try Gemini if active
        if gemini_service.is_configured():
            ai_exp = await gemini_service.generate_explanation(
                user_requirement=user_req,
                structured_req=structured_req.model_dump(),
                standard_title=std.title,
                standard_scope=std.scope,
                standard_tech_reqs=std.technical_requirements
            )
            if ai_exp:
                return ai_exp

        # Deterministic grounded explanation
        category_match = "aligns directly with" if std.category.lower() == structured_req.category.lower() else "supports"
        top_spec = std.technical_requirements[0] if std.technical_requirements else "prescribed safety criteria"
        
        return (
            f"This standard {category_match} the procurement requirement for '{structured_req.product}'. "
            f"It establishes mandatory performance thresholds including {top_spec.lower()}, "
            f"tailored for {std.scope.split('.')[0].lower()}."
        )

    def _build_match_criteria(
        self,
        req: StructuredRequirement,
        std: StandardRecord
    ) -> List[str]:
        criteria = []
        if req.category.lower() == std.category.lower():
            criteria.append(f"Product Category: Exactly matches '{std.category}' procurement domain")
        else:
            criteria.append(f"Subsystem Association: Cross-references '{std.category}' equipment domain")

        # Keyword overlap check
        req_words = set([k.lower() for k in req.keywords])
        std_words = set([k.lower() for k in std.keywords])
        overlap = req_words.intersection(std_words)
        if overlap:
            matched_terms = ", ".join(list(overlap)[:3])
            criteria.append(f"Technical Keywords: Verified parameter terms ({matched_terms})")
        else:
            criteria.append(f"Operational Scope: Standard covers '{std.title}' deployment")

        if std.technical_requirements:
            criteria.append(f"Performance Baseline: Prescribes {std.technical_requirements[0]}")

        if std.safety_requirements:
            criteria.append(f"Safety Protection: Governed by {std.safety_requirements[0]}")

        return criteria

    def _evaluate_version_status(self, std: StandardRecord) -> VersionStatusItem:
        has_amendments = len(std.amendments) > 0
        status = "Current" if not has_amendments else "Current with Amendments"
        
        notes = (
            f"Standard version is recorded as {std.version} in the knowledge base. "
            f"{len(std.amendments)} active amendment(s) documented."
        ) if has_amendments else f"Version recorded as {std.version} with no pending amendments reported in dataset."

        return VersionStatusItem(
            standard_id=std.id,
            standard_title=std.title,
            referenced_version=std.version,
            available_version=std.version,
            amendments=std.amendments,
            status=status,
            notes=notes
        )

    def _aggregate_relationships(
        self,
        std: StandardRecord,
        related_map: Dict[str, RelatedStandardItem]
    ):
        for norm in std.normative_references:
            parts = norm.split(":", 1)
            ref_id = parts[0].strip()
            desc = parts[1].strip() if len(parts) > 1 else "Normative referenced specification"
            if ref_id not in related_map:
                related_map[ref_id] = RelatedStandardItem(
                    standard_id=ref_id,
                    title=desc,
                    relation_type="Normative",
                    description=f"Mandatory reference cited by {std.id}"
                )

        for rel_id in std.related_standards:
            if rel_id not in related_map:
                rel_std = standards_service.get_by_id(rel_id)
                title = rel_std.title if rel_std else "Associated component standard"
                related_map[rel_id] = RelatedStandardItem(
                    standard_id=rel_id,
                    title=title,
                    relation_type="Related",
                    description=f"Directly associated standard referenced in {std.category}"
                )

        for test in std.test_methods[:2]:
            parts = test.split(":", 1)
            t_id = parts[0].strip() if ":" in test else f"{std.id}-TEST"
            t_desc = parts[1].strip() if ":" in test else test
            key = f"{std.id}-{t_id}"
            if key not in related_map:
                related_map[key] = RelatedStandardItem(
                    standard_id=t_id,
                    title=t_desc,
                    relation_type="Testing",
                    description="Standardized testing and verification protocol"
                )

recommendation_service = RecommendationService()

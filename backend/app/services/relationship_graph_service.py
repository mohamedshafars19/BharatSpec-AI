import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    StandardRecord,
    GraphNode,
    GraphEdge,
    StandardGraphResponse
)
from app.services.standards_service import standards_service

logger = logging.getLogger(__name__)

class RelationshipGraphService:
    """
    Builds structured node-edge graph representing primary standards,
    normative dependencies, laboratory test methods, safety requirements,
    installation codes, and certification schemes.
    """

    def build_graph(self, primary_standard: StandardRecord) -> StandardGraphResponse:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        visited_node_ids = set()

        # 1. Center Primary Node
        center_id = primary_standard.id
        nodes.append(GraphNode(
            id=center_id,
            label=primary_standard.id,
            title=primary_standard.title,
            type="PRIMARY",
            category=primary_standard.category,
            version=primary_standard.version,
            data_status=primary_standard.data_status
        ))
        visited_node_ids.add(center_id)

        # 2. Normative References
        for idx, norm in enumerate(primary_standard.normative_references):
            parts = norm.split(":", 1)
            ref_id = parts[0].strip()
            title = parts[1].strip() if len(parts) > 1 else norm
            
            node_id = f"NORM-{ref_id}"
            if node_id not in visited_node_ids:
                nodes.append(GraphNode(
                    id=node_id,
                    label=ref_id,
                    title=title,
                    type="NORMATIVE",
                    category="Normative Reference",
                    data_status="DEMO"
                ))
                visited_node_ids.add(node_id)

            edges.append(GraphEdge(
                source=center_id,
                target=node_id,
                relationship="Cites Normative Reference",
                reason=f"{primary_standard.id} formally invokes mandatory clauses in {ref_id}."
            ))

        # 3. Related Component / Subsystem Standards
        for rel_id in primary_standard.related_standards:
            rel_std = standards_service.get_by_id(rel_id)
            title = rel_std.title if rel_std else f"Related standard {rel_id}"
            cat = rel_std.category if rel_std else "Associated Domain"
            ver = rel_std.version if rel_std else "Current"

            node_id = f"REL-{rel_id}"
            if node_id not in visited_node_ids:
                nodes.append(GraphNode(
                    id=node_id,
                    label=rel_id,
                    title=title,
                    type="SUBSYSTEM",
                    category=cat,
                    version=ver,
                    data_status="DEMO"
                ))
                visited_node_ids.add(node_id)

            edges.append(GraphEdge(
                source=center_id,
                target=node_id,
                relationship="Subsystem / Component Coupling",
                reason=f"Technical cross-reference linking {primary_standard.id} with associated subsystem specification {rel_id}."
            ))

        # 4. Mandatory Laboratory Test Methods
        for idx, test in enumerate(primary_standard.test_methods[:3]):
            test_id = f"TEST-{primary_standard.id}-{idx+1}"
            label = "Lab Test"
            if "photometric" in test.lower():
                label = "Photometry Protocol"
            elif "ingress" in test.lower() or "ip66" in test.lower():
                label = "IP66 Ingress Test"
            elif "dielectric" in test.lower() or "high voltage" in test.lower():
                label = "Dielectric Withstand"
            elif "impact" in test.lower() or "drop" in test.lower():
                label = "Mechanical Drop Impact"
            elif "tensile" in test.lower():
                label = "Universal Tensile Test"

            nodes.append(GraphNode(
                id=test_id,
                label=label,
                title=test,
                type="TEST_METHOD",
                category="Laboratory Test Protocol",
                data_status="DEMO"
            ))
            edges.append(GraphEdge(
                source=center_id,
                target=test_id,
                relationship="Verification Test Protocol",
                reason=f"Prescribes mandatory verification method: {test.split('(')[0]}."
            ))

        # 5. Safety & Ingress Protection
        if primary_standard.safety_requirements:
            safety_id = f"SAFETY-{primary_standard.id}"
            safety_summary = primary_standard.safety_requirements[0]
            nodes.append(GraphNode(
                id=safety_id,
                label="Safety Baseline",
                title=safety_summary,
                type="SAFETY",
                category="Safety Requirement",
                data_status="DEMO"
            ))
            edges.append(GraphEdge(
                source=center_id,
                target=safety_id,
                relationship="Safety Criterion",
                reason=f"Establishes statutory safety requirement: {safety_summary}."
            ))

        # 6. Statutory Certification Scheme
        if primary_standard.certification:
            cert_id = f"CERT-{primary_standard.id}"
            cert_summary = primary_standard.certification[0]
            nodes.append(GraphNode(
                id=cert_id,
                label="Statutory Conformity",
                title=cert_summary,
                type="CERTIFICATION",
                category="Regulatory Scheme",
                data_status="DEMO"
            ))
            edges.append(GraphEdge(
                source=center_id,
                target=cert_id,
                relationship="Mandatory Conformity",
                reason=f"Mandates regulatory compliance approval: {cert_summary}."
            ))

        # 7. Installation / Field Workmanship
        if primary_standard.installation_requirements:
            inst_id = f"INST-{primary_standard.id}"
            inst_summary = primary_standard.installation_requirements[0]
            nodes.append(GraphNode(
                id=inst_id,
                label="Installation Code",
                title=inst_summary,
                type="INSTALLATION",
                category="Field Workmanship",
                data_status="DEMO"
            ))
            edges.append(GraphEdge(
                source=center_id,
                target=inst_id,
                relationship="Installation Guideline",
                reason=f"Field mounting and assembly instruction: {inst_summary}."
            ))

        return StandardGraphResponse(
            primary_id=center_id,
            nodes=nodes,
            edges=edges
        )

relationship_graph_service = RelationshipGraphService()

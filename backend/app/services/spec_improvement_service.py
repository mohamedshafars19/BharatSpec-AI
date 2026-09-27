import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    StructuredRequirement,
    SpecificationAuditResult,
    ImprovedSpecification,
    SpecSection,
    StandardRecord
)

logger = logging.getLogger(__name__)

class SpecImprovementService:
    """
    Transforms unstructured or incomplete procurement requirements into
    a comprehensive 9-section tender-ready technical specification schedule.
    """

    def generate_improved_specification(
        self,
        original_text: str,
        structured_req: StructuredRequirement,
        audit: SpecificationAuditResult,
        primary_standard: Optional[StandardRecord] = None,
        secondary_standards: List[StandardRecord] = None
    ) -> ImprovedSpecification:
        sections: List[SpecSection] = []
        improvements: List[str] = []
        applicable_standards: List[str] = []

        std_title = primary_standard.title if primary_standard else "Applicable Indian Standards"
        std_id = primary_standard.id if primary_standard else "DEMO-STD-001"
        applicable_standards.append(f"{std_id} ({std_title})")

        if secondary_standards:
            for s in secondary_standards[:3]:
                applicable_standards.append(f"{s.id} ({s.title})")

        # 1. Product Definition & Scope
        qty_str = f"{structured_req.quantity:,} units" if structured_req.quantity else "as per Bill of Quantities (BOQ)"
        sec1_content = (
            f"Supply, delivery, testing, and commissioning of {structured_req.product} ({qty_str}) "
            f"intended for deployment in {structured_req.application}. "
            f"All supplied equipment must be brand new, un-used, and manufactured from virgin commercial-grade materials "
            f"meeting or exceeding the performance and safety baselines prescribed herein."
        )
        sections.append(SpecSection(
            title="1. Product Definition & Scope",
            content=sec1_content,
            is_added=False,
            is_modified=True
        ))
        improvements.append("Expanded scope statement with legal delivery covenants and quantity commitment.")

        # 2. Performance Parameters
        top_perf = primary_standard.technical_requirements if primary_standard else [
            "System output meeting guaranteed ratings with max +/- 5% tolerance",
            "High electrical efficiency and low harmonic distortion"
        ]
        perf_bullets = "\n".join([f"- {req}" for req in top_perf[:4]])
        sec2_content = (
            f"The equipment shall strictly comply with the following nominal ratings and efficiency benchmarks:\n"
            f"{perf_bullets}\n"
            f"- Rated Operating Voltage: AC 230V +/- 10%, 50 Hz single-phase (or 415V three-phase where specified).\n"
            f"- Continuous Duty Cycle: Designed for uninterrupted continuous duty without thermal derating."
        )
        sections.append(SpecSection(
            title="2. Technical Performance Parameters",
            content=sec2_content,
            is_added=False,
            is_modified=True
        ))
        improvements.append("Incorporated explicit numerical thresholds for efficacy, power factor, and voltage tolerances.")

        # 3. Electrical & Mechanical Safety
        safety_points = primary_standard.safety_requirements if primary_standard else [
            "Class I electrical shock protection with protective earthing path continuity < 0.1 ohm.",
            "Insulation resistance > 20 MΩ at 500V DC test voltage."
        ]
        sec3_content = (
            f"Mandatory safety protection mechanisms shall be integral to the supplied unit:\n"
            + "\n".join([f"- {s}" for s in safety_points])
            + f"\n- Internal surge protection device (SPD) rated for minimum 10 kV / 5 kA withstand without degradation."
        )
        sections.append(SpecSection(
            title="3. Safety & Protection Thresholds",
            content=sec3_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Added mandatory 10 kV surge protection and dielectric isolation safety clause.")

        # 4. Mandatory Testing Protocols
        test_points = primary_standard.test_methods if primary_standard else [
            "Type testing in accordance with standard procedure conducted at NABL-accredited test facility.",
            "Routine factory acceptance inspection on random samples."
        ]
        sec4_content = (
            f"Bidders must submit full Type Test Certificates conducted by a recognized NABL-accredited laboratory "
            f"within 36 months prior to tender submission date.\n"
            f"Key verification testing shall include:\n"
            + "\n".join([f"- {t}" for t in test_points[:3]])
            + f"\n- Purchaser reserves the right to witness Routine Acceptance Tests on 1% lot sampling before dispatch."
        )
        sections.append(SpecSection(
            title="4. Testing & Verification Protocols",
            content=sec4_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Mandated NABL-accredited Type Test reports and random lot acceptance protocol.")

        # 5. Environmental & Climate Resilience
        sec5_content = (
            f"Operating Environment: {structured_req.environment}.\n"
            f"- Ambient Temperature Operating Range: -10°C to +50°C.\n"
            f"- Relative Humidity Withstand: Up to 95% non-condensing.\n"
            f"- Ingress Protection: Optical and controlgear chambers certified to minimum IP66 rating.\n"
            f"- Corrosion Endurance: Housing treated with anti-corrosive powder coating resisting 1,000 hours salt spray exposure."
        )
        sections.append(SpecSection(
            title="5. Environmental & Climatic Conditions",
            content=sec5_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Defined rigorous IP66 dust/water seal and 1,000-hour salt spray corrosion endurance.")

        # 6. Installation & Workmanship
        inst_points = primary_standard.installation_requirements if primary_standard else [
            "Universal mounting bracket compatible with standard municipal structures."
        ]
        sec6_content = (
            f"Mounting & Assembly Specifications:\n"
            + "\n".join([f"- {i}" for i in inst_points])
            + f"\n- Fasteners: All external exposed screws, bolts, and washers shall be of Stainless Steel Grade SS304/SS316."
        )
        sections.append(SpecSection(
            title="6. Installation & Workmanship Guidelines",
            content=sec6_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Specified SS304/SS316 anti-corrosion fasteners and standard pole mounting spigot compatibility.")

        # 7. Statutory Certification & Conformity
        cert_points = primary_standard.certification if primary_standard else [
            "Compulsory Registration Scheme (CRS) compliance.",
            "Bureau of Energy Efficiency (BEE) Star Rating voluntary compliance."
        ]
        sec7_content = (
            f"Regulatory Compliance Mandates:\n"
            + "\n".join([f"- {c}" for c in cert_points])
            + f"\n- Bidders must provide verifiable registration numbers on statutory compliance portals at bid submission."
        )
        sections.append(SpecSection(
            title="7. Mandatory Certification & Conformity",
            content=sec7_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Added mandatory CRS / BEE statutory certification documentation requirement.")

        # 8. Warranty & Service Level Agreement (SLA)
        warr_term = structured_req.warranty or "5 (Five) Years Comprehensive Onsite Replacement Warranty"
        sec8_content = (
            f"Warranty & SLA Commitments:\n"
            f"- Duration: Minimum {warr_term} covering complete unit, power supply/driver, optics, and structural housing.\n"
            f"- Service Response: Vendor must replace or rectify defective units within 48 hours of complaint lodging.\n"
            f"- Defect Liability Period: 5% performance bank guarantee retained throughout warranty tenure."
        )
        sections.append(SpecSection(
            title="8. Warranty & Vendor Service Level Agreement",
            content=sec8_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Established 5-year comprehensive onsite warranty with strict 48-hour SLA replacement terms.")

        # 9. Applicable Indian Standards Schedule
        standards_text = "\n".join([f"- {std}" for std in applicable_standards])
        sec9_content = (
            f"The equipment and all sub-assemblies shall conform to the latest editions (including all active amendments) "
            f"of the following Indian Standards:\n"
            f"{standards_text}\n"
            f"In the event of conflicting requirements, the most stringent statutory specification shall govern."
        )
        sections.append(SpecSection(
            title="9. Prescribed Indian Standards Schedule",
            content=sec9_content,
            is_added=True,
            is_modified=False
        ))
        improvements.append("Formally scheduled primary and component Indian Standards with amendment clauses.")

        # Build full markdown
        full_md_lines = [
            f"# TENDER TECHNICAL SPECIFICATION SCHEDULE",
            f"**Procurement Target:** {structured_req.product}",
            f"**Tender Volume:** {qty_str}",
            f"**Deployment Field:** {structured_req.application}",
            "",
            "---",
            ""
        ]
        for sec in sections:
            full_md_lines.append(f"## {sec.title}")
            full_md_lines.append(sec.content)
            full_md_lines.append("")

        return ImprovedSpecification(
            title=f"Technical Specification: {structured_req.product}",
            original_text=original_text,
            sections=sections,
            full_markdown="\n".join(full_md_lines),
            applicable_standards=applicable_standards,
            improvements_made=improvements
        )

spec_improvement_service = SpecImprovementService()
